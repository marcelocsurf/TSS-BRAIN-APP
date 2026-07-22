-- 00142 — Per-service quantity on recipe items (e.g. 2 massages per camp).
ALTER TABLE template_cost_items ADD COLUMN IF NOT EXISTS qty numeric NOT NULL DEFAULT 1;
