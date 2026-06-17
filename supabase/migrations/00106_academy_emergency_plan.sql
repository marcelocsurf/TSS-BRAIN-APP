-- M106 — Per-academy Emergency Plan.
--
-- Each academy operates at a specific location, so emergency numbers +
-- hospital + meeting point are location-specific. These fields are filled
-- by the academy (coordinator or admin) and shown to every coach so the
-- plan is always at hand. All nullable TEXT — additive.

ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS emergency_numbers   TEXT,  -- quick lines (e.g. 911 · Cruz Roja · Police)
  ADD COLUMN IF NOT EXISTS nearest_hospital    TEXT,  -- name + address + phone
  ADD COLUMN IF NOT EXISTS lifeguard_contact   TEXT,  -- lifeguard / coast guard
  ADD COLUMN IF NOT EXISTS emergency_address   TEXT,  -- exact spot/meeting point to give responders
  ADD COLUMN IF NOT EXISTS emergency_protocol  TEXT,  -- free-form steps / notes
  ADD COLUMN IF NOT EXISTS emergency_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN academies.emergency_numbers  IS 'Quick emergency lines for the academy location (general/ambulance/police).';
COMMENT ON COLUMN academies.nearest_hospital   IS 'Nearest hospital/clinic name + address + phone.';
COMMENT ON COLUMN academies.emergency_address  IS 'Exact operating spot / meeting point to give to responders.';
