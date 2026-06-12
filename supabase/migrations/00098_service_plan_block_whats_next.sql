-- M98 — Separate "what to work on next" from coach feedback at session close.
-- The single combined close note didn't give the next coach clear continuity.
ALTER TABLE service_plan_blocks ADD COLUMN IF NOT EXISTS whats_next TEXT;
