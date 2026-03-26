import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export type LogEntry = Tables<"log_entries">;
export type LogEntryInsert = Omit<
  TablesInsert<"log_entries">,
  "id" | "created_at" | "updated_at"
>;
export type LogEntryUpdate = TablesUpdate<"log_entries">;

export async function insertLogEntry(entry: LogEntryInsert) {
  const supabase = await createClient();
  return supabase.from("log_entries").insert(entry).select().single();
}

export async function getLogEntriesByVoyageId(voyageId: string) {
  const supabase = await createClient();
  return supabase
    .from("log_entries")
    .select("*")
    .eq("voyage_id", voyageId)
    .order("entry_date", { ascending: false });
}

export async function getLogEntryById(id: string) {
  const supabase = await createClient();
  return supabase.from("log_entries").select("*").eq("id", id).single();
}

export async function updateLogEntry(id: string, data: LogEntryUpdate) {
  const supabase = await createClient();
  return supabase
    .from("log_entries")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
}

export async function deleteLogEntry(id: string) {
  const supabase = await createClient();
  return supabase.from("log_entries").delete().eq("id", id);
}
