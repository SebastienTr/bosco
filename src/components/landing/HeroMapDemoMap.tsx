"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";

/**
 * A short Mediterranean sailing route (Marseille → Cassis → Porquerolles area).
 * Coordinates are [lat, lng] for Leaflet consumption.
 * Designed to look like a real sailing track with tacking angles.
 */
const DEMO_ROUTE: LatLngExpression[] = [
  [43.295, 5.37],   // Marseille — Vieux Port
  [43.27, 5.39],    // Heading south
  [43.24, 5.42],    // Tack east
  [43.215, 5.39],   // Tack back
  [43.19, 5.44],    // Past Calanques
  [43.17, 5.48],    // Cassis approach
  [43.16, 5.53],    // Past Cassis
  [43.14, 5.58],    // Open water
  [43.12, 5.64],    // Heading to La Ciotat
  [43.11, 5.71],    // Past La Ciotat
  [43.1, 5.78],     // Continuing east
  [43.085, 5.85],   // Les Lecques area
  [43.07, 5.91],    // Bandol approach
  [43.06, 5.98],    // Past Bandol
  [43.05, 6.05],    // Sanary
  [43.04, 6.12],    // Toulon bay entrance
  [43.02, 6.19],    // Into the bay
  [43.0, 6.26],     // Past Toulon
  [42.98, 6.34],    // Heading to Hyeres
  [42.96, 6.42],    // Approaching Porquerolles
  [42.98, 6.5],     // Tack north a bit
  [42.99, 6.58],    // Porquerolles area
  [43.01, 6.64],    // Past the islands
  [43.0, 6.72],     // Final stretch
];

const BOUNDS: LatLngBoundsExpression = [
  [42.93, 5.32],  // Southwest corner
  [43.32, 6.78],  // Northeast corner
];

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OPENSEAMAP_URL = "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png";

/** Interval between adding route points (ms) */
const ANIMATION_INTERVAL = 120;

/** Number of points visible at the start */
const INITIAL_POINTS = 2;

function FitBounds() {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(BOUNDS, { padding: [20, 20] });
  }, [map]);

  return null;
}

export default function HeroMapDemoMap() {
  const [pointCount, setPointCount] = useState(INITIAL_POINTS);

  useEffect(() => {
    if (pointCount >= DEMO_ROUTE.length) return;

    const timer = setInterval(() => {
      setPointCount((prev) => {
        if (prev >= DEMO_ROUTE.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, ANIMATION_INTERVAL);

    return () => clearInterval(timer);
  }, [pointCount]);

  const visibleRoute = DEMO_ROUTE.slice(0, pointCount);

  return (
    <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[var(--radius-card)] shadow-card">
      <div className="aspect-[4/3] lg:aspect-[16/10]">
        <MapContainer
          center={[43.1, 6.0]}
          zoom={10}
          className="bosco-map h-full w-full"
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          touchZoom={false}
          doubleClickZoom={false}
          keyboard={false}
        >
          <FitBounds />
          <TileLayer url={OSM_URL} />
          <TileLayer url={OPENSEAMAP_URL} />
          <Polyline
            positions={visibleRoute}
            pathOptions={{
              color: "#E8614D",
              weight: 3,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </MapContainer>
      </div>
      {/* Decorative glow behind the card */}
      <div className="absolute -inset-4 -z-10 rounded-2xl bg-ocean/5 blur-2xl" />
    </div>
  );
}
