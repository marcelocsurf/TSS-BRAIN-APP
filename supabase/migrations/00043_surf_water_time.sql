-- Total time the student was actually in the water for a session
ALTER TABLE self_training_sessions
  ADD COLUMN IF NOT EXISTS total_water_minutes INT;

-- Allow a pure free-surf log (no mission/drill)
ALTER TABLE self_training_sessions DROP CONSTRAINT IF EXISTS self_training_sessions_kind_check;
ALTER TABLE self_training_sessions
  ADD CONSTRAINT self_training_sessions_kind_check
  CHECK (kind IN ('drill', 'custom', 'free_surf'));
