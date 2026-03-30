import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  disableAccountProfile,
  deleteAccountData,
  validateAccountDeletionSetup,
} from "./account-deletion";

const mockDeleteFilesRecursively = vi.fn();
const mockDeleteUser = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
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
      from: vi.fn(() => ({
        update: (...args: unknown[]) => {
          mockUpdate(...args);
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return { error: null };
            },
          };
        },
      })),
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

  it("deletes storage and the auth user when admin setup is available", async () => {
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

describe("validateAccountDeletionSetup", () => {
  it("returns success when the admin client can be created", async () => {
    const result = await validateAccountDeletionSetup();

    expect(result).toEqual({
      data: { ready: true },
      error: null,
    });
  });

  it("returns a structured error when admin config is missing", async () => {
    mockCreateAdminClient.mockImplementationOnce(() => {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
    });

    const result = await validateAccountDeletionSetup();

    expect(result).toEqual({
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Missing SUPABASE_SERVICE_ROLE_KEY.",
      },
    });
  });
});

describe("disableAccountProfile", () => {
  it("uses the admin client to set disabled_at", async () => {
    const result = await disableAccountProfile("user-123");

    expect(result.error).toBeNull();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled_at: expect.any(String),
        updated_at: expect.any(String),
      }),
    );
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
  });

  it("returns an error when the privileged profile update fails", async () => {
    mockCreateAdminClient.mockReturnValueOnce({
      from: vi.fn(() => ({
        update: () => ({
          eq: () => ({
            error: { message: "new row violates row-level security policy" },
          }),
        }),
      })),
      auth: {
        admin: {
          deleteUser: mockDeleteUser,
        },
      },
    });

    const result = await disableAccountProfile("user-123");

    expect(result).toEqual({
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: "new row violates row-level security policy",
      },
    });
  });
});
