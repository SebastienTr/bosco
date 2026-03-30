---
stepsCompleted:
  - 'step-01-validate-prerequisites'
  - 'step-02-design-epics'
  - 'step-03-create-stories'
  - 'step-04-final-validation'
status: 'complete'
completedAt: '2026-03-29'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/architecture-notes.md'
---

# Bosco v1.0 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Bosco v1.0, decomposing the requirements from the PRD (68 FRs, 35 NFRs), Architecture (with v1.0 addendum), and UX Design Specification (with v1.0 addendum) into implementable stories.

**Context:** MVP (4 epics) is deployed and live at sailbosco.com. v1.0 extends the product to app stores, adds storytelling features, and hardens for production.

## Requirements Inventory

### Functional Requirements

**Authentication & Identity (FR-1 to FR-4)**
- FR-1: Users can sign up and sign in via email magic link
- FR-2: Users can remain signed in across browser restarts and app relaunches until explicit logout or session expiry
- FR-3: Users can receive auth emails from a branded domain sender (sailbosco.com)
- FR-4: Users can sign in on web, iOS app, and Android app with the same account

**Sailor Profile (FR-5 to FR-8)**
- FR-5: Users can set a unique username (used in public URLs)
- FR-6: Users can optionally add: boat name, boat type, bio, profile photo, boat photo
- FR-7: Users can set their preferred language (English or French)
- FR-8: Users with administrator privileges can access the admin zone

**Voyage Management (FR-9 to FR-12)**
- FR-9: Users can create, rename, and delete voyages
- FR-10: Users can set and modify voyage name, description, slug, cover image, and public/private visibility from voyage settings
- FR-11: Users can use a slug that is unique within their account
- FR-12: Users can manage more than one voyage

**Track Import & Processing (FR-13 to FR-21)**
- FR-13: Users can import GPX 1.1 files up to 400 MB via file picker on all platforms
- FR-14: Users can import GPX files directly from Navionics via the OS share sheet on both iOS and Android
- FR-15: Users can share a GPX file to Bosco without being authenticated and be redirected to sign in, then returned to the import flow with the file preserved
- FR-16: Users can preview track geometry, point count, distance, and duration before confirming import
- FR-17: Users can select which tracks to import from a multi-track file
- FR-18: Users can import selected tracks as separate legs or as a merged leg
- FR-19: Users can view imported tracks that preserve visible tacks and course changes at zoom level 14 after simplification
- FR-20: Users can view per-leg stats: distance (nm), duration, average speed (kts), max speed, timestamps
- FR-21: Users can delete individual legs from a voyage

**Stopovers (FR-22 to FR-25)**
- FR-22: Users can have stopovers auto-detected from leg endpoints within a configurable radius
- FR-23: Users can see human-readable place names and country codes automatically assigned to stopovers via reverse geocoding
- FR-24: Users can rename, reposition, delete, and merge stopovers
- FR-25: Users can browse stopovers grouped by country

**Journal & Media (FR-26 to FR-32)**
- FR-26: Users can create journal entries with free-form text and photo attachments
- FR-27: Users can link journal entries to a specific date, and optionally to a leg and/or stopover
- FR-28: Users can upload photos that are automatically compressed to under 1 MB before storage
- FR-29: Users can view journal entries as a timeline on the voyage page
- FR-30: Users can create and save journal entries while offline, with automatic sync on reconnect
- FR-31: Users can queue photo attachments while offline, with automatic upload on reconnect
- FR-32: Users can see a discreet indicator showing the number of entries pending synchronization

**Geo-Tagged Media on Map (FR-33 to FR-35)**
- FR-33: Users and visitors can see photos attached to journal entries as visual markers on the map at the associated stopover or leg location
- FR-34: Users and visitors can tap photo markers to view photos in a lightbox
- FR-35: Visitors can browse photos on the map with marker clustering when more than 15 markers are visible at the current zoom level

**Public Voyage Page (FR-36 to FR-44)**
- FR-36: Visitors can access a public voyage page at /{username}/{voyage-slug} when a voyage is public
- FR-37: Visitors can view the voyage on a full-screen map with nautical chart context
- FR-38: Visitors can watch the route animate on initial page load
- FR-39: Visitors can view stopovers as markers, tap them for details including photos
- FR-40: Visitors can view a stats bar (distance, days, ports, countries)
- FR-41: Visitors can browse stopovers by country via the ports panel
- FR-42: Visitors can read journal entries in a timeline
- FR-43: Visitors who share a voyage link can see a dynamic OG image showing the real voyage map and route
- FR-44: Visitors can see a CTA for sailors ("Create your own voyage on Bosco") and use a share button to re-share the voyage

**Public Profile Page (FR-45)**
- FR-45: Visitors can access a sailor profile at /{username} showing public information and public voyages

**Social Sharing (FR-46 to FR-48)**
- FR-46: Users can share a voyage link via the native OS share sheet (iOS and Android)
- FR-47: Users can share links that display a rich preview (dynamic OG image + title + stats) on WhatsApp, Facebook, Instagram, Messenger, and other platforms
- FR-48: Users can tap links from sailbosco.com that open in the native app when installed, or fall back to the web browser

