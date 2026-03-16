import { describe, expect, it } from "vitest";
import type { ProcessingResult, TrackStats } from "@/types/gpx";
import { mergeTracksToSingleLeg, statsToLegData } from "./import";

function createStats(overrides: Partial<TrackStats> = {}): TrackStats {
  return {
    name: null,
    distanceNm: 0,
    durationSeconds: null,
    avgSpeedKts: null,
    maxSpeedKts: null,
    startTime: null,
    endTime: null,
    pointCount: 0,
    originalPointCount: 0,
    ...overrides,
  };
}

describe("statsToLegData", () => {
  it("preserves zero speeds instead of coercing them to null", () => {
    const track: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [5.4, 43.3],
        [5.5, 43.4],
      ],
    };

    const leg = statsToLegData(
      track,
      createStats({
        avgSpeedKts: 0,
        maxSpeedKts: 0,
      }),
    );

    expect(leg.avg_speed_kts).toBe(0);
    expect(leg.max_speed_kts).toBe(0);
  });
});

describe("mergeTracksToSingleLeg", () => {
  it("keeps track order, names independent, and preserves zero-duration imports", () => {
    const result: ProcessingResult = {
      tracks: [
        {
          type: "LineString",
          coordinates: [
            [5.4, 43.3],
            [5.5, 43.4],
          ],
        },
        {
          type: "LineString",
          coordinates: [
            [5.5, 43.4],
            [5.6, 43.5],
          ],
        },
      ],
      stopovers: [],
      stats: [
        createStats({
          name: "Day 1",
          distanceNm: 0,
          durationSeconds: 0,
          avgSpeedKts: 0,
          maxSpeedKts: 0,
          startTime: "2026-03-10T08:00:00Z",
          endTime: "2026-03-10T08:00:00Z",
        }),
        createStats({
          name: "Day 2",
          distanceNm: 12.34,
          durationSeconds: 3600,
          avgSpeedKts: 12.34,
          maxSpeedKts: 18.9,
          startTime: "2026-03-10T09:00:00Z",
          endTime: "2026-03-10T10:00:00Z",
        }),
      ],
    };

    const leg = mergeTracksToSingleLeg([0, 1], result);

    expect(leg.track_geojson.coordinates).toEqual([
      [5.4, 43.3],
      [5.5, 43.4],
      [5.5, 43.4],
      [5.6, 43.5],
    ]);
    expect(leg.distance_nm).toBe(12.34);
    expect(leg.duration_seconds).toBe(7200);
    expect(leg.avg_speed_kts).toBe(6.17);
    expect(leg.max_speed_kts).toBe(18.9);
  });
});
