import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { requireSupabaseEnv } from "./config";

export function createClient() {
  const { anonKey, url } = requireSupabaseEnv();

  return createBrowserClient<Database>(url, anonKey);
}
