# Story 1.1: Landing Page & Project Foundation

Status: done

## Story

As a visitor discovering Bosco,
I want to land on a page that communicates what Bosco does and invites me to sign up,
so that I understand the product's value before creating an account.

_This story also establishes the project foundation: Next.js initialization, design system tokens, Supabase local dev environment, and CI pipeline._

## Acceptance Criteria

### AC-1: Development Environment Setup
**Given** a fresh clone of the repository
**When** the developer runs `npm install && npm run dev`
**Then** the Next.js 16 dev server starts with Turbopack and renders a placeholder landing page
**And** TypeScript strict mode is enabled with zero compilation errors

### AC-2: Design System Tokens — Color Palette
**Given** the Tailwind CSS configuration
**When** inspecting the design tokens
**Then** the Ocean & Sunset color palette is defined via `@theme` in `src/app/globals.css`:
- Navy `#1B2D4F` — deep backgrounds, headers, primary text
- Ocean `#2563EB` — links, interactive elements
- Coral `#E8614D` — CTAs, accents
- Amber `#F59E0B` — highlights, badges
- Sand `#FDF6EC` — light backgrounds, cards
- Slate `#334155` — secondary text
- Mist `#94A3B8` — tertiary text, borders
- Foam `#F1F5F9` — section backgrounds
- Semantic: Success `#10B981`, Warning `#F59E0B`, Error `#EF4444`, Info `#2563EB`

### AC-3: Design System Tokens — Typography
**Given** the root layout
**When** fonts are loaded
**Then** DM Serif Display (headings) and Nunito (body) are loaded via `next/font/google`
**And** the type scale is defined: Display 32px, H1 24px, H2 20px, H3 16px, Body 14px, Small 12px, Tiny 10px

### AC-4: Design System Tokens — Layout & Spacing
**Given** the Tailwind CSS configuration
**When** inspecting spacing and layout tokens
**Then** the spacing scale (4-8-12-16-24-32-48-64-96) is defined
**And** border radius values (cards 12px, buttons 8px, stats bar 16px) are configured
**And** navy-tinted shadows are defined (overlays `0 2px 12px rgba(27,45,79,0.15)`, cards `0 1px 4px rgba(27,45,79,0.08)`, bottom sheet `0 -4px 20px rgba(27,45,79,0.12)`)

### AC-5: Project Structure — Supabase Abstraction
**Given** the project structure
**When** inspecting the `src/lib/` directory
**Then** `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, and `src/lib/supabase/middleware.ts` placeholder files exist
**And** ESLint `no-restricted-imports` rule prevents importing `@supabase/supabase-js` outside `src/lib/supabase/`

### AC-6: Local Development — Supabase
**Given** the developer runs `supabase start`
**When** the local Supabase instance initializes
**Then** a local Postgres database, Auth service, and Storage service are running
**And** `supabase/config.toml` is committed to the repository

### AC-7: CI/CD Pipeline
**Given** the CI configuration
**When** a pull request is opened on GitHub
**Then** GitHub Actions runs lint, type-check, and Vitest (with zero tests passing trivially)
**And** Sentry client and server config files exist at the project root
**And** Vercel Analytics `<Analytics />` component is included in the root layout

### AC-8: Internationalization Foundation
**Given** any route or feature directory
**When** user-facing strings are needed
**Then** strings are externalized in a collocated `messages.ts` file, never inline in components

## Tasks / Subtasks

- [x] Task 1: Initialize Next.js 16 project (AC: #1)
  - [x] Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"`
  - [x] Verify Next.js 16 with React 19, TypeScript strict, Turbopack, App Router
  - [x] Update `package.json` lint script: `"lint": "eslint"` (NOT `"next lint"` — removed in Next.js 16)
  - [x] Confirm `next.config.ts` exists (TypeScript config, not `.mjs`)
  - [x] Add `.env.example` and `.env.local` (gitignored) with Supabase env vars placeholders

