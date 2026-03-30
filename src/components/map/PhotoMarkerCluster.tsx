"use client";

import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import L from "leaflet";
import "leaflet.markercluster";
import { useEffect, useRef } from "react";
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

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count >= 50 ? 52 : count >= 10 ? 44 : 36;
  const fontSize = count >= 50 ? 17 : count >= 10 ? 15 : 13;
  return L.divIcon({
    html: `<div class="bosco-photo-cluster" style="
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

export function PhotoMarkerCluster({
  photoMarkers,
  onTap,
}: PhotoMarkerClusterProps) {
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Apply accessibility to cluster markers after they render
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    function applyClusterAccessibility() {
      const g = groupRef.current;
      if (!g) return;
      // Cluster markers are created by Leaflet outside React, need manual a11y
      // Access the map container via the internal Leaflet reference
      const map = (g as unknown as { _map?: L.Map })._map;
      const container = map?.getContainer();
      if (!container) return;
      const clusterElements = container.querySelectorAll(
        ".bosco-photo-cluster",
      );
      clusterElements.forEach((el: Element) => {
        const parent = el.closest(".leaflet-marker-icon") as HTMLElement | null;
        if (parent && !parent.getAttribute("role")) {
          const countText = el.querySelector("span")?.textContent ?? "";
          parent.setAttribute("role", "button");
          parent.setAttribute("tabindex", "0");
          parent.setAttribute(
            "aria-label",
            `Photo cluster with ${countText} photos — tap to expand`,
          );
        }
      });
    }

    group.on("animationend", applyClusterAccessibility);
    // Also apply on initial render
    const timer = setTimeout(applyClusterAccessibility, 100);

    return () => {
      group.off("animationend", applyClusterAccessibility);
      clearTimeout(timer);
    };
  }, [photoMarkers]);

  if (photoMarkers.length === 0) return null;

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
