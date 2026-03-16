import type { GpxTrack, GpxTrackPoint } from "@/types/gpx";

export const INVALID_GPX_FORMAT_MESSAGE = "Invalid GPX format";

function getElementsByLocalName(
  parent: Document | Element,
  localName: string
): Element[] {
  const namespaceMatches = Array.from(
    parent.getElementsByTagNameNS("*", localName)
  );

  if (namespaceMatches.length > 0) {
    return namespaceMatches;
  }

  return Array.from(parent.getElementsByTagName(localName));
}

function getFirstChildByLocalName(
  parent: Element,
  localName: string
): Element | undefined {
  return Array.from(parent.children).find((child) => child.localName === localName);
}

export function parseGpx(xmlString: string): GpxTrack[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");

  // Check for parse errors
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    throw new Error(`${INVALID_GPX_FORMAT_MESSAGE}: XML parsing failed`);
  }

  // Support both default and prefixed GPX namespaces.
  const trkElements = getElementsByLocalName(doc, "trk");
  if (trkElements.length === 0) {
    throw new Error(`${INVALID_GPX_FORMAT_MESSAGE}: no tracks found`);
  }

  const tracks: GpxTrack[] = [];

  for (let i = 0; i < trkElements.length; i++) {
    const trk = trkElements[i];
    const nameEl = getFirstChildByLocalName(trk, "name");
    const name = nameEl?.textContent?.trim() || null;
    const points: GpxTrackPoint[] = [];

    const trkpts = getElementsByLocalName(trk, "trkpt");
    for (let j = 0; j < trkpts.length; j++) {
      const pt = trkpts[j];
      const lat = parseFloat(pt.getAttribute("lat") || "");
      const lon = parseFloat(pt.getAttribute("lon") || "");

      if (isNaN(lat) || isNaN(lon)) continue; // Skip invalid points

      const eleEl = getFirstChildByLocalName(pt, "ele");
      const timeEl = getFirstChildByLocalName(pt, "time");

      points.push({
        lat,
        lon,
        ele: eleEl?.textContent ? parseFloat(eleEl.textContent) : null,
        time: timeEl?.textContent?.trim() || null,
      });
    }

    if (points.length > 0) {
      tracks.push({ name, points });
    }
  }

  if (tracks.length === 0) {
    throw new Error(`${INVALID_GPX_FORMAT_MESSAGE}: no valid track points found`);
  }

  return tracks;
}
