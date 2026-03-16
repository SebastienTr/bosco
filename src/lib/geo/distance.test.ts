import { describe, expect, it } from "vitest";
import {
  haversineDistanceNm,
  speedKts,
  computeTrackStats,
} from "./distance";
import type { GpxTrackPoint } from "@/types/gpx";

describe("haversineDistanceNm", () => {
  it("returns 0 for same point", () => {
    const p = { lat: 43.2965, lon: 5.3698 };
    expect(haversineDistanceNm(p, p)).toBe(0);
  });

  it("calculates Marseille to Toulon correctly (~26 nm)", () => {
    const marseille = { lat: 43.2965, lon: 5.3698 };
    const toulon = { lat: 43.1242, lon: 5.928 };
    const dist = haversineDistanceNm(marseille, toulon);
    expect(dist).toBeGreaterThan(24);
    expect(dist).toBeLessThan(28);
  });

  it("calculates ~60 nm for 1 degree of latitude", () => {
    const p1 = { lat: 43.0, lon: 5.0 };
    const p2 = { lat: 44.0, lon: 5.0 };
    const dist = haversineDistanceNm(p1, p2);
    expect(dist).toBeGreaterThan(59.5);
    expect(dist).toBeLessThan(60.5);
  });
});

describe("speedKts", () => {
  it("returns speed in knots", () => {
    // 10 nm in 1 hour = 10 kts
    expect(speedKts(10, 3600)).toBeCloseTo(10);
  });

  it("returns 0 for zero or negative duration", () => {
    expect(speedKts(10, 0)).toBe(0);
    expect(speedKts(10, -1)).toBe(0);
  });
});

describe("computeTrackStats", () => {
  it("returns empty stats for empty input", () => {
    const stats = computeTrackStats([], 0);
    expect(stats.distanceNm).toBe(0);
    expect(stats.durationSeconds).toBeNull();
    expect(stats.avgSpeedKts).toBeNull();
    expect(stats.maxSpeedKts).toBeNull();
    expect(stats.pointCount).toBe(0);
  });

  it("computes distance and speed for timed points", () => {
    const points: GpxTrackPoint[] = [
      { lat: 43.2965, lon: 5.3698, ele: null, time: "2026-03-10T08:00:00Z" },
      { lat: 43.1242, lon: 5.928, ele: null, time: "2026-03-10T12:00:00Z" },
    ];
    const stats = computeTrackStats(points, 100);
    expect(stats.distanceNm).toBeGreaterThan(24);
    expect(stats.distanceNm).toBeLessThan(28);
    expect(stats.durationSeconds).toBe(4 * 3600);
    expect(stats.avgSpeedKts).toBeGreaterThan(5);
    expect(stats.avgSpeedKts).toBeLessThan(8);
    expect(stats.pointCount).toBe(2);
    expect(stats.originalPointCount).toBe(100);
    expect(stats.startTime).toBe("2026-03-10T08:00:00Z");
    expect(stats.endTime).toBe("2026-03-10T12:00:00Z");
  });

  it("handles points without timestamps", () => {
    const points: GpxTrackPoint[] = [
      { lat: 43.2965, lon: 5.3698, ele: null, time: null },
      { lat: 43.1242, lon: 5.928, ele: null, time: null },
    ];
    const stats = computeTrackStats(points, 2);
    expect(stats.distanceNm).toBeGreaterThan(24);
    expect(stats.durationSeconds).toBeNull();
    expect(stats.avgSpeedKts).toBeNull();
    expect(stats.maxSpeedKts).toBeNull();
  });

  it("filters GPS glitch speeds above 50 kts", () => {
    const points: GpxTrackPoint[] = [
      { lat: 43.0, lon: 5.0, ele: null, time: "2026-03-10T08:00:00Z" },
      // Teleport ~60nm in 1 second = ~216000 kts → filtered out
      { lat: 44.0, lon: 5.0, ele: null, time: "2026-03-10T08:00:01Z" },
    ];
    const stats = computeTrackStats(points, 2);
    expect(stats.maxSpeedKts).toBeNull(); // Filtered out as GPS glitch
  });
});
