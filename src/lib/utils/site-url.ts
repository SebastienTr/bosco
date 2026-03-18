export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || "localhost:3000"}`;
