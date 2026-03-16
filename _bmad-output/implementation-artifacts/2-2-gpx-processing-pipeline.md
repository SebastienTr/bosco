# Story 2.2: GPX Processing Pipeline

Status: done

## Story

As a sailor importing large GPS tracks,
I want my GPX files to be parsed and simplified directly on my phone without freezing the interface,
So that I can continue interacting with the app while even very large files (up to 400 MB) are processed.

## Acceptance Criteria

### AC-1: Web Worker Pipeline
**Given** a valid GPX 1.1 file sent to the Web Worker
**When** the worker receives a `{ type: 'process', file }` message
**Then** it parses the XML, extracts all tracks and track segments
**And** sends progress messages: `{ type: 'progress', step: 'parsing' }`, then `'simplifying'`, then `'detecting'`, then `'ready'`
**And** returns `{ type: 'result', data: { tracks: GeoJSON.LineString[], stopovers: StopoverCandidate[], stats: TrackStats[] } }`

### AC-2: Douglas-Peucker Simplification
**Given** a GPX file with a single track containing 1M+ points
**When** the Douglas-Peucker simplification runs
**Then** it uses an iterative (stack-based) implementation, never recursive
**And** the simplified track preserves visible tacks and course changes at zoom level 14
**And** coordinates are stored in GeoJSON `[longitude, latitude]` order

### AC-3: Multi-Track Support
**Given** a multi-track GPX file
**When** processing completes
**Then** each track is returned as a separate GeoJSON LineString with its own stats
**And** per-track stats include: distance (nm), duration, average speed (kts), max speed (kts), start timestamp, end timestamp, point count

### AC-4: Performance
**Given** a 400 MB GPX file processed on target mobile hardware
**When** the import completes
**Then** total processing time is under 60 seconds
**And** main thread input responsiveness remains below 200 ms throughout

### AC-5: Error Handling
**Given** an invalid or corrupted GPX file
**When** the worker attempts to parse it
**Then** it returns `{ type: 'error', error: { code: 'PROCESSING_ERROR', message: 'Invalid GPX format' } }`
**And** the main thread receives the error without crashing

### AC-6: File Structure & Tests
**Given** the GPX processing modules
**When** inspecting the file structure
**Then** `src/lib/gpx/parser.ts`, `src/lib/gpx/simplify.ts`, `src/lib/gpx/to-geojson.ts`, and `src/lib/gpx/worker.ts` exist
**And** each module has a co-located test file

## Tasks / Subtasks

