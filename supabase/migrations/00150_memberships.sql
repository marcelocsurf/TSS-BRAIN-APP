-- 00150 — Membresías (M156): camp incluye 6 meses de acceso al portal.
-- Historial completo por fila (nunca se edita un vencimiento: se agregan filas).
-- status: active (cuenta para el acceso) | requested (renovación pedida, espera
-- confirmación de pago del coordinador) | cancelled.
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES academies(id) ON DELETE SET NULL,
  source text NOT NULL,              -- launch_gift | camp_enrollment | renewal
  months integer NOT NULL DEFAULT 6,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  amount_cents integer,
  currency text DEFAULT 'USD',
  status text NOT NULL DEFAULT 'active',
  payment_method text,
  note text,
  created_by uuid REFERENCES coaches(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_memberships_student ON memberships(student_id, ends_at DESC);
