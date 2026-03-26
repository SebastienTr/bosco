# Story 4.2: Journal Timeline Display

Status: review

## Story

As a sailor or visitor,
I want to see journal entries displayed as a timeline on the voyage page,
So that the narrative enriches the visual sailing journey.

## Acceptance Criteria

### AC-1: Authenticated Timeline Display
**Given** a voyage with log entries
**When** the sailor views the voyage page (authenticated)
**Then** log entries are displayed in a timeline ordered by entry date (newest first)
**And** each LogEntryCard shows: date, text content, photo thumbnails (tappable to view full size), and linked stopover/leg name if applicable

### AC-2: Public Timeline Display
**Given** a public voyage with log entries
**When** a visitor views the public voyage page
**Then** log entries are displayed in the same timeline format as the authenticated view
**And** the timeline is read-only (no edit/delete actions visible)

### AC-3: Empty State
**Given** a voyage with no log entries
**When** the voyage page is viewed (authenticated or public)
**Then** no timeline section is shown (no empty state for journal — it is optional and never pushed)

### AC-4: Photo Lightbox
**Given** log entry photos in the timeline
**When** a user taps a photo thumbnail
**Then** the photo opens in a larger view (lightbox overlay)
**And** the overlay management rule applies (max one overlay at a time)

### AC-5: SSR & SEO
**Given** a public voyage page with log entries
**When** the page is server-side rendered
**Then** log entry text content is included in the SSR HTML for SEO indexability
**And** photo thumbnails use `next/image` for optimized loading

## Tasks / Subtasks

