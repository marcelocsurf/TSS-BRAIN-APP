-- 00226 · Historial de estrellas por paso · Etapa 1 (Marcelo 2026-10-02)
--
-- student_step_ratings guarda solo la ÚLTIMA estrella de cada paso (la del
-- coach y la del alumno): una nueva pisa la anterior, la × la borra para
-- siempre y no queda dónde ni quién. Esto agrega un historial que solo crece.
-- Nada visible cambia: ninguna pantalla lo lee todavía.
--
-- Cómo: un trigger en student_step_ratings escribe una fila por cada cambio
-- en step_rating_history; ningún camino de escritura puede saltárselo. El
-- "dónde y quién" lo manda el app en rating_ctx de la MISMA fila (con un
-- nonce `n`); si no lo manda, la fila igual queda, con source='unknown'.
--
-- Volver atrás: drop trigger step_rating_history_log / step_rating_ctx_fresh
-- on student_step_ratings; drop function de las dos; (con el app ya sin
-- rating_ctx) alter table student_step_ratings drop column rating_ctx;
-- step_rating_history se respalda en ops antes de borrarla.

-- 1 · La tabla: una fila por cada cambio de una estrella (coach o alumno).
create table if not exists public.step_rating_history (
  id                  bigint generated always as identity primary key,
  student_id          uuid not null references public.students(id) on delete cascade,
  step_id             text not null,
  kind                text not null check (kind in ('coach', 'self')),
  old_rating          integer,       -- lo que había (null = no había)
  new_rating          integer,       -- lo que quedó (null = se borró: la ×)
  self_source         text,          -- solo kind='self': executed | assessed
  coach_id            uuid references public.coaches(id) on delete set null, -- quién la puso (o la borró)
  old_coach_id        uuid references public.coaches(id) on delete set null, -- de quién era la que se pisó
  old_rated_at        timestamptz,   -- cuándo se había puesto la que se pisó
  source              text not null default 'unknown',
  sequence_id         text,
  side                text,          -- fs | bs
  camp_instance_id    uuid references public.camp_instances(id) on delete set null,
  camp_session_id     uuid references public.camp_sessions(id) on delete set null,
  training_session_id uuid,          -- self_training_sessions.id (sin FK: el rollback de Let's Play la borra)
  ctx                 jsonb,         -- el contexto completo que mandó el app (sin el nonce)
  actor_role          text,          -- service_role | authenticated | postgres…
  actor_uid           uuid,          -- auth.uid() cuando escribe un usuario logueado
  created_at          timestamptz not null default now()
);

comment on table public.step_rating_history is
  'Historial de cada estrella de paso (coach y alumno). Solo crece; lo escribe el trigger step_rating_history_log. source: baseline | official_panel | camp_inline | day_close_sequence | final_eval | standalone_eval | self_assessment | linked_mission | lets_play_run | lets_play_focus | row_deleted | rekey | unknown.';

create index if not exists idx_step_rating_history_student_step
  on public.step_rating_history (student_id, step_id, created_at desc);
create index if not exists idx_step_rating_history_camp
  on public.step_rating_history (camp_instance_id) where camp_instance_id is not null;
create index if not exists idx_step_rating_history_camp_session
  on public.step_rating_history (camp_session_id) where camp_session_id is not null;
create index if not exists idx_step_rating_history_coach
  on public.step_rating_history (coach_id) where coach_id is not null;
create index if not exists idx_step_rating_history_old_coach
  on public.step_rating_history (old_coach_id) where old_coach_id is not null;

-- 2 · Nadie la escribe desde afuera; el app solo la lee (service_role).
alter table public.step_rating_history enable row level security;
revoke all on public.step_rating_history from public, anon, authenticated, service_role;
grant select on public.step_rating_history to service_role;

-- 3 · El contexto viaja en la misma fila.
alter table public.student_step_ratings add column if not exists rating_ctx jsonb;
comment on column public.student_step_ratings.rating_ctx is
  'Dónde y quién de la ÚLTIMA escritura (source, kind, coach_id, sequence_id, side, camp_instance_id, camp_session_id, training_session_id, n=nonce). Lo copia el trigger a step_rating_history. No es para pantallas.';

-- 4 · Un upsert que no manda rating_ctx hereda el de la escritura anterior:
--     ese contexto es viejo y no se copia. Cada escritura del app trae un
--     nonce, así que "igual al anterior" = "no lo mandó".
create or replace function public.step_rating_ctx_fresh()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.rating_ctx is not distinct from old.rating_ctx then
    new.rating_ctx := null;
  end if;
  return new;
end;
$$;

-- 5 · El registro. Nunca debe trabar la escritura de una estrella: los ids
--     del contexto se validan (regex + existencia) en vez de castear a ciegas.
create or replace function public.step_rating_history_log()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uuid_re   constant text := '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
  c         jsonb;
  v_hint    text;
  k_student uuid;
  k_step    text;
  v_source  text;
  v_actor   uuid;
  v_seq     text;
  v_side    text;
  v_ci      uuid;
  v_cs      uuid;
  v_ts      uuid;
  o_coach   integer;     n_coach integer;
  o_by      uuid;        n_by    uuid;
  o_at      timestamptz; n_at    timestamptz;
  o_self    integer;     n_self  integer;
  o_src     text;        n_src   text;
  o_asd     timestamptz; n_asd   timestamptz;
  o_self_at timestamptz;
  log_coach boolean;
  log_self  boolean;
begin
  if tg_op = 'DELETE' then
    -- Borrado en cascada de un alumno: ya no existe y su historial se va con él.
    if not exists (select 1 from public.students s where s.id = old.student_id) then
      return null;
    end if;
    k_student := old.student_id;
    k_step    := old.step_id;
  else
    k_student := new.student_id;
    k_step    := new.step_id;
    c         := new.rating_ctx;
  end if;

  if tg_op = 'UPDATE' and (new.student_id, new.step_id) is distinct from (old.student_id, old.step_id) then
    -- Fusión de fichas / cambio de paso: se registra bajo la clave nueva como si naciera.
    c := coalesce(c, '{}'::jsonb)
         || jsonb_build_object('source', 'rekey', 'from_student_id', old.student_id, 'from_step_id', old.step_id);
  elsif tg_op <> 'INSERT' then
    o_coach := old.coach_rating;   o_by  := old.coach_rated_by; o_at  := old.coach_rated_at;
    o_self  := old.current_rating; o_src := old.self_source;    o_asd := old.assessed_at;
    o_self_at := coalesce(case when old.self_source = 'assessed' then old.assessed_at end, old.last_updated);
  end if;

  if tg_op <> 'DELETE' then
    n_coach := new.coach_rating;   n_by  := new.coach_rated_by; n_at  := new.coach_rated_at;
    n_self  := new.current_rating; n_src := new.self_source;    n_asd := new.assessed_at;
  end if;

  v_hint := coalesce(c->>'kind', '');
  log_coach := (o_coach is not null or n_coach is not null)
           and ((n_coach, n_by, n_at) is distinct from (o_coach, o_by, o_at) or v_hint = 'coach');
  log_self  := (o_self is not null or n_self is not null)
           and ((n_self, n_src, n_asd) is distinct from (o_self, o_src, o_asd) or v_hint = 'self');
  if not (log_coach or log_self) then
    return null;
  end if;

  v_source := case
    when coalesce(c->>'source', '') ~ '^[a-z_]{1,40}$' then c->>'source'
    when tg_op = 'DELETE' then 'row_deleted'
    else 'unknown'
  end;
  v_seq  := left(nullif(c->>'sequence_id', ''), 80);
  v_side := case when c->>'side' in ('fs', 'bs') then c->>'side' end;
  if coalesce(c->>'coach_id', '') ~ uuid_re then
    select co.id into v_actor from public.coaches co where co.id = (c->>'coach_id')::uuid;
  end if;
  if coalesce(c->>'camp_session_id', '') ~ uuid_re then
    select cs.id, cs.camp_instance_id into v_cs, v_ci
    from public.camp_sessions cs where cs.id = (c->>'camp_session_id')::uuid;
  end if;
  if v_ci is null and coalesce(c->>'camp_instance_id', '') ~ uuid_re then
    select ci.id into v_ci from public.camp_instances ci where ci.id = (c->>'camp_instance_id')::uuid;
  end if;
  if coalesce(c->>'training_session_id', '') ~ uuid_re then
    v_ts := (c->>'training_session_id')::uuid;
  end if;

  insert into public.step_rating_history (
    student_id, step_id, kind, old_rating, new_rating, self_source,
    coach_id, old_coach_id, old_rated_at, source, sequence_id, side,
    camp_instance_id, camp_session_id, training_session_id, ctx, actor_role, actor_uid)
  select k_student, k_step, v.kind, v.old_r, v.new_r, v.src,
         v.who, v.old_who, v.old_at, v_source, v_seq, v_side,
         v_ci, v_cs, v_ts, c - 'n', coalesce(auth.role(), session_user::text), auth.uid()
  from (values
    ('coach'::text, o_coach, n_coach, null::text,
       case when n_coach is not null then coalesce(n_by, v_actor) else v_actor end,
       o_by, o_at, log_coach),
    ('self'::text, o_self, n_self, coalesce(n_src, o_src),
       null::uuid, null::uuid, o_self_at, log_self)
  ) as v(kind, old_r, new_r, src, who, old_who, old_at, do_log)
  where v.do_log;

  return null;
end;
$$;

revoke all on function public.step_rating_ctx_fresh()   from public, anon, authenticated;
revoke all on function public.step_rating_history_log() from public, anon, authenticated;

-- 6 · Encender + línea de base, sin que se cuele una escritura en el medio.
lock table public.student_step_ratings in share row exclusive mode;

drop trigger if exists step_rating_ctx_fresh on public.student_step_ratings;
create trigger step_rating_ctx_fresh
  before update on public.student_step_ratings
  for each row execute function public.step_rating_ctx_fresh();

drop trigger if exists step_rating_history_log on public.student_step_ratings;
create trigger step_rating_history_log
  after insert or update or delete on public.student_step_ratings
  for each row execute function public.step_rating_history_log();

-- Línea de base: una fila por estrella que existe hoy (2154 coach + 53 alumno
-- al 2026-10-02). Lo anterior a hoy no quedó registrado en ningún lado.
insert into public.step_rating_history
  (student_id, step_id, kind, old_rating, new_rating, self_source, coach_id, source, ctx, actor_role, created_at)
select r.student_id, r.step_id, 'coach', null::integer, r.coach_rating, null::text, r.coach_rated_by, 'baseline',
       jsonb_build_object('note', 'estado al aplicar 00226'),
       'migration', coalesce(r.coach_rated_at, r.last_updated, r.created_at, now())
from public.student_step_ratings r
where r.coach_rating is not null
  and not exists (select 1 from public.step_rating_history h where h.source = 'baseline')
union all
select r.student_id, r.step_id, 'self', null::integer, r.current_rating, r.self_source, null::uuid, 'baseline',
       jsonb_build_object('note', 'estado al aplicar 00226', 'approx_time', r.self_source <> 'assessed'),
       'migration', coalesce(case when r.self_source = 'assessed' then r.assessed_at end, r.last_updated, r.created_at, now())
from public.student_step_ratings r
where r.current_rating is not null
  and not exists (select 1 from public.step_rating_history h where h.source = 'baseline');

notify pgrst, 'reload schema';
