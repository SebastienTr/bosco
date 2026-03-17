import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { requireSupabaseEnv } from "./config";

export function createClient() {
  const { publishableKey, url } = requireSupabaseEnv();

  return createBrowserClient<Database>(url, publishableKey);
}
