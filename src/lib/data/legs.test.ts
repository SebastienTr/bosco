import { describe, it, expect, vi, beforeEach } from "vitest";
import { insertLegs, getLegsByVoyageId } from "./legs";

// Mock supabase server client
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    }),
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockFrom.mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
  });
  mockInsert.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({
    eq: mockEq,
    order: mockOrder,
  });
  mockEq.mockReturnValue({
    order: mockOrder,
  });
});

describe("insertLegs", () => {
  it("should batch insert legs and return them", async () => {
    const legs = [
      { id: "l-1", voyage_id: "v-1", track_geojson: { type: "LineString", coordinates: [] } },
      { id: "l-2", voyage_id: "v-1", track_geojson: { type: "LineString", coordinates: [] } },
    ];
    mockSelect.mockReturnValue({ data: legs, error: null });

    const result = await insertLegs([
      {
        voyage_id: "v-1",
        track_geojson: { type: "LineString", coordinates: [] },
        distance_nm: 10,
        duration_seconds: 3600,
        avg_speed_kts: 5,
        max_speed_kts: 8,
        started_at: "2026-03-15T10:00:00Z",
        ended_at: "2026-03-15T11:00:00Z",
      },
      {
        voyage_id: "v-1",
        track_geojson: { type: "LineString", coordinates: [] },
        distance_nm: 20,
        duration_seconds: 7200,
        avg_speed_kts: 5.5,
        max_speed_kts: 9,
        started_at: "2026-03-15T12:00:00Z",
        ended_at: "2026-03-15T14:00:00Z",
      },
    ]);

    expect(mockFrom).toHaveBeenCalledWith("legs");
    expect(result.data).toEqual(legs);
    expect(result.error).toBeNull();
  });

  it("should return error on insert failure", async () => {
    mockSelect.mockReturnValue({
      data: null,
      error: { message: "Insert failed" },
    });

    const result = await insertLegs([
      {
        voyage_id: "v-1",
        track_geojson: { type: "LineString", coordinates: [] },
      },
    ]);

    expect(result.error).toBeTruthy();
  });
});

describe("getLegsByVoyageId", () => {
  it("should fetch legs ordered by started_at", async () => {
    const legs = [
      { id: "l-1", started_at: "2026-03-15T10:00:00Z" },
      { id: "l-2", started_at: "2026-03-15T12:00:00Z" },
    ];
    mockOrder.mockReturnValue({ data: legs, error: null });

    const result = await getLegsByVoyageId("v-1");

    expect(mockFrom).toHaveBeenCalledWith("legs");
    expect(mockEq).toHaveBeenCalledWith("voyage_id", "v-1");
    expect(result.data).toEqual(legs);
  });

  it("should return empty array when no legs exist", async () => {
    mockOrder.mockReturnValue({ data: [], error: null });

    const result = await getLegsByVoyageId("v-1");

    expect(result.data).toEqual([]);
    expect(result.error).toBeNull();
  });
});
