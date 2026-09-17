-- Temas de teoría del día (Tres Círculos, Infinite Circle, lecciones de Blue)
-- elegidos por el coach en el plan simple. Ver src/lib/sequence-pages/topics.ts.
alter table service_plans add column if not exists topics text[];
comment on column service_plans.topics is 'Temas de teoría del día elegidos por el coach en el plan simple: circles, loop o lesson:<id> (ver src/lib/sequence-pages/topics.ts).';
