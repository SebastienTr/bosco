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
      if (!["profiles", "public_profiles"].includes(table)) {
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
  disableProfile,
  getProfileByUserId,
  getPublicProfileByUsername,
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

describe("getPublicProfileByUsername", () => {
  it("queries public profile fields by username", async () => {
    const mockProfile = {
      id: "user-123",
      username: "skipper",
      boat_name: "Laurine",
      boat_type: "Sloop",
      bio: "Heading south",
      profile_photo_url: null,
      boat_photo_url: null,
    };
    mockSingle.mockReturnValue({ data: mockProfile, error: null });

    const result = await getPublicProfileByUsername("skipper");

    expect(result).toEqual({ data: mockProfile, error: null });
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("username", "skipper");
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

describe("disableProfile", () => {
  it("sets disabled_at for the current profile", async () => {
    mockEq.mockReturnValue({ error: null });

    const result = await disableProfile("user-123");

    expect(result.error).toBeNull();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled_at: expect.any(String),
        updated_at: expect.any(String),
      }),
    );
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
  });
});
