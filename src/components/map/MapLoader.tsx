"use client";

import dynamic from "next/dynamic";
import type { MapCanvasProps } from "./MapCanvas";

const MapCanvas = dynamic(() => import("./MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-foam" />
  ),
});

export default function MapLoader(props: MapCanvasProps) {
  return <MapCanvas {...props} />;
}
