---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-15'
v1Addendum: '2026-03-29'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/prd-validation-report.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/architecture-notes.md'
workflowType: 'architecture'
project_name: 'bosco'
user_name: 'Seb'
date: '2026-03-15'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
9 FRs covering the full product surface: authentication (magic link), user profiles with public pages, voyage CRUD, GPX import with client-side processing pipeline (parse → simplify → GeoJSON), automatic stopover detection and reverse geocoding, log entries with photo attachments, public voyage pages with animated route rendering, public profile pages, and an authenticated dashboard. The GPX import pipeline (FR-4) and public voyage rendering (FR-7) carry the highest architectural complexity.

**Non-Functional Requirements:**
18 NFRs organized across 5 categories:
- **Performance (4):** 2s first paint on 4G (NFR-1), 400MB GPX import in <60s with <200ms input lag (NFR-2), 60fps map interaction (NFR-3), 100k points with <100ms interaction latency (NFR-4)
- **Security (4):** User data isolation via RLS (NFR-5/6), image upload validation (NFR-7), XSS prevention (NFR-8)
- **Mobile (4):** Mobile-first 375px+ (NFR-9), touch map interactions (NFR-10), mobile file picker + share sheet (NFR-11), image compression <1MB (NFR-12)
- **SEO (3):** SSR with complete HTML (NFR-13), Open Graph meta tags (NFR-14), structured data (NFR-15)
- **i18n (3):** English UI (NFR-16), externalized strings (NFR-17), nautical units with future-proof design (NFR-18)

**UX Architectural Implications:**
- PWA with Web Share Target registration — service worker and manifest required
- Full-bleed map as primary UI canvas — Leaflet with OpenSeaMap nautical overlay
- Route animation on public page first load — programmatic polyline drawing
- Glass morphism overlays (Direction D: translucent navy + backdrop blur)
- Bottom sheet pattern for stopover details — draggable, swipe-to-dismiss
- Dual design system: shadcn/ui (creator) + custom Tailwind (public)
- 3 breakpoints: mobile 375px, tablet 768px, desktop 1024px+
- WCAG 2.1 AA compliance including prefers-reduced-motion support

**Scale & Complexity:**

- Primary domain: Full-stack web (PWA)
- Complexity level: Moderate
- Estimated architectural components: ~15 (auth, profiles, voyages, legs, stopovers, log entries, GPX parser, simplifier, GeoJSON converter, stopover detector, reverse geocoder, map renderer, route animator, image compressor, PWA service worker)

### Technical Constraints & Dependencies

- **Supabase** as backend (Auth + Postgres + Storage + RLS) — accessed exclusively through abstraction layers, never directly from components
- **Leaflet** requires dynamic import with `ssr: false` in Next.js (window dependency)
- **Nominatim** external API for reverse geocoding — free, rate-limited (1 req/sec policy). Must be treated as asynchronous and non-blocking: stopovers display with coordinates first, names resolve progressively. Graceful degradation if Nominatim is unavailable.
- **Client-side GPX processing** in a Web Worker (architectural constraint, not optional) — browser memory and CPU constraints on mobile. Worker communication via simple message protocol: `{ type: 'process', file }` → `{ tracks, stopovers }` with intermediate `{ type: 'progress', step }` messages.
- **Douglas-Peucker** must be iterative (stack-based) to handle 1M+ points without stack overflow
- **No raw GPX storage** — only simplified GeoJSON persisted server-side
- **Vercel** deployment — serverless functions, edge network, no persistent server state

### Vendor Strategy Decision

**Decision: Option B — Lightweight Abstractions over Supabase**

Supabase is used for MVP speed (Auth, Postgres, Storage, RLS), but all access is mediated through thin abstraction layers to enable future migration without full rewrite.

**Abstraction boundaries:**
- **Data access:** Next.js Server Actions and API routes as the data layer. No direct Supabase client calls from React components. Components call server functions; server functions call Supabase.
- **Auth:** Wrapper module (`src/lib/auth.ts`) exposing `signIn`, `signOut`, `getUser`, `requireAuth`. Supabase Auth is the implementation. Swappable to Auth.js, Lucia, or custom JWT without touching calling code.
- **Storage:** Single file (`src/lib/storage.ts`) from day 1 concentrating all storage calls. Formal abstraction interface introduced when photo features are implemented.
- **Authorization:** RLS retained as database-level safety net. Application-level authorization also enforced in Server Actions (belt and suspenders). If RLS is removed in a future migration, the app-level checks remain.

**Data access layer:** Repository functions in `src/lib/data/` encapsulate all database queries. Server Actions call these functions, never the Supabase client directly. Migration means rewriting only `src/lib/data/*.ts` files — zero changes in Server Actions, components, or pages.

**Containment rule (3 tiers):**
1. `@supabase/supabase-js` → only inside `src/lib/supabase/`
2. `src/lib/supabase/*` → only imported by `src/lib/data/`, `src/lib/auth.ts`, `src/lib/storage.ts`
3. Server Actions → import only from `src/lib/data/`, `src/lib/auth.ts`, `src/lib/storage.ts`
4. Components → call only Server Actions

Any import that skips a tier is a code review failure.

**Trade-offs accepted:**
- Slightly more boilerplate than direct Supabase client usage
- Additional indirection layer (server function between component and DB)
- RLS policies maintained in parallel with app-level checks (some duplication)

**Benefits gained:**
- Supabase can be replaced component-by-component without full rewrite
- Server Actions provide a natural API boundary for future extraction
- App-level authorization survives any database migration
- Client bundle never contains database credentials or direct DB logic

### Cross-Cutting Concerns Identified

1. **Authentication & Authorization** — Supabase Auth (magic link) behind auth wrapper + RLS policies on all 5 tables + app-level checks in Server Actions. Anon key for public reads, authenticated key for writes. Middleware for route protection.
2. **Client-Side File Processing** — GPX parsing, track simplification, GeoJSON conversion, stats computation. All in-browser via dedicated Web Worker. Simple message protocol for Worker ↔ main thread communication with progress feedback.
3. **Image Optimization** — Client-side compression to <1MB before Supabase Storage upload. Applies to profile photos, boat photos, voyage covers, log entry photos.
4. **SEO & Social Sharing** — SSR for public pages, dynamic OG meta tags per voyage, JSON-LD structured data. Critical for the viral sharing loop.
5. **PWA Infrastructure** — Service worker, web app manifest, share target registration. Core to the Android import flow.
6. **Accessibility** — WCAG 2.1 AA across all pages, keyboard navigation, screen reader support, motion preferences. Integrated into component design, not bolted on.
7. **Internationalization Readiness** — English-only MVP with externalized strings and unit abstractions for future French UI and unit toggle. Strings externalized via collocated `messages.ts` files (see Implementation Patterns).

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web (PWA) based on project requirements: Next.js with App Router, TypeScript, Tailwind CSS, Supabase backend, Leaflet maps, PWA with Web Share Target.

### Version Update

Architecture notes referenced Next.js 15. As of March 2026, Next.js 16.1 is the latest stable release (December 2025) with stable Turbopack, React 19.2, Cache Components, and file system caching. The project targets Next.js 16.

### Starter Options Considered

| Option | Stack | Verdict |
|--------|-------|---------|
| `create-next-app` + `shadcn init` | Next.js 16 + TypeScript + Tailwind + shadcn/ui | **Selected** — clean foundation, full control over abstraction layers |
| Vercel Supabase Starter | Next.js + Supabase + Auth boilerplate | Rejected — direct Supabase calls from components violate Option B containment rule |
| T3 Stack (`create-t3-app`) | Next.js + tRPC + Prisma + Tailwind | Rejected — tRPC and Prisma incompatible with Server Actions + Supabase architecture |
| Community starters (Nextbase, etc.) | Full SaaS boilerplate | Rejected — too much unwanted complexity, unclear maintenance |

