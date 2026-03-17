import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShareTargetHandler } from "./ShareTargetHandler";
import { messages } from "./messages";

const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/app/dashboard/actions", () => ({
  createVoyage: vi.fn(),
}));

// Mock Cache API — jsdom doesn't support Response fully, so use a plain object
function mockCaches(hasFile: boolean) {
  const fakeResponse = hasFile
    ? { blob: vi.fn().mockResolvedValue(new Blob(["<gpx></gpx>"])) }
    : undefined;
  const mockCache = {
    match: vi.fn().mockResolvedValue(fakeResponse),
    delete: vi.fn(),
  };
  Object.defineProperty(window, "caches", {
    value: { open: vi.fn().mockResolvedValue(mockCache) },
    writable: true,
    configurable: true,
  });
  return mockCache;
}

describe("ShareTargetHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset caches
    Object.defineProperty(window, "caches", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("shows no-file state when Cache API has no file", async () => {
    const mockCache = mockCaches(false);

    render(
      <ShareTargetHandler isAuthenticated={true} voyages={[]} />,
    );

    // Wait for async effect
    expect(
      await screen.findByText(messages.noFile.title),
    ).toBeTruthy();
    expect(mockCache.match).toHaveBeenCalledWith("/shared-gpx");
  });

  it("redirects to auth when not authenticated and file exists", async () => {
    const mockCache = mockCaches(true);

    render(
      <ShareTargetHandler isAuthenticated={false} voyages={[]} />,
    );

    expect(
      await screen.findByText(messages.notAuthenticated.title),
    ).toBeTruthy();
    expect(localStorage.getItem("bosco-share-pending")).toBe("true");
    expect(mockCache.match).toHaveBeenCalledWith("/shared-gpx");

    fireEvent.click(screen.getByRole("button", { name: messages.notAuthenticated.cta }));
    expect(mockPush).toHaveBeenCalledWith(
      "/auth?next=%2Fshare-target%3Fshared%3D1",
    );
  });

  it("redirects to most recent voyage import when authenticated with voyages", async () => {
    mockCaches(true);

    render(
      <ShareTargetHandler
        isAuthenticated={true}
        voyages={[
          { id: "voyage-1", name: "Test Voyage" },
          { id: "voyage-2", name: "Old Voyage" },
        ]}
      />,
    );

    // Wait for the redirect
    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/voyage/voyage-1/import?shared=1",
      );
    });
  });

  it("shows voyage creation form when authenticated with no voyages", async () => {
    mockCaches(true);

    render(
      <ShareTargetHandler isAuthenticated={true} voyages={[]} />,
    );

    expect(
      await screen.findByText(messages.createVoyage.title),
    ).toBeTruthy();
  });
});
