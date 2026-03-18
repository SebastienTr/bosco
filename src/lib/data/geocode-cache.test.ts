import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCachedGeocode, upsertGeocode } from "./geocode-cache";

const mockSingle = vi.fn();
const mockEq2 = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockUpsert = vi.fn();
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
    select: mockSelect,
    upsert: mockUpsert,
  });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ eq: mockEq2 });
  mockEq2.mockReturnValue({ single: mockSingle });
  mockUpsert.mockResolvedValue({ data: null, error: null });
});

describe("getCachedGeocode", () => {
  it("should return null for missing entries", async () => {
    mockSingle.mockReturnValue({ data: null, error: { code: "PGRST116" } });

    const result = await getCachedGeocode("43.300", "5.400");

    expect(mockFrom).toHaveBeenCalledWith("geocode_cache");
    expect(result).toBeNull();
  });

  it("should return cached name, country, and country_code on hit", async () => {
    mockSingle.mockReturnValue({
      data: { name: "Marseille", country: "France", country_code: "fr" },
      error: null,
    });

    const result = await getCachedGeocode("43.300", "5.400");

    expect(result).toEqual({ name: "Marseille", country: "France", country_code: "fr" });
  });

  it("should handle null country_code in cached data", async () => {
    mockSingle.mockReturnValue({
      data: { name: "Marseille", country: "France", country_code: null },
      error: null,
    });

    const result = await getCachedGeocode("43.300", "5.400");

    expect(result).toEqual({ name: "Marseille", country: "France", country_code: null });
  });
});

describe("upsertGeocode", () => {
  it("should upsert into geocode_cache with country_code", async () => {
    await upsertGeocode("43.300", "5.400", "Marseille", "France", "fr");

    expect(mockFrom).toHaveBeenCalledWith("geocode_cache");
    expect(mockUpsert).toHaveBeenCalledWith({
      lat_key: "43.300",
      lon_key: "5.400",
      name: "Marseille",
      country: "France",
      country_code: "fr",
    });
  });

  it("should handle null country and country_code", async () => {
    await upsertGeocode("43.300", "5.400", "Marseille", null, null);

    expect(mockUpsert).toHaveBeenCalledWith({
      lat_key: "43.300",
      lon_key: "5.400",
      name: "Marseille",
      country: null,
      country_code: null,
    });
  });
});

describe("getCachedGeocode + upsertGeocode round-trip", () => {
  it("should return the upserted value on subsequent get", async () => {
    // First call: upsert
    await upsertGeocode("43.300", "5.400", "Toulon", "France", "fr");
    expect(mockUpsert).toHaveBeenCalled();

    // Second call: get (simulate DB returning the value)
    mockSingle.mockReturnValue({
      data: { name: "Toulon", country: "France", country_code: "fr" },
      error: null,
    });

    const result = await getCachedGeocode("43.300", "5.400");
    expect(result).toEqual({ name: "Toulon", country: "France", country_code: "fr" });
  });
});
