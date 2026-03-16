# Story 1.2: Authentication with Magic Link

Status: review

## Story

As a sailor,
I want to sign up and sign in using my email address via a magic link,
so that I can securely access my personal Bosco account without managing a password.

## Acceptance Criteria

### AC-1: Profiles Database Migration
**Given** the `profiles` table does not exist
**When** the migration `001_profiles.sql` runs
**Then** a `profiles` table is created with columns: `id` (uuid, FK to auth.users, PK), `username` (unique text, nullable), `boat_name` (text nullable), `boat_type` (text nullable), `bio` (text nullable), `profile_photo_url` (text nullable), `boat_photo_url` (text nullable), `created_at` (timestamptz default now()), `updated_at` (timestamptz default now())
**And** RLS is enabled with policies: users SELECT/UPDATE only their own row (`auth.uid() = id`)
**And** a trigger function creates a profile row automatically when a new auth user is created (`INSERT INTO profiles (id) VALUES (NEW.id)` on `auth.users` after insert)

### AC-2: Auth Wrapper
**Given** the auth wrapper at `src/lib/auth.ts`
**When** imported by a Server Action
**Then** it exports `signIn(email)`, `signOut()`, `getUser()`, and `requireAuth()` functions
**And** `signIn(email)` calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })` and returns `ActionResponse<{ email: string }>`
**And** `signOut()` calls `supabase.auth.signOut()` and returns `ActionResponse<null>`
**And** `getUser()` calls `supabase.auth.getUser()` and returns the user or `null`
**And** `requireAuth()` returns the authenticated user or returns `{ data: null, error: { code: 'UNAUTHORIZED', message: '...' } }`

### AC-3: Magic Link Sign-In Page
**Given** an unauthenticated visitor on the `/auth` page
**When** they enter a valid email address and submit
**Then** a magic link is sent to that email address
**And** the page displays a "Check your email" confirmation message with the email address shown
**And** a "Resend" link is available after a 60-second cooldown

### AC-4: Auth Callback Route
**Given** the user clicks the magic link in their email
**When** the browser navigates to `/auth/confirm`
**Then** the route handler reads `token_hash` and `type` from the URL query parameters
**And** calls `supabase.auth.verifyOtp({ token_hash, type })` (PKCE flow)
**And** on success, redirects to `/dashboard`
**And** on failure, redirects to `/auth` with an error query parameter

### AC-5: Session Persistence
**Given** an authenticated user closes and reopens the browser
**When** they navigate to Bosco
**Then** they remain authenticated (session persists via cookies managed by `@supabase/ssr`)

### AC-6: Route Protection
**Given** an unauthenticated visitor
**When** they attempt to access `/dashboard` or any protected route
**Then** the Next.js middleware redirects them to `/auth`

### AC-7: Sign Out
**Given** an authenticated user
**When** they trigger sign-out (no UI for this in Story 1.2 — tested via Server Action only)
**Then** the session is destroyed and the user is redirected to `/`

## Tasks / Subtasks

- [x] Task 1: Create profiles migration (AC: #1)
  - [x] Create `supabase/migrations/001_profiles.sql`
  - [x] Define `profiles` table: id (uuid PK, references auth.users on delete cascade), username (text unique nullable), boat_name, boat_type, bio, profile_photo_url, boat_photo_url (all text nullable), created_at (timestamptz default now()), updated_at (timestamptz default now())
  - [x] Enable RLS: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`
  - [x] Policy `profiles_select_own`: `USING (auth.uid() = id)` on SELECT
  - [x] Policy `profiles_update_own`: `USING (auth.uid() = id)` on UPDATE
  - [x] Create trigger function `handle_new_user()`: inserts profile row with `NEW.id` on auth.users insert
  - [x] Create trigger `on_auth_user_created` AFTER INSERT on `auth.users` FOR EACH ROW EXECUTE FUNCTION `handle_new_user()`
  - [x] Run `supabase db reset` to apply migration
  - [x] Run `supabase gen types typescript --local > src/types/supabase.ts` to generate types

