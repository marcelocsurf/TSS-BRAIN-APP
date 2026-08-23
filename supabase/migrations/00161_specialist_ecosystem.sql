-- ECOSISTEMA DE ESPECIALISTAS (dale Marcelo 2026-08-23, F1-F4).
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS specialist_role TEXT
  CHECK (specialist_role IS NULL OR specialist_role IN ('psicologo','fisico','nutricionista'));

CREATE TABLE IF NOT EXISTS athlete_team_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  author_coach_id UUID REFERENCES coaches(id),
  author_student_id UUID REFERENCES students(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (author_coach_id IS NOT NULL OR author_student_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_atp_student ON athlete_team_posts (student_id, created_at DESC);
ALTER TABLE athlete_team_posts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS athlete_diet_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  scope TEXT NOT NULL CHECK (scope IN ('micro','day')),
  week_number INT,
  note_date DATE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((scope = 'micro' AND week_number IS NOT NULL) OR (scope = 'day' AND note_date IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_adn_student ON athlete_diet_notes (student_id, created_at DESC);
ALTER TABLE athlete_diet_notes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS athlete_staff_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  kind TEXT NOT NULL CHECK (kind IN ('fisico','mental','tecnico','nutricion','otro')),
  title TEXT NOT NULL,
  body TEXT,
  video_url TEXT,
  due_date DATE,
  done BOOLEAN NOT NULL DEFAULT false,
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ast_student_open ON athlete_staff_tasks (student_id) WHERE done = false;
ALTER TABLE athlete_staff_tasks ENABLE ROW LEVEL SECURITY;
