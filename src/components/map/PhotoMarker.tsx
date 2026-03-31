"use client";

import { Marker } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression, Marker as LeafletMarker } from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { applyPhotoMarkerAccessibility } from "./photoMarkerAccessibility";

interface PhotoMarkerProps {
  /** [longitude, latitude] GeoJSON order */
  position: [number, number];
  /** Stable photo instance ID */
  photoId: string;
  /** Supabase Storage public URL */
  photoUrl: string;
  /** For aria-label: "Photo at {label}" */
  label: string;
  /** Callback when marker is tapped (opens lightbox) */
  onTap?: (photoId: string) => void;
}

const MARKER_SIZE = 32;

export function PhotoMarker({
  position,
  photoId,
  photoUrl,
  label,
  onTap,
}: PhotoMarkerProps) {
  const markerRef = useRef<LeafletMarker | null>(null);

  // Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
  const leafletPosition: LatLngExpression = [position[1], position[0]];

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        iconSize: [MARKER_SIZE, MARKER_SIZE],
        iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
        html: `<div
          style="
            width: ${MARKER_SIZE}px;
            height: ${MARKER_SIZE}px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(27,45,79,0.2);
            overflow: hidden;
            cursor: pointer;
            transition: transform 150ms ease;
          "
          onmouseenter="this.style.transform='scale(1.125)'"
          onmouseleave="this.style.transform='scale(1)'"
        >
          <img
            src="${photoUrl.replace(/"/g, "&quot;")}"
            alt=""
            style="width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none;"
          />
        </div>`,
      }),
    [photoUrl],
  );

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    let cleanup: (() => void) | undefined;

    const syncAccessibility = () => {
      const element = marker.getElement();
      if (!element) return;

      cleanup?.();
      cleanup = applyPhotoMarkerAccessibility({
        element,
        label,
        onActivate: () => onTap?.(photoId),
      });
    };

    syncAccessibility();
    marker.on("add", syncAccessibility);

    return () => {
      marker.off("add", syncAccessibility);
      cleanup?.();
    };
  }, [label, onTap, photoId]);

  return (
    <Marker
      ref={markerRef}
      position={leafletPosition}
      icon={icon}
      eventHandlers={{
        click: () => onTap?.(photoId),
      }}
      bubblingMouseEvents={false}
    />
  );
}
