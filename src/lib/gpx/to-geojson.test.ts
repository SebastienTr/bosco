import { describe, expect, it } from "vitest";
import { toGeoJsonLineString } from "./to-geojson";
import type { GpxTrackPoint } from "@/types/gpx";

describe("toGeoJsonLineString", () => {
  it("produces correct [lng, lat] coordinate order", () => {
    const points: GpxTrackPoint[] = [
      { lat: 43.2965, lon: 5.3698, ele: null, time: null },
      { lat: 43.1242, lon: 5.928, ele: null, time: null },
    ];
    const geojson = toGeoJsonLineString(points);
    expect(geojson.coordinates[0]).toEqual([5.3698, 43.2965]); // [lng, lat]
    expect(geojson.coordinates[1]).toEqual([5.928, 43.1242]);
  });

  it("returns type LineString", () => {
    const geojson = toGeoJsonLineString([
      { lat: 43.0, lon: 5.0, ele: null, time: null },
    ]);
    expect(geojson.type).toBe("LineString");
  });

  it("handles empty track", () => {
    const geojson = toGeoJsonLineString([]);
    expect(geojson.type).toBe("LineString");
    expect(geojson.coordinates).toEqual([]);
  });

  it("handles single point", () => {
    const geojson = toGeoJsonLineString([
      { lat: 43.0, lon: 5.0, ele: null, time: null },
    ]);
    expect(geojson.coordinates).toHaveLength(1);
    expect(geojson.coordinates[0]).toEqual([5.0, 43.0]);
  });
});
