-- M100 — Student-declared exact board dimensions (from intake).
-- The intake already captures board_type (Shortboard, Longboard, etc.).
-- This adds the exact size + volume the experienced student normally
-- rides, so the coach sees it as a reference in "Board for today" when
-- choosing the board. All TEXT + nullable: a beginner who has never
-- surfed simply leaves them blank.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS board_length_feet   TEXT,
  ADD COLUMN IF NOT EXISTS board_length_inches TEXT,
  ADD COLUMN IF NOT EXISTS board_volume_liters TEXT;

COMMENT ON COLUMN students.board_length_feet   IS 'Student-declared usual board length (feet), from intake. Blank if never surfed / unknown.';
COMMENT ON COLUMN students.board_length_inches IS 'Student-declared usual board length (inches), from intake.';
COMMENT ON COLUMN students.board_volume_liters IS 'Student-declared usual board volume in liters, from intake.';
