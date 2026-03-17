import {
  getCachedGeocode,
  upsertGeocode,
} from "@/lib/data/geocode-cache";

/**
 * Server-side reverse geocode — calls Nominatim directly.
 * Used by Server Actions that can't call their own API route.
 *
 * Uses a two-level cache:
 * - L1: in-memory Map for same-request dedup within batch calls
 * - L2: Supabase `geocode_cache` table for cross-request / cold-start persistence
 */

const l1Cache = new Map<string, { name: string; country: string | null }>();
let serverLastRequestTime = 0;
const MIN_INTERVAL_MS = 1100;

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

/** Split a cache key into lat_key and lon_key for DB storage */
function splitCacheKey(key: string): { latKey: string; lonKey: string } {
  const [latKey, lonKey] = key.split(",");
  return { latKey, lonKey };
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
  const { latKey, lonKey } = splitCacheKey(key);

  // L1: in-memory cache
  if (l1Cache.has(key)) {
    return l1Cache.get(key)!;
  }

  // L2: DB cache
  const cached = await getCachedGeocode(latKey, lonKey);
  if (cached) {
    l1Cache.set(key, cached);
    return cached;
  }

  // Rate limit before calling Nominatim
  const now = Date.now();
  const elapsed = now - serverLastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  serverLastRequestTime = Date.now();

  const result = await fetchNominatim(lat, lon);
  l1Cache.set(key, result);

  // Only cache successful results (non-empty name) to allow retries on failure
  if (result.name) {
    void upsertGeocode(latKey, lonKey, result.name, result.country);
  }

  return result;
}

/**
 * Batch reverse geocode — deduplicates by cache key, fetches unique
 * locations sequentially with rate limiting. Safe for small batches (< 15 stopovers).
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

  // Check L1 and L2 caches for each unique key, collect misses
  const uniqueEntries = Array.from(keyToIndex.entries());
  const resolvedResults = new Map<string, GeoResult>();
  const misses: { key: string; indices: number[] }[] = [];

  for (const [key, indices] of uniqueEntries) {
    // L1 check
    const l1 = l1Cache.get(key);
    if (l1) {
      resolvedResults.set(key, l1);
      continue;
    }

    // L2 check
    const { latKey, lonKey } = splitCacheKey(key);
    const cached = await getCachedGeocode(latKey, lonKey);
    if (cached) {
      l1Cache.set(key, cached);
      resolvedResults.set(key, cached);
      continue;
    }

    misses.push({ key, indices });
  }

  // Fetch misses sequentially with rate limiting
  for (const { key, indices } of misses) {
    const now = Date.now();
    const elapsed = now - serverLastRequestTime;
    if (elapsed < MIN_INTERVAL_MS) {
      await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
    }
    serverLastRequestTime = Date.now();

    const { lat, lon } = points[indices[0]];
    const result = await fetchNominatim(lat, lon);
    l1Cache.set(key, result);
    resolvedResults.set(key, result);

    // Only cache successful results (non-empty name)
    if (result.name) {
      const { latKey, lonKey } = splitCacheKey(key);
      void upsertGeocode(latKey, lonKey, result.name, result.country);
    }
  }

  // Map results back to original order
  const results: GeoResult[] = points.map(() => ({ name: "", country: null }));
  for (const [key, indices] of uniqueEntries) {
    const result = resolvedResults.get(key) ?? { name: "", country: null };
    for (const i of indices) {
      results[i] = result;
    }
  }

  return results;
}
