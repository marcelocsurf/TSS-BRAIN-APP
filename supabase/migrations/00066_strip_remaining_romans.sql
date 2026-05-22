-- M66 — Strip remaining Roman numerals from user-visible content.
--
-- M63 fixed only "Part II — Emergency Protocols". This sweep handles
-- every "Part / Module / Chapter / Section / Sequence / Phase / Tier /
-- Lesson / Step <Roman>" pattern across:
--   - lessons.description_md
--   - lessons.errors_md
--   - drills_missions.description_md
--
-- Replacement order is longest-Roman → shortest so XII doesn't get
-- matched as XI + I. Idempotent: re-running it is a no-op.

DO $$
DECLARE
  prefix TEXT;
  romans TEXT[][] := ARRAY[
    ARRAY['XV','15'], ARRAY['XIV','14'], ARRAY['XIII','13'],
    ARRAY['XII','12'], ARRAY['XI','11'], ARRAY['X','10'],
    ARRAY['IX','9'], ARRAY['VIII','8'], ARRAY['VII','7'],
    ARRAY['VI','6'], ARRAY['V','5'], ARRAY['IV','4'],
    ARRAY['III','3'], ARRAY['II','2'], ARRAY['I','1']
  ];
  prefixes TEXT[] := ARRAY[
    'Part','Module','Chapter','Section','Sequence','Phase','Tier','Lesson','Step','Appendix'
  ];
  p TEXT;
  r TEXT[];
BEGIN
  FOREACH p IN ARRAY prefixes LOOP
    FOREACH r SLICE 1 IN ARRAY romans LOOP
      -- Match "<prefix> <roman>" followed by space, dash, em-dash, colon, dot, paren, or EOL
      UPDATE lessons SET description_md = regexp_replace(
        description_md,
        '(\m' || p || ')\s+' || r[1] || '(?=[\s\-—:.,)])',
        '\1 ' || r[2],
        'g'
      ) WHERE description_md ~ ('\m' || p || '\s+' || r[1] || '[\s\-—:.,)]');

      UPDATE lessons SET errors_md = regexp_replace(
        errors_md,
        '(\m' || p || ')\s+' || r[1] || '(?=[\s\-—:.,)])',
        '\1 ' || r[2],
        'g'
      ) WHERE errors_md ~ ('\m' || p || '\s+' || r[1] || '[\s\-—:.,)]');

      UPDATE drills_missions SET description_md = regexp_replace(
        description_md,
        '(\m' || p || ')\s+' || r[1] || '(?=[\s\-—:.,)])',
        '\1 ' || r[2],
        'g'
      ) WHERE description_md ~ ('\m' || p || '\s+' || r[1] || '[\s\-—:.,)]');
    END LOOP;
  END LOOP;
END $$;
