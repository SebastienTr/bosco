-- Secure public profile access by exposing a limited projection view.
-- Public readers should never be able to query admin or account-state columns
-- directly from the base profiles table.

DROP POLICY IF EXISTS "Anyone can read profiles with public voyages"
ON public.profiles;

CREATE VIEW public.public_profiles
WITH (security_barrier = true)
AS
SELECT DISTINCT
  p.id,
  p.username,
  p.boat_name,
  p.boat_type,
  p.bio,
  p.profile_photo_url,
  p.boat_photo_url
FROM public.profiles AS p
WHERE EXISTS (
  SELECT 1
  FROM public.voyages AS v
  WHERE v.user_id = p.id
    AND v.is_public = true
);

REVOKE ALL ON public.public_profiles FROM PUBLIC;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
