-- Allow anonymous/public read access to public voyages and their related data
-- Required for the public voyage page at /{username}/{slug}

-- Public voyages can be read by anyone
CREATE POLICY "Anyone can read public voyages"
  ON voyages FOR SELECT
  USING (is_public = true);

-- Legs of public voyages can be read by anyone
CREATE POLICY "Anyone can read legs of public voyages"
  ON legs FOR SELECT
  USING (voyage_id IN (
    SELECT id FROM voyages WHERE is_public = true
  ));

-- Stopovers of public voyages can be read by anyone
CREATE POLICY "Anyone can read stopovers of public voyages"
  ON stopovers FOR SELECT
  USING (voyage_id IN (
    SELECT id FROM voyages WHERE is_public = true
  ));

-- Profiles of users with public voyages can be read by anyone
CREATE POLICY "Anyone can read profiles with public voyages"
  ON profiles FOR SELECT
  USING (id IN (
    SELECT user_id FROM voyages WHERE is_public = true
  ));
