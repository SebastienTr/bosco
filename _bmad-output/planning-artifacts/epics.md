---
stepsCompleted:
  - 'step-01-validate-prerequisites'
  - 'step-02-design-epics'
  - 'step-03-create-stories'
  - 'step-04-final-validation'
status: 'complete'
completedAt: '2026-03-15'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# Bosco - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Bosco, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: Users can sign up and sign in via email magic link; sessions persist across browser restarts until logout or expiry; no social login in MVP
FR-2: Users can set a unique username (used in public URLs) and optionally add boat name, boat type, bio, profile photo, boat photo; public profile page at /{username} lists public voyages
FR-3: Users can create, rename, and delete voyages; set name, description, slug, cover image, and public/private visibility; slug unique per account; dashboard shows all voyages with preview and stats
FR-4: Users can import GPX 1.1 files (single or multi-track, up to 400 MB); preview track geometry, point count, distance, duration per track; select tracks and import as separate legs or merged; simplified tracks preserve tacks at zoom 14; per-leg stats (distance nm, duration, avg/max speed kts, timestamps); users can delete individual legs from a voyage
FR-5: System auto-associates leg endpoints with existing stopovers within configurable radius (default 2 km); creates new stopovers with reverse-geocoded place name and country; users can rename, reposition, delete, merge stopovers; configure detection radius; view as map markers; browse grouped by country
FR-6: Users can create journal entries with free-form text and photo attachments; each entry has a date and belongs to a voyage; optional link to leg/stopover; photos reduced to web-friendly size; timeline view on voyage page
FR-7: Public voyage page at /{username}/{voyage-slug} with full-screen map, nautical chart context, animated route on first load, stopover markers, latest boat position, stats bar (distance nm, days, ports, countries), stopovers list by country, log timeline, voyage/boat/sailor header info, shareable map view links
FR-8: Public profile page at /{username} showing username, boat info, bio, photos, and public voyages as cards with cover image, name, stats
FR-9: Dashboard shows all owned voyages (public and private) with summary stats; create new voyage; navigate to profile editing

### NonFunctional Requirements

NFR-1: Public voyage pages render first meaningful paint in under 2 seconds on 4G mobile (Lighthouse mobile)
NFR-2: 400 MB GPX import completes within 60 seconds with input responsiveness below 200 ms (mobile hardware)
NFR-3: Map interactions maintain 60 fps on mid-range mobile devices (2022+)
NFR-4: Map renders simplified tracks with up to 100,000 points with interaction latency below 100 ms
NFR-5: Authenticated users can read and modify only their own private data (authorization tests)
NFR-6: Unauthenticated visitors access only voyages explicitly marked public (access-control tests)
NFR-7: Image uploads validated by type and size (max 10 MB per image)
NFR-8: Public and authenticated pages block common XSS payloads (automated + manual tests)
NFR-9: Mobile-first responsive design — all features usable on screens 375px and wider
NFR-10: Map supports pinch zoom, pan, tap markers on iOS Safari and Android Chrome (manual mobile QA)
NFR-11: GPX import works from mobile file picker and OS share sheet
NFR-12: Uploaded photos reduced to under 1 MB before permanent storage
NFR-13: Public voyage pages return complete, indexable HTML in first response (HTML fetch tests)
NFR-14: Open Graph meta tags present on all public pages for rich link previews
NFR-15: Structured data present on public voyage pages, passes schema validation
NFR-16: MVP ships with English UI
NFR-17: All user-facing strings externalized for future translation (collocated messages.ts files)
NFR-18: Distance in nautical miles, speed in knots across all user-facing pages; future unit support without re-importing data

### Additional Requirements

- **Starter template:** Project initialized with `create-next-app` + `shadcn init` (Next.js 16, TypeScript strict, Tailwind CSS 4, Turbopack). This is the first implementation story.
- **Supabase infrastructure:** Local dev via Supabase CLI (`supabase start`), SQL migrations in `supabase/migrations/`, auto-generated TypeScript types via `supabase gen types`
- **3-tier containment rule:** `@supabase/supabase-js` only in `src/lib/supabase/`; `src/lib/data/`, `src/lib/auth.ts`, `src/lib/storage.ts` as Tier 2; Server Actions as Tier 3; Components never import Supabase directly
- **Data access layer:** Repository functions in `src/lib/data/` encapsulate all queries. Server Actions call repositories, never Supabase client directly
- **Auth wrapper:** `src/lib/auth.ts` exposing `signIn`, `signOut`, `getUser`, `requireAuth` — swappable implementation
- **Storage wrapper:** `src/lib/storage.ts` concentrating all storage calls from day 1
- **Server Action return format:** All actions return `{ data, error }` with typed error codes (VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, FORBIDDEN, EXTERNAL_SERVICE_ERROR, PROCESSING_ERROR)
- **Zod validation:** All Server Action inputs validated with Zod schemas
- **Web Worker for GPX processing:** Client-side parsing, simplification, GeoJSON conversion in dedicated Web Worker with progress messages
- **Douglas-Peucker iterative (stack-based):** Must handle 1M+ points without stack overflow
- **Nominatim proxy:** API route `/api/geocode` rate-limits and caches reverse geocoding server-side
- **PWA infrastructure:** Service worker (Serwist or native), web app manifest, Web Share Target registration for Android import
- **CSP headers:** Restrictive Content Security Policy via Next.js headers config
- **Sentry error tracking:** `@sentry/nextjs` for server + client error capture
- **Vercel Analytics:** Built-in Web Vitals tracking
- **CI/CD:** GitHub Actions for lint + type-check + Vitest on PR; Playwright on main; Vercel auto-deploy
- **ESLint import containment:** `no-restricted-imports` for `@supabase/*` outside `src/lib/`
- **i18n readiness:** Collocated `messages.ts` per route/feature for string externalization; migration path to `next-intl`
- **GeoJSON coordinate order:** `[longitude, latitude]` in stored data; conversion to `[lat, lng]` only in Leaflet map layer
- **AI-debuggable code:** Explicit errors (never silent), structured logging, file name = responsibility, no magic, strict types, predictable naming, collocated logic, typed error boundaries

