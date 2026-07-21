-- 00137 — Library audience (2026-07-18).
-- Each library resource declares WHO it is for: 'coaches' | 'students' | 'both'.
-- Server actions refuse grants outside the audience, so a coach-only deck
-- (e.g. Inclusive Coaching) can never reach a student even by mistake.
ALTER TABLE coach_resources
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'both';

-- Inclusive Coaching is coach-training material.
UPDATE coach_resources SET audience = 'coaches'
  WHERE id = '24cb3135-5694-43f3-ba1d-e7548fe0cdb9';
