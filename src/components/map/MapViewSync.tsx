"use client";

import { useRef, useCallback } from "react";
import { useMap, useMapEvents } from "react-leaflet";

const DEBOUNCE_MS = 500;

export function MapViewSync() {
  const map = useMap();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const updateHash = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const hash = `#map=${zoom}/${center.lat.toFixed(4)}/${center.lng.toFixed(4)}`;
      window.history.replaceState(null, "", hash);
    }, DEBOUNCE_MS);
  }, [map]);

  useMapEvents({ moveend: updateHash });

  return null;
}
