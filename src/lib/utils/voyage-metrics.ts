interface VoyageMetricLeg {
  distance_nm: number | null;
  started_at?: string | null;
  ended_at?: string | null;
}

interface VoyageMetricStopover {
  country: string | null;
}

export interface VoyageMetrics {
  totalDistanceNm: number;
  days: number;
  portsCount: number;
  countriesCount: number;
  firstDate: string | null;
  lastDate: string | null;
}

function getLegSortTimestamp(leg: VoyageMetricLeg) {
  return leg.started_at ?? leg.ended_at;
}

export function getVoyageMetrics(
  legs: VoyageMetricLeg[] = [],
  stopovers: VoyageMetricStopover[] = [],
): VoyageMetrics {
  const totalDistanceNm = legs.reduce(
    (sum, leg) => sum + (leg.distance_nm ?? 0),
    0,
  );

  const sortedLegs = legs
    .filter((leg) => leg.started_at || leg.ended_at)
    .sort(
      (a, b) =>
        new Date(getLegSortTimestamp(a)!).getTime() -
        new Date(getLegSortTimestamp(b)!).getTime(),
    );

  const firstLeg = sortedLegs[0];
  const lastLeg = sortedLegs[sortedLegs.length - 1];
  const firstDate = firstLeg?.started_at ?? firstLeg?.ended_at ?? null;
  const lastDate = lastLeg?.ended_at ?? lastLeg?.started_at ?? null;
  const days =
    firstDate && lastDate
      ? Math.ceil(
          (new Date(lastDate).getTime() - new Date(firstDate).getTime()) /
            86400000,
        )
      : 0;

  const countriesCount = new Set(
    stopovers
      .map((stopover) => stopover.country)
      .filter((country): country is string => Boolean(country)),
  ).size;

  return {
    totalDistanceNm,
    days,
    portsCount: stopovers.length,
    countriesCount,
    firstDate,
    lastDate,
  };
}
