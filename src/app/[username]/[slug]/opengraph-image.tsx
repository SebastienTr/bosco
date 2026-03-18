import { ImageResponse } from "next/og";
import { getPublicVoyageBySlug } from "@/lib/data/voyages";
import { formatDistanceNm } from "@/lib/utils/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Voyage preview";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const { data: voyage } = await getPublicVoyageBySlug(username, slug);

  if (!voyage) {
    return new ImageResponse(
      (
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
      ),
      { ...size },
    );
  }

  const totalDistanceNm = (voyage.legs ?? []).reduce(
    (sum, leg) => sum + (leg.distance_nm ?? 0),
    0,
  );
  const stopovers = voyage.stopovers ?? [];
  const portsCount = stopovers.length;
  const countriesCount = new Set(
    stopovers.map((s) => s.country).filter(Boolean),
  ).size;

  const profile = voyage.profiles;

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
        {/* Branding */}
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

        {/* Voyage name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: "900px",
            }}
          >
            {voyage.name}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              fontSize: 26,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <span>{formatDistanceNm(totalDistanceNm)}</span>
            <span>·</span>
            <span>
              {portsCount} {portsCount === 1 ? "port" : "ports"}
            </span>
            <span>·</span>
            <span>
              {countriesCount} {countriesCount === 1 ? "country" : "countries"}
            </span>
          </div>
        </div>

        {/* Username */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          by @{profile.username ?? username}
        </div>
      </div>
    ),
    { ...size },
  );
}
