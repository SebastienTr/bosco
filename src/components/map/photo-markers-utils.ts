export interface PhotoMarkerEntry {
  id: string;
  photo_urls: unknown;
  stopover_id: string | null;
  leg_id: string | null;
}

export interface PhotoMarkerStopover {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface PhotoMarkerLeg {
  id: string;
  track_geojson: unknown;
}

export interface PhotoMarkerData {
  /** Supabase Storage public URL */
  photoUrl: string;
  /** [longitude, latitude] GeoJSON order */
  position: [number, number];
  /** Stopover name or leg label for accessibility */
  label: string;
  /** The log entry ID this photo belongs to */
  entryId: string;
}

/**
 * Builds a flat array of photo marker data from log entries.
 * Each photo in an entry with a valid position produces one marker.
 *
 * Position resolution:
 * 1. If entry has stopover_id → use stopover coordinates
 * 2. Else if entry has leg_id → use leg track midpoint
 * 3. Else → skip (no map position)
 */
export function buildPhotoMarkers(
  logEntries: PhotoMarkerEntry[],
  stopovers: PhotoMarkerStopover[],
  legs: PhotoMarkerLeg[],
): PhotoMarkerData[] {
  const stopoverMap = new Map(stopovers.map((s) => [s.id, s]));
  const legMap = new Map(
    legs.map((leg, index) => [leg.id, { leg, label: `Leg ${index + 1}` }]),
  );
  const markers: PhotoMarkerData[] = [];

  for (const entry of logEntries) {
    const photoUrls = parsePhotoUrls(entry.photo_urls);
    if (photoUrls.length === 0) continue;

    const resolved = resolvePosition(entry, stopoverMap, legMap);
    if (!resolved) continue;

    for (const photoUrl of photoUrls) {
      markers.push({
        photoUrl,
        position: resolved.position,
        label: resolved.label,
        entryId: entry.id,
      });
    }
  }

  return markers;
}

function parsePhotoUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((url): url is string => typeof url === "string" && url.trim().length > 0);
}

function resolvePosition(
  entry: PhotoMarkerEntry,
  stopoverMap: Map<string, PhotoMarkerStopover>,
  legMap: Map<string, { leg: PhotoMarkerLeg; label: string }>,
): { position: [number, number]; label: string } | null {
  // Priority 1: stopover
  if (entry.stopover_id) {
    const stopover = stopoverMap.get(entry.stopover_id);
    if (stopover) {
      return {
        position: [stopover.longitude, stopover.latitude],
        label: stopover.name || "Stopover",
      };
    }
  }

  // Priority 2: leg midpoint
  if (entry.leg_id) {
    const leg = legMap.get(entry.leg_id);
    if (leg) {
      const midpoint = getLegMidpoint(leg.leg.track_geojson);
      if (midpoint) {
        return {
          position: midpoint,
          label: leg.label,
        };
      }
    }
  }

  return null;
}

function getLegMidpoint(trackGeojson: unknown): [number, number] | null {
  if (!trackGeojson || typeof trackGeojson !== "object") return null;

  const geojson = trackGeojson as { type?: string; coordinates?: number[][] };
  if (geojson.type !== "LineString" || !Array.isArray(geojson.coordinates)) return null;

  const coords = geojson.coordinates;
  if (coords.length === 0) return null;

  const midIndex = Math.floor(coords.length / 2);
  const point = coords[midIndex];
  if (!point || point.length < 2) return null;

  return [point[0], point[1]];
}
