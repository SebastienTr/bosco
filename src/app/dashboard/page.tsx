import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/data/profiles";
import { getVoyagesByUserId } from "@/lib/data/voyages";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { VoyageCard } from "@/components/voyage/VoyageCard";
import { CreateVoyageDialog } from "./CreateVoyageDialog";
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

  const { data: profile, error: profileError } = await getProfileByUserId(user.id);

  if (profileError && profileError.code !== "PGRST116") {
    throw new Error(`Failed to load profile: ${profileError.message}`);
  }

  // Redirect to profile setup if username is not set
  if (!profile?.username) {
    redirect("/dashboard/profile");
  }

  const { data: voyages, error: voyagesError } = await getVoyagesByUserId(user.id);

  if (voyagesError) {
    throw new Error(`Failed to load voyages: ${voyagesError.message}`);
  }

  const voyageList = voyages ?? [];
  const hasVoyages = voyageList.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-small font-semibold uppercase tracking-[0.2em] text-ocean">
            {messages.eyebrow}
          </p>
          <h1 className="mt-2 font-heading text-display text-navy">
            {messages.title}
          </h1>
        </div>
        {hasVoyages ? (
          <CreateVoyageDialog
            trigger={
              <Button className="min-h-[44px] bg-coral text-white hover:bg-coral/90">
                {messages.newVoyage}
              </Button>
            }
          />
        ) : null}
      </div>

      {/* Content */}
      {hasVoyages ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {voyageList.map((voyage) => (
            <VoyageCard key={voyage.id} voyage={voyage} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
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
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            }
            title={messages.emptyState.title}
            description={messages.emptyState.description}
            action={
              <CreateVoyageDialog
                trigger={
                  <Button className="min-h-[44px] bg-coral px-8 text-white hover:bg-coral/90">
                    {messages.emptyState.cta}
                  </Button>
                }
              />
            }
          />
        </div>
      )}
    </div>
  );
}
