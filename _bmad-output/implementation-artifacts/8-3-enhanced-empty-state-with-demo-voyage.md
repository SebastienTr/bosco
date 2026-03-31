# Story 8.3: Enhanced Empty State with Demo Voyage

Status: review

## Story

As a new user with no voyages,
I want to see what a completed voyage looks like,
so that I understand what I'm building toward and feel motivated to create my first voyage.

## Acceptance Criteria

1. **Given** an authenticated user with zero voyages on the dashboard, **when** they view the dashboard, **then** an animated mini-demo shows a track drawing on a small map (same animation pattern as the landing page hero).

2. **Given** the enhanced empty state is visible, **then** a headline reads "Your first voyage awaits" (from `messages.ts`).

3. **Given** the enhanced empty state is visible, **then** 3 steps are shown: "1. Export your track from Navionics 2. Share the GPX file to Bosco 3. Your voyage appears on the map" (from `messages.ts`).

4. **Given** the enhanced empty state is visible, **then** a primary CTA "Create your first voyage" opens the `CreateVoyageDialog` (reuse existing dialog).

5. **Given** the enhanced empty state is visible, **then** a secondary link "See an example" links to the showcase public voyage (`/Seb/goteborg-to-nice`).

6. **Given** the dashboard with voyages, **then** the enhanced empty state is NOT shown (existing behavior preserved — only shown when `voyageList.length === 0`).

## Tasks / Subtasks

