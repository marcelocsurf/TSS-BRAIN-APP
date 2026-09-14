-- Evaluación Completa TSS (físico · técnica · maniobras · longboard · táctica · mental)
-- migrada del app HP: pasa a tener su propio eval_kind y espejo de scores.
alter table hp_deep_evaluations drop constraint hp_deep_evaluations_eval_kind_check;
alter table hp_deep_evaluations add constraint hp_deep_evaluations_eval_kind_check
  check (eval_kind = any (array['competencia'::text, 'general'::text, 'completa'::text]));

update hp_deep_evaluations d set
  eval_kind = 'completa',
  scores = case when jsonb_typeof(d.raw->'tech_json')='object'
    then coalesce((select jsonb_object_agg('tec_'||k, v) from jsonb_each(d.raw->'tech_json') e(k,v) where jsonb_typeof(v)='number' and (v::text)::numeric between 1 and 5), '{}'::jsonb)
    else '{}'::jsonb end
where jsonb_typeof(d.raw)='object' and d.raw ? 'eval_type';

update hp_deep_evaluations d set
  scores = coalesce((select jsonb_object_agg(k, v) from jsonb_each(d.raw) e(k,v) where k ~ '^(tec|tac|men|fis|com)_' and jsonb_typeof(v)='number' and (v::text)::numeric between 1 and 5), '{}'::jsonb)
where jsonb_typeof(d.raw)='object' and d.raw ? 'tec_fundamentos' and (d.scores is null or d.scores::text = '{}');
