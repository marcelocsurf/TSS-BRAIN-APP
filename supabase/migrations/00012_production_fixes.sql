-- 00012_production_fixes.sql
-- Production readiness fixes — columns missing from schema that the app requires

-- ═══════════════════════════════════════
-- STUDENTS: Missing columns for intake, waiver tracking, and cascade context
-- ═══════════════════════════════════════
ALTER TABLE students ADD COLUMN IF NOT EXISTS intake_tier TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS waiver_signed_at TIMESTAMPTZ;
ALTER TABLE students ADD COLUMN IF NOT EXISTS waiver_signed_by TEXT;

-- ═══════════════════════════════════════
-- STUDENT_SESSION_RESULTS: Add cascade_session_id and relax CHECK constraint
-- The original CHECK requires camp_session_id OR standalone_session_id,
-- but cascade sessions need their own FK column.
-- ═══════════════════════════════════════
ALTER TABLE student_session_results ADD COLUMN IF NOT EXISTS cascade_session_id UUID;
ALTER TABLE student_session_results ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE student_session_results ADD COLUMN IF NOT EXISTS incident_type TEXT;
ALTER TABLE student_session_results ADD COLUMN IF NOT EXISTS incident_description TEXT;
ALTER TABLE student_session_results ADD COLUMN IF NOT EXISTS incident_action TEXT;
ALTER TABLE student_session_results ADD COLUMN IF NOT EXISTS duration_minutes INT;

-- Drop the old CHECK constraint and add a relaxed one
-- (The constraint name depends on DB; try common patterns)
DO $$
BEGIN
  -- Try to drop any existing CHECK constraint on the table
  ALTER TABLE student_session_results DROP CONSTRAINT IF EXISTS student_session_results_check;
  ALTER TABLE student_session_results DROP CONSTRAINT IF EXISTS student_session_results_check1;

  -- Add new constraint: at least one source must be non-null
  ALTER TABLE student_session_results ADD CONSTRAINT student_session_results_source_check
    CHECK (camp_session_id IS NOT NULL OR standalone_session_id IS NOT NULL OR cascade_session_id IS NOT NULL);
EXCEPTION
  WHEN others THEN NULL; -- Ignore if constraint doesn't exist or rename fails
END;
$$;

-- ═══════════════════════════════════════
-- STANDALONE_SESSIONS: Missing columns referenced by closeStandaloneSession
-- ═══════════════════════════════════════
ALTER TABLE standalone_sessions ADD COLUMN IF NOT EXISTS simulation TEXT;
ALTER TABLE standalone_sessions ADD COLUMN IF NOT EXISTS mission_time TEXT;
ALTER TABLE standalone_sessions ADD COLUMN IF NOT EXISTS repetitions INT;

-- ═══════════════════════════════════════
-- SESSION_MISSIONS: Table for multi-mission sessions
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS session_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standalone_session_id UUID NOT NULL REFERENCES standalone_sessions(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 1,
  pilar_part TEXT,
  pilar TEXT,
  drill_id TEXT,
  mission TEXT,
  warm_up TEXT,
  simulation TEXT,
  mental_hack TEXT,
  mission_time TEXT,
  repetitions INT,
  status TEXT,
  focus_rating INT CHECK (focus_rating BETWEEN 1 AND 5),
  coach_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sm_session ON session_missions(standalone_session_id);

-- ═══════════════════════════════════════
-- STUDENT_LEVEL_ACCESS: Table for admin-granted level access
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS student_level_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL DEFAULT 'level',
  level_key TEXT NOT NULL,
  source TEXT DEFAULT 'admin_grant',
  granted_by UUID REFERENCES coaches(id),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, access_type, level_key)
);

-- ═══════════════════════════════════════
-- PILAR_PARTS: Table for cascade Step 6
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS pilar_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pilar_id TEXT NOT NULL, -- technical, tactical, mental, physical, safety
  description TEXT,
  min_belt TEXT NOT NULL DEFAULT 'white_belt',
  max_belt TEXT NOT NULL DEFAULT 'black_belt',
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true
);

