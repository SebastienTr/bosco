-- Stopovers table: detected or manually placed waypoints along a voyage
CREATE TABLE stopovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id UUID NOT NULL REFERENCES voyages(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  country TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  arrived_at TIMESTAMPTZ,
  departed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stopovers_voyage_id ON stopovers(voyage_id);

ALTER TABLE stopovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stopovers"
  ON stopovers FOR SELECT TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert own stopovers"
  ON stopovers FOR INSERT TO authenticated
  WITH CHECK (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update own stopovers"
  ON stopovers FOR UPDATE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete own stopovers"
  ON stopovers FOR DELETE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));
