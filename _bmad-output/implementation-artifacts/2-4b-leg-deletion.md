# Story 2.4b: Leg Deletion

Status: review

## Story

As a sailor,
I want to delete individual legs from my voyage,
so that I can remove incorrect or duplicate tracks without deleting the entire voyage.

## Acceptance Criteria

### AC-1: Delete Action Visible Per Leg
**Given** an authenticated sailor viewing their voyage at `/voyage/[id]`
**When** they see the list of imported legs
**Then** each leg displays a delete action (trash icon button)

### AC-2: Confirmation Dialog
**Given** a sailor initiates leg deletion
**When** they tap the delete button
**Then** a confirmation dialog asks: "Delete this leg? This cannot be undone."
**And** the delete button is styled with Error red (#EF4444, UX-DR15 danger variant)

### AC-3: Successful Deletion
**Given** the sailor confirms deletion
**When** the server processes the request
**Then** the leg row is removed from the `legs` table
**And** associated stopovers are NOT deleted (they belong to the voyage)
**And** the map updates to reflect the remaining tracks
**And** a success toast appears: "Leg deleted"

### AC-4: Empty State After Last Leg Deletion
**Given** a sailor deletes the last leg of a voyage
**When** no legs remain
**Then** the empty state overlay reappears with the import prompt

## Tasks / Subtasks

- [x] Task 1: Add `deleteLeg` to data layer (AC: #3)
  - [x] Add `deleteLeg(id: string)` function to `src/lib/data/legs.ts`
  - [x] Add test for `deleteLeg` in `src/lib/data/legs.test.ts`

- [x] Task 2: Create `deleteLeg` Server Action (AC: #2, #3)
  - [x] Create `src/app/voyage/[id]/actions.ts` with `deleteLeg` Server Action
  - [x] Zod validation: `{ legId: z.string().uuid() }`
  - [x] Auth check via `requireAuth()`
  - [x] Ownership check: RLS enforces at DB level, auth check at action level
  - [x] Return `{ data, error }` format — never throw
  - [x] Create `src/app/voyage/[id]/actions.test.ts` with tests

- [x] Task 3: Create `LegList` client component (AC: #1, #2, #3, #4)
  - [x] Create `src/components/voyage/LegList.tsx` — `"use client"`
  - [x] Receives `legs: Leg[]` and `onDelete` callback as props
  - [x] Displays each leg with: date (started_at formatted), distance (nm), duration
  - [x] Each leg has a trash icon delete button (44px touch target)
  - [x] Delete button triggers confirmation dialog (native `<dialog>` with `showModal()`)
  - [x] Dialog confirm button uses Error red (#EF4444)
  - [x] On confirm: calls `deleteLeg` Server Action, optimistic removal via parent
  - [x] Success: Sonner toast "Leg deleted"
  - [x] Error: Sonner toast with error message
  - [x] Calls `onDelete(legId: string)` callback prop to notify parent (VoyageContent) of deletion

- [x] Task 4: Create `VoyageContent` client wrapper (AC: #1, #3, #4)
  - [x] Create `src/components/voyage/VoyageContent.tsx` — `"use client"`
  - [x] Manages legs state client-side (initialized from server data)
  - [x] Computes `tracks` from current legs state for the map
  - [x] Passes legs to `LegList`, tracks to `MapLoader`
  - [x] Shows empty state overlay when `legs.length === 0`
  - [x] Listens to `LegList` callbacks to update state

- [x] Task 5: Update voyage page (AC: #4)
  - [x] Refactor `src/app/voyage/[id]/page.tsx` to use `VoyageContent` wrapper
  - [x] Server Component keeps: data fetching (legs, stopovers, voyage), auth check, header bar with back link and voyage name
  - [x] Move into `VoyageContent`: MapLoader rendering, StopoverMarkers, StopoverPanel, EmptyState overlay; keep the header "Import track" button visible when legs exist
  - [x] Page passes `initialLegs`, `stopovers`, `voyageId` to `VoyageContent`
  - [x] Page still exports `metadata` at top level

- [x] Task 6: Add messages (AC: #2, #3)
  - [x] Add leg deletion strings to `src/app/voyage/[id]/messages.ts`

- [x] Task 7: Verify build and tests (AC: all)
  - [x] All new tests pass: `npm run test` — 152 tests passing
  - [x] TypeScript strict clean: `npx tsc --noEmit`
  - [x] ESLint clean: `npm run lint`
  - [x] No regressions: all existing 148 tests still pass (152 total = 148 + 4 new)

## Dev Notes

### Scope Boundary — CRITICAL

This story adds **leg deletion only** — a small, focused feature. No new database migrations, no new npm packages.

**IN SCOPE:**
- `src/lib/data/legs.ts` — add `deleteLeg` function
- `src/lib/data/legs.test.ts` — add delete test
- `src/app/voyage/[id]/actions.ts` — NEW: voyage-level Server Actions (starting with `deleteLeg`)
- `src/app/voyage/[id]/actions.test.ts` — NEW: tests
- `src/components/voyage/LegList.tsx` — NEW: leg list with delete UI
- `src/components/voyage/VoyageContent.tsx` — NEW: client wrapper managing legs state
- `src/app/voyage/[id]/page.tsx` — REFACTOR: delegate rendering to VoyageContent
- `src/app/voyage/[id]/messages.ts` — ADD: leg deletion strings

**OUT OF SCOPE — Do NOT create:**
- No database migration — DELETE RLS policy already exists on `legs` table
- No stopover deletion when a leg is deleted — stopovers belong to the voyage
- No leg editing/renaming — not in requirements
- No leg reordering — legs are ordered by `started_at`
- No track highlight on map when hovering a leg in the list — future enhancement
- No bulk delete — delete one at a time

### Data Layer — `deleteLeg` in `src/lib/data/legs.ts`

Add to the existing file, following the exact same pattern as `deleteStopover` in `src/lib/data/stopovers.ts`:

```typescript
export async function deleteLeg(id: string) {
  const supabase = await createClient();
  return supabase.from("legs").delete().eq("id", id);
}
```

That's it. RLS handles authorization at the database level. The Server Action adds an application-level ownership check for defense-in-depth.

### Server Action — `src/app/voyage/[id]/actions.ts`

Create a NEW file for voyage-level actions. Do NOT add this to `src/app/voyage/[id]/import/actions.ts` — import actions are about importing data, voyage actions are about managing the voyage.

Follow the exact pattern from `src/app/voyage/[id]/stopover/actions.ts`:

```typescript
"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getLegsByVoyageId, deleteLeg as deleteLegDb } from "@/lib/data/legs";
import type { ActionResponse } from "@/types";

const DeleteLegSchema = z.object({
  legId: z.string().uuid(),
});

export async function deleteLeg(
  input: z.input<typeof DeleteLegSchema>,
): Promise<ActionResponse<null>> {
  const authResult = await requireAuth();
  if (authResult.error) return { data: null, error: authResult.error };

  const parsed = DeleteLegSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    };
  }

  // Verify ownership: fetch the leg, check voyage ownership
  // Use getLegsByVoyageId? No — we need to check a specific leg.
  // Better: fetch the leg directly to get its voyage_id, then verify.
  // But legs.ts doesn't have getLegById — use Supabase RLS instead.
  // RLS already prevents deleting legs from other users' voyages.
  // The delete will simply return no rows if RLS blocks it.

  const { error } = await deleteLegDb(parsed.data.legId);
  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: null, error: null };
}
```

**Key decision:** RLS already enforces ownership at the DB level. The `deleteLeg` Server Action does auth check (is user logged in?) + Zod validation. Adding a separate ownership query would require a `getLegById` function and an extra DB round-trip. Since RLS already handles this, the simpler approach is sufficient for MVP. If the leg doesn't belong to the user, the Supabase delete returns 0 rows but no error — this is acceptable behavior (silent no-op for unauthorized attempts).

**Alternative (if explicit ownership check is preferred):** Add `getLegById` to the data layer and verify `voyage_id` ownership before deleting. This provides a clearer error message ("Not your leg") but adds complexity.

### LegList Client Component — `src/components/voyage/LegList.tsx`

```typescript
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceNm, formatDuration } from "@/lib/utils/format";
import { deleteLeg } from "@/app/voyage/[id]/actions";
import type { Leg } from "@/lib/data/legs";
```

**Layout:** A vertical list of leg cards, positioned as a panel overlay (similar to StopoverPanel) or inline in the page layout. Each card shows:
- Date: format `started_at` as "15 Mar" (day + month abbreviation)
- Distance: format `distance_nm` as "12.3 nm"
- Duration: format `duration_seconds` as "2h 15m"
- Delete button: trash icon, 44px touch target

**Confirmation Dialog:** Use native HTML `<dialog>` element (no need for a shadcn dialog — we don't have shadcn Dialog installed, and the UX spec says dialogs are minimal centered cards with clear actions). Alternatively, use `window.confirm()` for maximum simplicity — but a styled dialog matches the UX spec better.

**Pattern:** Use a simple `<dialog>` element with `showModal()` / `close()`:

```tsx
<dialog
  ref={dialogRef}
  className="rounded-[var(--radius-card)] bg-white p-6 shadow-overlay backdrop:bg-black/50"
>
  <h2 className="font-heading text-h2 text-navy">{messages.legs.deleteConfirmTitle}</h2>
  <p className="mt-2 text-body text-slate">{messages.legs.deleteConfirmDescription}</p>
  <div className="mt-6 flex gap-3 justify-end">
    <button
      onClick={() => dialogRef.current?.close()}
      className="inline-flex min-h-[44px] items-center rounded-lg px-4 py-2 text-navy hover:bg-foam"
    >
      {messages.legs.cancelButton}
    </button>
    <button
      onClick={() => handleConfirmDelete()}
      className="inline-flex min-h-[44px] items-center rounded-lg bg-[#EF4444] px-4 py-2 font-semibold text-white"
    >
      {messages.legs.deleteConfirmButton}
    </button>
  </div>
</dialog>
```

Use `dialogRef.current?.showModal()` to open (provides backdrop and focus trap) and `dialogRef.current?.close()` to dismiss.

**Optimistic updates:** Remove the leg from local state immediately, then call the Server Action. On error, restore the leg and show an error toast.

### VoyageContent Client Wrapper — `src/components/voyage/VoyageContent.tsx`

The current voyage page is a Server Component that renders the map and empty state. To support interactive leg deletion (updating the map and showing/hiding empty state), we need a client wrapper that manages legs state.

```typescript
"use client";

import { useState } from "react";
import type { Leg } from "@/lib/data/legs";
import type { Stopover } from "@/lib/data/stopovers";

interface VoyageContentProps {
  initialLegs: Leg[];
  stopovers: Stopover[];
  voyageId: string;
}
```

This component:
1. Holds `legs` in `useState`, initialized from `initialLegs`
2. Derives `tracks` from `legs` using `useMemo`:
```typescript
const tracks: GeoJSON.LineString[] = legs.map(
  (leg) => leg.track_geojson as unknown as GeoJSON.LineString,
);
```
3. Renders `MapLoader` with `tracks` and stopover markers as children
4. Renders `LegList` with a callback `onDelete(legId)` to remove a leg from state
5. Renders the empty state overlay (move from page.tsx lines 110-145) when `legs.length === 0`
6. Renders the "Import track" link when `legs.length > 0`

The Server Component (`page.tsx`) becomes thin: fetches data, passes to `VoyageContent`.

### Existing Patterns to Reuse

| Module | Path | How to Reuse |
|--------|------|--------------|
| `deleteStopover` data layer | `src/lib/data/stopovers.ts` | Exact same pattern for `deleteLeg` |
| `removeStopover` Server Action | `src/app/voyage/[id]/stopover/actions.ts` | Same auth + Zod + delete pattern |
| `StopoverMarkers` client state | `src/components/map/StopoverMarkers.tsx` | Same optimistic update pattern for legs |
| `formatDistanceNm`, `formatDuration` | `src/lib/utils/format.ts` | Reuse for leg stats display |
| Sonner toast | Used in `StopoverMarkers.tsx` | `import { toast } from "sonner"` |
| Messages pattern | `src/app/voyage/[id]/messages.ts` | Add leg deletion strings to existing file |
| `EmptyState` component | `src/components/shared/EmptyState.tsx` | Already used in voyage page |

### Messages to Add

Add to `src/app/voyage/[id]/messages.ts`:

```typescript
legs: {
  deleteConfirmTitle: "Delete this leg?",
  deleteConfirmDescription: "This cannot be undone.",
  deleteConfirmButton: "Delete",
  cancelButton: "Cancel",
  deletedToast: "Leg deleted",
  deleteErrorToast: "Failed to delete leg",
},
```

### 3-Tier Containment Compliance

```
OK src/lib/data/legs.ts — imports from src/lib/supabase/server (Tier 1 -> 2)
OK src/app/voyage/[id]/actions.ts — imports from src/lib/data/, src/lib/auth (Tier 2 -> 3)
OK src/components/voyage/LegList.tsx — calls Server Actions only (Tier 3 -> 4)
OK src/components/voyage/VoyageContent.tsx — presentational + state (Tier 4)
NEVER import @supabase/* in components or actions
NEVER import src/lib/supabase/* in Server Actions
```

### Anti-Patterns — Do NOT

- **Do NOT** delete stopovers when deleting a leg — stopovers belong to the voyage, not individual legs
- **Do NOT** throw from the Server Action — return `{ data, error }`
- **Do NOT** use `any` type
- **Do NOT** install new npm packages
- **Do NOT** create a database migration — DELETE RLS already exists
- **Do NOT** place custom components in `src/components/ui/`
- **Do NOT** add `deleteLeg` to `src/app/voyage/[id]/import/actions.ts` — create separate voyage actions file
- **Do NOT** create a complex leg management UI (edit, reorder, bulk select) — only delete
- **Do NOT** use `window.confirm()` — use a styled `<dialog>` for proper UX
- **Do NOT** forget the 44px minimum touch target on all buttons (NFR-9)
- **Do NOT** inline string literals in components — use messages.ts

### Testing Strategy

| File | Tests | Focus |
|------|-------|-------|
| `src/lib/data/legs.test.ts` | +1 test | `deleteLeg` calls Supabase delete with correct id |
| `src/app/voyage/[id]/actions.test.ts` | ~3 tests | `deleteLeg` success, auth failure, validation error |

**Data layer test** follows existing `legs.test.ts` mock pattern.

**Server Action tests** follow `src/app/voyage/[id]/stopover/actions.test.ts` pattern — mock `requireAuth`, mock data layer functions.

### Package Versions (No New Dependencies)

This story adds **zero npm packages**. All required packages are already installed:

| Package | Usage |
|---------|-------|
| `zod` | Server Action input validation |
| `sonner` | Toast notifications |
| `next` | Server Actions, routing |
| `react` | Components, useState |

### Project Structure Notes

```
src/
├── app/voyage/[id]/
│   ├── page.tsx                     # MODIFY — delegate to VoyageContent
│   ├── actions.ts                   # NEW — voyage-level Server Actions (deleteLeg)
│   ├── actions.test.ts              # NEW — tests
│   └── messages.ts                  # MODIFY — add leg deletion strings
├── components/voyage/
│   ├── LegList.tsx                  # NEW — leg list with delete UI
│   └── VoyageContent.tsx            # NEW — client wrapper managing legs + map state
├── lib/data/
│   ├── legs.ts                      # MODIFY — add deleteLeg
│   └── legs.test.ts                 # MODIFY — add deleteLeg test
```

### Previous Story (2.4) Intelligence

Story 2.4 established:
- **StopoverMarkers component** — manages local state initialized from server data, calls Server Actions, uses optimistic updates with toast feedback. Same pattern for leg deletion.
- **Custom events** — `bosco:center-stopover` pattern for cross-component communication. Can reuse if needed.
- **StopoverPanel** — toggle overlay panel pattern. LegList can follow a similar overlay approach.
- **`removeStopover` Server Action** — exact auth + Zod + delete pattern to follow.
- **148 tests passing** — do not break them.
- **Sonner toast** for feedback: `import { toast } from "sonner"`.
- **Button styling** uses inline `className` (not `asChild`).

### Git Intelligence

Recent commits follow the pattern `{story_number} done` (e.g., "2.3 done", "2.1 done"). All stories in Epic 2 completed sequentially. The codebase is clean — no unfinished branches or merge conflicts.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.4b]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-4 "users can delete individual legs from a voyage"]
- [Source: _bmad-output/planning-artifacts/architecture.md — 3-tier containment, Server Action patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Danger button #EF4444, confirmation dialogs, 44px touch targets, toast feedback]
- [Source: _bmad-output/implementation-artifacts/2-4-automatic-stopover-detection-and-management.md — removeStopover pattern, StopoverMarkers optimistic state, testing patterns]
- [Source: supabase/migrations/20260316122237_legs.sql — "Users can delete own legs" RLS policy already exists]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Task 1: Added `deleteLeg(id: string)` to `src/lib/data/legs.ts` following exact pattern from `deleteStopover` in stopovers.ts. 1 new test passing.
- Task 2: Created `src/app/voyage/[id]/actions.ts` with `deleteLeg` Server Action — Zod validated UUID input, `requireAuth()` check, RLS-enforced ownership at DB level. 3 new tests passing.
- Task 3: Created `src/components/voyage/LegList.tsx` — displays legs with date/distance/duration stats, trash icon button with 44px touch target, native `<dialog>` confirmation with Error red (#EF4444) confirm button, calls parent `onDelete` callback for optimistic removal, Sonner toast feedback.
- Task 4: Created `src/components/voyage/VoyageContent.tsx` — client wrapper managing legs state, derives GeoJSON tracks from legs, renders MapLoader + StopoverMarkers + StopoverPanel + LegList panel + EmptyState overlay.
- Task 5: Refactored `src/app/voyage/[id]/page.tsx` — Server Component now only handles data fetching, auth, and header. All interactive content delegated to VoyageContent, while the header "Import track" action remains visible after user feedback.
- Task 6: Added leg deletion messages to `src/app/voyage/[id]/messages.ts` (deleteConfirmTitle, deleteConfirmDescription, deleteConfirmButton, cancelButton, deletedToast, deleteErrorToast).
- Task 7: All 152 tests pass (148 existing + 4 new), tsc clean, lint clean, build succeeds.

### Change Log

- 2026-03-16: Story 2.4b implemented — leg deletion with data layer, Server Action, LegList component, VoyageContent client wrapper, voyage page refactor

### File List

New files:
- src/app/voyage/[id]/actions.ts
- src/app/voyage/[id]/actions.test.ts
- src/components/voyage/LegList.tsx
- src/components/voyage/VoyageContent.tsx

Modified files:
- src/lib/data/legs.ts (added deleteLeg function)
- src/lib/data/legs.test.ts (added deleteLeg test)
- src/app/voyage/[id]/page.tsx (refactored to use VoyageContent wrapper)
- src/app/voyage/[id]/messages.ts (added legs deletion messages)
