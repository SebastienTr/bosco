import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export type Voyage = Tables<"voyages">;
export type VoyageInsert = Omit<
  TablesInsert<"voyages">,
  "id" | "created_at" | "updated_at"
>;

export async function insertVoyage(data: VoyageInsert) {
  const supabase = await createClient();
  return supabase.from("voyages").insert(data).select().single();
}

export async function getVoyagesByUserId(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("voyages")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
}

export async function getVoyageById(id: string) {
  const supabase = await createClient();
  return supabase.from("voyages").select("*").eq("id", id).single();
}

export async function getVoyagesWithStats(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("voyages")
    .select(`
      *,
      legs(id, track_geojson, distance_nm),
      stopovers(id)
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
}

export async function updateVoyage(id: string, data: TablesUpdate<"voyages">) {
  const supabase = await createClient();
  return supabase.from("voyages").update(data).eq("id", id).select().single();
}

export async function deleteVoyage(id: string) {
  const supabase = await createClient();
  return supabase.from("voyages").delete().eq("id", id);
}

export async function getPublicVoyageBySlug(username: string, slug: string) {
  const supabase = await createClient();
  return supabase
    .from("voyages")
    .select(`
      *,
      profiles!inner(id, username, boat_name, boat_type, profile_photo_url),
      legs(id, track_geojson, distance_nm, duration_seconds, started_at, ended_at, avg_speed_kts, max_speed_kts),
      stopovers(id, name, country, latitude, longitude, arrived_at, departed_at)
    `)
    .eq("profiles.username", username)
    .eq("slug", slug)
    .eq("is_public", true)
    .single();
}

export async function checkSlugAvailability(
  userId: string,
  slug: string,
): Promise<ActionResponse<boolean>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("voyages")
    .select("id")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: data === null, error: null };
}
