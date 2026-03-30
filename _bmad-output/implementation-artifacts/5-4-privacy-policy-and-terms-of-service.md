# Story 5.4: Privacy Policy & Terms of Service

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to read the privacy policy and terms of service,
so that I know how my data is handled.

## Acceptance Criteria

1. **Given** the landing page, app settings, and app store listings, **When** a user taps "Privacy Policy" or "Terms of Service", **Then** the corresponding legal page is displayed at `/legal/privacy` and `/legal/terms`
2. **Given** the landing page, **When** the footer is visible, **Then** both legal pages are accessible from the footer
3. **Given** an authenticated user in app settings, **When** they review account/settings options, **Then** both legal pages are accessible from in-app settings
4. **Given** either legal page is opened, **When** the content renders, **Then** it covers RGPD requirements including data collection, storage, user rights, and contact information

## Tasks / Subtasks

- [x] Task 1: Create first-party legal routes and shared rendering primitives (AC: #1, #4)
  - [x] Add public App Router routes at `src/app/legal/privacy/page.tsx` and `src/app/legal/terms/page.tsx`
  - [x] Add a shared legal page renderer such as `src/components/legal/LegalDocument.tsx` to keep layout, heading hierarchy, spacing, and cross-links consistent
  - [x] Store legal copy in a typed source module instead of hardcoding large JSX blocks inline, for example `src/app/legal/content.ts` or `src/lib/legal/content.ts`
  - [x] Keep both legal pages public, server-rendered, and dependency-free: no auth requirement, no database reads, no Server Actions, no client-only state
  - [x] Add static metadata for each route with canonical URLs using `siteUrl` from `src/lib/utils/site-url.ts`

- [ ] Task 2: Author compliant privacy and terms content without inventing business facts (AC: #1, #4)
  - [x] Privacy Policy must cover: developer/controller identity, privacy contact method, categories of collected data, purposes of processing, third-party processors/services, retention/deletion policy, user rights, security posture summary, and public-voyage consent model
  - [x] Privacy Policy must explicitly mention Bosco-specific personal data: auth email, profile fields, GPX tracks and coordinates, stopovers, journal entries, uploaded photos, auth/session data, and observability/analytics signals actually used in the app
  - [x] Privacy Policy must mention relevant third parties already present in the architecture and repo: Supabase, Vercel, Sentry, and Nominatim; include other processors only if confirmed in approved copy
  - [x] Terms of Service must cover at minimum: service scope, account responsibility, user content ownership/license boundaries, public sharing responsibility, acceptable use, third-party services dependency, service availability/disclaimer language, termination/account deletion reference, and contact/update mechanics
  - [x] Add an "Effective date" field to both documents
  - [ ] Do not invent missing legal facts such as company legal name, postal address, governing law, or privacy contact email; use explicit placeholders/TODOs during development if needed, but do not mark the story complete until approved values replace them

- [x] Task 3: Expose legal links from landing footer and in-app settings (AC: #2, #3)
  - [x] Add a reusable link group component such as `src/components/legal/LegalLinks.tsx` so footer and settings do not drift
  - [x] Update `src/app/page.tsx` footer to render links to `/legal/privacy` and `/legal/terms`
  - [x] Update `src/app/landing-messages.ts` type definitions and every locale entry required by that file so footer labels stay type-safe
  - [x] Add a "Legal" section to `src/app/dashboard/profile/page.tsx` below existing profile actions/sign-out, linking to both pages without changing auth or profile-save behavior
  - [x] Add any new copy keys required in `src/app/dashboard/profile/messages.ts`

- [x] Task 4: Handle app-store accessibility within real platform constraints (AC: #1)
  - [x] Ensure `/legal/privacy` is a stable public HTTPS URL suitable for App Store Connect and Google Play privacy policy fields
  - [x] Add a completion note for the manual store-metadata follow-up: set App Store Connect Privacy Policy URL and Google Play Privacy Policy URL to the production privacy page after deploy
  - [x] Treat direct app-store linking to Terms of Service as a platform constraint, not a code bug: Apple and Google expose a privacy policy field, but not a first-class terms field; therefore Terms must be directly available on web and in-app, and reachable from the privacy page/footer
  - [x] Add a prominent cross-link between the Privacy Policy and Terms page so store-listing users can reach both documents from the public web

- [x] Task 5: Validate accessibility, regression safety, and test coverage (AC: #1, #2, #3, #4)
  - [x] Add Vitest coverage for the legal link component and/or legal content source to verify both routes, visible labels, and required section presence
  - [x] Verify footer links remain keyboard accessible and meet 44px touch-target expectations from the UX spec
  - [x] Verify dashboard/profile page still renders `SharePendingRedirect`, `ProfileForm`, and `SignOutButton` unchanged except for the added legal section
  - [x] Run `npm run test`, `npm run typecheck`, and `npm run build`

## Dev Notes

### Story Intent

This story is not just "two static pages." It must establish Bosco's public legal surface in a way that:

- satisfies FR-66 and RGPD/GDPR-related PRD requirements
- gives app-store submission work a real production URL for privacy policy metadata
- keeps Terms of Service publicly reachable even though app-store listing UI does not provide a dedicated terms field
- avoids fabricated legal/business details

### Current State

- There is currently **no** `src/app/legal/` route in the repo
- The landing page footer in `src/app/page.tsx` only renders the Bosco wordmark and tagline
- The profile/settings page in `src/app/dashboard/profile/page.tsx` currently ends with a sign-out section only
- Middleware currently protects `/dashboard` and `/voyage` only, so `/legal/*` will remain public by default unless new protection is added incorrectly
- Epic 5.3 added observability tooling; this story must preserve existing Sentry/Vercel Analytics setup and not rework infrastructure

### Existing Code Patterns You Must Follow

**Routing and metadata**

- Public pages use App Router route files under `src/app/**/page.tsx`
- Static pages use `export const metadata: Metadata = { ... }` when metadata is not data-dependent
- Dynamic canonical/Open Graph patterns already exist in `src/app/[username]/page.tsx`; legal pages can use a simpler static metadata object but should still set `alternates.canonical`
- Use `siteUrl` from `src/lib/utils/site-url.ts` for canonical URLs instead of hardcoding production hostnames in multiple places

**Component organization**

- Shared UI primitives belong in `src/components/ui/`
- Feature-specific components already live in dedicated folders such as `src/components/landing/`, `src/components/log/`, and `src/components/map/`
- A new `src/components/legal/` folder is aligned with current project structure and is preferable to duplicating markup in each page

**Testing**

- The repo uses Vitest 4 with jsdom and `@testing-library/react`
- Collocated test files are the dominant pattern across the codebase
- Do not assume `tests/e2e/` is already populated in the repo; architecture mentions it, but the current workspace has no Playwright specs checked in

### Architecture Compliance

**Keep this story in the presentation/content layer.**

- No database migration
- No Supabase client imports
- No Server Action
- No API route
- No middleware change should be necessary

**Public rendering requirement**

- Legal pages must be available as normal public web pages for search engines, users without authentication, and app-store reviewers
- Do not implement legal content as a PDF, an external Google Doc, or an authenticated dashboard page
- Do not redirect legal routes through `/auth`

**Content source requirement**

- Keep legal content in a typed data structure and render it through a shared component
- This makes future updates safer and gives Story 9.x a place to add formal localization later without rewriting route structure

### RGPD / Privacy Content Requirements

The Privacy Policy must map to Bosco's actual product behavior documented in PRD and architecture:

- authentication via email magic link
- profile data stored on the account
- GPX tracks, route coordinates, stopovers, voyage metadata, journal text, and uploaded photos
- public/private voyage visibility chosen by the user
- reverse geocoding through Nominatim
- hosting/runtime on Vercel
- auth/database/storage through Supabase
- observability through Sentry and Web Vitals/analytics through Vercel Analytics

Do not claim additional tracking, advertising, or data-sharing practices that are not evidenced in the repo or approved legal copy.

### Terms of Service Content Requirements

The Terms page should reflect the current Bosco product shape:

- Bosco is a sailing voyage storytelling/logbook product
- users remain responsible for what they upload and what they make public
- public voyage sharing exposes route/location history by user choice
- Bosco depends on third-party infrastructure and map/data providers
- service availability is best-effort and can change
- account deletion is a supported privacy path, with product implementation landing in Story 5.5

Do not promise future features or legal guarantees that are not approved.

### Landing Footer Integration Notes

`src/app/page.tsx` is a client component using `landingMessages` from `src/app/landing-messages.ts`.

Important guardrail:

- `landingMessages.ts` currently defines many locale entries, not just English/French
- If you add `footer.privacy` / `footer.terms` keys to the type, you must update every locale object in that file or TypeScript will fail
- Keep this work scoped to link labels only; do not attempt to introduce `next-intl` here, because formal i18n architecture belongs to Epic 9

### In-App Settings Integration Notes

For this story, "in-app settings" should be satisfied by the authenticated profile/settings screen at `src/app/dashboard/profile/page.tsx`.

Guardrails:

- Preserve the current auth flow using `requireAuth()`
- Preserve `SharePendingRedirect`
- Do not mix legal-link UI into `ProfileForm`; keep it as a separate section on the page
- Do not convert the page to a client component just to add links

### Store Listing Constraint

Based on current Apple and Google platform policy documents, the app-store requirement is narrower than the epic wording suggests:

- both stores support a privacy policy URL in listing metadata
- neither store provides a first-class listing field for a dedicated Terms of Service URL

Implementation consequence:

- `/legal/privacy` must be production-ready and directly usable in store metadata
- `/legal/terms` must still exist and be reachable on the public website and inside the app
- add cross-links between privacy and terms so a user arriving from a store listing can reach both legal documents

This is an inference from the official store-policy source material and should be treated as a product/platform constraint, not an implementation failure.

### Accessibility and UX Requirements

- Use semantic heading structure with a single `<h1>` per page
- Ensure legal links are visible, keyboard focusable, and have clear text labels
- Footer links and settings links must respect 44px touch-target guidance from UX/NFRs
- Keep legal pages visually consistent with Bosco's typography/color system already used across public pages
- Do not bury the links behind accordions, drawers, or modals

### Testing Requirements

Minimum expected verification:

- component/render test verifying the legal link group renders both hrefs
- test verifying required privacy sections exist in the content source so future edits do not silently remove mandatory disclosures
- optional simple render test for the legal document page component
- full regression run:
  - `npm run test`
  - `npm run typecheck`
  - `npm run build`

### Previous Story Intelligence (5.3)

Useful carry-forward from Story 5.3:

- Root layout already includes Analytics and Speed Insights; do not disturb `src/app/layout.tsx`
- Recent work standardized on current Next.js 16 route/layout patterns rather than introducing extra wrappers
- Story 5.3 also revealed architecture drift: docs still mention `sentry.client.config.ts`, but the repo now uses `instrumentation-client.ts`

Practical takeaway:

- trust the live repo over older architecture examples when they differ
- for this story, avoid touching observability files unless a regression forces it

### Git Intelligence Summary

Recent commits:

- `05ae46e` (`5.3`) touched observability, action instrumentation, and build/runtime wiring
- `9a819f6` (`5.2`) touched profile/voyage data models and Supabase types

Implication for 5.4:

- the safest implementation surface is isolated UI/content work in `src/app/legal/`, `src/components/legal/`, landing footer copy, and profile page links
- do not broaden scope into data, auth, or infrastructure unless a concrete blocker appears

### Latest Technical Information

Latest official platform constraints relevant to this story:

- Apple App Review Guidelines require apps to provide a Privacy Policy link in App Store Connect metadata and make that policy easily accessible within the app; the policy must describe collected data, sharing, and retention/deletion behavior
- Google Play requires a privacy policy URL on the store listing and a privacy policy link or text within the app; the URL must be active, public, non-geofenced, non-editable, and not a PDF
- Google Play also requires the privacy policy to identify the developer/company or the app, disclose collected/shared data categories, security handling, and retention/deletion policy

Implementation consequence:

- host privacy content as a first-party public Next.js page
- do not use downloadable files or external editable docs
- ensure the privacy page title/body are clearly labeled as a privacy policy

### Project Structure Notes

Recommended files for this story:

- `src/app/legal/privacy/page.tsx`
- `src/app/legal/terms/page.tsx`
- `src/components/legal/LegalDocument.tsx`
- `src/components/legal/LegalLinks.tsx`
- `src/app/legal/content.ts` or `src/lib/legal/content.ts`
- `src/app/page.tsx`
- `src/app/landing-messages.ts`
- `src/app/dashboard/profile/page.tsx`
- `src/app/dashboard/profile/messages.ts`
- collocated tests for new legal components/content

Avoid these anti-patterns:

- hardcoding large legal copy directly inside JSX route files
- duplicating footer/settings link markup
- introducing `next-intl` early
- inventing legal entity/contact/governing-law details
- making the legal pages private or client-only

### Required Inputs / Open Questions

The repo does **not** currently reveal the following facts, so implementation must obtain or explicitly placeholder them before completion:

1. Legal entity/developer name that should appear in the Privacy Policy and match store listing metadata
2. Privacy contact email or contact mechanism
3. Postal/business address, if required by the approved legal copy
4. Governing law / jurisdiction for Terms of Service
5. Effective date chosen for the first publication
6. Final approved list of processors/subprocessors to name explicitly

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.4: Privacy Policy & Terms of Service]
- [Source: _bmad-output/planning-artifacts/prd.md#RGPD / GDPR Compliance]
- [Source: _bmad-output/planning-artifacts/prd.md#App Store Compliance]
- [Source: _bmad-output/planning-artifacts/architecture.md#Updated FR → Structure Mapping (v1.0 additions)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Footer]
- [Source: src/app/page.tsx]
- [Source: src/app/landing-messages.ts]
- [Source: src/app/dashboard/profile/page.tsx]
- [Source: src/app/dashboard/profile/messages.ts]
- [Source: src/middleware.ts]
- [Source: src/lib/utils/site-url.ts]
- [Source: https://developer.apple.com/appstore/resources/approval/guidelines.html]
- [Source: https://support.google.com/googleplay/android-developer/answer/9888076]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Implementation Plan

- Create a typed legal-content source in `src/lib/legal/content.ts` and render both documents through a shared `LegalDocument` component.
- Keep the routes public and static with canonical metadata derived from `siteUrl`.
- Reuse a single `LegalLinks` component in the public legal pages, the landing footer, and the authenticated profile/settings page.
- Add focused Vitest coverage for legal content, legal routes, landing-page footer links, and the profile-page legal section before running the full regression suite.

### Debug Log References

- Create-story workflow executed on 2026-03-30
- Added failing tests for legal routes, content, landing footer links, and profile-page legal links before implementing the feature
- `npx vitest run src/components/legal/LegalLinks.test.tsx src/app/legal/legal-pages.test.tsx src/lib/legal/content.test.ts`
- `npx vitest run src/app/page.test.tsx src/app/dashboard/profile/page.test.tsx`
- `npm run test`
- `npm run build`
- `npm run typecheck` (rerun after `build` refreshed Next route validator output)

### Completion Notes List

- Story created from Epic 5.4 with current repo validation and platform-policy guardrails
- App-store listing constraint on Terms of Service documented explicitly to prevent false implementation expectations
- Missing controller/contact metadata called out as required inputs rather than invented
- Implemented public `/legal/privacy` and `/legal/terms` App Router pages with static canonical metadata, typed legal content, and a shared legal-document renderer
- Added a reusable `LegalLinks` component and surfaced it in the landing footer, legal pages, and the authenticated profile/settings page without changing auth or profile-save behavior
- Added regression coverage for legal content, legal routes, landing footer links, and the profile settings legal section; full suite passed (`npm run test`, `npm run build`, `npm run typecheck`)
- Manual store-metadata follow-up after deploy: set the App Store Connect Privacy Policy URL and the Google Play Privacy Policy URL to the production `/legal/privacy` page
- Story remains in-progress because approved publication values are still missing for controller identity, privacy contact, governing law/jurisdiction, and the initial effective date

### File List

- `_bmad-output/implementation-artifacts/5-4-privacy-policy-and-terms-of-service.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/dashboard/profile/messages.ts`
- `src/app/dashboard/profile/page.test.tsx`
- `src/app/dashboard/profile/page.tsx`
- `src/app/legal/legal-pages.test.tsx`
- `src/app/legal/privacy/page.tsx`
- `src/app/legal/terms/page.tsx`
- `src/app/landing-messages.ts`
- `src/app/page.test.tsx`
- `src/app/page.tsx`
- `src/components/legal/LegalDocument.tsx`
- `src/components/legal/LegalLinks.test.tsx`
- `src/components/legal/LegalLinks.tsx`
- `src/lib/legal/content.test.ts`
- `src/lib/legal/content.ts`

### Change Log

- 2026-03-30: Added Bosco legal routes, shared legal rendering/link primitives, landing/profile legal entry points, and Vitest coverage; left story in-progress pending approved legal publication values
