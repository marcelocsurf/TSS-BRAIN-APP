-- M85 — Fix missing RLS policies on academy_template_assignments.
--
-- The table had RLS enabled but no policies, blocking every write
-- including the platform admin's "assign template to academy" toggle.
-- Symptom in prod: Server Components error overlay when ticking an
-- academy in TemplateAssignmentPanel on /camps/templates/[id]/edit.
--
-- Discovered via Supabase MCP postgres logs:
--   ERROR: new row violates row-level security policy for table
--   "academy_template_assignments"
--
-- Already applied to production via MCP — this file is canonical.

CREATE POLICY academy_template_assignments_select
  ON academy_template_assignments
  FOR SELECT USING (true);

CREATE POLICY academy_template_assignments_write
  ON academy_template_assignments
  FOR ALL
  USING (current_coach_is_platform_admin())
  WITH CHECK (current_coach_is_platform_admin());
