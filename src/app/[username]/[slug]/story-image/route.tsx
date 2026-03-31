import { ImageResponse } from "next/og";
import { getPublicVoyageBySlug } from "@/lib/data/voyages";
import { geojsonToSvgPaths } from "@/lib/geo/geojson-to-svg";
import { formatDistanceNm } from "@/lib/utils/format";
import { getVoyageMetrics } from "@/lib/utils/voyage-metrics";

export const runtime = "nodejs";

const WIDTH = 1080;
const HEIGHT = 1920;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string; slug: string }> },
) {
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
            background: "linear-gradient(180deg, #1B2D4F 0%, #0f1a2e 100%)",
            color: "#FFFFFF",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Bosco
        </div>
      ),
      { width: WIDTH, height: HEIGHT },
    );
  }

  const legs = voyage.legs ?? [];
  const { totalDistanceNm, days, portsCount, countriesCount } =
    getVoyageMetrics(legs, voyage.stopovers ?? []);
  const profile = voyage.profiles;

  // Route SVG — occupies the central area (full width, ~60% height)
  const routePadding = 60;
  const routeSvg = geojsonToSvgPaths(
    legs.filter((l) => l.track_geojson),
    WIDTH,
    HEIGHT,
    routePadding,
  );

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
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #1B2D4F 0%, #0f1a2e 100%)",
          }}
        />

        {/* Route SVG — full bleed background */}
        {routeSvg.paths.length > 0 && (
          <svg
            width={routeSvg.width}
            height={routeSvg.height}
            viewBox={routeSvg.viewBox}
            style={{ position: "absolute", inset: 0 }}
          >
            {routeSvg.paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(255,255,255,0.30)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
        )}

        {/* Content overlay */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "100px 60px 80px",
          }}
        >
          {/* Top — Branding */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: 40 }}>&#9973;</span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              Bosco
            </span>
          </div>

          {/* Bottom — Voyage info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            {/* Voyage name */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.1,
                maxWidth: "960px",
              }}
            >
              {voyage.name}
            </div>

            {/* Stats grid — 2x2 */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "Distance", value: formatDistanceNm(totalDistanceNm) },
                { label: "Days", value: String(days) },
                { label: "Ports", value: String(portsCount) },
                { label: "Countries", value: String(countriesCount) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    minWidth: "220px",
                    padding: "22px 24px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.12)",
                  }}
                >
                  <span
                    style={{ fontSize: 18, color: "rgba(255,255,255,0.70)" }}
                  >
                    {stat.label}
                  </span>
                  <span style={{ fontSize: 36, fontWeight: 700 }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Boat + username + branding */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {profile.boat_name ? (
                  <span style={{ fontSize: 24 }}>{profile.boat_name}</span>
                ) : null}
                <span style={{ fontSize: 26 }}>
                  by @{profile.username ?? username}
                </span>
              </div>
              <span
                style={{
                  fontSize: 22,
                  color: "rgba(255,255,255,0.50)",
                }}
              >
                sailbosco.com
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
