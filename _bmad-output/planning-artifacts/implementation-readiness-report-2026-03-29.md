# Implementation Readiness Assessment Report

**Date:** 2026-03-29
**Project:** bosco
**Scope:** V1.0 readiness — Epics 5+ (MVP Epics 1-4 completed)

---

## Document Inventory

| Document | File | Size | Modified |
|----------|------|------|----------|
| PRD | prd.md | 45,284 bytes | 2026-03-29 |
| Architecture | architecture.md | 67,891 bytes | 2026-03-29 |
| Epics & Stories | epics.md | 40,286 bytes | 2026-03-29 |
| UX Design | ux-design-specification.md | 70,217 bytes | 2026-03-29 |

**Issues:** None — no duplicates, no missing documents.

**stepsCompleted:** [step-01-document-discovery, step-02-prd-analysis, step-03-epic-coverage-validation, step-04-ux-alignment, step-05-epic-quality-review]

---

## PRD Analysis

### Functional Requirements (68 total)

#### Authentication & Identity (FR-1 to FR-4)
- **FR-1:** Users can sign up and sign in via email magic link
- **FR-2:** Users can remain signed in across browser restarts and app relaunches until explicit logout or session expiry
- **FR-3:** Users can receive auth emails from a branded domain sender (sailbosco.com)
- **FR-4:** Users can sign in on web, iOS app, and Android app with the same account

#### Sailor Profile (FR-5 to FR-8)
- **FR-5:** Users can set a unique username (used in public URLs)
- **FR-6:** Users can optionally add: boat name, boat type, bio, profile photo, boat photo
- **FR-7:** Users can set their preferred language (English or French)
- **FR-8:** Users with administrator privileges can access the admin zone

#### Voyage Management (FR-9 to FR-12)
- **FR-9:** Users can create, rename, and delete voyages
- **FR-10:** Users can set and modify voyage name, description, slug, cover image, and public/private visibility from voyage settings
- **FR-11:** Users can use a slug that is unique within their account
- **FR-12:** Users can manage more than one voyage

#### Track Import & Processing (FR-13 to FR-21)
- **FR-13:** Users can import GPX 1.1 files up to 400 MB via file picker on all platforms
- **FR-14:** Users can import GPX files directly from Navionics via the OS share sheet on both iOS and Android
- **FR-15:** Users can share a GPX file to Bosco without being authenticated and be redirected to sign in, then returned to the import flow with the file preserved
- **FR-16:** Users can preview track geometry, point count, distance, and duration before confirming import
- **FR-17:** Users can select which tracks to import from a multi-track file
- **FR-18:** Users can import selected tracks as separate legs or as a merged leg
- **FR-19:** Users can view imported tracks that preserve visible tacks and course changes at zoom level 14 after simplification
- **FR-20:** Users can view per-leg stats: distance (nm), duration, average speed (kts), max speed, timestamps
- **FR-21:** Users can delete individual legs from a voyage

#### Stopovers (FR-22 to FR-25)
- **FR-22:** Users can have stopovers auto-detected from leg endpoints within a configurable radius
- **FR-23:** Users can see human-readable place names and country codes automatically assigned to stopovers via reverse geocoding
- **FR-24:** Users can rename, reposition, delete, and merge stopovers
- **FR-25:** Users can browse stopovers grouped by country

#### Journal & Media (FR-26 to FR-32)
- **FR-26:** Users can create journal entries with free-form text and photo attachments
- **FR-27:** Users can link journal entries to a specific date, and optionally to a leg and/or stopover
- **FR-28:** Users can upload photos that are automatically compressed to under 1 MB before storage
- **FR-29:** Users can view journal entries as a timeline on the voyage page
- **FR-30:** Users can create and save journal entries while offline, with automatic sync on reconnect
- **FR-31:** Users can queue photo attachments while offline, with automatic upload on reconnect
- **FR-32:** Users can see a discreet indicator showing the number of entries pending synchronization

#### Geo-Tagged Media on Map (FR-33 to FR-35)
- **FR-33:** Users and visitors can see photos attached to journal entries as visual markers on the map at the associated stopover or leg location
- **FR-34:** Users and visitors can tap photo markers to view photos in a lightbox
- **FR-35:** Visitors can browse photos on the map with marker clustering when more than 15 markers are visible at the current zoom level

