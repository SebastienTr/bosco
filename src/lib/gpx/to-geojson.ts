import type { GpxTrackPoint } from "@/types/gpx";

/** Convert simplified track points to GeoJSON LineString with [lng, lat] order */
export function toGeoJsonLineString(
  points: GpxTrackPoint[]
): GeoJSON.LineString {
  return {
    type: "LineString",
    coordinates: points.map((p) => [p.lon, p.lat]),
  };
}
