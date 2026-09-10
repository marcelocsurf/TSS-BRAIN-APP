-- 00187: lado (frontside / backside) en Let's Play (Marcelo 2026-09-10).
-- La secuencia sigue siendo la unidad y conserva su número; el lado es un
-- atributo. Las secuencias que se surfean de los dos lados (Yellow #7) se
-- califican POR LADO y valen lo que vale su lado más flojo.
alter table public.self_training_sessions
  add column if not exists side text
    check (side is null or side in ('fs','bs'));
alter table public.student_sequence_ratings
  add column if not exists rating_fs integer
    check (rating_fs is null or (rating_fs >= 1 and rating_fs <= 5)),
  add column if not exists rating_bs integer
    check (rating_bs is null or (rating_bs >= 1 and rating_bs <= 5));
comment on column public.self_training_sessions.side is 'fs | bs — el lado que se entrenó (implícito en #8-#13, elegido en las secuencias de dos lados).';
comment on column public.student_sequence_ratings.rating_fs is 'Última nota frontside (solo secuencias de dos lados). current_rating = el lado más flojo.';
comment on column public.student_sequence_ratings.rating_bs is 'Última nota backside (solo secuencias de dos lados). current_rating = el lado más flojo.';
