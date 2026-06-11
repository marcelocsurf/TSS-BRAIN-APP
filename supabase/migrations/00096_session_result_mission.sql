-- M96 — Store the session focus/mission on camp/service session results.
-- Camp sessions don't have a standalone_sessions row, so their focus was
-- lost. Now persisted directly so coach + student see what was worked on.
ALTER TABLE student_session_results ADD COLUMN IF NOT EXISTS mission TEXT;
