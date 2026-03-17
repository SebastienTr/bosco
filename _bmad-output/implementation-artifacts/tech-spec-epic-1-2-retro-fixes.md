---
title: 'Epic 1-2 Retro Fixes: Stopover Reliability & UI Stabilization'
type: 'bugfix'
created: '2026-03-17T15:25:00Z'
status: 'done'
baseline_commit: '13af2d9'
context:
  - '_bmad-output/implementation-artifacts/epic-1-2-retro-2026-03-17.md'
  - '_bmad-output/planning-artifacts/architecture.md'
---

# Epic 1-2 Retro Fixes: Stopover Reliability & UI Stabilization

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Stopovers in large ports (e.g. Le Havre) generate duplicates because the 2km merge radius is too small and there is no name-based deduplication after geocoding. Additionally, the in-memory geocode cache evaporates on Vercel cold starts, causing redundant Nominatim calls. Separately, no visual QA was performed across Epics 1-2, leaving undetected display issues on mobile.

**Approach:** (1) Increase merge radius to ~5km, add post-geocode name-based deduplication in `persistStopovers`, and add a `geocode_cache` Supabase table to survive cold starts. (2) Use Playwright browser automation to screenshot all key pages at 375px and 1280px, identify layout issues, and fix them.

## Boundaries & Constraints

**Always:** Respect 3-tier Supabase containment. Keep all 177 tests passing. Strings in `messages.ts`. ActionResponse `{ data, error }` on all Server Actions. GeoJSON `[lng, lat]` in data layer.

**Ask First:** If a UI fix requires changing the design system tokens in `globals.css`. If the geocode cache migration needs RLS policies (public table vs auth-only).

**Never:** Break existing stopover data. Import `@supabase/*` outside Tier 1. Add external caching services (Redis, Vercel KV). Inline string literals in components.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Same-name stopovers | 2 candidates at ~3km apart, both geocode to "Le Havre" | Merged into single stopover with averaged position | N/A |
| Different-name stopovers within radius | 2 candidates at ~4km, different names | Kept as separate stopovers (name takes precedence over radius) | N/A |
| Geocode cache hit | Request for cached coordinates | Return cached name+country, no Nominatim call | N/A |
| Geocode cache miss | New coordinates | Call Nominatim, store in cache, return result | Return empty name on Nominatim failure |
| Cold start geocode | Server restarts, same coordinates requested | DB cache hit, no Nominatim call | Falls back to Nominatim if DB read fails |

</frozen-after-approval>

## Code Map

- `src/lib/geo/stopover-detection.ts` -- Merge radius constant (`DEFAULT_MERGE_RADIUS_NM`)
- `src/app/voyage/[id]/stopover/actions.ts` -- `persistStopovers` dedup logic (311 LOC)
- `src/app/api/geocode/route.ts` -- Client-side geocode proxy with in-memory cache (65 LOC)
- `src/lib/geo/reverse-geocode.ts` -- Server-side geocode with batch support (116 LOC)
- `src/lib/data/stopovers.ts` -- Stopover repository functions (30 LOC)
- `supabase/migrations/` -- New migration for `geocode_cache` table
- `src/lib/data/geocode-cache.ts` -- New Tier 2 repository for geocode cache
- `src/app/page.tsx` -- Landing page (visual QA)
- `src/app/dashboard/page.tsx` -- Dashboard page (visual QA)
- `src/app/voyage/[id]/page.tsx` -- Voyage detail page (visual QA)
- `src/components/voyage/VoyageContent.tsx` -- Map overlays positioning
- `src/components/shared/NavigationBar.tsx` -- Bottom nav / sidebar

## Tasks & Acceptance

**Execution:**
- [ ] `supabase/migrations/*_geocode_cache.sql` -- Create `geocode_cache` table (lat_key, lon_key, name, country, created_at) with composite PK. No RLS needed (server-only access via service role).
- [ ] `src/lib/data/geocode-cache.ts` -- Add Tier 2 repository: `getCachedGeocode(latKey, lonKey)`, `upsertGeocode(latKey, lonKey, name, country)`.
- [ ] `src/lib/geo/reverse-geocode.ts` -- Replace in-memory `serverCache` with DB cache via `geocode-cache.ts`. Keep in-memory as L1 for same-request dedup in batch. Rate limiting unchanged.
- [ ] `src/app/api/geocode/route.ts` -- Replace in-memory cache with DB cache lookup. Keep rate limiting.
- [ ] `src/lib/geo/stopover-detection.ts` -- Increase `DEFAULT_MERGE_RADIUS_NM` from 1.08 to 2.7 (~5km).
- [ ] `src/app/voyage/[id]/stopover/actions.ts` -- After geocoding new stopovers in `persistStopovers`, merge any that share a name with existing stopovers (call existing `mergeStopovers` logic or inline merge).
- [ ] `src/lib/geo/stopover-detection.test.ts` -- Update tests for new merge radius.
- [ ] `src/app/voyage/[id]/stopover/actions.test.ts` -- Add test: two stopovers with same geocoded name get merged.
- [ ] `src/lib/data/geocode-cache.test.ts` -- Unit tests for cache repository.
- [ ] Visual QA pass -- Use Playwright to screenshot landing, dashboard, voyage, import pages at 375px and 1280px. Fix identified layout/overflow/spacing issues.

**Acceptance Criteria:**
- Given two stopover candidates within 5km in the same port, when persisted, then only one stopover is created with the geocoded port name.
- Given two stopover candidates at ~4km with different geocoded names, when persisted, then both stopovers are kept.
- Given a geocoded location, when the server cold-starts and the same coordinates are requested, then the cached result is returned without a Nominatim call.
- Given all key pages rendered at 375px width, when visually inspected, then no content overflow, broken layouts, or inaccessible elements exist.
- Given the test suite, when `npm run test` executes, then all tests pass including new ones.

## Design Notes

**Name-based merge strategy in `persistStopovers`:**
After inserting and geocoding new stopovers, iterate through all stopovers for the voyage. Group by normalized name (lowercase, trimmed). For groups with >1 stopover, merge all into the one with the earliest `arrived_at` using the existing merge logic (average position, earliest arrival, latest departure).

```typescript
// Post-geocode merge pseudocode
const allStopovers = await getStopoversByVoyageId(voyageId);
const byName = groupBy(allStopovers, s => s.name?.toLowerCase().trim());
for (const [name, group] of byName) {
  if (!name || group.length < 2) continue;
  const [keep, ...duplicates] = group.sort(byArrival);
  for (const dup of duplicates) await mergeStopoversInternal(keep.id, dup.id);
}
```

**Geocode cache table (no RLS):** The cache is accessed server-side only via the service role client. No user data exposed. Simple upsert on composite key `(lat_key, lon_key)`.

## Verification

**Commands:**
- `npm run test` -- expected: all tests pass (177 existing + new)
- `npm run build` -- expected: clean build
- `npm run lint` -- expected: no errors
- `npx tsc --noEmit` -- expected: no type errors

**Manual checks:**
- Playwright screenshots at 375px and 1280px show no layout issues
- Import two GPX tracks that dock at the same large port → single stopover created
