import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bosco — Sailing Logbook",
    short_name: "Bosco",
    description: "Your sailing story, traced on the map",
    start_url: "/",
    display: "standalone",
    theme_color: "#1B2D4F",
    background_color: "#FDF6EC",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    share_target: {
      action: "/share-target",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        files: [
          {
            name: "gpx",
            accept: [
              "application/gpx+xml",
              "application/xml",
              "text/xml",
              ".gpx",
            ],
          },
        ],
      },
    },
  };
}