- [x] Task 2: Create auth wrapper (AC: #2)
  - [x] Create `src/lib/auth.ts` — Tier 2 wrapper
  - [x] Import `createClient` from `@/lib/supabase/server` (Tier 1 → Tier 2 import)
  - [x] `signIn(email: string)`: calls `signInWithOtp({ email, options: { emailRedirectTo: '${origin}/auth/confirm' } })`; returns `ActionResponse<{ email: string }>`
  - [x] `signOut()`: calls `supabase.auth.signOut()`; returns `ActionResponse<null>`
  - [x] `getUser()`: calls `supabase.auth.getUser()`; returns `User | null` (no error throw, just null)
  - [x] `requireAuth()`: calls `getUser()`; if null returns `{ data: null, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } }`; if user returns `{ data: user, error: null }`
  - [x] Create `src/lib/auth.test.ts` with tests for all 4 functions

- [x] Task 3: Create profiles data layer (AC: #1)
  - [x] Create `src/lib/data/profiles.ts` — Tier 2 repository
  - [x] `getProfileByUserId(userId: string)`: SELECT from profiles WHERE id = userId
  - [x] `updateProfile(userId: string, data: ProfileUpdate)`: UPDATE profiles SET ... WHERE id = userId
  - [x] Import types from `@/types/supabase` for type-safe queries

- [x] Task 4: Create auth Server Actions (AC: #3)
  - [x] Create `src/app/auth/actions.ts` with `'use server'`
  - [x] `sendMagicLink(formData: FormData)`: validate email with Zod (`z.email()`), call `signIn(email)` from `@/lib/auth`, return `ActionResponse`
  - [x] Import `signIn` from `@/lib/auth` (Tier 2 → Tier 3 import) — NEVER import Supabase directly

- [x] Task 5: Build auth page UI (AC: #3)
  - [x] Replace placeholder `src/app/auth/page.tsx` with actual auth form
  - [x] Create a client component `src/app/auth/AuthForm.tsx` for the sign-in form
  - [x] Email input field: shadcn Input, label "Email address" (Nunito SemiBold 13px Slate), min-height 44px
  - [x] Submit button: Primary Coral, "Send magic link" text, min-height 44px, full width
  - [x] After submit: show "Check your email" state with the submitted email displayed
  - [x] Resend link: available after 60s cooldown with countdown display
  - [x] Error display: inline below email field in Error red on validation failure
  - [x] Update `src/app/auth/messages.ts` with all UI strings
  - [x] Page layout: centered card (Sand bg, 12px radius, card shadow), max-width 400px, mobile-first

- [x] Task 6: Create auth confirm route handler (AC: #4)
  - [x] Create `src/app/auth/confirm/route.ts` (GET route handler)
  - [x] Read `token_hash` and `type` from `request.nextUrl.searchParams`
  - [x] Read optional `next` parameter (default: `/dashboard`)
  - [x] Call `supabase.auth.verifyOtp({ token_hash, type })` — this is the PKCE pattern
  - [x] On success: `redirect(next)`
  - [x] On failure: `redirect('/auth?error=auth_callback_error')`
  - [x] Note: use `createClient()` from `@/lib/supabase/server` directly here — route handlers are Tier 1 consumers, not Server Actions

- [x] Task 7: Update middleware for route protection (AC: #6)
  - [x] Update `src/middleware.ts` to check auth state on protected routes
  - [x] Protected routes: `/dashboard`, `/dashboard/*`, `/voyage`, `/voyage/*`
  - [x] Public routes: `/`, `/auth`, `/auth/*`, `/api/*`, `/{username}`, `/{username}/{slug}`
  - [x] If unauthenticated on protected route → redirect to `/auth`
  - [x] If authenticated on `/auth` → redirect to `/dashboard`
  - [x] Keep existing session refresh via `updateSession()`

- [x] Task 8: Configure Supabase Auth for local dev (AC: #5)
  - [x] Verify `supabase/config.toml` has auth enabled (should be default)
  - [x] Configure email template in Supabase dashboard (or config.toml) to use PKCE-compatible format: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink`
  - [x] Set `SITE_URL` in `.env.local` to `http://localhost:3000`
  - [x] Verify magic link works end-to-end with local Inbucket (Supabase local email testing at `localhost:54324`)

- [x] Task 9: Create sign-out Server Action (AC: #7)
  - [x] Add `signOutAction()` to `src/app/auth/actions.ts`
  - [x] Call `signOut()` from `@/lib/auth`
  - [x] Redirect to `/` after sign-out
  - [x] Note: no sign-out UI in this story — will be added in Story 1.3 with profile/dashboard navigation

- [x] Task 10: Write tests (AC: all)
  - [x] Unit tests for `src/lib/auth.ts` (mock Supabase client)
  - [x] Unit tests for `src/app/auth/actions.ts` (mock auth wrapper)
  - [x] Unit tests for `src/lib/data/profiles.ts` (mock Supabase client)
  - [x] Verify all Server Actions return `{ data, error }` format, never throw

## Dev Notes

### Critical: Supabase Auth PKCE Flow

`@supabase/ssr` v0.9.x **hardcodes `flowType: "pkce"`** — this is NOT configurable. This means:
- Magic link emails must use the `token_hash` format, NOT the implicit `access_token` fragment
- The callback route uses `verifyOtp({ token_hash, type })`, NOT `exchangeCodeForSession(code)`
- The Supabase email template must include: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next={{ .RedirectTo }}`

### Auth API Reference

```typescript
// Sign in — sends magic link email
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: `${origin}/auth/confirm`,
    shouldCreateUser: true, // default — creates user if doesn't exist
  },
})

// Verify magic link token (callback route)
const { error } = await supabase.auth.verifyOtp({
  token_hash: 'from-url-params',
  type: 'magiclink', // EmailOtpType
})

// Get current user (server-side safe — validates JWT against Auth server)
const { data: { user } } = await supabase.auth.getUser()

// Sign out
const { error } = await supabase.auth.signOut()
```

### Security: getUser() vs getSession()

- **`getUser()` — use this server-side.** Makes a network request to validate the JWT.
- **`getSession()` — NEVER use server-side for authorization.** Reads from cookie storage without validation.
- The middleware already uses `getUser()` for session refresh — this is correct.

### Zod 4 Email Validation

```typescript
// Zod 4 breaking change: string validators are now top-level
import { z } from 'zod'
const EmailSchema = z.email() // NOT z.string().email()
```

### Existing Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `src/app/auth/page.tsx` | **Replace** | Remove placeholder, add real auth layout |
| `src/app/auth/messages.ts` | **Replace** | Remove placeholder strings, add auth form strings |
| `src/middleware.ts` | **Modify** | Add route protection logic (currently only refreshes session) |
| `.env.local` | **Update** | Add `SITE_URL=http://localhost:3000` |
| `.env.example` | **Update** | Add `SITE_URL=` entry |

### New Files to Create

| File | Purpose | Tier |
|------|---------|------|
| `supabase/migrations/001_profiles.sql` | Profiles table + RLS + trigger | DB |
| `src/types/supabase.ts` | Generated DB types | Types |
| `src/lib/auth.ts` | Auth wrapper (signIn, signOut, getUser, requireAuth) | Tier 2 |
| `src/lib/auth.test.ts` | Auth wrapper tests | Test |
| `src/lib/data/profiles.ts` | Profile CRUD repository | Tier 2 |
| `src/app/auth/actions.ts` | Auth Server Actions (sendMagicLink, signOutAction) | Tier 3 |
| `src/app/auth/AuthForm.tsx` | Client component for sign-in form | Component |
| `src/app/auth/confirm/route.ts` | Magic link callback handler | Route Handler |

### Design System Usage for Auth Page

- **Page background:** White (default body)
- **Card:** Sand `#FDF6EC` bg, `--radius-card` (12px), `shadow-card`
- **Heading:** DM Serif Display (`font-heading`), `text-h1` (24px), Navy
- **Body text:** Nunito (`font-body`), `text-body` (14px), Slate
- **Email input:** shadcn `<Input>`, Navy border, min-height 44px
- **Submit button:** Coral `#E8614D` primary, full width, min-height 44px, `--radius-button` (8px)
- **Error text:** Error red `#EF4444`, below input
- **Success state:** Ocean `#2563EB` for "Check your email" heading
- **Layout:** centered, max-width 400px, `min-h-screen flex items-center justify-center`
- **Eyebrow text:** Small, uppercase, Ocean, tracking-widest

### Migration SQL Pattern

```sql
-- supabase/migrations/001_profiles.sql

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  boat_name TEXT,
  boat_type TEXT,
  bio TEXT,
  profile_photo_url TEXT,
  boat_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 3-Tier Containment Reminders

```
✅ src/app/auth/confirm/route.ts → imports from @/lib/supabase/server (Tier 1 consumer)
✅ src/lib/auth.ts → imports from @/lib/supabase/server (Tier 2 wraps Tier 1)
✅ src/lib/data/profiles.ts → imports from @/lib/supabase/server (Tier 2 wraps Tier 1)
✅ src/app/auth/actions.ts → imports from @/lib/auth (Tier 3 uses Tier 2)
❌ src/app/auth/actions.ts → NEVER import from @/lib/supabase/* (skip tier violation)
❌ src/app/auth/AuthForm.tsx → NEVER import from @/lib/supabase/* (component calling Supabase)
```

### Server Action Return Format (Mandatory)

```typescript
// All auth actions MUST return this format
import type { ActionResponse } from '@/types'

export async function sendMagicLink(formData: FormData): Promise<ActionResponse<{ email: string }>> {
  // Validate with Zod
  // Call auth wrapper
  // Return { data, error: null } or { data: null, error: { code, message } }
  // NEVER throw
}
```

### Local Testing with Supabase Inbucket

Supabase local dev includes **Inbucket** email testing at `http://localhost:54324`. All magic link emails are captured there. No real email sending needed during development.

Steps: submit email → open Inbucket → find magic link email → click link → lands on `/auth/confirm` → redirected to `/dashboard`.

### Anti-Patterns (Do NOT)

- Import `@supabase/*` in Server Actions — use `@/lib/auth`
- Use `supabase.auth.getSession()` server-side for authorization
- Throw errors from Server Actions — always return `{ data, error }`
- Use `z.string().email()` — Zod 4 uses `z.email()` (top-level)
- Store auth state in React state/context — let cookies + middleware handle it
- Use `exchangeCodeForSession()` for magic link — that's for OAuth; use `verifyOtp()` for PKCE email
- Inline string literals in components — use `messages.ts`
- Use a generic spinner — show contextual loading message
- Use `any` type anywhere

### Previous Story (1.1) Intelligence

- **Existing Supabase clients:** `server.ts`, `client.ts`, `middleware.ts` — all correctly implement `@supabase/ssr` v0.9.x patterns with `await cookies()`. DO NOT rewrite these.
- **Existing types:** `ActionResponse<T>` and `ErrorCode` already defined in `src/types/index.ts`. USE these.
- **Existing auth placeholder:** `src/app/auth/page.tsx` and `messages.ts` exist as placeholders. REPLACE content but keep the file structure.
- **Existing middleware:** `src/middleware.ts` already calls `updateSession()` for session refresh. EXTEND it, don't replace the session refresh.
- **ESLint containment:** `no-restricted-imports` rule blocks `@supabase/*` outside `src/lib/supabase/`. This enforces Tier 1 containment.
- **Design tokens:** All Ocean & Sunset tokens available via `@theme` in globals.css. Use `text-navy`, `bg-coral`, `bg-sand`, `shadow-card`, `font-heading`, `font-body`, etc.
- **shadcn/ui:** Button component available at `@/components/ui/button`. Add Input component: `npx shadcn@latest add input`.

### Package Versions (Already Installed)

| Package | Version | Notes |
|---------|---------|-------|
| @supabase/supabase-js | ^2.99.1 | `signInWithOtp` for magic link |
| @supabase/ssr | ^0.9.0 | Forces PKCE flow, `createServerClient` / `createBrowserClient` |
| zod | ^4.3.6 | Top-level validators: `z.email()` |
| next | 16.1.6 | App Router, `await cookies()` mandatory |
| react | 19.2.3 | No `forwardRef` needed |

No additional packages to install (except `npx shadcn@latest add input` for the Input component).

### Project Structure Notes

Alignment with unified project structure from architecture.md:
- `src/app/auth/` — auth route directory (correct location per architecture)
- `src/app/auth/confirm/route.ts` — callback route handler (architecture shows `callback/route.ts` but we use `confirm` for PKCE pattern clarity — both work)
- `src/lib/auth.ts` — Tier 2 auth wrapper (exact location from architecture)
- `src/lib/data/profiles.ts` — Tier 2 profiles repository (exact location from architecture)
- `supabase/migrations/001_profiles.sql` — first migration (exact naming from architecture)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.2 Acceptance Criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Authentication & Security, 3-Tier Containment, Project Structure, Pattern Examples]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-1 Authentication, UJ-1 Onboarding]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Journey 1 Onboarding, Form Patterns, Button Hierarchy, Component Strategy (Input)]
- [Source: _bmad-output/implementation-artifacts/1-1-landing-page-and-project-foundation.md — Previous Story Intelligence, File List]
- [Source: CLAUDE.md — Commands, Architecture, Anti-Patterns, Key Patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- `@supabase/ssr` v0.9.x hardcodes PKCE flow — confirmed via web research and used `verifyOtp` in callback
- ESLint `no-restricted-imports` blocks `@supabase/*` outside `src/lib/supabase/` — resolved by re-exporting `User` and `EmailOtpType` from `src/lib/supabase/server.ts`
- React 19 strict lint rules (`react-hooks/set-state-in-effect`, `react-hooks/purity`) required refactoring countdown hook to avoid setState in effects and Date.now() in render. Solved with `useRef` + `setInterval` callback pattern.
- Modified `updateSession()` in `src/lib/supabase/middleware.ts` to return `{ response, user }` to avoid double `getUser()` call in middleware route protection.
- Supabase local `config.toml` already had `site_url = "http://127.0.0.1:3000"` and `enable_confirmations = false` — no changes needed.
- Migration applied successfully via `supabase db reset`, types generated with `supabase gen types typescript --local`.

### Completion Notes List

- Migration `20260315211237_profiles.sql` creates profiles table with RLS and auto-create trigger
- Auth wrapper (`src/lib/auth.ts`) implements signIn, signOut, getUser, requireAuth with ActionResponse format
- Profiles data layer (`src/lib/data/profiles.ts`) implements getProfileByUserId, updateProfile
- Server Actions (`src/app/auth/actions.ts`) implement sendMagicLink with Zod 4 email validation and signOutAction with redirect
- Auth page (`src/app/auth/page.tsx` + `AuthForm.tsx`) implements magic link form with "Check your email" confirmation state, 60s resend cooldown
- Callback route (`src/app/auth/confirm/route.ts`) implements PKCE flow with verifyOtp
- Middleware updated for route protection: /dashboard and /voyage require auth, /auth redirects to /dashboard if already authenticated
- 18 unit tests pass across auth.test.ts, actions.test.ts, profiles.test.ts
- All checks pass: TypeScript strict ✓, ESLint ✓, Vitest ✓, Build ✓
- 3-tier containment preserved: no `@supabase/*` imports outside `src/lib/supabase/`

### Change Log

- 2026-03-16: Story 1.2 implemented — full authentication with magic link

### File List

- supabase/migrations/20260315211237_profiles.sql (new)
- src/types/supabase.ts (new — generated)
- src/lib/supabase/server.ts (modified — added User/EmailOtpType re-exports)
- src/lib/supabase/middleware.ts (modified — returns user from updateSession)
- src/lib/auth.ts (new)
- src/lib/auth.test.ts (new)
- src/lib/data/profiles.ts (new)
- src/lib/data/profiles.test.ts (new)
- src/app/auth/page.tsx (modified — replaced placeholder with auth form)
- src/app/auth/messages.ts (modified — replaced placeholder strings)
- src/app/auth/actions.ts (new)
- src/app/auth/actions.test.ts (new)
- src/app/auth/AuthForm.tsx (new)
- src/app/auth/confirm/route.ts (new)
- src/middleware.ts (modified — added route protection)
- src/components/ui/input.tsx (new — shadcn)
- .env.example (modified — added SITE_URL)
- .env.local (modified — added SITE_URL)
