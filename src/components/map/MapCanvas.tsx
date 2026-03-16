"use client";

// CSS imports MUST be in this order
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { RouteLayer } from "./RouteLayer";
import { applyMapAccessibility } from "./mapAccessibility";

export interface MapCanvasProps {
  center?: LatLngExpression;
  zoom?: number;
  tracks?: GeoJSON.LineString[];
  className?: string;
  ariaLabel?: string;
}

const DEFAULT_CENTER: LatLngExpression = [43.3, 5.4]; // Mediterranean
const DEFAULT_ZOOM = 6;
const DEFAULT_ARIA_LABEL = "Sailing voyage map";

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const OPENSEAMAP_URL = "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png";
const OPENSEAMAP_ATTRIBUTION =
  'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors';

function MapAccessibility({
  ariaLabel,
}: {
  ariaLabel: string;
}) {
  const map = useMap();

  useEffect(() => {
    applyMapAccessibility(map.getContainer(), ariaLabel);
  }, [ariaLabel, map]);

  return null;
}

export default function MapCanvas({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  tracks = [],
  className,
  ariaLabel = DEFAULT_ARIA_LABEL,
}: MapCanvasProps) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="bosco-map h-full w-full"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <MapAccessibility ariaLabel={ariaLabel} />
        <TileLayer url={OSM_URL} attribution={OSM_ATTRIBUTION} />
        <TileLayer url={OPENSEAMAP_URL} attribution={OPENSEAMAP_ATTRIBUTION} />
        {tracks.length > 0 && <RouteLayer tracks={tracks} />}
      </MapContainer>
    </div>
  );
}
