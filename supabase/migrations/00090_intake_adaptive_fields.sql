-- M90 — Adaptive intake fields
-- The extended intake now branches on whether the student has ever
-- surfed (ocean_quiz P0). Beginners get a simpler profile; experienced
-- surfers get a deeper one. These columns back the new branch-specific
-- questions. All additive + nullable.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS board_familiarity TEXT,   -- beginner: tried standing on a board?
  ADD COLUMN IF NOT EXISTS water_comfort TEXT,        -- beginner: comfort in the ocean
  ADD COLUMN IF NOT EXISTS comfort_wave_size TEXT,    -- experienced: wave size comfortable today
  ADD COLUMN IF NOT EXISTS maneuvers_current TEXT[],  -- experienced: maneuvers already performed
  ADD COLUMN IF NOT EXISTS surf_injuries TEXT;        -- experienced: previous surf injuries
