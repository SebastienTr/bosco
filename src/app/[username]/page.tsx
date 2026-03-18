import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicProfileByUsername } from "@/lib/data/profiles";
import { getPublicVoyagesByUserId } from "@/lib/data/voyages";
import { formatDistanceNm } from "@/lib/utils/format";
import { messages } from "./messages";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const { data: profile } = await getPublicProfileByUsername(username);

  if (!profile?.username) {
    return { title: messages.meta.notFoundTitle };
  }

  return {
    title: messages.meta.title(profile.username),
    description: messages.meta.description(profile.username),
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const { data: profile, error: profileError } =
    await getPublicProfileByUsername(username);

  if (!profile?.username || profileError) {
    notFound();
  }

  const { data: voyages, error: voyagesError } = await getPublicVoyagesByUserId(
    profile.id,
  );

  if (voyagesError) {
    throw new Error(`Failed to load public voyages: ${voyagesError.message}`);
  }

  const publicVoyages = voyages ?? [];

  return (
    <div className="min-h-dvh bg-foam px-4 py-10 text-slate">
      <main className="mx-auto max-w-4xl">
        <header>
          <p className="text-small font-semibold uppercase tracking-[0.2em] text-ocean">
            {messages.profile.eyebrow}
          </p>
          <h1 className="mt-2 font-heading text-display text-navy">
            @{profile.username}
          </h1>
          <p className="mt-3 text-base text-slate">
            {profile.boat_name ?? messages.profile.noBoatName}
            {profile.boat_type ? ` · ${profile.boat_type}` : ""}
          </p>
          {profile.bio ? (
            <p className="mt-4 max-w-2xl text-small text-slate">{profile.bio}</p>
          ) : null}
        </header>

        <section className="mt-10">
          <h2 className="font-heading text-h2 text-navy">
            {messages.voyages.title}
          </h2>

          {publicVoyages.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {publicVoyages.map((voyage) => {
                const totalDistanceNm = (voyage.legs ?? []).reduce(
                  (sum, leg) => sum + (leg.distance_nm ?? 0),
                  0,
                );
                const stopoverCount = (voyage.stopovers ?? []).length;

                return (
                  <Link
                    key={voyage.id}
                    href={`/${profile.username}/${voyage.slug}`}
                    aria-label={messages.voyages.linkLabel(voyage.name)}
                    className="block"
                  >
                    <Card className="h-full transition-shadow hover:shadow-[0_2px_12px_rgba(27,45,79,0.15)]">
                      <CardHeader>
                        <CardTitle className="font-heading text-h3 text-navy">
                          {voyage.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-small text-slate">
                          {voyage.description ?? messages.voyages.noDescription}
                        </p>
                        <p className="mt-3 text-tiny font-semibold uppercase tracking-wider text-ocean">
                          {formatDistanceNm(totalDistanceNm)} · {stopoverCount}{" "}
                          {messages.voyages.portLabel(stopoverCount)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="font-heading text-h3 text-navy">
                  {messages.voyages.emptyTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-small text-slate">
                  {messages.voyages.emptyDescription}
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