**Dashboard (FR-49 to FR-52)**
- FR-49: Users can view all their voyages with preview cards and stats summary
- FR-50: Users can create a new voyage from the dashboard
- FR-51: Users can navigate to profile editing from the dashboard
- FR-52: Users with no voyages can see a demonstration of a completed voyage with a CTA to create their first

**Onboarding (FR-53 to FR-54)**
- FR-53: Users can be directed to create their first voyage immediately after completing profile setup
- FR-54: Visitors can understand what Bosco does from the landing page, view a demo voyage, and access app store links and sign up

**Error Handling & Help (FR-55 to FR-56)**
- FR-55: Users receive actionable error messages when an operation fails, stating what went wrong and how to recover
- FR-56: Users who attempt to import an unsupported file format see an explanation and a guide for exporting GPX from Navionics

**Admin Zone (FR-57 to FR-60)**
- FR-57: Admins can view total users, active voyages, total legs, and new registrations
- FR-58: Admins can browse a user list with per-user stats
- FR-59: Admins can disable a user account
- FR-60: Admins can view error monitoring digest and storage usage metrics

**App Store Distribution (FR-61 to FR-63)**
- FR-61: Users can download Bosco from the Apple App Store
- FR-62: Users can download Bosco from the Google Play Store
- FR-63: Users can complete core flows (sign up, import GPX, view map, add journal, share) identically on web, iOS, and Android

**Internationalization (FR-64 to FR-65)**
- FR-64: Users can use the UI in English and French
- FR-65: Users can switch language from in-app settings

**Legal & Compliance (FR-66 to FR-67)**
- FR-66: Users can access the privacy policy and terms of service from the landing page and in-app settings
- FR-67: Users can delete their account and all associated data

**Trophy Preview (FR-68)**
- FR-68: Visitors can see a "Coming Soon" section for the Bosco Trophy physical product on public voyage pages

### Non-Functional Requirements

**Performance (NFR-1 to NFR-7)**
- NFR-1: Public pages FMP <2s on 4G
- NFR-2: 400MB GPX import <60s, main thread <200ms
- NFR-3: Map 60fps on mid-range mobile
- NFR-4: 100k points, interaction <100ms
- NFR-5: Native app cold start <3s
- NFR-6: Offline journal save <200ms
- NFR-7: Offline sync <30s after reconnect

**Security (NFR-8 to NFR-13)**
- NFR-8: Data isolation at database and application layers
- NFR-9: Public access only for public voyages
- NFR-10: Upload validation (10MB images, 400MB GPX)
- NFR-11: Admin routes dual authorization
- NFR-12: HTTPS + secure token storage
- NFR-13: Account deletion cascade within 30 days

**Mobile & Cross-Platform (NFR-14 to NFR-18)**
- NFR-14: Mobile-first 375px+
- NFR-15: Touch map interactions on all platforms
- NFR-16: GPX import from file picker + share sheet (iOS + Android)
- NFR-17: Photo compression <1MB
- NFR-18: 44px touch targets

**Accessibility (NFR-19 to NFR-22)**
- NFR-19: WCAG 2.1 AA conformance
- NFR-20: Keyboard accessible
- NFR-21: prefers-reduced-motion respected
- NFR-22: Appropriate aria-labels and screen reader support

**SEO & Social (NFR-23 to NFR-26)**
- NFR-23: SSR with complete HTML
- NFR-24: Dynamic OG images 1200x630px
- NFR-25: JSON-LD structured data
- NFR-26: Rich previews on social platforms

**Reliability & Observability (NFR-27 to NFR-32)**
- NFR-27: Zero unhandled exceptions on critical path
- NFR-28: Structured success/error responses
- NFR-29: Error tracking with context
- NFR-30: Uptime monitoring with alerting
- NFR-31: Database daily backups on production tier
- NFR-32: Offline sync failures surfaced with retry

**Internationalization (NFR-33 to NFR-35)**
- NFR-33: All strings externalized
- NFR-34: Locale-aware formatting
- NFR-35: Language switch <500ms without reload

### Additional Requirements (Architecture)

- AR-1: Supabase Pro migration from free tier (custom SMTP, daily backups, increased limits)
- AR-2: Capacitor 6.x project setup at repo root (ios/ and android/ directories)
- AR-3: iOS Share Extension in Swift (App Group shared container for file passing)
- AR-4: Android Intent filter for GPX MIME types
- AR-5: Deep linking configuration (.well-known/apple-app-site-association + assetlinks.json)
- AR-6: Platform detection module (src/lib/platform.ts — isNative, getPlatform)
- AR-7: Offline storage with IndexedDB (idb library) for journal drafts and photo queue
- AR-8: Sync engine (online detection, retry with exponential backoff, queue management)
- AR-9: Service Worker update (Serwist — cache strategy for offline browsing)
- AR-10: next-intl setup (upgrade from collocated messages.ts pattern)
- AR-11: Database schema update (is_admin, preferred_language, disabled_at columns on profiles)
- AR-12: Dynamic OG image generation with @vercel/og (Satori-based, Edge runtime)
- AR-13: Photo marker clustering (leaflet.markercluster integration)
- AR-14: Admin data layer (src/lib/data/admin.ts — metrics, user management queries)
- AR-15: Middleware update (admin route protection + locale resolution)
- AR-16: Sentry context enrichment (platform, locale, offline status)
- AR-17: Capacitor build pipeline (next build → cap sync → Xcode/Android Studio)
- AR-18: App store submission (store listings, screenshots, privacy labels, data safety)

