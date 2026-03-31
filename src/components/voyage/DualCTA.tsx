"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShareButton, type ShareButtonMessages } from "./ShareButton";

const SESSION_KEY = "bosco-cta-dismissed";
const DELAY_MS = 10_000;

export interface DualCTAMessages {
  headline: string;
  createLabel: string;
  dismissLabel: string;
  ariaLabel: string;
}

interface DualCTAProps {
  publicUrl: string;
  shareTitle: string;
  shareText: string;
  messages: DualCTAMessages;
  shareMessages: ShareButtonMessages;
}

export function DualCTA({
  publicUrl,
  shareTitle,
  shareText,
  messages,
  shareMessages,
}: DualCTAProps) {
  const [rendered, setRendered] = useState(false);
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

    let visibilityTimer: ReturnType<typeof setTimeout> | null = null;
    const timer = setTimeout(() => {
      setRendered(true);
      visibilityTimer = setTimeout(() => setVisible(true), 0);
    }, DELAY_MS);

    return () => {
      clearTimeout(timer);
      if (visibilityTimer !== null) {
        clearTimeout(visibilityTimer);
      }
    };
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

  if (dismissed || !rendered) return null;

  return (
    <div
      role="complementary"
      aria-label={messages.ariaLabel}
      data-testid="dual-cta"
      className={`fixed inset-x-0 bottom-0 z-[420] transition-transform duration-500 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="relative bg-navy/75 px-4 pb-[env(safe-area-inset-bottom,1rem)] pt-4 shadow-overlay backdrop-blur-[12px] rounded-t-2xl">
        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={messages.dismissLabel}
          data-testid="dual-cta-dismiss"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* CTA content */}
        <div className="flex items-center justify-between gap-3 pr-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <p className="min-w-0 text-sm font-medium text-white/90">
              {messages.headline}
            </p>
            <Link
              href="/auth/login"
              data-testid="dual-cta-create"
              className="shrink-0 rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral/90 active:scale-95"
            >
              {messages.createLabel}
            </Link>
          </div>

          <ShareButton
            url={publicUrl}
            title={shareTitle}
            text={shareText}
            messages={shareMessages}
            ogImageUrl={`${publicUrl}/story-image`}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
