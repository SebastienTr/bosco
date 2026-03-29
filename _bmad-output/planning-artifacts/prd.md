---
stepsCompleted:
  - 'step-01-init'
  - 'step-02-discovery'
  - 'step-02b-vision'
  - 'step-02c-executive-summary'
  - 'step-03-success'
  - 'step-04-journeys'
  - 'step-05-domain'
  - 'step-06-innovation'
  - 'step-07-project-type'
  - 'step-08-scoping'
  - 'step-09-functional'
  - 'step-10-nonfunctional'
  - 'step-11-polish'
  - 'step-12-complete'
classification:
  projectType: 'web-application + native-wrapper'
  domain: 'maritime-recreation'
  complexity: 'moderate-high'
  projectContext: 'brownfield'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md (MVP baseline)'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/architecture-notes.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/planning-artifacts/research/market-sailing-logbook-voyage-sharing-research-2026-03-18.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-03-26-1400.md'
documentCounts:
  briefs: 0
  research: 1
  brainstorming: 1
  projectDocs: 5
workflowType: 'prd'
workflow: 'create'
project_name: 'bosco'
user_name: 'Seb'
date: '2026-03-29'
---

# Product Requirements Document - Bosco

**Author:** Seb
**Date:** 2026-03-29

## Executive Summary

