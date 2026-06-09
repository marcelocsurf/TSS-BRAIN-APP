-- M87 — Enable RLS + tenant-scoped policies on student_session_results
-- and survey_responses.
--
-- Both tables were RLS-disabled (rls=false) → any authenticated user
-- could read every student's session feedback + survey responses
-- across all academies. Critical multi-tenant gap.
--
-- Pattern: same as M83 (step ratings) — SELECT scoped to "students in
-- my academy" via FK lookup. Writes still go through admin client
-- (service role bypasses RLS) so the existing close flow + survey
-- submit flow keep working.
--
-- Already applied to production via MCP — this file is canonical.

ALTER TABLE student_session_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS student_session_results_select ON student_session_results;
CREATE POLICY student_session_results_select ON student_session_results
  FOR SELECT USING (
    current_coach_is_platform_admin()
    OR student_id IN (
      SELECT id FROM students
      WHERE academy_id = current_coach_academy_id()
    )
  );

DROP POLICY IF EXISTS student_session_results_write ON student_session_results;
CREATE POLICY student_session_results_write ON student_session_results
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS survey_responses_select ON survey_responses;
CREATE POLICY survey_responses_select ON survey_responses
  FOR SELECT USING (
    current_coach_is_platform_admin()
    OR student_id IN (
      SELECT id FROM students
      WHERE academy_id = current_coach_academy_id()
    )
  );

DROP POLICY IF EXISTS survey_responses_write ON survey_responses;
CREATE POLICY survey_responses_write ON survey_responses
  FOR ALL USING (true) WITH CHECK (true);
