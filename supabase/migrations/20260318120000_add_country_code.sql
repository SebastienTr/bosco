-- Add country_code (ISO 3166-1 alpha-2) to stopovers and geocode_cache.
-- Nominatim already returns this; storing it avoids maintaining a name→code mapping.

ALTER TABLE stopovers ADD COLUMN country_code TEXT;
ALTER TABLE geocode_cache ADD COLUMN country_code TEXT;
