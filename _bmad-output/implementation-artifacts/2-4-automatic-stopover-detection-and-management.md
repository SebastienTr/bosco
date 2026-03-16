# Story 2.4: Automatic Stopover Detection and Management

Status: review

## Story

As a sailor,
I want stopovers to be automatically detected at the start and end of each leg and named with real place names,
so that my voyage shows meaningful waypoints without manual data entry.

## Acceptance Criteria

### AC-1: Stopovers Database Table
**Given** the `stopovers` table does not exist
**When** the migration runs
**Then** a `stopovers` table is created with columns: `id` (uuid PK), `voyage_id` (uuid FK to voyages ON DELETE CASCADE), `name` (text NOT NULL DEFAULT ''), `country` (text, nullable), `latitude` (numeric NOT NULL), `longitude` (numeric NOT NULL), `arrived_at` (timestamptz, nullable), `departed_at` (timestamptz, nullable), `created_at` (timestamptz DEFAULT now())
**And** RLS policies allow authenticated users to read/insert/update/delete only stopovers belonging to their own voyages (join through `voyages.user_id`)
**And** an index exists on `voyage_id` for fast stopover lookups

### AC-2: Stopover Persistence on Import
**Given** a sailor imports tracks into a voyage
**When** the import is confirmed
**Then** stopovers detected by the processing pipeline are persisted to the `stopovers` table
**And** each stopover's coordinates, type, and associated track timing are saved
**And** if a start/end point falls within 2 km of an existing stopover for this voyage, the existing stopover is reused (no duplicate)
**And** if no existing stopover matches, a new stopover is created

### AC-3: Reverse Geocoding via Nominatim Proxy
**Given** a new stopover is created without a name
**When** the system calls the `/api/geocode` route with the stopover's coordinates
**Then** the stopover is updated with a human-readable place name and country
**And** the API route enforces rate-limiting (max 1 request per second)
**And** results are cached (in-memory) to avoid repeated Nominatim calls for the same coordinates
**And** if Nominatim is unavailable, the stopover retains empty name — no error shown to user

