"use client";

import { useCallback, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import MapLoader from "@/components/map/MapLoader";
import { StatsBar } from "@/components/voyage/StatsBar";
import { BoatBadge } from "@/components/voyage/BoatBadge";
import { StopoverSheet } from "@/components/voyage/StopoverSheet";
import { PortsPanel } from "@/components/voyage/PortsPanel";
import { ActionFAB } from "@/components/voyage/ActionFAB";
import type { Json } from "@/types/supabase";
import {
  getLastKnownVoyagePosition,
  toVoyageRouteTracks,
} from "@/lib/voyage-route";
import { messages } from "./messages";

function parseMapHash(): {
  center: [number, number];
  zoom: number;
} | null {
  if (typeof window === "undefined") return null;
  const match = window.location.hash.match(
    /^#map=(\d+)\/([-\d.]+)\/([-\d.]+)$/,
  );
  if (!match) return null;
  return {
    zoom: parseInt(match[1], 10),
    center: [parseFloat(match[2]), parseFloat(match[3])],
  };
}

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

const MapCenterListener = dynamic(
  () =>
    import("@/components/map/MapCenterListener").then(
      (m) => m.MapCenterListener,
    ),
  { ssr: false },
);

const MapViewSync = dynamic(
  () =>
    import("@/components/map/MapViewSync").then((m) => m.MapViewSync),
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
  country_code: string | null;
  latitude: number;
  longitude: number;
  arrived_at: string | null;
  departed_at: string | null;
}

type ActiveOverlay = null | "sheet" | "panel";

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
  const initialMapView = useMemo(() => parseMapHash(), []);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [boatPosition, setBoatPosition] = useState<[number, number] | null>(
    null,
  );
  const [selectedStopover, setSelectedStopover] =
    useState<StopoverData | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>(null);

  const routeTracks = useMemo(() => toVoyageRouteTracks(legs), [legs]);

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

  // Overlay state management
  const handleSelectStopover = useCallback((stopover: StopoverData) => {
    setSelectedStopover(stopover);
    setActiveOverlay("sheet");
    // Center map on selected stopover
    window.dispatchEvent(
      new CustomEvent("bosco:center-stopover", {
        detail: { lat: stopover.latitude, lng: stopover.longitude },
      }),
    );
  }, []);

  const handleDismissSheet = useCallback(() => {
    setSelectedStopover(null);
    setActiveOverlay(null);
  }, []);

  const handleTogglePanel = useCallback(() => {
    setActiveOverlay((prev) => {
      if (prev === "panel") return null;
      // Opening panel dismisses sheet
      setSelectedStopover(null);
      return "panel";
    });
  }, []);

  const handleClosePanel = useCallback(() => {
    setActiveOverlay(null);
  }, []);

  const handlePortsPanelSelect = useCallback(
    (stopover: StopoverData) => {
      handleSelectStopover(stopover);
    },
    [handleSelectStopover],
  );

  const isPortsPanelOpen = activeOverlay === "panel";

  return (
    <div className="relative flex h-dvh w-full">
      {/* Desktop persistent sidebar */}
      <div className="hidden lg:block">
        <PortsPanel
          stopovers={stopovers}
          isOpen={true}
          onClose={() => {}}
          onSelectStopover={handlePortsPanelSelect}
          messages={messages.portsPanel}
        />
      </div>

      {/* Map fills remaining space */}
      <div className="relative flex-1">
        <header className="pointer-events-none absolute inset-x-0 top-4 z-[350] flex justify-center px-4">
          <div className="max-w-[min(28rem,calc(100vw-8rem))] rounded-2xl bg-navy/75 px-4 py-3 text-center text-white shadow-overlay backdrop-blur-[12px]">
            <h1 className="font-heading text-h3 leading-tight">
              {voyageName}
            </h1>
            <p className="mt-1 truncate font-sans text-xs uppercase tracking-[0.2em] text-white/80">
              {boatName ?? voyageName} · @{username}
            </p>
          </div>
        </header>

        <MapLoader
          tracks={
            animationComplete || animationLegs.length === 0 ? tracks : []
          }
          className="h-full w-full"
          ariaLabel={messages.map.ariaLabel}
          {...(initialMapView
            ? {
                center: initialMapView.center,
                zoom: initialMapView.zoom,
                skipAutoFit: true,
              }
            : {})}
        >
          <MapCenterListener />
          <MapViewSync />

          {/* During animation: RouteAnimation manages polylines directly */}
          {!animationComplete && animationLegs.length > 0 && (
            <RouteAnimation
              legs={animationLegs}
              totalDistanceNm={totalDistanceNm}
              onComplete={handleAnimationComplete}
              onBoatPositionChange={handleBoatPositionChange}
            />
          )}

          {/* Stopovers — read-only with onSelect for sheet */}
          {stopovers.map((stopover) => (
            <StopoverMarker
              key={stopover.id}
              position={[stopover.longitude, stopover.latitude]}
              name={stopover.name}
              country={stopover.country}
              readOnly
              onSelect={() => handleSelectStopover(stopover)}
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

        {/* ActionFAB — mobile only */}
        <ActionFAB
          isOpen={isPortsPanelOpen}
          onToggle={handleTogglePanel}
          messages={messages.actionFab}
        />

        {/* Mobile PortsPanel */}
        <div className="lg:hidden">
          <PortsPanel
            stopovers={stopovers}
            isOpen={isPortsPanelOpen}
            onClose={handleClosePanel}
            onSelectStopover={handlePortsPanelSelect}
            messages={messages.portsPanel}
          />
        </div>

        {/* StopoverSheet */}
        {selectedStopover && activeOverlay === "sheet" && (
          <StopoverSheet
            name={selectedStopover.name}
            country={selectedStopover.country}
            countryCode={selectedStopover.country_code}
            arrivedAt={selectedStopover.arrived_at}
            departedAt={selectedStopover.departed_at}
            onDismiss={handleDismissSheet}
            messages={messages.stopoverSheet}
          />
        )}
      </div>
    </div>
  );
}
