"use client";

import dynamic from "next/dynamic";
import type { MiniMapProps } from "./MiniMap";

const MiniMap = dynamic(() => import("./MiniMap"), {
  ssr: false,
  loading: () => <div className="h-40 w-full animate-pulse rounded-t-xl bg-foam" />,
});

export default function MiniMapLoader(props: MiniMapProps) {
  return <MiniMap {...props} />;
}
