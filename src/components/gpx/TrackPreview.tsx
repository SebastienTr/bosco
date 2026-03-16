"use client";

import { useState } from "react";
import MapLoader from "@/components/map/MapLoader";
import type { ProcessingResult, TrackStats } from "@/types/gpx";
import {
  formatDistanceNm,
  formatDuration,
} from "@/lib/utils/format";

const TRACK_COLORS = [
  "#2563EB", // Ocean blue
  "#E8614D", // Coral
  "#10B981", // Sea green
  "#F59E0B", // Amber
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

interface TrackPreviewProps {
  result: ProcessingResult;
  onConfirm: (
    selectedIndices: number[],
    merge: boolean,
  ) => void;
  importing: boolean;
}

function formatDate(isoString: string | null): string {
  if (!isoString) return "\u2014";
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function trackName(stats: TrackStats, index: number): string {
  return stats.name?.trim() || `Track ${index + 1}`;
}

export function TrackPreview({
  result,
  onConfirm,
  importing,
}: TrackPreviewProps) {
  const [selected, setSelected] = useState<boolean[]>(
    () => result.tracks.map(() => true),
  );
  const [merge, setMerge] = useState(false);

  const selectedIndices = selected
    .map((checked, i) => (checked ? i : -1))
    .filter((i) => i >= 0);

  const hasSelection = selectedIndices.length > 0;
  const isMultiTrack = result.tracks.length >= 2;

  // Build tracks and colors for visible (selected) tracks
  const visibleTracks = selectedIndices.map((i) => result.tracks[i]);
  const visibleColors = selectedIndices.map(
    (i) => TRACK_COLORS[i % TRACK_COLORS.length],
  );

  function toggleTrack(index: number) {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  function toggleAll() {
    const allSelected = selected.every(Boolean);
    setSelected(selected.map(() => !allSelected));
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Map preview */}
      <div className="flex-1 lg:w-2/3">
        <MapLoader
          tracks={visibleTracks}
          trackColors={visibleColors}
          className="h-full w-full"
          ariaLabel="GPX track preview map"
        />
      </div>

      {/* Track list panel */}
      <div className="flex max-h-[40vh] flex-col border-t border-foam bg-white lg:max-h-none lg:w-1/3 lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between border-b border-foam px-4 py-3">
          <h2 className="font-heading text-h2 text-navy">Preview</h2>
          <button
            onClick={toggleAll}
            className="min-h-[44px] text-sm font-semibold text-ocean"
          >
            {selected.every(Boolean) ? "Deselect all" : "Select all"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {result.stats.map((stats, index) => {
            const color = TRACK_COLORS[index % TRACK_COLORS.length];
            return (
              <label
                key={index}
                className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-foam/50"
              >
                <input
                  type="checkbox"
                  checked={selected[index]}
                  onChange={() => toggleTrack(index)}
                  className="mt-1 h-5 w-5 shrink-0 accent-ocean"
                />
                <span
                  className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy">
                    {trackName(stats, index)}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mist">
                    <span>{formatDistanceNm(stats.distanceNm)}</span>
                    <span>{formatDuration(stats.durationSeconds)}</span>
                    <span>{formatDate(stats.startTime)}</span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Merge option + CTA */}
        <div className="border-t border-foam px-4 py-4">
          {isMultiTrack && (
            <label className="mb-4 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={merge}
                onChange={(e) => setMerge(e.target.checked)}
                className="h-5 w-5 accent-ocean"
              />
              <span className="text-sm font-medium text-navy">
                Merge into single leg
              </span>
            </label>
          )}
          <button
            onClick={() => onConfirm(selectedIndices, merge)}
            disabled={!hasSelection || importing}
            className="min-h-[44px] w-full rounded-[var(--radius-button)] bg-coral px-8 py-3 font-semibold text-white transition-colors hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importing ? "Adding to your voyage..." : "Add to voyage"}
          </button>
          {!hasSelection && (
            <p className="mt-2 text-center text-sm text-coral">
              Select at least one track
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
