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

/**
 * Real route extracted from Seb's voyage on sailbosco.com.
 * Göteborg → La Rochelle (voyage in progress), simplified to ~83 waypoints.
 * Coordinates are [lat, lng] for Leaflet.
 */
const SHOWCASE_ROUTE: LatLngExpression[] = [
  [57.67, 11.84], [57.68, 11.82], [57.56, 11.81], [57.24, 12.12],
  [57.20, 12.08], [57.11, 12.24], [56.83, 12.45], [56.66, 12.85],
  [56.48, 12.70], [56.43, 12.56], [56.05, 12.61], [56.04, 12.62],
  [55.77, 12.61], [55.69, 12.63], [55.33, 12.48], [55.24, 12.37],
  [54.98, 12.16], [54.99, 12.17], [54.98, 11.95], [55.00, 11.92],
  [55.05, 11.37], [54.95, 11.10], [54.75, 10.67], [54.76, 10.64],
  [54.44, 10.24], [54.35, 10.16], [54.32, 9.72], [54.23, 9.60],
  [53.90, 9.15], [53.99, 8.50], [54.18, 7.89], [53.72, 6.94],
  [53.56, 6.75], [53.50, 6.81], [53.41, 6.94], [53.31, 6.88],
  [53.22, 6.58], [53.32, 6.36], [53.35, 6.27], [53.21, 5.80],
  [53.11, 5.37], [52.70, 5.29], [52.64, 5.25], [52.38, 4.91],
  [52.38, 4.64], [52.20, 4.54], [52.01, 4.70], [51.82, 4.66],
  [51.63, 4.26], [51.55, 3.98], [51.45, 3.59], [51.39, 3.26],
  [51.31, 3.12], [51.08, 2.45], [51.05, 2.37], [50.99, 1.80],
  [50.73, 1.60], [49.99, 1.13], [49.89, 0.73], [49.49, 0.09],
  [49.30, -0.07], [49.30, -0.08], [49.45, -0.72], [49.59, -1.26],
  [49.73, -1.28], [49.65, -1.62], [49.64, -2.21], [49.45, -2.53],
  [49.04, -3.43], [48.72, -3.96], [48.69, -4.63], [48.61, -4.72],
  [48.28, -4.59], [48.27, -4.65], [48.02, -4.54], [47.87, -4.48],
  [47.35, -3.15], [47.14, -2.74], [46.73, -2.35], [46.48, -1.79],
  [46.39, -1.71], [46.14, -1.17],
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
