-- RPC helper to check pseudo uniqueness without broadening profile SELECT policies.

CREATE OR REPLACE FUNCTION public.check_pseudo_availability(
  input_pseudo TEXT,
  exclude_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE pseudo = input_pseudo
      AND (exclude_user_id IS NULL OR id <> exclude_user_id)
  );
$$;

REVOKE ALL ON FUNCTION public.check_pseudo_availability(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_pseudo_availability(TEXT, UUID) TO authenticated;
