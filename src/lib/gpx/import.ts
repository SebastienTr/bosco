import type { ProcessingResult, TrackStats } from "@/types/gpx";

export interface ImportLegData {
  track_geojson: GeoJSON.LineString;
  distance_nm: number | null;
  duration_seconds: number | null;
  avg_speed_kts: number | null;
  max_speed_kts: number | null;
  started_at: string | null;
  ended_at: string | null;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function mergeTracksToSingleLeg(
  selectedIndices: number[],
  result: ProcessingResult,
): ImportLegData {
  const selectedTracks = selectedIndices.map((index) => result.tracks[index]);
  const selectedStats = selectedIndices.map((index) => result.stats[index]);
  const maxSpeeds = selectedStats
    .map((stats) => stats.maxSpeedKts)
    .filter((speed): speed is number => speed !== null);

  const mergedCoordinates = selectedTracks.flatMap((track) => track.coordinates);
  const mergedGeojson: GeoJSON.LineString = {
    type: "LineString",
    coordinates: mergedCoordinates,
  };

  const totalDistance = selectedStats.reduce((sum, stats) => sum + stats.distanceNm, 0);
  const startTimes = selectedStats
    .map((stats) => stats.startTime)
    .filter((time): time is string => time !== null)
    .sort();
  const endTimes = selectedStats
    .map((stats) => stats.endTime)
    .filter((time): time is string => time !== null)
    .sort();

  const earliestStart = startTimes[0] ?? null;
  const latestEnd = endTimes.at(-1) ?? null;

  let durationSeconds: number | null = null;
  if (earliestStart !== null && latestEnd !== null) {
    durationSeconds =
      (new Date(latestEnd).getTime() - new Date(earliestStart).getTime()) / 1000;
  }

  return {
    track_geojson: mergedGeojson,
    distance_nm: roundToTwoDecimals(totalDistance),
    duration_seconds:
      durationSeconds === null ? null : Math.round(durationSeconds),
    avg_speed_kts:
      durationSeconds !== null && durationSeconds > 0
        ? roundToTwoDecimals(totalDistance / (durationSeconds / 3600))
        : null,
    max_speed_kts:
      maxSpeeds.length > 0 ? roundToTwoDecimals(Math.max(...maxSpeeds)) : null,
    started_at: earliestStart,
    ended_at: latestEnd,
  };
}

export function statsToLegData(
  track: GeoJSON.LineString,
  stats: TrackStats,
): ImportLegData {
  return {
    track_geojson: track,
    distance_nm: roundToTwoDecimals(stats.distanceNm),
    duration_seconds:
      stats.durationSeconds !== null ? Math.round(stats.durationSeconds) : null,
    avg_speed_kts:
      stats.avgSpeedKts !== null ? roundToTwoDecimals(stats.avgSpeedKts) : null,
    max_speed_kts:
      stats.maxSpeedKts !== null ? roundToTwoDecimals(stats.maxSpeedKts) : null,
    started_at: stats.startTime,
    ended_at: stats.endTime,
  };
}
