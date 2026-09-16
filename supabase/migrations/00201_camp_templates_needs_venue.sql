-- 2026-09-16 · Marcelo/coach: "para abrir el Ice Bath me pide playa y transporte, pero eso es en el hotel".
-- Un servicio que se da en la academia (Ice Bath, Yoga, Skate, U.Natural, Jiujitsu) no lleva
-- ni playa ni transporte. La plantilla lo declara; el portal del coach y el planner lo respetan.
alter table camp_templates add column if not exists needs_venue boolean not null default true;
comment on column camp_templates.needs_venue is 'true = el servicio sale a una playa (pide lugar y transporte). false = se da en la academia.';
update camp_templates set needs_venue = false
where (service_kind::text = 'class'
  and (template_name ilike '%ice bath%' or template_name ilike '%yoga%' or template_name ilike '%skate class%'
       or template_name ilike '%u.natural%' or template_name ilike '%jiujitsu%' or template_name ilike '%jiu jitsu%'))
   or (service_kind::text = 'surf_lesson' and template_name ilike '%surf skate%');
