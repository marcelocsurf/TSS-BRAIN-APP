-- 00034 — Academy Coordinator + scoping hardening (M6)
--
-- Wires the missing piece of the multi-tenant flow: each academy can
-- declare WHO its coordinator is. This is the person that logs in and
-- manages the academy's students, coaches and services.
--
-- The coach record itself still drives auth (Supabase Auth + coaches.
-- auth_user_id). What we add here is the "this coach is THE coordinator
-- of academy X" pointer + a couple of scoping helpers.
--
-- Decision: a coach can be the assigned_coordinator of at most one
-- academy at a time (UNIQUE constraint). Multiple coaches CAN have
-- role='coordinator' inside the same academy (e.g. backup coordinator)
-- but only one is the "primary" — the one that shows up in the
-- "Coordinator: X" label.

BEGIN;

ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS assigned_coordinator_id UUID REFERENCES coaches(id) ON DELETE SET NULL;

-- Only one academy can claim a given coach as its primary coordinator.
-- Partial unique so multiple academies with NULL coordinator are fine.
CREATE UNIQUE INDEX IF NOT EXISTS uq_academies_coordinator
  ON academies(assigned_coordinator_id)
  WHERE assigned_coordinator_id IS NOT NULL;

-- Backfill: seed academy gets Marcelo as its coordinator (he's the
-- platform admin AND the de facto coordinator of TSS El Salvador today).
-- Using a subquery with LIMIT 1 because Postgres UPDATE ... FROM does not
-- support LIMIT directly.
UPDATE academies
SET assigned_coordinator_id = (
  SELECT id FROM coaches
  WHERE is_platform_admin = true
    AND academy_id = '00000000-0000-0000-0000-000000000001'
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND assigned_coordinator_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_academies_coordinator
  ON academies(assigned_coordinator_id)
  WHERE assigned_coordinator_id IS NOT NULL;

COMMIT;
