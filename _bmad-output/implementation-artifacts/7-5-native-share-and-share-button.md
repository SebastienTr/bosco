# Story 7.5: Native Share & Share Button

Status: review

## Story

As a sailor or visitor,
I want to share a voyage via the native OS share sheet or clipboard,
so that sharing is fast, integrated with my device, and drives viral discovery of Bosco.

## Acceptance Criteria

1. **Given** an authenticated user on the voyage view or a visitor on the public page, **when** the user taps the share button, **then** on mobile web the Web Share API is used (native share sheet opens with URL + text), and on desktop the link is copied to clipboard with a "Link copied" toast.

2. **Given** a mobile device that supports `navigator.share`, **when** the share button is tapped, **then** `navigator.share()` is called with `{ title: voyageName, text: shareText, url: publicUrl }`.

3. **Given** a desktop browser (no `navigator.share` support), **when** the share button is tapped, **then** the public URL is copied to `navigator.clipboard` and a success toast ("Link copied!") appears for 4 seconds.

4. **Given** the share button component, **then** it renders as a 44px minimum touch target with a standard share icon (arrow-up-from-square style).

5. **Given** the public voyage page (`/[username]/[slug]`), **then** the share button appears in the header area next to the voyage title pill, visually consistent with the existing glass morphism style.

6. **Given** the creator voyage view (`/voyage/[id]`), **then** the share button appears in the top actions area, enabling quick sharing of public voyages.

7. **Given** all share-related UI strings, **then** they are externalized in the relevant `messages.ts` files (never inline string literals).

8. **Given** the share button on a private voyage (creator view), **then** the button is hidden or disabled since there is no public URL to share.

## Tasks / Subtasks

