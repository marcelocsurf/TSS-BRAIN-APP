-- 00148 — Transporte: el coordinador valida también la hora real de REGRESO
-- (el coach programa salida y regreso; el coordinador valida ambas).
ALTER TABLE service_plans ADD COLUMN IF NOT EXISTS transport_actual_return text;
