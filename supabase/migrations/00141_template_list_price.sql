-- 00141 — Official sale price per service (cost engine F2b).
ALTER TABLE camp_templates ADD COLUMN IF NOT EXISTS list_price_cents integer;
