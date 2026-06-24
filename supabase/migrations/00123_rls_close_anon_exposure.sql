-- SECURITY: close anonymous (public) access to operational + PII tables.
--
-- These tables had a permissive `using(true)` policy granted to the `public`
-- role, which includes the unauthenticated `anon` role. Because the anon key
-- ships in the browser, anyone could read/insert/update/delete these tables
-- directly via the API — including session_incidents (student_name = PII),
-- access_codes (course access), service_plans/blocks, notifications and student
-- progress.
--
-- The app accesses all of these via the service-role admin client (which
-- bypasses RLS) or from authenticated /dashboard pages. Restricting the policy
-- role from `public` to `authenticated` removes the anonymous exposure without
-- breaking any server-side admin access or authenticated read.
--
-- Curriculum content (lessons, drills, drills_missions, sequences, lesson_quizzes,
-- ocean_rules, tide_events, camp_template_*) is intentionally left public-readable.
--
-- NOTE: a residual cross-tenant consideration remains (an authenticated coach
-- could read another academy's rows via direct API since the predicate is still
-- `true`). That is a follow-up hardening (per-academy predicates); this migration
-- removes the unauthenticated public hole, which is the launch-critical risk.

alter policy access_codes_auth            on access_codes            to authenticated;
alter policy board_usages_all             on board_usages            to authenticated;
alter policy boards_all                   on boards                  to authenticated;
alter policy coach_lesson_progress_all    on coach_lesson_progress   to authenticated;
alter policy lesson_plan_blocks_all       on lesson_plan_blocks      to authenticated;
alter policy progress_all                 on lesson_progress         to authenticated;
alter policy multi_block_sessions_all     on multi_block_sessions    to authenticated;
alter policy notifications_write          on notifications           to authenticated;
alter policy service_plan_blocks_all      on service_plan_blocks     to authenticated;
alter policy service_plans_all            on service_plans           to authenticated;
alter policy service_staff_all            on service_staff           to authenticated;
alter policy session_incidents_all        on session_incidents       to authenticated;
alter policy staff_members_all            on staff_members           to authenticated;
