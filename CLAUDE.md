# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bosco is a digital logbook for recreational sailors. Sailors import GPX tracks (from Navionics or any source), build a visual voyage journal, and share it via public pages with animated route playback. The core differentiator is showing the exact sailing track (every tack, course change) rather than just waypoints.

**Status:** Planning phase complete, implementation ready to begin. No source code yet.

## Tech Stack

- **Framework:** Next.js 16 (React 19, TypeScript strict, Turbopack dev, App Router)
- **Styling:** Tailwind CSS 4 + shadcn/ui (creator) + custom Tailwind (public pages)
- **Backend:** Supabase (Postgres + Auth + Storage + RLS), Next.js Server Actions
- **Maps:** Leaflet + react-leaflet (dynamic import `ssr: false`) + OpenSeaMap overlay
- **Validation:** Zod 4 on all Server Action inputs
- **Testing:** Vitest (unit/integration, co-located), Playwright (E2E in `tests/e2e/`)
- **Deployment:** Vercel (auto-deploy on push to main)
- **Error tracking:** Sentry (`@sentry/nextjs`)

## Commands

```bash
# Local development
supabase start                          # Local Postgres + Auth + Storage
npm run dev                             # Next.js dev server (Turbopack)

# Database
supabase migration new <name>           # Create migration in supabase/migrations/
supabase db reset                       # Apply all migrations locally
supabase gen types typescript           # Regenerate types after migration

# Testing
npm run test                            # Vitest (all unit/integration tests)
npx vitest run src/lib/gpx/parser.test.ts  # Run a single test file
npx playwright test                     # E2E tests
npx playwright test tests/e2e/import.spec.ts  # Single E2E test

# Build & quality
npm run build                           # Production build
npm run lint                            # ESLint
npx tsc --noEmit                        # Type check
```

## Architecture: 3-Tier Supabase Containment

All Supabase access is mediated through abstraction layers to enable future migration. **Any import that skips a tier is a code review failure.**

```
Tier 1: src/lib/supabase/        ← ONLY place that imports @supabase/supabase-js
    ↓
Tier 2: src/lib/data/            ← Repository functions (all DB queries)
        src/lib/auth.ts          ← Auth wrapper (signIn, signOut, getUser, requireAuth)
        src/lib/storage.ts       ← Storage wrapper (uploadFile, getPublicUrl, deleteFile)
    ↓
Tier 3: src/app/*/actions.ts     ← Server Actions (business logic + Zod validation)
    ↓
Tier 4: src/components/          ← React components (call Server Actions only)
        src/app/*/page.tsx
```

**Migration path:** Replace Tier 1 + Tier 2 only. Tiers 3–4 remain untouched.

## Key Patterns

### Server Actions — always return `{ data, error }`
```typescript
// Never throw from Server Actions
{ data: T, error: null }                           // success
{ data: null, error: { code: ErrorCode, message: string } }  // error
```
Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `EXTERNAL_SERVICE_ERROR`, `PROCESSING_ERROR`

### Naming Conventions
- **Components:** `PascalCase.tsx` (e.g. `VoyageCard.tsx`)
- **Utilities/lib:** `kebab-case.ts` (e.g. `stopover-detection.ts`)
- **Server Actions:** `actions.ts` co-located in route directory, functions use `verbNoun` (e.g. `createVoyage`)
- **Database:** `snake_case` tables (plural), columns, foreign keys as `{singular}_id`
- **Constants:** `UPPER_SNAKE_CASE`
- **Types/Interfaces:** `PascalCase`

### GeoJSON Coordinates
Store as `[longitude, latitude]` (GeoJSON spec). Leaflet uses `[lat, lng]` — conversion happens only in map component layer.

### i18n Readiness
English-only MVP. All UI strings externalized in co-located `messages.ts` files per route/feature. Components never inline string literals.

### GPX Processing
All GPX processing runs in a **Web Worker** (mandatory, not optional). Pipeline: parse XML → simplify (Douglas-Peucker iterative/stack-based for 1M+ points) → convert to GeoJSON. Raw GPX is never stored server-side.

### Client-Only Boundaries
- `src/components/map/*` — dynamically imported (`ssr: false`), Leaflet needs `window`
- `src/components/gpx/*` — client components orchestrating Web Worker
- `src/lib/gpx/worker.ts` — Web Worker context, no DOM access

## Project Structure

```
src/
├── app/                    # Next.js App Router pages + co-located actions
│   ├── auth/               # Magic link auth (FR-1)
│   ├── dashboard/          # Voyage list + profile editing (FR-9, FR-2)
│   ├── voyage/[id]/        # Voyage view/edit, GPX import, settings (FR-3, FR-4)
│   ├── [username]/           # Public profile SSR (FR-8)
│   │   └── [slug]/         # Public voyage SSR + OG image (FR-7)
│   └── api/geocode/        # Nominatim proxy (rate-limited, cached)
├── components/
│   ├── ui/                 # shadcn/ui ONLY — no custom components here
│   ├── map/                # Leaflet map, route layers, markers
│   ├── voyage/             # Stats bar, stopover sheet, voyage cards
│   ├── gpx/                # Import flow UI
│   ├── log/                # Log entry form + cards
│   └── shared/             # Cross-feature (empty states, nav)
├── lib/
│   ├── supabase/           # Tier 1: client.ts, server.ts, middleware.ts
│   ├── data/               # Tier 2: repository functions per table
│   ├── auth.ts             # Tier 2: auth wrapper
│   ├── storage.ts          # Tier 2: storage wrapper
│   ├── gpx/                # Parser, simplifier, GeoJSON converter, worker
│   ├── geo/                # Distance, stopover detection, reverse geocode
│   └── utils/              # Formatting, image compression
├── types/                  # Shared types + generated Supabase types
└── middleware.ts            # Route protection
supabase/migrations/         # SQL migration files
tests/e2e/                   # Playwright E2E tests
```

## Anti-Patterns

- **Never** import `@supabase/*` outside `src/lib/supabase/`
- **Never** import from `src/lib/supabase/` in Server Actions — use `src/lib/data/`, `auth.ts`, `storage.ts`
- **Never** call Supabase from components — use Server Actions
- **Never** throw from Server Actions — return `{ data, error }`
- **Never** use `any` type — use generated Supabase types or Zod inferred types
- **Never** store coordinates as `[lat, lng]` in data — GeoJSON is `[lng, lat]`
- **Never** place custom components in `src/components/ui/` — shadcn/ui only

## Planning Documents

All planning artifacts are in `_bmad-output/planning-artifacts/`:
- `prd.md` — Product requirements (9 FRs, 18 NFRs)
- `architecture.md` — Full architecture decisions, patterns, and examples
- `epics.md` — Epic & story breakdown for implementation
- `ux-design-specification.md` — Complete UX design spec

## BMAD Framework

The `_bmad/` directory contains the BMAD development methodology system (agents, workflows, skills). Configuration: user Seb, communication in French, documentation output in English.