### UX Design Requirements

- UX-DR1: Landing page redesign — animated mini-demo on live Leaflet map, app store badges, live voyage showcase, social proof section
- UX-DR2: Native app first-launch onboarding — splash screen, condensed landing, profile setup → first voyage prompt
- UX-DR3: iOS Share Extension minimal UI — "Opening in Bosco..." loading indicator
- UX-DR4: Admin dashboard — metric cards (users, voyages, legs, registrations), trend indicators, sparklines
- UX-DR5: Admin user list — searchable table/cards with per-user stats, disable action with confirmation
- UX-DR6: Admin error monitoring view — exception summary, alert thresholds (green/amber/red), Sentry link
- UX-DR7: SyncIndicator component — pill badge states (hidden/pending/syncing/failed), non-alarming mist color
- UX-DR8: Offline journal creation — identical to online UX, pending cloud icon on entries, silent sync
- UX-DR9: LanguageSwitcher — dropdown in settings (EN/FR), immediate effect, persisted to profile
- UX-DR10: DualCTA on public pages — bottom bar after 10s (create + share), translucent glass, dismissible
- UX-DR11: PhotoMarker — 32px circular thumbnails on map, white border, shadow
- UX-DR12: PhotoCluster — group badge when >15 markers visible, progressive uncluster on zoom
- UX-DR13: PhotoLightbox — full-viewport navy/90 backdrop, swipe navigation, caption, focus trap
- UX-DR14: ShareButton — native share sheet on mobile, copy-to-clipboard on desktop
- UX-DR15: TrophyPreview — sand card with description + "Notify me" email input
- UX-DR16: Enhanced VoyageCard — mini-map preview, last import date, journal count, country flags
- UX-DR17: Enhanced EmptyState — animated demo voyage, "Your first voyage awaits", 3-step guide
- UX-DR18: Error message anatomy — what happened + why + what to do, per-error-type designs
- UX-DR19: Navionics GPX export guide — 3-4 annotated screenshots, in-app drawer
- UX-DR20: Smart app banner on web — "Open in the Bosco app" for deep link fallback
- UX-DR21: Dynamic OG image content — SVG track path, voyage name, stats strip, boat name

### FR Coverage Map

**MVP (Epics 1-4) — Already Implemented:**
- FR-1, FR-2: Epic 1 (Auth)
- FR-5, FR-6: Epic 1 (Profiles)
- FR-9, FR-10, FR-11, FR-12: Epic 2 (Voyages)
- FR-13, FR-16, FR-17, FR-18, FR-19, FR-20, FR-21: Epic 2 (GPX Import)
- FR-22, FR-23, FR-24, FR-25: Epic 3 (Stopovers)
- FR-36, FR-37, FR-38, FR-39, FR-40, FR-41, FR-42: Epic 3 (Public Pages)
- FR-45: Epic 3 (Public Profile)
- FR-26, FR-27, FR-28, FR-29: Epic 4 (Journal & Photos)
- FR-49, FR-50, FR-51: Epic 4 (Dashboard)

**v1.0 (Epics 5-10) — New Work:**
- FR-3: Epic 5 (Custom SMTP)
- FR-66, FR-67: Epic 5 (Legal/RGPD)
- FR-14 (Android): Epic 6A (Android share target intent filter)
- FR-4: Epic 6B (Cross-platform auth — requires iOS)
- FR-14 (iOS), FR-15: Epic 6B (iOS share extension + file preservation)
- FR-48: Epic 6B (Deep linking)
- FR-61, FR-62, FR-63: Epic 6B (App store distribution + QA)
- FR-33, FR-34, FR-35: Epic 7 (Photo markers + lightbox)
- FR-43, FR-44: Epic 7 (Dynamic OG + dual CTA)
- FR-46, FR-47: Epic 7 (Native share + rich previews)
- FR-52, FR-53: Epic 8 (Onboarding + empty state)
- FR-54: Epic 8 (Landing page)
- FR-55, FR-56: Epic 8 (Error UX + Navionics guide)
- FR-7: Epic 9 (Language preference)
- FR-30, FR-31, FR-32: Epic 9 (Offline journal + sync)
- FR-64, FR-65: Epic 9 (i18n EN/FR)
- FR-8: Epic 10 (Admin access)
- FR-57, FR-58, FR-59, FR-60: Epic 10 (Admin zone)
- FR-68: Epic 10 (Trophy preview)

