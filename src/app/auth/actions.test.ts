import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the auth module
const mockSignIn = vi.fn();
vi.mock("@/lib/auth", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: vi.fn(async () => ({ data: null, error: null })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const { sendMagicLink } = await import("./actions");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sendMagicLink", () => {
  it("returns success when email is valid and signIn succeeds", async () => {
    mockSignIn.mockResolvedValue({
      data: { email: "test@example.com" },
      error: null,
    });

    const formData = new FormData();
    formData.set("email", "test@example.com");

    const result = await sendMagicLink(formData);

    expect(result).toEqual({
      data: { email: "test@example.com" },
      error: null,
    });
    expect(mockSignIn).toHaveBeenCalledWith("test@example.com");
  });

  it("returns VALIDATION_ERROR when email is invalid", async () => {
    const formData = new FormData();
    formData.set("email", "not-an-email");

    const result = await sendMagicLink(formData);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("returns VALIDATION_ERROR when email is missing", async () => {
    const formData = new FormData();

    const result = await sendMagicLink(formData);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns error from signIn when it fails", async () => {
    mockSignIn.mockResolvedValue({
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: "Rate limit" },
    });

    const formData = new FormData();
    formData.set("email", "test@example.com");

    const result = await sendMagicLink(formData);

    expect(result).toEqual({
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: "Rate limit" },
    });
  });

  it("passes next through to signIn when provided", async () => {
    mockSignIn.mockResolvedValue({
      data: { email: "test@example.com" },
      error: null,
    });

    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("next", "/share-target?shared=1");

    await sendMagicLink(formData);

    expect(mockSignIn).toHaveBeenCalledWith(
      "test@example.com",
      "/share-target?shared=1",
    );
  });
});
