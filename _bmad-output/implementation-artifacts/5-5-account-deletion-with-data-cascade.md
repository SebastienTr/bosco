# Story 5.5: Account Deletion with Data Cascade

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to delete my account and all associated data,
so that I can exercise my RGPD right to erasure.

## Acceptance Criteria

1. **Given** an authenticated user on the profile settings page, **When** the user taps "Delete my account", **Then** a confirmation dialog warns that the account, voyages, journal data, and uploaded media will be permanently deleted
2. **Given** the user confirms account deletion, **When** Bosco begins the operation, **Then** the account is immediately blocked from further authenticated use, the current session is signed out, and the deletion flow proceeds irreversibly
3. **Given** the deletion flow completes successfully, **When** Bosco removes the account, **Then** the auth user is deleted and all related application data is removed through the existing database cascades, and Bosco-owned storage files are deleted from `avatars`, `voyage-covers`, and `log-photos`
4. **Given** the deletion flow finishes, **When** the browser returns to the public site, **Then** the user is redirected to the landing page with a clear confirmation message and can no longer access protected routes with the deleted account

## Tasks / Subtasks

- [x] Task 1: Add the profile-page danger-zone UI for account deletion (AC: #1, #4)
  - [x] Add a dedicated client component such as `src/app/dashboard/profile/DeleteAccountSection.tsx` instead of folding destructive logic into `ProfileForm`
  - [x] Reuse the existing `AlertDialog` pattern from `src/app/voyage/[id]/settings/VoyageSettingsForm.tsx` for the confirmation step
  - [x] Add destructive-copy and loading/error/success strings to `src/app/dashboard/profile/messages.ts`
  - [x] Update `src/app/dashboard/profile/page.tsx` to render the new section without changing `SharePendingRedirect`, `ProfileForm`, `SignOutButton`, or the legal-links section introduced in Story 5.4
  - [x] On success, show a toast and redirect with `router.replace("/?accountDeleted=1")` or an equivalent landing-page-safe confirmation path
  - [x] If landing-page copy is added for the confirmation state, update every locale object in `src/app/landing-messages.ts` rather than only `en`/`fr`

- [x] Task 2: Implement the secure server action and server-only admin client (AC: #2, #3)
  - [x] Extend `src/app/dashboard/profile/actions.ts` with a logged `deleteAccount` Server Action that returns `ActionResponse<{ success: true }>`
  - [x] Validate the destructive input explicitly before deleting anything; do not trust a bare client click with no server-side validation
  - [x] Add a server-only Supabase admin helper under `src/lib/supabase/` (for example `src/lib/supabase/admin.ts`) that uses the existing Supabase URL plus a non-public `SUPABASE_SERVICE_ROLE_KEY`
  - [x] Add the new server-only env var to `.env.example` and fail fast with a precise error if it is missing
  - [x] Keep `@supabase/supabase-js` imports contained to `src/lib/supabase/` only; Server Actions must keep calling Tier 2 abstractions

- [x] Task 3: Orchestrate deletion in a safe order using the existing schema cascades (AC: #2, #3)
  - [x] Use a Tier 2 helper in `src/lib/data/profiles.ts` or a narrowly scoped account-deletion module to set `profiles.disabled_at = now()` before destructive cleanup starts
  - [x] Use the disabled flag as the immediate lockout mechanism; do not rely on `signOut()` alone because Supabase cannot revoke an already-issued access JWT until it expires
  - [x] Reuse the existing cascade chain instead of hand-deleting every relational table: `auth.users -> profiles -> voyages -> legs/stopovers/log_entries`
  - [x] Delete storage objects explicitly before or during auth-user deletion, covering Bosco-owned paths in:
  - [x] `avatars/{userId}/profile.*`
  - [x] `avatars/{userId}/boat.*`
  - [x] `voyage-covers/{userId}/{voyageId}/cover.*`
  - [x] `log-photos/{userId}/{voyageId}/logs/*`
  - [x] Implement recursive storage cleanup with `storage.list()` plus `storage.remove()` batches; do not assume a single flat folder and do not assume `remove()` can delete a folder by prefix
  - [x] Hard-delete the auth user with the admin client (`auth.admin.deleteUser(userId)`); let the existing `ON DELETE CASCADE` relationships remove `profiles`, `voyages`, `legs`, `stopovers`, and `log_entries`
  - [x] Clear the current session cookies as part of the flow, but do not treat client sign-out as the primary deletion mechanism
  - [x] If a failure occurs before auth-user deletion completes, return a real error, capture it via logging/Sentry, and avoid reporting success for a partially deleted account

- [x] Task 4: Close auth and middleware gaps so disabled/deleted users are actually locked out (AC: #2, #4)
  - [x] Update `src/lib/auth.ts` so `getUser()` / `requireAuth()` treat a `disabled_at` profile as unauthorized instead of returning a usable authenticated user
  - [x] Review `src/lib/supabase/middleware.ts` and `src/middleware.ts` so they apply the same disabled-account rule and do not create `/auth` <-> `/dashboard` redirect loops with stale cookies
  - [x] Check the server pages that currently call `getUser()` directly (`src/app/dashboard/page.tsx`, `src/app/voyage/page.tsx`) so their behavior matches the updated lockout rule
  - [x] Ensure the post-delete redirect target remains publicly reachable even if stale cookies are still present in the browser

- [x] Task 5: Add regression coverage for destructive flow, lockout, and landing confirmation (AC: #1, #2, #3, #4)
  - [x] Add/extend `src/app/dashboard/profile/actions.test.ts` for success, validation failure, unauthenticated failure, storage-cleanup failure, and admin-user-deletion failure
  - [x] Add component coverage for the new delete section and dialog copy, following the existing testing style around `ProfileForm` and `ProfilePage`
  - [x] Extend `src/app/dashboard/profile/page.test.tsx` so it asserts the new danger-zone section without regressing sign-out and legal links
  - [x] Extend `src/app/page.test.tsx` or a new landing test to cover the post-delete confirmation state
  - [x] Add or extend tests for `src/lib/auth.ts` and any middleware helper changed for disabled-account lockout
  - [x] Run `npm run test`, `npm run typecheck`, and `npm run build`

## Dev Notes

### Story Intent

This story is the implementation half of Bosco's RGPD erasure promise:

- Story 5.4 published the legal/user-facing commitment
- Story 5.2 added `profiles.disabled_at` specifically for this downstream work
- Story 5.5 must turn that promise into a real product flow that blocks the account immediately, deletes Bosco-controlled storage objects, and lets the existing relational cascades do the rest

The important distinction is:

- **product-controlled deletion** should happen immediately in-app
- **backup retention caveats** remain a legal/compliance note from Story 5.4 and do not justify leaving live product data around

### Current State

- `src/app/dashboard/profile/page.tsx` currently renders profile editing, sign-out, and legal links, but no account-deletion UI
- `src/app/dashboard/profile/actions.ts` currently handles username checks, profile saves, and photo uploads only
- `profiles.disabled_at` exists in the schema but is not enforced anywhere in auth or middleware yet
- `src/lib/auth.ts` checks only whether Supabase returned a user; it does not inspect the corresponding profile row
- `src/middleware.ts` currently protects `/dashboard` and `/voyage` based only on whether `updateSession()` returned a user
- Bosco already deletes storage files in narrower flows:
  - voyage cover deletion in `src/app/voyage/[id]/settings/actions.ts`
  - log-photo deletion in `src/app/voyage/[id]/log/actions.ts`
- there is currently **no** service-role client helper and `.env.example` does not include a service-role key
- the landing page is a client component (`src/app/page.tsx`) backed by `src/app/landing-messages.ts`, and the global toaster is already mounted in `src/app/layout.tsx`

### Database Cascade Intelligence

The schema already gives you most of the relational deletion behavior:

- `profiles.id REFERENCES auth.users(id) ON DELETE CASCADE`
- `voyages.user_id REFERENCES profiles(id) ON DELETE CASCADE`
- `legs.voyage_id REFERENCES voyages(id) ON DELETE CASCADE`
- `stopovers.voyage_id REFERENCES voyages(id) ON DELETE CASCADE`
- `log_entries.voyage_id REFERENCES voyages(id) ON DELETE CASCADE`

Important nuance:

- `log_entries.leg_id` and `log_entries.stopover_id` are `ON DELETE SET NULL`, but that does not matter for full-account deletion because the `voyage_id` cascade removes the row anyway
- storage objects are **not** covered by these relational cascades; they must be deleted explicitly

### Storage Cleanup Requirements

Bosco's current upload conventions are already predictable enough to clean up by account prefix:

- profile photos and boat photos: `avatars/{userId}/profile.{ext}` and `avatars/{userId}/boat.{ext}`
- voyage covers: `voyage-covers/{userId}/{voyageId}/cover.{ext}`
- journal photos: `log-photos/{userId}/{voyageId}/logs/{timestamp}.{ext}`

Do not scatter bucket-walking logic inside the Server Action.

Recommended approach:

- keep bucket access behind `src/lib/storage.ts`
- add a recursive helper that can:
  - list folders/files under a prefix
  - recurse into subfolders
  - batch file deletions
  - return explicit failures

This prevents the action from becoming an unreadable mix of auth, storage, and UI concerns.

### Existing Code Patterns You Must Follow

**Profile page composition**

- Keep `src/app/dashboard/profile/page.tsx` as a Server Component
- Keep destructive interactivity in a dedicated client component, similar in spirit to `SignOutButton`
- Do not move account deletion into `ProfileForm`; profile edit/save and destructive account deletion are separate responsibilities

**Server Action pattern**

- Use the existing `ActionResponse<T>` contract from `src/types/index.ts`
- Wrap the new action with `withLogging(...)`, matching Story 5.3 conventions
- Return structured errors; do not throw for expected failures

**Dialog/toast UX**

- Reuse `AlertDialog` from `src/components/ui/alert-dialog`
- Reuse `sonner` toasts, matching `ProfileForm`, `VoyageSettingsForm`, and other client flows
- Keep touch targets at or above 44px

**Landing copy**

- `src/app/landing-messages.ts` is a large typed object with many locales, not just English and French
- Any new `landingMessages` keys added for a success banner/toast helper must be added to every locale object or TypeScript will fail

### Architecture Compliance

**Containment rule still applies**

1. `@supabase/supabase-js` stays inside `src/lib/supabase/`
2. Tier 2 modules (`src/lib/data/*`, `src/lib/storage.ts`, `src/lib/auth.ts`) may call the Supabase helpers
3. Server Actions call only Tier 2 modules/helpers
4. Components call only Server Actions

Implications for this story:

- do **not** instantiate a service-role client directly inside `src/app/dashboard/profile/actions.ts`
- do **not** import `@supabase/supabase-js` in any app route/component file
- do **not** expose the service-role key via `NEXT_PUBLIC_*`

**No new migration is expected**

- `disabled_at` already exists
- the cascade relationships already exist
- this story should primarily be app-layer orchestration plus auth/storage helpers

### Auth and Lockout Guardrails

This story can easily produce a subtle auth bug if implemented naively.

Critical guardrail:

- `signOut()` alone is not enough for "immediate invalidation" because Supabase cannot revoke an already-issued access JWT until it expires

Implementation consequence:

- use `profiles.disabled_at` as the immediate app-level lock
- make `getUser()` / `requireAuth()` reject disabled accounts
- align middleware with the same rule

If you update only the Server Action and not the auth gates, you risk:

- protected pages loading briefly for a "deleted" user
- stale-session access until JWT expiry
- `/auth` redirect loops caused by middleware thinking the user is still signed in while page-level auth disagrees

### Failure-Handling Guardrails

Do not mark the story complete with a "happy path only" implementation.

You need explicit handling for:

- service-role env missing
- storage-list or storage-remove failure
- admin delete-user failure
- current-user auth missing or already stale

At minimum:

- surface a user-facing destructive-flow error
- log the failure through the existing logging wrapper / Sentry pipeline
- avoid reporting success when auth deletion or storage cleanup did not actually complete

### Testing Requirements

- Vitest + Testing Library remain the repo standard
- Collocated tests are already the dominant pattern
- Cover the irreversible-path logic, not just rendering:
  - lockout behavior
  - storage cleanup invocation
  - auth-admin deletion
  - landing redirect/confirmation
- Preserve all existing profile-page behavior from Story 5.4 while adding the new danger zone

### Previous Story Intelligence (5.4)

Useful carry-forward from Story 5.4:

- The profile page already grew once for legal links; keep the same compositional discipline and do not regress those sections
- Story 5.4 explicitly avoided inventing behavior not grounded in the live repo; follow the same principle here
- Bosco's legal copy already states that account deletion aims to remove voyages, legs, stopovers, log entries, photos, and account data within 30 days
- If you change user-facing deletion copy, it must stay consistent with `src/lib/legal/content.ts`

### Git Intelligence Summary

Recent commits show the most relevant patterns:

- `9a819f6` (`5.2`) added `disabled_at` and explicitly documented Story 5.5 as its downstream consumer
- `05ae46e` (`5.3`) standardized `withLogging` instrumentation; the new destructive action must follow it
- `cc817e9` / `dd470d6` (`5.4`) touched the profile page, landing messages, legal content, and related tests

Practical takeaway:

- extend the recently touched profile/landing/test surfaces rather than inventing parallel patterns
- trust the live repo over older architecture examples if there is drift

### Latest Technical Information

Latest official Supabase docs relevant to this story:

- `supabase.auth.signOut()` removes the browser session and refresh tokens, but Supabase documents that there is **no way to revoke an already-issued access token until it expires**
- admin user deletion is performed with `auth.admin.deleteUser(userId)` and requires a service-role-capable client
- `storage.list()` returns both files and folders, with folder entries carrying `null` metadata fields, and the default list limit is 100 items
- `storage.remove()` deletes explicit file paths; it does not delete a folder by passing only a prefix

Implementation consequence:

- immediate lockout must include an app-level disabled-account check, not just sign-out
- account-wide storage cleanup must recurse and batch explicit file paths instead of assuming one call can wipe a folder tree

This last point is an inference from the official storage list/remove APIs plus Bosco's nested path structure.

### Project Structure Notes

Recommended files for this story:

- `src/app/dashboard/profile/page.tsx`
- `src/app/dashboard/profile/messages.ts`
- `src/app/dashboard/profile/actions.ts`
- `src/app/dashboard/profile/actions.test.ts`
- `src/app/dashboard/profile/DeleteAccountSection.tsx`
- `src/app/dashboard/profile/DeleteAccountSection.test.tsx`
- `src/app/page.tsx`
- `src/app/page.test.tsx`
- `src/app/landing-messages.ts`
- `src/lib/auth.ts`
- `src/lib/auth.test.ts`
- `src/lib/data/profiles.ts`
- `src/lib/data/profiles.test.ts`
- `src/lib/storage.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/middleware.ts`
- `src/middleware.ts`
- `.env.example`

Anti-patterns to avoid:

- deleting relational rows one table at a time instead of using the existing cascade chain
- hardcoding bucket cleanup inline in the component or Server Action
- exposing service-role credentials to client code
- updating only `requireAuth()` but forgetting `getUser()` / middleware alignment
- forgetting to update every landing-page locale if a confirmation-state message is added there

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 5 / Story 5.5]
- [Source: _bmad-output/planning-artifacts/prd.md — RGPD / GDPR Compliance]
- [Source: _bmad-output/planning-artifacts/prd.md — Legal & Compliance]
- [Source: _bmad-output/planning-artifacts/prd.md — NFR-13]
- [Source: _bmad-output/planning-artifacts/architecture.md — Vendor Strategy Decision]
- [Source: _bmad-output/planning-artifacts/architecture.md — Admin Zone Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md — Updated FR → Structure Mapping]
- [Source: _bmad-output/implementation-artifacts/5-2-database-schema-updates-for-v1.md — Downstream Consumers of New Columns]
- [Source: _bmad-output/implementation-artifacts/5-4-privacy-policy-and-terms-of-service.md — In-App Settings Integration Notes]
- [Source: _bmad-output/implementation-artifacts/5-4-privacy-policy-and-terms-of-service.md — RGPD / Privacy Content Requirements]
- [Source: src/app/dashboard/profile/page.tsx]
- [Source: src/app/dashboard/profile/actions.ts]
- [Source: src/app/dashboard/profile/messages.ts]
- [Source: src/app/dashboard/profile/ProfileForm.tsx]
- [Source: src/app/dashboard/profile/page.test.tsx]
- [Source: src/app/page.tsx]
- [Source: src/app/page.test.tsx]
- [Source: src/app/landing-messages.ts]
- [Source: src/lib/auth.ts]
- [Source: src/lib/auth.test.ts]
- [Source: src/lib/data/profiles.ts]
- [Source: src/lib/data/profiles.test.ts]
- [Source: src/lib/data/voyages.ts]
- [Source: src/lib/data/log-entries.ts]
- [Source: src/lib/storage.ts]
- [Source: src/lib/logging.ts]
- [Source: src/lib/supabase/server.ts]
- [Source: src/lib/supabase/middleware.ts]
- [Source: src/middleware.ts]
- [Source: supabase/migrations/20260315211237_profiles.sql]
- [Source: supabase/migrations/20260316092642_voyages.sql]
- [Source: supabase/migrations/20260316122237_legs.sql]
- [Source: supabase/migrations/20260316145232_stopovers.sql]
- [Source: supabase/migrations/20260326100000_log_entries.sql]
- [Source: supabase/migrations/20260316075758_storage_buckets.sql]
- [Source: supabase/migrations/20260317084259_voyage_covers_bucket.sql]
- [Source: supabase/migrations/20260326100001_log_photos_bucket.sql]
- [Source: https://supabase.com/docs/reference/javascript/auth-signout]
- [Source: https://supabase.com/docs/reference/javascript/auth-admin-deleteuser]
- [Source: https://supabase.com/docs/reference/javascript/storage-from-list]
- [Source: https://supabase.com/docs/reference/javascript/storage-from-remove]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Implemented `DeleteAccountSection` with `AlertDialog` confirmation, destructive copy, toast feedback, and `router.replace("/?accountDeleted=1")`
- Added a logged `deleteAccount` Server Action plus `src/lib/supabase/admin.ts` and `SUPABASE_SERVICE_ROLE_KEY` validation
- Added recursive storage deletion in `src/lib/storage.ts`, account-deletion orchestration in `src/lib/data/account-deletion.ts`, and immediate `profiles.disabled_at` lockout in `src/lib/data/profiles.ts`
- Updated `src/lib/auth.ts` and `src/lib/supabase/middleware.ts` so disabled accounts are treated as unauthorized and stale sessions are signed out
- Validation completed with `npm run test`, `npm run typecheck`, and `npm run build`

### Completion Notes List

- Added a dedicated profile danger zone with irreversible account deletion confirmation, success/error toasts, and a landing-page confirmation banner for every supported locale
- Implemented a logged, validated delete-account Server Action that disables the profile immediately, signs out the session, deletes Bosco-owned storage recursively, and hard-deletes the auth user via the service-role admin client
- Locked disabled users out across `getUser()`, `requireAuth()`, and middleware so stale cookies cannot continue using protected routes or create `/auth` to `/dashboard` redirect loops
- Added regression coverage for the destructive flow, storage cleanup recursion, auth/middleware lockout, landing confirmation, Supabase admin env parsing, and deletion orchestration
- Full validation passed: `npm run test`, `npm run typecheck`, and `npm run build`

### File List

- .env.example
- _bmad-output/implementation-artifacts/5-5-account-deletion-with-data-cascade.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- src/app/dashboard/profile/DeleteAccountSection.test.tsx
- src/app/dashboard/profile/DeleteAccountSection.tsx
- src/app/dashboard/profile/actions.test.ts
- src/app/dashboard/profile/actions.ts
- src/app/dashboard/profile/messages.ts
- src/app/dashboard/profile/page.test.tsx
- src/app/dashboard/profile/page.tsx
- src/app/landing-messages.ts
- src/app/page.test.tsx
- src/app/page.tsx
- src/lib/auth.test.ts
- src/lib/auth.ts
- src/lib/data/account-deletion.test.ts
- src/lib/data/account-deletion.ts
- src/lib/data/profiles.test.ts
- src/lib/data/profiles.ts
- src/lib/storage.test.ts
- src/lib/storage.ts
- src/lib/supabase/admin.ts
- src/lib/supabase/config.test.ts
- src/lib/supabase/config.ts
- src/lib/supabase/middleware.test.ts
- src/lib/supabase/middleware.ts
- src/middleware.test.ts

## Change Log

- 2026-03-30: Implemented account deletion UI, landing confirmation messaging, service-role account deletion orchestration, recursive storage cleanup, disabled-account auth lockout, and full regression coverage for Story 5.5