**Coverage: 68/68 FRs mapped (34 MVP + 34 v1.0)**

## Epic List

### Epic 5: Production Infrastructure & Legal
Bosco runs on production infrastructure with branded auth emails, RGPD compliance, monitoring, and daily backups. This is the foundation that enables all subsequent v1.0 work.
**FRs covered:** FR-3, FR-66, FR-67
**ARs covered:** AR-1, AR-11, AR-15, AR-16
**NFRs addressed:** NFR-27→32
**Priority:** Must-Have

### Epic 6A: Android App & Native Import
Capacitor project setup with Android build and GPX share target via intent filter. Validates the native wrapper approach before iOS.
**FRs covered:** FR-14 (Android only)
**ARs covered:** AR-2, AR-4, AR-6
**Stories:** 6.1, 6.2
**Priority:** Must-Have

### Epic 6B: iOS App, Store Distribution & Cross-Platform QA
iOS build, Share Extension, deep linking, cross-platform auth, app store submission, and QA across all platforms. Includes Story 8.2 (Native App Onboarding) moved from Epic 8.
**FRs covered:** FR-4, FR-14 (iOS), FR-15, FR-48, FR-53, FR-61, FR-62, FR-63
**ARs covered:** AR-3, AR-5, AR-17, AR-18
**UX-DRs covered:** UX-DR2, UX-DR3
**Stories:** 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 8.2
**Deferred:** Requires physical iPhone for testing. See sprint-change-proposal-2026-03-30.md
**Priority:** Must-Have

### Epic 7: Visual Storytelling — Photos, OG & Sharing
Photos appear as markers on the voyage map with clustering and lightbox. Shared links display dynamic OG images with the real route. Public pages include a dual CTA (create + re-share). Users share via native OS share sheet.
**FRs covered:** FR-33, FR-34, FR-35, FR-43, FR-44, FR-46, FR-47
**ARs covered:** AR-12, AR-13
**UX-DRs covered:** UX-DR10→14, UX-DR20, UX-DR21
**Priority:** Must-Have

### Epic 8: Landing Page & Onboarding
New sailors discover Bosco through a compelling landing page with live demo, complete onboarding without assistance, and get clear help when something goes wrong. Enhanced empty states guide first-time users.
**FRs covered:** FR-52, FR-54, FR-55, FR-56
**UX-DRs covered:** UX-DR1, UX-DR17, UX-DR18, UX-DR19
**Note:** Story 8.2 (Native App Onboarding, FR-53, UX-DR2) moved to Epic 6B
**Priority:** Must-Have

### Epic 9: Offline & Internationalization — Polish & Reach
Sailors can write journal entries at anchor without network (auto-sync on reconnect), and use Bosco in French or English with instant language switching.
**FRs covered:** FR-7, FR-30, FR-31, FR-32, FR-64, FR-65
**ARs covered:** AR-7→10
**UX-DRs covered:** UX-DR7→9
**NFRs addressed:** NFR-6, NFR-7, NFR-33→35
**Priority:** Should-Have

### Epic 10: Admin Zone & Dashboard Enhancements
Seb can monitor Bosco's health (users, voyages, errors, storage), manage users, and the dashboard shows richer voyage cards. Trophy "Coming Soon" teaser on public pages.
**FRs covered:** FR-8, FR-57, FR-58, FR-59, FR-60, FR-68
**ARs covered:** AR-14
**UX-DRs covered:** UX-DR4→6, UX-DR15, UX-DR16
**Priority:** Should-Have / Could-Have

---

## Epic 5: Production Infrastructure & Legal

Bosco runs on production infrastructure with branded auth emails, RGPD compliance, monitoring, and daily backups.

### Story 5.1: Supabase Pro Migration & Custom SMTP

As a sailor,
I want to receive auth emails from sailbosco.com,
So that I trust the service and emails don't land in spam.

**Acceptance Criteria:**

**Given** the project is on Supabase free tier
**When** migration to Supabase Pro is completed
**Then** daily automated backups are enabled and verified
**And** custom SMTP is configured with sender `noreply@sailbosco.com`
**And** magic link emails are delivered from the branded domain
**And** SPF, DKIM, and DMARC DNS records are configured on sailbosco.com

### Story 5.2: Database Schema Updates for v1.0

As a developer,
I want the database schema extended for v1.0 features,
So that admin, i18n, and user management capabilities are supported.

**Acceptance Criteria:**

**Given** the existing profiles table
**When** the migration runs
**Then** `is_admin BOOLEAN DEFAULT FALSE` column exists on profiles
**And** `preferred_language VARCHAR(5) DEFAULT 'en'` column exists on profiles
**And** `disabled_at TIMESTAMPTZ` column exists on profiles
**And** RLS policies are updated to account for new columns
**And** Supabase types are regenerated and valid

### Story 5.3: Production Monitoring & Observability

As an admin,
I want production errors tracked and uptime monitored,
So that I know immediately when something breaks.

**Acceptance Criteria:**

