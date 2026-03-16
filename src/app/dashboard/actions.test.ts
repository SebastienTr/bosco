import { describe, it, expect, vi, beforeEach } from "vitest";
import { createVoyage } from "./actions";

// Mock auth
vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

// Mock voyages data layer
vi.mock("@/lib/data/voyages", () => ({
  insertVoyage: vi.fn(),
  checkSlugAvailability: vi.fn(),
}));

// Mock slug utility
vi.mock("@/lib/utils/slug", () => ({
  generateSlug: vi.fn((text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  ),
}));

import { requireAuth } from "@/lib/auth";
import { insertVoyage, checkSlugAvailability } from "@/lib/data/voyages";

const mockRequireAuth = vi.mocked(requireAuth);
const mockInsertVoyage = vi.mocked(insertVoyage);
const mockCheckSlug = vi.mocked(checkSlugAvailability);

function buildFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({
    data: { id: "u-1", email: "test@test.com" } as never,
    error: null,
  });
  mockCheckSlug.mockResolvedValue({ data: true, error: null });
});

describe("createVoyage", () => {
  it("should create a voyage successfully", async () => {
    const voyage = {
      id: "v-1",
      user_id: "u-1",
      name: "Summer 2026",
      slug: "summer-2026",
      description: null,
      cover_image_url: null,
      is_public: false,
      created_at: "2026-03-16T00:00:00Z",
      updated_at: "2026-03-16T00:00:00Z",
    };
    mockInsertVoyage.mockResolvedValue({ data: voyage, error: null } as never);

    const result = await createVoyage(
      buildFormData({
        name: "Summer 2026",
        slug: "summer-2026",
        description: "",
      }),
    );

    expect(result.data).toEqual(voyage);
    expect(result.error).toBeNull();
    expect(mockInsertVoyage).toHaveBeenCalledWith({
      user_id: "u-1",
      name: "Summer 2026",
      description: null,
      slug: "summer-2026",
    });
  });

  it("should auto-generate slug from name when slug is empty", async () => {
    mockInsertVoyage.mockResolvedValue({
      data: { id: "v-1", slug: "my-voyage" },
      error: null,
    } as never);

    await createVoyage(
      buildFormData({ name: "My Voyage", slug: "", description: "" }),
    );

    expect(mockInsertVoyage).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "my-voyage" }),
    );
  });

  it("should return UNAUTHORIZED when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const result = await createVoyage(
      buildFormData({ name: "Test", slug: "test", description: "" }),
    );

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("UNAUTHORIZED");
  });

  it("should return VALIDATION_ERROR when name is empty", async () => {
    const result = await createVoyage(
      buildFormData({ name: "", slug: "test", description: "" }),
    );

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(result.error?.message).toContain("required");
  });

  it("should return VALIDATION_ERROR when slug is too short", async () => {
    const result = await createVoyage(
      buildFormData({ name: "Test", slug: "ab", description: "" }),
    );

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(result.error?.message).toContain("3 characters");
  });

  it("should return VALIDATION_ERROR when slug is already taken", async () => {
    mockCheckSlug.mockResolvedValue({ data: false, error: null });

    const result = await createVoyage(
      buildFormData({
        name: "Test",
        slug: "taken-slug",
        description: "",
      }),
    );

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(result.error?.message).toContain("already used");
  });

  it("should return EXTERNAL_SERVICE_ERROR on insert failure", async () => {
    mockInsertVoyage.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    } as never);

    const result = await createVoyage(
      buildFormData({
        name: "Test Voyage",
        slug: "test-voyage",
        description: "",
      }),
    );

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("EXTERNAL_SERVICE_ERROR");
  });

  it("should trim name before validating and inserting", async () => {
    mockInsertVoyage.mockResolvedValue({
      data: { id: "v-1", name: "Summer 2026" },
      error: null,
    } as never);

    await createVoyage(
      buildFormData({
        name: "  Summer 2026  ",
        slug: "summer-2026",
        description: "  ",
      }),
    );

    expect(mockInsertVoyage).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Summer 2026",
        description: null,
      }),
    );
  });

  it("should surface slug lookup failures as external service errors", async () => {
    mockCheckSlug.mockResolvedValue({
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: "Lookup failed" },
    });

    const result = await createVoyage(
      buildFormData({
        name: "Summer 2026",
        slug: "summer-2026",
        description: "",
      }),
    );

    expect(result).toEqual({
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: "Lookup failed" },
    });
  });

  it("should map duplicate insert errors to validation errors", async () => {
    mockInsertVoyage.mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    } as never);

    const result = await createVoyage(
      buildFormData({
        name: "Summer 2026",
        slug: "summer-2026",
        description: "",
      }),
    );

    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(result.error?.message).toContain("already used");
  });

  it("should pass description as null when empty", async () => {
    mockInsertVoyage.mockResolvedValue({
      data: { id: "v-1" },
      error: null,
    } as never);

    await createVoyage(
      buildFormData({
        name: "Test",
        slug: "test-voyage",
        description: "",
      }),
    );

    expect(mockInsertVoyage).toHaveBeenCalledWith(
      expect.objectContaining({ description: null }),
    );
  });
});
