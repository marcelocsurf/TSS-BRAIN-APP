-- M102 — Written notes on the final camp evaluation.
--
-- The coach, when finalizing a camp (FinalCampEvaluation), can now write two
-- per-student notes alongside the 25-STP rating:
--   · student_visible_note — surfaced in the student portal (the student sees it).
--   · coach_private_note    — coach + bitácora/profile only (student never sees it).
--
-- Both nullable TEXT, additive. camp_final_evaluations already has
-- UNIQUE(camp_instance_id, student_id), so closeCampFinal upserts on that.

ALTER TABLE camp_final_evaluations
  ADD COLUMN IF NOT EXISTS student_visible_note TEXT,
  ADD COLUMN IF NOT EXISTS coach_private_note   TEXT;

COMMENT ON COLUMN camp_final_evaluations.student_visible_note IS 'Final-evaluation note the STUDENT sees in their portal.';
COMMENT ON COLUMN camp_final_evaluations.coach_private_note   IS 'Final-evaluation note visible ONLY to coach + bitácora/profile access. Never shown to the student.';
