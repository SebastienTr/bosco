---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Bosco Trophy — 3D printed sailing voyage map product variants and pricing'
session_goals: 'Define V1 product specification, explore variants (materials, sizes, options, packaging), establish pricing model'
selected_approach: 'ai-recommended'
techniques_used: ['SCAMPER Method', 'Cross-Pollination', 'Morphological Analysis']
ideas_generated: 44
context_file: '/Users/seb/workspace/bosco/_bmad/bmm/data/project-context-template.md'
technique_execution_complete: true
---

# Brainstorming Session Results

**Facilitator:** Seb
**Date:** 2026-03-26

## Session Overview

**Topic:** Bosco Trophy — 3D printed sailing voyage map as a physical product
**Goals:** Define V1 product specification, explore material/size/option variants, establish pricing model

### Context

Bosco is a digital logbook for recreational sailors. The core idea explored in this session: transform GPS voyage data into a 3D-printed physical trophy — a relief map showing coastlines, the sailing track, and voyage stats. Seb owns three 3D printers (Bambu A1 Combo with AMS, P1S, Centauri Carbon) and wants this to be Bosco's primary revenue source.

Market research (completed 2026-03-18) confirmed no competitor offers anything similar in the maritime space. The concept is validated in adjacent markets (running/hiking: PrintMyRoute, WayZada, GPXtruder).

---

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Physical product innovation with pricing strategy

**Techniques Used:**
1. **SCAMPER Method** — Systematic product variant exploration through 7 lenses
2. **Cross-Pollination** — Stealing ideas from adjacent industries (trophies, jewelry, photo books, art prints)
3. **Morphological Analysis** — Assembling validated ideas into final product specification and pricing

---

## Technique Execution Results

### SCAMPER Method — 37 Ideas Generated

