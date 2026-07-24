-- 00145 — Tipo de servicio 'trip' (surf trips guiados, sin coaching)
ALTER TABLE camp_templates DROP CONSTRAINT IF EXISTS camp_templates_service_kind_check;
ALTER TABLE camp_templates ADD CONSTRAINT camp_templates_service_kind_check
  CHECK (service_kind IN ('surf_camp','surf_lesson','custom','class','trip'));
