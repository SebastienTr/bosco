import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  buildPublicVoyageCsp,
  createCspNonce,
  isPublicVoyagePath,
} from "@/lib/security/public-csp";

const PROTECTED_ROUTES = ["/dashboard", "/voyage"];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  let cspHeader: string | null = null;
  let nonce: string | null = null;

  if (isPublicVoyagePath(pathname)) {
    nonce = createCspNonce();
    cspHeader = buildPublicVoyageCsp(
      nonce,
      process.env.NODE_ENV !== "production",
    );
    requestHeaders.set("Content-Security-Policy", cspHeader);
    requestHeaders.set("x-nonce", nonce);
  }

  // Refresh auth session and get current user (single getUser call)
  const { response, user } = await updateSession(request, requestHeaders);

  if (cspHeader && nonce) {
    response.headers.set("Content-Security-Policy", cspHeader);
    response.headers.set("x-nonce", nonce);
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from landing/auth pages to dashboard
  if ((pathname === "/" || pathname === "/auth") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (browser icon)
     * - Public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
