-- 00218 · La encuesta pregunta por EL MÉTODO (Marcelo 2026-09-25: "no pregunta
-- nada sobre el método"). Dos preguntas 1–5, solo en la encuesta de surf:
--   method_clarity · Did the method make sense — the sequence, the steps, the stars?
--   method_next    · Do you know exactly what to work on next?
alter table survey_responses add column if not exists method_clarity integer check (method_clarity is null or (method_clarity between 1 and 5));
alter table survey_responses add column if not exists method_next integer check (method_next is null or (method_next between 1 and 5));
comment on column survey_responses.method_clarity is 'Did the method make sense — the sequence, the steps, the stars? (1-5, solo surf)';
comment on column survey_responses.method_next is 'Do you know exactly what to work on next? (1-5, solo surf)';
