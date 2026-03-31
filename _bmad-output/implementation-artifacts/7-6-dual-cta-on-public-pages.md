# Story 7.6: Dual CTA on Public Pages

Status: done

## Story

As a visiting sailor,
I want to see a call-to-action to create my own voyage on Bosco,
so that I can start using the product after being impressed by someone else's voyage.

## Acceptance Criteria

1. **Given** a visitor on a public voyage page, **when** 10 seconds have elapsed since page load, **then** a translucent bottom bar slides up with two CTAs.

2. **Given** the DualCTA bar is visible, **then** the left CTA reads "Sail too? Create your own voyage" and links to the sign-up page (`/auth/login`).

3. **Given** the DualCTA bar is visible, **then** the right CTA is a share icon button that triggers the share flow (reuses `ShareButton` from Story 7.5).

4. **Given** the DualCTA bar is visible, **then** it includes a dismiss button (X) in the top-right corner.

5. **Given** a visitor dismisses the bar, **then** it stays dismissed for the remainder of the browser session (via `sessionStorage`).

6. **Given** the DualCTA bar, **then** it uses glass morphism matching the existing StatsBar style (`bg-navy/75 backdrop-blur-[12px] shadow-overlay`).

7. **Given** the DualCTA bar on mobile, **then** it is fixed at the bottom of the viewport with a slide-up animation (CSS `translate-y` transition).

8. **Given** all CTA-related UI strings, **then** they are externalized in `src/app/[username]/[slug]/messages.ts`.

## Tasks / Subtasks

- [x] Task 1: Create `DualCTA` component (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] 1.1 Create `src/components/voyage/DualCTA.tsx` as a `"use client"` component
  - [x] 1.2 Props: `publicUrl: string`, `voyageName: string`, `username: string`, `messages: DualCTAMessages`
  - [x] 1.3 Implement 10-second delay with `useState` + `useEffect` + `setTimeout`
  - [x] 1.4 On mount, check `sessionStorage.getItem("bosco-cta-dismissed")` — if `"true"`, stay hidden
  - [x] 1.5 Left CTA: `<Link href="/auth/login">` with text from messages, styled as coral pill button
  - [x] 1.6 Right CTA: render `<ShareButton>` component (reuse from Story 7.5)
  - [x] 1.7 Dismiss button (X): sets `sessionStorage.setItem("bosco-cta-dismissed", "true")` and hides bar
  - [x] 1.8 Slide-up animation: `translate-y-full → translate-y-0` with `transition-transform duration-500 ease-out`
  - [x] 1.9 Glass morphism: `bg-navy/75 backdrop-blur-[12px] shadow-overlay rounded-t-2xl`
  - [x] 1.10 Layout: `fixed inset-x-0 bottom-0` with z-index between StatsBar and overlays (`z-[420]`)
  - [x] 1.11 Add `role="complementary"` and `aria-label` for accessibility

