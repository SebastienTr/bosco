"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface CenterStopoverDetail {
  lat: number;
  lng: number;
}

export function MapCenterListener() {
  const map = useMap();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<CenterStopoverDetail>).detail;
      if (detail?.lat != null && detail?.lng != null) {
        map.flyTo([detail.lat, detail.lng], Math.max(map.getZoom(), 10), {
          duration: 0.8,
        });
      }
    };

    window.addEventListener("bosco:center-stopover", handler);
    return () => window.removeEventListener("bosco:center-stopover", handler);
  }, [map]);

  return null;
}
