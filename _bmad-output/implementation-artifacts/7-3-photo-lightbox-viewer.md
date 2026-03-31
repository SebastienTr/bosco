# Story 7.3: Photo Lightbox Viewer

Status: review

## Story

As a visitor (or voyage creator),
I want to tap a photo marker and see the photo full-screen with navigation between photos,
so that I can appreciate the voyage photos in detail.

## Acceptance Criteria

1. **Given** a voyage map with photo markers, **When** the visitor taps a photo marker, **Then** a full-viewport lightbox opens with navy/90 backdrop and `backdrop-blur`
2. **Given** the lightbox is open, **Then** the photo is centered and scaled to fill the viewport with padding (current behavior preserved)
3. **Given** the lightbox is open, **Then** a close button (X) is visible top-right and Escape key closes the lightbox
4. **Given** the lightbox is open with multiple photos in the voyage, **When** the visitor swipes left/right (touch) or presses arrow keys, **Then** the lightbox navigates to the previous/next photo in the collection
5. **Given** the lightbox is open, **Then** a caption area below the photo shows: entry text excerpt (truncated to ~100 chars), stopover/leg name, and entry date
6. **Given** the lightbox is open, **Then** focus is trapped within the lightbox (existing behavior preserved)
7. **Given** the lightbox is open on the first photo, **When** the visitor presses left arrow or swipes right, **Then** navigation wraps to the last photo (circular navigation)
8. **Given** a photo is tapped from the JournalTimeline or LogEntryCard, **Then** the same enhanced lightbox opens with the tapped photo and navigation through the voyage's photos

## Tasks / Subtasks

