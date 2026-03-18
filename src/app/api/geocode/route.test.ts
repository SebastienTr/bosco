import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock geocode cache before importing route
vi.mock("@/lib/data/geocode-cache", () => ({
  getCachedGeocode: vi.fn(() => Promise.resolve(null)),
  upsertGeocode: vi.fn(() => Promise.resolve()),
}));

import { GET } from "./route";
import { getCachedGeocode } from "@/lib/data/geocode-cache";

const mockGetCachedGeocode = vi.mocked(getCachedGeocode);

// Mock global fetch for Nominatim calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeRequest(params: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/geocode?${params}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCachedGeocode.mockResolvedValue(null);
});

describe("GET /api/geocode", () => {
  it("should return name and country for valid coordinates", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          address: {
            city: "Marseille",
            country: "France",
            country_code: "fr",
          },
          name: "Vieux-Port",
        }),
    });

    const response = await GET(makeRequest("lat=43.296&lon=5.370"));
    const data = await response.json();

    expect(data.name).toBe("Marseille");
    expect(data.country).toBe("France");
    expect(data.country_code).toBe("fr");
    expect(response.status).toBe(200);
  });

  it("should return 400 for missing coordinates", async () => {
    const response = await GET(makeRequest("lat=abc"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.name).toBe("");
    expect(data.country).toBeNull();
  });

  it("should return empty name when Nominatim fails", async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const response = await GET(makeRequest("lat=0.001&lon=0.001"));
    const data = await response.json();

    expect(data.name).toBe("");
    expect(data.country).toBeNull();
  });

  it("should return empty name on fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const response = await GET(makeRequest("lat=0.002&lon=0.002"));
    const data = await response.json();

    expect(data.name).toBe("");
    expect(data.country).toBeNull();
  });
});
