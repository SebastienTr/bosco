# Bosco — Architecture Notes

> Extracted from legacy PRD during BMAD conversion (2026-03-15).
> This content feeds the `bmad-create-architecture` workflow.

## Technical Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | **Next.js 15 (App Router)** + TypeScript | Stable, file-based routing, SSR for public pages (SEO), excellent AI-debuggability |
| Styling | **Tailwind CSS** | Rapid iteration, readable by AI agents, no CSS-in-JS complexity |
| Maps | **Leaflet** | Proven in POC, lightweight, sufficient for the use case |
| Backend/DB | **Supabase** (Postgres + Auth + Storage) | Magic link auth native, RLS for security, real-time capable, Storage for photos/GPX |
| Deployment | **Vercel** | Native Next.js support, preview deploys, edge network |
| Domain | `bosco.sebastientreille.fr` (subdomain) | Temporary, dedicated domain later |

## Project Structure

```
bosco/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Landing page
│   │   ├── layout.tsx                        # Root layout
│   │   ├── auth/
│   │   │   └── page.tsx                      # Magic link login/signup
│   │   ├── auth/callback/
│   │   │   └── route.ts                      # Magic link callback handler
│   │   ├── dashboard/
│   │   │   ├── page.tsx                      # My voyages list
│   │   │   └── profile/
│   │   │       └── page.tsx                  # Edit profile
│   │   ├── voyage/
│   │   │   ├── new/page.tsx                  # Create voyage
│   │   │   └── [id]/
│   │   │       ├── page.tsx                  # Voyage view/edit (map + legs + journal)
│   │   │       ├── import/page.tsx           # GPX import flow
│   │   │       └── settings/page.tsx         # Voyage settings (name, slug, visibility)
│   │   └── [username]/
│   │       ├── page.tsx                      # Public profile page
│   │       └── [slug]/
│   │           └── page.tsx                  # Public voyage page (SSR)
│   ├── components/
│   │   ├── map/
│   │   │   ├── Map.tsx                       # Leaflet map wrapper
│   │   │   ├── RouteLayer.tsx                # Track rendering + animation
│   │   │   ├── StopoverMarker.tsx            # Stopover waypoint markers
│   │   │   └── BoatMarker.tsx                # Current position boat icon
│   │   ├── voyage/
│   │   │   ├── VoyageCard.tsx                # Dashboard voyage card
│   │   │   ├── StatsBar.tsx                  # Distance, days, ports stats
│   │   │   ├── StopoverPanel.tsx             # Stopovers side panel
│   │   │   └── Timeline.tsx                  # Log entries timeline
│   │   ├── gpx/
│   │   │   ├── GpxImporter.tsx               # Upload + preview UI
│   │   │   ├── TrackPreview.tsx              # Individual track preview with stats
│   │   │   └── ImportConfirmation.tsx        # Final confirmation before upload
│   │   ├── log/
│   │   │   ├── LogEntryForm.tsx              # Create/edit log entry
│   │   │   └── LogEntryCard.tsx              # Display log entry
│   │   └── ui/
│   │       └── ...                           # Shared UI components (buttons, inputs, toasts...)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                     # Browser Supabase client
│   │   │   ├── server.ts                     # Server Supabase client
│   │   │   └── middleware.ts                 # Auth middleware for protected routes
│   │   ├── gpx/
│   │   │   ├── parser.ts                     # GPX XML → structured data
│   │   │   ├── simplify.ts                   # Douglas-Peucker implementation
│   │   │   └── to-geojson.ts                 # Simplified track → GeoJSON
│   │   ├── geo/
│   │   │   ├── distance.ts                   # Haversine (nm), speed calculations
│   │   │   ├── stopover-detection.ts         # Auto-detect stopovers from leg endpoints
│   │   │   └── reverse-geocode.ts            # Nominatim or similar for stopover naming
│   │   └── utils/
│   │       ├── image.ts                      # Client-side image compression
│   │       └── format.ts                     # Date, distance, duration formatting
│   └── types/
│       └── index.ts                          # Shared TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial.sql                   # Full DB schema
├── public/
│   └── ...                                   # Static assets
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Key Technical Decisions

- **TypeScript everywhere**: types serve as documentation, critical for AI-assisted debugging
- **SSR for public pages**: `/{username}/{slug}` is server-rendered for SEO and fast first paint (Open Graph meta tags, shareable previews)
- **Client-side GPX processing**: raw GPX files can be 400+ MB; they are parsed, simplified, and converted to GeoJSON in the browser before uploading only the lightweight result
- **Supabase RLS**: row-level security ensures users can only modify their own data; public pages read through anon key
- **No raw GPX storage**: only the simplified GeoJSON is stored server-side (cost and performance)
- **Leaflet via dynamic import**: avoid SSR issues with Leaflet (window dependency) by using Next.js dynamic imports with `ssr: false`

## Data Model

### Tables

#### profiles

Extends Supabase Auth user. Created on first login.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, references auth.users(id) |
| username | TEXT | UNIQUE, NOT NULL, used in URLs |
| boat_name | TEXT | Optional |
| boat_type | TEXT | Optional |
| bio | TEXT | Optional |
| avatar_url | TEXT | Optional, Storage URL |
| boat_photo_url | TEXT | Optional, Storage URL |
| stopover_radius_km | DOUBLE PRECISION | DEFAULT 2.0, for auto-detection |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

#### voyages

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → profiles(id), NOT NULL |
| name | TEXT | NOT NULL |
| description | TEXT | Optional |
| slug | TEXT | NOT NULL, unique per user |
| cover_image_url | TEXT | Optional, Storage URL |
| is_public | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

UNIQUE(user_id, slug)

#### legs

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| voyage_id | UUID | FK → voyages(id), NOT NULL |
| name | TEXT | From GPX track name or user-defined |
| geojson | JSONB | Simplified track geometry (GeoJSON LineString) |
| timestamps | JSONB | Array of epoch seconds, parallel to geojson coordinates |
| distance_nm | DOUBLE PRECISION | Computed from track |
| duration_seconds | INTEGER | Computed from timestamps |
| avg_speed_kts | DOUBLE PRECISION | Computed |
| max_speed_kts | DOUBLE PRECISION | Optional, from GPX extensions if available |
| started_at | TIMESTAMPTZ | First trackpoint timestamp |
| ended_at | TIMESTAMPTZ | Last trackpoint timestamp |
| sort_order | INTEGER | For manual ordering within voyage |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

#### stopovers

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| voyage_id | UUID | FK → voyages(id), NOT NULL |
| name | TEXT | Reverse geocoded or user-defined |
| country | TEXT | 2-letter ISO code |
| latitude | DOUBLE PRECISION | NOT NULL |
| longitude | DOUBLE PRECISION | NOT NULL |
| arrived_at | TIMESTAMPTZ | From leg end timestamp |
| departed_at | TIMESTAMPTZ | From next leg start timestamp |
| description | TEXT | Optional, user notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

#### log_entries

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| voyage_id | UUID | FK → voyages(id), NOT NULL |
| leg_id | UUID | FK → legs(id), nullable |
| stopover_id | UUID | FK → stopovers(id), nullable |
| content | TEXT | Free-form text |
| photos | JSONB | Array of Storage URLs |
| logged_at | TIMESTAMPTZ | NOT NULL, user-specified date |
| latitude | DOUBLE PRECISION | Optional, for map positioning |
| longitude | DOUBLE PRECISION | Optional |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### Storage Buckets (Supabase Storage)

| Bucket | Purpose | Access |
|--------|---------|--------|
| `avatars` | Profile and boat photos | Public read, authenticated write (own user) |
| `voyage-covers` | Voyage cover images | Public read, authenticated write (own voyage) |
| `log-photos` | Log entry photo attachments | Public read (if voyage is public), authenticated write |

### RLS Policies

- **profiles**: public read, authenticated update (own row only)
- **voyages**: public read (where is_public = true), authenticated CRUD (own rows)
- **legs**: public read (via voyage is_public), authenticated CRUD (via own voyage)
- **stopovers**: public read (via voyage is_public), authenticated CRUD (via own voyage)
- **log_entries**: public read (via voyage is_public), authenticated CRUD (via own voyage)

## GPX Processing Pipeline

```
[Navionics Export]                    [Browser]                         [Server]
      │                                  │                                │
      │  .gpx file (6-400 MB)           │                                │
      ├─────────────────────────────────►│                                │
      │                                  │                                │
      │                          1. Parse XML                            │
      │                          2. Extract tracks                       │
      │                          3. Show preview                         │
      │                          4. User selects/merges                  │
      │                          5. Douglas-Peucker simplify             │
      │                          6. Strip extensions                     │
      │                          7. Convert to GeoJSON                   │
      │                          8. Compute stats                        │
      │                                  │                                │
      │                    GeoJSON + metadata (~KB-MB)                   │
      │                                  ├───────────────────────────────►│
      │                                  │                                │
      │                                  │                   9. Store leg │
      │                                  │                  10. Detect stopovers
      │                                  │                  11. Reverse geocode
      │                                  │                  12. Update voyage stats
      │                                  │                                │
