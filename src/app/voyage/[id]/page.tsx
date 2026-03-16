import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import MapLoader from "@/components/map/MapLoader";
import { messages } from "./messages";

export const metadata: Metadata = {
  title: messages.meta.title,
};

export default async function VoyagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/auth");
  }

  const { id } = await params;
  const { data: voyage, error } = await getVoyageById(id);

  if (error) {
    if (error.code === "PGRST116") {
      notFound();
    }

    throw new Error(`Failed to load voyage: ${error.message}`);
  }

  if (!voyage) {
    notFound();
  }

  // No legs table yet — tracks will be fetched in Story 2.3
  const tracks: GeoJSON.LineString[] = [];

  return (
    <div className="flex h-screen flex-col">
      {/* Header bar */}
      <header className="flex items-center gap-4 bg-white px-4 py-3 shadow-card">
        <Link
          href="/dashboard"
          className="inline-flex min-h-[44px] items-center rounded-[var(--radius-button)] px-3 py-2 text-body font-semibold text-mist transition-colors hover:text-navy"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {messages.backToDashboard}
        </Link>
        <h1 className="flex-1 truncate font-heading text-h1 text-navy">
          {voyage.name}
        </h1>
      </header>

      {/* Map area — fills remaining viewport */}
      <div className="relative flex-1">
        <MapLoader
          tracks={tracks}
          className="h-full w-full"
          ariaLabel={messages.map.ariaLabel}
        />

        {/* EmptyState overlay when no tracks */}
        {tracks.length === 0 && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
            <div className="pointer-events-auto rounded-[var(--radius-card)] bg-white/90 px-8 py-10 shadow-overlay backdrop-blur-sm">
              <EmptyState
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" x2="12" y1="18" y2="12" />
                    <line x1="9" x2="15" y1="15" y2="15" />
                  </svg>
                }
                title={messages.emptyState.title}
                description={messages.emptyState.description}
                action={
                  <Button
                    disabled
                    className="min-h-[44px] bg-ocean px-8 text-white opacity-50"
                  >
                    {messages.emptyState.cta}
                  </Button>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
