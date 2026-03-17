import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import { VoyageSettingsForm } from "./VoyageSettingsForm";
import { messages } from "./messages";

export const metadata: Metadata = {
  title: messages.meta.title,
};

export default async function VoyageSettingsPage({
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

  if (voyage.user_id !== user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/voyage/${id}`}
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
        {messages.backToVoyage}
      </Link>

      <h1 className="mt-4 font-heading text-display text-navy">
        {messages.heading}
      </h1>

      <VoyageSettingsForm voyage={voyage} />
    </div>
  );
}
