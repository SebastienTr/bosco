import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/data/profiles";
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

  const { data: profile } = await getProfileByUserId(user.id);

  // Redirect to profile setup if username is not set
  if (!profile?.username) {
    redirect("/dashboard/profile");
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
              {profile.username}
            </p>
            <p className="mt-1 text-small text-mist">
              {user.email ?? messages.account.fallbackEmail}
            </p>
          </section>

          <section className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-6">
            <p className="text-small font-semibold uppercase tracking-[0.16em] text-mist">
              {messages.boat.label}
            </p>
            <h2 className="mt-2 font-heading text-h2 text-navy">
              {profile.boat_name ?? messages.boat.noBoat}
            </h2>
            {profile.boat_type ? (
              <p className="mt-1 text-body text-slate">{profile.boat_type}</p>
            ) : null}
          </section>
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard/profile"
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-button)] border border-navy/20 px-6 py-3 text-body font-semibold text-navy transition-colors hover:bg-foam"
          >
            {messages.actions.editProfile}
          </Link>
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
