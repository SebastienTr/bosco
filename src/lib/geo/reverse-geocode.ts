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

export async function reverseGeocodeServer(
  lat: number,
  lon: number,
): Promise<{ name: string; country: string | null }> {
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

    const result = { name, country };
    serverCache.set(key, result);
    return result;
  } catch {
    return { name: "", country: null };
  }
}
