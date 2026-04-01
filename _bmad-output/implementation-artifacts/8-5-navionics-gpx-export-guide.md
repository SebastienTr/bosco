# Story 8.5: Navionics GPX Export Guide

Status: done

## Story

As a user who selected the wrong file format,
I want to see how to export GPX from Navionics,
so that I can import my tracks successfully.

## Acceptance Criteria

1. **Given** a user attempts to import a non-GPX file, **When** the error message is displayed, **Then** a "Need help?" link is shown below the error — **already implemented in Story 8.4** (see `ImportProgress.tsx` helpLink rendering and `classifyProcessingError` in `GpxImporter.tsx`).

2. **Given** the user taps the "Need help?" link, **When** the page loads at `/help/navionics-export`, **Then** a clear step-by-step guide shows how to export GPX from Navionics with numbered steps and annotated screenshots.

3. **Given** the guide page is viewed, **Then** it shows 4 steps: (1) Open Navionics, go to saved tracks (2) Select the track to export (3) Tap Share/Export and choose GPX format (4) Send to Bosco or save as file.

4. **Given** the guide page is viewed on mobile, **Then** the layout stacks vertically with screenshots at full width and step text below each image.

5. **Given** the empty voyage state on the dashboard, **When** the user sees the 3-step instructions, **Then** a "How to export from Navionics?" link is visible, linking to `/help/navionics-export`.

6. **Given** the landing page "How it works" section, **When** the Export step is displayed, **Then** a subtle "Learn how" link to `/help/navionics-export` is visible below the step description.

7. **Given** the guide page content, **Then** it is clear enough for a non-technical sailor (no developer jargon, visual-first approach).

## Tasks / Subtasks

