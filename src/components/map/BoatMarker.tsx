"use client";

import { Marker } from "react-leaflet";
import { useMemo } from "react";
import L from "leaflet";

interface BoatMarkerProps {
  /** Position in GeoJSON order [longitude, latitude] */
  position: [number, number];
}

const BOAT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">
  <path d="M30 5 Q21 20, 19 38 L30 38 Z" fill="#ffffff" stroke="#999" stroke-width="0.6"/>
  <path d="M30 9 Q37 20, 43 34 L30 34 Z" fill="#f0f0f0" stroke="#999" stroke-width="0.6"/>
  <line x1="30" y1="3" x2="30" y2="42" stroke="#555" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="30" y1="5" x2="43" y2="40" stroke="#888" stroke-width="0.4"/>
  <line x1="30" y1="5" x2="14" y2="42" stroke="#888" stroke-width="0.4"/>
  <path d="M14 42 Q15 40, 30 40 Q45 40, 46 42 L46 44 Q45 44, 30 44 Q15 44, 14 44 Z" fill="#F5E6C8" stroke="#D4C5A0" stroke-width="0.5"/>
  <rect x="24" y="40.5" width="10" height="2.5" rx="1" fill="#E8D8B8" stroke="#C8B898" stroke-width="0.4"/>
  <path d="M14 44 L46 44 L43 50 Q30 51.5, 17 50 Z" fill="#6B1D3A" stroke="#4A0E25" stroke-width="0.8"/>
  <path d="M17 48 Q30 49, 43 48" fill="none" stroke="#F5E6C8" stroke-width="0.6" opacity="0.5"/>
</svg>`;

export function BoatMarker({ position }: BoatMarkerProps) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "boat-marker",
        html: BOAT_SVG,
        iconSize: [32, 32],
        iconAnchor: [16, 24],
      }),
    [],
  );

  // Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
  const leafletPosition: L.LatLngExpression = [position[1], position[0]];

  return <Marker position={leafletPosition} icon={icon} interactive={false} />;
}
