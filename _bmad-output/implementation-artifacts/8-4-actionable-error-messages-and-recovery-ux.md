# Story 8.4: Actionable Error Messages & Recovery UX

Status: done

## Story

As a user encountering an error,
I want to understand what went wrong and how to fix it,
so that I can recover without frustration.

## Acceptance Criteria

1. **Given** an operation fails (import, upload, auth, network), **When** the error is displayed, **Then** the message follows the anatomy: **what happened** (plain language, no jargon) + **why** (context) + **what to do** (actionable recovery).

2. **Given** a network error occurs during any operation, **When** the toast is displayed, **Then** it includes a "Retry" button and preserves user state (no data loss).

3. **Given** a GPX import fails because the file is not GPX format, **When** the error is shown, **Then** the message says "This file isn't GPX format", explains Bosco works with GPX files, and offers a link to the Navionics export guide (Story 8.5 placeholder).

4. **Given** any toast.error() call in the codebase, **When** it fires, **Then** it uses a message from the co-located `messages.ts` — no hardcoded English strings in component code.

5. **Given** an error toast is displayed, **Then** it is persistent (not auto-dismissed) and requires user interaction to dismiss, per UX spec feedback patterns.

6. **Given** the global error boundary renders (`src/app/error.tsx`), **Then** it shows a contextual message with clear recovery path (retry button + link to dashboard).

7. **Given** any Server Action returns an `ActionError`, **When** the component handles it, **Then** the error code is mapped to a user-friendly message via a centralized utility, not by passing raw `error.message` from the server.

## Tasks / Subtasks