- [x] Task 2: Write unit tests for `DualCTA` (AC: #1, #4, #5, #6, #7)
  - [x] 2.1 Create `src/components/voyage/DualCTA.test.tsx`
  - [x] 2.2 Test: bar is not visible initially (before 10s timer)
  - [x] 2.3 Test: bar becomes visible after timer fires (use `vi.useFakeTimers`)
  - [x] 2.4 Test: renders create CTA with correct href `/auth/login`
  - [x] 2.5 Test: renders share button with correct props
  - [x] 2.6 Test: dismiss button hides the bar and sets sessionStorage
  - [x] 2.7 Test: bar stays hidden when sessionStorage has dismiss flag on mount
  - [x] 2.8 Test: correct aria-label and role attributes

- [x] Task 3: Integrate DualCTA into PublicVoyageContent (AC: #1, #8)
  - [x] 3.1 Add DualCTA messages to `src/app/[username]/[slug]/messages.ts`
  - [x] 3.2 Import `DualCTA` in `PublicVoyageContent.tsx`
  - [x] 3.3 Place DualCTA at the end of the JSX tree (after PhotoLightbox), passing `publicUrl`, `voyageName`, `username`
  - [x] 3.4 DualCTA should NOT render for authenticated voyage owners (only for visitors)

- [x] Task 4: Verify no regressions (AC: all)
  - [x] 4.1 Run full test suite (`npm run test`) — all existing tests must pass
  - [x] 4.2 Run TypeScript check (`npx tsc --noEmit`) — no type errors

## Dev Notes

### Critical Context: Existing Code to REUSE

**ShareButton already exists** at `src/components/voyage/ShareButton.tsx` (Story 7.5). Import and reuse it for the right CTA — do NOT recreate share logic. Props:
```typescript
interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  messages: ShareButtonMessages;
  ogImageUrl?: string;
  className?: string;
}
```

**Glass morphism pattern is established** across multiple public page components:
- `bg-navy/75 backdrop-blur-[12px] shadow-overlay` — used in Header, StatsBar, ShareButton, BoatBadge
- Shadow defined in `src/app/globals.css`: `--shadow-overlay: 0 2px 12px rgba(27, 45, 79, 0.15)`

**Messages pattern** in `src/app/[username]/[slug]/messages.ts` — add a `dualCTA` section following the existing `share`, `stats`, `journal` pattern.

**Link component** — use `next/link` for the create CTA to `/auth/login` (standard internal navigation).

### Z-Index Hierarchy (DO NOT BREAK)

```
z-[600]  ← PhotoLightbox
z-[500]  ← StopoverSheet, Journal Panel, Journal Toggle
z-[450]  ← Mobile PortsPanel
z-[420]  ← DualCTA bar ← NEW (between StatsBar and PortsPanel)
z-[400]  ← StatsBar, ActionFAB
z-[350]  ← Header
```

The DualCTA sits at `z-[420]` so it:
- Appears above the StatsBar (users see both)
- Stays below the mobile PortsPanel, StopoverSheet, and Journal panel (doesn't block interactions)
- Stays below PhotoLightbox (doesn't appear over full-screen viewer)

### Layout: Bottom Bar Positioning

The DualCTA bar is `fixed inset-x-0 bottom-0` — it sits at the very bottom of the viewport. The existing StatsBar is at `absolute bottom-8 left-1/2 -translate-x-1/2` (centered, 32px from bottom).

To avoid visual overlap:
- DualCTA has inner padding (`py-4 px-4 pb-safe`) to accommodate safe area on iOS
- `pb-safe` uses `env(safe-area-inset-bottom)` or add `pb-[env(safe-area-inset-bottom,1rem)]`
- The StatsBar stays at bottom-8; the DualCTA fills the space below it

### Slide-Up Animation

```tsx
<div
  className={`fixed inset-x-0 bottom-0 z-[420] transition-transform duration-500 ease-out ${
    visible ? "translate-y-0" : "translate-y-full"
  }`}
>
  {/* bar content */}
</div>
```

Always render the DOM element (for animation). Control visibility with `translate-y-full` (off-screen) vs `translate-y-0` (visible). The `transition-transform` handles the slide-up effect.

### Timer + SessionStorage Logic

```tsx
const [visible, setVisible] = useState(false);
const [dismissed, setDismissed] = useState(false);

useEffect(() => {
  // Check sessionStorage on mount
  if (sessionStorage.getItem("bosco-cta-dismissed") === "true") {
    setDismissed(true);
    return;
  }
  const timer = setTimeout(() => setVisible(true), 10_000);
  return () => clearTimeout(timer);
}, []);

function handleDismiss() {
  setVisible(false);
  setDismissed(true);
  sessionStorage.setItem("bosco-cta-dismissed", "true");
}
```

Guard `sessionStorage` access — it's available in client components (`"use client"` directive), but wrap in try/catch for private browsing or storage-full edge cases.

### CTA Design

**Left CTA (Create):**
- Text from messages: "Sail too? Create your own voyage" (or split into two lines for mobile)
- Styled as coral pill: `bg-coral text-white rounded-full px-6 py-3 font-sans font-semibold text-sm`
- Links to `/auth/login` via `<Link>`

**Right CTA (Share):**
- Reuse `<ShareButton>` directly — pass the same props as in the header
- Reduce size slightly or match the left CTA height

**Dismiss (X):**
- Positioned `absolute top-2 right-2` (or top-right of the bar)
- `text-white/60 hover:text-white` for subtle appearance
- 24px touch target minimum, use `<button>` with `aria-label` from messages

### Bar Layout

```
┌─────────────────────────────────────────────┐
│  [X]                                        │  ← dismiss button (top-right)
│                                             │
│  ⛵ Sail too? Create your own voyage  [↗]  │  ← left CTA (coral) + right share icon
│                                             │
└─────────────────────────────────────────────┘
```

Use flexbox: `flex items-center justify-between gap-3` with the text+button on left and ShareButton on right.

### Destination: /auth/login (NOT app store)

Capacitor/app stores are NOT integrated yet (Epic 6A is in backlog). The "create" CTA links to `/auth/login` (magic link sign-up page). When Epic 6A ships, this link can be updated to smart routing (app store on mobile, sign-up on web).

### i18n String Externalization

Add to `src/app/[username]/[slug]/messages.ts`:
```typescript
dualCTA: {
  headline: "Sail too? Create your own voyage",
  createLabel: "Get started",
  dismissLabel: "Dismiss",
  ariaLabel: "Create your own voyage on Bosco",
},
```

The share messages already exist in the same file — reuse them for the ShareButton.

### Architecture Compliance

- **Component location:** `src/components/voyage/DualCTA.tsx` — correct per architecture doc (`DualCTA.tsx` is planned)
- **Tier compliance:** Pure client-side UI, no Supabase or Server Actions needed
- **Naming:** `DualCTA.tsx` PascalCase — correct
- **No new dependencies:** Uses `next/link`, `sessionStorage`, existing `ShareButton`, existing Tailwind classes
- **SSR safety:** `"use client"` directive, `sessionStorage` access in `useEffect` only (not during render)

### Anti-Patterns to Avoid

- **DO NOT** recreate share logic — reuse `ShareButton` from Story 7.5
- **DO NOT** use `localStorage` — use `sessionStorage` (dismiss resets per session as specified)
- **DO NOT** use `window` or `sessionStorage` during SSR/render — only in `useEffect`/event handlers
- **DO NOT** link to app stores — Capacitor not integrated yet, link to `/auth/login`
- **DO NOT** use `any` type for timer refs — use `ReturnType<typeof setTimeout>` or `NodeJS.Timeout`
- **DO NOT** add z-index higher than 450 — must stay below PortsPanel/overlays
- **DO NOT** inline string literals — use messages object

### Testing: Vitest Patterns for Timers and SessionStorage

```typescript
// Timer testing
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

// Advance timer to trigger visibility
vi.advanceTimersByTime(10_000);

// SessionStorage mock
const mockStorage: Record<string, string> = {};
vi.stubGlobal("sessionStorage", {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
});
```

### Previous Story Intelligence (Story 7.5)

- ShareButton created at `src/components/voyage/ShareButton.tsx` with Web Share API + clipboard fallback
- Glass morphism style: `bg-navy/80 backdrop-blur-[12px]` for the button
- Uses `DOMException` check for AbortError (not `instanceof Error`)
- All 378 tests passing — zero regressions expected
- ShareButton is already integrated in PublicVoyageContent header — the DualCTA just adds another instance at the bottom

### Project Structure Notes

```
src/components/voyage/
├── DualCTA.tsx              # NEW — Conversion bar with create + share CTAs
├── DualCTA.test.tsx         # NEW — Unit tests
├── ShareButton.tsx          # EXISTING — Reuse for right CTA
├── ShareButton.test.tsx     # EXISTING — No changes
├── ActionFAB.tsx            # EXISTING — No changes
├── StatsBar.tsx             # EXISTING — No changes
└── ...

src/app/[username]/[slug]/
├── PublicVoyageContent.tsx   # MODIFY — add DualCTA import and render
├── messages.ts              # MODIFY — add dualCTA message keys
└── ...
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.6]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-44]
- [Source: _bmad-output/planning-artifacts/architecture.md — DualCTA.tsx component, FR-44]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DualCTA component spec, Public Voyage Page v1.0 Enhancements]
- [Source: src/components/voyage/ShareButton.tsx — Reuse for right CTA]
- [Source: src/components/voyage/StatsBar.tsx — Glass morphism pattern reference]
- [Source: src/app/[username]/[slug]/PublicVoyageContent.tsx — Integration target]
- [Source: src/app/[username]/[slug]/messages.ts — i18n pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- All 378 tests pass, zero regressions
- TypeScript strict mode passes cleanly
- No new lint issues introduced

### Completion Notes List

**DualCTA — Created then removed by user decision:**
- Initially created `DualCTA` component with 10s delayed slide-up animation, session-persistent dismiss, glass morphism, coral "Get started" CTA + ShareButton reuse
- Full-width bottom bar was too invasive on both mobile and desktop (tested on production)
- Redesigned as compact floating card — still too invasive, overlapping with StatsBar on mobile
- **User decision: feature removed entirely** — the public page is already effective without a conversion bar; the ShareButton in the header is sufficient
- DualCTA component, tests, messages, and integration code all deleted
- Story file retained for potential future reactivation with a better UX approach

**Leaflet attribution minimized:**
- Removed "Leaflet |" prefix via `attributionControl={false}` + `<AttributionControl prefix={false} />`
- Hidden flag icon via CSS (`.leaflet-attribution-flag { display: none }`)
- Reduced font to 9px, semi-transparent background — much more discreet while respecting OSM license

**Route animation z-index bug fixed:**
- After route animation completed, blue polylines rendered ON TOP of orange stopover markers
- Root cause: static polylines added to `overlayPane` (z-index 400) after markers already existed in same pane — SVG render order put routes on top
- Fix: created custom `routePane` (z-index 350) for all route polylines (both static `RouteLayer` and animated `RouteAnimation`)
- Markers in `overlayPane` (400) now always render above routes regardless of timing

**Landing page redirect for authenticated users:**
- Users opening sailbosco.com while logged in now redirect to `/dashboard` instead of seeing the landing page
- Added `pathname === "/"` to existing auth redirect in middleware

### File List

- `src/components/voyage/DualCTA.tsx` — CREATED then DELETED (feature removed)
- `src/components/voyage/DualCTA.test.tsx` — CREATED then DELETED (feature removed)
- `src/app/[username]/[slug]/PublicVoyageContent.tsx` — MODIFIED: DualCTA added then removed (net: no change from pre-story)
- `src/app/[username]/[slug]/PublicVoyageContent.test.tsx` — MODIFIED: DualCTA tests added then removed (net: no change from pre-story)
- `src/app/[username]/[slug]/messages.ts` — MODIFIED: dualCTA messages added then removed (net: no change from pre-story)
- `src/app/globals.css` — MODIFIED: added minimal Leaflet attribution CSS
- `src/components/map/MapCanvas.tsx` — MODIFIED: custom `routePane` creation, attribution prefix removal
- `src/components/map/RouteLayer.tsx` — MODIFIED: polylines use `routePane`
- `src/components/map/RouteAnimation.tsx` — MODIFIED: animated polylines use `routePane`
- `src/middleware.ts` — MODIFIED: redirect `/` → `/dashboard` for authenticated users

### Change Log

- 2026-03-31: Story 7.6 — DualCTA component created (full-width bar, then compact card)
- 2026-03-31: DualCTA removed by user decision — too invasive on mobile and desktop, no satisfactory placement found
- 2026-03-31: Leaflet attribution minimized — prefix removed, flag hidden, 9px font, semi-transparent
- 2026-03-31: Route animation z-index fix — custom `routePane` (z-350) ensures routes always render below markers
- 2026-03-31: Middleware — authenticated users on `/` redirect to `/dashboard`
