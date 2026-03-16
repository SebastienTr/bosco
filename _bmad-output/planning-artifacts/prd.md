---
workflowType: 'prd'
workflow: 'edit'
classification:
  domain: 'maritime-recreation'
  projectType: 'web-application'
  complexity: 'moderate'
inputDocuments:
  - 'PRD.md (legacy)'
stepsCompleted:
  - 'step-e-01-discovery'
  - 'step-e-01b-legacy-conversion'
  - 'step-e-02-review'
  - 'step-e-03-edit'
lastEdited: '2026-03-15'
editHistory:
  - date: '2026-03-15'
    changes: 'Full restructuring from legacy format to BMAD standard. Extracted technical content to architecture-notes.md.'
---

# Bosco — Product Requirements Document

## Executive Summary

**Bosco** (the bosun — maître d'équipage) is a digital logbook for recreational sailors. Sailors import GPS tracks from Navionics or any GPX source, build a visual journey over time, and share it through a public page.

**Core Differentiator:** Bosco shows the exact sailing track — every tack, every course change, every mile — not just waypoints on a map. The squiggly line beating upwind tells a story that pins never will.

**Target Users:** Recreational sailors (plaisanciers) who use Navionics for navigation, sail regularly or are on extended voyages, and want to document and share their journey with friends, family, or fellow sailors.

**Usage Context:** Mobile-first. Track import and log entries happen at port with network access. No offline requirement for MVP.

**Platform:** Web application (responsive, mobile-first).

## Success Criteria

| # | Criterion | Metric | Target | Measurement |
|---|-----------|--------|--------|-------------|
| SC-1 | Creator adoption | Seb actively uses Bosco for real voyage data | ≥ 10 GPX tracks imported within first month of deployment | Usage logs |
| SC-2 | Viewer comprehension | Visitors understand the journey from the public page without explanation | 5+ external users navigate and browse a shared voyage without assistance | User feedback |
| SC-3 | Import reliability | GPX import handles all valid Navionics exports | 100% success rate for valid GPX 1.1 files, single and multi-track, up to 400 MB | Manual testing with real exports |
| SC-4 | Track fidelity | Simplified tracks preserve sailing detail | Tacks and course changes visible at zoom level 14 after simplification | Visual comparison with original track |
| SC-5 | Data integrity | No data loss during normal usage | Zero data loss incidents over 3 months of active use | Monitoring |

## Product Scope

### MVP

- User authentication via email magic link
- User profile (username, boat name, bio, photos)
- Voyage CRUD (create, rename, delete, public/private toggle)
- GPX import with track parsing, simplification, and preview
- Single and multi-track support with merge option
- Automatic stopover detection and location naming
- Stopover management (rename, reposition, delete, merge)
- Log entries with text and photo attachments
- Public voyage page with animated route, stopovers, stats, log timeline
- Public profile page listing public voyages
- Private dashboard
- Public pages optimized for search indexing and rich link previews
- English UI

### Growth

- Structured log entry fields (weather conditions, sails used, crew, mood)
- Weather widget on public voyage page
- Internationalization (French UI, unit toggle km/mph)
- Dedicated domain (replacing subdomain)
- Voyage destination with distance remaining

### Vision

- Offline support for track import
- Social features (follow sailors, comments on voyages)
- Multi-crew collaboration on a shared voyage
- Integration with other navigation apps beyond Navionics
- Automatic photo geotagging from track timestamps

### Out of Scope

- Offline track import and editing in MVP
- Social interactions such as comments and follows in MVP
- Multi-crew collaboration in MVP
- Native mobile applications
- Direct integrations with navigation apps beyond GPX import in MVP

## Browser Matrix

**Supported Browsers for MVP**

- Safari on iOS: latest 2 major versions
- Safari on macOS: latest 2 major versions
- Chrome on Android: latest 2 major versions
- Chrome on desktop: latest 2 major versions
- Firefox on desktop: latest 2 major versions
- Edge on desktop: latest 2 major versions

**Not Supported**

- Internet Explorer
- Browser versions older than the supported matrix above

## Accessibility Level

- Bosco targets WCAG 2.1 AA conformance for public and authenticated pages.
- All core user flows are keyboard accessible on desktop devices.
- Non-text content includes text alternatives where applicable.
- Text and interactive controls meet WCAG 2.1 AA contrast requirements.
- Validation errors and status messages are programmatically discernible.

## User Journeys

### UJ-1: Onboarding

**Persona:** New sailor discovering Bosco
**Goal:** Create an account and set up profile
**Flow:**

1. Land on homepage → see pitch, examples of shared voyages
2. Sign up with email → receive magic link → authenticated
3. Create profile: username (required), boat name, photo (optional)
4. Redirected to dashboard

**Related FRs:** FR-1 (Authentication), FR-2 (User Profile)

### UJ-2: Create a Voyage

**Persona:** Authenticated sailor starting a new journey
**Goal:** Set up a new voyage to track
**Flow:**

1. From dashboard → "New voyage"
2. Enter name (e.g., "Göteborg → Nice"), optional description
3. Voyage created, redirected to voyage page (empty map)

**Related FRs:** FR-3 (Voyages)

### UJ-3: Import a GPX Track

**Persona:** Sailor returning to port after a day of sailing
**Goal:** Add today's track to the voyage
**Flow:**

1. From voyage page → "Import track"
2. Select GPX file from device
3. See preview: map with tracks, stats (distance, duration, points)
4. If multiple tracks: select which to import, optionally merge into a single leg
5. Confirm import
6. Voyage page updates with new leg(s) on the map, stopovers auto-detected

**Related FRs:** FR-4 (GPX Import), FR-5 (Stopovers)

### UJ-4: Write a Log Entry

**Persona:** Sailor documenting the day's experience
**Goal:** Add a journal entry with text and photos
**Flow:**

1. From voyage page → "Add log entry"
2. Write text, optionally attach photos
3. Attach to a date, optionally a leg and/or stopover
4. Entry appears on the voyage timeline

**Related FRs:** FR-6 (Log Entries)

### UJ-5: Share a Voyage

**Persona:** Sailor wanting to share the journey
**Goal:** Make the voyage publicly accessible
**Flow:**

1. From voyage page → toggle "Public"
2. Get shareable URL: `bosco.sebastientreille.fr/{username}/{voyage-slug}`
3. Share link with friends and family

**Related FRs:** FR-3 (Voyages), FR-7 (Public Voyage Page)

### UJ-6: Browse as a Visitor

**Persona:** Friend or family member receiving a shared link
**Goal:** Explore the sailor's journey
**Flow:**

1. Open shared link
2. See animated route drawing on the map
3. Browse stopovers, stats (distance, days, ports, countries)
4. Read log entries and view photos
5. Read-only, no interaction required

**Related FRs:** FR-7 (Public Voyage Page), FR-8 (Public Profile Page)

### UJ-7: Resume an Existing Voyage

**Persona:** Returning sailor reopening Bosco after previous imports
**Goal:** Confirm that voyage history remains intact and continue using it
**Flow:**

1. Sign in and open dashboard
2. Select an existing voyage
3. See previously imported legs, stopovers, and log entries
4. Continue editing or sharing from the saved voyage state

**Related FRs:** FR-3 (Voyages), FR-4 (GPX Import), FR-6 (Log Entries), FR-9 (Dashboard)

## Functional Requirements

### FR-1: Authentication

- Users can sign up and sign in via email magic link
- Users remain signed in across browser restarts until explicit logout or session expiry
- Users can access Bosco without a social login option in MVP

### FR-2: User Profile

- Users can set a unique username (used in public URLs)
- Users can optionally add: boat name, boat type, bio, profile photo, boat photo
- Visitors can access a public profile page at `/{username}` listing that sailor's public voyages

### FR-3: Voyages

- Users can create, rename, and delete voyages
- Users can set voyage name, description, slug, cover image, and public/private visibility
- Users can use a slug that is unique within their account
- Users can view all of their voyages with a preview card and stats summary in the dashboard
- Users can manage more than one voyage

### FR-4: GPX Import & Track Processing

- Users can import standard GPX 1.1 files (single or multi-track)
- Users can import files up to 400 MB
- Before confirming import, users can preview track geometry, point count, distance, and duration for each detected track
- Users can select which tracks to import from a multi-track file
- Users can import selected tracks as separate legs or as a merged leg
- Imported tracks preserve visible tacks and course changes at zoom level 14
- Users can view per-leg stats: distance (nm), duration, average speed (kts), max speed, start/end timestamps
- Users can delete individual legs from a voyage

### FR-5: Stopovers

- The system associates an imported leg with an existing stopover when its start or end point falls within a configurable radius (default 2 km)
- The system creates a new stopover with a human-readable place name and country when no existing stopover matches
- Users can rename, reposition, delete, and merge stopovers
- Users can configure the stopover detection radius
- Users can view stopovers as waypoint markers on the map
- Users can browse stopovers grouped by country

### FR-6: Log Entries

- Users can create journal entries with free-form text and photo attachments
- Each entry has a user-specified date and belongs to a voyage
- Users can optionally link an entry to a specific leg and/or stopover
- Uploaded photos are reduced to a web-friendly size before storage
- Users can view entries in a timeline on the voyage page

### FR-7: Public Voyage Page

- Visitors can access a public voyage page at `/{username}/{voyage-slug}` when a voyage is public
- Visitors can view the voyage on a full-screen map with nautical chart context
- Visitors can watch completed tracks animate on initial page load
- Visitors can view stopovers as waypoint markers and the latest known boat position
- Visitors can view a stats bar showing distance sailed (nm), days, ports of call count, and countries count
- Visitors can browse a stopovers list grouped by country and move the map to a selected stopover
- Visitors can read log entries in a timeline associated with the voyage
- Visitors can identify the voyage name, boat name, and sailor username from the page header
- Visitors can share links that preserve a specific public voyage map view

### FR-8: Public Profile Page

- Visitors can access a sailor profile page at `/{username}`
- Visitors can view username, boat info, bio, and photos
- Visitors can browse public voyages as cards with cover image, name, and stats summary

### FR-9: Dashboard

- Users can view all voyages they own, including public and private voyages, from the dashboard
- Users can view summary stats for each voyage from the dashboard
- Users can create a new voyage from the dashboard
- Users can navigate to profile editing from the dashboard

## Non-Functional Requirements

### Performance

- NFR-1: Public voyage pages render first meaningful paint in under 2 seconds on a 4G mobile connection, as measured by Lighthouse mobile runs on production-equivalent builds
- NFR-2: Importing a valid 400 MB GPX file completes within 60 seconds while preserving user input responsiveness below 200 ms, as measured in manual tests on target mobile hardware
- NFR-3: Map interactions maintain 60 fps on mid-range mobile devices (2022+), as measured during pan and zoom profiling
- NFR-4: Map renders simplified tracks with up to 100,000 points with interaction latency below 100 ms, as measured in browser performance profiling

### Security

- NFR-5: Authenticated users can read and modify only their own private data, as verified by authorization tests on all protected resources
- NFR-6: Unauthenticated visitors can access only voyages explicitly marked public, as verified by access-control tests
- NFR-7: Image uploads validated by type and size (max 10 MB per image)
- NFR-8: Public and authenticated pages block common reflected and stored XSS payloads, as verified by automated security tests and manual penetration checks

### Mobile

- NFR-9: Mobile-first responsive design — all features usable on screens 375px and wider
- NFR-10: Primary map interactions support pinch zoom, pan, and tap markers on iOS Safari and Android Chrome, as verified by manual mobile QA
- NFR-11: GPX import works from mobile file picker and OS share sheet
- NFR-12: Uploaded photos are reduced to under 1 MB before permanent storage

### SEO

- NFR-13: Public voyage pages return complete, indexable HTML in the first response, as verified by HTML fetch tests
- NFR-14: Open Graph meta tags are present on all public pages for rich link previews, as verified by social preview validators
- NFR-15: Structured data is present on public voyage pages and passes schema validation

### Internationalization

- NFR-16: MVP ships with English UI
- NFR-17: All user-facing strings externalized for future translation
- NFR-18: MVP displays distance in nautical miles and speed in knots across all user-facing pages, and future unit support must not require re-importing voyage data
