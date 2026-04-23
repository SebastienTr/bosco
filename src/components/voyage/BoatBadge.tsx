"use client";

import { useState } from "react";
import Link from "next/link";
import { messages } from "@/app/[username]/[slug]/messages";

interface BoatBadgeProps {
  boatName: string | null;
  boatType: string | null;
  username: string;
  voyageName: string;
  voyageBoatName?: string | null;
  voyageBoatType?: string | null;
  voyageBoatLengthM?: number | null;
  voyageBoatFlag?: string | null;
  voyageHomePort?: string | null;
}

export function BoatBadge({
  boatName,
  boatType,
  username,
  voyageName,
  voyageBoatName,
  voyageBoatType,
  voyageBoatLengthM,
  voyageBoatFlag,
  voyageHomePort,
}: BoatBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const displayName = voyageBoatName ?? boatName ?? voyageName;
  const displayType = voyageBoatType ?? boatType;

  const boatDetailsSegments: string[] = [];
  if (displayType) {
    boatDetailsSegments.push(
      displayType.charAt(0).toUpperCase() + displayType.slice(1),
    );
  }
  if (voyageBoatLengthM != null) {
    boatDetailsSegments.push(
      `${voyageBoatLengthM}${messages.boatBadge.lengthUnit}`,
    );
  }
  if (voyageBoatFlag) {
    boatDetailsSegments.push(voyageBoatFlag);
  }
  if (voyageHomePort) {
    boatDetailsSegments.push(
      `${messages.boatBadge.homePortPrefix}${voyageHomePort}`,
    );
  }

  return (
    <div className="absolute left-14 top-4 z-[400]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 rounded-full bg-navy/75 px-3 py-2 shadow-overlay backdrop-blur-[12px] transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2"
        aria-expanded={expanded}
        aria-label={
          expanded
            ? messages.boatBadge.collapseLabel
            : messages.boatBadge.expandLabel
        }
      >
        <span className="h-2 w-2 rounded-full bg-success" />
        <span className="font-sans text-sm font-semibold text-white">
          {displayName}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 rounded-2xl bg-navy/75 px-4 py-3 shadow-overlay backdrop-blur-[12px] transition-all duration-200 ease-out">
          {boatDetailsSegments.length > 0 && (
            <p className="font-sans text-xs text-white/80">
              {boatDetailsSegments.join(messages.boatBadge.separator)}
            </p>
          )}
          <p className="mt-1 font-sans text-xs text-white/80">@{username}</p>
          <Link
            href={`/${username}`}
            className="mt-2 inline-flex text-xs font-semibold text-white underline underline-offset-2 hover:text-white/90"
          >
            {messages.boatBadge.profileLink}
          </Link>
        </div>
      )}
    </div>
  );
}
