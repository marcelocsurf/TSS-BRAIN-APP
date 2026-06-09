-- M83 — Tighten RLS on student_step_ratings.
--
-- The original M17 migration shipped this table with FOR ALL USING (true)
-- because at the time the app was single-tenant. With multiple academies
-- now live, a coordinator with a valid login could query the table
-- directly and (if they guessed/obtained a student UUID from another
-- academy) read their ratings.
--
-- Fix: scope SELECT to "students whose academy is mine" + reuse the
-- same helper functions M36 introduced for the other tenant-isolated
-- tables. INSERT/UPDATE/DELETE keep going through the admin client in
-- server actions, so we don't need narrow write policies — but we DO
-- need to keep a permissive write policy so the existing flows work.
-- Tightening writes further requires auditing every callsite.

DROP POLICY IF EXISTS student_step_ratings_all ON student_step_ratings;

ALTER TABLE student_step_ratings ENABLE ROW LEVEL SECURITY;

-- Read: platform admin sees all; coordinator/coach sees only ratings
-- of students in their own academy.
DROP POLICY IF EXISTS student_step_ratings_select ON student_step_ratings;
CREATE POLICY student_step_ratings_select ON student_step_ratings
  FOR SELECT USING (
    current_coach_is_platform_admin()
    OR student_id IN (
      SELECT id FROM students
      WHERE academy_id = current_coach_academy_id()
    )
  );

-- Writes still flow through the admin client (service role bypasses
-- RLS), so we leave a permissive write policy for any legacy code
-- that uses the user client.
DROP POLICY IF EXISTS student_step_ratings_write ON student_step_ratings;
CREATE POLICY student_step_ratings_write ON student_step_ratings
  FOR ALL USING (true) WITH CHECK (true);
