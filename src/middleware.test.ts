import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { middleware } from "./middleware";

const mockUpdateSession = vi.fn();

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: (...args: unknown[]) => mockUpdateSession(...args),
}));

vi.mock("@/lib/security/public-csp", () => ({
  buildPublicVoyageCsp: vi.fn(() => "default-src 'self'"),
  createCspNonce: vi.fn(() => "nonce"),
  isPublicVoyagePath: vi.fn(() => false),
}));

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateSession.mockResolvedValue({
      response: new Response(null, { status: 200 }),
      user: null,
    });
  });

  it("keeps the auth page reachable when a stale session resolves to no user", async () => {
    const response = await middleware(
      new NextRequest("https://example.com/auth"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects protected routes to auth when no active user remains", async () => {
    const response = await middleware(
      new NextRequest("https://example.com/dashboard"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.com/auth");
  });
});
