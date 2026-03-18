"use client";

import { useCallback, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import MapLoader from "@/components/map/MapLoader";
import { StatsBar } from "@/components/voyage/StatsBar";
import { BoatBadge } from "@/components/voyage/BoatBadge";
import type { Json } from "@/types/supabase";
import {
  getLastKnownVoyagePosition,
  toVoyageRouteTracks,
} from "@/lib/voyage-route";
import { messages } from "./messages";

const RouteAnimation = dynamic(
  () =>
    import("@/components/map/RouteAnimation").then((m) => m.RouteAnimation),
  { ssr: false },
);

const BoatMarker = dynamic(
  () => import("@/components/map/BoatMarker").then((m) => m.BoatMarker),
  { ssr: false },
);

const StopoverMarker = dynamic(
  () =>
    import("@/components/map/StopoverMarker").then((m) => m.StopoverMarker),
  { ssr: false },
);

interface LegData {
  id: string;
  track_geojson: Json;
  distance_nm: number | null;
  duration_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
  avg_speed_kts: number | null;
  max_speed_kts: number | null;
}

interface StopoverData {
  id: string;
  name: string;
  country: string | null;
  latitude: number;
  longitude: number;
  arrived_at: string | null;
  departed_at: string | null;
}

interface PublicVoyageContentProps {
  voyageName: string;
  legs: LegData[];
  stopovers: StopoverData[];
  totalDistanceNm: number;
  days: number;
  portsCount: number;
  countriesCount: number;
  boatName: string | null;
  boatType: string | null;
  username: string;
}

export default function PublicVoyageContent({
  voyageName,
  legs,
  stopovers,
  totalDistanceNm,
  days,
  portsCount,
  countriesCount,
  boatName,
  boatType,
  username,
}: PublicVoyageContentProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [boatPosition, setBoatPosition] = useState<[number, number] | null>(
    null,
  );

  const routeTracks = useMemo(
    () => toVoyageRouteTracks(legs),
    [legs],
  );

  const tracks: GeoJSON.LineString[] = useMemo(
    () =>
      routeTracks.map((track) => ({
        type: "LineString",
        coordinates: track.coordinates,
      })),
    [routeTracks],
  );

  const animationLegs = useMemo(
    () => routeTracks.map((track) => ({ coordinates: track.coordinates })),
    [routeTracks],
  );

  // Last known position: last coordinate of the most recent leg
  const lastKnownPosition = useMemo<[number, number] | null>(() => {
    return getLastKnownVoyagePosition(routeTracks);
  }, [routeTracks]);

  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
    if (lastKnownPosition) {
      setBoatPosition(lastKnownPosition);
    }
  }, [lastKnownPosition]);

  const handleBoatPositionChange = useCallback(
    (position: [number, number] | null) => {
      setBoatPosition(position);
    },
    [],
  );

  return (
    <div className="relative h-dvh w-full">
      <header className="pointer-events-none absolute inset-x-0 top-4 z-[350] flex justify-center px-4">
        <div className="max-w-[min(28rem,calc(100vw-8rem))] rounded-2xl bg-navy/75 px-4 py-3 text-center text-white shadow-overlay backdrop-blur-[12px]">
          <h1 className="font-heading text-h3 leading-tight">{voyageName}</h1>
          <p className="mt-1 truncate font-sans text-xs uppercase tracking-[0.2em] text-white/80">
            {(boatName ?? voyageName)} · @{username}
          </p>
        </div>
      </header>

      <MapLoader
        tracks={animationComplete || animationLegs.length === 0 ? tracks : []}
        className="h-full w-full"
        ariaLabel={messages.map.ariaLabel}
      >
        {/* During animation: RouteAnimation manages polylines directly */}
        {!animationComplete && animationLegs.length > 0 && (
          <RouteAnimation
            legs={animationLegs}
            totalDistanceNm={totalDistanceNm}
            onComplete={handleAnimationComplete}
            onBoatPositionChange={handleBoatPositionChange}
          />
        )}

        {/* Stopovers — read-only */}
        {stopovers.map((stopover) => (
          <StopoverMarker
            key={stopover.id}
            position={[stopover.longitude, stopover.latitude]}
            name={stopover.name}
            country={stopover.country}
            readOnly
          />
        ))}

        {/* Boat marker */}
        {boatPosition && <BoatMarker position={boatPosition} />}
      </MapLoader>

      {/* Overlays */}
      <BoatBadge
        boatName={boatName}
        boatType={boatType}
        username={username}
        voyageName={voyageName}
      />

      <StatsBar
        totalDistanceNm={totalDistanceNm}
        days={days}
        portsCount={portsCount}
        countriesCount={countriesCount}
      />
    </div>
  );
}
