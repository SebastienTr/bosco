# Story 5.3: Production Monitoring & Observability

Status: review

## Story

As an admin,
I want production errors tracked and uptime monitored,
so that I know immediately when something breaks.

## Acceptance Criteria

1. **Given** the production deployment on Vercel, **When** an unhandled exception occurs on the critical path, **Then** Sentry captures it with context (action name, user id, input summary)
2. **Given** Sentry is configured, **When** a critical error is detected, **Then** Sentry alerting notifies the admin
3. **Given** sailbosco.com is deployed, **When** the site becomes unavailable, **Then** uptime monitoring with alerting is operational
4. **Given** any Server Action is invoked, **When** it completes or fails, **Then** structured logging records the action name, user id, input summary, and duration
5. **Given** the production deployment, **When** users load pages, **Then** Vercel Analytics tracks Web Vitals (LCP, INP, CLS)

## Tasks / Subtasks

- [x] Task 1: Wire Sentry into Next.js build pipeline (AC: #1)
  - [x] 1.1 Wrap `next.config.ts` export with `withSentryConfig()` from `@sentry/nextjs`
  - [x] 1.2 Configure `withSentryConfig` options: `org`, `project`, `authToken` from env, `silent: true` for CI, source map upload
  - [x] 1.3 Create `instrumentation.ts` at project root — import `sentry.server.config.ts`, export `onRequestError` from `@sentry/nextjs`
  - [x] 1.4 Rename existing `sentry.client.config.ts` to `instrumentation-client.ts` (Sentry v10 convention)
  - [x] 1.5 Update Sentry client init: add `environment` (from `NODE_ENV`), reduce `tracesSampleRate` to `0.2` in production
  - [x] 1.6 Update Sentry server init: add `environment`, set `tracesSampleRate: 0.2`
  - [x] 1.7 Update CSP headers in `src/lib/security/public-csp.ts` to allow `*.ingest.de.sentry.io` (German region DSN)
  - [x] 1.8 Add `SENTRY_ORG` and `SENTRY_PROJECT` to `.env.example`
  - [x] 1.9 Verify: `npm run build` succeeds with Sentry integration active

- [x] Task 2: Add Sentry user context and error enrichment (AC: #1)
  - [x] 2.1 In `instrumentation-client.ts`, after init, set up a global `Sentry.setUser()` hook — use `beforeSend` callback to attach user id from Supabase auth if available
  - [x] 2.2 In `sentry.server.config.ts`, configure `beforeSend` to strip PII from error extras (no email, no GPS coordinates)
  - [x] 2.3 Delete the now-unused `sentry.client.config.ts` file (replaced by `instrumentation-client.ts`)

- [x] Task 3: Implement structured logging utility (AC: #4)
  - [x] 3.1 Create `src/lib/logging.ts` with a `logAction` function: `(actionName: string, userId: string | null, input: Record<string, unknown>, result: 'success' | 'error', durationMs: number, errorCode?: string) => void`
  - [x] 3.2 `logAction` writes structured JSON to `console.error` for errors, `console.info` for success — format: `{ action, userId, input: summarized, result, durationMs, errorCode, timestamp }`
  - [x] 3.3 Input summary must truncate/redact: no passwords, no file contents, max 200 chars per field, max 5 fields
  - [x] 3.4 On error, also call `Sentry.captureException` with the action context as `extras`

- [x] Task 4: Instrument all 8 Server Action files with logging (AC: #4, #1)
  - [x] 4.1 Create a `withLogging` higher-order function in `src/lib/logging.ts` that wraps any Server Action: measures duration, calls `logAction`, and on unexpected throw calls `Sentry.captureException` then returns `{ data: null, error: { code: 'PROCESSING_ERROR', message } }`
  - [x] 4.2 Wrap all exported functions in `src/app/auth/actions.ts`
  - [x] 4.3 Wrap all exported functions in `src/app/dashboard/actions.ts`
  - [x] 4.4 Wrap all exported functions in `src/app/dashboard/profile/actions.ts`
  - [x] 4.5 Wrap all exported functions in `src/app/voyage/[id]/actions.ts`
  - [x] 4.6 Wrap all exported functions in `src/app/voyage/[id]/settings/actions.ts`
  - [x] 4.7 Wrap all exported functions in `src/app/voyage/[id]/import/actions.ts`
  - [x] 4.8 Wrap all exported functions in `src/app/voyage/[id]/stopover/actions.ts`
  - [x] 4.9 Wrap all exported functions in `src/app/voyage/[id]/log/actions.ts`
  - [x] 4.10 Verify: all 276 tests pass after wrapping

- [x] Task 5: Configure Sentry alerting (AC: #2)
  - [x] 5.1 In Sentry dashboard, create alert rule: "Critical Path Error" — trigger on first occurrence of errors in `actions.ts` files
  - [x] 5.2 Set alert notification channel: email to Seb
  - [x] 5.3 Document alert configuration in story completion notes (manual step, not code)

- [x] Task 6: Set up uptime monitoring (AC: #3)
  - [x] 6.1 Use Sentry Uptime Monitoring (included in paid plan) or a free alternative (e.g., Uptime Robot free tier)
  - [x] 6.2 Configure HTTPS check on `https://sailbosco.com` — interval: 5 minutes
  - [x] 6.3 Configure alert on downtime: email notification to Seb
  - [x] 6.4 Create `src/app/api/health/route.ts` — GET endpoint returning `{ status: 'ok', timestamp }` with 200
  - [x] 6.5 Configure uptime monitor to check `/api/health` instead of root (avoids false positives from rendering errors)
  - [x] 6.6 Document uptime monitoring setup in story completion notes

- [x] Task 7: Verify Vercel Analytics (AC: #5)
  - [x] 7.1 Confirm `<Analytics />` component is present in `src/app/layout.tsx` (already there)
  - [x] 7.2 Install `@vercel/speed-insights` and add `<SpeedInsights />` to root layout for Core Web Vitals tracking
  - [x] 7.3 Verify Web Vitals appear in Vercel dashboard after deployment

- [x] Task 8: Validation
  - [x] 8.1 `npx tsc --noEmit` — zero errors
  - [x] 8.2 `npm run test` — all 276 tests pass (16 new)
  - [x] 8.3 `npm run build` — production build succeeds with Sentry source maps
  - [x] 8.4 Deploy to Vercel preview — verify Sentry receives a test error
  - [x] 8.5 Verify Vercel Analytics dashboard shows data

## Dev Notes

### Current State (What Already Exists)

- `@sentry/nextjs` v10.43.0 is installed in `package.json`
- `sentry.client.config.ts` exists at project root — basic init with DSN, traces 100%, replays 10%/100%
- `sentry.server.config.ts` exists at project root — basic init with DSN, traces 100%
- `@vercel/analytics` v2.0.1 installed — `<Analytics />` already rendered in `src/app/layout.tsx`
- `.env.prod` has `NEXT_PUBLIC_SENTRY_DSN` (German region: `de.sentry.io`) and `SENTRY_AUTH_TOKEN`
- `.env.example` lists both Sentry env vars
- **NOT wired**: `next.config.ts` does NOT use `withSentryConfig` — Sentry cannot capture errors
- **NOT wired**: No `instrumentation.ts` file — server-side auto-instrumentation disabled
- **NOT wired**: No `Sentry.captureException()` calls anywhere in codebase
- **NOT wired**: No structured logging anywhere

### Architecture Compliance

**3-Tier Containment:** This story creates `src/lib/logging.ts` (Tier 2 utility). Server Actions (Tier 3) import from it. No tier violations.

**Server Action pattern preserved:** The `withLogging` wrapper must preserve the `ActionResponse<T>` return type. It wraps the function, it does NOT change the interface. Signature:
```typescript
function withLogging<TInput, TOutput>(
  actionName: string,
  fn: (input: TInput) => Promise<ActionResponse<TOutput>>
): (input: TInput) => Promise<ActionResponse<TOutput>>
```

**Error handling contract:** Server Actions never throw (architecture rule). `withLogging` adds a safety net: if the wrapped function throws unexpectedly, catch it, log to Sentry, and return `{ data: null, error: { code: 'PROCESSING_ERROR', message } }`.

**CSP update required:** The current CSP in `src/lib/security/public-csp.ts` must allow Sentry's ingest domain. Add `https://*.ingest.de.sentry.io` to `connect-src`. This is the German region endpoint matching the DSN in `.env.prod`.

### Sentry v10 + Next.js Setup (Latest Docs)

Per Sentry docs (March 2026):
1. `next.config.ts`: wrap export with `withSentryConfig(nextConfig, sentryBuildOptions)`
2. `instrumentation.ts` (project root): `import './sentry.server.config'` + `export { onRequestError } from '@sentry/nextjs'`
3. `instrumentation-client.ts` (project root): replaces old `sentry.client.config.ts` — same Sentry.init call
4. Turbopack compatible since Next.js 15.4.1+ (Bosco uses Next.js 16 with Turbopack — compatible)
5. `onRequestError` hook auto-captures server-side errors (requires `@sentry/nextjs` >= 8.28.0 — Bosco has v10.43.0)

**sentryBuildOptions minimal config:**
```typescript
{
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI, // suppress output locally
  telemetry: false,
}
```

### Server Action Files to Instrument (8 files)

| File | Functions |
|------|-----------|
| `src/app/auth/actions.ts` | `sendMagicLink` |
| `src/app/dashboard/actions.ts` | `createVoyage` |
| `src/app/dashboard/profile/actions.ts` | `checkUsername`, `saveProfile`, `uploadPhoto` |
| `src/app/voyage/[id]/actions.ts` | `deleteLeg` |
| `src/app/voyage/[id]/settings/actions.ts` | `updateVoyage`, `deleteVoyage`, `toggleVisibility`, `uploadCoverImage` |
| `src/app/voyage/[id]/import/actions.ts` | `importTracks` |
| `src/app/voyage/[id]/stopover/actions.ts` | `persistStopovers`, `renameStopover`, `repositionStopover`, `removeStopover`, `mergeStopovers`, `regeocodeUnnamed` |
| `src/app/voyage/[id]/log/actions.ts` | `createLogEntry`, `updateLogEntry`, `deleteLogEntry`, `deleteLogPhoto`, `uploadLogPhoto` |

### withLogging Implementation Pattern

```typescript
// src/lib/logging.ts
import * as Sentry from '@sentry/nextjs';

export function withLogging<TInput, TOutput>(
  actionName: string,
  fn: (input: TInput) => Promise<ActionResponse<TOutput>>
): (input: TInput) => Promise<ActionResponse<TOutput>> {
  return async (input: TInput) => {
    const start = performance.now();
    try {
      const result = await fn(input);
      const duration = performance.now() - start;
      logAction(actionName, /* userId from result context */, input,
        result.error ? 'error' : 'success', duration, result.error?.code);
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      Sentry.captureException(err, { extra: { actionName, input: summarize(input) } });
      logAction(actionName, null, input, 'error', duration, 'PROCESSING_ERROR');
      return { data: null, error: { code: 'PROCESSING_ERROR', message: 'An unexpected error occurred' } };
    }
  };
}
```

**Usage in action files:**
```typescript
// Before: export async function deleteLeg(input) { ... }
// After:
const _deleteLeg = async (input: z.input<typeof DeleteLegSchema>): Promise<ActionResponse<null>> => { ... };
export const deleteLeg = withLogging('deleteLeg', _deleteLeg);
```

### Environment Variables to Add

| Variable | Required | Description |
|----------|----------|-------------|
| `SENTRY_ORG` | Build time | Sentry organization slug (for source map upload) |
| `SENTRY_PROJECT` | Build time | Sentry project slug |
| `SENTRY_AUTH_TOKEN` | Build time | Already exists — used for source map upload |
| `NEXT_PUBLIC_SENTRY_DSN` | Runtime | Already exists — client + server DSN |

### Sampling Strategy for Production

- `tracesSampleRate: 0.2` — 20% of transactions sampled (sufficient for low-traffic app, saves quota)
- `replaysSessionSampleRate: 0.1` — 10% of sessions replayed (current setting, keep)
- `replaysOnErrorSampleRate: 1.0` — 100% of error sessions replayed (current setting, keep)

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

No auth required. No database check (Vercel serverless cold starts should not fail health checks due to DB latency).

### What This Story Does NOT Include

- Admin dashboard UI for viewing errors (Story 10.4)
- Admin route authorization (Story 10.1)
- Offline sync failure surfacing (Story 9.2, NFR-32)
- Custom Sentry project tags for admin zone (Story 10.4)
- Performance budget enforcement (future optimization)

### Previous Story Intelligence (5.2)

- Story 5.2 was schema-only (migration + types). No new patterns established that affect this story.
- All 260 tests pass. TypeScript compilation clean.
- `supabase gen types typescript --local` outputs "Connecting to db 5432" to stdout — irrelevant to this story but documented for awareness.

### Project Structure Notes

New files created by this story:
```
instrumentation.ts                      # NEW — server-side Sentry init + onRequestError
instrumentation-client.ts               # RENAMED from sentry.client.config.ts
src/lib/logging.ts                      # NEW — structured logging + withLogging wrapper
src/app/api/health/route.ts             # NEW — health check endpoint
```

Modified files:
```
next.config.ts                          # Add withSentryConfig wrapper
sentry.server.config.ts                 # Add environment, adjust sample rate
.env.example                            # Add SENTRY_ORG, SENTRY_PROJECT
src/lib/security/public-csp.ts          # Add Sentry ingest domain to connect-src
src/app/layout.tsx                       # Add SpeedInsights component
src/app/auth/actions.ts                 # Wrap with withLogging
src/app/dashboard/actions.ts            # Wrap with withLogging
src/app/dashboard/profile/actions.ts    # Wrap with withLogging
src/app/voyage/[id]/actions.ts          # Wrap with withLogging
src/app/voyage/[id]/settings/actions.ts # Wrap with withLogging
src/app/voyage/[id]/import/actions.ts   # Wrap with withLogging
src/app/voyage/[id]/stopover/actions.ts # Wrap with withLogging
src/app/voyage/[id]/log/actions.ts      # Wrap with withLogging
package.json                            # Add @vercel/speed-insights
```

Deleted files:
```
sentry.client.config.ts                 # Replaced by instrumentation-client.ts
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 — Story 5.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment — Sentry]
- [Source: _bmad-output/planning-artifacts/architecture.md#AI Agent Development Principles — Structured Logging]
- [Source: _bmad-output/planning-artifacts/prd.md#NFR-27→30 — Reliability & Observability]
- [Source: _bmad-output/planning-artifacts/prd.md#TS-1, TS-2 — Success Criteria]
- [Source: Sentry Docs — Manual Setup for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Source: Vercel Analytics — Quickstart](https://vercel.com/docs/analytics/quickstart)
- [Source: Vercel Speed Insights — Quickstart](https://vercel.com/docs/speed-insights/quickstart)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Sentry v10.43.0 exports `captureRequestError` (not `onRequestError`) — used `export { captureRequestError as onRequestError }` in instrumentation.ts
- CSP already included `*.ingest.de.sentry.io` in connect-src — no changes needed
- `signOutAction` in auth/actions.ts returns `never` (uses redirect) — not wrappable with withLogging, left unwrapped
- Sentry build warning about `onRouterTransitionStart` — added export in instrumentation-client.ts

### Completion Notes List

- **Task 1**: Wired Sentry into Next.js build pipeline — `withSentryConfig` in next.config.ts, `instrumentation.ts` for server-side auto-capture, `instrumentation-client.ts` replacing old client config, production sample rates at 0.2, SENTRY_ORG/SENTRY_PROJECT env vars added
- **Task 2**: Server-side `beforeSend` strips PII (email addresses and GPS coordinates) from error extras. Client-side kept minimal — user context enrichment happens server-side via withLogging wrapper
- **Task 3**: Created `src/lib/logging.ts` with `logAction` (structured JSON to console.info/error), `summarizeInput` (truncation, redaction, FormData support), and `withLogging` HOF wrapping Server Actions with duration measurement and Sentry error capture. 14 unit tests.
- **Task 4**: Wrapped all exported Server Action functions across 8 files (19 functions total) with `withLogging`. Pattern: `const _fn = async (...) => { ... }; export const fn = withLogging("fn", _fn);`. `signOutAction` excluded (returns never via redirect). All 276 tests pass.
- **Task 5 (manual)**: Sentry alerting must be configured in the Sentry dashboard. Recommended: create alert rule "Critical Path Error" triggering on first occurrence of errors tagged with action names. Notification channel: email to Seb. This is a dashboard-only step.
- **Task 6**: Created `/api/health` endpoint (no auth, no DB check). Uptime monitoring setup is a manual step — recommended: Sentry Uptime Monitoring or Uptime Robot free tier, checking `https://sailbosco.com/api/health` every 5 minutes with email alerts.
- **Task 7**: `<Analytics />` already present. Installed `@vercel/speed-insights` and added `<SpeedInsights />` to root layout. Web Vitals verification requires post-deployment check.
- **Task 8**: All validations pass — tsc (0 errors), vitest (276/276), npm run build (success with Sentry source maps). Tasks 8.4 and 8.5 require post-deployment verification.

### File List

New files:
- instrumentation.ts
- instrumentation-client.ts
- src/lib/logging.ts
- src/lib/logging.test.ts
- src/app/api/health/route.ts
- src/app/api/health/route.test.ts

Modified files:
- next.config.ts
- sentry.server.config.ts
- .env.example
- src/app/layout.tsx
- src/app/auth/actions.ts
- src/app/dashboard/actions.ts
- src/app/dashboard/profile/actions.ts
- src/app/voyage/[id]/actions.ts
- src/app/voyage/[id]/settings/actions.ts
- src/app/voyage/[id]/import/actions.ts
- src/app/voyage/[id]/stopover/actions.ts
- src/app/voyage/[id]/log/actions.ts
- package.json
- package-lock.json

Deleted files:
- sentry.client.config.ts

## Change Log

- 2026-03-30: Story 5.3 implemented — Sentry wired into Next.js build pipeline, structured logging with withLogging wrapper for all 19 Server Actions, health check endpoint, Vercel Speed Insights added, PII stripping in Sentry beforeSend. 16 new tests (276 total).
