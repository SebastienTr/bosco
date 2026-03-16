import Link from "next/link";
import { messages } from "./messages";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-display text-navy sm:text-[2.5rem]">
            {messages.hero.title}
          </h1>
          <p className="mt-6 text-h3 text-slate">
            {messages.hero.subtitle}
          </p>
          <p className="mt-4 text-body text-mist">
            {messages.hero.description}
          </p>
          <div className="mt-10">
            <Link
              href="/auth"
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-button)] bg-coral px-8 py-3 text-body font-semibold text-white shadow-card transition-colors hover:bg-coral/90"
            >
              {messages.hero.cta}
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-foam px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-card">
            <h3 className="font-heading text-h2 text-navy">
              {messages.features.track.title}
            </h3>
            <p className="mt-2 text-body text-slate">
              {messages.features.track.description}
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-card">
            <h3 className="font-heading text-h2 text-navy">
              {messages.features.stopovers.title}
            </h3>
            <p className="mt-2 text-body text-slate">
              {messages.features.stopovers.description}
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-card">
            <h3 className="font-heading text-h2 text-navy">
              {messages.features.share.title}
            </h3>
            <p className="mt-2 text-body text-slate">
              {messages.features.share.description}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
