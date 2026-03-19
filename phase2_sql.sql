-- =============================================
-- Phase 2: Session Close Architecture — SQL Migration
-- Run this manually in Supabase SQL Editor
-- =============================================

-- 1. Add new columns to student_session_results
ALTER TABLE student_session_results
  ADD COLUMN IF NOT EXISTS student_visible_summary text;

ALTER TABLE student_session_results
  ADD COLUMN IF NOT EXISTS coach_id uuid REFERENCES coaches(id);

-- 2. Coach rating stats view
-- Aggregates average ratings per coach across all their sessions
CREATE OR REPLACE VIEW coach_rating_stats AS
SELECT
  ssr.coach_id,
  c.display_name AS coach_name,
  COUNT(ssr.id) AS total_sessions,
  ROUND(AVG(ssr.focus_rating)::numeric, 2) AS avg_focus_rating,
  ROUND(AVG(ssr.frustration_rating)::numeric, 2) AS avg_frustration_rating,
  COUNT(CASE WHEN ssr.status = 'mastered' THEN 1 END) AS mastered_count,
  COUNT(CASE WHEN ssr.status = 'competent' THEN 1 END) AS competent_count,
  COUNT(CASE WHEN ssr.status = 'partial' THEN 1 END) AS partial_count,
  COUNT(CASE WHEN ssr.status = 'not_achieved' OR ssr.status = 'not_yet' THEN 1 END) AS not_achieved_count,
  MIN(ssr.created_at) AS first_session_at,
  MAX(ssr.created_at) AS last_session_at
FROM student_session_results ssr
JOIN coaches c ON c.id = ssr.coach_id
WHERE ssr.coach_id IS NOT NULL
GROUP BY ssr.coach_id, c.display_name;

-- 3. Coach-student feedback view
-- Shows student feedback linked to a coach, useful for coach performance reviews
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
  ssr.created_at AS session_date,
  sr.overall_rating AS student_rating,
  sr.enjoyment_rating AS student_enjoyment,
  sr.open_feedback AS student_open_feedback
FROM student_session_results ssr
JOIN coaches c ON c.id = ssr.coach_id
JOIN students s ON s.id = ssr.student_id
LEFT JOIN survey_responses sr ON sr.session_result_id = ssr.id
WHERE ssr.coach_id IS NOT NULL
ORDER BY ssr.created_at DESC;
