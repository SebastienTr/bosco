# Deferred Work

## From: tech-spec-epic-1-2-retro-fixes (2026-03-17)

### 1. Tier violation: reverse-geocode.ts imports from data layer
`src/lib/geo/reverse-geocode.ts` imports from `@/lib/data/geocode-cache` (Tier 2). Utility code in `src/lib/geo/` should not depend on the data layer. Consider moving server-side geocode functions to a Tier 3 location or restructuring the cache access through Server Actions.

### 2. Duplicated DEFAULT_MERGE_RADIUS_NM constant
The constant `DEFAULT_MERGE_RADIUS_NM = 2.7` exists in both `src/lib/geo/stopover-detection.ts` and `src/app/voyage/[id]/stopover/actions.ts`. Extract to a shared constants file to prevent divergence.
