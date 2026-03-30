# Story 5.2: Database Schema Updates for v1.0

Status: review

## Story

As a developer,
I want the database schema extended for v1.0 features,
So that admin, i18n, and user management capabilities are supported.

## Acceptance Criteria

### AC-1: Admin Column
**Given** the existing profiles table
**When** the migration runs
**Then** `is_admin BOOLEAN DEFAULT FALSE` column exists on profiles
**And** existing rows have `is_admin = false`

### AC-2: Language Preference Column
**Given** the existing profiles table
**When** the migration runs
**Then** `preferred_language VARCHAR(5) DEFAULT 'en'` column exists on profiles
**And** existing rows have `preferred_language = 'en'`

### AC-3: Account Disable Column
**Given** the existing profiles table
**When** the migration runs
**Then** `disabled_at TIMESTAMPTZ` column exists on profiles (nullable, default NULL)
**And** existing rows have `disabled_at = NULL`

### AC-4: RLS Policy Updates
**Given** the new columns on profiles
**When** a user updates their own profile via the app
**Then** they CAN update `preferred_language`
**And** they CANNOT update `is_admin` or `disabled_at` (admin-only columns)

### AC-5: Type Regeneration
**Given** the migration has been applied
**When** Supabase types are regenerated
**Then** `src/types/supabase.ts` includes the three new columns with correct types
**And** the project compiles with `npx tsc --noEmit`
**And** all existing tests pass with `npm run test`

## Tasks / Subtasks