**Given** the production deployment on Vercel
**When** an unhandled exception occurs on the critical path
**Then** Sentry captures it with context (action name, user id, input summary)
**And** Sentry alerting is configured for critical errors
**And** uptime monitoring with alerting is operational for sailbosco.com
**And** structured logging is implemented on all Server Actions
**And** Vercel Analytics tracks Web Vitals

### Story 5.4: Privacy Policy & Terms of Service

As a user,
I want to read the privacy policy and terms of service,
So that I know how my data is handled.

**Acceptance Criteria:**

**Given** the landing page, app settings, and app store listings
**When** a user taps "Privacy Policy" or "Terms of Service"
**Then** the corresponding legal page is displayed at `/legal/privacy` and `/legal/terms`
**And** pages are accessible from the landing page footer
**And** pages are accessible from in-app settings
**And** content covers RGPD requirements (data collection, storage, rights, contact)

### Story 5.5: Account Deletion with Data Cascade

As a user,
I want to delete my account and all associated data,
So that I can exercise my RGPD right to erasure.

**Acceptance Criteria:**

**Given** an authenticated user on the profile settings page
**When** the user taps "Delete my account"
**Then** a confirmation dialog warns that all data will be permanently deleted
**And** upon confirmation, auth tokens are immediately invalidated
**And** all user data (profile, voyages, legs, stopovers, journal entries, photos, storage files) is deleted within 30 days
**And** the user is redirected to the landing page with a confirmation message

---

## Epic 6A: Android App & Native Import

> **Split from original Epic 6** — iOS stories deferred to Epic 6B (no iPhone for testing). See sprint-change-proposal-2026-03-30.md.

Capacitor project setup with Android build and GPX share target via intent filter.

### Story 6.1: Capacitor Project Setup & Android Build

As a developer,
I want the Capacitor project initialized with Android build working,
So that we have the native app foundation.

**Acceptance Criteria:**

**Given** the existing Next.js project
**When** Capacitor is initialized
**Then** `capacitor.config.ts` points to `https://www.sailbosco.com`
**And** `android/` directory is generated with valid Android project
**And** `npm run build && npx cap sync` completes without errors
**And** the Android app opens in an emulator and loads sailbosco.com
**And** `src/lib/platform.ts` exports `isNative` and `platform` detection
**And** `@capacitor/status-bar` and `@capacitor/splash-screen` are configured

### Story 6.2: Android GPX Share Target (Intent Filter)

As a sailor on Android,
I want to share a GPX file from Navionics directly to Bosco,
So that I can import tracks without manual file picking.

**Acceptance Criteria:**

**Given** the Android app is installed
**When** the user exports from Navionics and selects "Bosco" in the share sheet
**Then** the Bosco app opens and receives the GPX file
**And** the import preview screen shows with the received file pre-loaded
**And** the import flow completes identically to the file picker flow
**And** `application/gpx+xml` and `.gpx` file extensions are handled

---

## Epic 7: Visual Storytelling — Photos, OG & Sharing

Photos appear on the voyage map, shared links show dynamic previews, and visitors can re-share voyages.

### Story 7.1: Photo Markers on Map

As a visitor,
I want to see photo thumbnails on the voyage map at the locations where they were taken,
So that I can explore the voyage visually.

**Acceptance Criteria:**

**Given** a public voyage with journal entries that have photos linked to stopovers
**When** the visitor views the voyage map
**Then** circular photo thumbnails (32px, white border) appear at stopover locations
**And** photo markers are visually distinct from stopover markers (coral dots)
**And** markers appear on both public and creator voyage views
**And** markers have appropriate aria-labels

### Story 7.2: Photo Marker Clustering

As a visitor,
I want photo markers to cluster when zoomed out,
So that the map remains readable with many photos.

**Acceptance Criteria:**

**Given** a voyage with more than 15 photo markers visible at the current zoom level
**When** the visitor views the map
**Then** markers cluster into group markers showing a count badge
**And** zooming in progressively unclusters the markers
**And** tapping a cluster zooms into that area
**And** clustering uses leaflet.markercluster (or equivalent)

### Story 7.3: Photo Lightbox Viewer

As a visitor,
I want to tap a photo marker and see the photo full-screen,
So that I can appreciate the photos in detail.

**Acceptance Criteria:**

**Given** a voyage map with photo markers
**When** the visitor taps a photo marker
**Then** a full-viewport lightbox opens with navy/90 backdrop and backdrop-blur
**And** the photo is centered and scaled to fill the viewport with padding
**And** close button (X) is visible top-right, Escape key closes
**And** swipe left/right (or arrow keys) navigates between photos
**And** caption shows entry text excerpt, stopover name, and date
**And** focus is trapped within the lightbox while open

### Story 7.4: Dynamic OG Image Generation

As a user sharing a voyage link,
I want the shared link to display a beautiful preview image,
So that recipients are compelled to click.

**Acceptance Criteria:**

