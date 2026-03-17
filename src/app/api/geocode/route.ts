import { NextRequest, NextResponse } from "next/server";
import { getCachedGeocode, upsertGeocode } from "@/lib/data/geocode-cache";

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100; // >1 second between Nominatim requests

function cacheKey(lat: number, lon: number): { latKey: string; lonKey: string } {
  return { latKey: lat.toFixed(3), lonKey: lon.toFixed(3) };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { name: "", country: null },
      { status: 400 },
    );
  }

  const { latKey, lonKey } = cacheKey(lat, lon);

  // Check DB cache first
  const cached = await getCachedGeocode(latKey, lonKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Rate limiting
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: { "User-Agent": "Bosco/1.0 (sailing logbook)" },
      },
    );

    if (!response.ok) {
      return NextResponse.json({ name: "", country: null });
    }

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

    // Only cache successful results (non-empty name) to allow retries on failure
    if (name) {
      void upsertGeocode(latKey, lonKey, name, country);
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ name: "", country: null });
  }
}
