import { describe, expect, it } from "vitest";
import { geojsonToSvgPaths } from "./geojson-to-svg";

function parsePathCoordinates(path: string) {
  return path
    .split(/[ML]\s+/)
    .filter(Boolean)
    .map((pair) => {
      const [x, y] = pair.trim().split(" ").map(Number);
      return { x, y };
    });
}

describe("geojsonToSvgPaths", () => {
  it("returns empty paths for empty legs array", () => {
    const result = geojsonToSvgPaths([]);
    expect(result.paths).toEqual([]);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(630);
    expect(result.viewBox).toBe("0 0 1200 630");
  });

  it("returns empty paths when legs have null track_geojson", () => {
    const result = geojsonToSvgPaths([
      { track_geojson: null },
      { track_geojson: undefined },
    ]);
    expect(result.paths).toEqual([]);
  });

  it("converts a single leg LineString to a valid SVG path", () => {
    const leg = {
      track_geojson: {
        type: "LineString",
        coordinates: [
          [2.0, 43.0],
          [3.0, 43.5],
          [4.0, 44.0],
        ],
      },
    };
    const result = geojsonToSvgPaths([leg]);

    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]).toMatch(/^M [\d.]+ [\d.]+ L [\d.]+ [\d.]+ L [\d.]+ [\d.]+$/);
  });

  it("converts a single leg Feature wrapper to a valid SVG path", () => {
    const leg = {
      track_geojson: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [2.0, 43.0],
            [3.0, 43.5],
          ],
        },
        properties: {},
      },
    };
    const result = geojsonToSvgPaths([leg]);

    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]).toMatch(/^M [\d.]+ [\d.]+ L [\d.]+ [\d.]+$/);
  });

  it("handles multiple legs producing multiple path strings", () => {
    const legs = [
      {
        track_geojson: {
          type: "LineString",
          coordinates: [
            [2.0, 43.0],
            [3.0, 43.5],
          ],
        },
      },
      {
        track_geojson: {
          type: "LineString",
          coordinates: [
            [5.0, 44.0],
            [6.0, 44.5],
          ],
        },
      },
    ];
    const result = geojsonToSvgPaths(legs);

    expect(result.paths).toHaveLength(2);
    result.paths.forEach((path) => {
      expect(path).toMatch(/^M /);
    });
  });

  it("handles single point leg gracefully without crashing", () => {
    const leg = {
      track_geojson: {
        type: "LineString",
        coordinates: [[3.0, 43.0]],
      },
    };
    const result = geojsonToSvgPaths([leg]);

    // Should still produce a path (M ... L ... for single point)
    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]).toContain("M ");
  });

  it("applies padding correctly — points stay within padded bounds", () => {
    const padding = 60;
    const width = 1200;
    const height = 630;
    const leg = {
      track_geojson: {
        type: "LineString",
        coordinates: [
          [0.0, 40.0],
          [10.0, 45.0],
        ],
      },
    };
    const result = geojsonToSvgPaths([leg], width, height, padding);

    const coords = parsePathCoordinates(result.paths[0]!);

    coords.forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(padding);
      expect(x).toBeLessThanOrEqual(width - padding);
      expect(y).toBeGreaterThanOrEqual(padding);
      expect(y).toBeLessThanOrEqual(height - padding);
    });
  });

  it("produces correct relative positions for Mercator projection", () => {
    // Two points: same longitude, different latitudes
    // Northern point should have smaller SVG y (higher on screen)
    const leg = {
      track_geojson: {
        type: "LineString",
        coordinates: [
          [5.0, 40.0], // Southern
          [5.0, 50.0], // Northern
        ],
      },
    };
    const result = geojsonToSvgPaths([leg]);

    const coords = parsePathCoordinates(result.paths[0]!);

    // Southern point should have larger y (lower on screen in SVG)
    expect(coords[0].y).toBeGreaterThan(coords[1].y);
    // Same longitude means same x
    expect(coords[0].x).toBe(coords[1].x);
  });

  it("skips legs with empty track_geojson gracefully among valid legs", () => {
    const legs = [
      { track_geojson: null },
      {
        track_geojson: {
          type: "LineString",
          coordinates: [
            [2.0, 43.0],
            [3.0, 44.0],
          ],
        },
      },
      { track_geojson: { type: "Point", coordinates: [5.0, 45.0] } }, // unsupported type
    ];
    const result = geojsonToSvgPaths(legs);

    expect(result.paths).toHaveLength(1);
  });

  it("uses custom target dimensions when provided", () => {
    const leg = {
      track_geojson: {
        type: "LineString",
        coordinates: [
          [2.0, 43.0],
          [3.0, 44.0],
        ],
      },
    };
    const result = geojsonToSvgPaths([leg], 800, 400, 20);

    expect(result.width).toBe(800);
    expect(result.height).toBe(400);
    expect(result.viewBox).toBe("0 0 800 400");
  });

  it("keeps dateline-crossing routes continuous instead of wrapping across the image", () => {
    const leg = {
      track_geojson: {
        type: "LineString",
        coordinates: [
          [179.0, 10.0],
          [-179.0, 10.5],
          [-178.0, 11.0],
        ],
      },
    };

    const result = geojsonToSvgPaths([leg]);
    const coords = parsePathCoordinates(result.paths[0]!);

    expect(coords).toHaveLength(3);
    expect(coords[0]!.x).toBeLessThan(coords[1]!.x);
    expect(coords[1]!.x).toBeLessThan(coords[2]!.x);
  });

  it("skips malformed coordinates instead of emitting invalid SVG values", () => {
    const legs = [
      {
        track_geojson: {
          type: "LineString",
          coordinates: [
            [2.0, 43.0],
            ["oops", 44.0],
            [3.0, 44.5],
            [4.0, 91.0],
          ],
        },
      },
      {
        track_geojson: {
          type: "LineString",
          coordinates: "not-an-array",
        },
      },
    ];

    const result = geojsonToSvgPaths(legs);

    expect(result.paths).toHaveLength(1);
    const coords = parsePathCoordinates(result.paths[0]!);
    expect(coords).toEqual([
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    ]);
    coords.forEach(({ x, y }) => {
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
    });
  });

  it("all paths from multiple legs stay within bounds", () => {
    const padding = 60;
    const width = 1200;
    const height = 630;
    const legs = [
      {
        track_geojson: {
          type: "LineString",
          coordinates: [
            [-5.0, 35.0],
            [0.0, 40.0],
          ],
        },
      },
      {
        track_geojson: {
          type: "LineString",
          coordinates: [
            [10.0, 42.0],
            [15.0, 45.0],
          ],
        },
      },
    ];
    const result = geojsonToSvgPaths(legs, width, height, padding);

    result.paths.forEach((path) => {
      const coords = parsePathCoordinates(path);

      coords.forEach(({ x, y }) => {
        expect(x).toBeGreaterThanOrEqual(padding - 1); // allow rounding
        expect(x).toBeLessThanOrEqual(width - padding + 1);
        expect(y).toBeGreaterThanOrEqual(padding - 1);
        expect(y).toBeLessThanOrEqual(height - padding + 1);
      });
    });
  });
});
