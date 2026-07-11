-- 00130 — Audit fixes (2026-07-11)
--
-- 1. service_plan_blocks.step_ids — multi-step blocks (M78 activity taxonomy,
--    used by the Light camp templates). Template blocks already carry the
--    array; per-student plan blocks now persist it too so multi-step
--    activities keep their full structure. Code is defensive and works
--    before/after this migration.
ALTER TABLE service_plan_blocks
  ADD COLUMN IF NOT EXISTS step_ids text[];

-- 2. One pending belt-promotion recommendation per (student, belt) — closes
--    the race where two simultaneous camp closes could file duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS uq_belt_promo_pending
  ON belt_promotion_recommendations (student_id, recommended_belt)
  WHERE status = 'pending';
