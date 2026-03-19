-- Self-training sessions (student-initiated)
CREATE TABLE IF NOT EXISTS self_training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  warm_up TEXT,
  drill_id TEXT,
  drill_name TEXT,
  mental_hack TEXT,
  duration_minutes INT,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_self_train_student ON self_training_sessions(student_id, created_at DESC);
