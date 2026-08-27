-- Pruebas de agua: cómo se GANA el nivel de océano.
--
-- Hasta hoy students.ocean_level salía del quiz de intake —o sea, de lo que el
-- alumno dice de sí mismo— y del ojo del coach. Y students.swim_level es
-- auto-declarado y nadie lo verifica nunca. Esto lo vuelve observable.
--
-- No se califica con estrellas: se pasa o no se pasa. Flotaste tres minutos o
-- no. La técnica es gradual; esto es binario, porque es seguridad.
--
-- Cada prueba prueba un MODO DE FALLA real, no una marca de gimnasio:
--   flotar          que no entra en pánico si pierde la tabla
--   nadar           que vuelve si se revienta el leash
--   recuperar       subirse a la tabla donde no toca fondo
--   turtle roll     que puede salir cuando entra serie
--   remada          que aguanta la corriente y vuelve

create table if not exists water_tests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  -- Qué prueba: 'float' | 'swim' | 'board_recovery' | 'turtle_roll' | 'paddle'
  test_key text not null,
  -- El nivel de océano que habilita: 'supervised' | 'semi_autonomous' |
  -- 'autonomous' | 'advanced'
  target_level text not null,
  passed boolean not null,
  -- Lo que se midió (minutos, metros). Opcional: importa el pasa/no pasa.
  measured numeric,
  conditions text,
  notes text,
  tested_by uuid references coaches(id) on delete set null,
  tested_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table water_tests is
  'Pruebas de agua observables que habilitan un nivel de ocean_level. Binarias: se pasa o no se pasa. Es seguridad, no una medalla.';

-- Una prueba se puede repetir: se guarda el historial y vale la última.
-- A diferencia de student_step_ratings, acá NO se pisa nada.
create index if not exists water_tests_student_idx on water_tests (student_id, tested_at desc);
create index if not exists water_tests_lookup_idx on water_tests (student_id, test_key, target_level, tested_at desc);

alter table water_tests enable row level security;

-- Mismo criterio que student_step_ratings: el acceso va por la capa de
-- servicio (createAdminClient + token), no por RLS de cliente.
drop policy if exists water_tests_service_all on water_tests;
create policy water_tests_service_all on water_tests
  for all to service_role using (true) with check (true);
