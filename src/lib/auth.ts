"use server";

import type { ActionResponse } from "@/types";
import { createClient, type User } from "@/lib/supabase/server";

async function isProfileDisabled(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("disabled_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data?.disabled_at !== null;
}

export async function signIn(
  email: string,
  next?: string,
): Promise<ActionResponse<{ email: string }>> {
  const supabase = await createClient();
  const redirectUrl = new URL(
    "/auth/confirm",
    process.env.SITE_URL ?? "http://localhost:3000",
  );

  if (next) {
    redirectUrl.searchParams.set("next", next);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl.toString(),
    },
  });

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: { email }, error: null };
}

export async function signOut(): Promise<ActionResponse<null>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: null, error: null };
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  if (await isProfileDisabled(supabase, user.id)) {
    return null;
  }

  return user;
}

export async function requireAuth(): Promise<ActionResponse<User>> {
  const user = await getUser();

  if (!user) {
    return {
      data: null,
      error: { code: "UNAUTHORIZED", message: "You must be signed in" },
    };
  }

  return { data: user, error: null };
}
