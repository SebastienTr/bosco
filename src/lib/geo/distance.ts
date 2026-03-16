import type { GpxTrackPoint, TrackStats } from "@/types/gpx";

const EARTH_RADIUS_NM = 3440.065; // Earth radius in nautical miles

/** Haversine distance between two points in nautical miles */
export function haversineDistanceNm(
  p1: { lat: number; lon: number },
  p2: { lat: number; lon: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lon - p1.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) *
      Math.cos(toRad(p2.lat)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Speed in knots between two timed points */
export function speedKts(distanceNm: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return distanceNm / (durationSeconds / 3600);
}

/** Compute full stats for a simplified track */
export function computeTrackStats(
  simplifiedPoints: GpxTrackPoint[],
  originalPointCount: number,
  name: string | null = null
): TrackStats {
  if (simplifiedPoints.length === 0) {
    return {
      name,
      distanceNm: 0,
      durationSeconds: null,
      avgSpeedKts: null,
      maxSpeedKts: null,
      startTime: null,
      endTime: null,
      pointCount: 0,
      originalPointCount,
    };
  }

  let totalDistance = 0;
  let maxSegmentSpeed = 0;

  for (let i = 1; i < simplifiedPoints.length; i++) {
    const prev = simplifiedPoints[i - 1];
    const curr = simplifiedPoints[i];
    const segDist = haversineDistanceNm(prev, curr);
    totalDistance += segDist;

    if (prev.time && curr.time) {
      const segDuration =
        (new Date(curr.time).getTime() - new Date(prev.time).getTime()) / 1000;
      if (segDuration > 0) {
        const segSpeed = speedKts(segDist, segDuration);
        // Cap at 50 kts to filter GPS glitches
        if (segSpeed > maxSegmentSpeed && segSpeed < 50) {
          maxSegmentSpeed = segSpeed;
        }
      }
    }
  }

  const startTime = simplifiedPoints[0].time;
  const endTime = simplifiedPoints[simplifiedPoints.length - 1].time;
  let durationSeconds: number | null = null;
  let avgSpeedKts: number | null = null;

  if (startTime && endTime) {
    durationSeconds =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
    if (durationSeconds > 0) {
      avgSpeedKts = speedKts(totalDistance, durationSeconds);
    }
  }

  return {
    name,
    distanceNm: Math.round(totalDistance * 100) / 100,
    durationSeconds,
    avgSpeedKts:
      avgSpeedKts !== null ? Math.round(avgSpeedKts * 100) / 100 : null,
    maxSpeedKts:
      maxSegmentSpeed > 0 ? Math.round(maxSegmentSpeed * 100) / 100 : null,
    startTime,
    endTime,
    pointCount: simplifiedPoints.length,
    originalPointCount,
  };
}
