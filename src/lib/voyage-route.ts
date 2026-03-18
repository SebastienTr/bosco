import type { Json } from "@/types/supabase";

export interface VoyageRouteLeg {
  id: string;
  track_geojson: Json;
  started_at: string | null;
  ended_at: string | null;
}

export interface VoyageRouteTrack {
  id: string;
  coordinates: GeoJSON.Position[];
  started_at: string | null;
  ended_at: string | null;
}

function getLineStringCoordinates(track: Json): GeoJSON.Position[] | null {
  if (track === null || typeof track !== "object" || Array.isArray(track)) {
    return null;
  }

  if (!("type" in track) || !("coordinates" in track)) {
    return null;
  }

  if (track.type !== "LineString" || !Array.isArray(track.coordinates)) {
    return null;
  }

  return track.coordinates as GeoJSON.Position[];
}

function getLegTimestamp(leg: Pick<VoyageRouteLeg, "started_at" | "ended_at">) {
  return leg.started_at ?? leg.ended_at;
}

export function toVoyageRouteTracks(
  legs: VoyageRouteLeg[],
): VoyageRouteTrack[] {
  return legs
    .map((leg, originalIndex) => {
      const coordinates = getLineStringCoordinates(leg.track_geojson);

      if (!coordinates) {
        return null;
      }

      return {
        id: leg.id,
        coordinates,
        started_at: leg.started_at,
        ended_at: leg.ended_at,
        originalIndex,
      };
    })
    .filter(
      (
        leg,
      ): leg is VoyageRouteTrack & {
        originalIndex: number;
      } => leg !== null && leg.coordinates.length > 0,
    )
    .sort((a, b) => {
      const aTimestamp = getLegTimestamp(a);
      const bTimestamp = getLegTimestamp(b);

      if (aTimestamp && bTimestamp) {
        return (
          new Date(aTimestamp).getTime() - new Date(bTimestamp).getTime()
        );
      }

      if (aTimestamp) return -1;
      if (bTimestamp) return 1;
      return a.originalIndex - b.originalIndex;
    })
    .map((leg) => ({
      id: leg.id,
      coordinates: leg.coordinates,
      started_at: leg.started_at,
      ended_at: leg.ended_at,
    }));
}

export function getLastKnownVoyagePosition(
  tracks: VoyageRouteTrack[],
): [number, number] | null {
  const lastTrack = tracks.at(-1);
  const lastCoordinate = lastTrack?.coordinates.at(-1);

  if (!lastCoordinate) {
    return null;
  }

  return [lastCoordinate[0], lastCoordinate[1]];
}
