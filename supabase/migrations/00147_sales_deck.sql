-- 00147 — Seller Fase 2B: each service template can point to its selling deck
-- (a coach_resources PDF). One deck can serve many templates.
ALTER TABLE camp_templates
  ADD COLUMN IF NOT EXISTS sales_deck_resource_id uuid REFERENCES coach_resources(id) ON DELETE SET NULL;
