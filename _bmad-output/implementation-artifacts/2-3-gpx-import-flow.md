# Story 2.3: GPX Import Flow

Status: done

## Story

As a sailor,
I want to import a GPX file, preview the detected tracks on a map, select which ones to add, and confirm the import,
So that my sailing tracks appear on my voyage map.

## Acceptance Criteria

### AC-1: Legs Database Table
**Given** the `legs` table does not exist
**When** the migration runs
**Then** a `legs` table is created with columns: `id` (uuid PK), `voyage_id` (uuid FK to voyages ON DELETE CASCADE), `track_geojson` (jsonb NOT NULL), `distance_nm` (numeric), `duration_seconds` (integer), `avg_speed_kts` (numeric), `max_speed_kts` (numeric), `started_at` (timestamptz), `ended_at` (timestamptz), `created_at` (timestamptz DEFAULT now())
**And** RLS policies allow authenticated users to read/insert/update/delete only legs belonging to their own voyages (join through `voyages.user_id`)
**And** an index exists on `voyage_id` for fast leg lookups

### AC-2: File Picker
**Given** a sailor on the voyage view taps "Import track"
**When** the import page (`/voyage/[id]/import`) loads
**Then** a file picker is presented accepting `.gpx` files

### AC-3: Processing Progress
**Given** the sailor selects a GPX file
**When** the file is sent to the Web Worker for processing
**Then** the ImportProgress overlay appears with step indicator and progress bar
**And** steps display sequentially: "Parsing tracks..." → "Simplifying..." → "Detecting stopovers..." → "Preparing preview..."
**And** if an error occurs, a retry button is shown with a clear error message
**And** the overlay uses `aria-live` region and `progress` role for accessibility

### AC-4: Track Preview
**Given** processing completes successfully
**When** the preview screen appears
**Then** all detected tracks are shown on a full-screen map, each in a distinct color
**And** a track list shows each track with: name (from GPX metadata), distance (nm), duration, date, and a checkbox (all selected by default)
**And** the sailor can deselect tracks they don't want to import

### AC-5: Merge Option
**Given** a multi-track file (2+ tracks)
**When** the sailor views the import options
**Then** they can choose to import selected tracks as separate legs or as a single merged leg

### AC-6: Import Confirmation
**Given** the sailor taps "Add to voyage"
**When** the import is confirmed
**Then** the simplified GeoJSON and stats for each selected leg are saved to the `legs` table via `src/lib/data/legs.ts`
**And** the sailor is redirected to the voyage view
**And** the new tracks appear on the map alongside any existing tracks
**And** a success toast appears: "{N} track(s) added to {voyage name}"

### AC-7: Performance
**Given** the map renders simplified tracks with up to 100,000 points
**When** the sailor interacts with the map
**Then** interaction latency remains below 100 ms

### AC-8: Units
**Given** all distances and speeds displayed in the import flow
**When** the values are formatted
**Then** distances are in nautical miles (nm) and speeds in knots (kts)

## Tasks / Subtasks

