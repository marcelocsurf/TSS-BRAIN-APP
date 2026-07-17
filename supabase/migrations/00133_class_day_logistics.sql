-- 00133 — Class-day logistics (2026-07-17).
-- The coach plans the REAL day: start time, which beach they'll surf, and
-- whether they need transport (with departure/return times). The coordinator
-- aggregates transport needs for the week and marks each one taken/cancelled;
-- photographers/assistants/support see time + place in their 7-day agenda.
ALTER TABLE service_plans
  ADD COLUMN IF NOT EXISTS class_start_time text,   -- 'HH:MM'
  ADD COLUMN IF NOT EXISTS surf_venue text,          -- beach / spot for the day
  ADD COLUMN IF NOT EXISTS transport_needed boolean, -- null = not decided yet
  ADD COLUMN IF NOT EXISTS transport_depart text,    -- 'HH:MM'
  ADD COLUMN IF NOT EXISTS transport_return text,    -- 'HH:MM'
  ADD COLUMN IF NOT EXISTS transport_status text;    -- coordinator: 'taken' | 'cancelled' | null (pending)
