"use client";

import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import L from "leaflet";
import "leaflet.markercluster";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { PhotoMarker } from "./PhotoMarker";

interface PhotoMarkerData {
  entryId: string;
  position: [number, number];
  photoUrl: string;
  label: string;
}

interface PhotoMarkerClusterProps {
  photoMarkers: PhotoMarkerData[];
  onTap: (photoUrl: string) => void;
}

export const PHOTO_CLUSTER_THRESHOLD = 15;

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count >= 50 ? 52 : count >= 10 ? 44 : 36;
  const fontSize = count >= 50 ? 17 : count >= 10 ? 15 : 13;
  return L.divIcon({
    html: `<div class="bosco-photo-cluster" data-photo-count="${count}" style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(27, 45, 79, 0.85);
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(27,45,79,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      <span style="
        color: white;
        font-weight: bold;
        font-family: Nunito, sans-serif;
        font-size: ${fontSize}px;
        line-height: 1;
      ">${count}</span>
    </div>`,
    className: "",
    iconSize: L.point(size, size, true),
  });
}

export function countVisiblePhotoMarkers(
  map: Pick<L.Map, "getBounds">,
  photoMarkers: PhotoMarkerData[],
) {
  const bounds = map.getBounds();
  return photoMarkers.reduce((count, marker) => {
    const isVisible = bounds.contains(
      L.latLng(marker.position[1], marker.position[0]),
    );
    return isVisible ? count + 1 : count;
  }, 0);
}

export function applyClusterMarkerAccessibility(container: ParentNode) {
  const clusterElements = container.querySelectorAll<HTMLElement>(
    ".bosco-photo-cluster",
  );

  clusterElements.forEach((element) => {
    const parent = element.closest(".leaflet-marker-icon");
    if (!(parent instanceof HTMLElement)) return;

    const countText =
      element.dataset.photoCount ?? element.textContent?.trim() ?? "";

    parent.setAttribute("role", "button");
    parent.setAttribute("tabindex", "0");
    parent.setAttribute(
      "aria-label",
      `Photo cluster with ${countText} photos — tap to expand`,
    );
    parent.classList.add("bosco-photo-cluster-marker");
  });
}

export function PhotoMarkerCluster({
  photoMarkers,
  onTap,
}: PhotoMarkerClusterProps) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);
  const accessibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [visibleMarkerCount, setVisibleMarkerCount] = useState(() =>
    countVisiblePhotoMarkers(map, photoMarkers),
  );

  const clusteringEnabled = visibleMarkerCount > PHOTO_CLUSTER_THRESHOLD;

  const scheduleAccessibilitySync = useCallback(() => {
    if (!clusteringEnabled) return;

    if (accessibilityTimerRef.current) {
      clearTimeout(accessibilityTimerRef.current);
    }

    accessibilityTimerRef.current = setTimeout(() => {
      applyClusterMarkerAccessibility(map.getContainer());
    }, 0);
  }, [clusteringEnabled, map]);

  const updateVisibleMarkerCount = useCallback(() => {
    setVisibleMarkerCount(countVisiblePhotoMarkers(map, photoMarkers));
    scheduleAccessibilitySync();
  }, [map, photoMarkers, scheduleAccessibilitySync]);

  useEffect(() => {
    updateVisibleMarkerCount();
    map.on("moveend", updateVisibleMarkerCount);
    map.on("zoomend", updateVisibleMarkerCount);
    map.on("resize", updateVisibleMarkerCount);

    return () => {
      map.off("moveend", updateVisibleMarkerCount);
      map.off("zoomend", updateVisibleMarkerCount);
      map.off("resize", updateVisibleMarkerCount);
    };
  }, [map, updateVisibleMarkerCount]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !clusteringEnabled) return;

    group.on("animationend", scheduleAccessibilitySync);
    group.on("spiderfied", scheduleAccessibilitySync);
    group.on("unspiderfied", scheduleAccessibilitySync);
    scheduleAccessibilitySync();

    return () => {
      group.off("animationend", scheduleAccessibilitySync);
      group.off("spiderfied", scheduleAccessibilitySync);
      group.off("unspiderfied", scheduleAccessibilitySync);
    };
  }, [clusteringEnabled, scheduleAccessibilitySync]);

  useEffect(() => {
    return () => {
      if (accessibilityTimerRef.current) {
        clearTimeout(accessibilityTimerRef.current);
      }
    };
  }, []);

  if (photoMarkers.length === 0) return null;

  if (!clusteringEnabled) {
    return (
      <>
        {photoMarkers.map((m, i) => (
          <PhotoMarker
            key={`${m.entryId}-${i}`}
            position={m.position}
            photoUrl={m.photoUrl}
            label={m.label}
            onTap={onTap}
          />
        ))}
      </>
    );
  }

  return (
    <MarkerClusterGroup
      ref={groupRef}
      iconCreateFunction={createClusterIcon}
      maxClusterRadius={60}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
      zoomToBoundsOnClick
    >
      {photoMarkers.map((m, i) => (
        <PhotoMarker
          key={`${m.entryId}-${i}`}
          position={m.position}
          photoUrl={m.photoUrl}
          label={m.label}
          onTap={onTap}
        />
      ))}
    </MarkerClusterGroup>
  );
}
