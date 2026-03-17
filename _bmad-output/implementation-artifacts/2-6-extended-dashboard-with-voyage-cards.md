# Story 2.6: Extended Dashboard with Voyage Cards

Status: review

## Story

As a sailor,
I want my dashboard to display voyage cards with a mini-map preview, stats, and full voyage management,
So that I can quickly see all my voyages and manage them from one place.

## Acceptance Criteria

### AC-1: Enhanced VoyageCard with Mini-Map and Stats
**Given** an authenticated sailor with one or more voyages that have imported tracks
**When** they visit `/dashboard`
**Then** each voyage is displayed as a VoyageCard component with: mini MapCanvas preview showing the track, voyage name in DM Serif Display, stats row (distance nm, legs count, stopovers count), and a public/private badge
**And** the card has a hover state with slight lift shadow on desktop
**And** each card links to the voyage view at `/voyage/[id]`
**And** cards have `role="link"` with stats as `aria-label`

### AC-2: Empty Card Variant
**Given** a voyage with no imported tracks
**When** its card is displayed on the dashboard
**Then** the card shows an empty variant with dashed border and prompt: "Import your first track"

### AC-3: Voyage Settings Page (Rename, Description, Slug)
**Given** a sailor wants to rename a voyage
**When** they access voyage settings at `/voyage/[id]/settings`
**Then** they can edit the voyage name, description, and slug
**And** the slug uniqueness constraint is validated with inline error