#### S — Substitute
- **[#4] ✅ Multi-color AMS single print**: Sea in matte blue, coastlines in white/marble, track in PLA Silk Gold, text in black. Four-color print in one session on A1 Combo.
- **[#5] ✅ PLA Silk filaments for premium look**: Track in Silk Gold or Copper for metallic effect without painting. Coastlines in PLA Marble.
- [#6] Glow-in-the-dark track — deferred
- [#7] Bathymetry instead of flat sea — deferred

#### C — Combine
- **[#8] ✅ QR code linking to Bosco voyage page**: Physical object becomes portal to digital experience (animated route, photos, full stats).
- **[#9] ✅ Trophy base with stats plate**: Separate base with engraved voyage name, dates, distance in NM, duration, boat name. Transforms from "decor object" to "navigation trophy".
- **[#10] ✅ Gift packaging → kraft cardboard premium**: Replaced 3D-printed box concept (too expensive in print time) with premium kraft cardboard packaging.
- [#11] Multi-voyage composite map — rejected (one trophy = one voyage)
- [#12] Magnetic wall mount — deferred

#### A — Adapt
- **[#13] ✅ Unique serial number**: "Voyage #0042" — creates collectibility and sense of rarity.
- [#14] Kit version for self-assembly — rejected (Seb prefers finished piece)
- **[#15] ✅ Micro-sailboat on the track**: 1-2cm PLA boat positioned at a key point on the route. Humanizes the object.
- [#16] Season Wrapped annual compilation — rejected (one trophy = one voyage)
- **[#17] 📌 Event trophies (regattas, corporate)** — V2

#### M — Modify
- [#18] Three standardized sizes — rejected for V1 (single size: 256×256mm max A1 bed)
- [#19] Organic shape following geography — rejected for V1 (square for simplicity)
- **[#20] ✅ Exaggerated coastal relief (3-5x vertical scale)**: Makes mountains dramatic and sculptural.
- **[#21] ✅ Micro-wave texture on sea surface**: FDM layer lines become an aesthetic asset, not a defect.
- [#22] Track thickness encoding speed — rejected (too complex technically)

#### P — Put to Other Uses
- **[#23] 📌 Charter company departure gift (B2B)** — V2. Seb has already met a skipper who validated this idea.
- **[#24] 📌 Personalized regatta trophy** — V2
- **[#25] 📌 Memorial / Heritage edition** — V2
- [#26] Restaurant/bar maritime decor — rejected
- **[#27] 📌 Corporate event souvenir** — V2

#### E — Eliminate
- [#28] Eliminate base (wall mount only) — rejected (base is simpler to produce)
- [#29] Eliminate text, QR only — rejected (text is free with AMS)
- **[#30] ✅ Eliminate 3D-printed gift box**: Replaced with kraft cardboard. Saves 8-12h of print time per unit.
- [#31] Track-only minimal version — rejected (full version costs nearly the same)
- **[#32] ✅ Automated GPX→STL/3MF pipeline**: Script that generates print-ready files from Bosco voyage data. Critical for scalability.

#### R — Reverse
- [#33] Pre-order before voyage — rejected (trophy is post-voyage reward)
- [#34] Non-sailor orders as gift — rejected for V1 (sailor orders for themselves)
- [#35] Inverted relief (sea high, land low) — rejected
- [#36] Underwater perspective — rejected
- [#37] Sell STL files (marketplace) — rejected for V1

### Cross-Pollination — 7 Ideas Generated

#### From Trophy/Finisher Industry
- [#38] Finisher package (certificate, postcard) — 📌 V2
- **[#39] ✅ Difficulty badges**: ⛵ Coastal (<50NM), 🌊 Offshore (50-200NM), 🌍 Crossing (200+NM). Gamification through collection.

#### From Jewelry/Engraving Industry
- **[#40] ✅ GPS coordinates on base**: Departure and arrival coordinates in nautical format. "43°17'N 5°22'E → 41°55'N 8°44'E".
- **[#41] ✅ Boat name in relief on base**: Emotional trigger — sailors have intense relationships with their boat's name.

#### From Photo Book Industry (Polarsteps, Artifact Uprising)
- **[#42] ✅ Emotional value pricing at 100-120€**: Price anchored to memory value, not material cost. Validated by Polarsteps model ($40-80€ photo books at ~80% margin).
- **[#43] ✅ One-click ordering post-voyage**: Capture the emotional high immediately after voyage. Minimal friction between desire and purchase.

#### From Custom Art Print Industry (Mapiful, Strava Art)
- **[#44] ✅ Photorealistic 3D preview before purchase**: Show the exact trophy with the sailor's real track, rendered on a shelf/wall. #1 conversion trigger in print-on-demand.

---

## Final Product Specification — "Bosco Trophy" V1

### Product Definition

**Name:** Bosco Trophy
**Tagline:** "Ton voyage, sculpté" (Your voyage, sculpted)
**Price:** 109€ (shipping extra)
**Format:** Single SKU, all-inclusive

### Physical Specifications

| Parameter | V1 Specification |
|-----------|-----------------|
| Dimensions | 256×256mm (square, A1 max bed) |
| Primary printer | Bambu A1 Combo with AMS (4-color) |
| Support printers | P1S / Centauri Carbon (base, micro-boat) |
| Sea filament | PLA Matte dark blue, micro-wave texture |
| Coastline filament | PLA White or Marble, 3-5x exaggerated vertical relief |
| Track filament | PLA Silk Gold or Copper |
| Text filament | PLA Black (AMS 4th color) |
| Micro-sailboat | Yes, positioned on track at key point |
| Map zoom | Automatic based on track bounding box |

### Base Specifications

| Element | Detail |
|---------|--------|
| Material | PLA, printed separately |
| Voyage name | In relief |
| Boat name | In relief |
| Dates | Start → End |
| Distance | In nautical miles |
| Duration | Days/hours |
| GPS coordinates | Departure → Arrival |
| Difficulty badge | ⛵ Coastal / 🌊 Offshore / 🌍 Crossing |
| Serial number | Unique "Voyage #XXXX" |
| QR code | Links to Bosco public voyage page |

### Packaging

- Premium kraft cardboard box
- Protective foam/padding insert
- No 3D-printed packaging (saves 8-12h print time)

### Unit Economics

| Item | Cost |
|------|------|
| Filament — map (~200g) | 5€ |
| Filament — base (~80g) | 2€ |
| Filament — micro-boat (~5g) | 0.50€ |
| Electricity (~8-10h total) | 1.50€ |
| Kraft packaging | 3-5€ |
| Protective packaging + shipping | 8-12€ |
| **Total cost** | **~22-28€** |
| **Selling price** | **109€** |
| **Gross margin** | **~77% (~84€/unit)** |

### Production Capacity

- ~2 trophies/day across 3 printers
- ~30-40 trophies/month at full capacity
- Revenue potential: 3,000-4,400€/month gross margin

### Technical Pipeline

1. Sailor clicks "Order my trophy" on Bosco voyage page
2. Photorealistic 3D preview of the trophy with their actual track
3. One-click payment (109€ + shipping)
4. Automated script generates 3MF file from Bosco voyage data (coastlines from OSM, track from GeoJSON, stats from DB)
5. Seb launches print (A1 Combo for map, P1S/Centauri for base + micro-boat)
6. Assembly + kraft packaging + shipping

### V2 Roadmap (Deferred Ideas)

- B2B charter company partnerships (#23)
- Regatta trophies (#24)
- Memorial/Heritage premium edition (#25)
- Corporate event souvenirs (#27)
- Finisher package with certificate (#38)
- Event trophies (#17)

---

## Creative Session Narrative

This session produced 44 ideas across three structured techniques. The SCAMPER method generated the bulk of product variants (37 ideas), Cross-Pollination brought critical business model insights from adjacent industries (7 ideas), and Morphological Analysis synthesized everything into a concrete product specification.

Key breakthrough moments:
- The AMS multi-color single-print realization (idea #4) transformed the product from multi-step assembly to streamlined production
- The QR code bridge between physical and digital (#8) closes the loop between Bosco's platform and the physical product
- The emotional value pricing insight (#42) from Polarsteps validated the 100-120€ price point
- The automated pipeline requirement (#32) was identified as the critical technical enabler for scalability

The session maintained a clear "V1 purity" philosophy: one voyage = one trophy, one price, one format. Seb consistently rejected complexity in favor of a clean, focused product that ships fast.
