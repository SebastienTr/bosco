"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import { DEMO_ROUTE, DEMO_ROUTE_BOUNDS } from "@/lib/geo/demo-route";

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OPENSEAMAP_URL = "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png";

const ANIMATION_INTERVAL = 120;
const INITIAL_POINTS = 2;

function FitBounds() {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(DEMO_ROUTE_BOUNDS, { padding: [20, 20] });
  }, [map]);

  return null;
}

export default function DemoMapAnimation() {
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
    <div className="aspect-[4/3]">
      <MapContainer
        center={[55.2, 11.4]}
        zoom={7}
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
  );
}
