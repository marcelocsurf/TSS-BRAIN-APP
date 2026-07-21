-- 00140 — Seat sale type (2026-07-21 · cost engine F2).
-- How each seat was sold: full price, discount (with reason) or courtesy.
-- list_price_cents keeps the reference price so the discount is measurable.
ALTER TABLE camp_participants
  ADD COLUMN IF NOT EXISTS sale_type text,            -- full | discount | courtesy
  ADD COLUMN IF NOT EXISTS list_price_cents integer,
  ADD COLUMN IF NOT EXISTS discount_reason text;
