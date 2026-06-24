-- Student courses: spell belt levels in words instead of codes.
--
-- Replace the short codes WB / YB / BB with "White Belt" / "Yellow Belt" /
-- "Blue Belt" in the student-facing course content (lesson text + drills), so
-- the courses read in plain language. Coach sections (coach_wb, coach_wb_master,
-- coach_yb) are intentionally left for the Coach-course pass.
--
-- The pattern only matches a code bounded by non-alphanumeric, non-hyphen chars
-- (or string ends), so doctrinal codes that embed these letters — ERR-YB-A3,
-- ERR-BB-..., STP-..., Seq # — are preserved untouched. Run is idempotent:
-- once decoded there are no bare WB/YB/BB tokens left. The statements run twice
-- to catch the rare case of two adjacent same-codes sharing a boundary char.

do $$
declare
  pass int;
  student_sections text[] := array[
    'white_belt','yellow_belt','blue_belt',
    'wb_onboarding','yb_onboarding','bb_onboarding',
    'pre_course_fundamentals','pre_course_values'
  ];
begin
  for pass in 1..2 loop
    update lessons set
      title          = regexp_replace(regexp_replace(regexp_replace(coalesce(title,''),          '(^|[^[:alnum:]-])WB([^[:alnum:]-]|$)','\1White Belt\2','g'),'(^|[^[:alnum:]-])YB([^[:alnum:]-]|$)','\1Yellow Belt\2','g'),'(^|[^[:alnum:]-])BB([^[:alnum:]-]|$)','\1Blue Belt\2','g'),
      subtitle       = regexp_replace(regexp_replace(regexp_replace(coalesce(subtitle,''),       '(^|[^[:alnum:]-])WB([^[:alnum:]-]|$)','\1White Belt\2','g'),'(^|[^[:alnum:]-])YB([^[:alnum:]-]|$)','\1Yellow Belt\2','g'),'(^|[^[:alnum:]-])BB([^[:alnum:]-]|$)','\1Blue Belt\2','g'),
      description_md = regexp_replace(regexp_replace(regexp_replace(coalesce(description_md,''),  '(^|[^[:alnum:]-])WB([^[:alnum:]-]|$)','\1White Belt\2','g'),'(^|[^[:alnum:]-])YB([^[:alnum:]-]|$)','\1Yellow Belt\2','g'),'(^|[^[:alnum:]-])BB([^[:alnum:]-]|$)','\1Blue Belt\2','g'),
      errors_md      = regexp_replace(regexp_replace(regexp_replace(coalesce(errors_md,''),       '(^|[^[:alnum:]-])WB([^[:alnum:]-]|$)','\1White Belt\2','g'),'(^|[^[:alnum:]-])YB([^[:alnum:]-]|$)','\1Yellow Belt\2','g'),'(^|[^[:alnum:]-])BB([^[:alnum:]-]|$)','\1Blue Belt\2','g'),
      drill_md       = regexp_replace(regexp_replace(regexp_replace(coalesce(drill_md,''),        '(^|[^[:alnum:]-])WB([^[:alnum:]-]|$)','\1White Belt\2','g'),'(^|[^[:alnum:]-])YB([^[:alnum:]-]|$)','\1Yellow Belt\2','g'),'(^|[^[:alnum:]-])BB([^[:alnum:]-]|$)','\1Blue Belt\2','g')
    where course_section = any(student_sections);

    update drills_missions set
      title          = regexp_replace(regexp_replace(regexp_replace(coalesce(title,''),          '(^|[^[:alnum:]-])WB([^[:alnum:]-]|$)','\1White Belt\2','g'),'(^|[^[:alnum:]-])YB([^[:alnum:]-]|$)','\1Yellow Belt\2','g'),'(^|[^[:alnum:]-])BB([^[:alnum:]-]|$)','\1Blue Belt\2','g'),
      description_md = regexp_replace(regexp_replace(regexp_replace(coalesce(description_md,''),  '(^|[^[:alnum:]-])WB([^[:alnum:]-]|$)','\1White Belt\2','g'),'(^|[^[:alnum:]-])YB([^[:alnum:]-]|$)','\1Yellow Belt\2','g'),'(^|[^[:alnum:]-])BB([^[:alnum:]-]|$)','\1Blue Belt\2','g')
    where belt in ('white','yellow','blue');
  end loop;
end $$;
