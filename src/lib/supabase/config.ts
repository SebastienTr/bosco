const PUBLISHABLE_KEY_PLACEHOLDER = "your-publishable-key-here";
const SERVICE_ROLE_KEY_PLACEHOLDER = "your-service-role-key-here";

type SupabaseEnv = {
  publishableKey: string;
  url: string;
};

type SupabaseAdminEnv = {
  serviceRoleKey: string;
};

function normalizeEnvValue(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

export function getSupabaseEnv(
  env: NodeJS.ProcessEnv = process.env,
): SupabaseEnv | null {
  const url = normalizeEnvValue(env.NEXT_PUBLIC_SUPABASE_DB_URL);
  const publishableKey = normalizeEnvValue(env.NEXT_PUBLIC_SUPABASE_DB_PUBLISHABLE_KEY);

  if (!url || !publishableKey || publishableKey === PUBLISHABLE_KEY_PLACEHOLDER) {
    return null;
  }

  return { publishableKey, url };
}

export function requireSupabaseEnv(env: NodeJS.ProcessEnv = process.env) {
  const supabaseEnv = getSupabaseEnv(env);

  if (!supabaseEnv) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_DB_URL or NEXT_PUBLIC_SUPABASE_DB_PUBLISHABLE_KEY. Run `supabase status` and update `.env.local` before using Supabase-backed features.",
    );
  }

  return supabaseEnv;
}

export function getSupabaseAdminEnv(
  env: NodeJS.ProcessEnv = process.env,
): SupabaseAdminEnv | null {
  const serviceRoleKey = normalizeEnvValue(env.SUPABASE_SERVICE_ROLE_KEY);

  if (!serviceRoleKey || serviceRoleKey === SERVICE_ROLE_KEY_PLACEHOLDER) {
    return null;
  }

  return { serviceRoleKey };
}

export function requireSupabaseAdminEnv(
  env: NodeJS.ProcessEnv = process.env,
) {
  const adminEnv = getSupabaseAdminEnv(env);

  if (!adminEnv) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set the server-only service role key before using account deletion or other admin-only flows.",
    );
  }

  return adminEnv;
}
