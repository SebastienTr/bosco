# Story 2.5: PWA & Web Share Target

Status: review

## Story

As a sailor using Android,
I want Bosco to appear in my phone's share sheet when I export from Navionics,
So that I can import tracks in 2 minutes without opening the browser manually.

## Acceptance Criteria

### AC-1: PWA Manifest with Share Target
**Given** the PWA configuration
**When** inspecting `/manifest.webmanifest` (auto-generated from `src/app/manifest.ts`)
**Then** it includes: `name`, `short_name`, `icons` (192px, 512px), `start_url: "/"`, `display: "standalone"`, `theme_color: "#1B2D4F"` (Navy), `background_color: "#FDF6EC"` (Sand)
**And** a `share_target` field is configured to accept files with MIME types `["application/gpx+xml", "application/xml", "text/xml", ".gpx"]` via POST multipart/form-data

### AC-2: Service Worker Active
**Given** a service worker is registered
**When** the PWA loads
**Then** the service worker is active at `/sw.js`
**And** it intercepts the share target POST request, stores the GPX file in Cache API, and redirects to `/share-target?shared=1`

### AC-3: Share Sheet Integration (Android Chrome)
**Given** a sailor has installed Bosco on their Android home screen
**When** they export tracks from Navionics and open the OS share sheet
**Then** "Bosco" appears as a share target option

### AC-4: Authenticated Import Flow
**Given** the sailor taps "Bosco" in the share sheet
**When** Bosco receives the shared GPX file
**Then** if the sailor is authenticated with existing voyages: the file is routed to the import flow targeting the most recently updated voyage
**And** the GpxImporter auto-starts processing the shared file (no file picker shown)

### AC-5: No Voyage — Inline Creation
**Given** the sailor is authenticated but has no voyages
**When** they share a GPX file via the share sheet
**Then** an inline voyage creation form is shown with a date-based pre-filled name
**And** after creation, they are redirected to the new voyage's import page with the shared file

### AC-6: Not Authenticated — File Preserved
**Given** the sailor is not authenticated
**When** they share a GPX file via the share sheet
**Then** they are redirected to the auth page
**And** after login, a pending-share flag routes them back to the share-target handler
**And** the file is preserved in Cache API across the auth flow

### AC-7: Installability
**Given** the PWA on Android Chrome
**When** the browser detects installability criteria are met (manifest + service worker + HTTPS)
**Then** the install prompt is accessible
**And** the installed app opens in standalone mode

## Tasks / Subtasks

