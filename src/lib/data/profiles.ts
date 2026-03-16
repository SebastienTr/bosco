import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesUpdate } from "@/types/supabase";

export type Profile = Tables<"profiles">;
export type ProfileUpdate = Omit<
  TablesUpdate<"profiles">,
  "created_at" | "id" | "updated_at"
>;

export async function getProfileByUserId(userId: Profile["id"]) {
  const supabase = await createClient();

  return supabase.from("profiles").select("*").eq("id", userId).single();
}

export async function updateProfile(userId: Profile["id"], data: ProfileUpdate) {
  const supabase = await createClient();
  const updateData: TablesUpdate<"profiles"> = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  return supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();
}