- [x] Task 1: Create GPX type definitions (AC: #1, #3)
  - [x] Create `src/types/gpx.ts` with all processing types
  - [x] Define `GpxTrackPoint`, `GpxTrack`, `TrackStats`, `StopoverCandidate`
  - [x] Define `WorkerInMessage`, `WorkerOutMessage` discriminated unions
  - [x] Define `ProcessingResult` type

- [x] Task 2: Create Haversine distance utilities (AC: #3)
  - [x] Create `src/lib/geo/distance.ts`
  - [x] Implement `haversineDistanceNm(p1, p2)` — nautical miles between two [lng, lat] coordinates
  - [x] Implement `computeTrackStats(points)` — distance, duration, avg/max speed, timestamps, point count
  - [x] Create `src/lib/geo/distance.test.ts` with known-distance test cases

- [x] Task 3: Create GPX parser (AC: #1, #3, #5)
  - [x] Create `src/lib/gpx/parser.ts`
  - [x] Implement `parseGpx(xmlString)` using DOMParser
  - [x] Extract all `<trk>` → `<trkseg>` → `<trkpt>` with lat, lon, ele, time attributes
  - [x] Return structured `GpxTrack[]` with track name and segments
  - [x] Throw descriptive error on invalid/malformed XML
  - [x] Create `src/lib/gpx/parser.test.ts` (single track, multi-track, namespaced XML, missing attributes, invalid XML)

- [x] Task 4: Create Douglas-Peucker simplifier (AC: #2)
  - [x] Create `src/lib/gpx/simplify.ts`
  - [x] Implement `simplifyTrack(points, epsilon)` using iterative stack-based algorithm
  - [x] Default epsilon ≈ 0.0001° (~11m) for zoom-14 tack preservation
  - [x] Never use recursion — explicit stack with while loop
  - [x] Create `src/lib/gpx/simplify.test.ts` (straight line, zigzag preserved, large array, empty input)

- [x] Task 5: Create GeoJSON converter (AC: #1, #2, #3)
  - [x] Create `src/lib/gpx/to-geojson.ts`
  - [x] Implement `toGeoJsonLineString(points)` → `GeoJSON.LineString` with `[lng, lat]` coordinates
  - [x] Create `src/lib/gpx/to-geojson.test.ts` (coordinate order, empty track, single point)

- [x] Task 6: Create basic stopover detection (AC: #1)
  - [x] Create `src/lib/geo/stopover-detection.ts`
  - [x] Implement `detectStopovers(tracks)` — extract start/end points of each track, merge points within 2km radius
  - [x] Return `StopoverCandidate[]` with position and associated track indices
  - [x] Create `src/lib/geo/stopover-detection.test.ts` (single track, multi-track, overlapping endpoints)

- [x] Task 7: Create Web Worker entry point (AC: #1, #4, #5)
  - [x] Create `src/lib/gpx/worker.ts`
  - [x] Listen for `{ type: 'process', file }` messages
  - [x] Orchestrate: read file → parse → simplify each track → detect stopovers → compute stats → convert to GeoJSON
  - [x] Send progress messages at each step
  - [x] Wrap in try/catch, send `{ type: 'error' }` on failure
  - [x] Create `src/lib/gpx/worker.test.ts` (message protocol tests exercising the registered worker handler)

- [x] Task 8: Verify build and tests (AC: all)
  - [x] All new tests pass: `npm run test`
  - [x] TypeScript strict clean: `npx tsc --noEmit`
  - [x] ESLint clean: `npm run lint`
  - [x] Build succeeds: `npm run build`
  - [x] Existing 81 tests still pass (no regressions)

## Dev Notes

### Scope Boundary — CRITICAL

This story creates the **processing pipeline only** — pure TypeScript modules with zero UI, zero database, zero Server Actions.

**IN SCOPE:**
- `src/types/gpx.ts` — Type definitions
- `src/lib/gpx/parser.ts` — GPX XML → structured data
- `src/lib/gpx/simplify.ts` — Douglas-Peucker iterative simplification
- `src/lib/gpx/to-geojson.ts` — Structured data → GeoJSON LineString
- `src/lib/gpx/worker.ts` — Web Worker entry point
- `src/lib/geo/distance.ts` — Haversine distance (nm), speed (kts), stats
- `src/lib/geo/stopover-detection.ts` — Basic endpoint-based stopover detection
- Co-located test files for all modules

**OUT OF SCOPE — Do NOT create:**
- No UI components — no ImportProgress, no GpxImporter, no TrackPreview (Story 2.3)
- No database migrations — no `legs` table (Story 2.3)
- No Server Actions — no `importTracks` (Story 2.3)
- No `src/lib/data/legs.ts` — data layer comes in Story 2.3
- No reverse geocoding — no Nominatim calls (Story 2.4)
- No stopover database persistence (Story 2.4)
- No `src/components/gpx/` components (Story 2.3)
- No PWA / Web Share Target (Story 2.5)

### Type Definitions — `src/types/gpx.ts`

```typescript
/** Raw parsed track point from GPX XML */
export interface GpxTrackPoint {
  lat: number;
  lon: number;
  ele: number | null;
  time: string | null; // ISO 8601 timestamp from GPX
}

/** Raw parsed track from GPX XML */
export interface GpxTrack {
  name: string | null; // <name> element from GPX
  points: GpxTrackPoint[]; // Flattened from all <trkseg> in this <trk>
}

/** Stats computed per track after simplification */
export interface TrackStats {
  distanceNm: number;
  durationSeconds: number | null; // null if no timestamps in GPX
  avgSpeedKts: number | null;
  maxSpeedKts: number | null;
  startTime: string | null; // ISO 8601
  endTime: string | null;   // ISO 8601
  pointCount: number;       // After simplification
  originalPointCount: number; // Before simplification
}

/** Detected stopover candidate (not yet persisted) */
export interface StopoverCandidate {
  position: [number, number]; // [longitude, latitude] — GeoJSON order
  trackIndices: number[];     // Which tracks start/end here
  type: 'departure' | 'arrival' | 'waypoint'; // First track start, last track end, or shared endpoint
}

/** Complete processing result from worker */
export interface ProcessingResult {
  tracks: GeoJSON.LineString[];
  stopovers: StopoverCandidate[];
  stats: TrackStats[];
}

/** Messages: Main thread → Worker */
export type WorkerInMessage = {
  type: 'process';
  file: File;
};

/** Messages: Worker → Main thread */
export type WorkerOutMessage =
  | { type: 'progress'; step: 'parsing' | 'simplifying' | 'detecting' | 'ready' }
  | { type: 'result'; data: ProcessingResult }
  | { type: 'error'; error: { code: string; message: string } };
```

### GPX 1.1 XML Structure

GPX 1.1 uses this structure — the parser must handle all cases:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Navionics"
     xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Track 1</name>
    <trkseg>
      <trkpt lat="43.2965" lon="5.3698">
        <ele>0.0</ele>
        <time>2026-03-10T08:30:00Z</time>
      </trkpt>
      <trkpt lat="43.3012" lon="5.3745">
        <ele>0.0</ele>
        <time>2026-03-10T08:35:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
```

**Key parsing details:**
- GPX uses XML namespace `http://www.topografix.com/GPX/1/1` — use `getElementsByTagNameNS()` or strip namespace
- `lat` and `lon` are attributes on `<trkpt>` (not child elements)
- `<ele>` and `<time>` are optional child elements
- A `<trk>` can have multiple `<trkseg>` — flatten all segments into one point array per track
- A file can have multiple `<trk>` elements → multi-track
- Track `<name>` is optional — default to "Track {index}" if missing
- **DOMParser** is available in Web Workers and is the correct parser for MVP (per UX spec)

### GPX Parser Implementation — `src/lib/gpx/parser.ts`

```typescript
import type { GpxTrack, GpxTrackPoint } from "@/types/gpx";

export function parseGpx(xmlString: string): GpxTrack[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");

  // Check for parse errors
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    throw new Error("Invalid GPX format: XML parsing failed");
  }

  // GPX may use default or prefixed namespaces — match by local name
  const trkElements = Array.from(doc.getElementsByTagNameNS("*", "trk"));
  if (trkElements.length === 0) {
    throw new Error("Invalid GPX format: no tracks found");
  }

  const tracks: GpxTrack[] = [];

  for (let i = 0; i < trkElements.length; i++) {
    const trk = trkElements[i];
    const nameEl = Array.from(trk.children).find((child) => child.localName === "name");
    const name = nameEl?.textContent?.trim() || null;
    const points: GpxTrackPoint[] = [];

    const trkpts = Array.from(trk.getElementsByTagNameNS("*", "trkpt"));
    for (let j = 0; j < trkpts.length; j++) {
      const pt = trkpts[j];
      const lat = parseFloat(pt.getAttribute("lat") || "");
      const lon = parseFloat(pt.getAttribute("lon") || "");

      if (isNaN(lat) || isNaN(lon)) continue; // Skip invalid points

      const eleEl = Array.from(pt.children).find((child) => child.localName === "ele");
      const timeEl = Array.from(pt.children).find((child) => child.localName === "time");

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
    throw new Error("Invalid GPX format: no valid track points found");
  }

  return tracks;
}
```

**Implementation notes:**
- Use namespace-aware local-name matching (`getElementsByTagNameNS("*", ...)`) so both default and prefixed GPX files parse correctly
- Skip track points with invalid lat/lon rather than throwing (real GPX files sometimes have corrupt points)
- Flatten all `<trkseg>` within a `<trk>` into a single points array
- Throw on truly invalid input (not XML, no tracks at all)

### Douglas-Peucker Simplification — `src/lib/gpx/simplify.ts`

**CRITICAL: Must be ITERATIVE (stack-based), NEVER recursive. Architecture constraint for 1M+ points.**

```typescript
import type { GpxTrackPoint } from "@/types/gpx";

const DEFAULT_EPSILON = 0.0001; // ~11 meters at equator — preserves tacks at zoom 14

export function simplifyTrack(
  points: GpxTrackPoint[],
  epsilon: number = DEFAULT_EPSILON
): GpxTrackPoint[] {
  if (points.length <= 2) return [...points];

  // Boolean mask — true means keep this point
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  // Iterative stack-based Douglas-Peucker
  const stack: [number, number][] = [[0, points.length - 1]];

  while (stack.length > 0) {
    const [start, end] = stack.pop()!;
    let maxDist = 0;
    let maxIndex = start;

    for (let i = start + 1; i < end; i++) {
      const dist = perpendicularDistance(points[i], points[start], points[end]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    if (maxDist > epsilon) {
      keep[maxIndex] = 1;
      if (maxIndex - start > 1) stack.push([start, maxIndex]);
      if (end - maxIndex > 1) stack.push([maxIndex, end]);
    }
  }

  return points.filter((_, i) => keep[i] === 1);
}

/** Perpendicular distance from point to line segment.
 *  Uses equirectangular correction (cosLat) to account for longitude
 *  compression at higher latitudes — critical for sailing tracks in
 *  Mediterranean/Northern Europe where 1° lon ≠ 1° lat on the ground. */
function perpendicularDistance(
  point: GpxTrackPoint,
  lineStart: GpxTrackPoint,
  lineEnd: GpxTrackPoint
): number {
  // Apply cos(latitude) correction to longitude for approximate meter-equivalence
  const cosLat = Math.cos((lineStart.lat * Math.PI) / 180);

  const px = point.lon * cosLat, py = point.lat;
  const ax = lineStart.lon * cosLat, ay = lineStart.lat;
  const bx = lineEnd.lon * cosLat, by = lineEnd.lat;

  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  }

  // Signed area method for perpendicular distance
  return Math.abs(dy * px - dx * py + bx * ay - by * ax) / Math.sqrt(dx * dx + dy * dy);
}
```

**Implementation notes:**
- Uses `Uint8Array` boolean mask instead of copying arrays — memory efficient for 1M+ points
- Stack is a simple array of `[start, end]` pairs — explicit `while` loop, zero recursion
- `perpendicularDistance` uses degree-based Euclidean approximation — fast and sufficient for track simplification (exact geodesic distance not needed for D-P)
- Default epsilon `0.0001°` (~11m) tuned for sailing tack preservation at zoom 14
- Export the `DEFAULT_EPSILON` constant for potential UI configuration in future stories

### GeoJSON Converter — `src/lib/gpx/to-geojson.ts`

```typescript
import type { GpxTrackPoint } from "@/types/gpx";

/** Convert simplified track points to GeoJSON LineString with [lng, lat] order */
export function toGeoJsonLineString(points: GpxTrackPoint[]): GeoJSON.LineString {
  return {
    type: "LineString",
    coordinates: points.map((p) => [p.lon, p.lat]),
  };
}
```

**CRITICAL: GeoJSON is `[longitude, latitude]`. Leaflet conversion to `[lat, lng]` happens ONLY in `RouteLayer.tsx` (already exists from Story 2.1). Never change coordinate order in stored/processed data.**

### Haversine Distance — `src/lib/geo/distance.ts`

```typescript
import type { GpxTrackPoint, TrackStats } from "@/types/gpx";

const EARTH_RADIUS_NM = 3440.065; // Earth radius in nautical miles

/** Haversine distance between two points in nautical miles */
export function haversineDistanceNm(
  p1: { lat: number; lon: number },
  p2: { lat: number; lon: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lon - p1.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Speed in knots between two timed points */
export function speedKts(distanceNm: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return distanceNm / (durationSeconds / 3600);
}

/** Compute full stats for a simplified track */
export function computeTrackStats(
  simplifiedPoints: GpxTrackPoint[],
  originalPointCount: number
): TrackStats {
  if (simplifiedPoints.length === 0) {
    return {
      distanceNm: 0,
      durationSeconds: null,
      avgSpeedKts: null,
      maxSpeedKts: null,
      startTime: null,
      endTime: null,
      pointCount: 0,
      originalPointCount,
    };
  }

  let totalDistance = 0;
  let maxSegmentSpeed = 0;

  for (let i = 1; i < simplifiedPoints.length; i++) {
    const prev = simplifiedPoints[i - 1];
    const curr = simplifiedPoints[i];
    const segDist = haversineDistanceNm(prev, curr);
    totalDistance += segDist;

    if (prev.time && curr.time) {
      const segDuration =
        (new Date(curr.time).getTime() - new Date(prev.time).getTime()) / 1000;
      if (segDuration > 0) {
        const segSpeed = speedKts(segDist, segDuration);
        if (segSpeed > maxSegmentSpeed && segSpeed < 50) {
          // Cap at 50 kts to filter GPS glitches
          maxSegmentSpeed = segSpeed;
        }
      }
    }
  }

  const startTime = simplifiedPoints[0].time;
  const endTime = simplifiedPoints[simplifiedPoints.length - 1].time;
  let durationSeconds: number | null = null;
  let avgSpeedKts: number | null = null;

  if (startTime && endTime) {
    durationSeconds =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
    if (durationSeconds > 0) {
      avgSpeedKts = speedKts(totalDistance, durationSeconds);
    }
  }

  return {
    distanceNm: Math.round(totalDistance * 100) / 100,
    durationSeconds,
    avgSpeedKts: avgSpeedKts !== null ? Math.round(avgSpeedKts * 100) / 100 : null,
    maxSpeedKts: maxSegmentSpeed > 0 ? Math.round(maxSegmentSpeed * 100) / 100 : null,
    startTime,
    endTime,
    pointCount: simplifiedPoints.length,
    originalPointCount,
  };
}
```

**Implementation notes:**
- `EARTH_RADIUS_NM = 3440.065` — standard nautical value. Do NOT use 6371 km.
- Speed cap at 50 kts filters GPS glitches (teleport points that create infinite speed)
- Stats computation uses simplified points for distance (which is what the user sees on the map)
- `originalPointCount` is passed in so the developer calling this knows both counts
- Round to 2 decimal places for display-friendly values

### Stopover Detection — `src/lib/geo/stopover-detection.ts`

Basic endpoint detection for the processing pipeline. Full management (DB persistence, reverse geocoding, rename/merge) comes in Story 2.4.

```typescript
import type { GpxTrackPoint, StopoverCandidate } from "@/types/gpx";
import { haversineDistanceNm } from "./distance";

const DEFAULT_MERGE_RADIUS_NM = 1.08; // ~2 km in nautical miles

/** Detect stopover candidates from track start/end points */
export function detectStopovers(
  tracks: { points: GpxTrackPoint[] }[],
  mergeRadiusNm: number = DEFAULT_MERGE_RADIUS_NM
): StopoverCandidate[] {
  // Collect all endpoints
  const endpoints: { point: GpxTrackPoint; trackIndex: number; isStart: boolean }[] = [];

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    if (track.points.length === 0) continue;
    endpoints.push({ point: track.points[0], trackIndex: i, isStart: true });
    endpoints.push({
      point: track.points[track.points.length - 1],
      trackIndex: i,
      isStart: false,
    });
  }

  // Merge nearby endpoints into stopover candidates
  const candidates: StopoverCandidate[] = [];
  const used = new Set<number>();

  for (let i = 0; i < endpoints.length; i++) {
    if (used.has(i)) continue;

    const cluster = [endpoints[i]];
    used.add(i);

    for (let j = i + 1; j < endpoints.length; j++) {
      if (used.has(j)) continue;
      const dist = haversineDistanceNm(endpoints[i].point, endpoints[j].point);
      if (dist <= mergeRadiusNm) {
        cluster.push(endpoints[j]);
        used.add(j);
      }
    }

    const avgLon = cluster.reduce((s, e) => s + e.point.lon, 0) / cluster.length;
    const avgLat = cluster.reduce((s, e) => s + e.point.lat, 0) / cluster.length;
    const trackIndices = [...new Set(cluster.map((e) => e.trackIndex))];

    // Determine type based on position in track set
    const allStarts = cluster.every((e) => e.isStart);
    const allEnds = cluster.every((e) => !e.isStart);
    const type: StopoverCandidate["type"] =
      allStarts && trackIndices.includes(0) ? "departure" :
      allEnds && trackIndices.includes(tracks.length - 1) ? "arrival" :
      "waypoint";

    candidates.push({
      position: [avgLon, avgLat], // GeoJSON [lng, lat] order
      trackIndices,
      type,
    });
  }

  return candidates;
}
```

### Web Worker — `src/lib/gpx/worker.ts`

```typescript
import type { WorkerInMessage, WorkerOutMessage, ProcessingResult } from "@/types/gpx";
import { INVALID_GPX_FORMAT_MESSAGE, parseGpx } from "./parser";

export async function processGpxFile(
  file: File,
  onProgress?: (step: Extract<WorkerOutMessage, { type: "progress" }>["step"]) => void
): Promise<ProcessingResult> {
  onProgress?.("parsing");
  const xmlString = await file.text();
  const tracks = parseGpx(xmlString);

  onProgress?.("simplifying");
  const simplified = tracks.map((track) => ({
    ...track,
    simplifiedPoints: simplifyTrack(track.points),
    originalPointCount: track.points.length,
  }));

  onProgress?.("detecting");
  const stopovers = detectStopovers(simplified.map((track) => ({
    points: track.simplifiedPoints,
  })));

  onProgress?.("ready");
  return {
    tracks: simplified.map((track) => toGeoJsonLineString(track.simplifiedPoints)),
    stopovers,
    stats: simplified.map((track) =>
      computeTrackStats(track.simplifiedPoints, track.originalPointCount)
    ),
  };
}

export function registerWorker(scope = self) {
  scope.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
    if (event.data.type !== "process") return;

    try {
      const result = await processGpxFile(event.data.file, (step) => {
        scope.postMessage({ type: "progress", step });
      });

      scope.postMessage({ type: "result", data: result });
    } catch (error) {
      scope.postMessage({
        type: "error",
        error: {
          code: "PROCESSING_ERROR",
          message:
            error instanceof Error && error.message.startsWith(INVALID_GPX_FORMAT_MESSAGE)
              ? INVALID_GPX_FORMAT_MESSAGE
              : "Unknown processing error",
        },
      });
    }
  };
}

registerWorker();
```

**Web Worker setup in Next.js 16 (Turbopack):**

The consumer (Story 2.3 — `src/components/gpx/GpxImporter.tsx`) will instantiate the worker as:
```typescript
const worker = new Worker(new URL("@/lib/gpx/worker.ts", import.meta.url));
```

This pattern is supported by both Webpack and Turbopack. The worker file is bundled as a separate entry point. **Do NOT use `import ... from 'worker:...'` or any non-standard syntax.**

**Turbopack caveat:** There are known issues where Turbopack may treat `.ts` worker files as static assets instead of compiling them (Next.js issues #62650, #78784). If `new URL('./worker.ts', import.meta.url)` fails at runtime:
1. Test early — create the worker and verify it processes a simple message before building the full pipeline
2. If Turbopack can't handle it, try `new URL('./worker', import.meta.url)` (without extension)
3. Last resort: compile worker separately and place in `public/gpx-worker.js` — the pipeline modules remain typed and testable independently

**TypeScript in worker context:**
- The main tsconfig includes `"lib": ["dom", ...]` which provides `self.onmessage` and `self.postMessage`
- At runtime in a Web Worker, `self` refers to `DedicatedWorkerGlobalScope`
- This works because `Window` and `DedicatedWorkerGlobalScope` share the `onmessage`/`postMessage` API
- Do NOT add a separate tsconfig for workers — the types are compatible enough for MVP

### Testing Strategy

**Test environment:** Vitest with jsdom (already configured in `vitest.config.ts`). jsdom provides `DOMParser` which the parser needs.

**Pattern:** Follow existing co-located test pattern (see `src/lib/utils/slug.test.ts`, `src/components/map/RouteLayer.test.ts`).

**Test files and focus areas:**

| File | Tests | Focus |
|------|-------|-------|
| `src/lib/gpx/parser.test.ts` | ~9 tests | Single track, multi-track, prefixed namespace, missing name, missing time/ele, multi-segment, empty file, invalid XML, no tracks |
| `src/lib/gpx/simplify.test.ts` | ~7 tests | Straight line (all removed), zigzag (tacks preserved), 2 points returned as-is, empty array, large input (1000+ points), custom epsilon, collinear points |
| `src/lib/gpx/to-geojson.test.ts` | ~4 tests | Coordinate order [lng, lat], type is "LineString", empty track, single point |
| `src/lib/geo/distance.test.ts` | ~6 tests | Known distance pairs (Marseille→Toulon ~32nm), zero distance, speed calculation, full stats computation, null timestamps handling |
| `src/lib/geo/stopover-detection.test.ts` | ~5 tests | Single track (2 stopovers), overlapping endpoints merged, isolated endpoints, empty input, merge radius |
| `src/lib/gpx/worker.test.ts` | ~4 tests | Registered worker handler progress order, normalized error format, result type structure, namespaced GPX flow |

**Worker tests:** Test the registered worker handler in jsdom with a mock worker scope plus direct `processGpxFile()` integration coverage.

**Known distance reference values for tests:**
- Marseille (43.2965, 5.3698) → Toulon (43.1242, 5.9280) ≈ 26 nm
- Straight line: same point to same point = 0 nm
- 1 degree of latitude ≈ 60 nm

### Sample GPX Test Fixture

Create a test helper with GPX XML strings — do NOT create fixture files:

```typescript
// In parser.test.ts
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
```

### Anti-Patterns — Do NOT

- **Do NOT use recursive Douglas-Peucker** — will stack overflow on 1M+ points
- **Do NOT install XML parsing libraries** (fast-xml-parser, xml2js, etc.) — DOMParser is native and sufficient for MVP
- **Do NOT store coordinates as `[lat, lng]`** — GeoJSON is always `[longitude, latitude]`
- **Do NOT use `any` type** — all data flows through typed interfaces in `src/types/gpx.ts`
- **Do NOT import from `@supabase/*`** — this story has zero Supabase interaction
- **Do NOT create UI components** — no React files in this story
- **Do NOT create `src/lib/data/legs.ts`** — data layer comes in Story 2.3
- **Do NOT add `worker-loader` or similar packages** — `new URL(..., import.meta.url)` is the native pattern
- **Do NOT use `SharedArrayBuffer` or `Atomics`** — simple `postMessage` protocol is sufficient
- **Do NOT create a separate `tsconfig.worker.json`** — the main tsconfig types are compatible

### Previous Story (2.1) Intelligence

Story 2.1 established the map foundation. Key patterns to follow:
- **Leaflet packages installed:** leaflet 1.9.4, react-leaflet 5.0.0, @types/leaflet 1.9.21
- **MapCanvas, RouteLayer, MapLoader** exist in `src/components/map/` — they accept `GeoJSON.LineString[]` for tracks. Story 2.2's output format (`GeoJSON.LineString[]`) is designed to feed directly into these components.
- **Coordinate conversion** happens only in `RouteLayer.tsx` — `toLatLngs()` converts `[lng, lat]` → `[lat, lng]` for Leaflet
- **Test pattern:** `import { describe, expect, it } from "vitest"` — no `beforeEach` unless needed
- **81 tests currently passing** across 13 test files — do not break them

### Package Versions (No New Dependencies)

This story adds **zero npm packages**. All processing uses native browser APIs:
- `DOMParser` — native, available in Web Worker context
- `File.text()` — native File API for reading file content
- `Math.*` — native math for Haversine and distance calculations

Existing relevant packages:
| Package | Version | Relevance |
|---------|---------|-----------|
| vitest | ^4.1.0 | Test runner — jsdom environment provides DOMParser |
| typescript | ^5 | Strict mode, all types defined |

### 3-Tier Containment Compliance

```
✅ src/types/gpx.ts — pure types, no imports from @supabase
✅ src/lib/gpx/parser.ts — uses only DOMParser (native)
✅ src/lib/gpx/simplify.ts — pure math, zero imports beyond types
✅ src/lib/gpx/to-geojson.ts — pure conversion, zero imports beyond types
✅ src/lib/gpx/worker.ts — imports from src/lib/gpx/ and src/lib/geo/ only
✅ src/lib/geo/distance.ts — pure math, zero imports beyond types
✅ src/lib/geo/stopover-detection.ts — imports from src/lib/geo/distance only
❌ NEVER import @supabase/* anywhere in this story
```

### Performance Considerations

- **400MB file → `file.text()`:** Reads entire file into a string. On mobile with 3-4GB RAM, this leaves ~2-3GB for parsing and processing. DOMParser will allocate additional memory for the DOM tree.
- **Douglas-Peucker with `Uint8Array` mask:** Avoids creating intermediate arrays. For 1M points, the mask is only 1MB.
- **Simplification reduces points dramatically:** A typical 1M-point track simplifies to ~50-100k points at epsilon 0.0001°, well within the NFR-4 target of 100k points with <100ms map interaction latency.
- **Stats computation is O(n):** Single pass through simplified points, no additional allocation.
- **Memory release:** After parsing, the raw `xmlString` and DOM tree should be eligible for GC. The `tracks` array holds only the structured points. After simplification, the original points arrays can be released when no longer referenced.

### Project Structure Notes

**Both `src/lib/gpx/` and `src/lib/geo/` directories already exist** (created empty during project setup). No need to create directories.

All new files align with the architecture document's directory structure:

```
src/
├── lib/
│   ├── gpx/                          # NEW — GPX processing pipeline
│   │   ├── parser.ts                 # GPX XML → GpxTrack[]
│   │   ├── parser.test.ts
│   │   ├── simplify.ts              # Douglas-Peucker iterative
│   │   ├── simplify.test.ts
│   │   ├── to-geojson.ts            # GpxTrackPoint[] → GeoJSON.LineString
│   │   ├── to-geojson.test.ts
│   │   ├── worker.ts                # Web Worker entry point
│   │   └── worker.test.ts           # Pipeline integration test
│   └── geo/                          # NEW — Geospatial utilities
│       ├── distance.ts              # Haversine (nm), speed (kts), stats
│       ├── distance.test.ts
│       ├── stopover-detection.ts    # Endpoint-based detection
│       └── stopover-detection.test.ts
└── types/
    ├── gpx.ts                        # NEW — GPX processing types
    ├── index.ts                      # Existing — ActionResponse, ErrorCode
    └── supabase.ts                   # Existing — generated DB types
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — GPX processing pipeline, Web Worker messages, src/lib/gpx/ structure, GeoJSON format, AI agent principles]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Import flow UX, ImportProgress component, DOMParser recommendation, processing feedback]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-4, NFR-2, NFR-4]
- [Source: _bmad-output/implementation-artifacts/2-1-map-integration-and-voyage-view.md — MapCanvas accepts GeoJSON.LineString[], RouteLayer coordinate conversion, test patterns]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions, GPX processing section]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- 2026-03-16: Fixed review findings in parser namespace handling, worker error normalization, and worker protocol test coverage

### Completion Notes List

- All 8 tasks completed successfully in a single session
- 38 new tests added (119 total, 0 regressions from 81 existing)
- Zero npm packages added — all processing uses native browser APIs (DOMParser, Math, File)
- Douglas-Peucker uses iterative stack-based algorithm with Uint8Array mask (no recursion)
- GeoJSON coordinates stored in [lng, lat] order per spec
- 3-tier containment compliance verified: no @supabase imports in any new file
- TypeScript strict, ESLint, and production build all pass clean
- Worker pipeline tested through the registered message handler and direct `processGpxFile()` integration path

### Change Log

- 2026-03-16: Story 2.2 implemented — full GPX processing pipeline with 37 tests
- 2026-03-16: Review fixes applied — namespace-safe parsing, normalized worker errors, real worker protocol tests

### File List

- `src/types/gpx.ts` (new) — Type definitions for GPX processing
- `src/lib/geo/distance.ts` (new) — Haversine distance, speed, track stats computation
- `src/lib/geo/distance.test.ts` (new) — 9 tests for distance and stats
- `src/lib/geo/stopover-detection.ts` (new) — Endpoint-based stopover detection with merge radius
- `src/lib/geo/stopover-detection.test.ts` (new) — 5 tests for stopover detection
- `src/lib/gpx/parser.ts` (new) — GPX XML parser using DOMParser
- `src/lib/gpx/parser.test.ts` (new) — 9 tests for parser
- `src/lib/gpx/simplify.ts` (new) — Iterative Douglas-Peucker simplification
- `src/lib/gpx/simplify.test.ts` (new) — 7 tests for simplifier
- `src/lib/gpx/to-geojson.ts` (new) — GpxTrackPoint[] → GeoJSON.LineString converter
- `src/lib/gpx/to-geojson.test.ts` (new) — 4 tests for GeoJSON conversion
- `src/lib/gpx/worker.ts` (new) — Web Worker entry point orchestrating full pipeline
- `src/lib/gpx/worker.test.ts` (new) — 4 real worker protocol and integration tests
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified) — Status updated
- `_bmad-output/implementation-artifacts/2-2-gpx-processing-pipeline.md` (modified) — Tasks marked complete
