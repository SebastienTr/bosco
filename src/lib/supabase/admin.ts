import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { requireSupabaseAdminEnv, requireSupabaseEnv } from "./config";

export function createAdminClient() {
  const { url } = requireSupabaseEnv();
  const { serviceRoleKey } = requireSupabaseAdminEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
