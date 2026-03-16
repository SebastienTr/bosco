import type { GpxTrackPoint } from "@/types/gpx";

export const DEFAULT_EPSILON = 0.0001; // ~11 meters at equator — preserves tacks at zoom 14

export function simplifyTrack(
  points: GpxTrackPoint[],
  epsilon: number = DEFAULT_EPSILON
): GpxTrackPoint[] {
  if (points.length <= 2) return [...points];

  // Boolean mask — true means keep this point
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  // Iterative stack-based Douglas-Peucker
  const stack: [number, number][] = [[0, points.length - 1]];

  while (stack.length > 0) {
    const [start, end] = stack.pop()!;
    let maxDist = 0;
    let maxIndex = start;

    for (let i = start + 1; i < end; i++) {
      const dist = perpendicularDistance(points[i], points[start], points[end]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    if (maxDist > epsilon) {
      keep[maxIndex] = 1;
      if (maxIndex - start > 1) stack.push([start, maxIndex]);
      if (end - maxIndex > 1) stack.push([maxIndex, end]);
    }
  }

  return points.filter((_, i) => keep[i] === 1);
}

/** Perpendicular distance from point to line segment.
 *  Uses equirectangular correction (cosLat) to account for longitude
 *  compression at higher latitudes. */
function perpendicularDistance(
  point: GpxTrackPoint,
  lineStart: GpxTrackPoint,
  lineEnd: GpxTrackPoint
): number {
  const cosLat = Math.cos((lineStart.lat * Math.PI) / 180);

  const px = point.lon * cosLat,
    py = point.lat;
  const ax = lineStart.lon * cosLat,
    ay = lineStart.lat;
  const bx = lineEnd.lon * cosLat,
    by = lineEnd.lat;

  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  }

  // Signed area method for perpendicular distance
  return (
    Math.abs(dy * px - dx * py + bx * ay - by * ax) /
    Math.sqrt(dx * dx + dy * dy)
  );
}