#### Public Voyage Page (FR-36 to FR-44)
- **FR-36:** Visitors can access a public voyage page at `/{username}/{voyage-slug}` when a voyage is public
- **FR-37:** Visitors can view the voyage on a full-screen map with nautical chart context
- **FR-38:** Visitors can watch the route animate on initial page load
- **FR-39:** Visitors can view stopovers as markers, tap them for details including photos
- **FR-40:** Visitors can view a stats bar (distance, days, ports, countries)
- **FR-41:** Visitors can browse stopovers by country via the ports panel
- **FR-42:** Visitors can read journal entries in a timeline
- **FR-43:** Visitors who share a voyage link can see a dynamic OG image showing the real voyage map and route
- **FR-44:** Visitors can see a CTA for sailors ("Create your own voyage on Bosco") and use a share button to re-share the voyage

#### Public Profile Page (FR-45)
- **FR-45:** Visitors can access a sailor profile at `/{username}` showing public information and public voyages

#### Social Sharing (FR-46 to FR-48)
- **FR-46:** Users can share a voyage link via the native OS share sheet (iOS and Android)
- **FR-47:** Users can share links that display a rich preview (dynamic OG image + title + stats) on WhatsApp, Facebook, Instagram, Messenger, and other platforms
- **FR-48:** Users can tap links from `sailbosco.com` that open in the native app when installed, or fall back to the web browser

#### Dashboard (FR-49 to FR-52)
- **FR-49:** Users can view all their voyages with preview cards and stats summary
- **FR-50:** Users can create a new voyage from the dashboard
- **FR-51:** Users can navigate to profile editing from the dashboard
- **FR-52:** Users with no voyages can see a demonstration of a completed voyage with a CTA to create their first

#### Onboarding (FR-53 to FR-54)
- **FR-53:** Users can be directed to create their first voyage immediately after completing profile setup
- **FR-54:** Visitors can understand what Bosco does from the landing page, view a demo voyage, and access app store links and sign up

#### Error Handling & Help (FR-55 to FR-56)
- **FR-55:** Users receive actionable error messages when an operation fails, stating what went wrong and how to recover
- **FR-56:** Users who attempt to import an unsupported file format see an explanation and a guide for exporting GPX from Navionics

#### Admin Zone (FR-57 to FR-60)
- **FR-57:** Admins can view total users, active voyages, total legs, and new registrations
- **FR-58:** Admins can browse a user list with per-user stats
- **FR-59:** Admins can disable a user account
- **FR-60:** Admins can view error monitoring digest and storage usage metrics

#### App Store Distribution (FR-61 to FR-63)
- **FR-61:** Users can download Bosco from the Apple App Store
- **FR-62:** Users can download Bosco from the Google Play Store
- **FR-63:** Users can complete core flows (sign up, import GPX, view map, add journal, share) identically on web, iOS, and Android

#### Internationalization (FR-64 to FR-65)
- **FR-64:** Users can use the UI in English and French
- **FR-65:** Users can switch language from in-app settings

#### Legal & Compliance (FR-66 to FR-67)
- **FR-66:** Users can access the privacy policy and terms of service from the landing page and in-app settings
- **FR-67:** Users can delete their account and all associated data

#### Trophy Preview (FR-68)
- **FR-68:** Visitors can see a "Coming Soon" section for the Bosco Trophy physical product on public voyage pages

### Non-Functional Requirements (35 total)

#### Performance (NFR-1 to NFR-7)
- **NFR-1:** FMP <2s on 4G for public pages
- **NFR-2:** 400 MB GPX import <60s, main thread <200ms input latency
- **NFR-3:** Map 60 fps on mid-range mobile (2022+)
- **NFR-4:** Map renders 100K points with <100ms interaction latency
- **NFR-5:** Native app cold start <3s
- **NFR-6:** Offline journal save <200ms
- **NFR-7:** Offline→online sync <30s after network restore

#### Security (NFR-8 to NFR-13)
- **NFR-8:** RLS + app-level auth — users access only own data
- **NFR-9:** Public access only for explicitly public voyages
- **NFR-10:** Upload validation: 10 MB images, 400 MB GPX
- **NFR-11:** Admin routes dual-protected (request + app level)
- **NFR-12:** HTTPS everywhere, secure token storage
- **NFR-13:** Account deletion cascades all data within 30 days (RGPD)

#### Mobile & Cross-Platform (NFR-14 to NFR-18)
- **NFR-14:** Mobile-first, usable from 375px
- **NFR-15:** Pinch zoom, pan, tap markers on iOS Safari, Android Chrome, Capacitor
- **NFR-16:** GPX import via file picker + share sheets (both platforms)
- **NFR-17:** Photo compression <1 MB before storage
- **NFR-18:** 44px minimum touch targets

#### Accessibility (NFR-19 to NFR-22)
- **NFR-19:** WCAG 2.1 AA conformance
- **NFR-20:** Keyboard accessible on desktop
- **NFR-21:** prefers-reduced-motion respected
- **NFR-22:** Aria-labels on map, stopovers, stats, journal