- [x] Task 1: Create `/help/navionics-export` page (AC: #2, #3, #4, #7)
  - [x] 1.1 Create `src/app/help/navionics-export/page.tsx` as server component
  - [x] 1.2 Create `src/app/help/navionics-export/messages.ts` with all UI strings
  - [x] 1.3 Implement 4-step guide layout: numbered cards with image placeholder + step text
  - [x] 1.4 Add responsive layout: 2-column grid on desktop (image left, text right), stacked on mobile
  - [x] 1.5 Add "Back" navigation and "Import my tracks" CTA linking to `/auth`
  - [x] 1.6 Add image placeholders (`public/images/help/navionics-step-1.svg` through `step-4.svg`) using `next/image` with descriptive alt text
  - [x] 1.7 Apply project design tokens: font-heading, text-navy, text-slate, rounded-[var(--radius-card)], shadow-card

- [x] Task 2: Add screenshot images (AC: #3, #7)
  - [x] 2.1 Create `public/images/help/` directory
  - [x] 2.2 Add 4 placeholder SVGs (simple illustrations) for each Navionics step — these will be replaced by real annotated screenshots provided by the project owner
  - [x] 2.3 Each placeholder should convey the step concept (phone outline + arrow + app icon pattern)

- [x] Task 3: Add link from empty state (AC: #5)
  - [x] 3.1 Add `navionicsGuide` message key to dashboard messages.ts: "How to export from Navionics?"
  - [x] 3.2 Update `EnhancedEmptyState` component interface to accept optional `helpLink` prop
  - [x] 3.3 Render link below the 3-step instructions, styled as `text-ocean hover:underline`

- [x] Task 4: Add link from landing page (AC: #6)
  - [x] 4.1 Add `learnHow` message key to landing-messages.ts (all languages) under howItWorks.steps.export
  - [x] 4.2 Render subtle link below the Export step description in the landing page

- [x] Task 5: Verify existing import error flow (AC: #1)
  - [x] 5.1 Confirm `ImportProgress.tsx` helpLink renders correctly and navigates to `/help/navionics-export`
  - [x] 5.2 No changes needed if working — this is validation only

- [x] Task 6: Tests (AC: all)
  - [x] 6.1 Unit test for the guide page: renders all 4 steps, images have alt text, CTA link present
  - [x] 6.2 Update EnhancedEmptyState tests if they exist: verify helpLink renders when prop provided
  - [x] 6.3 Run full test suite — zero regressions (430 tests pass)

## Dev Notes

### Architecture Decision: Page vs Drawer

The UX spec mentions "in-app drawer" but the existing implementation (from Story 8.4) uses a `<Link href="/help/navionics-export">` in `ImportProgress.tsx`. A dedicated page is the correct approach because:
- Works with the existing Link pattern — no refactoring needed
- Accessible from 3+ unrelated contexts (import error, empty state, landing page) without shared state management
- SEO-friendly (Google indexes help content)
- Shareable URL (sailors can send the link to each other)
- No new shadcn component installation required (no Sheet/Drawer in the project)

**Do NOT install a Sheet/Drawer component. Do NOT convert existing Links to open drawers.**

### Existing Integration Points — DO NOT recreate

| Component | Location | What exists | What to do |
|-----------|----------|-------------|------------|
| Import error link | `src/components/gpx/ImportProgress.tsx:69-76` | `<Link href="/help/navionics-export">` with helpLink label | Nothing — already works, just needs the target page |
| Error classification | `src/components/gpx/GpxImporter.tsx:50-57` | `classifyProcessingError` returns helpLink for non-GPX errors | Nothing — already wired |
| Import messages | `src/app/voyage/[id]/import/messages.ts:30-36` | `error.notGpx.helpLink` and `helpHref` strings | Nothing — strings exist |
| Empty state | `src/components/dashboard/EnhancedEmptyState.tsx` | Shows 3 steps, no help link yet | Add optional helpLink prop |
| Landing page | `src/app/page.tsx:110-133` | "How it works" with Export step | Add subtle "Learn how" link |

### Page Structure

```
src/app/help/
  navionics-export/
    page.tsx           ← Server component, static content
    messages.ts        ← All strings
```

No `layout.tsx` needed — use root layout. The page is a simple content page with:
- Bosco header (link back to landing)
- Page title: "How to Export GPX from Navionics"
- 4 numbered step cards
- Bottom CTA: "Ready? Import your tracks"

### Image Strategy

Use `next/image` with placeholder SVGs until real Navionics screenshots are provided:

```
public/images/help/
  navionics-step-1.svg   ← "Open your tracks in Navionics"
  navionics-step-2.svg   ← "Select the track"
  navionics-step-3.svg   ← "Choose GPX format"
  navionics-step-4.svg   ← "Send to Bosco or save"
```

Images should be simple phone-outline SVGs with numbered circles. Real annotated screenshots will be swapped in by the project owner. Use `width={360} height={640}` aspect ratio (portrait phone).

### Guide Content (4 Steps)

These are the actual Navionics export steps to document:

1. **Open your tracks** — In the Navionics Boating app, tap the menu and go to "My Data" > "Tracks". Find the track you want to export.
2. **Select the track** — Tap on the track to open its details. You'll see the route drawn on the map.
3. **Export as GPX** — Tap the share/export icon. In the format options, select "GPX". This is the standard format Bosco uses.
4. **Send to Bosco** — Choose "Save to Files" or share directly. Then import the .gpx file in Bosco.

Each step: numbered badge (coral circle with white number) + image + title (font-heading) + description (text-slate).

### Design Tokens

Follow existing project design system — no new tokens needed:

```
Background: bg-foam (light sections) or bg-white
Cards: rounded-[var(--radius-card)] shadow-card bg-white
Headings: font-heading text-navy
Body text: text-body text-slate
Step numbers: bg-coral text-white rounded-full w-8 h-8
Links: text-ocean hover:underline
CTA button: bg-coral text-white rounded-[var(--radius-button)] min-h-[44px]
```

### Responsive Breakpoints

- **Mobile (default)**: Single column, steps stacked vertically. Image full-width, text below.
- **Desktop (md+)**: Two-column grid per step. Image left (max-w-xs), text right.
- Page max-width: `max-w-3xl mx-auto px-4`

### Landing Page Integration

The landing page uses `landingMessages` from `src/app/landing-messages.ts` with language support (EN/FR). The "Learn how" link text needs entries for both languages.

The Export step is rendered at `src/app/page.tsx:114-131` inside a map over `steps`. Add the link after `step.description` — only for the first step (index 0, the Export step).

### EnhancedEmptyState Integration

`EnhancedEmptyState` at `src/components/dashboard/EnhancedEmptyState.tsx` accepts a `messages` prop with step strings. Add an optional `helpLink?: { label: string; href: string }` prop. Render below the 3-step `<ol>` if provided.

The dashboard page passes messages from `src/app/dashboard/messages.ts` — add the new key there.

### Anti-Patterns — DO NOT

- **DO NOT** install new npm dependencies — no MDX, no rich text renderer, no image carousel library
- **DO NOT** create a drawer/sheet/modal component — use a standard Next.js page
- **DO NOT** hardcode strings — use co-located messages.ts
- **DO NOT** create complex navigation — simple "Back" link + CTA is sufficient
- **DO NOT** create a `layout.tsx` for `/help/` — use root layout
- **DO NOT** modify ImportProgress.tsx or GpxImporter.tsx — the link already works
- **DO NOT** use `<img>` tags — use `next/image` for optimization

### Previous Story Intelligence (Story 8.4)

Key learnings from Story 8.4:
- `showActionError()` + `getUserErrorMessage()` pattern is established and working (418 tests pass)
- GPX error classification (`classifyProcessingError`) already produces helpLink for non-GPX errors pointing to `/help/navionics-export`
- All hardcoded strings are migrated to messages.ts
- Code review caught: always preserve user state on error (IMPORT_ERROR keeps result + geoNames)
- Test count: 418+ tests — expect ~425+ after this story

### Git Intelligence

- Recent commits: Stories 7.6 (Dual CTA) and 8.5 sprint status
- Codebase conventions stable: kebab-case utility files, PascalCase components, co-located tests
- `next/image` used in: LogEntryCard, PhotoLightbox, public profile page — established pattern

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.5]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-56]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Navionics GPX export guide section]
- [Source: src/components/gpx/ImportProgress.tsx — Existing helpLink rendering]
- [Source: src/components/gpx/GpxImporter.tsx:48-58 — classifyProcessingError with helpLink]
- [Source: src/app/voyage/[id]/import/messages.ts:30-36 — notGpx error messages with helpHref]
- [Source: src/components/dashboard/EnhancedEmptyState.tsx — Empty state integration point]
- [Source: src/app/page.tsx:110-133 — Landing page "How it works" integration point]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation, no blockers encountered.

### Completion Notes List

- Created `/help/navionics-export` page as a server component with 4-step guide, responsive layout (stacked mobile, side-by-side desktop), back navigation, and CTA
- Created co-located `messages.ts` with all UI strings (page title, intro, 4 step titles/descriptions/alt text, CTA, back label)
- Created 4 placeholder SVGs in `public/images/help/` — phone-outline illustrations conveying each Navionics export step concept
- Added `helpLink` optional prop to `EnhancedEmptyState` component — renders below 3-step guide when provided
- Added `navionicsGuide` message key to dashboard messages.ts
- Passed `helpLink` prop in dashboard page to link to `/help/navionics-export`
- Added `learnHow` field to landing-messages.ts export step type and all 15 language entries
- Added "Learn how" link below Export step on landing page
- Verified existing import error flow — `ImportProgress.tsx` helpLink already works correctly (no changes needed)
- Added 7 unit tests for guide page (heading, 4 steps, alt texts, step numbers, CTA link, back link)
- Added 2 tests for EnhancedEmptyState helpLink (renders when provided, absent when not)
- Full test suite: 430 tests pass, zero regressions
- Type check: clean, no errors
- Lint: no new issues introduced (all existing issues are pre-existing)

### Change Log

- 2026-04-01: Story 8.5 implementation complete — guide page, placeholder SVGs, empty state link, landing page link, tests

### File List

- `src/app/help/navionics-export/page.tsx` (new)
- `src/app/help/navionics-export/messages.ts` (new)
- `src/app/help/navionics-export/page.test.tsx` (new)
- `public/images/help/navionics-step-1.svg` (new)
- `public/images/help/navionics-step-2.svg` (new)
- `public/images/help/navionics-step-3.svg` (new)
- `public/images/help/navionics-step-4.svg` (new)
- `src/components/dashboard/EnhancedEmptyState.tsx` (modified — added optional helpLink prop)
- `src/components/dashboard/EnhancedEmptyState.test.tsx` (modified — 2 new tests for helpLink)
- `src/app/dashboard/messages.ts` (modified — added navionicsGuide key)
- `src/app/dashboard/page.tsx` (modified — passes helpLink to EnhancedEmptyState)
- `src/app/landing-messages.ts` (modified — added learnHow to export step type + all 15 languages)
- `src/app/page.tsx` (modified — renders "Learn how" link under Export step)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified — status updated)
- `src/app/page.test.tsx` (modified — added "Learn how" link test)
- `_bmad-output/implementation-artifacts/8-5-navionics-gpx-export-guide.md` (modified — tasks checked, status review)
