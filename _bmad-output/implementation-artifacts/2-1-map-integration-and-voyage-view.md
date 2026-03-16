# Story 2.1: Map Integration & Voyage View

Status: in-progress

## Story

As a sailor,
I want to see my voyage on an interactive nautical map,
So that I have a visual canvas where my sailing tracks and stopovers will appear.

## Acceptance Criteria

### AC-1: MapCanvas Component
**Given** the MapCanvas component
**When** it is rendered on the voyage view page
**Then** it displays a full-bleed Leaflet map with OpenStreetMap base tiles and OpenSeaMap nautical overlay (buoys, lighthouses, channels, depth soundings)
**And** the component is dynamically imported with `ssr: false` (Leaflet requires `window`)
**And** the map supports pinch zoom, pan, and tap on iOS Safari and Android Chrome

### AC-2: Voyage View with Map
**Given** a sailor navigates to `/voyage/[id]` for an existing voyage
**When** the page loads
**Then** the voyage name is displayed
**And** a full-screen MapCanvas is rendered
**And** if no tracks exist, an EmptyState prompt is shown: "Export from Navionics and share to Bosco" with an "Import track" CTA button

### AC-3: Track Rendering on Map
**Given** a sailor navigates to `/voyage/[id]` for a voyage with imported legs
**When** the page loads
**Then** all leg tracks are rendered on the map as Ocean (#2563EB) polylines at 0.85 opacity, 3px weight
**And** the map auto-fits to show the complete voyage extent

### AC-4: Mobile Touch Interactions
**Given** the MapCanvas on a mobile device
**When** the user interacts with the map
**Then** touch targets for all interactive elements are at least 44x44px
**And** map interactions maintain 60 fps on mid-range mobile devices (2022+)

### AC-5: Keyboard & Screen Reader Accessibility
**Given** a keyboard user on desktop
**When** the map has focus
**Then** +/- keys control zoom and arrow keys control pan
**And** a screen reader announces "Sailing voyage map"

## Tasks / Subtasks

- [x] Task 1: Install Leaflet dependencies (AC: #1)
  - [x] `npm install leaflet react-leaflet leaflet-defaulticon-compatibility`
  - [x] `npm install -D @types/leaflet`
  - [x] Verify packages in `package.json`

- [x] Task 2: Create MapCanvas component (AC: #1, #4, #5)
  - [x] Create `src/components/map/MapCanvas.tsx` — client component
  - [x] Import Leaflet CSS + defaulticon-compatibility CSS + JS
  - [x] Render `MapContainer` with OSM base tiles + OpenSeaMap overlay
  - [x] Accept props: `center`, `zoom`, `className`, `tracks` (GeoJSON LineStrings)
  - [x] Default center to Mediterranean [43.3, 5.4] zoom 6 when no tracks
  - [x] Auto-fit bounds when tracks are provided (via RouteLayer)
  - [x] Add `aria-label="Sailing voyage map"` to container
  - [x] Ensure keyboard +/- zoom and arrow pan work natively (Leaflet default)

- [x] Task 3: Create RouteLayer component (AC: #3)
  - [x] Create `src/components/map/RouteLayer.tsx` — client component
  - [x] Accept `tracks` prop as `GeoJSON.LineString[]` with `[longitude, latitude]` coordinates
  - [x] Convert `[lng, lat]` → `[lat, lng]` for Leaflet LatLng positions
  - [x] Render each track as a `Polyline` with color Ocean (#2563EB), opacity 0.85, weight 3
  - [x] Use `useMap()` hook to auto-fit bounds to all tracks

- [x] Task 4: Create MapLoader dynamic import wrapper (AC: #1)
  - [x] Create `src/components/map/MapLoader.tsx` — client component
  - [x] Use `next/dynamic` with `ssr: false` to import MapCanvas
  - [x] Show skeleton loading state while map loads
  - [x] Forward all props to MapCanvas

- [ ] Task 5: Rewrite voyage view page (AC: #2, #3)
  - [x] Rewrite `src/app/voyage/[id]/page.tsx`
  - [x] Keep auth check + voyage loading + error handling
  - [x] Add full-screen map layout (map takes remaining viewport height)
  - [x] If no tracks → show EmptyState overlay on top of map
  - [ ] If tracks exist → pass to MapLoader for rendering (blocked until Story 2.3 adds the `legs` table and data layer)
  - [x] Voyage name displayed in a header bar above the map
  - [x] Back to dashboard link preserved

- [x] Task 6: Update voyage messages (AC: #2)
  - [x] Update `src/app/voyage/[id]/messages.ts`
  - [x] Add map-specific strings (aria labels, EmptyState text matching epics)

- [x] Task 7: Write tests (AC: all)
  - [x] Unit tests for RouteLayer coordinate conversion logic (6 tests)
  - [x] Verify MapCanvas props interface (TypeScript compile-time check)
  - [x] Build passes: `npm run build`
  - [x] Lint clean: `npm run lint`
  - [x] TypeScript strict: `npx tsc --noEmit`

## Dev Notes

### Package Installation

```bash
npm install leaflet react-leaflet leaflet-defaulticon-compatibility
npm install -D @types/leaflet
```

**Versions (verified March 2026):**
| Package | Version | Notes |
|---------|---------|-------|
| react-leaflet | 5.0.0 | React 19 required (peer dep). Strict Mode fixed. |
| leaflet | 1.9.4 | Latest stable. Do NOT use 2.0.0-alpha. |
| @types/leaflet | 1.9.21 | TypeScript definitions |
| leaflet-defaulticon-compatibility | 0.1.2 | Fixes marker icon URLs broken by bundlers |

**React 19 compatibility:** react-leaflet 5.0.0 has `"react": "^19.0.0"` as peer dependency. The "Map container already initialized" bug in Strict Mode is fixed in v5.0.0. Do NOT set `reactStrictMode: false`.

### Dynamic Import Pattern (CRITICAL)

`ssr: false` is **NOT allowed** in Server Components in Next.js 16. The dynamic import MUST live in a `"use client"` file.

```tsx
// src/components/map/MapLoader.tsx — "use client"
"use client";
import dynamic from "next/dynamic";

const MapCanvas = dynamic(() => import("./MapCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-foam" />,
});

export default function MapLoader(props: MapCanvasProps) {
  return <MapCanvas {...props} />;
}
```

```tsx
// src/app/voyage/[id]/page.tsx — Server Component (NO "use client")
import MapLoader from "@/components/map/MapLoader";
// Use <MapLoader /> in JSX — it's imported as a regular component
```

The server page imports `MapLoader` (a client component). `MapLoader` uses `next/dynamic` with `ssr: false` to lazy-load `MapCanvas`. This is the ONLY valid pattern.

### MapCanvas Component Structure

```tsx
// src/components/map/MapCanvas.tsx — "use client"
"use client";

// CSS imports MUST be in this order
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { RouteLayer } from "./RouteLayer";

export interface MapCanvasProps {
  center?: LatLngExpression;
  zoom?: number;
  tracks?: GeoJSON.LineString[];
  className?: string;
}

const DEFAULT_CENTER: LatLngExpression = [43.3, 5.4]; // Mediterranean
const DEFAULT_ZOOM = 6;

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const OPENSEAMAP_URL = "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png";
const OPENSEAMAP_ATTRIBUTION = 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors';

export default function MapCanvas({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  tracks = [],
  className,
}: MapCanvasProps) {
  return (
    <div className={className} role="application" aria-label="Sailing voyage map">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer url={OSM_URL} attribution={OSM_ATTRIBUTION} />
        <TileLayer url={OPENSEAMAP_URL} attribution={OPENSEAMAP_ATTRIBUTION} />
        {tracks.length > 0 && <RouteLayer tracks={tracks} />}
      </MapContainer>
    </div>
  );
}
```

### RouteLayer — GeoJSON Coordinate Conversion

**CRITICAL: GeoJSON stores `[longitude, latitude]`. Leaflet uses `[latitude, longitude]`.**

Conversion ONLY happens in the map component layer. Never modify stored data.

```tsx
// src/components/map/RouteLayer.tsx — "use client"
"use client";

import { Polyline, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";

interface RouteLayerProps {
  tracks: GeoJSON.LineString[];
}

const TRACK_STYLE = {
  color: "#2563EB", // Ocean
  opacity: 0.85,
  weight: 3,
};

// Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
function toLatLngs(coordinates: GeoJSON.Position[]): LatLngExpression[] {
  return coordinates.map(([lng, lat]) => [lat, lng] as LatLngExpression);
}

export function RouteLayer({ tracks }: RouteLayerProps) {
  const map = useMap();

  const allPositions = useMemo(() => {
    return tracks.flatMap((track) => toLatLngs(track.coordinates));
  }, [tracks]);

  // Auto-fit bounds to show all tracks
  useEffect(() => {
    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(allPositions as L.LatLngExpression[]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, allPositions]);

  return (
    <>
      {tracks.map((track, i) => (
        <Polyline
          key={i}
          positions={toLatLngs(track.coordinates)}
          pathOptions={TRACK_STYLE}
        />
      ))}
    </>
  );
}
```

### Voyage View Page Layout

The page needs a complete redesign from the current placeholder:

```tsx
// src/app/voyage/[id]/page.tsx
// Structure:
// ┌──────────────────────────┐
// │ ← Dashboard   Voyage Name│  ← header bar (sticky top)
// ├──────────────────────────┤
// │                          │
// │     Full-bleed Map       │  ← fills remaining viewport
// │                          │
// │   ┌──────────────────┐   │
// │   │   EmptyState      │   │  ← overlay if no tracks
// │   │   (centered)      │   │
// │   └──────────────────┘   │
// │                          │
// └──────────────────────────┘
```

Keep:
- Auth check via `getUser()` + redirect
- Voyage loading via `getVoyageById(id)`
- Error handling (notFound for PGRST116)

Add:
- Full-height layout (`h-[calc(100vh-theme(spacing.16))]` or similar)
- MapLoader component rendered as background
- EmptyState as absolute-positioned overlay when no tracks
- "Import track" button (still disabled — import comes in Story 2.3)

**Note:** Story 2.1 does NOT fetch legs data (legs table doesn't exist yet). The page passes `tracks={[]}` to the map. When Story 2.3 creates the legs table and data layer, the page will be updated to fetch and pass real tracks. The MapCanvas and RouteLayer are READY for track data — they just won't receive any yet.

### OpenSeaMap Tile Details

- URL: `https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png`
- Transparent PNG overlay — displays nautical marks on top of the base map
- No API key required
- Max zoom: 18
- License: CC-BY-SA 2.0
- Shows: buoys, lighthouses, channels, depth soundings at appropriate zoom levels

### Leaflet Marker Icon Fix

The `leaflet-defaulticon-compatibility` package patches `L.Icon.Default` to resolve marker icon URLs from CSS instead of broken `require()` calls. Import order matters:

```typescript
import "leaflet/dist/leaflet.css";                                             // 1st
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"; // 2nd
import "leaflet-defaulticon-compatibility";                                     // 3rd
```

Story 2.1 does not render markers (that's Story 2.4), but the fix should be in place from the start to prevent issues later.

### Existing Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `src/app/voyage/[id]/page.tsx` | **Rewrite** | Replace placeholder with map-based layout |
| `src/app/voyage/[id]/messages.ts` | **Modify** | Add map aria labels and updated empty state text |
| `package.json` | **Modify** | Add leaflet, react-leaflet, leaflet-defaulticon-compatibility |

### New Files to Create

| File | Purpose | Tier |
|------|---------|------|
| `src/components/map/MapCanvas.tsx` | Leaflet map wrapper with OSM + OpenSeaMap tiles | Component (Tier 4) |
| `src/components/map/RouteLayer.tsx` | GeoJSON track rendering as polylines | Component (Tier 4) |
| `src/components/map/MapLoader.tsx` | Dynamic import wrapper (ssr: false) | Component (Tier 4) |
| `src/components/map/MapCanvas.test.tsx` | MapCanvas unit tests | Test |

### 3-Tier Containment Compliance

```
✅ src/components/map/MapCanvas.tsx → imports from leaflet, react-leaflet only (Tier 4)
✅ src/components/map/RouteLayer.tsx → imports from leaflet, react-leaflet only (Tier 4)
✅ src/components/map/MapLoader.tsx → imports from next/dynamic, forwards props (Tier 4)
✅ src/app/voyage/[id]/page.tsx → imports from @/lib/auth, @/lib/data/voyages (server component)
❌ NEVER import @/lib/supabase/* in map components
❌ NEVER import leaflet directly in server components (window dependency)
❌ NEVER place map components in src/components/ui/ — that's shadcn only
```

### Design System Usage

- **Map container:** `h-full w-full` within a full-viewport height wrapper
- **Map skeleton/loading:** `animate-pulse bg-foam` matching dashboard loading pattern
- **Track polyline:** color `#2563EB` (Ocean), opacity `0.85`, weight `3`
- **EmptyState overlay:** Use existing EmptyState component with absolute positioning over map
- **Header bar:** Voyage name in `font-heading text-h1 text-navy`, back link in `text-mist`
- **CTA button:** Ocean secondary `bg-ocean text-white min-h-[44px]` (disabled for now)
- **Map aria-label:** `"Sailing voyage map"` on the container div

### Testing Strategy

Map components are hard to unit test because Leaflet requires DOM. Strategy:

1. **RouteLayer coordinate conversion** — unit test the `toLatLngs` function independently (extract as utility)
2. **MapLoader** — test that it renders a loading skeleton, then the dynamic component
3. **MapCanvas props** — TypeScript interface validation (compile-time check)
4. **Integration** — manual visual testing (Leaflet renders correctly with tiles)
5. **E2E** — defer to Playwright later (Story 3.x for public pages)

For Vitest, mock `react-leaflet` components as simple divs — the real rendering test is manual/E2E.

```typescript
// Test example: coordinate conversion
import { describe, expect, it } from "vitest";

describe("toLatLngs", () => {
  it("converts [lng, lat] to [lat, lng]", () => {
    const geojson = [[5.4, 43.3], [5.5, 43.4]]; // GeoJSON: [lng, lat]
    const result = toLatLngs(geojson);
    expect(result).toEqual([[43.3, 5.4], [43.4, 5.5]]); // Leaflet: [lat, lng]
  });
});
```

### Anti-Patterns (Do NOT)

- Import `leaflet` in server components — it requires `window` and will crash SSR
- Use `next/dynamic` with `ssr: false` in a Server Component — it must be in a `"use client"` file
- Store coordinates as `[lat, lng]` — GeoJSON spec is `[lng, lat]`, convert only in map layer
- Add `reactStrictMode: false` to next.config — react-leaflet 5.0.0 handles Strict Mode correctly
- Create a legs data layer in this story — legs table and data layer come in Story 2.3
- Add stopover markers — that's Story 2.4
- Add route animation — that's Story 3.1
- Add StatsBar or BoatBadge — those are public page components (Story 3.1)
- Use Leaflet 2.0.0-alpha — use 1.9.4 stable
- Use react-leaflet v4 — use v5.0.0 (React 19 compatible)
- Place MapCanvas in `src/components/ui/` — that directory is shadcn only
- Use generic loading spinner — use Skeleton (matching existing pattern from dashboard)

### Previous Story (1.4) Intelligence

- **Voyage page exists:** `src/app/voyage/[id]/page.tsx` is a server component with auth check, voyage loading, and EmptyState. Must be REWRITTEN (not extended) to add map layout.
- **Messages pattern:** `src/app/voyage/[id]/messages.ts` exports a `messages` object. Follow same pattern.
- **EmptyState component:** `src/components/shared/EmptyState.tsx` — reuse for "no tracks" overlay. Props: `icon`, `title`, `description`, `action`.
- **Dashboard layout pattern:** `src/app/dashboard/layout.tsx` shows NavigationBar + content pattern. The voyage page is nested under `/voyage/[id]` which is OUTSIDE the dashboard layout (no NavigationBar).
- **Supabase types:** `src/types/supabase.ts` has voyages table types. No legs table yet.
- **Auth pattern:** `getUser()` returns `User | null`, `requireAuth()` returns `ActionResponse<User>`. Voyage page uses `getUser()` + redirect.
- **Dialog component:** uses `@base-ui/react` (not Radix) — `DialogTrigger` uses `render` prop. Not relevant for this story but good to know.
- **Toaster:** Already in root layout via Sonner. Use `toast.success()` from `"sonner"` in client components.
- **Design tokens:** All Ocean & Sunset tokens available in `globals.css` via `@theme`. Use `bg-foam`, `text-navy`, `text-ocean`, etc.

### Git Intelligence

Recent commits show linear story progression:
```
b8a6d19 1.4 done
1e15ea3 1.3 done
256d9be 1.2 done
9c1f143 1.2
c010e1d feat: initial commit
```

Pattern: each story is committed as a single "X.Y done" commit.

### Package Versions (Project Context)

| Package | Version | Notes |
|---------|---------|-------|
| next | 16.1.6 | App Router, `await cookies()` mandatory in server code |
| react | 19.2.3 | No `forwardRef`, strict hooks rules |
| @supabase/supabase-js | ^2.99.1 | Direct table queries in data layer |
| zod | ^4.3.6 | Top-level validators |
| sonner | (installed) | Toast via `toast.success()`, `toast.error()` |
| leaflet | (to install) | 1.9.4 — NOT 2.0.0-alpha |
| react-leaflet | (to install) | 5.0.0 — React 19 compatible |
| @types/leaflet | (to install) | 1.9.21 — dev dependency |
| leaflet-defaulticon-compatibility | (to install) | 0.1.2 — marker icon fix |

### Project Structure Notes

Architecture alignment:
- `src/components/map/MapCanvas.tsx` — exact path from architecture (`MapCanvas.tsx # Leaflet wrapper (dynamic import)`)
- `src/components/map/RouteLayer.tsx` — exact path from architecture (`RouteLayer.tsx # Track rendering`)
- `src/components/map/MapLoader.tsx` — new file for dynamic import wrapper (not in architecture but required by Next.js 16 pattern)
- `src/app/voyage/[id]/page.tsx` — existing file, rewrite

Architecture also lists future map components (NOT for this story):
- `RouteAnimation.tsx` — Story 3.1
- `StopoverMarker.tsx` — Story 2.4
- `MarkerCluster.tsx` — Story 2.4

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — Leaflet dynamic import, map/ component directory, GeoJSON coordinate order, client-only boundaries]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — MapCanvas component (UX-DR4), variants, states, accessibility]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-3, FR-4, FR-7, NFR-3, NFR-4, NFR-10]
- [Source: _bmad-output/implementation-artifacts/1-4-dashboard-and-voyage-creation.md — Voyage page structure, EmptyState usage, design tokens]
- [Source: CLAUDE.md — Architecture, Anti-Patterns, Project Structure, Key Patterns]
- [Source: react-leaflet docs — v5.0.0 installation, React 19 peer dep]
- [Source: OpenSeaMap wiki — Tile URL: tiles.openseamap.org/seamark/{z}/{x}/{y}.png]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- `ssr: false` must live in a `"use client"` file (MapLoader.tsx), not in the server page — validated via build
- EmptyState overlay uses `z-[500]` to appear above Leaflet's tile layers (which use z-index up to ~400)
- `pointer-events-none` on overlay container + `pointer-events-auto` on inner card allows map interaction around the overlay
- react-leaflet 5.0.0 confirmed compatible with React 19.2.3 — no Strict Mode issues
- Applied accessibility attributes to the actual Leaflet container so the keyboard focus target announces the map label
- Enlarged Leaflet control hit areas to 44x44 and added focus-visible styling in globals.css

### Completion Notes List

- Installed leaflet 1.9.4, react-leaflet 5.0.0, leaflet-defaulticon-compatibility 0.1.2, @types/leaflet 1.9.21
- Created MapCanvas component with OSM base tiles + OpenSeaMap nautical overlay, aria-label, keyboard support
- Created RouteLayer component with GeoJSON [lng,lat] → Leaflet [lat,lng] conversion, auto-fit bounds, Ocean polyline styling
- Created MapLoader dynamic import wrapper with ssr:false and skeleton loading state
- Rewrote voyage page with full-screen map layout, header bar with voyage name, EmptyState overlay
- Updated messages.ts with story-aligned empty-state prompt text and map aria label
- AC-3 remains blocked by the missing `legs` table/data layer, so the story stays in-progress until Story 2.3 lands
- 6 unit tests for toLatLngs coordinate conversion (empty, single, multi, precision, negative, full track)
- Added unit tests for map accessibility attribute application
- Full test suite: 81 tests pass across 13 test files after the review fixes
- TypeScript strict clean, ESLint zero errors, build succeeds
- 3-tier containment preserved: map components import only from leaflet/react-leaflet

### Change Log

- 2026-03-16: Story 2.1 map foundation implemented — Leaflet map integration with OpenSeaMap overlay on voyage view page
- 2026-03-16: Review fixes applied — accessible Leaflet container labeling, 44x44 controls, and honest story status while AC-3 remains blocked by Story 2.3

### File List

- src/components/map/MapCanvas.tsx (new)
- src/components/map/RouteLayer.tsx (new)
- src/components/map/MapLoader.tsx (new)
- src/components/map/mapAccessibility.ts (new)
- src/components/map/mapAccessibility.test.ts (new)
- src/components/map/RouteLayer.test.ts (new)
- src/app/voyage/[id]/page.tsx (modified — complete rewrite with map layout)
- src/app/voyage/[id]/messages.ts (modified — added map strings)
- src/app/globals.css (modified — Leaflet control hit area + focus styling)
- package.json (modified — added leaflet, react-leaflet, leaflet-defaulticon-compatibility)
- package-lock.json (modified)
