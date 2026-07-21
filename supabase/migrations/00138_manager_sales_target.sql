-- 00138 — Manager portal (2026-07-21).
-- 1) Allow the new 'manager' portal category (read-only academy overview).
ALTER TABLE coaches DROP CONSTRAINT IF EXISTS coaches_portal_category_chk;
ALTER TABLE coaches ADD CONSTRAINT coaches_portal_category_chk
  CHECK (portal_category IN ('coaching', 'support', 'manager'));

-- 2) Optional monthly sales goal per academy, shown in the manager portal (cents).
ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS monthly_sales_target_cents bigint;
