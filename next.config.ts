import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:username/:slug",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tiles.openseamap.org https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co https://nominatim.openstreetmap.org https://*.sentry.io https://*.ingest.de.sentry.io",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