```

### Simplification Algorithm

- **Douglas-Peucker** iterative (stack-based, not recursive — handles 1M+ points)
- Target output: preserve track fidelity while reducing to web-friendly size
- Tolerance parameter configurable server-side (stored per-user or global admin setting)
- Binary search on tolerance to reach target point count if needed
- Preserve first and last points of each segment (critical for stopover detection)

### Stopover Detection Algorithm

1. For each new leg imported:
   - Take the **start point** (first coordinate) and **end point** (last coordinate)
   - Search existing stopovers within `stopover_radius_km` (default 2km)
   - If match found → link leg to existing stopover
   - If no match → create new stopover
2. For new stopovers:
   - Reverse geocode using Nominatim (OpenStreetMap) or similar free API
   - Extract place name + country code
3. User can manually edit, merge, or delete stopovers after auto-detection

## URL Structure

| URL | Page | Access |
|-----|------|--------|
| `/` | Landing page | Public |
| `/auth` | Login / Sign up | Public |
| `/dashboard` | My voyages | Authenticated |
| `/dashboard/profile` | Edit profile | Authenticated |
| `/voyage/new` | Create voyage | Authenticated |
| `/voyage/[id]` | Voyage view/edit | Authenticated (owner) |
| `/voyage/[id]/import` | GPX import | Authenticated (owner) |
| `/voyage/[id]/settings` | Voyage settings | Authenticated (owner) |
| `/[username]` | Public profile | Public |
| `/[username]/[slug]` | Public voyage | Public (if is_public) |

## GPX Format Reference

Based on Navionics Boating App export (GPX 1.1):

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="Navionics Boating App">
  <metadata>
    <link href="http://www.navionics.com" />
  </metadata>
  <trk>
    <name>Track 043</name>
    <trkseg>
      <trkpt lat="48.279327" lon="-4.595217">
        <ele>52</ele>
        <time>2025-11-30T07:01:11.754Z</time>
        <extensions>
          <navionics_speed>0.210</navionics_speed>
          <navionics_haccuracy>3</navionics_haccuracy>
          <navionics_vaccuracy>0</navionics_vaccuracy>
        </extensions>
      </trkpt>
      <!-- ~1 point per second, 25,000+ points per 7h sailing session -->
    </trkseg>
  </trk>
  <!-- Multi-track exports contain multiple <trk> elements -->
</gpx>
```

Key characteristics:

- ~1 trackpoint per second → 25,000-70,000 points per day of sailing
- Single file can contain 1 to 45+ tracks
- File size: 6 MB (single day) to 400+ MB (months of sailing)
- Extensions contain speed (knots), GPS accuracy — stripped during simplification
- Standard GPX 1.1 format, compatible with any GPX source (not Navionics-specific)
