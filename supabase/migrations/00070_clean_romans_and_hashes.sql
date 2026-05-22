-- M70 — Final encoding cleanup: Romans + literal ### across every
-- markdown-bearing column the coach/student UIs render.
--
-- M69 covered lessons.{title,subtitle,description_md,errors_md} and
-- drills_missions.{title,description_md}. It missed the 4 coach STP
-- tab columns (coach_what_md, coach_deliver_md, coach_errors_md,
-- coach_validate_md) — exactly where the new YB content lives — plus
-- the legacy lessons.drill_md. This migration extends the Roman sweep
-- to those columns and also fixes "###Foo" → "### Foo" so the renderer
-- doesn't show literal hashes.
--
-- Zero content change. Pure encoding. Idempotent.

-- ─── 1. Roman → Arabic sweep (extended column list) ──
DO $$
DECLARE
  prefixes TEXT[] := ARRAY[
    'Part','Module','Chapter','Section','Sequence','Phase',
    'Tier','Lesson','Step','Appendix'
  ];
  romans TEXT[][] := ARRAY[
    ARRAY['XV','15'], ARRAY['XIV','14'], ARRAY['XIII','13'],
    ARRAY['XII','12'], ARRAY['XI','11'], ARRAY['X','10'],
    ARRAY['IX','9'], ARRAY['VIII','8'], ARRAY['VII','7'],
    ARRAY['VI','6'], ARRAY['V','5'], ARRAY['IV','4'],
    ARRAY['III','3'], ARRAY['II','2'], ARRAY['I','1']
  ];
  delims TEXT[] := ARRAY[
    ' — ', ' – ', ' - ', ': ', '. ', ', ', ') ', '.', ',', ')',
    E'\n', E'\r', ' '
  ];
  p TEXT;
  r TEXT[];
  d TEXT;
  src TEXT;
  dst TEXT;
BEGIN
  FOREACH p IN ARRAY prefixes LOOP
    FOREACH r SLICE 1 IN ARRAY romans LOOP
      FOREACH d IN ARRAY delims LOOP
        src := p || ' ' || r[1] || d;
        dst := p || ' ' || r[2] || d;

        -- M69 columns (re-run is a no-op)
        UPDATE lessons         SET title          = REPLACE(title,          src, dst) WHERE title          LIKE '%' || src || '%';
        UPDATE lessons         SET subtitle       = REPLACE(subtitle,       src, dst) WHERE subtitle       LIKE '%' || src || '%';
        UPDATE lessons         SET description_md = REPLACE(description_md, src, dst) WHERE description_md LIKE '%' || src || '%';
        UPDATE lessons         SET errors_md      = REPLACE(errors_md,      src, dst) WHERE errors_md      LIKE '%' || src || '%';
        UPDATE drills_missions SET title          = REPLACE(title,          src, dst) WHERE title          LIKE '%' || src || '%';
        UPDATE drills_missions SET description_md = REPLACE(description_md, src, dst) WHERE description_md LIKE '%' || src || '%';

        -- NEW columns missed by M69
        UPDATE lessons SET coach_what_md     = REPLACE(coach_what_md,     src, dst) WHERE coach_what_md     LIKE '%' || src || '%';
        UPDATE lessons SET coach_deliver_md  = REPLACE(coach_deliver_md,  src, dst) WHERE coach_deliver_md  LIKE '%' || src || '%';
        UPDATE lessons SET coach_errors_md   = REPLACE(coach_errors_md,   src, dst) WHERE coach_errors_md   LIKE '%' || src || '%';
        UPDATE lessons SET coach_validate_md = REPLACE(coach_validate_md, src, dst) WHERE coach_validate_md LIKE '%' || src || '%';
        UPDATE lessons SET drill_md          = REPLACE(drill_md,          src, dst) WHERE drill_md          LIKE '%' || src || '%';
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- ─── 2. Hash-spacing fix: ###Foo → ### Foo ──
-- Inserts the missing space between the heading marker and the first
-- non-hash, non-space character. Anchored at start-of-string or
-- after a newline so we never touch inline "#" inside prose.
UPDATE lessons
   SET description_md = regexp_replace(description_md, '(^|\n)(#{1,6})([^# \n])', E'\\1\\2 \\3', 'g')
 WHERE description_md ~ '(^|\n)#{1,6}[^# \n]';

UPDATE lessons
   SET errors_md = regexp_replace(errors_md, '(^|\n)(#{1,6})([^# \n])', E'\\1\\2 \\3', 'g')
 WHERE errors_md ~ '(^|\n)#{1,6}[^# \n]';

UPDATE lessons
   SET drill_md = regexp_replace(drill_md, '(^|\n)(#{1,6})([^# \n])', E'\\1\\2 \\3', 'g')
 WHERE drill_md ~ '(^|\n)#{1,6}[^# \n]';

UPDATE lessons
   SET coach_what_md = regexp_replace(coach_what_md, '(^|\n)(#{1,6})([^# \n])', E'\\1\\2 \\3', 'g')
 WHERE coach_what_md ~ '(^|\n)#{1,6}[^# \n]';

UPDATE lessons
   SET coach_deliver_md = regexp_replace(coach_deliver_md, '(^|\n)(#{1,6})([^# \n])', E'\\1\\2 \\3', 'g')
 WHERE coach_deliver_md ~ '(^|\n)#{1,6}[^# \n]';

UPDATE lessons
   SET coach_errors_md = regexp_replace(coach_errors_md, '(^|\n)(#{1,6})([^# \n])', E'\\1\\2 \\3', 'g')
 WHERE coach_errors_md ~ '(^|\n)#{1,6}[^# \n]';

UPDATE lessons
   SET coach_validate_md = regexp_replace(coach_validate_md, '(^|\n)(#{1,6})([^# \n])', E'\\1\\2 \\3', 'g')
 WHERE coach_validate_md ~ '(^|\n)#{1,6}[^# \n]';

UPDATE drills_missions
   SET description_md = regexp_replace(description_md, '(^|\n)(#{1,6})([^# \n])', E'\\1\\2 \\3', 'g')
 WHERE description_md ~ '(^|\n)#{1,6}[^# \n]';
