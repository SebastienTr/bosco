# Story 4.1: Journal Entry Creation & Management

Status: done

## Story

As a sailor,
I want to write journal entries with text and photos attached to my voyage,
So that I can document my sailing experiences and share them alongside my tracks.

## Acceptance Criteria

### AC-1: Database Migration
**Given** the `log_entries` table does not exist
**When** the migration runs
**Then** a `log_entries` table is created with columns: `id` (uuid PK), `voyage_id` (uuid FK to voyages ON DELETE CASCADE), `leg_id` (uuid FK to legs, nullable), `stopover_id` (uuid FK to stopovers, nullable), `entry_date` (date, not null), `text` (text, not null), `photo_urls` (jsonb, default '[]'), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** RLS policies allow authenticated users to CRUD only entries belonging to their own voyages (ownership via `voyages.user_id`)
**And** a public read policy allows anonymous SELECT on entries whose `voyage_id` belongs to a public voyage

### AC-2: Storage Bucket
**Given** the `log-photos` storage bucket does not exist
**When** the storage migration runs
**Then** a public bucket `log-photos` is created with 18 MB file size limit, allowed MIME types `image/jpeg`, `image/png`, `image/webp`
**And** RLS policies allow authenticated users to upload to their own folder (`{user_id}/*`), update/delete own files, and public read for all

### AC-3: Data Layer
**Given** the data layer for log entries
**When** `src/lib/data/log-entries.ts` is created
**Then** it exports CRUD functions: `insertLogEntry`, `getLogEntriesByVoyageId`, `getLogEntryById`, `updateLogEntry`, `deleteLogEntry`
**And** it exports type aliases: `LogEntry`, `LogEntryInsert`, `LogEntryUpdate`
**And** all functions return raw Supabase `{ data, error }` (not ActionResponse)
**And** unit tests cover all functions in `src/lib/data/log-entries.test.ts`

### AC-4: Server Actions
**Given** Server Actions for log entry management
**When** `src/app/voyage/[id]/log/actions.ts` is created
**Then** it exports: `createLogEntry(formData)`, `updateLogEntry(formData)`, `deleteLogEntry(input)`, `uploadLogPhoto(formData)`
**And** each action follows: requireAuth → validate (Zod) → verify voyage ownership → DB/storage operation → return `{ data, error }`
**And** `uploadLogPhoto` compresses photos are already compressed client-side; server validates type + size, uploads to `log-photos` bucket at path `{userId}/{voyageId}/logs/{entryId}/{index}.{ext}`, returns `{ url }`
**And** `deleteLogEntry` also deletes associated photos from storage
**And** unit tests cover all actions in `src/app/voyage/[id]/log/actions.test.ts`

### AC-5: LogEntryForm Component
**Given** a sailor on the voyage view
**When** they tap "Add log entry"
**Then** a LogEntryForm is displayed with fields: date (required, defaults to today), text (required, free-form textarea), photo attachments (optional, multiple), optional link to a specific leg (dropdown), optional link to a specific stopover (dropdown)
**And** the form follows form patterns: labels above inputs (Nunito SemiBold 13px Slate), inline validation on blur with error below field in Error red
**And** photo upload: client-side `validateImageFile` → `compressImage` (target 1 MB) → FormData → `uploadLogPhoto` server action
**And** multiple photos can be attached (upload sequentially, show thumbnails with remove button)
**And** on submit: creates entry via `createLogEntry`, shows success toast "Log entry added", refreshes voyage data

### AC-6: Edit Log Entry
**Given** a sailor wants to edit an existing log entry
**When** they tap the edit button on a log entry card
**Then** the LogEntryForm opens pre-filled with existing data (date, text, leg, stopover, photos)
**And** they can update text, date, leg/stopover links, and add or remove photos
**And** removing a photo deletes it from storage immediately
**And** changes are saved via `updateLogEntry` Server Action returning `{ data, error }`

### AC-7: Delete Log Entry
**Given** a sailor wants to delete a log entry
**When** they tap delete on a log entry card
**Then** an AlertDialog asks: "Delete this log entry?"
**And** upon confirmation, the entry and its associated photos are deleted via `deleteLogEntry`
**And** a toast confirms: "Log entry deleted"

