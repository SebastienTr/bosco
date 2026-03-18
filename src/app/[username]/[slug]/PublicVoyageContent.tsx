"use client";

import { useCallback, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import MapLoader from "@/components/map/MapLoader";
import { StatsBar } from "@/components/voyage/StatsBar";
import { BoatBadge } from "@/components/voyage/BoatBadge";
import { messages } from "./messages";
import type { Json } from "@/types/supabase";

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

  const tracks: GeoJSON.LineString[] = useMemo(
    () =>
      legs.map((leg) => leg.track_geojson as unknown as GeoJSON.LineString),
    [legs],
  );

  // Sort legs chronologically for animation
  const sortedLegCoords = useMemo(() => {
    const sorted = [...legs]
      .filter((l) => l.started_at)
      .sort(
        (a, b) =>
          new Date(a.started_at!).getTime() -
          new Date(b.started_at!).getTime(),
      );
    return sorted.map((leg) => ({
      coordinates: (leg.track_geojson as unknown as GeoJSON.LineString)
        .coordinates,
    }));
  }, [legs]);

  // Last known position: last coordinate of the most recent leg
  const lastKnownPosition = useMemo<[number, number] | null>(() => {
    if (legs.length === 0) return null;
    const sorted = [...legs]
      .filter((l) => l.started_at)
      .sort(
        (a, b) =>
          new Date(b.started_at!).getTime() -
          new Date(a.started_at!).getTime(),
      );
    const lastLeg = sorted[0];
    if (!lastLeg) return null;
    const geojson = lastLeg.track_geojson as unknown as GeoJSON.LineString;
    const coords = geojson.coordinates;
    if (coords.length === 0) return null;
    const last = coords[coords.length - 1];
    return [last[0], last[1]];
  }, [legs]);

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
      <MapLoader
        tracks={animationComplete ? tracks : []}
        className="h-full w-full"
        ariaLabel={messages.map.ariaLabel}
      >
        {/* During animation: RouteAnimation manages polylines directly */}
        {!animationComplete && sortedLegCoords.length > 0 && (
          <RouteAnimation
            legs={sortedLegCoords}
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
