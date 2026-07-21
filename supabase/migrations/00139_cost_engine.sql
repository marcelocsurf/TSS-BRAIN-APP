-- 00139 — Cost engine F1 (2026-07-21).
-- Editable cost catalog + coach pay matrix + per-template recipes. The cost of
-- a camp is computed from real drivers (students, days, transport days,
-- accepted assistants/filmers) — freelance model, no fixed staff.

CREATE TABLE IF NOT EXISTS cost_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid,
  name text NOT NULL,
  category text,                 -- coaching | training | video | materials | wellness | experience | tss | ops
  driver text NOT NULL,          -- per_student_flat | per_student_per_day | per_group_flat |
                                 -- per_group_per_day | transport_per_day | per_assistant_per_day | per_filmer_per_day
  amount_cents integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_cost_rates_academy ON cost_rates (academy_id, active);

CREATE TABLE IF NOT EXISTS coach_pay_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid,
  level_name text NOT NULL,      -- Beginner | Novice | Foundation | Emerging …
  group_size integer NOT NULL,   -- 1..6
  per_day_cents integer NOT NULL,
  UNIQUE (academy_id, level_name, group_size)
);

CREATE TABLE IF NOT EXISTS template_cost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id text NOT NULL,
  cost_rate_id uuid NOT NULL REFERENCES cost_rates(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  override_cents integer,        -- null = use the catalog amount
  UNIQUE (template_id, cost_rate_id)
);
