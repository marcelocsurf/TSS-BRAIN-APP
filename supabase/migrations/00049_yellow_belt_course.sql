-- M49 — Yellow Belt course access + per-student active-course pointer.
--
-- Same access pattern as `course_access_white`: a boolean flag the
-- coordinator/admin flips via `grantCourseToStudent('yellow_belt', ...)`
-- in `course_grants` (the grant action already writes both the row in
-- course_grants and the matching `course_access_*` column on students,
-- so no flow change is needed).
--
-- `active_course_key` is the picker state. When a student owns more
-- than one course they can switch between them and the Course tab,
-- My Sequence tab and Let's Play all respect the selection. Defaults
-- to white_belt to keep existing students unaffected.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS course_access_yellow BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS active_course_key   TEXT   NOT NULL DEFAULT 'white_belt';

-- A student should never have an active course they don't own. The
-- portal will fall back to the first owned course at render time if
-- the value is stale, but the constraint guards against typos when
-- writing manually via SQL.
-- Postgres doesn't support `IF NOT EXISTS` on ADD CONSTRAINT, so guard manually.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'active_course_key_check'
  ) THEN
    ALTER TABLE students
      ADD CONSTRAINT active_course_key_check
      CHECK (active_course_key IN ('white_belt', 'yellow_belt'));
  END IF;
END $$;