- [x] Task 1: Create `ShareButton` component (AC: #1, #2, #3, #4)
  - [x] 1.1 Create `src/components/voyage/ShareButton.tsx` as a client component
  - [x] 1.2 Accept props: `url: string`, `title: string`, `text: string`, `messages: ShareButtonMessages`
  - [x] 1.3 Detect `navigator.share` support at runtime (not at import time — SSR safe)
  - [x] 1.4 On tap: if `navigator.share` available → call it with `{ title, text, url }`; catch and ignore `AbortError` (user cancelled)
  - [x] 1.5 On tap: if no `navigator.share` → `navigator.clipboard.writeText(url)` + `toast.success(messages.copied)` via Sonner
  - [x] 1.6 Render as 44px touch target button with share icon SVG (arrow-up-from-square)
  - [x] 1.7 Use glass morphism style variant for public page placement: `bg-navy/60 backdrop-blur-[12px] text-white`

- [x] Task 2: Write unit tests for `ShareButton` (AC: #1, #2, #3, #4)
  - [x] 2.1 Create `src/components/voyage/ShareButton.test.tsx`
  - [x] 2.2 Test: calls `navigator.share` when available with correct params
  - [x] 2.3 Test: falls back to clipboard + toast when `navigator.share` undefined
  - [x] 2.4 Test: handles `navigator.share` AbortError gracefully (no error toast)
  - [x] 2.5 Test: handles clipboard failure with error toast
  - [x] 2.6 Test: renders with correct aria-label and touch target size

- [x] Task 3: Integrate ShareButton into PublicVoyageContent (AC: #5)
  - [x] 3.1 Add share messages to `src/app/[username]/[slug]/messages.ts`
  - [x] 3.2 Import `ShareButton` in `PublicVoyageContent.tsx`
  - [x] 3.3 Place share button in the header area — absolute positioned to the right of the voyage title pill
  - [x] 3.4 Construct public URL: `${siteUrl}/${username}/${slug}` (use `siteUrl` from `src/lib/utils/site-url.ts` — NOT `window.location.origin` since this is SSR-aware)
  - [x] 3.5 Pass voyage name as title, descriptive text as share text

- [x] Task 4: Integrate ShareButton into creator VoyageContent (AC: #6, #8)
  - [x] 4.1 Add share messages to `src/app/voyage/[id]/messages.ts` (or the relevant messages file for VoyageContent)
  - [x] 4.2 Import `ShareButton` in `VoyageContent.tsx` or the voyage view layout
  - [x] 4.3 Only render ShareButton when `isPublic === true` AND `username` AND `slug` are available
  - [x] 4.4 Position in the top actions area of the voyage view

- [x] Task 5: Verify no regressions (AC: all)
  - [x] 5.1 Run full test suite (`npm run test`) — all existing tests must pass
  - [x] 5.2 Run TypeScript check (`npx tsc --noEmit`) — no type errors

## Dev Notes

### Critical Context: Existing Code to REUSE

**Clipboard copy pattern already exists** in `src/app/voyage/[id]/settings/VoyageSettingsForm.tsx` (lines 270–287). The settings form has a "Copy" button for the public URL. This story extracts that capability into a reusable `ShareButton` component with Web Share API enhancement.

**Toast system already integrated:**
- `import { toast } from "sonner"` — used throughout the app
- Custom icons configured in `src/components/ui/sonner.tsx`
- Pattern: `toast.success("Message")`, auto-dismiss after 4s

**Site URL utility exists:**
- `src/lib/utils/site-url.ts` exports `siteUrl` — resolves `NEXT_PUBLIC_SITE_URL` or Vercel production URL
- Use this for constructing share URLs instead of `window.location.origin` (SSR-safe)

**Public URL pattern:**
```
${siteUrl}/${username}/${slug}
```

### Web Share API Implementation

```typescript
async function handleShare() {
  const shareData = { title, text, url };

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // User cancelled — AbortError is normal, ignore it
      if (err instanceof Error && err.name !== "AbortError") {
        // Unexpected error — fallback to clipboard
        await copyToClipboard();
      }
    }
  } else {
    await copyToClipboard();
  }
}
```

**Key points:**
- Check `typeof navigator !== "undefined"` for SSR safety
- `navigator.share()` returns a Promise that rejects with `AbortError` when user cancels — this is NOT an error
- Desktop Chrome on macOS does NOT support `navigator.share` — clipboard fallback will be the common desktop path
- Mobile Safari, Chrome Android, Firefox Android all support `navigator.share`

### Capacitor Note (DEFER)

The acceptance criteria mention `@capacitor/share` for native apps. **Capacitor is NOT yet integrated** (Epic 6A is in backlog). This story implements the **web-only** share flow:
- Mobile web → Web Share API (native share sheet)
- Desktop web → Clipboard copy + toast

When Capacitor is added later (Epic 6A), the `ShareButton` can be enhanced to use `@capacitor/share` behind a platform detection check. Design the component interface to accommodate this future extension without breaking changes.

### PublicVoyageContent Header Layout

The current header (lines 258–270 of `PublicVoyageContent.tsx`) is:
```tsx
<header className="absolute inset-x-0 top-4 z-[350] flex justify-center px-4">
  <Link href={`/${username}`} className="max-w-[min(28rem,calc(100vw-8rem))] rounded-2xl bg-navy/75 px-4 py-3 ...">
    <h1>voyageName</h1>
    <p>boatName · @username</p>
  </Link>
</header>
```

The share button should be positioned as an **independent element** within or next to this header, not inside the Link. Options:
- Absolute position to the right of the title pill (e.g., `right-4 top-4`)
- Same z-index level (`z-[350]`) to stay above the map
- Glass morphism style to match: `bg-navy/60 backdrop-blur-[12px] rounded-full`

### VoyageContent (Creator View) Integration

The creator view at `src/components/voyage/VoyageContent.tsx` is more complex. The share button should:
- Only appear when `isPublic` is true (voyage has a public URL)
- Be placed in a visible but non-intrusive position
- The component receives voyage data including `slug` and the profile `username` — check if these are available in props or need to be passed through

### ActionFAB Pattern Reference

`src/components/voyage/ActionFAB.tsx` (47 lines) shows the established mobile FAB pattern:
- 48x48px coral circle, `z-[400]`, `bottom-20 right-4`
- `active:scale-95` for press feedback
- SVG icon inside, `focus-visible:outline-2`
- `lg:hidden` for mobile-only visibility

The ShareButton uses a similar floating style on the public page but with glass morphism instead of coral.

### i18n String Externalization

Add to `src/app/[username]/[slug]/messages.ts`:
```typescript
share: {
  label: "Share this voyage",
  copied: "Link copied!",
  copyFailed: "Could not copy link",
  text: (voyageName: string, username: string) =>
    `Check out this sailing voyage: ${voyageName} by @${username}`,
},
```

### Architecture Compliance

- **Component location:** `src/components/voyage/ShareButton.tsx` — correct per project structure (`ShareButton.tsx` is already planned in architecture doc)
- **Tier compliance:** Component calls no Supabase directly, no Server Actions needed — pure client-side UI
- **Naming:** `ShareButton.tsx` PascalCase component — correct
- **No new dependencies:** Uses built-in Web Share API and existing Sonner toast
- **SSR safety:** Must use `"use client"` directive and guard `navigator` access behind `typeof` checks

### Existing Dependencies to Reuse

| Utility | Location | Purpose |
|---------|----------|---------|
| `siteUrl` | `src/lib/utils/site-url.ts` | SSR-safe base URL |
| `toast` | `sonner` | Toast notifications |
| `Toaster` | `src/components/ui/sonner.tsx` | Already in layout |
| `ActionFAB` | `src/components/voyage/ActionFAB.tsx` | Pattern reference for mobile buttons |

### Anti-Patterns to Avoid

- **DO NOT** use `window.location.origin` for share URLs — use `siteUrl` for SSR safety
- **DO NOT** install `@capacitor/share` — Capacitor is not yet in the project (Epic 6A)
- **DO NOT** create a Server Action for sharing — this is pure client-side
- **DO NOT** use `navigator.share` without checking `typeof navigator !== "undefined"` — SSR will break
- **DO NOT** show an error toast when user cancels the share sheet (`AbortError`) — that's normal behavior
- **DO NOT** place the share button inside the header `<Link>` element — it would trigger navigation on tap
- **DO NOT** use `any` type for the share error — use `instanceof Error` check

### Previous Story Intelligence (Story 7.4)

- Pattern: extend existing components rather than rewriting
- All 368 tests passing — zero regressions expected
- `opengraph-image.tsx` now generates beautiful route previews — the share button drives traffic to these OG-enhanced URLs
- Story 7.4 added `sailbosco.com` branding to OG images — share text should be consistent

### Project Structure Notes

```
src/components/voyage/
├── ShareButton.tsx          # NEW — Share via Web Share API or clipboard
├── ShareButton.test.tsx     # NEW — Unit tests
├── ActionFAB.tsx            # Existing — pattern reference
├── StatsBar.tsx             # Existing — no changes
├── StopoverSheet.tsx        # Existing — no changes
├── PortsPanel.tsx           # Existing — no changes
└── ...

src/app/[username]/[slug]/
├── PublicVoyageContent.tsx   # MODIFY — add ShareButton to header
├── messages.ts              # MODIFY — add share messages
└── ...
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.5]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-46, FR-47]
- [Source: _bmad-output/planning-artifacts/architecture.md — Social Sharing FR-46→48, ShareButton.tsx]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ShareButton component spec, Journey 4: Share a Voyage]
- [Source: src/app/voyage/[id]/settings/VoyageSettingsForm.tsx:270-287 — Existing clipboard copy pattern]
- [Source: src/app/[username]/[slug]/PublicVoyageContent.tsx:258-270 — Header layout for share button placement]
- [Source: src/components/voyage/ActionFAB.tsx — FAB pattern reference]
- [Source: src/lib/utils/site-url.ts — SSR-safe URL utility]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- All 377 tests pass (7 new + 370 existing), zero regressions
- TypeScript strict mode passes cleanly
- No new lint issues introduced

### Completion Notes List

- Created `ShareButton` component with Web Share API (mobile) + clipboard fallback (desktop)
- Uses `DOMException` check for AbortError (user cancel) — `instanceof Error` fails in jsdom for DOMException
- Glass morphism style (`bg-navy/60 backdrop-blur-[12px]`) for public page, ocean tint (`bg-ocean/10`) for creator view
- 7 unit tests covering: render, aria-label, navigator.share call, clipboard fallback, AbortError handling, clipboard failure, non-AbortError fallback
- Integrated into PublicVoyageContent header (right of title pill) with `siteUrl` for SSR-safe URL construction
- Added `slug` prop to PublicVoyageContent (passed from page.tsx)
- Integrated into creator voyage page header (conditionally rendered when `is_public && username && slug`)
- Loads user profile in voyage page.tsx via `getProfileByUserId` for username resolution
- All share strings externalized in both `messages.ts` files

### File List

- `src/components/voyage/ShareButton.tsx` — NEW: Share button with Web Share API + clipboard fallback
- `src/components/voyage/ShareButton.test.tsx` — NEW: 7 unit tests
- `src/app/[username]/[slug]/PublicVoyageContent.tsx` — MODIFIED: added ShareButton to header, added slug prop
- `src/app/[username]/[slug]/PublicVoyageContent.test.tsx` — MODIFIED: added slug prop and sonner mock
- `src/app/[username]/[slug]/messages.ts` — MODIFIED: added share messages
- `src/app/[username]/[slug]/page.tsx` — MODIFIED: pass slug prop to PublicVoyageContent
- `src/app/voyage/[id]/page.tsx` — MODIFIED: added ShareButton, profile fetch, siteUrl import
- `src/app/voyage/[id]/messages.ts` — MODIFIED: added share messages

### Change Log

- 2026-03-31: Story 7.5 implemented — Native Share & Share Button with Web Share API and clipboard fallback
