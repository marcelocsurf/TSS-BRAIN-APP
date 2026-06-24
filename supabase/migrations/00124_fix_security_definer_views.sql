-- SECURITY (ERROR-level): two SECURITY DEFINER views exposed student PII to anon.
--
-- coach_student_feedback (student names, belt, coach feedback) and
-- coach_rating_stats are SECURITY DEFINER views, so they ran with the owner's
-- privileges and bypassed RLS on the underlying student_session_results /
-- students / survey_responses tables. anon had SELECT on both → anyone could
-- read student PII directly. Neither view is referenced anywhere in the app.
--
-- Fix: make them security_invoker (they now respect the querying role's RLS) and
-- revoke all access from anon (and the public role). The service-role admin
-- client still reads them if ever needed.

alter view public.coach_student_feedback set (security_invoker = on);
alter view public.coach_rating_stats   set (security_invoker = on);

revoke all on public.coach_student_feedback from anon, public;
revoke all on public.coach_rating_stats   from anon, public;