#### SEO & Social (NFR-23 to NFR-26)
- **NFR-23:** SSR for public pages (indexable HTML)
- **NFR-24:** Dynamic OG images per voyage (1200x630px)
- **NFR-25:** JSON-LD structured data on public pages
- **NFR-26:** Rich previews on WhatsApp, Facebook, Instagram, Messenger, Twitter/X

#### Reliability & Observability (NFR-27 to NFR-32)
- **NFR-27:** Zero unhandled exceptions on critical path (Sentry)
- **NFR-28:** Structured success/error responses from server
- **NFR-29:** Error tracking with context (op, user, input)
- **NFR-30:** Uptime monitoring + alerting for sailbosco.com
- **NFR-31:** Daily database backups on production tier
- **NFR-32:** Offline sync failures surfaced with retry — no silent data loss

#### Internationalization (NFR-33 to NFR-35)
- **NFR-33:** All strings externalized in message files
- **NFR-34:** Locale-aware date/time/number formatting
- **NFR-35:** Language switch <500ms without reload

### Additional Requirements & Constraints

- **RGPD/GDPR:** Privacy policy, Terms of Service, right to erasure with cascade, Supabase as GDPR-compliant processor, minimal cookies
- **App Store Compliance:** Apple ($99/yr) + Google ($25 one-time), privacy nutrition labels, data safety section, age rating 4+
- **Location Data:** GPS coordinates are personal data under GDPR, public exposure by explicit toggle, Nominatim rate limiting/attribution
- **Business Model:** Free product, revenue via 3D-printed trophies (109€, ~77% margin) — "Coming Soon" in v1.0
- **Timeline:** 4 weeks target, iOS Share Extension is priority over timeline

### PRD Completeness Assessment

Le PRD est **complet et bien structuré** avec :
- 68 Functional Requirements clairement numérotés et organisés en 18 domaines
- 35 Non-Functional Requirements couvrant performance, sécurité, mobile, accessibilité, SEO, fiabilité et i18n
- 7 User Journeys couvrant le parcours principal, la viralité, l'admin, la gestion d'erreur et la rétention
- Critères de succès mesurables (SC-1 à SC-5, BS-1 à BS-4, TS-1 à TS-5)
- Classification claire v1.0 Must-Have / Should-Have / Could-Have / Won't-Have
- Contraintes réglementaires (RGPD, App Store) documentées

---

## Epic Coverage Validation

### Coverage Matrix

#### MVP (Epics 1-4) — Already Implemented (34 FRs)

| FR | Description | Epic Coverage | Status |
|----|-------------|---------------|--------|
| FR-1 | Sign up/sign in via magic link | Epic 1 (Auth) | ✓ MVP |
| FR-2 | Persistent sessions | Epic 1 (Auth) | ✓ MVP |
| FR-5 | Unique username | Epic 1 (Profiles) | ✓ MVP |
| FR-6 | Optional profile fields | Epic 1 (Profiles) | ✓ MVP |
| FR-9 | Create/rename/delete voyages | Epic 2 (Voyages) | ✓ MVP |
| FR-10 | Voyage settings | Epic 2 (Voyages) | ✓ MVP |
| FR-11 | Unique slug per account | Epic 2 (Voyages) | ✓ MVP |
| FR-12 | Multiple voyages | Epic 2 (Voyages) | ✓ MVP |
| FR-13 | GPX import up to 400 MB | Epic 2 (GPX Import) | ✓ MVP |
| FR-16 | Import preview | Epic 2 (GPX Import) | ✓ MVP |
| FR-17 | Multi-track selection | Epic 2 (GPX Import) | ✓ MVP |
| FR-18 | Separate/merged leg import | Epic 2 (GPX Import) | ✓ MVP |
| FR-19 | Track fidelity at zoom 14 | Epic 2 (GPX Import) | ✓ MVP |
| FR-20 | Per-leg stats | Epic 2 (GPX Import) | ✓ MVP |
| FR-21 | Delete individual legs | Epic 2 (GPX Import) | ✓ MVP |
| FR-22 | Auto-detected stopovers | Epic 3 (Stopovers) | ✓ MVP |
| FR-23 | Reverse geocoded place names | Epic 3 (Stopovers) | ✓ MVP |
| FR-24 | Stopover management (rename, reposition, delete, merge) | Epic 3 (Stopovers) | ✓ MVP |
| FR-25 | Stopovers grouped by country | Epic 3 (Stopovers) | ✓ MVP |
| FR-26 | Journal entries with text + photos | Epic 4 (Journal) | ✓ MVP |
| FR-27 | Link entries to date/leg/stopover | Epic 4 (Journal) | ✓ MVP |
| FR-28 | Auto photo compression <1 MB | Epic 4 (Journal) | ✓ MVP |
| FR-29 | Journal timeline view | Epic 4 (Journal) | ✓ MVP |
| FR-36 | Public voyage page at /{username}/{slug} | Epic 3 (Public Pages) | ✓ MVP |
| FR-37 | Full-screen map with nautical chart | Epic 3 (Public Pages) | ✓ MVP |
| FR-38 | Route animation on page load | Epic 3 (Public Pages) | ✓ MVP |
| FR-39 | Stopover markers with details + photos | Epic 3 (Public Pages) | ✓ MVP |
| FR-40 | Stats bar | Epic 3 (Public Pages) | ✓ MVP |
| FR-41 | Ports panel by country | Epic 3 (Public Pages) | ✓ MVP |
| FR-42 | Journal timeline on public page | Epic 3 (Public Pages) | ✓ MVP |
| FR-45 | Public profile page | Epic 3 (Public Profile) | ✓ MVP |
| FR-49 | Dashboard with voyage cards | Epic 4 (Dashboard) | ✓ MVP |
| FR-50 | Create voyage from dashboard | Epic 4 (Dashboard) | ✓ MVP |
| FR-51 | Navigate to profile editing | Epic 4 (Dashboard) | ✓ MVP |

