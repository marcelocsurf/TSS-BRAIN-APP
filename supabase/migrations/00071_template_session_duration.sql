-- M71 — Add per-session duration to camp_templates.
--
-- Today duration_days controls how many days the camp runs. Marcelo needs
-- a second dimension: how long each session/day lasts (e.g. a 90-min surf
-- lesson is duration_days=1 + session_duration_minutes=90; a 6-day camp
-- with 3-hour morning sessions is duration_days=6 + session_duration_
-- minutes=180). The form exposes two pickers (Hours + Minutes) that map
-- to this single integer.

ALTER TABLE camp_templates
  ADD COLUMN IF NOT EXISTS session_duration_minutes INTEGER;

COMMENT ON COLUMN camp_templates.session_duration_minutes IS
  'Per-day session length in minutes. NULL = unspecified.';