- [x] Task 1: Create migration file (AC: #1, #2, #3)
  - [x] Run `supabase migration new v1_profile_columns`
  - [x] Add three ALTER TABLE statements for the new columns
  - [x] Test locally with `supabase db reset`

- [x] Task 2: Update RLS policies (AC: #4)
  - [x] Replace `profiles_update_own` policy with a column-restricted version
  - [x] Ensure `is_admin` and `disabled_at` are excluded from user-writable columns
  - [x] Verify existing update flow still works (profile edit page)

- [x] Task 3: Regenerate Supabase types (AC: #5)
  - [x] Run `supabase gen types typescript --local > src/types/supabase.ts`
  - [x] Verify new columns appear in the `profiles` Row/Insert/Update types

- [x] Task 4: Update data layer types (AC: #5)
  - [x] Update `ProfileUpdate` type in `src/lib/data/profiles.ts` to exclude `is_admin` and `disabled_at`
  - [x] Ensure `preferred_language` is included in `ProfileUpdate`

- [x] Task 5: Verify build and tests (AC: #5)
  - [x] Run `npx tsc --noEmit` — zero errors
  - [x] Run `npm run test` — all existing tests pass
  - [x] Run `npm run build` — production build succeeds

## Dev Notes

### Migration SQL

Single migration file adding three columns. All use safe `ADD COLUMN` with defaults — no data migration or backfill needed.

```sql
-- Migration: v1_profile_columns
-- Add v1.0 columns to profiles table: admin flag, language preference, soft-disable

ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN preferred_language VARCHAR(5) NOT NULL DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN disabled_at TIMESTAMPTZ;
```

### RLS Policy: Column-Restricted Updates

The existing `profiles_update_own` policy allows users to update ANY column on their own row. With `is_admin` and `disabled_at` added, this is a security hole — users could grant themselves admin or re-enable a disabled account.

**Solution:** Replace the blanket UPDATE policy with one that uses a column check approach. Since Supabase RLS doesn't support column-level restrictions directly in the USING clause, the correct approach is to use a `WITH CHECK` clause that prevents changes to admin-only columns:

```sql
-- Drop the existing blanket update policy
DROP POLICY profiles_update_own ON profiles;

-- Recreate with column protection: users can only update their own row,
-- and cannot change is_admin or disabled_at
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM profiles WHERE id = auth.uid())
    AND disabled_at IS NOT DISTINCT FROM (SELECT disabled_at FROM profiles WHERE id = auth.uid())
  );
```

This ensures any UPDATE that attempts to change `is_admin` or `disabled_at` fails the WITH CHECK and is rejected. Admin operations will use `service_role` key which bypasses RLS entirely.

### Current Profiles Schema (Before Migration)

```sql
-- From 20260315211237_profiles.sql + 20260316094000_rename_pseudo_to_username.sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,      -- renamed from pseudo
  boat_name TEXT,
  boat_type TEXT,
  bio TEXT,
  profile_photo_url TEXT,
  boat_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)
```

### Current RLS Policies on Profiles

| Policy | Type | Rule |
|--------|------|------|
| `profiles_select_own` | SELECT | `auth.uid() = id` |
| `profiles_update_own` | UPDATE | `auth.uid() = id` |
| `Anyone can read profiles with public voyages` | SELECT | `id IN (SELECT user_id FROM voyages WHERE is_public = true)` |

Only `profiles_update_own` needs modification. The SELECT policies are unaffected.

### Data Layer Impact

**`src/lib/data/profiles.ts`** — Update the `ProfileUpdate` type to exclude admin-only columns:

```typescript
// Current:
export type ProfileUpdate = Omit<
  TablesUpdate<"profiles">,
  "created_at" | "id" | "updated_at"
>;

// Updated:
export type ProfileUpdate = Omit<
  TablesUpdate<"profiles">,
  "created_at" | "id" | "updated_at" | "is_admin" | "disabled_at"
>;
```

This ensures no application code path can accidentally pass `is_admin` or `disabled_at` through the standard profile update flow. Admin operations (Story 10.1+) will use a separate `src/lib/data/admin.ts` module with `service_role` client.

### What This Story Does NOT Include

- **No middleware changes** — disabled user check is Story 5.5 scope
- **No admin routes** — admin authorization is Epic 10 scope
- **No i18n integration** — language switching UI is Epic 9 scope
- **No profile UI changes** — language preference selector comes with i18n
- **No service_role client** — admin data functions come in Epic 10

### Downstream Consumers of New Columns

| Column | Consumer Story | Usage |
|--------|---------------|-------|
| `is_admin` | 10.1 (Admin Route & Authorization) | Middleware checks + Server Action guards |
| `preferred_language` | 9.4 (i18n Setup with next-intl) | Locale resolution from profile |
| `disabled_at` | 5.5 (Account Deletion with Data Cascade) | Soft-disable before permanent deletion |

### Testing Strategy

This story is schema-only. Verification is:
1. `supabase db reset` succeeds (migration applies cleanly)
2. `supabase gen types typescript` produces valid types with new columns
3. `npx tsc --noEmit` passes (type compatibility)
4. `npm run test` passes (no regressions from type changes)
5. `npm run build` succeeds

No new test files needed. The existing `profiles.test.ts` should continue passing since it mocks the Supabase client and doesn't depend on specific column lists.

### Project Structure Notes

- Migration file: `supabase/migrations/<timestamp>_v1_profile_columns.sql`
- Type update: `src/types/supabase.ts` (auto-generated, not hand-edited)
- Code change: `src/lib/data/profiles.ts` (type exclusion only)
- No new files created

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 5, Story 5.2 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Admin Zone Architecture (lines 1083-1119), i18n Architecture (lines 1121-1156)]
- [Source: _bmad-output/planning-artifacts/prd.md — NFR-8 (data isolation), NFR-11 (admin auth), NFR-13 (RGPD deletion)]
- [Source: supabase/migrations/20260315211237_profiles.sql — current profiles schema]
- [Source: supabase/migrations/20260316094000_rename_pseudo_to_username.sql — username rename]
- [Source: supabase/migrations/20260318090533_public_voyage_read_policies.sql — public read policies]
- [Source: src/lib/data/profiles.ts — current ProfileUpdate type and data functions]
- [Source: src/lib/data/profiles.test.ts — current test patterns]
- [Source: src/types/supabase.ts — current generated types (lines 169-204)]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- `supabase gen types typescript --local` outputs "Connecting to db 5432" to stdout — had to strip this line from generated supabase.ts

### Completion Notes List
- Created single migration `20260330050640_v1_profile_columns.sql` combining ALTER TABLE statements (AC-1, AC-2, AC-3) and RLS policy replacement (AC-4)
- Three columns added: `is_admin BOOLEAN NOT NULL DEFAULT FALSE`, `preferred_language VARCHAR(5) NOT NULL DEFAULT 'en'`, `disabled_at TIMESTAMPTZ`
- RLS policy `profiles_update_own` replaced with column-restricted version using `WITH CHECK` + `IS NOT DISTINCT FROM` subquery pattern to prevent privilege escalation
- `ProfileUpdate` type updated to exclude `is_admin` and `disabled_at` from standard update flows
- All 260 tests pass, TypeScript compiles cleanly, production build succeeds

### Change Log
- 2026-03-30: Story 5.2 implemented — database schema extensions for v1.0 (admin, i18n, account management)

### File List
- supabase/migrations/20260330050640_v1_profile_columns.sql (new)
- src/types/supabase.ts (regenerated)
- src/lib/data/profiles.ts (modified — ProfileUpdate type exclusion)