### UX Design Requirements

UX-DR1: Implement Ocean & Sunset color palette as Tailwind design tokens — Navy (#1B2D4F), Ocean (#2563EB), Coral (#E8614D), Amber (#F59E0B), Sand (#FDF6EC) + neutral palette (Slate, Mist, Foam, White) + semantic colors (Success #10B981, Warning #F59E0B, Error #EF4444, Info #2563EB) + map-specific colors (track line Ocean 0.85 opacity 3px, stopover markers Coral)
UX-DR2: Implement typography system with DM Serif Display (headings) + Nunito (body) loaded via next/font; type scale from Display 32px to Tiny 10px; stats numbers Nunito Bold 28px with uppercase 10px labels
UX-DR3: Implement spacing system (4px base unit, scale 4-8-12-16-24-32-48-64-96); border radius (cards 12px, buttons 8px, markers circle, stats bar 16px pill); shadows (navy-tinted for floating overlays, cards, bottom sheet)
UX-DR4: Build MapCanvas component — full-bleed Leaflet wrapper with OpenSeaMap nautical overlay; 3 variants (full-screen, contained, mini); dynamic import ssr:false; states: loading/loaded/animating/interactive; keyboard zoom +/- and screen reader announcement
UX-DR5: Build StatsBar component — translucent floating display (distance nm, to go nm, days, ports, countries); glass morphism treatment; compact mobile / extended desktop variants; aria-label per stat
UX-DR6: Build BoatBadge component — translucent pill (green dot + boat name), expandable to boat type + sailor username + profile link; button role
UX-DR7: Build StopoverMarker component — Coral circle 14px with white 2px border; states: default/hover 16px/selected 18px+sheet/cluster; button role with aria-label "Stopover: {name}, {country}"
UX-DR8: Build StopoverSheet component — bottom sheet with Sand (#FDF6EC) background, drag handle, port name (DM Serif), country + flag emoji, arrival/departure dates, duration, "Add a note" placeholder; swipe-to-dismiss; dialog role with focus trap; states: hidden/peek/full/editing
UX-DR9: Build PortsPanel component — sliding panel from right; stopovers grouped by country with flag emojis; tap port → map centers + sheet opens; mobile full overlay / desktop >1024px persistent sidebar; navigation landmark, arrow key navigation
UX-DR10: Build RouteAnimation component — progressive polyline drawing with boat icon following tip; adaptive timing (short tracks fast, >1000nm ~8 seconds); tap to pause/resume; prefers-reduced-motion → skip to final state; aria-live announcement
UX-DR11: Build ActionFAB component — 48px coral circle for ports panel toggle; pressed scale 0.95; active state icon transitions to X; button role, aria-label
UX-DR12: Build ImportProgress component — full-screen overlay with step indicator + progress bar; steps: "Parsing tracks..." → "Simplifying..." → "Detecting stopovers..." → "Preparing preview..."; error state with retry; aria-live + progress role
UX-DR13: Build VoyageCard component — mini MapCanvas preview + card body + voyage name (DM Serif) + stats row + public/private badge; hover lift shadow; empty variant (dashed border, "Import your first track"); link role with stats aria-label
UX-DR14: Build EmptyState component — illustration/icon + title + description + CTA button; variants: empty voyage ("Export from Navionics and share to Bosco") and empty dashboard ("Create your first voyage")
UX-DR15: Implement button hierarchy — Coral primary (max one per screen), Ocean secondary, Navy ghost tertiary, Error danger (always behind confirmation dialog); all buttons min 44px height on mobile
UX-DR16: Implement feedback patterns — Toast bottom-center (success 4s auto-dismiss, error persistent with recovery action, max 2 visible, stacking); no generic spinners — always contextual messages
UX-DR17: Implement form patterns — labels above inputs (Nunito SemiBold 13px Slate), inline validation on blur with error below field in Error red, success green check icon, required fields marked with subtle dot, username real-time availability check with debounce
UX-DR18: Implement creator navigation — bottom tab bar (Dashboard, Voyage, Profile) on mobile always visible; side navigation on desktop >1024px; no hamburger menu
UX-DR19: Implement 3 responsive breakpoints — mobile 375-767px (single column, bottom nav, full-bleed map), tablet 768-1023px (more map space, larger touch targets), desktop 1024px+ (PortsPanel persistent sidebar, multi-column dashboard, side nav)
UX-DR20: Implement 44px minimum touch targets on all interactive elements; bottom sheet swipe gestures; ports panel swipe to dismiss; pull-to-refresh on dashboard
UX-DR21: Implement keyboard navigation — tab order follows visual hierarchy, map +/- zoom + arrow pan, Escape dismiss overlays, focus trap in sheets/panels, 2px Ocean outline focus indicator
UX-DR22: Implement screen reader support — map description ("Sailing voyage map showing route from..."), stat aria-labels, stopover marker labels, animation aria-live announcements, empty state descriptive headings
UX-DR23: Implement prefers-reduced-motion — skip route animation and show final state, all transitions respect preference
UX-DR24: Implement PWA with Web Share Target — service worker, web app manifest with share_target, installable on Android home screen, appears in OS share sheet for Navionics export
UX-DR25: Implement overlay management — maximum one overlay at a time; opening new overlay dismisses current; overlay types: bottom sheet (sand), side panel (glass morphism), dialog (centered white), toast (bottom-center compact)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR-1 | Epic 1 | Authentication via email magic link |
| FR-2 | Epic 1 | User Profile (username, boat, bio, photos) |
| FR-3 | Epic 1 (create only) + Epic 2 (extended CRUD, slug, visibility, cover) | Voyages |
| FR-4 | Epic 2 | GPX Import & Track Processing |
| FR-5 | Epic 2 | Stopovers (auto-detection, naming, management) |
| FR-6 | Epic 4 | Log Entries (journal text + photos) |
| FR-7 | Epic 3 | Public Voyage Page (map, animation, stats, stopovers) |
| FR-8 | Epic 3 | Public Profile Page |
| FR-9 | Epic 1 (basic empty state) + Epic 2 (extended with voyage cards, stats) | Dashboard |

**Coverage: 9/9 FRs mapped. No gaps.**

## Epic List

### Epic 1: Sailor Onboarding & Profile
Users can sign up via magic link, create their sailor profile (username, boat name), create their first voyage, and access their personal dashboard. This epic establishes the project foundation, infrastructure, and user identity.
**FRs covered:** FR-1, FR-2, FR-3 (create only), FR-9 (basic)

### Epic 2: Track Import & Map Visualization
Sailors can import GPX tracks from Navionics via the Android share sheet or file picker, see their sailing route on a nautical map with auto-detected stopovers, and manage their voyages with full CRUD. This epic delivers the core product experience end-to-end, including PWA infrastructure and Web Share Target registration.
**FRs covered:** FR-3 (extended), FR-4, FR-5, FR-9 (extended)

### Epic 3: Public Pages & Sharing
Sailors can share their voyages publicly via a toggle and shareable URL. Visitors see an animated route on a nautical map, explore stopovers, browse stats, and view the sailor's public profile — all without an account. Pages are SSR-rendered with Open Graph meta tags and structured data for SEO and rich link previews.
**FRs covered:** FR-7, FR-8

### Epic 4: Voyage Journal & Photos
Sailors can enrich their voyages with journal entries containing free-form text and photo attachments, creating a narrative timeline. Entries appear on the voyage page and are readable by visitors on the public page.
**FRs covered:** FR-6

---

## Epic 1: Sailor Onboarding & Profile

Users can sign up via magic link, create their sailor profile (username, boat name), create their first voyage, and access their personal dashboard. This epic establishes the project foundation, infrastructure, and user identity.

### Story 1.1: Landing Page & Project Foundation

As a visitor discovering Bosco,
I want to land on a page that communicates what Bosco does and invites me to sign up,
So that I understand the product's value before creating an account.

_This story also establishes the project foundation: Next.js initialization, design system tokens, Supabase local dev environment, and CI pipeline._

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** the developer runs `npm install && npm run dev`
**Then** the Next.js 16 dev server starts with Turbopack and renders a placeholder landing page
**And** TypeScript strict mode is enabled with zero compilation errors

**Given** the Tailwind configuration file
**When** inspecting the design tokens
**Then** the Ocean & Sunset color palette is defined (Navy #1B2D4F, Ocean #2563EB, Coral #E8614D, Amber #F59E0B, Sand #FDF6EC, Slate #334155, Mist #94A3B8, Foam #F1F5F9, plus semantic colors Success #10B981, Warning #F59E0B, Error #EF4444, Info #2563EB)
**And** DM Serif Display and Nunito fonts are loaded via next/font with the defined type scale
**And** the spacing scale (4-8-12-16-24-32-48-64-96), border radius values (cards 12px, buttons 8px, stats bar 16px), and navy-tinted shadow definitions are configured

**Given** the project structure
**When** inspecting the `src/lib/` directory
**Then** `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, and `src/lib/supabase/middleware.ts` placeholder files exist
**And** ESLint `no-restricted-imports` rule prevents importing `@supabase/supabase-js` outside `src/lib/supabase/`

**Given** the developer runs `supabase start`
**When** the local Supabase instance initializes
**Then** a local Postgres database, Auth service, and Storage service are running
**And** `supabase/config.toml` is committed to the repository

**Given** the CI configuration
**When** a pull request is opened on GitHub
**Then** GitHub Actions runs lint, type-check, and Vitest (with zero tests passing trivially)
**And** Sentry client and server config files exist at the project root
**And** Vercel Analytics `<Analytics />` component is included in the root layout

**Given** any route or feature directory
**When** user-facing strings are needed
**Then** strings are externalized in a collocated `messages.ts` file, never inline in components

### Story 1.2: Authentication with Magic Link

As a sailor,
I want to sign up and sign in using my email address via a magic link,
So that I can securely access my personal Bosco account without managing a password.

**Acceptance Criteria:**

**Given** the `profiles` table does not exist
**When** the migration `001_profiles.sql` runs
**Then** a `profiles` table is created with columns: `id` (uuid, FK to auth.users), `username` (unique text), `boat_name` (text nullable), `boat_type` (text nullable), `bio` (text nullable), `profile_photo_url` (text nullable), `boat_photo_url` (text nullable), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** RLS policies allow users to read/update only their own profile
**And** a trigger creates a profile row automatically when a new auth user is created

**Given** the auth wrapper at `src/lib/auth.ts`
**When** imported by a Server Action
**Then** it exports `signIn(email)`, `signOut()`, `getUser()`, and `requireAuth()` functions
**And** `requireAuth()` returns the authenticated user or returns `{ data: null, error: { code: 'UNAUTHORIZED', message: '...' } }`

**Given** an unauthenticated visitor on the `/auth` page
**When** they enter a valid email address and submit
**Then** a magic link is sent to that email address
**And** the page displays a "Check your email" confirmation message with the email address shown

**Given** the user clicks the magic link in their email
**When** the browser navigates to `/auth/callback`
**Then** the auth session is established
**And** the user is redirected to `/dashboard`

**Given** an authenticated user closes and reopens the browser
**When** they navigate to Bosco
**Then** they remain authenticated (session persists)

**Given** an unauthenticated visitor
**When** they attempt to access `/dashboard` or any protected route
**Then** the Next.js middleware redirects them to `/auth`

**Given** any Server Action in the application
**When** it returns an error
**Then** the return format is `{ data: null, error: { code: ErrorCode, message: string } }` where ErrorCode is one of VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, FORBIDDEN, EXTERNAL_SERVICE_ERROR, PROCESSING_ERROR

### Story 1.3: Sailor Profile Setup

As a newly registered sailor,
I want to set up my profile with a unique username and boat information,
So that I have a personal identity on Bosco and a public URL for my voyages.

**Acceptance Criteria:**

**Given** a newly authenticated user with no profile data set
**When** they are redirected to the dashboard
**Then** they are redirected to `/dashboard/profile` to complete their profile setup

**Given** the profile setup form at `/dashboard/profile`
**When** the user views the form
**Then** fields are displayed: username (required), boat name (optional), boat type (optional), bio (optional), profile photo (optional), boat photo (optional)
**And** labels are above inputs in Nunito SemiBold 13px Slate
**And** required fields are marked with a subtle dot

**Given** the user types a username in the username field
**When** they pause typing (debounce)
**Then** a real-time availability check runs via a `checkUsername` Server Action
**And** a green check icon appears if the username is available
**And** an error message appears below the field in Error red if the username is taken

**Given** the user submits the profile form with valid data
**When** the `updateProfile` Server Action processes the request
**Then** the profile is saved to the `profiles` table via `src/lib/data/profiles.ts`
**And** the user is redirected to `/dashboard`
**And** a success toast appears: "Profile created"

**Given** the user uploads a profile photo or boat photo
**When** the image is selected
**Then** it is compressed client-side to under 1 MB before upload
**And** the file type and size (max 10 MB original) are validated
**And** the image is uploaded via `src/lib/storage.ts` to Supabase Storage
**And** the photo URL is saved to the profile

**Given** the user submits invalid data (e.g., empty username, username with special characters)
**When** the form validates on blur
**Then** inline error messages appear below the invalid fields in Error red
**And** the form is not submitted until validation passes

**Given** an existing user visits `/dashboard/profile`
**When** the page loads
**Then** the form is pre-filled with their current profile data
**And** they can update any field and save changes

### Story 1.4: Dashboard & Voyage Creation

As an authenticated sailor,
I want to view my dashboard and create my first voyage,
So that I have a home base in Bosco and can start building my sailing journey.

**Acceptance Criteria:**

**Given** the `voyages` table does not exist
**When** the migration `002_voyages.sql` runs
**Then** a `voyages` table is created with columns: `id` (uuid), `user_id` (uuid FK to profiles), `name` (text), `description` (text nullable), `slug` (text), `cover_image_url` (text nullable), `is_public` (boolean default false), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** a unique constraint exists on `(user_id, slug)`
**And** RLS policies allow users to read/modify only their own voyages

**Given** an authenticated sailor with no voyages
**When** they visit `/dashboard`
**Then** the EmptyState component is displayed with an illustration, "Create your first voyage" heading, and a CTA button
**And** the creator bottom tab navigation is visible with 3 tabs: Dashboard, Voyage, Profile
**And** the layout is single column on mobile (375px+) and centered max-width 1200px on desktop

**Given** the sailor taps "New voyage" or the EmptyState CTA
**When** the voyage creation form is displayed
**Then** they can enter a voyage name (required) and description (optional)
**And** the slug is auto-generated from the name but editable

**Given** the sailor submits the voyage creation form with a valid name
**When** the `createVoyage` Server Action processes the request
**Then** the voyage is saved via `src/lib/data/voyages.ts`
**And** the sailor is redirected to `/voyage/[id]` showing an empty voyage view
**And** a success toast appears: "Voyage created"

**Given** the sailor submits a voyage with a slug that already exists in their account
**When** the Server Action validates
**Then** an error is returned: `{ data: null, error: { code: 'VALIDATION_ERROR', message: 'This slug is already used by another voyage' } }`
**And** the error is displayed inline below the slug field

**Given** an authenticated sailor with one or more voyages
**When** they visit `/dashboard`
**Then** their voyages are listed as cards showing: voyage name, description excerpt, creation date, and public/private badge
**And** each card links to the voyage view at `/voyage/[id]`

**Given** the dashboard on a desktop screen (>1024px)
**When** the layout renders
**Then** voyage cards are displayed in a 2-column grid
**And** side navigation replaces the bottom tab bar

**Given** the bottom tab navigation on mobile
**When** the sailor taps Dashboard, Voyage, or Profile
**Then** they navigate to the corresponding section
**And** the active tab is visually highlighted

---

## Epic 2: Track Import & Map Visualization

Sailors can import GPX tracks from Navionics via the Android share sheet or file picker, see their sailing route on a nautical map with auto-detected stopovers, and manage their voyages with full CRUD. This epic delivers the core product experience end-to-end, including PWA infrastructure and Web Share Target registration.

### Story 2.1: Map Integration & Voyage View

As a sailor,
I want to see my voyage on an interactive nautical map,
So that I have a visual canvas where my sailing tracks and stopovers will appear.

**Acceptance Criteria:**

**Given** the MapCanvas component
**When** it is rendered on the voyage view page
**Then** it displays a full-bleed Leaflet map with OpenStreetMap base tiles and OpenSeaMap nautical overlay (buoys, lighthouses, channels, depth soundings)
**And** the component is dynamically imported with `ssr: false` (Leaflet requires `window`)
**And** the map supports pinch zoom, pan, and tap on iOS Safari and Android Chrome

**Given** a sailor navigates to `/voyage/[id]` for an existing voyage
**When** the page loads
**Then** the voyage name is displayed
**And** a full-screen MapCanvas is rendered
**And** if no tracks exist, an EmptyState prompt is shown: "Export from Navionics and share to Bosco" with an "Import track" CTA button

**Given** a sailor navigates to `/voyage/[id]` for a voyage with imported legs
**When** the page loads
**Then** all leg tracks are rendered on the map as Ocean (#2563EB) polylines at 0.85 opacity, 3px weight
**And** the map auto-fits to show the complete voyage extent

**Given** the MapCanvas on a mobile device
**When** the user interacts with the map
**Then** touch targets for all interactive elements are at least 44x44px
**And** map interactions maintain 60 fps on mid-range mobile devices (2022+)

**Given** a keyboard user on desktop
**When** the map has focus
**Then** +/- keys control zoom and arrow keys control pan
**And** a screen reader announces "Sailing voyage map"

### Story 2.2: GPX Processing Pipeline

As a sailor importing large GPS tracks,
I want my GPX files to be parsed and simplified directly on my phone without freezing the interface,
So that I can continue interacting with the app while even very large files (up to 400 MB) are processed.

_Implementation: client-side processing pipeline in a dedicated Web Worker — parsing, Douglas-Peucker simplification, and GeoJSON conversion._

**Acceptance Criteria:**

**Given** a valid GPX 1.1 file sent to the Web Worker
**When** the worker receives a `{ type: 'process', file }` message
**Then** it parses the XML, extracts all tracks and track segments
**And** sends progress messages: `{ type: 'progress', step: 'parsing' }`, then `'simplifying'`, then `'detecting'`, then `'ready'`
**And** returns `{ type: 'result', data: { tracks: GeoJSON[], stopovers: Stopover[], stats: TrackStats[] } }`

**Given** a GPX file with a single track containing 1M+ points
**When** the Douglas-Peucker simplification runs
**Then** it uses an iterative (stack-based) implementation, never recursive
**And** the simplified track preserves visible tacks and course changes at zoom level 14
**And** coordinates are stored in GeoJSON `[longitude, latitude]` order

**Given** a multi-track GPX file
**When** processing completes
**Then** each track is returned as a separate GeoJSON LineString with its own stats
**And** per-track stats include: distance (nm), duration, average speed (kts), max speed (kts), start timestamp, end timestamp, point count

**Given** a 400 MB GPX file processed on target mobile hardware
**When** the import completes
**Then** total processing time is under 60 seconds
**And** main thread input responsiveness remains below 200 ms throughout

**Given** an invalid or corrupted GPX file
**When** the worker attempts to parse it
**Then** it returns `{ type: 'error', error: { code: 'PROCESSING_ERROR', message: 'Invalid GPX format' } }`
**And** the main thread receives the error without crashing

**Given** the GPX processing modules
**When** inspecting the file structure
**Then** `src/lib/gpx/parser.ts`, `src/lib/gpx/simplify.ts`, `src/lib/gpx/to-geojson.ts`, and `src/lib/gpx/worker.ts` exist
**And** each module has a co-located test file

### Story 2.3: GPX Import Flow

As a sailor,
I want to import a GPX file, preview the detected tracks on a map, select which ones to add, and confirm the import,
So that my sailing tracks appear on my voyage map.

**Acceptance Criteria:**

**Given** the `legs` table does not exist
**When** the migration `003_legs.sql` runs
**Then** a `legs` table is created with columns: `id` (uuid), `voyage_id` (uuid FK to voyages), `track_geojson` (jsonb), `distance_nm` (numeric), `duration_seconds` (integer), `avg_speed_kts` (numeric), `max_speed_kts` (numeric), `started_at` (timestamptz), `ended_at` (timestamptz), `created_at` (timestamptz)
**And** RLS policies allow users to read/modify only legs belonging to their own voyages

**Given** a sailor on the voyage view taps "Import track"
**When** the import page (`/voyage/[id]/import`) loads
**Then** a file picker is presented accepting `.gpx` files

**Given** the sailor selects a GPX file
**When** the file is sent to the Web Worker for processing
**Then** the ImportProgress overlay appears with step indicator and progress bar
**And** steps display sequentially: "Parsing tracks..." → "Simplifying..." → "Detecting stopovers..." → "Preparing preview..."
**And** if an error occurs, a retry button is shown with a clear error message
**And** the overlay uses aria-live region and progress role for accessibility

**Given** processing completes successfully
**When** the preview screen appears
**Then** all detected tracks are shown on a full-screen map, each in a distinct color
**And** a track list shows each track with: name (from GPX metadata), distance (nm), duration, date, and a checkbox (all selected by default)
**And** the sailor can deselect tracks they don't want to import

**Given** a multi-track file with the merge option
**When** the sailor views the import options
**Then** they can choose to import selected tracks as separate legs or as a single merged leg

**Given** the sailor taps "Add to voyage"
**When** the import is confirmed
**Then** the simplified GeoJSON and stats for each selected leg are saved to the `legs` table via `src/lib/data/legs.ts`
**And** the sailor is redirected to the voyage view
**And** the new tracks appear on the map alongside any existing tracks
**And** a success toast appears: "{N} track(s) added to {voyage name}"

**Given** the map renders simplified tracks with up to 100,000 points
**When** the sailor interacts with the map
**Then** interaction latency remains below 100 ms

**Given** all distances and speeds displayed in the import flow
**When** the values are formatted
**Then** distances are in nautical miles (nm) and speeds in knots (kts)

### Story 2.4: Automatic Stopover Detection & Management

As a sailor,
I want stopovers to be automatically detected at the start and end of each leg and named with real place names,
So that my voyage shows meaningful waypoints without manual data entry.

**Acceptance Criteria:**

**Given** the `stopovers` table does not exist
**When** the migration `004_stopovers.sql` runs
**Then** a `stopovers` table is created with columns: `id` (uuid), `voyage_id` (uuid FK to voyages), `name` (text), `country` (text nullable), `latitude` (numeric), `longitude` (numeric), `arrived_at` (timestamptz nullable), `departed_at` (timestamptz nullable), `created_at` (timestamptz)
**And** RLS policies allow users to read/modify only stopovers belonging to their own voyages

**Given** a new leg is imported with start and end coordinates
**When** the stopover detection algorithm runs (`src/lib/geo/stopover-detection.ts`)
**Then** it checks if the start point falls within the configurable radius (default 2 km) of an existing stopover
**And** if a match is found, the leg is associated with that existing stopover
**And** if no match is found, a new stopover is created at that coordinate

**Given** a new stopover is created without a name
**When** the system requests reverse geocoding
**Then** the Nominatim proxy API route (`/api/geocode`) is called with the coordinates
**And** the API route rate-limits requests (1 per second) and caches results
**And** the stopover is initially displayed with coordinates, then updated with the human-readable place name and country when the geocoding response arrives
**And** if Nominatim is unavailable, the stopover displays coordinates only with no error to the user

**Given** stopovers exist on the voyage map
**When** the sailor views the map
**Then** each stopover is displayed as a StopoverMarker (Coral #E8614D circle, 14px, white 2px border)
**And** markers have hover state (16px) and selected state (18px)
**And** each marker has `role="button"` and `aria-label="Stopover: {name}, {country}"`

**Given** a sailor wants to manage stopovers
**When** they interact with a stopover
**Then** they can rename the stopover (e.g., correct "Quimper" to "Audierne")
**And** they can reposition the stopover on the map
**And** they can delete a stopover
**And** they can merge two stopovers that represent the same location

**Given** a sailor wants to change the detection radius
**When** they access stopover settings
**Then** they can configure the radius (default 2 km)
**And** the new radius applies to future imports only

**Given** the voyage view with stopovers
**When** the sailor views the stopover list
**Then** stopovers are browsable grouped by country

### Story 2.4b: Leg Deletion

As a sailor,
I want to delete individual legs from my voyage,
So that I can remove incorrect or duplicate tracks without deleting the entire voyage.

**Acceptance Criteria:**

**Given** an authenticated sailor viewing their voyage at `/voyage/[id]`
**When** they see the list of imported legs on the map
**Then** each leg displays a delete action

**Given** a sailor initiates leg deletion
**When** they tap the delete button
**Then** a confirmation dialog asks: "Delete this leg? This cannot be undone."
**And** the delete button is styled with Error red (UX-DR15 danger variant)

**Given** the sailor confirms deletion
**When** the Server Action executes
**Then** the leg row is removed from the `legs` table
**And** associated stopovers are NOT deleted (they belong to the voyage)
**And** the map updates to reflect the remaining tracks
**And** a success toast appears: "Leg deleted"

**Given** a sailor deletes the last leg of a voyage
**When** no legs remain
**Then** the empty state overlay reappears with the import prompt

**Technical Notes:**
- Data layer: add `deleteLeg(legId, userId)` to `src/lib/data/legs.ts`
- Server Action: add `deleteLeg` to voyage actions with auth + ownership check
- RLS: existing policies cover DELETE via voyage ownership
- No migration needed

### Story 2.5: PWA & Web Share Target

As a sailor using Android,
I want Bosco to appear in my phone's share sheet when I export from Navionics,
So that I can import tracks in 2 minutes without opening the browser manually.

**Acceptance Criteria:**

**Given** the PWA configuration
**When** inspecting `public/manifest.json`
**Then** it includes: `name`, `short_name`, `icons` (192px, 512px), `start_url`, `display: "standalone"`, `theme_color` (Navy #1B2D4F), `background_color`
**And** a `share_target` field is configured to accept files with MIME type `application/gpx+xml` and file extensions `.gpx`

**Given** a service worker is registered
**When** the PWA loads
**Then** the service worker (Serwist or native) is active
**And** it handles the share target POST request, extracting the shared GPX file

**Given** a sailor has installed Bosco on their Android home screen
**When** they export tracks from Navionics and open the OS share sheet
**Then** "Bosco" appears as a share target option

**Given** the sailor taps "Bosco" in the share sheet
**When** Bosco receives the shared GPX file
**Then** if the sailor is authenticated: the file is routed to the import flow targeting the last active voyage
**And** if no voyage exists: an inline voyage creation form is shown with a pre-filled name
**And** if the sailor is not authenticated: they are redirected to the auth page, and after login, returned to the import flow with the file preserved

**Given** the PWA on Android Chrome
**When** the browser detects installability criteria are met
**Then** the install prompt is accessible and works with Android TalkBack
**And** the installed app opens in standalone mode

### Story 2.6: Extended Dashboard with Voyage Cards

As a sailor,
I want my dashboard to display voyage cards with a mini-map preview, stats, and full voyage management,
So that I can quickly see all my voyages and manage them from one place.

**Acceptance Criteria:**

**Given** an authenticated sailor with one or more voyages that have imported tracks
**When** they visit `/dashboard`
**Then** each voyage is displayed as a VoyageCard component with: mini MapCanvas preview showing the track, voyage name in DM Serif Display, stats row (distance nm, legs count, stopovers count), and a public/private badge
**And** the card has a hover state with slight lift shadow on desktop
**And** each card links to the voyage view at `/voyage/[id]`
**And** cards have `role="link"` with stats as `aria-label`

**Given** a voyage with no imported tracks
**When** its card is displayed on the dashboard
**Then** the card shows an empty variant with dashed border and prompt: "Import your first track"

**Given** a sailor wants to rename a voyage
**When** they access voyage settings at `/voyage/[id]/settings`
**Then** they can edit the voyage name, description, and slug
**And** the slug uniqueness constraint is validated with inline error

**Given** a sailor wants to delete a voyage
**When** they initiate deletion
**Then** a confirmation dialog (centered, white card, dimmed backdrop) asks: "Are you sure you want to delete this voyage? This action cannot be undone."
**And** the delete button is styled with Error red (UX-DR15 danger variant)
**And** upon confirmation, the voyage and all associated legs and stopovers are deleted
**And** the sailor is redirected to `/dashboard` with a toast: "Voyage deleted"

**Given** a sailor wants to change voyage visibility
**When** they toggle the public/private switch on the voyage settings page
**Then** the visibility is updated via Server Action
**And** a toast confirms: "Voyage is now public" or "Voyage is now private"
**And** the toggle uses Success green when public

**Given** a sailor wants to set a cover image for a voyage
**When** they upload an image on the voyage settings page
**Then** the image is compressed client-side to under 1 MB, validated (type + size), and uploaded to Supabase Storage
**And** the cover image appears on the VoyageCard in the dashboard

**Given** the dashboard on desktop (>1024px)
**When** the layout renders
**Then** VoyageCards are displayed in a 2-column grid
**And** summary stats per voyage are visible without clicking into the voyage

---

## Epic 3: Public Pages & Sharing

Sailors can share their voyages publicly via a toggle and shareable URL. Visitors see an animated route on a nautical map, explore stopovers, browse stats, and view the sailor's public profile — all without an account. Pages are SSR-rendered with Open Graph meta tags and structured data for SEO and rich link previews.

### Story 3.1: Public Voyage Page — Map, Stats & Route Animation

As a visitor,
I want to open a shared voyage link and see an animated sailing route on a nautical map with voyage stats,
So that I can experience the journey visually without needing an account.

**Acceptance Criteria:**

**Given** a public voyage exists for a sailor
**When** a visitor navigates to `/{username}/{voyage-slug}`
**Then** the page is server-side rendered with complete HTML in the first response
**And** first meaningful paint occurs in under 2 seconds on a 4G mobile connection

**Given** the public voyage page loads
**When** the map renders
**Then** a full-bleed MapCanvas displays OpenStreetMap base tiles with OpenSeaMap nautical overlay
**And** all voyage legs are rendered as Ocean (#2563EB) polylines at 0.85 opacity, 3px weight
**And** stopovers are displayed as StopoverMarker components (Coral circles)
**And** the latest known boat position is shown with a boat icon

**Given** a visitor opens the page for the first time
**When** the map has loaded
**Then** the RouteAnimation plays: tracks draw progressively along their coordinates with a boat icon following the tip
**And** animation timing adapts to track length (short tracks <50nm faster, long voyages >1000nm pace for ~8 seconds total)
**And** the animation line weight is 4px during animation
**And** tapping the map pauses/resumes the animation
**And** aria-live announces "Route animation playing" and "Route animation complete"

**Given** the user has `prefers-reduced-motion` enabled
**When** the page loads
**Then** the route animation is skipped and the final state (all tracks visible) is shown immediately

**Given** the public voyage page
**When** viewing the overlays
**Then** a StatsBar is displayed at bottom center showing: distance sailed (nm), days, ports of call count, and countries count
**And** the StatsBar uses translucent glass morphism treatment (navy at 75% opacity, backdrop blur 12px)
**And** each stat has an aria-label (e.g., "1,534 nautical miles sailed")
**And** a BoatBadge is displayed at top-left as a translucent pill with green status dot and boat name
**And** tapping the BoatBadge expands it to show boat type, sailor username, and link to profile

**Given** the public voyage page header
**When** inspecting the page
**Then** the voyage name, boat name, and sailor username are identifiable from the page content

**Given** the public voyage page with CSP headers
**When** the response headers are inspected
**Then** a restrictive Content Security Policy is set allowing Supabase, OpenStreetMap tile servers, OpenSeaMap, Nominatim, and Sentry domains only

### Story 3.2: Stopover Interaction & Ports Panel

As a visitor,
I want to tap on stopovers to see port details and browse all ports by country,
So that I can explore where the sailor stopped along the journey.

**Acceptance Criteria:**

**Given** a visitor on the public voyage page
**When** they tap a StopoverMarker on the map
**Then** the StopoverSheet slides up from the bottom with Sand (#FDF6EC) background
**And** it displays: drag handle, port name in DM Serif Display, country with flag emoji, arrival and departure dates, duration (e.g., "2 nights")
**And** a "Add a note" placeholder is shown in Coral accent (non-functional on public page)
**And** the sheet has `role="dialog"`, focus is trapped within it, and Escape dismisses it

**Given** the StopoverSheet is open
**When** the visitor swipes down or taps outside the sheet
**Then** the sheet dismisses with a smooth animation (200ms ease-out)

**Given** the public voyage page
**When** the visitor taps the ActionFAB (48px Coral circle, bottom-right)
**Then** the PortsPanel slides in from the right
**And** the FAB icon transitions to an X (close)
**And** the panel lists all stopovers grouped by country with flag emojis
**And** tapping a port name centers the map on that stopover and opens its StopoverSheet
**And** the panel has `role="navigation"` and supports arrow key navigation between ports

**Given** the overlay management rule
**When** a visitor opens the PortsPanel while the StopoverSheet is open
**Then** the StopoverSheet dismisses before the PortsPanel opens
**And** only one overlay is visible at a time

**Given** the public page on desktop (>1024px)
**When** the layout renders
**Then** the PortsPanel is displayed as a persistent sidebar on the left (280px width)
**And** the ActionFAB is hidden since the panel is always visible
**And** the StopoverSheet has a max-width of 400px

**Given** the public page on mobile
**When** the PortsPanel is open
**Then** it renders as a full-height overlay on the right side
**And** swiping left dismisses the panel

**Given** keyboard navigation on the public page
**When** the user tabs through interactive elements
**Then** tab order follows visual hierarchy (BoatBadge → map → StopoverMarkers → ActionFAB → StatsBar)
**And** all custom components have visible focus indicators (2px Ocean outline with 2px offset)

### Story 3.3: SEO, Open Graph & Public Profile

As a sailor,
I want my shared links to show rich previews on social media, and visitors to find my public profile listing all my voyages,
So that sharing drives engagement and my profile serves as a portfolio of my sailing journeys.

**Acceptance Criteria:**

**Given** a public voyage page at `/{username}/{voyage-slug}`
**When** a social media platform or messaging app fetches the URL
**Then** Open Graph meta tags are present: `og:title` (voyage name), `og:description` (voyage stats summary), `og:image` (dynamic voyage map image), `og:url`, `og:type: website`
**And** Twitter Card meta tags are also present for rich Twitter/X previews

**Given** the Open Graph image generation
**When** the `opengraph-image.tsx` file renders for a voyage
**Then** it generates a dynamic image showing a map thumbnail with the voyage track, voyage name, and key stats
**And** the image dimensions are appropriate for social sharing (1200x630px)

**Given** a public voyage page
**When** inspecting the HTML source
**Then** JSON-LD structured data is present and passes schema.org validation
**And** the structured data describes the voyage (name, description, creator, dates)

**Given** a visitor navigates to `/{username}`
**When** the public profile page loads (SSR)
**Then** it displays: the sailor's username, boat name, boat type, bio, profile photo, and boat photo
**And** all public voyages are listed as cards with cover image, voyage name, and stats summary (distance, ports, countries)
**And** each card links to the public voyage page

**Given** an unauthenticated visitor
**When** they attempt to access a voyage that is set to private
**Then** they receive a 404 page (not a 403, to avoid revealing the existence of private voyages)

**Given** an unauthenticated visitor
**When** they navigate to `/{username}` for a profile with no public voyages
**Then** the profile page displays the sailor's public information but shows no voyage cards
**And** no indication is given about the existence of private voyages

**Given** a public voyage page URL shared with a specific map view
**When** the visitor opens the link
**Then** the map preserves the shared view (center coordinates and zoom level encoded in the URL)

---

## Epic 4: Voyage Journal & Photos

Sailors can enrich their voyages with journal entries containing free-form text and photo attachments, creating a narrative timeline. Entries appear on the voyage page and are readable by visitors on the public page.

### Story 4.1: Journal Entry Creation & Management

As a sailor,
I want to write journal entries with text and photos attached to my voyage,
So that I can document my sailing experiences and share them alongside my tracks.

**Acceptance Criteria:**

**Given** the `log_entries` table does not exist
**When** the migration `005_log_entries.sql` runs
**Then** a `log_entries` table is created with columns: `id` (uuid), `voyage_id` (uuid FK to voyages), `leg_id` (uuid FK to legs, nullable), `stopover_id` (uuid FK to stopovers, nullable), `entry_date` (date), `text` (text), `photo_urls` (jsonb, array of strings), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** RLS policies allow users to read/modify only entries belonging to their own voyages

**Given** a sailor on the voyage view
**When** they tap "Add log entry"
**Then** a LogEntryForm is displayed with fields: date (required, defaults to today), text (required, free-form), photo attachments (optional, multiple), optional link to a specific leg, optional link to a specific stopover
**And** the form follows form patterns: labels above inputs, inline validation on blur

**Given** the sailor writes a log entry and attaches photos
**When** they submit the form
**Then** each photo is compressed client-side to under 1 MB before upload
**And** photos are validated by type and size (max 10 MB original per image)
**And** photos are uploaded to Supabase Storage via `src/lib/storage.ts`
**And** the entry is saved via `src/lib/data/log-entries.ts`
**And** a success toast appears: "Log entry added"

**Given** the sailor submits an entry with invalid data (empty text, invalid date)
**When** validation runs on blur
**Then** inline error messages appear below invalid fields in Error red
**And** the form is not submitted until validation passes

**Given** a sailor wants to edit an existing log entry
**When** they access the entry
**Then** they can update the text, date, leg/stopover links, and add or remove photos
**And** changes are saved via Server Action returning `{ data, error }` format

**Given** a sailor wants to delete a log entry
**When** they initiate deletion
**Then** a confirmation dialog asks: "Delete this log entry?"
**And** upon confirmation, the entry and its associated photos are deleted
**And** a toast confirms: "Log entry deleted"

### Story 4.2: Journal Timeline Display

As a sailor or visitor,
I want to see journal entries displayed as a timeline on the voyage page,
So that the narrative enriches the visual sailing journey.

**Acceptance Criteria:**

**Given** a voyage with log entries
**When** the sailor views the voyage page (authenticated)
**Then** log entries are displayed in a timeline ordered by entry date (newest first)
**And** each LogEntryCard shows: date, text content, photo thumbnails (tappable to view full size), and linked stopover/leg name if applicable

**Given** a public voyage with log entries
**When** a visitor views the public voyage page
**Then** log entries are displayed in the same timeline format as the authenticated view
**And** the timeline is read-only (no edit/delete actions visible)

**Given** a voyage with no log entries
**When** the voyage page is viewed
**Then** no timeline section is shown (no empty state for journal — it is optional and never pushed)

**Given** log entry photos in the timeline
**When** a user taps a photo thumbnail
**Then** the photo opens in a larger view
**And** the overlay management rule applies (max one overlay at a time)

**Given** a public voyage page with log entries
**When** the page is server-side rendered
**Then** log entry text content is included in the SSR HTML for SEO indexability
**And** photo thumbnails use `next/image` for optimized loading