- [x] Task 1: Create error message mapping utility (AC: #7)
  - [x] 1.1 Create `src/lib/errors.ts` with `getUserErrorMessage(error: ActionError): ErrorDisplay` utility
  - [x] 1.2 Define `ErrorDisplay` type: `{ title: string; description: string; action?: { label: string; onClick: () => void } }`
  - [x] 1.3 Map each `ErrorCode` to a default user-friendly message following what/why/action anatomy
  - [x] 1.4 Allow override with custom message string (for context-specific messages from `messages.ts`)
  - [x] 1.5 Write unit tests for all error code mappings

- [x] Task 2: Create `showActionError` toast helper (AC: #1, #2, #4, #5)
  - [x] 2.1 Create `src/lib/toast-helpers.ts` with `showActionError(error: ActionError, options?)` function
  - [x] 2.2 Uses `getUserErrorMessage()` internally for default messages
  - [x] 2.3 Accepts optional override message from messages.ts, optional retry callback
  - [x] 2.4 Calls `toast.error()` with persistent duration (Infinity) per UX spec
  - [x] 2.5 When `error.code === 'EXTERNAL_SERVICE_ERROR'` and retry callback provided, shows "Retry" action button
  - [x] 2.6 Write unit tests

- [x] Task 3: Migrate all hardcoded toast.error() strings to messages.ts (AC: #4)
  - [x] 3.1 Fix `StopoverMarkers.tsx`: replace 3 hardcoded strings with `messages.stopovers.*` entries
  - [x] 3.2 Fix `GpxImporter.tsx`: replace hardcoded "Import failed — please try again"
  - [x] 3.3 Audit all other toast.error() calls — ensure each uses messages.ts constant
  - [x] 3.4 Add missing error message keys to relevant messages.ts files

- [x] Task 4: Refactor component error handling to use `showActionError` (AC: #1, #7)
  - [x] 4.1 Update `CreateVoyageDialog.tsx` — use showActionError instead of raw toast.error(result.error.message)
  - [x] 4.2 Update `ProfileForm.tsx` — use showActionError for all error paths
  - [x] 4.3 Update `VoyageSettingsForm.tsx` — use showActionError
  - [x] 4.4 Update `LegList.tsx` — use showActionError
  - [x] 4.5 Update `StopoverPanel.tsx` — use showActionError
  - [x] 4.6 Update `StopoverMarkers.tsx` — use showActionError
  - [x] 4.7 Update `LogEntryForm.tsx` — use showActionError
  - [x] 4.8 Update `JournalSection.tsx` — use showActionError
  - [x] 4.9 Update `DeleteAccountSection.tsx` — use showActionError
  - [x] 4.10 Update `ShareTargetHandler.tsx` — use showActionError
  - [x] 4.11 Update `ShareButton.tsx` — review (copy success/fail may stay as simple toast)

- [x] Task 5: Enhance GPX import error messages (AC: #3)
  - [x] 5.1 Update GPX import error states with what/why/action anatomy
  - [x] 5.2 Add "Need help?" link in error state pointing to `/help/navionics-export` (Story 8.5 placeholder route)
  - [x] 5.3 Differentiate error messages: wrong format, file too large, processing failure, network error
  - [x] 5.4 Add error message keys to `src/app/voyage/[id]/import/messages.ts`

- [x] Task 6: Enhance global error boundary (AC: #6)
  - [x] 6.1 Update `src/app/error.tsx` with richer recovery UI: retry button + "Back to Dashboard" link
  - [x] 6.2 Add Sentry error reporting on render (`Sentry.captureException`)
  - [x] 6.3 Update messages in `src/app/messages.ts`

- [x] Task 7: Tests and regression check (AC: all)
  - [x] 7.1 Unit tests for `src/lib/errors.ts`
  - [x] 7.2 Unit tests for `src/lib/toast-helpers.ts`
  - [x] 7.3 Run full test suite — zero regressions
  - [x] 7.4 TypeScript strict mode passes

## Dev Notes

### Error Message Anatomy (from UX Spec)

Every error message MUST follow this 3-part structure:
1. **What happened** — clear, no jargon (e.g., "This file isn't GPX format")
2. **Why** — context (e.g., "Bosco works with GPX files exported from navigation apps")
3. **What to do** — actionable next step (e.g., "Export from Navionics: Tracks → Select → Export → GPX format")

### Existing Infrastructure — DO NOT recreate

| Component | Location | Status |
|-----------|----------|--------|
| Toast system (Sonner) | `src/components/ui/sonner.tsx` | Installed, configured, mounted in layout.tsx |
| ActionResponse/ActionError types | `src/types/index.ts` | Defined with 6 error codes |
| Error boundary | `src/app/error.tsx` | Basic — needs enhancement |
| Sentry logging wrapper | `src/lib/logging.ts` | Wraps Server Actions with `withLogging()` |
| Co-located messages.ts | Every route directory | Pattern established — extend, don't replace |

### ErrorCode → Default User Messages

Map these in `src/lib/errors.ts`:

```typescript
const ERROR_MESSAGES: Record<ErrorCode, { title: string; description: string }> = {
  VALIDATION_ERROR: {
    title: "Invalid input",
    description: "Please check the form fields and try again.",
  },
  NOT_FOUND: {
    title: "Not found",
    description: "This item may have been deleted or moved.",
  },
  UNAUTHORIZED: {
    title: "Sign in required",
    description: "Your session may have expired. Please sign in again.",
  },
  FORBIDDEN: {
    title: "Access denied",
    description: "You don't have permission to perform this action.",
  },
  EXTERNAL_SERVICE_ERROR: {
    title: "Connection problem",
    description: "Something went wrong on our end. Please try again.",
  },
  PROCESSING_ERROR: {
    title: "Processing failed",
    description: "We couldn't process your request. Please try again.",
  },
};
```

These are **defaults only**. Components should override with context-specific messages from their `messages.ts` when available (e.g., "Failed to delete stopover" is better than generic "Processing failed").

### Toast Helper API Design

```typescript
// src/lib/toast-helpers.ts
import { toast } from "sonner";
import type { ActionError } from "@/types";
import { getUserErrorMessage } from "@/lib/errors";

interface ShowActionErrorOptions {
  /** Override default message derived from error code */
  message?: string;
  /** Override default description */
  description?: string;
  /** Retry callback — shows "Retry" action button */
  onRetry?: () => void;
}

export function showActionError(error: ActionError, options?: ShowActionErrorOptions) {
  const defaults = getUserErrorMessage(error);
  const title = options?.message ?? defaults.title;
  const description = options?.description ?? defaults.description;

  toast.error(title, {
    description,
    duration: Infinity, // Persistent per UX spec
    action: options?.onRetry
      ? { label: "Retry", onClick: options.onRetry }
      : undefined,
  });
}
```

### Specific Error States Table (from UX Spec)

| Error | Message (what) | Why/Context | Recovery (what to do) |
|-------|---------------|-------------|----------------------|
| Wrong file format | "This file isn't GPX format" | "Bosco works with GPX files from navigation apps" | Link to Navionics export guide |
| File too large (>400MB) | "This file is too large (X MB)" | "Maximum file size is 400 MB" | "Try exporting fewer tracks" |
| Network error during upload | "Upload interrupted — no connection" | — | "Retry" button, preserve state |
| Processing failure | "Something went wrong processing this file" | — | "Retry" button + "Contact us" |
| Magic link expired | "This link has expired" | — | "Resend magic link" button |
| Username taken | "This username is already taken" | — | Inline suggestions (already implemented) |

### Hardcoded Strings to Fix (from codebase audit)

These toast.error() calls use hardcoded strings and MUST be migrated to messages.ts:

1. `src/components/map/StopoverMarkers.tsx:38` — `"Failed to rename stopover"`
2. `src/components/map/StopoverMarkers.tsx:49` — `"Failed to delete stopover"`
3. `src/components/map/StopoverMarkers.tsx:63` — `"Failed to reposition stopover"`
4. `src/components/gpx/GpxImporter.tsx:262` — `"Import failed — please try again"`

### Feedback Pattern Rules (from UX Spec)

| Type | Component | Duration | Usage |
|------|-----------|----------|-------|
| Success | Toast (bottom-center) | 4s auto-dismiss | "2 tracks added", "Link copied" |
| Error (recoverable) | Toast (bottom-center) | Persistent until dismissed | "Import failed — tap to retry" |
| Error (critical) | Dialog (centered modal) | User-dismissed | "Could not save — check your connection" |

Rules:
- Toasts stack from bottom, max 2 visible at once
- Error toasts include a clear recovery action (retry, dismiss, contact)
- Never a generic spinner — always contextual message

### Design Tokens for Error States

```
Colors:
  Error: #EF4444 (error red) — error messages, error toasts, danger buttons
  Warning: #F59E0B (amber) — attention states, suggested corrections
  Success: #10B981 (sea green) — successful operations
  Info: #2563EB (ocean) — informational tips

Typography:
  Toast title: font-medium (Sonner default)
  Toast description: text-sm text-muted-foreground
  Error boundary title: font-heading text-h1 text-navy
  Error boundary description: text-body text-slate
  Inline field errors: text-sm text-[#EF4444]

Touch targets:
  All action buttons in toasts: minimum 44px height
  Error boundary retry button: rounded-[var(--radius-button)] px-6 py-3
```

### Anti-Patterns — DO NOT

- **DO NOT** create new notification/toast components — Sonner is already configured
- **DO NOT** remove existing inline validation patterns (field-level errors stay inline)
- **DO NOT** throw from Server Actions — always return `{ data, error }`
- **DO NOT** create a global error context/provider — keep error handling local to components
- **DO NOT** swallow errors silently — every error must be visible to the user OR logged to Sentry
- **DO NOT** show raw `error.message` from server in production — map through `getUserErrorMessage()` first; the raw message goes to Sentry, not the user
- **DO NOT** add new npm dependencies — Sonner is sufficient for all toast needs
- **DO NOT** modify `src/types/index.ts` ErrorCode enum — the existing 6 codes cover all cases

### Project Structure Notes

New files:
```
src/lib/errors.ts              — Error code mapping utility
src/lib/errors.test.ts         — Unit tests
src/lib/toast-helpers.ts       — showActionError() helper
src/lib/toast-helpers.test.ts  — Unit tests
```

Modified files (error message migration):
```
src/components/map/StopoverMarkers.tsx      — Use messages.ts + showActionError
src/components/gpx/GpxImporter.tsx          — Enhanced error messages
src/components/voyage/LegList.tsx           — Use showActionError
src/components/voyage/StopoverPanel.tsx     — Use showActionError
src/components/voyage/ShareButton.tsx       — Review toast calls
src/components/log/LogEntryForm.tsx         — Use showActionError
src/components/log/JournalSection.tsx       — Use showActionError
src/app/dashboard/CreateVoyageDialog.tsx    — Use showActionError
src/app/dashboard/profile/ProfileForm.tsx   — Use showActionError
src/app/dashboard/profile/DeleteAccountSection.tsx — Use showActionError
src/app/voyage/[id]/settings/VoyageSettingsForm.tsx — Use showActionError
src/app/share-target/ShareTargetHandler.tsx — Use showActionError
src/app/error.tsx                           — Enhanced recovery UI
src/app/messages.ts                         — Updated error messages
src/app/voyage/[id]/import/messages.ts      — GPX-specific error messages
src/app/voyage/[id]/stopover/messages.ts    — Stopover error messages (add missing keys)
```

### Previous Story Intelligence (Story 8.3)

- Clean implementation pattern: utility file + test file + component updates
- Test count at Story 8.3 completion: 390 tests — expect ~400+ after this story
- Dashboard components stable — changes are mostly to toast calls, not layout
- `messages.ts` expansion pattern: add new keys, preserve existing ones for backwards compat
- Dynamic import pattern for client components well established — not relevant for this story

### Git Intelligence

- Recent commits are all Story 7.6 work (dual CTA)
- Stories 8.1 and 8.3 in uncommitted changes
- Codebase conventions stable: kebab-case utility files, PascalCase components, co-located tests

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.4]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-55, FR-56, UJ-6 Error Recovery]
- [Source: _bmad-output/planning-artifacts/architecture.md — Error handling patterns, Server Action format]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Error Recovery UX, Feedback Patterns]
- [Source: src/types/index.ts — ActionResponse, ActionError, ErrorCode definitions]
- [Source: src/components/ui/sonner.tsx — Toast configuration]
- [Source: src/lib/logging.ts — Sentry integration wrapper]
- [Source: src/app/error.tsx — Global error boundary]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation, no blockers encountered.

### Completion Notes List

- Created `src/lib/errors.ts` with `getUserErrorMessage()` mapping all 6 ErrorCodes to user-friendly messages with what/why anatomy
- Created `src/lib/toast-helpers.ts` with `showActionError()` — persistent toasts (duration: Infinity), optional retry button, optional message/description overrides
- Migrated all 4 hardcoded `toast.error()` strings (StopoverMarkers x3, GpxImporter x1) to co-located messages.ts
- Refactored 11 components to use `showActionError()` instead of raw `toast.error(result.error.message)` — no raw server messages exposed to users
- ShareButton reviewed — clipboard copy/fail toasts kept as simple toast (not ActionErrors)
- Enhanced GPX import error flow: `ImportProgress` now supports structured errors with title/description/helpLink; `GpxImporter` classifies errors (not-GPX, processing failure) and shows contextual messages with "Need help?" link to `/help/navionics-export`
- Enhanced global error boundary (`src/app/error.tsx`): added Sentry error reporting, error icon, "Back to Dashboard" link alongside retry button
- 418/418 tests pass, 0 regressions. TypeScript strict mode clean.

**Code review fixes (4 findings):**
- **High**: IMPORT_ERROR now preserves result/geoNames; RETRY from import-error returns to preview (not idle); server import failures show toast instead of full-page error — user state preserved
- **Medium**: tooLarge messages now used via 400MB file size guard before processing; networkError messages used when EXTERNAL_SERVICE_ERROR from server import (with Retry button)
- **Medium**: ShareTargetHandler no longer renders raw `error.message` in DOM — uses `messages.error.createFailed` instead
- **Low**: All 3 `toast.error(validation.error)` sites for image validation now use messages.ts keys instead of hardcoded strings from image.ts
- Added 11 new tests: classifyProcessingError (5 tests) + importReducer state transitions (6 tests)

### Change Log

| Date | Change |
|------|--------|
| 2026-03-31 | Story created — ready-for-dev |
| 2026-03-31 | All tasks implemented — status: review |
| 2026-03-31 | Addressed code review findings — 4 items resolved (1 High, 2 Medium, 1 Low) |

### File List

New files:
- src/lib/errors.ts
- src/lib/errors.test.ts
- src/lib/toast-helpers.ts
- src/lib/toast-helpers.test.ts
- src/components/gpx/GpxImporter.test.ts

Modified files:
- src/components/map/StopoverMarkers.tsx
- src/components/gpx/GpxImporter.tsx
- src/components/gpx/ImportProgress.tsx
- src/components/voyage/LegList.tsx
- src/components/voyage/StopoverPanel.tsx
- src/components/log/LogEntryForm.tsx
- src/components/log/LogEntryForm.test.tsx
- src/components/log/JournalSection.tsx
- src/app/dashboard/CreateVoyageDialog.tsx
- src/app/dashboard/profile/ProfileForm.tsx
- src/app/dashboard/profile/DeleteAccountSection.tsx
- src/app/dashboard/profile/DeleteAccountSection.test.tsx
- src/app/dashboard/profile/messages.ts
- src/app/voyage/[id]/settings/VoyageSettingsForm.tsx
- src/app/voyage/[id]/settings/messages.ts
- src/app/voyage/[id]/import/messages.ts
- src/app/share-target/ShareTargetHandler.tsx
- src/app/error.tsx
- src/app/messages.ts
