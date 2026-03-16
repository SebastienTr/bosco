import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRpc = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: vi.fn((table: string) => {
      if (table !== "profiles") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        select: (...args: unknown[]) => {
          mockSelect(...args);
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return {
                single: () => mockSingle(),
              };
            },
          };
        },
        update: (data: unknown) => {
          mockUpdate(data);
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return {
                select: () => ({
                  single: () => mockSingle(),
                }),
              };
            },
          };
        },
      };
    }),
  })),
}));

const {
  checkUsernameAvailability,
  getProfileByUserId,
  updateProfile,
} = await import("@/lib/data/profiles");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getProfileByUserId", () => {
  it("queries profiles table by user id", async () => {
    const mockProfile = {
      id: "user-123",
      username: "skipper",
      boat_name: "Laurine",
    };
    mockSingle.mockReturnValue({ data: mockProfile, error: null });

    const result = await getProfileByUserId("user-123");

    expect(result).toEqual({ data: mockProfile, error: null });
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
  });
});

describe("checkUsernameAvailability", () => {
  it("checks availability through the RPC helper", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });

    const result = await checkUsernameAvailability("sailor-seb", "user-123");

    expect(result).toEqual({ data: true, error: null });
    expect(mockRpc).toHaveBeenCalledWith("check_pseudo_availability", {
      input_pseudo: "sailor-seb",
      exclude_user_id: "user-123",
    });
  });

  it("returns an external service error when the RPC fails", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    });

    const result = await checkUsernameAvailability("taken-user");

    expect(result).toEqual({
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: "permission denied",
      },
    });
  });
});

describe("updateProfile", () => {
  it("updates profile with provided data", async () => {
    const updatedProfile = {
      id: "user-123",
      username: "new-user",
      boat_name: "New Boat",
    };
    mockSingle.mockReturnValue({ data: updatedProfile, error: null });

    const result = await updateProfile("user-123", {
      username: "new-user",
      boat_name: "New Boat",
    });

    expect(result).toEqual({ data: updatedProfile, error: null });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "new-user",
        boat_name: "New Boat",
        updated_at: expect.any(String),
      }),
    );
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
  });
});
