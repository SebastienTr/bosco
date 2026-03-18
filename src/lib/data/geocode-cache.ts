import { createClient } from "@/lib/supabase/server";

export type GeoResult = {
  name: string;
  country: string | null;
  country_code: string | null;
};

export async function getCachedGeocode(
  latKey: string,
  lonKey: string,
): Promise<GeoResult | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("geocode_cache")
    .select("name, country, country_code")
    .eq("lat_key", latKey)
    .eq("lon_key", lonKey)
    .single();

  if (error || !data) return null;
  return { name: data.name, country: data.country, country_code: data.country_code ?? null };
}

export async function upsertGeocode(
  latKey: string,
  lonKey: string,
  name: string,
  country: string | null,
  countryCode: string | null,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("geocode_cache")
    .upsert({ lat_key: latKey, lon_key: lonKey, name, country, country_code: countryCode });
}
