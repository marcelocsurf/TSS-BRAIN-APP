-- M45 — Unified session flow: day-aware plans + auto-seed from template.
--
-- Today the official session pipeline is split:
--   * camp_templates / _days / _blocks       → recipe (admin)
--   * camp_instances / camp_sessions         → scheduled run (coordinator)
--   * service_plans / service_plan_blocks    → coach's plan, but ONE per camp_instance
-- This means a 6-day camp has 6 camp_sessions but only 1 service_plan, so
-- the coach's plan for day 2 overwrites day 1.
--
-- This migration day-shifts the plan: one service_plans per camp_session,
-- one service_plan_block per (camp_session × student × order_index). It
-- also adds board assignment per student per day (board_type + board_size).
--
-- Backward-compatible: keep camp_instance_id everywhere as a denormalized
-- column for queries. Existing single-row plans get camp_session_id
-- backfilled to the camp's day-1 session so nothing breaks.

BEGIN;

-- ── service_plans: one per camp_session, not per camp_instance ──

-- Drop the old PK so we can have multiple plans per camp_instance.
ALTER TABLE service_plans DROP CONSTRAINT IF EXISTS service_plans_pkey;

-- Surrogate id so service_plans rows are addressable individually.
ALTER TABLE service_plans
  ADD COLUMN IF NOT EXISTS id UUID NOT NULL DEFAULT gen_random_uuid();

-- The day this plan belongs to. Nullable for transition; backfilled below.
ALTER TABLE service_plans
  ADD COLUMN IF NOT EXISTS camp_session_id UUID REFERENCES camp_sessions(id) ON DELETE CASCADE;

-- Backfill: each existing plan goes to its camp's day-1 session.
UPDATE service_plans sp
SET camp_session_id = cs.id
FROM camp_sessions cs
WHERE sp.camp_session_id IS NULL
  AND cs.camp_instance_id = sp.camp_instance_id
  AND cs.day_number = 1;

-- New PK is the surrogate id.
ALTER TABLE service_plans ADD CONSTRAINT service_plans_pkey PRIMARY KEY (id);

-- One plan per session.
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_plans_session
  ON service_plans(camp_session_id)
  WHERE camp_session_id IS NOT NULL;

-- Still index by camp_instance_id for sweep queries.
CREATE INDEX IF NOT EXISTS idx_service_plans_camp
  ON service_plans(camp_instance_id);

-- ── service_plan_blocks: day-aware + board assignment ──

ALTER TABLE service_plan_blocks
  ADD COLUMN IF NOT EXISTS camp_session_id UUID REFERENCES camp_sessions(id) ON DELETE CASCADE;

-- Backfill: existing blocks go to their camp's day-1 session.
UPDATE service_plan_blocks spb
SET camp_session_id = cs.id
FROM camp_sessions cs
WHERE spb.camp_session_id IS NULL
  AND cs.camp_instance_id = spb.camp_instance_id
  AND cs.day_number = 1;

-- Board the coach assigns to this student for THIS session.
ALTER TABLE service_plan_blocks
  ADD COLUMN IF NOT EXISTS board_type TEXT,             -- 'hard' | 'soft' | null
  ADD COLUMN IF NOT EXISTS board_size_feet INTEGER,
  ADD COLUMN IF NOT EXISTS board_size_inches INTEGER;

CREATE INDEX IF NOT EXISTS idx_service_plan_blocks_session
  ON service_plan_blocks(camp_session_id, order_index);

COMMIT;
