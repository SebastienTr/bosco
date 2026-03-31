"use client";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import { applyMapAccessibility } from "@/components/map/mapAccessibility";

interface VoyageShowcaseMiniMapProps {
  ariaLabel: string;
  voyageTitle: string;
}

const SHOWCASE_ROUTE: LatLngExpression[] = [
  [57.7089, 11.9746],
  [57.35, 11.2],
  [56.4, 10.5],
  [55.55, 8.2],
  [53.54, 8.58],
  [52.37, 4.89],
  [50.85, 1.95],
  [49.18, -0.37],
  [47.21, -1.55],
  [43.3, -1.98],
  [43.46, -3.8],
  [42.88, -8.54],
  [38.72, -9.14],
  [36.14, -5.35],
  [39.57, 2.65],
  [43.7, 7.26],
];

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OPENSEAMAP_URL = "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png";

function MapSetup({
  ariaLabel,
  voyageTitle,
}: VoyageShowcaseMiniMapProps) {
  const map = useMap();

  useEffect(() => {
    applyMapAccessibility(map.getContainer(), ariaLabel);

    const bounds = L.latLngBounds(SHOWCASE_ROUTE as L.LatLngExpression[]);
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [ariaLabel, map]);

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-[400] rounded-[var(--radius-button)] bg-white/95 px-3 py-1.5 text-small font-semibold text-navy shadow-card">
      {voyageTitle}
    </div>
  );
}

export default function VoyageShowcaseMiniMap({
  ariaLabel,
  voyageTitle,
}: VoyageShowcaseMiniMapProps) {
  return (
    <div className="relative aspect-[16/10] w-full bg-sand">
      <MapContainer
        center={[47.0, 2.0]}
        zoom={5}
        className="bosco-map h-full w-full"
        zoomControl={true}
        attributionControl={false}
        dragging={true}
        scrollWheelZoom={false}
        touchZoom={true}
        doubleClickZoom={true}
        keyboard={true}
      >
        <MapSetup ariaLabel={ariaLabel} voyageTitle={voyageTitle} />
        <TileLayer url={OSM_URL} />
        <TileLayer url={OPENSEAMAP_URL} />
        <Polyline
          positions={SHOWCASE_ROUTE}
          pathOptions={{
            color: "#E8614D",
            weight: 3,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      </MapContainer>
    </div>
  );
}
