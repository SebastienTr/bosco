const INTERNAL_ORIGIN = "https://bosco.local";

export function resolvePostAuthRedirect(
  next: string | null,
  fallback = "/dashboard",
) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(next, INTERNAL_ORIGIN);

    if (url.origin !== INTERNAL_ORIGIN) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
