export interface PhotoMarkerEntry {
  id: string;
  photo_urls: unknown;
  stopover_id: string | null;
  leg_id: string | null;
  text: string;
  entry_date: string;
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
  /** Stable photo instance ID */
  photoId: string;
  /** Supabase Storage public URL */
  photoUrl: string;
  /** Photo index within the entry */
  photoIndex: number;
  /** [longitude, latitude] GeoJSON order */
  position: [number, number];
  /** Stopover name or leg label for accessibility */
  label: string;
  /** The log entry ID this photo belongs to */
  entryId: string;
  /** Journal entry text */
  entryText: string;
  /** Journal entry date (ISO string) */
  entryDate: string;
}

export interface LightboxPhoto {
  id: string;
  url: string;
  caption: {
    text: string;
    location: string;
    date: string;
  };
}

export function createLightboxPhotoId(
  entryId: string,
  photoIndex: number,
): string {
  return `${entryId}:${photoIndex}`;
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

    for (const [photoIndex, photoUrl] of photoUrls.entries()) {
      markers.push({
        photoId: createLightboxPhotoId(entry.id, photoIndex),
        photoUrl,
        photoIndex,
        position: resolved.position,
        label: resolved.label,
        entryId: entry.id,
        entryText: entry.text,
        entryDate: entry.entry_date,
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

/**
 * Builds lightbox-compatible items from every voyage photo, including
 * journal photos that do not have a map position.
 */
export function buildLightboxPhotos(
  logEntries: PhotoMarkerEntry[],
  stopovers: PhotoMarkerStopover[],
  legs: PhotoMarkerLeg[],
): LightboxPhoto[] {
  const stopoverMap = new Map(stopovers.map((s) => [s.id, s]));
  const legMap = new Map(
    legs.map((leg, index) => [leg.id, { leg, label: `Leg ${index + 1}` }]),
  );
  const photos: LightboxPhoto[] = [];

  for (const entry of logEntries) {
    const photoUrls = parsePhotoUrls(entry.photo_urls);
    const location = resolveLocationLabel(entry, stopoverMap, legMap);

    for (const [photoIndex, photoUrl] of photoUrls.entries()) {
      photos.push({
        id: createLightboxPhotoId(entry.id, photoIndex),
        url: photoUrl,
        caption: {
          text: toCaptionExcerpt(entry.text),
          location,
          date: formatCaptionDate(entry.entry_date),
        },
      });
    }
  }

  return photos;
}

function resolveLocationLabel(
  entry: PhotoMarkerEntry,
  stopoverMap: Map<string, PhotoMarkerStopover>,
  legMap: Map<string, { leg: PhotoMarkerLeg; label: string }>,
): string {
  if (entry.stopover_id) {
    const stopover = stopoverMap.get(entry.stopover_id);
    if (stopover) {
      return stopover.name || "Stopover";
    }
  }

  if (entry.leg_id) {
    const leg = legMap.get(entry.leg_id);
    if (leg) {
      return leg.label;
    }
  }

  return "";
}

function toCaptionExcerpt(text: string): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= 100) return normalized;

  return `${normalized.slice(0, 97).trimEnd()}...`;
}

function formatCaptionDate(entryDate: string): string {
  const parsedDate = new Date(`${entryDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return entryDate;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
