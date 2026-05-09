-- 00025 — Multi-block session planning (Group-Session feature, Fase G1)
--
-- A "multi-block session" lets the coach pre-plan N timed blocks per
-- student (drill + objective + duration), execute them sequentially, and
-- close per-block with status. This is the foundation for:
--   G1: 1-on-1 multi-objective sessions (THIS migration)
--   G2: group sessions with per-student blocks (reuses these tables)
--   G3: pre-planning the next session at close (reuses these tables)
--
-- Design decisions:
--   - Separate from cascade_sessions (don't pollute the 22-step model).
--   - Hooks into student_session_results via a new column so the unified
--     bítacora keeps working (students/[id] page already merges sources).
--   - lesson_plan_blocks.status is NULL pre-close, then 'achieved' /
--     'partial' / 'not_yet' set at close time.

BEGIN;

CREATE TABLE IF NOT EXISTS multi_block_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  training_venue TEXT,
  warm_up TEXT,
  mental_hack TEXT,
  notes_general TEXT,
  total_planned_minutes INTEGER DEFAULT 0,
  total_actual_minutes INTEGER,
  completion_state TEXT NOT NULL DEFAULT 'planned'
    CHECK (completion_state IN ('planned', 'in_progress', 'closed')),
  general_coach_feedback TEXT,
  general_homework TEXT,
  general_whats_next TEXT,
  started_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mbs_student
  ON multi_block_sessions(student_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_mbs_coach ON multi_block_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_mbs_state
  ON multi_block_sessions(completion_state)
  WHERE completion_state != 'closed';

CREATE TABLE IF NOT EXISTS lesson_plan_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  multi_block_session_id UUID NOT NULL
    REFERENCES multi_block_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  step_id TEXT,                        -- STP-XXX (part of sequence)
  drill_id TEXT,                       -- DRL-WB-XX or MIS-WB-XXX (drills_missions.id)
  duration_minutes INTEGER NOT NULL DEFAULT 15
    CHECK (duration_minutes BETWEEN 1 AND 240),
  objective_text TEXT,                 -- prefilled from drill.key_words, coach can edit
  status TEXT
    CHECK (status IS NULL OR status IN ('achieved', 'partial', 'not_yet')),
  coach_notes TEXT,                    -- per-block coach observation at close
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocks_session
  ON lesson_plan_blocks(multi_block_session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_blocks_student
  ON lesson_plan_blocks(student_id, created_at DESC);

-- Unified bitacora hookup: link the session result to the multi-block session
ALTER TABLE student_session_results
  ADD COLUMN IF NOT EXISTS multi_block_session_id UUID
    REFERENCES multi_block_sessions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ssr_multi_block_session
  ON student_session_results(multi_block_session_id)
  WHERE multi_block_session_id IS NOT NULL;

-- Auto-update updated_at on block changes
CREATE OR REPLACE FUNCTION update_lesson_plan_block_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lesson_plan_block_timestamp ON lesson_plan_blocks;
CREATE TRIGGER lesson_plan_block_timestamp
  BEFORE UPDATE ON lesson_plan_blocks
  FOR EACH ROW EXECUTE FUNCTION update_lesson_plan_block_timestamp();

DROP TRIGGER IF EXISTS multi_block_session_timestamp ON multi_block_sessions;
CREATE TRIGGER multi_block_session_timestamp
  BEFORE UPDATE ON multi_block_sessions
  FOR EACH ROW EXECUTE FUNCTION update_lesson_plan_block_timestamp();

-- Permissive RLS for now (matches existing pattern in this project)
ALTER TABLE multi_block_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS multi_block_sessions_all ON multi_block_sessions;
CREATE POLICY multi_block_sessions_all ON multi_block_sessions FOR ALL USING (true);

ALTER TABLE lesson_plan_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lesson_plan_blocks_all ON lesson_plan_blocks;
CREATE POLICY lesson_plan_blocks_all ON lesson_plan_blocks FOR ALL USING (true);

COMMIT;
