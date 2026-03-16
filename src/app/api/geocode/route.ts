import { NextRequest, NextResponse } from "next/server";

// In-memory cache: key = "lat,lon" rounded to 3 decimals (~111m precision)
const cache = new Map<string, { name: string; country: string | null }>();
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100; // >1 second between Nominatim requests

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
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

  const key = cacheKey(lat, lon);
  if (cache.has(key)) {
    return NextResponse.json(cache.get(key));
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
    cache.set(key, result);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ name: "", country: null });
  }
}
