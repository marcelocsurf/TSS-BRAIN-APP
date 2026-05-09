-- 00023 — Ocean Quiz columns on students
--
-- Adds storage for the ocean self-sufficiency quiz that runs as Stage 0
-- of the intake flow. Determines a student's `ocean_level` provisionally;
-- the coach can confirm/override later via OceanLevelPanel, which clears
-- the provisional flag.
--
-- Taxonomy extended (in code) from 4 → 5 levels to introduce
-- 'semi_autonomous' between 'supervised' and 'autonomous' — the threshold
-- between "needs coach at side" and "can self-launch in waist-to-chest
-- conditions". No CHECK constraint on ocean_level (kept TEXT-free for
-- backwards compatibility with the 2555+ existing student records).

BEGIN;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS ocean_quiz_answers JSONB,
  ADD COLUMN IF NOT EXISTS ocean_quiz_score JSONB,
  ADD COLUMN IF NOT EXISTS ocean_quiz_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ocean_level_provisional BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_students_ocean_quiz_completed
  ON students(ocean_quiz_completed_at)
  WHERE ocean_quiz_completed_at IS NOT NULL;

COMMIT;
