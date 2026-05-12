-- 00028 — Learning Profile (VAKR) on students
--
-- Stores the result of the "How Do You Learn Best?" quiz Marcelo hosts at
-- https://marcelocsurf.github.io/learning-quiz/. The student takes it on
-- their phone, tells the coach the result, and the coach records it here.
-- Future: port the quiz into the app itself so the alumno saves it directly.
--
-- VAKR channels (TSS Inclusion Module):
--   V = Visual         — learns by seeing (demos, video, diagrams)
--   K = Kinesthetic    — learns by doing (physical reps, land drills)
--   A = Analytical     — learns by logic (why, criteria, structure)
--   R = Relational     — learns by feeling safe (trust, encouragement)
--
-- The coach uses this to adapt their teaching per student. The information
-- renders on /students/[id] as a card so the coach can scan it before
-- every session.

BEGIN;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS learning_profile_primary TEXT
    CHECK (learning_profile_primary IS NULL OR learning_profile_primary IN ('V', 'K', 'A', 'R')),
  ADD COLUMN IF NOT EXISTS learning_profile_secondary TEXT
    CHECK (learning_profile_secondary IS NULL OR learning_profile_secondary IN ('V', 'K', 'A', 'R')),
  ADD COLUMN IF NOT EXISTS learning_profile_scores JSONB,
  ADD COLUMN IF NOT EXISTS learning_profile_completed_at TIMESTAMPTZ;

COMMIT;
