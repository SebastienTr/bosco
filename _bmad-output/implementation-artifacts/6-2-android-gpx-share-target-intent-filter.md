# Story 6.2: Android GPX Share Target (Intent Filter)

Status: done

## Story

As a sailor on Android,
I want to share a GPX file from Navionics directly to Bosco,
So that I can import tracks without manual file picking.

## Acceptance Criteria

1. **Given** the Android app is installed, **When** the user exports from Navionics and selects "Bosco" in the share sheet, **Then** the Bosco app opens and receives the GPX file.

2. **Given** a GPX file is shared to Bosco, **When** the app receives the file, **Then** the import preview screen shows with the received file pre-loaded (same flow as file picker import).

3. **Given** a GPX file is shared, **When** the import flow completes, **Then** it works identically to the file picker flow (preview → select tracks → confirm → imported).

4. **Given** the intent filter configuration, **When** inspecting handled MIME types, **Then** `application/gpx+xml`, `application/octet-stream`, and `text/xml` are all handled for ACTION_SEND, and `application/gpx+xml` is handled for ACTION_VIEW.

5. **Given** a user shares a GPX file without being authenticated, **When** the share flow starts, **Then** the file is preserved and the user is redirected to sign in, then returned to the import flow with the file intact (FR-15).

6. **Given** the native share target, **When** the app receives a file on cold start (app not running), **Then** the intent is processed and the import flow begins (no lost intents).

7. **Given** the native share target, **When** the app receives a file while already running (warm start), **Then** the new intent is processed and the import flow begins.

## Tasks / Subtasks