**Given** a public voyage
**When** a link is shared on WhatsApp, Facebook, Instagram, or other platforms
**Then** a dynamic OG image (1200x630px) is displayed showing the voyage route as an SVG path
**And** the image includes the voyage name, stats strip, and boat name
**And** the image is generated via `@vercel/og` on Vercel Edge
**And** generated images are cached for performance
**And** `opengraph-image.tsx` is implemented in `src/app/[username]/[slug]/`

### Story 7.5: Native Share & Share Button

As a sailor,
I want to share my voyage via the native OS share sheet,
So that sharing is fast and integrated with my device.

**Acceptance Criteria:**

**Given** an authenticated user on the voyage view or a visitor on the public page
**When** the user taps the share button
**Then** on native apps: the OS share sheet opens via `@capacitor/share` with URL + text
**And** on mobile web: the Web Share API is used (native share sheet)
**And** on desktop web: the link is copied to clipboard with "Link copied" toast
**And** the share button is a 44px touch target with share icon

### Story 7.6: Dual CTA on Public Pages

As a visiting sailor,
I want to see a call-to-action to create my own voyage on Bosco,
So that I can start using the product.

**Acceptance Criteria:**

**Given** a visitor on a public voyage page
**When** 10 seconds have elapsed since page load
**Then** a translucent bottom bar slides up with two CTAs
**And** left CTA: "Sail too? Create your own voyage" → links to app store or sign up
**And** right CTA: share icon → triggers share flow (Story 7.5)
**And** the bar is dismissible (X button), stays dismissed for the session
**And** the bar uses glass morphism matching the stats bar style

---

## Epic 8: Landing Page & Onboarding

New sailors discover Bosco through a compelling landing page and complete their first voyage without assistance.

### Story 8.1: Landing Page Redesign

As a visiting sailor,
I want to understand what Bosco does and be convinced to try it,
So that I download the app or sign up.

**Acceptance Criteria:**

**Given** a visitor navigating to sailbosco.com
**When** the landing page loads
**Then** a hero section shows the value proposition with an animated mini-demo on a live map
**And** app store badges (iOS + Android) are prominently displayed
**And** a "How it works" section shows the 3-step flow (Export → Import → Share)
**And** a live voyage showcase embeds a real public voyage visitors can interact with
**And** the page is fully responsive (stacks vertically on mobile)
**And** the page loads with FMP <2s on 4G

> **Story 8.2 (Native App Onboarding Flow) moved to Epic 6B** — requires native Capacitor app.

### Story 8.3: Enhanced Empty State with Demo Voyage

As a new user with no voyages,
I want to see what a completed voyage looks like,
So that I understand what I'm building toward.

**Acceptance Criteria:**

**Given** an authenticated user with zero voyages on the dashboard
**When** they view the dashboard
**Then** an animated mini-demo shows a track drawing on a small map
**And** a headline reads "Your first voyage awaits"
**And** 3 steps are shown: "1. Export from Navionics 2. Share to Bosco 3. Your voyage appears"
**And** a primary CTA "Create your first voyage" is prominent
**And** a secondary link "See an example" links to a real public voyage

### Story 8.4: Actionable Error Messages & Recovery UX

As a user encountering an error,
I want to understand what went wrong and how to fix it,
So that I can recover without frustration.

**Acceptance Criteria:**

**Given** an operation fails (import, upload, auth, network)
**When** the error is displayed to the user
**Then** the message states what happened in plain language (no jargon)
**And** the message explains why (context)
**And** the message provides a clear next step (actionable recovery)
**And** error messages follow the anatomy: what + why + what to do
**And** network errors offer "Retry" button and preserve user state

### Story 8.5: Navionics GPX Export Guide

As a user who selected the wrong file format,
I want to see how to export GPX from Navionics,
So that I can import my tracks successfully.

**Acceptance Criteria:**

**Given** a user attempts to import a non-GPX file
**When** the error message is displayed
**Then** a "Need help?" link is shown below the error
**And** tapping it opens an in-app drawer with 3-4 annotated screenshots of the Navionics export flow
**And** the guide is also accessible from the empty voyage state and landing page help section
**And** the guide content is clear enough for a non-technical sailor

---

## Epic 9: Offline & Internationalization — Polish & Reach

Sailors can write journal entries offline and use Bosco in French or English.

### Story 9.1: Offline Journal Entry Creation

As a sailor at anchor without network,
I want to write journal entries and attach photos,
So that I can document my voyage even without WiFi.

**Acceptance Criteria:**

**Given** the device has no network connection
**When** the user creates a journal entry with text and photos
**Then** the entry saves to IndexedDB in under 200ms
**And** the entry appears in the journal timeline with a "pending" cloud icon
**And** the UI is identical to online journal creation (no degraded experience)
**And** photos are queued locally for upload on reconnect

### Story 9.2: Offline Sync Engine & Indicator

As a sailor whose device regains network,
I want my offline entries to sync automatically,
So that I don't have to manually upload anything.

**Acceptance Criteria:**

