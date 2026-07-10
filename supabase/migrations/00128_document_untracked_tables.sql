-- 00128 — Document tables that exist in production but were never captured in
-- a migration file. These were created ad-hoc (dashboard / RPC) during earlier
-- work, so a fresh `supabase db reset` was missing them and the schema was not
-- reproducible from version control.
--
-- Every statement is idempotent (CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT
-- EXISTS), so applying this to the live database is a NO-OP — it only matters
-- when recreating the project from scratch. Column types/defaults were
-- reconstructed from the live PostgREST schema (2026-07-10).

-- ─────────────────────────────────────────────────────────────
-- cascade_sessions — the CASCADE (guided per-student) session flow
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cascade_sessions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id                 uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  student_id               uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  belt_level_snapshot      text NOT NULL,
  ocean_level_snapshot     text,
  training_venue           text NOT NULL,
  ocean_conditions         text,
  ocean_risk_state         text,
  session_type             text NOT NULL DEFAULT 'training',
  session_date             date NOT NULL DEFAULT CURRENT_DATE,
  pilar_part_id            uuid,
  pilar_id_snapshot        text,
  mission                  text,
  drill_id                 text,
  warm_up                  text,
  simulation               text,
  mental_hack              text,
  mission_time             text,
  repetitions              integer,
  status                   text,
  focus_rating             integer,
  frustration_rating       integer,
  composure_rating         integer,
  control_rating           integer,
  autonomy_rating          integer,
  linking_rating           integer,
  commitment_rating        integer,
  variety_rating           integer,
  precision_rating         integer,
  knowledge_rating         integer,
  integration_rating       integer,
  coach_feedback_quick     text,
  coach_feedback_text      text,
  achieved                 text,
  whats_next_pilar_part_id uuid,
  homework_cues            text[],
  homework_text            text,
  total_duration           text,
  incident_report          boolean DEFAULT false,
  incident_type            text,
  incident_description     text,
  incident_action_taken    text,
  completion_state         text DEFAULT 'draft',
  session_time             text,
  mission_type             text,
  assigned_by              uuid REFERENCES coaches(id) ON DELETE SET NULL,
  assigned_by_name         text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cascade_sessions_student ON cascade_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_cascade_sessions_coach ON cascade_sessions(coach_id);

-- ─────────────────────────────────────────────────────────────
-- self_training_sessions — the student's own logged practice ("Let's Play")
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS self_training_sessions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id               uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  warm_up                  text,
  drill_id                 text,
  drill_name               text,
  mental_hack              text,
  duration_minutes         integer,
  completed                boolean DEFAULT false,
  notes                    text,
  session_date             date DEFAULT CURRENT_DATE,
  venue_type               text,
  wave_conditions          text,
  wind                     text,
  tide                     text,
  crowd_level              text,
  safety_check             boolean DEFAULT false,
  venue_notes              text,
  linked_drill_mission_id  text,
  linked_step_id           text,
  focus_rating             integer,
  mission_completion       text,
  execution_rating         integer,
  reps_completed           integer,
  criteria_evaluation      jsonb,
  planned_duration_minutes integer,
  planned_reps             integer,
  intention_text           text,
  kind                     text NOT NULL DEFAULT 'drill',
  total_water_minutes      integer,
  flow_channel             integer,
  created_at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_self_training_student ON self_training_sessions(student_id);

-- ─────────────────────────────────────────────────────────────
-- camp_scheduled_evaluations — scheduled per-student progress checks in a camp
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS camp_scheduled_evaluations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_instance_id uuid NOT NULL REFERENCES camp_instances(id) ON DELETE CASCADE,
  student_id       uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  scheduled_day    integer NOT NULL,
  evaluation_type  text NOT NULL DEFAULT 'progress_check',
  completed        boolean DEFAULT false,
  completed_at     timestamptz,
  completed_by     uuid REFERENCES coaches(id) ON DELETE SET NULL,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_camp_sched_eval_camp ON camp_scheduled_evaluations(camp_instance_id);

-- ─────────────────────────────────────────────────────────────
-- camp_daily_feedback — lightweight per-day per-student feedback in a camp
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS camp_daily_feedback (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_instance_id uuid NOT NULL REFERENCES camp_instances(id) ON DELETE CASCADE,
  day_number       integer NOT NULL,
  student_id       uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  coach_id         uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  status           text DEFAULT 'attended',
  focus_rating     integer,
  effort_rating    integer,
  notes            text,
  highlights       text,
  areas_to_improve text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_camp_daily_feedback_camp ON camp_daily_feedback(camp_instance_id);

-- ─────────────────────────────────────────────────────────────
-- student_resource_grants — presentations granted to individual students
-- (mirrors coach_resource_grants; created 2026-07-10)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_resource_grants (
  student_id  uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES coach_resources(id) ON DELETE CASCADE,
  granted_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, resource_id)
);

-- ─────────────────────────────────────────────────────────────
-- belt_promotion_recommendations — when a coach whose certification is below
-- the target belt approves a graduation, the promotion is stored here as a
-- pending recommendation for a head coach / admin to confirm. (2026-07-10)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS belt_promotion_recommendations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  camp_instance_id    uuid REFERENCES camp_instances(id) ON DELETE SET NULL,
  recommended_belt    text NOT NULL,
  from_belt           text,
  recommended_by      uuid REFERENCES coaches(id) ON DELETE SET NULL,
  recommended_by_name text,
  coach_max_belt      text,
  status              text NOT NULL DEFAULT 'pending', -- pending | confirmed | rejected
  resolved_by         uuid REFERENCES coaches(id) ON DELETE SET NULL,
  resolved_at         timestamptz,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_belt_promo_pending
  ON belt_promotion_recommendations(status) WHERE status = 'pending';
