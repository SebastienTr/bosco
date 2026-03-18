const RESERVED_PUBLIC_ROUTE_PREFIXES = new Set([
  "api",
  "auth",
  "dashboard",
  "share-target",
  "voyage",
]);

export function isPublicVoyagePath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return (
    segments.length === 2 &&
    !RESERVED_PUBLIC_ROUTE_PREFIXES.has(segments[0] ?? "")
  );
}

export function createCspNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  if (typeof btoa === "function") {
    return btoa(binary);
  }

  return Buffer.from(bytes).toString("base64");
}

export function buildPublicVoyageCsp(nonce: string, isDev: boolean) {
  const scriptSources = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"];

  if (isDev) {
    scriptSources.push("'unsafe-eval'");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tiles.openseamap.org https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co https://nominatim.openstreetmap.org https://*.sentry.io https://*.ingest.de.sentry.io",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
  ].join("; ");
}
