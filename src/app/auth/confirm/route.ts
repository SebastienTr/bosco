import { NextResponse, type NextRequest } from "next/server";
import { createClient, type EmailOtpType } from "@/lib/supabase/server";
import { resolvePostAuthRedirect } from "./redirect";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = resolvePostAuthRedirect(searchParams.get("next"));
  const authErrorUrl = new URL("/auth?error=auth_callback_error", request.url);

  const supabase = await createClient();

  // PKCE flow: Supabase redirects with ?code= after email link click
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.redirect(authErrorUrl);
  }

  // Token hash flow: direct verification (alternative email template)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.redirect(authErrorUrl);
  }

  return NextResponse.redirect(authErrorUrl);
}
