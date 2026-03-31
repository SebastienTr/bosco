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
 * Göteborg → Nice via Kattegat, North Sea, English Channel, Atlantic, Gibraltar, Med.
 * ~60 waypoints following the actual coastal sailing route.
 */
const SHOWCASE_ROUTE: LatLngExpression[] = [
  // Göteborg — departure
  [57.71, 11.97],
  // Kattegat — south through Danish straits
  [57.45, 11.75],
  [57.05, 11.50],
  [56.65, 11.20],
  [56.27, 10.85],
  [55.95, 10.60],
  // Skagen / tip of Denmark
  [57.72, 10.59],
  [57.73, 10.30],
  // Down the North Sea coast
  [56.50, 8.10],
  [55.50, 8.05],
  [54.80, 7.90],
  [54.15, 7.50],
  // German Bight → Netherlands
  [53.60, 6.80],
  [53.20, 5.50],
  [52.50, 4.60],
  // English Channel entrance
  [51.50, 3.30],
  [51.10, 1.80],
  [50.80, 1.10],
  [50.55, 0.20],
  // Crossing to French side
  [50.10, -0.60],
  [49.70, -1.20],
  // Normandy / Brittany coast
  [49.20, -1.80],
  [48.80, -2.80],
  [48.65, -3.50],
  [48.40, -4.50],
  // Pointe du Raz — rounding Brittany
  [48.05, -4.75],
  [47.70, -4.30],
  [47.35, -3.50],
  [47.15, -2.80],
  // Bay of Biscay — crossing south
  [46.50, -2.30],
  [45.80, -1.80],
  [45.10, -1.50],
  [44.50, -1.45],
  // Basque coast
  [43.70, -1.70],
  [43.45, -2.00],
  // Northern Spain coast
  [43.40, -3.00],
  [43.50, -4.50],
  [43.55, -5.70],
  [43.45, -6.50],
  [43.40, -7.50],
  // Cape Finisterre
  [42.88, -9.30],
  // Portuguese coast — heading south
  [41.70, -9.00],
  [40.60, -8.90],
  [39.50, -9.20],
  [38.70, -9.25],
  // Cabo de São Vicente
  [37.00, -8.98],
  [36.95, -8.20],
  // Strait of Gibraltar
  [36.20, -6.20],
  [36.05, -5.60],
  [36.10, -5.35],
  // Into the Mediterranean
  [36.45, -4.50],
  [36.72, -3.80],
  [36.90, -2.50],
  [37.15, -1.50],
  // Spanish Med coast
  [37.60, -0.70],
  [38.30, 0.00],
  [38.80, 0.20],
  // Balearics passage
  [39.20, 1.20],
  [39.55, 2.40],
  // Barcelona / Costa Brava
  [41.10, 2.80],
  [42.20, 3.10],
  // Gulf of Lion
  [42.70, 3.50],
  [43.10, 4.20],
  [43.20, 5.00],
  // Marseille area
  [43.30, 5.38],
  // Côte d'Azur
  [43.25, 6.00],
  [43.40, 6.50],
  [43.55, 6.90],
  // Nice — arrival
  [43.69, 7.27],
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
