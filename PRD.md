# Bosco — Product Requirements Document

## 1. Vision

**Bosco** (the bosun — maître d'équipage) is a digital logbook for recreational sailors. It lets sailors import their GPS tracks from Navionics (or any GPX source), build a visual journey over time, and share it with friends and family through a beautiful public page.

**Pitch**: "After a day of sailing, export your track from Navionics, drop it into Bosco, and share your exact route with anyone — every tack, every course change, every mile."

**Core differentiator**: Bosco shows the *exact track*, not just waypoints on a map. The squiggly line beating upwind tells a story that pins on a map never will.

## 2. Target Users

**Primary persona**: Recreational sailors (plaisanciers) who use Navionics for navigation. They sail regularly or are on an extended voyage (weeks to months). They want to document their journey and share it with friends, family, or fellow sailors.

**Usage context**: Mobile-first. The sailor imports tracks and writes log entries at port, with network access. No offline requirement for V1.

## 3. Core Concepts

| Concept | Description |
|---------|-------------|
| **User** | A sailor with a profile (pseudo, boat name, bio, photos). Authenticated via email magic link. |
| **Voyage** | A collection of legs forming a journey (e.g., "Göteborg → Nice 2025"). Has a public slug for sharing. Can be public or private. |
| **Leg** | A single sailing session imported from a GPX file. Contains the simplified GPS track, timestamps, distance, duration, and speed data. |
| **Stopover** | A port of call, auto-detected where consecutive legs start/end within 2km. Named via reverse geocoding, editable by the user. |
| **Log Entry** | A journal entry (text + photos) attached to a voyage, optionally to a specific leg and/or stopover, with a date. |

## 4. User Flows

### 4.1 Onboarding
1. Land on homepage → see what Bosco is (examples, pitch)
2. Sign up with email → receive magic link → authenticated
3. Create profile: pseudo (required), boat name, photo (optional)
4. Redirected to dashboard

### 4.2 Create a Voyage
1. From dashboard → "New voyage"
2. Enter name (e.g., "Göteborg → Nice"), optional description
3. Voyage created, redirected to voyage page (empty map)

### 4.3 Import a GPX Track (core loop)
1. From voyage page → "Import track"
2. Select GPX file from device (one file may contain 1 or multiple tracks)
3. **Client-side processing**:
   - Parse GPX XML
   - Extract tracks (1 or N per file)
   - Show preview: map with tracks, stats (distance, duration, points)
   - If multiple tracks: user can select which to import, and optionally merge consecutive tracks into a single leg
   - Simplify each track using Douglas-Peucker (target: ~7 MB output for large files, configurable tolerance server-side)
   - Strip Navionics-specific extensions, keep only coords + timestamps
4. Upload simplified GeoJSON + metadata to server
5. **Server-side processing**:
   - Store leg data (GeoJSON geometry, stats, timestamps)
   - Auto-detect stopovers: compare leg start/end points with existing stopovers (2km radius, configurable per user)
   - Reverse geocode new stopovers (name, country)
   - Recalculate voyage stats
6. Voyage page updates with new leg(s) on the map

### 4.4 Write a Log Entry
1. From voyage page → "Add log entry"
2. Write text (free-form)
3. Optionally attach photos (compressed client-side before upload)
4. Attach to a date, optionally a leg and/or stopover
5. Entry appears on the voyage timeline

### 4.5 Share a Voyage
1. From voyage page → toggle "Public"
2. Get shareable URL: `bosco.sebastientreille.fr/{pseudo}/{voyage-slug}`
3. Share link with friends
4. Visitors see the full public page: animated map, tracks, stopovers, stats, log entries

### 4.6 Browse as a Visitor
1. Open shared link
2. See animated route drawing on the map
3. Browse stopovers, stats (distance sailed, days, ports, countries)
4. Read log entries and view photos
5. Read-only, no interaction required

## 5. Features — Detailed

### 5.1 Authentication
- **Email magic link** (no password)
- Session management via Supabase Auth
- No social login for V1

### 5.2 User Profile
- **Required**: pseudo (unique, used in URLs)
- **Optional**: boat name, boat type, bio, profile photo, boat photo
- Profile page at `/{pseudo}` listing all public voyages

### 5.3 Voyages
- CRUD: create, rename, delete
- Fields: name, description, slug (auto-generated from name, editable), cover image, is_public
- Dashboard: list of user's voyages with preview card (map thumbnail, stats summary)
- A user can have multiple voyages

### 5.4 GPX Import & Track Processing
- Accept `.gpx` files (standard GPX 1.1)
- **Client-side parsing** (in browser, no upload of raw file):
  - Parse XML, extract `<trk>` elements
  - Each `<trk>` contains `<trkseg>` with `<trkpt>` (lat, lon, time, optional extensions)
  - Support single-track and multi-track files
  - Preview: show all tracks on a map, display point count, distance, duration per track
  - User selects which tracks to import
  - User can merge selected tracks into one leg or import as separate legs
  - Apply Douglas-Peucker simplification to reduce point count while preserving track fidelity
  - Simplification target: reduce to web-friendly size (~7 MB equivalent for a large multi-month file)
  - Admin-configurable simplification tolerance
  - Strip extensions (navionics_speed, navionics_haccuracy, etc.), retain lat, lon, time, elevation
  - Convert to GeoJSON for upload
- **Computed per leg**: distance (nm), duration, average speed (kts), max speed, start/end timestamps

### 5.5 Stopovers (Auto-detected)
- When a new leg is imported, compare its start and end points to existing stopovers
- If within 2km of an existing stopover → link to it
- If no match → create new stopover, reverse geocode for name + country
- User can edit: rename, reposition, delete, merge two stopovers
- Detection radius configurable per user (default 2km)
- Stopovers display on map as waypoint markers
- Panel listing all stopovers grouped by country

### 5.6 Log Entries (Journal de Bord)
- Free-form text + photo attachments
- Attached to a voyage with a `logged_at` date
- Optionally linked to a leg and/or a stopover
- Photos compressed client-side before upload (target: reasonable quality for web viewing)
- Stored in Supabase Storage
- Displayed on the public page as a timeline alongside the map
- Extensible model: V1 is text + photos, future versions could add structured fields (weather conditions, sails used, crew, mood)

### 5.7 Public Voyage Page
- URL: `/{pseudo}/{voyage-slug}`
- **Map**: full-screen Leaflet map with OpenStreetMap + OpenSeaMap nautical overlay
- **Animated route**: completed tracks draw progressively on load
- **Stopovers**: waypoint markers on map, boat icon on latest position
- **Stats bar**: distance sailed (nm), distance remaining (if voyage has a destination), days, ports of call count, countries count
- **Stopovers panel**: slide-in panel listing all stopovers grouped by country, click to fly to location
- **Log entries**: displayed as timeline, integrated with the map
- **Header**: voyage name, boat name, sailor pseudo
- **Hash-based deep linking**: `#zoom/lat/lng` for sharing specific map views
- **No weather widget** in V1

### 5.8 User Profile Page
- URL: `/{pseudo}`
- Display pseudo, boat info, bio, photos
- List of public voyages as cards (cover image, name, stats summary)

### 5.9 Dashboard (Private)
- List all voyages (public + private)
- Quick stats per voyage
- Create new voyage
- Access to profile editing

## 6. Technical Architecture

### 6.1 Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | **Next.js 15 (App Router)** + TypeScript | Stable, file-based routing, SSR for public pages (SEO), excellent AI-debuggability |
| Styling | **Tailwind CSS** | Rapid iteration, readable by AI agents, no CSS-in-JS complexity |
| Maps | **Leaflet** | Proven in POC, lightweight, sufficient for the use case |
| Backend/DB | **Supabase** (Postgres + Auth + Storage) | Magic link auth native, RLS for security, real-time capable, Storage for photos/GPX |
| Deployment | **Vercel** | Native Next.js support, preview deploys, edge network |
| Domain | `bosco.sebastientreille.fr` (subdomain) | Temporary, dedicated domain later |

### 6.2 Project Structure

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
│   │   └── [pseudo]/
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

### 6.3 Key Technical Decisions

- **TypeScript everywhere**: types serve as documentation, critical for AI-assisted debugging
- **SSR for public pages**: `/{pseudo}/{slug}` is server-rendered for SEO and fast first paint (Open Graph meta tags, shareable previews)
- **Client-side GPX processing**: raw GPX files can be 400+ MB; they are parsed, simplified, and converted to GeoJSON in the browser before uploading only the lightweight result
- **Supabase RLS**: row-level security ensures users can only modify their own data; public pages read through anon key
- **No raw GPX storage**: only the simplified GeoJSON is stored server-side (cost and performance)
- **Leaflet via dynamic import**: avoid SSR issues with Leaflet (window dependency) by using Next.js dynamic imports with `ssr: false`

## 7. Data Model

### 7.1 Tables

#### profiles
Extends Supabase Auth user. Created on first login.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, references auth.users(id) |
| pseudo | TEXT | UNIQUE, NOT NULL, used in URLs |
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

### 7.2 Storage Buckets (Supabase Storage)

| Bucket | Purpose | Access |
|--------|---------|--------|
| `avatars` | Profile and boat photos | Public read, authenticated write (own user) |
| `voyage-covers` | Voyage cover images | Public read, authenticated write (own voyage) |
| `log-photos` | Log entry photo attachments | Public read (if voyage is public), authenticated write |

### 7.3 RLS Policies

- **profiles**: public read, authenticated update (own row only)
- **voyages**: public read (where is_public = true), authenticated CRUD (own rows)
- **legs**: public read (via voyage is_public), authenticated CRUD (via own voyage)
- **stopovers**: public read (via voyage is_public), authenticated CRUD (via own voyage)
- **log_entries**: public read (via voyage is_public), authenticated CRUD (via own voyage)

## 8. GPX Processing Pipeline

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

## 9. URL Structure

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
| `/[pseudo]` | Public profile | Public |
| `/[pseudo]/[slug]` | Public voyage | Public (if is_public) |

## 10. Non-functional Requirements

### Performance
- Public voyage pages: first meaningful paint < 2s (SSR)
- GPX parsing of 400 MB file: must not freeze browser (use Web Workers if needed)
- Map interactions: 60 fps on mobile
- Simplified track rendering: smooth with up to 100k points

### Security
- Supabase RLS on all tables — no data leaks between users
- Magic link auth only (no passwords to manage/leak)
- Image uploads validated (type, size limit)
- CSP headers configured (same approach as POC)
- No raw GPX files stored server-side

### Mobile
- Mobile-first responsive design
- Touch-friendly map interactions
- GPX import works from mobile file picker (Navionics "share" → Bosco)
- Image compression before upload to save bandwidth

### SEO
- Public voyage pages server-rendered with proper meta tags
- Open Graph tags for rich link previews when sharing
- Structured data (JSON-LD) for voyage pages

### Internationalization
- V1: English UI
- Architecture ready for i18n (all user-facing strings externalized)
- Units: nautical miles and knots (architecture ready for km/mph toggle)

## 11. GPX Format Reference

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

## 12. Success Metrics

For V1 (personal use + close circle):
- The developer (Seb) actively uses Bosco for his own voyage
- Friends and family can view the shared voyage page and understand the journey
- GPX import from Navionics works reliably (single and multi-track)
- Track fidelity is preserved: tacks and course changes are visible on the map
- The app is stable enough to trust with real voyage data