**Given** pending journal entries and photos in IndexedDB
**When** network connectivity is restored
**Then** entries sync automatically within 30 seconds
**And** photos upload after their parent entries are synced
**And** a discreet SyncIndicator pill shows "N entries pending" in mist color
**And** during sync: the indicator shows "Syncing..." with subtle pulse
**And** on success: the indicator disappears and pending icons are removed
**And** on failure (after 3 retries): the indicator shows "Sync failed · Retry" in amber
**And** conflict resolution is last-write-wins (single user per voyage)

### Story 9.3: Service Worker Cache for Offline Browsing

As a sailor,
I want to browse my cached voyage data while offline,
So that I can review my voyage even without network.

**Acceptance Criteria:**

**Given** the user has previously loaded a voyage while online
**When** the device goes offline
**Then** the cached voyage data (map tiles, track, stopovers, stats) is available
**And** attempting an online-only action (GPX import, sign in) shows a contextual message
**And** no persistent "You are offline" banner is displayed
**And** Service Worker uses network-first for API, cache-first for static assets

### Story 9.4: i18n Setup with next-intl

As a developer,
I want the i18n infrastructure in place,
So that all UI strings can be served in English or French.

**Acceptance Criteria:**

**Given** the existing collocated `messages.ts` pattern
**When** next-intl is set up
**Then** `src/i18n/` contains request and routing configuration
**And** `src/messages/en.json` contains all English strings extracted from existing `messages.ts` files
**And** all components use `t('key')` instead of direct `messages.key` imports
**And** middleware resolves locale from `profile.preferred_language` or `Accept-Language` header
**And** all user-facing strings are externalized (no inline string literals)

### Story 9.5: French Translations & Language Switcher

As a French-speaking sailor,
I want to use Bosco in French,
So that the interface is in my native language.

**Acceptance Criteria:**

**Given** the i18n infrastructure from Story 9.4
**When** the user selects "Français" in the settings LanguageSwitcher
**Then** the UI switches to French in under 500ms without page reload
**And** `src/messages/fr.json` contains complete French translations
**And** the preference is persisted to `profiles.preferred_language`
**And** date, time, and number formatting adapts to locale via `Intl.DateTimeFormat`
**And** user-generated content (voyage names, journal entries) remains in original language

---

## Epic 10: Admin Zone & Dashboard Enhancements

Seb can monitor Bosco's health, manage users, and the dashboard shows richer information.

### Story 10.1: Admin Route & Authorization

As an admin,
I want the admin zone to be accessible only to authorized users,
So that regular users cannot access admin functions.

**Acceptance Criteria:**

**Given** a user navigates to `/admin`
**When** the middleware checks their profile
**Then** if `is_admin = true`: the admin dashboard loads
**And** if `is_admin = false` or unauthenticated: redirect to `/dashboard`
**And** all admin Server Actions verify `is_admin` before execution
**And** `src/lib/data/admin.ts` contains admin-specific query functions
**And** the admin tab is visible in navigation only for admin users

### Story 10.2: Admin Metrics Dashboard

As an admin,
I want to see key metrics at a glance,
So that I know how Bosco is performing.

**Acceptance Criteria:**

**Given** an admin on the `/admin` page
**When** the dashboard loads
**Then** metric cards show: total users, new this week, active voyages, total legs imported
**And** a storage usage progress bar shows used/quota
**And** metrics load from `src/lib/data/admin.ts` aggregate queries
**And** the dashboard works on mobile (stacked cards)

### Story 10.3: Admin User List & Management

As an admin,
I want to browse users and disable accounts if needed,
So that I can manage the user base.

**Acceptance Criteria:**

**Given** an admin on the users page
**When** the user list loads
**Then** a searchable list shows: username, email, voyages count, legs count, created date, last active
**And** each row has a "Disable" action button
**And** tapping "Disable" shows a confirmation dialog
**And** on confirmation: `disabled_at` is set on the profile, user is prevented from logging in
**And** on mobile: the list displays as scrollable cards instead of a table

### Story 10.4: Admin Error Monitoring & Storage

As an admin,
I want to see error trends and storage usage,
So that I can act before problems escalate.

**Acceptance Criteria:**

**Given** an admin on the admin dashboard
**When** they check the error monitoring section
**Then** a summary shows unhandled exceptions in last 24h and 7d
**And** alert thresholds are displayed: >5/day = red, 1-5 = amber, 0 = green
**And** a "View in Sentry" link opens the Sentry dashboard in a new tab
**And** storage usage shows used vs quota with percentage

### Story 10.5: Trophy "Coming Soon" Preview

As a visitor on a public voyage page,
I want to see a teaser for the Bosco Trophy,
So that I know a physical product is coming.

**Acceptance Criteria:**

**Given** a visitor on a public voyage page
**When** they scroll below the stats area (desktop) or see the section (mobile)
**Then** a sand-colored card shows "Bosco Trophy — Coming Soon"
**And** a brief description explains "A 3D-printed relief map of your voyage"
**And** an optional "Notify me" email input collects interest signals
**And** the section is subtle and informational, not pushy