- [x] Task 1: Create legs database migration (AC: #1)
  - [x]Run `supabase migration new legs` to create timestamped migration file
  - [x]Create `legs` table with all columns per AC-1
  - [x]Add RLS policies (SELECT/INSERT/UPDATE/DELETE using `voyages.user_id = auth.uid()` join)
  - [x]Add index `idx_legs_voyage_id` on `voyage_id`
  - [x]Run `supabase db reset` and `supabase gen types typescript` to update `src/types/supabase.ts`

- [x] Task 2: Create legs data layer (AC: #1, #6)
  - [x]Create `src/lib/data/legs.ts` with `Leg` type export and repository functions
  - [x]Implement `insertLegs(legs: LegInsert[])` — batch insert multiple legs
  - [x]Implement `getLegsByVoyageId(voyageId: string)` — fetch all legs for a voyage ordered by `started_at`
  - [x]Create `src/lib/data/legs.test.ts`

- [x] Task 3: Create importTracks Server Action (AC: #6)
  - [x]Create `src/app/voyage/[id]/import/actions.ts`
  - [x]Implement `importTracks(data)` — Zod-validated, requires auth, verifies voyage ownership, inserts legs
  - [x]Create `src/app/voyage/[id]/import/actions.test.ts`

- [x] Task 4: Create ImportProgress component (AC: #3)
  - [x]Create `src/components/gpx/ImportProgress.tsx`
  - [x]Full-screen overlay with step indicator showing 4 processing steps
  - [x]Error state with retry button
  - [x]Accessibility: `aria-live="polite"`, `role="progressbar"`

- [x] Task 5: Create TrackPreview component (AC: #4, #5, #8)
  - [x]Create `src/components/gpx/TrackPreview.tsx`
  - [x]Track list with checkboxes, stats (distance nm, duration, date), distinct color per track
  - [x]Merge toggle when 2+ tracks detected
  - [x]"Add to voyage" primary CTA button

- [x] Task 6: Create GpxImporter orchestrator (AC: #2, #3, #4, #5, #6)
  - [x]Create `src/components/gpx/GpxImporter.tsx` as `"use client"` component
  - [x]`useReducer` state machine: `idle` → `processing` → `preview` → `importing` → `complete`
  - [x]Instantiate Web Worker: `new Worker(new URL("@/lib/gpx/worker.ts", import.meta.url))`
  - [x]Wire file input → Worker → ImportProgress → TrackPreview → importTracks Server Action → redirect

- [x] Task 7: Create import page (AC: #2)
  - [x]Create `src/app/voyage/[id]/import/page.tsx` — Server Component
  - [x]Validate auth + voyage ownership before rendering
  - [x]Create `src/app/voyage/[id]/import/messages.ts`

- [x] Task 8: Update voyage page to show imported legs (AC: #6, #7)
  - [x]Modify `src/app/voyage/[id]/page.tsx` — fetch legs from DB, pass to MapLoader
  - [x]Enable "Import track" button (currently disabled) as Link to `/voyage/[id]/import`
  - [x]Hide EmptyState overlay when tracks exist

- [x] Task 9: Verify build and tests (AC: all)
  - [x]All new tests pass: `npm run test`
  - [x]TypeScript strict clean: `npx tsc --noEmit`
  - [x]ESLint clean: `npm run lint`
  - [x]Build succeeds: `npm run build`
  - [x]Existing 119 tests still pass (no regressions)

## Dev Notes

### Scope Boundary — CRITICAL

This story creates the **full GPX import flow**: database, data layer, Server Action, UI components, and voyage page update. Stopover persistence and reverse geocoding are Story 2.4.

**IN SCOPE:**
- `supabase/migrations/{timestamp}_legs.sql` — Legs table + RLS
- `src/lib/data/legs.ts` — Repository functions (Tier 2)
- `src/app/voyage/[id]/import/actions.ts` — importTracks Server Action (Tier 3)
- `src/app/voyage/[id]/import/page.tsx` — Import page (Server Component)
- `src/app/voyage/[id]/import/messages.ts` — i18n strings
- `src/components/gpx/GpxImporter.tsx` — Client orchestrator
- `src/components/gpx/ImportProgress.tsx` — Processing feedback overlay
- `src/components/gpx/TrackPreview.tsx` — Track selection + preview
- Updates to `src/app/voyage/[id]/page.tsx` — fetch legs + enable import button
- Co-located test files for data layer, Server Action

**OUT OF SCOPE — Do NOT create:**
- No `src/lib/data/stopovers.ts` — stopover DB persistence is Story 2.4
- No `stopovers` table migration — Story 2.4
- No reverse geocoding / Nominatim calls — Story 2.4
- No stopover name editing in preview — Story 2.4
- No PWA / Web Share Target — Story 2.5
- No VoyageCard stats update — Story 2.6
- No RouteAnimation — Story 3.1
- No `ImportConfirmation.tsx` as a separate component — integrate confirmation CTA into TrackPreview

### Database Migration — `legs` table

```sql
-- Legs table (FR-4)
CREATE TABLE legs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id UUID NOT NULL REFERENCES voyages(id) ON DELETE CASCADE,
  track_geojson JSONB NOT NULL,
  distance_nm NUMERIC,
  duration_seconds INTEGER,
  avg_speed_kts NUMERIC,
  max_speed_kts NUMERIC,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast voyage-leg lookup
CREATE INDEX idx_legs_voyage_id ON legs(voyage_id);

-- RLS
ALTER TABLE legs ENABLE ROW LEVEL SECURITY;

-- RLS policies join through voyages to check ownership
CREATE POLICY "Users can read own legs"
  ON legs FOR SELECT TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert own legs"
  ON legs FOR INSERT TO authenticated
  WITH CHECK (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update own legs"
  ON legs FOR UPDATE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete own legs"
  ON legs FOR DELETE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));
```

**After migration:** Run `supabase db reset` then `supabase gen types typescript --local > src/types/supabase.ts` to regenerate types. The Supabase client auto-maps `snake_case` DB columns to `camelCase` TypeScript properties.

### Data Layer — `src/lib/data/legs.ts`

Follow the exact pattern from `src/lib/data/voyages.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/supabase";

export type Leg = Tables<"legs">;
export type LegInsert = Omit<TablesInsert<"legs">, "id" | "created_at">;

export async function insertLegs(legs: LegInsert[]) {
  const supabase = await createClient();
  return supabase.from("legs").insert(legs).select();
}

export async function getLegsByVoyageId(voyageId: string) {
  const supabase = await createClient();
  return supabase
    .from("legs")
    .select("*")
    .eq("voyage_id", voyageId)
    .order("started_at", { ascending: true, nullsFirst: false });
}
```

**Key:** `insertLegs` takes an array — a single import can create multiple legs. Batch insert is a single Supabase call.

### Server Action — `importTracks`

The import action receives structured JSON data (not FormData) because it handles GeoJSON objects and arrays. Server Actions support any serializable arguments.

```typescript
"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import { insertLegs } from "@/lib/data/legs";
import type { ActionResponse } from "@/types";
import type { Leg } from "@/lib/data/legs";

const LegSchema = z.object({
  track_geojson: z.object({
    type: z.literal("LineString"),
    coordinates: z.array(z.array(z.number()).min(2).max(3)),
  }),
  distance_nm: z.number().nonnegative().nullable(),
  duration_seconds: z.number().int().nonnegative().nullable(),
  avg_speed_kts: z.number().nonnegative().nullable(),
  max_speed_kts: z.number().nonnegative().nullable(),
  started_at: z.string().nullable(),
  ended_at: z.string().nullable(),
});

const ImportTracksSchema = z.object({
  voyageId: z.string().uuid(),
  legs: z.array(LegSchema).min(1, "At least one track must be selected"),
});

export async function importTracks(
  input: z.input<typeof ImportTracksSchema>
): Promise<ActionResponse<Leg[]>> {
  const authResult = await requireAuth();
  if (authResult.error) return { data: null, error: authResult.error };

  const parsed = ImportTracksSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    };
  }

  // Verify voyage ownership
  const { data: voyage, error: voyageError } = await getVoyageById(parsed.data.voyageId);
  if (voyageError || !voyage) {
    return { data: null, error: { code: "NOT_FOUND", message: "Voyage not found" } };
  }
  if (voyage.user_id !== authResult.data.id) {
    return { data: null, error: { code: "FORBIDDEN", message: "Not your voyage" } };
  }

  const legsToInsert = parsed.data.legs.map((leg) => ({
    voyage_id: parsed.data.voyageId,
    track_geojson: leg.track_geojson,
    distance_nm: leg.distance_nm,
    duration_seconds: leg.duration_seconds,
    avg_speed_kts: leg.avg_speed_kts,
    max_speed_kts: leg.max_speed_kts,
    started_at: leg.started_at,
    ended_at: leg.ended_at,
  }));

  const { data, error } = await insertLegs(legsToInsert);
  if (error) {
    return { data: null, error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message } };
  }

  return { data, error: null };
}
```

**Key decisions:**
- Zod validates the complete input including GeoJSON structure
- Voyage ownership is double-checked at the Server Action level (RLS is the second layer)
- `track_geojson` is stored as JSONB — no need for `JSON.stringify`, Supabase handles it
- `distance_nm` and speed fields use `z.number().nonnegative().nullable()` because GPX files without timestamps produce null duration/speed

### GpxImporter Client Component — State Machine

Use `useReducer` for the multi-step import flow (per architecture: "useReducer for multi-step flows like GPX import").

```typescript
type ImportState =
  | { step: "idle" }
  | { step: "processing"; progress: "parsing" | "simplifying" | "detecting" | "ready" }
  | { step: "preview"; result: ProcessingResult }
  | { step: "importing" }
  | { step: "error"; message: string };

type ImportAction =
  | { type: "FILE_SELECTED" }
  | { type: "PROGRESS"; progress: ImportState & { step: "processing" } extends { progress: infer P } ? P : never }
  | { type: "PROCESSING_COMPLETE"; result: ProcessingResult }
  | { type: "PROCESSING_ERROR"; message: string }
  | { type: "IMPORT_START" }
  | { type: "IMPORT_COMPLETE" }
  | { type: "IMPORT_ERROR"; message: string }
  | { type: "RETRY" };
```

### Worker Instantiation — CRITICAL

The worker module (`src/lib/gpx/worker.ts`) already calls `registerWorker()` at module level. Instantiate it in the client component:

```typescript
const workerRef = useRef<Worker | null>(null);

useEffect(() => {
  workerRef.current = new Worker(
    new URL("@/lib/gpx/worker.ts", import.meta.url)
  );
  return () => workerRef.current?.terminate();
}, []);
```

**Turbopack caveat (from Story 2.2):** If `new URL('./worker.ts', import.meta.url)` fails at runtime, try without extension: `new URL('@/lib/gpx/worker', import.meta.url)`. The worker module is already tested and working — the risk is only in Turbopack's URL resolution.

**Worker message handling:**
```typescript
workerRef.current.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
  const msg = event.data;
  switch (msg.type) {
    case "progress":
      dispatch({ type: "PROGRESS", progress: msg.step });
      break;
    case "result":
      dispatch({ type: "PROCESSING_COMPLETE", result: msg.data });
      break;
    case "error":
      dispatch({ type: "PROCESSING_ERROR", message: msg.error.message });
      break;
  }
};

// Send file to worker
workerRef.current.postMessage({ type: "process", file } satisfies WorkerInMessage);
```

### ImportProgress Component

Full-screen overlay with 4-step progress indicator.

**Steps array (constant):**
```typescript
const STEPS = ["parsing", "simplifying", "detecting", "ready"] as const;
const STEP_LABELS: Record<string, string> = {
  parsing: "Parsing tracks...",
  simplifying: "Simplifying...",
  detecting: "Detecting stopovers...",
  ready: "Preparing preview...",
};
```

**Visual:** A vertical or horizontal stepper showing completed steps (checkmark), current step (animated spinner/pulse), and pending steps (dimmed). Use Tailwind animations — no external dependency needed.

**Error state:** Show error message + "Try again" button that dispatches `RETRY` action.

**Accessibility:**
```tsx
<div role="progressbar" aria-valuenow={currentStepIndex} aria-valuemin={0} aria-valuemax={3} aria-label="GPX file processing">
  <div aria-live="polite">{STEP_LABELS[currentStep]}</div>
</div>
```

### TrackPreview Component

**Map integration:** Render tracks using the existing `MapCanvas` component. Each track needs a distinct color for multi-track files.

**Track colors palette:**
```typescript
const TRACK_COLORS = [
  "#2563EB", // Ocean blue
  "#E8614D", // Coral
  "#10B981", // Sea green
  "#F59E0B", // Amber
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];
```

For the preview map, you need a variant of MapCanvas that supports colored tracks. Two approaches:
1. **Preferred:** Pass `tracks` with color info to MapCanvas and update RouteLayer to accept per-track colors
2. **Alternative:** Create a PreviewMap component that renders colored Polylines directly

Choose approach 1: add an optional `trackColors?: string[]` prop to `MapCanvasProps` and `RouteLayerProps`. If not provided, all tracks use default Ocean blue (backward compatible).

**Track list:** Below/beside the map (bottom overlay on mobile, side panel on desktop ≥1024px). Each item shows:
- Checkbox (checked by default)
- Color swatch matching the track's map color
- Track name (from GPX `<name>` or "Track {n}")
- Distance in nm
- Duration (formatted as hours/minutes)
- Date (from `startTime`, formatted as locale date)

**Merge toggle:** Only visible when 2+ tracks are detected. A simple switch/checkbox: "Merge selected tracks into a single leg".

**"Add to voyage" button:** Primary CTA, coral (`#E8614D`), disabled when no tracks selected. Fixed at bottom on mobile.

### Import Page — Server Component

```typescript
// src/app/voyage/[id]/import/page.tsx
export default async function ImportPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect("/auth");

  const { id } = await params;
  const { data: voyage, error } = await getVoyageById(id);

  if (error || !voyage) notFound();
  if (voyage.user_id !== user.id) notFound(); // Don't reveal existence

  return <GpxImporter voyageId={id} voyageName={voyage.name} />;
}
```

The page is a thin Server Component that validates auth + ownership, then renders the client-side `GpxImporter`.

### Voyage Page Update

Current state (line 41 in `src/app/voyage/[id]/page.tsx`):
```typescript
// No legs table yet — tracks will be fetched in Story 2.3
const tracks: GeoJSON.LineString[] = [];
```

Replace with actual data fetch:
```typescript
import { getLegsByVoyageId } from "@/lib/data/legs";

const { data: legs } = await getLegsByVoyageId(id);
const tracks: GeoJSON.LineString[] = (legs ?? []).map(
  (leg) => leg.track_geojson as unknown as GeoJSON.LineString
);
```

Enable the "Import track" button — change from `disabled` to a `Link`:
```tsx
<Button asChild className="min-h-[44px] bg-ocean px-8 text-white">
  <Link href={`/voyage/${id}/import`}>{messages.emptyState.cta}</Link>
</Button>
```

When `tracks.length > 0`, hide the EmptyState overlay and show an "Import track" button in the header bar instead.

### Merge Logic

When the user selects "merge", combine all selected tracks into a single leg before calling `importTracks`:

```typescript
function mergeTracksToSingleLeg(
  selectedIndices: number[],
  result: ProcessingResult
): ImportLegData {
  const selectedTracks = selectedIndices.map((i) => result.tracks[i]);
  const selectedStats = selectedIndices.map((i) => result.stats[i]);

  // Concatenate all coordinates into one LineString
  const mergedCoordinates = selectedTracks.flatMap((t) => t.coordinates);
  const mergedGeojson: GeoJSON.LineString = {
    type: "LineString",
    coordinates: mergedCoordinates,
  };

  // Sum distances, use earliest start / latest end
  const totalDistance = selectedStats.reduce((sum, s) => sum + s.distanceNm, 0);
  const startTimes = selectedStats.map((s) => s.startTime).filter(Boolean) as string[];
  const endTimes = selectedStats.map((s) => s.endTime).filter(Boolean) as string[];
  const earliestStart = startTimes.length > 0 ? startTimes.sort()[0] : null;
  const latestEnd = endTimes.length > 0 ? endTimes.sort().reverse()[0] : null;

  let durationSeconds: number | null = null;
  if (earliestStart && latestEnd) {
    durationSeconds = (new Date(latestEnd).getTime() - new Date(earliestStart).getTime()) / 1000;
  }

  return {
    track_geojson: mergedGeojson,
    distance_nm: Math.round(totalDistance * 100) / 100,
    duration_seconds: durationSeconds ? Math.round(durationSeconds) : null,
    avg_speed_kts: durationSeconds && durationSeconds > 0
      ? Math.round((totalDistance / (durationSeconds / 3600)) * 100) / 100
      : null,
    max_speed_kts: Math.max(...selectedStats.map((s) => s.maxSpeedKts ?? 0)) || null,
    started_at: earliestStart,
    ended_at: latestEnd,
  };
}
```

### Formatting Utilities

Create formatting helpers for the import UI. Place in `src/lib/utils/format.ts` (or extend if exists):

```typescript
export function formatDistanceNm(nm: number): string {
  return `${nm.toFixed(1)} nm`;
}

export function formatSpeedKts(kts: number | null): string {
  if (kts === null) return "—";
  return `${kts.toFixed(1)} kts`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}
```

### Toast Notifications

Use Sonner (already configured via `src/components/ui/sonner.tsx`):

```typescript
import { toast } from "sonner";

// On success
toast.success(`${count} track(s) added to ${voyageName}`);

// On error
toast.error("Import failed — please try again");
```

### Responsive Layout

**Mobile (< 1024px):**
- Full-screen map preview
- Track list as scrollable bottom overlay (absolute positioned, glass morphism background)
- "Add to voyage" button fixed at bottom

**Desktop (≥ 1024px):**
- Map takes 2/3 width
- Track list takes 1/3 as side panel

Use Tailwind responsive classes:
```tsx
<div className="flex h-screen flex-col lg:flex-row">
  <div className="flex-1 lg:w-2/3">{/* Map */}</div>
  <div className="max-h-[40vh] overflow-y-auto lg:max-h-none lg:w-1/3">{/* Track list */}</div>
</div>
```

### i18n — Messages File

```typescript
// src/app/voyage/[id]/import/messages.ts
export const messages = {
  meta: { title: "Bosco — Import Tracks" },
  filePicker: {
    label: "Select GPX file",
    accept: ".gpx",
    hint: "GPX 1.1 files up to 400 MB",
  },
  progress: {
    parsing: "Parsing tracks...",
    simplifying: "Simplifying...",
    detecting: "Detecting stopovers...",
    ready: "Preparing preview...",
    error: "Processing failed",
    retry: "Try again",
  },
  preview: {
    title: "Preview",
    selectAll: "Select all",
    mergeLabel: "Merge into single leg",
    noSelection: "Select at least one track",
    addToVoyage: "Add to voyage",
    importing: "Adding to your voyage...",
    trackFallbackName: "Track",
  },
  success: (count: number, voyageName: string) =>
    `${count} track(s) added to ${voyageName}`,
  error: {
    importFailed: "Import failed — please try again",
    voyageNotFound: "Voyage not found",
  },
};
```

### Testing Strategy

**Test environment:** Vitest with jsdom (existing config).

| File | Tests | Focus |
|------|-------|-------|
| `src/lib/data/legs.test.ts` | ~4 tests | insertLegs batch, getLegsByVoyageId ordering, empty result |
| `src/app/voyage/[id]/import/actions.test.ts` | ~5 tests | Valid import, validation error, unauthorized, wrong voyage owner, empty legs array |

**Data layer tests** follow the existing pattern in `src/lib/data/voyages.test.ts` — mock the Supabase client.

**Component testing:** The GPX import components are client-heavy and depend on Web Worker + Map (browser APIs). Unit testing these requires significant mocking. Focus testing effort on the data layer and Server Action where business logic lives. Component behavior will be validated through the E2E test in Story 2.3's successor or via manual testing.

### 3-Tier Containment Compliance

```
✅ supabase/migrations/{ts}_legs.sql — SQL only
✅ src/lib/data/legs.ts — imports from src/lib/supabase/server (Tier 1→2)
✅ src/app/voyage/[id]/import/actions.ts — imports from src/lib/data/, src/lib/auth (Tier 2→3)
✅ src/components/gpx/*.tsx — calls Server Actions only (Tier 3→4)
✅ src/app/voyage/[id]/import/page.tsx — imports from src/lib/auth, src/lib/data (Tier 2 for Server Component)
❌ NEVER import @supabase/* in components or actions
❌ NEVER import src/lib/supabase/* in Server Actions
```

### Anti-Patterns — Do NOT

- **Do NOT** store raw GPX data in the database — only simplified GeoJSON
- **Do NOT** create `src/lib/data/stopovers.ts` — that's Story 2.4
- **Do NOT** add reverse geocoding for stopover names — Story 2.4
- **Do NOT** create a separate `ImportConfirmation.tsx` — the CTA is part of `TrackPreview`
- **Do NOT** use `any` type — use generated Supabase types and Zod inferred types
- **Do NOT** throw from the Server Action — always return `{ data, error }`
- **Do NOT** place custom components in `src/components/ui/` — shadcn/ui only
- **Do NOT** use `useState` for the import flow state — use `useReducer`
- **Do NOT** store coordinates as `[lat, lng]` — GeoJSON is `[lng, lat]`
- **Do NOT** install any new npm packages — all needed dependencies exist
- **Do NOT** modify `src/lib/gpx/worker.ts` — it's already complete from Story 2.2

### Previous Story (2.2) Intelligence

Story 2.2 created the complete processing pipeline. Key patterns to reuse:

- **`processGpxFile()` function** in `src/lib/gpx/worker.ts` — takes a `File`, returns `ProcessingResult` with `tracks: GeoJSON.LineString[]`, `stopovers: StopoverCandidate[]`, `stats: TrackStats[]`
- **Worker protocol:** Send `{ type: 'process', file }`, receive `progress` → `result` or `error` messages
- **Types** in `src/types/gpx.ts`: `ProcessingResult`, `WorkerInMessage`, `WorkerOutMessage`, `TrackStats`, `StopoverCandidate`
- **119 tests currently passing** across the codebase — do not break them
- **`INVALID_GPX_FORMAT_MESSAGE`** exported from `parser.ts` — use for error display

### Existing Components to Reuse

| Component | Path | Usage in This Story |
|-----------|------|---------------------|
| MapCanvas | `src/components/map/MapCanvas.tsx` | Preview map + voyage view map |
| MapLoader | `src/components/map/MapLoader.tsx` | Dynamic import wrapper (ssr: false) |
| RouteLayer | `src/components/map/RouteLayer.tsx` | Track rendering — extend with `trackColors` prop |
| Button | `src/components/ui/button.tsx` | CTA buttons |
| EmptyState | `src/components/shared/EmptyState.tsx` | Already used in voyage page |
| Sonner | `src/components/ui/sonner.tsx` | Toast notifications |

### Package Versions (No New Dependencies)

This story adds **zero npm packages**. All required packages are already installed:

| Package | Version | Usage |
|---------|---------|-------|
| zod | ^4.3.6 | Server Action input validation |
| sonner | (installed) | Toast notifications |
| next | 16.1.6 | Server Actions, App Router, dynamic import |
| react | 19.2.3 | useReducer, useRef, useEffect |
| leaflet | ^1.9.4 | Map rendering |
| react-leaflet | ^5.0.0 | React map components |

### Project Structure Notes

```
src/
├── app/
│   └── voyage/[id]/
│       ├── page.tsx                    # MODIFY — fetch legs, enable import button
│       ├── messages.ts                 # MODIFY — add import link message if needed
│       └── import/                     # NEW directory
│           ├── page.tsx                # NEW — Server Component (auth + ownership check)
│           ├── actions.ts              # NEW — importTracks Server Action
│           ├── actions.test.ts         # NEW
│           └── messages.ts             # NEW — i18n strings
├── components/
│   ├── gpx/                            # EXISTING empty directory
│   │   ├── GpxImporter.tsx             # NEW — Client orchestrator (useReducer state machine)
│   │   ├── ImportProgress.tsx          # NEW — Processing feedback overlay
│   │   └── TrackPreview.tsx            # NEW — Track list + map preview
│   └── map/
│       ├── MapCanvas.tsx               # MODIFY — add trackColors prop
│       └── RouteLayer.tsx              # MODIFY — support per-track colors
├── lib/
│   ├── data/
│   │   └── legs.ts                     # NEW — Repository functions
│   │   └── legs.test.ts               # NEW
│   └── utils/
│       └── format.ts                   # NEW — formatDistanceNm, formatDuration, formatSpeedKts
└── types/
    └── supabase.ts                     # REGENERATED after migration

supabase/migrations/
└── {timestamp}_legs.sql                # NEW — Legs table + RLS
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.3]
- [Source: _bmad-output/planning-artifacts/architecture.md — 3-tier containment, Server Action patterns, data layer, legs table, GPX import flow, client boundaries, Web Worker messages, state management]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Import flow UX, ImportProgress component, track preview, merge option, responsive layout, feedback patterns, micro-emotions, success criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-4, FR-5, NFR-2, NFR-4, NFR-9, UJ-3]
- [Source: _bmad-output/implementation-artifacts/2-2-gpx-processing-pipeline.md — Worker protocol, processGpxFile, type definitions, testing patterns]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions, GPX processing section, GeoJSON coordinates]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Fixed supabase gen types stdout contamination (line 1 "Connecting to db 5432" removed)
- Button component uses @base-ui/react (no asChild prop) — used Link with inline styles instead

### Completion Notes List

- Task 1: Created legs migration with all columns, RLS policies (SELECT/INSERT/UPDATE/DELETE via voyage ownership join), and idx_legs_voyage_id index. DB reset and types regenerated.
- Task 2: Created src/lib/data/legs.ts with insertLegs (batch) and getLegsByVoyageId (ordered by started_at). 4 tests passing.
- Task 3: Created importTracks Server Action with Zod validation of GeoJSON structure, auth check, voyage ownership verification. 7 tests passing.
- Task 4: Created ImportProgress component with 4-step stepper, visual progress bar, error state with retry, aria-live and role=progressbar accessibility.
- Task 5: Created TrackPreview with track list (checkboxes, GPX track names, color swatches, stats), merge toggle for multi-track, "Add to voyage" CTA. Extended MapCanvas and RouteLayer with optional trackColors prop.
- Task 6: Created GpxImporter with useReducer state machine (idle/processing/preview/importing/error), Web Worker instantiation, merge logic, and toast notifications via Sonner.
- Task 7: Created import page (Server Component) with auth + ownership validation, plus messages.ts for i18n.
- Task 8: Updated voyage page to fetch legs from DB, surface legs loading failures instead of silently showing the empty state, and enable "Import track" as Link (both in header and empty state).
- Task 9: All 132 tests pass (119 original + 13 new), tsc clean, lint clean, build succeeds.
- Review fixes: Propagated GPX track names through the processing pipeline, extracted import leg mapping into a tested lib module, and fixed zero-value speed persistence during import.

### Change Log

- 2026-03-16: Story 2.3 GPX Import Flow — full implementation of database, data layer, Server Action, UI components, and voyage page integration
- 2026-03-16: Review fixes applied — track names now surface in preview, ImportProgress includes a real progress bar, voyage page fails loudly on legs load errors, and zero-valued speeds are preserved during import mapping

### File List

- supabase/migrations/20260316122237_legs.sql (NEW)
- src/types/supabase.ts (REGENERATED)
- src/types/gpx.ts (MODIFIED — TrackStats now carries GPX track names)
- src/lib/data/legs.ts (NEW)
- src/lib/data/legs.test.ts (NEW)
- src/lib/geo/distance.ts (MODIFIED — computeTrackStats now carries GPX track names)
- src/lib/geo/distance.test.ts (MODIFIED — covers track name propagation)
- src/lib/gpx/worker.ts (MODIFIED — propagates parsed GPX names into processing results)
- src/lib/gpx/worker.test.ts (MODIFIED — verifies GPX names survive the worker pipeline)
- src/lib/gpx/import.ts (NEW)
- src/lib/gpx/import.test.ts (NEW)
- src/lib/utils/format.ts (NEW)
- src/app/voyage/[id]/import/actions.ts (NEW)
- src/app/voyage/[id]/import/actions.test.ts (NEW)
- src/app/voyage/[id]/import/page.tsx (NEW)
- src/app/voyage/[id]/import/messages.ts (NEW)
- src/components/gpx/ImportProgress.tsx (NEW, then MODIFIED — added visual progress bar for review fix)
- src/components/gpx/TrackPreview.tsx (NEW, then MODIFIED — now displays GPX track names)
- src/components/gpx/GpxImporter.tsx (NEW, then MODIFIED — uses tested import leg mapping helpers)
- src/components/map/MapCanvas.tsx (MODIFIED — added trackColors prop)
- src/components/map/RouteLayer.tsx (MODIFIED — per-track color support)
- src/app/voyage/[id]/page.tsx (MODIFIED — fetch legs, fail on legs load errors, enable import button, remove disabled state)
