# Story 11.1: Enriched Voyage Card — Boat & Crew Details

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a sailor,
I want to add my boat details to my voyage,
so that visitors understand the context of my journey.

## Acceptance Criteria

1. **Given** an authenticated user on the voyage settings page, **When** the user edits voyage details, **Then** fields are available for: boat name, boat type (sailboat/catamaran/motorboat), boat length (feet or meters), flag (country), and home port.
2. **Given** optional boat detail fields, **When** the user leaves any field empty, **Then** the voyage works without them — no validation errors, no degraded experience.
3. **Given** a public voyage with boat details set, **When** a visitor views the public voyage page, **Then** boat details display elegantly in the voyage header area (like a logbook entry).
4. **Given** the boat type field, **When** the user selects a type, **Then** a dropdown with the three options (Sailboat, Catamaran, Motorboat) is available.
5. **Given** a voyage with boat details, **When** the BoatBadge renders on the public page, **Then** it prefers voyage-level boat_name over profile-level boat_name (fallback to profile if voyage boat_name is null).
6. **Given** the database, **When** the migration runs, **Then** new columns exist on the voyages table: `boat_name`, `boat_type`, `boat_length_m`, `boat_flag`, `home_port`.

## Tasks / Subtasks

- [ ] Task 1: Database migration (AC: #6)
  - [ ] 1.1 Create migration file adding 5 columns to `voyages` table
  - [ ] 1.2 Run `supabase db reset` and `supabase gen types typescript` to update types
- [ ] Task 2: Data layer update (AC: #1, #2)
  - [ ] 2.1 Verify `updateVoyage` in `src/lib/data/voyages.ts` already accepts `TablesUpdate<"voyages">` (no change needed — it already passes any update fields through)
- [ ] Task 3: Server Action for boat details (AC: #1, #2)
  - [ ] 3.1 Add `updateBoatDetails` Server Action in `src/app/voyage/[id]/settings/actions.ts`
  - [ ] 3.2 Add Zod schema `UpdateBoatDetailsSchema` with all 5 optional fields
  - [ ] 3.3 Use existing `verifyOwnership` + `withLogging` patterns
- [ ] Task 4: Voyage settings UI — Boat Details section (AC: #1, #2, #4)
  - [ ] 4.1 Add "Boat Details" section to `VoyageSettingsForm.tsx` between "Cover Image" and "Danger Zone"
  - [ ] 4.2 Add boat_name (text input), boat_type (select dropdown), boat_length_m (number input with unit label), boat_flag (text input for ISO country code), home_port (text input)
  - [ ] 4.3 All fields pre-populated from existing voyage data, all optional
  - [ ] 4.4 Add save button for the boat details section
- [ ] Task 5: Messages externalization (AC: all)
  - [ ] 5.1 Add boat details strings to `src/app/voyage/[id]/settings/messages.ts`
  - [ ] 5.2 Add public page boat display strings to `src/app/[username]/[slug]/messages.ts`
- [ ] Task 6: Public page boat display (AC: #3, #5)
  - [ ] 6.1 Update BoatBadge to accept and prefer voyage-level boat data
  - [ ] 6.2 Add a subtle boat details line in the public page header (boat type + length + flag + home port) when available
  - [ ] 6.3 Update `PublicVoyageContent` to pass voyage-level boat data to BoatBadge
- [ ] Task 7: Tests (AC: all)
  - [ ] 7.1 Add Server Action tests for `updateBoatDetails` in `actions.test.ts`
  - [ ] 7.2 Update `PublicVoyageContent.test.tsx` if needed for new props

## Dev Notes

### Critical Architecture Constraints

**3-Tier Containment — Must follow exactly:**
```
Tier 1: src/lib/supabase/     ← ONLY place that imports @supabase/supabase-js
Tier 2: src/lib/data/         ← Repository functions
Tier 3: src/app/*/actions.ts  ← Server Actions (Zod + business logic)
Tier 4: src/components/       ← React components (call Server Actions only)
```

**Server Action return format — Mandatory:**
```typescript
{ data: T, error: null }                                    // success
{ data: null, error: { code: ErrorCode, message: string } } // error
```

**Anti-patterns to avoid:**
- NEVER throw from Server Actions — return `{ data, error }`
- NEVER import `@supabase/*` outside `src/lib/supabase/`
- NEVER import from `src/lib/supabase/` in Server Actions — use `src/lib/data/`
- NEVER use `any` type
- NEVER place custom components in `src/components/ui/` — shadcn/ui only

### Database Migration Details

**Migration SQL:**
```sql
-- Add boat details to voyages table (per-voyage, not per-profile)
ALTER TABLE voyages ADD COLUMN boat_name VARCHAR(100);
ALTER TABLE voyages ADD COLUMN boat_type VARCHAR(20);
  -- Allowed values: 'sailboat' | 'catamaran' | 'motorboat'
ALTER TABLE voyages ADD COLUMN boat_length_m NUMERIC(5,2);
ALTER TABLE voyages ADD COLUMN boat_flag VARCHAR(2);
  -- ISO 3166-1 alpha-2 country code (e.g., 'FR', 'DK', 'SE')
ALTER TABLE voyages ADD COLUMN home_port VARCHAR(100);
```

**Key design decision:** Boat details live on `voyages` (NOT `profiles`). A sailor can use different boats for different voyages. The existing `profiles.boat_name` and `profiles.boat_type` remain for the profile page — they represent the sailor's "current/default" boat. The voyage-level fields take precedence for display on public voyage pages.

**No RLS changes needed** — existing RLS on `voyages` already covers these new columns (column-level permissions inherit table-level policies).

**After migration, regenerate types:**
```bash
supabase db reset
supabase gen types typescript --local > src/types/supabase.ts
```

### Server Action Implementation

**File:** `src/app/voyage/[id]/settings/actions.ts`

Add a new `updateBoatDetails` action following the exact pattern of the existing `updateVoyage` action:

```typescript
const UpdateBoatDetailsSchema = z.object({
  voyageId: z.string().regex(UUID_REGEX, "Invalid voyage ID"),
  boat_name: z.string().trim().max(100).optional().or(z.literal("")),
  boat_type: z.enum(["sailboat", "catamaran", "motorboat"]).optional().or(z.literal("")),
  boat_length_m: z.coerce.number().min(1).max(200).optional().or(z.literal("")),
  boat_flag: z.string().trim().max(2).optional().or(z.literal("")),
  home_port: z.string().trim().max(100).optional().or(z.literal("")),
});
```

**Important:** Empty strings from form fields should be stored as `null` in the database. Convert: `boat_name: parsed.data.boat_name || null`.

Use the existing `updateVoyageDb` from `src/lib/data/voyages.ts` — it already accepts `TablesUpdate<"voyages">` which will include the new columns after type regeneration.

### UI Implementation

**File:** `src/app/voyage/[id]/settings/VoyageSettingsForm.tsx`

Add a new section "Boat Details" between "Cover Image" (section 3) and "Danger Zone" (section 4). Follow the existing section pattern:

```tsx
{/* Section 4: Boat Details */}
<section>
  <h2 className="font-heading text-h2 text-navy">{messages.boat.title}</h2>
  <p className="mt-1 text-small text-mist">{messages.boat.description}</p>
  <form onSubmit={handleSaveBoatDetails} className="mt-4 space-y-4">
    {/* boat_name: Input, placeholder "e.g. Laurine" */}
    {/* boat_type: Select dropdown with 3 options */}
    {/* boat_length_m: Input type="number" with step="0.1" + unit label "m" */}
    {/* boat_flag: Input, placeholder "e.g. FR" + hint "ISO country code" */}
    {/* home_port: Input, placeholder "e.g. Göteborg" */}
    <Button>Save boat details</Button>
  </form>
</section>
```

**Styling notes:**
- Use existing shadcn/ui components: `Input`, `Label`, `Button`
- For boat_type dropdown: use shadcn/ui `Select` component (import from `@/components/ui/select`)
- Check if `Select` is already installed in shadcn: if not, run `npx shadcn@latest add select`
- 44px minimum touch targets (already enforced via `min-h-[44px]` class)
- Use existing color tokens: `text-navy`, `text-mist`, `text-slate`, `bg-coral`
- Messages externalized in `messages.ts` — no inline strings

**Existing shadcn/ui components already available:**
Check `src/components/ui/` for which components exist. The `Select` component may need to be added.

### Public Page Display

**Current flow:** `src/app/[username]/[slug]/page.tsx` fetches voyage via `getPublicVoyageBySlug` → passes `profile.boat_name` to `BoatBadge`.

**What changes:**
1. **BoatBadge props** — Add `voyageBoatName`, `voyageBoatType` optional props. Display logic:
   - Name: `voyageBoatName ?? profileBoatName ?? voyageName`
   - Type (expanded): `voyageBoatType ?? profileBoatType`
2. **Public page header** — Below the BoatBadge or in the StatsBar area, show a subtle boat info line when voyage-level details exist:
   - Format: "Sailboat · 8.5 m · FR · Home port: Göteborg" (only show fields that are set)
   - Use `text-xs text-white/70` styling within the overlay area, similar to BoatBadge expanded style
3. **PublicVoyageContent** — Pass new voyage fields through to display components

**Important:** The `PublicVoyage` type in `src/lib/data/voyages.ts` extends `Voyage`. Since `Voyage = Tables<"voyages">`, after type regeneration the new columns will be automatically available on `PublicVoyage`. No manual type changes needed.

### Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `supabase/migrations/YYYYMMDDHHMMSS_voyage_boat_details.sql` | CREATE | New migration |
| `src/types/supabase.ts` | REGENERATE | `supabase gen types typescript` |
| `src/app/voyage/[id]/settings/actions.ts` | MODIFY | Add `updateBoatDetails` action |
| `src/app/voyage/[id]/settings/actions.test.ts` | MODIFY | Add tests for new action |
| `src/app/voyage/[id]/settings/VoyageSettingsForm.tsx` | MODIFY | Add "Boat Details" section |
| `src/app/voyage/[id]/settings/messages.ts` | MODIFY | Add boat section strings |
| `src/components/voyage/BoatBadge.tsx` | MODIFY | Accept voyage-level boat data |
| `src/app/[username]/[slug]/page.tsx` | MODIFY | Pass voyage boat data to BoatBadge |
| `src/app/[username]/[slug]/PublicVoyageContent.tsx` | MODIFY | (if BoatBadge is rendered here) |
| `src/app/[username]/[slug]/messages.ts` | MODIFY | Add boat display strings |
| `src/components/ui/select.tsx` | CREATE (maybe) | `npx shadcn@latest add select` if not present |

### Existing Patterns to Reuse

1. **`verifyOwnership` helper** — Already in `settings/actions.ts`, reuse for `updateBoatDetails`
2. **`normalizeFormValue` helper** — Already in `settings/actions.ts`, reuse for form parsing
3. **`withLogging` wrapper** — Already used on all actions in this file
4. **`showActionError` toast** — Import from `@/lib/toast-helpers` for error display
5. **`VoyageSettingsForm` section pattern** — Follow exact structure of existing sections (h2 + form + button)
6. **`messages.ts` structure** — Follow existing nested key pattern

### What NOT to Build (Scope Boundaries)

- **Crew management** — That is Story 11.2. Do NOT add crew fields.
- **Stats display toggles** — That is Story 11.4. Do NOT add `visible_stats`.
- **Section visibility toggles** — That is Story 11.5. Do NOT add `visible_sections`.
- **OG image changes** — That is Story 11.6. Do NOT modify `opengraph-image.tsx`.
- **Theme selection** — That is Epic 12. Do NOT add `theme` or `boat_icon` columns.
- **Boat icon picker** — That is Story 12.2. The boat_type here is a text enum, not an icon.

Only add the 5 columns specified in the migration: `boat_name`, `boat_type`, `boat_length_m`, `boat_flag`, `home_port`.

### Project Structure Notes

- The voyage settings page lives at `src/app/voyage/[id]/settings/` with collocated actions, messages, form component, and tests
- The BoatBadge component currently lives at `src/components/voyage/BoatBadge.tsx` — it currently takes `boatName` and `boatType` from the profile level
- Public voyage rendering: `src/app/[username]/[slug]/page.tsx` → Server Component that fetches data → passes to `PublicVoyageContent` client component
- Existing voyage DB layer at `src/lib/data/voyages.ts` already has `updateVoyage(id, data)` accepting `TablesUpdate<"voyages">`

### Testing Standards

- Co-located tests: `actions.test.ts` next to `actions.ts`
- Use Vitest (already configured)
- Mock `requireAuth`, `getVoyageById`, `updateVoyageDb` for Server Action tests
- Test happy path + validation errors + ownership check
- Follow existing test patterns in `src/app/voyage/[id]/settings/actions.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 11.1] — Story definition, acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#v2.0 Architecture Addendum] — Database schema, migration SQL
- [Source: _bmad-output/planning-artifacts/prd.md#FR-69] — Functional requirement
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#BoatBadge] — Badge UX spec
- [Source: CLAUDE.md#Architecture: 3-Tier Supabase Containment] — Containment rules
- [Source: src/app/voyage/[id]/settings/actions.ts] — Existing action patterns
- [Source: src/app/voyage/[id]/settings/VoyageSettingsForm.tsx] — Existing form structure
- [Source: src/components/voyage/BoatBadge.tsx] — Current BoatBadge implementation

## Dev Agent Record

### Agent Model Used



### Debug Log References

### Completion Notes List

### File List
