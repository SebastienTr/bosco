import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { messages } from "./messages";

export const metadata: Metadata = {
  title: messages.meta.title,
  description: messages.meta.description,
};

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <main className="min-h-screen bg-foam px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] bg-white p-8 shadow-card">
        <p className="text-small font-semibold uppercase tracking-[0.2em] text-ocean">
          {messages.eyebrow}
        </p>
        <h1 className="mt-4 font-heading text-display text-navy">
          {messages.title}
        </h1>
        <p className="mt-3 max-w-2xl text-body text-slate">
          {messages.description}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-[var(--radius-card)] bg-sand p-6">
            <p className="text-small font-semibold uppercase tracking-[0.16em] text-mist">
              {messages.account.label}
            </p>
            <p className="mt-2 text-body font-semibold text-navy">
              {user.email ?? messages.account.fallbackEmail}
            </p>
            <p className="mt-3 text-body text-slate">
              {messages.account.description}
            </p>
          </section>

          <section className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-6">
            <p className="text-small font-semibold uppercase tracking-[0.16em] text-mist">
              {messages.nextStep.label}
            </p>
            <h2 className="mt-2 font-heading text-h2 text-navy">
              {messages.nextStep.title}
            </h2>
            <p className="mt-3 text-body text-slate">
              {messages.nextStep.description}
            </p>
          </section>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-button)] bg-coral px-6 py-3 text-body font-semibold text-white transition-colors hover:bg-coral/90"
          >
            {messages.actions.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
