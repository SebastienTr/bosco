"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";

/**
 * Real sailing track from Seb's voyage — Helsingør to Kiel.
 * Legs 6-12: Øresund, Danish islands, Kiel Bight.
 * Coordinates are [lat, lng] for Leaflet.
 */
const DEMO_ROUTE: LatLngExpression[] = [
  [56.0426, 12.623], [56.0411, 12.6452], [56.0389, 12.6377],
  [55.9862, 12.5725], [55.9558, 12.5871], [55.9153, 12.6364],
  [55.8688, 12.6326], [55.7947, 12.6153], [55.733, 12.5892],
  [55.7163, 12.5861], [55.692, 12.639], [55.6503, 12.6802],
  [55.6003, 12.6951], [55.5523, 12.6458], [55.5014, 12.5907],
  [55.4001, 12.5211], [55.2988, 12.4685], [55.2755, 12.4613],
  [55.2411, 12.3683], [55.1951, 12.2367], [55.1319, 12.2592],
  [55.101, 12.187], [55.0573, 12.1576], [55.003, 12.1767],
  [54.9779, 12.1579], [54.9937, 12.1674], [54.9956, 12.1665],
  [54.9777, 12.147], [54.9698, 12.081], [54.9687, 11.9915],
  [55.0017, 11.9204], [54.9961, 11.9322], [54.9711, 11.9002],
  [54.9762, 11.8311], [55.0283, 11.7966], [54.9976, 11.7211],
  [54.9936, 11.6324], [55.0209, 11.5941], [55.0508, 11.5407],
  [55.0409, 11.4301], [55.0803, 11.2917], [55.0018, 11.2156],
  [54.9616, 11.097], [54.9575, 11.0966], [54.9407, 11.0311],
  [54.882, 10.9474], [54.8317, 10.8958], [54.7108, 10.8828],
  [54.6962, 10.7461], [54.7281, 10.6544], [54.7526, 10.6736],
  [54.7516, 10.6735], [54.7604, 10.6321], [54.7012, 10.546],
  [54.6702, 10.5036], [54.6049, 10.4332], [54.5412, 10.367],
  [54.4525, 10.2551], [54.427, 10.219], [54.3491, 10.1684],
  [54.3394, 10.1577],
];

const BOUNDS: LatLngBoundsExpression = [
  [54.3, 10.1],
  [56.1, 12.75],
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
