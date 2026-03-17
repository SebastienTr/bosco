import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import { getLegsByVoyageId } from "@/lib/data/legs";
import { getStopoversByVoyageId } from "@/lib/data/stopovers";
import { VoyageContent } from "@/components/voyage/VoyageContent";
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

  const { data: legs, error: legsError } = await getLegsByVoyageId(id);
  if (legsError) {
    throw new Error(`Failed to load legs: ${legsError.message}`);
  }

  const { data: stopovers, error: stopoversError } =
    await getStopoversByVoyageId(id);
  if (stopoversError) {
    throw new Error(`Failed to load stopovers: ${stopoversError.message}`);
  }

  return (
    <div className="flex h-dvh flex-col">
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
        <div className="flex items-center gap-2">
          {(legs ?? []).length > 0 && (
            <Link
              href={`/voyage/${id}/import`}
              className="inline-flex min-h-[44px] items-center rounded-lg bg-ocean px-4 font-semibold text-white transition-colors hover:bg-ocean/80"
            >
              {messages.emptyState.cta}
            </Link>
          )}
          <Link
            href={`/voyage/${id}/settings`}
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-mist transition-colors hover:text-navy"
            aria-label={messages.settingsLink}
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
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Map area — fills remaining viewport */}
      <VoyageContent
        initialLegs={legs ?? []}
        stopovers={stopovers ?? []}
        voyageId={id}
      />
    </div>
  );
}