### AC-4: Voyage Deletion
**Given** a sailor wants to delete a voyage
**When** they initiate deletion
**Then** a confirmation dialog (centered, white card, dimmed backdrop) asks: "Are you sure you want to delete this voyage? This action cannot be undone."
**And** the delete button is styled with Error red (#EF4444)
**And** upon confirmation, the voyage and all associated legs and stopovers are deleted (DB CASCADE handles this)
**And** the sailor is redirected to `/dashboard` with a toast: "Voyage deleted"

### AC-5: Voyage Visibility Toggle
**Given** a sailor wants to change voyage visibility
**When** they toggle the public/private switch on the voyage settings page
**Then** the visibility is updated via Server Action
**And** a toast confirms: "Voyage is now public" or "Voyage is now private"
**And** the toggle uses Success green (#10B981) when public

### AC-6: Cover Image Upload
**Given** a sailor wants to set a cover image for a voyage
**When** they upload an image on the voyage settings page
**Then** the image is compressed client-side to under 1 MB, validated (type + size), and uploaded to Supabase Storage
**And** the cover image appears on the VoyageCard in the dashboard

### AC-7: Desktop Layout
**Given** the dashboard on desktop (>1024px)
**When** the layout renders
**Then** VoyageCards are displayed in a 2-column grid
**And** summary stats per voyage are visible without clicking into the voyage

## Tasks / Subtasks

- [x] Task 1: Data layer extensions (AC: #1, #3, #4, #5, #6)
  - [x] Add `getVoyagesWithStats(userId)` to `src/lib/data/voyages.ts` — fetches voyages with nested legs (id, track_geojson, distance_nm) and stopovers (id) via Supabase relation select
  - [x] Add `updateVoyage(id, data)` to `src/lib/data/voyages.ts`
  - [x] Add `deleteVoyage(id)` to `src/lib/data/voyages.ts`

- [x] Task 2: Storage bucket migration (AC: #6)
  - [x] Create migration `supabase/migrations/20260317084259_voyage_covers_bucket.sql`
  - [x] Create `voyage-covers` bucket (public, 10 MB limit, JPEG/PNG/WebP)
  - [x] RLS: authenticated users upload/update/delete to their own folder (`{user_id}/*`), public read

- [x] Task 3: Voyage settings Server Actions (AC: #3, #4, #5, #6)
  - [x] Create `src/app/voyage/[id]/settings/actions.ts` with:
    - `updateVoyage(formData)` — name, description, slug validation + update
    - `deleteVoyage({ voyageId })` — auth check + delete
    - `toggleVisibility({ voyageId, isPublic })` — single-field update
    - `uploadCoverImage(formData)` — receives compressed image, uploads to `voyage-covers/{userId}/{voyageId}`, updates `cover_image_url`

- [x] Task 4: Enhance VoyageCard with mini-map and stats (AC: #1, #2, #7)
  - [x] Create `src/components/map/MiniMap.tsx` — lightweight non-interactive Leaflet map (no controls, no zoom/pan, OSM tiles only, auto-fit bounds)
  - [x] Create `src/components/map/MiniMapLoader.tsx` — dynamic import with `ssr: false`
  - [x] Update `src/components/voyage/VoyageCard.tsx`:
    - Accept extended props: `legs` array (id, track_geojson, distance_nm), `stopoverCount`, `coverImageUrl`
    - Show MiniMapLoader with track polylines OR cover image if set OR dashed empty state
    - Stats row: total distance (nm), leg count, stopover count
    - Hover shadow lift: `hover:shadow-[0_2px_12px_rgba(27,45,79,0.15)]`
    - `role="link"` with `aria-label` including stats
    - Empty variant: dashed border, "Import your first track" prompt

- [x] Task 5: Voyage settings page (AC: #3, #4, #5, #6)
  - [x] Create `src/app/voyage/[id]/settings/page.tsx` — Server Component (auth + voyage fetch)
  - [x] Create `src/app/voyage/[id]/settings/VoyageSettingsForm.tsx` — Client Component with:
    - Name, description, slug fields (reuse CreateVoyageDialog validation patterns)
    - Slug inline error for uniqueness
    - Public/private toggle (Switch component) with Success green active state
    - Cover image upload section (file input, preview, compress + upload)
    - Delete zone at bottom with danger button → confirmation AlertDialog
  - [x] Create `src/app/voyage/[id]/settings/messages.ts` — externalized strings

- [x] Task 6: Update dashboard page to use new query (AC: #1, #2, #7)
  - [x] Update `src/app/dashboard/page.tsx` to use `getVoyagesWithStats()` instead of `getVoyagesByUserId()`
  - [x] Pass legs, stopover count, and cover image to VoyageCard
  - [x] Update `src/app/dashboard/messages.ts` with new VoyageCard strings

- [x] Task 7: Add settings link to voyage page header (AC: #3)
  - [x] Update `src/app/voyage/[id]/page.tsx` header to include a settings/gear icon link to `/voyage/[id]/settings`
  - [x] Update `src/app/voyage/[id]/messages.ts` with settings link text

- [x] Task 8: Tests (AC: all)
  - [x] `src/lib/data/voyages.test.ts` — test new data layer functions
  - [x] `src/app/voyage/[id]/settings/actions.test.ts` — test all settings server actions
  - [x] TypeScript strict clean: `npx tsc --noEmit`
  - [x] ESLint clean: `npm run lint`
  - [x] All existing tests pass: `npm run test`
  - [x] Build succeeds: `npm run build`

## Dev Notes

### Current VoyageCard — What Exists

The current `VoyageCard` at `src/components/voyage/VoyageCard.tsx` is minimal:
- Shows voyage name (DM Serif Display via `font-heading text-h3 text-navy`)
- Description (line-clamp-2)
- Creation date ("DD MMM YYYY")
- Public/Private badge (Ocean blue / Mist)
- Links to `/voyage/{id}`
- Uses shadcn `Card`, `CardHeader`, `CardTitle`, `CardAction`, `CardContent`

**Needs enhancement to**: add mini-map preview, stats row, cover image support, empty variant, better hover effect, `role="link"` with aria-label.

**CRITICAL: VoyageCard must become a client component.** The current file has no `"use client"` directive (it's a server component). Adding `MiniMapLoader` (a client component using `dynamic()`) inside VoyageCard requires adding `"use client"` at the top of the file. This is a mandatory change — `dynamic()` with `ssr: false` requires client component context.

### Data Fetching Strategy — `getVoyagesWithStats`

Create a new function using Supabase's relation queries to avoid N+1:

```typescript
export async function getVoyagesWithStats(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("voyages")
    .select(`
      *,
      legs(id, track_geojson, distance_nm),
      stopovers(id)
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
}
```

This returns voyages with nested arrays. The component derives:
- `legs.length` → leg count
- `legs.reduce((sum, l) => sum + (l.distance_nm ?? 0), 0)` → total distance
- `stopovers.length` → stopover count
- `legs.map(l => l.track_geojson as unknown as GeoJSON.LineString)` → tracks for mini-map

**Type:** The return type will be the Voyage type extended with `legs` and `stopovers` relation arrays. Use Supabase's built-in type inference — don't manually type the result.

### MiniMap Component

Create a lightweight, non-interactive Leaflet map for card previews:

```typescript
// src/components/map/MiniMap.tsx
"use client";

import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type * as GeoJSON from "geojson";

interface MiniMapProps {
  tracks: GeoJSON.LineString[];
}
```

**Key constraints:**
- `zoomControl={false}`, `attributionControl={false}`, `dragging={false}`, `scrollWheelZoom={false}`, `touchZoom={false}`, `doubleClickZoom={false}`, `keyboard={false}`
- Only OSM base tiles — NO OpenSeaMap overlay (saves tile requests, mini-map doesn't need nautical detail)
- Auto-fit bounds to all tracks with minimal padding
- Track color: Ocean `#2563EB` at 0.85 opacity, 2px weight (slightly thinner than full map's 3px)
- Fixed height: ~160px in the card
- Convert GeoJSON `[lng, lat]` → Leaflet `[lat, lng]` (same pattern as `RouteLayer.tsx`)
- Use `useMap()` hook for `fitBounds()` after render
- If no tracks: don't render the map component at all

**Dynamic import** via `MiniMapLoader.tsx`:
```typescript
"use client";
import dynamic from "next/dynamic";
import type { MiniMapProps } from "./MiniMap";

const MiniMap = dynamic(() => import("./MiniMap"), {
  ssr: false,
  loading: () => <div className="h-40 w-full animate-pulse bg-foam rounded-t-xl" />,
});

export default function MiniMapLoader(props: MiniMapProps) {
  return <MiniMap {...props} />;
}
```

### Enhanced VoyageCard Structure

```
┌─────────────────────────────┐
│  [Mini-Map / Cover / Empty] │  ← 160px height
├─────────────────────────────┤
│  Voyage Name (DM Serif)     │
│  [Public] or [Private]      │
│                             │
│  12.5 nm · 3 legs · 5 ports │  ← stats row
└─────────────────────────────┘
```

**Priority for top area:**
1. If `coverImageUrl` exists → show cover image (object-cover, rounded-t-xl)
2. Else if tracks exist → show MiniMapLoader with tracks
3. Else → dashed border empty state: "Import your first track"

**Stats row format:** Use `formatDistanceNm` from `src/lib/utils/format.ts`, with interpunct separator.

### Voyage Settings Page — `/voyage/[id]/settings`

**Server Component** (`page.tsx`):
```typescript
import { getUser } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
// auth check, voyage fetch, render VoyageSettingsForm
```

**Client Component** (`VoyageSettingsForm.tsx`):

The form includes 4 sections:

**1. Voyage Details** (name, description, slug):
- Reuse the same Zod schema pattern as `CreateVoyageSchema` in dashboard/actions.ts
- Slug field: on blur, check availability via `checkSlugAvailability` (needs a new server action wrapper since the data function can't be called from client)
- Save button: calls `updateVoyage` server action

**2. Visibility Toggle**:
- shadcn/ui `Switch` component
- Label: "Make this voyage public"
- Active state: Success green (`#10B981`) — apply via className `data-[state=checked]:bg-success`
- On toggle: immediately call `toggleVisibility` server action
- Toast feedback: "Voyage is now public" / "Voyage is now private"

**3. Cover Image**:
- File input with image preview (if cover_image_url exists, show current)
- On file select: validate via `validateImageFile()`, compress via `compressImage()`, then call `uploadCoverImage` server action
- Show upload progress or loading state
- Clear/remove option if image exists

**4. Danger Zone** (bottom, separated):
- Red bordered section
- "Delete this voyage" button in Error red
- On click: shadcn `AlertDialog` confirmation
- On confirm: call `deleteVoyage` server action, redirect to `/dashboard` via `router.push`, toast "Voyage deleted"

### Server Actions — `src/app/voyage/[id]/settings/actions.ts`

```typescript
"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getVoyageById, updateVoyage as updateVoyageDb, deleteVoyage as deleteVoyageDb, checkSlugAvailability } from "@/lib/data/voyages";
import { uploadFile, deleteFile } from "@/lib/storage";
import { generateSlug } from "@/lib/utils/slug";
import type { ActionResponse } from "@/types";
import type { Voyage } from "@/lib/data/voyages";
```

**Ownership verification pattern (all mutation actions):** After `requireAuth()`, fetch the voyage via `getVoyageById(voyageId)` and verify `voyage.user_id === user.id`. If mismatch, return `{ data: null, error: { code: "FORBIDDEN", message: "You do not own this voyage" } }`. RLS provides database-level protection, but this defense-in-depth check gives clear error messages and prevents silent failures.

**`updateVoyage`**: Accepts FormData with name, description, slug. Auth check + ownership verification. Validates with Zod (same schema as create but slug optional — only re-validate if changed). Checks slug uniqueness if slug changed. Calls `updateVoyageDb`. Returns updated voyage.

**`deleteVoyage`**: Accepts `{ voyageId: string }`. Auth check + ownership verification + UUID validation. Calls `deleteVoyageDb`. DB CASCADE handles legs and stopovers cleanup. Optionally deletes cover image from Storage if it exists.

**`toggleVisibility`**: Accepts `{ voyageId: string, isPublic: boolean }`. Auth check + ownership verification. Updates `is_public` column only. Returns updated voyage.

**`uploadCoverImage`**: Accepts FormData with file + voyageId. Auth check + ownership verification. Validates file. Uploads to `voyage-covers/{userId}/{voyageId}/cover.{ext}` with upsert. Updates `cover_image_url` in voyage. Returns public URL.

### Data Layer Additions — `src/lib/data/voyages.ts`

```typescript
// Add to existing file:

export async function updateVoyage(id: string, data: TablesUpdate<"voyages">) {
  const supabase = await createClient();
  return supabase.from("voyages").update(data).eq("id", id).select().single();
}

export async function deleteVoyage(id: string) {
  const supabase = await createClient();
  return supabase.from("voyages").delete().eq("id", id);
}
```

**Import needed:** `TablesUpdate` from `@/types/supabase` (already imported as `TablesInsert`, add `TablesUpdate`).

### Storage Bucket Migration

```sql
-- Create voyage-covers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('voyage-covers', 'voyage-covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- RLS: authenticated users can upload to their own folder
CREATE POLICY "Users upload own voyage covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'voyage-covers'
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- RLS: authenticated users can update their own files
CREATE POLICY "Users update own voyage covers"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'voyage-covers'
  AND owner_id = (select auth.uid()::text)
);

-- RLS: authenticated users can delete their own files
CREATE POLICY "Users delete own voyage covers"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'voyage-covers'
  AND owner_id = (select auth.uid()::text)
);

-- RLS: public read access
CREATE POLICY "Public read voyage covers"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'voyage-covers');
```

**Pattern reference:** Follows exact same structure as `avatars` bucket in `supabase/migrations/20260316075758_storage_buckets.sql`.

### Existing Patterns to Reuse

| Module | Path | How to Reuse |
|--------|------|--------------|
| `VoyageCard` | `src/components/voyage/VoyageCard.tsx` | Enhance in-place (do NOT create new component) |
| `MapLoader` / `MapCanvas` | `src/components/map/MapLoader.tsx` | Reference for dynamic import pattern — create separate `MiniMap` / `MiniMapLoader` |
| `RouteLayer` | `src/components/map/RouteLayer.tsx` | Reference for GeoJSON → Leaflet coordinate conversion and Polyline rendering |
| `formatDistanceNm` | `src/lib/utils/format.ts` | Use for stats display |
| `CreateVoyageSchema` | `src/app/dashboard/actions.ts` | Reference Zod schema pattern for update validation |
| `CreateVoyageDialog` | `src/app/dashboard/CreateVoyageDialog.tsx` | Reference for slug generation + inline error pattern |
| `checkSlugAvailability` | `src/lib/data/voyages.ts` | Reuse for slug uniqueness check in settings |
| `generateSlug` | `src/lib/utils/slug.ts` | Reuse if user changes name and slug needs auto-update |
| `validateImageFile` | `src/lib/utils/image.ts` | Validates file type (JPEG/PNG/WebP) and size (<10 MB) |
| `compressImage` | `src/lib/utils/image.ts` | Compresses to <1 MB via `browser-image-compression` |
| `uploadFile` | `src/lib/storage.ts` | Uploads to Supabase Storage, returns `{ path, publicUrl }` |
| `deleteFile` | `src/lib/storage.ts` | Deletes from Supabase Storage |
| `requireAuth` | `src/lib/auth.ts` | Auth guard for server actions |
| Sonner toast | `import { toast } from "sonner"` | Success/error feedback |
| `ProfileForm` | `src/app/dashboard/profile/ProfileForm.tsx` | Reference for image upload pattern + form layout |
| AlertDialog | `@/components/ui/alert-dialog` (shadcn) | Confirmation dialog pattern |
| Switch | `@/components/ui/switch` (shadcn) | Toggle component for visibility |

### shadcn/ui Components Needed

Verify these are already installed in `src/components/ui/`. If any are missing, install them:

```bash
npx shadcn@latest add alert-dialog   # For delete confirmation
npx shadcn@latest add switch         # For visibility toggle
```

Check existing `src/components/ui/` for `alert-dialog.tsx` and `switch.tsx`.

### 3-Tier Containment Compliance

```
OK  src/lib/data/voyages.ts — Tier 2: imports from Tier 1 (src/lib/supabase/server)
OK  src/app/voyage/[id]/settings/actions.ts — Tier 3: imports from Tier 2 (data/, auth.ts, storage.ts)
OK  src/app/voyage/[id]/settings/VoyageSettingsForm.tsx — Tier 4: calls Server Actions only
OK  src/app/voyage/[id]/settings/page.tsx — Tier 3: imports from Tier 2 (data/, auth)
OK  src/components/voyage/VoyageCard.tsx — Tier 4: pure display component
OK  src/components/map/MiniMap.tsx — Tier 4: client-only map component
NEVER  import @supabase/* in settings form or VoyageCard
NEVER  import src/lib/supabase/* in Server Actions
NEVER  import src/lib/data/* in client components — use Server Actions
```

### Anti-Patterns — Do NOT

- **Do NOT create a new `VoyageCardEnhanced` component** — enhance the existing `VoyageCard.tsx` in-place
- **Do NOT fetch legs separately per voyage on dashboard** — use single `getVoyagesWithStats` query with relation select
- **Do NOT add OpenSeaMap tiles to MiniMap** — OSM base only (reduces tile loads for dashboard)
- **Do NOT make MiniMap interactive** — disable all zoom, pan, drag, scroll, touch, keyboard controls
- **Do NOT use `window.confirm()` for deletion** — use shadcn AlertDialog
- **Do NOT store the raw image** — compress client-side via `compressImage()` BEFORE uploading
- **Do NOT import `@supabase/*` anywhere except `src/lib/supabase/`**
- **Do NOT place custom components in `src/components/ui/`** — shadcn/ui only
- **Do NOT inline string literals** — use co-located `messages.ts` files
- **Do NOT throw from Server Actions** — return `{ data, error }` format
- **Do NOT use `any` type** — use Supabase generated types or Zod inferred types
- **Do NOT forget 44px minimum touch targets** on mobile for buttons and links
- **Do NOT create a separate page for delete/visibility** — these live on the settings page

### Testing Strategy

| File | Tests | Focus |
|------|-------|-------|
| `src/lib/data/voyages.test.ts` | ~3 tests | `getVoyagesWithStats`, `updateVoyage`, `deleteVoyage` mock Supabase calls |
| `src/app/voyage/[id]/settings/actions.test.ts` | ~6 tests | updateVoyage validation + success, deleteVoyage auth + success, toggleVisibility, uploadCoverImage validation + success |

Follow existing test patterns:
- Mock `@/lib/supabase/server` with `vi.mock`
- Mock `@/lib/auth` `requireAuth` to return test user
- Verify Zod validation rejects invalid input
- Verify successful mutations return `{ data, error: null }`
- See `src/app/voyage/[id]/actions.test.ts` for reference pattern

### Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#1B2D4F` | Primary text, headings |
| Ocean | `#2563EB` | Track lines, links, public badge bg |
| Coral | `#E8614D` | Primary CTA buttons |
| Sand | `#FDF6EC` | Light backgrounds |
| Foam | `#F1F5F9` | Dashboard background, loading skeleton |
| Success | `#10B981` | Public toggle active state |
| Error | `#EF4444` | Delete button, danger zone |
| Mist | `#94A3B8` | Tertiary text, private badge |
| Slate | `#334155` | Secondary text |
| Card shadow | `0 1px 4px rgba(27, 45, 79, 0.08)` | Default card |
| Hover shadow | `0 2px 12px rgba(27, 45, 79, 0.15)` | Card hover lift |
| Border radius (cards) | 12px | Warm, friendly |
| Border radius (buttons) | 8px | Slightly rounded |
| DM Serif Display | Headings font | Voyage name on card |
| Nunito | Body font | Stats, labels, descriptions |

### Previous Story (2.5) Intelligence

Story 2.5 established:
- **160 tests passing** — do not break them
- **Sonner toast** for feedback: `import { toast } from "sonner"`
- **Messages pattern** — co-located `messages.ts` per route, all strings externalized
- **Server Component → Client Component split** — server does auth + data, client renders interactive UI
- **PWA infrastructure** — ServiceWorkerRegistrar in layout, manifest.ts, share-target route
- **SharePendingRedirect** on dashboard page — preserve when modifying dashboard page

### Git Intelligence

Recent commits: `2.5 WIP`, `2.4b`, `2.3 done`. Pattern: commit messages reference story numbers. Codebase is clean with story 2.5 in review status.

### Scope Boundary

**IN SCOPE:**
- Enhanced VoyageCard with mini-map, stats, cover image, hover effects
- Voyage settings page (name, description, slug editing)
- Voyage deletion with confirmation
- Voyage visibility toggle
- Cover image upload with compression
- `voyage-covers` storage bucket migration
- Data layer additions (getVoyagesWithStats, updateVoyage, deleteVoyage)
- Server actions for settings
- Messages files
- Settings link on voyage page header
- Tests

**OUT OF SCOPE — Do NOT create:**
- No voyage cover image cropping UI — simple upload only
- No drag-and-drop reordering of voyages
- No batch operations on voyages
- No voyage archiving — just delete
- No voyage duplication/copy
- No animated route on mini-map — static track display only
- No OpenSeaMap on mini-map — OSM only
- No stats aggregation on dashboard header (total nm across all voyages) — per-card only

### Project Structure Notes

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                          # MODIFY — use getVoyagesWithStats, pass extended props
│   │   └── messages.ts                       # MODIFY — add VoyageCard messages
│   └── voyage/[id]/
│       ├── page.tsx                          # MODIFY — add settings link in header
│       ├── messages.ts                       # MODIFY — add settings link string
│       └── settings/
│           ├── page.tsx                      # NEW — settings Server Component
│           ├── VoyageSettingsForm.tsx         # NEW — settings Client Component
│           ├── actions.ts                    # NEW — updateVoyage, deleteVoyage, toggleVisibility, uploadCoverImage
│           ├── actions.test.ts               # NEW — server action tests
│           └── messages.ts                   # NEW — settings page strings
├── components/
│   ├── map/
│   │   ├── MiniMap.tsx                       # NEW — lightweight non-interactive Leaflet map
│   │   └── MiniMapLoader.tsx                 # NEW — dynamic import wrapper
│   └── voyage/
│       └── VoyageCard.tsx                    # MODIFY — add mini-map, stats, cover image, empty variant
├── lib/
│   └── data/
│       ├── voyages.ts                        # MODIFY — add getVoyagesWithStats, updateVoyage, deleteVoyage
│       └── voyages.test.ts                   # MODIFY — add tests for new functions
supabase/
└── migrations/
    └── YYYYMMDDHHMMSS_voyage_covers_bucket.sql  # NEW — voyage-covers storage bucket
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.6 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-3 (Voyage CRUD, slug unique per account, dashboard shows voyages with preview and stats), FR-9 (Dashboard)]
- [Source: _bmad-output/planning-artifacts/architecture.md — 3-Tier Supabase containment, Server Action patterns, Storage buckets, image compression]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — VoyageCard component spec, Dashboard layout, Delete confirmation pattern, Badge patterns, Color tokens, Typography]
- [Source: src/components/voyage/VoyageCard.tsx — current minimal implementation to enhance]
- [Source: src/app/dashboard/page.tsx — current dashboard with 2-column grid]
- [Source: src/app/dashboard/actions.ts — createVoyage pattern for Zod + slug validation]
- [Source: src/lib/data/voyages.ts — existing data layer functions]
- [Source: src/lib/utils/image.ts — validateImageFile + compressImage utilities]
- [Source: src/lib/storage.ts — uploadFile, getPublicUrl, deleteFile]
- [Source: supabase/migrations/20260316075758_storage_buckets.sql — avatars bucket pattern to follow]
- [Source: supabase/migrations/20260316092642_voyages.sql — voyages table schema]
- [Source: supabase/migrations/20260316122237_legs.sql — legs ON DELETE CASCADE]
- [Source: supabase/migrations/20260316145232_stopovers.sql — stopovers ON DELETE CASCADE]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions, commands]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Fixed TS error: `AlertDialogTrigger` uses `render` prop (base-ui) not `asChild` (radix)

### Completion Notes List

- Task 1: Added `getVoyagesWithStats`, `updateVoyage`, `deleteVoyage` to data layer with `TablesUpdate` import. 5 new tests added.
- Task 2: Created `voyage-covers` storage bucket migration with RLS policies following `avatars` bucket pattern.
- Task 3: Created 4 server actions (`updateVoyage`, `deleteVoyage`, `toggleVisibility`, `uploadCoverImage`) with Zod validation, ownership verification, and `{ data, error }` pattern. 10 tests added.
- Task 4: Created `MiniMap` (non-interactive Leaflet, OSM only, auto-fit bounds) and `MiniMapLoader` (dynamic import, ssr: false). Enhanced `VoyageCard` to client component with mini-map/cover/empty variants, stats row, hover shadow, ARIA attributes.
- Task 5: Created settings page (server component with auth + ownership check), `VoyageSettingsForm` (client component with name/description/slug editing, visibility Switch, cover image upload with compression, delete AlertDialog), and externalized messages.
- Task 6: Updated dashboard to use `getVoyagesWithStats` query, passing legs and stopover count to enhanced VoyageCard.
- Task 7: Added gear icon settings link in voyage page header with aria-label.
- Task 8: All 177 tests pass, TypeScript strict clean, ESLint clean, build succeeds.

### Change Log

- 2026-03-17: Story 2.6 implemented — Extended dashboard with voyage cards, voyage settings page, cover image upload, visibility toggle, deletion. 177 tests passing.

### File List

New files:
- supabase/migrations/20260317084259_voyage_covers_bucket.sql
- src/components/map/MiniMap.tsx
- src/components/map/MiniMapLoader.tsx
- src/app/voyage/[id]/settings/page.tsx
- src/app/voyage/[id]/settings/VoyageSettingsForm.tsx
- src/app/voyage/[id]/settings/actions.ts
- src/app/voyage/[id]/settings/actions.test.ts
- src/app/voyage/[id]/settings/messages.ts
- src/components/ui/alert-dialog.tsx
- src/components/ui/switch.tsx

Modified files:
- src/lib/data/voyages.ts
- src/lib/data/voyages.test.ts
- src/components/voyage/VoyageCard.tsx
- src/app/dashboard/page.tsx
- src/app/voyage/[id]/page.tsx
- src/app/voyage/[id]/messages.ts
