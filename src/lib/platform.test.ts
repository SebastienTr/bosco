import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @capacitor/core before importing platform module
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => "web"),
  },
}));

describe("platform detection", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports isNative as false on web", async () => {
    const { isNative } = await import("./platform");
    expect(isNative).toBe(false);
    expect(typeof isNative).toBe("boolean");
  });

  it("exports platform as 'web' when not in native context", async () => {
    const { platform } = await import("./platform");
    expect(platform).toBe("web");
  });

  it("platform type is constrained to ios | android | web", async () => {
    const { platform } = await import("./platform");
    expect(["ios", "android", "web"]).toContain(platform);
  });

  it("reports native when Capacitor says so", async () => {
    const { Capacitor } = await import("@capacitor/core");
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("android");

    const { isNative, platform } = await import("./platform");
    expect(isNative).toBe(true);
    expect(platform).toBe("android");
  });

  it("returns ios platform when on iOS", async () => {
    const { Capacitor } = await import("@capacitor/core");
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("ios");

    const { isNative, platform } = await import("./platform");
    expect(isNative).toBe(true);
    expect(platform).toBe("ios");
  });
});
