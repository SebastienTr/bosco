"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Leg } from "@/lib/data/legs";
import type { Stopover } from "@/lib/data/stopovers";
import type { LogEntry } from "@/lib/data/log-entries";
import type { ActionResponse } from "@/types";
import dynamic from "next/dynamic";
import MapLoader from "@/components/map/MapLoader";
import { StopoverPanel } from "@/components/voyage/StopoverPanel";
import { deleteLeg } from "@/app/voyage/[id]/actions";
import { regeocodeUnnamed } from "@/app/voyage/[id]/stopover/actions";
import { removeLegFromState, restoreLegToState } from "./leg-state";

const StopoverMarkers = dynamic(
  () =>
    import("@/components/map/StopoverMarkers").then((m) => m.StopoverMarkers),
  { ssr: false },
);

const PhotoMarker = dynamic(
  () =>
    import("@/components/map/PhotoMarker").then((m) => m.PhotoMarker),
  { ssr: false },
);
import { buildPhotoMarkers } from "@/components/map/photo-markers-utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { LegList } from "@/components/voyage/LegList";
import { JournalSection } from "@/components/log/JournalSection";
import { PhotoLightbox } from "@/components/log/PhotoLightbox";
import { messages } from "@/app/voyage/[id]/messages";

type ActiveOverlay = "stopovers" | "legs" | "journal" | "lightbox" | null;

interface VoyageContentProps {
  initialLegs: Leg[];
  stopovers: Stopover[];
  voyageId: string;
  initialLogEntries?: LogEntry[];
}

export function VoyageContent({
  initialLegs,
  stopovers,
  voyageId,
  initialLogEntries = [],
}: VoyageContentProps) {
  const [legs, setLegs] = useState(initialLegs);
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const regeocodeTriggered = useRef(false);

  // Auto-detect unnamed stopovers and trigger geocoding
  useEffect(() => {
    if (regeocodeTriggered.current) return;
    const unnamed = stopovers.filter((s) => !s.name || s.name === "Unnamed");
    if (unnamed.length === 0) return;
    regeocodeTriggered.current = true;
    regeocodeUnnamed({ voyageId }).then((result) => {
      // Only reload if at least one stopover was actually renamed
      const updatedCount = (result.data ?? []).filter(
        (s) => s.name && s.name !== "Unnamed",
      ).length;
      const previouslyNamed = stopovers.filter(
        (s) => s.name && s.name !== "Unnamed",
      ).length;
      if (updatedCount > previouslyNamed) {
        window.location.reload();
      }
    });
  }, [stopovers, voyageId]);

  const photoMarkers = useMemo(
    () => buildPhotoMarkers(initialLogEntries, stopovers, legs),
    [initialLogEntries, stopovers, legs],
  );

  const tracks: GeoJSON.LineString[] = legs.map(
    (leg) => leg.track_geojson as unknown as GeoJSON.LineString,
  );

  const toggleOverlay = useCallback((overlay: Exclude<ActiveOverlay, null>) => {
    setActiveOverlay((current) => (current === overlay ? null : overlay));
  }, []);

  const closeOverlay = useCallback(() => {
    setActiveOverlay(null);
  }, []);

  const handlePhotoTap = useCallback((url: string) => {
    setLightboxUrl(url);
    setActiveOverlay("lightbox");
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxUrl(null);
    setActiveOverlay(null);
  }, []);

  const handleDeleteLeg = useCallback(
    async (legId: string): Promise<ActionResponse<null>> => {
      const snapshot = removeLegFromState(legs, legId);
      if (!snapshot.removedLeg) {
        return {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: messages.legs.deleteErrorToast,
          },
        };
      }

      setLegs(snapshot.nextLegs);

      try {
        const result = await deleteLeg({ legId });
        if (result.error) {
          setLegs((current) => restoreLegToState(current, snapshot));
        }
        return result;
      } catch {
        setLegs((current) => restoreLegToState(current, snapshot));
        return {
          data: null,
          error: {
            code: "EXTERNAL_SERVICE_ERROR",
            message: messages.legs.deleteErrorToast,
          },
        };
      }
    },
    [legs],
  );

  return (
    <div className="relative flex-1">
      <MapLoader
        tracks={tracks}
        className="h-full w-full"
        ariaLabel={messages.map.ariaLabel}
      >
        {stopovers.length > 0 && (
          <StopoverMarkers stopovers={stopovers} voyageId={voyageId} />
        )}
        {photoMarkers.map((m, i) => (
          <PhotoMarker
            key={`${m.entryId}-${i}`}
            position={m.position}
            photoUrl={m.photoUrl}
            label={m.label}
            onTap={handlePhotoTap}
          />
        ))}
      </MapLoader>

      {/* Stopover list panel */}
      {stopovers.length > 0 && (
        <StopoverPanel
          stopovers={stopovers}
          voyageId={voyageId}
          isOpen={activeOverlay === "stopovers"}
          onToggle={() => toggleOverlay("stopovers")}
          onClose={closeOverlay}
        />
      )}

      {/* Leg list panel */}
      {legs.length > 0 && (
        <LegList
          legs={legs}
          onDelete={handleDeleteLeg}
          isOpen={activeOverlay === "legs"}
          onToggle={() => toggleOverlay("legs")}
          onClose={closeOverlay}
        />
      )}

      {/* Journal section */}
      <JournalSection
        entries={initialLogEntries}
        legs={legs}
        stopovers={stopovers}
        voyageId={voyageId}
        isOpen={activeOverlay === "journal"}
        onToggle={() => toggleOverlay("journal")}
        onClose={closeOverlay}
        onPhotoTap={handlePhotoTap}
      />

      {/* Photo Lightbox */}
      {activeOverlay === "lightbox" && (
        <PhotoLightbox url={lightboxUrl} onClose={handleCloseLightbox} />
      )}

      {/* EmptyState overlay when no tracks */}
      {legs.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
          <div className="pointer-events-auto rounded-[var(--radius-card)] bg-white/90 px-8 py-10 shadow-overlay backdrop-blur-sm">
            <EmptyState
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" x2="12" y1="18" y2="12" />
                  <line x1="9" x2="15" y1="15" y2="15" />
                </svg>
              }
              title={messages.emptyState.title}
              description={messages.emptyState.description}
              action={
                <Link
                  href={`/voyage/${voyageId}/import`}
                  className="inline-flex min-h-[44px] items-center rounded-lg bg-ocean px-8 py-3 font-semibold text-white transition-colors hover:bg-ocean/80"
                >
                  {messages.emptyState.cta}
                </Link>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
