"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="font-heading text-h1 text-navy">Something went wrong</h1>
      <p className="text-body text-slate">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-[var(--radius-button)] bg-ocean px-6 py-3 text-body font-medium text-white transition-colors hover:bg-ocean/90"
      >
        Try Again
      </button>
    </div>
  );
}
