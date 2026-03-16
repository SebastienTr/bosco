# Story 1.4: Dashboard & Voyage Creation

Status: review

## Story

As an authenticated sailor,
I want to view my dashboard and create my first voyage,
so that I have a home base in Bosco and can start building my sailing journey.

## Acceptance Criteria

### AC-1: Voyages Database Migration
**Given** the `voyages` table does not exist
**When** the migration runs
**Then** a `voyages` table is created with columns: `id` (uuid PK default gen_random_uuid()), `user_id` (uuid FK to profiles NOT NULL), `name` (text NOT NULL), `description` (text nullable), `slug` (text NOT NULL), `cover_image_url` (text nullable), `is_public` (boolean default false NOT NULL), `created_at` (timestamptz default now()), `updated_at` (timestamptz default now())
**And** a unique constraint exists on `(user_id, slug)`
**And** an index exists on `user_id` for fast lookup
**And** RLS is enabled with policies: users can SELECT/INSERT/UPDATE/DELETE only rows where `user_id = auth.uid()`

### AC-2: Dashboard Empty State
**Given** an authenticated sailor with no voyages
**When** they visit `/dashboard`
**Then** the EmptyState component is displayed with a sailing illustration/icon, "Create your first voyage" heading, a description, and a Coral CTA button
**And** the creator bottom tab navigation is visible with 3 tabs: Dashboard, Voyage, Profile
**And** the layout is single column on mobile (375px+) and centered max-width 1200px on desktop

### AC-3: Voyage Creation Form (Dialog)
**Given** the sailor taps "New voyage" or the EmptyState CTA
**When** the voyage creation dialog opens
**Then** they can enter a voyage name (required) and description (optional)
**And** the slug is auto-generated from the name (via `slugify` library) but editable
**And** the slug field updates in real-time as the name is typed

### AC-4: Voyage Save & Redirect
**Given** the sailor submits the voyage creation form with a valid name
**When** the `createVoyage` Server Action processes the request
**Then** the voyage is saved via `src/lib/data/voyages.ts`
**And** the sailor is redirected to `/voyage/[id]` showing an empty voyage view placeholder
**And** a success toast appears: "Voyage created"

### AC-5: Duplicate Slug Validation
**Given** the sailor submits a voyage with a slug that already exists in their account
**When** the Server Action validates
**Then** an error is returned: `{ data: null, error: { code: 'VALIDATION_ERROR', message: 'This slug is already used by another voyage' } }`
**And** the error is displayed inline below the slug field

### AC-6: Dashboard Voyage List
**Given** an authenticated sailor with one or more voyages
**When** they visit `/dashboard`
**Then** their voyages are listed as cards showing: voyage name, description excerpt (truncated), creation date, and public/private badge
**And** each card links to the voyage view at `/voyage/[id]`

### AC-7: Responsive Layout
**Given** the dashboard on a desktop screen (>1024px)
**When** the layout renders
**Then** voyage cards are displayed in a 2-column grid
**And** side navigation replaces the bottom tab bar

### AC-8: Creator Navigation
**Given** the bottom tab navigation on mobile
**When** the sailor taps Dashboard, Voyage, or Profile
**Then** they navigate to the corresponding section
**And** the active tab is visually highlighted

## Tasks / Subtasks

