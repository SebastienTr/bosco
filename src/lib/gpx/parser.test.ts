import { describe, expect, it } from "vitest";
import { parseGpx } from "./parser";

const SIMPLE_GPX = `<?xml version="1.0"?>
<gpx version="1.1">
  <trk>
    <name>Test Track</name>
    <trkseg>
      <trkpt lat="43.2965" lon="5.3698">
        <ele>0</ele>
        <time>2026-03-10T08:00:00Z</time>
      </trkpt>
      <trkpt lat="43.3012" lon="5.3745">
        <ele>0</ele>
        <time>2026-03-10T08:30:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

const MULTI_TRACK_GPX = `<?xml version="1.0"?>
<gpx version="1.1">
  <trk><name>Day 1</name><trkseg>
    <trkpt lat="43.2965" lon="5.3698"><time>2026-03-10T08:00:00Z</time></trkpt>
    <trkpt lat="43.1242" lon="5.9280"><time>2026-03-10T16:00:00Z</time></trkpt>
  </trkseg></trk>
  <trk><name>Day 2</name><trkseg>
    <trkpt lat="43.1242" lon="5.9280"><time>2026-03-11T08:00:00Z</time></trkpt>
    <trkpt lat="43.5519" lon="7.0128"><time>2026-03-11T18:00:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`;

const MULTI_SEGMENT_GPX = `<?xml version="1.0"?>
<gpx version="1.1">
  <trk>
    <name>Multi Segment</name>
    <trkseg>
      <trkpt lat="43.0" lon="5.0"/>
      <trkpt lat="43.1" lon="5.1"/>
    </trkseg>
    <trkseg>
      <trkpt lat="43.2" lon="5.2"/>
      <trkpt lat="43.3" lon="5.3"/>
    </trkseg>
  </trk>
</gpx>`;

const PREFIXED_NAMESPACE_GPX = `<?xml version="1.0"?>
<gpx:gpx xmlns:gpx="http://www.topografix.com/GPX/1/1" version="1.1">
  <gpx:trk>
    <gpx:name>Namespaced Track</gpx:name>
    <gpx:trkseg>
      <gpx:trkpt lat="43.0" lon="5.0">
        <gpx:time>2026-03-10T08:00:00Z</gpx:time>
      </gpx:trkpt>
      <gpx:trkpt lat="43.1" lon="5.1">
        <gpx:time>2026-03-10T08:30:00Z</gpx:time>
      </gpx:trkpt>
    </gpx:trkseg>
  </gpx:trk>
</gpx:gpx>`;

describe("parseGpx", () => {
  it("parses a single track with all attributes", () => {
    const tracks = parseGpx(SIMPLE_GPX);
    expect(tracks).toHaveLength(1);
    expect(tracks[0].name).toBe("Test Track");
    expect(tracks[0].points).toHaveLength(2);
    expect(tracks[0].points[0]).toEqual({
      lat: 43.2965,
      lon: 5.3698,
      ele: 0,
      time: "2026-03-10T08:00:00Z",
    });
  });

  it("parses multiple tracks", () => {
    const tracks = parseGpx(MULTI_TRACK_GPX);
    expect(tracks).toHaveLength(2);
    expect(tracks[0].name).toBe("Day 1");
    expect(tracks[1].name).toBe("Day 2");
    expect(tracks[0].points).toHaveLength(2);
    expect(tracks[1].points).toHaveLength(2);
  });

  it("parses GPX files with prefixed namespace elements", () => {
    const tracks = parseGpx(PREFIXED_NAMESPACE_GPX);
    expect(tracks).toHaveLength(1);
    expect(tracks[0].name).toBe("Namespaced Track");
    expect(tracks[0].points).toHaveLength(2);
    expect(tracks[0].points[1].lon).toBe(5.1);
  });

  it("flattens multiple segments into one point array", () => {
    const tracks = parseGpx(MULTI_SEGMENT_GPX);
    expect(tracks).toHaveLength(1);
    expect(tracks[0].points).toHaveLength(4);
    expect(tracks[0].points[2].lat).toBe(43.2);
  });

  it("handles missing name with null", () => {
    const gpx = `<?xml version="1.0"?>
<gpx version="1.1">
  <trk><trkseg>
    <trkpt lat="43.0" lon="5.0"/>
  </trkseg></trk>
</gpx>`;
    const tracks = parseGpx(gpx);
    expect(tracks[0].name).toBeNull();
  });

  it("handles missing time and elevation", () => {
    const gpx = `<?xml version="1.0"?>
<gpx version="1.1">
  <trk><trkseg>
    <trkpt lat="43.0" lon="5.0"/>
  </trkseg></trk>
</gpx>`;
    const tracks = parseGpx(gpx);
    expect(tracks[0].points[0].ele).toBeNull();
    expect(tracks[0].points[0].time).toBeNull();
  });

  it("skips track points with invalid lat/lon", () => {
    const gpx = `<?xml version="1.0"?>
<gpx version="1.1">
  <trk><trkseg>
    <trkpt lat="43.0" lon="5.0"/>
    <trkpt lat="invalid" lon="5.0"/>
    <trkpt lat="43.1" lon="5.1"/>
  </trkseg></trk>
</gpx>`;
    const tracks = parseGpx(gpx);
    expect(tracks[0].points).toHaveLength(2);
  });

  it("throws on invalid XML", () => {
    expect(() => parseGpx("<not valid xml>>>")).toThrow(
      "Invalid GPX format: XML parsing failed"
    );
  });

  it("throws when no tracks found", () => {
    const gpx = `<?xml version="1.0"?><gpx version="1.1"></gpx>`;
    expect(() => parseGpx(gpx)).toThrow("Invalid GPX format: no tracks found");
  });
});
