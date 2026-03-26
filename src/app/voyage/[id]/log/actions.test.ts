import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/data/voyages", () => ({
  getVoyageById: vi.fn(),
}));

vi.mock("@/lib/data/log-entries", () => ({
  insertLogEntry: vi.fn(),
  updateLogEntry: vi.fn(),
  deleteLogEntry: vi.fn(),
  getLogEntryById: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
}));

import { requireAuth } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import {
  insertLogEntry,
  updateLogEntry as updateLogEntryDb,
  deleteLogEntry as deleteLogEntryDb,
  getLogEntryById,
} from "@/lib/data/log-entries";
import { uploadFile, deleteFile } from "@/lib/storage";
import {
  createLogEntry,
  updateLogEntry,
  deleteLogEntry,
  deleteLogPhoto,
  uploadLogPhoto,
} from "./actions";

const mockRequireAuth = vi.mocked(requireAuth);
const mockGetVoyageById = vi.mocked(getVoyageById);
const mockInsertLogEntry = vi.mocked(insertLogEntry);
const mockUpdateLogEntryDb = vi.mocked(updateLogEntryDb);
const mockDeleteLogEntryDb = vi.mocked(deleteLogEntryDb);
const mockGetLogEntryById = vi.mocked(getLogEntryById);
const mockUploadFile = vi.mocked(uploadFile);
const mockDeleteFile = vi.mocked(deleteFile);

const mockUser = { id: "u-1", email: "test@test.com" } as never;
const voyageId = "550e8400-e29b-41d4-a716-446655440000";
const entryId = "660e8400-e29b-41d4-a716-446655440000";
const mockVoyage = { id: voyageId, user_id: "u-1", name: "Test Voyage" } as never;

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ data: mockUser, error: null });
  mockGetVoyageById.mockResolvedValue({ data: mockVoyage, error: null } as never);
});

describe("createLogEntry", () => {
  const validFormData = () =>
    makeFormData({
      voyageId,
      entryDate: "2026-03-20",
      text: "Arrived in Marseille",
      photoUrls: "[]",
    });

  it("should create a log entry successfully", async () => {
    const mockEntry = { id: entryId, text: "Arrived in Marseille" };
    mockInsertLogEntry.mockResolvedValue({ data: mockEntry, error: null } as never);

    const result = await createLogEntry(validFormData());

    expect(result.data).toEqual(mockEntry);
    expect(result.error).toBeNull();
    expect(mockInsertLogEntry).toHaveBeenCalledWith({
      voyage_id: voyageId,
      entry_date: "2026-03-20",
      text: "Arrived in Marseille",
      leg_id: null,
      stopover_id: null,
      photo_urls: [],
    });
  });

  it("should return UNAUTHORIZED when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const result = await createLogEntry(validFormData());

    expect(result.error?.code).toBe("UNAUTHORIZED");
    expect(mockInsertLogEntry).not.toHaveBeenCalled();
  });

  it("should return VALIDATION_ERROR for empty text", async () => {
    const fd = makeFormData({
      voyageId,
      entryDate: "2026-03-20",
      text: "",
      photoUrls: "[]",
    });

    const result = await createLogEntry(fd);

    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(mockInsertLogEntry).not.toHaveBeenCalled();
  });

  it("should return VALIDATION_ERROR for invalid date", async () => {
    const fd = makeFormData({
      voyageId,
      entryDate: "not-a-date",
      text: "Valid text",
      photoUrls: "[]",
    });

    const result = await createLogEntry(fd);

    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(mockInsertLogEntry).not.toHaveBeenCalled();
  });

  it("should return VALIDATION_ERROR for malformed photoUrls JSON", async () => {
    const fd = makeFormData({
      voyageId,
      entryDate: "2026-03-20",
      text: "Valid text",
      photoUrls: "{",
    });

    const result = await createLogEntry(fd);

    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(mockInsertLogEntry).not.toHaveBeenCalled();
  });

  it("should return FORBIDDEN when user does not own voyage", async () => {
    const otherVoyage = { id: voyageId, user_id: "other-user", name: "Test Voyage" };
    mockGetVoyageById.mockResolvedValue({
      data: otherVoyage,
      error: null,
    } as never);

    const result = await createLogEntry(validFormData());

    expect(result.error?.code).toBe("FORBIDDEN");
    expect(mockInsertLogEntry).not.toHaveBeenCalled();
  });
});

describe("updateLogEntry", () => {
  const validFormData = () =>
    makeFormData({
      id: entryId,
      voyageId,
      entryDate: "2026-03-21",
      text: "Updated text",
      photoUrls: "[]",
    });

  it("should update a log entry successfully", async () => {
    const mockEntry = { id: entryId, text: "Updated text" };
    mockGetLogEntryById.mockResolvedValue({
      data: {
        id: entryId,
        voyage_id: voyageId,
        photo_urls: [],
      },
      error: null,
    } as never);
    mockUpdateLogEntryDb.mockResolvedValue({ data: mockEntry, error: null } as never);

    const result = await updateLogEntry(validFormData());

    expect(result.data).toEqual(mockEntry);
    expect(result.error).toBeNull();
  });

  it("should return UNAUTHORIZED when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const result = await updateLogEntry(validFormData());

    expect(result.error?.code).toBe("UNAUTHORIZED");
  });

  it("deletes removed photos from storage after a successful update", async () => {
    const removedUrl =
      "http://localhost:54321/storage/v1/object/public/log-photos/u-1/v-1/logs/removed.jpg";
    const keptUrl =
      "http://localhost:54321/storage/v1/object/public/log-photos/u-1/v-1/logs/kept.jpg";

    mockGetLogEntryById.mockResolvedValue({
      data: {
        id: entryId,
        voyage_id: voyageId,
        photo_urls: [removedUrl, keptUrl],
      },
      error: null,
    } as never);
    mockUpdateLogEntryDb.mockResolvedValue({
      data: { id: entryId, text: "Updated text", photo_urls: [keptUrl] },
      error: null,
    } as never);
    mockDeleteFile.mockResolvedValue({ data: null, error: null });

    const fd = makeFormData({
      id: entryId,
      voyageId,
      entryDate: "2026-03-21",
      text: "Updated text",
      photoUrls: JSON.stringify([keptUrl]),
    });

    const result = await updateLogEntry(fd);

    expect(result.error).toBeNull();
    expect(mockDeleteFile).toHaveBeenCalledWith("log-photos", [
      "u-1/v-1/logs/removed.jpg",
    ]);
  });
});