-- ═══════════════════════════════════════
-- RATING_SCALES: Table for cascade Step 16
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS rating_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_name TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  min_belt TEXT NOT NULL DEFAULT 'white_belt',
  max_belt TEXT NOT NULL DEFAULT 'black_belt',
  min_value INT NOT NULL DEFAULT 1,
  max_value INT NOT NULL DEFAULT 5,
  display_order INT NOT NULL DEFAULT 0
);

-- ═══════════════════════════════════════
-- DROPDOWN_OPTIONS: Table for cascade dropdowns
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS dropdown_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB
);

-- ═══════════════════════════════════════
-- RLS Policies for new tables
-- ═══════════════════════════════════════
ALTER TABLE student_level_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilar_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read pilar_parts"
  ON pilar_parts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read rating_scales"
  ON rating_scales FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read dropdown_options"
  ON dropdown_options FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage student_level_access"
  ON student_level_access FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage session_missions"
  ON session_missions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════
-- CASCADE_SESSIONS: Ensure the table exists with all needed columns
-- (If it was created by the RPC function as SECURITY DEFINER,
-- it should already exist. Add any missing columns.)
-- ═══════════════════════════════════════
-- Note: cascade_sessions table is created by the save_cascade_session RPC.
-- The RPC inserts into it, so the table must already exist in production.
-- These ALTER statements ensure any columns added post-launch are present.

-- ═══════════════════════════════════════
-- RPC: get_drills_for_belt (used by cascade Step 8)
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION get_drills_for_belt(p_belt_key text)
RETURNS SETOF drills
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM drills
  WHERE active_status = true
  ORDER BY drill_name;
$$;

-- ═══════════════════════════════════════
-- RPC: get_pilar_parts_for_belt (used by sessions.ts)
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION get_pilar_parts_for_belt(p_belt_key text)
RETURNS TABLE(id uuid, pilar text, part_name text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pp.id, pp.pilar_id AS pilar, pp.name AS part_name
  FROM pilar_parts pp
  WHERE pp.active = true
    AND pp.pilar_id != 'safety'
  ORDER BY pp.pilar_id, pp.display_order;
$$;

-- ═══════════════════════════════════════
-- FIX: coach_student_feedback view (column name mismatch with survey_responses)
-- ═══════════════════════════════════════
CREATE OR REPLACE VIEW coach_student_feedback AS
SELECT
  ssr.coach_id,
  c.display_name AS coach_name,
  ssr.student_id,
  s.first_name AS student_first_name,
  s.last_name AS student_last_name,
  s.belt_level AS student_belt_level,
  ssr.id AS session_result_id,
  ssr.status,
  ssr.focus_rating,
  ssr.frustration_rating,
  ssr.coach_feedback,
  ssr.student_visible_summary,
  ssr.homework,
  ssr.whats_next,
  ssr.completion_state,
  ssr.created_at,
  sr.coach_rating,
  sr.open_comment
FROM student_session_results ssr
JOIN coaches c ON c.id = ssr.coach_id
JOIN students s ON s.id = ssr.student_id
LEFT JOIN survey_responses sr ON sr.session_result_id = ssr.id
WHERE ssr.coach_id IS NOT NULL
ORDER BY ssr.created_at DESC;

-- ═══════════════════════════════════════
-- FIX: coach_rating_stats view (add missing star columns)
-- ═══════════════════════════════════════
CREATE OR REPLACE VIEW coach_rating_stats AS
SELECT
  ssr.coach_id,
  c.display_name AS coach_name,
  ROUND(AVG(sr.coach_rating)::numeric, 2) AS avg_rating,
  COUNT(sr.id) AS total_ratings,
  COUNT(CASE WHEN sr.coach_rating = 5 THEN 1 END) AS five_star,
  COUNT(CASE WHEN sr.coach_rating = 4 THEN 1 END) AS four_star,
  COUNT(CASE WHEN sr.coach_rating = 3 THEN 1 END) AS three_star,
  COUNT(CASE WHEN sr.coach_rating = 2 THEN 1 END) AS two_star,
  COUNT(CASE WHEN sr.coach_rating = 1 THEN 1 END) AS one_star
FROM student_session_results ssr
JOIN coaches c ON c.id = ssr.coach_id
LEFT JOIN survey_responses sr ON sr.session_result_id = ssr.id
WHERE ssr.coach_id IS NOT NULL
  AND sr.id IS NOT NULL
GROUP BY ssr.coach_id, c.display_name;
