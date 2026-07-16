-- 00132 — Academy inventory (2026-07-15).
-- Quantity-based operational inventory (gym, surf consumables, skate, tech,
-- misc) — distinct from the per-board `boards` table. Counts are updated from
-- the token portal (support staff / coaches) and every save logs a check row,
-- replacing the weekly Excel ("Inventario de La Academia.xlsx").

CREATE TABLE IF NOT EXISTS academy_inventory_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  category      text NOT NULL,             -- 'Surf' | 'Gym' | 'Skate' | 'Tech' | 'Misc' (free)
  name          text NOT NULL,
  unit          text,                      -- e.g. '10 lbs'
  qty_in_use    integer DEFAULT 0,
  qty_in_stock  integer DEFAULT 0,
  minimum       integer,                   -- low-stock threshold (from the Excel's "Mínimo")
  notes         text,
  display_order integer DEFAULT 0,
  active        boolean NOT NULL DEFAULT true,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    uuid REFERENCES coaches(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_inventory_items_academy ON academy_inventory_items(academy_id);

-- History — one row per item save (the digital "Hoja 1" weekly log).
CREATE TABLE IF NOT EXISTS inventory_checks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id   uuid REFERENCES academies(id) ON DELETE CASCADE,
  item_id      uuid REFERENCES academy_inventory_items(id) ON DELETE CASCADE,
  qty_in_use   integer,
  qty_in_stock integer,
  note         text,
  checked_by   uuid REFERENCES coaches(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inventory_checks_item ON inventory_checks(item_id);

-- Tasks can link to an in-app tool ('inventory' opens the real inventory).
ALTER TABLE academy_tasks ADD COLUMN IF NOT EXISTS link_url text;
