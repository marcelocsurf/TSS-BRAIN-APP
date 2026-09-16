-- 2026-09-16 · Marcelo: el "next focus" del coach debe ser una SECUENCIA elegida
-- (y si quiere, un paso de esa secuencia), con texto libre opcional, para que
-- el Home y Let's Play del alumno lo lean directo. next_recommended_focus sigue
-- como texto (nota o etiqueta automática) para las fichas que ya lo muestran.
alter table students add column if not exists next_focus_sequence_id text;
alter table students add column if not exists next_focus_step_id text;
comment on column students.next_focus_sequence_id is 'Secuencia elegida por el coach como próximo foco (id de lessons.wb_sequence_id).';
comment on column students.next_focus_step_id is 'Paso (STP-xxx) dentro de esa secuencia, opcional.';
