"use client";

import { Polyline, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";

interface RouteLayerProps {
  tracks: GeoJSON.LineString[];
}

const TRACK_STYLE = {
  color: "#2563EB", // Ocean
  opacity: 0.85,
  weight: 3,
};

/**
 * Convert GeoJSON [longitude, latitude] → Leaflet [latitude, longitude].
 * This conversion ONLY happens in the map component layer.
 */
export function toLatLngs(
  coordinates: GeoJSON.Position[]
): LatLngExpression[] {
  return coordinates.map(
    ([lng, lat]) => [lat, lng] as LatLngExpression
  );
}

export function RouteLayer({ tracks }: RouteLayerProps) {
  const map = useMap();

  const allPositions = useMemo(() => {
    return tracks.flatMap((track) => toLatLngs(track.coordinates));
  }, [tracks]);

  // Auto-fit bounds to show all tracks
  useEffect(() => {
    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(allPositions as L.LatLngExpression[]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, allPositions]);

  return (
    <>
      {tracks.map((track, index) => (
        <Polyline
          key={index}
          positions={toLatLngs(track.coordinates)}
          pathOptions={TRACK_STYLE}
        />
      ))}
    </>
  );
}
