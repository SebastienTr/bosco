import Link from "next/link";
import { messages } from "./messages";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="font-heading text-display text-navy">
        {messages.notFound.code}
      </h1>
      <p className="text-body text-slate">{messages.notFound.description}</p>
      <Link
        href="/"
        className="rounded-[var(--radius-button)] bg-ocean px-6 py-3 text-body font-medium text-white transition-colors hover:bg-ocean/90"
      >
        {messages.notFound.cta}
      </Link>
    </div>
  );
}
