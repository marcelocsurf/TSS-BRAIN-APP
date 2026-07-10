-- 00129 — Allow purple/brown/black in students.active_course_key.
--
-- The old check constraint only permitted white/yellow/blue, so selecting a
-- Purple/Brown/Black masterclass in the portal course switcher made
-- setActiveCourseKey's UPDATE violate the constraint and throw a server-side
-- exception (the "click Purple → Application error" crash).
--
-- Idempotent: drop the old constraint if present, re-add the full one.

ALTER TABLE students DROP CONSTRAINT IF EXISTS active_course_key_check;

ALTER TABLE students ADD CONSTRAINT active_course_key_check
  CHECK (
    active_course_key IS NULL
    OR active_course_key IN (
      'white_belt', 'yellow_belt', 'blue_belt',
      'purple_belt', 'brown_belt', 'black_belt'
    )
  );
