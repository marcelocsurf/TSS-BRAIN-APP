-- ═══════════════════════════════════════════════════════════════
-- TSS BRAIN — Camp Template Management Extensions
-- Adds support for admin-created templates, multi-type blocks,
-- scheduled evaluations, and per-student customizations.
-- ═══════════════════════════════════════════════════════════════

-- Allow admin-created templates alongside seeds
-- Add columns to support multi-mission blocks and scheduled evaluations

ALTER TABLE camp_template_blocks ADD COLUMN IF NOT EXISTS block_type TEXT DEFAULT 'mission';
-- block_type values: 'mission', 'evaluation', 'free_practice'

ALTER TABLE camp_template_days ADD COLUMN IF NOT EXISTS has_evaluation BOOLEAN DEFAULT false;
ALTER TABLE camp_template_days ADD COLUMN IF NOT EXISTS evaluation_type TEXT;
-- evaluation_type values: 'progress_check', 'sequence_evaluation', 'ocean_assessment', 'final'

-- ═══════════════════════════════════════════════════════════════
-- Camp student customizations (coach can modify drills/missions per student)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS camp_student_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_instance_id UUID NOT NULL REFERENCES camp_instances(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id),
  day_number INT NOT NULL,
  block_order INT NOT NULL,
  custom_drill_name TEXT,
  custom_mission TEXT,
  custom_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(camp_instance_id, student_id, day_number, block_order)
);

-- ═══════════════════════════════════════════════════════════════
-- Camp scheduled evaluations
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS camp_scheduled_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_instance_id UUID NOT NULL REFERENCES camp_instances(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id),
  scheduled_day INT NOT NULL,
  evaluation_type TEXT NOT NULL DEFAULT 'progress_check',
  -- evaluation_type values: 'progress_check', 'sequence_evaluation', 'ocean_assessment', 'final'
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES coaches(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(camp_instance_id, student_id, scheduled_day, evaluation_type)
);

-- ═══════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE camp_student_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_scheduled_evaluations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write customizations
CREATE POLICY "Authenticated users can manage camp_student_customizations"
  ON camp_student_customizations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read/write scheduled evaluations
CREATE POLICY "Authenticated users can manage camp_scheduled_evaluations"
  ON camp_scheduled_evaluations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
