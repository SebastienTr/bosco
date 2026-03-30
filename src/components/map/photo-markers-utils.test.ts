import { describe, it, expect } from "vitest";
import { buildPhotoMarkers } from "./photo-markers-utils";
import type { LogEntry } from "@/lib/data/log-entries";
import type { Stopover } from "@/lib/data/stopovers";
import type { Leg } from "@/lib/data/legs";

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: "entry-1",
    voyage_id: "voyage-1",
    text: "A journal entry",
    entry_date: "2026-03-30",
    photo_urls: [],
    stopover_id: null,
    leg_id: null,
    created_at: "2026-03-30T00:00:00Z",
    updated_at: "2026-03-30T00:00:00Z",
    ...overrides,
  };
}

function makeStopover(overrides: Partial<Stopover> = {}): Stopover {
  return {
    id: "stop-1",
    voyage_id: "voyage-1",
    name: "Porto Cervo",
    country: "Italy",
    country_code: "IT",
    latitude: 41.0831,
    longitude: 9.5285,
    arrived_at: "2026-03-28T10:00:00Z",
    departed_at: "2026-03-29T08:00:00Z",
    created_at: "2026-03-28T10:00:00Z",
    ...overrides,
  };
}

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    id: "leg-1",
    voyage_id: "voyage-1",
    track_geojson: {
      type: "LineString",
      coordinates: [
        [9.0, 41.0],
        [9.5, 41.5],
        [10.0, 42.0],
      ],
    },
    distance_nm: 50,
    duration_seconds: 36000,
    started_at: "2026-03-28T10:00:00Z",
    ended_at: "2026-03-28T20:00:00Z",
    avg_speed_kts: 5.0,
    max_speed_kts: 8.0,
    created_at: "2026-03-28T10:00:00Z",
    ...overrides,
  };
}

describe("buildPhotoMarkers", () => {
  it("returns marker at stopover position for entry with photo + stopover", () => {
    const entries = [
      makeEntry({
        photo_urls: ["https://example.com/photo1.jpg"],
        stopover_id: "stop-1",
      }),
    ];
    const stopovers = [makeStopover()];

    const result = buildPhotoMarkers(entries, stopovers, []);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      photoUrl: "https://example.com/photo1.jpg",
      position: [9.5285, 41.0831],
      label: "Porto Cervo",
      entryId: "entry-1",
    });
  });

  it("returns marker at leg midpoint for entry with photo + leg (no stopover)", () => {
    const entries = [
      makeEntry({
        photo_urls: ["https://example.com/photo2.jpg"],
        leg_id: "leg-1",
      }),
    ];
    const legs = [makeLeg()];

    const result = buildPhotoMarkers(entries, [], legs);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      photoUrl: "https://example.com/photo2.jpg",
      position: [9.5, 41.5], // midpoint of 3-coord linestring
      label: "Leg 1",
      entryId: "entry-1",
    });
  });

  it("uses the leg order to produce distinct leg labels", () => {
    const entries = [
      makeEntry({
        photo_urls: ["https://example.com/photo2.jpg"],
        leg_id: "leg-2",
      }),
    ];
    const legs = [
      makeLeg(),
      makeLeg({
        id: "leg-2",
        track_geojson: {
          type: "LineString",
          coordinates: [
            [10.0, 42.0],
            [10.5, 42.5],
            [11.0, 43.0],
          ],
        },
      }),
    ];

    const result = buildPhotoMarkers(entries, [], legs);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      photoUrl: "https://example.com/photo2.jpg",
      position: [10.5, 42.5],
      label: "Leg 2",
      entryId: "entry-1",
    });
  });

  it("returns no marker for entry with photo but no stopover/leg", () => {
    const entries = [
      makeEntry({
        photo_urls: ["https://example.com/photo3.jpg"],
      }),
    ];

    const result = buildPhotoMarkers(entries, [], []);

    expect(result).toHaveLength(0);
  });

  it("returns no marker for entry without photos", () => {
    const entries = [
      makeEntry({
        stopover_id: "stop-1",
        photo_urls: [],
      }),
    ];
    const stopovers = [makeStopover()];

    const result = buildPhotoMarkers(entries, stopovers, []);

    expect(result).toHaveLength(0);
  });

  it("returns multiple markers for entry with multiple photos", () => {
    const entries = [
      makeEntry({
        photo_urls: [
          "https://example.com/a.jpg",
          "https://example.com/b.jpg",
          "https://example.com/c.jpg",
        ],
        stopover_id: "stop-1",
      }),
    ];
    const stopovers = [makeStopover()];

    const result = buildPhotoMarkers(entries, stopovers, []);

    expect(result).toHaveLength(3);
    expect(result.map((m) => m.photoUrl)).toEqual([
      "https://example.com/a.jpg",
      "https://example.com/b.jpg",
      "https://example.com/c.jpg",
    ]);
    // All at same stopover position
    for (const marker of result) {
      expect(marker.position).toEqual([9.5285, 41.0831]);
    }
  });

  it("returns empty array for empty entries", () => {
    const result = buildPhotoMarkers([], [], []);

    expect(result).toHaveLength(0);
  });

  it("prefers stopover position over leg when both are set", () => {
    const entries = [
      makeEntry({
        photo_urls: ["https://example.com/photo.jpg"],
        stopover_id: "stop-1",
        leg_id: "leg-1",
      }),
    ];
    const stopovers = [makeStopover()];
    const legs = [makeLeg()];

    const result = buildPhotoMarkers(entries, stopovers, legs);

    expect(result).toHaveLength(1);
    // Should use stopover position, not leg midpoint
    expect(result[0].position).toEqual([9.5285, 41.0831]);
    expect(result[0].label).toBe("Porto Cervo");
  });

  it("skips entry when stopover_id references non-existent stopover", () => {
    const entries = [
      makeEntry({
        photo_urls: ["https://example.com/photo.jpg"],
        stopover_id: "non-existent",
      }),
    ];

    const result = buildPhotoMarkers(entries, [], []);

    expect(result).toHaveLength(0);
  });

  it("handles photo_urls that is not an array (null/undefined)", () => {
    const entries = [
      makeEntry({
        photo_urls: null as unknown as LogEntry["photo_urls"],
        stopover_id: "stop-1",
      }),
    ];
    const stopovers = [makeStopover()];

    const result = buildPhotoMarkers(entries, stopovers, []);

    expect(result).toHaveLength(0);
  });

  it("filters out empty strings in photo_urls", () => {
    const entries = [
      makeEntry({
        photo_urls: ["https://example.com/photo.jpg", "", "  "],
        stopover_id: "stop-1",
      }),
    ];
    const stopovers = [makeStopover()];

    const result = buildPhotoMarkers(entries, stopovers, []);

    // Only the first URL is valid (non-empty)
    expect(result).toHaveLength(1);
    expect(result[0].photoUrl).toBe("https://example.com/photo.jpg");
  });
});
