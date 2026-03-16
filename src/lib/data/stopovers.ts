import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export type Stopover = Tables<"stopovers">;
export type StopoverInsert = Omit<TablesInsert<"stopovers">, "id" | "created_at">;
export type StopoverUpdate = TablesUpdate<"stopovers">;

export async function insertStopovers(stopovers: StopoverInsert[]) {
  const supabase = await createClient();
  return supabase.from("stopovers").insert(stopovers).select();
}

export async function getStopoversByVoyageId(voyageId: string) {
  const supabase = await createClient();
  return supabase
    .from("stopovers")
    .select("*")
    .eq("voyage_id", voyageId)
    .order("arrived_at", { ascending: true, nullsFirst: false });
}

export async function updateStopover(id: string, data: Partial<StopoverUpdate>) {
  const supabase = await createClient();
  return supabase.from("stopovers").update(data).eq("id", id).select().single();
}

export async function deleteStopover(id: string) {
  const supabase = await createClient();
  return supabase.from("stopovers").delete().eq("id", id);
}
