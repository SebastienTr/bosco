import { describe, expect, it } from "vitest";
import {
  getLastKnownVoyagePosition,
  toVoyageRouteTracks,
} from "./voyage-route";

describe("toVoyageRouteTracks", () => {
  it("keeps valid untimed legs instead of dropping them", () => {
    const tracks = toVoyageRouteTracks([
      {
        id: "leg-1",
        track_geojson: {
          type: "LineString",
          coordinates: [
            [5.4, 43.3],
            [5.5, 43.4],
          ],
        },
        started_at: null,
        ended_at: null,
      },
    ]);

    expect(tracks).toHaveLength(1);
    expect(tracks[0]?.coordinates).toEqual([
      [5.4, 43.3],
      [5.5, 43.4],
    ]);
  });

  it("orders dated legs before undated legs while preserving undated order", () => {
    const tracks = toVoyageRouteTracks([
      {
        id: "leg-untimed-1",
        track_geojson: {
          type: "LineString",
          coordinates: [[5.4, 43.3]],
        },
        started_at: null,
        ended_at: null,
      },
      {
        id: "leg-dated",
        track_geojson: {
          type: "LineString",
          coordinates: [[6.0, 43.5]],
        },
        started_at: "2026-03-15T10:00:00Z",
        ended_at: "2026-03-15T11:00:00Z",
      },
      {
        id: "leg-untimed-2",
        track_geojson: {
          type: "LineString",
          coordinates: [[7.0, 43.7]],
        },
        started_at: null,
        ended_at: null,
      },
    ]);

    expect(tracks.map((track) => track.id)).toEqual([
      "leg-dated",
      "leg-untimed-1",
      "leg-untimed-2",
    ]);
  });
});

describe("getLastKnownVoyagePosition", () => {
  it("returns the last coordinate of the last ordered track", () => {
    const position = getLastKnownVoyagePosition([
      {
        id: "leg-1",
        coordinates: [
          [5.4, 43.3],
          [5.5, 43.4],
        ],
        started_at: "2026-03-15T10:00:00Z",
        ended_at: "2026-03-15T11:00:00Z",
      },
      {
        id: "leg-2",
        coordinates: [
          [6.1, 43.6],
          [6.2, 43.7],
        ],
        started_at: null,
        ended_at: null,
      },
    ]);

    expect(position).toEqual([6.2, 43.7]);
  });
});
