import { createClient } from "@/lib/supabase/server";

export async function getCachedGeocode(
  latKey: string,
  lonKey: string,
): Promise<{ name: string; country: string | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("geocode_cache")
    .select("name, country")
    .eq("lat_key", latKey)
    .eq("lon_key", lonKey)
    .single();

  if (error || !data) return null;
  return { name: data.name, country: data.country };
}

export async function upsertGeocode(
  latKey: string,
  lonKey: string,
  name: string,
  country: string | null,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("geocode_cache")
    .upsert({ lat_key: latKey, lon_key: lonKey, name, country });
}
