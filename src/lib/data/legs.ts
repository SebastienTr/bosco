import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/supabase";

export type Leg = Tables<"legs">;
export type LegInsert = Omit<TablesInsert<"legs">, "id" | "created_at">;

export async function insertLegs(legs: LegInsert[]) {
  const supabase = await createClient();
  return supabase.from("legs").insert(legs).select();
}

export async function deleteLeg(id: string) {
  const supabase = await createClient();
  return supabase.from("legs").delete().eq("id", id);
}

export async function getLegsByVoyageId(voyageId: string) {
  const supabase = await createClient();
  return supabase
    .from("legs")
    .select("*")
    .eq("voyage_id", voyageId)
    .order("started_at", { ascending: true, nullsFirst: false });
}
