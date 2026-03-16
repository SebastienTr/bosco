"use client";

import type { Stopover } from "@/lib/data/stopovers";

interface StopoverListProps {
  stopovers: Stopover[];
  onSelect: (stopover: Stopover) => void;
}

function groupByCountry(stopovers: Stopover[]): Map<string, Stopover[]> {
  const groups = new Map<string, Stopover[]>();
  for (const stopover of stopovers) {
    const key = stopover.country ?? "Unknown";
    const group = groups.get(key) ?? [];
    group.push(stopover);
    groups.set(key, group);
  }
  return groups;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function StopoverList({ stopovers, onSelect }: StopoverListProps) {
  const groups = groupByCountry(stopovers);

  if (stopovers.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 overflow-y-auto p-3">
      {[...groups.entries()].map(([country, items]) => (
        <details key={country} open>
          <summary className="cursor-pointer py-2 font-heading text-sm font-semibold text-navy">
            {country}
            <span className="ml-1 text-xs text-mist">({items.length})</span>
          </summary>
          <ul className="flex flex-col gap-0.5 pl-2">
            {items.map((stopover) => (
              <li key={stopover.id}>
                <button
                  onClick={() => onSelect(stopover)}
                  className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-foam"
                >
                  <span className="text-navy">
                    {stopover.name || "Unnamed"}
                  </span>
                  {stopover.arrived_at && (
                    <span className="text-xs text-mist">
                      {formatDate(stopover.arrived_at)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
