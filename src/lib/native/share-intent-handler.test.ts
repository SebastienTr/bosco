import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock plugin functions
const mockAddListener = vi.fn(
  (_event: string, _listener: (data: { content: string; filename: string }) => void) =>
    Promise.resolve({ remove: vi.fn() })
);
const mockCheckIntent = vi.fn(
  () => Promise.resolve(null as { content: string; filename: string } | null)
);

vi.mock('./gpx-receive', () => ({
  default: {
    addListener: (event: string, listener: (data: { content: string; filename: string }) => void) =>
      mockAddListener(event, listener),
    checkIntent: () => mockCheckIntent(),
  },
}));

// Mock Cache API
const mockCachePut = vi.fn(() => Promise.resolve());
const mockCacheOpen = vi.fn(() =>
  Promise.resolve({ put: mockCachePut })
);

describe('share-intent-handler', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    Object.defineProperty(globalThis, 'caches', {
      value: { open: mockCacheOpen },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  describe('when isNative is true', () => {
    beforeEach(() => {
      vi.doMock('@/lib/platform', () => ({
        isNative: true,
        platform: 'android' as const,
      }));
    });

    it('registers a listener for gpxFileReceived events', async () => {
      const { initShareIntentListener } = await import(
        './share-intent-handler'
      );
      initShareIntentListener();

      expect(mockAddListener).toHaveBeenCalledWith(
        'gpxFileReceived',
        expect.any(Function)
      );
    });

    it('calls checkIntent on init for cold-start fallback', async () => {
      const { initShareIntentListener } = await import(
        './share-intent-handler'
      );
      initShareIntentListener();

      expect(mockCheckIntent).toHaveBeenCalled();
    });

    it('stores content in Cache API and navigates on gpxFileReceived', async () => {
      const { initShareIntentListener } = await import(
        './share-intent-handler'
      );
      initShareIntentListener();

      const listenerCallback = mockAddListener.mock.calls[0]![1]!;

      await listenerCallback({
        content: '<gpx><trk></trk></gpx>',
        filename: 'track.gpx',
      });

      expect(mockCacheOpen).toHaveBeenCalledWith('bosco-share-target');
      expect(mockCachePut).toHaveBeenCalledWith(
        '/shared-gpx',
        expect.any(Response)
      );
      expect(window.location.href).toBe('/share-target?shared=1');
    });

    it('handles cold-start intent from checkIntent', async () => {
      mockCheckIntent.mockResolvedValueOnce({
        content: '<gpx><trk></trk></gpx>',
        filename: 'cold-start.gpx',
      });

      const { initShareIntentListener } = await import(
        './share-intent-handler'
      );
      initShareIntentListener();

      await vi.waitFor(() => {
        expect(mockCacheOpen).toHaveBeenCalledWith('bosco-share-target');
      });

      expect(mockCachePut).toHaveBeenCalledWith(
        '/shared-gpx',
        expect.any(Response)
      );
      expect(window.location.href).toBe('/share-target?shared=1');
    });

    it('deduplicates when both listener and checkIntent fire the same data', async () => {
      const sharedData = {
        content: '<gpx><trk></trk></gpx>',
        filename: 'dedup.gpx',
      };

      // checkIntent returns data (cold-start path)
      mockCheckIntent.mockResolvedValueOnce(sharedData);

      const { initShareIntentListener } = await import(
        './share-intent-handler'
      );
      initShareIntentListener();

      // The listener fires first (retained event)
      const listenerCallback = mockAddListener.mock.calls[0]![1]!;
      await listenerCallback(sharedData);

      // Wait for checkIntent to also resolve
      await vi.waitFor(() => {
        expect(mockCheckIntent).toHaveBeenCalled();
      });

      // Allow microtasks to settle
      await new Promise((r) => setTimeout(r, 10));

      // Cache API should only be called once despite both paths firing
      expect(mockCachePut).toHaveBeenCalledTimes(1);
    });
  });

  describe('when isNative is false', () => {
    beforeEach(() => {
      vi.doMock('@/lib/platform', () => ({
        isNative: false,
        platform: 'web' as const,
      }));
    });

    it('does nothing when isNative is false', async () => {
      const { initShareIntentListener } = await import(
        './share-intent-handler'
      );
      initShareIntentListener();

      expect(mockAddListener).not.toHaveBeenCalled();
      expect(mockCheckIntent).not.toHaveBeenCalled();
    });
  });
});
