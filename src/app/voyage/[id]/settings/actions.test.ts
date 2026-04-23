import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  updateVoyage,
  deleteVoyage,
  toggleVisibility,
  uploadCoverImage,
  updateBoatDetails,
} from "./actions";

// Mock auth
vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

// Mock data layers
vi.mock("@/lib/data/voyages", () => ({
  getVoyageById: vi.fn(),
  updateVoyage: vi.fn(),
  deleteVoyage: vi.fn(),
  checkSlugAvailability: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
}));

import { requireAuth } from "@/lib/auth";
import {
  getVoyageById,
  updateVoyage as updateVoyageDb,
  deleteVoyage as deleteVoyageDb,
  checkSlugAvailability,
} from "@/lib/data/voyages";
import { uploadFile, deleteFile } from "@/lib/storage";

const mockRequireAuth = vi.mocked(requireAuth);
const mockGetVoyageById = vi.mocked(getVoyageById);
const mockUpdateVoyageDb = vi.mocked(updateVoyageDb);
const mockDeleteVoyageDb = vi.mocked(deleteVoyageDb);
const mockCheckSlugAvailability = vi.mocked(checkSlugAvailability);
const mockUploadFile = vi.mocked(uploadFile);
const mockDeleteFile = vi.mocked(deleteFile);

const mockUser = { id: "u-1", email: "test@test.com" } as never;
const mockVoyage = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "u-1",
  name: "Test Voyage",
  slug: "test-voyage",
  description: null,
  is_public: false,
  cover_image_url: null,
  boat_name: null,
  boat_type: null,
  boat_length_m: null,
  boat_flag: null,
  home_port: null,
  created_at: "2026-03-15T00:00:00Z",
  updated_at: "2026-03-15T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ data: mockUser, error: null });
  mockGetVoyageById.mockResolvedValue({
    data: mockVoyage,
    error: null,
  } as never);
});

