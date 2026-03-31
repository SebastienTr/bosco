"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";

/**
 * Demo sailing track: Cassis → Porquerolles, beating upwind.
 * Coordinates are [lat, lng] for Leaflet.
 * The zigzag pattern shows close-hauled tacking — Bosco's core value prop.
 */
const DEMO_ROUTE: LatLngExpression[] = [
  // Depart Cassis heading SE
  [43.214, 5.537],
  [43.195, 5.56],
  // Tack 1 — heading SSW
  [43.17, 5.54],
  [43.15, 5.52],
  // Tack 2 — heading SSE
  [43.13, 5.56],
  [43.115, 5.60],
  // Tack 3 — heading SSW
  [43.095, 5.57],
  [43.08, 5.54],
  // Tack 4 — heading SE toward La Ciotat
  [43.065, 5.59],
  [43.055, 5.64],
  // Rounding La Ciotat, easing off
  [43.05, 5.69],
  [43.045, 5.74],
  // Tack 5 — short tack south
  [43.025, 5.72],
  [43.01, 5.70],
  // Tack 6 — back toward coast
  [43.0, 5.75],
  [42.995, 5.81],
  // Reaching past Bandol
  [42.99, 5.87],
  [42.985, 5.93],
  [42.98, 5.99],
  // Approaching Toulon — slight tack
  [42.965, 5.97],
  [42.95, 5.95],
  // Tack back east
  [42.94, 6.01],
  [42.935, 6.07],
  // Open water — freer wind
  [42.93, 6.14],
  [42.935, 6.21],
  // Tack toward Hyères
  [42.95, 6.19],
  [42.965, 6.22],
  // Final approach to Porquerolles
  [42.975, 6.20],
  [42.99, 6.22],
  [43.0, 6.19],
  // Anchoring at Porquerolles
  [42.995, 6.215],
];

const BOUNDS: LatLngBoundsExpression = [
  [42.91, 5.49],
  [43.24, 6.27],
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