#### v1.0 (Epics 5-10) — New Work (34 FRs)

| FR | Description | Epic / Story | Status |
|----|-------------|-------------|--------|
| FR-3 | Branded auth emails (sailbosco.com) | Epic 5 / Story 5.1 | ✓ Covered |
| FR-66 | Privacy policy & terms accessible | Epic 5 / Story 5.4 | ✓ Covered |
| FR-67 | Account deletion with data cascade | Epic 5 / Story 5.5 | ✓ Covered |
| FR-4 | Cross-platform auth (web, iOS, Android) | Epic 6 / Story 6.6 | ✓ Covered |
| FR-14 | GPX import via OS share sheet (both platforms) | Epic 6 / Stories 6.2 + 6.4 | ✓ Covered |
| FR-15 | Share GPX before auth, preserve file | Epic 6 / Story 6.6 | ✓ Covered |
| FR-48 | Deep linking (Universal Links + App Links) | Epic 6 / Story 6.5 | ✓ Covered |
| FR-61 | Download from Apple App Store | Epic 6 / Story 6.7 | ✓ Covered |
| FR-62 | Download from Google Play Store | Epic 6 / Story 6.7 | ✓ Covered |
| FR-63 | Core flows identical on all platforms | Epic 6 / Story 6.8 | ✓ Covered |
| FR-33 | Photo markers on map | Epic 7 / Story 7.1 | ✓ Covered |
| FR-34 | Tap photo markers for lightbox | Epic 7 / Story 7.3 | ✓ Covered |
| FR-35 | Photo marker clustering (>15 visible) | Epic 7 / Story 7.2 | ✓ Covered |
| FR-43 | Dynamic OG image for shared links | Epic 7 / Story 7.4 | ✓ Covered |
| FR-44 | Dual CTA on public pages (create + re-share) | Epic 7 / Story 7.6 | ✓ Covered |
| FR-46 | Native OS share sheet for voyage links | Epic 7 / Story 7.5 | ✓ Covered |
| FR-47 | Rich preview on social platforms | Epic 7 / Story 7.4 | ✓ Covered |
| FR-52 | Demo voyage for empty state | Epic 8 / Story 8.3 | ✓ Covered |
| FR-53 | Onboarding directs to first voyage | Epic 8 / Story 8.2 | ✓ Covered |
| FR-54 | Landing page with demo + store links | Epic 8 / Story 8.1 | ✓ Covered |
| FR-55 | Actionable error messages | Epic 8 / Story 8.4 | ✓ Covered |
| FR-56 | Navionics GPX export guide on wrong format | Epic 8 / Story 8.5 | ✓ Covered |
| FR-7 | Set preferred language (EN/FR) | Epic 9 / Story 9.5 | ✓ Covered |
| FR-30 | Offline journal entry creation | Epic 9 / Story 9.1 | ✓ Covered |
| FR-31 | Offline photo queue with auto-upload | Epic 9 / Story 9.1 | ✓ Covered |
| FR-32 | Sync pending indicator | Epic 9 / Story 9.2 | ✓ Covered |
| FR-64 | UI in English and French | Epic 9 / Story 9.4 + 9.5 | ✓ Covered |
| FR-65 | Language switch from settings | Epic 9 / Story 9.5 | ✓ Covered |
| FR-8 | Admin access for admin users | Epic 10 / Story 10.1 | ✓ Covered |
| FR-57 | Admin metrics (users, voyages, legs, registrations) | Epic 10 / Story 10.2 | ✓ Covered |
| FR-58 | Admin user list with stats | Epic 10 / Story 10.3 | ✓ Covered |
| FR-59 | Admin disable user account | Epic 10 / Story 10.3 | ✓ Covered |
| FR-60 | Admin error monitoring + storage metrics | Epic 10 / Story 10.4 | ✓ Covered |
| FR-68 | Trophy "Coming Soon" on public pages | Epic 10 / Story 10.5 | ✓ Covered |