- [x] Task 1: Create PWA manifest (AC: #1)
  - [x] Create `src/app/manifest.ts` using `MetadataRoute.Manifest` type
  - [x] Verify Next.js auto-generates `<link rel="manifest">` in HTML head

- [x] Task 2: Create minimal service worker (AC: #2, #3)
  - [x] Create `public/sw.js` (plain JavaScript — runs in SW context, not bundled by Next.js)
  - [x] Implement share-target POST interception + Cache API storage + redirect
  - [x] Add install/activate handlers with `skipWaiting()` + `clients.claim()`

- [x] Task 3: Register service worker (AC: #2)
  - [x] Create `src/components/pwa/ServiceWorkerRegistrar.tsx` client component
  - [x] Register `/sw.js` on mount, return null

- [x] Task 4: Update root layout (AC: #1, #7)
  - [x] Add `ServiceWorkerRegistrar` to `src/app/layout.tsx`
  - [x] Add `export const viewport: Viewport` with `themeColor` (NOT in `metadata` — deprecated in Next.js 16)

- [x] Task 5: Create share-target route (AC: #4, #5, #6)
  - [x] Create `src/app/share-target/page.tsx` — Server Component (auth check + voyages fetch)
  - [x] Create `src/app/share-target/ShareTargetHandler.tsx` — Client component (Cache API read + routing)
  - [x] Create `src/app/share-target/messages.ts` — Externalized strings
  - [x] Handle three branches: auth+voyages, auth+no-voyages, not-auth

- [x] Task 6: Update GpxImporter for shared files (AC: #4)
  - [x] Add `autoImportFromShare?: boolean` prop to GpxImporter
  - [x] When true: read file from Cache API on mount, auto-process
  - [x] If no file in cache: fall back to file picker
  - [x] Clear cache after reading

- [x] Task 7: Update import page for shared files (AC: #4)
  - [x] Read `searchParams` for `shared` query param
  - [x] Pass `autoImportFromShare={true}` to GpxImporter when present

- [x] Task 8: Update middleware for SW and share-target (AC: #2, #6)
  - [x] Add `sw.js` and `manifest.webmanifest` to matcher exclusion
  - [x] Ensure `/share-target` is accessible without auth (not in PROTECTED_ROUTES — already true)

- [x] Task 9: Handle post-auth return for shared files (AC: #6)
  - [x] ShareTargetHandler stores `bosco-share-pending: true` in localStorage before auth redirect
  - [x] Create `src/app/dashboard/SharePendingRedirect.tsx` client component (dashboard/page.tsx is a Server Component — cannot use hooks directly)
  - [x] Render `<SharePendingRedirect />` in dashboard page
  - [x] ShareTargetHandler clears the flag after reading

- [x] Task 10: Create PWA icons (AC: #1, #7)
  - [x] Create `public/icons/icon-192x192.png` — 192×192, Navy background (#1B2D4F) with white "B" or anchor
  - [x] Create `public/icons/icon-512x512.png` — 512×512, same design
  - [x] Create `public/icons/apple-touch-icon.png` — 180×180 for iOS Safari
  - [x] Icons can be generated with a simple canvas script or imported from a design tool

- [x] Task 11: Add messages (AC: #5, #6)
  - [x] Create `src/app/share-target/messages.ts` with share-target UI strings
  - [x] Add any new strings needed in dashboard messages

- [x] Task 12: Tests and verification (AC: all)
  - [x] Test ShareTargetHandler routing logic
  - [x] Test GpxImporter autoImportFromShare behavior
  - [x] TypeScript strict clean: `npx tsc --noEmit`
  - [x] ESLint clean: `npm run lint`
  - [x] All existing tests pass: `npm run test`
  - [x] Build succeeds: `npm run build`

## Dev Notes

### Architecture Decision: Native Service Worker (No Serwist)

**Decision:** Use a custom minimal service worker instead of Serwist.

**Rationale:**
- Serwist v9.5.7 does NOT support Web Share Target out of the box — the fetch handler must be written manually regardless
- Serwist's `@serwist/next` uses webpack internally; Next.js 16 defaults to Turbopack — compatibility requires `@serwist/turbopack` which has reported issues
- The only PWA features needed for MVP are: share target + installability (no offline caching)
- A minimal custom SW (~30 lines) is simpler, zero dependencies, zero Turbopack conflicts
- Serwist can be added later if offline support becomes a priority (Growth phase)

**Consequence:** Zero new npm dependencies for this story.

### Web Share Target — How It Works

1. **User shares GPX from Navionics** → Android share sheet shows installed PWAs with matching `share_target`
2. **Browser creates POST request** → `multipart/form-data` to the manifest's `share_target.action` URL
3. **Service worker intercepts** → extracts file from FormData, stores in Cache API
4. **SW responds with redirect** → GET to `/share-target?shared=1`
5. **Share-target page loads** → reads file from Cache API, routes to import flow

**Browser support:** Web Share Target works ONLY on Chromium browsers (Chrome/Edge on Android and desktop). Safari (iOS/macOS) and Firefox do NOT support it. iOS users use the in-app file picker — this is acceptable for MVP, with native iOS app planned for V2 (per UX spec).

### PWA Manifest — `src/app/manifest.ts`

Next.js 16 natively supports typed manifest generation. Creating `src/app/manifest.ts` automatically:
- Generates `/manifest.webmanifest` at build time
- Adds `<link rel="manifest" href="/manifest.webmanifest">` to HTML head
- No manual link tag needed in layout.tsx

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bosco — Sailing Logbook",
    short_name: "Bosco",
    description: "Your sailing story, traced on the map",
    start_url: "/",
    display: "standalone",
    theme_color: "#1B2D4F",
    background_color: "#FDF6EC",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    share_target: {
      action: "/share-target",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        files: [
          {
            name: "gpx",
            accept: [
              "application/gpx+xml",
              "application/xml",
              "text/xml",
              ".gpx",
            ],
          },
        ],
      },
    },
  };
}
```

**Verified:** The `MetadataRoute.Manifest` type in Next.js 16.1.6 includes full `share_target` typing with `action`, `method`, `enctype`, and `params.files` — no type assertions needed. See `node_modules/next/dist/lib/metadata/types/manifest-types.d.ts`.

### Service Worker — `public/sw.js`

```javascript
// Minimal service worker for PWA installability + Web Share Target
// No caching, no offline support — purely for share target interception

const SHARE_CACHE = "bosco-share-target";

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only intercept the share target POST
  if (url.pathname === "/share-target" && event.request.method === "POST") {
    event.respondWith(handleShareTarget(event.request));
  }
  // All other requests pass through to the network — do not interfere
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("gpx");

    if (file) {
      const cache = await caches.open(SHARE_CACHE);
      // Store the file as a Response in Cache API
      await cache.put("shared-gpx", new Response(file));
    }
  } catch (e) {
    // If file extraction fails, still redirect — the page will handle the error
    console.error("[SW] Share target file extraction failed:", e);
  }

  // Redirect to share-target page (GET) with marker param
  return Response.redirect(new URL("/share-target?shared=1", self.location.origin), 303);
}

// Install: activate immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate: claim all clients
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
```

**CRITICAL:** The SW must NOT intercept any other requests. No runtime caching, no navigation handling. It only intercepts the share-target POST. All other fetch events fall through to the browser's default network handling.

**File format:** Plain `.js`, NOT TypeScript. Service workers run in a separate context, not bundled by Next.js/Turbopack. The file is served statically from `public/`.

### ServiceWorkerRegistrar — `src/components/pwa/ServiceWorkerRegistrar.tsx`

```typescript
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }
  }, []);

  return null;
}
```

This component renders nothing. It's placed in the root layout to ensure SW registration on every page load.

### Share-Target Route — `src/app/share-target/page.tsx`

**Server Component** — handles auth check and data fetching:

```typescript
import { getUser } from "@/lib/auth";
import { getVoyagesByUserId } from "@/lib/data/voyages";
import { ShareTargetHandler } from "./ShareTargetHandler";

export default async function ShareTargetPage() {
  const user = await getUser();
  let voyages: { id: string; name: string }[] = [];

  if (user) {
    const { data } = await getVoyagesByUserId(user.id);
    voyages = (data ?? []).map((v) => ({ id: v.id, name: v.name }));
  }

  return (
    <ShareTargetHandler
      isAuthenticated={!!user}
      voyages={voyages}
    />
  );
}
```

**Key:** `/share-target` is NOT in `PROTECTED_ROUTES` in middleware — it's accessible to both authenticated and unauthenticated users. The page itself handles the branching.

### ShareTargetHandler — `src/app/share-target/ShareTargetHandler.tsx`

**Client Component** — reads Cache API, handles routing:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
```

**Routing logic:**
1. On mount: read GPX file from Cache API (`bosco-share-target` / `shared-gpx`)
2. If no file found: show error with link to dashboard
3. If file found + NOT authenticated:
   - Store `bosco-share-pending: true` in localStorage
   - Redirect to `/auth`
4. If file found + authenticated + has voyages:
   - Redirect to `/voyage/[mostRecentVoyageId]/import?shared=1`
5. If file found + authenticated + no voyages:
   - Show inline voyage creation form
   - On creation success: redirect to `/voyage/[newId]/import?shared=1`

**Inline voyage creation form:**
- Simple form: voyage name (pre-filled with date: "Voyage 16 Mar"), description (optional), NO slug field (auto-generated by server action)
- On submit: construct `FormData` with `name` and `description` fields, then call `createVoyage` Server Action from `src/app/dashboard/actions.ts`
- `createVoyage` accepts `FormData` (not a plain object) and auto-generates a slug from the name via `generateSlug()` if no slug is provided — see `src/app/dashboard/actions.ts` lines 52-54
- Pattern reference: see `src/app/dashboard/CreateVoyageDialog.tsx` for how to call `createVoyage` with FormData
- On success: redirect to `/voyage/[newId]/import?shared=1`
- Style: centered card layout, consistent with auth page styling

**Cache API helper:**

```typescript
const SHARE_CACHE = "bosco-share-target";
const SHARE_KEY = "shared-gpx";

async function readSharedFile(): Promise<File | null> {
  if (!("caches" in window)) return null;
  try {
    const cache = await caches.open(SHARE_CACHE);
    const response = await cache.match(SHARE_KEY);
    if (!response) return null;
    const blob = await response.blob();
    await cache.delete(SHARE_KEY); // Clean up after reading
    return new File([blob], "shared.gpx", { type: "application/gpx+xml" });
  } catch {
    return null;
  }
}
```

**NOTE:** Do NOT delete the Cache entry immediately if the user needs auth redirect — the file must survive the auth round-trip. Only delete after the file is successfully handed to GpxImporter.

### GpxImporter Modification

Add `autoImportFromShare` prop:

```typescript
interface GpxImporterProps {
  voyageId: string;
  voyageName: string;
  autoImportFromShare?: boolean;
}
```

Add a `useEffect` that reads the shared file from Cache API when `autoImportFromShare` is true:

```typescript
useEffect(() => {
  if (!autoImportFromShare || !workerRef.current) return;

  async function loadSharedFile() {
    if (!("caches" in window)) return;
    try {
      const cache = await caches.open("bosco-share-target");
      const response = await cache.match("shared-gpx");
      if (!response) return;
      const blob = await response.blob();
      await cache.delete("shared-gpx");
      const file = new File([blob], "shared.gpx", { type: "application/gpx+xml" });

      // Process the file (same logic as handleFileSelect)
      dispatch({ type: "FILE_SELECTED" });
      const xmlString = await file.text();
      const tracks = parseGpx(xmlString);
      workerRef.current?.postMessage({ type: "process", tracks });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load shared file";
      dispatch({ type: "PROCESSING_ERROR", message });
    }
  }

  loadSharedFile();
}, [autoImportFromShare]);
```

**IMPORTANT:** This `useEffect` must run AFTER the worker initialization `useEffect`. Both have `[]` deps, so React guarantees they run in declaration order. Place the shared-file effect AFTER the worker setup effect.

### Import Page Update — `src/app/voyage/[id]/import/page.tsx`

```typescript
export default async function ImportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ... existing auth + voyage checks ...

  const { shared } = await searchParams;

  return (
    <div className="h-screen">
      <GpxImporter
        voyageId={id}
        voyageName={voyage.name}
        autoImportFromShare={shared === "1"}
      />
    </div>
  );
}
```

### Post-Auth Return for Shared Files (Task 9)

**Problem:** After the user authenticates (magic link round-trip), they land on `/dashboard`. The shared GPX file is still in Cache API, but the user needs to be routed back to `/share-target`.

**Solution: localStorage flag**

In ShareTargetHandler (before auth redirect):
```typescript
localStorage.setItem("bosco-share-pending", "true");
router.push("/auth");
```

In dashboard page — create a **dedicated client component** `src/app/dashboard/SharePendingRedirect.tsx`:
```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SharePendingRedirect() {
  const router = useRouter();

  useEffect(() => {
    const pending = localStorage.getItem("bosco-share-pending");
    if (pending) {
      localStorage.removeItem("bosco-share-pending");
      router.replace("/share-target?shared=1");
    }
  }, [router]);

  return null;
}
```

**CRITICAL:** `dashboard/page.tsx` is a Server Component (async function) — you CANNOT add `useEffect` or `useRouter` directly to it. Create `SharePendingRedirect` as a separate client component and render it inside the dashboard page: `<SharePendingRedirect />`.

**Note:** The dashboard page redirects to `/dashboard/profile` if the user has no username set (profile check at lines 30-33). This means a brand-new user who shares a GPX before completing profile setup will go through: auth → dashboard → profile redirect → profile setup → dashboard → SharePendingRedirect fires → share-target. The file survives in Cache API across all these navigations. This multi-hop journey is acceptable for MVP (edge case: first-time users sharing before profile setup).

**Alternative approach:** The auth confirm flow at `src/app/auth/confirm/` supports a `next` parameter via `resolvePostAuthRedirect`. Passing `?next=/share-target?shared=1` to the auth page would preserve the redirect through the PKCE flow. However, localStorage is simpler to implement and avoids URL encoding complexity.

**Security:** Only redirect to the hardcoded `/share-target` path. Do NOT use arbitrary `returnTo` values from localStorage.

### Middleware Update — `src/middleware.ts`

Update the matcher to exclude service worker and manifest:

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

This adds `sw\\.js` to the exclusion pattern. The `manifest.webmanifest` is already excluded by Next.js internals (generated as a static file), but if issues arise, add it too.

### Root Layout Update — `src/app/layout.tsx`

```typescript
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: messages.meta.title,
  description: messages.meta.description,
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

// In the body, add before Analytics:
<ServiceWorkerRegistrar />
```

**Note:** `theme_color` is set in `manifest.ts`. For the `<meta name="theme-color">` tag in HTML, use the `Viewport` export (NOT `metadata.themeColor` which is deprecated in Next.js 16):
```typescript
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#1B2D4F",
};
```
This is a separate named export alongside `metadata`. Next.js 16 generates `<meta name="theme-color" content="#1B2D4F">` from it.

### PWA Icons

Create 3 icon files in `public/icons/`:

| File | Size | Purpose |
|------|------|---------|
| `icon-192x192.png` | 192×192px | Android Chrome manifest icon |
| `icon-512x512.png` | 512×512px | Android Chrome splash + manifest |
| `apple-touch-icon.png` | 180×180px | iOS Safari home screen |

**Design:** Navy background (#1B2D4F), white foreground. Simple "B" lettermark in DM Serif Display style, or a minimalist anchor/compass icon. Keep it recognizable at small sizes. Safe area: keep content within the inner 80% for maskable icon compatibility.

**Generation approach:** Create a simple SVG, then render to PNG at the required sizes using a Node.js script with `sharp` or `canvas`, or use any online PNG generator. For MVP, simple is fine — icons can be refined later.

Alternatively, add an SVG icon for modern browsers:
```typescript
// In manifest.ts icons array:
{ src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
```

### Existing Patterns to Reuse

| Module | Path | How to Reuse |
|--------|------|--------------|
| `getVoyagesByUserId` | `src/lib/data/voyages.ts` | Returns voyages ordered by `updated_at` desc — first item = most recent |
| `createVoyage` Server Action | `src/app/dashboard/actions.ts` | Reuse for inline voyage creation (accepts FormData, auto-generates slug) |
| `CreateVoyageDialog` pattern | `src/app/dashboard/CreateVoyageDialog.tsx` | Reference for FormData construction pattern |
| `generateSlug` | `src/lib/utils/slug.ts` | Auto-slug generation from voyage name |
| `GpxImporter` | `src/components/gpx/GpxImporter.tsx` | Extend with `autoImportFromShare` prop |
| `parseGpx` | `src/lib/gpx/parser.ts` | Already used in GpxImporter |
| Web Worker pipeline | `src/lib/gpx/worker.ts` | Already used in GpxImporter |
| Messages pattern | `src/app/*/messages.ts` | Co-located externalized strings |
| Middleware | `src/middleware.ts` | Update matcher pattern |
| Root layout | `src/app/layout.tsx` | Add ServiceWorkerRegistrar |

### 3-Tier Containment Compliance

```
OK  src/app/manifest.ts — static export, no imports needed
OK  public/sw.js — isolated service worker context, no app imports
OK  src/components/pwa/ServiceWorkerRegistrar.tsx — browser API only (Tier 4)
OK  src/app/share-target/page.tsx — imports from src/lib/data/, src/lib/auth (Tier 2 → 3)
OK  src/app/share-target/ShareTargetHandler.tsx — calls Server Actions only (Tier 3 → 4)
OK  src/components/gpx/GpxImporter.tsx — client component, browser APIs (Tier 4)
NEVER  import @supabase/* in components or share-target handler
NEVER  import src/lib/supabase/* in Server Actions
```

### Anti-Patterns — Do NOT

- **Do NOT install Serwist or any PWA library** — zero new npm dependencies for this story
- **Do NOT add offline caching to the service worker** — MVP only needs share target + installability
- **Do NOT intercept non-share-target requests in the SW** — this will break Next.js routing, auth callbacks, and API calls
- **Do NOT use TypeScript for the service worker file** — `public/sw.js` is served as-is, not bundled
- **Do NOT add the manifest link manually in layout.tsx** — Next.js auto-generates it from `app/manifest.ts`
- **Do NOT assume Web Share Target works on iOS Safari** — it does NOT, iOS users use the file picker (existing flow)
- **Do NOT store sensitive data in Cache API** — GPX files are not sensitive, but don't store auth tokens
- **Do NOT use `window.confirm()` or `alert()`** — follow existing dialog patterns
- **Do NOT modify the Supabase auth flow** — use localStorage for post-auth redirect, not auth params
- **Do NOT create a full offline-capable PWA** — that's Growth phase, not MVP
- **Do NOT place custom components in `src/components/ui/`** — shadcn/ui only
- **Do NOT inline string literals** — use messages.ts
- **Do NOT forget 44px minimum touch targets** (NFR-9)

### Testing Strategy

| File | Tests | Focus |
|------|-------|-------|
| `src/app/share-target/ShareTargetHandler.test.tsx` | ~4 tests | Routing logic: auth+voyages→redirect, auth+no-voyages→form, not-auth→auth redirect, no-file→error |
| `src/components/gpx/GpxImporter.test.tsx` | ~2 tests | `autoImportFromShare` reads Cache API and auto-processes; fallback when no file in cache |

**ShareTargetHandler tests:** Mock `caches` global API, mock `useRouter`, verify redirect behavior for each branch.

**GpxImporter tests:** Mock `caches` global, mock Worker, verify that auto-import dispatches FILE_SELECTED and posts to worker.

**E2E:** Web Share Target cannot be tested via Playwright (requires installed PWA + OS share sheet). Manual testing on Android device required. Document the manual test procedure:
1. Deploy to preview URL (HTTPS required)
2. Open in Chrome Android → install PWA
3. Open Navionics → export track → share → tap "Bosco"
4. Verify file is received and import flow starts

### Package Versions — No New Dependencies

This story adds **zero npm packages**. All required APIs are browser-native:

| API | Browser Support | Usage |
|-----|----------------|-------|
| Service Worker API | All modern browsers | SW registration + fetch interception |
| Cache API | All modern browsers | Temporary file storage for share target |
| Web Share Target | Chromium only (Chrome/Edge) | Android share sheet integration |
| Web App Manifest | All modern browsers | PWA installability |
| localStorage | All browsers | Post-auth redirect flag |

### Project Structure Notes

```
src/
├── app/
│   ├── manifest.ts                          # NEW — PWA manifest with share_target
│   ├── layout.tsx                           # MODIFY — add ServiceWorkerRegistrar + themeColor
│   ├── share-target/
│   │   ├── page.tsx                         # NEW — share-target Server Component
│   │   ├── ShareTargetHandler.tsx           # NEW — client component (routing + Cache API)
│   │   └── messages.ts                      # NEW — share-target strings
│   ├── dashboard/
│   │   ├── page.tsx                         # MODIFY — render SharePendingRedirect component
│   │   └── SharePendingRedirect.tsx         # NEW — client component for share-pending redirect
│   └── voyage/[id]/import/
│       └── page.tsx                         # MODIFY — read searchParams.shared, pass to GpxImporter
├── components/
│   ├── pwa/
│   │   └── ServiceWorkerRegistrar.tsx       # NEW — SW registration client component
│   └── gpx/
│       └── GpxImporter.tsx                  # MODIFY — add autoImportFromShare prop
├── middleware.ts                             # MODIFY — exclude sw.js from matcher
public/
├── sw.js                                    # NEW — minimal service worker
└── icons/
    ├── icon-192x192.png                     # NEW — PWA icon
    ├── icon-512x512.png                     # NEW — PWA icon
    └── apple-touch-icon.png                 # NEW — iOS icon
```

### Previous Story (2.4b) Intelligence

Story 2.4b established:
- **VoyageContent client wrapper** — manages legs state client-side, renders MapLoader + panels. The share-target integration redirects to the import page, which is separate from VoyageContent.
- **Server Action pattern** — auth + Zod + `{ data, error }` return. Reuse `createVoyage` from dashboard for inline voyage creation.
- **152 tests passing** — do not break them.
- **Sonner toast** for feedback: `import { toast } from "sonner"`.
- **Messages pattern** — co-located `messages.ts` per route.
- **Dashboard page** at `src/app/dashboard/page.tsx` — will need modification for share-pending redirect.

### Git Intelligence

Recent commits: `2.4b`, `2.3 done`, `2.2 done`, `2.1 done`. Codebase is clean with no unfinished work. Story 2.5 is the first story that adds infrastructure outside the `src/app/voyage/` tree (manifest, SW, share-target route, PWA components).

### Scope Boundary — CRITICAL

**IN SCOPE:**
- PWA manifest with share_target configuration
- Minimal service worker for share target only
- Share-target landing page with routing logic
- GpxImporter modification for auto-import from share
- PWA icons (simple/placeholder)
- Post-auth redirect for shared files via localStorage
- ServiceWorkerRegistrar in root layout

**OUT OF SCOPE — Do NOT create:**
- No offline caching or offline mode — Growth phase
- No push notifications — not in MVP requirements
- No Serwist/workbox integration — native SW only
- No iOS share sheet support — V2 native app
- No install prompt UI — browser handles natively
- No app update notification — not needed for MVP
- No background sync — not in requirements
- No pre-caching of pages or assets — not needed for MVP

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.5 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — NFR-11 "GPX import works from mobile file picker and OS share sheet"]
- [Source: _bmad-output/planning-artifacts/architecture.md — PWA section: "Serwist or native service worker", technology stack table]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Platform Strategy (PWA section), Journey 2 (Share Sheet import flow), PWA Accessibility]
- [Source: node_modules/next/dist/lib/metadata/types/manifest-types.d.ts — Manifest type includes share_target with full typing]
- [Source: MDN Web Share Target API — https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target]
- [Source: Next.js PWA Guide — https://nextjs.org/docs/app/guides/progressive-web-apps]
- [Source: W3C Web Share Target spec — https://w3c.github.io/web-share-target/]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Initial test failures: jsdom `Response` constructor doesn't support `.stream()` — resolved by mocking Cache API responses as plain objects with `.blob()` method instead of real `Response` instances.

### Completion Notes List

- Task 1: Created `src/app/manifest.ts` with full PWA manifest including `share_target` configuration for GPX file sharing. Next.js auto-generates `/manifest.webmanifest` route (confirmed in build output).
- Task 2: Created `public/sw.js` — minimal service worker (~40 lines) that only intercepts share-target POST requests. Stores shared GPX file in Cache API, redirects to `/share-target?shared=1`. No caching, no other request interception.
- Task 3: Created `src/components/pwa/ServiceWorkerRegistrar.tsx` — client component that registers `/sw.js` on mount, renders null.
- Task 4: Updated `src/app/layout.tsx` — added `ServiceWorkerRegistrar`, `viewport` export with `themeColor: "#1B2D4F"`, and `apple-mobile-web-app-capable` meta tag.
- Task 5: Created share-target route with 3 files: Server Component (`page.tsx`) for auth/voyages fetch, Client Component (`ShareTargetHandler.tsx`) for Cache API read + 4-branch routing logic, `messages.ts` for externalized strings.
- Task 6: Extended `GpxImporter` with `autoImportFromShare` prop. New `useEffect` reads file from Cache API, auto-processes through worker pipeline. Falls back to file picker if no cached file.
- Task 7: Updated import page to read `searchParams.shared` and pass `autoImportFromShare={true}` to GpxImporter.
- Task 8: Updated middleware matcher to exclude `sw.js`. `/share-target` already not in `PROTECTED_ROUTES`.
- Task 9: Created `SharePendingRedirect` client component for post-auth return flow. Reads `bosco-share-pending` from localStorage, redirects to `/share-target?shared=1` if set.
- Task 10: Generated PWA icons (192px, 512px, 180px apple-touch-icon) using Python Pillow — Navy background with white "B" lettermark in Georgia serif font.
- Task 11: Created `src/app/share-target/messages.ts` with all share-target UI strings. Dashboard messages unchanged (SharePendingRedirect renders no UI).
- Task 12: All verification gates passed — 160 tests (6 new), tsc clean, eslint clean, build succeeds.
- Zero new npm dependencies added.

### Change Log

- 2026-03-17: Story 2.5 implementation complete — PWA manifest, service worker, share-target route, GpxImporter auto-import, post-auth flow, PWA icons, 6 new tests.

### File List

New files:
- src/app/manifest.ts
- public/sw.js
- src/components/pwa/ServiceWorkerRegistrar.tsx
- src/app/share-target/page.tsx
- src/app/share-target/ShareTargetHandler.tsx
- src/app/share-target/messages.ts
- src/app/share-target/ShareTargetHandler.test.tsx
- src/app/dashboard/SharePendingRedirect.tsx
- src/components/gpx/GpxImporter.test.tsx
- public/icons/icon-192x192.png
- public/icons/icon-512x512.png
- public/icons/apple-touch-icon.png

Modified files:
- src/app/layout.tsx
- src/components/gpx/GpxImporter.tsx
- src/app/voyage/[id]/import/page.tsx
- src/middleware.ts
- src/app/dashboard/page.tsx
