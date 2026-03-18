# Story 3.3: SEO, Open Graph & Public Profile

Status: review

## Story

As a sailor,
I want my shared links to show rich previews on social media, and visitors to find my public profile listing all my voyages,
So that sharing drives engagement and my profile serves as a portfolio of my sailing journeys.

## Acceptance Criteria

### AC-1: Open Graph & Twitter Card Meta Tags (Voyage Page)
**Given** a public voyage page at `/{username}/{voyage-slug}`
**When** a social media platform or messaging app fetches the URL
**Then** Open Graph meta tags are present: `og:title` (voyage name), `og:description` (voyage stats summary), `og:image` (dynamic voyage map image), `og:url`, `og:type: website`
**And** Twitter Card meta tags are also present for rich Twitter/X previews

### AC-2: Dynamic OG Image Generation
**Given** the Open Graph image generation
**When** the `opengraph-image.tsx` file renders for a voyage
**Then** it generates a dynamic image showing the voyage name, key stats, and branding
**And** the image dimensions are 1200x630px (standard social sharing)

### AC-3: JSON-LD Structured Data (Voyage Page)
**Given** a public voyage page
**When** inspecting the HTML source
**Then** JSON-LD structured data is present and passes schema.org validation
**And** the structured data describes the voyage (name, description, creator, dates)

### AC-4: Public Profile Page Enhancement
**Given** a visitor navigates to `/{username}`
**When** the public profile page loads (SSR)
**Then** it displays: the sailor's username, boat name, boat type, bio, profile photo, and boat photo
**And** all public voyages are listed as cards with cover image, voyage name, and stats summary (distance, ports, countries)
**And** each card links to the public voyage page
**And** Open Graph meta tags are present on the profile page

### AC-5: Profile Page Empty State
**Given** an unauthenticated visitor
**When** they navigate to `/{username}` for a profile with no public voyages
**Then** the profile page displays the sailor's public information but shows no voyage cards
**And** no indication is given about the existence of private voyages

### AC-6: Map View URL Sharing
**Given** a public voyage page URL with map view state
**When** the visitor navigates the map and shares the URL
**Then** the URL encodes the current center coordinates and zoom level
**And** opening the link restores the shared map view

### AC-7: OG Image for Profile Page
**Given** a public profile page at `/{username}`
**When** a social media platform or messaging app fetches the URL
**Then** Open Graph meta tags include the sailor's profile photo (or a branded fallback) and profile description

## Tasks / Subtasks

