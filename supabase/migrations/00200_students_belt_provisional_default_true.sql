-- 2026-09-16 · Marcelo: "que quede registrada la cinta provisional".
-- Toda ficha nueva nacía con belt_provisional=false (default), o sea
-- "confirmada por un coach" sin que nadie la confirmara; el quiz de nivel
-- nunca podía escribir su resultado (casos Nadine Pander, Gustavo Dias).
alter table students alter column belt_provisional set default true;

-- Respaldo + backfill: leads sin ninguna evidencia de confirmación
-- (sin evaluación, sin recomendación, sin override, sin camp) pasan a provisional.
create table if not exists ops_belt_provisional_backfill_2026_09_16 (id uuid primary key, at timestamptz default now());
insert into ops_belt_provisional_backfill_2026_09_16 (id)
select s.id from students s
where s.belt_provisional=false and s.status='active' and s.lifecycle_status='lead'
  and s.belt_promoted_at is null and coalesce(s.coach_notes_general,'') not ilike '%Cinta:%'
  and not exists (select 1 from sequence_evaluations e where e.student_id=s.id)
  and not exists (select 1 from belt_promotion_recommendations r where r.student_id=s.id)
  and not exists (select 1 from camp_participants p where p.student_id=s.id)
on conflict do nothing;
update students s set belt_provisional=true from ops_belt_provisional_backfill_2026_09_16 b where b.id=s.id and s.belt_provisional=false;
