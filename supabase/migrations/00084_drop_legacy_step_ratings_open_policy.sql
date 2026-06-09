-- M84 — Drop the legacy `step_ratings_all` policy.
--
-- M83 added a properly-scoped SELECT policy on student_step_ratings,
-- but an older `step_ratings_all USING(true)` policy was still on the
-- table from a pre-multi-tenant migration. Postgres combines RLS
-- policies with OR, so the open policy was silently negating M83 —
-- cross-academy reads of step ratings were still possible.
--
-- Dropping it restores the tenant isolation M83 intended. Writes
-- remain covered by `student_step_ratings_write` (which is wide-open
-- because every writer goes through the admin client / service role).
--
-- Already applied to production via MCP on the same session that
-- discovered the bug — this file is the canonical record.

DROP POLICY IF EXISTS step_ratings_all ON student_step_ratings;
