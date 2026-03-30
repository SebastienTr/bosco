"use client";

import { Marker } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { useMemo } from "react";

interface PhotoMarkerProps {
  /** [longitude, latitude] GeoJSON order */
  position: [number, number];
  /** Supabase Storage public URL */
  photoUrl: string;
  /** For aria-label: "Photo at {label}" */
  label: string;
  /** Callback when marker is tapped (opens lightbox) */
  onTap?: (photoUrl: string) => void;
}

const MARKER_SIZE = 32;

export function PhotoMarker({
  position,
  photoUrl,
  label,
  onTap,
}: PhotoMarkerProps) {
  // Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
  const leafletPosition: LatLngExpression = [position[1], position[0]];

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        iconSize: [MARKER_SIZE, MARKER_SIZE],
        iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
        html: `<div
          role="button"
          aria-label="Photo at ${label.replace(/"/g, "&quot;")} — tap to view"
          tabindex="0"
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
    [photoUrl, label],
  );

  return (
    <Marker
      position={leafletPosition}
      icon={icon}
      eventHandlers={{
        click: () => onTap?.(photoUrl),
        keypress: (e) => {
          if (e.originalEvent.key === "Enter") {
            onTap?.(photoUrl);
          }
        },
      }}
      bubblingMouseEvents={false}
    />
  );
}
