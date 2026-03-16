import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadFile, getPublicUrl, deleteFile } from "./storage";

const mockUpload = vi.fn();
const mockRemove = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      storage: {
        from: () => ({
          upload: mockUpload,
          remove: mockRemove,
          getPublicUrl: mockGetPublicUrl,
        }),
      },
    }),
  ),
}));

describe("storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("returns path and publicUrl on success", async () => {
      mockUpload.mockResolvedValue({
        data: { path: "user1/profile.jpg" },
        error: null,
      });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: "https://example.com/storage/v1/object/public/avatars/user1/profile.jpg" },
      });

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = await uploadFile("avatars", "user1/profile.jpg", file);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        path: "user1/profile.jpg",
        publicUrl: "https://example.com/storage/v1/object/public/avatars/user1/profile.jpg",
      });
      expect(mockUpload).toHaveBeenCalledWith(
        "user1/profile.jpg",
        file,
        expect.objectContaining({ upsert: true }),
      );
    });

    it("returns error on upload failure", async () => {
      mockUpload.mockResolvedValue({
        data: null,
        error: { message: "Bucket not found" },
      });

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = await uploadFile("avatars", "user1/profile.jpg", file);

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Bucket not found",
      });
    });
  });

  describe("getPublicUrl", () => {
    it("returns the public URL from Supabase", async () => {
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: "https://test.supabase.co/storage/v1/object/public/avatars/user1/profile.jpg" },
      });

      const url = await getPublicUrl("avatars", "user1/profile.jpg");

      expect(url).toBe(
        "https://test.supabase.co/storage/v1/object/public/avatars/user1/profile.jpg",
      );
    });
  });

  describe("deleteFile", () => {
    it("returns success on delete", async () => {
      mockRemove.mockResolvedValue({ data: [{}], error: null });

      const result = await deleteFile("avatars", ["user1/profile.jpg"]);

      expect(result.error).toBeNull();
      expect(result.data).toBeNull();
      expect(mockRemove).toHaveBeenCalledWith(["user1/profile.jpg"]);
    });

    it("returns error on delete failure", async () => {
      mockRemove.mockResolvedValue({
        data: null,
        error: { message: "File not found" },
      });

      const result = await deleteFile("avatars", ["user1/missing.jpg"]);

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        code: "EXTERNAL_SERVICE_ERROR",
        message: "File not found",
      });
    });
  });
});
