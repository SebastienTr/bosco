import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  persistStopovers,
  renameStopover,
  removeStopover,
  mergeStopovers,
} from "./actions";

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/data/voyages", () => ({
  getVoyageById: vi.fn(),
}));

vi.mock("@/lib/data/stopovers", () => ({
  insertStopovers: vi.fn(),
  getStopoversByVoyageId: vi.fn(),
  updateStopover: vi.fn(),
  deleteStopover: vi.fn(),
}));

vi.mock("@/lib/geo/reverse-geocode", () => ({
  reverseGeocodeServer: vi.fn(() => Promise.resolve({ name: "", country: null })),
}));

import { requireAuth } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import {
  insertStopovers,
  getStopoversByVoyageId,
  updateStopover,
  deleteStopover,
} from "@/lib/data/stopovers";

const mockRequireAuth = vi.mocked(requireAuth);
const mockGetVoyageById = vi.mocked(getVoyageById);
const mockInsertStopovers = vi.mocked(insertStopovers);
const mockGetStopovers = vi.mocked(getStopoversByVoyageId);
const mockUpdateStopover = vi.mocked(updateStopover);
const mockDeleteStopover = vi.mocked(deleteStopover);

const mockUser = { id: "u-1", email: "test@test.com" } as never;
const voyageId = "550e8400-e29b-41d4-a716-446655440000";

const mockVoyage = {
  id: voyageId,
  user_id: "u-1",
  name: "Test Voyage",
  slug: "test",
  is_public: false,
  description: null,
  cover_image_url: null,
  created_at: "2026-03-15T00:00:00Z",
  updated_at: "2026-03-15T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ data: mockUser, error: null });
  mockGetVoyageById.mockResolvedValue({ data: mockVoyage, error: null } as never);
  mockGetStopovers.mockResolvedValue({ data: [], error: null } as never);
});

describe("persistStopovers", () => {
  it("should insert new stopovers and return them", async () => {
    const inserted = [
      { id: "s-1", voyage_id: voyageId, name: "", latitude: 43.3, longitude: 5.4 },
    ];
    mockInsertStopovers.mockResolvedValue({ data: inserted, error: null } as never);

    const result = await persistStopovers({
      voyageId,
      stopovers: [
        {
          latitude: 43.3,
          longitude: 5.4,
          type: "departure",
          trackIndices: [0],
          arrived_at: null,
          departed_at: "2026-03-15T10:00:00Z",
        },
      ],
    });

    expect(result.data).toEqual(inserted);
    expect(result.error).toBeNull();
  });

  it("should deduplicate against existing stopovers within radius", async () => {
    mockGetStopovers.mockResolvedValue({
      data: [{ id: "s-existing", voyage_id: voyageId, name: "Port", latitude: 43.3, longitude: 5.4 }],
      error: null,
    } as never);

    const result = await persistStopovers({
      voyageId,
      stopovers: [
        {
          latitude: 43.3001,
          longitude: 5.4001,
          type: "departure",
          trackIndices: [0],
          arrived_at: null,
          departed_at: null,
        },
      ],
    });

    // Should return existing stopovers without inserting
    expect(mockInsertStopovers).not.toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
    expect(result.error).toBeNull();
  });

  it("should return UNAUTHORIZED when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const result = await persistStopovers({ voyageId, stopovers: [] });

    expect(result.error?.code).toBe("UNAUTHORIZED");
  });

  it("should return FORBIDDEN when voyage belongs to another user", async () => {
    mockGetVoyageById.mockResolvedValue({
      data: { ...mockVoyage, user_id: "other-user" },
      error: null,
    } as never);

    const result = await persistStopovers({
      voyageId,
      stopovers: [
        { latitude: 43.3, longitude: 5.4, type: "departure", trackIndices: [0], arrived_at: null, departed_at: null },
      ],
    });

    expect(result.error?.code).toBe("FORBIDDEN");
  });
});

describe("renameStopover", () => {
  it("should update stopover name", async () => {
    const updated = { id: "s-1", name: "Marseille" };
    mockUpdateStopover.mockResolvedValue({ data: updated, error: null } as never);

    const result = await renameStopover({
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Marseille",
    });

    expect(result.data).toEqual(updated);
    expect(result.error).toBeNull();
  });

  it("should return VALIDATION_ERROR for empty name", async () => {
    const result = await renameStopover({
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "",
    });

    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });
});

describe("removeStopover", () => {
  it("should delete a stopover", async () => {
    mockDeleteStopover.mockResolvedValue({ data: null, error: null } as never);

    const result = await removeStopover({
      id: "550e8400-e29b-41d4-a716-446655440001",
    });

    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });
});

describe("mergeStopovers", () => {
  it("should merge two stopovers into one", async () => {
    const s1 = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      voyage_id: voyageId,
      name: "Port A",
      latitude: 43.3,
      longitude: 5.4,
      arrived_at: "2026-03-15T10:00:00Z",
      departed_at: null,
    };
    const s2 = {
      id: "550e8400-e29b-41d4-a716-446655440002",
      voyage_id: voyageId,
      name: "",
      latitude: 43.31,
      longitude: 5.41,
      arrived_at: null,
      departed_at: "2026-03-15T14:00:00Z",
    };

    mockGetStopovers.mockResolvedValue({ data: [s1, s2], error: null } as never);
    mockUpdateStopover.mockResolvedValue({
      data: { ...s1, latitude: 43.305, longitude: 5.405 },
      error: null,
    } as never);
    mockDeleteStopover.mockResolvedValue({ data: null, error: null } as never);

    const result = await mergeStopovers({
      voyageId,
      stopoverIds: [s1.id, s2.id],
    });

    expect(result.data).toBeTruthy();
    expect(result.error).toBeNull();
    expect(mockUpdateStopover).toHaveBeenCalledWith(
      s1.id,
      expect.objectContaining({
        name: "Port A",
      }),
    );
    expect(mockDeleteStopover).toHaveBeenCalledWith(s2.id);
  });
});
