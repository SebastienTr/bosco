# Story 6.A4: Android App Links (Deep Linking)

Status: done

## Story

As a sailor on Android,
I want tapping a sailbosco.com link to open in the Bosco app,
So that magic link authentication works in the native app.

## Acceptance Criteria

1. **Given** the Android app is installed, **When** the user taps a `sailbosco.com/*` link (e.g., magic link from email), **Then** the link opens in the Bosco app instead of Chrome.

2. **Given** the deep link configuration, **When** inspecting `https://www.sailbosco.com/.well-known/assetlinks.json`, **Then** it returns valid JSON with `Content-Type: application/json`, HTTP 200 (no redirects), containing the correct package name and SHA256 fingerprint.

3. **Given** the app is NOT installed, **When** the user taps a `sailbosco.com` link, **Then** the link opens in the web browser as before (graceful fallback).

4. **Given** a magic link email, **When** the user taps the link with the app installed, **Then** the app opens, navigates to `/auth/confirm?code=...`, the session is established, and the user lands on the dashboard authenticated.

5. **Given** the app is already open (warm start), **When** the user taps a `sailbosco.com` link externally, **Then** the app comes to foreground and navigates to the linked page.

6. **Given** the app is NOT running (cold start), **When** the user taps a `sailbosco.com` link, **Then** the app launches and navigates to the linked page (not the home page).

## Tasks / Subtasks

