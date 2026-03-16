import { describe, expect, it } from "vitest";
import { detectStopovers } from "./stopover-detection";
import type { GpxTrackPoint } from "@/types/gpx";

function point(lat: number, lon: number): GpxTrackPoint {
  return { lat, lon, ele: null, time: null };
}

describe("detectStopovers", () => {
  it("returns empty for empty input", () => {
    expect(detectStopovers([])).toEqual([]);
  });

  it("detects departure and arrival for single track", () => {
    const tracks = [
      {
        points: [point(43.2965, 5.3698), point(43.1242, 5.928)],
      },
    ];
    const stopovers = detectStopovers(tracks);
    expect(stopovers).toHaveLength(2);
    const types = stopovers.map((s) => s.type);
    expect(types).toContain("departure");
    expect(types).toContain("arrival");
  });

  it("merges overlapping endpoints within radius", () => {
    // Track 1 ends at Toulon, Track 2 starts at same point
    const tracks = [
      {
        points: [point(43.2965, 5.3698), point(43.1242, 5.928)],
      },
      {
        points: [point(43.1242, 5.928), point(43.5519, 7.0128)],
      },
    ];
    const stopovers = detectStopovers(tracks);
    // Departure from Marseille, waypoint at Toulon (merged), arrival at Nice
    expect(stopovers).toHaveLength(3);
    const waypoint = stopovers.find((s) => s.type === "waypoint");
    expect(waypoint).toBeDefined();
    expect(waypoint!.trackIndices).toContain(0);
    expect(waypoint!.trackIndices).toContain(1);
  });

  it("uses GeoJSON [lng, lat] order for positions", () => {
    const tracks = [
      {
        points: [point(43.0, 5.0), point(44.0, 6.0)],
      },
    ];
    const stopovers = detectStopovers(tracks);
    // First element of position should be longitude
    const departure = stopovers.find((s) => s.type === "departure")!;
    expect(departure.position[0]).toBeCloseTo(5.0); // longitude
    expect(departure.position[1]).toBeCloseTo(43.0); // latitude
  });

  it("keeps distant endpoints separate", () => {
    const tracks = [
      {
        points: [point(43.0, 5.0), point(44.0, 6.0)],
      },
      {
        points: [point(45.0, 7.0), point(46.0, 8.0)],
      },
    ];
    const stopovers = detectStopovers(tracks);
    // All 4 endpoints are far apart → 4 separate stopovers
    expect(stopovers).toHaveLength(4);
  });
});
