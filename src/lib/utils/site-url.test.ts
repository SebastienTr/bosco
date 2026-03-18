import { describe, it, expect, vi, beforeEach } from "vitest";

describe("siteUrl", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    // Clear module cache so env changes take effect
    vi.resetModules();
  });

  it("uses NEXT_PUBLIC_SITE_URL when set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://bosco.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "vercel-url.vercel.app");
    const { siteUrl } = await import("./site-url");
    expect(siteUrl).toBe("https://bosco.app");
  });

  it("falls back to VERCEL_PROJECT_PRODUCTION_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "bosco.vercel.app");
    // Empty string is falsy, so should fall through
    const { siteUrl } = await import("./site-url");
    // Empty string is falsy so it should use vercel URL
    expect(siteUrl).toBe("https://bosco.vercel.app");
  });

  it("falls back to localhost when no env vars set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    const { siteUrl } = await import("./site-url");
    expect(siteUrl).toBe("https://localhost:3000");
  });
});
