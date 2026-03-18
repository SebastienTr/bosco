# Story 3.1: Public Voyage Page — Map, Stats & Route Animation

Status: review

## Story

As a visitor,
I want to open a shared voyage link and see an animated sailing route on a nautical map with voyage stats,
So that I can experience the journey visually without needing an account.

## Acceptance Criteria

### AC-1: SSR Public Page Route
**Given** a public voyage exists for a sailor
**When** a visitor navigates to `/{username}/{voyage-slug}`
**Then** the page is server-side rendered with complete HTML in the first response
**And** first meaningful paint occurs in under 2 seconds on a 4G mobile connection
**And** if the voyage does not exist or is not public, a 404 page is returned (never 403)

### AC-2: Full-Bleed Map with Nautical Chart
**Given** the public voyage page loads
**When** the map renders
**Then** a full-bleed MapCanvas displays OpenStreetMap base tiles with OpenSeaMap nautical overlay
**And** all voyage legs are rendered as Ocean (#2563EB) polylines at 0.85 opacity, 3px weight
**And** stopovers are displayed as StopoverMarker components (Coral circles, read-only — no rename/delete)
**And** the latest known boat position is shown with a boat icon at the last coordinate of the most recent leg
**And** the component is dynamically imported with `ssr: false`

### AC-3: Route Animation
**Given** a visitor opens the page for the first time
**When** the map has loaded
**Then** the RouteAnimation plays: tracks draw progressively along their coordinates with a boat icon following the tip
**And** animation timing adapts to track length (short tracks <50nm faster, long voyages >1000nm pace for ~8 seconds total)
**And** the animation line weight is 4px during animation
**And** tapping the map pauses/resumes the animation
**And** aria-live announces "Route animation playing" and "Route animation complete"

**Given** the user has `prefers-reduced-motion` enabled
**When** the page loads
**Then** the route animation is skipped and the final state (all tracks visible) is shown immediately

### AC-4: Stats Bar
**Given** the public voyage page
**When** viewing the overlays
**Then** a StatsBar is displayed at bottom center showing: distance sailed (nm), days, ports of call count, and countries count
**And** the StatsBar uses translucent glass morphism treatment (navy at 75% opacity, backdrop blur 12px)
**And** each stat has an aria-label (e.g., "1,534 nautical miles sailed")

### AC-5: Boat Badge
**Given** the public voyage page
**When** viewing the overlays
**Then** a BoatBadge is displayed at top-left as a translucent pill with green status dot and boat name
**And** tapping the BoatBadge expands it to show boat type, sailor username, and link to profile

### AC-6: Page Identity
**Given** the public voyage page header
**When** inspecting the page
**Then** the voyage name, boat name, and sailor username are identifiable from the page content

### AC-7: CSP Headers
**Given** the public voyage page with CSP headers
**When** the response headers are inspected
**Then** a restrictive Content Security Policy is set allowing Supabase, OpenStreetMap tile servers, OpenSeaMap, Nominatim, and Sentry domains only

## Tasks / Subtasks

- [x] Task 1: Data layer for public voyage lookup (AC: #1)
  - [x] Add `getPublicVoyageBySlug(username, slug)` to `src/lib/data/voyages.ts` — single query joining profiles, legs, stopovers with `is_public = true` filter
  - [x] Add unit test for the new function

- [x] Task 2: SSR page route + metadata (AC: #1, #6)
  - [x] Create `src/app/[username]/[slug]/page.tsx` — Server Component fetching voyage+profile+legs+stopovers, returning `notFound()` if missing or private
  - [x] Export `generateMetadata()` for page title and description (voyage name + sailor + distance stats)
  - [x] Create `src/app/[username]/[slug]/messages.ts` with all UI strings

- [x] Task 3: PublicVoyageContent client component (AC: #2, #3, #4, #5)
  - [x] Create `src/app/[username]/[slug]/PublicVoyageContent.tsx` — orchestrates map, animation, StatsBar, BoatBadge
  - [x] Render MapLoader (reuse existing) with full-bleed layout (h-dvh, no padding)
  - [x] Render StopoverMarkers in read-only mode (no rename/delete handlers)
  - [x] Pass computed stats to StatsBar
  - [x] Pass profile data to BoatBadge

- [x] Task 4: RouteAnimation component (AC: #3)
  - [x] Create `src/components/map/RouteAnimation.tsx` — client component using requestAnimationFrame
  - [x] Progressive polyline drawing: grow coordinate array from 0 to full length over animation duration
  - [x] BoatMarker follows the animation tip (last visible coordinate)
  - [x] Duration calculation: `Math.min(8, Math.max(3, totalDistanceNm / 125))` seconds
  - [x] Tap/click map to pause/resume
  - [x] Respect `prefers-reduced-motion`: skip animation, show final state immediately
  - [x] Animation line weight 4px during play, transition to 3px on complete
  - [x] aria-live region for screen reader announcements
  - [x] Animate legs sequentially (leg 1 → leg 2 → ... → complete)

- [x] Task 5: StatsBar component (AC: #4)
  - [x] Create `src/components/voyage/StatsBar.tsx` — floating overlay at bottom center
  - [x] Glass morphism: `bg-navy/75 backdrop-blur-[12px]`, rounded-2xl, shadow-overlay
  - [x] Four stat groups: distance (nm), days, ports, countries
  - [x] Numbers: Nunito Bold 28px, Labels: Nunito Medium 10px uppercase tracking-wider
  - [x] Each stat with `aria-label` for accessibility
  - [x] Responsive: compact on mobile (375px), wider spacing on desktop

- [x] Task 6: BoatBadge component (AC: #5)
  - [x] Create `src/components/voyage/BoatBadge.tsx` — translucent pill at top-left
  - [x] Default: green dot + boat name (or voyage name if no boat)
  - [x] Expanded (on tap): boat type + sailor username + link to `/{username}` profile
  - [x] Glass morphism: same treatment as StatsBar
  - [x] Button role, aria-expanded state

- [x] Task 7: BoatMarker component (AC: #2)
  - [x] Create `src/components/map/BoatMarker.tsx` — Leaflet DivIcon with SVG boat icon
  - [x] Position: last coordinate of most recent leg (convert `[lng, lat]` → `[lat, lng]`)
  - [x] During animation: follows the animation tip (controlled by RouteAnimation)
  - [x] After animation: static at final position

- [x] Task 8: CSP headers (AC: #7)
  - [x] Add Content-Security-Policy header in `next.config.ts` `headers()` for `/:username/:slug` routes
  - [x] Allow: `self`, Supabase project URL, `*.tile.openstreetmap.org`, `tiles.openseamap.org`, `nominatim.openstreetmap.org`, Sentry DSN domain
  - [x] Block: inline scripts (except Next.js nonce), external scripts, iframes

- [x] Task 9: Tests and quality (AC: all)
  - [x] `src/lib/data/voyages.test.ts` — test `getPublicVoyageBySlug` (found, not found, not public)
  - [x] TypeScript strict clean: `npx tsc --noEmit`
  - [x] ESLint clean: `npm run lint`
  - [x] All existing tests pass: `npm run test`
  - [x] Build succeeds: `npm run build`

## Dev Notes

### Data Layer — Single Query for Everything

Create one function that fetches all public voyage data in a single Supabase query using relation selects:

```typescript
// src/lib/data/voyages.ts — ADD this function
export async function getPublicVoyageBySlug(username: string, slug: string) {
  const supabase = await createClient();
  return supabase
    .from("voyages")
    .select(`
      *,
      profiles!inner(id, username, boat_name, boat_type, avatar_url),
      legs(id, track_geojson, distance_nm, duration_seconds, started_at, ended_at, avg_speed_kts, max_speed_kts, sort_order),
      stopovers(id, name, country, latitude, longitude, arrived_at, departed_at)
    `)
    .eq("profiles.username", username)
    .eq("slug", slug)
    .eq("is_public", true)
    .single();
}
```

**Key:** The `!inner` modifier on profiles acts as an INNER JOIN — if no profile matches the username, the query returns no rows. This prevents fetching private voyages that happen to match the slug but belong to a different user.

**Stats computation (server-side in page.tsx):**
```typescript
const totalDistanceNm = legs.reduce((sum, l) => sum + (l.distance_nm ?? 0), 0);
const sortedLegs = legs.filter(l => l.started_at).sort((a, b) =>
  new Date(a.started_at!).getTime() - new Date(b.started_at!).getTime()
);
const firstDate = sortedLegs[0]?.started_at;
const lastDate = sortedLegs[sortedLegs.length - 1]?.ended_at;
const days = firstDate && lastDate
  ? Math.ceil((new Date(lastDate).getTime() - new Date(firstDate).getTime()) / 86400000)
  : 0;
const portsCount = stopovers.length;
const countriesCount = new Set(stopovers.map(s => s.country).filter(Boolean)).size;
```

### SSR Page Structure

```typescript
// src/app/[username]/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPublicVoyageBySlug } from "@/lib/data/voyages";
import PublicVoyageContent from "./PublicVoyageContent";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const { data: voyage } = await getPublicVoyageBySlug(username, slug);
  if (!voyage) return { title: "Voyage not found" };
  return {
    title: `${voyage.name} — ${voyage.profiles.boat_name ?? username}`,
    description: voyage.description ?? `Sailing voyage by ${username}`,
  };
}

export default async function PublicVoyagePage({ params }: Props) {
  const { username, slug } = await params;
  const { data: voyage, error } = await getPublicVoyageBySlug(username, slug);
  if (!voyage || error) notFound();
  // compute stats, pass everything to PublicVoyageContent
}
```

**CRITICAL:** `params` is a Promise in Next.js 16 — must `await params` before destructuring. This is different from Next.js 14/15.

**No auth check** — this page is public. Never import `requireAuth` or `getUser` here. Never redirect to `/auth`.

**404 behavior:** Return `notFound()` for both non-existent and private voyages. Never expose that a private voyage exists.

### RouteAnimation — Implementation Strategy

The animation is the **core wow factor** of the public page. Implementation approach:

1. **State machine:** `idle` → `playing` → `paused` → `complete`
2. **requestAnimationFrame loop** advances a `progress` float from 0 to 1
3. **Per-frame rendering:** Calculate total coordinate count across all legs. At progress `p`, show `Math.floor(p * totalCoords)` coordinates. Distribute across legs sequentially.
4. **Leaflet integration:** Use a `Polyline` ref and update `setLatLngs()` each frame. This is more performant than re-rendering React components.
5. **BoatMarker position:** Update marker position to the last visible coordinate each frame.
6. **Duration formula:** `clamp(totalDistanceNm / 125, 3, 8)` seconds
7. **Pause/resume:** Listen to map click events. Store elapsed time on pause, resume from same point.
8. **prefers-reduced-motion:** Check `window.matchMedia('(prefers-reduced-motion: reduce)')`. If true, set progress to 1 immediately.

```typescript
// Pseudocode for frame loop
const animate = (timestamp: number) => {
  if (state !== "playing") return;
  const elapsed = timestamp - startTime;
  const progress = Math.min(elapsed / (durationMs), 1);

  // Calculate visible coordinates
  const visibleCount = Math.floor(progress * totalCoordCount);
  let remaining = visibleCount;

  for (const leg of legs) {
    const coords = leg.coordinates;
    const show = Math.min(remaining, coords.length);
    // Update polyline for this leg
    remaining -= show;
    if (remaining <= 0) {
      // Update boat marker to last visible coord of this leg
      break;
    }
  }

  if (progress < 1) requestAnimationFrame(animate);
  else setState("complete");
};
```

**After animation completes:** Switch all polylines to their full coordinate arrays with weight 3px (static display). Remove the animation-specific rendering.

**Multi-leg sequencing:** Legs should animate in chronological order (`started_at` ascending). The animation seamlessly transitions from one leg to the next — the boat icon "jumps" to the start of the next leg when one completes (this represents the port stop between legs).

### StatsBar — Design Spec

```
┌──────────────────────────────────────────────────────┐
│  1,534      │  47       │  12       │  5             │
│  SAILED     │  DAYS     │  PORTS    │  COUNTRIES     │
└──────────────────────────────────────────────────────┘
```

- Position: `fixed bottom-4 left-1/2 -translate-x-1/2` (centered at bottom)
- Glass morphism: `bg-[#1B2D4F]/75 backdrop-blur-[12px] text-white`
- Rounded: `rounded-2xl`
- Shadow: `shadow-[0_2px_12px_rgba(27,45,79,0.15)]`
- Stat numbers: `font-body font-bold text-[28px]` (Nunito Bold)
- Stat labels: `font-body font-medium text-[10px] uppercase tracking-wider opacity-80`
- Spacing: `px-6 py-3` with `gap-6` between stat groups (desktop), `gap-3` (mobile)
- Distance formatting: use `formatDistanceNm()` from `src/lib/utils/format.ts`
- z-index: above map, below any sheets: `z-[400]`

### BoatBadge — Design Spec

- Position: `fixed top-4 left-4`
- Glass morphism: same as StatsBar
- Default: `px-3 py-2 rounded-full flex items-center gap-2`
- Green dot: `w-2 h-2 rounded-full bg-success` (#10B981)
- Boat name: `font-body font-semibold text-sm text-white`
- Expanded: adds boat type line, sailor username, and `<Link href="/{username}">` to profile
- Toggle: `useState` with `aria-expanded`
- Transition: `transition-all duration-200 ease-out`
- z-index: `z-[400]`

### BoatMarker — SVG Boat Icon

Use a Leaflet `DivIcon` with an inline SVG sailboat icon:

```typescript
import L from "leaflet";

export const boatIcon = L.divIcon({
  className: "boat-marker",
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#1B2D4F">
    <path d="M..." /> <!-- simple sailboat silhouette -->
  </svg>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
```

Keep it simple — a recognizable sailboat silhouette in Navy color. No external icon library needed. Position at the last coordinate of the most recent leg (after animation) or at the animation tip (during animation).

### Existing Components to Reuse

| Component | Path | How to Reuse |
|-----------|------|--------------|
| `MapLoader` | `src/components/map/MapLoader.tsx` | Wraps MapCanvas with dynamic import — reuse as-is |
| `MapCanvas` | `src/components/map/MapCanvas.tsx` | Full Leaflet map with OSM + OpenSeaMap tiles — reuse as-is, pass tracks and children |
| `RouteLayer` | `src/components/map/RouteLayer.tsx` | Track rendering + `toLatLngs()` coordinate conversion — reuse for static tracks after animation completes |
| `StopoverMarkers` | `src/components/map/StopoverMarkers.tsx` | Stopover display — pass empty handlers for read-only mode |
| `StopoverMarker` | `src/components/map/StopoverMarker.tsx` | Individual marker with popup — keep display, omit rename/delete |
| `formatDistanceNm` | `src/lib/utils/format.ts` | Distance formatting for stats |
| `formatDuration` | `src/lib/utils/format.ts` | Duration formatting if needed |
| `applyMapAccessibility` | `src/components/map/mapAccessibility.ts` | Map ARIA attributes |

### Read-Only StopoverMarkers

The existing `StopoverMarkers` component accepts `voyageId` and `stopovers` props and renders markers with rename/delete popups. For the public page, pass read-only stopovers. The `StopoverMarker` component's popup shows name + country. The public page should NOT pass `onRename` or `onDelete` callbacks. Check if the component conditionally renders edit controls based on these props — if not, either:
1. Add a `readOnly` prop to `StopoverMarker`
2. Or create a lightweight `PublicStopoverMarkers` wrapper

**Prefer option 1** (minimal change to existing component) if the current implementation allows it.

### Middleware — No Auth for Public Routes

The existing `src/middleware.ts` only protects `PROTECTED_ROUTES = ["/dashboard", "/voyage"]`. The `[username]/[slug]` route is NOT in this list, so public pages are accessible without auth. **No middleware changes needed.**

### CSP Headers Configuration

Add to `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: "/:username/:slug",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires these
            "style-src 'self' 'unsafe-inline'", // Leaflet + Tailwind
            "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tiles.openseamap.org https://*.supabase.co",
            "connect-src 'self' https://*.supabase.co https://nominatim.openstreetmap.org https://*.sentry.io",
            "font-src 'self' https://fonts.gstatic.com",
            "frame-src 'none'",
          ].join("; "),
        },
      ],
    },
  ];
}
```

**Note:** Next.js in dev mode uses `eval` for hot reload. The `'unsafe-eval'` directive may need to be dev-only. Check if the existing `next.config.ts` already has headers configuration and extend it.

### 3-Tier Containment Compliance

```
OK  src/lib/data/voyages.ts — Tier 2: new getPublicVoyageBySlug imports from Tier 1
OK  src/app/[username]/[slug]/page.tsx — Server Component: imports from Tier 2 (data/)
OK  src/app/[username]/[slug]/PublicVoyageContent.tsx — Tier 4: client component, no Supabase
OK  src/components/map/RouteAnimation.tsx — Tier 4: client-only map component
OK  src/components/voyage/StatsBar.tsx — Tier 4: pure display component
OK  src/components/voyage/BoatBadge.tsx — Tier 4: pure display component
OK  src/components/map/BoatMarker.tsx — Tier 4: client-only map component
NEVER  import @supabase/* outside src/lib/supabase/
NEVER  import src/lib/supabase/* in page.tsx or components
NEVER  call Server Actions from public page (read-only, all data from SSR)
```

### Anti-Patterns — Do NOT

- **Do NOT create Server Actions for the public page** — it's read-only, all data comes from SSR props
- **Do NOT import `requireAuth` or `getUser`** in the public page — no auth needed
- **Do NOT return 403 for private voyages** — always 404 to avoid information leakage
- **Do NOT use Framer Motion** — use CSS transitions + requestAnimationFrame for route animation
- **Do NOT render RouteLayer during animation** — use direct Leaflet API (polyline.setLatLngs) for performance; switch to RouteLayer after animation completes
- **Do NOT make StopoverMarkers interactive** on public page (Story 3.2 scope) — display only
- **Do NOT add OG image generation** — Story 3.3 scope
- **Do NOT add JSON-LD structured data** — Story 3.3 scope
- **Do NOT add the PortsPanel** — Story 3.2 scope
- **Do NOT add the StopoverSheet** (bottom sheet on marker tap) — Story 3.2 scope
- **Do NOT inline string literals** — use co-located `messages.ts`
- **Do NOT store coordinates as `[lat, lng]`** in data — GeoJSON is `[lng, lat]`, convert only in map layer
- **Do NOT place custom components in `src/components/ui/`** — shadcn/ui only
- **Do NOT use `any` type** — use Supabase generated types or explicit interfaces

### Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#1B2D4F` | Glass morphism bg, primary text |
| Ocean | `#2563EB` | Track polylines, links |
| Coral | `#E8614D` | Stopover markers |
| Success | `#10B981` | Boat badge status dot |
| Sand | `#FDF6EC` | Future: stopover sheet bg (Story 3.2) |
| White | `#FFFFFF` | Stats numbers, overlay text |
| Glass morphism | `bg-navy/75 backdrop-blur-[12px]` | StatsBar, BoatBadge |
| Track weight | 3px (static), 4px (animating) | Polyline weight |
| Track opacity | 0.85 | Polyline opacity |
| Marker radius | 7px | StopoverMarker circle |
| Shadow overlay | `0 2px 12px rgba(27,45,79,0.15)` | Floating overlays |
| DM Serif Display | Heading font | Voyage name (if shown) |
| Nunito | Body font | Stats numbers, labels |

### Typography for Stats

- **Stat numbers:** Nunito Bold, 28px — prominent, achievement feel
- **Stat labels:** Nunito Medium, 10px uppercase, tracking-wider, opacity 80% — "SAILED", "DAYS", "PORTS", "COUNTRIES"
- **Boat name (badge):** Nunito SemiBold, 14px

### Previous Story (2.6) Intelligence

Story 2.6 (last completed in Epic 2) established:
- **177 tests passing** — do not break them
- **MiniMap + MiniMapLoader** pattern for lightweight Leaflet maps — reference but public page uses full MapCanvas
- **VoyageCard** enhancement with stats display — stats computation pattern reusable for StatsBar
- **Voyage settings** with visibility toggle — `is_public` field is already implemented
- **Cover image upload** — `cover_image_url` available for future OG images (Story 3.3)
- **`getVoyagesWithStats`** — reference for relation select query pattern (reuse for `getPublicVoyageBySlug`)

Epic 1-2 retrospective fixes (most recent work):
- **Stopover geocoding moved to client-side** — stopovers already have `name` and `country` in DB
- **LegList redesigned** as collapsible toggle — pattern for public page overlay panels
- **`h-dvh`** used instead of `h-screen` for mobile viewport — **use this for full-bleed map**

### Git Intelligence

Recent commits show:
- `2220ef9` Redesign Legs panel: collapsible toggle with compact list
- `d859510` Fix build: split client geocode helper from server module
- `8df6842` Move stopover geocoding to client-side during import processing
- `36aaff7` Fix geocoding killed by fire-and-forget in serverless
- `40b55e8` Fix stopover reliability and UI stabilization (Epic 1-2 retro)

**Pattern:** The codebase has stabilized after the retro fixes. Stopover data in DB is reliable with names and countries populated. The collapsible panel pattern (LegList) can inform StatsBar/BoatBadge interaction design.

### Scope Boundary

**IN SCOPE:**
- SSR public page at `/{username}/{slug}`
- Full-bleed map with OSM + OpenSeaMap tiles
- Voyage leg tracks as polylines
- Route animation (progressive drawing + boat follower)
- StatsBar overlay (distance, days, ports, countries)
- BoatBadge overlay (boat name, expandable to show details)
- BoatMarker (boat position icon)
- Read-only StopoverMarkers (display only)
- CSP headers
- Accessibility (prefers-reduced-motion, aria-live, aria-labels)
- Page metadata (title, description)
- Messages externalization
- Tests + quality checks

**OUT OF SCOPE — Do NOT create (deferred to later stories):**
- No OG image generation (`opengraph-image.tsx`) — Story 3.3
- No JSON-LD structured data — Story 3.3
- No public profile page (`/{username}`) — Story 3.3
- No StopoverSheet (bottom sheet on marker tap) — Story 3.2
- No PortsPanel (browsable stopover list) — Story 3.2
- No ActionFAB (floating button for ports panel) — Story 3.2
- No log entry timeline on public page — Epic 4
- No share button or copy URL feature — Story 3.3
- No voyage cover image display — Story 3.3
- No "distance to go" stat — out of MVP scope

### Project Structure Notes

```
src/
├── app/
│   └── [username]/
│       └── [slug]/
│           ├── page.tsx                    # NEW — SSR Server Component
│           ├── PublicVoyageContent.tsx      # NEW — Client Component (map + overlays)
│           └── messages.ts                 # NEW — UI strings
├── components/
│   ├── map/
│   │   ├── RouteAnimation.tsx              # NEW — animated track drawing
│   │   └── BoatMarker.tsx                  # NEW — boat position icon
│   └── voyage/
│       ├── StatsBar.tsx                    # NEW — floating stats overlay
│       └── BoatBadge.tsx                   # NEW — boat info pill
├── lib/
│   └── data/
│       ├── voyages.ts                      # MODIFY — add getPublicVoyageBySlug
│       └── voyages.test.ts                 # MODIFY — add tests for new function
next.config.ts                              # MODIFY — add CSP headers
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.1 acceptance criteria and BDD scenarios]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-7 (Public Voyage Page), NFR-1 (2s first paint), NFR-13 (SSR), NFR-14 (OG tags — Story 3.3)]
- [Source: _bmad-output/planning-artifacts/architecture.md — SSR boundary, [username]/[slug] route, Leaflet dynamic import, 3-tier containment, CSP headers, route animation via progressive polyline]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Direction D (Immersive Minimal), RouteAnimation spec, StatsBar spec, BoatBadge spec, glass morphism, color tokens, typography, Journey 3 visitor flow]
- [Source: src/components/map/MapCanvas.tsx — existing full map with OSM + OpenSeaMap]
- [Source: src/components/map/RouteLayer.tsx — toLatLngs() coordinate conversion, polyline rendering]
- [Source: src/components/map/StopoverMarkers.tsx — existing marker rendering]
- [Source: src/components/voyage/VoyageContent.tsx — existing voyage display orchestration]
- [Source: src/lib/data/voyages.ts — existing data functions, relation select pattern from getVoyagesWithStats]
- [Source: src/lib/utils/format.ts — formatDistanceNm, formatDuration]
- [Source: src/middleware.ts — PROTECTED_ROUTES excludes public routes]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions, GeoJSON coordinate order]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- TypeScript strict check: clean (0 errors from new code)
- ESLint: 0 new warnings (2 pre-existing issues in page.tsx and actions.ts)
- All 192 tests pass (3 new tests for getPublicVoyageBySlug)
- Production build succeeds, route `ƒ /[username]/[slug]` correctly dynamic

### Completion Notes List

- **Task 1**: Added `getPublicVoyageBySlug(username, slug)` with `!inner` join on profiles for implicit username filtering. Uses `profile_photo_url` (not `avatar_url` as in story notes — matches actual schema). 3 tests: found, not found, private.
- **Task 2**: SSR page with `generateMetadata()`. Stats computed server-side (distance, days, ports, countries). `notFound()` for missing/private voyages. Params properly awaited (Next.js 16).
- **Task 3**: `PublicVoyageContent` orchestrates MapLoader, RouteAnimation, StopoverMarkers (read-only), StatsBar, BoatBadge. Full-bleed `h-dvh` layout. Dynamic imports for client-only map components.
- **Task 4**: `RouteAnimation` with requestAnimationFrame loop, state machine (idle→playing→paused→complete), pause/resume on map click, `prefers-reduced-motion` support, aria-live announcements. Duration: `clamp(distanceNm/125, 3, 8)` seconds. Sequential leg animation. Weight transitions 4px→3px.
- **Task 5**: `StatsBar` with glass morphism (`bg-navy/75 backdrop-blur-[12px]`), 4 stat groups with aria-labels, responsive gap (`gap-3` mobile, `gap-6` desktop).
- **Task 6**: `BoatBadge` with expandable pill, green status dot, boat name/type/username, link to profile, `aria-expanded` state.
- **Task 7**: `BoatMarker` with Leaflet DivIcon SVG, proper `[lng,lat]` → `[lat,lng]` conversion, follows animation tip during playback.
- **Task 8**: CSP headers in `next.config.ts` for `/:username/:slug` routes. Allows OSM, OpenSeaMap, Supabase, Sentry (including de.sentry.io ingest).
- **Task 9**: All quality gates pass. 192 tests, clean TypeScript, build succeeds.
- **StopoverMarker modification**: Added `readOnly` prop to show name/country without edit form — minimal change to existing component (option 1 from Dev Notes).

### File List

New files:
- src/app/[username]/[slug]/page.tsx
- src/app/[username]/[slug]/PublicVoyageContent.tsx
- src/app/[username]/[slug]/messages.ts
- src/components/map/RouteAnimation.tsx
- src/components/map/BoatMarker.tsx
- src/components/voyage/StatsBar.tsx
- src/components/voyage/BoatBadge.tsx

Modified files:
- src/lib/data/voyages.ts (added getPublicVoyageBySlug)
- src/lib/data/voyages.test.ts (added 3 tests)
- src/components/map/StopoverMarker.tsx (added readOnly prop)
- next.config.ts (added CSP headers)

### Change Log

- 2026-03-18: Story 3.1 implemented — Public voyage page with SSR, route animation, stats bar, boat badge, boat marker, read-only stopovers, and CSP headers
