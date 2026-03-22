import { ImageResponse } from "next/og";
import { getPublicVoyageBySlug } from "@/lib/data/voyages";
import { formatDistanceNm } from "@/lib/utils/format";
import { fetchImageDataUrl } from "@/lib/utils/image-data-url";
import { getVoyageMetrics } from "@/lib/utils/voyage-metrics";

export const runtime = "nodejs";
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

  const { totalDistanceNm, days, portsCount, countriesCount } = getVoyageMetrics(
    voyage.legs ?? [],
    voyage.stopovers ?? [],
  );
  const profile = voyage.profiles;
  const coverImageSrc = voyage.cover_image_url
    ? await fetchImageDataUrl(voyage.cover_image_url)
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0f1a2e",
          color: "#FFFFFF",
        }}
      >
        {coverImageSrc ? (
          <img
            src={coverImageSrc}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: coverImageSrc
              ? "linear-gradient(135deg, rgba(15, 26, 46, 0.55) 0%, rgba(15, 26, 46, 0.88) 55%, rgba(8, 13, 24, 0.95) 100%)"
              : "linear-gradient(135deg, #1B2D4F 0%, #0f1a2e 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 70px",
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
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
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

            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                maxWidth: "960px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  minWidth: "180px",
                  padding: "18px 20px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.12)",
                }}
              >
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.75)" }}>
                  Distance
                </span>
                <span style={{ fontSize: 28, fontWeight: 700 }}>
                  {formatDistanceNm(totalDistanceNm)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  minWidth: "140px",
                  padding: "18px 20px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.12)",
                }}
              >
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.75)" }}>
                  Days
                </span>
                <span style={{ fontSize: 28, fontWeight: 700 }}>{days}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  minWidth: "140px",
                  padding: "18px 20px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.12)",
                }}
              >
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.75)" }}>
                  Ports
                </span>
                <span style={{ fontSize: 28, fontWeight: 700 }}>
                  {portsCount}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  minWidth: "180px",
                  padding: "18px 20px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.12)",
                }}
              >
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.75)" }}>
                  Countries
                </span>
                <span style={{ fontSize: 28, fontWeight: 700 }}>
                  {countriesCount}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                color: "rgba(255,255,255,0.78)",
              }}
            >
              <span style={{ fontSize: 18 }}>Shared from Bosco</span>
              <span style={{ fontSize: 22 }}>by @{profile.username ?? username}</span>
            </div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.58)",
              }}
            >
              {coverImageSrc ? "Cover photo included" : "Bosco voyage preview"}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
