"use client";

import { useState } from "react";
import Link from "next/link";
import { messages } from "@/app/[username]/[slug]/messages";

interface BoatBadgeProps {
  boatName: string | null;
  boatType: string | null;
  username: string;
  voyageName: string;
}

export function BoatBadge({
  boatName,
  boatType,
  username,
  voyageName,
}: BoatBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const displayName = boatName ?? voyageName;

  return (
    <div className="fixed left-14 top-4 z-[400]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 rounded-full bg-navy/75 px-3 py-2 shadow-overlay backdrop-blur-[12px] transition-all duration-200 ease-out"
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
          {boatType && (
            <p className="font-sans text-xs text-white/80">{boatType}</p>
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
