# Story 6.1: Capacitor Project Setup & Android Build

Status: review

## Story

As a developer,
I want the Capacitor project initialized with Android build working,
So that we have the native app foundation.

## Acceptance Criteria

1. **Given** the existing Next.js project, **When** Capacitor is initialized, **Then** `capacitor.config.ts` exists at repo root and points to `https://www.sailbosco.com`.

2. **Given** Capacitor is initialized, **When** the Android platform is added, **Then** `android/` directory is generated with a valid Android Studio project.

3. **Given** the project is set up, **When** running `npm run build && npx cap sync`, **Then** the command completes without errors.

4. **Given** the Android project exists, **When** opened in Android Studio emulator, **Then** the app opens and loads `sailbosco.com` in the Capacitor WebView.

5. **Given** the Capacitor project, **When** inspecting `src/lib/platform.ts`, **Then** it exports `isNative` (boolean) and `platform` (`'ios' | 'android' | 'web'`) detection utilities.

6. **Given** the Capacitor config, **When** inspecting the plugins section, **Then** `@capacitor/status-bar` and `@capacitor/splash-screen` are installed and configured.

## Tasks / Subtasks

- [x] Task 1: Install Capacitor dependencies (AC: #1, #2)
  - [x] 1.1 Install `@capacitor/core` as a dependency
  - [x] 1.2 Install `@capacitor/cli` as a devDependency
  - [x] 1.3 Install `@capacitor/android` as a dependency
  - [x] 1.4 Install `@capacitor/status-bar` and `@capacitor/splash-screen` as dependencies
  - [x] 1.5 Run `npx cap init` to scaffold — or create `capacitor.config.ts` manually (manual is preferred to avoid overwriting, see Dev Notes)

- [x] Task 2: Create `capacitor.config.ts` (AC: #1)
  - [x] 2.1 Create file at repo root with the exact config from Dev Notes (appId, appName, server.url, plugins)
  - [x] 2.2 Create `cap-web/index.html` — minimal fallback page (required by Capacitor's `webDir` even though unused with `server.url`)

- [x] Task 3: Add Android platform (AC: #2, #3)
  - [x] 3.1 Run `npx cap add android` to generate the `android/` directory
  - [x] 3.2 Verify `android/app/src/main/AndroidManifest.xml` has correct package name `com.sailbosco.app`
  - [x] 3.3 Run `npm run build && npx cap sync` — must complete without errors

- [x] Task 4: Update `.gitignore` (AC: #2)
  - [x] 4.1 Add Android build artifacts to `.gitignore`: `android/app/build/`, `android/.gradle/`, `android/build/`, `android/local.properties`
  - [x] 4.2 Add `cap-web/` to `.gitignore` (generated fallback, not project source)
  - [x] 4.3 Do NOT gitignore `android/` itself — it contains native config that must be committed

- [x] Task 5: Create `src/lib/platform.ts` (AC: #5)
  - [x] 5.1 Create the platform detection utility with `isNative` and `platform` exports
  - [x] 5.2 Add conditional import guard — `@capacitor/core` must not break SSR (server-side rendering). Use dynamic import or check `typeof window`
  - [x] 5.3 Create `src/lib/platform.test.ts` — unit tests for platform detection (mock `@capacitor/core`)

- [x] Task 6: Add npm scripts (AC: #3)
  - [x] 6.1 Add `"cap:sync": "npx cap sync"` to package.json scripts
  - [x] 6.2 Add `"cap:open:android": "npx cap open android"` to package.json scripts

- [x] Task 7: Validate build and sync (AC: #3, #4)
  - [x] 7.1 Run `npm run build && npm run cap:sync` — zero errors
  - [x] 7.2 Run `npx tsc --noEmit` — zero type errors
  - [x] 7.3 Run `npm run test` — zero regressions (existing 430+ tests pass)
  - [x] 7.4 Verify emulator launch with `npx cap open android` (manual validation, document result)

## Dev Notes

### Critical Architecture Decision: Remote URL Wrapper

The Capacitor native app is a **thin shell** wrapping the production website. The app IS `sailbosco.com` loaded in a WebView with native plugins layered on top. This means:

- **No static export needed** — the project uses SSR on Vercel, not `output: 'export'`
- **`server.url`** points to `https://www.sailbosco.com` — all web content served from Vercel
- **`webDir`** is required by Capacitor but unused in normal operation — we create a minimal `cap-web/index.html` placeholder
- **Native plugins** (status bar, splash screen, share in Story 6.2) still work because Capacitor injects its runtime into the WebView
- **Offline**: the app requires network connectivity (offline support is a separate epic — Epic 9)

### Capacitor Version Decision

The architecture document specifies **Capacitor 6.x** (written 2026-03-29). However:

| Version | Min Node | Min Android SDK | Status |
|---------|----------|-----------------|--------|
| 6.x     | 18       | API 22 (5.1)    | Maintenance |
| 7.x     | 20       | API 23 (6.0)    | Stable |
| 8.x     | 22       | API 24 (7.0)    | Latest stable |

**Project has Node 22.21.1** — compatible with all versions.

**Decision: Use Capacitor 6.x** as specified in the architecture document (`@capacitor/core@^6`, `@capacitor/cli@^6`, etc.). Rationale:
- Architecture document is the source of truth
- Widest Android device compatibility (API 22+)
- Most stable/battle-tested with the remote URL pattern
- Upgrading to 7.x or 8.x can be done later as a separate task if needed

Install commands:
```bash
npm i @capacitor/core@^6 @capacitor/android@^6 @capacitor/status-bar@^6 @capacitor/splash-screen@^6
npm i -D @capacitor/cli@^6
```

### Exact `capacitor.config.ts` Content

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sailbosco.app',
  appName: 'Bosco',
  webDir: 'cap-web',
  server: {
    url: 'https://www.sailbosco.com',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#1B2D4F',
    },
    StatusBar: {
      style: 'DARK',
    },
  },
};

export default config;
```

**Key config points:**
- `appId: 'com.sailbosco.app'` — reverse domain, matches architecture spec
- `webDir: 'cap-web'` — minimal fallback directory, NOT `.next/` or `out/`
- `server.url` — production URL, the core of the wrapper architecture
- `backgroundColor: '#1B2D4F'` — navy from the design system (`--color-navy`)
- `cleartext: false` — HTTPS only, no HTTP allowed

### Minimal `cap-web/index.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bosco</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #1B2D4F; color: #FDF6EC; font-family: sans-serif; }
  </style>
</head>
<body>
  <p>Loading Bosco...</p>
</body>
</html>
```

This file is only loaded if the remote URL fails to load (no network). It serves as a fallback. It uses the project's navy + foam colors.

### Platform Detection — `src/lib/platform.ts`

```typescript
import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
```

**SSR Safety:** `@capacitor/core` checks for `window` internally and returns safe defaults on the server (isNative=false, platform='web'). Verify this during implementation — if it throws on SSR, wrap with a `typeof window !== 'undefined'` guard:

```typescript
export const isNative = typeof window !== 'undefined' ? Capacitor.isNativePlatform() : false;
export const platform = (typeof window !== 'undefined' ? Capacitor.getPlatform() : 'web') as 'ios' | 'android' | 'web';
```

**All platform-specific code MUST be isolated in this file** — never import `@capacitor/core` directly from components. This follows the same containment pattern as the Supabase 3-tier architecture.

### `.gitignore` Additions

```gitignore
# Capacitor Android build artifacts
android/app/build/
android/.gradle/
android/build/
android/local.properties

# Capacitor minimal web fallback (generated)
cap-web/
```

**Do NOT gitignore `android/` itself.** The native project directory contains configuration files (AndroidManifest.xml, build.gradle, styles, icons) that are customized and must be version-controlled. `npx cap add android` runs once; updates are done via `npx cap sync`.

### Existing PWA Context — Do NOT Break

The project already has a working PWA setup:
- `src/app/manifest.ts` — Web App Manifest with `share_target` for Android PWA
- `src/app/share-target/ShareTargetHandler.tsx` — Handles GPX files received via PWA share target (Cache API)
- `src/app/dashboard/SharePendingRedirect.tsx` — Handles auth redirect after share

**The Capacitor native app coexists with the PWA.** Users who install the PWA get the web share target. Users who install the native Android app (Story 6.2) will get the intent filter share target. Both paths eventually reach the same import flow. Do not modify any PWA code in this story.

### What Story 6.2 Will Need (Context for Current Story)

Story 6.2 (Android GPX Share Target) will add:
- Intent filter in `android/app/src/main/AndroidManifest.xml` for `application/gpx+xml` and `.gpx` files
- JavaScript handler to process received intent data via `@capacitor/app` plugin
- Navigation to the import preview screen with the received file

This story (6.1) lays the foundation. Ensure the Android project is generated cleanly so Story 6.2 can modify `AndroidManifest.xml` without issues.

### Project Structure After This Story

```
bosco/
├── android/                          # NEW: Generated by Capacitor
│   ├── app/
│   │   └── src/main/
│   │       └── AndroidManifest.xml
│   ├── build.gradle
│   └── ...
├── cap-web/                          # NEW: Minimal fallback (gitignored)
│   └── index.html
├── capacitor.config.ts               # NEW: Capacitor configuration
├── src/
│   └── lib/
│       └── platform.ts               # NEW: Platform detection utility
│       └── platform.test.ts          # NEW: Tests for platform detection
├── package.json                      # MODIFIED: new deps + scripts
├── .gitignore                        # MODIFIED: android build artifacts
└── ... (existing files unchanged)
```

### Testing Requirements

- `src/lib/platform.test.ts` — Mock `@capacitor/core` to test:
  - `isNative` returns `false` on web
  - `platform` returns `'web'` when not in native context
  - Exports are typed correctly
- All existing tests pass (430+ tests, zero regressions)
- Type check clean: `npx tsc --noEmit` passes
- Manual: Android emulator launches and loads sailbosco.com

### References

- [Source: architecture.md#Capacitor Architecture] — Capacitor 6.x decision, config, plugins, platform detection pattern
- [Source: architecture.md#Deep Linking Architecture] — App Links setup (relevant for future, not this story)
- [Source: epics.md#Epic 6A] — Story 6.1 acceptance criteria and epic context
- [Source: prd.md#Native Capabilities] — Capacitor wrapper architecture rationale
- [Source: sprint-change-proposal-2026-03-30.md] — Epic 6 split rationale (6A = Android only)
- [Source: ux-design-specification.md#Native App] — Native onboarding UX (deferred to Story 8.2/Epic 6B)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- `@capacitor/core` v6.2.1 uses `globalThis` fallback chain → SSR-safe in Node.js, but `typeof window` guard added per Dev Notes for extra safety
- `npx cap add android` generates Android project with `namespace`/`applicationId` in `android/app/build.gradle` (not in AndroidManifest.xml — this is the modern Gradle pattern)
- Build + sync validation: zero errors, 436/436 tests pass (5 new platform tests)

### Completion Notes List
- Installed Capacitor 6.x ecosystem: core@6.2.1, cli@6.2.1, android@6.2.1, status-bar@6.0.3, splash-screen@6.0.4
- Created `capacitor.config.ts` with remote URL wrapper pattern (server.url → sailbosco.com)
- Generated Android project via `npx cap add android` — package `com.sailbosco.app` confirmed
- Created `cap-web/index.html` minimal fallback with navy+foam design tokens
- Platform detection utility `src/lib/platform.ts` with SSR guard, 5 unit tests all passing
- Added `cap:sync` and `cap:open:android` npm scripts
- `.gitignore` updated: android build artifacts excluded, android/ source committed
- Full validation: build OK, cap sync OK, tsc --noEmit OK, 436 tests pass (zero regression)
- Subtask 7.4 validated: emulator self-app-dev (API 35) loads sailbosco.com in WebView, splash screen and status bar working
- Code review fix: removed `cap-web/` from .gitignore — must be committed for reproducibility (Capacitor requires `webDir` directory)
- Code review fix: corrected Android test package names from `com.getcapacitor.myapp` to `com.sailbosco.app` and moved files to correct directory structure

### File List
- `capacitor.config.ts` — NEW: Capacitor configuration (remote URL wrapper)
- `cap-web/index.html` — NEW: Minimal fallback page (committed, required by Capacitor webDir)
- `android/` — NEW: Generated Android project (committed, build artifacts gitignored)
- `src/lib/platform.ts` — NEW: Platform detection utility (isNative, platform)
- `src/lib/platform.test.ts` — NEW: Unit tests for platform detection (5 tests)
- `package.json` — MODIFIED: Capacitor dependencies + npm scripts
- `.gitignore` — MODIFIED: Android build artifacts exclusions
- `android/app/src/androidTest/java/com/sailbosco/app/ExampleInstrumentedTest.java` — MODIFIED: Fixed package name
- `android/app/src/test/java/com/sailbosco/app/ExampleUnitTest.java` — MODIFIED: Fixed package name

### Change Log
- 2026-04-01: Story 6.1 implemented — Capacitor 6.x project setup with Android platform, platform detection utility, and build validation
- 2026-04-01: Code review fixes — cap-web/ committed for reproducibility, Android test package names corrected to com.sailbosco.app
