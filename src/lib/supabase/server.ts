import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { requireSupabaseEnv } from "./config";

// Re-export Supabase types for Tier 2 consumers
export type { User, EmailOtpType } from "@supabase/supabase-js";

export async function createClient() {
  const cookieStore = await cookies();
  const { anonKey, url } = requireSupabaseEnv();

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if middleware refreshes user sessions.
          }
        },
      },
    },
  );
}
