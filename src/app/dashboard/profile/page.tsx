import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/data/profiles";
import { SharePendingRedirect } from "../SharePendingRedirect";
import { ProfileForm } from "./ProfileForm";
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
      </div>
    </main>
  );
}
