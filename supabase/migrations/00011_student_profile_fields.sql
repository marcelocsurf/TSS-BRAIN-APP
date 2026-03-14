-- 00011_student_profile_fields.sql
-- Adds student profile fields for the public intake form.
-- These are profile/context fields — NOT assessment/quiz fields.
-- The pre-arrival evaluation lives outside the app in Stage 1.

-- ═══════════════════════════════════════
-- IDENTITY
-- ═══════════════════════════════════════
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS languages TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS instagram TEXT;

-- ═══════════════════════════════════════
-- SURF PROFILE
-- ═══════════════════════════════════════
ALTER TABLE students ADD COLUMN IF NOT EXISTS stance TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS surf_experience_years TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS surf_frequency TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS board_type TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS other_sports TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS learning_style TEXT;

-- ═══════════════════════════════════════
-- GOALS & BARRIERS
-- ═══════════════════════════════════════
ALTER TABLE students ADD COLUMN IF NOT EXISTS goal_short_term TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS goal_mid_term TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS goal_long_term TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS biggest_barrier TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS fears_phobias TEXT;

-- ═══════════════════════════════════════
-- LOGISTICS
-- ═══════════════════════════════════════
ALTER TABLE students ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS shirt_size TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS how_did_you_hear TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS returning_student BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS waiver_signed BOOLEAN DEFAULT FALSE;

-- ═══════════════════════════════════════
-- INTAKE TRACKING
-- ═══════════════════════════════════════
ALTER TABLE students ADD COLUMN IF NOT EXISTS intake_completed_at TIMESTAMPTZ;
