# Sprint Change Proposal: Android App Links Before Play Store

**Date:** 2026-04-01
**Trigger:** Story 6.2 (Android GPX Share Target) testing
**Scope:** Minor — add 1 story within existing Epic 6A

## Issue Summary

During manual testing of Story 6.2 on the Android emulator, we discovered that magic link authentication cannot complete in the Capacitor native app. When a user taps a magic link in their email, Android opens the link in Chrome instead of the Bosco app's WebView. This creates two separate browser contexts with separate session storage — authentication completes in Chrome but the Bosco app remains unauthenticated.

This makes the core flow (share GPX → authenticate → import) impossible to complete end-to-end in the native app. Play Store submission (Story 6.A3) cannot proceed with broken authentication.

**Evidence:** Tested on emulator API 35. Sharing a GPX file to Bosco correctly triggers the share flow and displays the auth page, but the magic link email cannot be used to complete authentication within the app.

## Impact Analysis

**Epic 6A:** Cannot achieve its goal (working Android app on Play Store) without App Links.

**Epic 6B Story 6.5:** Originally covered both Universal Links (iOS) and App Links (Android). The Android portion is urgently needed now; iOS portion remains deferred.

**PRD:** FR-48 (deep linking) already planned. No conflict.

**Architecture:** `assetlinks.json` spec already documented in architecture.md. No new architectural decisions needed.

## Recommended Approach: Direct Adjustment

Add Story 6.A4 (Android App Links) to Epic 6A, between Story 6.2 and Story 6.A3.

**Effort:** Low — single `.well-known/assetlinks.json` file + intent filter with `autoVerify`
**Risk:** Low — well-documented Android feature, architecture already specced
**Timeline impact:** ~1 story added before Play Store submission

## Changes Applied

### epics.md

1. **Added Story 6.A4** in Epic 6A after Story 6.2
2. **Updated Epic 6A description** to include deep linking and FR-48
3. **Narrowed Story 6.5** in Epic 6B to iOS Universal Links only (with reference to this proposal)

### sprint-status.yaml

- Added `6-a4-android-app-links-deep-linking: backlog` between Story 6.2 and Story 6.A3

### New Epic 6A order

| Story | Status |
|-------|--------|
| 6.1 Capacitor setup | done |
| 6.2 Share target | review |
| **6.A4 Android App Links** | **backlog** |
| 6.A3 Play Store submission | backlog |

## Implementation Handoff

**Scope:** Minor — development team can implement directly.
**Next step:** Run `create-story 6-a4-android-app-links-deep-linking` then `dev-story`.
