import type { GpxTrackPoint, StopoverCandidate } from "@/types/gpx";
import { haversineDistanceNm } from "./distance";

const DEFAULT_MERGE_RADIUS_NM = 2.7; // ~5 km in nautical miles

/** Detect stopover candidates from track start/end points */
export function detectStopovers(
  tracks: { points: GpxTrackPoint[] }[],
  mergeRadiusNm: number = DEFAULT_MERGE_RADIUS_NM
): StopoverCandidate[] {
  // Collect all endpoints
  const endpoints: {
    point: GpxTrackPoint;
    trackIndex: number;
    isStart: boolean;
  }[] = [];

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    if (track.points.length === 0) continue;
    endpoints.push({ point: track.points[0], trackIndex: i, isStart: true });
    endpoints.push({
      point: track.points[track.points.length - 1],
      trackIndex: i,
      isStart: false,
    });
  }

  // Merge nearby endpoints into stopover candidates
  const candidates: StopoverCandidate[] = [];
  const used = new Set<number>();

  for (let i = 0; i < endpoints.length; i++) {
    if (used.has(i)) continue;

    const cluster = [endpoints[i]];
    used.add(i);

    for (let j = i + 1; j < endpoints.length; j++) {
      if (used.has(j)) continue;
      const dist = haversineDistanceNm(endpoints[i].point, endpoints[j].point);
      if (dist <= mergeRadiusNm) {
        cluster.push(endpoints[j]);
        used.add(j);
      }
    }

    const avgLon =
      cluster.reduce((s, e) => s + e.point.lon, 0) / cluster.length;
    const avgLat =
      cluster.reduce((s, e) => s + e.point.lat, 0) / cluster.length;
    const trackIndices = [...new Set(cluster.map((e) => e.trackIndex))];

    // Determine type based on position in track set
    const allStarts = cluster.every((e) => e.isStart);
    const allEnds = cluster.every((e) => !e.isStart);
    const type: StopoverCandidate["type"] =
      allStarts && trackIndices.includes(0)
        ? "departure"
        : allEnds && trackIndices.includes(tracks.length - 1)
          ? "arrival"
          : "waypoint";

    candidates.push({
      position: [avgLon, avgLat], // GeoJSON [lng, lat] order
      trackIndices,
      type,
    });
  }

  return candidates;
}
