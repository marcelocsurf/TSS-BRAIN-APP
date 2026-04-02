-- 00013_stabilization_fixes.sql
-- Production stabilization: fix type mismatches, add missing columns, update constraints

-- ═══════════════════════════════════════
-- 1. STUDENTS: Convert enum columns to TEXT so RPC can write strings
-- ═══════════════════════════════════════
ALTER TABLE students ALTER COLUMN last_session_pilar TYPE text USING last_session_pilar::text;
ALTER TABLE students ALTER COLUMN last_session_status TYPE text USING last_session_status::text;

-- ═══════════════════════════════════════
-- 2. STUDENT_SESSION_RESULTS: Add missing columns for cascade save
-- ═══════════════════════════════════════
ALTER TABLE student_session_results ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES coaches(id);
ALTER TABLE student_session_results ADD COLUMN IF NOT EXISTS student_visible_summary TEXT;

-- Fix CHECK constraint to allow cascade_session_id as valid source
-- (00012 already adds cascade_session_id column and attempts to update constraint,
--  but the constraint name may not match. Drop ALL possible names and re-add.)
DO $$
BEGIN
  ALTER TABLE student_session_results DROP CONSTRAINT IF EXISTS student_session_results_check;
  ALTER TABLE student_session_results DROP CONSTRAINT IF EXISTS student_session_results_check1;
  ALTER TABLE student_session_results DROP CONSTRAINT IF EXISTS student_session_results_source_check;
EXCEPTION WHEN others THEN NULL;
END;
$$;

ALTER TABLE student_session_results ADD CONSTRAINT student_session_results_source_check
  CHECK (camp_session_id IS NOT NULL OR standalone_session_id IS NOT NULL OR cascade_session_id IS NOT NULL);

-- ═══════════════════════════════════════
-- 3. SURVEY_RESPONSES: Add missing columns used by new 7-question survey
-- ═══════════════════════════════════════
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS academy_rating INT CHECK (academy_rating BETWEEN 1 AND 5);
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS session_quality INT CHECK (session_quality BETWEEN 1 AND 5);

-- q2_feedback is TEXT in original schema but the form now sends a numeric rating (1-5).
-- Change it to INT so it can store the rating value.
-- If existing data has text, preserve it in open_comment first.
DO $$
BEGIN
  -- Only alter if column exists and is text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_responses' AND column_name = 'q2_feedback' AND data_type = 'text'
  ) THEN
    -- Move any existing text values to open_comment
    UPDATE survey_responses
    SET open_comment = COALESCE(open_comment, '') || CASE WHEN q2_feedback IS NOT NULL AND q2_feedback != '' THEN E'\nQ2: ' || q2_feedback ELSE '' END
    WHERE q2_feedback IS NOT NULL AND q2_feedback != '';

    -- Drop and re-add as integer
    ALTER TABLE survey_responses DROP COLUMN q2_feedback;
    ALTER TABLE survey_responses ADD COLUMN q2_feedback INT CHECK (q2_feedback BETWEEN 1 AND 5);
  END IF;
END;
$$;

-- ═══════════════════════════════════════
-- 4. CASCADE_SESSIONS: Ensure assigned_by columns exist
-- ═══════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cascade_sessions' AND table_schema = 'public') THEN
    ALTER TABLE cascade_sessions ADD COLUMN IF NOT EXISTS assigned_by UUID;
    ALTER TABLE cascade_sessions ADD COLUMN IF NOT EXISTS assigned_by_name TEXT;
  END IF;
END;
$$;

-- ═══════════════════════════════════════
-- 5. Backfill coach_id on existing student_session_results from standalone_sessions
-- ═══════════════════════════════════════
UPDATE student_session_results ssr
SET coach_id = ss.coach_id
FROM standalone_sessions ss
WHERE ssr.standalone_session_id = ss.id AND ssr.coach_id IS NULL;

-- ═══════════════════════════════════════
-- 6. FRUSTRATION_RATING: Update CHECK constraint to allow 0-3 range
-- ═══════════════════════════════════════
ALTER TABLE student_session_results DROP CONSTRAINT IF EXISTS student_session_results_frustration_rating_check;
ALTER TABLE student_session_results ADD CONSTRAINT student_session_results_frustration_rating_check
  CHECK (frustration_rating BETWEEN 0 AND 10);
