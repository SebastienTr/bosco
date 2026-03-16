const SUPABASE_ANON_KEY_PLACEHOLDER = "your-anon-key-here";

type SupabaseEnv = {
  anonKey: string;
  url: string;
};

function normalizeEnvValue(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

export function getSupabaseEnv(
  env: NodeJS.ProcessEnv = process.env,
): SupabaseEnv | null {
  const url = normalizeEnvValue(env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizeEnvValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !anonKey || anonKey === SUPABASE_ANON_KEY_PLACEHOLDER) {
    return null;
  }

  return { anonKey, url };
}

export function requireSupabaseEnv(env: NodeJS.ProcessEnv = process.env) {
  const supabaseEnv = getSupabaseEnv(env);

  if (!supabaseEnv) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Run `supabase status` and update `.env.local` before using Supabase-backed features.",
    );
  }

  return supabaseEnv;
}
