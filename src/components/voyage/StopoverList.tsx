"use client";

import { countryCodeToFlag } from "@/lib/utils/country-flag";

export interface StopoverListItem {
  id: string;
  name: string;
  country: string | null;
  country_code: string | null;
  arrived_at: string | null;
}

interface StopoverListProps<T extends StopoverListItem> {
  stopovers: T[];
  onSelect: (stopover: T) => void;
}

function groupByCountry<T extends StopoverListItem>(stopovers: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
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

export function StopoverList<T extends StopoverListItem>({ stopovers, onSelect }: StopoverListProps<T>) {
  const groups = groupByCountry(stopovers);

  if (stopovers.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 overflow-y-auto p-3">
      {[...groups.entries()].map(([country, items]) => (
        <details key={country} open>
          <summary className="cursor-pointer rounded py-2 font-heading text-sm font-semibold text-navy focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2">
            {countryCodeToFlag(items[0].country_code)}{countryCodeToFlag(items[0].country_code) ? " " : ""}{country}
            <span className="ml-1 text-xs text-mist">({items.length})</span>
          </summary>
          <ul className="flex flex-col gap-0.5 pl-2">
            {items.map((stopover) => (
              <li key={stopover.id}>
                <button
                  type="button"
                  onClick={() => onSelect(stopover)}
                  className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-foam focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2"
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
