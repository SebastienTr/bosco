"use client";

import { Polyline, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { ROUTE_PANE } from "./MapCanvas";

interface RouteLayerProps {
  tracks: GeoJSON.LineString[];
  trackColors?: string[];
  skipAutoFit?: boolean;
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

export function RouteLayer({
  tracks,
  trackColors,
  skipAutoFit = false,
}: RouteLayerProps) {
  const map = useMap();

  const allPositions = useMemo(() => {
    return tracks.flatMap((track) => toLatLngs(track.coordinates));
  }, [tracks]);

  // Auto-fit bounds to show all tracks (unless initial view was provided via URL hash)
  useEffect(() => {
    if (!skipAutoFit && allPositions.length > 0) {
      const bounds = L.latLngBounds(allPositions as L.LatLngExpression[]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, allPositions, skipAutoFit]);

  return (
    <>
      {tracks.map((track, index) => (
        <Polyline
          key={index}
          positions={toLatLngs(track.coordinates)}
          pathOptions={
            trackColors?.[index]
              ? { ...TRACK_STYLE, color: trackColors[index] }
              : TRACK_STYLE
          }
          pane={ROUTE_PANE}
        />
      ))}
    </>
  );
}
