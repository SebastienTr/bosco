---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Deepening Bosco UX: Map aesthetics, planned route overlay, leg interactions, voyage configuration'
session_goals: 'Generate 6-12 month feature vision to make Bosco indispensable for active sailors — focus on map richness, data depth, and visual polish'
selected_approach: 'progressive-flow'
techniques_used: ['cross-pollination']
ideas_generated: ['52 ideas across 12 domains, 25 retained across 5 themes']
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Seb
**Date:** 2026-04-19

## Session Overview

**Topic:** Deepening the Bosco experience — map aesthetics, planned vs sailed route overlay, clickable legs with details, voyage configuration parameters, and overall visual polish

**Goals:** Generate a long-term (6-12 month) feature vision that makes Bosco indispensable for active recreational sailors. Focus on enriching the existing experience rather than expanding the audience. Three seed axes:
1. Map aesthetics and visual richness (the map IS the product)
2. Planned route import (GPX "route to sail") with progressive update as legs are completed
3. Clickable legs with detailed info, plus more voyage configuration/display options

**Context:** Bosco is live at sailbosco.com with core features working (GPX import, auto stopovers, journal, public pages with animated route, photo markers). MVP + most of v1.0 complete. Tech stack: Next.js 16, Leaflet + OpenSeaMap, Supabase, Capacitor (Android). User base: recreational sailors using Navionics.

### Session Setup

_Session initialized from user direction — Seb wants to explore experience deepening and aesthetic refinement for the next 6-12 months of Bosco development._

## Technique Selection

**Approach:** Progressive Technique Flow
**Journey Design:** Systematic development from exploration to action

**Progressive Techniques:**

- **Phase 1 - Exploration:** Cross-Pollination for maximum idea generation across domains
- **Phase 2 - Pattern Recognition:** Morphological Analysis for organizing parameter combinations
- **Phase 3 - Development:** Six Thinking Hats for evaluating concepts from all angles
- **Phase 4 - Action Planning:** Decision Tree Mapping for implementation roadmap

**Journey Rationale:** Seb has 3 strong seed axes (map aesthetics, planned route overlay, clickable legs). Cross-Pollination will expand these seeds by importing proven patterns from other map-centric and data-rich apps. Morphological Analysis will systematically map the solution space. Six Thinking Hats will stress-test the top ideas. Decision Tree Mapping will sequence them into a 6-12 month roadmap.

## Technique Execution Results

**Cross-Pollination — 12 Domains Explored:**

Domains covered: Strava/Sport tracking, Google Earth/Immersive, Marine plotters/Navionics, Photography/Visual storytelling, Game/RPG exploration, Data visualization, Configuration/Personalization, Social/Sharing, Mobile/Touch UX, Artistic cartography, Planning/Project management, Publishing/Editing.

**52 ideas generated, 25 retained after interactive filtering with Seb.**

### Complete Idea Inventory

#### Theme A: Animation & Cinematic (the #1 emotional hook)

| # | Idea | User Reaction | Priority |
|---|------|---------------|----------|
| **4b** | **Cinematic enriched animation** — Wake effect trail, auto-zoom on interesting areas, port name labels fade in at stopovers, journal photos flash as vignettes, leg stats slide in between stopovers. Transforms "line drawing" into "mini voyage film" with zero user configuration. | **STRONG** — "people remember the animation, we need to emphasize this" | Top |
| 6 | **Temporal slider** — Scrub through the voyage timeline, trace draws/erases progressively, stopovers appear/disappear, photos pop at the right moment. Visitor becomes time explorer. | Good idea | Solid |
| 42 | **Import with visual feedback** — When importing via share sheet, instead of spinner, the map animates: zoom on new leg, trace draws in real-time during processing, new stopovers appear one by one. Import becomes satisfaction moment. | Nice | Nice-to-have |
| 43 | **Persistent wake trail** — Trace leaves semi-transparent wake behind the advancing point, wake fades gently. Head point could be a small sailboat symbol. Trace becomes organic and alive. | Yes | Solid |

#### Theme B: Themes & Visual Personalization (Bosco as the first beautiful nav app)

| # | Idea | User Reaction | Priority |
|---|------|---------------|----------|
| **5b** | **Map themes — mood collection** — 4-5 free themes per voyage: "Logbook" (watercolor/vintage), "Night at Sea" (dark, luminous trace), "Ocean" (enriched current), "Satellite" (aerial), "Minimalist" (clean). Choice per voyage, not global. Same data, 5 different emotions. | **STRONG** — "Absolutely!" | Top |
| **44** | **Customizable boat icon** — Sailor chooses symbol: sailboat, catamaran, motorboat, custom silhouette. Appears at animation head and current position. | **STRONG** — "users must be able to choose" | Top |
| 45 | **Trace line style per theme** — Solid, ink effect, dotted adventure, neon glow (night theme), watercolor (logbook theme). Style tied to theme selection. | Yes, keep simple | Solid |
| 46 | **Theme-adapted stopover markers** — Classic anchor, vintage pin, luminous dot, nautical flag. No more generic red pins. Visual coherence with chosen theme. | Yes | Solid |
| 47 | **Automatic dark/light mode** — Follows system theme preference. Luminous trace on dark background for spectacular night effect. | Yes, system theme | Solid |
| 14 | **Color palettes per theme** — A few preset palettes integrated into each theme. Simple selection, no custom color picker. | Yes, simple | Nice-to-have |

