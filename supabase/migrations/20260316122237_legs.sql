-- Legs table (FR-4)
CREATE TABLE legs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id UUID NOT NULL REFERENCES voyages(id) ON DELETE CASCADE,
  track_geojson JSONB NOT NULL,
  distance_nm NUMERIC,
  duration_seconds INTEGER,
  avg_speed_kts NUMERIC,
  max_speed_kts NUMERIC,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast voyage-leg lookup
CREATE INDEX idx_legs_voyage_id ON legs(voyage_id);

-- RLS
ALTER TABLE legs ENABLE ROW LEVEL SECURITY;

-- RLS policies join through voyages to check ownership
CREATE POLICY "Users can read own legs"
  ON legs FOR SELECT TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert own legs"
  ON legs FOR INSERT TO authenticated
  WITH CHECK (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update own legs"
  ON legs FOR UPDATE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete own legs"
  ON legs FOR DELETE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));
