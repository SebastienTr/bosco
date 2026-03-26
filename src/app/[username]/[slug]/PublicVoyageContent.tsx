"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import MapLoader from "@/components/map/MapLoader";
import { StatsBar } from "@/components/voyage/StatsBar";
import { BoatBadge } from "@/components/voyage/BoatBadge";
import { StopoverSheet } from "@/components/voyage/StopoverSheet";
import { PortsPanel } from "@/components/voyage/PortsPanel";
import { ActionFAB } from "@/components/voyage/ActionFAB";
import { JournalTimeline } from "@/components/log/JournalTimeline";
import { PhotoLightbox } from "@/components/log/PhotoLightbox";
import type { LogEntry } from "@/lib/data/log-entries";
import type { Json } from "@/types/supabase";
import {
  getLastKnownVoyagePosition,
  toVoyageRouteTracks,
} from "@/lib/voyage-route";
import { parseMapHash } from "@/lib/utils/map-view-hash";
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

type ActiveOverlay = null | "sheet" | "panel" | "lightbox" | "journal";

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
  logEntries: LogEntry[];
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
  logEntries,
}: PublicVoyageContentProps) {
  const initialMapView = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return parseMapHash(window.location.hash);
  }, []);

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

  const hasSharedMapView = initialMapView !== null;
  const shouldAnimateRoute = !hasSharedMapView && animationLegs.length > 0;

  // Last known position: last coordinate of the most recent leg
  const lastKnownPosition = useMemo<[number, number] | null>(() => {
    return getLastKnownVoyagePosition(routeTracks);
  }, [routeTracks]);

  const [animationComplete, setAnimationComplete] = useState(!shouldAnimateRoute);
  const [boatPosition, setBoatPosition] = useState<[number, number] | null>(
    () => (shouldAnimateRoute ? null : lastKnownPosition),
  );
  const [selectedStopover, setSelectedStopover] =
    useState<StopoverData | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

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

  const handleToggleJournal = useCallback(() => {
    setActiveOverlay((prev) => {
      if (prev === "journal") return null;
      setSelectedStopover(null);
      return "journal";
    });
  }, []);

  const handlePhotoTap = useCallback((url: string) => {
    setLightboxUrl(url);
    setSelectedStopover(null);
    setActiveOverlay("lightbox");
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxUrl(null);
    setActiveOverlay(null);
  }, []);

  const handlePortsPanelSelect = useCallback(
    (stopover: StopoverData) => {
      handleSelectStopover(stopover);
    },
    [handleSelectStopover],
  );

  const isPortsPanelOpen = activeOverlay === "panel";
  const isJournalOpen = activeOverlay === "journal";
  const hasLogEntries = logEntries.length > 0;

  return (
    <div className="relative flex h-dvh w-full">
      {/* Desktop persistent sidebars */}
      <div className="hidden lg:flex lg:h-full lg:flex-row">
        <PortsPanel
          stopovers={stopovers}
          isOpen={true}
          onClose={() => {}}
          onSelectStopover={handlePortsPanelSelect}
          messages={messages.portsPanel}
        />
        {/* Desktop journal below ports */}
        {hasLogEntries && (
          <aside className="flex h-full w-[280px] shrink-0 flex-col border-l border-navy/10 bg-sand">
            <div className="border-b border-navy/10 px-4 py-3">
              <h2 className="font-heading text-h3 text-navy">
                {messages.journal.header}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <JournalTimeline
                entries={logEntries}
                stopovers={stopovers}
                legs={legs}
                onPhotoTap={handlePhotoTap}
                ariaLabel={messages.journal.ariaLabel}
              />
            </div>
          </aside>
        )}
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
          tracks={animationComplete || !shouldAnimateRoute ? tracks : []}
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
          {shouldAnimateRoute && !animationComplete && (
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

        {/* Journal toggle button — mobile only, when entries exist */}
        {hasLogEntries && (
          <button
            type="button"
            onClick={handleToggleJournal}
            aria-label={
              isJournalOpen
                ? messages.journal.closeLabel
                : messages.journal.openLabel
            }
            className="absolute bottom-10 right-4 z-[400] flex min-h-[44px] items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-navy shadow-card transition-colors hover:bg-foam lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
            </svg>
            {messages.journal.toggle(logEntries.length)}
          </button>
        )}

        {/* Mobile Journal Panel */}
        {hasLogEntries && (
          <div
            className={`fixed inset-y-0 right-0 z-[450] w-[280px] lg:hidden ${
              isJournalOpen ? "translate-x-0" : "translate-x-full"
            } transition-transform duration-200 ease-out ${
              isJournalOpen ? "" : "pointer-events-none"
            }`}
            aria-hidden={!isJournalOpen}
            inert={!isJournalOpen}
          >
            {isJournalOpen && (
              <div
                className="fixed inset-0 -z-10 bg-navy/30"
                onClick={() => setActiveOverlay(null)}
                aria-hidden="true"
              />
            )}
            <div className="flex h-full flex-col bg-navy/75 backdrop-blur-[12px]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 className="font-heading text-h3 text-white">
                  {messages.journal.header}
                </h2>
                <button
                  onClick={() => setActiveOverlay(null)}
                  aria-label={messages.journal.closeLabel}
                  className="rounded-full p-1.5 text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 pb-20 [&_div.shadow-card]:bg-white/10 [&_h3]:text-white [&_p]:text-white/80 [&_.text-mist]:text-white/60">
                <JournalTimeline
                  entries={logEntries}
                  stopovers={stopovers}
                  legs={legs}
                  onPhotoTap={handlePhotoTap}
                  ariaLabel={messages.journal.ariaLabel}
                />
              </div>
            </div>
          </div>
        )}

        {/* Photo Lightbox */}
        {activeOverlay === "lightbox" && (
          <PhotoLightbox url={lightboxUrl} onClose={handleCloseLightbox} />
        )}
      </div>
    </div>
  );
}
