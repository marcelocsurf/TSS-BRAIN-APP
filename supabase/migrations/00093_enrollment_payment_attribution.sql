-- M93 — Sales: payment status + attribution on enrolments (Venta Fase 1).
-- A seat in a service can be 'reserved' (seller booked it, unpaid) or
-- 'paid' (sale closed). Each enrolment records who sold it, the amount,
-- the method, and whether it's a refresher (repeat at same level, 50%).

ALTER TABLE camp_participants
  ADD COLUMN IF NOT EXISTS payment_status TEXT,          -- 'reserved' | 'paid'
  ADD COLUMN IF NOT EXISTS amount_cents INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS payment_method TEXT,          -- 'cash' | 'transfer' | 'card' | 'other'
  ADD COLUMN IF NOT EXISTS sold_by UUID REFERENCES coaches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_refresher BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Grandfather existing active enrolments as paid.
UPDATE camp_participants
  SET payment_status = 'paid', paid_at = NOW()
  WHERE enrollment_status = 'active' AND payment_status IS NULL;
