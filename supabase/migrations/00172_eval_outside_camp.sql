-- Una evaluación oficial no siempre nace de un camp.
--
-- Marcelo (2026-08-27): "la idea es que esta evaluación sirva para finalizar
-- un camp pero que sea también la evaluación que se les hace en cualquier
-- momento, evaluando todos los requisitos del cinturón en el que se encuentra".
--
-- La ficha del alumno ya evalúa con la misma pantalla, pero su acta no tenía
-- dónde guardarse: camp_instance_id era NOT NULL. Ahora una evaluación hecha
-- fuera de un camp es una fila con camp_instance_id null — misma tabla, misma
-- forma, y aparece en el historial del alumno junto a las de los camps.
alter table camp_final_evaluations
  alter column camp_instance_id drop not null;

comment on column camp_final_evaluations.camp_instance_id is
  'null = evaluación hecha fuera de un camp, desde la ficha del alumno, en cualquier momento.';

create index if not exists camp_final_evaluations_student_idx
  on camp_final_evaluations (student_id, created_at desc);
