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
