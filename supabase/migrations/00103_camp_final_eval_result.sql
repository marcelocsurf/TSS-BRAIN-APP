-- M103 — Record the outcome of the final camp evaluation.
--
-- When the coach finalizes a camp, store a per-student "acta": whether the
-- student was approved (>= 4 stars on every part of the sequence) and the
-- timestamp it was finalized. This is the frozen graduation record for that
-- camp, independent of the live per-STP ratings which keep evolving.

ALTER TABLE camp_final_evaluations
  ADD COLUMN IF NOT EXISTS approved     BOOLEAN,
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;

COMMENT ON COLUMN camp_final_evaluations.approved     IS 'Final camp outcome: true if the student met the pass rule (>=4 stars on every sequence part) at finalize time.';
COMMENT ON COLUMN camp_final_evaluations.finalized_at IS 'When the coach finalized the camp evaluation for this student.';
