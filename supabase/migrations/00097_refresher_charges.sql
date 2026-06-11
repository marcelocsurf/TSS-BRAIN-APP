-- M97 — Refresher charges. A student who already holds a course but repeats
-- the level is billed at 50% (internal billing only — no new access grant).
CREATE TABLE IF NOT EXISTS refresher_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  course_key TEXT NOT NULL,
  camp_instance_id UUID REFERENCES camp_instances(id) ON DELETE SET NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_by UUID REFERENCES coaches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, camp_instance_id, course_key)
);
CREATE INDEX IF NOT EXISTS idx_refresher_charges_academy_date ON refresher_charges(academy_id, created_at);
ALTER TABLE refresher_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY refresher_charges_select ON refresher_charges FOR SELECT USING (
  current_coach_is_platform_admin() OR academy_id = current_coach_academy_id()
);
CREATE POLICY refresher_charges_insert ON refresher_charges FOR INSERT WITH CHECK (true);
CREATE POLICY refresher_charges_update ON refresher_charges FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY refresher_charges_delete ON refresher_charges FOR DELETE USING (true);
