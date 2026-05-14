-- 00037 — Service Plans (coach portal session planner)
--
-- The coach plans a class BEFORE delivering it. One service_plans row
-- per camp_instance (the Service). The plan has:
--   - Venue analysis (today's conditions + go/no-go)
--   - Group warm-up (single choice from coach's tools, or custom)
--   - Mental hack (group focus exercise)
--   - Notes (free text)
-- Plus per-student blocks (service_plan_blocks) — each student in the
-- camp can have different drills + missions + objectives, while the
-- venue/warmup/mental-hack stays shared at the group level.
--
-- At close time the coach evaluates each block (achieved/partial/not_yet)
-- and writes per-student close notes. That data is the bítacora.
--
-- Decoupled from existing multi_block_sessions (which is for solo
-- student training plans). This table targets the MULTI-STUDENT service
-- case described by Marcelo for the coach portal.

BEGIN;

CREATE TABLE IF NOT EXISTS service_plans (
  camp_instance_id UUID PRIMARY KEY REFERENCES camp_instances(id) ON DELETE CASCADE,

  -- Venue analysis
  venue_analysis TEXT,
  venue_go_no_go TEXT
    CHECK (venue_go_no_go IS NULL OR venue_go_no_go IN ('go', 'modified', 'no_go')),
  venue_wave_size TEXT,           -- e.g. "head-high", "knee-high"
  venue_wind TEXT,                -- e.g. "offshore 5-10 kts"
  venue_tide TEXT,                -- e.g. "rising mid"
  venue_hazards TEXT,             -- e.g. "rocks on north end"

  -- Group warm-up: pick from a drill OR write custom
  warm_up_drill_id TEXT,          -- drills_missions.id when picked
  warm_up_custom TEXT,            -- write-in when no drill picked

  -- Mental hack: 'breathe' | 'focus' | 'play' OR custom write-in
  mental_hack TEXT,

  -- Coach notes (general session-level)
  notes_general TEXT,

  -- Lifecycle
  completion_state TEXT NOT NULL DEFAULT 'planned'
    CHECK (completion_state IN ('planned', 'in_progress', 'closed')),
  started_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_plan_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_instance_id UUID NOT NULL REFERENCES camp_instances(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,

  -- Sequence focus: which STP we're working on for this student
  step_id TEXT,                   -- STP-XXX (drives auto-suggested mission)

  -- LAND phase drill: pick OR custom
  land_drill_id TEXT,             -- drills_missions.id (drill type ideally)
  land_drill_custom TEXT,         -- write-in

  -- WATER phase drill/mission: pick OR custom
  water_drill_id TEXT,            -- drills_missions.id (mission type ideally)
  water_drill_custom TEXT,        -- write-in

  -- What success looks like for this student today
  objective_text TEXT,

  -- Pre-session coach notes (private to coach)
  notes_pre TEXT,

  -- At close: how it went
  status TEXT
    CHECK (status IS NULL OR status IN ('achieved', 'partial', 'not_yet')),
  notes_post TEXT,                -- coach's close observation per student

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_plan_blocks_camp
  ON service_plan_blocks(camp_instance_id, order_index);
CREATE INDEX IF NOT EXISTS idx_service_plan_blocks_student
  ON service_plan_blocks(student_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION touch_service_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_plans_touch ON service_plans;
CREATE TRIGGER service_plans_touch
  BEFORE UPDATE ON service_plans
  FOR EACH ROW EXECUTE FUNCTION touch_service_plans_updated_at();

DROP TRIGGER IF EXISTS service_plan_blocks_touch ON service_plan_blocks;
CREATE TRIGGER service_plan_blocks_touch
  BEFORE UPDATE ON service_plan_blocks
  FOR EACH ROW EXECUTE FUNCTION touch_service_plans_updated_at();

-- RLS — permissive (server actions use admin client; safety in app layer)
ALTER TABLE service_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_plans_all ON service_plans;
CREATE POLICY service_plans_all ON service_plans FOR ALL USING (true);

ALTER TABLE service_plan_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_plan_blocks_all ON service_plan_blocks;
CREATE POLICY service_plan_blocks_all ON service_plan_blocks FOR ALL USING (true);

COMMIT;


-- ============================================================
-- Also: remove gating on the Exit Test so Marcelo can preview
-- it without having to mark all 15 lessons as read first.
-- (He can re-add the prereq later if desired.)
-- ============================================================
UPDATE lessons
SET prerequisites = '{}'::text[]
WHERE id = 'COACH-WB-EXIT-TEST';
