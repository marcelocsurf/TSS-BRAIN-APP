-- ═══════════════════════════════════════════════════════════
-- TSS BRAIN: Sequence & Ocean Level Evaluations + Camp Head Coach
-- ═══════════════════════════════════════════════════════════

-- Sequence evaluations table
CREATE TABLE IF NOT EXISTS sequence_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  evaluated_by UUID NOT NULL REFERENCES coaches(id),
  sequence_number INT NOT NULL,
  step_number INT NOT NULL,
  previous_sequence INT,
  previous_step INT,
  evaluation_type TEXT NOT NULL DEFAULT 'progression', -- progression, assessment, correction
  status TEXT NOT NULL, -- passed, failed, in_progress
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_seq_eval_student ON sequence_evaluations(student_id, created_at DESC);

-- Ocean level evaluations table
CREATE TABLE IF NOT EXISTS ocean_level_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  evaluated_by UUID NOT NULL REFERENCES coaches(id),
  previous_level TEXT,
  new_level TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'coach_assessment', -- quiz, coach_assessment, evaluation
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ocean_eval_student ON ocean_level_evaluations(student_id, created_at DESC);

-- Camp head coach column
ALTER TABLE camp_instances ADD COLUMN IF NOT EXISTS head_coach_id UUID REFERENCES coaches(id);
