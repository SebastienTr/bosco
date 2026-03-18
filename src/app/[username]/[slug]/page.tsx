import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicVoyageBySlug } from "@/lib/data/voyages";
import { formatDistanceNm } from "@/lib/utils/format";
import PublicVoyageContent from "./PublicVoyageContent";
import { messages } from "./messages";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const { data: voyage } = await getPublicVoyageBySlug(username, slug);

  if (!voyage) {
    return { title: messages.meta.notFoundTitle };
  }

  const title = `${voyage.name} — ${voyage.profiles.boat_name ?? username}`;
  const totalDistanceNm = (voyage.legs ?? []).reduce(
    (sum, leg) => sum + (leg.distance_nm ?? 0),
    0,
  );
  const description = voyage.description
    ? `${voyage.description} · ${formatDistanceNm(totalDistanceNm)}`
    : messages.meta.descriptionFallback(username, totalDistanceNm);

  return { title, description };
}

export default async function PublicVoyagePage({ params }: Props) {
  const { username, slug } = await params;
  const { data: voyage, error } = await getPublicVoyageBySlug(username, slug);

  if (!voyage || error) {
    notFound();
  }

  const legs = voyage.legs ?? [];
  const stopovers = voyage.stopovers ?? [];

  const totalDistanceNm = legs.reduce(
    (sum, l) => sum + (l.distance_nm ?? 0),
    0,
  );

  const sortedLegs = legs
    .filter((l) => l.started_at)
    .sort(
      (a, b) =>
        new Date(a.started_at!).getTime() - new Date(b.started_at!).getTime(),
    );

  const firstDate = sortedLegs[0]?.started_at;
  const lastDate = sortedLegs[sortedLegs.length - 1]?.ended_at;
  const days =
    firstDate && lastDate
      ? Math.ceil(
          (new Date(lastDate).getTime() - new Date(firstDate).getTime()) /
            86400000,
        )
      : 0;

  const portsCount = stopovers.length;
  const countriesCount = new Set(
    stopovers.map((s) => s.country).filter(Boolean),
  ).size;

  const profile = voyage.profiles;

  return (
    <PublicVoyageContent
      voyageName={voyage.name}
      legs={legs}
      stopovers={stopovers}
      totalDistanceNm={totalDistanceNm}
      days={days}
      portsCount={portsCount}
      countriesCount={countriesCount}
      boatName={profile.boat_name}
      boatType={profile.boat_type}
      username={profile.username ?? username}
    />
  );
}
