import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn((table: string) => {
      if (table !== "profiles") throw new Error(`Unexpected table: ${table}`);
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

const { getProfileByUserId, updateProfile } = await import(
  "@/lib/data/profiles"
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getProfileByUserId", () => {
  it("queries profiles table by user id", async () => {
    const mockProfile = {
      id: "user-123",
      pseudo: "skipper",
      boat_name: "Laurine",
    };
    mockSingle.mockReturnValue({ data: mockProfile, error: null });

    const result = await getProfileByUserId("user-123");

    expect(result).toEqual({ data: mockProfile, error: null });
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
  });
});

describe("updateProfile", () => {
  it("updates profile with provided data", async () => {
    const updatedProfile = {
      id: "user-123",
      pseudo: "new-pseudo",
      boat_name: "New Boat",
    };
    mockSingle.mockReturnValue({ data: updatedProfile, error: null });

    const result = await updateProfile("user-123", {
      pseudo: "new-pseudo",
      boat_name: "New Boat",
    });

    expect(result).toEqual({ data: updatedProfile, error: null });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        pseudo: "new-pseudo",
        boat_name: "New Boat",
        updated_at: expect.any(String),
      }),
    );
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
  });
});
