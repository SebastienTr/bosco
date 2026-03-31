"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { messages } from "./messages";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-coral/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-coral"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" x2="9" y1="9" y2="15" />
          <line x1="9" x2="15" y1="9" y2="15" />
        </svg>
      </div>
      <div className="text-center">
        <h1 className="font-heading text-h1 text-navy">{messages.error.title}</h1>
        <p className="mt-2 text-body text-slate">{messages.error.description}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="min-h-[44px] rounded-[var(--radius-button)] bg-ocean px-6 py-3 text-body font-medium text-white transition-colors hover:bg-ocean/90"
        >
          {messages.error.retry}
        </button>
        <Link
          href="/dashboard"
          className="inline-flex min-h-[44px] items-center rounded-[var(--radius-button)] border border-navy/20 px-6 py-3 text-body font-medium text-navy transition-colors hover:bg-foam"
        >
          {messages.error.backToDashboard}
        </Link>
      </div>
    </div>
  );
}