describe("deleteLogEntry", () => {
  it("should delete entry and its photos", async () => {
    mockGetLogEntryById.mockResolvedValue({
      data: {
        id: entryId,
        voyage_id: voyageId,
        photo_urls: ["http://localhost:54321/storage/v1/object/public/log-photos/u-1/v-1/logs/123.jpg"],
      },
      error: null,
    } as never);
    mockDeleteLogEntryDb.mockResolvedValue({ data: null, error: null } as never);
    mockDeleteFile.mockResolvedValue({ data: null, error: null });

    const result = await deleteLogEntry({ id: entryId, voyageId });

    expect(result.error).toBeNull();
    expect(mockDeleteFile).toHaveBeenCalledWith("log-photos", [
      "u-1/v-1/logs/123.jpg",
    ]);
    expect(mockDeleteLogEntryDb).toHaveBeenCalledWith(entryId);
  });

  it("should delete entry with no photos", async () => {
    mockGetLogEntryById.mockResolvedValue({
      data: { id: entryId, voyage_id: voyageId, photo_urls: [] },
      error: null,
    } as never);
    mockDeleteLogEntryDb.mockResolvedValue({ data: null, error: null } as never);

    const result = await deleteLogEntry({ id: entryId, voyageId });

    expect(result.error).toBeNull();
    expect(mockDeleteFile).not.toHaveBeenCalled();
  });

  it("should return UNAUTHORIZED when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const result = await deleteLogEntry({ id: entryId, voyageId });

    expect(result.error?.code).toBe("UNAUTHORIZED");
  });

  it("returns the storage error when deleting photos fails", async () => {
    mockGetLogEntryById.mockResolvedValue({
      data: {
        id: entryId,
        voyage_id: voyageId,
        photo_urls: ["http://localhost:54321/storage/v1/object/public/log-photos/u-1/v-1/logs/123.jpg"],
      },
      error: null,
    } as never);
    mockDeleteFile.mockResolvedValue({
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: "storage remove failed" },
    });

    const result = await deleteLogEntry({ id: entryId, voyageId });

    expect(result.error?.code).toBe("EXTERNAL_SERVICE_ERROR");
    expect(mockDeleteLogEntryDb).not.toHaveBeenCalled();
  });
});

describe("deleteLogPhoto", () => {
  it("removes a persisted photo and updates the entry photo list", async () => {
    const photoUrl =
      "http://localhost:54321/storage/v1/object/public/log-photos/u-1/v-1/logs/123.jpg";

    mockGetLogEntryById.mockResolvedValue({
      data: {
        id: entryId,
        voyage_id: voyageId,
        photo_urls: [photoUrl],
      },
      error: null,
    } as never);
    mockUpdateLogEntryDb.mockResolvedValue({
      data: { id: entryId, photo_urls: [] },
      error: null,
    } as never);
    mockDeleteFile.mockResolvedValue({ data: null, error: null });

    const result = await deleteLogPhoto({
      entryId,
      voyageId,
      url: photoUrl,
    });

    expect(result.data?.photoUrls).toEqual([]);
    expect(result.error).toBeNull();
    expect(mockUpdateLogEntryDb).toHaveBeenCalledWith(entryId, {
      photo_urls: [],
    });
    expect(mockDeleteFile).toHaveBeenCalledWith("log-photos", [
      "u-1/v-1/logs/123.jpg",
    ]);
  });
});

describe("uploadLogPhoto", () => {
  it("should upload a photo successfully", async () => {
    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    const fd = new FormData();
    fd.set("voyageId", voyageId);
    fd.set("file", file);

    mockUploadFile.mockResolvedValue({
      data: { path: "u-1/v-1/logs/123.jpg", publicUrl: "http://example.com/photo.jpg" },
      error: null,
    });

    const result = await uploadLogPhoto(fd);

    expect(result.data?.url).toBe("http://example.com/photo.jpg");
    expect(result.error).toBeNull();
  });

  it("should reject invalid file type", async () => {
    const file = new File(["test"], "doc.pdf", { type: "application/pdf" });
    const fd = new FormData();
    fd.set("voyageId", voyageId);
    fd.set("file", file);

    const result = await uploadLogPhoto(fd);

    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  it("should reject missing file", async () => {
    const fd = new FormData();
    fd.set("voyageId", voyageId);

    const result = await uploadLogPhoto(fd);

    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("should return UNAUTHORIZED when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    const fd = new FormData();
    fd.set("voyageId", voyageId);
    fd.set("file", file);

    const result = await uploadLogPhoto(fd);

    expect(result.error?.code).toBe("UNAUTHORIZED");
  });
});
