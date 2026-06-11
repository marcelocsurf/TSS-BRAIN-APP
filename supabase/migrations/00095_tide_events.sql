-- M95 — Tide table (La Libertad reference) for whitewater lesson planning.
CREATE TABLE IF NOT EXISTS tide_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot TEXT NOT NULL DEFAULT 'la_libertad',
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('high','low')),
  height_m NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (spot, event_date, event_time)
);
CREATE INDEX IF NOT EXISTS idx_tide_events_date ON tide_events(spot, event_date);
ALTER TABLE tide_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY tide_events_select ON tide_events FOR SELECT USING (true);
CREATE POLICY tide_events_insert ON tide_events FOR INSERT WITH CHECK (true);
CREATE POLICY tide_events_update ON tide_events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY tide_events_delete ON tide_events FOR DELETE USING (true);