### Selected Starter: create-next-app + shadcn/ui

**Rationale:** Cleanest foundation for Option B vendor strategy. No pre-baked Supabase patterns to fight against. Full control over abstraction boundaries from day 1. Official tooling with strong maintenance guarantees.

**Initialization Commands:**

```bash
npx create-next-app@latest bosco --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"
cd bosco
npx shadcn@latest init -d
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript strict mode
- React 19.2 (via Next.js 16)
- Node.js runtime for server components and Server Actions

**Styling Solution:**
- Tailwind CSS 4 with PostCSS
- shadcn/ui component library (copy-paste model, Radix UI primitives)
- CSS variables for theming (Ocean & Sunset palette configured in tailwind.config.ts)

**Build Tooling:**
- Turbopack for development (stable in Next.js 16)
- Webpack for production builds
- ESLint for code quality

**Testing Framework:**
- Not included by starter — to be decided in architectural decisions step

**Code Organization:**
- `src/` directory with App Router structure
- `@/*` import alias for clean imports
- shadcn/ui components in `src/components/ui/`

**Development Experience:**
- Turbopack hot reload
- TypeScript type checking
- ESLint integration

**Backend Architecture:**
- No separate backend service. Next.js Server Actions and API routes serve as the backend layer, running as serverless functions on Vercel.
- All server-side logic (auth, CRUD, SSR, OG tags, reverse geocoding proxy) runs within Next.js.
- Sufficient for MVP requirements: no WebSocket, no long-running tasks, no background jobs.
- Option B abstractions enable future extraction to a separate backend if needed.

**Additional Setup Required (post-initialization):**
- Supabase client libraries (`@supabase/supabase-js`, `@supabase/ssr`)
- Abstraction layer files (`src/lib/auth.ts`, `src/lib/storage.ts`, `src/lib/supabase/`)
- Leaflet + react-leaflet (dynamic import with `ssr: false`)
- PWA setup: Serwist (maintained next-pwa successor) or native Next.js manifest + custom service worker for Web Share Target
- OpenSeaMap tile layer configuration

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data access pattern via Supabase JS client behind Server Actions
- Zod validation on all Server Action inputs
- Supabase CLI migrations (SQL files, version-controlled)
- React local state management (no global store for MVP)

**Important Decisions (Shape Architecture):**
- Vitest + Playwright testing stack
- Vercel auto-deploy + GitHub Actions CI
- Sentry error tracking + Vercel Analytics

**Deferred Decisions (Post-MVP):**
- Global state library (Zustand) — only if needed
- Advanced caching (TanStack Query) — only if refetch patterns get complex
- CDN configuration tuning — Vercel defaults sufficient for MVP

### Data Architecture

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| Data access | Supabase JS client behind `src/lib/data/` | latest | Query builder used exclusively inside `src/lib/data/*.ts` repository functions. Server Actions call repository functions, never the Supabase client. Migration = rewrite `src/lib/data/` only. |
| Validation | Zod | 4.x | Validates all Server Action inputs. Generates TypeScript types. Standard pairing with Next.js Server Actions. |
| Migrations | Supabase CLI | latest | SQL files in `supabase/migrations/`. Version-controlled, reproducible, compatible with Supabase dashboard and local dev. |
| Caching | Next.js built-in | 16.x | Cache Components + Vercel CDN for public SSR pages. No client-side cache library for MVP. |
| Type generation | Supabase CLI `gen types` | latest | Auto-generates TypeScript types from database schema. Single source of truth for data types. |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth provider | Supabase Auth (magic link) behind `src/lib/auth.ts` wrapper | Decided in step 2 (Option B). |
| Route protection | Next.js middleware | Checks auth state on protected routes, redirects to `/auth` if unauthenticated. |
| Authorization | RLS + app-level checks in Server Actions | Belt and suspenders. RLS as safety net, Server Actions as primary enforcement. |
| Input validation | Zod schemas on every Server Action | Prevents malformed data at the boundary. |
| File upload validation | Type + size check (max 10MB) in Server Action | Before forwarding to Supabase Storage. |
| CSP headers | Next.js `headers()` config | Restrictive CSP allowing Supabase, OpenStreetMap tile servers, Nominatim, and Sentry. |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary API pattern | Next.js Server Actions (`'use server'`) | Decided in step 2. Components call server functions, never Supabase directly. |
| Public data fetching | Server Components (direct) | Public pages use server components to fetch data at render time. No API route needed. |
| Reverse geocoding | API route (`/api/geocode`) as proxy | Rate-limits and caches Nominatim calls server-side. Prevents client from hitting Nominatim directly. |
| Error handling | Typed return values (`{ data, error }`) | Server Actions return structured results, never throw. Components handle errors explicitly. |
| File uploads | Server Action with `FormData` | Receives compressed image, validates, forwards to Supabase Storage via `src/lib/storage.ts`. |

### Frontend Architecture

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| State management | React local state (`useState`, `useReducer`) | — | No global store needed. Import flow uses `useReducer` for multi-step state. |
| Global store (deferred) | Zustand | — | Only introduced if shared state need emerges. Not for MVP. |
| Map library | Leaflet + react-leaflet | latest | Dynamic import with `ssr: false`. OpenSeaMap tile overlay. |
| Fonts | DM Serif Display + Nunito (Google Fonts) | — | Loaded via `next/font` for optimal performance. |
| Image optimization | `next/image` for static, client-side compression for uploads | — | Browser-based compression to <1MB before upload. |
| Animations | CSS transitions + Leaflet polyline animation | — | No Framer Motion for MVP. Route animation via progressive polyline drawing. |
| PWA | Serwist (next-pwa successor) or native service worker | latest | Web Share Target registration for Android import flow. |

### Infrastructure & Deployment

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| Hosting | Vercel | — | Native Next.js support, preview deploys, edge CDN. |
| CI checks | GitHub Actions | — | Lint + type-check + Vitest on PR. Playwright on main. |
| Deploy | Vercel auto-deploy | — | Preview on PR push, production on main merge. |
| Unit/Integration testing | Vitest | 4.x | Fast, TypeScript-native, compatible with Next.js. |
| E2E testing | Playwright | 1.58.x | Cross-browser, reliable, good Next.js integration. |
| Error tracking | Sentry (`@sentry/nextjs`) | 10.x | Free tier sufficient. Captures server + client errors. |
| Performance monitoring | Vercel Analytics | — | Built-in Web Vitals tracking. |
| Local development | Supabase CLI (local Postgres + Auth) | latest | `supabase start` for local dev. No cloud dependency during development. |

### AI Agent Development Principles

All code must be optimized for AI agent comprehension and debugging. These principles are architectural constraints, not guidelines.

| Principle | Implementation |
|-----------|---------------|
| **Explicit errors, never silent** | All Server Actions return `{ data, error }` with a human-readable message. No empty catch blocks. No swallowed exceptions. |
| **Structured logging** | `console.error` with context: action name, user id, input summary. Agents can grep and trace issues through logs. |
| **File name = responsibility** | One file = one clear responsibility. `src/lib/auth.ts` does auth. `src/app/voyage/[id]/actions.ts` does voyage actions. No ambiguity about where to look. |
| **No magic** | No implicit re-exports, no complex barrel files, no deeply nested HOCs. Code reads linearly top-to-bottom. An agent follows the call chain without jumping through indirection. |
| **Strict types everywhere** | Zero `any`. Supabase generated types + Zod schemas cover all data boundaries. An agent always knows the shape of data flowing through the system. |
| **Predictable naming conventions** | Server Actions: verb + noun (`createVoyage`, `deleteStopover`, `importTracks`). Files: `src/app/{feature}/actions.ts` for actions, `src/lib/{domain}.ts` for utilities. An agent guesses correctly where code lives. |
| **Collocated logic** | Server Actions live next to the pages that use them. No distant action files. An agent reads one directory to understand a feature. |
| **Typed error boundaries** | Each error has a category and message. `{ error: { code: 'VALIDATION_ERROR', message: 'Invalid GPX format' } }`. Agents classify and fix by category. |

### Decision Impact Analysis

**Implementation Sequence:**
1. Project init (`create-next-app` + `shadcn init`)
2. Supabase setup (local CLI + migrations + type generation)
3. Abstraction layers (`src/lib/auth.ts`, `src/lib/supabase/`, `src/lib/storage.ts`)
4. Auth flow (magic link + middleware + route protection)
5. Core CRUD (voyages, profiles via Server Actions)
6. Map integration (Leaflet dynamic import + OpenSeaMap)
7. GPX processing (Web Worker + Douglas-Peucker)
8. Public pages (SSR + OG tags + animation)
9. PWA setup (service worker + share target)

**Cross-Component Dependencies:**
- Auth wrapper must exist before any Server Action (all actions use `requireAuth`)
- Supabase type generation must run after each migration (types feed Server Actions + components)
- Map component must be dynamic-imported before any map feature
- Web Worker setup must precede GPX import feature
- Sentry init must be early in the stack (catches errors from all layers)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 5 categories where AI agents could make incompatible choices — naming, structure, formats, communication, and process patterns. All patterns below are mandatory for any agent working on this codebase.

### Naming Patterns

**Database Naming Conventions:**
- Tables: `snake_case`, plural → `voyages`, `log_entries`, `stopovers`
- Columns: `snake_case` → `user_id`, `started_at`, `avg_speed_kts`
- Foreign keys: `{singular_table}_id` → `voyage_id`, `leg_id`
- Indexes: `idx_{table}_{columns}` → `idx_voyages_user_id`
- Enums: `snake_case` → `visibility_type`

**Code Naming Conventions:**
- Component files: `PascalCase.tsx` → `VoyageCard.tsx`, `StopoverSheet.tsx`
- Utility/lib files: `kebab-case.ts` → `stopover-detection.ts`, `reverse-geocode.ts`
- Server Action files: `actions.ts` (collocated in route directory)
- Functions: `camelCase` → `createVoyage`, `detectStopovers`
- Types/Interfaces: `PascalCase` → `Voyage`, `Stopover`, `ImportResult`
- Constants: `UPPER_SNAKE_CASE` → `MAX_FILE_SIZE`, `DEFAULT_STOPOVER_RADIUS_KM`
- Server Actions: `verbNoun` pattern → `createVoyage`, `deleteStopover`, `importTracks`

**API Naming Conventions:**
- No REST routes. Server Actions are the API surface.
- Only API route: `/api/geocode` (Nominatim proxy)
- Query parameters (if any): `camelCase`

### Structure Patterns

**Project Organization (feature-based):**
- Components organized by feature domain, not by type
- `src/components/map/` → all map-related components
- `src/components/voyage/` → all voyage-related components
- `src/components/gpx/` → all GPX import-related components
- `src/components/log/` → all log entry components
- `src/components/ui/` → shadcn/ui only (never place custom components here)

**Lib Organization (domain-based):**
- `src/lib/supabase/` → `client.ts`, `server.ts`, `middleware.ts` (containment zone)
- `src/lib/auth.ts` → auth wrapper (`signIn`, `signOut`, `getUser`, `requireAuth`)
- `src/lib/storage.ts` → storage wrapper (`uploadFile`, `getPublicUrl`, `deleteFile`)
- `src/lib/gpx/` → `parser.ts`, `simplify.ts`, `to-geojson.ts`, `worker.ts`
- `src/lib/geo/` → `distance.ts`, `stopover-detection.ts`, `reverse-geocode.ts`
- `src/lib/utils/` → `format.ts`, `image.ts`

**Test Location:**
- Unit/integration tests: co-located next to tested file → `actions.test.ts` beside `actions.ts`
- E2E tests: `tests/e2e/` at project root
- Test naming: `describe('{functionName}')` → `it('should ...')`

**File Structure Rules:**
- Config files at project root: `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Environment files: `.env.local` (local dev), `.env.example` (committed template)
- Supabase: `supabase/migrations/` for SQL migrations
- Types: `src/types/` for shared types, `src/types/supabase.ts` for generated DB types

### Format Patterns

**Server Action Return Format (mandatory):**

```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { code: ErrorCode, message: string } }
```

**Standardized Error Codes:**
- `VALIDATION_ERROR` — invalid input (Zod failure)
- `NOT_FOUND` — resource does not exist
- `UNAUTHORIZED` — not authenticated
- `FORBIDDEN` — authenticated but not authorized
- `EXTERNAL_SERVICE_ERROR` — Nominatim down, Supabase error
- `PROCESSING_ERROR` — GPX parsing failure, image compression failure

**Date/Time Formats:**
- Database: `TIMESTAMPTZ` always (UTC storage)
- JSON/Server Actions: ISO 8601 string (`2026-03-15T14:30:00Z`)
- UI display: formatted locally via `Intl.DateTimeFormat`
- Never store dates as epoch integers

**GeoJSON Format:**
- Standard GeoJSON `LineString` for tracks
- Coordinates in `[longitude, latitude]` order (GeoJSON spec, NOT `[lat, lng]`)
- This is critical: Leaflet uses `[lat, lng]` internally — conversion happens in the map component layer, never in stored data

**JSON Field Naming:**
- Database fields: `snake_case` (Postgres convention)
- TypeScript interfaces: `camelCase` (auto-mapped by Supabase client)
- No manual case conversion needed — Supabase JS client handles this

### Communication Patterns

**Web Worker Messages:**

```typescript
// Main → Worker
{ type: 'process', file: File }

// Worker → Main (progress)
{ type: 'progress', step: 'parsing' | 'simplifying' | 'detecting' | 'ready' }

// Worker → Main (result)
{ type: 'result', data: { tracks: GeoJSON[], stopovers: Stopover[], stats: TrackStats[] } }

// Worker → Main (error)
{ type: 'error', error: { code: string, message: string } }
```

**State Management Patterns:**
- Server state: Server Components fetch data at render time. No client-side cache.
- Client state: `useState` for simple state, `useReducer` for multi-step flows (GPX import).
- Form state: `react-hook-form` + Zod resolver for creator forms.
- No global store for MVP. If needed later, Zustand with single-purpose stores.
- State updates are always immutable (spread operator, never direct mutation).

### Process Patterns

**Loading State Patterns:**
- Server Components: `loading.tsx` file per route segment (Next.js convention)
- Client interactions: local `isLoading` boolean in the component
- GPX import: Worker progress messages drive UI (`parsing` → `simplifying` → `detecting` → `ready`)
- Never a generic spinner — always a contextual message describing what is happening

**Form Patterns:**
- Zod schema defined first, form built on top of it
- Client-side validation (fast UX) + server-side validation (security) using the same Zod schema
- shadcn/ui `Form` component + `react-hook-form` for creator forms
- Inline validation on blur, error message below field in Error red
- Username field: real-time availability check with debounce

**i18n Readiness Pattern (NFR-17):**
- No i18n library for MVP (English only)
- All user-facing strings externalized in a collocated `messages.ts` file per route or feature
- Example: `src/app/dashboard/messages.ts` exports `{ title: 'My Voyages', empty: 'Create your first voyage' }`
- Components import from `messages.ts`, never inline string literals for UI text
- When French UI is needed (Growth phase): replace `messages.ts` files with `next-intl` translation files — same keys, zero component changes
- Units (nm, kts) formatted via `src/lib/utils/format.ts` — already abstracted for future unit toggle

**Error Boundary Patterns:**
- `error.tsx` per route segment (Next.js convention)
- Global fallback: "Something went wrong" + retry button
- GPX errors: specific message + link to supported formats
- Network errors: "Check your connection" + retry
- Never a blank screen — every error state has a recovery path

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow naming conventions exactly — no exceptions, no "close enough"
2. Return `{ data, error }` from every Server Action — no throwing, no alternative formats
3. Place Supabase imports exclusively in `src/lib/` — containment rule is non-negotiable
4. Co-locate tests next to the file they test — no separate test directories for unit tests
5. Use `PascalCase.tsx` for components and `kebab-case.ts` for utilities — file naming is not optional
6. Store coordinates as `[longitude, latitude]` in GeoJSON — `[lat, lng]` only in Leaflet map layer

**Pattern Verification:**
- ESLint rules enforce import containment (`no-restricted-imports` for `@supabase/*` outside `src/lib/`)
- TypeScript strict mode catches type violations
- PR review checks naming conventions and return format compliance
- Vitest tests verify Server Action return format consistency

### Pattern Examples

**Good Example — Data Access Layer:**
```typescript
// src/lib/data/voyages.ts
import { supabase } from '@/lib/supabase/server'
import type { Voyage } from '@/types'

export async function insertVoyage(userId: string, name: string, description?: string) {
  return supabase
    .from('voyages')
    .insert({ user_id: userId, name, description })
    .select()
    .single()
}

export async function getVoyagesByUser(userId: string) {
  return supabase
    .from('voyages')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
}
```

**Good Example — Server Action (uses data layer, never Supabase):**
```typescript
// src/app/dashboard/actions.ts
'use server'

import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { insertVoyage } from '@/lib/data/voyages'

const CreateVoyageSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})

export async function createVoyage(formData: FormData) {
  const user = await requireAuth()
  const parsed = CreateVoyageSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } }
  }

  const { data, error } = await insertVoyage(user.id, parsed.data.name, parsed.data.description)

  if (error) {
    return { data: null, error: { code: 'EXTERNAL_SERVICE_ERROR', message: error.message } }
  }

  return { data, error: null }
}
```

**Anti-Patterns:**
```typescript
// ❌ Direct Supabase import in a component
import { supabase } from '@/lib/supabase/client'
// Components NEVER import Supabase directly

// ❌ Throwing from Server Actions
throw new Error('Voyage not found')
// ALWAYS return { data: null, error: { code, message } }

// ❌ Generic spinner
<Spinner />
// ALWAYS use contextual message: "Loading your voyages..."

// ❌ Coordinates as [lat, lng] in stored data
{ coordinates: [48.279, -4.595] }
// ALWAYS [longitude, latitude] in GeoJSON: [-4.595, 48.279]

// ❌ any type
const data: any = await fetchData()
// ALWAYS use generated Supabase types or Zod inferred types

// ❌ Server Action importing Supabase directly
import { supabase } from '@/lib/supabase/server'
// Server Actions import from src/lib/data/, src/lib/auth.ts, src/lib/storage.ts — NEVER from src/lib/supabase/
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
bosco/
├── .env.example                          # Environment variables template (committed)
├── .env.local                            # Local dev variables (git-ignored)
├── .eslintrc.json                        # ESLint config
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml                        # Lint + type-check + Vitest on PR
├── next.config.ts                        # Next.js 16 config (CSP headers)
├── tailwind.config.ts                    # Tailwind + Ocean & Sunset design tokens
├── tsconfig.json                         # TypeScript strict
├── package.json
├── components.json                       # shadcn/ui config
├── vitest.config.ts                      # Vitest config
├── playwright.config.ts                  # Playwright E2E config
├── sentry.client.config.ts              # Sentry browser init
├── sentry.server.config.ts              # Sentry server init
├── supabase/
│   ├── config.toml                       # Supabase local dev config
│   └── migrations/
│       ├── 001_profiles.sql              # FR-2: profiles table + RLS
│       ├── 002_voyages.sql               # FR-3: voyages table + RLS
│       ├── 003_legs.sql                  # FR-4: legs table + RLS
│       ├── 004_stopovers.sql             # FR-5: stopovers table + RLS
│       ├── 005_log_entries.sql           # FR-6: log_entries table + RLS
│       └── 006_storage_buckets.sql       # Storage buckets + policies
├── public/
│   ├── manifest.json                     # PWA manifest (share target)
│   ├── sw.js                             # Service worker (Serwist or custom)
│   ├── icons/                            # PWA icons (192, 512)
│   └── og/                               # Default OG images
├── tests/
│   └── e2e/
│       ├── onboarding.spec.ts            # UJ-1: signup → profile → first voyage
│       ├── import.spec.ts                # UJ-3: GPX import flow
│       ├── public-voyage.spec.ts         # UJ-6: visitor browsing
│       └── share.spec.ts                 # UJ-5: make public + copy link
├── src/
│   ├── app/
│   │   ├── globals.css                   # Tailwind base + custom CSS vars
│   │   ├── layout.tsx                    # Root layout (fonts, Sentry, metadata)
│   │   ├── page.tsx                      # Landing page (public)
│   │   ├── not-found.tsx                 # 404 page
│   │   ├── error.tsx                     # Global error boundary
│   │   ├── loading.tsx                   # Global loading fallback
│   │   │
│   │   ├── auth/                         # FR-1: Authentication
│   │   │   ├── page.tsx                  # Magic link login/signup
│   │   │   ├── actions.ts                # signIn, signUp Server Actions
│   │   │   ├── actions.test.ts
│   │   │   └── callback/
│   │   │       └── route.ts              # Magic link callback handler
│   │   │
│   │   ├── dashboard/                    # FR-9: Dashboard
│   │   │   ├── page.tsx                  # My voyages list
│   │   │   ├── loading.tsx               # Dashboard skeleton
│   │   │   ├── actions.ts                # listVoyages, createVoyage
│   │   │   ├── actions.test.ts
│   │   │   └── profile/                  # FR-2: Profile management
│   │   │       ├── page.tsx              # Edit profile form
│   │   │       ├── actions.ts            # updateProfile, checkUsername
│   │   │       └── actions.test.ts
│   │   │
│   │   ├── voyage/                       # FR-3: Voyage management
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Create voyage form
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Voyage view/edit (map + legs + journal)
│   │   │       ├── loading.tsx
│   │   │       ├── error.tsx
│   │   │       ├── actions.ts            # updateVoyage, deleteVoyage, etc.
│   │   │       ├── actions.test.ts
│   │   │       ├── import/               # FR-4: GPX import
│   │   │       │   └── page.tsx          # Import flow (preview + confirm)
│   │   │       └── settings/
│   │   │           └── page.tsx          # Voyage settings (slug, visibility)
│   │   │
│   │   ├── [username]/                     # FR-8: Public profile
│   │   │   ├── page.tsx                  # Public profile (SSR)
│   │   │   └── [slug]/                   # FR-7: Public voyage
│   │   │       ├── page.tsx              # Public voyage page (SSR + animation)
│   │   │       └── opengraph-image.tsx   # Dynamic OG image generation
│   │   │
│   │   └── api/
│   │       └── geocode/
│   │           └── route.ts              # Nominatim proxy (rate-limited, cached)
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui ONLY — no custom components here
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   └── skeleton.tsx
│   │   │
│   │   ├── map/                          # FR-5, FR-7: Map components
│   │   │   ├── MapCanvas.tsx             # Leaflet wrapper (dynamic import)
│   │   │   ├── RouteLayer.tsx            # Track rendering
│   │   │   ├── RouteAnimation.tsx        # Track animation controller
│   │   │   ├── StopoverMarker.tsx        # Coral waypoint markers
│   │   │   └── BoatMarker.tsx            # Current position icon
│   │   │
│   │   ├── voyage/                       # FR-3, FR-7: Voyage components
│   │   │   ├── VoyageCard.tsx            # Dashboard card with mini map
│   │   │   ├── StatsBar.tsx              # Floating stats display
│   │   │   ├── BoatBadge.tsx             # Top-left boat name overlay
│   │   │   ├── StopoverSheet.tsx         # Bottom sheet (sand bg)
│   │   │   ├── PortsPanel.tsx            # Stopovers list by country
│   │   │   └── ActionFAB.tsx             # Floating action button
│   │   │
│   │   ├── gpx/                          # FR-4: GPX import components
│   │   │   ├── GpxImporter.tsx           # Upload + file selection
│   │   │   ├── ImportProgress.tsx        # Processing feedback overlay
│   │   │   ├── TrackPreview.tsx          # Per-track preview with stats
│   │   │   └── ImportConfirmation.tsx    # Final confirm before upload
│   │   │
│   │   ├── log/                          # FR-6: Log entry components
│   │   │   ├── LogEntryForm.tsx          # Create/edit entry
│   │   │   └── LogEntryCard.tsx          # Display entry in timeline
│   │   │
│   │   ├── profile/                      # FR-2: Profile components
│   │   │   └── ProfileForm.tsx           # Profile edit form
│   │   │
│   │   └── shared/                       # Cross-feature shared components
│   │       ├── EmptyState.tsx            # Empty voyage/dashboard prompts
│   │       └── NavigationBar.tsx         # Bottom tab nav (creator)
│   │
│   ├── lib/
│   │   ├── supabase/                     # TIER 1 — Supabase clients (containment zone)
│   │   │   ├── client.ts                 # Browser Supabase client
│   │   │   ├── server.ts                 # Server Supabase client
│   │   │   └── middleware.ts             # Auth middleware helper
│   │   │
│   │   ├── data/                         # TIER 2 — Data access layer (repository)
│   │   │   ├── voyages.ts                # CRUD voyages
│   │   │   ├── voyages.test.ts
│   │   │   ├── profiles.ts              # CRUD profiles
│   │   │   ├── profiles.test.ts
│   │   │   ├── legs.ts                   # CRUD legs
│   │   │   ├── legs.test.ts
│   │   │   ├── stopovers.ts             # CRUD stopovers
│   │   │   ├── stopovers.test.ts
│   │   │   ├── log-entries.ts            # CRUD log entries
│   │   │   └── log-entries.test.ts
│   │   │
│   │   ├── auth.ts                       # Auth wrapper (signIn, signOut, getUser, requireAuth)
│   │   ├── auth.test.ts
│   │   ├── storage.ts                    # Storage wrapper (uploadFile, getPublicUrl, deleteFile)
│   │   ├── storage.test.ts
│   │   │
│   │   ├── gpx/                          # GPX processing pipeline
│   │   │   ├── parser.ts                 # GPX XML → structured data
│   │   │   ├── parser.test.ts
│   │   │   ├── simplify.ts              # Douglas-Peucker iterative
│   │   │   ├── simplify.test.ts
│   │   │   ├── to-geojson.ts            # Simplified track → GeoJSON
│   │   │   ├── to-geojson.test.ts
│   │   │   └── worker.ts                # Web Worker entry point
│   │   │
│   │   ├── geo/                          # Geospatial utilities
│   │   │   ├── distance.ts              # Haversine (nm), speed calculations
│   │   │   ├── distance.test.ts
│   │   │   ├── stopover-detection.ts    # Auto-detect stopovers from endpoints
│   │   │   ├── stopover-detection.test.ts
│   │   │   └── reverse-geocode.ts       # Nominatim client
│   │   │
│   │   └── utils/
│   │       ├── format.ts                 # Date, distance, duration formatting
│   │       ├── format.test.ts
│   │       └── image.ts                  # Client-side image compression
│   │
│   ├── types/
│   │   ├── index.ts                      # Shared app types (Voyage, Leg, Stopover, etc.)
│   │   ├── supabase.ts                   # Generated DB types (supabase gen types)
│   │   └── gpx.ts                        # GPX processing types (WorkerMessage, etc.)
│   │
│   └── middleware.ts                     # Next.js middleware (auth route protection)
```

### Architectural Boundaries

**3-Tier Containment (Supabase Isolation):**

```
Tier 1: src/lib/supabase/     ← only place that imports @supabase/supabase-js
    ↓
Tier 2: src/lib/data/         ← repository functions (queries)
         src/lib/auth.ts       ← auth wrapper
         src/lib/storage.ts    ← storage wrapper
    ↓
Tier 3: src/app/*/actions.ts  ← Server Actions (business logic + validation)
    ↓
