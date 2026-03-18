import { ImageResponse } from "next/og";
import { getPublicProfileByUsername } from "@/lib/data/profiles";
import { getPublicVoyagesByUserId } from "@/lib/data/voyages";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sailor profile";

function FallbackImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1B2D4F 0%, #0f1a2e 100%)",
        color: "#FFFFFF",
        fontSize: 48,
        fontWeight: 700,
      }}
    >
      Bosco
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  try {
    const { username } = await params;
    const { data: profile } = await getPublicProfileByUsername(username);

    if (!profile?.username) {
      return new ImageResponse(<FallbackImage />, { ...size });
    }

    let voyageCount = 0;
    try {
      const { data: voyages } = await getPublicVoyagesByUserId(profile.id);
      voyageCount = voyages?.length ?? 0;
    } catch {
      // Voyage count is non-critical for OG image
    }

    const boatLine = [profile.boat_name, profile.boat_type]
      .filter(Boolean)
      .join(" · ");

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 70px",
            background: "linear-gradient(135deg, #1B2D4F 0%, #0f1a2e 100%)",
            color: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: 32 }}>&#9973;</span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              Bosco
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                lineHeight: 1.15,
              }}
            >
              @{profile.username}
            </div>

            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {boatLine || "Sailor"}
            </div>

            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {voyageCount} {voyageCount === 1 ? "voyage" : "voyages"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              fontSize: 20,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            bosco.app
          </div>
        </div>
      ),
      { ...size },
    );
  } catch {
    return new ImageResponse(<FallbackImage />, { ...size });
  }
}
