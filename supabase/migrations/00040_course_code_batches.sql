-- Add batch grouping and academy tracking to access_codes
ALTER TABLE access_codes
  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES academies(id),
  ADD COLUMN IF NOT EXISTS batch_label TEXT,   -- e.g. "White Belt Mayo 2026"
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES coaches(id);
