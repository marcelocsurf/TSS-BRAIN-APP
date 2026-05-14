-- 00030 — Academy as light multi-tenant
--
-- M1 of the Services architecture overhaul. Introduces `academies` as a
-- top-level entity, adds `academy_id` FK to the 4 core tables, seeds a
-- default academy ("TSS El Salvador"), and backfills all existing data
-- to it. Marcelo gets the `is_platform_admin` flag — he sees ACROSS
-- academies; coordinators see only their own.
--
-- Decision (Marcelo): "1 academia ahora, arquitectura lista". So we ship
-- the tables + FK + backfill now; we don't enforce hard RLS today.
-- Hard RLS is a future tightening — for now the UI/server layer scopes
-- by academy when role is not platform_admin.

BEGIN;

CREATE TABLE IF NOT EXISTS academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default academy (deterministic UUID so backfill stays stable)
INSERT INTO academies (id, name, slug, country) VALUES
  ('00000000-0000-0000-0000-000000000001', 'TSS El Salvador', 'tss-el-salvador', 'SV')
ON CONFLICT (id) DO NOTHING;

-- Add academy_id to the 4 core tables
ALTER TABLE students        ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES academies(id);
ALTER TABLE coaches         ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES academies(id);
ALTER TABLE camp_instances  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES academies(id);
ALTER TABLE camp_templates  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES academies(id);

-- Backfill ALL existing rows to the seed academy
UPDATE students       SET academy_id = '00000000-0000-0000-0000-000000000001' WHERE academy_id IS NULL;
UPDATE coaches        SET academy_id = '00000000-0000-0000-0000-000000000001' WHERE academy_id IS NULL;
UPDATE camp_instances SET academy_id = '00000000-0000-0000-0000-000000000001' WHERE academy_id IS NULL;
-- camp_templates left with NULL academy_id = "global template available to all academies"

-- Platform admin flag (Marcelo) — sees all academies
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT false;
UPDATE coaches SET is_platform_admin = true
  WHERE email = 'marcelocsurf@gmail.com' OR display_name ILIKE 'Marcelo Castellanos%';

CREATE INDEX IF NOT EXISTS idx_students_academy        ON students(academy_id);
CREATE INDEX IF NOT EXISTS idx_coaches_academy         ON coaches(academy_id);
CREATE INDEX IF NOT EXISTS idx_camp_instances_academy  ON camp_instances(academy_id);
CREATE INDEX IF NOT EXISTS idx_camp_templates_academy  ON camp_templates(academy_id) WHERE academy_id IS NOT NULL;

-- RLS permissive (matches existing pattern — hard RLS deferred)
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academies_all ON academies;
CREATE POLICY academies_all ON academies FOR ALL USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_academies_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS academies_timestamp ON academies;
CREATE TRIGGER academies_timestamp
  BEFORE UPDATE ON academies
  FOR EACH ROW EXECUTE FUNCTION update_academies_timestamp();

COMMIT;
