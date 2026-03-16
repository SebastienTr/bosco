import { describe, expect, it } from "vitest";
import { simplifyTrack, DEFAULT_EPSILON } from "./simplify";
import type { GpxTrackPoint } from "@/types/gpx";

function point(lat: number, lon: number): GpxTrackPoint {
  return { lat, lon, ele: null, time: null };
}

describe("simplifyTrack", () => {
  it("returns empty array for empty input", () => {
    expect(simplifyTrack([])).toEqual([]);
  });

  it("returns copy for 1 or 2 points", () => {
    const one = [point(43.0, 5.0)];
    const result = simplifyTrack(one);
    expect(result).toHaveLength(1);
    expect(result).not.toBe(one); // Different reference
  });

  it("removes collinear points on a straight line", () => {
    // Points along a straight north-south line
    const points = [
      point(43.0, 5.0),
      point(43.001, 5.0),
      point(43.002, 5.0),
      point(43.003, 5.0),
      point(43.004, 5.0),
      point(43.005, 5.0),
    ];
    const result = simplifyTrack(points);
    // Should keep only first and last
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(points[0]);
    expect(result[1]).toEqual(points[5]);
  });

  it("preserves zigzag (tack) pattern", () => {
    // Zigzag pattern simulating sailing tacks
    const points = [
      point(43.0, 5.0),
      point(43.005, 5.01), // Tack right
      point(43.01, 5.0), // Tack left
      point(43.015, 5.01), // Tack right
      point(43.02, 5.0), // Tack left
    ];
    const result = simplifyTrack(points, DEFAULT_EPSILON);
    // All points should be preserved (zigzag deviation > epsilon)
    expect(result).toHaveLength(5);
  });

  it("handles large input without stack overflow (iterative)", () => {
    // Generate 1000 collinear points
    const points: GpxTrackPoint[] = [];
    for (let i = 0; i < 1000; i++) {
      points.push(point(43.0 + i * 0.0001, 5.0));
    }
    const result = simplifyTrack(points);
    // Should reduce significantly (all collinear)
    expect(result).toHaveLength(2);
  });

  it("respects custom epsilon", () => {
    const points = [
      point(43.0, 5.0),
      point(43.001, 5.0005), // Small deviation
      point(43.002, 5.0),
    ];
    // Large epsilon → remove middle point
    const loose = simplifyTrack(points, 1);
    expect(loose).toHaveLength(2);

    // Tiny epsilon → keep middle point
    const tight = simplifyTrack(points, 0.000001);
    expect(tight).toHaveLength(3);
  });

  it("returns 2 points when only start and end matter", () => {
    const result = simplifyTrack([point(43.0, 5.0), point(44.0, 6.0)]);
    expect(result).toHaveLength(2);
  });
});
