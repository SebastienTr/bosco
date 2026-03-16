import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/data/profiles";
import { getVoyagesByUserId } from "@/lib/data/voyages";

export default async function VoyageIndexPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile, error: profileError } = await getProfileByUserId(user.id);

  if (profileError && profileError.code !== "PGRST116") {
    throw new Error(`Failed to load profile: ${profileError.message}`);
  }

  if (!profile?.username) {
    redirect("/dashboard/profile");
  }

  const { data: voyages, error: voyagesError } = await getVoyagesByUserId(user.id);

  if (voyagesError) {
    throw new Error(`Failed to load voyages: ${voyagesError.message}`);
  }

  const latestVoyage = voyages?.[0];
  if (!latestVoyage) {
    redirect("/dashboard");
  }

  redirect(`/voyage/${latestVoyage.id}`);
}
