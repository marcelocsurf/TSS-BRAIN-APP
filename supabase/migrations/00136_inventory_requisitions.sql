-- 00136 — Inventory purchase requisitions (2026-07-17).
-- When stock drops below the minimum, the coordinator generates a requisition:
-- a snapshot of everything that's low + how many to buy to get back to the
-- minimum. It shows on the manager dashboard and prints to PDF for purchasing.
CREATE TABLE IF NOT EXISTS inventory_requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid,
  created_by uuid,            -- coaches.id
  created_by_name text,
  status text NOT NULL DEFAULT 'open',  -- open | ordered | received | cancelled
  note text,
  items jsonb NOT NULL DEFAULT '[]',    -- [{name, unit, category, in_stock, minimum, needed}]
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_inv_req_academy ON inventory_requisitions (academy_id, created_at DESC);
