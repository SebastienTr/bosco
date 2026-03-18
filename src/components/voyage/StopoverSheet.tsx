"use client";

import { useEffect, useRef, useCallback } from "react";
import { countryCodeToFlag } from "@/lib/utils/country-flag";

interface StopoverSheetProps {
  name: string;
  country: string | null;
  countryCode: string | null;
  arrivedAt: string | null;
  departedAt: string | null;
  onDismiss: () => void;
  messages: {
    arrivedLabel: string;
    departedLabel: string;
    durationLabel: string;
    addNotePlaceholder: string;
    closeLabel: string;
    nightsUnit: (n: number) => string;
    hoursUnit: (n: number) => string;
    sheetAriaLabel: string;
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function computeDuration(
  arrivedAt: string | null,
  departedAt: string | null,
  messages: Pick<StopoverSheetProps["messages"], "nightsUnit" | "hoursUnit">,
): string | null {
  if (!arrivedAt || !departedAt) return null;
  const ms = new Date(departedAt).getTime() - new Date(arrivedAt).getTime();
  if (ms <= 0) return null;
  const DAY_MS = 86_400_000;
  if (ms >= DAY_MS) {
    const nights = Math.round(ms / DAY_MS);
    return messages.nightsUnit(nights);
  }
  const hours = Math.round(ms / 3_600_000);
  return messages.hoursUnit(Math.max(1, hours));
}

export function StopoverSheet({
  name,
  country,
  countryCode,
  arrivedAt,
  departedAt,
  onDismiss,
  messages,
}: StopoverSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const flag = countryCodeToFlag(countryCode);
  const duration = computeDuration(arrivedAt, departedAt, messages);

  // Focus trap + Escape
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const focusable = sheet.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (deltaY > 80) onDismiss();
    },
    [onDismiss],
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-[499]"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={messages.sheetAriaLabel}
        className="absolute inset-x-0 bottom-0 z-[500] mx-auto max-w-[400px] animate-slide-up rounded-t-2xl bg-sand px-5 pb-6 pt-3 shadow-overlay"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-navy/20" />
        </div>

        {/* Port name */}
        <h2 className="font-heading text-2xl text-navy">{name}</h2>

        {/* Country + flag */}
        {country && (
          <p className="mt-1 text-sm text-mist">
            {flag && <span className="mr-1">{flag}</span>}
            {country}
          </p>
        )}

        {/* Dates */}
        <div className="mt-4 flex flex-col gap-1.5">
          {arrivedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-mist">{messages.arrivedLabel}</span>
              <span className="text-navy">{formatDate(arrivedAt)}</span>
            </div>
          )}
          {departedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-mist">{messages.departedLabel}</span>
              <span className="text-navy">{formatDate(departedAt)}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-mist">{messages.durationLabel}</span>
              <span className="font-semibold text-navy">{duration}</span>
            </div>
          )}
        </div>

        {/* Add a note placeholder */}
        <p className="mt-4 text-sm italic text-coral">
          {messages.addNotePlaceholder}
        </p>

        {/* Close button for accessibility */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 rounded-full p-1.5 text-navy/40 transition-colors hover:text-navy/70 focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2"
          aria-label={messages.closeLabel}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </>
  );
}
