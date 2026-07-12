-- 00131 — Soft-archive for academies (2026-07-12).
-- Archived academies keep every row (students stay in the admin roster);
-- they just disappear from the act-as switcher and the add-coach picker.
ALTER TABLE academies ADD COLUMN IF NOT EXISTS archived_at timestamptz;