#### Theme C: Sharing & Distribution (Bosco beyond sailbosco.com)

| # | Idea | User Reaction | Priority |
|---|------|---------------|----------|
| **37** | **Embeddable blog widget** — Small HTML widget for personal blogs/websites: mini-map with current trace, stats, last stopover. Auto-updates on each leg import. Long-distance sailors with blogs need this. | **VERY STRONG** — "I absolutely need this for blogs" | Top |
| **34** | **Video export MP4** — "Export as video" button generates 15-30s clip of voyage animation (trace drawing, stopovers appearing, final stats). Optimized for Instagram Reels / TikTok / WhatsApp. Share a video, not a link. | **STRONG** — "absolutely, great idea" | Top |
| 35 | **Downloadable "postcard" image** — Beautiful static image of voyage — map with trace, stats, voyage name, in chosen theme. Story (9:16) or square (1:1) format. Also workaround for OG cache issue. | Why not | Nice-to-have |
| 36 | **Voyage QR code** — Elegant QR code in voyage theme. Print it, stick on boat. Scan → public page. Physical/digital bridge. | Quick win | Nice-to-have |
| 16 | **OG image cache-busting fix** — Regenerate OG image on every leg import + version parameter in URL to force social networks to re-fetch. Technical fix for real pain point (sharing updated voyage shows old preview). | Necessary | Solid |

#### Theme D: Configuration & Voyage Card (sailor controls the display)

| # | Idea | User Reaction | Priority |
|---|------|---------------|----------|
| **21** | **Enriched voyage card** — Beyond name/description: boat name, boat type (sail/motor/cat), length, crew names (optional), flag, home port. Displays elegantly on public page like a logbook header. Boat becomes a character. | **STRONG** — "we must do this" | Top |
| **50** | **Multi-crew / names per leg** — Add crew member names to voyage, optionally per leg ("This leg: Seb + Marie + Thomas"). Displayed on public page. Voyage becomes collective. | **STRONG** — "I was just talking about this today" | Top |
| 22 | **Selectable displayed stats** — Sailor toggles which stats appear on public page: NM, total duration, days at sea, ports, countries, avg speed, longest leg, dates. Toggle on/off. Weekend sailor shows ports, bluewater sailor shows miles. | Yes exact | Solid |
| 23 | **Section visibility toggles** — Sailor can show/hide individually: journal, photos, stats, stopovers, planned route. "I want to share my trace and photos but not my journal" → toggle off. | Yes ok | Solid |
| 48 | **Voyage status** — States: "Planning" (planned route only), "Active" (legs imported, planned route remaining visible), "Completed" (sailor closes voyage). Status changes display: planning → dotted only, active → real + planned, completed → full trace with final stats. | Yes, keep simple | Nice-to-have |

#### Theme E: Map Interactivity (trace becomes clickable, photos find their true place)

| # | Idea | User Reaction | Priority |
|---|------|---------------|----------|
| **52b** | **Photos positioned on the trace** — Photos can be placed anywhere on the trace, not just tied to stopovers. Drag & drop on map, or auto-position via EXIF GPS metadata. The submarine between Denmark and Kiel appears exactly where it was seen. Open-sea photos finally exist on the map. With clustering to avoid overload. | **STRONG** — personal pain point (submarine story) | Top |
| **9** | **Leg info panel on click** — Click a leg (line between stopovers) → panel opens with: departure date/time, arrival date/time, average speed, nautical miles, associated journal entries. Simple, informative, no overload. | Yes, clear specs given | Top |
| 8 | **Planned route in dotted line** — Import second GPX "planned route" displayed in translucent dotted line alongside real trace. See plan vs reality at a glance. Each new imported leg auto-erases corresponding planned portion. Remaining planned route stays visible as "upcoming". | Yes! | Solid |
| 41 | **Long press stopover preview** — Long press on stopover → floating preview with main photo, name, dates, journal excerpt. Quick peek without opening full panel. | Why not | Nice-to-have |
| 1 | **Simple leg stats (segment-style)** — Each leg between stopovers has basic stats: avg speed, time, distance. Personal progression comparison for same routes. | Eventually | Nice-to-have |

### Rejected Ideas (with rationale)

