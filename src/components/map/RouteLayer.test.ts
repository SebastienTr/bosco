import { describe, expect, it } from "vitest";
import { toLatLngs } from "./RouteLayer";

describe("toLatLngs", () => {
  it("converts GeoJSON [lng, lat] to Leaflet [lat, lng]", () => {
    const geojson: GeoJSON.Position[] = [
      [5.4, 43.3],
      [5.5, 43.4],
    ];
    const result = toLatLngs(geojson);
    expect(result).toEqual([
      [43.3, 5.4],
      [43.4, 5.5],
    ]);
  });

  it("handles empty coordinates array", () => {
    const result = toLatLngs([]);
    expect(result).toEqual([]);
  });

  it("handles single coordinate", () => {
    const result = toLatLngs([[2.3522, 48.8566]]);
    expect(result).toEqual([[48.8566, 2.3522]]);
  });

  it("preserves coordinate precision", () => {
    const result = toLatLngs([[18.0685808, 59.3293235]]);
    expect(result).toEqual([[59.3293235, 18.0685808]]);
  });

  it("handles negative coordinates (western hemisphere)", () => {
    const result = toLatLngs([[-73.9857, 40.7484]]);
    expect(result).toEqual([[40.7484, -73.9857]]);
  });

  it("converts a full track with multiple points", () => {
    const track: GeoJSON.Position[] = [
      [5.3698, 43.2965], // Marseille
      [6.6347, 43.2769], // Toulon area
      [7.0128, 43.5519], // Nice area
      [7.4246, 43.7384], // Monaco
    ];
    const result = toLatLngs(track);
    expect(result).toHaveLength(4);
    // Verify first and last points
    expect(result[0]).toEqual([43.2965, 5.3698]);
    expect(result[3]).toEqual([43.7384, 7.4246]);
  });
});
