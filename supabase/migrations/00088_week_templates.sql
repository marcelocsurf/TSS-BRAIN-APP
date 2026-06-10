-- M88 — Week Templates
-- Coordinator defines a recurring "Standard Week" (e.g. Mon SVC-CAMP-BEG 9am,
-- Wed SVC-CAMP-NOV 9am, Fri SVC-CAMP-FOUND 9am, 5x SVC-SL1 slots), then
-- applies it to any empty week → bulk-creates camp_instances. Eliminates
-- the repetitive "+ Schedule" 8x per week pattern.

CREATE TABLE IF NOT EXISTS week_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES coaches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_week_templates_academy
  ON week_templates(academy_id);

CREATE TABLE IF NOT EXISTS week_template_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_template_id UUID NOT NULL REFERENCES week_templates(id) ON DELETE CASCADE,
  weekday INT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  service_template_id TEXT NOT NULL REFERENCES camp_templates(id) ON DELETE CASCADE,
  scheduled_time TEXT,
  default_head_coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  slot_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_week_template_slots_template
  ON week_template_slots(week_template_id);

ALTER TABLE week_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_template_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS week_templates_select ON week_templates;
CREATE POLICY week_templates_select ON week_templates
  FOR SELECT USING (
    current_coach_is_platform_admin()
    OR academy_id IS NULL
    OR academy_id = current_coach_academy_id()
  );

DROP POLICY IF EXISTS week_templates_write ON week_templates;
CREATE POLICY week_templates_write ON week_templates
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS week_template_slots_select ON week_template_slots;
CREATE POLICY week_template_slots_select ON week_template_slots
  FOR SELECT USING (
    week_template_id IN (
      SELECT id FROM week_templates
      WHERE current_coach_is_platform_admin()
        OR academy_id IS NULL
        OR academy_id = current_coach_academy_id()
    )
  );

DROP POLICY IF EXISTS week_template_slots_write ON week_template_slots;
CREATE POLICY week_template_slots_write ON week_template_slots
  FOR ALL USING (true) WITH CHECK (true);
