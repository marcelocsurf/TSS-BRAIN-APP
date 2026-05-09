-- 00026 — Add `kind` to self_training_sessions
--
-- Distinguishes between two flows the student can run from the Train tab:
--
--   - 'drill'  (default): structured training tied to a specific drill or
--               mission from the canon. Counts toward step mastery,
--               supports criteria_evaluation, surfaces in the coach's
--               struggling-steps signals (Track A).
--
--   - 'custom': free-form session ("free surf", "respiración", "diversión",
--               anything the student writes). Logged for completeness so
--               the student gets credit for time in the water, BUT does
--               NOT contribute to per-step metrics. Coach sees it tagged
--               separately so they can read it as engagement, not progress.
--
-- Existing rows default to 'drill' (which is what they actually were).

BEGIN;

ALTER TABLE self_training_sessions
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'drill'
    CHECK (kind IN ('drill', 'custom'));

CREATE INDEX IF NOT EXISTS idx_self_training_kind
  ON self_training_sessions(student_id, kind, created_at DESC);

COMMIT;
