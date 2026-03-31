import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { messages } from "./messages";

export const metadata: Metadata = {
  title: messages.meta.title,
  description: messages.meta.description,
};

const stepImages = [
  "/images/help/navionics-step-1.svg",
  "/images/help/navionics-step-2.svg",
  "/images/help/navionics-step-3.svg",
  "/images/help/navionics-step-4.svg",
];

export default function NavionicsExportGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-foam px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-body font-semibold text-ocean hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {messages.back}
          </Link>
          <span className="font-heading text-h2 text-navy">Bosco</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-display text-navy">
          {messages.heading}
        </h1>
        <p className="mt-3 text-body text-slate">{messages.intro}</p>

        {/* Steps */}
        <div className="mt-10 flex flex-col gap-10">
          {messages.steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col gap-6 rounded-[var(--radius-card)] bg-foam p-6 shadow-card md:flex-row md:items-start"
            >
              {/* Image */}
              <div className="relative aspect-[9/16] w-full shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-white md:max-w-[200px]">
                <Image
                  src={stepImages[i]}
                  alt={step.alt}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 200px"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral text-body font-bold text-white">
                    {i + 1}
                  </span>
                  <h2 className="font-heading text-h1 text-navy">
                    {step.title}
                  </h2>
                </div>
                <p className="mt-3 text-body leading-relaxed text-slate">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href={messages.ctaHref}
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-button)] bg-coral px-8 py-3 text-body font-semibold text-white shadow-card transition-colors hover:bg-coral/90"
          >
            {messages.cta}
          </Link>
        </div>
      </main>
    </div>
  );
}
