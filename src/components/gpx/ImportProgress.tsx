"use client";

import Link from "next/link";

const STEPS = ["parsing", "simplifying", "detecting", "geocoding", "ready"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  parsing: "Parsing tracks...",
  simplifying: "Simplifying...",
  detecting: "Detecting stopovers...",
  geocoding: "Naming stopovers...",
  ready: "Preparing preview...",
};

export interface ImportErrorInfo {
  title: string;
  description: string;
  helpLink?: { label: string; href: string };
}

interface ImportProgressProps {
  currentStep: Step;
  error?: string | ImportErrorInfo | null;
  onRetry: () => void;
}

export function ImportProgress({
  currentStep,
  error,
  onRetry,
}: ImportProgressProps) {
  const currentIndex = STEPS.indexOf(currentStep);
  const progressPercent = ((currentIndex + 1) / STEPS.length) * 100;

  if (error) {
    const errorInfo: ImportErrorInfo =
      typeof error === "string"
        ? { title: "Processing failed", description: error }
        : error;

    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-6 px-6"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coral/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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
          <p className="font-heading text-h2 text-navy">{errorInfo.title}</p>
          <p className="mt-2 text-body text-mist">{errorInfo.description}</p>
          {errorInfo.helpLink && (
            <Link
              href={errorInfo.helpLink.href}
              className="mt-2 inline-block text-body font-semibold text-ocean hover:underline"
            >
              {errorInfo.helpLink.label}
            </Link>
          )}
        </div>
        <button
          onClick={onRetry}
          className="min-h-[44px] rounded-[var(--radius-button)] bg-coral px-8 py-3 font-semibold text-white transition-colors hover:bg-coral/90"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6">
      <div
        className="w-full max-w-sm"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="GPX file processing"
      >
        <div className="h-2 overflow-hidden rounded-full bg-foam">
          <div
            className="h-full rounded-full bg-ocean transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isComplete
                    ? "bg-ocean text-white"
                    : isCurrent
                      ? "animate-pulse bg-ocean/20 text-ocean"
                      : "bg-foam text-mist"
                }`}
              >
                {isComplete ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-body ${
                  isComplete
                    ? "text-navy"
                    : isCurrent
                      ? "font-semibold text-navy"
                      : "text-mist"
                }`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>

      <div aria-live="polite" className="sr-only">
        {STEP_LABELS[currentStep]}
      </div>
    </div>
  );
}
