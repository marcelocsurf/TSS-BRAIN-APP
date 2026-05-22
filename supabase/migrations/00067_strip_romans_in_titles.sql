-- M67 — Extend M66's sweep to lesson titles + subtitles.
--
-- M66 only touched description_md / errors_md, so screens that render
-- the title (Courses tab card, lesson header) still showed "Part V",
-- "Part VI", etc. Apply the same longest-first Roman → Arabic swap on
-- lessons.title + lessons.subtitle + drills_missions.title.
-- Idempotent.

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
      UPDATE lessons SET title = regexp_replace(
        title,
        '(\m' || p || ')\s+' || r[1] || '(?=[\s\-—:.,)]|$)',
        '\1 ' || r[2],
        'g'
      ) WHERE title ~ ('\m' || p || '\s+' || r[1] || '([\s\-—:.,)]|$)');

      UPDATE lessons SET subtitle = regexp_replace(
        subtitle,
        '(\m' || p || ')\s+' || r[1] || '(?=[\s\-—:.,)]|$)',
        '\1 ' || r[2],
        'g'
      ) WHERE subtitle ~ ('\m' || p || '\s+' || r[1] || '([\s\-—:.,)]|$)');

      UPDATE drills_missions SET title = regexp_replace(
        title,
        '(\m' || p || ')\s+' || r[1] || '(?=[\s\-—:.,)]|$)',
        '\1 ' || r[2],
        'g'
      ) WHERE title ~ ('\m' || p || '\s+' || r[1] || '([\s\-—:.,)]|$)');
    END LOOP;
  END LOOP;
END $$;