### AC-4: Stopover Map Markers
**Given** a voyage has stopovers
**When** the sailor views the voyage page
**Then** stopovers appear as coral (#E8614D) circle markers (14px, white 2px border) on the map
**And** markers have `role="button"` and `aria-label="Stopover: {name}, {country}"`
**And** tapping a marker shows the stopover name in a tooltip or popup

### AC-5: Stopover Management — Rename
**Given** a sailor views a stopover on the voyage page
**When** they click the stopover marker and edit the name
**Then** the stopover name is updated in the database
**And** the map marker reflects the new name immediately

### AC-6: Stopover Management — Delete
**Given** a sailor views a stopover on the voyage page
**When** they delete a stopover
**Then** the stopover is removed from the database and disappears from the map

### AC-7: Stopover Management — Reposition
**Given** a sailor views a stopover on the voyage page
**When** they drag the stopover marker to a new position
**Then** the stopover's coordinates are updated in the database
**And** reverse geocoding fires for the new position to update the name

### AC-8: Stopover Management — Merge
**Given** a voyage has two stopovers that represent the same location
**When** the sailor selects two stopovers and merges them
**Then** a single stopover remains at the average position of the two
**And** the merged stopover uses the arrival time of the earlier and departure time of the later

### AC-9: Stopovers Browsable by Country
**Given** a voyage has stopovers across multiple countries
**When** the sailor views the voyage page
**Then** stopovers can be browsed in a list grouped by country
**And** tapping a stopover in the list centers the map on that stopover

## Tasks / Subtasks

- [x] Task 1: Create stopovers database migration (AC: #1)
  - [x] Run `supabase migration new stopovers` to create timestamped migration file
  - [x] Create `stopovers` table with all columns per AC-1
  - [x] Add RLS policies (SELECT/INSERT/UPDATE/DELETE using `voyages.user_id = auth.uid()` join)
  - [x] Add index `idx_stopovers_voyage_id` on `voyage_id`
  - [x] Run `supabase db reset` and `supabase gen types typescript --local > src/types/supabase.ts`

- [x] Task 2: Create stopovers data layer (AC: #1, #2, #5, #6, #7, #8)
  - [x] Create `src/lib/data/stopovers.ts` following the pattern from `src/lib/data/legs.ts`
  - [x] Implement `insertStopovers(stopovers: StopoverInsert[])`
  - [x] Implement `getStopoversByVoyageId(voyageId: string)`
  - [x] Implement `updateStopover(id: string, data: StopoverUpdate)`
  - [x] Implement `deleteStopover(id: string)`
  - [x] Implement `getStopoversByVoyageIdWithinRadius(voyageId: string, lon: number, lat: number, radiusNm: number)` — uses Postgres `point` distance or a raw SQL query for proximity check
  - [x] Create `src/lib/data/stopovers.test.ts`

- [x] Task 3: Create reverse geocoding API route (AC: #3)
  - [x] Create `src/app/api/geocode/route.ts` — Next.js Route Handler (GET)
  - [x] Accept `lat` and `lon` query parameters
  - [x] Implement in-memory LRU cache (keyed on rounded lat/lon to ~100m precision)
  - [x] Implement rate-limiter: 1 request/second to Nominatim using a timestamp queue
  - [x] Call Nominatim `reverse` endpoint: `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}`
  - [x] Set `User-Agent` header per Nominatim usage policy (e.g., `Bosco/1.0`)
  - [x] Extract `display_name` (or city/town/village) and `address.country` from response
  - [x] Return `{ name: string, country: string | null }` on success
  - [x] Return `{ name: "", country: null }` on error (graceful degradation)
  - [x] Create `src/app/api/geocode/route.test.ts`

- [x] Task 4: Create reverse geocode client helper (AC: #3)
  - [x] Create `src/lib/geo/reverse-geocode.ts`
  - [x] Implement `reverseGeocode(lat: number, lon: number): Promise<{ name: string; country: string | null }>`
  - [x] Calls `/api/geocode?lat={lat}&lon={lon}`
  - [x] Returns `{ name: "", country: null }` on fetch error (silent failure)

- [x] Task 5: Create stopover Server Actions (AC: #2, #5, #6, #7, #8)
  - [x] Create `src/app/voyage/[id]/stopover/actions.ts`
  - [x] Implement `persistStopovers(input)` — receives voyage ID + array of stopover candidates, deduplicates against existing stopovers within radius, inserts new ones, calls reverse geocode for new stopovers, returns all stopovers
  - [x] Implement `renameStopover(input: { id: string, name: string })` — Zod validated, auth + ownership check
  - [x] Implement `repositionStopover(input: { id: string, latitude: number, longitude: number })` — triggers reverse geocode
  - [x] Implement `deleteStopover(input: { id: string })`
  - [x] Implement `mergeStopovers(input: { voyageId: string, stopoverIds: [string, string] })`
  - [x] Create `src/app/voyage/[id]/stopover/actions.test.ts`

- [x] Task 6: Update import flow to persist stopovers (AC: #2)
  - [x] Modify `src/app/voyage/[id]/import/actions.ts` — after inserting legs, call `persistStopovers` with the `StopoverCandidate[]` from ProcessingResult
  - [x] Modify `src/components/gpx/GpxImporter.tsx` — pass `result.stopovers` alongside legs in the `importTracks` call
  - [x] Update `ImportTracksSchema` to accept optional `stopovers` array

- [x] Task 7: Create StopoverMarker component (AC: #4)
  - [x] Create `src/components/map/StopoverMarker.tsx` — `"use client"` component
  - [x] Use Leaflet `CircleMarker` for coral circle styling
  - [x] Props: `position: [number, number]` (GeoJSON order), `name: string`, `country: string | null`, `onRename`, `onDelete`, `onDragEnd`
  - [x] Tooltip/popup on click showing name + country
  - [x] Draggable mode for repositioning (AC: #7)
  - [x] Accessibility: `role="button"`, `aria-label="Stopover: {name}, {country}"`

- [x] Task 8: Create StopoverPopup component (AC: #5, #6)
  - [x] Popup integrated directly in StopoverMarker (inline editable name + delete button)

- [x] Task 9: Update MapCanvas and voyage page (AC: #4, #9)
  - [x] Modify `src/components/map/MapCanvas.tsx` — accept `children` prop to render additional layers (markers)
  - [x] Modify `src/components/map/MapLoader.tsx` — forward children
  - [x] Modify `src/app/voyage/[id]/page.tsx` — fetch stopovers with `getStopoversByVoyageId`, pass to map as StopoverMarker children

- [x] Task 10: Create StopoverList component (AC: #9)
  - [x] Create `src/components/voyage/StopoverList.tsx`
  - [x] Groups stopovers by `country` field
  - [x] Each stopover shows name and arrival date
  - [x] Tap a stopover fires a callback to center map on that position
  - [x] Toggle button via StopoverPanel to show/hide the list
  - [x] Mobile: overlay panel, Desktop: side panel

- [x] Task 11: Create stopover management messages (AC: all)
  - [x] Create `src/app/voyage/[id]/stopover/messages.ts`
  - [x] All user-facing strings externalized

- [x] Task 12: Verify build and tests (AC: all)
  - [x] All new tests pass: `npm run test` — 148 tests passing
  - [x] TypeScript strict clean: `npx tsc --noEmit`
  - [x] ESLint clean: `npm run lint`
  - [x] Build succeeds: `npm run build`
  - [x] All existing 132 tests still pass (no regressions) — 148 total (132 + 16 new)

## Dev Notes

### Scope Boundary — CRITICAL

This story creates the **complete stopover system** for the creator experience: database, data layer, reverse geocoding proxy, stopover persistence during import, map markers, management UI, and stopover browsing by country.

**IN SCOPE:**
- `supabase/migrations/{timestamp}_stopovers.sql` — Stopovers table + RLS
- `src/lib/data/stopovers.ts` — Repository functions (Tier 2)
- `src/app/api/geocode/route.ts` — Nominatim reverse geocoding proxy
- `src/lib/geo/reverse-geocode.ts` — Client helper for geocoding
- `src/app/voyage/[id]/stopover/actions.ts` — Stopover Server Actions (Tier 3)
- `src/app/voyage/[id]/stopover/messages.ts` — i18n strings
- `src/components/map/StopoverMarker.tsx` — Map marker component
- `src/components/map/StopoverPopup.tsx` — Marker popup with inline edit
- `src/components/voyage/StopoverList.tsx` — Country-grouped stopover browser
- Updates to `src/app/voyage/[id]/import/actions.ts` — persist stopovers on import
- Updates to `src/components/gpx/GpxImporter.tsx` — pass stopovers to import
- Updates to `src/components/map/MapCanvas.tsx` — support children (markers)
- Updates to `src/app/voyage/[id]/page.tsx` — fetch + display stopovers
- Co-located test files

**OUT OF SCOPE — Do NOT create:**
- No `StopoverSheet` bottom sheet (full detail view) — Story 3.2 (public pages)
- No `PortsPanel` sliding panel — Story 3.2 (public pages)
- No public page stopover display — Story 3.2
- No stopover detection radius configuration UI — future enhancement
- No route animation with stopovers — Story 3.1
- No log entry linking to stopovers — Story 4.1
- No stopover stats (duration at port) — future enhancement

### Database Migration — `stopovers` table

```sql
CREATE TABLE stopovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id UUID NOT NULL REFERENCES voyages(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  country TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  arrived_at TIMESTAMPTZ,
  departed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stopovers_voyage_id ON stopovers(voyage_id);

ALTER TABLE stopovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stopovers"
  ON stopovers FOR SELECT TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert own stopovers"
  ON stopovers FOR INSERT TO authenticated
  WITH CHECK (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update own stopovers"
  ON stopovers FOR UPDATE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete own stopovers"
  ON stopovers FOR DELETE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));
```

**Important:** Coordinates stored as separate `latitude`/`longitude` NUMERIC columns (not GeoJSON). The `StopoverCandidate` type uses `[longitude, latitude]` GeoJSON order — be careful to map `position[0]` → `longitude` and `position[1]` → `latitude` when converting.

### Data Layer — `src/lib/data/stopovers.ts`

Follow the exact pattern from `src/lib/data/legs.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export type Stopover = Tables<"stopovers">;
export type StopoverInsert = Omit<TablesInsert<"stopovers">, "id" | "created_at">;
export type StopoverUpdate = TablesUpdate<"stopovers">;

export async function insertStopovers(stopovers: StopoverInsert[]) {
  const supabase = await createClient();
  return supabase.from("stopovers").insert(stopovers).select();
}

export async function getStopoversByVoyageId(voyageId: string) {
  const supabase = await createClient();
  return supabase
    .from("stopovers")
    .select("*")
    .eq("voyage_id", voyageId)
    .order("arrived_at", { ascending: true, nullsFirst: false });
}

export async function updateStopover(id: string, data: Partial<StopoverUpdate>) {
  const supabase = await createClient();
  return supabase.from("stopovers").update(data).eq("id", id).select().single();
}

export async function deleteStopover(id: string) {
  const supabase = await createClient();
  return supabase.from("stopovers").delete().eq("id", id);
}
```

### Deduplication Logic — CRITICAL

When importing new tracks, stopovers must be deduplicated against existing stopovers for the same voyage. The flow:

1. Fetch existing stopovers for the voyage from DB
2. For each new `StopoverCandidate` from `ProcessingResult`:
   a. Compute haversine distance to each existing stopover
   b. If any existing stopover is within `DEFAULT_MERGE_RADIUS_NM` (1.08 nm ≈ 2 km): skip (reuse existing)
   c. If no match: insert new stopover
3. Update timing: if a new leg connects to an existing stopover, update `arrived_at`/`departed_at` if the new times extend the range

The `haversineDistanceNm` function already exists in `src/lib/geo/distance.ts` — reuse it in the Server Action (server-side, not in the worker).

### StopoverCandidate → DB Mapping

```typescript
// StopoverCandidate from worker:
{
  position: [longitude, latitude],  // GeoJSON order!
  trackIndices: [0, 1],
  type: "waypoint"
}

// Map to StopoverInsert:
{
  voyage_id: voyageId,
  name: "",                          // Empty until reverse geocode resolves
  country: null,
  longitude: candidate.position[0],  // position[0] = longitude
  latitude: candidate.position[1],   // position[1] = latitude
  arrived_at: derivedFromTrackStats, // End time of arriving leg
  departed_at: derivedFromTrackStats // Start time of departing leg
}
```

**Deriving arrived_at / departed_at from track stats:**
- A stopover's `arrived_at` = `endTime` of the track that ends here
- A stopover's `departed_at` = `startTime` of the track that starts here
- Use `trackIndices` and the `type` field to determine which tracks connect
- For "departure" type: only `departed_at` (start of first track)
- For "arrival" type: only `arrived_at` (end of last track)
- For "waypoint" type: both (end of incoming track + start of outgoing track)

### Reverse Geocoding API Route

**Location:** `src/app/api/geocode/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

// In-memory cache: key = "lat,lon" rounded to 3 decimals (~111m precision)
const cache = new Map<string, { name: string; country: string | null }>();
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100; // >1 second between Nominatim requests

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { name: "", country: null },
      { status: 400 }
    );
  }

  const key = cacheKey(lat, lon);
  if (cache.has(key)) {
    return NextResponse.json(cache.get(key));
  }

  // Rate limiting
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: { "User-Agent": "Bosco/1.0 (sailing logbook)" },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ name: "", country: null });
    }

    const data = await response.json();
    const name = data.address?.city
      || data.address?.town
      || data.address?.village
      || data.address?.hamlet
      || data.name
      || "";
    const country = data.address?.country ?? null;

    const result = { name, country };
    cache.set(key, result);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ name: "", country: null });
  }
}
```

**Key decisions:**
- In-memory `Map` cache — sufficient for single-instance MVP deployment on Vercel (serverless functions may cold-start, but cache helps within a single invocation burst like importing multiple stopovers)
- Rate limiter uses simple timestamp tracking — Nominatim's usage policy requires max 1 req/sec
- Graceful degradation: never throws, always returns a valid response shape
- Coordinates rounded to 3 decimal places for cache key (~111m precision) — avoids cache misses from floating-point drift
- Extracts city/town/village from Nominatim's structured `address` object for clean place names

### StopoverMarker Component

```typescript
// src/components/map/StopoverMarker.tsx
"use client";

import { CircleMarker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

interface StopoverMarkerProps {
  position: [number, number]; // [longitude, latitude] GeoJSON order
  name: string;
  country: string | null;
  onRename?: (name: string) => void;
  onDelete?: () => void;
  onDragEnd?: (lat: number, lon: number) => void;
}
```

**Visual spec:** Coral circle (#E8614D), 7px radius (14px diameter), white 2px border, 0.9 opacity. On hover: 8px radius. Selected: 9px radius.

**Important:** Convert GeoJSON `[lng, lat]` → Leaflet `[lat, lng]` at the component boundary:
```typescript
const leafletPosition: LatLngExpression = [position[1], position[0]];
```

### Updating the Import Flow

The cleanest approach: **extend `importTracks` Server Action** to accept stopovers alongside legs.

**Option A (recommended):** Add `stopovers` field to `ImportTracksSchema`:
```typescript
const ImportTracksSchema = z.object({
  voyageId: z.string().uuid(),
  legs: z.array(LegSchema).min(1),
  stopovers: z.array(z.object({
    longitude: z.number(),
    latitude: z.number(),
    type: z.enum(["departure", "arrival", "waypoint"]),
    track_indices: z.array(z.number()),
  })).optional(),
});
```

Then in `importTracks`, after inserting legs:
1. Fetch existing stopovers for the voyage
2. Filter new stopovers that aren't within radius of existing ones
3. Insert new stopovers
4. Fire reverse geocoding for new stopovers (non-blocking)

**Option B (alternative):** Keep `importTracks` unchanged and call a separate `persistStopovers` action from the client after import. This decouples the operations but requires two Server Action calls.

**Choose Option A** — it's atomic and prevents partial states where legs exist but stopovers don't.

### Reverse Geocoding After Insert — Non-Blocking Pattern

After inserting stopovers, reverse geocode each one. This should NOT block the import confirmation:

```typescript
// In the Server Action, after inserting stopovers:
const newStopovers = insertResult.data;

// Fire reverse geocode for each (non-blocking — errors are swallowed)
Promise.allSettled(
  newStopovers.map(async (stopover) => {
    const geo = await fetch(`/api/geocode?lat=${stopover.latitude}&lon=${stopover.longitude}`);
    if (geo.ok) {
      const { name, country } = await geo.json();
      if (name) {
        await updateStopover(stopover.id, { name, country });
      }
    }
  })
);
```

**Alternative approach:** Since the Server Action runs server-side and can't call its own API route easily, implement the reverse geocode logic directly in a utility function (`src/lib/geo/reverse-geocode-server.ts`) that the Server Action calls. The API route is for client-side calls.

**Better pattern:** Create `reverseGeocodeServer(lat: number, lon: number)` in `src/lib/geo/reverse-geocode.ts` that contains the Nominatim call + cache logic. Both the API route and the Server Action use this shared function. This avoids the Server Action calling itself.

### MapCanvas Children Support

To render StopoverMarkers inside the map, MapCanvas needs to forward `children`:

```typescript
// Updated MapCanvasProps:
export interface MapCanvasProps {
  center?: LatLngExpression;
  zoom?: number;
  tracks?: GeoJSON.LineString[];
  trackColors?: string[];
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode; // NEW — for markers and other overlays
}
```

And in the JSX, render `{children}` inside `<MapContainer>` after the tile and route layers.

MapLoader must also accept and forward `children`:
```typescript
export default function MapLoader({ children, ...props }: MapCanvasProps) {
  return <MapCanvas {...props}>{children}</MapCanvas>;
}
```

### StopoverList Component

Simple country-grouped list for the creator's voyage page:

```typescript
// src/components/voyage/StopoverList.tsx
interface StopoverListProps {
  stopovers: Stopover[];
  onSelect: (stopover: Stopover) => void;
}
```

**Country grouping:** Group by `country` field. Unknown country (null) grouped under "Unknown". Display country name with optional flag emoji (simple lookup table for common sailing countries).

**Layout:**
- Mobile: toggleable overlay panel (button in voyage header)
- Desktop ≥1024px: side panel

**Keep it simple:** A scrollable list with `<details>` elements for country groups. No external library needed.

### Timing Derivation from StopoverCandidate + TrackStats

The `StopoverCandidate` has `trackIndices` indicating which tracks connect at this point. Combined with `TrackStats[]`:

```typescript
function deriveStopoverTiming(
  candidate: StopoverCandidate,
  stats: TrackStats[]
): { arrived_at: string | null; departed_at: string | null } {
  let arrived_at: string | null = null;
  let departed_at: string | null = null;

  for (const idx of candidate.trackIndices) {
    const trackStats = stats[idx];
    // If this track ENDS at this stopover → arrived_at
    // If this track STARTS at this stopover → departed_at
    // Use type hints: "departure" means tracks start here, "arrival" means tracks end here
    // "waypoint" means both
  }

  // For "departure": departed_at = startTime of earliest connected track
  // For "arrival": arrived_at = endTime of latest connected track
  // For "waypoint": arrived_at = endTime of incoming track, departed_at = startTime of outgoing track

  return { arrived_at, departed_at };
}
```

**Heuristic for waypoints:** A waypoint connects an arriving track (uses `endTime`) and a departing track (uses `startTime`). The `trackIndices` contain both — determine which is arriving vs departing by checking if the track endpoint that's near the stopover is a start point or end point. This information is already computed during `detectStopovers` but NOT currently exposed in `StopoverCandidate`.

**Practical approach:** Since `StopoverCandidate.type` tells us the role, and `trackIndices` tells us which tracks:
- For "departure": use `stats[min(trackIndices)].startTime` as `departed_at`
- For "arrival": use `stats[max(trackIndices)].endTime` as `arrived_at`
- For "waypoint": look at all connected tracks — the one with the lowest index likely arrives, the next one departs

### Merge Stopovers Logic

When merging two stopovers:

```typescript
// Average position
const mergedLat = (s1.latitude + s2.latitude) / 2;
const mergedLon = (s1.longitude + s2.longitude) / 2;

// Time range: earliest arrival, latest departure
const arrived_at = [s1.arrived_at, s2.arrived_at]
  .filter(Boolean).sort()[0] ?? null;
const departed_at = [s1.departed_at, s2.departed_at]
  .filter(Boolean).sort().reverse()[0] ?? null;

// Keep the name that's not empty, prefer the first if both have names
const name = s1.name || s2.name;

// Update first, delete second
await updateStopover(s1.id, { latitude: mergedLat, longitude: mergedLon, arrived_at, departed_at, name });
await deleteStopover(s2.id);
```

### Testing Strategy

| File | Tests | Focus |
|------|-------|-------|
| `src/lib/data/stopovers.test.ts` | ~5 tests | insertStopovers, getStopoversByVoyageId, updateStopover, deleteStopover |
| `src/app/voyage/[id]/stopover/actions.test.ts` | ~8 tests | persistStopovers with dedup, renameStopover, deleteStopover, repositionStopover, mergeStopovers, auth/ownership |
| `src/app/api/geocode/route.test.ts` | ~4 tests | Valid coords, invalid coords, cache hit, error handling |

**Data layer tests** follow `src/lib/data/legs.test.ts` pattern — mock the Supabase client.

**API route tests** mock the `fetch` call to Nominatim.

### 3-Tier Containment Compliance

```
✅ supabase/migrations/{ts}_stopovers.sql — SQL only
✅ src/lib/data/stopovers.ts — imports from src/lib/supabase/server (Tier 1→2)
✅ src/lib/geo/reverse-geocode.ts — utility, no Supabase import
✅ src/app/api/geocode/route.ts — Next.js Route Handler (Tier 3 equivalent)
✅ src/app/voyage/[id]/stopover/actions.ts — imports from src/lib/data/, src/lib/auth (Tier 2→3)
✅ src/components/map/StopoverMarker.tsx — calls Server Actions only (Tier 3→4)
✅ src/components/voyage/StopoverList.tsx — presentational (Tier 4)
❌ NEVER import @supabase/* in components or actions
❌ NEVER import src/lib/supabase/* in Server Actions
```

### Anti-Patterns — Do NOT

- **Do NOT** store stopover coordinates as GeoJSON in the DB — use separate `latitude`/`longitude` columns
- **Do NOT** call Nominatim directly from the client — use the `/api/geocode` proxy
- **Do NOT** block import confirmation on reverse geocoding — fire and forget
- **Do NOT** create `StopoverSheet` or `PortsPanel` — those are Story 3.2 (public pages)
- **Do NOT** add detection radius configuration UI — future enhancement
- **Do NOT** use `any` type — use generated Supabase types and Zod inferred types
- **Do NOT** throw from Server Actions — always return `{ data, error }`
- **Do NOT** place custom components in `src/components/ui/` — shadcn/ui only
- **Do NOT** store coordinates as `[lat, lng]` — GeoJSON is `[lng, lat]`, DB columns are explicit `latitude`/`longitude`
- **Do NOT** install new npm packages — all dependencies are already present
- **Do NOT** modify `src/lib/geo/stopover-detection.ts` — it's already complete from Story 2.2
- **Do NOT** modify `src/lib/gpx/worker.ts` — it's already complete, stopovers flow through correctly

### Previous Story (2.3) Intelligence

Story 2.3 created the complete import flow. Key patterns to reuse:

- **`importTracks` Server Action** in `src/app/voyage/[id]/import/actions.ts` — extend to handle stopovers
- **`GpxImporter` component** in `src/components/gpx/GpxImporter.tsx` — `ProcessingResult` already contains `stopovers: StopoverCandidate[]` but they're currently discarded after preview
- **`ImportLegData` type** in `src/lib/gpx/import.ts` — data mapping pattern to follow
- **`MapCanvas` + `RouteLayer`** — extend with children for markers
- **132 tests currently passing** — do not break them
- **Button uses inline `className` styling** (not `asChild` — `@base-ui/react` Button doesn't have `asChild`)
- **Sonner toast** for success/error feedback: `import { toast } from "sonner"`
- **i18n pattern**: messages.ts co-located with route directory

### Existing Code to Reuse

| Module | Path | Reuse in This Story |
|--------|------|---------------------|
| `detectStopovers()` | `src/lib/geo/stopover-detection.ts` | Algorithm already runs in worker — DO NOT reimplement |
| `haversineDistanceNm()` | `src/lib/geo/distance.ts` | Use for deduplication radius check in Server Action |
| `StopoverCandidate` type | `src/types/gpx.ts` | Input type from worker result |
| `ProcessingResult` | `src/types/gpx.ts` | Contains `stopovers` array from worker |
| `importTracks` | `src/app/voyage/[id]/import/actions.ts` | Extend to persist stopovers |
| `GpxImporter` | `src/components/gpx/GpxImporter.tsx` | Modify to pass stopovers |
| `MapCanvas` | `src/components/map/MapCanvas.tsx` | Extend with children |
| `MapLoader` | `src/components/map/MapLoader.tsx` | Extend with children |
| `RouteLayer` + `toLatLngs` | `src/components/map/RouteLayer.tsx` | Coordinate conversion pattern |
| `voyages.ts` pattern | `src/lib/data/voyages.ts` | Data layer pattern (Tier 2) |
| `legs.ts` pattern | `src/lib/data/legs.ts` | Batch insert pattern |

### Package Versions (No New Dependencies)

This story adds **zero npm packages**. All required packages are already installed:

| Package | Usage |
|---------|-------|
| `zod` | Server Action input validation |
| `sonner` | Toast notifications |
| `next` | API Routes, Server Actions |
| `react` | Components |
| `leaflet` | CircleMarker, Popup |
| `react-leaflet` | React integration for markers |

### Project Structure Notes

```
src/
├── app/
│   ├── api/
│   │   └── geocode/
│   │       ├── route.ts                 # NEW — Nominatim proxy (rate-limited, cached)
│   │       └── route.test.ts            # NEW
│   └── voyage/[id]/
│       ├── page.tsx                     # MODIFY — fetch stopovers, pass to map
│       ├── import/
│       │   └── actions.ts              # MODIFY — persist stopovers on import
│       └── stopover/                    # NEW directory
│           ├── actions.ts              # NEW — stopover CRUD Server Actions
│           ├── actions.test.ts         # NEW
│           └── messages.ts             # NEW — i18n strings
├── components/
│   ├── map/
│   │   ├── MapCanvas.tsx               # MODIFY — accept children prop
│   │   ├── MapLoader.tsx               # MODIFY — forward children
│   │   ├── StopoverMarker.tsx          # NEW — coral circle marker
│   │   └── StopoverPopup.tsx           # NEW — inline edit popup
│   └── voyage/
│       └── StopoverList.tsx            # NEW — country-grouped stopover browser
├── lib/
│   ├── data/
│   │   ├── stopovers.ts               # NEW — repository functions
│   │   └── stopovers.test.ts          # NEW
│   └── geo/
│       └── reverse-geocode.ts          # NEW — Nominatim client (server + client helpers)
└── types/
    └── supabase.ts                     # REGENERATED after migration

supabase/migrations/
└── {timestamp}_stopovers.sql           # NEW — Stopovers table + RLS
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.4]
- [Source: _bmad-output/planning-artifacts/architecture.md — 3-tier containment, API route patterns, Nominatim proxy, stopover detection, data layer, CSP headers]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — StopoverMarker design (coral circle, 14px, states), import flow stopover preview, smart defaults, progressive name resolution]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-5 (stopovers), NFR-4 (interaction latency), NFR-9 (mobile-first)]
- [Source: _bmad-output/implementation-artifacts/2-3-gpx-import-flow.md — Import flow architecture, worker pipeline, ProcessingResult, GpxImporter state machine, Server Action patterns]
- [Source: _bmad-output/implementation-artifacts/2-2-gpx-processing-pipeline.md — detectStopovers algorithm, StopoverCandidate type, worker protocol]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions, GeoJSON coordinates, API geocode route reference]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Task 1: Created `supabase/migrations/20260316145232_stopovers.sql` with stopovers table, RLS policies, and voyage_id index. Applied migration and regenerated TypeScript types.
- Task 2: Created `src/lib/data/stopovers.ts` with insertStopovers, getStopoversByVoyageId, updateStopover, deleteStopover. Radius-based proximity check handled in Server Action using haversineDistanceNm instead of Postgres-level query. 5 tests passing.
- Task 3: Created `src/app/api/geocode/route.ts` — Nominatim reverse proxy with in-memory Map cache (3 decimal precision ~111m), rate limiter (1.1s interval), graceful degradation. 4 tests passing.
- Task 4: Created `src/lib/geo/reverse-geocode.ts` with both client-side `reverseGeocode()` (calls /api/geocode) and server-side `reverseGeocodeServer()` (calls Nominatim directly) for Server Actions.
- Task 5: Created stopover Server Actions: persistStopovers (with dedup via haversineDistanceNm), renameStopover, repositionStopover, removeStopover, mergeStopovers. All Zod-validated with auth checks. Non-blocking reverse geocode on insert/reposition. 8 tests passing.
- Task 6: Extended ImportTracksSchema with optional stopovers array. GpxImporter derives arrival/departure timing from TrackStats and passes stopovers to importTracks. importTracks calls persistStopovers non-blocking.
- Task 7: Created StopoverMarker with CircleMarker (coral #E8614D, 7px radius, white 2px border). Inline name editing in Popup. Hover radius change. GeoJSON→Leaflet coordinate conversion at boundary.
- Task 8: Popup integrated directly in StopoverMarker — inline editable name field + delete button.
- Task 9: MapCanvas and MapLoader now accept children prop. Voyage page fetches stopovers and renders StopoverMarkers inside map. Created StopoverMarkers client component managing local state + Server Action callbacks + custom event listener for map centering.
- Task 10: Created StopoverList (country-grouped, details/summary) and StopoverPanel (toggle overlay, custom event dispatch for map centering via bosco:center-stopover).
- Task 11: Created stopover messages.ts with all externalized strings.
- Task 12: All 148 tests pass, tsc clean, lint clean, build succeeds.

### Change Log

- 2026-03-16: Story 2.4 implemented — complete stopover system (database, data layer, reverse geocoding, import integration, map markers, management UI, country-grouped list)

### File List

New files:
- supabase/migrations/20260316145232_stopovers.sql
- src/lib/data/stopovers.ts
- src/lib/data/stopovers.test.ts
- src/app/api/geocode/route.ts
- src/app/api/geocode/route.test.ts
- src/lib/geo/reverse-geocode.ts
- src/app/voyage/[id]/stopover/actions.ts
- src/app/voyage/[id]/stopover/actions.test.ts
- src/app/voyage/[id]/stopover/messages.ts
- src/components/map/StopoverMarker.tsx
- src/components/map/StopoverMarkers.tsx
- src/components/voyage/StopoverList.tsx
- src/components/voyage/StopoverPanel.tsx

Modified files:
- src/types/supabase.ts (regenerated with stopovers table)
- src/app/voyage/[id]/import/actions.ts (extended schema + persist stopovers)
- src/components/gpx/GpxImporter.tsx (pass stopovers with timing derivation)
- src/components/map/MapCanvas.tsx (children prop)
- src/components/map/MapLoader.tsx (forward children)
- src/app/voyage/[id]/page.tsx (fetch + render stopovers)