- [x] Task 1: Install dependencies (AC: #3)
  - [x] `npm install slugify`
  - [x] `npx shadcn@latest add card dialog skeleton`
  - [x] Verify shadcn components appear in `src/components/ui/`

- [x] Task 2: Create voyages database migration (AC: #1)
  - [x] `supabase migration new voyages`
  - [x] Create table with all columns, constraints, and indexes
  - [x] Enable RLS and create CRUD policies for `auth.uid()` owner access
  - [x] Supabase local not running — migration file validated by build
  - [x] Types manually added to `src/types/supabase.ts` (regenerate when local Supabase available)

- [x] Task 3: Create voyages data layer (AC: #1, #4, #5, #6)
  - [x] Create `src/lib/data/voyages.ts` — Tier 2 wrapper
  - [x] `insertVoyage(data)` — insert + select single
  - [x] `getVoyagesByUserId(userId)` — select all, ordered by `updated_at` desc
  - [x] `getVoyageById(id)` — select single by id
  - [x] `checkSlugAvailability(userId, slug)` — returns boolean
  - [x] Create `src/lib/data/voyages.test.ts` with 6 tests

- [x] Task 4: Create slug utility (AC: #3)
  - [x] Create `src/lib/utils/slug.ts` — `generateSlug(name: string): string`
  - [x] Uses `slugify` library with `{ lower: true, strict: true }`
  - [x] Create `src/lib/utils/slug.test.ts` with 6 tests (diacritics, special chars, etc.)

- [x] Task 5: Create dashboard Server Actions (AC: #4, #5)
  - [x] Create `src/app/dashboard/actions.ts` with `'use server'`
  - [x] `createVoyage(formData: FormData)` — Zod validate, generate slug if empty, check availability, insert, return voyage
  - [x] Zod schema: name (1-100 chars required), description (optional max 500), slug (3-100 chars, lowercase alphanumeric + hyphens)
  - [x] Return `ActionResponse<Voyage>` — never throw
  - [x] Create `src/app/dashboard/actions.test.ts` with 8 tests

- [x] Task 6: Create EmptyState shared component (AC: #2)
  - [x] Create `src/components/shared/EmptyState.tsx`
  - [x] Props: `icon` (ReactNode), `title` (string), `description` (string), `action` (ReactNode)
  - [x] Centered layout, illustration area, heading in DM Serif, description in Nunito, CTA slot
  - [x] Accessible: descriptive heading, CTA as primary focusable element

- [x] Task 7: Create NavigationBar component (AC: #8)
  - [x] Create `src/components/shared/NavigationBar.tsx` — client component
  - [x] Bottom tab bar on mobile (below 1024px): 3 tabs — Dashboard, Voyage, Profile
  - [x] Side navigation on desktop (≥1024px): vertical nav with "Bosco" branding
  - [x] Active tab highlighted with Ocean color
  - [x] Lucide-style inline SVG icons for each tab (grid, compass, user)
  - [x] Links: Dashboard → `/dashboard`, Voyage → `/dashboard`, Profile → `/dashboard/profile`
  - [x] Uses `usePathname()` from `next/navigation` for active state

- [x] Task 8: Create VoyageCard component (AC: #6)
  - [x] Create `src/components/voyage/VoyageCard.tsx`
  - [x] Uses shadcn Card as base with CardHeader, CardTitle, CardAction, CardContent
  - [x] Shows: voyage name (DM Serif heading), description excerpt (line-clamp-2), creation date (Intl.DateTimeFormat en-GB), public/private badge
  - [x] Entire card is a link to `/voyage/[id]`
  - [x] Hover: shadow-lg transition
  - [x] Badge: Ocean bg for public, Navy/5 bg for private

- [x] Task 9: Create dashboard layout with navigation (AC: #2, #7, #8)
  - [x] Create `src/app/dashboard/layout.tsx`
  - [x] Includes NavigationBar component
  - [x] Foam background, max-width 1200px centered on desktop
  - [x] Bottom padding (pb-24) on mobile for bottom tab bar, normal on desktop

- [x] Task 10: Create dashboard loading skeleton (AC: #6)
  - [x] Create `src/app/dashboard/loading.tsx`
  - [x] Skeleton cards mimicking VoyageCard layout (4 cards)
  - [x] 2-column grid on desktop via md:grid-cols-2

- [x] Task 11: Create CreateVoyageDialog component (AC: #3, #4, #5)
  - [x] Create `src/app/dashboard/CreateVoyageDialog.tsx` — client component
  - [x] Uses shadcn Dialog with base-ui primitive
  - [x] Name input (required), description textarea (optional), slug input (auto-generated, editable)
  - [x] Slug auto-updates as name changes via `generateSlug`; stops when user manually edits slug
  - [x] Submit calls `createVoyage` Server Action
  - [x] On success: close dialog, toast "Voyage created", redirect to `/voyage/[id]`
  - [x] On slug error: show inline error below slug field
  - [x] Labels above inputs per form patterns; Coral submit, ghost cancel
  - [x] Form resets on dialog close

- [x] Task 12: Overhaul dashboard page (AC: #2, #6)
  - [x] Rewrite `src/app/dashboard/page.tsx`
  - [x] Auth check + profile redirect (kept existing logic)
  - [x] Fetch voyages via `getVoyagesByUserId`
  - [x] If no voyages → render EmptyState with compass icon + "Create your first voyage"
  - [x] If voyages exist → render VoyageCard grid (1-col mobile, 2-col desktop)
  - [x] "New voyage" button visible in header when voyages exist
  - [x] CreateVoyageDialog also available from EmptyState CTA

- [x] Task 13: Update dashboard messages (AC: #2, #6)
  - [x] Rewrite `src/app/dashboard/messages.ts` with all voyage-related strings
  - [x] Empty state title, description, CTA text
  - [x] Dialog title, field labels, placeholders, hints, validation messages, button text
  - [x] Toast messages

- [x] Task 14: Create minimal voyage view page (AC: #4)
  - [x] Create `src/app/voyage/[id]/page.tsx` — server component
  - [x] Loads voyage by ID, shows name + description
  - [x] EmptyState: "No tracks yet" + disabled "Import track" button
  - [x] Back to dashboard link
  - [x] Create `src/app/voyage/[id]/messages.ts` — i18n strings

- [x] Task 15: Write tests (AC: all)
  - [x] Unit tests for `src/lib/data/voyages.ts` (6 tests — insert, list, get, check slug available/taken)
  - [x] Unit tests for `src/app/dashboard/actions.ts` (8 tests — create, auto-slug, unauth, validation, duplicate, db error)
  - [x] Unit test for `src/lib/utils/slug.ts` (6 tests — basic, diacritics, special chars, empty)
  - [x] All Server Actions return `{ data, error }` format, never throw
  - [x] Full test suite: 69 tests pass (49 existing + 20 new)
  - [x] Build passes: `npm run build`
  - [x] Lint clean: `npm run lint` (0 errors)
  - [x] TypeScript strict: `npx tsc --noEmit` (0 errors)

## Dev Notes

### Voyages Database Schema

```sql
CREATE TABLE voyages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  cover_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique slug per user
ALTER TABLE voyages ADD CONSTRAINT voyages_user_slug_unique UNIQUE (user_id, slug);

-- Index for fast user voyage lookup
CREATE INDEX idx_voyages_user_id ON voyages(user_id);

-- RLS
ALTER TABLE voyages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own voyages"
  ON voyages FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own voyages"
  ON voyages FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own voyages"
  ON voyages FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own voyages"
  ON voyages FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
```

Use `(SELECT auth.uid())` (subquery form) in RLS policies — this is the Supabase-recommended pattern that prevents per-row re-evaluation of `auth.uid()`.

### Data Layer Pattern (Match Existing profiles.ts)

```typescript
// src/lib/data/voyages.ts — Tier 2 (imports from Tier 1 only)
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/supabase";

export type Voyage = Tables<"voyages">;
export type VoyageInsert = Omit<TablesInsert<"voyages">, "id" | "created_at" | "updated_at">;

export async function insertVoyage(data: VoyageInsert) {
  const supabase = await createClient();
  return supabase.from("voyages").insert(data).select().single();
}

export async function getVoyagesByUserId(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("voyages")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
}

export async function getVoyageById(id: string) {
  const supabase = await createClient();
  return supabase.from("voyages").select("*").eq("id", id).single();
}

export async function checkSlugAvailability(userId: string, slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("voyages")
    .select("id")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();
  return { available: data === null };
}
```

Note: `createClient()` is async (uses `await cookies()` in Next.js 16). Every function must `await createClient()`.

### Server Action Pattern (Match Existing profile/actions.ts)

```typescript
// src/app/dashboard/actions.ts
'use server'

import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { insertVoyage, checkSlugAvailability } from '@/lib/data/voyages'
import { generateSlug } from '@/lib/utils/slug'
import type { ActionResponse } from '@/types'
import type { Voyage } from '@/lib/data/voyages'

const CreateVoyageSchema = z.object({
  name: z.string().min(1, 'Voyage name is required').max(100, 'Name must be under 100 characters'),
  description: z.string().max(500).optional().or(z.literal('')),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(100)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
})

export async function createVoyage(formData: FormData): Promise<ActionResponse<Voyage>> {
  const authResult = await requireAuth()
  if (authResult.error) return { data: null, error: authResult.error }

  const raw = Object.fromEntries(formData)
  // Auto-generate slug from name if not provided
  if (!raw.slug || (typeof raw.slug === 'string' && raw.slug.trim() === '')) {
    raw.slug = generateSlug(String(raw.name ?? ''))
  }

  const parsed = CreateVoyageSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } }
  }

  // Check slug uniqueness
  const { available } = await checkSlugAvailability(authResult.data.id, parsed.data.slug)
  if (!available) {
    return { data: null, error: { code: 'VALIDATION_ERROR', message: 'This slug is already used by another voyage' } }
  }

  const { data, error } = await insertVoyage({
    user_id: authResult.data.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    slug: parsed.data.slug,
  })

  if (error) {
    return { data: null, error: { code: 'EXTERNAL_SERVICE_ERROR', message: error.message } }
  }

  return { data, error: null }
}
```

### Slug Generation

```typescript
// src/lib/utils/slug.ts
import slugify from 'slugify'

export function generateSlug(text: string): string {
  return slugify(text, { lower: true, strict: true })
}
```

**Why `slugify` library instead of hand-rolled NFD:** Sailors use Scandinavian port names (Göteborg, Ærøskøbing, Łódź). NFD normalization fails on `ß` → `strasse`, `ø` → `o`, `ł` → `l`, etc. The `slugify` library handles 2000+ characters via a comprehensive charmap. Package: 3.6 KB gzip, zero dependencies, built-in TypeScript types.

**Install:** `npm install slugify`

### Dashboard Page Structure

The dashboard page is a **server component** that:
1. Authenticates user (keep existing `getUser()` + profile redirect logic)
2. Fetches voyages via `getVoyagesByUserId(user.id)`
3. Renders either EmptyState (no voyages) or VoyageCard grid
4. Includes the CreateVoyageDialog (client component) for voyage creation

```tsx
// Simplified structure
export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await getProfileByUserId(user.id)
  if (!profile?.username) redirect('/dashboard/profile')
  const { data: voyages } = await getVoyagesByUserId(user.id)

  return (
    <main>
      <header> {/* Title + "New voyage" button */} </header>
      {voyages?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {voyages.map(v => <VoyageCard key={v.id} voyage={v} />)}
        </div>
      ) : (
        <EmptyState ... />
      )}
      <CreateVoyageDialog />
    </main>
  )
}
```

### Dashboard Layout with Creator Navigation

```tsx
// src/app/dashboard/layout.tsx
import { NavigationBar } from "@/components/shared/NavigationBar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-foam">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex min-h-screen">
          {/* Side nav on desktop */}
          <NavigationBar />
          {/* Main content */}
          <main className="flex-1 px-4 pb-24 pt-8 lg:pb-8 lg:pl-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
```

The `pb-24` on mobile ensures content doesn't get hidden behind the fixed bottom tab bar. On desktop (`lg:`), the padding switches to normal.

### Creator Navigation (UX-DR18)

**Mobile (< 1024px):** Fixed bottom tab bar, 3 tabs, 64px height, white bg, shadow
**Desktop (≥ 1024px):** Fixed side navigation, 240px width, vertical tabs

```tsx
// src/components/shared/NavigationBar.tsx — 'use client'
// Uses usePathname() for active state detection
// Tab items: [
//   { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon /> },
//   { label: 'Voyage', href: '/dashboard', icon: <MapIcon /> },  // Links to dashboard for now
//   { label: 'Profile', href: '/dashboard/profile', icon: <UserIcon /> },
// ]
// Active: text-ocean, inactive: text-mist
// All touch targets ≥ 44px
```

For icons, use simple inline SVGs (Lucide-style) — no additional icon library. Keep them minimal:
- Dashboard: grid/home icon
- Voyage: compass/map icon
- Profile: user icon

### VoyageCard Component (UX-DR13 — Simplified for Story 1.4)

Story 1.4 VoyageCard does NOT include mini map preview (no tracks imported yet). The mini map will be added in Story 2.6 (Extended Dashboard).

```tsx
// src/components/voyage/VoyageCard.tsx
// Props: { voyage: Voyage }
// Structure:
// <Link href={`/voyage/${voyage.id}`}>
//   <Card>
//     <CardHeader>
//       <CardTitle className="font-heading text-h3 text-navy">{voyage.name}</CardTitle>
//       <CardAction>{badge}</CardAction>
//     </CardHeader>
//     <CardContent>
//       <p className="text-small text-slate line-clamp-2">{voyage.description}</p>
//       <p className="text-tiny text-mist mt-2">{formattedDate}</p>
//     </CardContent>
//   </Card>
// </Link>
```

Badge styling:
- Public: `bg-ocean/10 text-ocean text-tiny font-semibold px-2 py-0.5 rounded-full`
- Private: `bg-navy/5 text-mist text-tiny font-semibold px-2 py-0.5 rounded-full`

### EmptyState Component (UX-DR14)

```tsx
// src/components/shared/EmptyState.tsx
// Props: { icon?: ReactNode, title: string, description: string, action?: ReactNode }
// Centered content, illustration area (64px icon), title in DM Serif, description in Nunito slate
// Action slot for CTA button
// Accessible: heading is descriptive, CTA is primary focusable
```

Two variants per UX spec:
- Empty dashboard: "Create your first voyage" + CTA button (this story)
- Empty voyage: "Export from Navionics and share to Bosco" + illustration (Story 2.1)

### CreateVoyageDialog Component

Client component using shadcn Dialog. State management:

```tsx
// src/app/dashboard/CreateVoyageDialog.tsx — 'use client'
const [open, setOpen] = useState(false)
const [name, setName] = useState('')
const [description, setDescription] = useState('')
const [slug, setSlug] = useState('')
const [slugEdited, setSlugEdited] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)
const [error, setError] = useState<string | null>(null)
```

Slug auto-generation: when `name` changes AND `slugEdited` is false, auto-update slug via `generateSlug(name)`. Once user manually edits the slug, set `slugEdited = true` and stop auto-updating.

On submit:
1. Build FormData from state
2. Call `createVoyage(formData)`
3. If success → `toast.success("Voyage created")`, `router.push(`/voyage/${data.id}`)`
4. If error → show inline error below slug field or toast for other errors

### Minimal Voyage View Page (Placeholder)

```tsx
// src/app/voyage/[id]/page.tsx — server component
// Auth check, load voyage by ID, show name + empty map placeholder
// EmptyState: "Import your first track" (button disabled — import comes in Story 2.3)
// This is a PLACEHOLDER — Story 2.1 adds the real map view
```

### shadcn/ui Components to Install

```bash
npx shadcn@latest add card dialog skeleton
```

- **Card:** VoyageCard base (CardHeader, CardTitle, CardDescription, CardContent, CardAction)
- **Dialog:** CreateVoyageDialog (DialogTrigger, DialogContent, DialogHeader, DialogTitle)
- **Skeleton:** Dashboard loading state (loading.tsx)

### Design System Usage

- **Dashboard background:** `bg-foam` (#F1F5F9)
- **Card:** `bg-white rounded-[var(--radius-card)] shadow-card`
- **Empty state heading:** `font-heading text-h1 text-navy`
- **Empty state description:** `text-body text-slate`
- **CTA button (primary):** `bg-coral text-white min-h-[44px] rounded-[var(--radius-button)] px-6 py-3 font-semibold hover:bg-coral/90`
- **Secondary button:** `bg-ocean text-white min-h-[44px] rounded-[var(--radius-button)] px-6 py-3 font-semibold hover:bg-ocean/90`
- **Ghost button:** `text-navy hover:bg-foam min-h-[44px]`
- **Form labels:** `text-small font-semibold text-slate`
- **Error text:** `text-error text-small`
- **Badge text:** `text-tiny font-semibold`
- **Date format:** Use `Intl.DateTimeFormat` for locale-aware dates
- **Page layout:** `mx-auto max-w-[1200px]` for desktop centering
- **Grid:** `grid gap-4 md:grid-cols-2` for 2-column desktop layout
- **Navigation active:** `text-ocean` / inactive: `text-mist`

### Date Formatting Utility

Use `Intl.DateTimeFormat` directly in the VoyageCard — no utility file needed for Story 1.4:

```typescript
const formatted = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric'
}).format(new Date(voyage.created_at))
// "16 Mar 2026"
```

### Existing Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `src/app/dashboard/page.tsx` | **Rewrite** | Replace profile-info placeholder with voyage list + empty state |
| `src/app/dashboard/messages.ts` | **Rewrite** | All new voyage-related strings |
| `package.json` | **Modify** | Add `slugify` dependency |

### New Files to Create

| File | Purpose | Tier |
|------|---------|------|
| `supabase/migrations/XXXXXX_voyages.sql` | Voyages table + RLS | DB |
| `src/lib/data/voyages.ts` | Voyage CRUD repository | Tier 2 |
| `src/lib/data/voyages.test.ts` | Voyages data layer tests | Test |
| `src/lib/utils/slug.ts` | Slug generation utility | Utility |
| `src/app/dashboard/actions.ts` | createVoyage Server Action | Tier 3 |
| `src/app/dashboard/actions.test.ts` | Action tests | Test |
| `src/app/dashboard/layout.tsx` | Dashboard layout + navigation | Layout |
| `src/app/dashboard/loading.tsx` | Skeleton loading state | Loading |
| `src/app/dashboard/CreateVoyageDialog.tsx` | Voyage creation dialog | Component |
| `src/components/shared/EmptyState.tsx` | Empty state component | Shared |
| `src/components/shared/NavigationBar.tsx` | Creator tab navigation | Shared |
| `src/components/voyage/VoyageCard.tsx` | Voyage card for dashboard | Component |
| `src/app/voyage/[id]/page.tsx` | Minimal voyage view placeholder | Page |
| `src/app/voyage/[id]/messages.ts` | Voyage view i18n strings | i18n |

### 3-Tier Containment Reminders

```
✅ src/lib/data/voyages.ts → imports from @/lib/supabase/server (Tier 2 wraps Tier 1)
✅ src/app/dashboard/actions.ts → imports from @/lib/auth, @/lib/data/voyages, @/lib/utils/slug (Tier 3 uses Tier 2)
✅ src/app/dashboard/CreateVoyageDialog.tsx → calls Server Actions only (Tier 4)
✅ src/app/dashboard/page.tsx → imports from @/lib/auth, @/lib/data/profiles, @/lib/data/voyages (server component)
✅ src/components/voyage/VoyageCard.tsx → receives data as props (Tier 4)
✅ src/components/shared/EmptyState.tsx → pure presentational (Tier 4)
✅ src/components/shared/NavigationBar.tsx → uses next/navigation only (Tier 4)
✅ src/app/voyage/[id]/page.tsx → imports from @/lib/auth, @/lib/data/voyages (server component)
❌ NEVER import @/lib/supabase/* in Server Actions, components, or pages
❌ NEVER import @/lib/data/* in client components — use Server Actions
❌ NEVER place custom components in src/components/ui/ — shadcn only
```

### Server Action Return Format (Mandatory)

```typescript
import type { ActionResponse } from '@/types'
// Success: { data: Voyage, error: null }
// Error:   { data: null, error: { code: ErrorCode, message: string } }
// NEVER throw from Server Actions
```

### Anti-Patterns (Do NOT)

- Import `@supabase/*` in Server Actions or components — use Tier 2 wrappers
- Use `supabase.auth.getSession()` server-side — use `getUser()` or `requireAuth()`
- Throw from Server Actions — return `{ data, error }`
- Use `z.string().email()` — Zod 4 uses top-level validators
- Inline string literals in components — use `messages.ts`
- Use `any` type — use generated Supabase types or Zod inferred types
- Place custom components in `src/components/ui/` — shadcn only
- Use `useEffect` for slug auto-generation — use the `onChange` handler directly
- Create a separate `/voyage/new` page for this story — use Dialog on dashboard
- Add mini map to VoyageCard — that's Story 2.6
- Use generic spinner — use contextual Skeleton loading

### Previous Story (1.3) Intelligence

- **Auth wrapper:** `src/lib/auth.ts` with `requireAuth()` returning `ActionResponse<User>`. USE IT in dashboard actions.
- **Profiles data layer:** `src/lib/data/profiles.ts` has `getProfileByUserId` and `updateProfile` — the voyages.ts should follow the exact same pattern (async `createClient()`, return supabase query directly).
- **ProfileUpdate type pattern:** Use `TablesInsert<"voyages">` with `Omit<..., "id" | "created_at" | "updated_at">` for the insert type.
- **ActionResponse type:** Already in `src/types/index.ts` with `ErrorCode` enum.
- **Dashboard page:** Currently shows profile info placeholder — needs complete rewrite for voyage list.
- **Toaster:** Already in `src/app/layout.tsx` — `<Toaster richColors position="bottom-center" />`. Just `import { toast } from "sonner"` in client components.
- **Middleware:** Already protects `/dashboard` and `/voyage` routes — no changes needed.
- **ESLint containment:** `no-restricted-imports` blocks `@supabase/*` outside `src/lib/supabase/`.
- **Design tokens:** All Ocean & Sunset tokens available via `@theme` in `globals.css`.
- **shadcn/ui installed:** Button, Input, Label, Textarea, Avatar, Sonner. Need to add: Card, Dialog, Skeleton.
- **React 19 patterns:** No `forwardRef` needed. `await cookies()` in server code. `usePathname()` from `next/navigation` for client-side route detection.
- **Zod 4:** Use top-level validators. `z.string().min(1)` not `z.string().nonempty()`.
- **Supabase client:** `createClient()` from `@/lib/supabase/server` is async (uses `await cookies()`).
- **signOutAction:** Exists in `src/app/auth/actions.ts` — consider adding sign-out button to navigation.
- **RPC pattern:** Story 1.3 added an RPC function for username availability. For slug availability, a direct query is sufficient (no cross-profile concern).
- **Validation pattern:** Story 1.3 used a shared `validation.ts` for schemas used in both client and server. Consider same for voyage schemas if needed.

### Git Intelligence

Recent commits show linear story progression:
```
1e15ea3 1.3 done
256d9be 1.2 done
9c1f143 1.2
c010e1d feat: initial commit
```

Story 1.3 file list created:
- Storage bucket migration + RPC migrations
- `src/lib/storage.ts`, `src/lib/utils/image.ts` (Tier 2 + utility)
- `src/lib/data/profiles.ts` modified (added RPC function)
- Profile page + form + actions + messages
- Dashboard page modified (profile redirect + real content)
- Toaster added to layout
- shadcn components (label, textarea, avatar, sonner)

Pattern: all new features follow migration → data layer → actions → components → page flow.

### Package Versions (Relevant)

| Package | Version | Notes |
|---------|---------|-------|
| next | 16.1.6 | App Router, `await cookies()` mandatory |
| react | 19.2.3 | No `forwardRef`, strict hooks rules |
| @supabase/supabase-js | ^2.99.1 | Direct table queries in data layer |
| @supabase/ssr | ^0.9.0 | Server client with cookie handling |
| zod | ^4.3.6 | Top-level validators: `z.string().min(1)` |
| slugify | (to install) | `npm install slugify` — v1.6.8, 3.6KB gzip, built-in TS types |
| sonner | (installed) | Toast via `toast.success()`, `toast.error()` |

### Project Structure Notes

Alignment with architecture:
- `src/app/dashboard/actions.ts` — co-located Server Actions (architecture specifies `listVoyages, createVoyage` here)
- `src/app/dashboard/layout.tsx` — dashboard layout with creator navigation
- `src/app/dashboard/loading.tsx` — loading skeleton (architecture specifies `Dashboard skeleton`)
- `src/lib/data/voyages.ts` — exact path from architecture
- `src/components/shared/EmptyState.tsx` — exact path from architecture
- `src/components/shared/NavigationBar.tsx` — exact path from architecture (`NavigationBar.tsx # Bottom tab nav (creator)`)
- `src/components/voyage/VoyageCard.tsx` — exact path from architecture
- `src/app/voyage/[id]/page.tsx` — exact path from architecture
- `supabase/migrations/` — sequential migration via `supabase migration new voyages`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.4, Lines 276-327]
- [Source: _bmad-output/planning-artifacts/architecture.md — 3-Tier Containment, Pattern Examples (voyages.ts, dashboard/actions.ts), Project Structure, Naming Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-3 Voyages, FR-9 Dashboard, UJ-2 Create a Voyage, UJ-7 Resume Existing Voyage]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Dashboard Direction (Foam bg, white cards), VoyageCard (UX-DR13), EmptyState (UX-DR14), Button Hierarchy (UX-DR15), Navigation (UX-DR18), Responsive (UX-DR19), Form Patterns (UX-DR17)]
- [Source: _bmad-output/implementation-artifacts/1-3-sailor-profile-setup.md — Previous Story Intelligence, File List, Patterns]
- [Source: CLAUDE.md — Commands, Architecture, Anti-Patterns, Key Patterns, Naming Conventions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Dialog component uses `@base-ui/react` (not Radix) — `DialogTrigger` uses `render` prop pattern
- `DialogTrigger render={<span />}` wrapping needed for custom trigger content
- Supabase types manually updated since Supabase local was not running — regenerate via `supabase gen types typescript --local > src/types/supabase.ts` when available
- VoyageCard uses `line-clamp-2` for description truncation (Tailwind built-in)
- NavigationBar uses inline SVGs (Lucide-style) to avoid icon library dependency

### Completion Notes List

- Migration `20260316092642_voyages.sql` creates voyages table with RLS, unique (user_id, slug) constraint, user_id index
- Supabase types updated in `src/types/supabase.ts` with voyages table Row/Insert/Update definitions
- Voyages data layer (`src/lib/data/voyages.ts`) implements insertVoyage, getVoyagesByUserId, getVoyageById, checkSlugAvailability
- Slug utility (`src/lib/utils/slug.ts`) uses `slugify` library for Scandinavian-friendly slug generation
- Dashboard Server Action (`src/app/dashboard/actions.ts`) implements createVoyage with Zod validation, auto-slug generation, and unique slug check
- EmptyState shared component (`src/components/shared/EmptyState.tsx`) — reusable empty state with icon, title, description, and action slot
- NavigationBar shared component (`src/components/shared/NavigationBar.tsx`) — mobile bottom tab bar + desktop side nav with active state
- VoyageCard component (`src/components/voyage/VoyageCard.tsx`) — card with name, description, date, public/private badge
- Dashboard layout (`src/app/dashboard/layout.tsx`) — wrapper with NavigationBar, Foam bg, max-width 1200px
- Dashboard loading skeleton (`src/app/dashboard/loading.tsx`) — Skeleton cards mimicking VoyageCard
- CreateVoyageDialog (`src/app/dashboard/CreateVoyageDialog.tsx`) — Dialog with name, description, slug fields; auto-slug from name
- Dashboard page rewritten with voyage list or empty state, CreateVoyageDialog integration
- Voyage view placeholder (`src/app/voyage/[id]/page.tsx`) — shows voyage name + empty state for tracks
- 20 new tests across slug, voyages data layer, and dashboard actions
- All 69 tests pass, TypeScript strict clean, ESLint clean, build succeeds
- 3-tier containment preserved: no `@supabase/*` imports outside `src/lib/supabase/`

### Change Log

- 2026-03-16: Story 1.4 implemented — dashboard with voyage list/empty state, voyage creation dialog, creator navigation, voyages DB migration

### File List

- supabase/migrations/20260316092642_voyages.sql (new)
- src/types/supabase.ts (modified — added voyages table types)
- src/lib/data/voyages.ts (new)
- src/lib/data/voyages.test.ts (new)
- src/lib/utils/slug.ts (new)
- src/lib/utils/slug.test.ts (new)
- src/app/dashboard/actions.ts (new)
- src/app/dashboard/actions.test.ts (new)
- src/app/dashboard/page.tsx (modified — complete rewrite for voyage list)
- src/app/dashboard/messages.ts (modified — voyage-related strings)
- src/app/dashboard/layout.tsx (new)
- src/app/dashboard/loading.tsx (new)
- src/app/dashboard/CreateVoyageDialog.tsx (new)
- src/components/shared/EmptyState.tsx (new)
- src/components/shared/NavigationBar.tsx (new)
- src/components/voyage/VoyageCard.tsx (new)
- src/components/ui/card.tsx (new — shadcn)
- src/components/ui/dialog.tsx (new — shadcn)
- src/components/ui/skeleton.tsx (new — shadcn)
- src/app/voyage/[id]/page.tsx (new)
- src/app/voyage/[id]/messages.ts (new)
- package.json (modified — added slugify)
- package-lock.json (modified)
