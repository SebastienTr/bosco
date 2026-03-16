import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  insertStopovers,
  getStopoversByVoyageId,
  updateStopover,
  deleteStopover,
} from "./stopovers";

const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockSingle = vi.fn();
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
    update: mockUpdate,
    delete: mockDelete,
  });
  mockInsert.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({
    eq: mockEq,
    order: mockOrder,
  });
  mockEq.mockReturnValue({
    order: mockOrder,
    select: mockSelect,
  });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });
});

describe("insertStopovers", () => {
  it("should batch insert stopovers and return them", async () => {
    const stopovers = [
      { id: "s-1", voyage_id: "v-1", name: "Port A", latitude: 43.3, longitude: 5.4 },
    ];
    mockSelect.mockReturnValue({ data: stopovers, error: null });

    const result = await insertStopovers([
      {
        voyage_id: "v-1",
        name: "Port A",
        country: "France",
        latitude: 43.3,
        longitude: 5.4,
        arrived_at: "2026-03-15T10:00:00Z",
        departed_at: null,
      },
    ]);

    expect(mockFrom).toHaveBeenCalledWith("stopovers");
    expect(result.data).toEqual(stopovers);
    expect(result.error).toBeNull();
  });

  it("should return error on insert failure", async () => {
    mockSelect.mockReturnValue({
      data: null,
      error: { message: "Insert failed" },
    });

    const result = await insertStopovers([
      { voyage_id: "v-1", name: "", latitude: 43.3, longitude: 5.4 },
    ]);

    expect(result.error).toBeTruthy();
  });
});

describe("getStopoversByVoyageId", () => {
  it("should fetch stopovers ordered by arrived_at", async () => {
    const stopovers = [
      { id: "s-1", arrived_at: "2026-03-15T10:00:00Z" },
      { id: "s-2", arrived_at: "2026-03-15T14:00:00Z" },
    ];
    mockOrder.mockReturnValue({ data: stopovers, error: null });

    const result = await getStopoversByVoyageId("v-1");

    expect(mockFrom).toHaveBeenCalledWith("stopovers");
    expect(mockEq).toHaveBeenCalledWith("voyage_id", "v-1");
    expect(result.data).toEqual(stopovers);
  });
});

describe("updateStopover", () => {
  it("should update a stopover and return it", async () => {
    const updated = { id: "s-1", name: "New Name" };
    mockSelect.mockReturnValue({ single: mockSingle });
    mockSingle.mockReturnValue({ data: updated, error: null });

    const result = await updateStopover("s-1", { name: "New Name" });

    expect(mockFrom).toHaveBeenCalledWith("stopovers");
    expect(result.data).toEqual(updated);
  });
});

describe("deleteStopover", () => {
  it("should delete a stopover", async () => {
    mockEq.mockReturnValue({ data: null, error: null });

    const result = await deleteStopover("s-1");

    expect(mockFrom).toHaveBeenCalledWith("stopovers");
    expect(result.error).toBeNull();
  });
});
