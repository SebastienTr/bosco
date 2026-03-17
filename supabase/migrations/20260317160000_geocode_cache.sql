-- Geocode cache table for persisting reverse geocode results across cold starts.
-- Accessed server-side only via the regular Supabase client (no RLS needed).

create table geocode_cache (
  lat_key text not null,
  lon_key text not null,
  name text not null,
  country text,
  created_at timestamptz default now(),
  primary key (lat_key, lon_key)
);
