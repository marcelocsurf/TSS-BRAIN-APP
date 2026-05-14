-- 00036 — Hard RLS on the academy-scoped surface (M10)
--
-- Replaces the permissive "ALL true" policies on the 5 tables that drive
-- the multi-tenant boundary. After this migration:
--   - A real authenticated user (coordinator/coach) connecting via the
--     anon/authenticated key can ONLY read/write rows in their own
--     academy. Even if there's a UI bug that drops the JS filter, the
--     DB will silently filter.
--   - Platform admin sees everything via RLS (no filter applied).
--   - service_role (used by createAdminClient + server actions) bypasses
--     RLS as always — server-side code continues to work unchanged.
--
-- The act-as cookie is read in JS only, NOT in RLS. While Marcelo is in
-- act-as mode, RLS still sees him as platform admin (returns all rows);
-- the JS layer narrows it to the act-as academy. Correct by design —
-- RLS is the safety net, JS scoping is the active filter.
--
-- Scope intentionally limited to the 5 direct-academy_id tables today:
--   students, coaches, camp_instances, camp_templates, academies.
-- Indirect tables (survey_responses, student_step_ratings,
-- student_session_results, cascade_sessions, camp_participants, etc.)
-- are all accessed via admin client in the current codebase, so they
-- get adequate protection from service_role. They'll get their own RLS
-- pass when they're exposed to the user client.

BEGIN;

-- ─── Helper functions ──────────────────────────────────────────────
-- SECURITY DEFINER so the function can read the coaches table even
-- after we restrict its RLS — otherwise the policies would deadlock
-- (need to read coaches to evaluate policy on coaches).

CREATE OR REPLACE FUNCTION current_coach_academy_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT academy_id FROM coaches WHERE auth_user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION current_coach_is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_platform_admin FROM coaches WHERE auth_user_id = auth.uid() LIMIT 1),
    false
  )
$$;

GRANT EXECUTE ON FUNCTION current_coach_academy_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION current_coach_is_platform_admin() TO authenticated, anon;

-- ─── academies ─────────────────────────────────────────────────────
-- Read: any authenticated user (so the academy switcher / dropdowns
-- work for coordinators too).
-- Write: platform admin only.

ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academies_all ON academies;
DROP POLICY IF EXISTS academies_select ON academies;
DROP POLICY IF EXISTS academies_modify ON academies;

CREATE POLICY academies_select ON academies
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY academies_modify ON academies
  FOR ALL TO authenticated
  USING (current_coach_is_platform_admin())
  WITH CHECK (current_coach_is_platform_admin());

-- ─── students ──────────────────────────────────────────────────────

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS students_all ON students;
DROP POLICY IF EXISTS students_select ON students;
DROP POLICY IF EXISTS students_modify ON students;

CREATE POLICY students_select ON students
  FOR SELECT TO authenticated
  USING (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  );

CREATE POLICY students_modify ON students
  FOR ALL TO authenticated
  USING (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  )
  WITH CHECK (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  );

-- ─── coaches ───────────────────────────────────────────────────────
-- Extra "self" policy so a brand-new coach can always read their own
-- row to bootstrap getCurrentCoach() — important if academy_id is
-- temporarily NULL during invite flow.

ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coaches_all ON coaches;
DROP POLICY IF EXISTS coaches_self ON coaches;
DROP POLICY IF EXISTS coaches_select ON coaches;
DROP POLICY IF EXISTS coaches_modify ON coaches;

CREATE POLICY coaches_self ON coaches
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY coaches_select ON coaches
  FOR SELECT TO authenticated
  USING (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  );

CREATE POLICY coaches_modify ON coaches
  FOR ALL TO authenticated
  USING (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  )
  WITH CHECK (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  );

-- ─── camp_instances ────────────────────────────────────────────────

ALTER TABLE camp_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS camp_instances_all ON camp_instances;
DROP POLICY IF EXISTS camp_instances_select ON camp_instances;
DROP POLICY IF EXISTS camp_instances_modify ON camp_instances;

CREATE POLICY camp_instances_select ON camp_instances
  FOR SELECT TO authenticated
  USING (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  );

CREATE POLICY camp_instances_modify ON camp_instances
  FOR ALL TO authenticated
  USING (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  )
  WITH CHECK (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  );

-- ─── camp_templates ────────────────────────────────────────────────
-- Templates with NULL academy_id are GLOBAL — every authenticated user
-- can read them (so coordinators can pick from the canonical 6 services).
-- Mutation requires platform admin or own academy.

ALTER TABLE camp_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS camp_templates_all ON camp_templates;
DROP POLICY IF EXISTS camp_templates_select ON camp_templates;
DROP POLICY IF EXISTS camp_templates_modify ON camp_templates;

CREATE POLICY camp_templates_select ON camp_templates
  FOR SELECT TO authenticated
  USING (
    academy_id IS NULL
    OR current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  );

CREATE POLICY camp_templates_modify ON camp_templates
  FOR ALL TO authenticated
  USING (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  )
  WITH CHECK (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  );

COMMIT;