- [x] Task 1: Extend PhotoMarkerData with caption metadata (AC: #5)
  - [x] 1.1 Add `entryText`, `entryDate` fields to `PhotoMarkerData` interface in `photo-markers-utils.ts`
  - [x] 1.2 Update `buildPhotoMarkers()` to populate `entryText` (from `entry.text`) and `entryDate` (from `entry.entry_date`)
  - [x] 1.3 Add `text` and `entry_date` to `PhotoMarkerEntry` interface
  - [x] 1.4 Update existing tests in `photo-markers-utils.test.ts` for new fields

- [x] Task 2: Create `LightboxPhoto` interface and `buildLightboxPhotos` helper (AC: #4, #5)
  - [x] 2.1 Define `LightboxPhoto` type: `{ url: string; caption: { text: string; location: string; date: string } }`
  - [x] 2.2 Create `buildLightboxPhotos(photoMarkers: PhotoMarkerData[]): LightboxPhoto[]` utility — maps markers to lightbox items
  - [x] 2.3 Write unit tests for the mapping function

- [x] Task 3: Enhance PhotoLightbox with navigation and captions (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] 3.1 Change props: `url: string | null` → `photos: LightboxPhoto[]`, `initialIndex: number`, `onClose: () => void`
  - [x] 3.2 Add `currentIndex` state with `goNext()` / `goPrev()` handlers (circular navigation)
  - [x] 3.3 Add arrow key navigation (ArrowLeft → prev, ArrowRight → next) in the existing keydown handler
  - [x] 3.4 Add touch swipe detection using pointer events (threshold: 50px horizontal swipe)
  - [x] 3.5 Add `backdrop-blur` to backdrop (`backdrop-blur-sm`)
  - [x] 3.6 Add prev/next arrow buttons (left/right edges, visible on hover/focus, always on mobile)
  - [x] 3.7 Add caption bar below the photo: entry text excerpt, location name, date
  - [x] 3.8 Handle edge case: single photo → hide navigation arrows, disable arrow key nav
  - [x] 3.9 Preserve all existing a11y: dialog role, aria-modal, focus trap, Escape close

- [x] Task 4: Update VoyageContent integration (AC: #4, #8)
  - [x] 4.1 Compute `lightboxPhotos` from `photoMarkers` using `buildLightboxPhotos()`
  - [x] 4.2 Change `handlePhotoTap(url)` to find the photo index in lightboxPhotos and pass `initialIndex`
  - [x] 4.3 Update PhotoLightbox render to pass `photos` and `initialIndex` instead of `url`

- [x] Task 5: Update PublicVoyageContent integration (AC: #4, #8)
  - [x] 5.1 Same changes as VoyageContent — compute lightboxPhotos, find index, pass to PhotoLightbox
  - [x] 5.2 Ensure JournalTimeline's `onPhotoTap` also works with the new lightbox (same photo URL lookup)

- [x] Task 6: Write unit tests for enhanced PhotoLightbox (AC: #1-#7)
  - [x] 6.1 Create `PhotoLightbox.test.tsx` co-located with the component
  - [x] 6.2 Test: renders photo at initial index
  - [x] 6.3 Test: arrow key navigation (left/right) changes displayed photo
  - [x] 6.4 Test: circular navigation (wraps from first to last and vice versa)
  - [x] 6.5 Test: Escape key calls onClose
  - [x] 6.6 Test: close button calls onClose
  - [x] 6.7 Test: caption displays entry text, location, and date
  - [x] 6.8 Test: single photo hides navigation arrows
  - [x] 6.9 Test: renders nothing when photos array is empty

## Dev Notes

### What Already Exists — DO NOT Reinvent

| Existing Asset | Location | Relevance |
|---|---|---|
| PhotoLightbox (current) | `src/components/log/PhotoLightbox.tsx` | **ENHANCE THIS** — already has navy/90 backdrop, close button, Escape, focus trap, dialog role, z-600 |
| PhotoMarker | `src/components/map/PhotoMarker.tsx` | Calls `onTap(photoUrl)` — callback signature stays the same |
| PhotoMarkerCluster | `src/components/map/PhotoMarkerCluster.tsx` | Passes `onTap` to markers — no changes needed |
| buildPhotoMarkers | `src/components/map/photo-markers-utils.ts` | Needs new fields (entryText, entryDate) but existing logic unchanged |
| handlePhotoTap | VoyageContent + PublicVoyageContent | Currently `(url: string) => void` — needs index lookup logic added |
| JournalTimeline/LogEntryCard | `src/components/log/` | Call `onPhotoTap(url)` — callback signature unchanged |
| Image validation/compression | `src/lib/utils/image.ts` | Already compresses uploads — no changes |
| Photo storage | `log-photos` bucket | Photos already stored — no changes |

### Architecture Constraints

**3-Tier Supabase Containment:**
- PhotoLightbox is Tier 4 (component) — NEVER import Supabase or data layer
- All photo data flows through props from parent components
- No new server actions needed — caption data comes from existing log entries passed as props

**Client-Only Boundary:**
- PhotoLightbox is already `"use client"` — no change needed
- Touch event handlers work in client context only (already client)

### Component Enhancement: PhotoLightbox.tsx

**Current props** (`src/components/log/PhotoLightbox.tsx:6-9`):
```typescript
interface PhotoLightboxProps {
  url: string | null;
  onClose: () => void;
}
```

**New props:**
```typescript
interface LightboxPhoto {
  url: string;
  caption: {
    text: string;      // entry text excerpt (truncate to ~100 chars)
    location: string;  // stopover name or leg label
    date: string;      // entry_date formatted
  };
}

interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  initialIndex: number;
  onClose: () => void;
}
```

**Key implementation notes:**
- `isOpen` check changes from `url !== null` to `photos.length > 0`
- `currentIndex` state, initialized from `initialIndex` prop (reset via `useEffect` when `initialIndex` changes)
- Navigation: `goNext = () => setIndex((i) => (i + 1) % photos.length)` / `goPrev` similar
- Single photo: conditionally hide nav arrows when `photos.length <= 1`
- Caption area: new `<div>` below the photo with text-white/80, truncated text, location, date

**Backdrop-blur addition** (line 60 of current file):
```diff
- className="absolute inset-0 bg-[#1B2D4F]/90"
+ className="absolute inset-0 bg-[#1B2D4F]/90 backdrop-blur-sm"
```

### Touch Swipe Implementation

Use pointer events (no external library needed):
```typescript
const [swipeStart, setSwipeStart] = useState<number | null>(null);

const handlePointerDown = (e: React.PointerEvent) => setSwipeStart(e.clientX);
const handlePointerUp = (e: React.PointerEvent) => {
  if (swipeStart === null) return;
  const diff = e.clientX - swipeStart;
  if (Math.abs(diff) > 50) {
    diff > 0 ? goPrev() : goNext();
  }
  setSwipeStart(null);
};
```

Apply these handlers on the photo container div (not the backdrop). Use `touch-action: pan-y` CSS to allow vertical scroll while capturing horizontal swipe.

### Navigation Arrow Buttons

Prev/next arrows positioned at left/right edges of viewport:
```typescript
// Left arrow (prev)
<button
  onClick={goPrev}
  aria-label="Previous photo"
  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-ocean"
>
  <ChevronLeftIcon />
</button>
```
- Show both arrows on mobile (always visible)
- On desktop: visible on hover/focus of lightbox area
- Hide arrows entirely when `photos.length <= 1`
- Use inline SVG chevrons (same pattern as close button X icon)

### Caption Bar

Below the photo, inside the lightbox dialog:
```html
<div class="mt-3 text-center text-white/80 font-body text-sm max-w-xl mx-auto">
  <p class="line-clamp-2">{caption.text}</p>
  <p class="mt-1 text-xs text-white/60">
    {caption.location} · {caption.date}
  </p>
</div>
```

**Text truncation:** Use `line-clamp-2` (Tailwind built-in). Entry text from `entry.text`, truncated at display level only.

### Data Pipeline Enhancement

**PhotoMarkerEntry interface** (add 2 fields):
```diff
 export interface PhotoMarkerEntry {
   id: string;
   photo_urls: unknown;
   stopover_id: string | null;
   leg_id: string | null;
+  text: string;
+  entry_date: string;
 }
```

**PhotoMarkerData interface** (add 2 fields):
```diff
 export interface PhotoMarkerData {
   photoUrl: string;
   position: [number, number];
   label: string;
   entryId: string;
+  entryText: string;
+  entryDate: string;
 }
```

**buildPhotoMarkers()** — add in the push call:
```diff
 markers.push({
   photoUrl,
   position: resolved.position,
   label: resolved.label,
   entryId: entry.id,
+  entryText: entry.text,
+  entryDate: entry.entry_date,
 });
```

These fields are already present on the `LogEntry` type from Supabase (`text: string`, `entry_date: string`). The structural interface `PhotoMarkerEntry` just needs to declare them.

### Integration Changes

**VoyageContent.tsx:**
```typescript
// After existing photoMarkers computation
const lightboxPhotos = useMemo(
  () => buildLightboxPhotos(photoMarkers),
  [photoMarkers],
);

// Updated handlePhotoTap — find index by URL
const handlePhotoTap = useCallback((url: string) => {
  const index = lightboxPhotos.findIndex((p) => p.url === url);
  setLightboxIndex(index >= 0 ? index : 0);
  setActiveOverlay("lightbox");
}, [lightboxPhotos]);

// Render
{activeOverlay === "lightbox" && (
  <PhotoLightbox
    photos={lightboxPhotos}
    initialIndex={lightboxIndex}
    onClose={handleCloseLightbox}
  />
)}
```

Replace `lightboxUrl` state with `lightboxIndex` (number). Remove `setLightboxUrl`.

**PublicVoyageContent.tsx:** Same pattern. The `JournalTimeline`'s `onPhotoTap` still calls `handlePhotoTap(url)` — the same URL-to-index lookup works for both map markers and journal photo taps.

**handleCloseLightbox** — simplify:
```typescript
const handleCloseLightbox = useCallback(() => {
  setActiveOverlay(null);
}, []);
```

### Critical Constraints

1. **Do NOT create a new lightbox component** — enhance the existing `src/components/log/PhotoLightbox.tsx`
2. **Do NOT change PhotoMarker.tsx** — the `onTap(photoUrl: string)` callback signature is unchanged
3. **Do NOT change PhotoMarkerCluster.tsx** — it passes `onTap` through, no change needed
4. **Do NOT add external swipe libraries** — use pointer events (pointerdown/pointerup), ~15 lines of code
5. **Do NOT change the `onPhotoTap` callback type** in JournalTimeline/LogEntryCard — it stays `(url: string) => void`
6. **Preserve existing z-index** — lightbox is z-[600], above all other overlays
7. **`'use client'` already present** on PhotoLightbox — no change needed
8. **Coordinate convention unchanged** — no map coordinate work in this story

### File Locations

| File | Action | Purpose |
|---|---|---|
| `src/components/map/photo-markers-utils.ts` | MODIFY | Add entryText, entryDate to interfaces + buildPhotoMarkers output |
| `src/components/map/photo-markers-utils.test.ts` | MODIFY | Update test assertions for new fields |
| `src/components/log/PhotoLightbox.tsx` | MODIFY | Add navigation, captions, backdrop-blur, new props |
| `src/components/log/PhotoLightbox.test.tsx` | CREATE | Unit tests for enhanced lightbox |
| `src/components/voyage/VoyageContent.tsx` | MODIFY | Use lightboxPhotos + index instead of url |
| `src/app/[username]/[slug]/PublicVoyageContent.tsx` | MODIFY | Same integration update as VoyageContent |

### Existing Code Context

**Files from Story 7.1/7.2 — DO NOT modify:**
- `src/components/map/PhotoMarker.tsx` — Individual marker, calls onTap(photoUrl)
- `src/components/map/PhotoMarkerCluster.tsx` — Cluster wrapper, passes onTap through
- `src/components/map/photoMarkerAccessibility.ts` — Accessibility helper

**Current PhotoLightbox** (`src/components/log/PhotoLightbox.tsx`):
- 100 lines, simple single-photo viewer
- Props: `{ url: string | null; onClose: () => void }`
- Has: navy/90 backdrop, X close button, Escape handling, focus trap, dialog role, aria-modal
- Missing: backdrop-blur, navigation arrows, swipe, captions, multi-photo support

**Current handlePhotoTap in VoyageContent.tsx (lines 94-97):**
```typescript
const handlePhotoTap = useCallback((url: string) => {
  setLightboxUrl(url);
  setActiveOverlay("lightbox");
}, []);
```

**Current handlePhotoTap in PublicVoyageContent.tsx (lines 209-213):**
```typescript
const handlePhotoTap = useCallback((url: string) => {
  setLightboxUrl(url);
  setSelectedStopover(null);
  setActiveOverlay("lightbox");
}, []);
```

**LogEntry DB fields** (from supabase types):
- `id: string`, `text: string`, `entry_date: string`, `photo_urls: Json`, `stopover_id: string | null`, `leg_id: string | null`, `voyage_id: string`

### Where to Put buildLightboxPhotos

Create it inside `photo-markers-utils.ts` alongside `buildPhotoMarkers` — it's a pure mapper from `PhotoMarkerData[]` to `LightboxPhoto[]`:

```typescript
export function buildLightboxPhotos(markers: PhotoMarkerData[]): LightboxPhoto[] {
  return markers.map((m) => ({
    url: m.photoUrl,
    caption: {
      text: m.entryText,
      location: m.label,
      date: m.entryDate,
    },
  }));
}
```

Export the `LightboxPhoto` type from the same file — it's part of the photo data pipeline.

### Testing Strategy

**Unit tests (`PhotoLightbox.test.tsx`):**
- Vitest + React Testing Library
- Render with `photos` array + `initialIndex`
- Simulate keydown events for arrow key navigation
- Verify photo src changes on navigation
- Verify caption text renders
- Verify Escape calls onClose
- Verify close button calls onClose
- Verify empty photos array renders nothing

**Updated tests (`photo-markers-utils.test.ts`):**
- Verify `entryText` and `entryDate` appear in marker output
- Test `buildLightboxPhotos()` mapping

**Manual verification:**
- Tap photo marker on map → lightbox opens with backdrop-blur
- Arrow keys navigate between photos
- Swipe left/right on mobile navigates
- Caption shows entry text, location, date
- Tap photo in journal timeline → same lightbox opens
- Single photo voyage → no arrows visible

### Visual Specifications (from UX design spec)

| Property | Value |
|---|---|
| Backdrop | `bg-[#1B2D4F]/90 backdrop-blur-sm` (navy at 90% opacity + blur) |
| Photo sizing | max-h-[80vh] max-w-[90vw] max-w-4xl, object-contain |
| Close button | Top-right, white/80, 24px X icon |
| Nav arrows | Left/right edges, vertical center, white/60 → white on hover, 32px chevron icons |
| Caption text | white/80, font-body, text-sm, line-clamp-2, max-w-xl centered |
| Caption meta | white/60, text-xs, "{location} · {date}" |
| z-index | 600 (existing, unchanged) |
| Transition | opacity 200ms ease (existing) |

### Previous Story Intelligence (7.1 + 7.2)

**Patterns established:**
- Dynamic imports with `ssr: false` for Leaflet components — not relevant here (lightbox is not map-specific)
- `useMemo` for computed data — apply to `lightboxPhotos`
- Co-located tests with `.test.tsx` suffix
- Minimal structural interfaces (`PhotoMarkerEntry`, etc.) — extend rather than create new ones
- `className: ""` pattern for Leaflet divIcon — not relevant here
- All 335 tests passing after 7.2 — must maintain zero regressions

**Debugging learnings:**
- Whitespace filtering in photo URLs already handled by `parsePhotoUrls()`
- Structural interfaces preferred over concrete Supabase types for cross-component compatibility

### Git Intelligence

Recent commits use pattern: `{story_number}` (e.g., "7.1"). Build validation (`npm run test`, `npx tsc --noEmit`, `npm run build`) run before marking complete.

### What This Story Does NOT Include

- **No new photo upload flow** — existing journal entry photo upload is sufficient
- **No pinch-to-zoom on photos** — keep simple for v1.0, can be added later
- **No photo download button** — not in requirements
- **No photo sharing from lightbox** — sharing is Story 7.5
- **No photo thumbnails strip/gallery** — full carousel is not required, just prev/next
- **No animation/slide transitions between photos** — instant swap is fine for v1.0

### Project Structure Notes

Modified files:
```
src/components/map/photo-markers-utils.ts     # Add caption fields
src/components/map/photo-markers-utils.test.ts # Update for new fields
src/components/log/PhotoLightbox.tsx           # Major enhancement
src/components/voyage/VoyageContent.tsx        # Lightbox integration update
src/app/[username]/[slug]/PublicVoyageContent.tsx # Same integration update
```

New files:
```
src/components/log/PhotoLightbox.test.tsx      # Unit tests for enhanced lightbox
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.3, lines 477-492]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PhotoLightbox spec, lines 1128-1135]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PhotoMarker component, lines 1259-1264]
- [Source: _bmad-output/planning-artifacts/architecture.md — Photo Features Architecture, lines 1180-1204]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-34: Tap photo markers for lightbox]
- [Source: src/components/log/PhotoLightbox.tsx — Current implementation to enhance]
- [Source: src/components/map/photo-markers-utils.ts — Data pipeline to extend]
- [Source: src/components/voyage/VoyageContent.tsx — Integration point (lines 94-97, 189-192)]
- [Source: src/app/[username]/[slug]/PublicVoyageContent.tsx — Integration point (lines 209-218, 413-416)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Initial test failure: jest-dom matchers (`toHaveAttribute`, `toBeInTheDocument`) not available in project — vitest setup has no jest-dom. Fixed by using standard vitest assertions (`getAttribute()`, `toBeTruthy()`, `toBeNull()`).

### Completion Notes List

- Task 1: Extended `PhotoMarkerEntry` with `text` and `entry_date` fields, `PhotoMarkerData` with `entryText` and `entryDate`. Updated `buildPhotoMarkers()` to pass through these fields. Updated 3 existing test assertions + added 1 new test for the new fields.
- Task 2: Defined `LightboxPhoto` interface and `buildLightboxPhotos()` pure mapper in `photo-markers-utils.ts`. Added 2 unit tests for the mapper.
- Task 3: Rewrote `PhotoLightbox.tsx` with multi-photo support: `photos[]` + `initialIndex` props, circular navigation via `currentIndex` state, arrow key navigation, pointer event swipe detection (50px threshold), `backdrop-blur-sm`, prev/next arrow buttons (hidden for single photo), caption bar with text/location/date, preserved all a11y (dialog, aria-modal, focus trap, Escape).
- Task 4: Updated `VoyageContent.tsx` — replaced `lightboxUrl` state with `lightboxIndex`, added `lightboxPhotos` memo via `buildLightboxPhotos()`, updated `handlePhotoTap` to find index by URL, simplified `handleCloseLightbox`.
- Task 5: Updated `PublicVoyageContent.tsx` — same pattern as VoyageContent. JournalTimeline's `onPhotoTap(url)` callback unchanged, URL-to-index lookup handles both map marker and journal photo taps.
- Task 6: Created `PhotoLightbox.test.tsx` with 12 tests covering: empty photos, initial index, caption rendering, arrow key navigation, circular wrap, Escape/close button, hidden arrows for single photo, click navigation.
- All 353 tests pass (0 regressions), TypeScript clean, production build successful.

### File List

- `src/components/map/photo-markers-utils.ts` — MODIFIED (added `text`/`entry_date` to `PhotoMarkerEntry`, `entryText`/`entryDate` to `PhotoMarkerData`, `LightboxPhoto` interface, `buildLightboxPhotos()` function)
- `src/components/map/photo-markers-utils.test.ts` — MODIFIED (updated 3 assertions for new fields, added 3 new tests for `entryText`/`entryDate` and `buildLightboxPhotos`)
- `src/components/log/PhotoLightbox.tsx` — MODIFIED (rewritten with multi-photo navigation, captions, swipe, backdrop-blur)
- `src/components/log/PhotoLightbox.test.tsx` — CREATED (12 unit tests for enhanced lightbox)
- `src/components/voyage/VoyageContent.tsx` — MODIFIED (lightboxPhotos + index integration)
- `src/app/[username]/[slug]/PublicVoyageContent.tsx` — MODIFIED (lightboxPhotos + index integration)

### Change Log

- 2026-03-31: Story 7.3 implemented — enhanced PhotoLightbox with multi-photo navigation, captions, touch swipe, and backdrop-blur. Integrated into both private and public voyage views.