### Story 10.6: Enhanced Dashboard Voyage Cards

As a user with voyages,
I want richer voyage cards on my dashboard,
So that I can see more information at a glance.

**Acceptance Criteria:**

**Given** an authenticated user on the dashboard
**When** their voyages are displayed
**Then** each card shows: cover image, voyage name, public/private badge, stats (nm, legs, ports)
**And** cards include a mini-map preview showing the track geometry
**And** cards show last import date: "Last track: 3 days ago"
**And** cards show journal count and country flags
**And** quick actions are available on hover/long-press: "View", "Import track", "Settings"

---

## Epic 6B: iOS App, Store Distribution & Cross-Platform QA

> **Deferred from original Epic 6** — requires physical iPhone for testing. See sprint-change-proposal-2026-03-30.md.
> Includes Story 8.2 (Native App Onboarding) moved from Epic 8.

iOS build, Share Extension, deep linking, cross-platform auth, app store submission, and QA across all platforms.

### Story 6.3: iOS Project Setup & Basic Build

As a developer,
I want the iOS Capacitor build working,
So that we can submit to the App Store.

**Acceptance Criteria:**

**Given** the Capacitor project
**When** `npx cap sync ios` runs
**Then** `ios/` directory contains a valid Xcode project
**And** the app builds in Xcode without errors
**And** the app runs in iOS Simulator and loads sailbosco.com
**And** status bar and splash screen are correctly styled

### Story 6.4: iOS Share Extension for GPX Import

As a sailor on iOS,
I want to share a GPX file from Navionics directly to Bosco,
So that I can import tracks without manual file picking on iPhone.

**Acceptance Criteria:**

**Given** the iOS app is installed
**When** the user exports from Navionics and selects "Bosco" in the iOS share sheet
**Then** the Share Extension activates with "Opening in Bosco..." indicator
**And** the GPX file is stored in the App Group shared container
**And** the main app opens and detects the pending import file
**And** the import preview screen shows with the received file pre-loaded
**And** the flow works for single and multiple GPX files

### Story 6.5: Deep Linking (Universal Links & App Links)

As a user,
I want tapping a sailbosco.com link to open in the native app when installed,
So that I get the native experience for shared voyage links.

**Acceptance Criteria:**

**Given** the native app is installed on the user's device
**When** the user taps a `sailbosco.com/Seb/goteborg-to-nice` link
**Then** the link opens in the Bosco app on the correct voyage page
**And** `public/.well-known/apple-app-site-association` is served correctly
**And** `public/.well-known/assetlinks.json` is served correctly
**And** if the app is NOT installed, the link opens in the web browser

### Story 6.6: Cross-Platform Auth & File Preservation

As a sailor,
I want to sign in on iOS, Android, or web with the same account,
So that my voyages are accessible everywhere.

**Acceptance Criteria:**

**Given** a user with an existing account
**When** they sign in via magic link on any platform (web, iOS, Android)
**Then** authentication succeeds and their voyages are accessible
**And** auth tokens are stored securely (Capacitor secure storage on native, httpOnly cookies on web)
**And** sessions persist across app relaunches until explicit logout
**And** if a GPX file was shared before authentication, the file is preserved and the import flow resumes after sign-in (FR-15)

### Story 6.7: App Store Submission & Listings

As a sailor,
I want to find and download Bosco on the App Store and Play Store,
So that I can install it on my device.

**Acceptance Criteria:**

**Given** the iOS and Android apps are built and tested
**When** submitted to the respective stores
**Then** Bosco is listed on the Apple App Store with screenshots, description, and privacy labels
**And** Bosco is listed on Google Play Store with screenshots, description, and data safety section
**And** store listings are optimized for keywords: "sailing", "voyage tracker", "GPS track", "logbook", "Navionics"
**And** age rating is set appropriately (4+ / Everyone)

### Story 6.8: Cross-Platform QA & Parity

As a sailor,
I want core flows to work identically on web, iOS, and Android,
So that I have a consistent experience regardless of platform.

**Acceptance Criteria:**

**Given** the app is deployed on all 3 platforms
**When** a user completes: sign up → create voyage → import GPX → view map → add journal → share
**Then** all steps complete successfully on web, iOS app, and Android app
**And** zero Sentry errors on the critical path across all platforms
**And** map interactions (zoom, pan, tap markers) work on all platforms
**And** native capabilities (share sheet, file picker) degrade gracefully on web

### Story 8.2: Native App Onboarding Flow

> Moved from Epic 8 — requires native Capacitor app to be functional.

As a new sailor who just installed Bosco,
I want to be guided to create my first voyage quickly,
So that I experience the core value immediately.

**Acceptance Criteria:**

**Given** a new user launching the app for the first time
**When** the app opens
**Then** a splash screen displays for max 1.5s
**And** if not authenticated: a condensed landing with "Sign in with email" is shown
**And** after authentication: profile setup (username + boat name) is presented
**And** after profile setup: "Create your first voyage" is prompted immediately
**And** the onboarding flow requires no more than 4 screens to reach the voyage map
