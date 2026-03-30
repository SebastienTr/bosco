# Story 7.1: Photo Markers on Map

Status: review

## Story

As a visitor (or voyage creator),
I want to see photo thumbnails on the voyage map at the locations where they were taken,
so that I can explore the voyage visually through geo-tagged photos.

## Acceptance Criteria

1. **Given** a voyage with journal entries that have photos linked to stopovers, **When** the visitor views the voyage map, **Then** circular photo thumbnails (32px, white 2px border, subtle shadow) appear at stopover locations.

2. **Given** a journal entry with photos linked to a leg (no stopover), **When** the map renders, **Then** photo markers appear at the leg's midpoint coordinates.

3. **Given** photo markers on the map, **When** compared to stopover markers (coral dots), **Then** photo markers are visually distinct — they show actual image thumbnails, not colored dots.

4. **Given** a voyage with photos, **When** the creator views the voyage in the private voyage view, **Then** photo markers appear on the map (same as public view).

5. **Given** a voyage with photos, **When** the visitor views the public voyage page, **Then** photo markers appear on the map.

6. **Given** a photo marker, **When** rendered, **Then** it has `role="button"` and `aria-label="Photo at {stopover_name} — tap to view"`.

7. **Given** a stopover with multiple journal entries each containing photos, **When** the map renders, **Then** one marker per photo appears at the stopover location (slightly offset or stacked, not overlapping identically — handled in Story 7.2 with clustering).

8. **Given** a journal entry with photos but no stopover_id and no leg_id, **When** the map renders, **Then** no photo marker is displayed (unlinked entries have no map position).

## Tasks / Subtasks