- [x] Task 2: Configure Tailwind CSS 4 design tokens (AC: #2, #4)
  - [x] Verify `@tailwindcss/postcss` plugin is configured in `postcss.config.mjs`
  - [x] Replace default Tailwind imports in `globals.css` with `@import "tailwindcss";`
  - [x] Define Ocean & Sunset color palette via `@theme` directive in `globals.css`
  - [x] Define spacing scale, border radius, and shadow tokens in `@theme`
  - [x] Note: Tailwind 4 utility renames — `shadow-sm`→`shadow-xs`, `shadow`→`shadow-sm`, `rounded-sm`→`rounded-xs`, `rounded`→`rounded-sm`, `ring`→`ring-3`

- [x] Task 3: Configure typography via next/font (AC: #3)
  - [x] Import DM Serif Display and Nunito from `next/font/google` in root layout
  - [x] Apply font CSS variables to `<html>` element
  - [x] Define type scale CSS custom properties in `@theme` or `globals.css`
  - [x] DM Serif Display fallback: Georgia, serif
  - [x] Nunito fallback: system-ui, sans-serif

- [x] Task 4: Initialize shadcn/ui (AC: #2)
  - [x] Run `npx shadcn@latest init` (NOT `shadcn-ui` — the CLI is `shadcn`)
  - [x] Configure `components.json` to use `@/components/ui/` path
  - [x] Add initial components: `npx shadcn@latest add button` (minimum for landing page CTA)
  - [x] Verify shadcn uses Tailwind CSS 4 `@theme inline` directive

- [x] Task 5: Create Supabase Tier 1 placeholders (AC: #5)
  - [x] Install `@supabase/supabase-js` and `@supabase/ssr`
  - [x] Create `src/lib/supabase/client.ts` — browser Supabase client (placeholder with env var references)
  - [x] Create `src/lib/supabase/server.ts` — server Supabase client (placeholder with cookie handling)
  - [x] Create `src/lib/supabase/middleware.ts` — auth middleware helper (placeholder)
  - [x] Configure ESLint `no-restricted-imports` rule to block `@supabase/*` outside `src/lib/supabase/`

- [x] Task 6: Setup Supabase local dev (AC: #6)
  - [x] Run `supabase init` to generate `supabase/config.toml`
  - [x] Verify `supabase start` launches local Postgres + Auth + Storage
  - [x] Commit `supabase/config.toml` and `supabase/migrations/` directory

- [x] Task 7: Create landing page (AC: #1, #8)
  - [x] Implement `src/app/page.tsx` with value proposition content
  - [x] Headline: communicate "exact sailing track" differentiator
  - [x] "Get Started" CTA button (Coral primary, links to `/auth`)
  - [x] Create `src/app/messages.ts` for all landing page strings
  - [x] Responsive: mobile-first (375px+), centered max-width on desktop

- [x] Task 8: Create root layout and app shell (AC: #1, #3, #7)
  - [x] Configure `src/app/layout.tsx` with fonts, metadata, and `<Analytics />`
  - [x] Create `src/app/not-found.tsx` (404 page)
  - [x] Create `src/app/error.tsx` (global error boundary)
  - [x] Create `src/app/loading.tsx` (global loading fallback)

- [x] Task 9: Setup Sentry (AC: #7)
  - [x] Install `@sentry/nextjs` v10.x
  - [x] Run `npx @sentry/wizard@latest -i nextjs` or create config files manually
  - [x] Create `sentry.client.config.ts` and `sentry.server.config.ts` at project root
  - [x] Initialize Sentry in root layout

- [x] Task 10: Setup CI/CD pipeline (AC: #7)
  - [x] Create `.github/workflows/ci.yml` with lint + type-check + Vitest jobs
  - [x] Ensure CI runs on pull requests to main
  - [x] Vitest should pass with zero tests (trivial pass)

- [x] Task 11: Setup testing infrastructure (AC: #7)
  - [x] Install and configure Vitest 4.x with `vitest.config.ts`
  - [x] Install `@vitejs/plugin-react` and `jsdom` for React 19 testing
  - [x] Install and configure Playwright with `playwright.config.ts`
  - [x] Create `tests/e2e/` directory

- [x] Task 12: Create foundational directory structure (AC: #5)
  - [x] Create stub directories: `src/components/{ui,map,voyage,gpx,log,shared}`
  - [x] Create `src/lib/{data,gpx,geo,utils}` directories
  - [x] Create `src/types/index.ts` placeholder
  - [x] Create `src/middleware.ts` for route protection (placeholder — note: Next.js 16 deprecates middleware.ts in favor of proxy.ts, but continue using middleware.ts for now as it still works)

## Dev Notes

### Critical Next.js 16 Changes (March 2026)

1. **`next lint` removed** — ESLint runs directly. Package.json must use `"lint": "eslint"`, NOT `"lint": "next lint"`.
2. **Async APIs mandatory** — `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` must all be `await`ed. No sync access.
3. **Turbopack is default** for both dev and build.
4. **`middleware.ts` deprecated** → `proxy.ts` with `proxy` function export. Still functional but flagged for removal. Use `middleware.ts` for now to match existing docs; migrate later.
5. **Parallel routes** require explicit `default.js` files or build fails.
6. **Node.js minimum:** 20.9.0.
7. **React 19.2** ships with Next.js 16 (includes View Transitions, `useEffectEvent`, `<Activity/>`).

### Critical Tailwind CSS 4 Changes

1. **No `tailwind.config.ts` file** — configuration moved to CSS with `@theme` directive.
2. **PostCSS plugin is `@tailwindcss/postcss`** — not `tailwindcss`. Install: `npm install tailwindcss @tailwindcss/postcss postcss`.
3. **CSS import changed** — use `@import "tailwindcss";` instead of `@tailwind base/components/utilities`.
4. **Utility renames:** `shadow-sm`→`shadow-xs`, `shadow`→`shadow-sm`, `rounded-sm`→`rounded-xs`, `rounded`→`rounded-sm`, `ring`→`ring-3`, `outline-none`→`outline-hidden`, `blur-sm`→`blur-xs`, `blur`→`blur-sm`.
5. **Opacity utilities removed** — use slash syntax: `bg-black/50`.
6. **Default border color** changed from `gray-200` to `currentColor`.
7. **Important modifier** is now suffix `!` (`bg-red-500!`) not prefix `!`.
8. **Custom utilities** use `@utility` instead of `@layer utilities`.
9. **Autoprefixer no longer needed** — built into Tailwind 4.
10. **`create-next-app` with `--tailwind`** flag handles v4 setup automatically.

### Critical Zod 4 Changes

1. **String validators moved to top-level:** `z.email()`, `z.uuid()`, `z.url()` (not `z.string().email()`).
2. **Error formatting changed:** `.flatten()` deprecated → use `z.treeifyError()`.
3. **`z.number()` rejects `Infinity`**; `.int()` only accepts safe integers.
4. **Error customization** unified under single `error` parameter.
5. **`.strict()` deprecated** → use `z.strictObject()`.
6. **`.merge()` deprecated** → use `.extend()`.
7. **`z.record()` requires two arguments.**

### shadcn/ui Setup

- CLI command: `npx shadcn@latest init` (NOT `shadcn-ui@latest`)
- Fully supports Tailwind CSS 4 and React 19
- Uses `@theme inline` directive for CSS variable customization
- Components use `data-slot` attributes for styling
- `forwardRef` removed from components (React 19 doesn't need it)
- Add components: `npx shadcn@latest add button card input toast`

### Package Versions (as of March 2026)

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16.1.x | Default from create-next-app |
| React | 19.2.x | Ships with Next.js 16 |
| TypeScript | 5.x | Strict mode enabled |
| Tailwind CSS | 4.1.x | CSS-based config with @theme |
| shadcn/ui | latest | CLI is `shadcn`, not `shadcn-ui` |
| Zod | 4.x | Breaking changes from v3 — see notes |
| @supabase/supabase-js | 2.99.x | Stable v2, no breaking changes |
| @supabase/ssr | 0.9.x | SSR cookie handling |
| @sentry/nextjs | 10.43.x | Supports Next.js 16 + Turbopack |
| Vitest | 4.1.x | Requires Vite 6+, Node 20+ |
| Playwright | 1.58.x | E2E testing |

### 3-Tier Supabase Containment (Non-Negotiable)

```
Tier 1: src/lib/supabase/       ← ONLY imports @supabase/supabase-js
Tier 2: src/lib/data/           ← Repository functions (DB queries)
        src/lib/auth.ts          ← Auth wrapper
        src/lib/storage.ts       ← Storage wrapper
Tier 3: src/app/*/actions.ts    ← Server Actions (Zod + business logic)
Tier 4: src/components/          ← React components (call Server Actions only)
```

**ESLint enforcement:** Configure `no-restricted-imports` to prevent `@supabase/*` imports outside `src/lib/supabase/`.

### Server Action Return Format (Mandatory for All Future Stories)

```typescript
// Success
{ data: T, error: null }
// Error
{ data: null, error: { code: ErrorCode, message: string } }
```

Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `EXTERNAL_SERVICE_ERROR`, `PROCESSING_ERROR`.

Never throw from Server Actions.

### Naming Conventions

- Components: `PascalCase.tsx` (e.g., `VoyageCard.tsx`)
- Utilities/lib: `kebab-case.ts` (e.g., `stopover-detection.ts`)
- Server Actions: `actions.ts` collocated, functions use `verbNoun` (e.g., `createVoyage`)
- Database: `snake_case` tables (plural), columns, FK as `{singular}_id`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### Landing Page Content

**Value proposition:** "Export your GPS track from Navionics, see your exact sailing path on a shareable map."

**Differentiator:** Bosco shows the exact sailing track — every tack, every course change — not just waypoints.

**Content structure:**
- Hero with headline communicating the value
- Brief description of what Bosco does
- "Get Started" CTA (Coral `#E8614D`, links to `/auth`)
- Mobile-first, single column on mobile, centered max-width 1200px on desktop

**Button hierarchy for CTA:**
- Primary (Coral solid): "Get Started" — one primary button per screen
- Min height: 44px on mobile

### UX Design Direction

**Creator pages (dashboard):** shadcn/ui + Foam `#F1F5F9` background, white cards
**Public pages:** Custom Tailwind, Direction D (Immersive Minimal) — glass morphism overlays on full-bleed map

**Responsive breakpoints:**
- Mobile: 375px–767px (primary) — single column, bottom tab nav
- Tablet: 768px–1023px — same as mobile, more map space
- Desktop: 1024px+ — multi-column, side navigation

### i18n Pattern

Create `messages.ts` files collocated with each route/feature:

```typescript
// src/app/messages.ts
export const messages = {
  hero: {
    title: 'Your sailing story, traced on the map',
    subtitle: 'Export your GPS track from Navionics...',
    cta: 'Get Started',
  },
}
```

Components import from `messages.ts` — never inline string literals.

### Anti-Patterns (Do NOT)

- Import `@supabase/*` outside `src/lib/supabase/`
- Import from `src/lib/supabase/` in Server Actions
- Call Supabase from components
- Throw from Server Actions
- Use `any` type
- Store coordinates as `[lat, lng]` — GeoJSON is `[lng, lat]`
- Place custom components in `src/components/ui/` (shadcn/ui only)
- Use generic spinners without contextual messages
- Inline UI string literals in components

### Project Structure Notes

Alignment with the unified project structure from architecture.md:

```
src/
├── app/
│   ├── globals.css             # Tailwind @import + @theme tokens
│   ├── layout.tsx              # Root layout (fonts, Sentry, Analytics, metadata)
│   ├── page.tsx                # Landing page (public)
│   ├── not-found.tsx           # 404 page
│   ├── error.tsx               # Global error boundary
│   ├── loading.tsx             # Global loading fallback
│   ├── messages.ts             # Landing page strings
│   ├── auth/                   # (placeholder directory for Story 1.2)
│   └── dashboard/              # (placeholder directory for Story 1.4)
├── components/
│   ├── ui/                     # shadcn/ui ONLY
│   ├── map/                    # (empty, future stories)
│   ├── voyage/                 # (empty, future stories)
│   ├── gpx/                    # (empty, future stories)
│   ├── log/                    # (empty, future stories)
│   └── shared/                 # (empty, future stories)
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client (placeholder)
│   │   ├── server.ts           # Server Supabase client (placeholder)
│   │   └── middleware.ts       # Auth middleware helper (placeholder)
│   ├── data/                   # (empty, future stories)
│   ├── gpx/                    # (empty, future stories)
│   ├── geo/                    # (empty, future stories)
│   └── utils/                  # (empty, future stories)
├── types/
│   └── index.ts                # Shared app types (placeholder)
└── middleware.ts               # Route protection (placeholder)
supabase/
├── config.toml                 # Local Supabase config
└── migrations/                 # (empty, Story 1.2 adds first migration)
tests/e2e/                      # (empty, future stories)
.github/workflows/ci.yml        # CI pipeline
.env.example                    # Env var template
sentry.client.config.ts         # Sentry browser init
sentry.server.config.ts         # Sentry server init
vitest.config.ts                # Vitest config
playwright.config.ts            # Playwright E2E config
```

### References

- [Source: _bmad-output/planning-artifacts/prd.md — FR-1, FR-2, FR-3, FR-9, NFR-1 through NFR-18]
- [Source: _bmad-output/planning-artifacts/architecture.md — Starter Options, 3-Tier Containment, Project Structure, Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.1 AC and Technical Requirements]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Color Palette, Typography, Spacing, Breakpoints, Button Hierarchy, Design Direction D]
- [Source: CLAUDE.md — Commands, Architecture, Anti-Patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Created via temp dir approach since `create-next-app` doesn't support non-empty directories
- shadcn init modified globals.css and layout.tsx — merged with Ocean & Sunset tokens
- Mapped shadcn semantic tokens (--primary, --foreground, etc.) to Ocean & Sunset palette
- Supabase CLI installed via Homebrew, `supabase init` generated config.toml
- ESLint flat config required `globalIgnores` for _bmad/ directory
- Vitest `passWithNoTests: true` needed for zero-test pass

### Completion Notes List

- Next.js 16.1.6 with React 19.2.3, TypeScript strict, Turbopack
- Tailwind CSS 4 with @theme inline directive — all Ocean & Sunset design tokens defined
- DM Serif Display + Nunito fonts loaded via next/font/google
- shadcn/ui v4.0.8 initialized with Button component, branded with Ocean & Sunset palette
- Supabase Tier 1 containment: client.ts, server.ts, middleware.ts with ESLint enforcement
- Supabase CLI initialized with config.toml and migrations/ directory
- Landing page with hero section, 3 feature cards, i18n-ready messages.ts
- Root layout with Analytics, error.tsx, not-found.tsx, loading.tsx
- Sentry v10 client + server configs at project root
- CI pipeline: GitHub Actions for lint + typecheck + vitest on PRs
- Vitest 4.1 + Playwright 1.58 configured
- Full directory structure: components/{ui,map,voyage,gpx,log,shared}, lib/{supabase,data,gpx,geo,utils}, types/
- ActionResponse type and ErrorCode enum defined in src/types/index.ts
- Landing page and `/auth` placeholder route render before Supabase local env is fully populated
- Remaining app-shell strings are externalized into collocated `messages.ts` files
- All checks pass: lint ✓, typecheck ✓, test ✓, build ✓

### Change Log

- 2026-03-15: Story 1.1 implemented — full project foundation scaffolded
- 2026-03-15: Review fixes applied — Supabase env guard, string externalization, `/auth` placeholder route

### File List

- .env.example (new)
- .env.local (new, gitignored)
- .github/workflows/ci.yml (new)
- .gitignore (modified)
- components.json (new, shadcn config)
- eslint.config.mjs (modified)
- next.config.ts (new)
- package.json (new)
- package-lock.json (new)
- playwright.config.ts (new)
- postcss.config.mjs (new)
- sentry.client.config.ts (new)
- sentry.server.config.ts (new)
- src/app/auth/messages.ts (new)
- src/app/auth/page.tsx (new)
- src/app/error.tsx (new)
- src/app/favicon.ico (new)
- src/app/globals.css (new)
- src/app/layout.tsx (new)
- src/app/loading.tsx (new)
- src/app/messages.ts (new)
- src/app/not-found.tsx (new)
- src/app/page.tsx (new)
- src/components/ui/button.tsx (new, shadcn)
- src/lib/supabase/config.test.ts (new)
- src/lib/supabase/config.ts (new)
- src/lib/supabase/client.ts (new)
- src/lib/supabase/middleware.ts (new)
- src/lib/supabase/server.ts (new)
- src/lib/utils.ts (new, shadcn)
- src/middleware.ts (new)
- src/types/index.ts (new)
- supabase/.gitignore (new)
- supabase/config.toml (new)
- tsconfig.json (new)
- vitest.config.ts (new)
