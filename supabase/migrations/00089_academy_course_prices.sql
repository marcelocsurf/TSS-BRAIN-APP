-- M89 — Per-academy course pricing override
-- Global price in course_prices is the default. If an academy needs
-- different pricing (e.g. Puro Surf $99, El Salvador Surf School $120),
-- they get a row here keyed (academy_id, course_key). Grant time picks
-- per-academy row if present, else falls back to global.

CREATE TABLE IF NOT EXISTS academy_course_prices (
  academy_id   UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  course_key   TEXT NOT NULL,
  price_cents  INTEGER NOT NULL CHECK (price_cents >= 0),
  currency     TEXT NOT NULL DEFAULT 'USD',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by   UUID REFERENCES coaches(id),
  PRIMARY KEY (academy_id, course_key)
);

ALTER TABLE academy_course_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS academy_course_prices_select ON academy_course_prices;
CREATE POLICY academy_course_prices_select ON academy_course_prices
  FOR SELECT USING (
    current_coach_is_platform_admin()
    OR academy_id = current_coach_academy_id()
  );

DROP POLICY IF EXISTS academy_course_prices_write ON academy_course_prices;
CREATE POLICY academy_course_prices_write ON academy_course_prices
  FOR ALL USING (true) WITH CHECK (true);
