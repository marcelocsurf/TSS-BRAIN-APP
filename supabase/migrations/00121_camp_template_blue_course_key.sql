-- Allow camp templates to grant the Blue Belt course (and Purple ahead of time).
-- The original constraint only permitted white_belt / yellow_belt.
alter table camp_templates drop constraint if exists camp_templates_includes_course_key_check;
alter table camp_templates add constraint camp_templates_includes_course_key_check
  check (includes_course_key is null or includes_course_key = any (array[
    'white_belt'::text, 'yellow_belt'::text, 'blue_belt'::text, 'purple_belt'::text
  ]));
