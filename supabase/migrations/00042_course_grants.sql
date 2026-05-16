-- Course grant ledger — the billing unit. One row per course granted to a student.
CREATE TABLE IF NOT EXISTS course_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id),
  course_key TEXT NOT NULL,                 -- 'white_belt' (more courses later)
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES coaches(id),   -- null for auto-grants
  source TEXT NOT NULL DEFAULT 'manual',    -- 'auto_on_intake' | 'manual'
  billable BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_course_grants_academy ON course_grants(academy_id, granted_at);
CREATE INDEX IF NOT EXISTS idx_course_grants_student ON course_grants(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_course_grants_student_course ON course_grants(student_id, course_key);

-- Courses earmarked at student creation; activated when intake+waiver complete.
ALTER TABLE students ADD COLUMN IF NOT EXISTS pending_courses TEXT[] NOT NULL DEFAULT '{}';
