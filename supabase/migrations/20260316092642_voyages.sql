-- Voyages table (FR-3)
CREATE TABLE voyages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  cover_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique slug per user
ALTER TABLE voyages ADD CONSTRAINT voyages_user_slug_unique UNIQUE (user_id, slug);

-- Index for fast user voyage lookup
CREATE INDEX idx_voyages_user_id ON voyages(user_id);

-- RLS
ALTER TABLE voyages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own voyages"
  ON voyages FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own voyages"
  ON voyages FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own voyages"
  ON voyages FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own voyages"
  ON voyages FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
