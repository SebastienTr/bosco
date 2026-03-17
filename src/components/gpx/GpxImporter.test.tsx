import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GpxImporter } from "./GpxImporter";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/app/voyage/[id]/import/actions", () => ({
  importTracks: vi.fn(),
}));

vi.mock("@/lib/gpx/parser", () => ({
  parseGpx: vi.fn(() => []),
}));

vi.mock("@/lib/gpx/import", () => ({
  mergeTracksToSingleLeg: vi.fn(),
  statsToLegData: vi.fn(),
}));

// Mock Worker
const mockPostMessage = vi.fn();
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = mockPostMessage;
  terminate = vi.fn();
}

vi.stubGlobal("Worker", MockWorker);

// Mock Cache API — jsdom doesn't support Response fully, so use a plain object
function mockCaches(hasFile: boolean) {
  const mockDelete = vi.fn();
  const gpxBlob = new Blob(
    ['<?xml version="1.0"?><gpx><trk><trkseg></trkseg></trk></gpx>'],
    { type: "application/gpx+xml" },
  );
  const fakeResponse = hasFile
    ? {
        blob: vi.fn().mockResolvedValue(gpxBlob),
      }
    : undefined;
  const mockCache = {
    match: vi.fn().mockResolvedValue(fakeResponse),
    delete: mockDelete,
  };
  Object.defineProperty(window, "caches", {
    value: { open: vi.fn().mockResolvedValue(mockCache) },
    writable: true,
    configurable: true,
  });
  return { mockCache, mockDelete };
}

describe("GpxImporter autoImportFromShare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "caches", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("reads file from Cache API and auto-processes when autoImportFromShare is true", async () => {
    const { mockCache } = mockCaches(true);

    render(
      <GpxImporter
        voyageId="test-voyage"
        voyageName="Test"
        autoImportFromShare={true}
      />,
    );

    await vi.waitFor(() => {
      expect(mockCache.match).toHaveBeenCalledWith("/shared-gpx");
    });

    // Worker should have received a message
    await vi.waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "process" }),
      );
    });
  });

  it("falls back to file picker when autoImportFromShare is true but no file in cache", async () => {
    mockCaches(false);

    const { container } = render(
      <GpxImporter
        voyageId="test-voyage"
        voyageName="Test"
        autoImportFromShare={true}
      />,
    );

    // Should still show the file picker (idle state)
    await vi.waitFor(() => {
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeTruthy();
    });
  });
});