### Missing Requirements

**Aucun FR manquant.** Les 68 Functional Requirements du PRD sont tous tracés vers un epic et une story spécifique.

### Coverage Statistics

- **Total PRD FRs:** 68
- **FRs couverts dans les epics MVP (1-4):** 34
- **FRs couverts dans les epics v1.0 (5-10):** 34
- **Couverture totale:** 68/68 = **100%**

### Additional Coverage Notes

Le document d'epics couvre aussi :
- **18 Architecture Requirements (AR-1 to AR-18)** tracés vers les epics correspondantes
- **21 UX Design Requirements (UX-DR1 to UX-DR21)** tracés vers les stories
- **NFR coverage** assignée par epic (NFR-27→32 dans Epic 5, NFR-6/7/33→35 dans Epic 9)

---

## UX Alignment Assessment

### UX Document Status

**Found:** `ux-design-specification.md` (70,217 bytes, 1,382 lines) — comprehensive document covering MVP and v1.0 addendum.

### UX-DR Coverage (21/21)

All 21 UX Design Requirements (UX-DR1 to UX-DR21) referenced in epics are addressed in the UX spec.

| UX-DR | Requirement | Status |
|-------|-------------|--------|
| UX-DR1 | Landing page redesign | ✅ Covered |
| UX-DR2 | Native app first-launch onboarding | ✅ Covered |
| UX-DR3 | iOS Share Extension minimal UI | ⚠️ Minimal (7 lines) |
| UX-DR4 | Admin dashboard metrics | ✅ Covered |
| UX-DR5 | Admin user list | ✅ Covered |
| UX-DR6 | Admin error monitoring | ✅ Covered |
| UX-DR7 | SyncIndicator component | ✅ Covered |
| UX-DR8 | Offline journal creation | ✅ Covered |
| UX-DR9 | LanguageSwitcher | ✅ Covered |
| UX-DR10 | DualCTA on public pages | ✅ Covered |
| UX-DR11 | PhotoMarker | ✅ Covered |
| UX-DR12 | PhotoCluster | ✅ Covered |
| UX-DR13 | PhotoLightbox | ✅ Covered |
| UX-DR14 | ShareButton | ✅ Covered |
| UX-DR15 | TrophyPreview | ✅ Covered |
| UX-DR16 | Enhanced VoyageCard | ✅ Covered |
| UX-DR17 | Enhanced EmptyState | ✅ Covered |
| UX-DR18 | Error message anatomy | ✅ Covered |
| UX-DR19 | Navionics GPX export guide | ✅ Covered |
| UX-DR20 | Smart app banner on web | ✅ Covered |
| UX-DR21 | Dynamic OG image content | ✅ Covered |

### UX ↔ PRD Alignment

**Status: Mostly aligned (85% confidence)**

The UX spec explicitly references ~27 FRs and implicitly covers the remaining through journey flows and component specs. Core UX patterns map to all PRD functional areas.

**Minor gaps:**
- No formal FR-by-FR cross-reference table in the UX document (implicit coverage only)
- Account deletion UX (FR-67) — no journey or mockup for the deletion confirmation flow
- Admin UX (FR-57-60) — covered but less detailed than sailor-facing features

### UX ↔ Architecture Alignment

**Status: Well aligned (80% confidence)**

Core UX patterns map cleanly to the architecture. Performance targets supported. Key validated alignments:
- Map rendering (Leaflet, dynamic import, ssr:false) supports all map UX patterns
- Offline sync (IndexedDB, Service Worker, SyncIndicator) architecture matches UX
- Capacitor native shell supports share target, deep linking, status bar UX patterns
- SSR + dynamic OG image generation matches public page UX requirements
- Responsive design (375px breakpoints) aligns with mobile-first UX

### Alignment Issues

