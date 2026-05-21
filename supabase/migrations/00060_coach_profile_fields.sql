-- M60 — Coach personal/safety profile fields. Parallels the student
-- intake so every TSS coach has emergency-contact + medical + waiver
-- on file before they teach.

ALTER TABLE coaches
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS height TEXT,
  ADD COLUMN IF NOT EXISTS weight TEXT,
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS injuries TEXT,
  ADD COLUMN IF NOT EXISTS medical_notes TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS waiver_signed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS waiver_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS intake_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS other_certifications TEXT,
  ADD COLUMN IF NOT EXISTS years_surfing INTEGER,
  ADD COLUMN IF NOT EXISTS years_coaching INTEGER,
  ADD COLUMN IF NOT EXISTS bio_short TEXT;
