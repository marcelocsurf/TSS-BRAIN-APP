-- 00002_tables.sql
-- TSS Brain Stage 1 — All Tables
-- Based on Architecture v1.1 + Build Blueprint corrections

-- ═══════════════════════════════════════
-- STUDENTS
-- ═══════════════════════════════════════
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  age INT,
  gender TEXT,
  nationality TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  photo_url TEXT,
  portal_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,

  -- PROGRESSION (canonical — never break)
  belt_level belt_level NOT NULL DEFAULT 'white_belt',
  current_sequence_number INT NOT NULL DEFAULT 1,
  current_step_order INT NOT NULL DEFAULT 1,
  ocean_level TEXT DEFAULT 'Assisted',
  progression_status TEXT,

  -- SAFETY
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  allergies TEXT,
  injuries TEXT,
  medical_notes TEXT,
  swim_level TEXT,
  risk_notes TEXT,

  -- PLANNING
  primary_goal TEXT,
  current_focus_area TEXT,
  coach_notes_general TEXT,

  -- CONTINUITY SNAPSHOTS (updated on session close)
  last_session_id UUID,
  last_session_date TIMESTAMPTZ,
  last_session_mission TEXT,
  last_session_pilar pilar,
  last_session_drill TEXT,
  last_session_status session_status,
  last_homework TEXT,
  next_recommended_focus TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_belt ON students(belt_level);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_portal_token ON students(portal_token);

-- ═══════════════════════════════════════
-- COACHES
-- ═══════════════════════════════════════
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT,
  display_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role coach_role NOT NULL DEFAULT 'instructor',
  max_belt_permission belt_level NOT NULL,
  certification_level TEXT,
  active_status BOOLEAN NOT NULL DEFAULT TRUE,
  languages TEXT,
  specialty_area TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coaches_auth ON coaches(auth_user_id);

