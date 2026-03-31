# Story 7.2: Photo Marker Clustering

Status: done

## Story

As a visitor,
I want photo markers to cluster when zoomed out,
So that the map remains readable with many photos.

## Acceptance Criteria

1. **Given** a voyage with more than 15 photo markers visible at the current zoom level, **When** the visitor views the map, **Then** nearby markers cluster into group markers showing a count badge
2. **Given** clustered photo markers, **When** the visitor zooms in, **Then** markers progressively uncluster revealing individual photo thumbnails
3. **Given** a cluster marker on the map, **When** the visitor taps/clicks the cluster, **Then** the map zooms into that area to reveal its child markers
4. **Given** any zoom level with fewer than the clustering threshold of nearby markers, **When** the visitor views the map, **Then** individual PhotoMarker thumbnails display as before (no regression)
5. **Given** clustering is active, **When** markers are displayed on both public and private voyage views, **Then** clustering behavior is identical on both views
6. **Given** a cluster marker, **Then** it is accessible with `role="button"` and `aria-label` showing count

## Tasks / Subtasks

- [x] Task 1: Install react-leaflet-cluster and configure (AC: #1)
  - [x] 1.1 `npm install react-leaflet-cluster` (bundles leaflet.markercluster)
  - [x] 1.2 Verify TypeScript types resolve (package includes @types)
  - [x] 1.3 Import CSS in the cluster component (`react-leaflet-cluster/dist/assets/MarkerCluster.css`)
- [x] Task 2: Create PhotoMarkerCluster wrapper component (AC: #1, #2, #3, #6)
  - [x] 2.1 Create `src/components/map/PhotoMarkerCluster.tsx`
  - [x] 2.2 Wrap `<MarkerClusterGroup>` around PhotoMarker children
  - [x] 2.3 Implement custom `iconCreateFunction` for cluster icon with count badge
  - [x] 2.4 Style cluster icon: circular, Bosco navy background, white count text, shadow
  - [x] 2.5 Add accessibility attributes to cluster markers
- [x] Task 3: Integrate into VoyageContent.tsx (AC: #4, #5)
  - [x] 3.1 Replace direct `photoMarkers.map(...)` rendering with `<PhotoMarkerCluster>` wrapping
  - [x] 3.2 Ensure `onTap` callback still wires to lightbox for individual markers
  - [x] 3.3 Verify no regression when < 15 markers (individual thumbnails still visible)
- [x] Task 4: Integrate into PublicVoyageContent.tsx (AC: #5)
  - [x] 4.1 Same pattern as VoyageContent — replace direct map with `<PhotoMarkerCluster>`
  - [x] 4.2 Ensure identical clustering behavior on public view
- [x] Task 5: Write unit tests (AC: #1, #4)
  - [x] 5.1 Test PhotoMarkerCluster renders MarkerClusterGroup with children
  - [x] 5.2 Test custom cluster icon creation with correct count
  - [x] 5.3 Test that individual PhotoMarker props are preserved when passed through cluster

## Dev Notes

### Architecture & Patterns

**Library choice: `react-leaflet-cluster` v4.0.0**
- Actively maintained (Nov 2025 release), supports React 19 + react-leaflet v5
- Bundles `leaflet.markercluster` as dependency — single install: `npm install react-leaflet-cluster`
- DO NOT use `react-leaflet-markercluster` (only at RC stage) or raw `leaflet.markercluster` (no React wrapper)

**Component pattern — wrapper, not replacement:**
- `PhotoMarkerCluster` wraps `<MarkerClusterGroup>` around existing `<PhotoMarker>` children
- PhotoMarker.tsx is NOT modified — it remains the individual marker component
- The cluster component receives `photoMarkers` data + `onTap` callback as props, renders PhotoMarker children inside MarkerClusterGroup

**Dynamic import — same SSR boundary as PhotoMarker:**
```tsx
const PhotoMarkerCluster = dynamic(
  () => import("@/components/map/PhotoMarkerCluster").then(m => m.PhotoMarkerCluster),
  { ssr: false },
);
```

**CSS imports — inside the client component, NOT in server components:**
```tsx
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
// Skip MarkerCluster.Default.css — we use custom styling
```

### Custom Cluster Icon

Use `iconCreateFunction` prop on `<MarkerClusterGroup>` with `L.divIcon`:

```tsx
import L from "leaflet";

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count >= 50 ? 52 : count >= 10 ? 44 : 36;
  return L.divIcon({
    html: `<div class="bosco-photo-cluster" style="width:${size}px;height:${size}px;">
      <span>${count}</span>
    </div>`,
    className: "",
    iconSize: L.point(size, size, true),
  });
}
```

**Cluster icon visual spec (matching Bosco design):**
| Property | Value |
|---|---|
| Shape | Circle (border-radius: 50%) |
| Background | Navy (#1B2D4F) at 85% opacity |
| Border | 2px solid white |
| Shadow | Same as PhotoMarker: `0 2px 6px rgba(27,45,79,0.2)` |
| Text | White, bold, Nunito font stack |
| Size | 36px (< 10 markers), 44px (10-49), 52px (50+) |
| Count text size | 13px (small), 15px (medium), 17px (large) |

### Integration Changes

**VoyageContent.tsx (`src/components/voyage/VoyageContent.tsx`):**
- Replace the `{photoMarkers.map((m, i) => <PhotoMarker ... />)}` block
- With: `<PhotoMarkerCluster photoMarkers={photoMarkers} onTap={handlePhotoTap} />`
- Remove direct `PhotoMarker` dynamic import (now internal to cluster component)

**PublicVoyageContent.tsx (`src/app/[username]/[slug]/PublicVoyageContent.tsx`):**
- Same replacement pattern as VoyageContent
- Remove direct `PhotoMarker` dynamic import

### Coordinate Convention

No change from Story 7.1:
- `buildPhotoMarkers()` returns `[lng, lat]` (GeoJSON order)
- `PhotoMarker.tsx` converts to `[lat, lng]` (Leaflet order) internally
- Clustering operates on Leaflet's internal coordinates — no manual conversion needed

### Critical Constraints

1. **`'use client'` directive required** on PhotoMarkerCluster.tsx — Leaflet needs `window`
2. **Do NOT modify PhotoMarker.tsx** — clustering wraps existing markers, doesn't replace them
3. **Do NOT modify photo-markers-utils.ts** — data pipeline is unchanged
4. **Do NOT modify buildPhotoMarkers()** — clustering is a rendering concern, not data
5. **CSS from node_modules** must be imported inside the client component file, not in layout or server components
6. **`iconCreateFunction` must use `function` keyword** (not arrow function) — some Leaflet internals rely on `this` binding
7. **3-Tier architecture** — PhotoMarkerCluster is Tier 4 (component), no Supabase imports

### File Locations

| File | Action | Purpose |
|---|---|---|
| `src/components/map/PhotoMarkerCluster.tsx` | CREATE | MarkerClusterGroup wrapper with custom icon |
| `src/components/map/PhotoMarkerCluster.test.tsx` | CREATE | Unit tests for cluster component |
| `src/components/voyage/VoyageContent.tsx` | MODIFY | Replace direct PhotoMarker rendering with cluster |
| `src/app/[username]/[slug]/PublicVoyageContent.tsx` | MODIFY | Same replacement for public view |
| `package.json` | MODIFY | Add react-leaflet-cluster dependency |

### Existing Code Context

**Files from Story 7.1 (do NOT modify):**
- `src/components/map/PhotoMarker.tsx` — Individual photo marker (L.divIcon, 32px circular thumbnail)
- `src/components/map/photo-markers-utils.ts` — `buildPhotoMarkers()` data pipeline
- `src/components/map/photoMarkerAccessibility.ts` — Accessibility helper for markers

**Current rendering pattern in VoyageContent.tsx (lines ~147-155):**
```tsx
{photoMarkers.map((m, i) => (
  <PhotoMarker
    key={`${m.entryId}-${i}`}
    position={m.position}
    photoUrl={m.photoUrl}
    label={m.label}
    onTap={handlePhotoTap}
  />
))}
```
This block gets replaced with `<PhotoMarkerCluster>`.

**Current rendering in PublicVoyageContent.tsx (lines ~296-305):**
Same pattern — same replacement needed.

### Testing Strategy

**Unit tests (`PhotoMarkerCluster.test.tsx`):**
- Vitest + React Testing Library
- Mock `react-leaflet-cluster` to verify MarkerClusterGroup renders with correct props
- Verify `iconCreateFunction` is passed and produces correct HTML for various counts
- Verify PhotoMarker children receive correct props (position, photoUrl, label, onTap)

**Manual verification:**
- Test with a voyage that has 20+ photos — clusters should appear when zoomed out
- Zoom in — clusters should progressively uncluster
- Click a cluster — should zoom to reveal children
- Verify individual photo markers still open lightbox on tap

### Previous Story Intelligence (7.1)

**Learnings to apply:**
- Dynamic imports with `ssr: false` work reliably for Leaflet components — follow same pattern
- `L.divIcon` with `className: ""` prevents Leaflet's default marker styling
- Accessibility applied via `useEffect` after mount since Leaflet creates DOM elements outside React
- `useMemo` for marker computation prevents recalculation on unrelated re-renders
- Minimal interfaces (PhotoMarkerEntry, etc.) enable type-safe sharing across components

**No issues encountered in 7.1 that affect 7.2.**

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — Photo Features Architecture, lines 1187-1204]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-35]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — PhotoMarker clustering spec]
- [Source: react-leaflet-cluster docs — https://akursat.gitbook.io/marker-cluster]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- TypeScript type issue: `L.MarkerCluster` and `L.MarkerClusterGroup` not in `@types/leaflet` — resolved by installing `@types/leaflet.markercluster` and importing `leaflet.markercluster` for module augmentation
- `L.MarkerClusterGroup.getElement()` not in types — used `_map` internal property with type assertion for cluster accessibility DOM access

### Completion Notes List

- Installed `react-leaflet-cluster` v4.0.0 (bundles `leaflet.markercluster`) and `@types/leaflet.markercluster` for TypeScript support
- Created `PhotoMarkerCluster.tsx` wrapper component with custom `createClusterIcon` function producing sized navy circle badges (36/44/52px based on count), `MarkerClusterGroup` config, and cluster accessibility via `useEffect`
- Integrated into both `VoyageContent.tsx` (private) and `PublicVoyageContent.tsx` (public) — replaced direct `PhotoMarker` mapping with `<PhotoMarkerCluster>` component, removed direct `PhotoMarker` dynamic imports
- Created 9 unit tests covering: MarkerClusterGroup rendering with correct props, PhotoMarker child count/props, empty state, onTap propagation, and cluster icon creation at 3 size tiers with correct styling
- All 335 tests pass (0 regressions), TypeScript compiles clean, production build succeeds
- PhotoMarker.tsx and photo-markers-utils.ts NOT modified (as required by constraints)

### File List

- `src/components/map/PhotoMarkerCluster.tsx` — NEW: MarkerClusterGroup wrapper with custom cluster icon and accessibility
- `src/components/map/PhotoMarkerCluster.test.tsx` — NEW: 9 unit tests for cluster component and icon creation
- `src/components/voyage/VoyageContent.tsx` — MODIFIED: Replaced PhotoMarker mapping with PhotoMarkerCluster
- `src/app/[username]/[slug]/PublicVoyageContent.tsx` — MODIFIED: Replaced PhotoMarker mapping with PhotoMarkerCluster
- `package.json` — MODIFIED: Added react-leaflet-cluster dependency
- `package-lock.json` — MODIFIED: Lock file updated

### Change Log

- 2026-03-30: Story 7.2 implemented — photo marker clustering with react-leaflet-cluster, custom Bosco-styled cluster icons, accessibility support, integrated into both voyage views
