"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { formatMapHash } from "@/lib/utils/map-view-hash";

const DEBOUNCE_MS = 500;

export function MapViewSync() {
  const map = useMap();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const updateHash = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const hash = formatMapHash(zoom, center);
      window.history.replaceState(null, "", hash);
    }, DEBOUNCE_MS);
  }, [map]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useMapEvents({ moveend: updateHash });

  return null;
}