Tier 4: src/components/       ← React components (UI only)
         src/app/*/page.tsx    ← Pages
```

**Migration path (quit Supabase):** Replace Tier 1 + Tier 2 only. Tiers 3 and 4 remain untouched.

**SSR Boundary:**
- `src/app/[username]/` and `src/app/[username]/[slug]/` → Server Components (SSR, SEO, OG)
- `src/app/dashboard/`, `src/app/voyage/` → authenticated, server components with client islands

**Client-Only Boundary:**
- `src/components/map/*` → dynamically imported (`ssr: false`), Leaflet requires `window`
- `src/components/gpx/*` → client components, orchestrate Web Worker
- `src/lib/gpx/worker.ts` → runs in Web Worker context, no DOM access

### Data Flow

```
Component → Server Action → src/lib/data/*.ts → src/lib/supabase/server.ts → Supabase Postgres
                          → src/lib/auth.ts → src/lib/supabase/server.ts → Supabase Auth
                          → Zod validation (at Server Action level)

GPX File → Web Worker (src/lib/gpx/worker.ts)
         → parser.ts → simplify.ts → to-geojson.ts
         → Main thread → Server Action → src/lib/data/legs.ts → Supabase

Image → Client compression (src/lib/utils/image.ts)
      → Server Action → src/lib/storage.ts → src/lib/supabase/server.ts → Supabase Storage
```

### FR → Structure Mapping

| FR | Primary Location | Dependencies |
|----|-----------------|--------------|
| FR-1 Auth | `src/app/auth/`, `src/lib/auth.ts`, `src/middleware.ts` | `src/lib/supabase/` |
| FR-2 Profile | `src/app/dashboard/profile/`, `src/components/profile/` | `src/lib/data/profiles.ts`, `src/lib/storage.ts` |
| FR-3 Voyages | `src/app/voyage/`, `src/app/dashboard/`, `src/components/voyage/` | `src/lib/data/voyages.ts` |
| FR-4 GPX Import | `src/app/voyage/[id]/import/`, `src/components/gpx/`, `src/lib/gpx/` | Web Worker, `src/lib/data/legs.ts`, `src/lib/geo/` |
| FR-5 Stopovers | `src/components/map/`, `src/lib/geo/` | `src/app/api/geocode/`, `src/lib/data/stopovers.ts` |
| FR-6 Log Entries | `src/components/log/` | `src/lib/data/log-entries.ts`, `src/lib/storage.ts` |
| FR-7 Public Voyage | `src/app/[username]/[slug]/`, `src/components/map/`, `src/components/voyage/` | SSR, `src/lib/data/voyages.ts`, OG image |
| FR-8 Public Profile | `src/app/[username]/` | SSR, `src/lib/data/profiles.ts` |
| FR-9 Dashboard | `src/app/dashboard/` | `src/lib/data/voyages.ts`, `src/components/voyage/VoyageCard.tsx` |

### External Integrations

| Service | Integration Point | Pattern |
|---------|------------------|---------|
| Supabase Auth | `src/lib/auth.ts` → `src/lib/supabase/` | Tier 2 wrapper |
| Supabase Postgres | `src/lib/data/*.ts` → `src/lib/supabase/server.ts` | Tier 2 repository |
| Supabase Storage | `src/lib/storage.ts` → `src/lib/supabase/` | Tier 2 wrapper |
| Nominatim | `src/app/api/geocode/route.ts` | API route proxy, cached, rate-limited |
| OpenStreetMap tiles | `src/components/map/MapCanvas.tsx` | Direct tile URL |
| OpenSeaMap tiles | `src/components/map/MapCanvas.tsx` | Overlay tile URL |
| Sentry | `sentry.*.config.ts` | SDK init at app root |
| Vercel Analytics | `src/app/layout.tsx` | `<Analytics />` component |

### Development Workflow

**Local development:**
```bash
supabase start                    # Local Postgres + Auth + Storage
npm run dev                       # Next.js dev server (Turbopack)
supabase gen types typescript     # Regenerate types after migration
```

**Adding a new migration:**
```bash
supabase migration new <name>     # Creates SQL file in supabase/migrations/
# Edit the SQL file
supabase db reset                 # Apply all migrations locally
supabase gen types typescript     # Update generated types
```

**Build and deploy:**
```bash
npm run build                     # Production build (Webpack)
npm run test                      # Vitest unit/integration
npx playwright test               # E2E tests
# Push to main → Vercel auto-deploys
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible and current as of March 2026. Next.js 16 + React 19.2 + TypeScript strict + Tailwind CSS 4 + shadcn/ui + Supabase + Leaflet + Zod 4 + Vitest 4 + Playwright 1.58 + Sentry 10. No version conflicts or incompatibilities detected.

**Pattern Consistency:**
3-tier containment rule is consistently reflected in directory structure, import patterns, and code examples. Naming conventions (PascalCase components, kebab-case utils, snake_case DB, camelCase functions) are non-contradictory and follow ecosystem standards. Server Action `{ data, error }` format is uniform. GeoJSON `[lng, lat]` convention properly documented with Leaflet conversion note.

**Structure Alignment:**
Project directory structure maps 1:1 to architectural boundaries (Tier 1–4). Feature-based component organization supports the FR mapping. Collocated tests align with Vitest config. E2E tests in `tests/e2e/` align with Playwright config.

### Requirements Coverage ✅

**Functional Requirements:** 9/9 FRs fully covered with explicit directory mappings and data access paths.

**Non-Functional Requirements:** 18/18 NFRs covered.
- Performance (NFR-1 to 4): SSR + CDN, Web Worker, Leaflet, simplified GeoJSON
- Security (NFR-5 to 8): RLS + app-level auth, Zod validation, CSP headers
- Mobile (NFR-9 to 12): Tailwind responsive, Leaflet touch, PWA share target, image compression
- SEO (NFR-13 to 15): Server Components, OG image generation, JSON-LD
- i18n (NFR-16 to 18): English default, collocated `messages.ts` pattern for string externalization, unit formatting abstracted in `format.ts`

### Implementation Readiness ✅

**Decision Completeness:** All critical decisions documented with verified versions and rationale. Technology stack fully specified. AI Agent Development Principles provide explicit coding constraints.

**Structure Completeness:** Full project tree with every file and directory. FR → structure mapping table. External integrations table. Data flow diagrams. Development workflow commands.

**Pattern Completeness:** Naming, structure, format, communication, process, and i18n patterns all defined with concrete good examples and anti-patterns.

### Gap Analysis Results

**Critical Gaps:** None.

**Resolved Gaps:**
- NFR-17 (string externalization): Resolved with collocated `messages.ts` pattern. Migration path to `next-intl` documented.

**Deferred (acceptable):**
- PWA implementation specifics (Serwist vs custom): Both options listed. Decision deferred to implementation — either works.
- Geocode API route rate limiting implementation: Pattern described (cached, rate-limited), exact implementation deferred.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Moderate)
- [x] Technical constraints identified (7 constraints)
- [x] Cross-cutting concerns mapped (7 concerns)

**✅ Vendor Strategy**
- [x] Option B — Lightweight Abstractions over Supabase
- [x] 3-tier containment rule defined and enforced
- [x] Data access layer (`src/lib/data/`) isolates all queries
- [x] Migration path documented (replace Tier 1 + Tier 2 only)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified (Next.js 16, Zod 4, Vitest 4, Playwright 1.58, Sentry 10)
- [x] Integration patterns defined
- [x] Performance considerations addressed
- [x] AI Agent Development Principles established

**✅ Implementation Patterns**
- [x] Naming conventions established (DB, code, API)
- [x] Structure patterns defined (feature-based, collocated)
- [x] Format patterns specified (return types, error codes, dates, GeoJSON)
- [x] Communication patterns documented (Worker messages, state management)
- [x] Process patterns complete (loading, forms, errors, i18n readiness)
- [x] Good examples and anti-patterns provided

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] 3-tier component boundaries established
- [x] Integration points mapped (internal + external)
- [x] FR → structure mapping complete (9/9)
- [x] Development workflow documented

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION (MVP scope)

---

## v1.0 Architecture Addendum

**Date:** 2026-03-29
**Context:** The PRD has been rewritten for v1.0 scope (68 FRs, 35 NFRs — up from 9 FRs, 18 NFRs). The MVP (4 epics) is deployed and live at sailbosco.com. This addendum extends the architecture for v1.0 capabilities without changing existing patterns.

**Principle:** All existing architectural decisions, patterns, and containment rules remain in effect. This addendum adds new capabilities that follow the same patterns.

### Capacitor Architecture (FR-14, FR-46, FR-48, FR-61, FR-62, FR-63)

**Decision: Capacitor 6.x wrapping sailbosco.com**

The native apps are a thin shell around the production web app. The app IS the website with native plugins layered on top. Single codebase, single deployment.

**Directory Structure:**
```
bosco/
├── ios/                              # Generated by Capacitor (Xcode project)
│   └── App/
│       └── ShareExtension/           # Custom iOS Share Extension (Swift)
│           ├── ShareViewController.swift
│           └── Info.plist
├── android/                          # Generated by Capacitor (Android Studio)
│   └── app/
│       └── src/main/
│           └── AndroidManifest.xml   # Intent filter for GPX share target
├── capacitor.config.ts               # Capacitor config (server URL, plugins)
```

**Build Pipeline:**
```bash
npm run build                         # Next.js production build
npx cap sync                          # Sync web assets + native plugins
# iOS: open ios/ in Xcode → build/archive
# Android: open android/ in Android Studio → build APK/AAB
```

**Capacitor Config:**
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.sailbosco.app',
  appName: 'Bosco',
  webDir: 'out',                      // or server URL for live mode
  server: {
    url: 'https://www.sailbosco.com', // wrapper points to production
    cleartext: false
  },
  plugins: {
    SplashScreen: { launchAutoHide: true },
    StatusBar: { style: 'dark' }
  }
}
```

**Native Plugins Used:**
| Plugin | Purpose | Package |
|--------|---------|---------|
| Share (send) | Native share sheet for links | `@capacitor/share` |
| Filesystem | File access for GPX import | `@capacitor/filesystem` |
| Status Bar | Style customization | `@capacitor/status-bar` |
| Splash Screen | App launch screen | `@capacitor/splash-screen` |

**iOS Share Extension (FR-14):**
- Separate Swift target within the iOS project
- Receives GPX files from Navionics share sheet
- Stores file in App Group shared container (`group.com.sailbosco.app`)
- Opens main app via URL scheme: `bosco://import?file=<path>`
- Main app detects pending import on launch and navigates to import preview

**Android Intent Filter (FR-14):**
- Configured in `AndroidManifest.xml`
- Accepts `application/gpx+xml` and `application/octet-stream` for `.gpx` files
- App receives intent → extracts file URI → navigates to import preview

**Architectural Pattern — Platform Detection:**
```typescript
// src/lib/platform.ts
import { Capacitor } from '@capacitor/core'

export const isNative = Capacitor.isNativePlatform()
export const platform = Capacitor.getPlatform() // 'ios' | 'android' | 'web'
```

Components use `isNative` to conditionally enable native features (share sheet, file system). All platform-specific code isolated in `src/lib/platform.ts` — never scattered across components.

### Deep Linking Architecture (FR-48)

**Universal Links (iOS):**
```
public/.well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [{
      "appIDs": ["TEAM_ID.com.sailbosco.app"],
      "paths": ["/*"]
    }]
  }
}
```

**App Links (Android):**
```
public/.well-known/assetlinks.json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.sailbosco.app",
    "sha256_cert_fingerprints": ["..."]
  }
}]
```

**Route Handling:** When app is installed, OS intercepts `sailbosco.com/*` links and opens in-app. Capacitor routes to the correct page via the web URL. No custom deep link routing needed — the web router handles everything.

### Offline Architecture (FR-30, FR-31, FR-32, NFR-6, NFR-7)

**Decision: Simple offline with Service Worker + IndexedDB**

**Scope (v1.0 — deliberately minimal):**
- Offline journal entry creation (text + photo queue)
- Cached voyage data browsing (Service Worker cache)
- NOT: GPX import offline, NOT: offline sign-in

**IndexedDB Schema:**
```typescript
// src/lib/offline/schema.ts
interface OfflineStore {
  pendingEntries: {
    id: string              // UUID generated client-side
    voyageId: string
    date: string
    text: string
    stopoverId?: string
    legId?: string
    photos: PendingPhoto[]
    createdAt: string
    syncStatus: 'pending' | 'syncing' | 'failed'
  }[]
  pendingPhotos: {
    id: string
    entryId: string
    blob: Blob
    syncStatus: 'pending' | 'syncing' | 'failed'
  }[]
}
```

**Sync Mechanism:**
- Automatic and silent — no "Sync now" button
- On `navigator.onLine` event or app foreground: attempt sync
- Entries synced first, then photos (entries create the server-side record)
- Last-write-wins for conflicts (single user per voyage in v1.0)
- Max retry: 3 attempts with exponential backoff (1s, 5s, 30s)
- After 3 failures: surface to user with "Sync failed · Retry" badge

**Service Worker Strategy:**
- Serwist (maintained next-pwa successor) for cache management
- Cache strategy: Network-first for API calls, Cache-first for static assets
- Voyage data cached on successful fetch — available for offline browsing
- Cache invalidation: on new import or journal entry sync

**Files:**
```
src/lib/offline/
├── db.ts                   # IndexedDB wrapper (idb library)
├── sync.ts                 # Sync engine (online detection, retry, queue)
├── schema.ts               # TypeScript interfaces for offline stores
└── hooks.ts                # useSyncStatus(), useOfflineEntry()
```

### Admin Zone Architecture (FR-57, FR-58, FR-59, FR-60)

**Route:** `src/app/admin/`

**Authorization (dual layer, follows existing pattern):**
1. Middleware checks `is_admin` on profile → redirects non-admins to dashboard
2. Server Actions verify `is_admin` before executing any admin operation

**Database Change:**
```sql
-- Migration: add is_admin to profiles
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
```

**Directory Structure:**
```
src/app/admin/
├── page.tsx                # Admin dashboard (metrics)
├── loading.tsx
├── actions.ts              # getMetrics, listUsers, disableUser
├── actions.test.ts
└── users/
    └── page.tsx            # User list with management
```

**Data Layer:**
```
src/lib/data/
├── admin.ts                # Admin-specific queries (metrics, user management)
└── admin.test.ts
```

**Admin Data Functions:**
- `getMetrics()` — aggregate counts (users, voyages, legs, storage)
- `getUsers(search?, page?)` — paginated user list with stats
- `disableUser(userId)` — soft disable (sets `disabled_at` timestamp)
- `getRecentRegistrations(days)` — new users in period

### i18n Architecture (FR-64, FR-65, NFR-33, NFR-34, NFR-35)

**Decision: next-intl for v1.0 (upgrade from collocated messages.ts)**

**Rationale:** The MVP used collocated `messages.ts` files. v1.0 needs two languages (EN/FR), making `next-intl` the right tool. Same key-based pattern, but with proper locale routing, plural handling, and ICU message format.

**Setup:**
```
src/
├── i18n/
│   ├── request.ts          # next-intl request config
│   └── routing.ts          # Locale routing config
├── messages/
│   ├── en.json             # English translations
│   └── fr.json             # French translations
```

**Language Preference Storage:**
- Stored in `profiles.preferred_language` column (default: 'en')
- On first visit: detect from `Accept-Language` header
- User can override via settings → persisted to profile
- Not URL-based routing (no `/fr/dashboard`) — language is a user preference, not a route

**Middleware Integration:**
```typescript
// src/middleware.ts — extended
// 1. Check auth (existing)
// 2. Resolve locale from profile.preferred_language or Accept-Language header
// 3. Set locale in request headers for next-intl
```

**Migration from messages.ts:**
- Existing `messages.ts` files become source for `en.json` keys
- Same keys, same structure — component changes are minimal
- `t('dashboard.title')` replaces `messages.title`

### Dynamic OG Image Architecture (FR-43, NFR-24)

**Decision: Next.js `opengraph-image.tsx` with `@vercel/og`**

**Location:** `src/app/[username]/[slug]/opengraph-image.tsx`

**Approach:**
- `@vercel/og` (Satori-based) generates images at request time on Vercel Edge
- No headless browser (Playwright/Puppeteer) — Satori renders JSX to SVG to PNG
- Dimensions: 1200x630px (standard OG)
- Cached by Vercel CDN with `revalidate` for updates

**Content:**
- Static map image generated from track GeoJSON (simplified line drawing via SVG path)
- Voyage name in DM Serif Display
- Stats strip: distance, ports, countries
- Boat name in corner
- Bosco branding

**Limitation:** Satori cannot render a full Leaflet map. The OG image uses a simplified SVG path of the track on a plain background — not a screenshot of the map. This is a deliberate trade-off for Edge performance (<2s generation).

**Alternative (if higher fidelity needed):** Playwright on a Vercel serverless function — can screenshot the actual map page. Slower (~5s) but pixel-perfect. Deferred unless OG quality is insufficient.

### Photo Features Architecture (FR-33, FR-34, FR-35, FR-28)

**Photo Storage:**
- Supabase Storage bucket: `photos` (existing)
- Path: `{userId}/{voyageId}/{entryId}/{filename}`
- Compressed client-side to <1MB before upload (existing `src/lib/utils/image.ts`)

**Photo Markers on Map:**
```
src/components/map/
├── PhotoMarker.tsx          # Circular thumbnail marker on map
├── PhotoCluster.tsx         # Clustered markers when >15 visible
└── PhotoLightbox.tsx        # Full-screen photo viewer
```

**Clustering Logic:**
- Uses `leaflet.markercluster` (or custom implementation)
- Threshold: 15 markers visible at current zoom → cluster
- Cluster shows count badge
- Zoom into cluster → uncluster progressively

**Photo-Location Association:**
- Photos are associated via journal entries linked to stopovers or legs
- Photo marker position = associated stopover coordinates or leg midpoint
- No EXIF GPS extraction in v1.0 — location comes from the journal entry's linked stopover/leg

### Custom SMTP Architecture (FR-3)

**Decision: Supabase Pro custom SMTP**

**Configuration:**
- Supabase Pro plan enables custom SMTP provider
- SMTP provider: Resend (or similar transactional email service)
- Sender: `noreply@sailbosco.com`
- DNS: MX, SPF, DKIM records on `sailbosco.com` domain (Cloudflare DNS)

**No code changes needed** — Supabase handles email sending. Configuration is in Supabase dashboard (SMTP settings). Auth emails automatically use the custom sender.

### Database Schema Updates

**New Columns:**
```sql
-- profiles table additions
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN disabled_at TIMESTAMPTZ;
```

**Existing tables unchanged.** The v1.0 features use existing tables (voyages, legs, stopovers, log_entries) without schema changes. Photos are already stored via log_entries attachments.

### Updated Project Structure (v1.0 additions)

```
bosco/
├── ios/                                  # NEW: Capacitor iOS project
│   └── App/ShareExtension/              # NEW: iOS Share Extension
├── android/                              # NEW: Capacitor Android project
├── capacitor.config.ts                   # NEW: Capacitor configuration
├── public/
│   └── .well-known/
│       ├── apple-app-site-association    # NEW: Universal Links
│       └── assetlinks.json              # NEW: App Links
├── src/
│   ├── app/
│   │   ├── admin/                        # NEW: Admin zone (FR-57-60)
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── actions.ts
│   │   │   └── users/page.tsx
│   │   └── [username]/[slug]/
│   │       └── opengraph-image.tsx       # NEW: Dynamic OG (FR-43)
│   ├── components/
│   │   ├── map/
│   │   │   ├── PhotoMarker.tsx           # NEW: Photo markers (FR-33)
│   │   │   ├── PhotoCluster.tsx          # NEW: Marker clustering (FR-35)
│   │   │   └── PhotoLightbox.tsx         # NEW: Full-screen viewer (FR-34)
│   │   ├── voyage/
│   │   │   ├── ShareButton.tsx           # NEW: Native share (FR-46)
│   │   │   ├── DualCTA.tsx              # NEW: Create + share CTAs (FR-44)
│   │   │   └── TrophyPreview.tsx        # NEW: Coming Soon card (FR-68)
│   │   └── shared/
│   │       ├── SyncIndicator.tsx         # NEW: Offline sync badge (FR-32)
│   │       └── LanguageSwitcher.tsx      # NEW: i18n switch (FR-65)
│   ├── lib/
│   │   ├── offline/                      # NEW: Offline support
│   │   │   ├── db.ts
│   │   │   ├── sync.ts
│   │   │   ├── schema.ts
│   │   │   └── hooks.ts
│   │   ├── platform.ts                   # NEW: Capacitor platform detection
│   │   └── data/
│   │       └── admin.ts                  # NEW: Admin queries
│   ├── i18n/                             # NEW: next-intl config
│   │   ├── request.ts
│   │   └── routing.ts
│   └── messages/                         # NEW: Translation files
│       ├── en.json
│       └── fr.json
```

### Updated FR → Structure Mapping (v1.0 additions)

| FR Group | FRs | Primary Location | Dependencies |
|----------|-----|-----------------|--------------|
| Auth & Identity | FR-1→4 | `src/app/auth/`, `src/lib/auth.ts` | Existing |
| Profile | FR-5→8 | `src/app/dashboard/profile/` | `is_admin` column, `preferred_language` column |
| Voyage Management | FR-9→12 | `src/app/voyage/`, `src/app/dashboard/` | Existing |
| Track Import | FR-13→21 | `src/app/voyage/[id]/import/`, `src/lib/gpx/` | `ios/App/ShareExtension/`, `android/` manifest |
| Stopovers | FR-22→25 | `src/lib/geo/`, `src/components/map/` | Existing |
| Journal & Media | FR-26→32 | `src/components/log/`, `src/lib/offline/` | IndexedDB, sync engine |
| Photo on Map | FR-33→35 | `src/components/map/PhotoMarker.tsx`, `PhotoCluster.tsx`, `PhotoLightbox.tsx` | leaflet.markercluster |
| Public Voyage | FR-36→44 | `src/app/[username]/[slug]/`, `opengraph-image.tsx` | `@vercel/og`, `DualCTA.tsx` |
| Public Profile | FR-45 | `src/app/[username]/` | Existing |
| Social Sharing | FR-46→48 | `ShareButton.tsx`, `src/lib/platform.ts` | `@capacitor/share`, `.well-known/` |
| Dashboard | FR-49→52 | `src/app/dashboard/` | Enhanced `VoyageCard.tsx`, `EmptyState.tsx` |
| Onboarding | FR-53→54 | `src/app/page.tsx` (landing) | App store badges, demo voyage |
| Error Handling | FR-55→56 | `src/components/shared/ErrorState.tsx` | Navionics guide content |
| Admin Zone | FR-57→60 | `src/app/admin/`, `src/lib/data/admin.ts` | `is_admin` middleware check |
| App Store | FR-61→63 | `ios/`, `android/`, `capacitor.config.ts` | Build pipeline |
| i18n | FR-64→65 | `src/i18n/`, `src/messages/`, `LanguageSwitcher.tsx` | `next-intl` |
| Legal | FR-66→67 | `src/app/legal/` | Privacy policy, CGU pages |
| Trophy | FR-68 | `src/components/voyage/TrophyPreview.tsx` | Static content |

### v1.0 Cross-Cutting Updates

**Middleware (updated):**
```typescript
// src/middleware.ts — v1.0 additions
// 1. Auth check (existing)
// 2. Admin route protection: check is_admin for /admin/* routes
// 3. Locale resolution: read preferred_language from session, set for next-intl
```

**Error Tracking (updated):**
- Sentry context enriched: add platform (web/ios/android), locale, offline status
- Admin zone errors tracked separately (Sentry project tag)

**Testing (updated):**
```
tests/e2e/
├── onboarding.spec.ts        # Existing
├── import.spec.ts            # Existing
├── public-voyage.spec.ts     # Existing — add OG image, dual CTA, photo markers
├── share.spec.ts             # Existing — add native share, deep link
├── admin.spec.ts             # NEW: Admin zone flows
├── offline.spec.ts           # NEW: Offline journal + sync
└── i18n.spec.ts              # NEW: Language switch
```

### v1.0 Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION (v1.0 scope)

**Key Risks:**
- iOS Share Extension is the most complex native addition — requires Swift development and App Group coordination
- Offline sync edge cases (photo too large, network flap) need careful testing
- `@vercel/og` map rendering quality may not match expectations — fallback to Playwright documented

**Implementation Sequence (v1.0):**
1. Supabase Pro migration + custom SMTP + new database columns
2. Capacitor project setup + basic iOS/Android builds
3. iOS Share Extension + Android Intent filter
4. Admin zone (routes, authorization, data layer)
5. i18n (next-intl + EN/FR translations)
6. Dynamic OG images
7. Photo markers + lightbox + clustering
8. Offline mode (IndexedDB + sync)
9. Deep linking (.well-known + Capacitor config)
10. Landing page redesign
11. Dashboard enhancements
12. Trophy preview
13. Dual CTA + ShareButton

**Confidence Level:** High

**Key Strengths:**
- Complete vendor isolation via 3-tier containment — Supabase can be replaced without touching Server Actions or components
- AI-first design — explicit coding principles, predictable naming, no magic, strict types
- Full FR/NFR coverage with traceable mappings
- Concrete code examples for every pattern

**Areas for Future Enhancement:**
- i18n: migrate from `messages.ts` to `next-intl` when French UI is needed
- PWA: finalize Serwist vs custom service worker during implementation
- Caching: introduce TanStack Query if client-side refetch patterns become complex
- Global state: add Zustand if shared state need emerges