### AC-8: Integration with Voyage Page
**Given** the authenticated voyage page
**When** log entries exist for the voyage
**Then** a "Journal" section or toggle displays entries (ordered by entry_date descending)
**And** each entry shows: date, text excerpt, photo count, linked stopover/leg name
**And** an "Add log entry" button is accessible from the voyage page
**And** the overlay management rule applies (max one overlay at a time)

## Tasks / Subtasks

- [x] Task 1: Database migration for log_entries table (AC: #1)
  - [x] Create migration `supabase/migrations/{timestamp}_log_entries.sql`
  - [x] Table: id (uuid PK), voyage_id (FK CASCADE), leg_id (FK nullable), stopover_id (FK nullable), entry_date (date NOT NULL), text (text NOT NULL), photo_urls (jsonb DEFAULT '[]'), created_at, updated_at
  - [x] Index on voyage_id
  - [x] RLS: 4 policies for authenticated CRUD (ownership via voyages.user_id subquery)
  - [x] RLS: public read policy for entries in public voyages
  - [x] Run `supabase db reset` and `supabase gen types typescript` to regenerate types

- [x] Task 2: Storage bucket migration for log-photos (AC: #2)
  - [x] Create migration `supabase/migrations/{timestamp}_log_photos_bucket.sql`
  - [x] Bucket: `log-photos`, public, 18 MB limit, allowed types: jpeg, png, webp
  - [x] Storage policies: INSERT (folder-scoped to user_id), UPDATE/DELETE (owner_id), SELECT (public)

- [x] Task 3: Data layer — log-entries repository (AC: #3)
  - [x] Create `src/lib/data/log-entries.ts` with CRUD functions
  - [x] Export types: `LogEntry = Tables<"log_entries">`, `LogEntryInsert = Omit<TablesInsert<"log_entries">, "id" | "created_at" | "updated_at">`, `LogEntryUpdate = TablesUpdate<"log_entries">`
  - [x] `insertLogEntry(entry: LogEntryInsert)` — insert + select + single
  - [x] `getLogEntriesByVoyageId(voyageId: string)` — select all, order by entry_date desc
  - [x] `getLogEntryById(id: string)` — select single
  - [x] `updateLogEntry(id: string, data: LogEntryUpdate)` — update + select + single
  - [x] `deleteLogEntry(id: string)` — delete
  - [x] Create `src/lib/data/log-entries.test.ts` — mock Supabase client, test each function

- [x] Task 4: Server Actions for log entry CRUD (AC: #4)
  - [x] Create `src/app/voyage/[id]/log/actions.ts` with `"use server"`
  - [x] Create `src/app/voyage/[id]/log/validation.ts` with Zod schemas
  - [x] `createLogEntry(formData: FormData)` — requireAuth → parse FormData → validate → verifyOwnership → insertLogEntry → return { data, error }
  - [x] `updateLogEntry(formData: FormData)` — requireAuth → validate → verifyOwnership → updateLogEntry → return { data, error }
  - [x] `deleteLogEntry(input: { id: string; voyageId: string })` — requireAuth → validate → verifyOwnership → get entry photo_urls → delete photos from storage → deleteLogEntry → return { data, error }
  - [x] `uploadLogPhoto(formData: FormData)` — requireAuth → extract File → validate type/size → uploadFile("log-photos", path, file) → return { url }
  - [x] Create `src/app/voyage/[id]/log/actions.test.ts` — test all actions

- [x] Task 5: Messages externalization (AC: #5, #6, #7)
  - [x] Create `src/app/voyage/[id]/log/messages.ts`
  - [x] Sections: form field labels/placeholders, validation errors, toast messages, dialog text, button labels

- [x] Task 6: LogEntryForm component (AC: #5, #6)
  - [x] Create `src/components/log/LogEntryForm.tsx` — `"use client"` component
  - [x] Props: `voyageId`, `legs`, `stopovers`, optional `existingEntry` for edit mode
  - [x] Fields: date input (required, default today), textarea for text (required), leg dropdown (optional), stopover dropdown (optional)
  - [x] Photo upload section: hidden file input + styled button, multi-file support, thumbnail previews with remove button
  - [x] Photo upload flow: validateImageFile → compressImage (maxSizeMB: 1) → FormData → uploadLogPhoto → add URL to local state
  - [x] Inline validation on blur: empty text → error, missing date → error
  - [x] Submit: build FormData with all fields + photo_urls array → createLogEntry or updateLogEntry → toast → router.refresh()
  - [x] Edit mode: pre-fill all fields, show existing photos, support remove (delete from storage immediately)

- [x] Task 7: LogEntryCard component (AC: #8)
  - [x] Create `src/components/log/LogEntryCard.tsx`
  - [x] Display: formatted date (DM Serif Display), text content, photo thumbnails (small grid), linked stopover/leg name if applicable
  - [x] Actions (authenticated only): edit button → opens LogEntryForm in edit mode, delete button → AlertDialog confirmation → deleteLogEntry
  - [x] Sand background, consistent with StopoverSheet aesthetic

- [x] Task 8: Integration with VoyageContent (AC: #8)
  - [x] Modify `src/app/voyage/[id]/page.tsx` — fetch log entries via `getLogEntriesByVoyageId`, pass as prop
  - [x] Modify `src/components/voyage/VoyageContent.tsx` — add `initialLogEntries` prop, render journal section
  - [x] Journal section: collapsible toggle (like LegList pattern), entries rendered as LogEntryCard list
  - [x] "Add log entry" button: opens LogEntryForm (as a panel/sheet or inline, following overlay management rule)
  - [x] If no entries, show no journal section (never show empty state — journal is optional, per UX spec)

- [x] Task 9: Tests and quality (AC: all)
  - [x] TypeScript strict clean: `npx tsc --noEmit`
  - [x] ESLint clean: `npm run lint`
  - [x] All existing tests pass: `npm run test`
  - [x] Build succeeds: `npm run build`

## Dev Notes

### Migration — SQL Pattern

Follow the exact pattern from `20260316122237_legs.sql` (child table of voyages):

```sql
CREATE TABLE log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id UUID NOT NULL REFERENCES voyages(id) ON DELETE CASCADE,
  leg_id UUID REFERENCES legs(id) ON DELETE SET NULL,
  stopover_id UUID REFERENCES stopovers(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL,
  text TEXT NOT NULL,
  photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_log_entries_voyage_id ON log_entries(voyage_id);

ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- Ownership via voyages.user_id subquery (same as legs, stopovers)
CREATE POLICY "Users can read own log entries"
  ON log_entries FOR SELECT TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert own log entries"
  ON log_entries FOR INSERT TO authenticated
  WITH CHECK (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update own log entries"
  ON log_entries FOR UPDATE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete own log entries"
  ON log_entries FOR DELETE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

-- Public read for visitors (matches pattern from 20260318090533)
CREATE POLICY "Anyone can read log entries of public voyages"
  ON log_entries FOR SELECT
  USING (voyage_id IN (SELECT id FROM voyages WHERE is_public = true));
```

**Key decisions:**
- `leg_id` and `stopover_id` use `ON DELETE SET NULL` (not CASCADE) — if a leg or stopover is deleted, the journal entry survives
- `updated_at` is included because editing is a core feature of this story (unlike legs/stopovers which rarely update)
- `photo_urls` is a JSONB array of public URL strings — this avoids a separate join table while keeping queries simple. Max photos per entry is enforced application-side.

### Storage Bucket — SQL Pattern

Follow `20260317084259_voyage_covers_bucket.sql`:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('log-photos', 'log-photos', true, 18874368, ARRAY['image/jpeg', 'image/png', 'image/webp']);

CREATE POLICY "Users upload own log photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'log-photos'
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

CREATE POLICY "Users update own log photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'log-photos'
  AND owner_id = (select auth.uid()::text)
);

CREATE POLICY "Users delete own log photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'log-photos'
  AND owner_id = (select auth.uid()::text)
);

CREATE POLICY "Public read log photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'log-photos');
```

### Data Layer — Repository Pattern

Follow `src/lib/data/legs.ts` and `src/lib/data/stopovers.ts`:

```typescript
// src/lib/data/log-entries.ts
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export type LogEntry = Tables<"log_entries">;
export type LogEntryInsert = Omit<TablesInsert<"log_entries">, "id" | "created_at" | "updated_at">;
export type LogEntryUpdate = TablesUpdate<"log_entries">;

export async function insertLogEntry(entry: LogEntryInsert) {
  const supabase = await createClient();
  return supabase.from("log_entries").insert(entry).select().single();
}

export async function getLogEntriesByVoyageId(voyageId: string) {
  const supabase = await createClient();
  return supabase
    .from("log_entries")
    .select("*")
    .eq("voyage_id", voyageId)
    .order("entry_date", { ascending: false });
}

// ... getLogEntryById, updateLogEntry, deleteLogEntry
```

**Note:** Return raw Supabase `{ data, error }`. Server Actions wrap these into ActionResponse.

### Server Actions — Pattern

Follow `src/app/voyage/[id]/settings/actions.ts`:

```typescript
// src/app/voyage/[id]/log/actions.ts
"use server";
import { requireAuth } from "@/lib/auth";
import { uploadFile, deleteFile, getPublicUrl } from "@/lib/storage";
import { insertLogEntry, updateLogEntry as updateEntry, deleteLogEntry as deleteEntry, getLogEntryById } from "@/lib/data/log-entries";
import type { ActionResponse } from "@/types";
// ...

export async function createLogEntry(formData: FormData): Promise<ActionResponse<LogEntry>> {
  const authResult = await requireAuth();
  if (authResult.error) return { data: null, error: authResult.error };

  const parsed = CreateLogEntrySchema.safeParse({
    voyageId: formData.get("voyageId"),
    entryDate: formData.get("entryDate"),
    text: formData.get("text"),
    legId: formData.get("legId") || null,
    stopoverId: formData.get("stopoverId") || null,
    photoUrls: JSON.parse(formData.get("photoUrls") as string || "[]"),
  });
  if (!parsed.success) { /* return VALIDATION_ERROR */ }

  // Verify voyage ownership (subquery via getVoyageById + check user_id)
  // ...

  const { data, error } = await insertLogEntry({
    voyage_id: parsed.data.voyageId,
    entry_date: parsed.data.entryDate,
    text: parsed.data.text,
    leg_id: parsed.data.legId,
    stopover_id: parsed.data.stopoverId,
    photo_urls: parsed.data.photoUrls,
  });
  // ...
}
```

**Ownership verification:** Reuse the pattern from `src/app/voyage/[id]/settings/actions.ts` — `getVoyageById(voyageId)` → check `voyage.user_id === authResult.data.id`. Extract or duplicate the `verifyOwnership` helper.

**Photo URLs flow:** Photos are uploaded individually via `uploadLogPhoto` BEFORE form submission. The form collects the returned URLs in local state, then passes the complete `photo_urls` array when creating/updating the entry.

### Photo Upload Flow (End-to-End)

```
Client (LogEntryForm):
  1. User selects file(s) from <input type="file" multiple accept="image/*">
  2. For each file:
     a. validateImageFile(file) — type + size check (max 18 MB original)
     b. compressImage(file, { maxSizeMB: 1, maxWidthOrHeight: 1920 }) — compress to <1 MB
     c. Build FormData: file, voyageId, entryId (or temp ID for new entries)
     d. Call uploadLogPhoto(formData) server action
     e. On success: add returned URL to local photo_urls state, show thumbnail
     f. On error: toast.error with message
  3. On form submit: include photo_urls array in createLogEntry/updateLogEntry call

Server (uploadLogPhoto):
  1. requireAuth()
  2. Extract File from formData, validate type + size server-side
  3. Path: `{userId}/{voyageId}/logs/{timestamp}-{index}.{ext}`
  4. uploadFile("log-photos", path, file)
  5. Return { url: publicUrl }
```

**Storage path note:** Use `{timestamp}-{index}` instead of `{entryId}/{index}` because photos may be uploaded before the entry exists (the entry is created on form submit, but photos are uploaded as they're selected). The timestamp ensures uniqueness.

### Photo Deletion on Entry Delete

When deleting a log entry:
1. Fetch entry by ID to get `photo_urls` array
2. For each URL, extract storage path using `getStoragePathFromPublicUrl` pattern from settings/actions.ts
3. Call `deleteFile("log-photos", paths)` to batch delete
4. Then delete the DB row

**CRITICAL:** Await all operations. Never fire-and-forget on Vercel.

### LogEntryForm — Component Pattern

Follow `src/app/dashboard/profile/ProfileForm.tsx` and `src/app/voyage/[id]/settings/VoyageSettingsForm.tsx`:

```typescript
// src/components/log/LogEntryForm.tsx
"use client";

interface LogEntryFormProps {
  voyageId: string;
  legs: { id: string; sort_order: number; started_at: string | null }[];
  stopovers: { id: string; name: string | null }[];
  existingEntry?: LogEntry; // undefined = create mode, defined = edit mode
  onClose: () => void;
}
```

- **Date input:** `<input type="date">` with `defaultValue={existingEntry?.entry_date ?? new Date().toISOString().split("T")[0]}`
- **Text input:** `<Textarea>` from shadcn/ui
- **Leg dropdown:** `<select>` with "None" option + legs sorted by sort_order, display as "Leg 1", "Leg 2", etc.
- **Stopover dropdown:** `<select>` with "None" option + stopovers by name
- **Photo section:** Grid of thumbnails with X button to remove. "Add photo" button triggers hidden `<input type="file" multiple accept="image/jpeg,image/png,image/webp">`
- **Validation:** On blur — text empty → show error, date empty → show error
- **Submit button:** Coral primary, disabled during upload/submit
- **Cancel button:** Navy ghost tertiary

### LogEntryCard — Display Component

```typescript
// src/components/log/LogEntryCard.tsx
interface LogEntryCardProps {
  entry: LogEntry;
  stopoverName?: string | null;
  legLabel?: string | null;
  readOnly?: boolean; // true on public page (Story 4.2)
  onEdit?: () => void;
  onDelete?: () => void;
}
```

- **Sand (#FDF6EC) background**, rounded-card (12px), shadow
- **Date:** DM Serif Display, formatted via `Intl.DateTimeFormat`
- **Text:** Nunito body, truncated with "Read more" if > 3 lines (optional, keep simple for 4.1)
- **Photos:** Small thumbnail grid (48px × 48px), photo count badge if > 4
- **Linked stopover/leg:** Mist text, show name
- **Actions (when !readOnly):** Edit icon button, Delete icon button (danger)
- **Delete:** AlertDialog from shadcn/ui (same pattern as voyage delete in VoyageSettingsForm)

### Integration with Voyage Page

Modify `src/app/voyage/[id]/page.tsx` to fetch log entries:

```typescript
const { data: logEntries } = await getLogEntriesByVoyageId(voyage.id);
// Pass to VoyageContent
<VoyageContent
  initialLegs={legs}
  stopovers={stopovers}
  voyageId={voyage.id}
  initialLogEntries={logEntries ?? []}
/>
```

In `VoyageContent.tsx`, add a journal section following the LegList collapsible toggle pattern:

```typescript
// Similar to LegList toggle button + expandable panel
{logEntries.length > 0 && (
  <JournalSection entries={logEntries} stopovers={stopovers} legs={legs} voyageId={voyageId} />
)}
// "Add log entry" button always visible (even when no entries)
<Button onClick={() => setShowLogForm(true)}>Add log entry</Button>
```

**Overlay management:** LogEntryForm should follow the existing overlay rules — only one overlay at a time. When opening the form, dismiss any open StopoverSheet/PortsPanel.

### Existing Components to Reuse

| Component | Path | How to Reuse |
|-----------|------|--------------|
| `Button` | `src/components/ui/button.tsx` | shadcn/ui, Coral primary for submit |
| `Textarea` | `src/components/ui/textarea.tsx` | shadcn/ui, for log text |
| `Label` | `src/components/ui/label.tsx` | shadcn/ui, form field labels |
| `AlertDialog` | `src/components/ui/alert-dialog.tsx` | shadcn/ui, delete confirmation |
| `validateImageFile` | `src/lib/utils/image.ts` | Client-side file validation |
| `compressImage` | `src/lib/utils/image.ts` | Client-side compression (set maxSizeMB: 1) |
| `uploadFile` | `src/lib/storage.ts` | Tier 2 storage upload |
| `deleteFile` | `src/lib/storage.ts` | Tier 2 storage delete |
| `getPublicUrl` | `src/lib/storage.ts` | Get public URL after upload |
| `requireAuth` | `src/lib/auth.ts` | Auth check in Server Actions |
| `toast` | `sonner` | Success/error feedback |
| `formatDistanceNm` | `src/lib/utils/format.ts` | If showing stats alongside entries |
| `LegList` pattern | `src/components/voyage/LegList.tsx` | Reference for collapsible toggle UI pattern |
| `VoyageSettingsForm` | `src/app/voyage/[id]/settings/VoyageSettingsForm.tsx` | Reference for AlertDialog + photo upload pattern |

### Image Compression Target

**IMPORTANT:** The PRD (NFR-12) and AC-5 specify compression to under **1 MB**. The existing `compressImage` defaults to `maxSizeMB: 4`. For journal photos, call:

```typescript
const compressed = await compressImage(file, { maxSizeMB: 1 });
```

The `compressImage` function in `src/lib/utils/image.ts` already accepts an `options` parameter. No modification to the utility needed — just pass the stricter target.

### 3-Tier Containment Compliance

```
OK  supabase/migrations/*_log_entries.sql — Database tier (Supabase)
OK  supabase/migrations/*_log_photos_bucket.sql — Database tier (Supabase)
OK  src/types/supabase.ts — Auto-generated types (regenerated)
OK  src/lib/data/log-entries.ts — Tier 2: imports from @/lib/supabase/server
OK  src/app/voyage/[id]/log/actions.ts — Tier 3: imports from Tier 2 (data/, auth.ts, storage.ts)
OK  src/components/log/LogEntryForm.tsx — Tier 4: calls Server Actions only
OK  src/components/log/LogEntryCard.tsx — Tier 4: pure display component
NEVER  import @supabase/* outside src/lib/supabase/
NEVER  import src/lib/supabase/* in actions or components
NEVER  call Supabase from components — use Server Actions
NEVER  use void + async (fire-and-forget) in Server Actions
```

### Anti-Patterns — Do NOT

- **Do NOT create a separate join table for photos** — use the `photo_urls` JSONB array per AC
- **Do NOT use fire-and-forget** for photo deletion or any async work in Server Actions — await everything
- **Do NOT store photos as base64 in the database** — upload to Supabase Storage, store public URLs in JSONB
- **Do NOT use `any` type** — use generated Supabase types
- **Do NOT inline string literals** — use co-located `messages.ts`
- **Do NOT place custom components in `src/components/ui/`** — shadcn/ui only
- **Do NOT add components to `src/components/voyage/`** — log components go in `src/components/log/` per architecture
- **Do NOT skip server-side validation** — even though client validates, server must also validate file type/size
- **Do NOT use Framer Motion** — CSS transitions only
- **Do NOT create an empty state for journal** — per UX spec, journal is optional and never pushed. If no entries, show nothing.
- **Do NOT add timeline display to public page** — that's Story 4.2 scope
- **Do NOT make the form a full-page route** — use overlay/panel pattern consistent with existing UI

### Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| Sand | `#FDF6EC` | LogEntryCard background |
| Navy | `#1B2D4F` | Text, headings |
| Coral | `#E8614D` | Primary submit button |
| Ocean | `#2563EB` | Links, focus outlines |
| Error | `#EF4444` | Validation errors, delete button |
| Mist | `#94A3B8` | Secondary text (date, linked entities) |
| Slate | `#334155` | Form labels |
| DM Serif Display | Heading font | Entry date display |
| Nunito | Body font | Form fields, entry text, labels |

### Previous Story (3.3) Intelligence

Story 3.3 established:
- **228 tests passing** (43 files) — do not break them
- `next/image` for optimized image loading — use for photo thumbnails on cards
- Supabase Storage image domains configured in `next.config.ts` (remotePatterns for `*.supabase.co` and `127.0.0.1:54321`) — log photos will work with `next/image` without additional config
- `site-url.ts` utility for canonical URLs
- `voyage-metrics.ts` for aggregate stats computation
- Pre-existing lint issues in page.tsx and actions.ts — do not fix (not in scope)

### Git Intelligence

Recent commits (Story 3.3 + fixes):
```
38186d8 a few fixes
4d83b46 3.3 wip
5847d8e 3.3 wip
```
The codebase is stable. The Epic 3 retro fix (fire-and-forget in `repositionStopover`) was applied in the current session. All 228 tests pass.

### Scope Boundary

**IN SCOPE:**
- Database migration for `log_entries` table
- Storage bucket `log-photos` migration
- Data layer repository (`src/lib/data/log-entries.ts`)
- Server Actions for CRUD + photo upload (`src/app/voyage/[id]/log/actions.ts`)
- Zod validation schemas
- LogEntryForm component (create + edit modes)
- LogEntryCard component (authenticated view with edit/delete)
- Integration with VoyageContent (journal section)
- Messages externalization
- Unit tests for data layer and actions
- Quality checks (tsc, lint, test, build)

**OUT OF SCOPE — Do NOT create (Story 4.2):**
- No timeline display on public voyage page
- No LogEntryCard readOnly mode for visitors
- No SSR log entries in public page.tsx
- No photo lightbox/viewer (photo opens in larger view)
- No log entry data fetching in public voyage query
- No JSON-LD update for log entries

### Project Structure Notes

```
src/
├── app/
│   └── voyage/
│       └── [id]/
│           ├── page.tsx                    # MODIFY — fetch log entries, pass to VoyageContent
│           └── log/
│               ├── actions.ts              # NEW — Server Actions for log CRUD + photo upload
│               ├── actions.test.ts         # NEW — Server Action tests
│               ├── validation.ts           # NEW — Zod schemas
│               └── messages.ts             # NEW — UI strings
├── components/
│   └── log/
│       ├── LogEntryForm.tsx               # NEW — create/edit form with photo upload
│       └── LogEntryCard.tsx               # NEW — display card with edit/delete actions
├── lib/
│   └── data/
│       ├── log-entries.ts                 # NEW — CRUD repository
│       └── log-entries.test.ts            # NEW — repository tests
├── types/
│   └── supabase.ts                        # REGENERATED — new log_entries table types
supabase/
└── migrations/
    ├── {timestamp}_log_entries.sql         # NEW — log_entries table + RLS
    └── {timestamp}_log_photos_bucket.sql   # NEW — log-photos storage bucket
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.1 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-6 (Log Entries), NFR-7 (image validation), NFR-12 (image compression)]
- [Source: _bmad-output/planning-artifacts/architecture.md — 3-tier containment, storage wrapper, image pipeline, log component paths, database naming, error codes]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — form patterns, feedback patterns, button hierarchy, overlay rules, typography, color system, journal as optional]
- [Source: src/lib/storage.ts — uploadFile, deleteFile, getPublicUrl]
- [Source: src/lib/utils/image.ts — validateImageFile, compressImage]
- [Source: src/app/dashboard/profile/actions.ts — uploadPhoto Server Action pattern]
- [Source: src/app/dashboard/profile/ProfileForm.tsx — photo upload client flow]
- [Source: src/app/voyage/[id]/settings/actions.ts — verifyOwnership, uploadCoverImage, getStoragePathFromPublicUrl]
- [Source: src/app/voyage/[id]/settings/VoyageSettingsForm.tsx — AlertDialog delete confirmation, photo upload UI]
- [Source: src/lib/data/legs.ts — data layer repository pattern]
- [Source: src/lib/data/stopovers.ts — CRUD repository pattern]
- [Source: src/components/voyage/VoyageContent.tsx — voyage page orchestrator to extend]
- [Source: src/components/voyage/LegList.tsx — collapsible toggle pattern for journal section]
- [Source: supabase/migrations/20260316122237_legs.sql — RLS policy pattern for child tables]
- [Source: supabase/migrations/20260317084259_voyage_covers_bucket.sql — storage bucket creation pattern]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions]

## Change Log

- 2026-03-26: Story 4.1 implementation complete — all 9 tasks done, database/storage/data layer/UI integrated.
- 2026-03-26: Review fixes applied — strict date validation, safe `photoUrls` parsing, immediate photo deletion with storage cleanup rollback, shared overlay state, and additional regression coverage. Final verification: 256 tests passing, lint/typecheck/build clean.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Fixed spurious line in regenerated `src/types/supabase.ts` ("Connecting to db 5432" output from supabase CLI)
- Fixed TS2698 spread error in test file by using explicit object literal instead of spreading `as never` type
- Cleaned up unused imports flagged by ESLint (toast, Button, Leg, Stopover, deleteFile, deleteLogEntryAction)

### Completion Notes List

- Task 1: Created `20260326100000_log_entries.sql` with table, index, 5 RLS policies (4 auth CRUD + public read)
- Task 2: Created `20260326100001_log_photos_bucket.sql` with 18 MB limit, 4 storage policies
- Task 3: Created `src/lib/data/log-entries.ts` with 5 CRUD functions + 3 type exports. 7 unit tests in `log-entries.test.ts`
- Task 4: Created Server Actions (`createLogEntry`, `updateLogEntry`, `deleteLogEntry`, `uploadLogPhoto`, `deleteLogPhoto`) with strict date validation, safe `photoUrls` parsing, ownership verification, storage cleanup rollback, and immediate persisted photo removal. 17 unit tests in `actions.test.ts`
- Task 5: Created `messages.ts` with journal, form, toast, delete, and validation sections
- Task 6: Created `LogEntryForm.tsx` with create/edit modes, inline validation on blur, multi-photo upload with compression (1 MB target), leg/stopover dropdowns, and immediate photo deletion in edit mode
- Task 7: Created `LogEntryCard.tsx` with sand background, DM Serif date, photo thumbnails (48px grid with +N badge), AlertDialog delete confirmation
- Task 8: Added `JournalSection.tsx` orchestrator with collapsible panel (bottom-right, z-500), integrated into `VoyageContent.tsx` and `page.tsx`, and enforced the shared overlay rule across journal/legs/stopovers
- Task 9: All quality gates pass — `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` all pass. Final suite: 256 tests across 47 files
- Carry-over working-tree note: `src/app/voyage/[id]/stopover/actions.ts` remains modified from the prior retro fix and is documented below for git/story parity

### File List

- `supabase/migrations/20260326100000_log_entries.sql` — NEW
- `supabase/migrations/20260326100001_log_photos_bucket.sql` — NEW
- `src/types/supabase.ts` — REGENERATED
- `src/lib/data/log-entries.ts` — NEW
- `src/lib/data/log-entries.test.ts` — NEW
- `src/app/voyage/[id]/log/actions.ts` — NEW
- `src/app/voyage/[id]/log/actions.test.ts` — NEW
- `src/app/voyage/[id]/log/validation.ts` — NEW
- `src/app/voyage/[id]/log/messages.ts` — NEW
- `src/components/log/LogEntryForm.tsx` — NEW
- `src/components/log/LogEntryForm.test.tsx` — NEW
- `src/components/log/LogEntryCard.tsx` — NEW
- `src/components/log/JournalSection.tsx` — NEW
- `src/app/voyage/[id]/page.tsx` — MODIFIED (added log entries fetch + prop)
- `src/components/voyage/LegList.tsx` — MODIFIED (shared overlay control)
- `src/components/voyage/StopoverPanel.tsx` — MODIFIED (shared overlay control)
- `src/components/voyage/VoyageContent.tsx` — MODIFIED (added LogEntry type, JournalSection, initialLogEntries prop)
- `src/components/voyage/VoyageContent.test.tsx` — NEW
- `src/app/voyage/[id]/stopover/actions.ts` — MODIFIED (carry-over retro fix present in git working tree)
