"use client";

import { Marker } from "react-leaflet";
import { useMemo } from "react";
import L from "leaflet";

interface BoatMarkerProps {
  /** Position in GeoJSON order [longitude, latitude] */
  position: [number, number];
}

const BOAT_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#1B2D4F" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 17h18l-2.5-7H13V5l-4 5H5.5L3 17z" />
  <path d="M12 5V2" stroke="#1B2D4F" stroke-width="2" stroke-linecap="round"/>
  <path d="M2 20h20" stroke="#1B2D4F" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export function BoatMarker({ position }: BoatMarkerProps) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "boat-marker",
        html: BOAT_SVG,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    [],
  );

  // Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
  const leafletPosition: L.LatLngExpression = [position[1], position[0]];

  return <Marker position={leafletPosition} icon={icon} interactive={false} />;
}
