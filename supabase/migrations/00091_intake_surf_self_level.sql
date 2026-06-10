-- M91 — Replace the "which maneuvers" multi-select with a single
-- progressive self-level question (clearer + less over-reported).
-- maneuvers_current (M90) is left in place for back-compat but no longer
-- written by the form.

ALTER TABLE students ADD COLUMN IF NOT EXISTS surf_self_level TEXT;