| # | Gap | Severity | Impact |
|---|-----|----------|--------|
| 1 | iOS Share Extension UI not mocked/detailed (UX-DR3) | MEDIUM | Feature is a Must-Have (FR-14), but UX has only 7 lines |
| 2 | Account deletion journey missing (FR-67) | MEDIUM | RGPD requirement needs confirmation flow, data retention messaging |
| 3 | Capacitor API failure patterns not defined | MEDIUM | What happens when share extension crashes, file picker fails, or GPS errors? |
| 4 | Offline sync conflict resolution undefined | MEDIUM | Journal edited offline AND online before sync — which wins? UX silent |
| 5 | Service Worker installation UX not addressed | LOW | Silent install acceptable, but worth documenting the decision |
| 6 | Admin dashboard refresh strategy not specified | LOW | Polling interval or manual refresh for metrics? |
| 7 | Dynamic OG image generation performance target absent | LOW | No response time defined for OG image endpoint |

### Warnings

1. **iOS Share Extension (MEDIUM):** The PRD marks native share sheet import as non-negotiable Must-Have, but the UX spec dedicates minimal attention to the Share Extension user experience. Recommend adding a mockup of the extension appearance in the iOS share sheet before development starts.

2. **Offline Sync (MEDIUM):** The SyncIndicator component is well-designed, but conflict resolution defaults to "last-write-wins" (stated in PRD) without showing this to the user. Since it's single-user-per-voyage in v1.0, this is acceptable but should be documented as a known limitation.

3. **Performance Validation (LOW):** Several ambitious performance targets (400MB GPX in 60s, Capacitor cold start <3s, 100K points at <100ms) have UX components designed for them but no validation data. These should be tested early in development, not at QA time.

### UX Alignment Verdict

The UX specification is **comprehensive and well-aligned** with both the PRD and Architecture. The v1.0 addendum covers all new features with component-level detail. The gaps identified are execution-level concerns (mockup detail, error edge cases) rather than fundamental misalignments. **No blockers found.**

---

## Epic Quality Review

### Epic Structure Validation

#### A. User Value Focus

| Epic | Title | User Value? | Assessment |
|------|-------|-------------|------------|
| 5 | Production Infrastructure & Legal | ⚠️ Mixed | Branded emails (FR-3) and legal pages (FR-66/67) are user-facing. But monitoring and DB schema are infrastructure. |
| 6 | App Store Distribution & Native Import | ✅ Yes | Sailors download from stores and import via share sheet. Clear user outcome. |
| 7 | Visual Storytelling — Photos, OG & Sharing | ✅ Yes | Photos on map, rich link previews, sharing. Strong user value. |
| 8 | Landing Page & Onboarding | ✅ Yes | New sailors discover and complete first voyage. Clear user value. |
| 9 | Offline & Internationalization | ✅ Yes | Journal offline + French language. Direct user benefit. |
| 10 | Admin Zone & Dashboard Enhancements | ⚠️ Mixed | Admin zone + dashboard cards + trophy preview — three distinct concerns bundled. |

#### B. Epic Independence Validation

| Epic | Dependencies | Independent? | Assessment |
|------|-------------|-------------|------------|
| 5 | MVP (Epics 1-4, done) | ✅ Yes | Foundation epic, no forward deps |
| 6 | Epic 5 (Supabase Pro needed for production) | ✅ Backward OK | Capacitor wraps production URL |
| 7 | Epics 4 (journal/photos MVP) + 6 (Capacitor for native share) | ✅ Backward OK | Story 7.5 has web fallback for share, graceful without Capacitor |
| 8 | Epic 6 (app store badges on landing) | ⚠️ Soft dep | Landing page references store links — can use placeholder URLs |
| 9 | Epic 5 (preferred_language column from 5.2) | ✅ Backward OK | Schema created before i18n stories |
| 10 | Epic 5 (is_admin column from 5.2) | ✅ Backward OK | Schema created before admin stories |

**No forward dependencies found. No circular dependencies.**

### Story Quality Assessment

#### 🔴 Critical Violations

**None found.** No epic is purely technical with zero user value. No forward dependencies break independence.

#### 🟠 Major Issues

**1. Story 5.2 — "Database Schema Updates for v1.0" — Upfront schema anti-pattern**

Story 5.2 creates `is_admin`, `preferred_language`, and `disabled_at` columns in a single migration, but these columns are consumed by Epics 9 and 10, not by Epic 5 itself.

- `is_admin` → first used in Epic 10, Story 10.1
- `preferred_language` → first used in Epic 9, Story 9.5
- `disabled_at` → first used in Epic 10, Story 10.3

This is the **"create all tables upfront"** anti-pattern. Best practice says each story should create the schema it needs.

**Mitigation:** In a brownfield project with existing production data, batching schema migrations reduces deployment risk. Running 3 separate ALTER TABLE migrations on a production table with active users has more failure surface than one. **This is a pragmatic brownfield decision, not a greenfield oversight.** Recommend documenting this trade-off in the story.