| # | Idea | Why Rejected |
|---|------|-------------|
| 2 | Navigation heatmap (all voyages overlay) | Not interested |
| 3 | Speed-colored trace | Not interested |
| 7 | Zone badges/achievements | Too complex, not priority |
| 10 | Compass rose / wind direction | Only if very discreet |
| 11 | Historical weather overlay | Too imprecise data |
| 17 | Fog of war (unexplored areas dimmed) | No added value, complex |
| 18 | Animated stats counters | Only if very subtle |
| 19 | Active voyage progression indicator | Rarely applicable |
| 27 | Distance profile graph | Not worth it |
| 29 | Plan vs reality comparison stats | Too rare to justify |
| 30 | Voyage chapters | Already grouped by country |
| 31 | Customizable section order (drag & drop) | Too complex |
| 32 | PDF export "logbook" | Too much work for now |
| 33 | Free-form text between sections | Keep journal simple |
| 38 | Swipe between legs | Meh |
| 39 | Full screen immersive mode | Already good enough |
| 40 | Shake to replay | No |
| 49 | Dates on legs | Already obvious / expected |
| 51 | Private vs public journal notes | Bosco is public-only, sailor has own tools |

### Key User Insight: Design Philosophy

Seb consistently filters ideas through these principles:
- **Simplicity first** — if it adds complexity for marginal value, reject
- **Beauty matters** — aesthetic ideas get almost universal approval
- **Automation over configuration** — themes should "just work", not require 20 toggles
- **Public-facing only** — Bosco is a showcase, not a private tool
- **Personal pain points win** — submarine photo, blog widget, OG cache = immediate validation

## Idea Organization and Prioritization

### Prioritization Results

**Top Priority Ideas (strong immediate reaction):**
#4b, #5b, #44, #37, #34, #21, #50, #52b, #9

**Solid Ideas (validated without hesitation):**
#8, #22, #23, #43, #46, #47, #16, #6, #45, #14

**Nice-to-have (lukewarm or "why not"):**
#42, #35, #36, #41, #1, #48

### Implementation Roadmap — 5 Waves over 6-9 months

**Wave 1: Foundations (months 1-2)**
_Data model enrichment + basic interactivity — unlocks everything else_

- #21 Enriched voyage card (boat, type, crew, flag)
- #50 Multi-crew names per leg
- #9 Leg info panel on click (dates, speed, NM)
- #22 Selectable displayed stats (toggle on/off)
- #23 Section visibility toggles
- #16 OG image cache-busting fix

**Result:** Interactive trace, configured voyage, sailor controls display.

**Wave 2: Aesthetics (months 3-4)**
_Visual differentiator — Bosco becomes beautiful_

- #5b Map themes (4-5 moods)
- #44 Customizable boat icon
- #46 Theme-adapted stopover markers
- #45 Trace line style per theme
- #43 Animated wake trail
- #47 Dark/light system theme
- #14 Color palettes per theme

**Result:** Every voyage has visual identity. First beautiful nav app.

**Wave 3: Animation & Cinematic (months 4-5)**
_The emotional hook — what people remember_

- #4b Cinematic enriched animation (labels, photos, stats)
- #42 Import with visual animation feedback
- #6 Temporal slider

**Result:** Animation goes from "line drawing" to "mini voyage film".

**Wave 4: Enriched Map (months 5-7)**
_Living map canvas with full interactivity_

- #52b Photos positioned on trace (not just stopovers)
- #8 Planned route in dotted line + progressive erasure
- #48 Voyage status (planning/active/completed)
- #41 Long press stopover preview

**Result:** Submarine is in the right place. Living voyage with plan vs reality.

**Wave 5: Sharing & Distribution (months 7-9)**
_Bosco beyond sailbosco.com_

- #37 Embeddable blog widget
- #34 Video export MP4 (Instagram/TikTok)
- #35 Downloadable postcard image
- #36 Voyage QR code

**Result:** Sailor shares everywhere — blog, video, image, QR.

### Dependencies

- Wave 2 (themes) should precede Wave 3 (animation) — animation benefits from visual polish
- Wave 1 (data model) must precede Wave 2 — boat info feeds into theme display
- Wave 3 (animation) should precede Wave 5 (video export) — export captures the cinematic animation
- #8 (planned route) enables #48 (voyage status) — linked features
- #52b (photos on trace) is independent but benefits from Wave 2 themes

## Session Summary and Insights

**Key Achievements:**

- 52 ideas generated across 12 cross-pollination domains
- 25 ideas retained after interactive filtering
- 5 coherent themes identified with clear implementation sequence
- 9 top-priority features with strong user validation
- Complete 6-9 month roadmap with dependency mapping

**Creative Breakthroughs:**

1. **Themes as design system** (#5b + #44 + #45 + #46 + #47) — emerged as a coherent visual identity layer, not just cosmetic options
2. **Animation as #1 hook** (#4b) — validated by real user feedback ("people remember the animation"), elevated to flagship feature
3. **Widget for blogs** (#37) — personal need that reveals a distribution channel (long-distance sailors with blogs)
4. **Photos on trace** (#52b) — the submarine story crystallized a fundamental UX limitation

**Design Philosophy Discovered:**

Seb's product instinct consistently filters through: simplicity > complexity, beauty > features, automation > configuration, public showcase > private tool. This should guide all future feature decisions for Bosco.
