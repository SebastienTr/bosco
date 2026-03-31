"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SESSION_KEY = "bosco-cta-dismissed";
const DELAY_MS = 10_000;

export interface DualCTAMessages {
  headline: string;
  createLabel: string;
  dismissLabel: string;
  ariaLabel: string;
}

interface DualCTAProps {
  messages: DualCTAMessages;
}

export function DualCTA({ messages }: DualCTAProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "true") {
        setDismissed(true);
        return;
      }
    } catch {
      // sessionStorage unavailable (private browsing, storage full)
    }

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function handleDismiss() {
    setVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // sessionStorage unavailable
    }
  }

  if (dismissed) return null;

  return (
    <div
      role="complementary"
      aria-label={messages.ariaLabel}
      data-testid="dual-cta"
      className={`fixed bottom-24 left-3 z-[420] max-w-[calc(100vw-5rem)] transition-all duration-500 ease-out lg:bottom-12 lg:left-auto lg:right-4 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2.5 rounded-2xl bg-navy/80 py-2.5 pl-4 pr-2.5 shadow-overlay backdrop-blur-[12px]">
        <p className="min-w-0 text-sm font-medium text-white/90">
          {messages.headline}
        </p>

        <Link
          href="/auth/login"
          data-testid="dual-cta-create"
          className="shrink-0 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral/90 active:scale-95"
        >
          {messages.createLabel}
        </Link>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label={messages.dismissLabel}
          data-testid="dual-cta-dismiss"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
