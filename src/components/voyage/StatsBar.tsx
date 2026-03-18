"use client";

import { messages } from "@/app/[username]/[slug]/messages";

interface StatsBarProps {
  totalDistanceNm: number;
  days: number;
  portsCount: number;
  countriesCount: number;
}

function formatDistance(nm: number): string {
  if (nm >= 1000) {
    return nm.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return nm.toFixed(1);
}

interface StatItemProps {
  value: string;
  label: string;
  ariaLabel: string;
}

function StatItem({ value, label, ariaLabel }: StatItemProps) {
  return (
    <div className="flex flex-col items-center" aria-label={ariaLabel}>
      <span className="font-sans text-[28px] font-bold leading-tight text-white">
        {value}
      </span>
      <span className="font-sans text-[10px] font-medium uppercase tracking-wider text-white/80">
        {label}
      </span>
    </div>
  );
}

export function StatsBar({
  totalDistanceNm,
  days,
  portsCount,
  countriesCount,
}: StatsBarProps) {
  const distanceDisplay = formatDistance(totalDistanceNm);

  return (
    <div
      className="fixed bottom-8 left-1/2 z-[400] -translate-x-1/2 rounded-2xl bg-navy/75 px-6 py-3 shadow-overlay backdrop-blur-[12px]"
      role="region"
      aria-label="Voyage statistics"
    >
      <div className="flex items-center gap-3 sm:gap-6">
        <StatItem
          value={distanceDisplay}
          label={messages.stats.sailedLabel}
          ariaLabel={messages.stats.sailedAriaLabel(distanceDisplay)}
        />
        <div className="h-8 w-px bg-white/20" />
        <StatItem
          value={String(days)}
          label={messages.stats.daysLabel}
          ariaLabel={messages.stats.daysAriaLabel(days)}
        />
        <div className="h-8 w-px bg-white/20" />
        <StatItem
          value={String(portsCount)}
          label={messages.stats.portsLabel}
          ariaLabel={messages.stats.portsAriaLabel(portsCount)}
        />
        <div className="h-8 w-px bg-white/20" />
        <StatItem
          value={String(countriesCount)}
          label={messages.stats.countriesLabel}
          ariaLabel={messages.stats.countriesAriaLabel(countriesCount)}
        />
      </div>
    </div>
  );
}
