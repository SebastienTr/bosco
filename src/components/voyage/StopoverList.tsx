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

interface CountryGroup<T> {
  country: string;
  countryCode: string | null;
  items: T[];
}

/**
 * Group stopovers by consecutive country passages, sorted most recent first.
 * If a voyage visits France, then Guernsey, then France again,
 * this produces three groups (France, Guernsey, France) — not two.
 */
function groupByConsecutiveCountry<T extends StopoverListItem>(stopovers: T[]): CountryGroup<T>[] {
  // Sort by arrived_at descending (most recent first)
  const sorted = [...stopovers].sort((a, b) => {
    if (!a.arrived_at && !b.arrived_at) return 0;
    if (!a.arrived_at) return 1;
    if (!b.arrived_at) return -1;
    return new Date(b.arrived_at).getTime() - new Date(a.arrived_at).getTime();
  });

  const groups: CountryGroup<T>[] = [];
  for (const stopover of sorted) {
    const country = stopover.country ?? "Unknown";
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.country === country) {
      lastGroup.items.push(stopover);
    } else {
      groups.push({
        country,
        countryCode: stopover.country_code,
        items: [stopover],
      });
    }
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
  const groups = groupByConsecutiveCountry(stopovers);

  if (stopovers.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 overflow-y-auto p-3">
      {groups.map((group, groupIndex) => {
        const flag = countryCodeToFlag(group.countryCode);
        return (
          <details key={`${group.country}-${groupIndex}`} open>
            <summary className="cursor-pointer rounded py-2 font-heading text-sm font-semibold text-navy focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2">
              {flag}{flag ? " " : ""}{group.country}
              <span className="ml-1 text-xs text-mist">({group.items.length})</span>
            </summary>
            <ul className="flex flex-col gap-0.5 pl-2">
              {group.items.map((stopover) => (
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
        );
      })}
    </div>
  );
}
