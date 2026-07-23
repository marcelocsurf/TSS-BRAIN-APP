-- 00144 — Coupon codes for public class signup (QR flow).
CREATE TABLE IF NOT EXISTS class_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  code text NOT NULL,
  percent_off integer NOT NULL DEFAULT 50 CHECK (percent_off BETWEEN 1 AND 100),
  active boolean NOT NULL DEFAULT true,
  expires_on date,
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academy_id, code)
);
ALTER TABLE class_coupons ENABLE ROW LEVEL SECURITY;
