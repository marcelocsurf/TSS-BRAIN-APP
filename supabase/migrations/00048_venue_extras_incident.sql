-- M48 — Beef up the Venue Analysis with more standardized fields so the
-- coach can fill it in dropdown-style (less typing, more comparable
-- across services). Also: the per-session incident report at close
-- already has columns on student_session_results (00012) so no schema
-- change there — this migration is just the venue extras.

ALTER TABLE service_plans
  ADD COLUMN IF NOT EXISTS venue_crowd      TEXT,
  ADD COLUMN IF NOT EXISTS venue_water_temp TEXT,
  ADD COLUMN IF NOT EXISTS venue_sky        TEXT;
