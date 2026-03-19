-- Camp daily feedback per student
CREATE TABLE IF NOT EXISTS camp_daily_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_instance_id UUID NOT NULL REFERENCES camp_instances(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  status TEXT DEFAULT 'attended', -- attended, absent, partial
  focus_rating INT CHECK (focus_rating BETWEEN 1 AND 5),
  effort_rating INT CHECK (effort_rating BETWEEN 1 AND 5),
  notes TEXT,
  highlights TEXT,
  areas_to_improve TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(camp_instance_id, day_number, student_id)
);

-- Camp final evaluation per student
CREATE TABLE IF NOT EXISTS camp_final_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_instance_id UUID NOT NULL REFERENCES camp_instances(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
  technical_progress TEXT,
  tactical_progress TEXT,
  mental_progress TEXT,
  physical_progress TEXT,
  sequence_recommendation INT, -- recommended sequence number
  ocean_level_recommendation TEXT,
  general_notes TEXT,
  strengths TEXT,
  areas_to_improve TEXT,
  homework_for_after_camp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(camp_instance_id, student_id)
);
