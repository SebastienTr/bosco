"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const DemoMapAnimation = dynamic(() => import("./DemoMapAnimation"), {
  ssr: false,
  loading: () => (
    <div className="aspect-[4/3] w-full animate-pulse rounded-[var(--radius-card)] bg-navy/10" />
  ),
});

interface EnhancedEmptyStateProps {
  messages: {
    headline: string;
    step1: string;
    step2: string;
    step3: string;
    cta: string;
    seeExample: string;
  };
  createVoyageTrigger: ReactNode;
  showcaseUrl: string;
}

export function EnhancedEmptyState({
  messages,
  createVoyageTrigger,
  showcaseUrl,
}: EnhancedEmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Animated mini-map */}
      <div className="w-full max-w-sm overflow-hidden rounded-[var(--radius-card)] shadow-card">
        <DemoMapAnimation />
      </div>

      {/* Headline */}
      <h2 className="mt-6 font-heading text-h1 text-navy">
        {messages.headline}
      </h2>

      {/* 3-step guide */}
      <ol className="mt-6 flex flex-col gap-3 text-body text-slate">
        <li>1. {messages.step1}</li>
        <li>2. {messages.step2}</li>
        <li>3. {messages.step3}</li>
      </ol>

      {/* Primary CTA */}
      <div className="mt-6">{createVoyageTrigger}</div>

      {/* Secondary link */}
      <Link
        href={showcaseUrl}
        className="mt-4 text-body font-semibold text-ocean hover:underline"
      >
        {messages.seeExample} &rarr;
      </Link>
    </div>
  );
}
