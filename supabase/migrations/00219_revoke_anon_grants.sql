-- 00219 · El rol anon (la clave pública del navegador) no toca ninguna tabla
-- ni función (auditoría de lanzamiento 2026-09-25).
--
-- Hallazgo: 158 tablas tenían GRANT ALL a anon, 29 tablas ops_* de respaldo
-- estaban SIN RLS (673 fichas de alumnos con teléfono, token del portal y
-- datos médicos legibles y borrables con la clave pública), y varias funciones
-- SECURITY DEFINER (grant_level_access, save_cascade_session…) eran
-- ejecutables por anon.
--
-- Por qué es seguro: todo lo público del app (portal por token, /feedback,
-- quiz, intake, /join, /my-portal) corre en server actions con service_role.
-- El navegador usa la clave anon solo para auth (login, logout, magic link)
-- y, ya logueado, opera como `authenticated`. Nada anónimo lee tablas.
-- Storage (bucket avatars) tiene sus propias políticas y no cambia.
--
-- Volver atrás (no recomendado): grant select on all tables in schema public to anon;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke execute on functions from anon;

-- Los respaldos ops_* tampoco son para usuarios logueados: RLS sin políticas
-- (solo service_role pasa). Cualquier tabla ops_* futura debe nacer igual.
do $$
declare t record;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'ops\_%' loop
    execute format('alter table public.%I enable row level security', t.relname);
    execute format('revoke all on public.%I from authenticated', t.relname);
  end loop;
end $$;
