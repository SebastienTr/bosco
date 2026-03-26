"use client";

import { useMemo } from "react";
import type { LogEntry } from "@/lib/data/log-entries";
import { LogEntryCard } from "./LogEntryCard";

interface TimelineLeg {
  id: string;
  sort_order?: number | null;
  started_at?: string | null;
}

interface JournalTimelineProps {
  entries: LogEntry[];
  stopovers: { id: string; name: string | null }[];
  legs: TimelineLeg[];
  onPhotoTap?: (url: string) => void;
  ariaLabel?: string;
}

function compareLegs(a: TimelineLeg, b: TimelineLeg): number {
  if (a.sort_order != null && b.sort_order != null && a.sort_order !== b.sort_order) {
    return a.sort_order - b.sort_order;
  }

  if (a.started_at && b.started_at && a.started_at !== b.started_at) {
    return a.started_at.localeCompare(b.started_at);
  }

  if (a.sort_order != null && b.sort_order == null) {
    return -1;
  }

  if (a.sort_order == null && b.sort_order != null) {
    return 1;
  }

  if (a.started_at && !b.started_at) {
    return -1;
  }

  if (!a.started_at && b.started_at) {
    return 1;
  }

  return 0;
}

function getStopoverName(
  stopovers: { id: string; name: string | null }[],
  stopoverId: string | null,
): string | null {
  if (!stopoverId) return null;
  const s = stopovers.find((s) => s.id === stopoverId);
  return s?.name ?? null;
}

export function JournalTimeline({
  entries,
  stopovers,
  legs,
  onPhotoTap,
  ariaLabel,
}: JournalTimelineProps) {
  const legLabelsById = useMemo(() => {
    return new Map(
      [...legs]
        .sort(compareLegs)
        .map((leg, index) => [leg.id, `Leg ${index + 1}`] as const),
    );
  }, [legs]);

  if (entries.length === 0) return null;

  return (
    <section aria-label={ariaLabel} className="space-y-3">
      {entries.map((entry) => (
        <LogEntryCard
          key={entry.id}
          entry={entry}
          stopoverName={getStopoverName(stopovers, entry.stopover_id)}
          legLabel={entry.leg_id ? legLabelsById.get(entry.leg_id) ?? null : null}
          onPhotoTap={onPhotoTap}
        />
      ))}
    </section>
  );
}
