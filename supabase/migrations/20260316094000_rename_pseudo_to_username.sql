-- Rename pseudo column to username across profiles table and RPC function

ALTER TABLE public.profiles RENAME COLUMN pseudo TO username;

-- Recreate the RPC function with the new column name
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
    WHERE username = input_pseudo
      AND (exclude_user_id IS NULL OR id <> exclude_user_id)
  );
$$;
