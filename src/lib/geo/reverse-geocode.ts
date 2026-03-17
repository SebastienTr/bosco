/** Client-side helper to call the /api/geocode proxy */
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<{ name: string; country: string | null }> {
  try {
    const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
    if (!res.ok) return { name: "", country: null };
    return await res.json();
  } catch {
    return { name: "", country: null };
  }
}

/**
 * Server-side reverse geocode — calls Nominatim directly.
 * Used by Server Actions that can't call their own API route.
 */

const serverCache = new Map<string, { name: string; country: string | null }>();
let serverLastRequestTime = 0;
const MIN_INTERVAL_MS = 1100;

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

type GeoResult = { name: string; country: string | null };

async function fetchNominatim(lat: number, lon: number): Promise<GeoResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: { "User-Agent": "Bosco/1.0 (sailing logbook)" },
      },
    );

    if (!response.ok) return { name: "", country: null };

    const data = await response.json();
    const name =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.hamlet ||
      data.name ||
      "";
    const country = data.address?.country ?? null;

    return { name, country };
  } catch {
    return { name: "", country: null };
  }
}

export async function reverseGeocodeServer(
  lat: number,
  lon: number,
): Promise<GeoResult> {
  const key = cacheKey(lat, lon);
  if (serverCache.has(key)) {
    return serverCache.get(key)!;
  }

  const now = Date.now();
  const elapsed = now - serverLastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  serverLastRequestTime = Date.now();

  const result = await fetchNominatim(lat, lon);
  serverCache.set(key, result);
  return result;
}

/**
 * Batch reverse geocode — deduplicates by cache key, fetches unique
 * locations in parallel. Safe for small batches (< 15 stopovers).
 */
export async function reverseGeocodeBatchServer(
  points: { lat: number; lon: number }[],
): Promise<GeoResult[]> {
  // Deduplicate by cache key
  const keyToIndex = new Map<string, number[]>();
  for (let i = 0; i < points.length; i++) {
    const key = cacheKey(points[i].lat, points[i].lon);
    const indices = keyToIndex.get(key) ?? [];
    indices.push(i);
    keyToIndex.set(key, indices);
  }

  // Fetch unique locations in parallel, using cache when available
  const uniqueResults = await Promise.all(
    Array.from(keyToIndex.entries()).map(async ([key, indices]) => {
      const cached = serverCache.get(key);
      if (cached) return { key, indices, result: cached };

      const { lat, lon } = points[indices[0]];
      const result = await fetchNominatim(lat, lon);
      serverCache.set(key, result);
      return { key, indices, result };
    }),
  );

  // Map results back to original order
  const results: GeoResult[] = points.map(() => ({ name: "", country: null }));
  for (const { indices, result } of uniqueResults) {
    for (const i of indices) {
      results[i] = result;
    }
  }

  return results;
}
