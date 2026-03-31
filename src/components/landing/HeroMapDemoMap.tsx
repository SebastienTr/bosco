"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";

/**
 * Real sailing track from Seb's voyage — Øresund strait (Denmark/Sweden).
 * Extracted from legs 6+7+8 which show clear tacking in open water.
 * Coordinates are [lat, lng] for Leaflet.
 */
const DEMO_ROUTE: LatLngExpression[] = [
  [56.0426, 12.623], [56.0415, 12.6339], [56.0406, 12.6472],
  [56.0414, 12.639], [56.0275, 12.6189], [55.9765, 12.5614],
  [55.9612, 12.5769], [55.9371, 12.6333], [55.9115, 12.6361],
  [55.8824, 12.6355], [55.8464, 12.6268], [55.7973, 12.616],
  [55.7402, 12.5942], [55.7264, 12.5934], [55.7166, 12.5898],
  [55.716, 12.588], [55.6871, 12.6461], [55.6699, 12.6653],
  [55.6412, 12.6882], [55.6003, 12.6951], [55.5711, 12.6701],
  [55.5388, 12.6283], [55.5152, 12.6036], [55.4434, 12.5496],
  [55.3847, 12.5117], [55.3283, 12.4797], [55.2794, 12.4601],
  [55.2657, 12.4367], [55.2525, 12.3749], [55.2329, 12.3542],
  [55.1954, 12.2358], [55.1722, 12.3061], [55.1272, 12.2538],
  [55.1047, 12.1966], [55.0788, 12.1677], [55.055, 12.1574],
  [55.0174, 12.1738], [54.9924, 12.1731], [54.9779, 12.1579],
  [54.9914, 12.1665], [54.9952, 12.1665], [54.995, 12.1665],
  [54.9972, 12.1589],
];

const BOUNDS: LatLngBoundsExpression = [
  [54.95, 12.1],
  [56.08, 12.72],
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
