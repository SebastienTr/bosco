"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

interface VoyageShowcaseMessages {
  title: string;
  stats: string;
  cta: string;
  caption: string;
}

interface VoyageShowcaseProps {
  messages: VoyageShowcaseMessages;
}

const SHOWCASE_VOYAGE = {
  url: "/Seb/goteborg-to-nice",
  title: "Göteborg → Nice",
  stats: { distance: "1,689 nm", ports: 45, countries: 7 },
};

const VoyageShowcaseMiniMap = dynamic(() => import("./VoyageShowcaseMiniMap"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="aspect-[16/10] w-full animate-pulse rounded-[var(--radius-card)] bg-navy/10"
    />
  ),
});

export function VoyageShowcase({ messages }: VoyageShowcaseProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);

  useEffect(() => {
    if (shouldLoadMap) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoadMap(true);
      return;
    }

    const node = sectionRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldLoadMap(true);
        observer.disconnect();
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldLoadMap]);

  const showcaseMediaLabel = messages.caption;

  return (
    <div ref={sectionRef} className="mx-auto max-w-3xl text-center">
      <h2 className="font-heading text-h1 text-navy sm:text-display">
        {messages.title}
      </h2>
      <p className="mt-2 text-body text-slate">{messages.caption}</p>

      <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] shadow-card">
        {shouldLoadMap ? (
          <VoyageShowcaseMiniMap
            ariaLabel={showcaseMediaLabel}
            voyageTitle={SHOWCASE_VOYAGE.title}
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/showcase-voyage.png"
              alt={showcaseMediaLabel}
              className="w-full"
              loading="lazy"
            />
          </>
        )}
      </div>

      <p className="mt-4 text-h3 font-semibold text-navy">{messages.stats}</p>

      <div className="mt-6">
        <Link
          href={SHOWCASE_VOYAGE.url}
          className="inline-flex min-h-[44px] items-center text-body font-semibold text-ocean transition-colors hover:text-ocean/80"
        >
          {messages.cta} &rarr;
        </Link>
      </div>
    </div>
  );
}
