-- M82 — Course grant ledger upgrade for billing + revoke.
--
-- The course_grants table is the billing unit. Today it carries the
-- student's CURRENT academy_id, which moves if the student is later
-- reassigned — that would silently rewrite who gets billed for last
-- month's grants. Fix: snapshot academy_id at grant time.
--
-- Also adds revoke columns so the platform admin can undo a wrong
-- grant from the UI without going to SQL, and switches the unique
-- constraint to a partial unique so re-granting a previously
-- revoked course is allowed (audit row remains either way).

ALTER TABLE course_grants
  ADD COLUMN IF NOT EXISTS academy_id_at_grant UUID
    REFERENCES academies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revoked_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoked_by  UUID REFERENCES coaches(id),
  ADD COLUMN IF NOT EXISTS revoke_reason TEXT;

-- Backfill: for existing grants, snapshot the current academy_id.
-- Best-effort only — students that have since changed academies will
-- show today's academy, which is a reasonable estimate of historical
-- intent. Going forward, the value is set at insert time and never
-- mutates.
UPDATE course_grants cg
SET academy_id_at_grant = cg.academy_id
WHERE cg.academy_id_at_grant IS NULL;

-- Replace the strict unique (student_id, course_key) with a partial
-- unique that ignores revoked rows. Lets the admin revoke a wrong
-- grant and then re-grant cleanly.
DROP INDEX IF EXISTS uq_course_grants_student_course;
CREATE UNIQUE INDEX IF NOT EXISTS uq_course_grants_student_course_active
  ON course_grants(student_id, course_key)
  WHERE revoked_at IS NULL;

-- Helpful index for the billing dashboard's per-month / per-academy roll-up.
CREATE INDEX IF NOT EXISTS idx_course_grants_billing
  ON course_grants(academy_id_at_grant, granted_at)
  WHERE revoked_at IS NULL;

-- Source taxonomy is enforced by the app, not a CHECK constraint, so
-- we can keep adding sources without DDL. Today's allowed values:
--   'manual'             — coordinator/admin click-grant via CoursesPanel
--   'auto_on_intake'     — pending course auto-activated when waiver signed
--   'auto_on_camp_enrol' — camp template's includes_course_key triggered it
--   'direct_purchase'    — student bought directly from TSS (academy=NULL)
--   'override'           — platform admin bypassed the waiver gate
