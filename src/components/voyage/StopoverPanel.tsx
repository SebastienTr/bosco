"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Stopover } from "@/lib/data/stopovers";
import { regeocodeUnnamed } from "@/app/voyage/[id]/stopover/actions";
import { StopoverList } from "./StopoverList";
import { messages } from "@/app/voyage/[id]/messages";

interface StopoverPanelProps {
  stopovers: Stopover[];
  voyageId: string;
}

export function StopoverPanel({ stopovers, voyageId }: StopoverPanelProps) {
  const [open, setOpen] = useState(false);
  const [isRegeocoding, setIsRegeocoding] = useState(false);

  const hasUnnamed = stopovers.some((s) => !s.name || s.name === "Unnamed");

  const handleSelect = useCallback((stopover: Stopover) => {
    window.dispatchEvent(
      new CustomEvent("bosco:center-stopover", {
        detail: {
          lat: Number(stopover.latitude),
          lng: Number(stopover.longitude),
        },
      }),
    );
  }, []);

  async function handleRegeocode() {
    setIsRegeocoding(true);
    try {
      const result = await regeocodeUnnamed({ voyageId });
      if (result.error) {
        toast.error(messages.stopovers.regeocodeError);
      } else {
        toast.success(messages.stopovers.regeocodeSuccess);
        // Reload page to show updated names
        window.location.reload();
      }
    } catch {
      toast.error(messages.stopovers.regeocodeError);
    } finally {
      setIsRegeocoding(false);
    }
  }

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
        <div className="absolute right-3 top-16 z-[500] flex w-64 max-h-[calc(100dvh-80px)] flex-col rounded-lg bg-white shadow-overlay lg:top-3 lg:right-3 lg:h-[calc(100%-24px)] lg:w-72">
          <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
            <h2 className="font-heading text-sm font-semibold text-navy">
              Stopovers
            </h2>
            <div className="flex items-center gap-1">
              {hasUnnamed && (
                <button
                  onClick={handleRegeocode}
                  disabled={isRegeocoding}
                  className="rounded px-2 py-1 text-xs font-semibold text-ocean hover:bg-ocean/10 disabled:opacity-50"
                >
                  {isRegeocoding
                    ? messages.stopovers.regeocodeLoading
                    : messages.stopovers.regeocodeButton}
                </button>
              )}
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
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <StopoverList stopovers={stopovers} onSelect={handleSelect} />
          </div>
        </div>
      )}
    </>
  );
}