**Bosco** (the bosun — maître d'équipage) is a voyage storytelling platform for recreational sailors. Sailors import GPS tracks from Navionics, build a visual voyage on an interactive nautical map, and share it as a public page — like a blog, but the map is the content.

**Core differentiator:** Bosco preserves the exact sailing track — every tack, every course change, every mile — not just waypoints. The squiggly line beating upwind tells a story that pins on a map never will. Combined with geo-tagged photos, automatic stopover detection, and animated route playback on nautical charts, Bosco transforms raw GPX data into a shareable voyage narrative in under 2 minutes.

**v1.0 context:** The MVP (4 epics, fully deployed) validates the core product: authentication, profiles, GPX import with Web Worker processing, automatic stopovers with reverse geocoding, journal entries with photos, public pages with animated routes, and SEO optimization. The v1.0 release transitions Bosco from a working prototype to a **production-grade product available on app stores**, with a seamless end-to-end flow that any sailor can complete without assistance: download → sign up → create voyage → import tracks → add photos → share.

**Target users:** Recreational sailors who use Navionics for navigation. Primary segment: long-distance cruisers on multi-month voyages. Secondary: weekend/coastal sailors documenting their season. Audience: friends, family, and fellow sailors who receive shared voyage links.

**Platform:** Responsive web application (Next.js 16, React 19) with native app wrappers for iOS App Store and Google Play Store via Capacitor. Mobile-first design, PWA with Web Share Target on Android.

**Business model:** Free for all features. Revenue through physical 3D-printed voyage trophies (109€, ~77% gross margin) — ordered directly from the voyage page. Trophy pipeline is "Coming Soon" in v1.0 with preview and waitlist.

**Competitive positioning:** PolarSteps (18M users) dominates travel sharing but cannot track at sea on iOS and shows only waypoints. NoForeignLand serves the cruiser community but has dated UX and no storytelling. Bosco occupies the vacant intersection of **maritime-specific** and **immersive visual storytelling** — the "PolarSteps for sailing" with complete track fidelity.

### What Makes This Special

1. **The map IS the story.** Where blogs require writing and reading, Bosco lets the voyage tell itself through the track, the stopovers, and the media anchored to locations. A visitor zooms into Kiel and sees the photo of the nuclear submarine. No scrolling, no albums — the geography organizes the narrative.

2. **Complete track fidelity.** Every tack, every close-hauled beat is visible at zoom level 14. This is the emotional core — the squiggly line IS the sailing. No competitor preserves this level of detail after simplification.

3. **Two-minute import-to-share.** Export from Navionics → add to Bosco → tracks appear with auto-detected stopovers and stats → toggle public → share. The flow is the product. If it's fluid, everything else follows.

4. **Physical trophy bridge.** A QR code on a 3D-printed relief map links to the digital voyage page. The physical object becomes a portal to the interactive experience. No competitor offers anything similar in the maritime space.

## Project Classification

| Dimension | Value |
|-----------|-------|
| **Project type** | Web application + native wrapper (Capacitor) |
| **Domain** | Maritime recreation / Travel tech |
| **Complexity** | Moderate-high |
| **Project context** | Brownfield — MVP complete (4 epics, deployed on Vercel, Supabase free tier) |
| **v1.0 scope** | Production infrastructure, app store distribution, enhanced storytelling, UX polish, social foundations, admin zone |

## Success Criteria

### User Success

| # | Criterion | Metric | Target | Measurement |
|---|-----------|--------|--------|-------------|
| SC-1 | External user adoption | Active sailors (not Seb) who complete at least one voyage with imported tracks | 100 users within 3 months of store launch | Analytics + database query |
| SC-2 | End-to-end flow completion | New user completes download → sign up → create voyage → import track → view on map without encountering an error | Zero errors on critical path | Sentry error tracking + session monitoring |
| SC-3 | Share rate | Percentage of users with at least one public voyage who share a link (social, messaging, or copy URL) | 30% of active users share at least once | Analytics events on share actions |
| SC-4 | Visitor engagement | Non-authenticated visitors interact with a shared public voyage page (zoom, tap stopover, browse stats) | Average session >60 seconds on public pages | Vercel Analytics |
| SC-5 | Import reliability | GPX import handles all valid Navionics exports across web and native apps | 100% success rate for valid GPX 1.1 files | Sentry + manual QA |

### Business Success

| # | Criterion | Metric | Target | Measurement |
|---|-----------|--------|--------|-------------|
| BS-1 | Store availability | Bosco listed and downloadable on App Store and Play Store | Live within 4 weeks of development start | Store listing verification |
| BS-2 | Infrastructure cost | Monthly operational cost for Supabase Pro + domain + ancillary services | ≤ $50/month at 100 active users | Billing dashboard |
| BS-3 | Trophy signal | "Coming Soon" trophy section visible on public voyage pages | Present and functional | Visual QA |
| BS-4 | Organic discovery | Users finding Bosco through store search, SEO, or shared links (not Seb personally inviting them) | At least 20% of the 100 users are organic by month 3 | Attribution tracking |

### Technical Success

| # | Criterion | Metric | Target | Measurement |
|---|-----------|--------|--------|-------------|
| TS-1 | Zero errors on critical flow | No unhandled exceptions on: sign up, voyage creation, GPX import, photo upload, public page rendering, sharing | 0 Sentry errors on critical path in production | Sentry alerting |
| TS-2 | Monitoring & observability | Production logs accessible, errors tracked, uptime monitored | Sentry + structured logging + uptime alerting operational | Infrastructure verification |
| TS-3 | Cross-platform parity | Core features work identically on web, iOS app, and Android app | All critical flows pass QA on all 3 platforms | Manual QA checklist |
| TS-4 | Performance baseline | Public pages load fast, map interactions smooth | FMP <2s on 4G, 60fps map on mid-range devices (unchanged from MVP) | Lighthouse + manual profiling |
| TS-5 | Data safety | No data loss, daily backups, RGPD compliance | Zero data loss incidents, backup strategy documented, privacy policy published | Supabase Pro backups + legal review |

### Measurable Outcomes

The v1.0 is a success if: **100 sailors other than Seb** use Bosco within 3 months, **30% share** their voyage publicly, and the critical flow from download to share operates with **zero errors**. The product runs on production infrastructure at **≤$50/month** and is available on **both app stores**.

## Product Scope & Phased Development

### MVP Strategy

**Approach: Experience MVP** — The goal is not to validate whether sailors want a logbook (validated by the existing MVP). The goal is to validate that the **complete flow works for users other than Seb**, with sufficient quality to generate word-of-mouth at marinas.

**Resource model:** Seb supervises, unlimited AI agents develop. Target: 4 weeks, but iOS Share Extension is critical and takes priority over timeline.

**MVP litmus test:** Can a sailor met at port download → sign up → import from Navionics → share — autonomously, without help from Seb? If yes, it's a success.

### v1.0 Feature Set — Prioritized

**Must-Have (product fails without this):**
- Supabase Pro + custom SMTP (reliable auth emails)
- Capacitor apps on both stores with share target: **iOS (Share Extension) AND Android (Intent filter)** — Navionics → Bosco import is the core flow, non-negotiable on either platform
- Onboarding flow zero bugs (sign up → profile → first voyage → first import)
- Dynamic OG images for social sharing
- Landing page redesign (conversion-focused)
- Zero Sentry errors on critical path
- Geo-tagged photos on map (photo markers at stopovers/legs)
- RGPD compliance (privacy policy, CGU)

**Should-Have (product is worse without this):**
- Dashboard redesign (richer voyage cards, better empty states)
- i18n French + English
- Offline journal drafts (simple, sync on reconnect)
- Admin zone (lightweight — user list, metrics, Sentry digest)
- Deep linking (Universal Links + App Links)
- Custom email branding (SMTP with domain sender)
- Monitoring: Sentry alerting, structured logging, uptime checks

**Could-Have (improves but can wait for v1.1):**
- Short video support (<2 min)
- Trophy "Coming Soon" section on public pages
- Dual CTA on public pages (create + re-share)
- Enhanced public page layout (storytelling-first)

**Won't-Have (explicitly excluded from v1.0):**
- Social features (follow, discover)
- Trophy ordering pipeline
- Weather overlay
- Multi-crew collaboration
- Generated share card images (Story format)

**Timeline:** 4 weeks target, but not at the expense of the iOS Share Extension. If it overflows, that's OK — better to launch with the critical feature than fast without it.

### Phase 2 — v1.1 (1-2 months after launch)

- Social foundations (follow sailors, discover voyages)
- Video support in journal entries
- Stats & achievements (total NM, countries, badges)
- Share card image generation (Instagram Story format)
- Trophy "Coming Soon" with preview
- Embeddable voyage widget (for blogs/websites)

### Phase 3 — v2.0 (6+ months)

- Full social network for sailors (groups, chat, tips, anchorage reviews)
- Trophy ordering pipeline (3D preview, payment, fulfillment)
- Historical weather overlay on routes
- Multi-crew collaboration
- Import from PolarSteps and other sources
- Full offline mode with sync
- Multi-language (German, Italian, Spanish)
- Partnership program (charter companies, sailing associations)
- Real-time voyage tracking (live position sharing)
- AI-generated voyage summaries

### Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| iOS Share Extension complexity | High | Medium | Start iOS dev early. File picker as temp dev fallback. Seb acquiring iPhone. |
| App Store rejection (WebView) | High | Low | Native capabilities (share target, deep linking) provide genuine native value. Submit early. |
| No organic adoption | High | Medium | Seb seeds at port. Dynamic OG amplifies word-of-mouth. SEO brings organic traffic. |
| 4 weeks insufficient | High | Medium | Must-Have first. Should-Have next. Could-Have deferred. iOS Share Extension is the only item that can extend timeline. |
| No iPhone for testing | Medium | High | Acquire test device before store submission. Use TestFlight with beta testers. |
| Offline sync edge cases | Medium | Medium | Simple scope (journal drafts only). Last-write-wins. No conflicts (single user). |
| PolarSteps adds maritime features | Medium | Low | Technical moat (track fidelity). Nautical specialization (OpenSeaMap, NM, stopovers). |

## User Journeys

### UJ-1: First Voyage via App Store — Mads & Line

**Persona:** Mads (38) and Line (35), Danish couple on their Hallberg-Rassy 40, en route from Copenhagen for a world tour. Currently in Cherbourg. Mads uses Navionics daily. Line manages their sailing Instagram (@sv_freya). They heard about Bosco from another sailor at the marina.

**Opening Scene:** Mads searches "sailing voyage tracker" on the Play Store while having coffee in the cockpit. He finds Bosco, reads "Share your exact sailing track — like a blog, but on a map." He downloads it.

**Rising Action:**
1. Opens the app → clean landing screen with a demo voyage animation → "Start with your email"
2. Enters email → receives magic link → authenticated in 30 seconds
3. Creates profile: username `sv-freya`, boat name "Freya" → instantly has a public URL
4. Creates voyage: "Copenhagen → World" → an inviting empty state shows a quick animation of what a completed voyage looks like, with a prominent "Import your first track" CTA — Mads understands what he's building toward
5. Taps "Import track" → selects a GPX file exported from Navionics → processing indicator → preview shows his track from Copenhagen to Kiel with stats
6. Confirms → track appears on nautical chart, stopovers auto-detected: Copenhagen, Kiel, Brunsbüttel, Cuxhaven
7. Adds a photo of the Kiel Canal locks to the Kiel stopover

**Climax:** Mads toggles the voyage to "Public", taps Share, selects WhatsApp. His family in Denmark receives a rich preview card — a dynamically generated OG image showing the real map with the real route and voyage title. His mother taps it and watches the track draw itself on the map. She zooms into Kiel and sees the photo of the locks. She texts back: "This is incredible, I can see exactly where you went!"

**Resolution:** Over the next weeks, Mads imports each new leg after arriving at port. The voyage grows. Line shares the public link on their Instagram — the dynamic OG preview drives clicks. The couple now has a living, visual record of their world tour that their families follow.

**Requirements revealed:** App store listing, native onboarding flow, engaging empty state with demo/preview, GPX import on mobile, auto-stopover detection, photo attachment to stopovers, dynamic OG image generation, social sharing with rich preview, public page with animated route.

### UJ-2: Geo-Tagged Photo Storytelling — Seb

**Persona:** Seb (dev, 18 years experience), sailing his Laurin Koster 28 "Laurine" from Göteborg to Nice. Power user of Bosco — he built it. His voyage has 40+ legs imported.

**Opening Scene:** Seb is at a marina bar in Kiel, showing his Bosco voyage to a Swedish sailor he just met. He wants to show the photo of the nuclear submarine he spotted near the naval base.

**Rising Action:**
1. Opens his voyage → full map with all tracks from Göteborg to current position
2. Zooms into the Kiel area → sees photo markers clustered around the stopover
3. Taps the Kiel stopover → StopoverSheet opens showing port name, dates, duration
4. Photo thumbnails appear below — taps the submarine photo → full-screen lightbox
5. The Swedish sailor says "That's amazing, how do I get this?"

**Climax:** Seb shares the public link. The Swedish sailor opens it on his phone, zooms into a section he knows — the Skagerrak — and sees Seb's tacks beating into the wind. He says: "I can see exactly the wind you had that day." The track tells the story without a single word written.

**Resolution:** The Swedish sailor downloads Bosco from the store that evening. One more user through word-of-mouth at the marina — the most powerful acquisition channel for sailors.

**Requirements revealed:** Photo markers on map, photo attachment to stopovers/legs, lightbox viewer, public page with interactive geo-tagged media, viral word-of-mouth conversion.

### UJ-3: Visitor Becomes Amplifier — Emma

**Persona:** Emma (29), Mads' sister in Copenhagen. Not a sailor. Received the WhatsApp link from Mads.

**Opening Scene:** Emma taps the shared link during her lunch break. A full-screen nautical map loads with an animated route drawing from Copenhagen southward.

**Rising Action:**
1. Watches the animation complete — sees the full route from Copenhagen to Cherbourg
2. Zooms into familiar waters near Copenhagen — recognizes the harbor
3. Taps a stopover marker at Kiel → sees port name, dates ("3 nights"), photos of the canal
4. Scrolls down on desktop → journal entries appear alongside the map, telling the story
5. Browses the stats bar: 847 nm, 14 ports, 5 countries
6. Sees two CTAs at the bottom of the page:
   - "Sail too? **Create your own voyage** on Bosco" (for sailors)
   - "**Share this voyage**" with a share button (for everyone)

**Climax:** Emma taps "Share this voyage" and posts the link on her Facebook with the comment: "My brother is sailing around the world — look at this!" The dynamic OG preview shows the map with the route. Three friends click through. One of them, a weekend sailor, taps "Create your own voyage" and downloads Bosco.

**Resolution:** The viral loop works in two ways: sailors convert to users, non-sailors amplify reach through re-sharing. Emma never creates an account, but she drove 3 visitors and 1 new user. The re-share button is as important as the sign-up CTA.

**Requirements revealed:** Dual CTA on public pages (create + re-share), OG optimization for Facebook/WhatsApp, engaging public page for non-sailors, viral loop with re-sharing path, dynamic OG images.

### UJ-4: Social Media Sharing — Line

**Persona:** Line (35), Mads' partner. Manages their sailing Instagram (@sv_freya, 2.4K followers). Wants to share their latest leg.

**Opening Scene:** They just arrived in Brest after a 2-day passage from Cherbourg. Mads imported the track. Line wants to post about it.

**Rising Action:**
1. Opens Bosco → navigates to the voyage → sees the new leg on the map
2. Taps "Share" → native share sheet appears (Capacitor)
3. Copies the public voyage link
4. Opens Instagram → creates a Story with the link sticker pointing to the Bosco URL
5. Instagram automatically fetches the dynamic OG image showing the real map with the highlighted route as the link preview

**Climax:** Her followers tap the link sticker → land on the Bosco public page → watch the animated route. 12 people visit the page. Two DM her: "What app is this?"

**Resolution:** The v1.0 sharing flow is link-based with optimized OG previews. No custom image generation needed — the dynamic OG image does the heavy lifting. A future v1.1 could add a dedicated "Generate share card" feature with Instagram Story-optimized format (9:16), but the link + dynamic OG is sufficient and shippable in 4 weeks.

**Requirements revealed:** Native share sheet (Capacitor `@capacitor/share`), dynamic OG image generation (`opengraph-image.tsx`), link-based sharing flow, optimized OG dimensions for social platforms.

**v1.1 future:** Generated share card images in Story format (9:16), direct Instagram Story sharing with image.

### UJ-5: Admin Monitoring — Seb (Admin)

**Persona:** Seb as product owner/admin. Wants to monitor Bosco's health and user activity without SSH-ing into anything.

**Opening Scene:** Seb checks the admin zone from his phone between two tacks (the boat is on autopilot, the wind is steady).

**Rising Action:**
1. Navigates to `/admin` → middleware checks `is_admin` flag on profiles table → access granted
2. Dashboard shows: total users (47), new this week (5), active voyages (31), total legs imported (284)
3. Checks the user list → sees the Danish couple signed up yesterday, already imported 8 tracks
4. Reviews Sentry digest → zero critical errors this week
5. Checks storage usage → 12GB of 100GB used on Supabase

**Climax:** Everything is green. No fires. Seb goes back to sailing.

**Resolution:** The admin zone gives Seb confidence that the product is healthy without requiring technical access. Simple, read-mostly, with just enough controls to act if needed (disable a user, check error rates, monitor infrastructure costs). The `is_admin` flag is stored in the profiles table — not in env vars — so a future co-admin can be added via a simple database update.

**Requirements revealed:** Admin route with `is_admin` column on profiles, middleware + Server Action protection, user list with stats, high-level metrics dashboard, Sentry integration, storage/infrastructure monitoring, mobile-friendly admin UI, future-proof for additional admins.

### UJ-6: Error Recovery — James

**Persona:** James (52), English sailor heading to Portugal. Not very tech-savvy. Heard about Bosco from Seb at a marina.

**Opening Scene:** James downloads Bosco from the App Store, creates an account. He tries to import a GPX file but selects the wrong file — a KML from Google Earth.

**Rising Action:**
1. Selects the KML file → import starts → processing fails
2. A clear, friendly error message appears: "This file isn't a GPX format. Bosco works with GPX files exported from Navionics. Need help?"
3. James taps "Need help?" → concise guide: how to export GPX from Navionics (3 screenshots)
4. Follows the guide → exports correct GPX → imports successfully
5. Track appears on the map → James sees his route from Southampton to Brest

**Climax:** James texts Seb: "It works! I can see my whole route." Despite the initial hiccup, the error recovery was clear enough that James solved it himself.

**Resolution:** The error was not a dead end — it was an educational moment. James is now a confident user who will import regularly.

**Requirements revealed:** Clear error messages on invalid file types, contextual help/guide for GPX export, graceful error handling, friendly tone in error states.

### UJ-7: The Returning Sailor — Mads (2 Weeks Later)

**Persona:** Mads again. It's been 2 weeks since he set up Bosco. He's now in Brest after stops in several ports along the way. He has 3 new GPX files to import.

**Opening Scene:** Mads opens the Bosco app on his phone. He hasn't used it in 5 days.

**Rising Action:**
1. App opens → his voyage "Copenhagen → World" is immediately visible (last active voyage, no navigation needed)
2. Taps "Import track" → selects first GPX file → preview → confirms → new leg appears on the map, connecting to the previous track
3. Repeats for the 2 remaining files → each new leg auto-connects, new stopovers detected and named
4. Adds a few photos to the Brest stopover
5. The stats bar updates live: distance grows, port count increases, a new country flag appears

**Climax:** Mads zooms out and sees his complete route from Copenhagen to Brest — 14 legs, 12 stopovers, 5 countries. The voyage is taking shape. He feels pride looking at the cumulative path he's sailed.

**Resolution:** The returning flow is frictionless: open → import → done. No re-authentication hassle, no "where was I?", no configuration. The app remembers context and gets out of the way. This is the moment that builds the import habit — the loop that turns a first-time user into a loyal one.

**Requirements revealed:** Persistent session (no re-auth on app reopen), last active voyage quick access, multi-file sequential import, auto-connection of new legs to existing stopovers, live stats update, progressive voyage building UX.

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---------|--------------------------|
| UJ-1 App Store Discovery | Store listing, native onboarding, engaging empty state, full import-to-share flow, dynamic OG images |
| UJ-2 Photo Storytelling | Photo markers on map, geo-tagged media, lightbox viewer |
| UJ-3 Visitor → Amplifier | Dual CTA (create + re-share), OG optimization, viral loop |
| UJ-4 Social Sharing | Native share sheet (Capacitor), dynamic OG image, link-based sharing |
| UJ-5 Admin Monitoring | `is_admin` on profiles, admin dashboard, user management, metrics |
| UJ-6 Error Recovery | Clear error messages, contextual help, graceful degradation |
| UJ-7 Returning Sailor | Persistent session, last voyage quick access, progressive building, retention UX |

**Coverage:**
- Primary user — success path (UJ-1, UJ-2, UJ-7)
- Viral/growth path (UJ-3, UJ-4)
- Admin/operations (UJ-5)
- Error recovery (UJ-6)
- Retention loop (UJ-7)
- 5 distinct personas across 7 journeys

## Domain-Specific Requirements

### RGPD / GDPR Compliance

- Privacy policy and Terms of Service published and accessible from landing page, app stores, and in-app settings
- GPS tracks and location data are personal data under GDPR — stored only with user consent (account creation = implicit consent for private data, public toggle = explicit consent for public exposure)
- Right to erasure: users can delete their account and all associated data (voyages, legs, stopovers, log entries, photos). Deletion must cascade completely within 30 days
- Data processing agreement: Supabase (data processor) is GDPR-compliant with EU data residency options
- Cookie consent: minimal cookies (auth session only for MVP), no third-party tracking cookies. Vercel Analytics is privacy-first (no cookies). Sentry uses functional cookies (exempt from consent in most interpretations)
- No data sold or shared with third parties

### App Store Compliance

- **Apple App Store:** Developer account ($99/year), Human Interface Guidelines compliance, App Review process. Capacitor WebView apps are accepted if they provide sufficient native value (share target, push notifications future). Privacy nutrition labels required
- **Google Play Store:** Developer account ($25 one-time), Play Store policies compliance. WebView apps accepted. Data safety section required
- Both stores require age rating (likely 4+ / Everyone — no user-generated mature content expected)
- Store listings: screenshots, description, keywords optimized for "sailing", "voyage", "GPS track", "logbook"

### Location Data Handling

- GPS coordinates in stored tracks are personal data. Private voyages are protected by RLS — only the owner can access
- Public voyages expose location data by explicit user choice (toggle). This constitutes freely given, specific consent under GDPR
- Reverse geocoding via Nominatim: coordinates sent to external service. Nominatim usage policy respected (rate limiting, attribution). No personal identifiers sent — only coordinates
- No real-time tracking in v1.0 — all location data is historical (imported GPX files)

## Innovation & Novel Patterns

### Detected Innovation Areas

1. **Map-as-blog paradigm.** Content organized by geography instead of chronology. The map IS the narrative — visitors explore a voyage by zooming and tapping locations, not by scrolling a feed. This is a novel interaction model for voyage storytelling that no maritime competitor implements.

2. **Physical-digital trophy bridge.** A 3D-printed relief map of the voyage with a QR code linking to the interactive digital page. Combines custom manufacturing (Bambu A1 Combo with AMS multi-color), automated GPX→STL pipeline, and emotional value pricing (109€). No competitor in maritime; validated by PolarSteps' travel book revenue ($10M) in the adjacent travel space.

3. **GPX-to-shareable-page pipeline.** End-to-end automation: import GPX → client-side Douglas-Peucker simplification (1M+ points, stack-based) → auto stopover detection → reverse geocoding → animated public page with nautical charts. No single competitor combines all these steps in one frictionless flow.

4. **Track fidelity as technical moat.** Iterative Douglas-Peucker preserves tacks and course changes at zoom level 14 while reducing file size by 95%+. This is the emotional core — the squiggly line beating upwind tells a story that simplified waypoints never will. Difficult to replicate without deep understanding of sailing track characteristics.

### Market Context

- PolarSteps validates the "memories as product" model at scale (18M users, profitable)
- NoForeignLand validates the sailing community need but with utilitarian execution
- No competitor combines maritime specificity + visual storytelling + physical product
- The innovations are execution and combination innovations — each component is proven, the assembly is novel

### Validation Approach

- **Map-as-blog:** Validated by MVP prototype engagement and Seb's real-world usage. Further validated by showing public pages to non-sailor visitors at marina
- **Trophy:** Brainstorming session validated pricing and production feasibility. Market gap confirmed by research (no maritime competitor). First validation = "Coming Soon" interest signal
- **Pipeline:** Validated by 4 completed MVP epics with real Navionics data. Performance validated with 400MB files
- **Track fidelity:** Validated by visual comparison tests — tacks visible at zoom 14 after simplification

### Risk Mitigation

- **Low risk overall** — these are combination innovations, not technological bets. Each component uses proven technology (Leaflet, Douglas-Peucker, Supabase, Next.js, 3D printing)
- **Trophy risk:** Production capacity limited to ~40/month. Mitigated by "Coming Soon" approach — validate demand before building the ordering pipeline
- **Capacitor/store risk:** WebView apps can face store rejection if perceived as "just a website." Mitigated by native capabilities (share target, future push notifications) that add genuine native value

## Web Application + Native Wrapper Requirements

### Browser & Platform Matrix

**Web:**

| Browser | Support Level |
|---------|--------------|
| Safari iOS | Latest 2 major versions |
| Safari macOS | Latest 2 major versions |
| Chrome Android | Latest 2 major versions |
| Chrome desktop | Latest 2 major versions |
| Firefox desktop | Latest 2 major versions |
| Edge desktop | Latest 2 major versions |

**Native Apps (new for v1.0):**

| Platform | Minimum OS | Wrapper |
|----------|-----------|---------|
| iOS | iOS 16+ | Capacitor 6.x |
| Android | Android 10+ (API 29) | Capacitor 6.x |

### Responsive Design

Three breakpoints (unchanged from MVP):
- Mobile: 375–767px (single column, bottom nav, full-bleed map)
- Tablet: 768–1023px (more map space, larger touch targets)
- Desktop: 1024px+ (PortsPanel persistent sidebar, multi-column dashboard, side nav)

Native apps use the same responsive layout via Capacitor WebView — no separate native UI.

### Performance, SEO & Accessibility

Performance targets, SEO strategy, and accessibility level are defined in the Non-Functional Requirements section (NFR-1 through NFR-26). Key additions for v1.0:
- Native app cold start <3s (NFR-5)
- Offline journal save immediate (NFR-6)
- Dynamic OG images per voyage (NFR-24)
- Store listing optimization: keywords "sailing", "voyage tracker", "GPS track", "logbook", "Navionics"

### Native Capabilities (Capacitor)

**Architecture:** Capacitor wraps `sailbosco.com` in a native WebView shell. The app IS the website, with native plugins layered on top. Single codebase, single deployment — what works on the web works in the app.

| Capability | v1.0 | Implementation |
|-----------|------|----------------|
| Share target — receive GPX (Android) | ✅ | Intent filter via Capacitor config |
| Share target — receive GPX (iOS) | ✅ | Custom Share Extension (Swift) |
| Native share sheet — send links | ✅ | `@capacitor/share` |
| File picker | ✅ | `@capacitor/filesystem` |
| Status bar styling | ✅ | `@capacitor/status-bar` |
| Splash screen | ✅ | `@capacitor/splash-screen` |
| Deep linking | ✅ | Universal Links (iOS) + App Links (Android) via `sailbosco.com/.well-known/` |
| Push notifications | ❌ Post-v1.0 | `@capacitor/push-notifications` |
| Camera access | ❌ Post-v1.0 | Use file picker for now |

### Offline Mode (v1.0 — Simple)

**Use case:** Sailor at anchor with no network writes journal entries and attaches photos in the evening. Next morning, walks to the village, gets WiFi, everything syncs.

| Action | Offline Behavior |
|--------|-----------------|
| Browse cached voyage data | ✅ Read from Service Worker cache |
| Write journal entry | ✅ Save to IndexedDB, sync on reconnect |
| Attach photos to entry | ✅ Queue locally, upload on reconnect |
| Import GPX file | ❌ Requires network (server-side stopover detection + geocoding) |
| View public pages | ❌ Requires network (SSR) |
| Sign up / sign in | ❌ Requires network |

**Sync behavior:**
- Automatic and silent — no "Sync now" button
- Discreet badge on journal section: "2 entries pending" — not red, not alarming
- When network returns: sync happens automatically, badge disappears
- If sync fails (e.g., photo too large): single notification with "Retry" button
- Conflict resolution: last-write-wins (single user per voyage in v1.0)

### Internationalization (v1.0)

- Two languages: **English** (default) + **French**
- Language switch **in-app settings** — not dependent on OS locale. Sailors change countries frequently.
- Detection: browser/OS locale for initial suggestion, manual override persisted in profile
- Implementation: expand existing collocated `messages.ts` pattern or migrate to `next-intl`
- Units: nautical miles and knots (no unit toggle in v1.0)
- Date/time: locale-aware via `Intl.DateTimeFormat`

### Implementation Considerations

- Capacitor project at repo root: `ios/` and `android/` directories
- Build: `next build` → `npx cap sync` → Xcode/Android Studio or CI for native builds
- Domain `sailbosco.com` already live — deep linking configuration (`.well-known/apple-app-site-association` + `.well-known/assetlinks.json`) can be set up immediately
- Environment: Capacitor apps point to production URL, no build-time env baking needed (wrapper architecture)

## Functional Requirements

### Authentication & Identity

- **FR-1:** Users can sign up and sign in via email magic link
- **FR-2:** Users can remain signed in across browser restarts and app relaunches until explicit logout or session expiry
- **FR-3:** Users can receive auth emails from a branded domain sender (sailbosco.com)
- **FR-4:** Users can sign in on web, iOS app, and Android app with the same account

### Sailor Profile

- **FR-5:** Users can set a unique username (used in public URLs)
- **FR-6:** Users can optionally add: boat name, boat type, bio, profile photo, boat photo
- **FR-7:** Users can set their preferred language (English or French)
- **FR-8:** Users with administrator privileges can access the admin zone

### Voyage Management

- **FR-9:** Users can create, rename, and delete voyages
- **FR-10:** Users can set and modify voyage name, description, slug, cover image, and public/private visibility from voyage settings
- **FR-11:** Users can use a slug that is unique within their account
- **FR-12:** Users can manage more than one voyage

### Track Import & Processing

- **FR-13:** Users can import GPX 1.1 files up to 400 MB via file picker on all platforms
- **FR-14:** Users can import GPX files directly from Navionics via the OS share sheet on both iOS and Android
- **FR-15:** Users can share a GPX file to Bosco without being authenticated and be redirected to sign in, then returned to the import flow with the file preserved
- **FR-16:** Users can preview track geometry, point count, distance, and duration before confirming import
- **FR-17:** Users can select which tracks to import from a multi-track file
- **FR-18:** Users can import selected tracks as separate legs or as a merged leg
- **FR-19:** Users can view imported tracks that preserve visible tacks and course changes at zoom level 14 after simplification
- **FR-20:** Users can view per-leg stats: distance (nm), duration, average speed (kts), max speed, timestamps
- **FR-21:** Users can delete individual legs from a voyage

### Stopovers

- **FR-22:** Users can have stopovers auto-detected from leg endpoints within a configurable radius
- **FR-23:** Users can see human-readable place names and country codes automatically assigned to stopovers via reverse geocoding
- **FR-24:** Users can rename, reposition, delete, and merge stopovers
- **FR-25:** Users can browse stopovers grouped by country

### Journal & Media

- **FR-26:** Users can create journal entries with free-form text and photo attachments
- **FR-27:** Users can link journal entries to a specific date, and optionally to a leg and/or stopover
- **FR-28:** Users can upload photos that are automatically compressed to under 1 MB before storage
- **FR-29:** Users can view journal entries as a timeline on the voyage page
- **FR-30:** Users can create and save journal entries while offline, with automatic sync on reconnect
- **FR-31:** Users can queue photo attachments while offline, with automatic upload on reconnect
- **FR-32:** Users can see a discreet indicator showing the number of entries pending synchronization

### Geo-Tagged Media on Map

- **FR-33:** Users and visitors can see photos attached to journal entries as visual markers on the map at the associated stopover or leg location
- **FR-34:** Users and visitors can tap photo markers to view photos in a lightbox
- **FR-35:** Visitors can browse photos on the map with marker clustering when more than 15 markers are visible at the current zoom level

### Public Voyage Page

- **FR-36:** Visitors can access a public voyage page at `/{username}/{voyage-slug}` when a voyage is public
- **FR-37:** Visitors can view the voyage on a full-screen map with nautical chart context
- **FR-38:** Visitors can watch the route animate on initial page load
- **FR-39:** Visitors can view stopovers as markers, tap them for details including photos
- **FR-40:** Visitors can view a stats bar (distance, days, ports, countries)
- **FR-41:** Visitors can browse stopovers by country via the ports panel
- **FR-42:** Visitors can read journal entries in a timeline
- **FR-43:** Visitors who share a voyage link can see a dynamic OG image showing the real voyage map and route
- **FR-44:** Visitors can see a CTA for sailors ("Create your own voyage on Bosco") and use a share button to re-share the voyage

### Public Profile Page

- **FR-45:** Visitors can access a sailor profile at `/{username}` showing public information and public voyages

### Social Sharing

- **FR-46:** Users can share a voyage link via the native OS share sheet (iOS and Android)
- **FR-47:** Users can share links that display a rich preview (dynamic OG image + title + stats) on WhatsApp, Facebook, Instagram, Messenger, and other platforms
- **FR-48:** Users can tap links from `sailbosco.com` that open in the native app when installed, or fall back to the web browser

### Dashboard

- **FR-49:** Users can view all their voyages with preview cards and stats summary
- **FR-50:** Users can create a new voyage from the dashboard
- **FR-51:** Users can navigate to profile editing from the dashboard
- **FR-52:** Users with no voyages can see a demonstration of a completed voyage with a CTA to create their first

### Onboarding

- **FR-53:** Users can be directed to create their first voyage immediately after completing profile setup
- **FR-54:** Visitors can understand what Bosco does from the landing page, view a demo voyage, and access app store links and sign up

### Error Handling & Help

- **FR-55:** Users receive actionable error messages when an operation fails, stating what went wrong and how to recover
- **FR-56:** Users who attempt to import an unsupported file format see an explanation and a guide for exporting GPX from Navionics

### Admin Zone

- **FR-57:** Admins can view total users, active voyages, total legs, and new registrations
- **FR-58:** Admins can browse a user list with per-user stats
- **FR-59:** Admins can disable a user account
- **FR-60:** Admins can view error monitoring digest and storage usage metrics

### App Store Distribution

- **FR-61:** Users can download Bosco from the Apple App Store
- **FR-62:** Users can download Bosco from the Google Play Store
- **FR-63:** Users can complete core flows (sign up, import GPX, view map, add journal, share) identically on web, iOS, and Android

### Internationalization

- **FR-64:** Users can use the UI in English and French
- **FR-65:** Users can switch language from in-app settings

### Legal & Compliance

- **FR-66:** Users can access the privacy policy and terms of service from the landing page and in-app settings
- **FR-67:** Users can delete their account and all associated data

### Trophy (Preview)

- **FR-68:** Visitors can see a "Coming Soon" section for the Bosco Trophy physical product on public voyage pages

## Non-Functional Requirements

### Performance

- **NFR-1:** Public voyage pages render first meaningful paint in under 2 seconds on a 4G mobile connection
- **NFR-2:** GPX import of a valid 400 MB file completes within 60 seconds with main thread input responsiveness below 200 ms
- **NFR-3:** Map interactions maintain 60 fps on mid-range mobile devices (2022+)
- **NFR-4:** Map renders simplified tracks with up to 100,000 points with interaction latency below 100 ms
- **NFR-5:** Native app cold start reaches interactive state within 3 seconds on mid-range devices
- **NFR-6:** Offline journal entry save completes in under 200 ms (local-first, no network dependency)
- **NFR-7:** Offline-to-online sync completes automatically within 30 seconds of network restoration

### Security

- **NFR-8:** Authenticated users can read and modify only their own private data, enforced at both database and application layers
- **NFR-9:** Unauthenticated visitors can access only voyages explicitly marked public
- **NFR-10:** Image and file uploads are validated by type and size (max 10 MB per image, GPX up to 400 MB) before processing
- **NFR-11:** Admin routes are protected by both request-level and application-level authorization checks against administrator privileges
- **NFR-12:** All data transmitted over HTTPS. Auth tokens stored securely using platform-appropriate secure storage
- **NFR-13:** User account deletion cascades to all associated data (voyages, legs, stopovers, entries, photos, storage files) within 30 days per RGPD

### Mobile & Cross-Platform

- **NFR-14:** Mobile-first responsive design — all features usable on screens 375px and wider
- **NFR-15:** Primary map interactions support pinch zoom, pan, and tap markers on iOS Safari, Android Chrome, and native Capacitor apps
- **NFR-16:** GPX import works from mobile file picker, Android share sheet, and iOS share sheet (via Navionics export)
- **NFR-17:** Uploaded photos are compressed to under 1 MB before permanent storage
- **NFR-18:** All interactive elements have minimum 44px touch targets on mobile

### Accessibility

- **NFR-19:** WCAG 2.1 AA conformance on all public and authenticated pages
- **NFR-20:** All core user flows are keyboard accessible on desktop
- **NFR-21:** Route animation respects `prefers-reduced-motion` (skip to final state)
- **NFR-22:** Map, stopovers, stats, and journal content include appropriate aria-labels and screen reader announcements

### SEO & Social

- **NFR-23:** Public voyage pages return complete, indexable HTML in the first response via server-side rendering
- **NFR-24:** Dynamic Open Graph images are generated per voyage showing the real map and route (1200x630px)
- **NFR-25:** JSON-LD structured data is present and valid on all public voyage and profile pages
- **NFR-26:** Shared links produce rich previews on WhatsApp, Facebook, Instagram, Messenger, and Twitter/X

### Reliability & Observability

- **NFR-27:** Zero unhandled exceptions on the critical path (sign up → import → share) in production, measured via Sentry
- **NFR-28:** All server-side operations return structured success/error responses — no unhandled exceptions propagated to clients
- **NFR-29:** Production errors are tracked in an error monitoring service with context (operation name, user id, input summary)
- **NFR-30:** Uptime monitoring with alerting is operational for `sailbosco.com`
- **NFR-31:** Database daily backups are enabled and verified on the production tier
- **NFR-32:** Offline sync failures are surfaced to the user with a retry mechanism — no silent data loss

### Internationalization

- **NFR-33:** All user-facing strings are externalized in dedicated message files, not inlined in UI code
- **NFR-34:** Date, time, and number formatting is locale-aware
- **NFR-35:** Language switch takes effect in under 500 ms without page reload or re-authentication