- [x] Task 1: Extend generateMetadata for voyage page (AC: #1)
  - [x] Add `openGraph` object: title, description, url, type, images (pointing to opengraph-image.tsx auto-generated URL)
  - [x] Add `twitter` object: card ("summary_large_image"), title, description, images
  - [x] Add `alternates.canonical` with the full URL
  - [x] Extend `messages.ts` with OG-specific description formatting

- [x] Task 2: Dynamic OG image for voyage page (AC: #2)
  - [x] Create `src/app/[username]/[slug]/opengraph-image.tsx` using `ImageResponse` from `next/og`
  - [x] Fetch voyage data via `getPublicVoyageBySlug`
  - [x] Render branded 1200x630px image: navy gradient background, Bosco branding, voyage name, stats (distance, days, ports, countries)
  - [x] If `cover_image_url` exists, use as background with overlay
  - [x] Export `size`, `contentType`, `alt` metadata

- [x] Task 3: JSON-LD structured data for voyage page (AC: #3)
  - [x] Add `<script type="application/ld+json">` in the voyage `page.tsx` server component
  - [x] Use `TripAction` or `Trip` schema type (with `SportsEvent` fallback)
  - [x] Include: name, description, creator (Person with url), startDate, endDate, url
  - [x] Validate against schema.org

- [x] Task 4: Enhance public profile page (AC: #4, #5)
  - [x] Add profile photo display (`next/image` with Supabase URL)
  - [x] Add boat photo display
  - [x] Add cover image to voyage cards (from `cover_image_url`)
  - [x] Add countries count to voyage card stats
  - [x] Maintain empty state (already working — verify no regression)
  - [x] Update `messages.ts` for any new strings

- [x] Task 5: OG metadata for profile page (AC: #7)
  - [x] Extend `generateMetadata` in `src/app/[username]/page.tsx` with `openGraph` and `twitter` objects
  - [x] Add `alternates.canonical`
  - [x] Create `src/app/[username]/opengraph-image.tsx` — branded image with username, boat name, voyage count

- [x] Task 6: Map view URL sharing (AC: #6)
  - [x] On map move (debounced 500ms), update URL hash with `#map=zoom/lat/lng` format
  - [x] On page load, parse hash and pass initial center/zoom to MapLoader
  - [x] Handle in `PublicVoyageContent.tsx` via a `MapViewSync` component or extending `MapCenterListener`

- [x] Task 7: Tests and quality (AC: all)
  - [x] TypeScript strict clean: `npx tsc --noEmit`
  - [x] ESLint clean: `npm run lint`
  - [x] All existing tests pass: `npm run test`
  - [x] Build succeeds: `npm run build`

## Dev Notes

### Existing Pages — What Already Works

The public voyage page (`src/app/[username]/[slug]/page.tsx`) already has:
- SSR with `generateMetadata` returning `title` and `description`
- `getPublicVoyageBySlug` fetching all voyage data (name, description, cover_image_url, legs, stopovers, profiles)
- Stats computed server-side (distance, days, ports, countries)
- `notFound()` for missing/private voyages

The public profile page (`src/app/[username]/page.tsx`) already has:
- SSR with `generateMetadata` returning basic title/description
- `getPublicProfileByUsername` returning: id, username, boat_name, boat_type, bio, profile_photo_url, boat_photo_url
- `getPublicVoyagesByUserId` returning voyages with legs and stopovers (also includes `cover_image_url`)
- Voyage cards with name, description, distance, port count
- Empty state with "No public voyages yet" message
- **Missing:** profile photo display, boat photo display, cover images on cards, countries stat, OG metadata

### Task 1 — Extending Voyage Page Metadata

The current `generateMetadata` in `src/app/[username]/[slug]/page.tsx` (lines 12-30) returns only `{ title, description }`. Extend it:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const { data: voyage } = await getPublicVoyageBySlug(username, slug);

  if (!voyage) {
    return { title: messages.meta.notFoundTitle };
  }

  const title = `${voyage.name} — ${voyage.profiles.boat_name ?? username}`;
  const totalDistanceNm = (voyage.legs ?? []).reduce(
    (sum, leg) => sum + (leg.distance_nm ?? 0), 0,
  );
  const description = voyage.description
    ? `${voyage.description} · ${formatDistanceNm(totalDistanceNm)}`
    : messages.meta.descriptionFallback(username, totalDistanceNm);
  const url = `${siteUrl}/${username}/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Bosco",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
```

**IMPORTANT:** Do NOT add `images` to `openGraph` or `twitter` manually. Next.js automatically adds OG images when an `opengraph-image.tsx` file exists in the route segment. Adding images manually would create duplicates.

**Site URL:** Use `process.env.NEXT_PUBLIC_SITE_URL` or `process.env.VERCEL_PROJECT_PRODUCTION_URL` for the canonical URL base. Define a helper:
```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "localhost:3000"}`;
```
Place this in `src/lib/utils/site-url.ts` as a reusable constant. Both voyage and profile pages need it.

### Task 2 — OG Image with next/og ImageResponse

Create `src/app/[username]/[slug]/opengraph-image.tsx`:

```typescript
import { ImageResponse } from "next/og";
import { getPublicVoyageBySlug } from "@/lib/data/voyages";
import { formatDistanceNm } from "@/lib/utils/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Voyage preview";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const { data: voyage } = await getPublicVoyageBySlug(username, slug);
  if (!voyage) {
    // Return a fallback branded image
    return new ImageResponse(/* Bosco fallback */);
  }

  const totalDistanceNm = (voyage.legs ?? []).reduce(
    (sum, leg) => sum + (leg.distance_nm ?? 0), 0,
  );
  const stopovers = voyage.stopovers ?? [];
  const portsCount = stopovers.length;
  const countriesCount = new Set(stopovers.map(s => s.country).filter(Boolean)).size;

  return new ImageResponse(
    (
      <div style={{ /* 1200x630 layout */ }}>
        {/* Navy gradient background (#1B2D4F → darker) */}
        {/* Bosco branding top-left */}
        {/* Voyage name — large white text */}
        {/* Stats row: distance | ports | countries */}
        {/* "by @username" bottom-right */}
      </div>
    ),
    { ...size },
  );
}
```

**CRITICAL constraints for ImageResponse:**
- **No Tailwind** — uses inline `style` objects with CSS flexbox
- **No external images by default** — fetch fonts/images explicitly if needed
- **Limited CSS subset** — flexbox only, no grid, no CSS variables, no custom fonts without explicit loading
- **No Leaflet / no map rendering** — impossible in edge runtime. Use branded gradient + text stats instead
- **Fonts:** To use Nunito or DM Serif Display, fetch the font file in the function body:
  ```typescript
  const nunitoFont = fetch(
    new URL("../../../../assets/fonts/Nunito-Bold.ttf", import.meta.url)
  ).then(res => res.arrayBuffer());
  ```
  Or use the default system font (Inter-like) for simplicity. MVP can use system fonts.
- **If `cover_image_url` exists:** Fetch the cover image and use it as background:
  ```typescript
  const coverImage = voyage.cover_image_url
    ? await fetch(voyage.cover_image_url).then(res => res.arrayBuffer())
    : null;
  // Then use as <img src={coverImage} /> with overlay
  ```

**Design for the OG image:**
```
┌────────────────────────────────────────────────────────┐
│ ⛵ Bosco                                               │  Navy gradient bg
│                                                         │
│                                                         │
│    Göteborg → Nice                                      │  White, bold, 48px
│                                                         │
│    1,534 nm  ·  12 ports  ·  5 countries                │  White/80%, 24px
│                                                         │
│                                        by @seb          │  White/60%, 20px
└────────────────────────────────────────────────────────┘
```

### Task 3 — JSON-LD Structured Data

Add in `src/app/[username]/[slug]/page.tsx` render function, before `<PublicVoyageContent>`:

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: voyage.name,
  description: voyage.description ?? description,
  url: `${siteUrl}/${username}/${slug}`,
  organizer: {
    "@type": "Person",
    name: profile.username,
    url: `${siteUrl}/${profile.username}`,
  },
  startDate: firstDate ?? undefined,
  endDate: lastDate ?? undefined,
  sport: "Sailing",
  location: {
    "@type": "Place",
    name: stopovers.length > 0
      ? `${stopovers[0].name} to ${stopovers[stopovers.length - 1].name}`
      : undefined,
  },
};

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <PublicVoyageContent ... />
  </>
);
```

**Schema choice:** `SportsEvent` with `sport: "Sailing"` is the closest schema.org type for a sailing voyage. It supports name, description, organizer, dates, and location. Alternative: `Trip` (from schema.org extensions) but it has lower support. `SportsEvent` is widely recognized by search engines.

**Do NOT include:** track coordinates, full stopover list, or any large data in JSON-LD. Keep it lean.

### Task 4 — Enhance Public Profile Page

Current page at `src/app/[username]/page.tsx` needs these additions:

**Profile photos:**
```tsx
import Image from "next/image";

// In the header section, add:
{profile.profile_photo_url ? (
  <Image
    src={profile.profile_photo_url}
    alt={`${profile.username}'s profile photo`}
    width={96}
    height={96}
    className="rounded-full object-cover"
  />
) : null}

{profile.boat_photo_url ? (
  <Image
    src={profile.boat_photo_url}
    alt={`${profile.boat_name ?? profile.username}'s boat`}
    width={400}
    height={250}
    className="mt-4 rounded-card object-cover"
  />
) : null}
```

**Cover images on voyage cards:**
The `getPublicVoyagesByUserId` already returns `cover_image_url`. Add to each card:
```tsx
{voyage.cover_image_url ? (
  <div className="relative h-40 w-full overflow-hidden rounded-t-[12px]">
    <Image
      src={voyage.cover_image_url}
      alt={`Cover image for ${voyage.name}`}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  </div>
) : null}
```

**Countries count on voyage cards:**
The `getPublicVoyagesByUserId` already selects `stopovers(id)` but not `stopovers(country)`. Update the select to include `country`:
```typescript
// In src/lib/data/voyages.ts — getPublicVoyagesByUserId
.select(`
  id, name, slug, description, cover_image_url, created_at, updated_at,
  legs(id, track_geojson, distance_nm),
  stopovers(id, country)
`)
```
Then compute `countriesCount` from unique countries on each card.

**Supabase Storage image domains:** Add to `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};
```
Also add the local Supabase hostname for development:
```typescript
{
  protocol: "http",
  hostname: "127.0.0.1",
  port: "54321",
  pathname: "/storage/v1/object/public/**",
},
```

### Task 5 — OG Metadata for Profile Page

Extend `generateMetadata` in `src/app/[username]/page.tsx`:

```typescript
const url = `${siteUrl}/${profile.username}`;
return {
  title: messages.meta.title(profile.username),
  description: messages.meta.description(profile.username),
  alternates: { canonical: url },
  openGraph: {
    title: messages.meta.title(profile.username),
    description: messages.meta.description(profile.username),
    url,
    type: "profile",
    ...(profile.profile_photo_url ? {
      images: [{ url: profile.profile_photo_url, width: 200, height: 200 }],
    } : {}),
  },
  twitter: {
    card: profile.profile_photo_url ? "summary" : "summary",
    title: messages.meta.title(profile.username),
    description: messages.meta.description(profile.username),
  },
};
```

**Optional `opengraph-image.tsx` for profile:** Create `src/app/[username]/opengraph-image.tsx` with branded image showing username, boat name, and voyage count. This is a nice-to-have but recommended for consistent social sharing. If no profile photo, show branded fallback.

### Task 6 — Map View URL Sharing

Use URL hash format: `#map=zoom/lat/lng` (similar to OpenStreetMap convention).

**Reading initial state:** In `PublicVoyageContent.tsx`, parse hash on mount:
```typescript
const parseMapHash = (): { center: [number, number]; zoom: number } | null => {
  if (typeof window === "undefined") return null;
  const match = window.location.hash.match(/^#map=(\d+)\/([-\d.]+)\/([-\d.]+)$/);
  if (!match) return null;
  return { zoom: parseInt(match[1]), center: [parseFloat(match[2]), parseFloat(match[3])] };
};
```

**Writing state:** Create a `MapViewSync` component that listens to Leaflet `moveend` events and updates the hash (debounced):
```typescript
// src/components/map/MapViewSync.tsx
"use client";
import { useMapEvents } from "react-leaflet";
import { useRef, useCallback } from "react";

export function MapViewSync() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const updateHash = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const map = ... ; // from useMap
      const center = map.getCenter();
      const zoom = map.getZoom();
      const hash = `#map=${zoom}/${center.lat.toFixed(4)}/${center.lng.toFixed(4)}`;
      window.history.replaceState(null, "", hash);
    }, 500);
  }, []);

  useMapEvents({ moveend: updateHash });
  return null;
}
```

**Pass initial view to MapLoader:** Add optional `initialCenter` and `initialZoom` props that override the default auto-fit behavior.

**Integration:** Parse the hash in `PublicVoyageContent` and pass to `MapLoader`. Add `MapViewSync` as a child of the map. The hash update uses `replaceState` (not `pushState`) to avoid cluttering browser history.

### Existing Components to Reuse

| Component | Path | How to Reuse |
|-----------|------|--------------|
| `MapLoader` | `src/components/map/MapLoader.tsx` | Add optional `initialCenter`/`initialZoom` props |
| `MapCenterListener` | `src/components/map/MapCenterListener.tsx` | Already listens for custom events — extend or sibling `MapViewSync` |
| `PublicVoyageContent` | `src/app/[username]/[slug]/PublicVoyageContent.tsx` | Modify: parse hash, pass initial view, add MapViewSync |
| `formatDistanceNm` | `src/lib/utils/format.ts` | Reuse for OG image stats |
| `getPublicVoyageBySlug` | `src/lib/data/voyages.ts` | Reuse in opengraph-image.tsx |
| `getPublicProfileByUsername` | `src/lib/data/profiles.ts` | Reuse in profile opengraph-image.tsx |
| `getPublicVoyagesByUserId` | `src/lib/data/voyages.ts` | Modify: add `country` to stopovers select |

### 3-Tier Containment Compliance

```
OK  src/app/[username]/[slug]/page.tsx — Server Component: extends existing metadata
OK  src/app/[username]/[slug]/opengraph-image.tsx — NEW: Server route (edge-compatible), imports from Tier 2
OK  src/app/[username]/page.tsx — Server Component: extends existing page
OK  src/app/[username]/opengraph-image.tsx — NEW: Server route, imports from Tier 2
OK  src/app/[username]/[slug]/PublicVoyageContent.tsx — Tier 4: client component modification
OK  src/components/map/MapViewSync.tsx — NEW: Tier 4, client-only map component
OK  src/lib/utils/site-url.ts — NEW: Utility, no tier imports
OK  src/lib/data/voyages.ts — Tier 2: minor select modification
OK  next.config.ts — Config: image domain patterns
NEVER  import @supabase/* outside src/lib/supabase/
NEVER  create Server Actions for this story — public pages are read-only
```

### Anti-Patterns — Do NOT

- **Do NOT add Tailwind classes in opengraph-image.tsx** — ImageResponse uses inline CSS only
- **Do NOT use Leaflet or any DOM-dependent library in OG image** — runs in edge runtime, no `window`
- **Do NOT add `images` to `openGraph` in `generateMetadata` when `opengraph-image.tsx` exists** — Next.js handles this automatically, adding them manually creates duplicates
- **Do NOT use `any` type** — use typed interfaces
- **Do NOT inline string literals** — use co-located `messages.ts`
- **Do NOT place custom components in `src/components/ui/`** — shadcn/ui only
- **Do NOT create Server Actions** — public pages are read-only
- **Do NOT use `pushState` for map hash** — use `replaceState` to avoid cluttering history
- **Do NOT include large data in JSON-LD** — keep it lean (name, description, dates, creator only)
- **Do NOT load external fonts in OG image** unless explicitly needed — system fonts are fine for MVP
- **Do NOT break existing 205 tests** — verify with `npm run test`
- **Do NOT modify the CSP headers** from Story 3.1 — the OG image route doesn't need CSP changes

### Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#1B2D4F` | OG image background, text |
| Ocean | `#2563EB` | Links, accents |
| Coral | `#E8614D` | Branding accent in OG image |
| White | `#FFFFFF` | OG image text |
| Sand | `#FDF6EC` | Profile page card bg option |
| Foam | `#F1F5F9` | Profile page background (existing) |
| DM Serif Display | Heading font | Voyage name (page), NOT in OG image |
| Nunito | Body font | Page text, NOT in OG image (unless font loaded) |

### Previous Story (3.2) Intelligence

Story 3.2 established:
- **205 tests passing** (34 files) — do not break them
- `PublicVoyageContent` is the orchestrator for all public page overlays — modify for hash parsing
- `MapCenterListener` handles `bosco:center-stopover` custom event — `MapViewSync` is a separate concern (URL sync)
- `messages.ts` extended with `stopoverSheet`, `portsPanel`, `actionFab` sections
- `countryToFlag` utility exists at `src/lib/utils/country-flag.ts` — reuse in profile page cards if needed
- `StopoverList` has flag emoji integration — could inspire profile page voyage stats
- `globals.css` has `slide-up` and `slide-right` animations already defined
- Pre-existing lint issues in `page.tsx` and `actions.ts` — do not fix (not in scope)
- `next.config.ts` is currently empty (`{}`) — will be modified for image domains

### Git Intelligence

Recent commits (Story 3.2):
```
80c4d29 3.2 wip
8508cf8 3.2 wip
4bba120 3.2 wip
3b30cf3 3.1 done
```

### Technology Notes — Next.js 16 OG Images

The project uses **Next.js 16.1.6**. The `next/og` module provides `ImageResponse` for dynamic OG image generation via file-based routing:

- Place `opengraph-image.tsx` in a route segment folder
- Export a default async function returning `ImageResponse`
- Export `size`, `contentType`, and optionally `alt` for metadata
- `params` is a **Promise** in Next.js 16 — must `await params` before destructuring
- The generated image URL is automatically added to `<meta property="og:image">` by Next.js
- Edge runtime compatible (default for OG image routes)
- CSS is limited to inline styles with flexbox (no grid, no Tailwind, no CSS modules)
- External images must be fetched as ArrayBuffer if used

### Scope Boundary

**IN SCOPE:**
- Extend `generateMetadata` on voyage page with OG and Twitter tags
- Dynamic OG image generation for voyage page (branded stats image)
- JSON-LD structured data on voyage page
- Enhance public profile page with photos and better cards
- OG metadata + optional OG image for profile page
- Map view URL sharing via hash
- `next.config.ts` image domain configuration
- Site URL utility
- Messages externalization for new strings
- Tests + quality checks

**OUT OF SCOPE — Do NOT create:**
- No sitemap.ts / robots.ts — future optimization
- No Google Search Console integration
- No analytics for OG image views
- No custom map tile rendering in OG image
- No Mapbox/static map API integration
- No log entry display on public pages — Epic 4
- No additional stopover interaction — Story 3.2 complete
- No PWA changes

### Project Structure Notes

```
src/
├── app/
│   └── [username]/
│       ├── page.tsx                       # MODIFY — add photos, cover images, OG metadata
│       ├── messages.ts                    # MODIFY — extend with OG/profile messages
│       ├── opengraph-image.tsx            # NEW — branded OG image for profile
│       └── [slug]/
│           ├── page.tsx                   # MODIFY — extend metadata, add JSON-LD
│           ├── opengraph-image.tsx        # NEW — branded OG image for voyage
│           ├── PublicVoyageContent.tsx     # MODIFY — hash parsing, MapViewSync
│           └── messages.ts               # MODIFY — extend with OG messages
├── components/
│   └── map/
│       └── MapViewSync.tsx               # NEW — URL hash sync for map view
├── lib/
│   ├── data/
│   │   └── voyages.ts                    # MODIFY — add country to getPublicVoyagesByUserId stopovers select
│   └── utils/
│       └── site-url.ts                   # NEW — reusable site URL constant
next.config.ts                            # MODIFY — add images.remotePatterns for Supabase Storage
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.3 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-7 (Public Voyage Page), FR-8 (Public Profile Page), NFR-13 (SSR), NFR-14 (OG tags), NFR-15 (structured data)]
- [Source: _bmad-output/planning-artifacts/architecture.md — SSR boundary, opengraph-image.tsx file-based route, JSON-LD, 3-tier containment, image domains]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — color tokens, typography, profile page layout]
- [Source: src/app/[username]/[slug]/page.tsx — existing generateMetadata to extend]
- [Source: src/app/[username]/page.tsx — existing profile page to enhance]
- [Source: src/lib/data/voyages.ts — getPublicVoyageBySlug, getPublicVoyagesByUserId]
- [Source: src/lib/data/profiles.ts — getPublicProfileByUsername]
- [Source: src/lib/utils/format.ts — formatDistanceNm]
- [Source: next.config.ts — currently empty, needs image domain patterns]
- [Source: _bmad-output/implementation-artifacts/3-1-public-voyage-page-map-stats-and-route-animation.md — SSR patterns, metadata patterns, CSP headers]
- [Source: _bmad-output/implementation-artifacts/3-2-stopover-interaction-and-ports-panel.md — overlay state, MapCenterListener, 205 tests baseline]
- [Source: CLAUDE.md — Architecture tiers, anti-patterns, naming conventions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- site-url.ts: Used `||` instead of `??` to handle empty env strings correctly
- MapViewSync: Required `useRef(null)` for React 19 strict types and null check before clearTimeout

### Completion Notes List

- **Task 1:** Extended `generateMetadata` in voyage page with `openGraph` (title, description, url, type: website, siteName), `twitter` (summary_large_image), and `alternates.canonical`. Created reusable `siteUrl` utility at `src/lib/utils/site-url.ts`. No manual `images` in OG to avoid duplicates with `opengraph-image.tsx`.
- **Task 2:** Created `src/app/[username]/[slug]/opengraph-image.tsx` with 1200x630px branded image. Navy gradient background, Bosco branding (⛵ emoji), voyage name, stats (distance, ports, countries), and @username. Fallback for missing voyages. Uses inline CSS only (no Tailwind).
- **Task 3:** Added JSON-LD `SportsEvent` structured data in voyage page. Includes name, description, organizer (Person), startDate, endDate, sport: "Sailing", and location (first → last stopover).
- **Task 4:** Enhanced profile page: profile photo (96x96 rounded), boat photo, cover images on voyage cards, countries count. Updated `getPublicVoyagesByUserId` to include `country` in stopovers select. Added Supabase Storage image domains to `next.config.ts`. Updated `messages.ts` with new strings.
- **Task 5:** Extended profile page `generateMetadata` with OG (type: profile, profile photo image), Twitter (summary), and canonical URL. Created `src/app/[username]/opengraph-image.tsx` with branded image showing username, boat name, voyage count.
- **Task 6:** Created `MapViewSync` component that debounces (500ms) map moveend events and updates URL hash with `#map=zoom/lat/lng`. Added `parseMapHash()` in `PublicVoyageContent` to restore map view from hash on load. Uses `replaceState` to avoid history clutter.
- **Task 7:** TypeScript strict clean, ESLint clean (pre-existing issues only), 217 tests pass (no regressions, +12 from baseline), build succeeds with OG image routes visible.

### Change Log

- 2026-03-18: Story 3.3 implementation complete — all 7 tasks done, all ACs satisfied

### File List

New files:
- src/lib/utils/site-url.ts
- src/lib/utils/site-url.test.ts
- src/app/[username]/[slug]/opengraph-image.tsx
- src/app/[username]/opengraph-image.tsx
- src/components/map/MapViewSync.tsx

Modified files:
- src/app/[username]/[slug]/page.tsx
- src/app/[username]/[slug]/PublicVoyageContent.tsx
- src/app/[username]/[slug]/messages.ts (no changes needed — existing messages sufficient)
- src/app/[username]/page.tsx
- src/app/[username]/messages.ts
- src/lib/data/voyages.ts
- next.config.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/3-3-seo-open-graph-and-public-profile.md
