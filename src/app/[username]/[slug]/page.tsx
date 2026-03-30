import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicVoyageBySlug } from "@/lib/data/voyages";
import { getLogEntriesByVoyageId } from "@/lib/data/log-entries";
import { formatDistanceNm } from "@/lib/utils/format";
import { getVoyageMetrics } from "@/lib/utils/voyage-metrics";
import { siteUrl } from "@/lib/utils/site-url";
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

  const url = `${siteUrl}/${username}/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Bosco",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicVoyagePage({ params }: Props) {
  const { username, slug } = await params;
  const { data: voyage, error } = await getPublicVoyageBySlug(username, slug);

  if (!voyage || error) {
    notFound();
  }

  const legs = voyage.legs ?? [];
  const stopovers = voyage.stopovers ?? [];
  const profile = voyage.profiles;
  const { totalDistanceNm, days, portsCount, countriesCount, firstDate, lastDate } =
    getVoyageMetrics(legs, stopovers);

  const { data: logEntries } = await getLogEntriesByVoyageId(voyage.id);

  const description = voyage.description
    ? `${voyage.description} · ${formatDistanceNm(totalDistanceNm)}`
    : messages.meta.descriptionFallback(username, totalDistanceNm);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: voyage.name,
    description,
    url: `${siteUrl}/${username}/${slug}`,
    organizer: {
      "@type": "Person",
      name: profile.username ?? username,
      url: `${siteUrl}/${profile.username ?? username}`,
    },
    startDate: firstDate ?? undefined,
    endDate: lastDate ?? undefined,
    sport: "Sailing",
    location:
      stopovers.length > 0
        ? {
            "@type": "Place",
            name: `${stopovers[0].name} to ${stopovers[stopovers.length - 1].name}`,
          }
        : undefined,
    ...(logEntries && logEntries.length > 0 && {
      subEvent: logEntries.slice(0, 10).map((entry) => ({
        "@type": "Event",
        name: `Journal entry — ${new Date(entry.entry_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
        description: entry.text.slice(0, 200),
        startDate: entry.entry_date,
      })),
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicVoyageContent
        voyageName={voyage.name}
        legs={legs}
        stopovers={stopovers}
        totalDistanceNm={totalDistanceNm}
        days={days}
        portsCount={portsCount}
        countriesCount={countriesCount}
        boatName={profile.boat_name}
        username={profile.username ?? username}
        logEntries={logEntries ?? []}
      />
    </>
  );
}
