alter table public.camp_instances add column if not exists is_test boolean not null default false;
comment on column public.camp_instances.is_test is 'Sesión de prueba para capacitar coaches (2026-09-18): mismo flujo, sin correos, encuestas, cintas ni nómina; se borra con "Borrar pruebas".';
create index if not exists camp_instances_is_test_idx on public.camp_instances (is_test) where is_test;
