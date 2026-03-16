"use server";

import type { ActionResponse } from "@/types";
import { createClient, type User } from "@/lib/supabase/server";

export async function signIn(
  email: string,
): Promise<ActionResponse<{ email: string }>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
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