**2. Story 6.8 — "Cross-Platform QA & Parity" — QA story, not user story**

This is a testing/validation story, not a feature story. It doesn't deliver new functionality — it verifies that Epics 6.1-6.7 work correctly. In agile, QA is part of each story's Definition of Done, not a separate story.

**Recommendation:** Fold QA criteria into each story's ACs (6.1-6.7) rather than having a standalone QA story. If dedicated cross-platform testing is needed, treat it as a spike or QA phase, not a user story.

**3. Story 9.4 — "i18n Setup with next-intl" — Infrastructure refactoring story**

This story migrates from collocated `messages.ts` to `next-intl`. It doesn't deliver visible user value — the user sees English UI before and after. The value comes in Story 9.5 (French translations).

**Mitigation:** Acceptable as a necessary prerequisite within the same epic. Could be merged with Story 9.5 into a single "i18n: French language support" story.

#### 🟡 Minor Concerns

**4. Epic 10 — Mixed scope (3 distinct concerns)**

Epic 10 bundles admin zone (Stories 10.1-10.4), trophy preview (Story 10.5), and dashboard enhancements (Story 10.6). These serve different users:
- Admin zone → Seb as admin
- Trophy preview → visitors on public pages
- Dashboard cards → authenticated sailors

**Recommendation:** Acceptable given the Should-Have/Could-Have priority. These are smaller features that don't warrant individual epics. Document the mixed scope.

**5. Story 5.1 — AC format is task-oriented**

"When migration to Supabase Pro is completed" describes a task completion, not a testable behavior. Better: "Given a new user signs up, When they check their email, Then the magic link comes from noreply@sailbosco.com."

**6. Missing error scenario ACs in several stories**

Stories 7.1, 7.2, 8.1, 10.2 don't specify error/edge case behavior in their acceptance criteria:
- What if a voyage has 0 photos? (Story 7.1 — no markers, acceptable)
- What if OG image generation fails? (Story 7.4 — fallback not specified)
- What if admin metrics query times out? (Story 10.2 — loading state not specified)

### Dependency Analysis

#### Within-Epic Dependencies

| Epic | Internal Dependency Chain | Valid? |
|------|--------------------------|--------|
| 5 | 5.1 (Supabase Pro) → 5.2 (schema) → 5.3 (monitoring) → 5.4/5.5 (legal/deletion) | ✅ Sequential, logical |
| 6 | 6.1 (Capacitor setup) → 6.2 (Android share) + 6.3 (iOS setup) → 6.4 (iOS extension) → 6.5 (deep links) → 6.6 (cross-platform auth) → 6.7 (store submit) | ✅ Sequential, logical |
| 7 | 7.1 (markers) → 7.2 (clustering) → 7.3 (lightbox) → 7.4 (OG) → 7.5 (share) → 7.6 (dual CTA) | ✅ Logical, some parallelizable |
| 8 | 8.1 (landing) / 8.2 (onboarding) / 8.3 (empty state) → 8.4 (errors) → 8.5 (guide) | ✅ First three parallelizable |
| 9 | 9.1 (offline journal) → 9.2 (sync) → 9.3 (SW cache) → 9.4 (i18n setup) → 9.5 (FR translations) | ✅ Two tracks: offline (9.1-9.3) + i18n (9.4-9.5) |
| 10 | 10.1 (admin route) → 10.2 (metrics) → 10.3 (users) → 10.4 (errors) / 10.5 (trophy) / 10.6 (cards) | ✅ 10.1 first, rest parallelizable |

**No invalid within-epic dependencies.**

#### Database/Entity Creation Timing

- **Story 5.2** creates schema for Epics 9-10 (anti-pattern noted above, mitigated by brownfield context)
- All other stories create/modify schema as needed
- No other violations found

### Brownfield-Specific Checks

- ✅ Integration with existing MVP codebase explicitly addressed
- ✅ Migration story present (5.1 — Supabase free → Pro)
- ✅ Schema extension approach (ALTER TABLE, not recreate)
- ✅ Existing patterns respected (Server Actions, 3-tier containment, messages.ts)
- ✅ Backward compatibility maintained (MVP features continue working)

### Best Practices Compliance Checklist

| Check | E5 | E6 | E7 | E8 | E9 | E10 |
|-------|----|----|----|----|----|----|
| Delivers user value | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Functions independently | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Stories appropriately sized | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| No forward dependencies | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DB tables created when needed | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clear acceptance criteria | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FR traceability maintained | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Epic Quality Summary

