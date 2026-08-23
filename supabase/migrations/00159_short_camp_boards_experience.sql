-- Catch-up de migraciones aplicadas directo a prod vía MCP (2026-08-18..22).
-- Sin esto, un entorno reconstruido desde /migrations rompe el portal del
-- coach (select explícito de columnas) y el roster diario.

-- Salida anticipada / short camp (finalizeParticipant + cierre individual)
ALTER TABLE camp_participants ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;
ALTER TABLE camp_participants ADD COLUMN IF NOT EXISTS departed_on DATE;

-- Permiso otorgable: coach gestiona inventario de tablas desde su portal
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS portal_can_manage_boards BOOLEAN NOT NULL DEFAULT false;

-- Tareas diarias por días de la semana (tablero live del coordinador)
ALTER TABLE academy_tasks ADD COLUMN IF NOT EXISTS recurrence_days INT[];

-- Encuesta de EXPERIENCIA del camp (Opción A encadenada)
CREATE TABLE IF NOT EXISTS camp_experience_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_instance_id UUID NOT NULL REFERENCES camp_instances(id),
  student_id UUID NOT NULL REFERENCES students(id),
  academy_id UUID REFERENCES academies(id),
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  facilities_rating INT CHECK (facilities_rating BETWEEN 1 AND 5),
  equipment_rating INT CHECK (equipment_rating BETWEEN 1 AND 5),
  transport_rating INT CHECK (transport_rating BETWEEN 1 AND 5),
  communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
  value_rating INT CHECK (value_rating BETWEEN 1 AND 5),
  nps INT CHECK (nps BETWEEN 0 AND 10),
  open_comment TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (camp_instance_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_ces_academy_submitted ON camp_experience_surveys (academy_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_ces_student_pending ON camp_experience_surveys (student_id) WHERE submitted_at IS NULL;
ALTER TABLE camp_experience_surveys ENABLE ROW LEVEL SECURITY;
