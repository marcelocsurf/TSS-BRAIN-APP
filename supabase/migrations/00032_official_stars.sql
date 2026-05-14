-- 00032 — Official coach stars on student_step_ratings
--
-- M4 of the Services overhaul. Adds 3 columns to student_step_ratings so
-- the coach's evaluation persists alongside the student's self-rating.
-- The portal renders the coach rating in GOLD when set, falling back
-- to the amber self-rating otherwise. The coach can re-rate at any
-- time — the latest write wins.
--
-- Why separate columns vs overwriting `current_rating`: the student
-- keeps their own honest self-evaluation. The coach overlay is layered
-- on top so the alumno can see both ("I rated myself ★★, coach rated me
-- ★★★★ — gap to close").

BEGIN;

ALTER TABLE student_step_ratings
  ADD COLUMN IF NOT EXISTS coach_rating INT
    CHECK (coach_rating IS NULL OR coach_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS coach_rated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS coach_rated_by UUID REFERENCES coaches(id);

CREATE INDEX IF NOT EXISTS idx_step_ratings_coach_rated
  ON student_step_ratings(student_id, coach_rated_at DESC)
  WHERE coach_rating IS NOT NULL;

COMMIT;
