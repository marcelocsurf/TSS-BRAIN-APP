-- Portal Venue Analysis columns for self_training_sessions
-- Run this migration to add venue analysis fields to self-training

ALTER TABLE self_training_sessions ADD COLUMN IF NOT EXISTS venue_type TEXT;
ALTER TABLE self_training_sessions ADD COLUMN IF NOT EXISTS wave_conditions TEXT;
ALTER TABLE self_training_sessions ADD COLUMN IF NOT EXISTS wind TEXT;
ALTER TABLE self_training_sessions ADD COLUMN IF NOT EXISTS tide TEXT;
ALTER TABLE self_training_sessions ADD COLUMN IF NOT EXISTS crowd_level TEXT;
ALTER TABLE self_training_sessions ADD COLUMN IF NOT EXISTS safety_check BOOLEAN DEFAULT false;
ALTER TABLE self_training_sessions ADD COLUMN IF NOT EXISTS venue_notes TEXT;