- [x] Task 1: Create `EnhancedEmptyState` client component (AC: #1, #2, #3, #4, #5)
  - [x] 1.1 Create `src/components/dashboard/EnhancedEmptyState.tsx` as a `"use client"` component
  - [x] 1.2 Add animated mini-map using dynamic import of a `DemoMapAnimation` inner component (same Loader pattern as `HeroMapDemo.tsx`)
  - [x] 1.3 Create `src/components/dashboard/DemoMapAnimation.tsx` — reuse `DEMO_ROUTE` data and animation logic from `HeroMapDemoMap.tsx` but with smaller dimensions (aspect 4/3, max-w-sm)
  - [x] 1.4 Render headline, 3-step guide, primary CTA button, and secondary "See an example" link
  - [x] 1.5 Accept `messages` and `createVoyageTrigger` as props (no direct import of messages or CreateVoyageDialog — parent provides them)

- [x] Task 2: Update dashboard messages (AC: #2, #3, #5)
  - [x] 2.1 Expand `emptyState` section in `src/app/dashboard/messages.ts` with new keys: `headline`, `step1`, `step2`, `step3`, `seeExample`
  - [x] 2.2 Keep existing `title`, `description`, `cta` keys for backwards compatibility (they are used by the CTA button label)

- [x] Task 3: Integrate into dashboard page (AC: #1, #6)
  - [x] 3.1 In `src/app/dashboard/page.tsx`, replace the simple `<EmptyState>` block with `<EnhancedEmptyState>` when `!hasVoyages`
  - [x] 3.2 Pass messages and `CreateVoyageDialog` trigger as props
  - [x] 3.3 Keep the `<EmptyState>` import removed from dashboard (or keep it if used elsewhere — check first)

- [x] Task 4: Write unit tests (AC: all)
  - [x] 4.1 Create `src/components/dashboard/EnhancedEmptyState.test.tsx`
  - [x] 4.2 Test: renders headline text
  - [x] 4.3 Test: renders all 3 steps
  - [x] 4.4 Test: renders CTA button
  - [x] 4.5 Test: renders "See an example" link with correct href `/Seb/goteborg-to-nice`
  - [x] 4.6 Test: renders map demo placeholder (mock dynamic import)

- [x] Task 5: Verify no regressions
  - [x] 5.1 Run full test suite — all existing tests must pass
  - [x] 5.2 Verify dashboard with voyages still renders `VoyageCard` grid (no change)
  - [x] 5.3 TypeScript strict mode passes

## Dev Notes

### Critical: What NOT to Build

**DO NOT create a second copy of the route data.** The `DEMO_ROUTE` array in `HeroMapDemoMap.tsx` is 60 points of real sailing data (Helsingør → Kiel). Extract it to a shared constant file (`src/lib/geo/demo-route.ts`) and import from both `HeroMapDemoMap.tsx` and `DemoMapAnimation.tsx`. This avoids data duplication and ensures both animations stay in sync.

**DO NOT make this a Server Component.** The animated map requires Leaflet (client-only). The `EnhancedEmptyState` must be `"use client"` with dynamic import for the map portion.

**DO NOT modify the existing `EmptyState` component** in `src/components/shared/EmptyState.tsx`. It's a generic reusable component used in other places. Create a new, purpose-built component instead.

**DO NOT add i18n / multi-language support.** Dashboard messages are English-only (same as all authenticated pages). Multi-language is only on the landing page (`landing-messages.ts`).

**DO NOT add a second Leaflet map on top of the landing page.** This component only renders on the dashboard, which is a separate page from the landing.

### Architecture: Component Placement

Place the new component in `src/components/dashboard/` (new directory), NOT in `src/components/shared/`. This is dashboard-specific UI, not a generic empty state. The existing `EmptyState` in `shared/` remains untouched.

```
src/components/dashboard/
├── EnhancedEmptyState.tsx       # NEW — orchestrator with layout, steps, CTAs
├── EnhancedEmptyState.test.tsx  # NEW — unit tests
├── DemoMapAnimation.tsx         # NEW — Leaflet map with animated route (client-only)
```

### Implementation Pattern: Reuse from Story 8.1

The animated route mini-map follows the **exact same pattern** as the landing page hero map:

1. **Loader wrapper** (`EnhancedEmptyState.tsx` uses `dynamic(() => import("./DemoMapAnimation"), { ssr: false })`)
2. **Inner map component** (`DemoMapAnimation.tsx`) — Leaflet `MapContainer` with `Polyline` animation
3. **Skeleton placeholder** — `animate-pulse bg-navy/10` div matching map dimensions

Key differences from `HeroMapDemoMap`:
- **Smaller size:** `max-w-sm` with `aspect-[4/3]` (dashboard context, not full-width hero)
- **Same route data:** Import from shared `src/lib/geo/demo-route.ts`
- **Same animation:** `setInterval` at 120ms, `INITIAL_POINTS = 2`, coral polyline
- **Same disabled interactions:** `zoomControl={false}`, `dragging={false}`, etc.

### Shared Route Data Extraction

Create `src/lib/geo/demo-route.ts`:
```typescript
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";

/** Real sailing track: Helsingør → Kiel (legs 6-12 from Seb's voyage) */
export const DEMO_ROUTE: LatLngExpression[] = [
  // ... move the 60 coordinates from HeroMapDemoMap.tsx here
];

export const DEMO_ROUTE_BOUNDS: LatLngBoundsExpression = [
  [54.3, 10.1],
  [56.1, 12.75],
];
```

Then update `HeroMapDemoMap.tsx` to import from this shared file instead of defining inline.

### EnhancedEmptyState Layout

```
┌─────────────────────────────────────────┐
│                                         │
│        ┌──────────────────┐             │
│        │  Animated Map    │             │
│        │  (DemoMapAnimation)            │
│        │  max-w-sm, 4/3   │             │
│        └──────────────────┘             │
│                                         │
│     "Your first voyage awaits"          │
│        (font-heading text-h1)           │
│                                         │
│  ┌─ 1. Export from Navionics ─┐         │
│  ├─ 2. Share to Bosco ────────┤         │
│  └─ 3. Your voyage appears ──┘         │
│   (text-body, numbered, text-slate)     │
│                                         │
│   [ Create your first voyage ]          │
│   (coral button, opens CreateVoyageDialog)
│                                         │
│     See an example →                    │
│   (text-ocean link to /Seb/goteborg-to-nice)
│                                         │
└─────────────────────────────────────────┘
```

All content centered (`text-center`, `flex flex-col items-center`).

### Component Props

```typescript
interface EnhancedEmptyStateProps {
  messages: {
    headline: string;
    step1: string;
    step2: string;
    step3: string;
    cta: string;
    seeExample: string;
  };
  createVoyageTrigger: ReactNode;  // Pre-built CreateVoyageDialog trigger
  showcaseUrl: string;             // "/Seb/goteborg-to-nice"
}
```

The dashboard page assembles the props:
```typescript
<EnhancedEmptyState
  messages={messages.emptyState}
  createVoyageTrigger={
    <CreateVoyageDialog trigger={
      <Button className="min-h-[44px] bg-coral px-8 text-white hover:bg-coral/90">
        {messages.emptyState.cta}
      </Button>
    } />
  }
  showcaseUrl="/Seb/goteborg-to-nice"
/>
```

### Messages Update

Expand `src/app/dashboard/messages.ts` emptyState section:
```typescript
emptyState: {
  title: "Create your first voyage",           // keep for backwards compat
  description: "Start documenting your sailing journey...",  // keep
  cta: "Create your first voyage",             // keep — used by CTA button
  headline: "Your first voyage awaits",        // NEW
  step1: "Export your track from Navionics",   // NEW
  step2: "Share the GPX file to Bosco",        // NEW
  step3: "Your voyage appears on the map",     // NEW
  seeExample: "See an example",                // NEW
},
```

### Design Tokens

```
Colors: bg-navy/10 (map skeleton), text-navy (headline), text-slate (steps), bg-coral (CTA), text-ocean (link)
Typography: font-heading text-h1 (headline), text-body (steps), text-body font-semibold (link)
Radius: radius-card (map container)
Shadow: shadow-card (map container)
Spacing: mt-6 between sections, gap-3 between steps
Min touch: min-h-[44px] on CTA button
```

### Testing Strategy

Mock the dynamic Leaflet import:
```typescript
vi.mock("next/dynamic", () => ({
  default: () => {
    const MockMap = () => <div data-testid="demo-map-animation" />;
    MockMap.displayName = "MockMap";
    return MockMap;
  },
}));
```

Test all visible text and links — no need to test actual Leaflet rendering (that's an integration concern).

### Dashboard Page Integration

The dashboard page (`src/app/dashboard/page.tsx`) is a **Server Component**. The `EnhancedEmptyState` is a client component. This is fine — Server Components can render client components as children. The dynamic import boundary is inside `EnhancedEmptyState`, not at the page level.

**Current empty state block to replace** (lines 82-114 of `page.tsx`):
```tsx
// BEFORE:
<div className="mt-8">
  <EmptyState
    icon={<svg>...</svg>}
    title={messages.emptyState.title}
    description={messages.emptyState.description}
    action={<CreateVoyageDialog trigger={...} />}
  />
</div>

// AFTER:
<div className="mt-8">
  <EnhancedEmptyState
    messages={messages.emptyState}
    createVoyageTrigger={<CreateVoyageDialog trigger={...} />}
    showcaseUrl="/Seb/goteborg-to-nice"
  />
</div>
```

### Existing Components to REUSE

| Component | Location | Usage |
|-----------|----------|-------|
| `CreateVoyageDialog` | `src/app/dashboard/CreateVoyageDialog.tsx` | Pass as trigger prop — no changes needed |
| `HeroMapDemoMap` animation pattern | `src/components/landing/HeroMapDemoMap.tsx` | Copy animation logic, import shared route data |
| `HeroMapDemo` loader pattern | `src/components/landing/HeroMapDemo.tsx` | Same dynamic import + skeleton pattern |
| `Button` | `src/components/ui/button` | CTA button styling |

### Components to CREATE

| Component | Location | Purpose |
|-----------|----------|---------|
| `EnhancedEmptyState` | `src/components/dashboard/EnhancedEmptyState.tsx` | Layout: map + headline + steps + CTAs |
| `DemoMapAnimation` | `src/components/dashboard/DemoMapAnimation.tsx` | Leaflet animated route mini-map |
| `DEMO_ROUTE` constant | `src/lib/geo/demo-route.ts` | Shared route data (extract from HeroMapDemoMap) |

### Components to MODIFY

| Component | Location | Change |
|-----------|----------|--------|
| Dashboard page | `src/app/dashboard/page.tsx` | Replace `EmptyState` with `EnhancedEmptyState` |
| Dashboard messages | `src/app/dashboard/messages.ts` | Add `headline`, `step1-3`, `seeExample` keys |
| HeroMapDemoMap | `src/components/landing/HeroMapDemoMap.tsx` | Import `DEMO_ROUTE` from shared file instead of inline |

### Anti-Patterns to Avoid

- **DO NOT** duplicate the 60-point route array — extract to shared module
- **DO NOT** fetch from Supabase for demo data — all hard-coded
- **DO NOT** use `any` type — type route as `LatLngExpression[]`
- **DO NOT** inline string literals — all text from `messages.ts`
- **DO NOT** break the existing `EmptyState` component (other pages may use it)
- **DO NOT** create a Leaflet map that auto-loads on page mount — use dynamic import with `ssr: false`
- **DO NOT** add the map demo to the dashboard's Server Component directly — it must be inside a client component boundary
- **DO NOT** import `@supabase/*` or `src/lib/data/` in the new components — they are pure presentation

### Previous Story Intelligence (Story 8.1)

Key learnings from Story 8.1 (Landing Page Redesign):
- **HeroMapDemo two-file pattern works well:** Loader wrapper (`HeroMapDemo.tsx`) + inner map (`HeroMapDemoMap.tsx`). Same pattern for `EnhancedEmptyState` + `DemoMapAnimation`.
- **Animation constants:** `ANIMATION_INTERVAL = 120ms`, `INITIAL_POINTS = 2` — reuse the same values for visual consistency.
- **OpenSeaMap overlay:** Both tile layers (`OSM_URL` + `OPENSEAMAP_URL`) are used. Reuse in dashboard demo.
- **Skeleton placeholder:** `animate-pulse bg-navy/10` with matching aspect ratio. Consistent loading pattern.
- **Showcase voyage URL:** Verified as `/Seb/goteborg-to-nice` (note capital S in "Seb").
- **Test count:** 385 tests at time of 8.1 completion. Maintain zero regressions.
- **No existing dashboard page test file** — tests for dashboard are in `actions.test.ts` and `profile/` only. The empty state test is new.

### Git Intelligence

Recent commits are all Story 7.6 work. Story 8.1 work is in uncommitted changes. The dashboard page structure is stable since Epic 1. The `EmptyState` component has not changed since creation.

### Performance Notes

- The dashboard is behind authentication — no SEO/FMP concerns
- Leaflet loading is acceptable since the user is already in the app
- Dynamic import with skeleton ensures no layout shift
- Only one Leaflet instance on the page (the mini demo map)

### Project Structure Notes

```
src/lib/geo/
├── demo-route.ts                        # NEW — shared route data constant

src/components/dashboard/
├── EnhancedEmptyState.tsx               # NEW — enhanced empty state layout
├── EnhancedEmptyState.test.tsx          # NEW — unit tests
├── DemoMapAnimation.tsx                 # NEW — animated Leaflet mini-map

src/components/landing/
├── HeroMapDemoMap.tsx                   # MODIFY — import route from shared file

src/app/dashboard/
├── page.tsx                             # MODIFY — use EnhancedEmptyState
├── messages.ts                          # MODIFY — add new empty state keys
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.3]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-52, UJ-1 empty state requirement]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR17 Enhanced EmptyState]
- [Source: _bmad-output/planning-artifacts/architecture.md — EmptyState.tsx location, dashboard FR mapping]
- [Source: src/components/shared/EmptyState.tsx — Current generic empty state]
- [Source: src/app/dashboard/page.tsx — Current dashboard with simple empty state]
- [Source: src/app/dashboard/messages.ts — Current message structure]
- [Source: src/components/landing/HeroMapDemoMap.tsx — Route data + animation pattern to reuse]
- [Source: src/components/landing/HeroMapDemo.tsx — Dynamic import loader pattern]
- [Source: _bmad-output/implementation-artifacts/8-1-landing-page-redesign.md — Story 8.1 learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation, no blockers.

### Completion Notes List

- Extracted `DEMO_ROUTE` and `DEMO_ROUTE_BOUNDS` from `HeroMapDemoMap.tsx` into shared `src/lib/geo/demo-route.ts` to avoid data duplication (60-point sailing track).
- Updated `HeroMapDemoMap.tsx` to import from shared file — no behavioral change.
- Created `DemoMapAnimation.tsx` following same Leaflet animation pattern (120ms interval, coral polyline, disabled interactions) but with smaller `max-w-sm` + `aspect-[4/3]` dimensions.
- Created `EnhancedEmptyState.tsx` as `"use client"` component with dynamic import for map, headline, 3-step guide, CTA trigger slot, and showcase link.
- Added 5 new message keys to `emptyState` section in `messages.ts` while preserving existing keys.
- Replaced `EmptyState` usage in `page.tsx` with `EnhancedEmptyState`. Confirmed `EmptyState` is still used in `VoyageContent.tsx` — no orphan.
- 5 unit tests (headline, steps, CTA, link href, map placeholder) — all pass.
- Full test suite: 390 tests pass (385 existing + 5 new), zero regressions.
- TypeScript strict mode passes.

### File List

- `src/lib/geo/demo-route.ts` — NEW (shared route data constant)
- `src/components/dashboard/EnhancedEmptyState.tsx` — NEW (enhanced empty state layout)
- `src/components/dashboard/DemoMapAnimation.tsx` — NEW (animated Leaflet mini-map)
- `src/components/dashboard/EnhancedEmptyState.test.tsx` — NEW (unit tests)
- `src/components/landing/HeroMapDemoMap.tsx` — MODIFIED (import route from shared file)
- `src/app/dashboard/page.tsx` — MODIFIED (use EnhancedEmptyState instead of EmptyState)
- `src/app/dashboard/messages.ts` — MODIFIED (added headline, step1-3, seeExample keys)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (status tracking)

### Change Log

- 2026-03-31: Story 8.3 implemented — Enhanced empty state with animated demo voyage map, 3-step onboarding guide, and showcase link.
