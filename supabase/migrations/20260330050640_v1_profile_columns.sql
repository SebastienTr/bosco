-- Migration: v1_profile_columns
-- Add v1.0 columns to profiles table: admin flag, language preference, soft-disable

-- AC-1: Admin column
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- AC-2: Language preference column
ALTER TABLE profiles ADD COLUMN preferred_language VARCHAR(5) NOT NULL DEFAULT 'en';

-- AC-3: Account disable column (soft delete)
ALTER TABLE profiles ADD COLUMN disabled_at TIMESTAMPTZ;

-- AC-4: Update RLS policy to prevent privilege escalation
-- Users must NOT be able to set is_admin or disabled_at on their own row.
-- Drop existing blanket update policy and replace with column-restricted version.
DROP POLICY profiles_update_own ON profiles;

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM profiles WHERE id = auth.uid())
    AND disabled_at IS NOT DISTINCT FROM (SELECT disabled_at FROM profiles WHERE id = auth.uid())
  );
