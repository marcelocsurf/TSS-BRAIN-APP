-- 00033 — Coach Portal (token + lesson_progress mirror)
--
-- M5 of the Services overhaul. Mirrors the student portal pattern for
-- coaches:
--   1. Coach gets a portal_token (UUID, unique) for /coach-portal/[token]
--      access — same model as students.portal_token.
--   2. Coach lesson progress lives in its own table parallel to
--      lesson_progress (for students). Same shape, scoped to coaches.
--
-- The coach courses themselves are NOT new tables — we reuse the
-- existing `lessons` table with `course_section` values like 'coach_l1',
-- 'coach_l2' etc. Marcelo seeds those when he's ready to write them.
-- For now the schema lays the foundation.

BEGIN;

-- 1. Portal token per coach
ALTER TABLE coaches
  ADD COLUMN IF NOT EXISTS portal_token UUID UNIQUE;

-- Generate tokens for all existing coaches that don't have one
UPDATE coaches SET portal_token = gen_random_uuid() WHERE portal_token IS NULL;

-- Make NOT NULL going forward (after backfill)
ALTER TABLE coaches ALTER COLUMN portal_token SET NOT NULL;
ALTER TABLE coaches ALTER COLUMN portal_token SET DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_coaches_portal_token ON coaches(portal_token);

-- 2. Coach lesson progress (mirror of student lesson_progress)
CREATE TABLE IF NOT EXISTS coach_lesson_progress (
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  video_watched BOOLEAN DEFAULT false,
  content_read BOOLEAN DEFAULT false,
  quiz_score INTEGER,
  quiz_attempts INTEGER DEFAULT 0,
  form_response JSONB,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (coach_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_coach_progress_coach ON coach_lesson_progress(coach_id);

ALTER TABLE coach_lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coach_lesson_progress_all ON coach_lesson_progress;
CREATE POLICY coach_lesson_progress_all ON coach_lesson_progress FOR ALL USING (true);

COMMIT;
