# Sprint Change Proposal — 2026-04-01

## 1. Issue Summary

**Trigger:** Starting Story 6.1 (Epic 6A), it was identified that Epic 6A produces a non-distributable Android app. The Play Store submission (Story 6.7) resides in Epic 6B, which is blocked on iPhone availability. Without store distribution, the Android app has zero user value — target users (sailors) will not sideload APKs.

**Decision:** Extract the Play Store submission from Story 6.7 (Epic 6B) into a new Story 6.A3 within Epic 6A, enabling a distributable Android app without waiting for iOS development.

## 2. Impact Analysis

### Epic Impact

| Epic | Impact | Detail |
|------|--------|--------|
| Epic 6A | Scope extended | New Story 6.A3 (Play Store Submission & Android Listing) added after 6.2 |
| Epic 6B | Story 6.7 narrowed | Now covers App Store (iOS) only; Play Store handled by Epic 6A |
| All others | None | No dependencies affected |

### Artifact Conflicts

| Artifact | Impact | Detail |
|----------|--------|--------|
| PRD | Positive | BS-1 (store availability) partially addressed in Epic 6A. FR-62 covered |
| Architecture | None | Build signing and store submission are deployment steps, not architectural |
| UX Design | None | Store listing is outside app UX scope |
| Epics | Modified | New story in 6A, Story 6.7 narrowed in 6B |

### FR Coverage Map Update

- FR-62 (Google Play Store): Moved from Epic 6B (Story 6.7) to Epic 6A (Story 6.A3)

## 3. Recommended Approach

**Selected: Direct Adjustment — Extend Epic 6A scope**

**Rationale:**
- Minimal change: one story added, one story narrowed
- No architectural impact — store submission is a deployment activity
- Delivers real user value: sailors can install from Play Store
- The Capacitor WebView architecture means web deploys update the app automatically — no store review needed for content updates
- Cost: $25 one-time (Google Play Developer account)

**Effort:** Low
**Risk:** Low (Google review for Capacitor apps with genuine native capabilities is straightforward)
**Timeline impact:** Adds ~1 story worth of effort to Epic 6A (build signing, listing creation, submission)

## 4. Detailed Change Proposals

### 4.1 New Story in Epic 6A

```markdown
### Story 6.A3: Play Store Submission & Android Listing

As a sailor on Android,
I want to find and download Bosco on the Google Play Store,
So that I can install it without technical knowledge.

**Acceptance Criteria:**

**Given** the Android app from Stories 6.1 and 6.2 is built and tested
**When** submitted to Google Play
**Then** a Google Play Developer account is created ($25 one-time fee)
**And** a signed release AAB is generated with proper keystore
**And** Bosco is listed on Google Play Store with screenshots, description, and data safety section
**And** store listing is optimized for keywords: "sailing", "voyage tracker", "GPS track", "logbook", "Navionics"
**And** age rating is set to Everyone
**And** Internal Testing track is used for initial validation before production release
```

### 4.2 Story 6.7 Narrowed in Epic 6B

**OLD:**
```
Given the iOS and Android apps are built and tested
When submitted to the respective stores
Then Bosco is listed on the Apple App Store with screenshots, description, and privacy labels
And Bosco is listed on Google Play Store with screenshots, description, and data safety section
And store listings are optimized for keywords
And age rating is set appropriately (4+ / Everyone)
```

**NEW:**
```
Given the iOS app is built and tested
When submitted to the Apple App Store
Then Bosco is listed on the Apple App Store with screenshots, description, and privacy labels
And store listing is optimized for keywords: "sailing", "voyage tracker", "GPS track", "logbook", "Navionics"
And age rating is set to 4+
And Play Store listing (already live from Story 6.A3) is verified for cross-platform consistency
```

### 4.3 Epic 6A Implementation Sequence

```
6.1 (Capacitor setup + Android build) → 6.2 (Android share target) → 6.A3 (Play Store submission)
```

## 5. Implementation Handoff

**Change scope:** Minor — one story added, one story narrowed, no architectural changes

**Updated files:**
- `_bmad-output/planning-artifacts/epics.md` — New Story 6.A3 in Epic 6A, Story 6.7 narrowed in 6B
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Story 6.A3 added to Epic 6A tracking

**Success criteria:**
- Epic 6A produces a live Play Store listing
- Sailors can install Bosco from Google Play Store
- Web deploys via Vercel automatically update the app experience (no store update needed)

**Next steps:**
1. Implement Story 6.1 (Capacitor setup + Android build)
2. Implement Story 6.2 (Android GPX share target)
3. Implement Story 6.A3 (Play Store submission)
4. Verify end-to-end: friend installs from Play Store → imports from Navionics → views voyage