- [x] Task 1: Fetch log entries on public page SSR (AC: #2, #3, #5)
  - [x] In `src/app/[username]/[slug]/page.tsx`, call `getLogEntriesByVoyageId(voyage.id)` after voyage fetch
  - [x] Pass `logEntries` to `PublicVoyageContent` component
  - [x] If no entries, pass empty array (component handles hiding)

- [x] Task 2: Public timeline in PublicVoyageContent (AC: #2, #3)
  - [x] Add `logEntries` prop to `PublicVoyageContent` (type: `LogEntry[]`)
  - [x] Import `LogEntryCard` from `src/components/log/LogEntryCard.tsx`
  - [x] Render timeline section below StatsBar / above overlays area when `logEntries.length > 0`
  - [x] Use `JournalTimeline` wrapper component (see Task 3)
  - [x] No "Add log entry" button on public page

- [x] Task 3: JournalTimeline read-only component (AC: #1, #2, #3, #4)
  - [x] Create `src/components/log/JournalTimeline.tsx`
  - [x] Props: `entries: LogEntry[]`, `stopovers`, `legs`, `onPhotoTap?: (url: string) => void`
  - [x] Renders LogEntryCard list ordered by entry_date descending (already sorted from data layer)
  - [x] Resolves stopover names and leg labels from passed data
  - [x] Shared between authenticated and public contexts (thin display wrapper)
  - [x] No form, no CRUD — pure display

- [x] Task 4: Photo lightbox component (AC: #4)
  - [x] Create `src/components/log/PhotoLightbox.tsx` — `"use client"`
  - [x] Props: `url: string | null`, `onClose: () => void`
  - [x] Renders full-viewport overlay with `next/image` (fill, object-contain)
  - [x] Dark backdrop (navy at 90% opacity), close button (X)
  - [x] Dismiss: tap backdrop, Escape key, close button
  - [x] Accessible: focus trap, aria-label, role="dialog"
  - [x] CSS transition for open/close (no Framer Motion)

- [x] Task 5: Wire photo tap in LogEntryCard (AC: #4)
  - [x] Add `onPhotoTap?: (url: string) => void` prop to LogEntryCard
  - [x] When `onPhotoTap` is provided, photo thumbnails become tappable (button with onClick)
  - [x] When `onPhotoTap` is not provided, thumbnails remain non-interactive (current behavior)

- [x] Task 6: Integrate lightbox in overlay system (AC: #4)
  - [x] In `PublicVoyageContent.tsx`, add `"lightbox"` to `ActiveOverlay` type
  - [x] Add `lightboxUrl` state
  - [x] When opening lightbox, dismiss other overlays (sheet, panel)
  - [x] Pass `onPhotoTap` callback through JournalTimeline → LogEntryCard
  - [x] Render `PhotoLightbox` when `activeOverlay === "lightbox"`
  - [x] In `VoyageContent.tsx` (authenticated), add same lightbox overlay integration

- [x] Task 7: Integrate JournalTimeline in authenticated VoyageContent (AC: #1)
  - [x] In `VoyageContent.tsx`, render `JournalTimeline` within the existing `JournalSection` (replace direct LogEntryCard mapping)
  - [x] Or keep JournalSection as-is and add lightbox support + photo tap through existing LogEntryCard mapping
  - [x] Ensure the CRUD functionality (add/edit/delete) in JournalSection is preserved

- [x] Task 8: Messages externalization (AC: #2)
  - [x] Add journal timeline messages to `src/app/[username]/[slug]/messages.ts`
  - [x] Keys: `journal.sectionLabel` (for ARIA), no visible header needed (timeline blends into page)

- [x] Task 9: Update JSON-LD structured data (AC: #5)
  - [x] In `src/app/[username]/[slug]/page.tsx`, extend the SportsEvent JSON-LD
  - [x] Add `subEvent` array with log entries as `Event` items (name = date, description = text excerpt)
  - [x] This makes journal content indexable as structured data

- [x] Task 10: Tests and quality (AC: all)
  - [x] TypeScript strict clean: `npx tsc --noEmit`
  - [x] ESLint clean: `npm run lint`
  - [x] All existing tests pass: `npm run test`
  - [x] Build succeeds: `npm run build`

## Dev Notes

### Data Layer — No Changes Needed

The existing `getLogEntriesByVoyageId(voyageId)` in `src/lib/data/log-entries.ts` works for public context because RLS already has a policy: "Anyone can read log entries of public voyages" (created in Story 4.1 migration `20260326100000_log_entries.sql`). The function uses `createClient()` from `@/lib/supabase/server` which creates a server-side client respecting RLS — anonymous visitors will only see entries belonging to public voyages.

**No new data layer function needed.** Just call the existing one from the public page.

### Public Page SSR Integration

In `src/app/[username]/[slug]/page.tsx` (server component), add the fetch alongside existing data:

```typescript
import { getLogEntriesByVoyageId } from "@/lib/data/log-entries";
// ... after voyage fetch
const { data: logEntries } = await getLogEntriesByVoyageId(voyage.id);
```

Pass to component:
```typescript
<PublicVoyageContent
  voyage={voyage}
  metrics={metrics}
  logEntries={logEntries ?? []}
/>
```

This is SSR — log entry text is in the initial HTML response (AC-5).

### JournalTimeline Component — Shared Display Wrapper

`src/components/log/JournalTimeline.tsx` is a thin display-only component:

```typescript
"use client";

interface JournalTimelineProps {
  entries: LogEntry[];
  stopovers: { id: string; name: string | null }[];
  legs: { id: string; sort_order: number }[];
  onPhotoTap?: (url: string) => void;
}
```

It maps entries to `LogEntryCard` components, resolving stopover names and leg labels. This component is reusable in both authenticated (inside JournalSection) and public (inside PublicVoyageContent) contexts.

**Positioning in public page:** The timeline should render as a scrollable side panel or inline section, not a floating overlay. On mobile, it could be accessed via a toggle (like PortsPanel). On desktop, it could sit alongside the map. Follow the same pattern as PortsPanel: persistent sidebar on desktop (lg:), toggleable overlay on mobile.

**Design decision needed:** The timeline panel should follow the PortsPanel pattern — desktop persistent sidebar, mobile overlay toggled by ActionFAB. Consider adding a "Journal" option to the ActionFAB alongside the ports toggle, or render the timeline differently. Simplest approach: render the timeline as a scrollable list within a toggleable panel, similar to how PortsPanel works.

### PhotoLightbox — Simple Overlay

`src/components/log/PhotoLightbox.tsx`:

```typescript
"use client";

interface PhotoLightboxProps {
  url: string | null;
  onClose: () => void;
}
```

- Full viewport overlay, fixed positioning, z-[600] (above all other overlays)
- Dark backdrop: `bg-[#1B2D4F]/90` (Navy at 90% opacity)
- Photo centered with `next/image` fill + object-contain
- Close button: top-right, white X icon
- Keyboard: Escape to close
- Click outside photo to close
- No swipe/gallery navigation (single photo view for MVP)
- CSS transition: `opacity` + `scale` for enter/exit

### LogEntryCard Enhancement

Current LogEntryCard (174 lines) displays photos as a thumbnail grid (48x48px). Currently thumbnails are plain `<div>` with `next/image` inside — no click handler.

Add `onPhotoTap` prop:
```typescript
interface LogEntryCardProps {
  entry: LogEntry;
  stopoverName?: string | null;
  legLabel?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onPhotoTap?: (url: string) => void;  // NEW
}
```

When `onPhotoTap` provided, wrap each thumbnail in a `<button>` with `onClick={() => onPhotoTap(url)}`. When not provided, keep current non-interactive `<div>`. Ensure 44x44px minimum touch target (already 48x48).

### Overlay System Integration

**PublicVoyageContent** currently has:
```typescript
type ActiveOverlay = null | "sheet" | "panel";
```

Update to:
```typescript
type ActiveOverlay = null | "sheet" | "panel" | "lightbox" | "journal";
```

Add states:
- `lightboxUrl: string | null` — URL of photo to display
- `journal` overlay for mobile journal panel toggle

Opening lightbox: set `activeOverlay = "lightbox"`, `lightboxUrl = url`, dismiss sheet/panel.
Opening journal: set `activeOverlay = "journal"`, dismiss sheet.

**VoyageContent** currently has:
```typescript
type ActiveOverlay = "stopovers" | "legs" | "journal" | null;
```

Update to include lightbox:
```typescript
type ActiveOverlay = "stopovers" | "legs" | "journal" | "lightbox" | null;
```

Add `lightboxUrl` state. Opening lightbox dismisses current overlay. Pass `onPhotoTap` through JournalSection.

### ActionFAB Enhancement (Public Page)

Current ActionFAB toggles the PortsPanel. With journal entries present, consider:
- **Option A:** Single FAB toggles PortsPanel only, journal is always visible as inline section below stats bar
- **Option B:** FAB becomes a speed dial with "Ports" and "Journal" options
- **Recommended (Option A):** Keep FAB simple. Journal timeline renders as a scrollable section below the stats bar on mobile (push-up from bottom) or as a persistent sidebar on desktop. This avoids overcomplicating the FAB and keeps the journal always accessible for visitors who came to read the story.

**Simplest implementation:** On public page, if log entries exist:
- Desktop (lg:+): Render journal as a persistent right sidebar (below/alongside PortsPanel)
- Mobile: Render journal as an inline scrollable section at the bottom of the viewport, above the stats bar, or as a collapsible panel

Given the "Immersive Minimal" design direction (map is king), the most fitting approach is:
- Journal timeline as a toggleable overlay panel (like PortsPanel)
- Add a second FAB or extend ActionFAB with a journal icon when entries exist
- Keep it minimal — don't clutter the public page

### Photo Display with next/image

LogEntryCard already uses `next/image` for thumbnails. The `remotePatterns` in `next.config.ts` already include Supabase Storage domains (configured in Story 3.3). No additional config needed.

In PhotoLightbox, use:
```typescript
<Image
  src={url}
  alt=""
  fill
  className="object-contain"
  sizes="100vw"
  priority
/>
```

### JSON-LD Update

Current SportsEvent schema in `page.tsx`. Extend with journal content:

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  // ... existing fields ...
  ...(logEntries && logEntries.length > 0 && {
    subEvent: logEntries.slice(0, 10).map(entry => ({
      "@type": "Event",
      name: `Journal entry — ${new Date(entry.entry_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
      description: entry.text.slice(0, 200),
      startDate: entry.entry_date,
    })),
  }),
};
```

Limit to 10 entries to keep JSON-LD payload reasonable.

### Existing Components to Reuse

| Component | Path | Reuse |
|-----------|------|-------|
| `LogEntryCard` | `src/components/log/LogEntryCard.tsx` | MODIFY — add `onPhotoTap` prop |
| `JournalSection` | `src/components/log/JournalSection.tsx` | Authenticated context — add lightbox support |
| `PublicVoyageContent` | `src/app/[username]/[slug]/PublicVoyageContent.tsx` | MODIFY — add log entries + journal overlay |
| `VoyageContent` | `src/components/voyage/VoyageContent.tsx` | MODIFY — add lightbox overlay |
| `ActionFAB` | `src/components/voyage/ActionFAB.tsx` | POTENTIALLY MODIFY — if adding journal toggle |
| `PortsPanel` | `src/components/voyage/PortsPanel.tsx` | Reference pattern for journal panel |
| `next/image` | `next/image` | Photo display (thumbnails + lightbox) |
| `AlertDialog` | `src/components/ui/alert-dialog.tsx` | Reference for overlay/dialog pattern |

### 3-Tier Containment Compliance

```
OK  src/app/[username]/[slug]/page.tsx — Server Component, calls Tier 2 data layer
OK  src/lib/data/log-entries.ts — Tier 2, already exists (no changes)
OK  src/components/log/JournalTimeline.tsx — Tier 4, display-only
OK  src/components/log/PhotoLightbox.tsx — Tier 4, display-only
NEVER  import @supabase/* outside src/lib/supabase/
NEVER  import src/lib/supabase/* in components
NEVER  call Supabase from components
```

### Anti-Patterns — Do NOT

- **Do NOT create a new data layer function** — `getLogEntriesByVoyageId` already works for public (RLS handles visibility)
- **Do NOT add a "No journal entries" empty state** — per UX spec, journal is optional and never pushed
- **Do NOT use Framer Motion** — CSS transitions only for lightbox
- **Do NOT add editing capabilities to public page** — strictly read-only
- **Do NOT show edit/delete buttons in public context** — omit `onEdit`/`onDelete` callbacks on LogEntryCard
- **Do NOT create a full-featured photo gallery** — single photo lightbox is sufficient for MVP
- **Do NOT add comments or social features** — out of MVP scope
- **Do NOT break the overlay management rule** — max one overlay at a time
- **Do NOT skip server-side rendering for log entry text** — text must be in SSR HTML for SEO (AC-5)
- **Do NOT load log entry photos eagerly** — use `next/image` with lazy loading for thumbnails

### Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| Sand | `#FDF6EC` | LogEntryCard background |
| Navy | `#1B2D4F` | Text, headings, lightbox backdrop base |
| Coral | `#E8614D` | FAB, accents |
| Ocean | `#2563EB` | Links, focus outlines |
| Mist | `#94A3B8` | Secondary text (dates, linked entities) |
| DM Serif Display | Heading font | Entry date display |
| Nunito | Body font | Entry text, labels |
| z-400 | - | StatsBar, ActionFAB, BoatBadge |
| z-500 | - | Panels (PortsPanel, JournalSection, StopoverSheet) |
| z-600 | - | Lightbox (above all overlays) |

### Previous Story (4.1) Intelligence

Story 4.1 established:
- **256 tests passing** (47 files) — do not break them
- `log_entries` table with RLS policies including public read for public voyages
- `log-photos` storage bucket with public read policy
- `LogEntryCard.tsx` (174 lines) with date, text, photos, linked entities, edit/delete actions
- `JournalSection.tsx` (182 lines) as editable panel with toggle, form integration
- `LogEntryForm.tsx` for create/edit — not needed for this story
- Photo URLs stored as JSONB array in `photo_urls` column
- `next/image` already used in LogEntryCard for thumbnails
- Supabase Storage image domains already configured in `next.config.ts`
- Shared overlay system in VoyageContent: `"stopovers" | "legs" | "journal" | null`
- **CRITICAL learning from Story 4.1 review**: Immediate photo deletion with storage cleanup rollback pattern — not relevant here but shows attention to async work
- **Fire-and-forget prohibition**: All async operations must be awaited (learned from Epic 1-2 retro)

### Git Intelligence

Recent commits:
```
aa5e68e 4.1
70b2c59 4.1
38186d8 a few fixes
4d83b46 3.3 wip
```

Story 4.1 is complete and committed. Codebase is stable with 256 tests passing.

### Scope Boundary

**IN SCOPE:**
- Fetch log entries on public page (SSR)
- JournalTimeline display component (shared authenticated + public)
- PhotoLightbox component (single photo viewer)
- Photo tap interaction on LogEntryCard
- Overlay system update for lightbox + journal panel
- Public page journal panel/section
- Messages externalization for public journal
- JSON-LD update with journal content
- Quality checks (tsc, lint, test, build)

**OUT OF SCOPE — Do NOT create:**
- No photo gallery with navigation (swipe between photos)
- No structured log entry fields (weather, sails, crew) — Growth phase
- No social features (comments, likes)
- No offline support
- No log entry creation from public page
- No changes to data layer or migration

### Project Structure Notes

```
src/
├── app/
│   ├── [username]/
│   │   └── [slug]/
│   │       ├── page.tsx                    # MODIFY — fetch log entries, pass to PublicVoyageContent, update JSON-LD
│   │       ├── PublicVoyageContent.tsx      # MODIFY — add logEntries prop, journal panel, lightbox overlay
│   │       └── messages.ts                 # MODIFY — add journal messages
│   └── voyage/
│       └── [id]/
│           └── (no page.tsx changes — already passes log entries)
├── components/
│   ├── log/
│   │   ├── JournalTimeline.tsx            # NEW — read-only timeline display component
│   │   ├── PhotoLightbox.tsx              # NEW — full-viewport photo overlay
│   │   ├── LogEntryCard.tsx               # MODIFY — add onPhotoTap prop
│   │   ├── JournalSection.tsx             # MODIFY — wire lightbox through existing cards
│   │   └── LogEntryForm.tsx               # NO CHANGE
│   └── voyage/
│       ├── VoyageContent.tsx              # MODIFY — add lightbox overlay state
│       └── ActionFAB.tsx                  # POTENTIALLY MODIFY — if adding journal toggle on public
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.2 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-6 (Log Entries timeline), FR-7 (Public Voyage Page with log timeline)]
- [Source: _bmad-output/planning-artifacts/architecture.md — SSR boundary, client-only boundary, component paths]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Immersive Minimal direction, overlay patterns, typography, color system]
- [Source: _bmad-output/implementation-artifacts/4-1-journal-entry-creation-and-management.md — LogEntryCard props, JournalSection pattern, photo URLs, 256 tests]
- [Source: src/app/[username]/[slug]/page.tsx — current SSR data fetching, JSON-LD schema]
- [Source: src/app/[username]/[slug]/PublicVoyageContent.tsx — ActiveOverlay type, overlay system]
- [Source: src/components/log/LogEntryCard.tsx — current props (no onPhotoTap)]
- [Source: src/components/log/JournalSection.tsx — editable panel pattern]
- [Source: src/components/voyage/VoyageContent.tsx — authenticated overlay system]
- [Source: src/components/voyage/PortsPanel.tsx — desktop/mobile panel pattern to follow]
- [Source: src/lib/data/log-entries.ts — getLogEntriesByVoyageId (works for public via RLS)]
- [Source: supabase/migrations/20260326100000_log_entries.sql — public read RLS policy]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation with no debugging issues.

### Completion Notes List

- Task 1: Added `getLogEntriesByVoyageId` call in public page SSR, passing logEntries to PublicVoyageContent
- Task 2: Added `logEntries` prop to PublicVoyageContent, rendering JournalTimeline in desktop persistent sidebar and mobile slide-out panel
- Task 3: Created `JournalTimeline.tsx` — thin read-only display wrapper resolving stopover names and leg labels from passed data
- Task 4: Created `PhotoLightbox.tsx` — full-viewport overlay with next/image, focus trap, keyboard/click dismiss, CSS transitions, z-600
- Task 5: Added `onPhotoTap` prop to LogEntryCard — conditionally wraps photo thumbnails in tappable buttons
- Task 6: Extended overlay system in both PublicVoyageContent and VoyageContent with "lightbox" type, lightboxUrl state, and mutual exclusion
- Task 7: Kept JournalSection CRUD intact, passed `onPhotoTap` through to LogEntryCard for authenticated lightbox support
- Task 8: Added journal messages to public page `messages.ts` (header, ariaLabel, openLabel, closeLabel, toggle)
- Task 9: Extended JSON-LD SportsEvent with `subEvent` array (up to 10 journal entries as Event items)
- Task 10: All quality checks pass — tsc clean, lint clean, 256 tests pass, build succeeds

### Change Log

- 2026-03-26: Story 4.2 implementation complete — journal timeline display on public and authenticated pages with photo lightbox

### File List

- src/app/[username]/[slug]/page.tsx (MODIFIED — SSR log entries fetch + JSON-LD subEvent)
- src/app/[username]/[slug]/PublicVoyageContent.tsx (MODIFIED — logEntries prop, journal panel, lightbox overlay)
- src/app/[username]/[slug]/messages.ts (MODIFIED — added journal messages)
- src/components/log/JournalTimeline.tsx (NEW — read-only timeline display component)
- src/components/log/PhotoLightbox.tsx (NEW — full-viewport photo lightbox)
- src/components/log/LogEntryCard.tsx (MODIFIED — added onPhotoTap prop)
- src/components/log/JournalSection.tsx (MODIFIED — added onPhotoTap prop passthrough)
- src/components/voyage/VoyageContent.tsx (MODIFIED — lightbox overlay integration)
- _bmad-output/implementation-artifacts/sprint-status.yaml (MODIFIED — story status updates)
- _bmad-output/implementation-artifacts/4-2-journal-timeline-display.md (MODIFIED — task tracking)
