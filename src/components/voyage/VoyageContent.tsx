"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Leg } from "@/lib/data/legs";
import type { Stopover } from "@/lib/data/stopovers";
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
import { EmptyState } from "@/components/shared/EmptyState";
import { LegList } from "@/components/voyage/LegList";
import { messages } from "@/app/voyage/[id]/messages";

interface VoyageContentProps {
  initialLegs: Leg[];
  stopovers: Stopover[];
  voyageId: string;
}

export function VoyageContent({
  initialLegs,
  stopovers,
  voyageId,
}: VoyageContentProps) {
  const [legs, setLegs] = useState(initialLegs);
  const regeocodeTriggered = useRef(false);

  // Auto-detect unnamed stopovers and trigger geocoding
  useEffect(() => {
    if (regeocodeTriggered.current) return;
    const hasUnnamed = stopovers.some((s) => !s.name || s.name === "Unnamed");
    if (!hasUnnamed) return;
    regeocodeTriggered.current = true;
    regeocodeUnnamed({ voyageId }).then((result) => {
      if (result.data) window.location.reload();
    });
  }, [stopovers, voyageId]);

  const tracks: GeoJSON.LineString[] = legs.map(
    (leg) => leg.track_geojson as unknown as GeoJSON.LineString,
  );

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
      </MapLoader>

      {/* Stopover list panel */}
      {stopovers.length > 0 && <StopoverPanel stopovers={stopovers} voyageId={voyageId} />}

      {/* Leg list panel */}
      {legs.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[500] w-64 max-w-[calc(100vw-24px)] max-h-[50vh] overflow-y-auto rounded-lg bg-white/95 shadow-overlay backdrop-blur-sm">
          <div className="border-b px-3 py-2">
            <h2 className="font-heading text-sm font-semibold text-navy">
              Legs ({legs.length})
            </h2>
          </div>
          <LegList legs={legs} onDelete={handleDeleteLeg} />
        </div>
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