- [x] Task 1: Create `public/.well-known/assetlinks.json` (AC: #2, #3)
  - [x] 1.1 Create `public/.well-known/` directory
  - [x] 1.2 Create `assetlinks.json` with debug keystore fingerprint (production fingerprint added in Story 6.A3)
  - [ ] 1.3 Deploy to Vercel and verify: `curl -I https://www.sailbosco.com/.well-known/assetlinks.json` → 200, `application/json`
  - [ ] 1.4 Validate via Google API: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.sailbosco.com&relation=delegate_permission/common.handle_all_urls`

- [x] Task 2: Add App Links intent filter to AndroidManifest.xml (AC: #1)
  - [x] 2.1 Add `android:autoVerify="true"` intent filter for `https://www.sailbosco.com`
  - [x] 2.2 Verify no conflict with existing 4 intent filters from Story 6.2

- [x] Task 3: Exclude `.well-known` from middleware matcher (AC: #2)
  - [x] 3.1 Update middleware matcher regex to exclude `.well-known` paths

- [x] Task 4: Create deep link handler — `src/lib/native/deep-link-handler.ts` (AC: #4, #5, #6)
  - [x] 4.1 Listen for `appUrlOpen` event from `@capacitor/app` (already installed)
  - [x] 4.2 On event: extract path from URL, navigate via `window.location.href`
  - [x] 4.3 Call `App.getLaunchUrl()` on init for cold-start deep link handling
  - [x] 4.4 Guard all code with `isNative` from `src/lib/platform.ts`

- [x] Task 5: Initialize deep link handler in app lifecycle (AC: #5, #6)
  - [x] 5.1 Create `src/components/native/NativeDeepLinkListener.tsx` — client component
  - [x] 5.2 Add to root layout (`src/app/layout.tsx`) alongside existing `NativeShareListener`

- [x] Task 6: Write tests (AC: #1–#6)
  - [x] 6.1 Unit test `src/lib/native/deep-link-handler.test.ts` — appUrlOpen handling, getLaunchUrl cold start, path extraction, isNative guard
  - [x] 6.2 Verify all existing tests pass (448+ tests, zero regressions)

- [x] Task 7: Validate (AC: #1–#6)
  - [x] 7.1 `npm run build && npx cap sync` — zero errors
  - [x] 7.2 `npx tsc --noEmit` — zero type errors
  - [ ] 7.3 Manual: `adb shell pm verify-app-links --re-verify com.sailbosco.app` then `adb shell pm get-app-links --user cur com.sailbosco.app` → `www.sailbosco.com: verified`
  - [ ] 7.4 Manual: `adb shell am start -W -a android.intent.action.VIEW -d "https://www.sailbosco.com/auth/confirm?code=test" com.sailbosco.app` → app opens, navigates to auth confirm
  - [ ] 7.5 Manual: tap a magic link in Gmail on emulator → Bosco app opens → user is authenticated → lands on dashboard

## Dev Notes

### Why This Story Exists — The Blocker

Story 6.2 testing revealed: when a user taps a magic link email, Android opens it in **Chrome** instead of the Bosco app WebView. Chrome and the app have separate session storage — authentication completes in Chrome but the Bosco app remains unauthenticated. This blocks the core flow (share GPX → authenticate → import) and Play Store submission (Story 6.A3).

Android App Links solve this by making the OS intercept `sailbosco.com` URLs and route them to the Bosco app instead of Chrome.

[Source: sprint-change-proposal-2026-04-01-deep-linking.md]

### Architecture: How App Links Work

Android App Links require two things:

1. **Server side:** `/.well-known/assetlinks.json` — tells Android "this app is authorized to handle URLs from this domain"
2. **Client side:** `android:autoVerify="true"` on an ACTION_VIEW intent filter — tells Android "verify this domain at install time"

When a user installs the app, Android fetches `assetlinks.json` from the declared domain, validates the SHA256 fingerprint matches the app's signing certificate, and registers the app as the default handler for that domain's URLs. No disambiguation dialog — the app opens directly.

**No custom deep link routing needed.** Capacitor's WebView already loads `sailbosco.com`. The `@capacitor/app` plugin fires `appUrlOpen` with the intercepted URL. The JS handler navigates the WebView to the correct path — the web router (Next.js) handles everything from there.

[Source: architecture.md#Deep Linking Architecture]

### `public/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.sailbosco.app",
    "sha256_cert_fingerprints": [
      "DEBUG_FINGERPRINT_HERE"
    ]
  }
}]
```

**Get debug fingerprint:**
```bash
keytool -list -v \
  -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android
```

Copy the SHA256 line (format: `14:6D:E9:83:C5:73:...`).

**Production fingerprint (Story 6.A3):** When the app is uploaded to Google Play, get the signing key fingerprint from **Play Console → Release → Setup → App signing → "App signing key certificate" → SHA-256**. Add it to the `sha256_cert_fingerprints` array alongside the debug fingerprint.

**Multiple fingerprints are supported:** Keep both debug and production fingerprints in the array. This allows testing with debug builds while production works too.

### AndroidManifest.xml — App Links Intent Filter

Add inside `<activity>` for `.MainActivity`, **after** the existing intent filters from Story 6.2:

```xml
<!-- App Links: Deep link sailbosco.com URLs into the app -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="www.sailbosco.com" />
</intent-filter>
```

**Critical details:**
- `android:autoVerify="true"` triggers Android's domain verification at install time
- **Host is `www.sailbosco.com`** — must match the canonical domain (the one that serves content without redirecting). The Capacitor config uses `www.sailbosco.com` as `server.url`, and `SITE_URL` env var builds magic link URLs with this host.
- `android:scheme="https"` only — no http
- `android:pathPrefix` is intentionally omitted — ALL paths on this domain should open in the app

**No conflict with existing intent filters.** Story 6.2's intent filters handle `content://` scheme (file shares). This filter handles `https://` scheme (URL links). Android matches on scheme + host + MIME type separately.

### Domain Verification — `www` vs Non-`www`

**Android treats `www.sailbosco.com` and `sailbosco.com` as separate hosts.** Verification is per-host, and **redirects are NOT followed** during verification.

**Determine the canonical domain first.** Check Vercel dashboard or test:
```bash
curl -I https://sailbosco.com/.well-known/assetlinks.json
# If 301 redirect → sailbosco.com redirects to www → DO NOT declare sailbosco.com in manifest
curl -I https://www.sailbosco.com/.well-known/assetlinks.json
# If 200 → www.sailbosco.com is canonical → use this in manifest
```

**If Vercel redirects non-www to www:** Only declare `www.sailbosco.com` in the manifest (as shown above). Magic links use `SITE_URL` which includes `www`, so this covers the auth flow.

**If both domains serve content without redirect:** Add a second `<data>` element:
```xml
<data android:scheme="https" android:host="www.sailbosco.com" />
<data android:scheme="https" android:host="sailbosco.com" />
```

### Middleware Exclusion

The current middleware matcher in `src/middleware.ts` runs on all paths including `.well-known`:

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Update to exclude `.well-known`:**

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

This prevents unnecessary Supabase session refresh on static JSON and ensures no future middleware changes can break Android domain verification. The `.well-known/assetlinks.json` file will be served as a pure static file from `public/`.

### Deep Link Handler — `src/lib/native/deep-link-handler.ts`

```typescript
import { isNative } from '@/lib/platform';
import { App } from '@capacitor/app';

function handleAppUrl(url: string) {
  try {
    const parsed = new URL(url);
    // Navigate to the path within the app's WebView
    window.location.href = parsed.pathname + parsed.search + parsed.hash;
  } catch {
    // Invalid URL — ignore silently
  }
}

export function initDeepLinkListener() {
  if (!isNative) return;

  // Warm start: app is already running, user taps an external link
  App.addListener('appUrlOpen', (event) => {
    handleAppUrl(event.url);
  });

  // Cold start: app launched via deep link
  App.getLaunchUrl().then((result) => {
    if (result?.url) {
      handleAppUrl(result.url);
    }
  });
}
```

**Key points:**
- `App` from `@capacitor/app` is **already installed** (Story 6.2 added it)
- `handleAppUrl` extracts path+search+hash and navigates the WebView — Next.js handles routing
- `getLaunchUrl()` returns the URL that launched the app (cold start only)
- `addListener('appUrlOpen')` fires on warm start when a new URL is intercepted
- For auth flow: `window.location.href = '/auth/confirm?code=xxx'` → hits the route handler → exchanges code for session → redirects to dashboard

**Import note:** `@capacitor/app` is imported directly here (not through a local plugin wrapper) because it's a standard Capacitor plugin, not a custom one. The containment rule applies to `@capacitor/core` — plugins can be imported in `src/lib/native/`.

### NativeDeepLinkListener Component

`src/components/native/NativeDeepLinkListener.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { isNative } from '@/lib/platform';

export default function NativeDeepLinkListener() {
  useEffect(() => {
    if (!isNative) return;
    import('@/lib/native/deep-link-handler').then(({ initDeepLinkListener }) => {
      initDeepLinkListener();
    });
  }, []);

  return null;
}
```

Same pattern as `NativeShareListener.tsx` — dynamic import to avoid bundling `@capacitor/app` for web users.

### Root Layout Integration

In `src/app/layout.tsx`, add alongside existing `NativeShareListener`:

```tsx
<NativeShareListener />
<NativeDeepLinkListener />
```

### GpxReceivePlugin.java — No Changes Needed But Be Aware

The existing `GpxReceivePlugin.java` handles `ACTION_VIEW` intents for file URIs. When an App Link fires (ACTION_VIEW with `https://` URI), GpxReceivePlugin will try to process it:
1. `handleIntent()` sees `ACTION_VIEW`
2. Gets `uri = intent.getData()` → `https://www.sailbosco.com/...`
3. `readContentFromUri(uri)` → `ContentResolver.openInputStream()` fails for `https://` scheme
4. Exception caught → silently returns

This is harmless — `@capacitor/app` independently receives the intent and fires `appUrlOpen`. Both plugins handle the intent in parallel; GpxReceivePlugin's failure doesn't affect AppPlugin.

**Optional optimization (not required):** Add a scheme check in `handleIntent()`:
```java
if (uri == null || "https".equals(uri.getScheme()) || "http".equals(uri.getScheme())) return;
```
This skips URL intents and only processes `content://` file URIs. Nice-to-have but not necessary for correctness.

### Testing Strategy

**Unit tests (`deep-link-handler.test.ts`):**
```
- initDeepLinkListener calls App.addListener('appUrlOpen', ...)
- initDeepLinkListener calls App.getLaunchUrl()
- appUrlOpen event → window.location.href set to extracted path
- getLaunchUrl result → window.location.href set to extracted path
- No-op when isNative is false (no App.addListener called)
- Handles invalid URLs gracefully (no throw)
- Extracts path + query + hash correctly from full URL
```

Mock `@capacitor/app` the same way Story 6.2 mocked `@capacitor/core`:
```typescript
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(),
    getLaunchUrl: vi.fn().mockResolvedValue(null),
  },
}));
```

**Manual tests (Android emulator):**
```bash
# 1. Deploy assetlinks.json to production first (or use staging)

# 2. Install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# 3. Reset and re-verify domain
adb shell pm set-app-links --package com.sailbosco.app 0 all
adb shell pm verify-app-links --re-verify com.sailbosco.app

# 4. Wait 20 seconds, then check status
adb shell pm get-app-links --user cur com.sailbosco.app
# Expected: www.sailbosco.com: verified

# 5. Test deep link
adb shell am start -W -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "https://www.sailbosco.com/auth/confirm?code=test" \
  com.sailbosco.app
# Expected: app opens, navigates to /auth/confirm?code=test

# 6. Test magic link flow end-to-end
# Open Gmail in emulator → tap magic link → Bosco app opens → authenticated
```

**Regression:**
- All existing 448+ tests pass
- `npm run build` succeeds
- `npx cap sync` succeeds
- `npx tsc --noEmit` clean
- GPX share target still works (Story 6.2 unchanged)

### File Placement

```
public/.well-known/
└── assetlinks.json                      # NEW: Android App Links verification

src/lib/native/
├── gpx-receive.ts                       # UNCHANGED (Story 6.2)
├── gpx-receive.test.ts                  # UNCHANGED
├── share-intent-handler.ts              # UNCHANGED
├── share-intent-handler.test.ts         # UNCHANGED
├── deep-link-handler.ts                 # NEW: appUrlOpen → WebView navigation
└── deep-link-handler.test.ts            # NEW: Unit tests

src/components/native/
├── NativeShareListener.tsx              # UNCHANGED (Story 6.2)
└── NativeDeepLinkListener.tsx           # NEW: Root-level deep link listener

android/app/src/main/
└── AndroidManifest.xml                  # MODIFIED: Add autoVerify intent filter

src/middleware.ts                        # MODIFIED: Exclude .well-known from matcher
src/app/layout.tsx                       # MODIFIED: Add NativeDeepLinkListener
```

### Existing Code — DO NOT Modify

- `src/lib/auth.ts` — signIn with magic link → already uses `SITE_URL` for redirect
- `src/app/auth/confirm/route.ts` — exchanges code for session → already works correctly
- `src/app/auth/confirm/redirect.ts` — validates post-auth redirect path
- `src/lib/native/share-intent-handler.ts` — GPX share handling (separate concern)
- `capacitor.config.ts` — No Capacitor config changes needed for App Links
- `GpxReceivePlugin.java` — Optional optimization only, not required

### What Story 6.A3 Will Need (Context)

Story 6.A3 (Play Store Submission) must:
1. Create a release keystore and sign the AAB
2. Upload to Google Play Console
3. Get the **Play App Signing key fingerprint** from Console
4. Add the production fingerprint to `assetlinks.json` alongside the debug fingerprint
5. Re-deploy to Vercel so the updated `assetlinks.json` is live before users install from Play Store

### Previous Story Learnings (6.1 + 6.2)

- `@capacitor/app@6.0.3` is already installed — do NOT re-install
- `@capacitor/core` v6.2.1 SSR-safe via `globalThis` fallback — `typeof window` guard still used in `platform.ts`
- Dynamic imports in components prevent bundling native code for web users — follow same pattern
- `vi.doMock` + `vi.resetModules` needed for per-test `isNative` mock override
- Android package name is `com.sailbosco.app` (in `build.gradle`, not manifest)
- `npx cap sync` after manifest changes to propagate to build
- `notifyListeners` third arg `true` retains events until JS attaches — `getLaunchUrl()` is the equivalent for `@capacitor/app`
- Code review found cold-start double fire issue in Story 6.2 — `getLaunchUrl()` and `appUrlOpen` may both fire for the same URL. Add dedup guard if testing reveals double navigation.

### Android 12+ Verification Behavior

- Android 12+ verifies each host **independently** (failure of one doesn't block others)
- Verification requires internet at install time — runs asynchronously
- Allow ~20 seconds after install before checking verification status
- `assetlinks.json` must return HTTP 200 directly — **no redirects**
- Content-Type must be `application/json` (Next.js/Vercel serves `.json` files correctly by default)

### References

- [Source: architecture.md#Deep Linking Architecture] — assetlinks.json spec, route handling strategy
- [Source: epics.md#Story 6.A4] — Acceptance criteria
- [Source: prd.md#FR-48] — Deep linking requirement
- [Source: prd.md#Native Capabilities] — Deep linking listed as v1.0 capability
- [Source: ux-design-specification.md#Deep Linking UX] — Behavior spec + smart banner fallback
- [Source: sprint-change-proposal-2026-04-01-deep-linking.md] — Blocker discovery, story rationale
- [Source: 6-2-android-gpx-share-target-intent-filter.md] — Previous story: @capacitor/app installed, GpxReceivePlugin, manifest state
- [Source: 6-1-capacitor-project-setup-and-android-build.md] — Capacitor 6.x setup, platform.ts, package config
- [Android Developers: Verify App Links](https://developer.android.com/training/app-links/verify-applinks)
- [Android Developers: Add App Links intent filters](https://developer.android.com/training/app-links/add-applinks)
- [Capacitor: Deep Linking guide](https://capacitorjs.com/docs/guides/deep-links)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- `keytool` extracted SHA256 fingerprint from `~/.android/debug.keystore`: `94:42:E7:39:E6:78:9A:67:...`
- Static import of `@capacitor/app` in handler (consistent with `share-intent-handler.ts` pattern), dynamic import at component level
- `handleAppUrl` includes same-URL dedup: skips navigation if current `pathname+search+hash` matches target
- `vi.doMock` + `vi.resetModules` pattern for per-test `isNative` toggle (consistent with Story 6.2 test pattern)
- No new dependencies — `@capacitor/app@6.0.3` already installed from Story 6.2
- Code review fix: GpxReceivePlugin scheme guard prevents intent clearing for https:// URIs (was breaking AppPlugin cold-start read)
- Code review fix: `lastHandledUrl` dedup prevents double navigation when both getLaunchUrl() and appUrlOpen fire same URL on cold start

### Completion Notes List

- Created `public/.well-known/assetlinks.json` with debug keystore SHA256 fingerprint for Android App Links verification
- Added `android:autoVerify="true"` intent filter to AndroidManifest.xml for `https://www.sailbosco.com` — no conflict with existing 4 Story 6.2 intent filters (different scheme: `https://` vs `content://`)
- Updated middleware matcher regex in `src/middleware.ts` to exclude `.well-known` paths — prevents unnecessary Supabase session refresh on static JSON
- Created `src/lib/native/deep-link-handler.ts` — listens for `appUrlOpen` (warm start) and `getLaunchUrl()` (cold start), extracts path+search+hash from URL, navigates WebView via `window.location.href`
- Created `src/components/native/NativeDeepLinkListener.tsx` — root-level client component with dynamic import guard (same pattern as NativeShareListener)
- Added `<NativeDeepLinkListener />` to `src/app/layout.tsx` alongside existing NativeShareListener
- 8 new unit tests covering: listener registration, getLaunchUrl cold start, URL path extraction, path+query+hash parsing, same-URL dedup, invalid URL handling, isNative=false guard
- Full regression: 457/457 tests pass (9 new + 448 existing), tsc --noEmit clean, build OK, cap sync OK
- Tasks 1.3, 1.4, 7.3, 7.4, 7.5 are manual post-deployment validations (require Vercel deploy + Android emulator)
- Code review fix: Added https/http scheme guard in GpxReceivePlugin.java handleIntent() and checkIntent() — prevents intent clearing that would break AppPlugin's getLaunchUrl() on cold start
- Code review fix: Added `lastHandledUrl` deduplication in deep-link-handler.ts — prevents double `window.location.href` assignment when both appUrlOpen and getLaunchUrl fire the same URL
- Code review fix: Added deduplication test (appUrlOpen + getLaunchUrl both fire same URL → hrefSetter called once)

### File List

- `public/.well-known/assetlinks.json` — NEW: Android App Links domain verification file with debug keystore fingerprint
- `android/app/src/main/AndroidManifest.xml` — MODIFIED: Added autoVerify intent filter for https://www.sailbosco.com
- `android/app/src/main/java/com/sailbosco/app/GpxReceivePlugin.java` — MODIFIED: Added https/http scheme guard in handleIntent() and checkIntent()
- `src/middleware.ts` — MODIFIED: Added .well-known to middleware matcher exclusion
- `src/lib/native/deep-link-handler.ts` — NEW: Deep link handler with URL dedup (appUrlOpen + getLaunchUrl → WebView navigation)
- `src/lib/native/deep-link-handler.test.ts` — NEW: 9 unit tests for deep link handler including dedup
- `src/components/native/NativeDeepLinkListener.tsx` — NEW: Root-level deep link listener component
- `src/app/layout.tsx` — MODIFIED: Added NativeDeepLinkListener import and render

### Change Log

- 2026-04-01: Story 6.A4 implemented — Android App Links deep linking via assetlinks.json + autoVerify intent filter + JS deep link handler
- 2026-04-01: Code review fixes — GpxReceivePlugin scheme guard (High), deep-link-handler URL dedup (Medium), 1 new test
