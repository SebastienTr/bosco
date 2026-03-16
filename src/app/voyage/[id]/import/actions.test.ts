import { describe, it, expect, vi, beforeEach } from "vitest";
import { importTracks } from "./actions";

// Mock auth
vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

// Mock data layers
vi.mock("@/lib/data/voyages", () => ({
  getVoyageById: vi.fn(),
}));

vi.mock("@/lib/data/legs", () => ({
  insertLegs: vi.fn(),
}));

import { requireAuth } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import { insertLegs } from "@/lib/data/legs";

const mockRequireAuth = vi.mocked(requireAuth);
const mockGetVoyageById = vi.mocked(getVoyageById);
const mockInsertLegs = vi.mocked(insertLegs);

const mockUser = { id: "u-1", email: "test@test.com" } as never;

const validInput = {
  voyageId: "550e8400-e29b-41d4-a716-446655440000",
  legs: [
    {
      track_geojson: {
        type: "LineString" as const,
        coordinates: [
          [5.4, 43.3],
          [5.5, 43.4],
        ],
      },
      distance_nm: 10.5,
      duration_seconds: 3600,
      avg_speed_kts: 5.2,
      max_speed_kts: 8.1,
      started_at: "2026-03-15T10:00:00Z",
      ended_at: "2026-03-15T11:00:00Z",
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ data: mockUser, error: null });
  mockGetVoyageById.mockResolvedValue({
    data: {
      id: validInput.voyageId,
      user_id: "u-1",
      name: "Test Voyage",
      slug: "test",
      is_public: false,
      description: null,
      cover_image_url: null,
      created_at: "2026-03-15T00:00:00Z",
      updated_at: "2026-03-15T00:00:00Z",
    },
    error: null,
  } as never);
});

describe("importTracks", () => {
  it("should import tracks successfully", async () => {
    const insertedLegs = [
      { id: "l-1", voyage_id: validInput.voyageId, ...validInput.legs[0] },
    ];
    mockInsertLegs.mockResolvedValue({
      data: insertedLegs,
      error: null,
    } as never);

    const result = await importTracks(validInput);

    expect(result.data).toEqual(insertedLegs);
    expect(result.error).toBeNull();
    expect(mockInsertLegs).toHaveBeenCalledWith([
      expect.objectContaining({
        voyage_id: validInput.voyageId,
        distance_nm: 10.5,
      }),
    ]);
  });

  it("should return VALIDATION_ERROR for empty legs array", async () => {
    const result = await importTracks({
      voyageId: validInput.voyageId,
      legs: [],
    });

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(result.error?.message).toContain("At least one track");
  });

  it("should return VALIDATION_ERROR for invalid voyageId", async () => {
    const result = await importTracks({
      voyageId: "not-a-uuid",
      legs: validInput.legs,
    });

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("should return UNAUTHORIZED when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const result = await importTracks(validInput);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("UNAUTHORIZED");
  });

  it("should return FORBIDDEN when voyage belongs to another user", async () => {
    mockGetVoyageById.mockResolvedValue({
      data: {
        id: validInput.voyageId,
        user_id: "other-user",
        name: "Not yours",
        slug: "test",
        is_public: false,
        description: null,
        cover_image_url: null,
        created_at: "2026-03-15T00:00:00Z",
        updated_at: "2026-03-15T00:00:00Z",
      },
      error: null,
    } as never);

    const result = await importTracks(validInput);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("FORBIDDEN");
  });

  it("should return NOT_FOUND when voyage does not exist", async () => {
    mockGetVoyageById.mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "Not found" },
    } as never);

    const result = await importTracks(validInput);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("NOT_FOUND");
  });

  it("should return EXTERNAL_SERVICE_ERROR on insert failure", async () => {
    mockInsertLegs.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    } as never);

    const result = await importTracks(validInput);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("EXTERNAL_SERVICE_ERROR");
  });
});
