-- Una persona puede ser coach Y alumno a la vez. Ya pasa hoy con 6 personas
-- (Stanley Menjivar, Melvin Ayala, Daniel Fiallos, Kat Moscarda, Cony Rivas)
-- y nada conectaba sus dos perfiles: cada uno tenía dos portal_token sueltos
-- y tenía que acordarse de cuál link era cuál.
--
-- NO se unifican las tablas. Guardan cosas distintas de verdad —certificación,
-- permiso de acreditar y permisos del portal en coaches; cinta, acceso HP,
-- inscripciones y estrellas en students— y unificarlas obligaría a reescribir
-- cada consulta que apunta a coach_id o a student_id.
--
-- Con esta columna cada portal puede ofrecer un botón para saltar al otro,
-- sin mezclar nada: siempre se sabe en cuál se está parado.

alter table students
  add column if not exists coach_id uuid references coaches(id) on delete set null;

comment on column students.coach_id is
  'Cuando esta persona además trabaja como coach, apunta a su fila en coaches. Permite saltar de un portal al otro sin unificar las tablas.';

-- Una fila de coaches pertenece como mucho a un alumno.
create unique index if not exists students_coach_id_key
  on students (coach_id) where coach_id is not null;

create index if not exists students_coach_id_idx on students (coach_id);
