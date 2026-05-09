-- 00024 — Coach Profile unlock-on-rating
--
-- Tracks when a student first submitted a survey rating their coach. Once
-- this timestamp is set, the portal exposes a "My Coach" tab with the
-- coach's profile + stats. Gamification of the feedback loop: students get
-- something useful in exchange for completing the survey.
--
-- Single timestamp on students (one unlock per student lifetime) — not
-- per-coach. The "My Coach" tab dynamically reflects whichever coach ran
-- the most recent session.

BEGIN;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS coach_profile_unlocked_at TIMESTAMPTZ;

COMMIT;
