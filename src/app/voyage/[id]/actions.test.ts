import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteLeg } from "./actions";

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/data/legs", () => ({
  deleteLeg: vi.fn(),
}));

import { requireAuth } from "@/lib/auth";
import { deleteLeg as deleteLegDb } from "@/lib/data/legs";

const mockRequireAuth = vi.mocked(requireAuth);
const mockDeleteLegDb = vi.mocked(deleteLegDb);

const mockUser = { id: "u-1", email: "test@test.com" } as never;
const legId = "550e8400-e29b-41d4-a716-446655440000";

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ data: mockUser, error: null });
});

describe("deleteLeg", () => {
  it("should delete a leg successfully", async () => {
    mockDeleteLegDb.mockResolvedValue({ data: null, error: null } as never);

    const result = await deleteLeg({ legId });

    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
    expect(mockDeleteLegDb).toHaveBeenCalledWith(legId);
  });

  it("should return UNAUTHORIZED when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const result = await deleteLeg({ legId });

    expect(result.error?.code).toBe("UNAUTHORIZED");
    expect(mockDeleteLegDb).not.toHaveBeenCalled();
  });

  it("should return VALIDATION_ERROR for invalid legId", async () => {
    const result = await deleteLeg({ legId: "not-a-uuid" });

    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(mockDeleteLegDb).not.toHaveBeenCalled();
  });
});
