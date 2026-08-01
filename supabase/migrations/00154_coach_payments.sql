-- 00154 — Historial de pagos al equipo (Pagos al equipo / nómina).
-- Cada emisión registra período, monto, sesiones incluidas y quién la emitió.
CREATE TABLE IF NOT EXISTS coach_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES academies(id),
  coach_id uuid REFERENCES coaches(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  amount_cents integer NOT NULL,
  session_ids jsonb DEFAULT '[]'::jsonb,
  method text,
  note text,
  created_by uuid REFERENCES coaches(id),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coach_payments_coach ON coach_payments(coach_id, period_start);
