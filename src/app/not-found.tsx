import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="font-heading text-display text-navy">404</h1>
      <p className="text-body text-slate">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="rounded-[var(--radius-button)] bg-ocean px-6 py-3 text-body font-medium text-white transition-colors hover:bg-ocean/90"
      >
        Back to Home
      </Link>
    </div>
  );
}
