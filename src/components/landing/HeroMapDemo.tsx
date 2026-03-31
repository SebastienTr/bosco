"use client";

import dynamic from "next/dynamic";

const HeroMapDemoMap = dynamic(() => import("./HeroMapDemoMap"), {
  ssr: false,
  loading: () => (
    <div className="aspect-[4/3] w-full animate-pulse rounded-[var(--radius-card)] bg-navy/10 lg:aspect-[16/10]" />
  ),
});

export function HeroMapDemo() {
  return <HeroMapDemoMap />;
}
