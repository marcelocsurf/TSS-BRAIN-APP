-- M74 — Week Templates: a "Standard Surf Week" recipe the coordinator
-- can author once and stamp onto any empty week in the calendar with a
-- single click, bulk-creating camp_instances from the slot definitions.
--
-- Academy-scoped (NOT global). Every academy defines its own weekly
-- rhythm because the mix of services + coaches + times is local.

CREATE TABLE IF NOT EXISTS week_templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id     UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  active_status  BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_week_templates_academy
  ON week_templates(academy_id) WHERE active_status = true;

-- A slot = one service instance the recipe will create when applied.
-- weekday 0=Mon … 6=Sun (ISO).
CREATE TABLE IF NOT EXISTS week_template_slots (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_template_id       UUID NOT NULL REFERENCES week_templates(id) ON DELETE CASCADE,
  weekday                SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  service_template_id    TEXT NOT NULL REFERENCES camp_templates(id) ON DELETE CASCADE,
  scheduled_time         TEXT,
  default_head_coach_id  UUID REFERENCES coaches(id) ON DELETE SET NULL,
  display_order          INTEGER NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wts_template ON week_template_slots(week_template_id);
