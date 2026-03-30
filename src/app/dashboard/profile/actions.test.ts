import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkUsername, deleteAccount, saveProfile, uploadPhoto } from "./actions";
import { messages } from "./messages";

const mockRequireAuth = vi.fn();
const mockSignOut = vi.fn();
const mockCheckUsernameAvailability = vi.fn();
const mockDisableProfile = vi.fn();
const mockUpdateProfile = vi.fn();
const mockUploadFile = vi.fn();
const mockDeleteAccountData = vi.fn();
const mockValidateAccountDeletionSetup = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

vi.mock("@/lib/data/profiles", () => ({
  checkUsernameAvailability: (...args: unknown[]) => mockCheckUsernameAvailability(...args),
  disableProfile: (...args: unknown[]) => mockDisableProfile(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}));

vi.mock("@/lib/storage", () => ({
  uploadFile: (...args: unknown[]) => mockUploadFile(...args),
}));

vi.mock("@/lib/data/account-deletion", () => ({
  deleteAccountData: (...args: unknown[]) => mockDeleteAccountData(...args),
  validateAccountDeletionSetup: (...args: unknown[]) => mockValidateAccountDeletionSetup(...args),
}));

const mockUser = { id: "user-123", email: "test@example.com" };

describe("profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ data: mockUser, error: null });
    mockDisableProfile.mockResolvedValue({
      data: { disabledAt: "2026-03-30T08:00:00.000Z" },
      error: null,
    });
    mockValidateAccountDeletionSetup.mockResolvedValue({
      data: { ready: true },
      error: null,
    });
    mockSignOut.mockResolvedValue({ data: null, error: null });
  });

  describe("checkUsername", () => {
    it("returns available: true when username is free", async () => {
      mockCheckUsernameAvailability.mockResolvedValue({ data: true, error: null });
      const formData = new FormData();
      formData.set("username", "sailor-seb");

      const result = await checkUsername(formData);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({ available: true });
      expect(mockCheckUsernameAvailability).toHaveBeenCalledWith("sailor-seb", "user-123");
    });

    it("returns available: false when username is taken", async () => {
      mockCheckUsernameAvailability.mockResolvedValue({ data: false, error: null });
      const formData = new FormData();
      formData.set("username", "taken-user");

      const result = await checkUsername(formData);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({ available: false });
    });

    it("returns validation error for invalid username", async () => {
      const formData = new FormData();
      formData.set("username", "AB");

      const result = await checkUsername(formData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("returns unauthorized error when not authenticated", async () => {
      mockRequireAuth.mockResolvedValue({
        data: null,
        error: { code: "UNAUTHORIZED", message: "Not signed in" },
      });
      const formData = new FormData();
      formData.set("username", "valid-user");

      const result = await checkUsername(formData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("UNAUTHORIZED");
    });

    it("returns an external service error when availability lookup fails", async () => {
      mockCheckUsernameAvailability.mockResolvedValue({
        data: null,
        error: { code: "EXTERNAL_SERVICE_ERROR", message: "RPC failed" },
      });
      const formData = new FormData();
      formData.set("username", "valid-user");

      const result = await checkUsername(formData);

      expect(result).toEqual({
        data: null,
        error: { code: "EXTERNAL_SERVICE_ERROR", message: "RPC failed" },
      });
    });
  });

  describe("saveProfile", () => {
    it("saves profile with valid data", async () => {
      mockCheckUsernameAvailability.mockResolvedValue({ data: true, error: null });
      mockUpdateProfile.mockResolvedValue({
        data: { username: "sailor-seb" },
        error: null,
      });

      const formData = new FormData();
      formData.set("username", "sailor-seb");
      formData.set("boat_name", "Laurine");
      formData.set("boat_type", "Laurin Koster 28");
      formData.set("bio", "Sailing from Goteborg to Nice");

      const result = await saveProfile(formData);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({ username: "sailor-seb" });
      expect(mockUpdateProfile).toHaveBeenCalledWith("user-123", {
        username: "sailor-seb",
        boat_name: "Laurine",
        boat_type: "Laurin Koster 28",
        bio: "Sailing from Goteborg to Nice",
      });
    });

    it("returns error when username is taken", async () => {
      mockCheckUsernameAvailability.mockResolvedValue({ data: false, error: null });

      const formData = new FormData();
      formData.set("username", "taken-one");

      const result = await saveProfile(formData);

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        code: "VALIDATION_ERROR",
        message: messages.fields.username.taken,
      });
    });

    it("returns validation error for empty username", async () => {
      const formData = new FormData();
      formData.set("username", "");

      const result = await saveProfile(formData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("returns error on profile update failure", async () => {
      mockCheckUsernameAvailability.mockResolvedValue({ data: true, error: null });
      mockUpdateProfile.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const formData = new FormData();
      formData.set("username", "sailor-seb");

      const result = await saveProfile(formData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("EXTERNAL_SERVICE_ERROR");
    });

    it("saves profile with empty optional fields as null", async () => {
      mockCheckUsernameAvailability.mockResolvedValue({ data: true, error: null });
      mockUpdateProfile.mockResolvedValue({
        data: { username: "minimal" },
        error: null,
      });

      const formData = new FormData();
      formData.set("username", "minimal");
      formData.set("boat_name", "");
      formData.set("boat_type", "");
      formData.set("bio", "");

      const result = await saveProfile(formData);

      expect(result.error).toBeNull();
      expect(mockUpdateProfile).toHaveBeenCalledWith("user-123", {
        username: "minimal",
        boat_name: null,
        boat_type: null,
        bio: null,
      });
    });

    it("returns an external service error when availability lookup fails", async () => {
      mockCheckUsernameAvailability.mockResolvedValue({
        data: null,
        error: { code: "EXTERNAL_SERVICE_ERROR", message: "RPC failed" },
      });

      const formData = new FormData();
      formData.set("username", "sailor-seb");

      const result = await saveProfile(formData);

      expect(result).toEqual({
        data: null,
        error: { code: "EXTERNAL_SERVICE_ERROR", message: "RPC failed" },
      });
    });

    it("maps unique username violations back to a validation error", async () => {
      mockCheckUsernameAvailability.mockResolvedValue({ data: true, error: null });
      mockUpdateProfile.mockResolvedValue({
        data: null,
        error: { code: "23505", message: "duplicate key value violates unique constraint" },
      });

      const formData = new FormData();
      formData.set("username", "duplicate-user");

      const result = await saveProfile(formData);

      expect(result).toEqual({
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: messages.fields.username.taken,
        },
      });
    });
  });

  describe("uploadPhoto", () => {
    it("uploads profile photo successfully", async () => {
      mockUploadFile.mockResolvedValue({
        data: { path: "user-123/profile.jpg", publicUrl: "https://example.com/photo.jpg" },
        error: null,
      });
      mockUpdateProfile.mockResolvedValue({ data: {}, error: null });

      const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.set("file", file);
      formData.set("field", "profile_photo_url");

      const result = await uploadPhoto(formData);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({ url: "https://example.com/photo.jpg" });
    });

    it("rejects invalid file type", async () => {
      const file = new File(["test"], "doc.pdf", { type: "application/pdf" });
      const formData = new FormData();
      formData.set("file", file);
      formData.set("field", "profile_photo_url");

      const result = await uploadPhoto(formData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("rejects oversized files", async () => {
      const file = new File(["x".repeat(10)], "photo.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", {
        configurable: true,
        value: 18 * 1024 * 1024 + 1,
      });

      const formData = new FormData();
      formData.set("file", file);
      formData.set("field", "profile_photo_url");

      const result = await uploadPhoto(formData);

      expect(result).toEqual({
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: messages.validation.imageTooLarge,
        },
      });
    });

    it("rejects invalid field name", async () => {
      const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.set("file", file);
      formData.set("field", "invalid_field");

      const result = await uploadPhoto(formData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("returns error when no file provided", async () => {
      const formData = new FormData();
      formData.set("field", "profile_photo_url");

      const result = await uploadPhoto(formData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("returns error on upload failure", async () => {
      mockUploadFile.mockResolvedValue({
        data: null,
        error: { code: "EXTERNAL_SERVICE_ERROR", message: "Upload failed" },
      });

      const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.set("file", file);
      formData.set("field", "profile_photo_url");

      const result = await uploadPhoto(formData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("EXTERNAL_SERVICE_ERROR");
    });
  });

  describe("deleteAccount", () => {
    it("deletes the current account after validating the destructive confirmation input", async () => {
      mockDeleteAccountData.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await deleteAccount({
        confirmation: "delete-account",
      });

      expect(result).toEqual({
        data: { success: true },
        error: null,
      });
      expect(mockValidateAccountDeletionSetup).toHaveBeenCalled();
      expect(mockDisableProfile).toHaveBeenCalledWith("user-123");
      expect(mockDeleteAccountData).toHaveBeenCalledWith("user-123");
      expect(mockSignOut).toHaveBeenCalled();
    });

    it("returns a validation error when the destructive confirmation input is invalid", async () => {
      const result = await deleteAccount({
        confirmation: "keep-account",
      });

      expect(result).toEqual({
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: messages.danger.validationConfirmation,
        },
      });
      expect(mockValidateAccountDeletionSetup).not.toHaveBeenCalled();
      expect(mockDisableProfile).not.toHaveBeenCalled();
      expect(mockDeleteAccountData).not.toHaveBeenCalled();
    });

    it("returns an unauthorized error when the user is not authenticated", async () => {
      mockRequireAuth.mockResolvedValue({
        data: null,
        error: { code: "UNAUTHORIZED", message: "Not signed in" },
      });

      const result = await deleteAccount({
        confirmation: "delete-account",
      });

      expect(result).toEqual({
        data: null,
        error: { code: "UNAUTHORIZED", message: "Not signed in" },
      });
      expect(mockValidateAccountDeletionSetup).not.toHaveBeenCalled();
      expect(mockDisableProfile).not.toHaveBeenCalled();
    });

    it("fails fast when admin deletion setup is not available", async () => {
      mockValidateAccountDeletionSetup.mockResolvedValue({
        data: null,
        error: {
          code: "EXTERNAL_SERVICE_ERROR",
          message: "Missing SUPABASE_SERVICE_ROLE_KEY.",
        },
      });

      const result = await deleteAccount({
        confirmation: "delete-account",
      });

      expect(result).toEqual({
        data: null,
        error: {
          code: "EXTERNAL_SERVICE_ERROR",
          message: "Missing SUPABASE_SERVICE_ROLE_KEY.",
        },
      });
      expect(mockDisableProfile).not.toHaveBeenCalled();
      expect(mockSignOut).not.toHaveBeenCalled();
      expect(mockDeleteAccountData).not.toHaveBeenCalled();
    });

    it("returns an external service error when storage cleanup fails", async () => {
      mockDeleteAccountData.mockResolvedValue({
        data: null,
        error: {
          code: "EXTERNAL_SERVICE_ERROR",
          message: "Failed to delete uploaded media",
        },
      });

      const result = await deleteAccount({
        confirmation: "delete-account",
      });

      expect(result).toEqual({
        data: null,
        error: {
          code: "EXTERNAL_SERVICE_ERROR",
          message: "Failed to delete uploaded media",
        },
      });
    });

    it("returns an external service error when auth user deletion fails", async () => {
      mockDeleteAccountData.mockResolvedValue({
        data: null,
        error: {
          code: "EXTERNAL_SERVICE_ERROR",
          message: "Failed to permanently delete auth user",
        },
      });

      const result = await deleteAccount({
        confirmation: "delete-account",
      });

      expect(result).toEqual({
        data: null,
        error: {
          code: "EXTERNAL_SERVICE_ERROR",
          message: "Failed to permanently delete auth user",
        },
      });
    });
  });
});
