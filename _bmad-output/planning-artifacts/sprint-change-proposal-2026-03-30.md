# Sprint Change Proposal — 2026-03-30

## 1. Issue Summary

**Trigger:** During Epic 5 implementation, the absence of a physical iPhone was identified as a blocker for Epic 6 stories requiring iOS testing (6.3–6.8).

**Problem:** Epic 6 (App Store Distribution & Native Import) contains 8 stories spanning both Android and iOS. Stories 6.3–6.8 require a physical iPhone for testing the iOS build, Share Extension, deep linking, cross-platform auth, store submission, and QA parity. Without the device, these stories cannot be validated.

**Decision:** Split Epic 6 into two epics to unblock v1.0 development:
- **Epic 6A** (Android): Stories 6.1, 6.2 — executable immediately
- **Epic 6B** (iOS + Stores + QA): Stories 6.3–6.8 + Story 8.2 — deferred until iPhone is available

## 2. Impact Analysis

### Epic Impact

| Epic | Impact | Detail |
|------|--------|--------|
| Epic 5 | None | No changes |
| Epic 6 → 6A | Reduced scope | Only stories 6.1 (Capacitor + Android build) and 6.2 (Android share target) |
| Epic 6B (new) | Deferred | Stories 6.3–6.8 + 8.2 (Native onboarding). Blocked on iPhone availability |
| Epic 7 | None | Story 7.5 (`@capacitor/share`) degrades to Web Share API on web. No blockers |
| Epic 8 | Minor | Story 8.2 (Native App Onboarding) moved to Epic 6B. Stories 8.1, 8.3–8.5 unaffected |
| Epic 9 | None | Fully web-first, no native dependencies |
| Epic 10 | None | No native dependencies |

### Artifact Conflicts

| Artifact | Impact | Detail |
|----------|--------|--------|
| PRD | Low | BS-1 (store availability) becomes partial: Play Store with 6B, not within 4 weeks. TS-3 (cross-platform parity) temporarily web + Android only |
| Architecture | None | Capacitor architecture is modular; `ios/` and `android/` directories are independent |
| UX Design | Low | UX-DR2 (native onboarding) and UX-DR3 (iOS Share Extension UI) deferred to 6B |
| Sprint Status | Updated | Epic 6 split into 6A/6B, story 8.2 moved |

### New Epic Sequence

```
Epic 5 → Epic 7 → Epic 8* → Epic 6A → Epic 9 → Epic 10 → Epic 6B
```

*Epic 8 without Story 8.2 (moved to Epic 6B)

**Rationale for 6A after 7-8:** Epics 7 and 8 are 100% web features with immediate user value (photos on map, OG images, landing page). Epic 6A (Capacitor Android setup) is native infrastructure that doesn't unblock anything until 6B. Web-first features ship first.

## 3. Recommended Approach

**Selected: Direct Adjustment — Split Epic 6**

**Rationale:**
- Android and iOS are naturally decoupled in the Capacitor architecture
- Epic 6A validates the native wrapper approach on Android before tackling the more complex iOS work
- Epics 7–8 are 100% web and deliver immediate user value — prioritized before native infrastructure
- Epics 7–10 have minimal to no dependency on native capabilities
- The PRD already acknowledges iOS Share Extension may extend the timeline
- No rework required — this is purely a resequencing

**Effort:** Low (organizational change only, no code impact)
**Risk:** Low (no technical dependencies broken)
**Timeline impact:** Epics 7–10 proceed without delay. Epic 6B added at end of v1.0 sequence.

## 4. Detailed Change Proposals

### 4.1 Epic 6 → Epic 6A (Android App & Native Import)

**Scope:** Stories 6.1, 6.2 only
**FRs covered:** FR-14 (Android only)
**ARs covered:** AR-2, AR-4, AR-6

### 4.2 New Epic 6B (iOS App, Store Distribution & Cross-Platform QA)

**Scope:** Stories 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 8.2
**FRs covered:** FR-4, FR-14 (iOS), FR-15, FR-48, FR-53, FR-61, FR-62, FR-63
**ARs covered:** AR-3, AR-5, AR-17, AR-18
**UX-DRs covered:** UX-DR2, UX-DR3
**Blocker:** Physical iPhone required for testing

### 4.3 Epic 8 Modification

**Story 8.2 (Native App Onboarding Flow) moved to Epic 6B**
- Requires Capacitor native app to be functional
- FR-53 and UX-DR2 move with it

### 4.4 FR Coverage Map Update

- FR-14 split: Android in Epic 6A, iOS in Epic 6B
- FR-4, FR-15, FR-48, FR-61–63 move to Epic 6B
- FR-53 moves from Epic 8 to Epic 6B

## 5. Implementation Handoff

**Change scope:** Minor — organizational resequencing, no architectural changes

**Updated files:**
- `_bmad-output/planning-artifacts/epics.md` — Epic 6 split, Story 8.2 moved
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Updated epic/story tracking

**Success criteria:**
- Epic 6A can be created and implemented immediately after Epic 5
- Epics 7–10 proceed without referencing iOS-specific capabilities
- Epic 6B is clearly documented as deferred with blocker noted

**Next steps:**
1. Continue Epic 5 implementation (in progress)
2. When ready: create Story 6.1 via `/bmad-create-story`
3. Acquire iPhone when feasible → unblocks Epic 6B
