"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import MiniMapLoader from "@/components/map/MiniMapLoader";
import { formatDistanceNm } from "@/lib/utils/format";
import type { Json } from "@/types/supabase";

interface LegSummary {
  id: string;
  track_geojson: Json;
  distance_nm: number | null;
}

interface VoyageCardProps {
  voyage: {
    id: string;
    name: string;
    description: string | null;
    is_public: boolean;
    cover_image_url: string | null;
    created_at: string;
  };
  legs: LegSummary[];
  stopoverCount: number;
  labels: {
    coverImageAltSuffix: string;
    emptyPrompt: string;
    publicBadge: string;
    privateBadge: string;
    legSingular: string;
    legPlural: string;
    portSingular: string;
    portPlural: string;
    stopoverSingular: string;
    stopoverPlural: string;
  };
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function VoyageCard({
  voyage,
  legs,
  stopoverCount,
  labels,
}: VoyageCardProps) {
  const tracks = legs
    .map((l) => l.track_geojson as unknown as GeoJSON.LineString)
    .filter((t) => t?.coordinates?.length > 0);

  const totalDistance = legs.reduce(
    (sum, l) => sum + (l.distance_nm ?? 0),
    0,
  );
  const hasTrack = tracks.length > 0;
  const legLabel = legs.length === 1 ? labels.legSingular : labels.legPlural;
  const portLabel =
    stopoverCount === 1 ? labels.portSingular : labels.portPlural;
  const stopoverLabel =
    stopoverCount === 1
      ? labels.stopoverSingular
      : labels.stopoverPlural;

  const statsLabel = hasTrack
    ? `${voyage.name}: ${formatDistanceNm(totalDistance)}, ${legs.length} ${legLabel}, ${stopoverCount} ${stopoverLabel}`
    : voyage.name;

  return (
    <Link
      href={`/voyage/${voyage.id}`}
      className="block transition-shadow hover:shadow-[0_2px_12px_rgba(27,45,79,0.15)]"
      role="link"
      aria-label={statsLabel}
    >
      <Card className="h-full overflow-hidden">
        {/* Top area: cover / mini-map / empty */}
        <div className="h-40 w-full">
          {voyage.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={voyage.cover_image_url}
              alt={`${voyage.name} ${labels.coverImageAltSuffix}`}
              className="h-full w-full rounded-t-xl object-cover"
            />
          ) : hasTrack ? (
            <div className="h-full w-full rounded-t-xl overflow-hidden">
              <MiniMapLoader tracks={tracks} />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-t-xl border-2 border-dashed border-mist/40">
              <span className="text-small text-mist">{labels.emptyPrompt}</span>
            </div>
          )}
        </div>

        <CardHeader>
          <CardTitle className="font-heading text-h3 text-navy">
            {voyage.name}
          </CardTitle>
          <CardAction>
            {voyage.is_public ? (
              <span className="rounded-full bg-ocean/10 px-2 py-0.5 text-tiny font-semibold text-ocean">
                {labels.publicBadge}
              </span>
            ) : (
              <span className="rounded-full bg-navy/5 px-2 py-0.5 text-tiny font-semibold text-mist">
                {labels.privateBadge}
              </span>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          {hasTrack ? (
            <p className="text-small text-slate">
              {formatDistanceNm(totalDistance)} · {legs.length}{" "}
              {legLabel} · {stopoverCount} {portLabel}
            </p>
          ) : (
            <p className="mt-2 text-tiny text-mist">
              {formatDate(voyage.created_at)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
