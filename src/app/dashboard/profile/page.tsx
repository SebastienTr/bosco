import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/data/profiles";
import { LegalLinks } from "@/components/legal/LegalLinks";
import { SharePendingRedirect } from "../SharePendingRedirect";
import { ProfileForm } from "./ProfileForm";
import { SignOutButton } from "./SignOutButton";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { messages } from "./messages";

export const metadata: Metadata = {
  title: messages.meta.title,
  description: messages.meta.description,
};

export default async function ProfilePage() {
  const auth = await requireAuth();
  if (auth.error) {
    redirect("/auth");
  }

  const { data: profile } = await getProfileByUserId(auth.data.id);

  const isEdit = !!profile?.username;

  return (
    <main className="min-h-screen bg-foam px-4 py-16 sm:px-6 lg:px-8">
      <SharePendingRedirect />
      <div className="mx-auto max-w-xl rounded-[var(--radius-card)] bg-white p-8 shadow-card">
        <p className="text-small font-semibold uppercase tracking-[0.2em] text-ocean">
          {messages.eyebrow}
        </p>
        <h1 className="mt-4 font-heading text-h1 text-navy">
          {isEdit ? messages.titleEdit : messages.titleCreate}
        </h1>
        <p className="mt-3 max-w-md text-body text-slate">
          {isEdit ? messages.descriptionEdit : messages.descriptionCreate}
        </p>

        <ProfileForm
          profile={profile}
          isEdit={isEdit}
        />

        <div className="mt-8 border-t border-foam pt-6">
          <SignOutButton />
        </div>

        <DeleteAccountSection />

        <section className="mt-8 border-t border-foam pt-6">
          <h2 className="font-heading text-h2 text-navy">
            {messages.legal.title}
          </h2>
          <p className="mt-2 text-small text-slate">
            {messages.legal.description}
          </p>
          <LegalLinks
            labels={{
              privacy: messages.legal.privacy,
              terms: messages.legal.terms,
            }}
            className="mt-4"
          />
        </section>
      </div>
    </main>
  );
}
