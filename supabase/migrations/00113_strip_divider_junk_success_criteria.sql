-- Remove divider junk ("======" / "------" rows) that leaked into a few
-- drills_missions.success_criteria arrays — they rendered as an ugly bullet in
-- the emerald "How you know you got it" box. Keep only real criteria.
update drills_missions
set success_criteria = (
  select coalesce(array_agg(c), '{}')
  from unnest(success_criteria) as c
  where btrim(c) !~ '^[=_-]{4,}$' and btrim(c) <> ''
)
where exists (
  select 1 from unnest(success_criteria) as c
  where btrim(c) ~ '^[=_-]{4,}$' or btrim(c) = ''
);