describe("updateVoyage", () => {
  it("should update voyage name and slug", async () => {
    mockCheckSlugAvailability.mockResolvedValue({ data: true, error: null });
    const updated = { ...mockVoyage, name: "New Name", slug: "new-name" };
    mockUpdateVoyageDb.mockResolvedValue({ data: updated, error: null } as never);

    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("name", "New Name");
    formData.set("description", "");
    formData.set("slug", "new-name");

    const result = await updateVoyage(formData);

    expect(result.data).toEqual(updated);
    expect(result.error).toBeNull();
  });

  it("should return VALIDATION_ERROR for invalid name", async () => {
    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("name", "");
    formData.set("description", "");
    formData.set("slug", "test-voyage");

    const result = await updateVoyage(formData);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("should return FORBIDDEN when voyage belongs to another user", async () => {
    mockGetVoyageById.mockResolvedValue({
      data: { ...mockVoyage, user_id: "other-user" },
      error: null,
    } as never);

    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("name", "Test");
    formData.set("description", "");
    formData.set("slug", "test-voyage");

    const result = await updateVoyage(formData);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("FORBIDDEN");
  });
});

describe("deleteVoyage", () => {
  it("should delete a voyage successfully", async () => {
    mockDeleteFile.mockResolvedValue({ data: null, error: null });
    mockDeleteVoyageDb.mockResolvedValue({ data: null, error: null } as never);

    const result = await deleteVoyage({ voyageId: mockVoyage.id });

    expect(result.data).toEqual({ success: true });
    expect(result.error).toBeNull();
  });

  it("should delete the existing cover image from storage before deleting the voyage", async () => {
    mockDeleteFile.mockResolvedValue({ data: null, error: null });
    mockDeleteVoyageDb.mockResolvedValue({ data: null, error: null } as never);
    mockGetVoyageById.mockResolvedValue({
      data: {
        ...mockVoyage,
        cover_image_url:
          "https://storage.example.com/storage/v1/object/public/voyage-covers/u-1/550e8400-e29b-41d4-a716-446655440000/cover.jpg",
      },
      error: null,
    } as never);

    const result = await deleteVoyage({ voyageId: mockVoyage.id });

    expect(result.error).toBeNull();
    expect(mockDeleteFile).toHaveBeenCalledWith("voyage-covers", [
      "u-1/550e8400-e29b-41d4-a716-446655440000/cover.jpg",
    ]);
  });

  it("should return UNAUTHORIZED when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const result = await deleteVoyage({ voyageId: mockVoyage.id });

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("UNAUTHORIZED");
  });

  it("should return VALIDATION_ERROR for invalid UUID", async () => {
    const result = await deleteVoyage({ voyageId: "not-a-uuid" });

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });
});

describe("toggleVisibility", () => {
  it("should toggle visibility to public", async () => {
    const updated = { ...mockVoyage, is_public: true };
    mockUpdateVoyageDb.mockResolvedValue({ data: updated, error: null } as never);

    const result = await toggleVisibility({
      voyageId: mockVoyage.id,
      isPublic: true,
    });

    expect(result.data).toEqual(updated);
    expect(result.error).toBeNull();
  });

  it("should return FORBIDDEN when voyage belongs to another user", async () => {
    mockGetVoyageById.mockResolvedValue({
      data: { ...mockVoyage, user_id: "other-user" },
      error: null,
    } as never);

    const result = await toggleVisibility({
      voyageId: mockVoyage.id,
      isPublic: true,
    });

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("FORBIDDEN");
  });
});

describe("uploadCoverImage", () => {
  it("should upload cover image and return public URL", async () => {
    const publicUrl = "https://storage.example.com/voyage-covers/u-1/v-1/cover.jpg";
    mockUploadFile.mockResolvedValue({
      data: { path: "u-1/v-1/cover.jpg", publicUrl },
      error: null,
    });
    const updated = { ...mockVoyage, cover_image_url: publicUrl };
    mockUpdateVoyageDb.mockResolvedValue({ data: updated, error: null } as never);

    const file = new File(["fake"], "photo.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("file", file);

    const result = await uploadCoverImage(formData);

    expect(result.data).toEqual({ url: publicUrl });
    expect(result.error).toBeNull();
  });

  it("should return VALIDATION_ERROR when no file provided", async () => {
    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);

    const result = await uploadCoverImage(formData);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("should return VALIDATION_ERROR for unsupported file types", async () => {
    const file = new File(["fake"], "notes.txt", { type: "text/plain" });
    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("file", file);

    const result = await uploadCoverImage(formData);

    expect(result.data).toBeNull();
    expect(result.error).toEqual({
      code: "VALIDATION_ERROR",
      message: "Only JPEG, PNG, and WebP images are accepted",
    });
  });

  it("should return VALIDATION_ERROR for files larger than 10 MB", async () => {
    const oversizedFile = new File(
      [new Uint8Array(18 * 1024 * 1024 + 1)],
      "photo.jpg",
      { type: "image/jpeg" },
    );
    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("file", oversizedFile);

    const result = await uploadCoverImage(formData);

    expect(result.data).toBeNull();
    expect(result.error).toEqual({
      code: "VALIDATION_ERROR",
      message: "Image must be under 18 MB",
    });
  });
});

describe("updateBoatDetails", () => {
  it("should update boat details successfully", async () => {
    const updated = {
      ...mockVoyage,
      boat_name: "Laurine",
      boat_type: "sailboat",
      boat_length_m: 8.5,
      boat_flag: "FR",
      home_port: "Göteborg",
    };
    mockUpdateVoyageDb.mockResolvedValue({ data: updated, error: null } as never);

    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("boat_name", "Laurine");
    formData.set("boat_type", "sailboat");
    formData.set("boat_length_m", "8.5");
    formData.set("boat_flag", "FR");
    formData.set("home_port", "Göteborg");

    const result = await updateBoatDetails(formData);

    expect(result.data).toEqual(updated);
    expect(result.error).toBeNull();
    expect(mockUpdateVoyageDb).toHaveBeenCalledWith(mockVoyage.id, {
      boat_name: "Laurine",
      boat_type: "sailboat",
      boat_length_m: 8.5,
      boat_flag: "FR",
      home_port: "Göteborg",
    });
  });

  it("should store empty strings as null", async () => {
    const updated = { ...mockVoyage };
    mockUpdateVoyageDb.mockResolvedValue({ data: updated, error: null } as never);

    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("boat_name", "");
    formData.set("boat_type", "");
    formData.set("boat_length_m", "");
    formData.set("boat_flag", "");
    formData.set("home_port", "");

    const result = await updateBoatDetails(formData);

    expect(result.error).toBeNull();
    expect(mockUpdateVoyageDb).toHaveBeenCalledWith(mockVoyage.id, {
      boat_name: null,
      boat_type: null,
      boat_length_m: null,
      boat_flag: null,
      home_port: null,
    });
  });

  it("should return VALIDATION_ERROR for invalid boat_type", async () => {
    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("boat_name", "Laurine");
    formData.set("boat_type", "submarine");
    formData.set("boat_length_m", "");
    formData.set("boat_flag", "");
    formData.set("home_port", "");

    const result = await updateBoatDetails(formData);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("should return VALIDATION_ERROR for invalid boat_flag", async () => {
    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("boat_name", "");
    formData.set("boat_type", "");
    formData.set("boat_length_m", "");
    formData.set("boat_flag", "F");
    formData.set("home_port", "");

    const result = await updateBoatDetails(formData);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("should return VALIDATION_ERROR for non-alpha boat_flag", async () => {
    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("boat_name", "");
    formData.set("boat_type", "");
    formData.set("boat_length_m", "");
    formData.set("boat_flag", "1!");
    formData.set("home_port", "");

    const result = await updateBoatDetails(formData);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("should return FORBIDDEN when voyage belongs to another user", async () => {
    mockGetVoyageById.mockResolvedValue({
      data: { ...mockVoyage, user_id: "other-user" },
      error: null,
    } as never);

    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("boat_name", "Laurine");
    formData.set("boat_type", "");
    formData.set("boat_length_m", "");
    formData.set("boat_flag", "");
    formData.set("home_port", "");

    const result = await updateBoatDetails(formData);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("FORBIDDEN");
  });

  it("should return UNAUTHORIZED when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("boat_name", "Laurine");
    formData.set("boat_type", "");
    formData.set("boat_length_m", "");
    formData.set("boat_flag", "");
    formData.set("home_port", "");

    const result = await updateBoatDetails(formData);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("UNAUTHORIZED");
  });

  it("should accept all optional fields partially filled", async () => {
    const updated = {
      ...mockVoyage,
      boat_name: "Laurine",
      boat_type: null,
      boat_length_m: 12,
      boat_flag: null,
      home_port: null,
    };
    mockUpdateVoyageDb.mockResolvedValue({ data: updated, error: null } as never);

    const formData = new FormData();
    formData.set("voyageId", mockVoyage.id);
    formData.set("boat_name", "Laurine");
    formData.set("boat_type", "");
    formData.set("boat_length_m", "12");
    formData.set("boat_flag", "");
    formData.set("home_port", "");

    const result = await updateBoatDetails(formData);

    expect(result.error).toBeNull();
    expect(mockUpdateVoyageDb).toHaveBeenCalledWith(mockVoyage.id, {
      boat_name: "Laurine",
      boat_type: null,
      boat_length_m: 12,
      boat_flag: null,
      home_port: null,
    });
  });
});
