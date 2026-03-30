import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAccountData } from "./account-deletion";

const mockDeleteFilesRecursively = vi.fn();
const mockDeleteUser = vi.fn();
const mockCreateAdminClient = vi.fn();

vi.mock("@/lib/storage", () => ({
  deleteFilesRecursively: (...args: unknown[]) => mockDeleteFilesRecursively(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: (...args: unknown[]) => mockCreateAdminClient(...args),
}));

describe("deleteAccountData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateAdminClient.mockReturnValue({
      auth: {
        admin: {
          deleteUser: mockDeleteUser,
        },
      },
    });
    mockDeleteFilesRecursively.mockResolvedValue({
      data: { deletedPaths: [] },
      error: null,
    });
    mockDeleteUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  it("disables the profile before deleting storage and the auth user", async () => {
    const result = await deleteAccountData("user-123");

    expect(result).toEqual({ data: { success: true }, error: null });
    expect(mockDeleteFilesRecursively).toHaveBeenNthCalledWith(
      1,
      "avatars",
      "user-123",
      expect.any(Object),
    );
    expect(mockDeleteFilesRecursively).toHaveBeenNthCalledWith(
      2,
      "voyage-covers",
      "user-123",
      expect.any(Object),
    );
    expect(mockDeleteFilesRecursively).toHaveBeenNthCalledWith(
      3,
      "log-photos",
      "user-123",
      expect.any(Object),
    );
    expect(mockDeleteUser).toHaveBeenCalledWith("user-123");
  });

  it("returns an error when storage cleanup fails before auth deletion", async () => {
    mockDeleteFilesRecursively.mockResolvedValueOnce({
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Failed to delete avatars",
      },
    });

    const result = await deleteAccountData("user-123");

    expect(result).toEqual({
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Failed to delete avatars",
      },
    });
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it("returns an error when auth user deletion fails", async () => {
    mockDeleteUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Delete user failed" },
    });

    const result = await deleteAccountData("user-123");

    expect(result).toEqual({
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Delete user failed",
      },
    });
  });
});
