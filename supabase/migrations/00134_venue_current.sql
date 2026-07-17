-- 00134 — Venue current/corrientes (2026-07-17).
-- The coach reads the current strength as part of the venue analysis
-- (safety-relevant). Stored as text: 'none' | 'light' | 'medium' | 'strong'.
ALTER TABLE service_plans
  ADD COLUMN IF NOT EXISTS venue_current text;
