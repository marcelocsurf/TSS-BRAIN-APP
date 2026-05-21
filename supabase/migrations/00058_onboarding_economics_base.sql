-- M58 — Schema base for onboarding lifecycle + course economics +
-- universal entry + impersonate. Aditivo, no rompe nada.
--
-- Reads as Tanda 1 of the plan in
-- /Users/marcelocastellanos/.claude/plans/quiero-expresarte-el-flow-transient-dragonfly.md
--
-- Adds:
--   A. students.lifecycle_status (lead/member/inactive/churned) + promoted_to_member_at.
--      Existing students backfilled to 'member' if they have any course_grants,
--      'lead' otherwise.
--   B. students PIN + session columns for Fase 6/7 (no logic yet, just schema).
--   C. course_prices table (global pricing).
--   D. course_grants snapshot columns (price_cents, currency, invoiced_in).
--   E. camp_templates.includes_course_key.
--   F. academy_invoices table.
--   G. admin_impersonations audit table.

-- ─── A. lifecycle on students ───
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'lead',
  ADD COLUMN IF NOT EXISTS promoted_to_member_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_lifecycle_status_check'
  ) THEN
    ALTER TABLE students
      ADD CONSTRAINT students_lifecycle_status_check
      CHECK (lifecycle_status IN ('lead','member','inactive','churned'));
  END IF;
END $$;

-- Backfill: any existing student with at least one course_grant is a member.
UPDATE students s
SET lifecycle_status = 'member',
    promoted_to_member_at = COALESCE(promoted_to_member_at, (
      SELECT MIN(granted_at) FROM course_grants g WHERE g.student_id = s.id
    ))
WHERE EXISTS (SELECT 1 FROM course_grants g WHERE g.student_id = s.id)
  AND lifecycle_status = 'lead';

-- ─── B. PIN + session columns (no logic yet, just schema) ───
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS pin_hash TEXT,
  ADD COLUMN IF NOT EXISTS pin_set_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_session_id UUID,
  ADD COLUMN IF NOT EXISTS current_session_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_session_kicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS session_kick_count INTEGER NOT NULL DEFAULT 0;

-- ─── C. course_prices (global, fixed) ───
CREATE TABLE IF NOT EXISTS course_prices (
  course_key   TEXT PRIMARY KEY,
  price_cents  INTEGER NOT NULL,
  currency     TEXT    NOT NULL DEFAULT 'USD',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   UUID REFERENCES coaches(id)
);

INSERT INTO course_prices (course_key, price_cents, currency) VALUES
  ('white_belt', 0, 'USD'),
  ('yellow_belt', 0, 'USD')
ON CONFLICT (course_key) DO NOTHING;

-- ─── F. academy_invoices (declared before course_grants FK) ───
CREATE TABLE IF NOT EXISTS academy_invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    UUID NOT NULL REFERENCES academies(id),
  period_year   INTEGER NOT NULL,
  period_month  INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  total_cents   INTEGER NOT NULL DEFAULT 0,
  currency      TEXT    NOT NULL DEFAULT 'USD',
  status        TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','cancelled')),
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at       TIMESTAMPTZ,
  paid_at       TIMESTAMPTZ,
  notes         TEXT,
  UNIQUE(academy_id, period_year, period_month)
);

-- ─── D. course_grants snapshot of price + invoice linkage ───
ALTER TABLE course_grants
  ADD COLUMN IF NOT EXISTS price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS invoiced_in UUID REFERENCES academy_invoices(id);

-- ─── E. camp_templates → course auto-link ───
ALTER TABLE camp_templates
  ADD COLUMN IF NOT EXISTS includes_course_key TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'camp_templates_includes_course_key_check'
  ) THEN
    ALTER TABLE camp_templates
      ADD CONSTRAINT camp_templates_includes_course_key_check
      CHECK (includes_course_key IS NULL OR includes_course_key IN ('white_belt','yellow_belt'));
  END IF;
END $$;

-- Pre-seed: the canonical 6-day beginner camp includes the WB course.
-- (Coordinators can adjust other templates via the dashboard later.)
UPDATE camp_templates
SET includes_course_key = 'white_belt'
WHERE template_name ILIKE '%beginner%' AND includes_course_key IS NULL;

-- ─── G. admin_impersonations audit ───
CREATE TABLE IF NOT EXISTS admin_impersonations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_coach_id  UUID NOT NULL REFERENCES coaches(id),
  target_kind     TEXT NOT NULL CHECK (target_kind IN ('student','coach','coordinator')),
  target_id       UUID NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_impersonations_admin ON admin_impersonations(admin_coach_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_impersonations_target ON admin_impersonations(target_kind, target_id);

-- ─── RLS: keep permissive at server layer (no client access to these tables) ───
ALTER TABLE course_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_impersonations ENABLE ROW LEVEL SECURITY;
-- Server uses admin client which bypasses RLS; no public policies needed.
