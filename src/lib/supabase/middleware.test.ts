import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateSession } from "./middleware";

const mockGetUser = vi.fn();
const mockSignOut = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock("@/lib/supabase/config", () => ({
  getSupabaseEnv: vi.fn(() => ({
    url: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
  })),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
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
                maybeSingle: () => mockMaybeSingle(),
              };
            },
          };
        },
      };
    }),
  })),
}));

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ error: null });
  });

  it("returns the authenticated user when the profile is active", async () => {
    const user = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user } });
    mockMaybeSingle.mockResolvedValue({
      data: { disabled_at: null },
      error: null,
    });

    const result = await updateSession(
      new NextRequest("https://example.com/dashboard"),
    );

    expect(result.user).toEqual(user);
    expect(mockSelect).toHaveBeenCalledWith("disabled_at");
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
  });

  it("returns no user when the profile has been disabled", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: "user-123", email: "test@example.com" },
      },
    });
    mockMaybeSingle.mockResolvedValue({
      data: { disabled_at: "2026-03-30T08:00:00.000Z" },
      error: null,
    });

    const result = await updateSession(
      new NextRequest("https://example.com/dashboard"),
    );

    expect(result.user).toBeNull();
    expect(mockSignOut).toHaveBeenCalled();
  });
});
