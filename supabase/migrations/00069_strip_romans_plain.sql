-- M69 — Plain REPLACE() sweep for Roman numerals.
--
-- M66/M67/M68 used regex variants that silently no-op'd on this DB.
-- This version uses zero regex — just literal REPLACE on the exact
-- pattern we see in the live data: "<Prefix> <Roman> — " followed by
-- title text. Longest-Roman first so XV doesn't become X + V.
--
-- Covers lessons.title, lessons.subtitle, lessons.description_md,
-- lessons.errors_md, drills_missions.title, drills_missions.description_md.
-- Idempotent.

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
  p TEXT;
  r TEXT[];
  -- Trailing delimiters we know appear in the corpus.
  delims TEXT[] := ARRAY[
    ' — ', ' – ', ' - ', ': ', '. ', ', ', ') ', '.', ',', ')', E'\n', E'\r'
  ];
  d TEXT;
  src TEXT;
  dst TEXT;
BEGIN
  FOREACH p IN ARRAY prefixes LOOP
    FOREACH r SLICE 1 IN ARRAY romans LOOP
      FOREACH d IN ARRAY delims LOOP
        src := p || ' ' || r[1] || d;
        dst := p || ' ' || r[2] || d;
        UPDATE lessons         SET title          = REPLACE(title,          src, dst) WHERE title          LIKE '%' || src || '%';
        UPDATE lessons         SET subtitle       = REPLACE(subtitle,       src, dst) WHERE subtitle       LIKE '%' || src || '%';
        UPDATE lessons         SET description_md = REPLACE(description_md, src, dst) WHERE description_md LIKE '%' || src || '%';
        UPDATE lessons         SET errors_md      = REPLACE(errors_md,      src, dst) WHERE errors_md      LIKE '%' || src || '%';
        UPDATE drills_missions SET title          = REPLACE(title,          src, dst) WHERE title          LIKE '%' || src || '%';
        UPDATE drills_missions SET description_md = REPLACE(description_md, src, dst) WHERE description_md LIKE '%' || src || '%';
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
