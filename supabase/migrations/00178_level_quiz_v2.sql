-- ═══ Quiz V2 oficial (2026-09-01) ═══
-- El resultado completo del quiz V2 (la película de la sesión, /100) viaja
-- en un jsonb propio: score, mar, ola, capped_by, capped_gaps, board, needs,
-- answers. Las columnas v1 (level_quiz_score, level_quiz_skillmap) se siguen
-- llenando para que las superficies existentes no se rompan; la presencia de
-- level_quiz_v2 es lo que le dice a la ficha "esto es /100 con tracks".
alter table students add column if not exists level_quiz_v2 jsonb;
