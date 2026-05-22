-- M68 — Robust Roman → Arabic sweep using \y word boundaries.
--
-- M66/M67 used '\m' + lookahead which silently no-op'd on this DB.
-- This version uses '\y' (PostgreSQL word boundary, matches both
-- start and end of word) which works under default ARE flavor.
--
-- Touches every text column that the coach/student UIs render:
--   - lessons.title, .subtitle, .description_md, .errors_md
--   - drills_missions.title, .description_md
--
-- Longest-Roman-first so XV doesn't collapse to X + V.
-- Idempotent: re-running on already-arabic text is a no-op.

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
  pat TEXT;
  rep TEXT;
BEGIN
  FOREACH p IN ARRAY prefixes LOOP
    FOREACH r SLICE 1 IN ARRAY romans LOOP
      pat := '\y' || p || ' ' || r[1] || '\y';
      rep := p || ' ' || r[2];

      UPDATE lessons SET title          = regexp_replace(title,          pat, rep, 'g') WHERE title          ~ pat;
      UPDATE lessons SET subtitle       = regexp_replace(subtitle,       pat, rep, 'g') WHERE subtitle       ~ pat;
      UPDATE lessons SET description_md = regexp_replace(description_md, pat, rep, 'g') WHERE description_md ~ pat;
      UPDATE lessons SET errors_md      = regexp_replace(errors_md,      pat, rep, 'g') WHERE errors_md      ~ pat;

      UPDATE drills_missions SET title          = regexp_replace(title,          pat, rep, 'g') WHERE title          ~ pat;
      UPDATE drills_missions SET description_md = regexp_replace(description_md, pat, rep, 'g') WHERE description_md ~ pat;
    END LOOP;
  END LOOP;
END $$;
