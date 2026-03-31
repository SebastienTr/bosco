/**
 * Converts GeoJSON track data to SVG path strings for OG image rendering.
 * Uses Web Mercator projection for lat/lng → pixel conversion.
 */

/** Result of converting legs to SVG paths */
export interface LegsToSvgResult {
  /** SVG path `d` attribute strings, one per leg */
  paths: string[];
  /** SVG viewBox attribute value */
  viewBox: string;
  /** Target width in pixels */
  width: number;
  /** Target height in pixels */
  height: number;
}

interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

const MAX_MERCATOR_LAT = 85.05112878;

function isCoordinatePair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    Number.isFinite(value[0]) &&
    typeof value[1] === "number" &&
    Number.isFinite(value[1])
  );
}

function sanitizeCoordinates(rawCoordinates: unknown): [number, number][] {
  if (!Array.isArray(rawCoordinates)) {
    return [];
  }

  return rawCoordinates
    .filter(isCoordinatePair)
    .filter(([, lat]) => lat >= -90 && lat <= 90)
    .map(([lng, lat]) => [lng, lat]);
}

/**
 * Extract coordinates from a GeoJSON object.
 * Handles both raw LineString and Feature wrapper with LineString geometry.
 */
function extractCoordinates(
  geojson: Record<string, unknown>,
): [number, number][] {
  if (geojson.type === "LineString") {
    return sanitizeCoordinates(geojson.coordinates);
  }
  if (geojson.type === "Feature") {
    const geometry = geojson.geometry as Record<string, unknown> | undefined;
    if (geometry?.type === "LineString") {
      return sanitizeCoordinates(geometry.coordinates);
    }
  }
  return [];
}

function normalizeLongitude(lng: number): number {
  const normalized = ((lng + 180) % 360 + 360) % 360 - 180;
  return normalized === -180 ? 180 : normalized;
}

function createLongitudeNormalizer(allCoords: [number, number][][]) {
  const normalizedLongitudes = allCoords
    .flatMap((coords) => coords.map(([lng]) => ((lng % 360) + 360) % 360))
    .sort((a, b) => a - b);

  if (normalizedLongitudes.length === 0) {
    return (lng: number) => lng;
  }

  let largestGap = -1;
  let windowStart = normalizedLongitudes[0] ?? 0;

  for (let i = 0; i < normalizedLongitudes.length; i += 1) {
    const current = normalizedLongitudes[i]!;
    const next =
      i === normalizedLongitudes.length - 1
        ? normalizedLongitudes[0]! + 360
        : normalizedLongitudes[i + 1]!;
    const gap = next - current;

    if (gap > largestGap) {
      largestGap = gap;
      windowStart = next % 360;
    }
  }

  return (lng: number) => {
    const normalized = ((lng % 360) + 360) % 360;
    return normalized < windowStart ? normalized + 360 : normalized;
  };
}

/**
 * Web Mercator projection: convert lng/lat to pixel x/y.
 * x = lng (linear)
 * y = ln(tan(π/4 + lat_rad/2)) (Mercator)
 */
function mercatorProject(lng: number, lat: number): { x: number; y: number } {
  const latClamped = Math.max(-MAX_MERCATOR_LAT, Math.min(MAX_MERCATOR_LAT, lat));
  const latRad = (latClamped * Math.PI) / 180;
  return {
    x: lng,
    y: Math.log(Math.tan(Math.PI / 4 + latRad / 2)),
  };
}

/**
 * Convert an array of leg track GeoJSON objects to SVG path `d` strings,
 * auto-fitted to the target dimensions with padding.
 *
 * @param legs - Array of objects with `track_geojson` property (GeoJSON LineString or Feature)
 * @param targetWidth - Target image width in pixels (default 1200)
 * @param targetHeight - Target image height in pixels (default 630)
 * @param padding - Padding in pixels around the rendered paths (default 60)
 */
export function geojsonToSvgPaths(
  legs: { track_geojson: unknown }[],
  targetWidth = 1200,
  targetHeight = 630,
  padding = 60,
): LegsToSvgResult {
  const emptyResult: LegsToSvgResult = {
    paths: [],
    viewBox: `0 0 ${targetWidth} ${targetHeight}`,
    width: targetWidth,
    height: targetHeight,
  };

  if (!legs || legs.length === 0) {
    return emptyResult;
  }

  // Extract coordinates from all legs
  const allLegCoords: [number, number][][] = [];
  for (const leg of legs) {
    if (!leg.track_geojson) continue;
    const coords = extractCoordinates(
      leg.track_geojson as Record<string, unknown>,
    );
    if (coords.length > 0) {
      allLegCoords.push(coords);
    }
  }

  if (allLegCoords.length === 0) {
    return emptyResult;
  }

  const normalizeLng = createLongitudeNormalizer(allLegCoords);
  const normalizedLegCoords = allLegCoords.map((coords) =>
    coords.map(([lng, lat]) => [normalizeLng(normalizeLongitude(lng)), lat] as [number, number]),
  );

  // Compute bounding box across all legs
  const bbox = computeBoundingBox(normalizedLegCoords);

  // Project all coordinates and compute projected bounds
  const allProjected = normalizedLegCoords.map((coords) =>
    coords.map(([lng, lat]) => mercatorProject(lng, lat)),
  );

  const projMinP = mercatorProject(bbox.minLng, bbox.minLat);
  const projMaxP = mercatorProject(bbox.maxLng, bbox.maxLat);

  const projMinX = projMinP.x;
  const projMaxX = projMaxP.x;
  // Note: Mercator y increases northward, but SVG y increases downward
  const projMinY = projMinP.y;
  const projMaxY = projMaxP.y;

  const projWidth = projMaxX - projMinX;
  const projHeight = projMaxY - projMinY;

  // Available drawing area after padding
  const drawWidth = targetWidth - 2 * padding;
  const drawHeight = targetHeight - 2 * padding;

  // Scale to fit while preserving aspect ratio
  let scale: number;
  if (projWidth === 0 && projHeight === 0) {
    // Single point — use a default scale
    scale = 1;
  } else if (projWidth === 0) {
    scale = drawHeight / projHeight;
  } else if (projHeight === 0) {
    scale = drawWidth / projWidth;
  } else {
    scale = Math.min(drawWidth / projWidth, drawHeight / projHeight);
  }

  // Center offset
  const scaledWidth = projWidth * scale;
  const scaledHeight = projHeight * scale;
  const offsetX = padding + (drawWidth - scaledWidth) / 2;
  const offsetY = padding + (drawHeight - scaledHeight) / 2;

  // Transform projected coordinates to SVG pixel coordinates
  const paths = allProjected.map((projCoords) => {
    const points = projCoords.map((p) => {
      const px = offsetX + (p.x - projMinX) * scale;
      // Flip Y axis: Mercator y goes up, SVG y goes down
      const py = offsetY + (projMaxY - p.y) * scale;
      return { x: Math.round(px * 100) / 100, y: Math.round(py * 100) / 100 };
    });

    if (points.length === 0) return "";
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
    }

    return points
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
      .join(" ");
  });

  return {
    paths: paths.filter((p) => p.length > 0),
    viewBox: `0 0 ${targetWidth} ${targetHeight}`,
    width: targetWidth,
    height: targetHeight,
  };
}

function computeBoundingBox(allCoords: [number, number][][]): BoundingBox {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const coords of allCoords) {
    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  return { minLng, minLat, maxLng, maxLat };
}