- [x] Task 1: Create `PhotoMarker` component (AC: #1, #3, #6)
  - [x] 1.1 Create `src/components/map/PhotoMarker.tsx` — circular Leaflet marker using thumbnail URL as icon
  - [x] 1.2 Style: 32px circle, white 2px border, subtle shadow (`0 2px 6px rgba(27,45,79,0.2)`)
  - [x] 1.3 Use Leaflet `L.divIcon` with `<img>` inside (not CircleMarker — need image content)
  - [x] 1.4 Add accessibility: `role="button"`, `aria-label`, `tabIndex={0}`
  - [x] 1.5 Accept `onTap` callback prop for future lightbox integration (Story 7.3)

- [x] Task 2: Build photo-entries-to-markers data pipeline (AC: #1, #2, #7, #8)
  - [x] 2.1 Create helper function `buildPhotoMarkers(logEntries, stopovers, legs)` in `src/components/map/photo-markers-utils.ts`
  - [x] 2.2 Filter entries: only those with `photo_urls?.length > 0`
  - [x] 2.3 Resolve position: use `stopover_id` → stopover coordinates; else `leg_id` → leg midpoint; else skip
  - [x] 2.4 Return flat array of `{ photoUrl, position: [lng, lat], label, entryId }` — one item per photo
  - [x] 2.5 Write co-located test `photo-markers-utils.test.ts`

- [x] Task 3: Integrate into private voyage view (AC: #4)
  - [x] 3.1 In `VoyageContent.tsx`: call `buildPhotoMarkers()` with existing `initialLogEntries`, stopovers, legs
  - [x] 3.2 Render `<PhotoMarker>` components inside `<MapCanvas>` children (MapCanvas already supports children)
  - [x] 3.3 Wire `onTap` to existing `handlePhotoTap` lightbox handler

- [x] Task 4: Integrate into public voyage view (AC: #5)
  - [x] 4.1 In `PublicVoyageContent.tsx`: same `buildPhotoMarkers()` + `<PhotoMarker>` rendering
  - [x] 4.2 Ensure SSR-safe: PhotoMarker is client-only (inside dynamically imported map)

- [x] Task 5: Visual QA and accessibility (AC: #3, #6)
  - [x] 5.1 Verify photo markers are visually distinct from coral stopover markers
  - [x] 5.2 Verify keyboard navigation (Tab → Enter) works on photo markers
  - [x] 5.3 Verify screen reader announces correct aria-label

## Dev Notes

### What Already Exists — DO NOT Reinvent

| Existing Asset | Location | Use For |
|---|---|---|
| Photo upload/delete | `src/app/voyage/[id]/log/actions.ts` | Already handles photo storage — no changes needed |
| Image validation/compression | `src/lib/utils/image.ts` | Already compresses to <4MB, 1920px — no changes |
| Photo storage bucket | `log-photos` bucket (migration `20260326100001`) | Photos already stored here |
| Photo URLs in DB | `log_entries.photo_urls` JSONB array | Query source for marker data |
| Lightbox component | `src/components/log/PhotoLightbox.tsx` | Wire `onTap` to this in VoyageContent |
| Stopover marker pattern | `src/components/map/StopoverMarker.tsx` | Follow component pattern (coordinate conversion, a11y) |
| Log entries data layer | `src/lib/data/log-entries.ts` → `getLogEntriesByVoyageId()` | Already loads entries with photo_urls |
| Stopovers data layer | `src/lib/data/stopovers.ts` | Already loads stopovers with coordinates |
| Legs data layer | `src/lib/data/legs.ts` | Already loads legs with GeoJSON track data |

### Architecture Constraints

**3-Tier Supabase Containment:**
- `PhotoMarker.tsx` is Tier 4 (component) — NEVER import Supabase or data layer directly
- Data flows through: Server Action → data layer → passed as props to components
- No new server actions needed — existing data already passed to VoyageContent/PublicVoyageContent

**Coordinate Convention — CRITICAL:**
- Database/GeoJSON stores `[longitude, latitude]`
- Leaflet requires `[latitude, longitude]`
- Conversion happens ONLY in the map component layer (inside PhotoMarker.tsx)
- `buildPhotoMarkers()` returns GeoJSON-order `[lng, lat]`; PhotoMarker converts to `[lat, lng]` for Leaflet

**Client-Only Boundary:**
- `src/components/map/*` is always client-only (dynamic import, `ssr: false`)
- PhotoMarker.tsx will be rendered inside MapCanvas children — already client-side

### Component Design: PhotoMarker.tsx

```typescript
// src/components/map/PhotoMarker.tsx
interface PhotoMarkerProps {
  /** [longitude, latitude] GeoJSON order */
  position: [number, number]
  /** Supabase Storage public URL */
  photoUrl: string
  /** For aria-label: "Photo at {label}" */
  label: string
  /** Callback when marker is tapped (opens lightbox) */
  onTap?: (photoUrl: string) => void
}
```

**Implementation approach:**
- Use `react-leaflet` `Marker` component with custom `L.divIcon`
- DivIcon renders a `<div>` with a circular clipped `<img>` thumbnail
- CSS: `width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(27,45,79,0.2); overflow: hidden; object-fit: cover;`
- Hover state: scale to 36px with transition
- Use `eventHandlers={{ click: () => onTap?.(photoUrl) }}`

**Why L.divIcon, not L.icon:**
- L.icon creates `<img>` tag — can't easily style with border-radius + border
- L.divIcon allows full HTML/CSS control for the circular thumbnail with border

### Data Pipeline: buildPhotoMarkers()

```typescript
// src/components/map/photo-markers-utils.ts
interface PhotoMarkerData {
  photoUrl: string
  position: [number, number]  // [lng, lat] GeoJSON order
  label: string               // stopover name or leg label
  entryId: string
}

function buildPhotoMarkers(
  logEntries: LogEntry[],
  stopovers: Stopover[],
  legs: Leg[]
): PhotoMarkerData[]
```

**Resolution logic:**
1. Filter entries where `photo_urls` is non-empty array
2. For each entry, for each photo URL:
   - If `stopover_id` → find matching stopover → use `[stopover.longitude, stopover.latitude]` (check actual field names from types)
   - Else if `leg_id` → find matching leg → compute midpoint from leg's GeoJSON coordinates
   - Else → skip (no map position available)
3. Return flat `PhotoMarkerData[]`

**Stopover coordinate fields:** Check `src/types/supabase.ts` for exact field names. Stopovers likely store `latitude`/`longitude` as separate columns or as coordinates in a GeoJSON field. The `StopoverMarker.tsx` component shows the current pattern.

### Integration Points

**VoyageContent.tsx** (`src/components/voyage/VoyageContent.tsx`):
- Already receives `initialLogEntries` prop
- Already receives stopovers (via `StopoverMarkers` rendering)
- Already has `handlePhotoTap(url)` → opens lightbox
- Add: compute `photoMarkers = buildPhotoMarkers(logEntries, stopovers, legs)`
- Add: render `{photoMarkers.map(m => <PhotoMarker key={...} ... onTap={handlePhotoTap} />)}` inside MapCanvas

**PublicVoyageContent.tsx** (`src/components/voyage/PublicVoyageContent.tsx`):
- Similarly receives log entries, stopovers, legs as props
- Add same PhotoMarker rendering
- If lightbox not yet integrated for public view, add `handlePhotoTap` state

### Testing Strategy

**Unit test** (`photo-markers-utils.test.ts`):
- Entry with photo + stopover → marker at stopover position
- Entry with photo + leg (no stopover) → marker at leg midpoint
- Entry with photo but no stopover/leg → no marker
- Entry without photos → no marker
- Multiple photos per entry → multiple markers (one per photo)
- Empty entries array → empty result

**Component test** (optional, lower priority):
- PhotoMarker renders with correct aria-label
- PhotoMarker calls onTap on click

### Visual Specifications

| Property | Value |
|---|---|
| Size | 32px diameter (default), 36px (hover) |
| Shape | Circle (border-radius: 50%) |
| Border | 2px solid white |
| Shadow | `0 2px 6px rgba(27, 45, 79, 0.2)` |
| Image fit | `object-fit: cover` |
| Hover transition | `transform: scale(1.125)`, 150ms ease |
| z-index | Above route layer, below popups/sheets |
| Accessibility | `role="button"`, `aria-label="Photo at {name} — tap to view"`, `tabIndex={0}` |

### Naming Conventions

| File | Convention |
|---|---|
| `src/components/map/PhotoMarker.tsx` | PascalCase component |
| `src/components/map/photo-markers-utils.ts` | kebab-case utility |
| `src/components/map/photo-markers-utils.test.ts` | Co-located test |

### Previous Story Intelligence (Story 5.5)

**Patterns to follow:**
- Server actions wrapped with `withLogging()` (not needed here — no new actions)
- Co-located tests next to source files
- `ActionResponse<T>` contract for any server actions
- Component tests verify rendering + interaction
- Full validation: `npm run test`, `npx tsc --noEmit`, `npm run build`

**Storage path pattern from 5.5:** `log-photos/{userId}/{voyageId}/logs/{timestamp}.{ext}` — photo URLs stored in `log_entries.photo_urls` are already public Supabase URLs. PhotoMarker uses these URLs directly as `<img src>`.

### Git Intelligence

Recent commits follow pattern: `{story_number}` as commit message (e.g., "5.5", "5.4"). No elaborate commit messages. Build validation run before marking complete.

### What This Story Does NOT Include

- **No clustering** → Story 7.2
- **No lightbox creation** → PhotoLightbox already exists; full-featured lightbox is Story 7.3
- **No new photo upload flow** → Existing journal entry photo upload is sufficient
- **No EXIF GPS extraction** → v1.0 uses stopover/leg location, not photo metadata
- **No new database migrations** → Existing schema supports this feature
- **No new server actions** → Data already flows through existing queries

### Project Structure Notes

New files:
```
src/components/map/
├── PhotoMarker.tsx              # NEW — circular photo thumbnail marker
├── photo-markers-utils.ts       # NEW — data pipeline: entries → markers
└── photo-markers-utils.test.ts  # NEW — unit tests
```

Modified files:
```
src/components/voyage/VoyageContent.tsx        # Add PhotoMarker rendering
src/components/voyage/PublicVoyageContent.tsx   # Add PhotoMarker rendering
```

No other files need modification.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — Photo Features Architecture, lines 1182-1204]
- [Source: _bmad-output/planning-artifacts/architecture.md — Map Component Structure, lines 647-652]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PhotoMarker specs, lines 1119-1137, 1252-1265]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-33: Geo-tagged media on map]
- [Source: src/components/map/StopoverMarker.tsx — Marker pattern reference]
- [Source: src/components/voyage/VoyageContent.tsx — Integration point]
- [Source: src/lib/data/log-entries.ts — Data layer for journal entries]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Initial test run: 1 failure on whitespace-only URL filtering — fixed parsePhotoUrls to trim before length check
- buildPhotoMarkers refactored to use structural interfaces (PhotoMarkerEntry, PhotoMarkerStopover, PhotoMarkerLeg) instead of concrete Supabase types for compatibility with PublicVoyageContent local types

### Completion Notes List
- Task 1: Created PhotoMarker.tsx using L.divIcon with circular `<img>` thumbnail, 32px with white border and shadow, hover scale(1.125), full a11y (role="button", aria-label, tabIndex, keypress handler)
- Task 2: Created buildPhotoMarkers() pipeline with position resolution (stopover → leg midpoint → skip), 10 unit tests covering all scenarios including edge cases (null photo_urls, empty strings, missing references)
- Task 3: Integrated into VoyageContent.tsx — dynamic import of PhotoMarker, useMemo for markers computation, wired to existing handlePhotoTap lightbox handler
- Task 4: Integrated into PublicVoyageContent.tsx — same pattern, dynamic import ensures SSR-safe, wired to existing handlePhotoTap
- Task 5: Visual QA verified via code review — photo markers use circular image thumbnails (visually distinct from coral CircleMarker dots), keyboard support via keypress handler on Enter, aria-label follows "Photo at {name} — tap to view" pattern

### File List
New files:
- src/components/map/PhotoMarker.tsx
- src/components/map/photo-markers-utils.ts
- src/components/map/photo-markers-utils.test.ts

Modified files:
- src/components/voyage/VoyageContent.tsx
- src/app/[username]/[slug]/PublicVoyageContent.tsx

### Change Log
- 2026-03-30: Story created — comprehensive developer guide for photo markers on map
- 2026-03-30: Implementation complete — all 5 tasks done, 10 unit tests pass, build succeeds, 324/324 tests pass (0 regressions)
