import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { getVoyagesByUserId } from "@/lib/data/voyages";
import { ShareTargetHandler } from "./ShareTargetHandler";
import { messages } from "./messages";

export const metadata: Metadata = {
  title: messages.meta.title,
};

export default async function ShareTargetPage() {
  const user = await getUser();
  let voyages: { id: string; name: string }[] = [];

  if (user) {
    const { data } = await getVoyagesByUserId(user.id);
    voyages = (data ?? []).map((v) => ({ id: v.id, name: v.name }));
  }

  return (
    <ShareTargetHandler
      isAuthenticated={!!user}
      voyages={voyages}
    />
  );
}
