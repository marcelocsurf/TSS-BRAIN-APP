-- M107 — Session incidents log (general or student-specific).
--
-- Until now incidents were stored per-student on student_session_results.
-- This adds a dedicated log so a coach can report ANYTHING that happened in
-- a session — an accident, a broken/hit board, a fin/leash issue, a fight in
-- the water, a mishandled frustration, a misunderstanding — whether or not a
-- specific student was involved. Coordinator + admin see them on the
-- dashboard so everyone stays informed and it's all on record.

CREATE TABLE IF NOT EXISTS session_incidents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      UUID REFERENCES academies(id) ON DELETE SET NULL,
  coach_id        UUID REFERENCES coaches(id) ON DELETE SET NULL,
  student_id      UUID REFERENCES students(id) ON DELETE SET NULL,  -- null = general, no specific student
  student_name    TEXT,                                             -- denormalized for display / free-text
  camp_instance_id UUID REFERENCES camp_instances(id) ON DELETE SET NULL,
  incident_type   TEXT NOT NULL,
  description     TEXT,
  action_taken    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_incidents_academy ON session_incidents(academy_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_incidents_coach   ON session_incidents(coach_id);
CREATE INDEX IF NOT EXISTS idx_session_incidents_student ON session_incidents(student_id) WHERE student_id IS NOT NULL;

-- App reads/writes via the server-role admin client (token-gated actions),
-- consistent with the other operational tables.
ALTER TABLE session_incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS session_incidents_all ON session_incidents;
CREATE POLICY session_incidents_all ON session_incidents FOR ALL USING (true) WITH CHECK (true);
