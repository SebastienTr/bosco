import { NextResponse, type NextRequest } from "next/server";
import { createClient, type EmailOtpType } from "@/lib/supabase/server";
import { resolvePostAuthRedirect } from "./redirect";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = resolvePostAuthRedirect(searchParams.get("next"));
  const authErrorUrl = new URL("/auth?error=auth_callback_error", request.url);

  if (!token_hash || !type) {
    return NextResponse.redirect(authErrorUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    return NextResponse.redirect(authErrorUrl);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
