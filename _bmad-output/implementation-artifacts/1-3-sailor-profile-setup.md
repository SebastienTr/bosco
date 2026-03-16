# Story 1.3: Sailor Profile Setup

Status: done

## Story

As a newly registered sailor,
I want to set up my profile with a unique username and boat information,
so that I have a personal identity on Bosco and a public URL for my voyages.

## Acceptance Criteria

### AC-1: New User Redirect to Profile Setup
**Given** a newly authenticated user with no username set
**When** they navigate to `/dashboard`
**Then** the dashboard page checks their profile and redirects to `/dashboard/profile`

**Given** an existing user with a username already set
**When** they navigate to `/dashboard`
**Then** they remain on the dashboard (no redirect)

### AC-2: Profile Form Display
**Given** the profile setup form at `/dashboard/profile`
**When** the user views the form
**Then** fields are displayed: username (required), boat name (optional), boat type (optional), bio (optional), profile photo (optional), boat photo (optional)
**And** labels are above inputs in Nunito SemiBold 13px Slate
**And** required fields are marked with a subtle dot

### AC-3: Username Availability Check
**Given** the user types a username in the username field
**When** they pause typing (300ms debounce)
**Then** a real-time availability check runs via a `checkUsername` Server Action
**And** a green check icon appears if the username is available
**And** an error message appears below the field in Error red if the username is taken

### AC-4: Profile Save
**Given** the user submits the profile form with valid data
**When** the `updateProfile` Server Action processes the request
**Then** the profile is saved to the `profiles` table via `src/lib/data/profiles.ts`
**And** the user is redirected to `/dashboard`
**And** a success toast appears: "Profile created"

### AC-5: Photo Upload
**Given** the user uploads a profile photo or boat photo
**When** the image is selected
**Then** it is compressed client-side to under 1 MB before upload
**And** the file type (image/jpeg, image/png, image/webp) and size (max 10 MB original) are validated
**And** the image is uploaded via `src/lib/storage.ts` to Supabase Storage
**And** the photo URL is saved to the profile

### AC-6: Form Validation
**Given** the user submits invalid data (empty username, username with special characters, username too short/long)
**When** the form validates on blur and on submit
**Then** inline error messages appear below the invalid fields in Error red
**And** the form is not submitted until validation passes

### AC-7: Profile Edit (Existing User)
**Given** an existing user visits `/dashboard/profile`
**When** the page loads
**Then** the form is pre-filled with their current profile data
**And** they can update any field and save changes
**And** a success toast appears: "Profile updated"

## Tasks / Subtasks

