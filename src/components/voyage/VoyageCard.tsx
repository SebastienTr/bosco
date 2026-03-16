import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import type { Voyage } from "@/lib/data/voyages";

interface VoyageCardProps {
  voyage: Voyage;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function VoyageCard({ voyage }: VoyageCardProps) {
  return (
    <Link
      href={`/voyage/${voyage.id}`}
      className="block transition-shadow hover:shadow-lg"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-heading text-h3 text-navy">
            {voyage.name}
          </CardTitle>
          <CardAction>
            {voyage.is_public ? (
              <span className="rounded-full bg-ocean/10 px-2 py-0.5 text-tiny font-semibold text-ocean">
                Public
              </span>
            ) : (
              <span className="rounded-full bg-navy/5 px-2 py-0.5 text-tiny font-semibold text-mist">
                Private
              </span>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          {voyage.description ? (
            <p className="line-clamp-2 text-small text-slate">
              {voyage.description}
            </p>
          ) : null}
          <p className="mt-2 text-tiny text-mist">
            {formatDate(voyage.created_at)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
