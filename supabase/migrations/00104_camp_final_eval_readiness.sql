-- M104 — Readiness summary on the final camp evaluation.
--
-- Stores a compact, human-readable verdict of the level-based graduation
-- check (e.g. "6/8 YB STPs · 3/5 principles") so the bitácora shows WHY a
-- student was approved or left in progress — not just the boolean.

ALTER TABLE camp_final_evaluations
  ADD COLUMN IF NOT EXISTS readiness_summary TEXT;

COMMENT ON COLUMN camp_final_evaluations.readiness_summary IS 'Compact level-based graduation verdict, e.g. "6/8 STPs >=4 stars · 3/5 principles".';
