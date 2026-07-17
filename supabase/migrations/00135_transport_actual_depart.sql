-- 00135 — Actual departure time (2026-07-17).
-- The coach plans a departure time; the coordinator records the REAL time the
-- transport actually left, so we can measure how late departures run. Optional
-- 'HH:MM' text, same shape as the other transport time columns.
ALTER TABLE service_plans
  ADD COLUMN IF NOT EXISTS transport_actual_depart text;
