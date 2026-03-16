"use client";

import { useState, useCallback } from "react";
import type { Stopover } from "@/lib/data/stopovers";
import { StopoverList } from "./StopoverList";

interface StopoverPanelProps {
  stopovers: Stopover[];
}

export function StopoverPanel({ stopovers }: StopoverPanelProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback((stopover: Stopover) => {
    // Dispatch custom event for map to center on this stopover
    window.dispatchEvent(
      new CustomEvent("bosco:center-stopover", {
        detail: {
          lat: Number(stopover.latitude),
          lng: Number(stopover.longitude),
        },
      }),
    );
  }, []);

  if (stopovers.length === 0) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="absolute right-3 top-3 z-[500] flex min-h-[44px] items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-navy shadow-card transition-colors hover:bg-foam"
        aria-label="Toggle stopover list"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="10" r="3" />
          <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z" />
        </svg>
        Stopovers ({stopovers.length})
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-3 top-16 z-[500] w-64 rounded-lg bg-white shadow-overlay lg:top-3 lg:right-3 lg:h-[calc(100%-24px)] lg:w-72">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <h2 className="font-heading text-sm font-semibold text-navy">
              Stopovers
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-1 text-mist hover:text-navy"
              aria-label="Close stopover list"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <StopoverList stopovers={stopovers} onSelect={handleSelect} />
        </div>
      )}
    </>
  );
}
