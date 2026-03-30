import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";
import { getPublicProfileByUsername, type PublicProfile } from "./profiles";

export type Voyage = Tables<"voyages">;
export type VoyageInsert = Omit<
  TablesInsert<"voyages">,
  "id" | "created_at" | "updated_at"
>;
type PublicVoyageProfile = Pick<
  PublicProfile,
  "id" | "username" | "boat_name" | "boat_type" | "profile_photo_url"
>;
type PublicVoyageLeg = Pick<
  Tables<"legs">,
  | "id"
  | "track_geojson"
  | "distance_nm"
  | "duration_seconds"
  | "started_at"
  | "ended_at"
  | "avg_speed_kts"
  | "max_speed_kts"
>;
type PublicVoyageStopover = Pick<
  Tables<"stopovers">,
  | "id"
  | "name"
  | "country"
  | "country_code"
  | "latitude"
  | "longitude"
  | "arrived_at"
  | "departed_at"
>;
export type PublicVoyage = Voyage & {
  legs: PublicVoyageLeg[] | null;
  profiles: PublicVoyageProfile;
  stopovers: PublicVoyageStopover[] | null;
};

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

export async function getPublicVoyageBySlug(
  username: string,
  slug: string,
): Promise<ActionResponse<PublicVoyage>> {
  const { data: profile, error: profileError } =
    await getPublicProfileByUsername(username);

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        code: "NOT_FOUND",
        message: profileError?.message ?? "Public profile not found",
      },
    };
  }

  const supabase = await createClient();
  const { data: voyage, error } = await supabase
    .from("voyages")
    .select(`
      *,
      legs(id, track_geojson, distance_nm, duration_seconds, started_at, ended_at, avg_speed_kts, max_speed_kts),
      stopovers(id, name, country, country_code, latitude, longitude, arrived_at, departed_at)
    `)
    .eq("user_id", profile.id)
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (error || !voyage) {
    return {
      data: null,
      error: {
        code: error?.code === "PGRST116" ? "NOT_FOUND" : "EXTERNAL_SERVICE_ERROR",
        message: error?.message ?? "Public voyage not found",
      },
    };
  }

  return {
    data: {
      ...voyage,
      profiles: {
        id: profile.id,
        username: profile.username,
        boat_name: profile.boat_name,
        boat_type: profile.boat_type,
        profile_photo_url: profile.profile_photo_url,
      },
    },
    error: null,
  };
}

export async function getPublicVoyagesByUserId(userId: string) {
  const supabase = await createClient();

  return supabase
    .from("voyages")
    .select(`
      id,
      name,
      slug,
      description,
      cover_image_url,
      created_at,
      updated_at,
      legs(id, track_geojson, distance_nm),
      stopovers(id, country)
    `)
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("updated_at", { ascending: false });
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
