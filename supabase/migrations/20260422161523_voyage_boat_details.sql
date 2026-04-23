-- Add boat details to voyages table (per-voyage, not per-profile)
ALTER TABLE voyages ADD COLUMN boat_name VARCHAR(100);
ALTER TABLE voyages ADD COLUMN boat_type VARCHAR(20);
ALTER TABLE voyages ADD COLUMN boat_length_m NUMERIC(5,2);
ALTER TABLE voyages ADD COLUMN boat_flag VARCHAR(2);
ALTER TABLE voyages ADD COLUMN home_port VARCHAR(100);
