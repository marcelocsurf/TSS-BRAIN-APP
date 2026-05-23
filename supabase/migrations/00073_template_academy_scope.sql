-- M73 — Per-academy scope for camp_templates.
--
-- Model agreed with Marcelo:
--   • Platform admin authors "global" templates (academy_id IS NULL) and
--     ASSIGNS them explicitly to each academy via the new junction table.
--   • Each academy can author its own "custom" templates that are private
--     to that academy (academy_id = <that academy>). These don't go in
--     the assignments table — ownership already implies access.
--   • Coordinator sees: (custom templates they own) ∪ (globals assigned
--     to their academy). Nothing else.
--   • Platform admin always sees every template.

ALTER TABLE camp_templates
  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES academies(id) ON DELETE CASCADE;

COMMENT ON COLUMN camp_templates.academy_id IS
  'NULL → global template authored by platform admin. UUID → custom template private to that academy.';

CREATE INDEX IF NOT EXISTS idx_camp_templates_academy
  ON camp_templates(academy_id) WHERE academy_id IS NOT NULL;

-- ─── Junction: which academies have access to each global template ──
CREATE TABLE IF NOT EXISTS academy_template_assignments (
  academy_id   UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  template_id  TEXT NOT NULL REFERENCES camp_templates(id) ON DELETE CASCADE,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (academy_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_ata_template ON academy_template_assignments(template_id);

-- ─── Backfill: auto-assign every existing global template to every
--     existing academy so nothing disappears post-deploy ──
INSERT INTO academy_template_assignments (academy_id, template_id)
SELECT a.id, t.id
FROM academies a
CROSS JOIN camp_templates t
WHERE t.academy_id IS NULL
  AND t.active_status = true
ON CONFLICT DO NOTHING;
