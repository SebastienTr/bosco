import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Supabase server client
const mockSignInWithOtp = vi.fn();
const mockSignOut = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithOtp: mockSignInWithOtp,
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
  })),
}));

// Import after mocking
const { signIn, signOut, getUser, requireAuth } = await import(
  "@/lib/auth"
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signIn", () => {
  it("returns success with email on successful OTP send", async () => {
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });

    const result = await signIn("test@example.com");

    expect(result).toEqual({ data: { email: "test@example.com" }, error: null });
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: expect.objectContaining({
        emailRedirectTo: expect.stringContaining("/auth/confirm"),
      }),
    });
  });

  it("includes next in the OTP redirect URL when provided", async () => {
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });

    await signIn("test@example.com", "/share-target?shared=1");

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: expect.objectContaining({
        emailRedirectTo: expect.stringContaining(
          "/auth/confirm?next=%2Fshare-target%3Fshared%3D1",
        ),
      }),
    });
  });

  it("returns error when OTP send fails", async () => {
    mockSignInWithOtp.mockResolvedValue({
      data: null,
      error: { message: "Rate limit exceeded" },
    });

    const result = await signIn("test@example.com");

    expect(result).toEqual({
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: "Rate limit exceeded" },
    });
  });
});

describe("signOut", () => {
  it("returns success on successful sign out", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const result = await signOut();

    expect(result).toEqual({ data: null, error: null });
  });

  it("returns error when sign out fails", async () => {
    mockSignOut.mockResolvedValue({
      error: { message: "Session not found" },
    });

    const result = await signOut();

    expect(result).toEqual({
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: "Session not found" },
    });
  });
});

describe("getUser", () => {
  it("returns user when authenticated", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    const user = await getUser();

    expect(user).toEqual(mockUser);
  });

  it("returns null when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const user = await getUser();

    expect(user).toBeNull();
  });
});

describe("requireAuth", () => {
  it("returns user when authenticated", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    const result = await requireAuth();

    expect(result).toEqual({ data: mockUser, error: null });
  });

  it("returns UNAUTHORIZED error when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await requireAuth();

    expect(result).toEqual({
      data: null,
      error: { code: "UNAUTHORIZED", message: "You must be signed in" },
    });
  });
});
