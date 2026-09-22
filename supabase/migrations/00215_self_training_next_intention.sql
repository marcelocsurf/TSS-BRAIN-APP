-- La sesión que el alumno escribe (kind 'custom') y el free surf cierran
-- igual que una secuencia: ¿cumpliste la intención?, qué tan metido estabas,
-- flow. Todo eso ya tenía columna (intention_text, focus_rating,
-- flow_channel, mission_completion) y nadie las llenaba: 604 sesiones
-- 'custom' sin una sola. Lo único que faltaba era el cierre del círculo —
-- qué se trabaja la próxima — porque no hay paso ni secuencia a la cual
-- colgarlo (student_tasks exige step_id). Vive acá, en palabras del alumno,
-- y precarga la intención de su próxima sesión.

alter table self_training_sessions
  add column if not exists next_intention text;

comment on column self_training_sessions.next_intention is
  'Lo que el alumno decide trabajar la próxima vez, en sus palabras. Precarga la intención de su siguiente sesión libre.';
