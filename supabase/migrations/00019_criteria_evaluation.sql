-- 00019 — Add criteria_evaluation JSONB to self_training_sessions
-- Enables per-criterion post-session evaluation when a training session
-- is linked to a drill/mission from My Sequence.
--
-- Format example:
-- [
--   {"criterion_index": 0, "criterion_text": "Detects incoming foam", "result": "met"},
--   {"criterion_index": 1, "criterion_text": "Passes foam without losing board", "result": "partial"},
--   {"criterion_index": 2, "criterion_text": "Executes 5+ rolls cleanly", "result": "not_met"}
-- ]

BEGIN;

ALTER TABLE self_training_sessions
  ADD COLUMN IF NOT EXISTS criteria_evaluation JSONB,
  ADD COLUMN IF NOT EXISTS planned_duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS planned_reps INTEGER,
  ADD COLUMN IF NOT EXISTS intention_text TEXT;

CREATE INDEX IF NOT EXISTS idx_self_training_linked_step
  ON self_training_sessions(linked_step_id)
  WHERE linked_step_id IS NOT NULL;

COMMIT;