-- ═══════════════════════════════════════
-- DRILLS (seed data, read-only)
-- ═══════════════════════════════════════
CREATE TABLE drills (
  id TEXT PRIMARY KEY,
  drill_name TEXT NOT NULL,
  related_pilar pilar,
  is_safety_layer BOOLEAN NOT NULL DEFAULT FALSE,
  pilar_part TEXT,
  sequence_part TEXT,
  drill_type TEXT,
  goal TEXT,
  key_cue TEXT,
  environment TEXT,
  surf_level_min TEXT,
  belt_level_range TEXT,
  related_error TEXT,
  related_solution TEXT,
  notes TEXT,
  ocean_conditions TEXT,
  training_block TEXT,
  active_status BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_drills_pilar ON drills(related_pilar);
CREATE INDEX idx_drills_safety ON drills(is_safety_layer);
CREATE INDEX idx_drills_block ON drills(training_block);

-- ═══════════════════════════════════════
-- SEQUENCES (seed data, canonical)
-- ═══════════════════════════════════════
CREATE TABLE sequences (
  id TEXT PRIMARY KEY,
  belt_level belt_level NOT NULL,
  sequence_number TEXT NOT NULL,
  step_order INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  sequence_part TEXT NOT NULL,
  expectation_standard TEXT,
  block_reference TEXT,
  pilar_reference TEXT,
  active_status BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_sequences_belt ON sequences(belt_level);
CREATE INDEX idx_sequences_sort ON sequences(sort_order, step_order);

-- ═══════════════════════════════════════
-- OCEAN RULES (seed data, non-negotiable)
-- ═══════════════════════════════════════
CREATE TABLE ocean_rules (
  id TEXT PRIMARY KEY,
  belt_level belt_level NOT NULL,
  ocean_condition ocean_condition NOT NULL,
  rule_state risk_state NOT NULL,
  coach_note TEXT,
  override_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  override_role_required coach_role,
  UNIQUE (belt_level, ocean_condition)
);

-- ═══════════════════════════════════════
-- STANDALONE SESSIONS (context only — no eval fields)
-- ═══════════════════════════════════════
CREATE TABLE standalone_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  student_id UUID NOT NULL REFERENCES students(id),

  -- Snapshots (frozen at creation)
  belt_level_snapshot belt_level,
  sequence_snapshot INT,
  step_snapshot INT,
  ocean_level_snapshot TEXT,

  -- Context
  training_venue TEXT,
  ocean_conditions ocean_condition,
  risk_state risk_state DEFAULT 'safe',
  is_safety_layer BOOLEAN NOT NULL DEFAULT FALSE,
  pilar pilar,
  pilar_part TEXT,
  drill_id TEXT REFERENCES drills(id),
  mission TEXT,
  execution_notes TEXT,
  duration_minutes INT,
  session_type TEXT NOT NULL DEFAULT 'Training',
  mental_hack TEXT,
  warm_up_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ss_coach ON standalone_sessions(coach_id);
CREATE INDEX idx_ss_student ON standalone_sessions(student_id);
CREATE INDEX idx_ss_date ON standalone_sessions(session_date DESC);

-- ═══════════════════════════════════════
-- CAMP TEMPLATES
-- ═══════════════════════════════════════
CREATE TABLE camp_templates (
  id TEXT PRIMARY KEY,
  template_name TEXT NOT NULL,
  level_name TEXT,
  duration_days INT,
  modality TEXT,
  delivery_model TEXT,
  description TEXT,
  active_status BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE camp_template_days (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES camp_templates(id),
  day_number INT NOT NULL,
  venue_default TEXT,
  ocean_condition_target TEXT,
  day_goal TEXT,
  day_notes TEXT,
  evaluation_focus TEXT
);

CREATE TABLE camp_template_blocks (
  id TEXT PRIMARY KEY,
  template_day_id TEXT NOT NULL REFERENCES camp_template_days(id),
  block_order INT NOT NULL,
  pilar pilar,
  is_safety_layer BOOLEAN NOT NULL DEFAULT FALSE,
  pilar_part TEXT,
  mission TEXT,
  drill_name TEXT,
  mission_time TEXT,
  repetitions_default INT,
  warm_up TEXT,
  simulation TEXT,
  mental_hack TEXT,
  evaluation_focus TEXT
);

-- ═══════════════════════════════════════
-- CAMP INSTANCES
-- ═══════════════════════════════════════
CREATE TABLE camp_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL REFERENCES camp_templates(id),
  camp_name TEXT NOT NULL,
  coach_id UUID NOT NULL REFERENCES coaches(id),
  start_date DATE,
  end_date DATE,
  modality camp_modality NOT NULL DEFAULT 'group',
  status camp_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE camp_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_instance_id UUID NOT NULL REFERENCES camp_instances(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id),
  enrollment_status enrollment_status NOT NULL DEFAULT 'active',
  notes TEXT,
  UNIQUE (camp_instance_id, student_id)
);

CREATE TABLE camp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_instance_id UUID NOT NULL REFERENCES camp_instances(id) ON DELETE CASCADE,
  template_day_id TEXT REFERENCES camp_template_days(id),
  day_number INT NOT NULL,
  session_date DATE,
  venue_actual TEXT,
  ocean_conditions_actual ocean_condition,
  common_notes TEXT,
  session_status camp_status NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- STUDENT SESSION RESULTS (THE critical table)
-- Unified: both standalone and camp results live here
-- ═══════════════════════════════════════
CREATE TABLE student_session_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_session_id UUID REFERENCES camp_sessions(id),
  standalone_session_id UUID REFERENCES standalone_sessions(id),
  student_id UUID NOT NULL REFERENCES students(id),

  -- Mandatory close fields (Canon: non-negotiable)
  status session_status,
  focus_rating INT CHECK (focus_rating BETWEEN 1 AND 5),
  frustration_rating INT CHECK (frustration_rating BETWEEN 1 AND 10),
  coach_feedback TEXT,
  achieved TEXT,
  whats_next TEXT,
  homework TEXT,

  -- Completion lifecycle
  completion_state completion_state NOT NULL DEFAULT 'closed',
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  survey_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  portal_token TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Must belong to either camp or standalone
  CHECK (camp_session_id IS NOT NULL OR standalone_session_id IS NOT NULL)
);

CREATE INDEX idx_ssr_student ON student_session_results(student_id);
CREATE INDEX idx_ssr_camp ON student_session_results(camp_session_id);
CREATE INDEX idx_ssr_standalone ON student_session_results(standalone_session_id);
CREATE INDEX idx_ssr_completion ON student_session_results(completion_state);

-- ═══════════════════════════════════════
-- SURVEY RESPONSES
-- ═══════════════════════════════════════
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_result_id UUID NOT NULL UNIQUE REFERENCES student_session_results(id),
  student_id UUID NOT NULL REFERENCES students(id),
  coach_rating INT CHECK (coach_rating BETWEEN 1 AND 5),
  q1_clarity INT CHECK (q1_clarity BETWEEN 1 AND 5),
  q2_feedback TEXT,
  q3_homework_clarity INT CHECK (q3_homework_clarity BETWEEN 1 AND 5),
  q4_session_value INT CHECK (q4_session_value BETWEEN 1 AND 5),
  open_comment TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- AUDIT LOG (append-only)
-- ═══════════════════════════════════════
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_result_id UUID,
  actor_type TEXT NOT NULL,
  actor_id UUID,
  actor_name TEXT,
  event_type TEXT NOT NULL,
  status_before TEXT,
  status_after TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_event ON audit_log(event_type);
CREATE INDEX idx_audit_date ON audit_log(created_at DESC);
