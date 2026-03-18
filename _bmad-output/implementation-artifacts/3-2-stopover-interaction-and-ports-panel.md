# Story 3.2: Stopover Interaction & Ports Panel

Status: review

## Story

As a visitor,
I want to tap on stopovers to see port details and browse all ports by country,
So that I can explore where the sailor stopped along the journey.

## Acceptance Criteria

### AC-1: StopoverSheet on Marker Tap
**Given** a visitor on the public voyage page
**When** they tap a StopoverMarker on the map
**Then** the StopoverSheet slides up from the bottom with Sand (#FDF6EC) background
**And** it displays: drag handle, port name in DM Serif Display, country with flag emoji, arrival and departure dates, duration (e.g., "2 nights")
**And** a "Add a note" placeholder is shown in Coral accent (non-functional on public page)
**And** the sheet has `role="dialog"`, focus is trapped within it, and Escape dismisses it

### AC-2: StopoverSheet Dismissal
**Given** the StopoverSheet is open
**When** the visitor swipes down or taps outside the sheet
**Then** the sheet dismisses with a smooth animation (200ms ease-out)

### AC-3: ActionFAB and PortsPanel (Mobile)
**Given** the public voyage page on mobile (<1024px)
**When** the visitor taps the ActionFAB (48px Coral circle, bottom-right)
**Then** the PortsPanel slides in from the right
**And** the FAB icon transitions to an X (close)
**And** the panel lists all stopovers grouped by country with flag emojis
**And** tapping a port name centers the map on that stopover and opens its StopoverSheet
**And** the panel has `role="navigation"` and supports arrow key navigation between ports

### AC-4: PortsPanel Persistent Sidebar (Desktop)
**Given** the public page on desktop (≥1024px)
**When** the layout renders
**Then** the PortsPanel is displayed as a persistent sidebar on the left (280px width)
**And** the ActionFAB is hidden since the panel is always visible
**And** the StopoverSheet has a max-width of 400px

### AC-5: Overlay Management
**Given** the overlay management rule
**When** a visitor opens the PortsPanel while the StopoverSheet is open
**Then** the StopoverSheet dismisses before the PortsPanel opens
**And** only one overlay is visible at a time (except PortsPanel sidebar on desktop which is persistent)

### AC-6: Mobile PortsPanel Dismissal
**Given** the public page on mobile
**When** the PortsPanel is open
**Then** swiping left dismisses the panel

### AC-7: Keyboard Navigation
**Given** keyboard navigation on the public page
**When** the user tabs through interactive elements
**Then** all custom components have visible focus indicators (2px Ocean outline with 2px offset)
**And** StopoverSheet traps focus when open
**And** Escape closes the topmost overlay

## Tasks / Subtasks

- [x] Task 1: Country flag emoji utility (AC: #1, #3)
  - [x] Create `src/lib/utils/country-flag.ts` — `countryToFlag(countryName: string): string`
  - [x] Map ~50 common country names to ISO 3166-1 alpha-2 codes
  - [x] Convert code to regional indicator sequence (e.g., "FR" → 🇫🇷)
  - [x] Fallback: return empty string for unknown countries
  - [x] Unit test: `src/lib/utils/country-flag.test.ts`

- [x] Task 2: Modify StopoverMarker for tap callback (AC: #1)
  - [x] Add optional `onSelect` prop to `StopoverMarkerProps`
  - [x] When `readOnly && onSelect`: register `click` event handler, do NOT render Popup
  - [x] When `readOnly && !onSelect`: keep current Popup behavior (backward-compatible)
  - [x] aria-label on marker: "Stopover: {name}, {country}"

- [x] Task 3: StopoverSheet component (AC: #1, #2, #7)
  - [x] Create `src/components/voyage/StopoverSheet.tsx`
  - [x] Sand (#FDF6EC) background, slides up from bottom
  - [x] Content: drag handle, port name (DM Serif Display), country + flag, arrival/departure dates, duration, "Add a note" placeholder
  - [x] Duration calculation: departed_at - arrived_at → "X nights" (≥1 day) or "X hours" (<1 day), "—" if no departed_at
  - [x] `role="dialog"`, `aria-modal="true"`, focus trap, Escape to dismiss
  - [x] Dismiss: swipe down (touch), tap outside, Escape key
  - [x] Animation: 200ms ease-out slide
  - [x] Max-width 400px on desktop (≥1024px)

- [x] Task 4: ActionFAB component (AC: #3, #4)
  - [x] Create `src/components/voyage/ActionFAB.tsx`
  - [x] 48px Coral (#E8614D) circle, fixed bottom-right (bottom-20 right-4, above StatsBar)
  - [x] Icon: anchor/compass icon when closed, X when open
  - [x] `transition-transform duration-200` for icon morph
  - [x] `aria-label: "Open ports panel"` / `"Close ports panel"`
  - [x] Hidden on desktop ≥1024px (`hidden lg:hidden` — use `lg` breakpoint)
  - [x] Min touch target 48px

- [x] Task 5: PortsPanel component (AC: #3, #4, #6, #7)
  - [x] Create `src/components/voyage/PortsPanel.tsx`
  - [x] Reuse `StopoverList` internally for the grouped country list
  - [x] Add flag emojis to StopoverList country headers (add `countryToFlag` integration)
  - [x] `role="navigation"`, `aria-label="Ports of call"`
  - [x] Mobile (<1024px): slides from right, full-height overlay, swipe-left to dismiss, glass morphism bg
  - [x] Desktop (≥1024px): persistent left sidebar, 280px width, Sand (#FDF6EC) bg, always visible
  - [x] Port selection: call `onSelectStopover(stopover)` → parent centers map + opens StopoverSheet
  - [x] Arrow key navigation between port items
  - [x] Close button on mobile panel header

- [x] Task 6: Overlay state management in PublicVoyageContent (AC: #1, #3, #5)
  - [x] Add state: `selectedStopover`, `isPortsPanelOpen`, `activeOverlay` (union: `null | "sheet" | "panel"`)
  - [x] Wire StopoverMarker `onSelect` → set selectedStopover + open StopoverSheet
  - [x] Wire ActionFAB → toggle PortsPanel
  - [x] Wire PortsPanel port selection → center map + open StopoverSheet
  - [x] Overlay rule: opening one dismisses the other (except desktop persistent sidebar)
  - [x] Map centering: dispatch `"bosco:center-stopover"` custom event OR use `map.flyTo()` ref
  - [x] Import new components with dynamic import (`ssr: false`) if they use Leaflet, or standard import if pure React

- [x] Task 7: Update messages.ts (AC: all)
  - [x] Add StopoverSheet messages: port detail labels, "Add a note" placeholder, duration format
  - [x] Add PortsPanel messages: header, aria labels, empty state
  - [x] Add ActionFAB messages: open/close labels

- [x] Task 8: Update StopoverList with flag emojis (AC: #3, #4)
  - [x] Import `countryToFlag` in `StopoverList`
  - [x] Prepend flag emoji to country name in `<summary>` headers
  - [x] This improves both public and authenticated pages

- [x] Task 9: Tests and quality (AC: all)
  - [x] Unit test `countryToFlag` utility
  - [x] TypeScript strict clean: `npx tsc --noEmit`
  - [x] ESLint clean: `npm run lint` (pre-existing issues in page.tsx and actions.ts — no new issues)
  - [x] All existing tests pass: `npm run test` (205 tests, 34 files)
  - [x] Build succeeds: `npm run build`

## Dev Notes

### No Data Layer Changes Needed

All stopover data is already fetched by `getPublicVoyageBySlug` in the SSR page. The `StopoverData` interface already includes `arrived_at` and `departed_at` needed for the StopoverSheet. **Do NOT create new data functions or Server Actions** — this is a pure frontend story.

### StopoverMarker Modification — Minimal Change

Current `StopoverMarker` (`src/components/map/StopoverMarker.tsx`) in readOnly mode renders a Leaflet `<Popup>` with name/country. For story 3.2, tapping should open the StopoverSheet instead.

**Change:**
```typescript
// Add to StopoverMarkerProps:
onSelect?: () => void;

// In the component:
// When readOnly && onSelect: add click handler, skip Popup
<CircleMarker
  center={leafletPosition}
  pathOptions={MARKER_STYLE}
  eventHandlers={{
    click: onSelect ? () => onSelect() : undefined,
    mouseover: (e) => e.target.setRadius(8),
    mouseout: (e) => e.target.setRadius(7),
  }}
  bubblingMouseEvents={false}
>
  {/* Only render Popup when readOnly without onSelect, OR when not readOnly */}
  {!(readOnly && onSelect) && (
    <Popup>...</Popup>
  )}
</CircleMarker>
```

**Backward compatibility:** All existing readOnly markers without `onSelect` keep current popup behavior. Authenticated page markers are unaffected.

### StopoverSheet — Implementation Details

```
┌────────────────────────────────────────────┐
│          ─── (drag handle)                 │  Sand (#FDF6EC)
│                                            │
│  Audierne                                  │  DM Serif Display, 24px
│  🇫🇷 France                                │  Nunito 14px, text-mist
│                                            │
│  Arrived   15 Jul 2025                     │  Nunito 12px
│  Departed  17 Jul 2025                     │
│  Duration  2 nights                        │  Nunito 14px bold
│                                            │
│  ✏️ Add a note...                           │  Coral accent, italic, non-functional
│                                            │
└────────────────────────────────────────────┘
```

**Implementation approach:**
- CSS `transform: translateY()` with transition for slide animation
- Touch: track `touchstart`/`touchmove`/`touchend` on drag handle for swipe-down dismiss
- Click outside: overlay backdrop with `onClick` handler
- Focus trap: use a simple `useEffect` that constrains Tab cycling within sheet children
- Duration calculation: `(departed_at - arrived_at)` → if ≥ 86400000ms show as "X nights", else "X hours"
- If no `departed_at`: show only arrival date, no duration line
- "Add a note" is a static placeholder — do NOT make it interactive. It hints at future journaling (Epic 4)

**z-index:** `z-[500]` (above PortsPanel, StatsBar, BoatBadge)

### PortsPanel — Responsive Implementation

**Mobile (<1024px):**
```
Map (full screen) → FAB bottom-right → tap → panel slides from right
┌──────────────────┬─────────────────┐
│                  │  PORTS OF CALL  │
│      MAP         │  ────────────── │
│                  │  🇸🇪 Sweden (3) │
│                  │    Göteborg     │
│                  │    Lysekil      │
│                  │    Strömstad    │
│                  │  🇩🇰 Denmark (2)│
│                  │    Skagen       │
│                  │    ...          │
│         [FAB:X]  │                 │
│  [═══ Stats ═══] │                 │
└──────────────────┴─────────────────┘
```

**Desktop (≥1024px):**
```
┌─────────────────┬──────────────────────────────┐
│  PORTS OF CALL  │                              │
│  ────────────── │                              │
│  🇸🇪 Sweden (3) │           MAP                │
│    Göteborg     │                              │
│    Lysekil      │                              │
│    Strömstad    │         [Boat Badge]         │
│  🇩🇰 Denmark (2)│                              │
│    Skagen       │                              │
│    ...          │     [═══ Stats ═══]          │
│  (280px wide)   │                              │
└─────────────────┴──────────────────────────────┘
```

**Desktop layout change:** On desktop, PublicVoyageContent layout shifts from full-bleed to `flex` with PortsPanel (280px) + map (remaining). This means:
```tsx
// PublicVoyageContent layout for desktop:
<div className="relative flex h-dvh w-full">
  {/* Desktop persistent sidebar */}
  <div className="hidden lg:block w-[280px] shrink-0">
    <PortsPanel ... />
  </div>
  {/* Map fills remaining space */}
  <div className="relative flex-1">
    <MapLoader ... />
    {/* Overlays positioned relative to map area */}
  </div>
</div>
```

**Map centering on port selection:**
The existing codebase uses `window.dispatchEvent(new CustomEvent("bosco:center-stopover"))` in the authenticated StopoverMarkers. For the public page, use a similar approach:
```typescript
const handleSelectStopover = (stopover: StopoverData) => {
  setSelectedStopover(stopover);
  // Center map on selected stopover
  window.dispatchEvent(
    new CustomEvent("bosco:center-stopover", {
      detail: { lat: stopover.latitude, lng: stopover.longitude },
    })
  );
};
```

**IMPORTANT:** Check if `MapCanvas` already listens for `"bosco:center-stopover"`. If not, the listener is in `StopoverMarkers.tsx` (authenticated page). For the public page, add a listener in `PublicVoyageContent` or in a map child component that calls `useMap().flyTo()`.

### ActionFAB — Design Spec

- Position: `fixed bottom-20 right-4` (above StatsBar)
- Size: `w-12 h-12` (48px)
- Style: `bg-coral text-white rounded-full shadow-overlay`
- Icon: Use a simple SVG inline icon (anchor, compass, or list). Transition to X on open.
- Pressed state: `active:scale-95`
- Focus: `focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2`
- z-index: `z-[400]` (same as StatsBar/BoatBadge)
- Hidden on desktop: `lg:hidden`

### Country Flag Emoji Utility

```typescript
// src/lib/utils/country-flag.ts
const COUNTRY_CODES: Record<string, string> = {
  "Sweden": "SE", "Denmark": "DK", "Germany": "DE",
  "Netherlands": "NL", "Belgium": "BE", "France": "FR",
  "Spain": "ES", "Portugal": "PT", "Italy": "IT",
  "Greece": "GR", "Turkey": "TR", "Croatia": "HR",
  "Montenegro": "ME", "Albania": "AL", "Slovenia": "SI",
  "United Kingdom": "GB", "Norway": "NO", "Finland": "FI",
  "Poland": "PL", "Ireland": "IE", "Malta": "MT",
  "Cyprus": "CY", "Monaco": "MC", "Tunisia": "TN",
  "Morocco": "MA", "Algeria": "DZ", "Gibraltar": "GI",
  // Add more as needed
};

export function countryToFlag(countryName: string | null): string {
  if (!countryName) return "";
  const code = COUNTRY_CODES[countryName];
  if (!code) return "";
  return String.fromCodePoint(
    ...code.split("").map((c) => 0x1F1E6 + c.charCodeAt(0) - 65)
  );
}
```

**Note:** Nominatim returns English country names. The mapping covers Mediterranean + Northern European sailing routes. If the utility encounters an unmapped country, it returns an empty string (graceful degradation).

### Overlay State Machine

```
Idle (no overlay)
  → tap marker → StopoverSheet opens (selectedStopover set)
  → tap FAB → PortsPanel opens

StopoverSheet open
  → tap marker → sheet updates with new stopover
  → tap FAB → sheet closes, then panel opens
  → swipe down / Escape / tap outside → sheet closes → Idle

PortsPanel open (mobile)
  → tap port → panel stays open, map centers, sheet opens with port
  → tap FAB (X) → panel closes → Idle
  → swipe left / Escape → panel closes → Idle

Desktop: PortsPanel always visible (not part of overlay state)
  → tap port → map centers, sheet opens
  → sheet behavior same as mobile
```

### Swipe Gesture Detection

For StopoverSheet (swipe down) and PortsPanel (swipe left), use touch events:

```typescript
// Minimal swipe detection pattern
const touchStartY = useRef(0);
const handleTouchStart = (e: React.TouchEvent) => {
  touchStartY.current = e.touches[0].clientY;
};
const handleTouchEnd = (e: React.TouchEvent) => {
  const deltaY = e.changedTouches[0].clientY - touchStartY.current;
  if (deltaY > 80) onDismiss(); // swipe down threshold
};
```

Keep it simple — no gesture library needed. 80px threshold is sufficient.

### Focus Trap for StopoverSheet

Implement a lightweight focus trap without external libraries:

```typescript
useEffect(() => {
  if (!isOpen || !sheetRef.current) return;
  const sheet = sheetRef.current;
  const focusable = sheet.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  first?.focus();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") { onDismiss(); return; }
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first?.focus();
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [isOpen, onDismiss]);
```

### Existing Components to Reuse

| Component | Path | How to Reuse |
|-----------|------|--------------|
| `StopoverMarker` | `src/components/map/StopoverMarker.tsx` | ADD `onSelect` prop — existing readOnly popup behavior preserved when no onSelect |
| `StopoverList` | `src/components/voyage/StopoverList.tsx` | Used inside PortsPanel — add flag emoji to country headers |
| `MapLoader` | `src/components/map/MapLoader.tsx` | Already used — no changes |
| `StatsBar` | `src/components/voyage/StatsBar.tsx` | Already used — no changes |
| `BoatBadge` | `src/components/voyage/BoatBadge.tsx` | Already used — no changes |
| `countryToFlag` | `src/lib/utils/country-flag.ts` | NEW utility — used by StopoverSheet AND StopoverList |
| `formatDate` (in StopoverList) | inline helper | Reference for date formatting pattern |

### 3-Tier Containment Compliance

```
OK  src/components/voyage/StopoverSheet.tsx — Tier 4: pure display component
OK  src/components/voyage/PortsPanel.tsx — Tier 4: pure display component
OK  src/components/voyage/ActionFAB.tsx — Tier 4: pure display component
OK  src/lib/utils/country-flag.ts — Utility: no imports from any tier
OK  src/components/voyage/StopoverList.tsx — Tier 4: modified (additive, flag import)
OK  src/components/map/StopoverMarker.tsx — Tier 4: modified (additive, onSelect prop)
OK  src/app/[username]/[slug]/PublicVoyageContent.tsx — Tier 4: modified (state + wiring)
NEVER  create Server Actions for this story — public page is read-only
NEVER  import @supabase/* outside src/lib/supabase/
NEVER  add new data layer functions — all data already fetched
```

### Anti-Patterns — Do NOT

- **Do NOT create Server Actions** — public page is read-only, all data from SSR props
- **Do NOT create new data fetching functions** — `getPublicVoyageBySlug` already returns all needed data
- **Do NOT use a gesture library** (e.g., `react-use-gesture`) — simple touch event handling is sufficient
- **Do NOT use a focus trap library** — implement lightweight focus trap inline
- **Do NOT use Framer Motion** — CSS transitions + transform for all animations
- **Do NOT make "Add a note" interactive** — it's a static placeholder for Epic 4 journaling
- **Do NOT use `any` type** — use typed props and explicit interfaces
- **Do NOT inline string literals** — use co-located `messages.ts`
- **Do NOT place custom components in `src/components/ui/`** — shadcn/ui only
- **Do NOT store coordinates as `[lat, lng]`** — GeoJSON is `[lng, lat]`, convert only in map layer
- **Do NOT break existing StopoverMarker behavior** — the `onSelect` prop is additive, all existing usage must keep working unchanged
- **Do NOT modify the SSR page.tsx** — no changes needed to the server component

### Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| Sand | `#FDF6EC` | StopoverSheet bg, PortsPanel desktop bg |
| Navy | `#1B2D4F` | Text, glass morphism bg |
| Coral | `#E8614D` | ActionFAB bg, "Add a note" accent, stopover markers |
| Ocean | `#2563EB` | Focus outline, links |
| Mist | text-mist | Secondary text (country, dates) |
| Foam | bg-foam | Hover state on port list items |
| DM Serif Display | Heading font | Port name in StopoverSheet |
| Nunito | Body font | All other text |
| Glass morphism | `bg-navy/75 backdrop-blur-[12px]` | PortsPanel mobile bg |
| Shadow overlay | `0 2px 12px rgba(27,45,79,0.15)` | StopoverSheet, PortsPanel |
| Focus ring | `outline-2 outline-ocean outline-offset-2` | All interactive elements |

### Previous Story (3.1) Intelligence

Story 3.1 established:
- **192 tests passing** — do not break them
- **PublicVoyageContent** as the orchestrator for all public page UI — extend it, don't create a parallel component
- **`h-dvh`** for full-bleed map — maintain this
- **Dynamic imports** for map components (`ssr: false`) — follow same pattern for any component needing Leaflet
- **StopoverMarker `readOnly` prop** already exists — extend with `onSelect`, don't create a new marker component
- **`messages.ts`** co-located in `src/app/[username]/[slug]/` — extend with new component strings
- **Glass morphism pattern** established for StatsBar/BoatBadge — reuse for PortsPanel mobile overlay
- **Header overlay** at top center (z-[350]) — consider z-index stacking with new overlays
- **StatsBar** at bottom center (z-[400]) — ActionFAB must not overlap
- Stopovers already rendered as readOnly markers — switch to onSelect-driven interaction
- `countryToFlag` logic does NOT exist yet — create it
- Custom event `"bosco:center-stopover"` used in authenticated page (StopoverMarkers.tsx) — for public page, need to add listener in map context since the public page doesn't use the authenticated `StopoverMarkers` container

### Git Intelligence

Recent commits (Story 3.1 implementation):
```
3b30cf3 3.1 done
c20bff9 3.1 WIP
9f0afe6 3.1 WIP
```

Story 3.1 created 7 new files and modified 5. 192 tests pass. The public voyage page foundation is solid and ready for this story's overlay components.

### Scope Boundary

**IN SCOPE:**
- StopoverSheet bottom sheet (port details on marker tap)
- PortsPanel (browsable stopover list by country)
- ActionFAB (toggle for PortsPanel on mobile)
- Country flag emoji utility
- Overlay state management in PublicVoyageContent
- Responsive: persistent sidebar (desktop) vs sliding panel (mobile)
- Accessibility: focus trap, keyboard nav, aria roles, visible focus indicators
- Swipe gestures: dismiss sheet (down), dismiss panel (left)
- StopoverMarker `onSelect` modification
- StopoverList flag emoji enhancement
- Messages externalization for all new components
- Tests + quality checks

**OUT OF SCOPE — Do NOT create (deferred to later stories):**
- No OG image generation — Story 3.3
- No JSON-LD structured data — Story 3.3
- No public profile page — Story 3.3
- No interactive "Add a note" — Epic 4
- No log entry timeline on public page — Epic 4
- No share button or copy URL — Story 3.3
- No cluster markers at low zoom — future optimization
- No new data layer functions — all data available from SSR

### Project Structure Notes

```
src/
├── app/
│   └── [username]/
│       └── [slug]/
│           ├── page.tsx                    # NO CHANGES
│           ├── PublicVoyageContent.tsx      # MODIFY — add overlay state, wire new components
│           └── messages.ts                 # MODIFY — add new component strings
├── components/
│   ├── map/
│   │   └── StopoverMarker.tsx             # MODIFY — add onSelect prop
│   └── voyage/
│       ├── StopoverList.tsx               # MODIFY — add flag emojis to country headers
│       ├── StopoverSheet.tsx              # NEW — bottom sheet with port details
│       ├── PortsPanel.tsx                 # NEW — sliding/persistent panel with stopover list
│       └── ActionFAB.tsx                  # NEW — floating action button for PortsPanel toggle
├── lib/
│   └── utils/
│       ├── country-flag.ts                # NEW — country name to flag emoji
│       └── country-flag.test.ts           # NEW — unit tests
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2 acceptance criteria and BDD scenarios]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-7 (Public Voyage Page: stopovers list grouped by country, move map to selected stopover)]
- [Source: _bmad-output/planning-artifacts/architecture.md — SSR boundary, component architecture, 3-tier containment]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — StopoverSheet, PortsPanel, ActionFAB, overlay patterns, breakpoint strategy, Journey 3 visitor flow]
- [Source: src/components/map/StopoverMarker.tsx — existing readOnly mode with Popup, needs onSelect]
- [Source: src/components/voyage/StopoverList.tsx — groups by country, onSelect callback, needs flag emojis]
- [Source: src/app/[username]/[slug]/PublicVoyageContent.tsx — current orchestrator, needs overlay state]
- [Source: src/app/[username]/[slug]/messages.ts — existing message structure to extend]
- [Source: _bmad-output/implementation-artifacts/3-1-public-voyage-page-map-stats-and-route-animation.md — previous story learnings and established patterns]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions, GeoJSON coordinate order]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No debug issues encountered.

### Completion Notes List

- **Task 1:** Created `countryToFlag` utility with ~50 country mappings covering Mediterranean + Northern European sailing routes. 4 unit tests passing.
- **Task 2:** Added `onSelect` prop to `StopoverMarker`. When `readOnly && onSelect`, click triggers callback and Popup is suppressed. Backward-compatible — existing usage unchanged.
- **Task 3:** Created `StopoverSheet` with Sand bg, DM Serif Display heading, country flag, arrival/departure dates, duration calculation (nights/hours), "Add a note" placeholder. Focus trap, Escape dismiss, swipe-down dismiss, backdrop click dismiss. `role="dialog"` + `aria-modal`.
- **Task 4:** Created `ActionFAB` — 48px Coral circle, fixed bottom-right above StatsBar, icon morphs between list/X with 200ms transition. Hidden on desktop (lg:hidden).
- **Task 5:** Created `PortsPanel` — dual-mode: mobile glass morphism overlay sliding from right with swipe-left dismiss, desktop persistent 280px Sand sidebar. Reuses `StopoverList` for grouped country display. Arrow key navigation, Escape dismiss.
- **Task 6:** Wired overlay state machine in `PublicVoyageContent` — `activeOverlay` union type manages mutual exclusion between sheet and panel. Created `MapCenterListener` component to handle `bosco:center-stopover` custom event via `map.flyTo()`. Desktop layout changed to flex with persistent sidebar + map area.
- **Task 7:** Extended `messages.ts` with `stopoverSheet`, `portsPanel`, and `actionFab` message sections.
- **Task 8:** Added `countryToFlag` integration to `StopoverList` country headers — benefits both public and authenticated pages.
- **Task 9:** All 205 tests passing (34 files), TypeScript strict clean, build succeeds. Pre-existing lint issues in page.tsx and actions.ts unchanged.

### Change Log

- 2026-03-18: Story 3.2 implementation complete — StopoverSheet, PortsPanel, ActionFAB, overlay state management, country flags

### File List

**New files:**
- `src/lib/utils/country-flag.ts`
- `src/lib/utils/country-flag.test.ts`
- `src/components/voyage/StopoverSheet.tsx`
- `src/components/voyage/ActionFAB.tsx`
- `src/components/voyage/PortsPanel.tsx`
- `src/components/map/MapCenterListener.tsx`

**Modified files:**
- `src/components/map/StopoverMarker.tsx` — added `onSelect` prop
- `src/components/voyage/StopoverList.tsx` — generic type, flag emoji integration
- `src/app/[username]/[slug]/PublicVoyageContent.tsx` — overlay state management, new components, flex layout
- `src/app/[username]/[slug]/messages.ts` — new message sections
- `src/app/globals.css` — slide-up and slide-right animations
