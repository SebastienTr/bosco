import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create mock App functions
const mockAddListener = vi.fn(
  (
    _event: string,
    _listener: (data: { url: string }) => void,
  ) => Promise.resolve({ remove: vi.fn() }),
);
const mockGetLaunchUrl = vi.fn(
  () => Promise.resolve(null as { url: string } | null),
);

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: (
      event: string,
      listener: (data: { url: string }) => void,
    ) => mockAddListener(event, listener),
    getLaunchUrl: () => mockGetLaunchUrl(),
  },
}));

describe("deep-link-handler", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    Object.defineProperty(window, "location", {
      value: { href: "", pathname: "/", search: "", hash: "" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  describe("when isNative is true", () => {
    beforeEach(() => {
      vi.doMock("@/lib/platform", () => ({
        isNative: true,
        platform: "android" as const,
      }));
    });

    it("registers a listener for appUrlOpen events", async () => {
      const { initDeepLinkListener } = await import("./deep-link-handler");
      initDeepLinkListener();

      expect(mockAddListener).toHaveBeenCalledWith(
        "appUrlOpen",
        expect.any(Function),
      );
    });

    it("calls getLaunchUrl on init for cold-start handling", async () => {
      const { initDeepLinkListener } = await import("./deep-link-handler");
      initDeepLinkListener();

      expect(mockGetLaunchUrl).toHaveBeenCalled();
    });

    it("navigates to extracted path on appUrlOpen event", async () => {
      const { initDeepLinkListener } = await import("./deep-link-handler");
      initDeepLinkListener();

      const listenerCallback = mockAddListener.mock.calls[0]![1]!;
      listenerCallback({
        url: "https://www.sailbosco.com/auth/confirm?code=abc123",
      });

      expect(window.location.href).toBe("/auth/confirm?code=abc123");
    });

    it("navigates on cold-start launch URL", async () => {
      mockGetLaunchUrl.mockResolvedValueOnce({
        url: "https://www.sailbosco.com/seb/atlantic-crossing",
      });

      const { initDeepLinkListener } = await import("./deep-link-handler");
      initDeepLinkListener();

      await vi.waitFor(() => {
        expect(window.location.href).toBe("/seb/atlantic-crossing");
      });
    });

    it("extracts path + query + hash correctly", async () => {
      const { initDeepLinkListener } = await import("./deep-link-handler");
      initDeepLinkListener();

      const listenerCallback = mockAddListener.mock.calls[0]![1]!;
      listenerCallback({
        url: "https://www.sailbosco.com/voyage/123?tab=map#details",
      });

      expect(window.location.href).toBe("/voyage/123?tab=map#details");
    });

    it("does not navigate if already on the same path", async () => {
      Object.defineProperty(window, "location", {
        value: {
          href: "",
          pathname: "/dashboard",
          search: "",
          hash: "",
        },
        writable: true,
        configurable: true,
      });

      const { initDeepLinkListener } = await import("./deep-link-handler");
      initDeepLinkListener();

      const listenerCallback = mockAddListener.mock.calls[0]![1]!;
      listenerCallback({
        url: "https://www.sailbosco.com/dashboard",
      });

      // href should not be updated since we're already there
      expect(window.location.href).toBe("");
    });

    it("deduplicates when both appUrlOpen and getLaunchUrl fire the same URL", async () => {
      const deepLinkUrl = "https://www.sailbosco.com/auth/confirm?code=abc123";
      const hrefSetter = vi.fn();

      Object.defineProperty(window, "location", {
        value: {
          get href() {
            return "";
          },
          set href(val: string) {
            hrefSetter(val);
          },
          pathname: "/",
          search: "",
          hash: "",
        },
        writable: true,
        configurable: true,
      });

      // getLaunchUrl returns the URL (cold-start path)
      mockGetLaunchUrl.mockResolvedValueOnce({ url: deepLinkUrl });

      const { initDeepLinkListener } = await import("./deep-link-handler");
      initDeepLinkListener();

      // The appUrlOpen listener fires first (retained event)
      const listenerCallback = mockAddListener.mock.calls[0]![1]!;
      listenerCallback({ url: deepLinkUrl });

      // Wait for getLaunchUrl to also resolve
      await vi.waitFor(() => {
        expect(mockGetLaunchUrl).toHaveBeenCalled();
      });
      await new Promise((r) => setTimeout(r, 10));

      // Navigation should only happen once despite both sources firing
      expect(hrefSetter).toHaveBeenCalledTimes(1);
      expect(hrefSetter).toHaveBeenCalledWith("/auth/confirm?code=abc123");
    });

    it("handles invalid URLs gracefully without throwing", async () => {
      const { initDeepLinkListener } = await import("./deep-link-handler");
      initDeepLinkListener();

      const listenerCallback = mockAddListener.mock.calls[0]![1]!;

      // Should not throw
      expect(() => {
        listenerCallback({ url: "not-a-valid-url" });
      }).not.toThrow();

      // href should not change
      expect(window.location.href).toBe("");
    });
  });

  describe("when isNative is false", () => {
    beforeEach(() => {
      vi.doMock("@/lib/platform", () => ({
        isNative: false,
        platform: "web" as const,
      }));
    });

    it("does nothing when isNative is false", async () => {
      const { initDeepLinkListener } = await import("./deep-link-handler");
      initDeepLinkListener();

      expect(mockAddListener).not.toHaveBeenCalled();
      expect(mockGetLaunchUrl).not.toHaveBeenCalled();
    });
  });
});
