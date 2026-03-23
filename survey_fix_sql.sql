-- Survey Enhancement: Add academy_rating and session_quality columns
-- Run this against the Supabase database

-- Add new rating columns to survey_responses
ALTER TABLE survey_responses
  ADD COLUMN IF NOT EXISTS academy_rating smallint,
  ADD COLUMN IF NOT EXISTS session_quality smallint;

-- Add check constraints for valid rating ranges
ALTER TABLE survey_responses
  ADD CONSTRAINT chk_academy_rating CHECK (academy_rating IS NULL OR (academy_rating >= 1 AND academy_rating <= 5)),
  ADD CONSTRAINT chk_session_quality CHECK (session_quality IS NULL OR (session_quality >= 1 AND session_quality <= 5));

-- Comment the columns for documentation
COMMENT ON COLUMN survey_responses.academy_rating IS 'Student rating of the overall academy/experience (1-5)';
COMMENT ON COLUMN survey_responses.session_quality IS 'Student rating of how useful the session was (1-5)';
