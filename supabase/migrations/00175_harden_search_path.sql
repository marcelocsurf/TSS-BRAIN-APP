-- ═══ HARDENING search_path (2026-08-29) — YA APLICADA vía MCP ═══
-- Las 22 funciones propias con search_path fijo (public, pg_temp). Una
-- función con search_path mutable puede secuestrarse creando un objeto
-- homónimo en un esquema del atacante — crítico en las SECURITY DEFINER.
-- Las gbt_* son de btree_gist y no se tocan.
alter function public.generate_access_code(text) set search_path = public, pg_temp;
alter function public.get_drills_for_belt(text) set search_path = public, pg_temp;
alter function public.get_pilar_parts_for_belt(text) set search_path = public, pg_temp;
alter function public.get_student_unlocked_belts(uuid) set search_path = public, pg_temp;
alter function public.grant_level_access(uuid, text, text, text, uuid, text) set search_path = public, pg_temp;
alter function public.hp_search_students(text) set search_path = public, pg_temp;
alter function public.map_belt_name(text) set search_path = public, pg_temp;
alter function public.map_ocean_condition(text) set search_path = public, pg_temp;
alter function public.map_pilar(text) set search_path = public, pg_temp;
alter function public.notify_overdue_tasks() set search_path = public, pg_temp;
alter function public.notify_upcoming_services() set search_path = public, pg_temp;
alter function public.save_cascade_session(uuid, uuid, text, text, text, text, text, text, text, text, uuid, text, text, text, text, text, text, text, text, integer, text, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, text, text, text, uuid, text[], text, text, boolean, text, text, text) set search_path = public, pg_temp;
alter function public.student_next_lesson(uuid) set search_path = public, pg_temp;
alter function public.student_pre_course_complete(uuid) set search_path = public, pg_temp;
alter function public.touch_service_plans_updated_at() set search_path = public, pg_temp;
alter function public.trigger_set_updated_at() set search_path = public, pg_temp;
alter function public.update_academies_timestamp() set search_path = public, pg_temp;
alter function public.update_content_videos_timestamp() set search_path = public, pg_temp;
alter function public.update_lesson_plan_block_timestamp() set search_path = public, pg_temp;
alter function public.update_lesson_progress_timestamp() set search_path = public, pg_temp;
alter function public.update_step_rating_timestamp() set search_path = public, pg_temp;
alter function public.update_student_profile_on_close(uuid, uuid, timestamptz, text, pilar, session_status, text, text) set search_path = public, pg_temp;
