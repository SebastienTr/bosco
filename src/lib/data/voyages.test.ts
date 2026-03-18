import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  insertVoyage,
  getVoyagesByUserId,
  getVoyageById,
  getVoyagesWithStats,
  updateVoyage,
  deleteVoyage,
  checkSlugAvailability,
  getPublicVoyageBySlug,
} from "./voyages";

// Mock supabase server client
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockOrder = vi.fn(() => ({ data: [], error: null }));
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
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

  // Default chain setup
  mockFrom.mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
    update: mockUpdate,
    delete: mockDelete,
  });
  mockInsert.mockReturnValue({ select: mockSelect });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });
  mockSelect.mockReturnValue({
    single: mockSingle,
    eq: mockEq,
    order: mockOrder,
  });
  mockEq.mockReturnValue({
    single: mockSingle,
    eq: mockEq,
    order: mockOrder,
    maybeSingle: mockMaybeSingle,
    select: mockSelect,
  });
});

describe("insertVoyage", () => {
  it("should insert a voyage and return it", async () => {
    const voyage = {
      id: "v-1",
      user_id: "u-1",
      name: "Test Voyage",
      slug: "test-voyage",
    };
    mockSingle.mockResolvedValue({ data: voyage, error: null });

    const result = await insertVoyage({
      user_id: "u-1",
      name: "Test Voyage",
      slug: "test-voyage",
    });

    expect(mockFrom).toHaveBeenCalledWith("voyages");
    expect(result.data).toEqual(voyage);
    expect(result.error).toBeNull();
  });

  it("should return error on insert failure", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "Insert failed" },
    });

    const result = await insertVoyage({
      user_id: "u-1",
      name: "Test",
      slug: "test",
    });

    expect(result.error).toBeTruthy();
  });
});

describe("getVoyagesByUserId", () => {
  it("should fetch voyages ordered by updated_at", async () => {
    const voyages = [{ id: "v-1", name: "A" }] as never[];
    mockOrder.mockReturnValue({ data: voyages, error: null });

    const result = await getVoyagesByUserId("u-1");

    expect(mockFrom).toHaveBeenCalledWith("voyages");
    expect(result.data).toEqual(voyages);
  });
});

describe("getVoyageById", () => {
  it("should fetch a single voyage by id", async () => {
    const voyage = { id: "v-1", name: "A" };
    mockSingle.mockResolvedValue({ data: voyage, error: null });

    const result = await getVoyageById("v-1");

    expect(mockFrom).toHaveBeenCalledWith("voyages");
    expect(result.data).toEqual(voyage);
  });
});

describe("getVoyagesWithStats", () => {
  it("should fetch voyages with nested legs and stopovers", async () => {
    const voyages = [
      {
        id: "v-1",
        name: "Voyage A",
        legs: [{ id: "l-1", track_geojson: {}, distance_nm: 10 }],
        stopovers: [{ id: "s-1" }],
      },
    ] as never[];
    mockOrder.mockReturnValue({ data: voyages, error: null });

    const result = await getVoyagesWithStats("u-1");

    expect(mockFrom).toHaveBeenCalledWith("voyages");
    expect(result.data).toEqual(voyages);
  });
});

describe("updateVoyage", () => {
  it("should update a voyage and return the updated record", async () => {
    const updated = { id: "v-1", name: "Updated Name" };
    mockSingle.mockResolvedValue({ data: updated, error: null });

    const result = await updateVoyage("v-1", { name: "Updated Name" });

    expect(mockFrom).toHaveBeenCalledWith("voyages");
    expect(mockUpdate).toHaveBeenCalledWith({ name: "Updated Name" });
    expect(result.data).toEqual(updated);
  });

  it("should return error on update failure", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "Update failed" },
    });

    const result = await updateVoyage("v-1", { name: "Test" });

    expect(result.error).toBeTruthy();
  });
});

describe("deleteVoyage", () => {
  it("should delete a voyage", async () => {
    mockEq.mockReturnValue({ data: null, error: null });

    const result = await deleteVoyage("v-1");

    expect(mockFrom).toHaveBeenCalledWith("voyages");
    expect(result.error).toBeNull();
  });

  it("should return error on delete failure", async () => {
    mockEq.mockReturnValue({
      data: null,
      error: { message: "Delete failed" },
    });

    const result = await deleteVoyage("v-1");

    expect(result.error).toBeTruthy();
  });
});

describe("getPublicVoyageBySlug", () => {
  it("should return voyage with nested profile, legs, and stopovers", async () => {
    const voyage = {
      id: "v-1",
      name: "Mediterranean Cruise",
      slug: "med-cruise",
      is_public: true,
      profiles: { id: "p-1", username: "sailor", boat_name: "Bosco", boat_type: "Catamaran", profile_photo_url: null },
      legs: [{ id: "l-1", track_geojson: {}, distance_nm: 120 }],
      stopovers: [{ id: "s-1", name: "Marseille", country: "France" }],
    };
    mockSingle.mockResolvedValue({ data: voyage, error: null });

    const result = await getPublicVoyageBySlug("sailor", "med-cruise");

    expect(mockFrom).toHaveBeenCalledWith("voyages");
    expect(result.data).toEqual(voyage);
    expect(result.error).toBeNull();
  });

  it("should return error when voyage not found", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });

    const result = await getPublicVoyageBySlug("nobody", "nonexistent");

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it("should return error for private voyage (is_public = false)", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });

    const result = await getPublicVoyageBySlug("sailor", "private-voyage");

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });
});

describe("checkSlugAvailability", () => {
  it("should return true when slug is available", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await checkSlugAvailability("u-1", "new-slug");

    expect(result).toEqual({ data: true, error: null });
  });

  it("should return false when slug is taken", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: "existing" },
      error: null,
    });

    const result = await checkSlugAvailability("u-1", "taken-slug");

    expect(result).toEqual({ data: false, error: null });
  });

  it("should surface database errors", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: "Lookup failed" },
    });

    const result = await checkSlugAvailability("u-1", "taken-slug");

    expect(result).toEqual({
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Lookup failed",
      },
    });
  });
});