| Severity | Count | Issues |
|----------|-------|--------|
| 🔴 Critical | 0 | — |
| 🟠 Major | 3 | Story 5.2 upfront schema, Story 6.8 QA-as-story, Story 9.4 infrastructure story |
| 🟡 Minor | 3 | Epic 10 mixed scope, Story 5.1 task-oriented ACs, missing error ACs |

**Overall Assessment:** The epic breakdown is **solid and well-structured** for a brownfield v1.0 extension. The 3 major issues are pragmatic trade-offs (brownfield schema batching, QA formalization, i18n infrastructure), not fundamental structural failures. FR traceability is excellent (68/68). No forward dependencies. No purely technical epics. **Recommended: proceed with noted adjustments.**

---

## Summary and Recommendations

### Overall Readiness Status

# ✅ READY — with minor adjustments recommended

The Bosco v1.0 planning artifacts are **implementation-ready**. All four required documents (PRD, Architecture, Epics, UX) are complete, aligned, and traceable. No critical blockers were found.

### Assessment Summary

| Dimension | Score | Verdict |
|-----------|-------|---------|
| **PRD Completeness** | 68 FRs + 35 NFRs | Complete — well-structured, measurable criteria |
| **FR Coverage** | 68/68 (100%) | Full coverage across 6 epics, 33 stories |
| **UX ↔ PRD Alignment** | 85% | Mostly aligned — minor gaps (account deletion UX, iOS Share Extension detail) |
| **UX ↔ Architecture Alignment** | 80% | Well aligned — gaps in offline sync patterns and Capacitor error handling |
| **UX-DR Coverage** | 21/21 (100%) | Complete — all design requirements addressed |
| **Epic Quality** | 0 critical, 3 major, 3 minor | Solid — major issues are pragmatic brownfield trade-offs |
| **Dependency Integrity** | No forward deps | Clean epic ordering |

### Issues Requiring Attention (by priority)

#### Before starting Epic 6:

1. **iOS Share Extension UX detail (MEDIUM)** — UX-DR3 has only 7 lines for a Must-Have feature. Add mockup of Share Extension appearance in iOS share sheet, error states, and multi-file handling UX before Story 6.4 development begins.

2. **Account deletion UX pattern (MEDIUM)** — FR-67 has acceptance criteria in Story 5.5 but no UX journey. Add confirmation dialog design, data retention messaging, and post-deletion redirect to UX spec before Story 5.5.

#### Before starting Epic 9:

3. **Offline sync conflict resolution (MEDIUM)** — PRD states "last-write-wins" but UX doesn't show what the user sees when this happens. Document: is the user notified? Does the overwritten version disappear silently? This matters for Story 9.2.

#### Adjustments to consider (non-blocking):

4. **Story 5.2 upfront schema** — Document the brownfield trade-off in the story: "Batching schema changes reduces migration risk on production data."

5. **Story 6.8 QA-as-story** — Consider folding cross-platform QA criteria into each story's ACs (6.1-6.7) instead of a standalone QA story. Or keep as a dedicated testing sprint, documented as such.

6. **Story 9.4 infrastructure** — Consider merging with Story 9.5 into "i18n: Full French language support" — the infra setup has no standalone user value.

7. **Missing error ACs** — Add error/edge case acceptance criteria to Stories 7.4 (OG generation failure fallback), 10.2 (metrics loading state), and 8.1 (landing page degradation on slow network).

### Recommended Implementation Sequence

The epic ordering (5 → 6 → 7 → 8 → 9 → 10) is correct and validated:

1. **Epic 5** (Production Infrastructure) — Foundation, must be first
2. **Epic 6** (App Store + Native Import) — Must-Have, enables core mobile flow
3. **Epic 7** (Visual Storytelling) — Must-Have, enables sharing loop
4. **Epic 8** (Landing + Onboarding) — Must-Have, enables autonomous user acquisition
5. **Epic 9** (Offline + i18n) — Should-Have, polish and reach
6. **Epic 10** (Admin + Dashboard) — Should-Have/Could-Have, monitoring and enhancements

**Parallelization opportunity:** Epics 7 and 8 have no inter-dependencies and could run in parallel after Epic 6.

### Final Note

This assessment identified **13 issues** across **3 categories** (UX alignment: 7, epic quality: 6). None are critical blockers. The 3 medium-priority items (iOS Share Extension UX, account deletion UX, offline conflict resolution) should be addressed before their respective stories begin, but do not block Epic 5 from starting immediately.

The planning documents demonstrate exceptional traceability: every FR maps to a story, every story maps to acceptance criteria, and every UX design requirement is addressed. This is a strong foundation for v1.0 development.

**Assessed by:** BMAD Implementation Readiness Workflow
**Date:** 2026-03-29
**stepsCompleted:** [step-01 through step-06, all complete]
