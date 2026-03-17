"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { toLatLngs } from "./RouteLayer";

export interface MiniMapProps {
  tracks: GeoJSON.LineString[];
}

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const TRACK_STYLE = {
  color: "#2563EB",
  opacity: 0.85,
  weight: 2,
};

function FitBounds({ tracks }: { tracks: GeoJSON.LineString[] }) {
  const map = useMap();

  const allPositions = useMemo(() => {
    return tracks.flatMap((track) => toLatLngs(track.coordinates));
  }, [tracks]);

  useEffect(() => {
    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(allPositions as L.LatLngExpression[]);
      map.fitBounds(bounds, { padding: [10, 10] });
    }
  }, [map, allPositions]);

  return null;
}

export default function MiniMap({ tracks }: MiniMapProps) {
  const defaultCenter: LatLngExpression = [43.3, 5.4];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={6}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      touchZoom={false}
      doubleClickZoom={false}
      keyboard={false}
    >
      <TileLayer url={OSM_URL} />
      <FitBounds tracks={tracks} />
      {tracks.map((track, index) => (
        <Polyline
          key={index}
          positions={toLatLngs(track.coordinates)}
          pathOptions={TRACK_STYLE}
        />
      ))}
    </MapContainer>
  );
}