- [x] Task 1: Create Supabase Storage bucket migration (AC: #5)
  - [x] Create `supabase/migrations/20260316075758_storage_buckets.sql`
  - [x] Create `avatars` bucket with 10MB limit and image MIME types
  - [x] RLS policy: authenticated users can INSERT to their own folder
  - [x] RLS policy: authenticated users can UPDATE their own files
  - [x] RLS policy: authenticated users can DELETE their own files
  - [x] RLS policy: anyone can SELECT from the public `avatars` bucket (public read)

- [x] Task 2: Create storage wrapper (AC: #5)
  - [x] Create `src/lib/storage.ts` — Tier 2 wrapper
  - [x] `uploadFile` — uploads file to Supabase Storage, returns path + publicUrl
  - [x] `getPublicUrl` — async, returns public URL via Supabase client
  - [x] `deleteFile` — removes files from storage
  - [x] Import `createClient` from `@/lib/supabase/server` (Tier 1 → Tier 2)
  - [x] Return `ActionResponse` format — never throw
  - [x] Create `src/lib/storage.test.ts` with tests for all 3 functions

- [x] Task 3: Install dependencies (AC: #2, #5)
  - [x] `npm install browser-image-compression`
  - [x] `npx shadcn@latest add label textarea avatar sonner`
  - [x] Add `<Toaster />` from `@/components/ui/sonner` to `src/app/layout.tsx`

- [x] Task 4: Create image compression utility (AC: #5)
  - [x] Create `src/lib/utils/image.ts` — client-side utility
  - [x] `compressImage` with defaults: maxSizeMB=1, maxWidthOrHeight=1920, useWebWorker=true
  - [x] `validateImageFile` — checks type (jpeg/png/webp) and size (max 10MB)

- [x] Task 5: Add `checkUsernameAvailability` to data layer (AC: #3)
  - [x] Added `checkUsernameAvailability(username, excludeUserId?)` to `src/lib/data/profiles.ts`
  - [x] Added RPC-backed test coverage in `src/lib/data/profiles.test.ts`

- [x] Task 6: Create profile Server Actions (AC: #3, #4, #5, #6)
  - [x] Create `src/app/dashboard/profile/actions.ts` with `'use server'`
  - [x] `checkUsername` — validates username format with Zod, checks availability
  - [x] `saveProfile` — validates all fields, checks username availability, updates profile
  - [x] `uploadPhoto` — unified upload action for both profile and boat photos
  - [x] Zod schemas for username (3-20 chars, lowercase alphanumeric + hyphens) and profile
  - [x] All actions return `ActionResponse<T>` — never throw
  - [x] Create `src/app/dashboard/profile/actions.test.ts` with 18 tests

- [x] Task 7: Build profile page and form (AC: #1, #2, #3, #4, #6, #7)
  - [x] Create `src/app/dashboard/profile/page.tsx` — server component with auth + profile loading
  - [x] Create `src/app/dashboard/profile/ProfileForm.tsx` — client component with all form fields
  - [x] Username field with debounced availability check (300ms), green check/red X indicator
  - [x] Photo upload with client-side compression and preview
  - [x] Toast notifications for success/error via Sonner
  - [x] Create `src/app/dashboard/profile/messages.ts` — all UI strings externalized

- [x] Task 8: Update dashboard page for profile redirect (AC: #1)
  - [x] Modify `src/app/dashboard/page.tsx` — redirect to `/dashboard/profile` if no username
  - [x] Replace placeholder content with real dashboard showing username + boat info
  - [x] Update `src/app/dashboard/messages.ts` — remove Story 1.3 placeholder references

- [x] Task 9: Write tests (AC: all)
  - [x] Unit tests for `src/lib/storage.ts` (5 tests — upload success/error, getPublicUrl, delete success/error)
  - [x] Unit tests for `src/lib/data/profiles.ts` (4 tests — query, RPC availability, RPC error, update)
  - [x] Unit tests for `src/app/dashboard/profile/actions.ts` (18 tests — checkUsername, saveProfile, uploadPhoto)
  - [x] Component tests for `src/app/dashboard/profile/ProfileForm.tsx` (2 tests — blur validation, debounce cancellation)
  - [x] All Server Actions return `{ data, error }` format, never throw
  - [x] Full test suite: 49 tests pass (22 existing + 27 new)
  - [x] Build passes
  - [x] Lint clean (0 errors)
  - [x] TypeScript strict: no errors

## Dev Notes

### Username Validation Rules

```typescript
// Zod 4 — top-level validators
import { z } from 'zod'

const UsernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-z][a-z0-9-]*$/, 'Username must start with a letter and contain only lowercase letters, numbers, and hyphens')

const ProfileSchema = z.object({
  username: UsernameSchema,
  boat_name: z.string().max(100).optional().or(z.literal('')),
  boat_type: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
})
```

Username is used in public URLs (`/{username}`), so it must be URL-safe. The DB already has a UNIQUE constraint on the `username` column.

### Storage Wrapper Pattern

Architecture mandates `src/lib/storage.ts` as a Tier 2 wrapper. It follows the same pattern as `src/lib/auth.ts`:

```typescript
// src/lib/storage.ts — Tier 2 (imports from Tier 1 only)
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/types'

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
): Promise<ActionResponse<{ path: string; publicUrl: string }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: options?.contentType,
      upsert: options?.upsert ?? true,
    })
  if (error) return { data: null, error: { code: 'EXTERNAL_SERVICE_ERROR', message: error.message } }
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return { data: { path: data.path, publicUrl: urlData.publicUrl }, error: null }
}
```

### Supabase Storage Bucket Setup

```sql
-- Migration: storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- RLS: authenticated users upload to their own folder
CREATE POLICY "Users upload own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (select auth.uid()::text));

-- RLS: authenticated users update their own files
CREATE POLICY "Users update own avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND owner_id = (select auth.uid()::text));

-- RLS: authenticated users delete their own files
CREATE POLICY "Users delete own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND owner_id = (select auth.uid()::text));

-- RLS: public read (bucket is public, but explicit policy for clarity)
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
```

Storage path convention: `{user_id}/profile.{ext}` for profile photos, `{user_id}/boat.{ext}` for boat photos. Use `upsert: true` to overwrite on re-upload.

### Client-Side Image Compression

```typescript
// src/lib/utils/image.ts — CLIENT ONLY (uses browser APIs)
import imageCompression from 'browser-image-compression'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_ORIGINAL_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_COMPRESSED_SIZE = 1 // 1 MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are accepted' }
  }
  if (file.size > MAX_ORIGINAL_SIZE) {
    return { valid: false, error: 'Image must be under 10 MB' }
  }
  return { valid: true }
}

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: MAX_COMPRESSED_SIZE,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
  })
}
```

**Install:** `npm install browser-image-compression` — built-in TypeScript types, auto-uses Web Worker.

### Photo Upload Flow

1. User selects image file in `<input type="file" accept="image/jpeg,image/png,image/webp">`
2. `validateImageFile(file)` — reject if wrong type or >10MB
3. `compressImage(file)` — compress to <1MB client-side (runs in Web Worker)
4. Show preview using `URL.createObjectURL(compressedFile)`
5. Wrap compressed file in FormData, call `uploadProfilePhoto(formData)` Server Action
6. Server Action: `requireAuth()` → `uploadFile('avatars', '{userId}/profile.jpg', file, { upsert: true })` → `updateProfile(userId, { profile_photo_url: publicUrl })`
7. Toast success or error

### shadcn/ui Components to Install

```bash
npx shadcn@latest add label textarea avatar sonner
```

**Sonner (Toast) setup — add `<Toaster />` to layout:**
```tsx
// src/app/layout.tsx — add this import and component
import { Toaster } from "@/components/ui/sonner"

// Inside <body>, after {children}:
<Toaster richColors position="bottom-center" />
```

**Toast usage in client components:**
```typescript
import { toast } from "sonner"

// After successful save:
toast.success("Profile created")

// After error:
toast.error("Failed to save profile")
```

Toast is client-side only — call it in the client component's `onSubmit` handler after the Server Action returns.

### Username Availability Check Pattern

```typescript
// In ProfileForm.tsx — debounced availability check
const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

// Use useRef + setTimeout for debounce (300ms)
// On username input change:
// 1. Clear previous timeout
// 2. Set new timeout (300ms)
// 3. Inside timeout: call checkUsername Server Action
// 4. Update usernameStatus based on response
```

Do NOT use `useEffect` for this — React 19 strict mode rules. Use the `onChange` handler directly with a `useRef` for the debounce timer.

### Design System Usage

- **Page background:** Foam `bg-foam`
- **Form card:** White bg, `rounded-[var(--radius-card)]` (12px), `shadow-card`, max-width 600px centered
- **Labels:** Nunito SemiBold 13px Slate — `<Label className="text-small font-semibold text-slate">`
- **Required dot:** Small Coral dot next to label — `<span className="text-coral">*</span>`
- **Inputs:** shadcn `<Input>`, min-height 44px, Navy border
- **Textarea:** shadcn `<Textarea>`, rows=3
- **Avatar preview:** shadcn `<Avatar>` with `<AvatarImage>` + `<AvatarFallback>` (user initials or anchor icon)
- **Submit button:** Coral primary, full width on mobile, `min-h-[44px]`
- **Error text:** Error red `text-error` (#EF4444), `text-small`, below input
- **Success icon (username available):** Green check `text-success` (#10B981)
- **Heading:** DM Serif Display `font-heading text-h1 text-navy` — "Create your profile" or "Edit your profile"
- **Eyebrow:** `text-small font-semibold uppercase tracking-[0.2em] text-ocean` — "Profile"
- **Layout:** `min-h-screen bg-foam px-4 py-16`, form centered `mx-auto max-w-xl`

### Existing Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `src/app/dashboard/page.tsx` | **Modify** | Add profile check + redirect if no username |
| `src/app/dashboard/messages.ts` | **Modify** | Remove placeholder "Story 1.3" references |
| `src/lib/data/profiles.ts` | **Modify** | Add `checkUsernameAvailability` function |
| `src/lib/data/profiles.test.ts` | **Modify** | Add test for new function |
| `src/app/layout.tsx` | **Modify** | Add `<Toaster />` component |

### New Files to Create

| File | Purpose | Tier |
|------|---------|------|
| `supabase/migrations/XXXXXX_storage_buckets.sql` | Avatars bucket + RLS policies | DB |
| `src/lib/storage.ts` | Storage wrapper (uploadFile, getPublicUrl, deleteFile) | Tier 2 |
| `src/lib/storage.test.ts` | Storage wrapper tests | Test |
| `src/lib/utils/image.ts` | Client-side image compression | Client Utility |
| `src/app/dashboard/profile/page.tsx` | Profile setup page (server component) | Page |
| `src/app/dashboard/profile/ProfileForm.tsx` | Profile form (client component) | Component |
| `src/app/dashboard/profile/actions.ts` | Profile Server Actions | Tier 3 |
| `src/app/dashboard/profile/actions.test.ts` | Server Action tests | Test |
| `src/app/dashboard/profile/messages.ts` | i18n strings | i18n |

### 3-Tier Containment Reminders

```
✅ src/lib/storage.ts → imports from @/lib/supabase/server (Tier 2 wraps Tier 1)
✅ src/app/dashboard/profile/actions.ts → imports from @/lib/auth, @/lib/data/profiles, @/lib/storage (Tier 3 uses Tier 2)
✅ src/app/dashboard/profile/ProfileForm.tsx → calls Server Actions only (Tier 4)
✅ src/app/dashboard/page.tsx → imports from @/lib/auth, @/lib/data/profiles (Tier 3/4)
❌ src/app/dashboard/profile/actions.ts → NEVER import from @/lib/supabase/* (skip tier violation)
❌ src/app/dashboard/profile/ProfileForm.tsx → NEVER import from @/lib/supabase/* or @/lib/data/*
❌ src/lib/utils/image.ts → NEVER import server modules (this is client-only)
```

### Server Action Return Format (Mandatory)

```typescript
import type { ActionResponse } from '@/types'

export async function saveProfile(formData: FormData): Promise<ActionResponse<{ username: string }>> {
  // 1. requireAuth()
  // 2. Parse + validate with Zod
  // 3. Call updateProfile() from @/lib/data/profiles
  // 4. Return { data: { username }, error: null } or { data: null, error: { code, message } }
  // NEVER throw
}
```

### Anti-Patterns (Do NOT)

- Import `@supabase/*` in Server Actions or components — use wrappers
- Use `supabase.auth.getSession()` server-side — use `getUser()` or `requireAuth()`
- Throw from Server Actions — return `{ data, error }`
- Use `z.string().email()` — Zod 4 uses top-level `z.email()`
- Inline string literals in components — use `messages.ts`
- Use `any` type anywhere
- Place custom components in `src/components/ui/` — shadcn only
- Import `browser-image-compression` in server-side code — it's browser-only
- Use `useEffect` for the debounce — use `onChange` handler with `useRef` timer
- Store compressed image in state as base64 — use `URL.createObjectURL()` for previews
- Upload uncompressed images — always compress client-side first
- Forget to add `accept="image/jpeg,image/png,image/webp"` to file inputs

### Previous Story (1.2) Intelligence

- **Auth wrapper:** `src/lib/auth.ts` with `signIn`, `signOut`, `getUser`, `requireAuth` — all return `ActionResponse<T>`. USE `requireAuth()` in profile actions.
- **Profiles data layer:** `src/lib/data/profiles.ts` has `getProfileByUserId` and `updateProfile` — reuse these, add `checkUsernameAvailability`.
- **ProfileUpdate type:** `Omit<TablesUpdate<"profiles">, "created_at" | "id" | "updated_at">` — already defined, includes `username`, `boat_name`, `boat_type`, `bio`, `profile_photo_url`, `boat_photo_url`.
- **ActionResponse type:** Already in `src/types/index.ts` with `ErrorCode` enum.
- **Dashboard placeholder:** `src/app/dashboard/page.tsx` explicitly says "Story 1.3 will replace this placeholder". REPLACE it.
- **ESLint containment:** `no-restricted-imports` blocks `@supabase/*` outside `src/lib/supabase/`.
- **Design tokens:** All Ocean & Sunset tokens available via `@theme` in globals.css.
- **shadcn/ui:** Button and Input already installed. Need to add: Label, Textarea, Avatar, Sonner.
- **React 19 patterns:** No `forwardRef` needed. `await cookies()` in server code. Strict hooks rules apply (no setState in effects, no Date.now() in render).
- **Supabase client:** `createClient()` from `@/lib/supabase/server` is async (uses `await cookies()`).
- **signOutAction:** Exists in `src/app/auth/actions.ts` — no sign-out UI yet. Story 1.3 can optionally add a sign-out link in the profile page header, but it's not required.
- **Middleware:** Already protects `/dashboard` and `/dashboard/*` — no changes needed.

### Package Versions (Relevant)

| Package | Version | Notes |
|---------|---------|-------|
| @supabase/supabase-js | ^2.99.1 | `supabase.storage.from().upload()` |
| @supabase/ssr | ^0.9.0 | Server client with cookie handling |
| zod | ^4.3.6 | Top-level validators: `z.string().min(3)` |
| next | 16.1.6 | App Router, `await cookies()` mandatory |
| react | 19.2.3 | No `forwardRef`, strict hooks rules |
| browser-image-compression | ^2.0.2 | **TO INSTALL** — client-side compression |

### Project Structure Notes

Alignment with unified project structure from architecture.md:
- `src/app/dashboard/profile/` — profile route directory (nested under dashboard)
- `src/app/dashboard/profile/actions.ts` — co-located Server Actions (per architecture convention)
- `src/app/dashboard/profile/messages.ts` — co-located i18n strings
- `src/lib/storage.ts` — Tier 2 storage wrapper (exact location from architecture)
- `src/lib/utils/image.ts` — utility for image compression (architecture specifies `src/lib/utils/image.ts`)
- `supabase/migrations/` — sequential migration files

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.3 Acceptance Criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Vendor Strategy (Storage), 3-Tier Containment, Project Structure, File Uploads Pattern, Image Optimization]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-2 User Profile, UJ-1 Onboarding, NFR-7 Image Validation, NFR-12 Image Compression]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Journey 1 Onboarding, Form Patterns, Component Strategy, Visual Design Foundation]
- [Source: _bmad-output/implementation-artifacts/1-2-authentication-with-magic-link.md — Previous Story Intelligence, File List, Dev Agent Record]
- [Source: CLAUDE.md — Commands, Architecture, Anti-Patterns, Key Patterns, Naming Conventions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- `getPublicUrl` initially was sync, but `"use server"` files require all exports to be async — changed to async using Supabase client
- FormData `.get()` returns `null` for missing fields — added `?? ""` fallback for optional profile fields in `saveProfile`
- Sonner component uses `next-themes`'s `useTheme()` which works without explicit ThemeProvider (defaults gracefully)
- Combined `uploadProfilePhoto` and `uploadBoatPhoto` into single `uploadPhoto` action with `field` parameter for DRY

### Completion Notes List

- Migration `20260316075758_storage_buckets.sql` creates `avatars` bucket with RLS policies for authenticated upload/update/delete and public read
- Migration `20260316093000_check_username_availability.sql` adds an authenticated RPC helper so username checks work under profile RLS
- Storage wrapper (`src/lib/storage.ts`) implements uploadFile, getPublicUrl, deleteFile with ActionResponse format
- Image compression utility (`src/lib/utils/image.ts`) uses `browser-image-compression` with Web Worker support
- Profile data layer updated with RPC-backed `checkUsernameAvailability` and dedicated tests
- Shared profile validation module keeps username rules aligned between client and server
- Profile Server Actions (`src/app/dashboard/profile/actions.ts`) implement checkUsername, saveProfile, uploadPhoto with Zod validation and unique-username race handling
- Profile page (`src/app/dashboard/profile/page.tsx` + `ProfileForm.tsx`) implements complete profile setup/edit form with blur validation and stale-debounce protection
- Dashboard page updated: redirects to profile if no username set, shows real profile data when username exists
- Toaster (Sonner) added to root layout for toast notifications
- 27 new tests across storage, profiles, profile actions, and profile form coverage
- All 49 tests pass, TypeScript strict clean, ESLint clean, build succeeds
- 3-tier containment preserved: no `@supabase/*` imports outside `src/lib/supabase/`

### Change Log

- 2026-03-16: Story 1.3 implemented — sailor profile setup with storage, image compression, and form
- 2026-03-16: Code review fixes applied — RPC username availability, inline blur validation, debounce race fix, and expanded tests

### File List

- supabase/migrations/20260316075758_storage_buckets.sql (new)
- supabase/migrations/20260316093000_check_username_availability.sql (new)
- src/lib/storage.ts (new)
- src/lib/storage.test.ts (new)
- src/lib/utils/image.ts (new)
- src/lib/data/profiles.ts (modified — RPC-backed checkUsernameAvailability)
- src/lib/data/profiles.test.ts (modified — added RPC availability coverage)
- src/types/supabase.ts (modified — added RPC typing)
- src/app/dashboard/profile/page.tsx (new)
- src/app/dashboard/profile/ProfileForm.tsx (new)
- src/app/dashboard/profile/ProfileForm.test.tsx (new)
- src/app/dashboard/profile/actions.ts (new)
- src/app/dashboard/profile/actions.test.ts (new)
- src/app/dashboard/profile/messages.ts (new)
- src/app/dashboard/profile/validation.ts (new)
- src/app/dashboard/page.tsx (modified — profile redirect + real content)
- src/app/dashboard/messages.ts (modified — removed placeholder)
- src/app/layout.tsx (modified — added Toaster)
- src/components/ui/label.tsx (new — shadcn)
- src/components/ui/textarea.tsx (new — shadcn)
- src/components/ui/avatar.tsx (new — shadcn)
- src/components/ui/sonner.tsx (new — shadcn)
- package.json (modified — added browser-image-compression + shadcn deps)
- package-lock.json (modified)
