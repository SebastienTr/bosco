import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { getSupabaseEnv } from "./config";

export type SessionResult = {
  response: NextResponse;
  user: User | null;
};

function createMiddlewareResponse(
  request: NextRequest,
  requestHeaders?: Headers,
) {
  if (requestHeaders) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request,
  });
}

export async function updateSession(
  request: NextRequest,
  requestHeaders?: Headers,
): Promise<SessionResult> {
  let supabaseResponse = createMiddlewareResponse(request, requestHeaders);
  const supabaseEnv = getSupabaseEnv();

  if (!supabaseEnv) {
    return { response: supabaseResponse, user: null };
  }

  const supabase = createServerClient<Database>(
    supabaseEnv.url,
    supabaseEnv.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = createMiddlewareResponse(request, requestHeaders);
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session if expired — also returns the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
