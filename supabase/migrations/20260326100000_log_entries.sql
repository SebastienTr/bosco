-- Log entries table (FR-6: Journal Entries)
CREATE TABLE log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id UUID NOT NULL REFERENCES voyages(id) ON DELETE CASCADE,
  leg_id UUID REFERENCES legs(id) ON DELETE SET NULL,
  stopover_id UUID REFERENCES stopovers(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL,
  text TEXT NOT NULL,
  photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast voyage-entry lookup
CREATE INDEX idx_log_entries_voyage_id ON log_entries(voyage_id);

-- RLS
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies join through voyages to check ownership
CREATE POLICY "Users can read own log entries"
  ON log_entries FOR SELECT TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert own log entries"
  ON log_entries FOR INSERT TO authenticated
  WITH CHECK (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update own log entries"
  ON log_entries FOR UPDATE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete own log entries"
  ON log_entries FOR DELETE TO authenticated
  USING (voyage_id IN (SELECT id FROM voyages WHERE user_id = (SELECT auth.uid())));

-- Public read for visitors (entries in public voyages)
CREATE POLICY "Anyone can read log entries of public voyages"
  ON log_entries FOR SELECT
  USING (voyage_id IN (SELECT id FROM voyages WHERE is_public = true));
