/**
 * Convert an ISO 3166-1 alpha-2 country code to its flag emoji.
 * Works for all 249 codes (countries, territories, dependencies).
 * Nominatim returns this as `address.country_code`.
 */
export function countryCodeToFlag(code: string | null): string {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...upper.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