- [x] Task 1: Install `@capacitor/app` plugin (AC: #1)
  - [x] 1.1 `npm i @capacitor/app@^6`
  - [x] 1.2 `npx cap sync` to register plugin in Android project

- [x] Task 2: Add intent filters to AndroidManifest.xml (AC: #1, #4)
  - [x] 2.1 Add ACTION_SEND intent-filter for `application/gpx+xml` on MainActivity
  - [x] 2.2 Add ACTION_SEND intent-filter for `application/octet-stream`
  - [x] 2.3 Add ACTION_SEND intent-filter for `text/xml`
  - [x] 2.4 Add ACTION_VIEW intent-filter for `application/gpx+xml` with `content` scheme
  - [x] 2.5 Verify `android:launchMode="singleTask"` is set on MainActivity (already present from Story 6.1)

- [x] Task 3: Create custom local Capacitor plugin — `GpxReceivePlugin.java` (AC: #1, #6, #7)
  - [x] 3.1 Create `android/app/src/main/java/com/sailbosco/app/GpxReceivePlugin.java`
  - [x] 3.2 Implement `load()` to check cold-start intent via `getActivity().getIntent()`
  - [x] 3.3 Override `handleOnNewIntent(Intent)` for warm-start intents
  - [x] 3.4 Extract content:// URI from `intent.getParcelableExtra(Intent.EXTRA_STREAM)` (ACTION_SEND) or `intent.getData()` (ACTION_VIEW)
  - [x] 3.5 Read file content via `getActivity().getContentResolver().openInputStream(uri)`
  - [x] 3.6 Extract filename from URI metadata via ContentResolver query
  - [x] 3.7 Fire `notifyListeners("gpxFileReceived", data, true)` — `true` retains event until JS listener attaches (critical for cold start)
  - [x] 3.8 Add `@PluginMethod` `checkIntent()` for polling from JS as fallback

- [x] Task 4: Register plugin in MainActivity (AC: #1)
  - [x] 4.1 Override `onCreate` in `android/app/src/main/java/com/sailbosco/app/MainActivity.java`
  - [x] 4.2 Call `registerPlugin(GpxReceivePlugin.class)` before `super.onCreate()`

- [x] Task 5: Create JS plugin registration — `src/lib/native/gpx-receive.ts` (AC: #1, #2)
  - [x] 5.1 Define `GpxReceivePlugin` TypeScript interface with `addListener('gpxFileReceived', ...)` and `checkIntent()`
  - [x] 5.2 Use `registerPlugin<GpxReceivePlugin>('GpxReceive')` from `@capacitor/core`
  - [x] 5.3 Web platform stub returns no-op (plugin only runs on Android)

- [x] Task 6: Create share intent handler — `src/lib/native/share-intent-handler.ts` (AC: #2, #5, #6, #7)
  - [x] 6.1 Listen for `gpxFileReceived` event from the GpxReceive plugin
  - [x] 6.2 On event: create a `Response` with the GPX content, store in Cache API at key `/shared-gpx` in cache `bosco-share-target` (same keys as PWA share target)
  - [x] 6.3 Navigate to `/share-target?shared=1` — existing ShareTargetHandler handles the rest
  - [x] 6.4 Call `checkIntent()` on init for cold-start fallback
  - [x] 6.5 Guard all code with `isNative` from `src/lib/platform.ts`

- [x] Task 7: Initialize share intent handler in app lifecycle (AC: #6, #7)
  - [x] 7.1 Create `src/components/native/NativeShareListener.tsx` — client component that calls the handler on mount
  - [x] 7.2 Render `<NativeShareListener />` in the root layout (`src/app/layout.tsx`) inside a `{isNative && ...}` guard or with internal guard
  - [x] 7.3 Ensure listener survives navigation (mounted at root, not per-page)

- [x] Task 8: Write tests (AC: #1–#7)
  - [x] 8.1 Unit test `src/lib/native/gpx-receive.test.ts` — plugin registration and type exports
  - [x] 8.2 Unit test `src/lib/native/share-intent-handler.test.ts` — Cache API storage, navigation trigger, cold/warm start handling
  - [x] 8.3 Verify all existing tests pass (436+ tests, zero regressions)

- [x] Task 9: Validate end-to-end (AC: #1–#7)
  - [x] 9.1 `npm run build && npx cap sync` — zero errors
  - [x] 9.2 `npx tsc --noEmit` — zero type errors
  - [x] 9.3 Manual: Share a .gpx file from Android file manager to Bosco → Bosco opens and share flow triggers (auth page shown — full import preview requires deep linking for auth, deferred to Story 6.5)
  - [ ] 9.4 Manual: Share from Navionics (if available) → same result (not testable on emulator, Navionics not installable)
  - [x] 9.5 Manual: Share while not authenticated → auth page displayed correctly (FR-15 confirmed, file preserved in Cache API)

## Dev Notes

### Critical Architecture: Why a Custom Local Plugin

**`@capacitor/app` is NOT sufficient.** The `appUrlOpen` listener only handles `ACTION_VIEW` intents (deep links). It explicitly ignores `ACTION_SEND` intents — see [AppPlugin.java source](https://github.com/ionic-team/capacitor-plugins/blob/main/app/android/src/main/java/com/capacitorjs/plugins/app/AppPlugin.java):

```java
String action = intent.getAction();
Uri url = intent.getData();
if (!Intent.ACTION_VIEW.equals(action) || url == null) {
    return;  // ACTION_SEND is silently dropped
}
```

**Community plugins are not viable for Capacitor 6:**
- `send-intent` (carsten-klaffke): master branch requires Capacitor 8+
- `@capgo/capacitor-share-target` v6: unmaintained
- `@capawesome-team/capacitor-share-target`: paid license, Capacitor 8+ only

**Solution: Local Capacitor plugin.** A single Java file in the Android project that:
1. Intercepts ACTION_SEND and ACTION_VIEW intents
2. Reads file content from `content://` URI via Android's `ContentResolver`
3. Passes content to JavaScript via `notifyListeners()`

This is Capacitor's recommended approach for project-specific native functionality. No npm package needed.

### GpxReceivePlugin.java — Implementation Guide

```java
package com.sailbosco.app;

import android.content.Intent;
import android.net.Uri;
import android.database.Cursor;
import android.provider.OpenableColumns;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

@CapacitorPlugin(name = "GpxReceive")
public class GpxReceivePlugin extends Plugin {

    @Override
    public void load() {
        // Handle cold-start intent (app launched via share)
        handleIntent(getActivity().getIntent());
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        // Handle warm-start intent (app already running)
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();

        Uri uri = null;
        if (Intent.ACTION_SEND.equals(action)) {
            uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        } else if (Intent.ACTION_VIEW.equals(action)) {
            uri = intent.getData();
        }

        if (uri == null) return;

        try {
            String content = readContentFromUri(uri);
            String filename = getFilenameFromUri(uri);

            if (content != null && !content.isEmpty()) {
                JSObject data = new JSObject();
                data.put("content", content);
                data.put("filename", filename != null ? filename : "shared.gpx");
                // true = retain until JS listener attaches (critical for cold start)
                notifyListeners("gpxFileReceived", data, true);
            }
        } catch (Exception e) {
            // Log but don't crash — user can still use file picker
        }
    }

    private String readContentFromUri(Uri uri) throws Exception {
        InputStream inputStream = getActivity().getContentResolver().openInputStream(uri);
        if (inputStream == null) return null;
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append('\n');
        }
        reader.close();
        inputStream.close();
        return sb.toString();
    }

    private String getFilenameFromUri(Uri uri) {
        String filename = null;
        if ("content".equals(uri.getScheme())) {
            Cursor cursor = getActivity().getContentResolver().query(uri, null, null, null, null);
            if (cursor != null) {
                try {
                    if (cursor.moveToFirst()) {
                        int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                        if (nameIndex >= 0) {
                            filename = cursor.getString(nameIndex);
                        }
                    }
                } finally {
                    cursor.close();
                }
            }
        }
        if (filename == null) {
            filename = uri.getLastPathSegment();
        }
        return filename;
    }

    @PluginMethod
    public void checkIntent(PluginCall call) {
        // Fallback: JS can poll this method on startup
        Intent intent = getActivity().getIntent();
        if (intent == null) {
            call.resolve();
            return;
        }
        String action = intent.getAction();
        Uri uri = null;
        if (Intent.ACTION_SEND.equals(action)) {
            uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        } else if (Intent.ACTION_VIEW.equals(action)) {
            uri = intent.getData();
        }
        if (uri == null) {
            call.resolve();
            return;
        }
        try {
            String content = readContentFromUri(uri);
            String filename = getFilenameFromUri(uri);
            JSObject result = new JSObject();
            result.put("content", content);
            result.put("filename", filename != null ? filename : "shared.gpx");
            call.resolve(result);
            // Clear intent to prevent re-processing
            getActivity().setIntent(new Intent());
        } catch (Exception e) {
            call.reject("Failed to read shared file", e);
        }
    }
}
```

**Key details:**
- `notifyListeners("gpxFileReceived", data, true)` — the third arg `true` retains the event until a JS listener attaches. **Critical for cold start** where JS loads after the intent fires.
- `checkIntent()` is a `@PluginMethod` — JS can call it imperatively as a fallback.
- `getActivity().setIntent(new Intent())` in `checkIntent()` clears the intent to prevent re-processing on config changes.
- No dependency on `@capacitor/filesystem` — reads directly via `ContentResolver`.

### MainActivity.java — Plugin Registration

```java
package com.sailbosco.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GpxReceivePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
```

### AndroidManifest.xml — Intent Filters

Add inside the `<activity>` tag for `.MainActivity`, **after** the existing launcher intent-filter:

```xml
<!-- GPX Share Target: ACTION_SEND from apps like Navionics -->
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="application/gpx+xml" />
</intent-filter>
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="application/octet-stream" />
</intent-filter>
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="text/xml" />
</intent-filter>

<!-- GPX File Open: ACTION_VIEW from file managers -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="content" />
    <data android:mimeType="application/gpx+xml" />
</intent-filter>
```

**MIME type strategy:**
| MIME | Why |
|------|-----|
| `application/gpx+xml` | Official GPX MIME type |
| `application/octet-stream` | Fallback used by many file managers for unknown extensions |
| `text/xml` | Some apps classify GPX as generic XML |

**Do NOT add `*/*`** — too broad, would make Bosco appear as a target for all file shares.

### JS Integration — Convergence with PWA Share Target

The native flow converges with the existing PWA share target at the Cache API layer:

```
Native Android path:
  Intent → GpxReceivePlugin (Java) → notifyListeners → JS handler
  → Store content in Cache API → navigate to /share-target?shared=1
  → ShareTargetHandler reads from Cache API → GpxImporter auto-import

PWA Share Target path:
  Share sheet → service worker → Cache API → /share-target
  → ShareTargetHandler reads from Cache API → GpxImporter auto-import
```

Both paths store the file in Cache API using the same keys:
- **Cache name:** `"bosco-share-target"` (constant `SHARE_CACHE` in `ShareTargetHandler.tsx`)
- **Cache key:** `"/shared-gpx"` (constant `SHARE_KEY` in `ShareTargetHandler.tsx`)

**`src/lib/native/gpx-receive.ts`** — Plugin registration:
```typescript
import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface GpxFileReceivedEvent {
  content: string;
  filename: string;
}

export interface GpxReceivePlugin {
  addListener(
    event: 'gpxFileReceived',
    listener: (data: GpxFileReceivedEvent) => void
  ): Promise<PluginListenerHandle>;
  checkIntent(): Promise<GpxFileReceivedEvent | null>;
}

const GpxReceive = registerPlugin<GpxReceivePlugin>('GpxReceive');
export default GpxReceive;
```

**`src/lib/native/share-intent-handler.ts`** — Bridge to existing share flow:
```typescript
import { isNative } from '@/lib/platform';
import GpxReceive from './gpx-receive';
import type { GpxFileReceivedEvent } from './gpx-receive';

const SHARE_CACHE = 'bosco-share-target';
const SHARE_KEY = '/shared-gpx';

async function handleGpxReceived(data: GpxFileReceivedEvent) {
  const blob = new Blob([data.content], { type: 'application/gpx+xml' });
  const response = new Response(blob, {
    headers: { 'Content-Type': 'application/gpx+xml' },
  });
  const cache = await caches.open(SHARE_CACHE);
  await cache.put(SHARE_KEY, response);
  window.location.href = '/share-target?shared=1';
}

export function initShareIntentListener() {
  if (!isNative) return;

  // Listen for warm-start intents
  GpxReceive.addListener('gpxFileReceived', handleGpxReceived);

  // Check for cold-start intent (fallback if retained event missed)
  GpxReceive.checkIntent().then((result) => {
    if (result?.content) {
      handleGpxReceived(result);
    }
  });
}
```

**`src/components/native/NativeShareListener.tsx`** — Root-level listener:
```typescript
'use client';

import { useEffect } from 'react';
import { isNative } from '@/lib/platform';

export default function NativeShareListener() {
  useEffect(() => {
    if (!isNative) return;
    import('@/lib/native/share-intent-handler').then(({ initShareIntentListener }) => {
      initShareIntentListener();
    });
  }, []);

  return null;
}
```

Use dynamic import to avoid bundling native code for web users.

### File Placement & Containment

```
src/lib/native/                          # NEW directory — native integration layer
├── gpx-receive.ts                       # Capacitor plugin registration
├── gpx-receive.test.ts                  # Plugin interface tests
├── share-intent-handler.ts              # Bridge: plugin event → Cache API → navigation
└── share-intent-handler.test.ts         # Handler logic tests

src/components/native/                   # NEW directory — native-only components
└── NativeShareListener.tsx              # Root-level intent listener

android/app/src/main/java/com/sailbosco/app/
├── MainActivity.java                    # MODIFIED: register GpxReceivePlugin
└── GpxReceivePlugin.java               # NEW: custom Capacitor plugin
```

**Containment rule:** All native-specific imports (`@capacitor/core`, `@capacitor/app`) stay inside `src/lib/native/` and `src/lib/platform.ts`. Components import from `src/lib/native/`, never from `@capacitor/*` directly. This mirrors the Supabase 3-tier containment pattern.

### Existing Code — DO NOT Modify

These files already handle the share flow correctly. The native path converges at the Cache API layer — no changes needed:

- `src/app/share-target/ShareTargetHandler.tsx` — Reads from Cache API, handles auth redirect, routes to import
- `src/app/share-target/page.tsx` — Entry page for share target
- `src/components/gpx/GpxImporter.tsx` — Auto-import from Cache API when `autoImportFromShare=true`
- `src/app/dashboard/SharePendingRedirect.tsx` — Detects pending share after auth
- `src/app/manifest.ts` — PWA share target config (coexists with native)

### Cache API Constants (Reuse — Do Not Duplicate)

The constants are defined in `src/app/share-target/ShareTargetHandler.tsx`:
```typescript
const SHARE_CACHE = "bosco-share-target";
const SHARE_KEY = "/shared-gpx";
```

These same values must be used in `share-intent-handler.ts`. If they're currently defined inline (not exported), extract them to a shared location like `src/lib/constants.ts` or define them independently in the handler (acceptable since they're simple strings that rarely change).

### Auth Flow for Unauthenticated Share (FR-15)

The existing `ShareTargetHandler` already handles this:
1. User shares GPX → file stored in Cache API
2. Navigate to `/share-target?shared=1`
3. ShareTargetHandler detects no auth → sets `localStorage("bosco-share-pending", "true")` → redirects to `/auth`
4. After auth → dashboard loads → `SharePendingRedirect` detects flag → redirects to `/share-target?shared=1`
5. ShareTargetHandler reads from Cache API → routes to import

**No changes needed for auth flow.** The native share handler stores in Cache API exactly like the PWA path, so the existing auth redirect chain works identically.

### Testing Strategy

**Unit tests:**
- `gpx-receive.test.ts`: Verify TypeScript interface, mock `registerPlugin`, verify listener setup
- `share-intent-handler.test.ts`: Mock `GpxReceive`, mock Cache API, verify:
  - Content stored in correct cache/key
  - Navigation triggered to `/share-target?shared=1`
  - No-op when `isNative` is false
  - `checkIntent()` called on init

**Manual tests (Android emulator):**
- Share `.gpx` file from file manager → Bosco appears in share sheet → import preview
- Share `.gpx` from Navionics (if available) → same result
- Share while app is not running (cold start) → app launches → import preview
- Share while app is running (warm start) → import preview
- Share while not authenticated → auth flow → import after sign-in
- Share a non-GPX file → app opens but no import (graceful handling)

**Regression:**
- All existing 436+ tests pass
- `npm run build` succeeds
- `npx cap sync` succeeds
- `npx tsc --noEmit` clean

### What Story 6.A3 Will Need (Context)

Story 6.A3 (Play Store Submission) will require:
- Signed release AAB (Android App Bundle)
- Google Play Developer account ($25 one-time)
- Store listing with screenshots showing the share-to-import flow (this story provides the feature)
- Data safety section (the app loads a website, stores no local data beyond cache)

### Previous Story 6.1 Learnings

From the 6.1 Dev Agent Record:
- `@capacitor/core` v6.2.1 uses `globalThis` fallback chain → SSR-safe, but `typeof window` guard still used
- Android package name is in `build.gradle` (namespace/applicationId), NOT in AndroidManifest.xml
- `npx cap add android` generates the project; updates via `npx cap sync`
- Android test package names were corrected from `com.getcapacitor.myapp` to `com.sailbosco.app` (ensure new files use correct package)
- `cap-web/` is committed for reproducibility (Capacitor requires `webDir` directory)

### References

- [Source: architecture.md#Capacitor Architecture] — Remote URL wrapper pattern, plugin architecture
- [Source: epics.md#Epic 6A, Story 6.2] — Acceptance criteria, user story
- [Source: prd.md#FR-14] — GPX import via OS share sheet on iOS and Android
- [Source: prd.md#FR-15] — File preservation across auth redirect
- [Source: ux-design-specification.md#Creator Loop] — Export Navionics → tap Bosco → preview → confirm → done in under 2 minutes
- [Source: ux-design-specification.md#Critical Success Moments] — First import via share sheet is THE product moment
- [Source: Capacitor Plugin Guide] — Custom native Android code and local plugin registration
- [Source: AppPlugin.java] — Confirms @capacitor/app only handles ACTION_VIEW, not ACTION_SEND

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- `@capacitor/app@6.0.3` installed and synced — 3 Capacitor plugins total (app, splash-screen, status-bar)
- `new Response(blob)` fails in Vitest Node.js environment — switched to `new Response(string)` which is equivalent for text content and works in both environments
- `vi.doMock` + `vi.resetModules` required for per-test `isNative` mock override (static module caching issue)
- TypeScript strict mode required typed mock function signatures instead of `(...args: unknown[])` spread

### Completion Notes List

- Installed `@capacitor/app@6.0.3` plugin for Capacitor event infrastructure
- Added 4 intent filters to AndroidManifest.xml: 3 ACTION_SEND (gpx+xml, octet-stream, text/xml) + 1 ACTION_VIEW (gpx+xml with content scheme)
- Created `GpxReceivePlugin.java` — custom local Capacitor plugin that intercepts ACTION_SEND and ACTION_VIEW intents, reads file content via ContentResolver, fires JS event with `notifyListeners("gpxFileReceived", data, true)` for cold-start safety
- Modified `MainActivity.java` to register GpxReceivePlugin via `registerPlugin()` in `onCreate()`
- Created `src/lib/native/gpx-receive.ts` — TypeScript plugin registration with `GpxReceivePlugin` interface
- Created `src/lib/native/share-intent-handler.ts` — bridges native intent to existing PWA share flow via Cache API (same keys: `bosco-share-target` / `/shared-gpx`), then navigates to `/share-target?shared=1`
- Created `src/components/native/NativeShareListener.tsx` — root-level client component with dynamic import guard for native-only code
- Added `<NativeShareListener />` to `src/app/layout.tsx` alongside existing ServiceWorkerRegistrar
- 12 new unit tests (5 for gpx-receive, 6 for share-intent-handler, 1 for GpxImporter size limit) — all passing
- Full regression: 448/448 tests pass, tsc --noEmit clean, build + cap sync OK
- Tasks 9.3-9.5 marked incomplete — require manual testing on Android emulator (cannot be automated)
- Code review fix: Added `lastProcessedIntent` deduplication in GpxReceivePlugin.java + `processing` flag in share-intent-handler.ts to prevent cold-start double fire (Finding 1)
- Code review fix: Added 400 MB file size check in GpxImporter.tsx autoImportFromShare path (Finding 2)
- Code review fix: Added deduplication test (listener + checkIntent both fire) + oversized shared file test (Finding 3)

### File List

- `android/app/src/main/AndroidManifest.xml` — MODIFIED: Added 4 intent filters for GPX share target
- `android/app/src/main/java/com/sailbosco/app/GpxReceivePlugin.java` — NEW: Custom Capacitor plugin for intent handling (with cold-start dedup)
- `android/app/src/main/java/com/sailbosco/app/MainActivity.java` — MODIFIED: Plugin registration in onCreate()
- `src/lib/native/gpx-receive.ts` — NEW: JS plugin registration and TypeScript interface
- `src/lib/native/gpx-receive.test.ts` — NEW: 5 unit tests for plugin registration
- `src/lib/native/share-intent-handler.ts` — NEW: Bridge intent → Cache API → share-target navigation (with dedup guard)
- `src/lib/native/share-intent-handler.test.ts` — NEW: 6 unit tests for handler logic including deduplication
- `src/components/native/NativeShareListener.tsx` — NEW: Root-level listener component
- `src/components/gpx/GpxImporter.tsx` — MODIFIED: Added 400 MB size check on autoImportFromShare path
- `src/components/gpx/GpxImporter.test.tsx` — MODIFIED: Added oversized shared file test
- `src/app/layout.tsx` — MODIFIED: Added NativeShareListener import and render
- `package.json` — MODIFIED: Added @capacitor/app dependency

### Change Log

- 2026-04-01: Story 6.2 implemented — Android GPX share target via custom Capacitor plugin with intent filter support for ACTION_SEND and ACTION_VIEW
- 2026-04-01: Code review fixes — cold-start intent dedup (Java + JS), 400 MB size limit on share path, 3 new tests
