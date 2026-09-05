-- ═══════════════════════════════════════════════════════════════════════
-- SNAPSHOT COMPLETO DEL ESQUEMA DE PRODUCCIÓN — TSS BRAIN
-- Generado 2026-09-05 desde los catálogos de Postgres (pg_catalog /
-- information_schema) del proyecto cssewjefhnamconoyuso.
--
-- POR QUÉ EXISTE: de las 123 tablas, solo 78 nacieron en archivos de
-- migración del repo; el resto se creó directo en Supabase. Este archivo es
-- la fuente completa y reproducible del esquema tal como está HOY.
--
-- CÓMO USARLO: en un proyecto Supabase NUEVO y vacío, ejecutar este archivo
-- entero (SQL Editor o psql). Después ya no hace falta correr 00001..00184:
-- las migraciones siguientes (00185+) se aplican encima de esto.
-- NO ejecutar sobre la base de producción (todo ya existe ahí).
--
-- Contenido: 6 extensiones · 10 enums · 123 tablas · 24 funciones
-- propias · 508 constraints · 2 vistas · 149 índices · 18 triggers · RLS en
-- 123 tablas · 158 políticas · 5 buckets de storage.
-- Los datos NO están acá: viven en el backup semanal (scripts/backup.mjs).
-- Las funciones de la extensión btree_gist (188) no se listan: las crea
-- CREATE EXTENSION.
-- ═══════════════════════════════════════════════════════════════════════

SET check_function_bodies = off;

-- ── 1. Extensiones ──
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- ── 2. Tipos ──
CREATE TYPE public.belt_level AS ENUM ('white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt');
CREATE TYPE public.camp_modality AS ENUM ('individual', 'group');
CREATE TYPE public.camp_status AS ENUM ('draft', 'planned', 'active', 'completed', 'cancelled');
CREATE TYPE public.coach_role AS ENUM ('admin', 'coordinator', 'coach', 'assistant', 'head_coach', 'seller', 'host');
CREATE TYPE public.completion_state AS ENUM ('draft', 'in_progress', 'closed', 'survey_completed');
CREATE TYPE public.enrollment_status AS ENUM ('active', 'paused', 'completed', 'cancelled', 'removed');
CREATE TYPE public.ocean_condition AS ENUM ('flat', '1_2ft', '3_4ft', '4_6ft', '6_plus');
CREATE TYPE public.pilar AS ENUM ('technical', 'physical', 'tactical', 'mental');
CREATE TYPE public.risk_state AS ENUM ('safe', 'alert', 'blocked');
CREATE TYPE public.session_status AS ENUM ('not_yet', 'partial', 'competent', 'mastered');

-- ── 3. Tablas (columnas y defaults; constraints en la sección 5) ──
CREATE TABLE IF NOT EXISTS public.academies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  country text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_coordinator_id uuid,
  logo_url text,
  primary_color text,
  accent_color text,
  tagline text,
  emergency_numbers text,
  nearest_hospital text,
  lifeguard_contact text,
  emergency_address text,
  emergency_protocol text,
  emergency_updated_at timestamp with time zone,
  archived_at timestamp with time zone,
  monthly_sales_target_cents bigint
);

CREATE TABLE IF NOT EXISTS public.academy_course_prices (
  academy_id uuid NOT NULL,
  course_key text NOT NULL,
  price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD'::text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS public.academy_inventory_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL,
  category text NOT NULL,
  name text NOT NULL,
  unit text,
  qty_in_use integer DEFAULT 0,
  qty_in_stock integer DEFAULT 0,
  minimum integer,
  notes text,
  display_order integer DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS public.academy_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL,
  period_year integer NOT NULL,
  period_month integer NOT NULL,
  total_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD'::text,
  status text NOT NULL DEFAULT 'draft'::text,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  sent_at timestamp with time zone,
  paid_at timestamp with time zone,
  notes text
);

CREATE TABLE IF NOT EXISTS public.academy_spaces (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid,
  name text NOT NULL,
  space_type text,
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid,
  title text NOT NULL,
  description text,
  assignee_coach_id uuid,
  due_date date,
  status text NOT NULL DEFAULT 'open'::text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  done_at timestamp with time zone,
  done_by uuid,
  overdue_notified_at timestamp with time zone,
  overdue_emailed_at timestamp with time zone,
  recurrence text,
  checklist jsonb,
  link_url text,
  recurrence_days integer[]
);

CREATE TABLE IF NOT EXISTS public.academy_template_assignments (
  academy_id uuid NOT NULL,
  template_id text NOT NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.access_codes (
  code text NOT NULL,
  product_type text NOT NULL DEFAULT 'white_belt'::text,
  used_by uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  used_at timestamp with time zone,
  expires_at timestamp with time zone,
  notes text,
  academy_id uuid,
  batch_label text
);

CREATE TABLE IF NOT EXISTS public.admin_impersonations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_coach_id uuid NOT NULL,
  target_kind text NOT NULL,
  target_id uuid NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.athlete_competitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  name text NOT NULL,
  comp_date date NOT NULL,
  location text,
  category text,
  status text NOT NULL DEFAULT 'scheduled'::text,
  final_place text,
  final_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.athlete_diet_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  scope text NOT NULL,
  week_number integer,
  note_date date,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.athlete_heats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL,
  heat_number integer NOT NULL DEFAULT 1,
  round_name text,
  prep jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'upcoming'::text,
  passed boolean,
  what_worked text,
  what_to_improve text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.athlete_staff_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  video_url text,
  due_date date,
  done boolean NOT NULL DEFAULT false,
  done_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.athlete_team_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  author_coach_id uuid,
  author_student_id uuid,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_result_id uuid,
  actor_type text NOT NULL,
  actor_id uuid,
  actor_name text,
  event_type text NOT NULL,
  status_before text,
  status_after text,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.belt_promotion_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  camp_instance_id uuid,
  recommended_belt text NOT NULL,
  from_belt text,
  recommended_by uuid,
  recommended_by_name text,
  coach_max_belt text,
  status text NOT NULL DEFAULT 'pending'::text,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.board_clearance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  turtle_roll boolean NOT NULL DEFAULT false,
  crossing_prone boolean NOT NULL DEFAULT false,
  crossing_standing boolean NOT NULL DEFAULT false,
  safe_dismount boolean NOT NULL DEFAULT false,
  coach_sign_off boolean NOT NULL DEFAULT false,
  coach_id uuid,
  cleared_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.board_rentals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL,
  board_id uuid NOT NULL,
  renter_name text NOT NULL,
  renter_phone text,
  renter_email text,
  id_doc_path text,
  id_doc_type text,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date date,
  returned_at timestamp with time zone,
  price_total numeric,
  deposit numeric,
  currency text DEFAULT 'USD'::text,
  status text NOT NULL DEFAULT 'active'::text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  return_condition text,
  damage_type text,
  damage_notes text,
  waiver_signed boolean NOT NULL DEFAULT false,
  waiver_signed_at timestamp with time zone,
  signature_path text,
  waiver_text text
);

CREATE TABLE IF NOT EXISTS public.board_usages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL,
  camp_session_id uuid,
  session_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.boards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL,
  code text NOT NULL,
  board_type text,
  shape text,
  length_feet integer,
  length_inches integer,
  volume_liters text,
  status text NOT NULL DEFAULT 'available'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  brand text,
  model text,
  condition text NOT NULL DEFAULT 'good'::text
);

CREATE TABLE IF NOT EXISTS public.camp_daily_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_instance_id uuid NOT NULL,
  day_number integer NOT NULL,
  student_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  status text DEFAULT 'attended'::text,
  focus_rating integer,
  effort_rating integer,
  notes text,
  highlights text,
  areas_to_improve text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.camp_experience_surveys (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_instance_id uuid NOT NULL,
  student_id uuid NOT NULL,
  academy_id uuid,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  facilities_rating integer,
  equipment_rating integer,
  transport_rating integer,
  communication_rating integer,
  value_rating integer,
  nps integer,
  open_comment text,
  submitted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.camp_final_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_instance_id uuid,
  student_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  overall_rating integer,
  technical_progress text,
  tactical_progress text,
  mental_progress text,
  physical_progress text,
  sequence_recommendation integer,
  ocean_level_recommendation text,
  general_notes text,
  strengths text,
  areas_to_improve text,
  homework_for_after_camp text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  student_visible_note text,
  coach_private_note text,
  approved boolean,
  finalized_at timestamp with time zone,
  readiness_summary text
);

CREATE TABLE IF NOT EXISTS public.camp_instances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  template_id text NOT NULL,
  camp_name text NOT NULL,
  coach_id uuid,
  start_date date,
  end_date date,
  modality camp_modality NOT NULL DEFAULT 'group'::camp_modality,
  status camp_status NOT NULL DEFAULT 'draft'::camp_status,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  head_coach_id uuid,
  academy_id uuid,
  capacity_override integer,
  duration_override integer,
  scheduled_time text,
  head_coach_status text,
  head_coach_responded_at timestamp with time zone,
  head_coach_response_note text,
  head_coach_assigned_by uuid,
  reminder_sent_at timestamp with time zone,
  reminder_emailed_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.camp_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_instance_id uuid NOT NULL,
  student_id uuid NOT NULL,
  enrollment_status enrollment_status NOT NULL DEFAULT 'active'::enrollment_status,
  notes text,
  payment_status text,
  amount_cents integer,
  currency text DEFAULT 'USD'::text,
  payment_method text,
  sold_by uuid,
  is_refresher boolean NOT NULL DEFAULT false,
  reserved_at timestamp with time zone,
  paid_at timestamp with time zone,
  finalized_at timestamp with time zone,
  departed_on date,
  sale_type text,
  list_price_cents integer,
  discount_reason text,
  room_number text
);

CREATE TABLE IF NOT EXISTS public.camp_scheduled_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_instance_id uuid NOT NULL,
  student_id uuid NOT NULL,
  scheduled_day integer NOT NULL,
  evaluation_type text NOT NULL DEFAULT 'progress_check'::text,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  completed_by uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.camp_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_instance_id uuid NOT NULL,
  template_day_id text,
  day_number integer NOT NULL,
  session_date date,
  venue_actual text,
  ocean_conditions_actual ocean_condition,
  common_notes text,
  session_status camp_status NOT NULL DEFAULT 'planned'::camp_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  closure_reminded_on date
);

CREATE TABLE IF NOT EXISTS public.camp_student_customizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_instance_id uuid NOT NULL,
  student_id uuid NOT NULL,
  day_number integer NOT NULL,
  block_order integer NOT NULL,
  custom_drill_name text,
  custom_mission text,
  custom_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.camp_template_blocks (
  id text NOT NULL,
  template_day_id text NOT NULL,
  block_order integer NOT NULL,
  pilar pilar,
  is_safety_layer boolean NOT NULL DEFAULT false,
  pilar_part text,
  mission text,
  drill_name text,
  mission_time text,
  repetitions_default integer,
  warm_up text,
  simulation text,
  mental_hack text,
  evaluation_focus text,
  block_type text DEFAULT 'mission'::text,
  step_id text,
  drill_id text,
  drill_custom text,
  mission_id text,
  mission_custom text,
  explain_md text,
  demonstrate_md text,
  simulate_md text,
  feedback_md text,
  equipment text,
  activity_subtype text,
  step_ids text[]
);

CREATE TABLE IF NOT EXISTS public.camp_template_days (
  id text NOT NULL,
  template_id text NOT NULL,
  day_number integer NOT NULL,
  venue_default text,
  ocean_condition_target text,
  day_goal text,
  day_notes text,
  evaluation_focus text,
  has_evaluation boolean DEFAULT false,
  evaluation_type text
);

CREATE TABLE IF NOT EXISTS public.camp_templates (
  id text NOT NULL,
  template_name text NOT NULL,
  level_name text,
  duration_days integer,
  modality text,
  delivery_model text,
  description text,
  active_status boolean NOT NULL DEFAULT true,
  academy_id uuid,
  capacity_max integer,
  is_custom boolean NOT NULL DEFAULT false,
  service_kind text,
  includes_course_key text,
  session_duration_minutes integer,
  card_color text,
  accent_color text,
  list_price_cents integer,
  sales_deck_resource_id uuid,
  video_url text
);

CREATE TABLE IF NOT EXISTS public.cascade_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  student_id uuid NOT NULL,
  belt_level_snapshot text NOT NULL,
  ocean_level_snapshot text,
  training_venue text NOT NULL,
  ocean_conditions text,
  ocean_risk_state text,
  session_type text NOT NULL DEFAULT 'training'::text,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  pilar_part_id uuid,
  pilar_id_snapshot text,
  mission text,
  drill_id text,
  warm_up text,
  simulation text,
  mental_hack text,
  mission_time text,
  repetitions integer,
  status text,
  focus_rating integer,
  frustration_rating integer,
  composure_rating integer,
  control_rating integer,
  autonomy_rating integer,
  linking_rating integer,
  commitment_rating integer,
  variety_rating integer,
  precision_rating integer,
  knowledge_rating integer,
  integration_rating integer,
  coach_feedback_quick text,
  coach_feedback_text text,
  achieved text,
  whats_next_pilar_part_id uuid,
  homework_cues text[] DEFAULT '{}'::text[],
  homework_text text,
  total_duration text,
  incident_report boolean DEFAULT false,
  incident_type text,
  incident_description text,
  incident_action_taken text,
  completion_state text NOT NULL DEFAULT 'draft'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  session_time text,
  mission_type text,
  assigned_by uuid,
  assigned_by_name text
);

CREATE TABLE IF NOT EXISTS public.class_coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL,
  code text NOT NULL,
  percent_off integer NOT NULL DEFAULT 50,
  active boolean NOT NULL DEFAULT true,
  expires_on date,
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coach_certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid,
  certification_key text NOT NULL,
  certification_name text NOT NULL,
  granted_by uuid,
  granted_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coach_criterion_evals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  step_id text NOT NULL,
  drill_mission_id text,
  criterion_index integer NOT NULL,
  criterion_text text NOT NULL,
  result text NOT NULL,
  coach_id uuid,
  camp_instance_id uuid,
  evaluated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coach_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid,
  evaluated_by uuid,
  evaluation_date date DEFAULT CURRENT_DATE,
  technical_score integer,
  methodology_score integer,
  communication_score integer,
  consistency_score integer,
  overall_score integer,
  strengths text,
  areas_to_improve text,
  director_notes text,
  recommended_for_promotion boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coach_lesson_progress (
  coach_id uuid NOT NULL,
  lesson_id text NOT NULL,
  video_watched boolean DEFAULT false,
  content_read boolean DEFAULT false,
  quiz_score integer,
  quiz_attempts integer DEFAULT 0,
  form_response jsonb,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  started_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coach_pay_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid,
  level_name text NOT NULL,
  group_size integer NOT NULL,
  per_day_cents integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coach_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid,
  coach_id uuid,
  period_start date NOT NULL,
  period_end date NOT NULL,
  amount_cents integer NOT NULL,
  session_ids jsonb DEFAULT '[]'::jsonb,
  method text,
  note text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  staff_member_id uuid
);

CREATE TABLE IF NOT EXISTS public.coach_resource_grants (
  coach_id uuid NOT NULL,
  resource_id uuid NOT NULL,
  granted_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coach_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  kind text NOT NULL DEFAULT 'pdf'::text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  storage_path text,
  audience text NOT NULL DEFAULT 'both'::text,
  sort_order integer
);

CREATE TABLE IF NOT EXISTS public.coaches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid,
  first_name text NOT NULL,
  last_name text,
  display_name text NOT NULL,
  email text,
  phone text,
  role coach_role NOT NULL,
  max_belt_permission belt_level NOT NULL,
  certification_level text,
  active_status boolean NOT NULL DEFAULT true,
  languages text,
  specialty_area text,
  internal_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  photo_url text,
  academy_id uuid,
  is_platform_admin boolean NOT NULL DEFAULT false,
  portal_token uuid NOT NULL DEFAULT gen_random_uuid(),
  course_access_granted boolean NOT NULL DEFAULT false,
  date_of_birth date,
  gender text,
  nationality text,
  height text,
  weight text,
  allergies text,
  injuries text,
  medical_notes text,
  emergency_contact_name text,
  emergency_contact_phone text,
  waiver_signed boolean NOT NULL DEFAULT false,
  waiver_signed_at timestamp with time zone,
  intake_completed_at timestamp with time zone,
  other_certifications text,
  years_surfing integer,
  years_coaching integer,
  bio_short text,
  password_set_at timestamp with time zone,
  portal_category text NOT NULL DEFAULT 'coaching'::text,
  job_title text,
  portal_can_sell boolean NOT NULL DEFAULT false,
  waiver_version text,
  waiver_signature text,
  portal_can_coordinate boolean NOT NULL DEFAULT true,
  course_access_scope text NOT NULL DEFAULT 'full'::text,
  hp_escalon integer NOT NULL DEFAULT 0,
  hp_specialty text,
  portal_can_manage_boards boolean NOT NULL DEFAULT false,
  specialist_role text
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid,
  kind text NOT NULL,
  title text NOT NULL,
  body_md text,
  video_url text,
  event_at timestamp with time zone,
  event_link text,
  recording_url text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_reactions (
  post_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_reads (
  post_id uuid NOT NULL,
  student_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id text,
  drill_mission_id text,
  url text NOT NULL,
  label text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  step_id text,
  media_type text NOT NULL DEFAULT 'video'::text,
  caption text,
  template_day_id text
);

CREATE TABLE IF NOT EXISTS public.cost_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid,
  name text NOT NULL,
  category text,
  driver text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.course_final_quiz (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_key text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  question text NOT NULL,
  options jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_final_quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  course_key text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  passed boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_grants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  academy_id uuid,
  course_key text NOT NULL,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid,
  source text NOT NULL DEFAULT 'manual'::text,
  billable boolean NOT NULL DEFAULT true,
  price_cents integer,
  currency text,
  invoiced_in uuid,
  academy_id_at_grant uuid,
  revoked_at timestamp with time zone,
  revoked_by uuid,
  revoke_reason text
);

CREATE TABLE IF NOT EXISTS public.course_prices (
  course_key text NOT NULL,
  price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD'::text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS public.course_section_intros (
  section_key text NOT NULL,
  title text,
  video_url text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.drills (
  id text NOT NULL,
  drill_name text NOT NULL,
  related_pilar pilar,
  is_safety_layer boolean NOT NULL DEFAULT false,
  pilar_part text,
  sequence_part text,
  drill_type text,
  goal text,
  key_cue text,
  environment text,
  surf_level_min text,
  belt_level_range text,
  related_error text,
  related_solution text,
  notes text,
  ocean_conditions text,
  training_block text,
  active_status boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.drills_missions (
  id text NOT NULL,
  step_id text NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  time_estimate text,
  reps_recommended text,
  key_words text[] DEFAULT '{}'::text[],
  description_md text,
  success_criteria text[] DEFAULT '{}'::text[],
  belt text DEFAULT 'white'::text,
  block_number integer,
  block_name text,
  display_order integer,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  student_visible boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.dropdown_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text NOT NULL,
  value text NOT NULL,
  label text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS public.heat_waves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  heat_id uuid NOT NULL,
  wave_number integer NOT NULL,
  score numeric(4,2) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hp_athlete_links (
  student_id uuid NOT NULL,
  hp_profile_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hp_athlete_profiles (
  student_id uuid NOT NULL,
  score_capacity integer,
  injury text,
  injury_since date,
  height_cm numeric,
  weight_kg numeric,
  years_surfing integer,
  years_competing integer,
  events_per_year integer,
  discipline text,
  favorite_maneuver text,
  dominant_hand text,
  dominant_foot text,
  blood_type text,
  medications text,
  medical_history text,
  doctor_name text,
  doctor_phone text,
  insurance_provider text,
  insurance_number text,
  emergency_relationship text,
  emergency_phone_alt text,
  dui text,
  passport_number text,
  passport_issue_date date,
  passport_expiry_date date,
  birth_place text,
  civil_status text,
  club_academy text,
  sponsors text,
  palmares_historico text,
  why_train text,
  goal_short_term text,
  goal_mid_term text,
  goal_long_term text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hp_deep_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  coach_id uuid,
  eval_date date NOT NULL,
  event_name text,
  round_reached text,
  final_ranking text,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  diagnostico jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw jsonb,
  source_hp_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  eval_kind text NOT NULL DEFAULT 'competencia'::text
);

CREATE TABLE IF NOT EXISTS public.hp_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  sender_coach_id uuid,
  subject text,
  body text NOT NULL,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hp_session_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  present boolean NOT NULL DEFAULT true,
  note text
);

CREATE TABLE IF NOT EXISTS public.hp_team_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_date date NOT NULL,
  title text NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  session_time text,
  duration_minutes integer,
  location text,
  coach_id uuid,
  focus text,
  kind text
);

CREATE TABLE IF NOT EXISTS public.inventory_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid,
  item_id uuid,
  qty_in_use integer,
  qty_in_stock integer,
  note text,
  checked_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_requisitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid,
  created_by uuid,
  created_by_name text,
  status text NOT NULL DEFAULT 'open'::text,
  note text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.lesson_plan_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  multi_block_session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  order_index integer NOT NULL,
  step_id text,
  drill_id text,
  duration_minutes integer NOT NULL DEFAULT 15,
  objective_text text,
  status text,
  coach_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  student_id uuid NOT NULL,
  lesson_id text NOT NULL,
  video_watched boolean DEFAULT false,
  content_read boolean DEFAULT false,
  quiz_score integer,
  quiz_attempts integer DEFAULT 0,
  form_response jsonb,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  started_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  display_order integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id text NOT NULL,
  course_section text NOT NULL,
  step_number integer NOT NULL,
  title text NOT NULL,
  subtitle text,
  pillar text,
  description_md text,
  drill_md text,
  errors_md text,
  video_url text,
  cover_image_url text,
  estimated_minutes integer DEFAULT 15,
  prerequisites text[] DEFAULT '{}'::text[],
  lesson_type text DEFAULT 'reading'::text,
  display_order integer NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  pc_section_id text,
  pc_section_name text,
  pc_section_order integer,
  status_v1 text,
  is_test boolean DEFAULT false,
  wb_sequence_id text,
  wb_sequence_name text,
  wb_sequence_order integer,
  sequence_step_order integer,
  wb_sequence_promise text,
  coach_what_md text,
  coach_deliver_md text,
  coach_errors_md text,
  coach_validate_md text,
  linked_step_id text
);

CREATE TABLE IF NOT EXISTS public.level_quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  email text,
  phone text,
  belt text,
  score integer,
  skillmap jsonb,
  academy_id uuid,
  source text,
  attempt_number integer,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  academy_id uuid,
  source text NOT NULL,
  months integer NOT NULL DEFAULT 6,
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  ends_at timestamp with time zone NOT NULL,
  amount_cents integer,
  currency text DEFAULT 'USD'::text,
  status text NOT NULL DEFAULT 'active'::text,
  payment_method text,
  note text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  expiry_reminder_sent_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.method_docs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  area text NOT NULL,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'pdf'::text,
  storage_path text,
  url text,
  resource_id uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.method_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  area text NOT NULL,
  title text NOT NULL,
  detail text,
  status text NOT NULL DEFAULT 'pending'::text,
  doc_id uuid,
  sort_order integer,
  seeded boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.model_clips (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text NOT NULL,
  category_name text NOT NULL,
  title text NOT NULL,
  video_url text NOT NULL,
  storage_path text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  description text
);

CREATE TABLE IF NOT EXISTS public.multi_block_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  coach_id uuid,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  training_venue text,
  warm_up text,
  mental_hack text,
  notes_general text,
  total_planned_minutes integer DEFAULT 0,
  total_actual_minutes integer,
  completion_state text NOT NULL DEFAULT 'planned'::text,
  general_coach_feedback text,
  general_homework text,
  general_whats_next text,
  started_at timestamp with time zone,
  closed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipient_coach_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  metadata jsonb,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ocean_level_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  evaluated_by uuid NOT NULL,
  previous_level text,
  new_level text NOT NULL,
  method text NOT NULL DEFAULT 'coach_assessment'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ocean_rules (
  id text NOT NULL,
  belt_level belt_level NOT NULL,
  ocean_condition ocean_condition NOT NULL,
  rule_state risk_state NOT NULL,
  coach_note text,
  override_allowed boolean NOT NULL DEFAULT false,
  override_role_required coach_role
);

CREATE TABLE IF NOT EXISTS public.pilar_parts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  pilar_id text NOT NULL,
  description text,
  min_belt text NOT NULL DEFAULT 'white_belt'::text,
  max_belt text NOT NULL DEFAULT 'black_belt'::text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.program_appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'fisico'::text,
  title text,
  appointment_date date NOT NULL,
  appointment_time text,
  notes text,
  status text NOT NULL DEFAULT 'scheduled'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  mode text,
  location text
);

CREATE TABLE IF NOT EXISTS public.program_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL,
  student_id uuid NOT NULL,
  assigned_by text,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  coach_id uuid
);

CREATE TABLE IF NOT EXISTS public.program_block_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  belt text,
  pillar text,
  step_ref text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_hp_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.program_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  checkin_date date NOT NULL,
  water_glasses integer,
  sleep_hours numeric(3,1),
  energy integer,
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nutrition text,
  surf_hours numeric(4,1),
  focus integer,
  goal_achieved text,
  nutrition_clean text
);

CREATE TABLE IF NOT EXISTS public.program_day_marks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  day_id uuid NOT NULL,
  done_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.program_days (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL,
  week_number integer NOT NULL,
  day_number integer NOT NULL,
  title text NOT NULL,
  focus text,
  notes text,
  modality text
);

CREATE TABLE IF NOT EXISTS public.program_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  pillar text NOT NULL,
  score integer,
  notes text,
  eval_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.program_item_marks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  item_id uuid NOT NULL,
  marked_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.program_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL,
  title text NOT NULL,
  detail text,
  video_url text,
  display_order integer NOT NULL DEFAULT 0,
  duration_minutes integer,
  step_id text,
  drill_id text,
  pillar text
);

CREATE TABLE IF NOT EXISTS public.program_video_library (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  pillar text,
  video_url text NOT NULL,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.programs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  kind text NOT NULL DEFAULT 'template'::text,
  weeks integer NOT NULL DEFAULT 1,
  checkin_water boolean NOT NULL DEFAULT true,
  checkin_sleep boolean NOT NULL DEFAULT true,
  checkin_energy boolean NOT NULL DEFAULT true,
  checkin_comment boolean NOT NULL DEFAULT true,
  for_sale boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  week_labels jsonb NOT NULL DEFAULT '{}'::jsonb,
  checkin_nutrition boolean NOT NULL DEFAULT true,
  author_coach_id uuid,
  week_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  target_belt text
);

CREATE TABLE IF NOT EXISTS public.rating_scales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  scale_name text NOT NULL,
  label text NOT NULL,
  description text,
  min_belt text NOT NULL DEFAULT 'white_belt'::text,
  max_belt text NOT NULL DEFAULT 'black_belt'::text,
  min_value integer NOT NULL DEFAULT 1,
  max_value integer NOT NULL DEFAULT 5,
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.refresher_charges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  academy_id uuid,
  course_key text NOT NULL,
  camp_instance_id uuid,
  price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD'::text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.season_contributions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  video_url text,
  detail text,
  target_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.season_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'otro'::text,
  event_date date NOT NULL,
  is_peak boolean NOT NULL DEFAULT false,
  end_date date,
  notes text
);

CREATE TABLE IF NOT EXISTS public.season_phases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL,
  name text NOT NULL,
  objective text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  color_key text NOT NULL DEFAULT 'general'::text,
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.season_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  title text NOT NULL,
  objective text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  head_coach_id uuid
);

CREATE TABLE IF NOT EXISTS public.season_specialists (
  season_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.self_training_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  warm_up text,
  drill_id text,
  drill_name text,
  mental_hack text,
  duration_minutes integer,
  completed boolean DEFAULT false,
  notes text,
  session_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  venue_type text,
  wave_conditions text,
  wind text,
  tide text,
  crowd_level text,
  safety_check boolean DEFAULT false,
  venue_notes text,
  linked_drill_mission_id text,
  linked_step_id text,
  focus_rating integer,
  mission_completion text,
  execution_rating integer,
  reps_completed integer,
  criteria_evaluation jsonb,
  planned_duration_minutes integer,
  planned_reps integer,
  intention_text text,
  kind text NOT NULL DEFAULT 'drill'::text,
  total_water_minutes integer,
  flow_channel integer,
  automaticity text,
  training_mode text,
  linked_sequence_id text,
  sequence_rating integer,
  step_marks jsonb
);

CREATE TABLE IF NOT EXISTS public.sequence_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  evaluated_by uuid NOT NULL,
  sequence_number integer NOT NULL,
  step_number integer NOT NULL,
  previous_sequence integer,
  previous_step integer,
  evaluation_type text NOT NULL DEFAULT 'progression'::text,
  status text NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sequences (
  id text NOT NULL,
  belt_level belt_level NOT NULL,
  sequence_number text NOT NULL,
  step_order integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  sequence_part text NOT NULL,
  expectation_standard text,
  block_reference text,
  pilar_reference text,
  active_status boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.service_plan_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_instance_id uuid NOT NULL,
  student_id uuid NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  step_id text,
  land_drill_id text,
  land_drill_custom text,
  water_drill_id text,
  water_drill_custom text,
  objective_text text,
  notes_pre text,
  status text,
  notes_post text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  camp_session_id uuid,
  board_type text,
  board_size_feet integer,
  board_size_inches integer,
  focus_level integer,
  flow_channel integer,
  whats_next text,
  board_id uuid,
  day_objective_status text,
  step_ids text[]
);

CREATE TABLE IF NOT EXISTS public.service_plans (
  camp_instance_id uuid NOT NULL,
  venue_analysis text,
  venue_go_no_go text,
  venue_wave_size text,
  venue_wind text,
  venue_tide text,
  venue_hazards text,
  warm_up_drill_id text,
  warm_up_custom text,
  mental_hack text,
  notes_general text,
  completion_state text NOT NULL DEFAULT 'planned'::text,
  started_at timestamp with time zone,
  closed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_session_id uuid,
  venue_crowd text,
  venue_water_temp text,
  venue_sky text,
  class_start_time text,
  surf_venue text,
  transport_needed boolean,
  transport_depart text,
  transport_return text,
  transport_status text,
  transport_actual_depart text,
  transport_actual_return text
);

CREATE TABLE IF NOT EXISTS public.service_staff (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_instance_id uuid NOT NULL,
  role text NOT NULL,
  coach_id uuid,
  staff_member_id uuid,
  status text NOT NULL DEFAULT 'invited'::text,
  response_token uuid NOT NULL DEFAULT gen_random_uuid(),
  response_note text,
  responded_at timestamp with time zone,
  invited_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session_incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid,
  coach_id uuid,
  student_id uuid,
  student_name text,
  camp_instance_id uuid,
  incident_type text NOT NULL,
  description text,
  action_taken text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  acknowledged_at timestamp with time zone,
  acknowledged_by uuid
);

CREATE TABLE IF NOT EXISTS public.session_missions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  standalone_session_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 1,
  pilar_part text,
  pilar text,
  drill_id text,
  mission text NOT NULL,
  warm_up text,
  simulation text,
  mental_hack text,
  mission_time text,
  repetitions integer,
  status text,
  focus_rating integer,
  coach_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.space_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL,
  academy_id uuid,
  coach_id uuid,
  title text,
  camp_instance_id uuid,
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'booked'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid,
  name text NOT NULL,
  email text,
  phone text,
  role text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.standalone_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_date timestamp with time zone NOT NULL DEFAULT now(),
  coach_id uuid NOT NULL,
  student_id uuid NOT NULL,
  belt_level_snapshot belt_level,
  sequence_snapshot integer,
  step_snapshot integer,
  ocean_level_snapshot text,
  training_venue text,
  ocean_conditions ocean_condition,
  risk_state risk_state DEFAULT 'safe'::risk_state,
  is_safety_layer boolean NOT NULL DEFAULT false,
  pilar pilar,
  pilar_part text,
  drill_id text,
  mission text,
  execution_notes text,
  duration_minutes integer,
  session_type text NOT NULL DEFAULT 'Training'::text,
  mental_hack text,
  warm_up_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  simulation text,
  mission_time text,
  repetitions integer
);

CREATE TABLE IF NOT EXISTS public.student_level_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  access_type text NOT NULL DEFAULT 'level'::text,
  level_key text NOT NULL,
  source text NOT NULL DEFAULT 'admin_grant'::text,
  granted_by uuid,
  access_code text,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_resource_grants (
  student_id uuid NOT NULL,
  resource_id uuid NOT NULL,
  granted_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_sequence_ratings (
  student_id uuid NOT NULL,
  sequence_id text NOT NULL,
  current_rating integer,
  rating_count integer NOT NULL DEFAULT 0,
  held_back_step_id text,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_session_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  camp_session_id uuid,
  standalone_session_id uuid,
  student_id uuid NOT NULL,
  status text,
  focus_rating integer,
  frustration_rating integer,
  coach_feedback text,
  achieved text,
  whats_next text,
  homework text,
  completion_state text NOT NULL DEFAULT 'closed'::completion_state,
  email_sent boolean NOT NULL DEFAULT false,
  email_sent_at timestamp with time zone,
  survey_unlocked boolean NOT NULL DEFAULT false,
  portal_token text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  internal_notes text,
  video_link text,
  incident_type text,
  incident_description text,
  incident_action text,
  student_visible_summary text,
  coach_id uuid,
  cascade_session_id uuid,
  duration_minutes integer,
  multi_block_session_id uuid,
  feedback_token uuid DEFAULT gen_random_uuid(),
  mission text
);

CREATE TABLE IF NOT EXISTS public.student_solo_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  venue_name text,
  ocean_condition_notes text,
  drill_id text,
  mission text,
  duration_minutes integer,
  achieved boolean,
  focus_rating integer,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_step_ratings (
  student_id uuid NOT NULL,
  step_id text NOT NULL,
  current_rating integer,
  rating_count integer DEFAULT 1,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  coach_rating integer,
  coach_rated_at timestamp with time zone,
  coach_rated_by uuid
);

CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  age integer,
  gender text,
  nationality text,
  status text NOT NULL DEFAULT 'active'::text,
  photo_url text,
  portal_token text DEFAULT (gen_random_uuid())::text,
  belt_level belt_level NOT NULL DEFAULT 'white_belt'::belt_level,
  current_sequence_number integer NOT NULL DEFAULT 1,
  current_step_order integer NOT NULL DEFAULT 1,
  ocean_level text DEFAULT 'Assisted'::text,
  progression_status text,
  emergency_contact_name text,
  emergency_contact_phone text,
  allergies text,
  injuries text,
  medical_notes text,
  swim_level text,
  risk_notes text,
  primary_goal text,
  current_focus_area text,
  coach_notes_general text,
  last_session_id uuid,
  last_session_date timestamp with time zone,
  last_session_mission text,
  last_session_pilar text,
  last_session_drill text,
  last_session_status text,
  last_homework text,
  next_recommended_focus text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  date_of_birth date,
  weight text,
  height text,
  shirt_size text,
  stance text,
  board_type text,
  favorite_wave_size text,
  surf_experience_years text,
  surf_frequency text,
  other_sports text,
  learning_style text,
  goal_short_term text,
  goal_mid_term text,
  goal_long_term text,
  biggest_barrier text,
  fears_phobias text,
  evaluation_score integer,
  instagram text,
  how_did_you_hear text,
  returning_student boolean DEFAULT false,
  waiver_signed boolean DEFAULT false,
  languages text,
  intake_completed_at timestamp with time zone,
  student_path text,
  age_group text,
  board_clearance_hardtop boolean DEFAULT false,
  waiver_signed_at timestamp with time zone,
  waiver_signed_by text,
  surf_experience text,
  intake_tier text DEFAULT 'none'::text,
  course_access_white boolean DEFAULT false,
  signup_code text,
  personal_goal text,
  goofy_or_regular text,
  pre_course_completed_at timestamp with time zone,
  white_belt_completed_at timestamp with time zone,
  ocean_quiz_answers jsonb,
  ocean_quiz_score jsonb,
  ocean_quiz_completed_at timestamp with time zone,
  ocean_level_provisional boolean DEFAULT false,
  learning_profile_primary text,
  learning_profile_secondary text,
  learning_profile_scores jsonb,
  learning_profile_completed_at timestamp with time zone,
  academy_id uuid,
  pending_courses text[] NOT NULL DEFAULT '{}'::text[],
  course_access_yellow boolean NOT NULL DEFAULT false,
  active_course_key text NOT NULL DEFAULT 'white_belt'::text,
  lifecycle_status text NOT NULL DEFAULT 'lead'::text,
  promoted_to_member_at timestamp with time zone,
  pin_hash text,
  pin_set_at timestamp with time zone,
  current_session_id uuid,
  current_session_started_at timestamp with time zone,
  last_session_kicked_at timestamp with time zone,
  session_kick_count integer NOT NULL DEFAULT 0,
  board_familiarity text,
  water_comfort text,
  comfort_wave_size text,
  maneuvers_current text[],
  surf_injuries text,
  surf_self_level text,
  board_length_feet text,
  board_length_inches text,
  board_volume_liters text,
  belt_provisional boolean DEFAULT false,
  level_quiz_score integer,
  level_quiz_skillmap jsonb,
  level_quiz_completed_at timestamp with time zone,
  student_type text DEFAULT 'member'::text,
  course_access_blue boolean NOT NULL DEFAULT false,
  blue_belt_completed_at timestamp with time zone,
  prior_visits integer NOT NULL DEFAULT 0,
  media_release_consent boolean,
  waiver_version text,
  course_access_purple boolean NOT NULL DEFAULT false,
  course_access_brown boolean NOT NULL DEFAULT false,
  course_access_black boolean NOT NULL DEFAULT false,
  belt_promoted_at timestamp with time zone,
  belt_promoted_from text,
  nickname text,
  hp_access boolean NOT NULL DEFAULT false,
  hp_access_granted_at timestamp with time zone,
  hp_access_granted_by uuid,
  coach_id uuid,
  level_quiz_v2 jsonb,
  health_data_consent_at timestamp with time zone,
  media_release_consent_at timestamp with time zone,
  terms_accepted_at timestamp with time zone,
  terms_version text,
  consent_ip text,
  consent_user_agent text,
  guardian_name text,
  guardian_relationship text,
  anonymized_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_result_id uuid NOT NULL,
  student_id uuid NOT NULL,
  coach_rating integer,
  q1_clarity integer,
  q3_homework_clarity integer,
  q4_session_value integer,
  open_comment text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  academy_rating integer,
  session_quality integer,
  q2_feedback integer,
  flow_channel integer
);

CREATE TABLE IF NOT EXISTS public.task_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  academy_id uuid,
  outcome text NOT NULL,
  comment text,
  checklist_state jsonb,
  completed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.template_cost_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  template_id text NOT NULL,
  cost_rate_id uuid NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  override_cents integer,
  qty numeric NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.tide_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  spot text NOT NULL DEFAULT 'la_libertad'::text,
  event_date date NOT NULL,
  event_time time without time zone NOT NULL,
  event_type text NOT NULL,
  height_m numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tool_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  tool text NOT NULL DEFAULT 'venue-scout'::text,
  opens integer NOT NULL DEFAULT 1,
  devices integer NOT NULL DEFAULT 1,
  first_seen timestamp with time zone NOT NULL DEFAULT now(),
  last_seen timestamp with time zone NOT NULL DEFAULT now(),
  converted_academy_id uuid,
  converted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.water_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  test_key text NOT NULL,
  target_level text NOT NULL,
  passed boolean NOT NULL,
  measured numeric,
  conditions text,
  notes text,
  tested_by uuid,
  tested_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.week_template_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  week_template_id uuid NOT NULL,
  weekday smallint NOT NULL,
  service_template_id text NOT NULL,
  scheduled_time text,
  default_head_coach_id uuid,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.week_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  active_status boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.weekly_rankings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  week_end date NOT NULL,
  rankings jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ── 4. Funciones propias ──
CREATE OR REPLACE FUNCTION public.current_coach_academy_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT academy_id FROM coaches WHERE auth_user_id = auth.uid() LIMIT 1
$function$
;
CREATE OR REPLACE FUNCTION public.current_coach_is_platform_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT is_platform_admin FROM coaches WHERE auth_user_id = auth.uid() LIMIT 1),
    false
  )
$function$
;
CREATE OR REPLACE FUNCTION public.generate_access_code(p_product_type text DEFAULT 'white_belt'::text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  new_code TEXT;
  prefix TEXT;
  attempts INTEGER := 0;
BEGIN
  prefix := CASE p_product_type
    WHEN 'white_belt' THEN 'TSS-WB-'
    WHEN 'yellow_belt' THEN 'TSS-YB-'
    WHEN 'blue_belt' THEN 'TSS-BB-'
    WHEN 'one_wave' THEN 'TSS-OW-'
    ELSE 'TSS-XX-'
  END;
  LOOP
    new_code := prefix ||
      UPPER(SUBSTRING(MD5(random()::TEXT) FROM 1 FOR 4)) || '-' ||
      UPPER(SUBSTRING(MD5(random()::TEXT) FROM 1 FOR 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM access_codes WHERE code = new_code);
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique access code';
    END IF;
  END LOOP;
  RETURN new_code;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_drills_for_belt(p_belt_key text)
 RETURNS SETOF drills
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT * FROM drills WHERE active_status = true ORDER BY drill_name;
$function$
;
CREATE OR REPLACE FUNCTION public.get_pilar_parts_for_belt(p_belt_key text)
 RETURNS TABLE(id uuid, pilar text, part_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT 
    pp.id,
    INITCAP(pp.pilar_id) AS pilar,
    pp.name AS part_name
  FROM pilar_parts pp
  WHERE pp.active = TRUE
    AND pp.pilar_id != 'safety'
    AND (
      CASE p_belt_key
        WHEN 'white_belt' THEN 0
        WHEN 'yellow_belt' THEN 1
        WHEN 'blue_belt' THEN 2
        WHEN 'purple_belt' THEN 3
        WHEN 'brown_belt' THEN 4
        WHEN 'black_belt' THEN 5
        ELSE 0
      END
    ) BETWEEN (
      CASE pp.min_belt
        WHEN 'white_belt' THEN 0
        WHEN 'yellow_belt' THEN 1
        WHEN 'blue_belt' THEN 2
        WHEN 'purple_belt' THEN 3
        WHEN 'brown_belt' THEN 4
        WHEN 'black_belt' THEN 5
        ELSE 0
      END
    ) AND (
      CASE pp.max_belt
        WHEN 'white_belt' THEN 0
        WHEN 'yellow_belt' THEN 1
        WHEN 'blue_belt' THEN 2
        WHEN 'purple_belt' THEN 3
        WHEN 'brown_belt' THEN 4
        WHEN 'black_belt' THEN 5
        ELSE 5
      END
    )
  ORDER BY pp.pilar_id, pp.display_order;
$function$
;
CREATE OR REPLACE FUNCTION public.get_student_unlocked_belts(p_student_id uuid)
 RETURNS text[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT ARRAY_AGG(level_key)
  FROM student_level_access
  WHERE student_id = p_student_id
    AND active = TRUE
    AND access_type = 'level'
    AND (expires_at IS NULL OR expires_at > NOW());
$function$
;
CREATE OR REPLACE FUNCTION public.grant_level_access(p_student_id uuid, p_level_key text, p_access_type text DEFAULT 'level'::text, p_source text DEFAULT 'admin_grant'::text, p_granted_by uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO student_level_access (
    student_id, access_type, level_key, source, granted_by, notes, active
  ) VALUES (
    p_student_id, p_access_type, p_level_key, p_source, p_granted_by, p_notes, TRUE
  )
  ON CONFLICT (student_id, access_type, level_key)
  DO UPDATE SET
    active = TRUE,
    source = EXCLUDED.source,
    granted_by = EXCLUDED.granted_by,
    notes = COALESCE(EXCLUDED.notes, student_level_access.notes),
    updated_at = NOW()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.hp_search_students(term text)
 RETURNS TABLE(id uuid, first_name text, last_name text, nickname text, email text, belt_level text)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT s.id, s.first_name, s.last_name, s.nickname, s.email, s.belt_level::text
  FROM students s
  WHERE s.status = 'active'
    AND (
      extensions.unaccent(lower(coalesce(s.first_name,'') || ' ' || coalesce(s.last_name,''))) LIKE '%' || extensions.unaccent(lower(term)) || '%'
      OR extensions.unaccent(lower(coalesce(s.nickname,''))) LIKE '%' || extensions.unaccent(lower(term)) || '%'
      OR lower(coalesce(s.email,'')) LIKE '%' || lower(term) || '%'
    )
  ORDER BY (
    -- Los atletas HP primero: son a quienes se busca desde el cockpit.
    SELECT count(*) FROM program_assignments pa WHERE pa.student_id = s.id AND pa.status = 'active'
  ) DESC, s.first_name
  LIMIT 8;
$function$
;
CREATE OR REPLACE FUNCTION public.map_belt_name(raw text)
 RETURNS belt_level
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN CASE
    WHEN raw ILIKE '%blanca%' OR raw ILIKE '%white%' OR raw ILIKE '%beginner%'
      THEN 'white_belt'::belt_level
    WHEN raw ILIKE '%amarilla%' OR raw ILIKE '%yellow%' OR raw ILIKE '%novice%' OR raw ILIKE '%novato%'
      THEN 'yellow_belt'::belt_level
    WHEN raw ILIKE '%azul%' OR raw ILIKE '%blue%' OR raw ILIKE '%foundation%'
      THEN 'blue_belt'::belt_level
    WHEN raw ILIKE '%morada%' OR raw ILIKE '%purple%' OR raw ILIKE '%emerging%'
      THEN 'purple_belt'::belt_level
    WHEN raw ILIKE '%caf%' OR raw ILIKE '%brown%' OR raw ILIKE '%pre-elite%'
      THEN 'brown_belt'::belt_level
    WHEN raw ILIKE '%negra%' OR raw ILIKE '%black%' OR raw ILIKE '%elite%'
      THEN 'black_belt'::belt_level
    ELSE 'white_belt'::belt_level
  END;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.map_ocean_condition(raw text)
 RETURNS ocean_condition
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN CASE
    WHEN raw ILIKE '%flat%' THEN 'flat'::ocean_condition
    WHEN raw ILIKE '%1-2%' OR raw ILIKE '%1_2%' THEN '1_2ft'::ocean_condition
    WHEN raw ILIKE '%3-4%' OR raw ILIKE '%3_4%' THEN '3_4ft'::ocean_condition
    WHEN raw ILIKE '%4-6%' OR raw ILIKE '%4_6%' THEN '4_6ft'::ocean_condition
    WHEN raw ILIKE '%6+%' OR raw ILIKE '%6_plus%' OR raw ILIKE '%6 plus%' THEN '6_plus'::ocean_condition
    ELSE 'flat'::ocean_condition
  END;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.map_pilar(raw text)
 RETURNS pilar
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN CASE
    WHEN raw ILIKE '%technical%' THEN 'technical'::pilar
    WHEN raw ILIKE '%physical%' THEN 'physical'::pilar
    WHEN raw ILIKE '%tactical%' THEN 'tactical'::pilar
    WHEN raw ILIKE '%mental%' THEN 'mental'::pilar
    ELSE NULL
  END;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.notify_overdue_tasks()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  t record;
  n integer := 0;
BEGIN
  FOR t IN
    SELECT id, title, due_date, assignee_coach_id, created_by
    FROM academy_tasks
    WHERE status = 'open'
      AND due_date IS NOT NULL
      AND due_date < current_date
      AND overdue_notified_at IS NULL
  LOOP
    IF t.assignee_coach_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_coach_id, type, title, body, metadata)
      VALUES (t.assignee_coach_id, 'task_overdue',
              'Overdue task: ' || t.title,
              'This task was due ' || to_char(t.due_date, 'Mon DD') || ' and is still open.',
              jsonb_build_object('taskId', t.id));
    END IF;
    IF t.created_by IS NOT NULL AND t.created_by IS DISTINCT FROM t.assignee_coach_id THEN
      INSERT INTO notifications (recipient_coach_id, type, title, body, metadata)
      VALUES (t.created_by, 'task_overdue',
              'Task overdue: ' || t.title,
              'Assigned task past its due date (' || to_char(t.due_date, 'Mon DD') || ') and still open.',
              jsonb_build_object('taskId', t.id));
    END IF;
    UPDATE academy_tasks SET overdue_notified_at = now() WHERE id = t.id;
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.notify_upcoming_services()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  s record;
  n integer := 0;
  pcount integer;
  when_txt text;
BEGIN
  FOR s IN
    SELECT id, camp_name, start_date, scheduled_time, head_coach_id, coach_id
    FROM camp_instances
    WHERE start_date = current_date + 1
      AND COALESCE(status, 'planned') NOT IN ('cancelled', 'completed')
      AND reminder_sent_at IS NULL
  LOOP
    SELECT count(*) INTO pcount FROM camp_participants
      WHERE camp_instance_id = s.id AND enrollment_status = 'active';
    when_txt := 'Tomorrow'
      || CASE WHEN s.scheduled_time IS NOT NULL THEN ' at ' || to_char(s.scheduled_time, 'HH12:MI AM') ELSE '' END
      || ' · ' || pcount || ' student' || CASE WHEN pcount = 1 THEN '' ELSE 's' END;
    IF s.head_coach_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_coach_id, type, title, body, metadata)
      VALUES (s.head_coach_id, 'service_reminder',
              'Reminder: ' || s.camp_name,
              when_txt, jsonb_build_object('campId', s.id));
    END IF;
    IF s.coach_id IS NOT NULL AND s.coach_id IS DISTINCT FROM s.head_coach_id THEN
      INSERT INTO notifications (recipient_coach_id, type, title, body, metadata)
      VALUES (s.coach_id, 'service_reminder',
              'Reminder: ' || s.camp_name,
              when_txt, jsonb_build_object('campId', s.id));
    END IF;
    UPDATE camp_instances SET reminder_sent_at = now() WHERE id = s.id;
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.save_cascade_session(p_coach_id uuid, p_student_id uuid, p_belt_level_snapshot text, p_ocean_level_snapshot text, p_training_venue text, p_ocean_conditions text, p_ocean_risk_state text, p_session_type text, p_session_date text, p_session_time text, p_pilar_part_id uuid, p_pilar_id_snapshot text, p_mission_type text, p_mission text, p_drill_id text, p_warm_up text, p_simulation text, p_mental_hack text, p_mission_time text, p_repetitions integer, p_status text, p_focus_rating integer, p_frustration_rating integer, p_composure_rating integer, p_control_rating integer, p_autonomy_rating integer, p_linking_rating integer, p_commitment_rating integer, p_variety_rating integer, p_precision_rating integer, p_knowledge_rating integer, p_integration_rating integer, p_coach_feedback_quick text, p_coach_feedback_text text, p_achieved text, p_whats_next_pilar_part_id uuid, p_homework_cues text[], p_homework_text text, p_total_duration text, p_incident_report boolean, p_incident_type text, p_incident_description text, p_incident_action_taken text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_session_id uuid;
BEGIN
  INSERT INTO cascade_sessions (
    coach_id, student_id, belt_level_snapshot, ocean_level_snapshot,
    training_venue, ocean_conditions, ocean_risk_state,
    session_type, session_date, session_time,
    pilar_part_id, pilar_id_snapshot, mission_type, mission,
    drill_id, warm_up, simulation, mental_hack,
    mission_time, repetitions,
    status, focus_rating,
    frustration_rating, composure_rating, control_rating,
    autonomy_rating, linking_rating, commitment_rating,
    variety_rating, precision_rating, knowledge_rating, integration_rating,
    coach_feedback_quick, coach_feedback_text,
    achieved, whats_next_pilar_part_id,
    homework_cues, homework_text,
    total_duration,
    incident_report, incident_type, incident_description, incident_action_taken,
    completion_state
  )
  VALUES (
    p_coach_id, p_student_id, p_belt_level_snapshot, p_ocean_level_snapshot,
    p_training_venue, p_ocean_conditions, p_ocean_risk_state,
    p_session_type, p_session_date, p_session_time,
    p_pilar_part_id, p_pilar_id_snapshot, p_mission_type, p_mission,
    p_drill_id, p_warm_up, p_simulation, p_mental_hack,
    p_mission_time, p_repetitions,
    p_status, p_focus_rating,
    p_frustration_rating, p_composure_rating, p_control_rating,
    p_autonomy_rating, p_linking_rating, p_commitment_rating,
    p_variety_rating, p_precision_rating, p_knowledge_rating, p_integration_rating,
    p_coach_feedback_quick, p_coach_feedback_text,
    p_achieved, p_whats_next_pilar_part_id,
    p_homework_cues, p_homework_text,
    p_total_duration,
    p_incident_report, p_incident_type, p_incident_description, p_incident_action_taken,
    'closed'
  )
  RETURNING id INTO v_session_id;
  -- Update student continuity fields
  UPDATE students SET
    last_session_date = p_session_date::timestamptz,
    last_session_mission = p_mission,
    last_session_pilar = p_pilar_id_snapshot,
    last_session_status = p_status,
    last_homework = COALESCE(
      CASE WHEN array_length(p_homework_cues, 1) > 0
        THEN array_to_string(p_homework_cues, ', ')
        ELSE NULL
      END,
      p_homework_text
    ),
    next_recommended_focus = (
      SELECT pp.name FROM pilar_parts pp WHERE pp.id = p_whats_next_pilar_part_id
    )
  WHERE id = p_student_id;
  RETURN v_session_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.student_next_lesson(p_student_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  next_id TEXT;
BEGIN
  SELECT l.id INTO next_id
  FROM lessons l
  LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = p_student_id
  WHERE l.active = true
    AND (lp.completed IS NULL OR lp.completed = false)
  ORDER BY l.display_order ASC
  LIMIT 1;
  RETURN next_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.student_pre_course_complete(p_student_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  total_pc INTEGER;
  completed_pc INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_pc
  FROM lessons
  WHERE course_section IN ('pre_course_fundamentals', 'pre_course_values')
    AND active = true;
  SELECT COUNT(*) INTO completed_pc
  FROM lesson_progress lp
  JOIN lessons l ON l.id = lp.lesson_id
  WHERE lp.student_id = p_student_id
    AND lp.completed = true
    AND l.course_section IN ('pre_course_fundamentals', 'pre_course_values');
  RETURN total_pc > 0 AND completed_pc >= total_pc;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.touch_service_plans_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$
;
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_academies_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_content_videos_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_lesson_plan_block_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_lesson_progress_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_step_rating_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.last_updated := now();
  NEW.rating_count := COALESCE(OLD.rating_count, 0) + 1;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_student_profile_on_close(p_student_id uuid, p_session_result_id uuid, p_session_date timestamp with time zone, p_mission text, p_pilar pilar, p_status session_status, p_homework text, p_whats_next text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  UPDATE students SET
    last_session_id = p_session_result_id,
    last_session_date = p_session_date,
    last_session_mission = p_mission,
    last_session_pilar = p_pilar,
    last_session_status = p_status,
    last_homework = p_homework,
    next_recommended_focus = p_whats_next
  WHERE id = p_student_id;
END;
$function$
;

-- ── 5. Constraints (PK → UNIQUE → CHECK → FK) ──
ALTER TABLE public.academies ADD CONSTRAINT academies_pkey PRIMARY KEY (id);
ALTER TABLE public.academy_course_prices ADD CONSTRAINT academy_course_prices_pkey PRIMARY KEY (academy_id, course_key);
ALTER TABLE public.academy_inventory_items ADD CONSTRAINT academy_inventory_items_pkey PRIMARY KEY (id);
ALTER TABLE public.academy_invoices ADD CONSTRAINT academy_invoices_pkey PRIMARY KEY (id);
ALTER TABLE public.academy_spaces ADD CONSTRAINT academy_spaces_pkey PRIMARY KEY (id);
ALTER TABLE public.academy_tasks ADD CONSTRAINT academy_tasks_pkey PRIMARY KEY (id);
ALTER TABLE public.academy_template_assignments ADD CONSTRAINT academy_template_assignments_pkey PRIMARY KEY (academy_id, template_id);
ALTER TABLE public.access_codes ADD CONSTRAINT access_codes_pkey PRIMARY KEY (code);
ALTER TABLE public.admin_impersonations ADD CONSTRAINT admin_impersonations_pkey PRIMARY KEY (id);
ALTER TABLE public.athlete_competitions ADD CONSTRAINT athlete_competitions_pkey PRIMARY KEY (id);
ALTER TABLE public.athlete_diet_notes ADD CONSTRAINT athlete_diet_notes_pkey PRIMARY KEY (id);
ALTER TABLE public.athlete_heats ADD CONSTRAINT athlete_heats_pkey PRIMARY KEY (id);
ALTER TABLE public.athlete_staff_tasks ADD CONSTRAINT athlete_staff_tasks_pkey PRIMARY KEY (id);
ALTER TABLE public.athlete_team_posts ADD CONSTRAINT athlete_team_posts_pkey PRIMARY KEY (id);
ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);
ALTER TABLE public.belt_promotion_recommendations ADD CONSTRAINT belt_promotion_recommendations_pkey PRIMARY KEY (id);
ALTER TABLE public.board_clearance ADD CONSTRAINT board_clearance_pkey PRIMARY KEY (id);
ALTER TABLE public.board_rentals ADD CONSTRAINT board_rentals_pkey PRIMARY KEY (id);
ALTER TABLE public.board_usages ADD CONSTRAINT board_usages_pkey PRIMARY KEY (id);
ALTER TABLE public.boards ADD CONSTRAINT boards_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_daily_feedback ADD CONSTRAINT camp_daily_feedback_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_final_evaluations ADD CONSTRAINT camp_final_evaluations_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_instances ADD CONSTRAINT camp_instances_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_participants ADD CONSTRAINT camp_participants_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_scheduled_evaluations ADD CONSTRAINT camp_scheduled_evaluations_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_sessions ADD CONSTRAINT camp_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_student_customizations ADD CONSTRAINT camp_student_customizations_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_template_blocks ADD CONSTRAINT camp_template_blocks_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_template_days ADD CONSTRAINT camp_template_days_pkey PRIMARY KEY (id);
ALTER TABLE public.camp_templates ADD CONSTRAINT camp_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.class_coupons ADD CONSTRAINT class_coupons_pkey PRIMARY KEY (id);
ALTER TABLE public.coach_certifications ADD CONSTRAINT coach_certifications_pkey PRIMARY KEY (id);
ALTER TABLE public.coach_criterion_evals ADD CONSTRAINT coach_criterion_evals_pkey PRIMARY KEY (id);
ALTER TABLE public.coach_evaluations ADD CONSTRAINT coach_evaluations_pkey PRIMARY KEY (id);
ALTER TABLE public.coach_lesson_progress ADD CONSTRAINT coach_lesson_progress_pkey PRIMARY KEY (coach_id, lesson_id);
ALTER TABLE public.coach_pay_rates ADD CONSTRAINT coach_pay_rates_pkey PRIMARY KEY (id);
ALTER TABLE public.coach_payments ADD CONSTRAINT coach_payments_pkey PRIMARY KEY (id);
ALTER TABLE public.coach_resource_grants ADD CONSTRAINT coach_resource_grants_pkey PRIMARY KEY (coach_id, resource_id);
ALTER TABLE public.coach_resources ADD CONSTRAINT coach_resources_pkey PRIMARY KEY (id);
ALTER TABLE public.coaches ADD CONSTRAINT coaches_pkey PRIMARY KEY (id);
ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_pkey PRIMARY KEY (id);
ALTER TABLE public.community_reactions ADD CONSTRAINT community_reactions_pkey PRIMARY KEY (post_id, student_id);
ALTER TABLE public.community_reads ADD CONSTRAINT community_reads_pkey PRIMARY KEY (post_id, student_id);
ALTER TABLE public.content_videos ADD CONSTRAINT content_videos_pkey PRIMARY KEY (id);
ALTER TABLE public.cost_rates ADD CONSTRAINT cost_rates_pkey PRIMARY KEY (id);
ALTER TABLE public.course_final_quiz ADD CONSTRAINT course_final_quiz_pkey PRIMARY KEY (id);
ALTER TABLE public.course_final_quiz_attempts ADD CONSTRAINT course_final_quiz_attempts_pkey PRIMARY KEY (id);
ALTER TABLE public.course_grants ADD CONSTRAINT course_grants_pkey PRIMARY KEY (id);
ALTER TABLE public.course_prices ADD CONSTRAINT course_prices_pkey PRIMARY KEY (course_key);
ALTER TABLE public.course_section_intros ADD CONSTRAINT course_section_intros_pkey PRIMARY KEY (section_key);
ALTER TABLE public.drills ADD CONSTRAINT drills_pkey PRIMARY KEY (id);
ALTER TABLE public.drills_missions ADD CONSTRAINT drills_missions_pkey PRIMARY KEY (id);
ALTER TABLE public.dropdown_options ADD CONSTRAINT dropdown_options_pkey PRIMARY KEY (id);
ALTER TABLE public.heat_waves ADD CONSTRAINT heat_waves_pkey PRIMARY KEY (id);
ALTER TABLE public.hp_athlete_links ADD CONSTRAINT hp_athlete_links_pkey PRIMARY KEY (student_id, hp_profile_id);
ALTER TABLE public.hp_athlete_profiles ADD CONSTRAINT hp_athlete_profiles_pkey PRIMARY KEY (student_id);
ALTER TABLE public.hp_deep_evaluations ADD CONSTRAINT hp_deep_evaluations_pkey PRIMARY KEY (id);
ALTER TABLE public.hp_messages ADD CONSTRAINT hp_messages_pkey PRIMARY KEY (id);
ALTER TABLE public.hp_session_attendance ADD CONSTRAINT hp_session_attendance_pkey PRIMARY KEY (id);
ALTER TABLE public.hp_team_sessions ADD CONSTRAINT hp_team_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_checks ADD CONSTRAINT inventory_checks_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_requisitions ADD CONSTRAINT inventory_requisitions_pkey PRIMARY KEY (id);
ALTER TABLE public.lesson_plan_blocks ADD CONSTRAINT lesson_plan_blocks_pkey PRIMARY KEY (id);
ALTER TABLE public.lesson_progress ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (student_id, lesson_id);
ALTER TABLE public.lesson_quizzes ADD CONSTRAINT lesson_quizzes_pkey PRIMARY KEY (id);
ALTER TABLE public.lessons ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);
ALTER TABLE public.level_quiz_attempts ADD CONSTRAINT level_quiz_attempts_pkey PRIMARY KEY (id);
ALTER TABLE public.memberships ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);
ALTER TABLE public.method_docs ADD CONSTRAINT method_docs_pkey PRIMARY KEY (id);
ALTER TABLE public.method_tasks ADD CONSTRAINT method_tasks_pkey PRIMARY KEY (id);
ALTER TABLE public.model_clips ADD CONSTRAINT model_clips_pkey PRIMARY KEY (id);
ALTER TABLE public.multi_block_sessions ADD CONSTRAINT multi_block_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE public.ocean_level_evaluations ADD CONSTRAINT ocean_level_evaluations_pkey PRIMARY KEY (id);
ALTER TABLE public.ocean_rules ADD CONSTRAINT ocean_rules_pkey PRIMARY KEY (id);
ALTER TABLE public.pilar_parts ADD CONSTRAINT pilar_parts_pkey PRIMARY KEY (id);
ALTER TABLE public.program_appointments ADD CONSTRAINT program_appointments_pkey PRIMARY KEY (id);
ALTER TABLE public.program_assignments ADD CONSTRAINT program_assignments_pkey PRIMARY KEY (id);
ALTER TABLE public.program_block_templates ADD CONSTRAINT program_block_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.program_checkins ADD CONSTRAINT program_checkins_pkey PRIMARY KEY (id);
ALTER TABLE public.program_day_marks ADD CONSTRAINT program_day_marks_pkey PRIMARY KEY (id);
ALTER TABLE public.program_days ADD CONSTRAINT program_days_pkey PRIMARY KEY (id);
ALTER TABLE public.program_evaluations ADD CONSTRAINT program_evaluations_pkey PRIMARY KEY (id);
ALTER TABLE public.program_item_marks ADD CONSTRAINT program_item_marks_pkey PRIMARY KEY (id);
ALTER TABLE public.program_items ADD CONSTRAINT program_items_pkey PRIMARY KEY (id);
ALTER TABLE public.program_video_library ADD CONSTRAINT program_video_library_pkey PRIMARY KEY (id);
ALTER TABLE public.programs ADD CONSTRAINT programs_pkey PRIMARY KEY (id);
ALTER TABLE public.rating_scales ADD CONSTRAINT rating_scales_pkey PRIMARY KEY (id);
ALTER TABLE public.refresher_charges ADD CONSTRAINT refresher_charges_pkey PRIMARY KEY (id);
ALTER TABLE public.season_contributions ADD CONSTRAINT season_contributions_pkey PRIMARY KEY (id);
ALTER TABLE public.season_events ADD CONSTRAINT season_events_pkey PRIMARY KEY (id);
ALTER TABLE public.season_phases ADD CONSTRAINT season_phases_pkey PRIMARY KEY (id);
ALTER TABLE public.season_plans ADD CONSTRAINT season_plans_pkey PRIMARY KEY (id);
ALTER TABLE public.season_specialists ADD CONSTRAINT season_specialists_pkey PRIMARY KEY (season_id, coach_id);
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.sequence_evaluations ADD CONSTRAINT sequence_evaluations_pkey PRIMARY KEY (id);
ALTER TABLE public.sequences ADD CONSTRAINT sequences_pkey PRIMARY KEY (id);
ALTER TABLE public.service_plan_blocks ADD CONSTRAINT service_plan_blocks_pkey PRIMARY KEY (id);
ALTER TABLE public.service_plans ADD CONSTRAINT service_plans_pkey PRIMARY KEY (id);
ALTER TABLE public.service_staff ADD CONSTRAINT service_staff_pkey PRIMARY KEY (id);
ALTER TABLE public.session_incidents ADD CONSTRAINT session_incidents_pkey PRIMARY KEY (id);
ALTER TABLE public.session_missions ADD CONSTRAINT session_missions_pkey PRIMARY KEY (id);
ALTER TABLE public.space_bookings ADD CONSTRAINT space_bookings_pkey PRIMARY KEY (id);
ALTER TABLE public.staff_members ADD CONSTRAINT staff_members_pkey PRIMARY KEY (id);
ALTER TABLE public.standalone_sessions ADD CONSTRAINT standalone_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.student_level_access ADD CONSTRAINT student_level_access_pkey PRIMARY KEY (id);
ALTER TABLE public.student_resource_grants ADD CONSTRAINT student_resource_grants_pkey PRIMARY KEY (student_id, resource_id);
ALTER TABLE public.student_sequence_ratings ADD CONSTRAINT student_sequence_ratings_pkey PRIMARY KEY (student_id, sequence_id);
ALTER TABLE public.student_session_results ADD CONSTRAINT student_session_results_pkey PRIMARY KEY (id);
ALTER TABLE public.student_solo_sessions ADD CONSTRAINT student_solo_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.student_step_ratings ADD CONSTRAINT student_step_ratings_pkey PRIMARY KEY (student_id, step_id);
ALTER TABLE public.students ADD CONSTRAINT students_pkey PRIMARY KEY (id);
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_pkey PRIMARY KEY (id);
ALTER TABLE public.task_completions ADD CONSTRAINT task_completions_pkey PRIMARY KEY (id);
ALTER TABLE public.template_cost_items ADD CONSTRAINT template_cost_items_pkey PRIMARY KEY (id);
ALTER TABLE public.tide_events ADD CONSTRAINT tide_events_pkey PRIMARY KEY (id);
ALTER TABLE public.tool_leads ADD CONSTRAINT tool_leads_pkey PRIMARY KEY (id);
ALTER TABLE public.water_tests ADD CONSTRAINT water_tests_pkey PRIMARY KEY (id);
ALTER TABLE public.week_template_slots ADD CONSTRAINT week_template_slots_pkey PRIMARY KEY (id);
ALTER TABLE public.week_templates ADD CONSTRAINT week_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.weekly_rankings ADD CONSTRAINT weekly_rankings_pkey PRIMARY KEY (id);
ALTER TABLE public.academies ADD CONSTRAINT academies_slug_key UNIQUE (slug);
ALTER TABLE public.academy_invoices ADD CONSTRAINT academy_invoices_academy_id_period_year_period_month_key UNIQUE (academy_id, period_year, period_month);
ALTER TABLE public.board_clearance ADD CONSTRAINT board_clearance_student_id_key UNIQUE (student_id);
ALTER TABLE public.board_usages ADD CONSTRAINT board_usages_board_id_camp_session_id_key UNIQUE (board_id, camp_session_id);
ALTER TABLE public.boards ADD CONSTRAINT boards_academy_id_code_key UNIQUE (academy_id, code);
ALTER TABLE public.camp_daily_feedback ADD CONSTRAINT camp_daily_feedback_camp_instance_id_day_number_student_id_key UNIQUE (camp_instance_id, day_number, student_id);
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_camp_instance_id_student_id_key UNIQUE (camp_instance_id, student_id);
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_token_key UNIQUE (token);
ALTER TABLE public.camp_final_evaluations ADD CONSTRAINT camp_final_evaluations_camp_instance_id_student_id_key UNIQUE (camp_instance_id, student_id);
ALTER TABLE public.camp_participants ADD CONSTRAINT camp_participants_camp_instance_id_student_id_key UNIQUE (camp_instance_id, student_id);
ALTER TABLE public.camp_scheduled_evaluations ADD CONSTRAINT camp_scheduled_evaluations_camp_instance_id_student_id_sche_key UNIQUE (camp_instance_id, student_id, scheduled_day, evaluation_type);
ALTER TABLE public.camp_student_customizations ADD CONSTRAINT camp_student_customizations_camp_instance_id_student_id_day_key UNIQUE (camp_instance_id, student_id, day_number, block_order);
ALTER TABLE public.class_coupons ADD CONSTRAINT class_coupons_academy_id_code_key UNIQUE (academy_id, code);
ALTER TABLE public.coach_pay_rates ADD CONSTRAINT coach_pay_rates_academy_id_level_name_group_size_key UNIQUE (academy_id, level_name, group_size);
ALTER TABLE public.coaches ADD CONSTRAINT coaches_auth_user_id_key UNIQUE (auth_user_id);
ALTER TABLE public.coaches ADD CONSTRAINT coaches_portal_token_key UNIQUE (portal_token);
ALTER TABLE public.dropdown_options ADD CONSTRAINT dropdown_options_category_value_key UNIQUE (category, value);
ALTER TABLE public.heat_waves ADD CONSTRAINT heat_waves_heat_id_wave_number_key UNIQUE (heat_id, wave_number);
ALTER TABLE public.hp_athlete_links ADD CONSTRAINT hp_athlete_links_hp_profile_id_key UNIQUE (hp_profile_id);
ALTER TABLE public.hp_session_attendance ADD CONSTRAINT hp_session_attendance_session_id_student_id_key UNIQUE (session_id, student_id);
ALTER TABLE public.ocean_rules ADD CONSTRAINT ocean_rules_belt_level_ocean_condition_key UNIQUE (belt_level, ocean_condition);
ALTER TABLE public.program_checkins ADD CONSTRAINT program_checkins_assignment_id_checkin_date_key UNIQUE (assignment_id, checkin_date);
ALTER TABLE public.program_day_marks ADD CONSTRAINT program_day_marks_assignment_id_day_id_key UNIQUE (assignment_id, day_id);
ALTER TABLE public.program_days ADD CONSTRAINT program_days_program_id_week_number_day_number_key UNIQUE (program_id, week_number, day_number);
ALTER TABLE public.program_item_marks ADD CONSTRAINT program_item_marks_assignment_id_item_id_key UNIQUE (assignment_id, item_id);
ALTER TABLE public.rating_scales ADD CONSTRAINT rating_scales_scale_name_key UNIQUE (scale_name);
ALTER TABLE public.refresher_charges ADD CONSTRAINT refresher_charges_student_id_camp_instance_id_course_key_key UNIQUE (student_id, camp_instance_id, course_key);
ALTER TABLE public.student_level_access ADD CONSTRAINT student_level_access_student_id_access_type_level_key_key UNIQUE (student_id, access_type, level_key);
ALTER TABLE public.student_session_results ADD CONSTRAINT student_session_results_feedback_token_key UNIQUE (feedback_token);
ALTER TABLE public.students ADD CONSTRAINT students_portal_token_key UNIQUE (portal_token);
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_session_result_id_key UNIQUE (session_result_id);
ALTER TABLE public.template_cost_items ADD CONSTRAINT template_cost_items_template_id_cost_rate_id_key UNIQUE (template_id, cost_rate_id);
ALTER TABLE public.tide_events ADD CONSTRAINT tide_events_spot_event_date_event_time_key UNIQUE (spot, event_date, event_time);
ALTER TABLE public.tool_leads ADD CONSTRAINT tool_leads_email_tool_key UNIQUE (email, tool);
ALTER TABLE public.weekly_rankings ADD CONSTRAINT weekly_rankings_week_start_key UNIQUE (week_start);
ALTER TABLE public.academies ADD CONSTRAINT academies_accent_color_check CHECK (((accent_color IS NULL) OR (accent_color ~ '^#[0-9A-Fa-f]{6}$'::text)));
ALTER TABLE public.academies ADD CONSTRAINT academies_primary_color_check CHECK (((primary_color IS NULL) OR (primary_color ~ '^#[0-9A-Fa-f]{6}$'::text)));
ALTER TABLE public.academy_course_prices ADD CONSTRAINT academy_course_prices_price_cents_check CHECK ((price_cents >= 0));
ALTER TABLE public.academy_invoices ADD CONSTRAINT academy_invoices_period_month_check CHECK (((period_month >= 1) AND (period_month <= 12)));
ALTER TABLE public.academy_invoices ADD CONSTRAINT academy_invoices_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'cancelled'::text])));
ALTER TABLE public.admin_impersonations ADD CONSTRAINT admin_impersonations_target_kind_check CHECK ((target_kind = ANY (ARRAY['student'::text, 'coach'::text, 'coordinator'::text])));
ALTER TABLE public.athlete_competitions ADD CONSTRAINT athlete_competitions_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'live'::text, 'finished'::text])));
ALTER TABLE public.athlete_diet_notes ADD CONSTRAINT athlete_diet_notes_check CHECK ((((scope = 'micro'::text) AND (week_number IS NOT NULL)) OR ((scope = 'day'::text) AND (note_date IS NOT NULL))));
ALTER TABLE public.athlete_diet_notes ADD CONSTRAINT athlete_diet_notes_scope_check CHECK ((scope = ANY (ARRAY['micro'::text, 'day'::text])));
ALTER TABLE public.athlete_heats ADD CONSTRAINT athlete_heats_status_check CHECK ((status = ANY (ARRAY['upcoming'::text, 'done'::text])));
ALTER TABLE public.athlete_staff_tasks ADD CONSTRAINT athlete_staff_tasks_kind_check CHECK ((kind = ANY (ARRAY['fisico'::text, 'mental'::text, 'tecnico'::text, 'nutricion'::text, 'otro'::text])));
ALTER TABLE public.athlete_team_posts ADD CONSTRAINT athlete_team_posts_check CHECK (((author_coach_id IS NOT NULL) OR (author_student_id IS NOT NULL)));
ALTER TABLE public.board_rentals ADD CONSTRAINT board_rentals_return_condition_check CHECK ((return_condition = ANY (ARRAY['good'::text, 'repair'::text, 'totaled'::text])));
ALTER TABLE public.board_rentals ADD CONSTRAINT board_rentals_status_check CHECK ((status = ANY (ARRAY['active'::text, 'returned'::text, 'overdue'::text, 'cancelled'::text])));
ALTER TABLE public.camp_daily_feedback ADD CONSTRAINT camp_daily_feedback_effort_rating_check CHECK (((effort_rating >= 1) AND (effort_rating <= 5)));
ALTER TABLE public.camp_daily_feedback ADD CONSTRAINT camp_daily_feedback_focus_rating_check CHECK (((focus_rating >= 1) AND (focus_rating <= 5)));
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_communication_rating_check CHECK (((communication_rating >= 1) AND (communication_rating <= 5)));
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_equipment_rating_check CHECK (((equipment_rating >= 1) AND (equipment_rating <= 5)));
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_facilities_rating_check CHECK (((facilities_rating >= 1) AND (facilities_rating <= 5)));
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_nps_check CHECK (((nps >= 0) AND (nps <= 10)));
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_transport_rating_check CHECK (((transport_rating >= 1) AND (transport_rating <= 5)));
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_value_rating_check CHECK (((value_rating >= 1) AND (value_rating <= 5)));
ALTER TABLE public.camp_final_evaluations ADD CONSTRAINT camp_final_evaluations_overall_rating_check CHECK (((overall_rating >= 1) AND (overall_rating <= 5)));
ALTER TABLE public.camp_templates ADD CONSTRAINT camp_templates_includes_course_key_check CHECK (((includes_course_key IS NULL) OR (includes_course_key = ANY (ARRAY['white_belt'::text, 'yellow_belt'::text, 'blue_belt'::text, 'purple_belt'::text]))));
ALTER TABLE public.camp_templates ADD CONSTRAINT camp_templates_service_kind_check CHECK ((service_kind = ANY (ARRAY['surf_camp'::text, 'surf_lesson'::text, 'custom'::text, 'class'::text, 'trip'::text])));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_autonomy_rating_check CHECK (((autonomy_rating >= 1) AND (autonomy_rating <= 5)));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_commitment_rating_check CHECK (((commitment_rating >= 1) AND (commitment_rating <= 5)));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_completion_state_check CHECK ((completion_state = ANY (ARRAY['draft'::text, 'closed'::text])));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_composure_rating_check CHECK (((composure_rating >= 1) AND (composure_rating <= 5)));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_control_rating_check CHECK (((control_rating >= 1) AND (control_rating <= 5)));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_focus_rating_check CHECK (((focus_rating >= 1) AND (focus_rating <= 5)));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_frustration_rating_check CHECK (((frustration_rating >= 1) AND (frustration_rating <= 5)));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_integration_rating_check CHECK (((integration_rating >= 1) AND (integration_rating <= 5)));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_knowledge_rating_check CHECK (((knowledge_rating >= 1) AND (knowledge_rating <= 5)));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_linking_rating_check CHECK (((linking_rating >= 1) AND (linking_rating <= 5)));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_ocean_risk_state_check CHECK ((ocean_risk_state = ANY (ARRAY['allowed'::text, 'caution'::text, 'blocked'::text])));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_precision_rating_check CHECK (((precision_rating >= 1) AND (precision_rating <= 5)));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_status_check CHECK ((status = ANY (ARRAY['not_achieved'::text, 'partial'::text, 'competent'::text, 'mastered'::text])));
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_variety_rating_check CHECK (((variety_rating >= 1) AND (variety_rating <= 5)));
ALTER TABLE public.class_coupons ADD CONSTRAINT class_coupons_percent_off_check CHECK (((percent_off >= 1) AND (percent_off <= 100)));
ALTER TABLE public.coach_criterion_evals ADD CONSTRAINT coach_criterion_evals_result_check CHECK ((result = ANY (ARRAY['met'::text, 'partial'::text, 'not_met'::text])));
ALTER TABLE public.coach_evaluations ADD CONSTRAINT coach_evaluations_communication_score_check CHECK (((communication_score >= 1) AND (communication_score <= 10)));
ALTER TABLE public.coach_evaluations ADD CONSTRAINT coach_evaluations_consistency_score_check CHECK (((consistency_score >= 1) AND (consistency_score <= 10)));
ALTER TABLE public.coach_evaluations ADD CONSTRAINT coach_evaluations_methodology_score_check CHECK (((methodology_score >= 1) AND (methodology_score <= 10)));
ALTER TABLE public.coach_evaluations ADD CONSTRAINT coach_evaluations_overall_score_check CHECK (((overall_score >= 1) AND (overall_score <= 10)));
ALTER TABLE public.coach_evaluations ADD CONSTRAINT coach_evaluations_technical_score_check CHECK (((technical_score >= 1) AND (technical_score <= 10)));
ALTER TABLE public.coaches ADD CONSTRAINT coaches_hp_escalon_check CHECK (((hp_escalon >= 0) AND (hp_escalon <= 3)));
ALTER TABLE public.coaches ADD CONSTRAINT coaches_hp_specialty_check CHECK ((hp_specialty = ANY (ARRAY['mental'::text, 'fisico'::text, 'nutricion'::text])));
ALTER TABLE public.coaches ADD CONSTRAINT coaches_portal_category_chk CHECK ((portal_category = ANY (ARRAY['coaching'::text, 'support'::text, 'manager'::text])));
ALTER TABLE public.coaches ADD CONSTRAINT coaches_specialist_role_check CHECK (((specialist_role IS NULL) OR (specialist_role = ANY (ARRAY['psicologo'::text, 'fisico'::text, 'nutricionista'::text]))));
ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_kind_check CHECK ((kind = ANY (ARRAY['note'::text, 'video'::text, 'live'::text, 'seminar'::text])));
ALTER TABLE public.content_videos ADD CONSTRAINT content_videos_media_type_check CHECK ((media_type = ANY (ARRAY['video'::text, 'image'::text, 'diagram'::text, 'document'::text])));
ALTER TABLE public.content_videos ADD CONSTRAINT content_videos_one_parent_chk CHECK (((((((lesson_id IS NOT NULL))::integer + ((drill_mission_id IS NOT NULL))::integer) + ((step_id IS NOT NULL))::integer) + ((template_day_id IS NOT NULL))::integer) = 1));
ALTER TABLE public.drills_missions ADD CONSTRAINT drills_missions_type_check CHECK ((type = ANY (ARRAY['drill'::text, 'mission'::text])));
ALTER TABLE public.heat_waves ADD CONSTRAINT heat_waves_score_check CHECK (((score >= (0)::numeric) AND (score <= (10)::numeric)));
ALTER TABLE public.hp_deep_evaluations ADD CONSTRAINT hp_deep_evaluations_eval_kind_check CHECK ((eval_kind = ANY (ARRAY['competencia'::text, 'general'::text])));
ALTER TABLE public.hp_team_sessions ADD CONSTRAINT hp_team_sessions_duration_check CHECK (((duration_minutes IS NULL) OR ((duration_minutes > 0) AND (duration_minutes <= 600))));
ALTER TABLE public.hp_team_sessions ADD CONSTRAINT hp_team_sessions_kind_check CHECK (((kind IS NULL) OR (kind = ANY (ARRAY['agua'::text, 'tierra'::text, 'gym'::text, 'skate'::text, 'video'::text, 'mixto'::text]))));
ALTER TABLE public.lesson_plan_blocks ADD CONSTRAINT lesson_plan_blocks_duration_minutes_check CHECK (((duration_minutes >= 1) AND (duration_minutes <= 240)));
ALTER TABLE public.lesson_plan_blocks ADD CONSTRAINT lesson_plan_blocks_status_check CHECK (((status IS NULL) OR (status = ANY (ARRAY['achieved'::text, 'partial'::text, 'not_yet'::text]))));
ALTER TABLE public.lessons ADD CONSTRAINT lessons_status_v1_check CHECK (((status_v1 IS NULL) OR (status_v1 = ANY (ARRAY['PRODUCTIZED'::text, 'PROPOSED'::text]))));
ALTER TABLE public.method_docs ADD CONSTRAINT method_docs_kind_check CHECK ((kind = ANY (ARRAY['pdf'::text, 'image'::text, 'link'::text, 'note'::text, 'resource'::text])));
ALTER TABLE public.method_tasks ADD CONSTRAINT method_tasks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'done'::text])));
ALTER TABLE public.multi_block_sessions ADD CONSTRAINT multi_block_sessions_completion_state_check CHECK ((completion_state = ANY (ARRAY['planned'::text, 'in_progress'::text, 'closed'::text])));
ALTER TABLE public.pilar_parts ADD CONSTRAINT pilar_parts_pilar_id_check CHECK ((pilar_id = ANY (ARRAY['technical'::text, 'tactical'::text, 'mental'::text, 'physical'::text, 'safety'::text])));
ALTER TABLE public.program_appointments ADD CONSTRAINT program_appointments_kind_check CHECK ((kind = ANY (ARRAY['fisico'::text, 'mental'::text, 'tecnico'::text, 'nutricion'::text, 'evaluacion'::text, 'otro'::text])));
ALTER TABLE public.program_appointments ADD CONSTRAINT program_appointments_mode_check CHECK ((mode = ANY (ARRAY['online'::text, 'presencial'::text])));
ALTER TABLE public.program_appointments ADD CONSTRAINT program_appointments_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'done'::text, 'cancelled'::text])));
ALTER TABLE public.program_assignments ADD CONSTRAINT program_assignments_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text])));
ALTER TABLE public.program_checkins ADD CONSTRAINT program_checkins_energy_check CHECK (((energy >= 1) AND (energy <= 4)));
ALTER TABLE public.program_checkins ADD CONSTRAINT program_checkins_focus_check CHECK (((focus IS NULL) OR ((focus >= 1) AND (focus <= 4))));
ALTER TABLE public.program_checkins ADD CONSTRAINT program_checkins_goal_achieved_check CHECK (((goal_achieved IS NULL) OR (goal_achieved = ANY (ARRAY['si'::text, 'parcial'::text, 'no'::text]))));
ALTER TABLE public.program_checkins ADD CONSTRAINT program_checkins_nutrition_clean_check CHECK ((nutrition_clean = ANY (ARRAY['si'::text, 'parcial'::text, 'no'::text])));
ALTER TABLE public.program_checkins ADD CONSTRAINT program_checkins_sleep_hours_check CHECK (((sleep_hours >= (0)::numeric) AND (sleep_hours <= (14)::numeric)));
ALTER TABLE public.program_checkins ADD CONSTRAINT program_checkins_surf_hours_check CHECK (((surf_hours IS NULL) OR ((surf_hours >= (0)::numeric) AND (surf_hours <= (14)::numeric))));
ALTER TABLE public.program_checkins ADD CONSTRAINT program_checkins_water_glasses_check CHECK (((water_glasses >= 0) AND (water_glasses <= 12)));
ALTER TABLE public.program_days ADD CONSTRAINT program_days_modality_check CHECK (((modality IS NULL) OR (modality = ANY (ARRAY['agua'::text, 'tierra'::text, 'gym'::text, 'skate'::text, 'mixto'::text, 'descanso'::text]))));
ALTER TABLE public.program_evaluations ADD CONSTRAINT program_evaluations_pillar_check CHECK ((pillar = ANY (ARRAY['fisico'::text, 'tecnico'::text, 'tactico'::text, 'mental'::text])));
ALTER TABLE public.program_evaluations ADD CONSTRAINT program_evaluations_score_check CHECK (((score >= 1) AND (score <= 10)));
ALTER TABLE public.program_items ADD CONSTRAINT program_items_duration_check CHECK (((duration_minutes IS NULL) OR ((duration_minutes >= 0) AND (duration_minutes <= 600))));
ALTER TABLE public.program_items ADD CONSTRAINT program_items_pillar_check CHECK (((pillar IS NULL) OR (pillar = ANY (ARRAY['fisico'::text, 'tecnico'::text, 'tactico'::text, 'mental'::text, 'equipment'::text, 'surf'::text]))));
ALTER TABLE public.programs ADD CONSTRAINT programs_kind_check CHECK ((kind = ANY (ARRAY['custom'::text, 'template'::text])));
ALTER TABLE public.season_contributions ADD CONSTRAINT season_contributions_kind_check CHECK ((kind = ANY (ARRAY['video'::text, 'tarea'::text, 'nota'::text])));
ALTER TABLE public.season_events ADD CONSTRAINT season_events_kind_check CHECK ((kind = ANY (ARRAY['camp'::text, 'nacional'::text, 'internacional'::text, 'viaje'::text, 'medico'::text, 'otro'::text])));
ALTER TABLE public.season_events ADD CONSTRAINT season_events_range_check CHECK (((end_date IS NULL) OR (end_date >= event_date)));
ALTER TABLE public.season_phases ADD CONSTRAINT season_phases_color_key_check CHECK ((color_key = ANY (ARRAY['general'::text, 'especifica'::text, 'precompetitiva'::text, 'competitiva'::text, 'transicion'::text, 'recuperacion'::text])));
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_automaticity_check CHECK (((automaticity IS NULL) OR (automaticity = ANY (ARRAY['yes'::text, 'almost'::text, 'not_yet'::text]))));
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_duration_check CHECK (((duration_minutes IS NULL) OR ((duration_minutes >= 0) AND (duration_minutes <= 1440)))) NOT VALID;
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_execution_rating_check CHECK (((execution_rating >= 1) AND (execution_rating <= 5)));
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_flow_channel_check CHECK (((flow_channel IS NULL) OR ((flow_channel >= 1) AND (flow_channel <= 5))));
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_focus_rating_check CHECK (((focus_rating >= 0) AND (focus_rating <= 3)));
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_kind_check CHECK ((kind = ANY (ARRAY['drill'::text, 'custom'::text, 'free_surf'::text])));
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_mission_completion_check CHECK ((mission_completion = ANY (ARRAY['yes'::text, 'partial'::text, 'no'::text])));
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_reps_check CHECK (((reps_completed IS NULL) OR ((reps_completed >= 0) AND (reps_completed <= 500)))) NOT VALID;
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_sequence_rating_check CHECK (((sequence_rating IS NULL) OR ((sequence_rating >= 1) AND (sequence_rating <= 5))));
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_training_mode_check CHECK (((training_mode IS NULL) OR (training_mode = ANY (ARRAY['sequence_run'::text, 'step_focus'::text]))));
ALTER TABLE public.service_plan_blocks ADD CONSTRAINT service_plan_blocks_flow_channel_check CHECK (((flow_channel IS NULL) OR ((flow_channel >= 1) AND (flow_channel <= 5))));
ALTER TABLE public.service_plan_blocks ADD CONSTRAINT service_plan_blocks_focus_level_check CHECK (((focus_level IS NULL) OR ((focus_level >= 1) AND (focus_level <= 5))));
ALTER TABLE public.service_plan_blocks ADD CONSTRAINT service_plan_blocks_status_check CHECK (((status IS NULL) OR (status = ANY (ARRAY['achieved'::text, 'partial'::text, 'not_yet'::text]))));
ALTER TABLE public.service_plans ADD CONSTRAINT service_plans_completion_state_check CHECK ((completion_state = ANY (ARRAY['planned'::text, 'in_progress'::text, 'closed'::text])));
ALTER TABLE public.service_plans ADD CONSTRAINT service_plans_venue_go_no_go_check CHECK (((venue_go_no_go IS NULL) OR (venue_go_no_go = ANY (ARRAY['go'::text, 'modified'::text, 'no_go'::text]))));
ALTER TABLE public.service_staff ADD CONSTRAINT service_staff_check CHECK (((coach_id IS NOT NULL) OR (staff_member_id IS NOT NULL)));
ALTER TABLE public.session_missions ADD CONSTRAINT session_missions_focus_rating_check CHECK (((focus_rating >= 1) AND (focus_rating <= 5)));
ALTER TABLE public.session_missions ADD CONSTRAINT session_missions_status_check CHECK ((status = ANY (ARRAY['not_yet'::text, 'partial'::text, 'competent'::text, 'mastered'::text])));
ALTER TABLE public.space_bookings ADD CONSTRAINT space_bookings_time_chk CHECK ((ends_at > starts_at));
ALTER TABLE public.student_level_access ADD CONSTRAINT student_level_access_access_type_check CHECK ((access_type = ANY (ARRAY['level'::text, 'program'::text, 'module'::text])));
ALTER TABLE public.student_level_access ADD CONSTRAINT student_level_access_source_check CHECK ((source = ANY (ARRAY['admin_grant'::text, 'camp_enrollment'::text, 'token_code'::text, 'webhook'::text])));
ALTER TABLE public.student_sequence_ratings ADD CONSTRAINT student_sequence_ratings_current_rating_check CHECK (((current_rating >= 1) AND (current_rating <= 5)));
ALTER TABLE public.student_session_results ADD CONSTRAINT student_session_results_focus_rating_check CHECK (((focus_rating >= 1) AND (focus_rating <= 5)));
ALTER TABLE public.student_session_results ADD CONSTRAINT student_session_results_frustration_rating_check CHECK (((frustration_rating >= 0) AND (frustration_rating <= 10)));
ALTER TABLE public.student_session_results ADD CONSTRAINT student_session_results_source_check CHECK (((camp_session_id IS NOT NULL) OR (standalone_session_id IS NOT NULL) OR (cascade_session_id IS NOT NULL)));
ALTER TABLE public.student_solo_sessions ADD CONSTRAINT student_solo_sessions_duration_minutes_check CHECK ((duration_minutes > 0));
ALTER TABLE public.student_solo_sessions ADD CONSTRAINT student_solo_sessions_focus_rating_check CHECK (((focus_rating >= 1) AND (focus_rating <= 5)));
ALTER TABLE public.student_step_ratings ADD CONSTRAINT student_step_ratings_coach_rating_check CHECK (((coach_rating IS NULL) OR ((coach_rating >= 1) AND (coach_rating <= 5))));
ALTER TABLE public.student_step_ratings ADD CONSTRAINT student_step_ratings_current_rating_check CHECK (((current_rating >= 1) AND (current_rating <= 5)));
ALTER TABLE public.students ADD CONSTRAINT active_course_key_check CHECK (((active_course_key IS NULL) OR (active_course_key = ANY (ARRAY['white_belt'::text, 'yellow_belt'::text, 'blue_belt'::text, 'purple_belt'::text, 'brown_belt'::text, 'black_belt'::text]))));
ALTER TABLE public.students ADD CONSTRAINT students_age_group_check CHECK ((age_group = ANY (ARRAY['adult'::text, 'junior'::text])));
ALTER TABLE public.students ADD CONSTRAINT students_learning_profile_primary_check CHECK (((learning_profile_primary IS NULL) OR (learning_profile_primary = ANY (ARRAY['V'::text, 'K'::text, 'A'::text, 'R'::text]))));
ALTER TABLE public.students ADD CONSTRAINT students_learning_profile_secondary_check CHECK (((learning_profile_secondary IS NULL) OR (learning_profile_secondary = ANY (ARRAY['V'::text, 'K'::text, 'A'::text, 'R'::text]))));
ALTER TABLE public.students ADD CONSTRAINT students_lifecycle_status_check CHECK ((lifecycle_status = ANY (ARRAY['lead'::text, 'member'::text, 'inactive'::text, 'churned'::text])));
ALTER TABLE public.students ADD CONSTRAINT students_student_path_check CHECK ((student_path = ANY (ARRAY['competitive'::text, 'recreational'::text])));
ALTER TABLE public.students ADD CONSTRAINT students_student_type_check CHECK (((student_type IS NULL) OR (student_type = ANY (ARRAY['member'::text, 'dropin'::text]))));
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_academy_rating_check CHECK (((academy_rating >= 1) AND (academy_rating <= 5)));
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_coach_rating_check CHECK (((coach_rating >= 1) AND (coach_rating <= 5)));
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_flow_channel_check CHECK (((flow_channel IS NULL) OR ((flow_channel >= 1) AND (flow_channel <= 5))));
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_q1_clarity_check CHECK (((q1_clarity >= 1) AND (q1_clarity <= 5)));
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_q2_feedback_check CHECK (((q2_feedback >= 1) AND (q2_feedback <= 5)));
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_q3_homework_clarity_check CHECK (((q3_homework_clarity >= 1) AND (q3_homework_clarity <= 5)));
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_q4_session_value_check CHECK (((q4_session_value >= 1) AND (q4_session_value <= 5)));
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_session_quality_check CHECK (((session_quality >= 1) AND (session_quality <= 5)));
ALTER TABLE public.tide_events ADD CONSTRAINT tide_events_event_type_check CHECK ((event_type = ANY (ARRAY['high'::text, 'low'::text])));
ALTER TABLE public.week_template_slots ADD CONSTRAINT week_template_slots_weekday_check CHECK (((weekday >= 0) AND (weekday <= 6)));
ALTER TABLE public.academies ADD CONSTRAINT academies_assigned_coordinator_id_fkey FOREIGN KEY (assigned_coordinator_id) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.academy_course_prices ADD CONSTRAINT academy_course_prices_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE public.academy_course_prices ADD CONSTRAINT academy_course_prices_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES coaches(id);
ALTER TABLE public.academy_inventory_items ADD CONSTRAINT academy_inventory_items_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE public.academy_inventory_items ADD CONSTRAINT academy_inventory_items_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.academy_invoices ADD CONSTRAINT academy_invoices_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id);
ALTER TABLE public.academy_spaces ADD CONSTRAINT academy_spaces_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE public.academy_tasks ADD CONSTRAINT academy_tasks_assignee_coach_id_fkey FOREIGN KEY (assignee_coach_id) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.academy_tasks ADD CONSTRAINT academy_tasks_done_by_fkey FOREIGN KEY (done_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.academy_template_assignments ADD CONSTRAINT academy_template_assignments_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE public.academy_template_assignments ADD CONSTRAINT academy_template_assignments_template_id_fkey FOREIGN KEY (template_id) REFERENCES camp_templates(id) ON DELETE CASCADE;
ALTER TABLE public.access_codes ADD CONSTRAINT access_codes_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id);
ALTER TABLE public.access_codes ADD CONSTRAINT access_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.access_codes ADD CONSTRAINT access_codes_used_by_fkey FOREIGN KEY (used_by) REFERENCES students(id) ON DELETE SET NULL;
ALTER TABLE public.admin_impersonations ADD CONSTRAINT admin_impersonations_admin_coach_id_fkey FOREIGN KEY (admin_coach_id) REFERENCES coaches(id);
ALTER TABLE public.athlete_competitions ADD CONSTRAINT athlete_competitions_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.athlete_diet_notes ADD CONSTRAINT athlete_diet_notes_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.athlete_diet_notes ADD CONSTRAINT athlete_diet_notes_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.athlete_heats ADD CONSTRAINT athlete_heats_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES athlete_competitions(id) ON DELETE CASCADE;
ALTER TABLE public.athlete_staff_tasks ADD CONSTRAINT athlete_staff_tasks_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.athlete_staff_tasks ADD CONSTRAINT athlete_staff_tasks_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.athlete_team_posts ADD CONSTRAINT athlete_team_posts_author_coach_id_fkey FOREIGN KEY (author_coach_id) REFERENCES coaches(id);
ALTER TABLE public.athlete_team_posts ADD CONSTRAINT athlete_team_posts_author_student_id_fkey FOREIGN KEY (author_student_id) REFERENCES students(id);
ALTER TABLE public.athlete_team_posts ADD CONSTRAINT athlete_team_posts_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.belt_promotion_recommendations ADD CONSTRAINT belt_promotion_recommendations_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE SET NULL;
ALTER TABLE public.belt_promotion_recommendations ADD CONSTRAINT belt_promotion_recommendations_recommended_by_fkey FOREIGN KEY (recommended_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.belt_promotion_recommendations ADD CONSTRAINT belt_promotion_recommendations_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.belt_promotion_recommendations ADD CONSTRAINT belt_promotion_recommendations_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.board_clearance ADD CONSTRAINT board_clearance_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.board_clearance ADD CONSTRAINT board_clearance_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.board_rentals ADD CONSTRAINT board_rentals_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE public.board_rentals ADD CONSTRAINT board_rentals_board_id_fkey FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE RESTRICT;
ALTER TABLE public.board_rentals ADD CONSTRAINT board_rentals_created_by_fkey FOREIGN KEY (created_by) REFERENCES coaches(id);
ALTER TABLE public.board_usages ADD CONSTRAINT board_usages_board_id_fkey FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;
ALTER TABLE public.board_usages ADD CONSTRAINT board_usages_camp_session_id_fkey FOREIGN KEY (camp_session_id) REFERENCES camp_sessions(id) ON DELETE SET NULL;
ALTER TABLE public.boards ADD CONSTRAINT boards_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE public.camp_daily_feedback ADD CONSTRAINT camp_daily_feedback_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE CASCADE;
ALTER TABLE public.camp_daily_feedback ADD CONSTRAINT camp_daily_feedback_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.camp_daily_feedback ADD CONSTRAINT camp_daily_feedback_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id);
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id);
ALTER TABLE public.camp_experience_surveys ADD CONSTRAINT camp_experience_surveys_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.camp_final_evaluations ADD CONSTRAINT camp_final_evaluations_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE CASCADE;
ALTER TABLE public.camp_final_evaluations ADD CONSTRAINT camp_final_evaluations_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.camp_final_evaluations ADD CONSTRAINT camp_final_evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.camp_instances ADD CONSTRAINT camp_instances_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id);
ALTER TABLE public.camp_instances ADD CONSTRAINT camp_instances_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.camp_instances ADD CONSTRAINT camp_instances_head_coach_assigned_by_fkey FOREIGN KEY (head_coach_assigned_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.camp_instances ADD CONSTRAINT camp_instances_head_coach_id_fkey FOREIGN KEY (head_coach_id) REFERENCES coaches(id);
ALTER TABLE public.camp_instances ADD CONSTRAINT camp_instances_template_id_fkey FOREIGN KEY (template_id) REFERENCES camp_templates(id);
ALTER TABLE public.camp_participants ADD CONSTRAINT camp_participants_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE CASCADE;
ALTER TABLE public.camp_participants ADD CONSTRAINT camp_participants_sold_by_fkey FOREIGN KEY (sold_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.camp_participants ADD CONSTRAINT camp_participants_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.camp_scheduled_evaluations ADD CONSTRAINT camp_scheduled_evaluations_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE CASCADE;
ALTER TABLE public.camp_scheduled_evaluations ADD CONSTRAINT camp_scheduled_evaluations_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES coaches(id);
ALTER TABLE public.camp_scheduled_evaluations ADD CONSTRAINT camp_scheduled_evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.camp_sessions ADD CONSTRAINT camp_sessions_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE CASCADE;
ALTER TABLE public.camp_sessions ADD CONSTRAINT camp_sessions_template_day_id_fkey FOREIGN KEY (template_day_id) REFERENCES camp_template_days(id);
ALTER TABLE public.camp_student_customizations ADD CONSTRAINT camp_student_customizations_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE CASCADE;
ALTER TABLE public.camp_student_customizations ADD CONSTRAINT camp_student_customizations_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.camp_template_blocks ADD CONSTRAINT camp_template_blocks_template_day_id_fkey FOREIGN KEY (template_day_id) REFERENCES camp_template_days(id);
ALTER TABLE public.camp_template_days ADD CONSTRAINT camp_template_days_template_id_fkey FOREIGN KEY (template_id) REFERENCES camp_templates(id);
ALTER TABLE public.camp_templates ADD CONSTRAINT camp_templates_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id);
ALTER TABLE public.camp_templates ADD CONSTRAINT camp_templates_sales_deck_resource_id_fkey FOREIGN KEY (sales_deck_resource_id) REFERENCES coach_resources(id) ON DELETE SET NULL;
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES coaches(id);
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_drill_id_fkey FOREIGN KEY (drill_id) REFERENCES drills(id);
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_pilar_part_id_fkey FOREIGN KEY (pilar_part_id) REFERENCES pilar_parts(id);
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.cascade_sessions ADD CONSTRAINT cascade_sessions_whats_next_pilar_part_id_fkey FOREIGN KEY (whats_next_pilar_part_id) REFERENCES pilar_parts(id);
ALTER TABLE public.class_coupons ADD CONSTRAINT class_coupons_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE public.coach_certifications ADD CONSTRAINT coach_certifications_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE;
ALTER TABLE public.coach_certifications ADD CONSTRAINT coach_certifications_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES coaches(id);
ALTER TABLE public.coach_criterion_evals ADD CONSTRAINT coach_criterion_evals_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE SET NULL;
ALTER TABLE public.coach_criterion_evals ADD CONSTRAINT coach_criterion_evals_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.coach_criterion_evals ADD CONSTRAINT coach_criterion_evals_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.coach_evaluations ADD CONSTRAINT coach_evaluations_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE;
ALTER TABLE public.coach_evaluations ADD CONSTRAINT coach_evaluations_evaluated_by_fkey FOREIGN KEY (evaluated_by) REFERENCES coaches(id);
ALTER TABLE public.coach_lesson_progress ADD CONSTRAINT coach_lesson_progress_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE;
ALTER TABLE public.coach_lesson_progress ADD CONSTRAINT coach_lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
ALTER TABLE public.coach_payments ADD CONSTRAINT coach_payments_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id);
ALTER TABLE public.coach_payments ADD CONSTRAINT coach_payments_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.coach_payments ADD CONSTRAINT coach_payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES coaches(id);
ALTER TABLE public.coach_payments ADD CONSTRAINT coach_payments_staff_member_id_fkey FOREIGN KEY (staff_member_id) REFERENCES staff_members(id);
ALTER TABLE public.coach_resource_grants ADD CONSTRAINT coach_resource_grants_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE;
ALTER TABLE public.coach_resource_grants ADD CONSTRAINT coach_resource_grants_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES coach_resources(id) ON DELETE CASCADE;
ALTER TABLE public.coaches ADD CONSTRAINT coaches_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id);
ALTER TABLE public.coaches ADD CONSTRAINT coaches_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id);
ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id);
ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_created_by_fkey FOREIGN KEY (created_by) REFERENCES coaches(id);
ALTER TABLE public.community_reactions ADD CONSTRAINT community_reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
ALTER TABLE public.community_reactions ADD CONSTRAINT community_reactions_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.community_reads ADD CONSTRAINT community_reads_post_id_fkey FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
ALTER TABLE public.community_reads ADD CONSTRAINT community_reads_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.content_videos ADD CONSTRAINT content_videos_drill_mission_id_fkey FOREIGN KEY (drill_mission_id) REFERENCES drills_missions(id) ON DELETE CASCADE;
ALTER TABLE public.content_videos ADD CONSTRAINT content_videos_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
ALTER TABLE public.content_videos ADD CONSTRAINT content_videos_step_id_fkey FOREIGN KEY (step_id) REFERENCES lessons(id);
ALTER TABLE public.content_videos ADD CONSTRAINT content_videos_template_day_id_fkey FOREIGN KEY (template_day_id) REFERENCES camp_template_days(id) ON DELETE CASCADE;
ALTER TABLE public.course_final_quiz_attempts ADD CONSTRAINT course_final_quiz_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.course_grants ADD CONSTRAINT course_grants_academy_id_at_grant_fkey FOREIGN KEY (academy_id_at_grant) REFERENCES academies(id) ON DELETE SET NULL;
ALTER TABLE public.course_grants ADD CONSTRAINT course_grants_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id);
ALTER TABLE public.course_grants ADD CONSTRAINT course_grants_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES coaches(id);
ALTER TABLE public.course_grants ADD CONSTRAINT course_grants_invoiced_in_fkey FOREIGN KEY (invoiced_in) REFERENCES academy_invoices(id);
ALTER TABLE public.course_grants ADD CONSTRAINT course_grants_revoked_by_fkey FOREIGN KEY (revoked_by) REFERENCES coaches(id);
ALTER TABLE public.course_grants ADD CONSTRAINT course_grants_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.course_prices ADD CONSTRAINT course_prices_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES coaches(id);
ALTER TABLE public.heat_waves ADD CONSTRAINT heat_waves_heat_id_fkey FOREIGN KEY (heat_id) REFERENCES athlete_heats(id) ON DELETE CASCADE;
ALTER TABLE public.hp_athlete_links ADD CONSTRAINT hp_athlete_links_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.hp_athlete_profiles ADD CONSTRAINT hp_athlete_profiles_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.hp_deep_evaluations ADD CONSTRAINT hp_deep_evaluations_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.hp_deep_evaluations ADD CONSTRAINT hp_deep_evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.hp_messages ADD CONSTRAINT hp_messages_sender_coach_id_fkey FOREIGN KEY (sender_coach_id) REFERENCES coaches(id);
ALTER TABLE public.hp_messages ADD CONSTRAINT hp_messages_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.hp_session_attendance ADD CONSTRAINT hp_session_attendance_session_id_fkey FOREIGN KEY (session_id) REFERENCES hp_team_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.hp_session_attendance ADD CONSTRAINT hp_session_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.hp_team_sessions ADD CONSTRAINT hp_team_sessions_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.inventory_checks ADD CONSTRAINT inventory_checks_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_checks ADD CONSTRAINT inventory_checks_checked_by_fkey FOREIGN KEY (checked_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.inventory_checks ADD CONSTRAINT inventory_checks_item_id_fkey FOREIGN KEY (item_id) REFERENCES academy_inventory_items(id) ON DELETE CASCADE;
ALTER TABLE public.lesson_plan_blocks ADD CONSTRAINT lesson_plan_blocks_multi_block_session_id_fkey FOREIGN KEY (multi_block_session_id) REFERENCES multi_block_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.lesson_plan_blocks ADD CONSTRAINT lesson_plan_blocks_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.lesson_progress ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
ALTER TABLE public.lesson_progress ADD CONSTRAINT lesson_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.lesson_quizzes ADD CONSTRAINT lesson_quizzes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
ALTER TABLE public.level_quiz_attempts ADD CONSTRAINT level_quiz_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL;
ALTER TABLE public.memberships ADD CONSTRAINT memberships_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE SET NULL;
ALTER TABLE public.memberships ADD CONSTRAINT memberships_created_by_fkey FOREIGN KEY (created_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.memberships ADD CONSTRAINT memberships_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.method_docs ADD CONSTRAINT method_docs_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES coach_resources(id) ON DELETE SET NULL;
ALTER TABLE public.method_tasks ADD CONSTRAINT method_tasks_doc_id_fkey FOREIGN KEY (doc_id) REFERENCES method_docs(id) ON DELETE SET NULL;
ALTER TABLE public.multi_block_sessions ADD CONSTRAINT multi_block_sessions_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.multi_block_sessions ADD CONSTRAINT multi_block_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_recipient_coach_id_fkey FOREIGN KEY (recipient_coach_id) REFERENCES coaches(id) ON DELETE CASCADE;
ALTER TABLE public.ocean_level_evaluations ADD CONSTRAINT ocean_level_evaluations_evaluated_by_fkey FOREIGN KEY (evaluated_by) REFERENCES coaches(id);
ALTER TABLE public.ocean_level_evaluations ADD CONSTRAINT ocean_level_evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.program_appointments ADD CONSTRAINT program_appointments_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.program_appointments ADD CONSTRAINT program_appointments_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.program_assignments ADD CONSTRAINT program_assignments_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.program_assignments ADD CONSTRAINT program_assignments_program_id_fkey FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;
ALTER TABLE public.program_assignments ADD CONSTRAINT program_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.program_checkins ADD CONSTRAINT program_checkins_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES program_assignments(id) ON DELETE CASCADE;
ALTER TABLE public.program_day_marks ADD CONSTRAINT program_day_marks_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES program_assignments(id) ON DELETE CASCADE;
ALTER TABLE public.program_day_marks ADD CONSTRAINT program_day_marks_day_id_fkey FOREIGN KEY (day_id) REFERENCES program_days(id) ON DELETE CASCADE;
ALTER TABLE public.program_days ADD CONSTRAINT program_days_program_id_fkey FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;
ALTER TABLE public.program_evaluations ADD CONSTRAINT program_evaluations_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.program_evaluations ADD CONSTRAINT program_evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.program_item_marks ADD CONSTRAINT program_item_marks_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES program_assignments(id) ON DELETE CASCADE;
ALTER TABLE public.program_item_marks ADD CONSTRAINT program_item_marks_item_id_fkey FOREIGN KEY (item_id) REFERENCES program_items(id) ON DELETE CASCADE;
ALTER TABLE public.program_items ADD CONSTRAINT program_items_day_id_fkey FOREIGN KEY (day_id) REFERENCES program_days(id) ON DELETE CASCADE;
ALTER TABLE public.programs ADD CONSTRAINT programs_author_coach_id_fkey FOREIGN KEY (author_coach_id) REFERENCES coaches(id);
ALTER TABLE public.refresher_charges ADD CONSTRAINT refresher_charges_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE SET NULL;
ALTER TABLE public.refresher_charges ADD CONSTRAINT refresher_charges_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE SET NULL;
ALTER TABLE public.refresher_charges ADD CONSTRAINT refresher_charges_created_by_fkey FOREIGN KEY (created_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.refresher_charges ADD CONSTRAINT refresher_charges_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.season_contributions ADD CONSTRAINT season_contributions_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.season_contributions ADD CONSTRAINT season_contributions_season_id_fkey FOREIGN KEY (season_id) REFERENCES season_plans(id) ON DELETE CASCADE;
ALTER TABLE public.season_events ADD CONSTRAINT season_events_season_id_fkey FOREIGN KEY (season_id) REFERENCES season_plans(id) ON DELETE CASCADE;
ALTER TABLE public.season_phases ADD CONSTRAINT season_phases_season_id_fkey FOREIGN KEY (season_id) REFERENCES season_plans(id) ON DELETE CASCADE;
ALTER TABLE public.season_plans ADD CONSTRAINT season_plans_head_coach_id_fkey FOREIGN KEY (head_coach_id) REFERENCES coaches(id);
ALTER TABLE public.season_plans ADD CONSTRAINT season_plans_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.season_specialists ADD CONSTRAINT season_specialists_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.season_specialists ADD CONSTRAINT season_specialists_season_id_fkey FOREIGN KEY (season_id) REFERENCES season_plans(id) ON DELETE CASCADE;
ALTER TABLE public.self_training_sessions ADD CONSTRAINT self_training_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.sequence_evaluations ADD CONSTRAINT sequence_evaluations_evaluated_by_fkey FOREIGN KEY (evaluated_by) REFERENCES coaches(id);
ALTER TABLE public.sequence_evaluations ADD CONSTRAINT sequence_evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.service_plan_blocks ADD CONSTRAINT service_plan_blocks_board_id_fkey FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE SET NULL;
ALTER TABLE public.service_plan_blocks ADD CONSTRAINT service_plan_blocks_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE CASCADE;
ALTER TABLE public.service_plan_blocks ADD CONSTRAINT service_plan_blocks_camp_session_id_fkey FOREIGN KEY (camp_session_id) REFERENCES camp_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.service_plan_blocks ADD CONSTRAINT service_plan_blocks_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.service_plans ADD CONSTRAINT service_plans_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE CASCADE;
ALTER TABLE public.service_plans ADD CONSTRAINT service_plans_camp_session_id_fkey FOREIGN KEY (camp_session_id) REFERENCES camp_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.service_staff ADD CONSTRAINT service_staff_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE CASCADE;
ALTER TABLE public.service_staff ADD CONSTRAINT service_staff_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE;
ALTER TABLE public.service_staff ADD CONSTRAINT service_staff_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.service_staff ADD CONSTRAINT service_staff_staff_member_id_fkey FOREIGN KEY (staff_member_id) REFERENCES staff_members(id) ON DELETE CASCADE;
ALTER TABLE public.session_incidents ADD CONSTRAINT session_incidents_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE SET NULL;
ALTER TABLE public.session_incidents ADD CONSTRAINT session_incidents_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE SET NULL;
ALTER TABLE public.session_incidents ADD CONSTRAINT session_incidents_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.session_incidents ADD CONSTRAINT session_incidents_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL;
ALTER TABLE public.session_missions ADD CONSTRAINT session_missions_drill_id_fkey FOREIGN KEY (drill_id) REFERENCES drills(id);
ALTER TABLE public.session_missions ADD CONSTRAINT session_missions_standalone_session_id_fkey FOREIGN KEY (standalone_session_id) REFERENCES standalone_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.space_bookings ADD CONSTRAINT space_bookings_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE public.space_bookings ADD CONSTRAINT space_bookings_camp_instance_id_fkey FOREIGN KEY (camp_instance_id) REFERENCES camp_instances(id) ON DELETE SET NULL;
ALTER TABLE public.space_bookings ADD CONSTRAINT space_bookings_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.space_bookings ADD CONSTRAINT space_bookings_space_id_fkey FOREIGN KEY (space_id) REFERENCES academy_spaces(id) ON DELETE CASCADE;
ALTER TABLE public.staff_members ADD CONSTRAINT staff_members_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE public.standalone_sessions ADD CONSTRAINT standalone_sessions_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.standalone_sessions ADD CONSTRAINT standalone_sessions_drill_id_fkey FOREIGN KEY (drill_id) REFERENCES drills(id);
ALTER TABLE public.standalone_sessions ADD CONSTRAINT standalone_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.student_level_access ADD CONSTRAINT student_level_access_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES coaches(id);
ALTER TABLE public.student_level_access ADD CONSTRAINT student_level_access_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.student_resource_grants ADD CONSTRAINT student_resource_grants_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES coach_resources(id) ON DELETE CASCADE;
ALTER TABLE public.student_resource_grants ADD CONSTRAINT student_resource_grants_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.student_sequence_ratings ADD CONSTRAINT student_sequence_ratings_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.student_session_results ADD CONSTRAINT student_session_results_camp_session_id_fkey FOREIGN KEY (camp_session_id) REFERENCES camp_sessions(id);
ALTER TABLE public.student_session_results ADD CONSTRAINT student_session_results_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id);
ALTER TABLE public.student_session_results ADD CONSTRAINT student_session_results_multi_block_session_id_fkey FOREIGN KEY (multi_block_session_id) REFERENCES multi_block_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.student_session_results ADD CONSTRAINT student_session_results_standalone_session_id_fkey FOREIGN KEY (standalone_session_id) REFERENCES standalone_sessions(id);
ALTER TABLE public.student_session_results ADD CONSTRAINT student_session_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.student_solo_sessions ADD CONSTRAINT student_solo_sessions_drill_id_fkey FOREIGN KEY (drill_id) REFERENCES drills(id);
ALTER TABLE public.student_solo_sessions ADD CONSTRAINT student_solo_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.student_step_ratings ADD CONSTRAINT student_step_ratings_coach_rated_by_fkey FOREIGN KEY (coach_rated_by) REFERENCES coaches(id);
ALTER TABLE public.student_step_ratings ADD CONSTRAINT student_step_ratings_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.students ADD CONSTRAINT students_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id);
ALTER TABLE public.students ADD CONSTRAINT students_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.students ADD CONSTRAINT students_hp_access_granted_by_fkey FOREIGN KEY (hp_access_granted_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_session_result_id_fkey FOREIGN KEY (session_result_id) REFERENCES student_session_results(id);
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE public.task_completions ADD CONSTRAINT task_completions_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.task_completions ADD CONSTRAINT task_completions_task_id_fkey FOREIGN KEY (task_id) REFERENCES academy_tasks(id) ON DELETE CASCADE;
ALTER TABLE public.template_cost_items ADD CONSTRAINT template_cost_items_cost_rate_id_fkey FOREIGN KEY (cost_rate_id) REFERENCES cost_rates(id) ON DELETE CASCADE;
ALTER TABLE public.tool_leads ADD CONSTRAINT tool_leads_converted_academy_id_fkey FOREIGN KEY (converted_academy_id) REFERENCES academies(id);
ALTER TABLE public.water_tests ADD CONSTRAINT water_tests_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE public.water_tests ADD CONSTRAINT water_tests_tested_by_fkey FOREIGN KEY (tested_by) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.week_template_slots ADD CONSTRAINT week_template_slots_default_head_coach_id_fkey FOREIGN KEY (default_head_coach_id) REFERENCES coaches(id) ON DELETE SET NULL;
ALTER TABLE public.week_template_slots ADD CONSTRAINT week_template_slots_service_template_id_fkey FOREIGN KEY (service_template_id) REFERENCES camp_templates(id) ON DELETE CASCADE;
ALTER TABLE public.week_template_slots ADD CONSTRAINT week_template_slots_week_template_id_fkey FOREIGN KEY (week_template_id) REFERENCES week_templates(id) ON DELETE CASCADE;
ALTER TABLE public.week_templates ADD CONSTRAINT week_templates_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE;

-- ── 6. Vistas ──
CREATE OR REPLACE VIEW public.coach_rating_stats AS  SELECT ssr.coach_id,
CREATE OR REPLACE VIEW public.coach_student_feedback AS  SELECT ssr.coach_id,

-- ── 7. Índices ──
CREATE INDEX academy_spaces_academy_idx ON public.academy_spaces USING btree (academy_id);
CREATE INDEX athlete_competitions_student_idx ON public.athlete_competitions USING btree (student_id);
CREATE INDEX athlete_heats_comp_idx ON public.athlete_heats USING btree (competition_id);
CREATE INDEX board_rentals_academy_idx ON public.board_rentals USING btree (academy_id);
CREATE INDEX board_rentals_board_idx ON public.board_rentals USING btree (board_id);
CREATE INDEX board_rentals_status_idx ON public.board_rentals USING btree (status);
CREATE INDEX camp_final_evaluations_student_idx ON public.camp_final_evaluations USING btree (student_id, created_at DESC);
CREATE INDEX cfq_attempts_student_idx ON public.course_final_quiz_attempts USING btree (student_id, course_key);
CREATE INDEX course_final_quiz_course_idx ON public.course_final_quiz USING btree (course_key);
CREATE INDEX hp_deep_evals_student_idx ON public.hp_deep_evaluations USING btree (student_id, eval_date DESC);
CREATE INDEX hp_messages_student_idx ON public.hp_messages USING btree (student_id, created_at DESC);
CREATE INDEX idx_academies_coordinator ON public.academies USING btree (assigned_coordinator_id) WHERE (assigned_coordinator_id IS NOT NULL);
CREATE INDEX idx_academy_tasks_academy ON public.academy_tasks USING btree (academy_id);
CREATE INDEX idx_academy_tasks_assignee ON public.academy_tasks USING btree (assignee_coach_id);
CREATE INDEX idx_access_codes_used_by ON public.access_codes USING btree (used_by);
CREATE INDEX idx_adn_student ON public.athlete_diet_notes USING btree (student_id, created_at DESC);
CREATE INDEX idx_ast_student_open ON public.athlete_staff_tasks USING btree (student_id) WHERE (done = false);
CREATE INDEX idx_ata_template ON public.academy_template_assignments USING btree (template_id);
CREATE INDEX idx_atp_student ON public.athlete_team_posts USING btree (student_id, created_at DESC);
CREATE INDEX idx_audit_date ON public.audit_log USING btree (created_at DESC);
CREATE INDEX idx_audit_event ON public.audit_log USING btree (event_type);
CREATE INDEX idx_belt_promo_pending ON public.belt_promotion_recommendations USING btree (status) WHERE (status = 'pending'::text);
CREATE INDEX idx_blocks_session ON public.lesson_plan_blocks USING btree (multi_block_session_id, order_index);
CREATE INDEX idx_blocks_student ON public.lesson_plan_blocks USING btree (student_id, created_at DESC);
CREATE INDEX idx_board_usages_board ON public.board_usages USING btree (board_id);
CREATE INDEX idx_boards_academy ON public.boards USING btree (academy_id, status);
CREATE INDEX idx_camp_instances_academy ON public.camp_instances USING btree (academy_id);
CREATE INDEX idx_camp_template_blocks_step ON public.camp_template_blocks USING btree (step_id);
CREATE INDEX idx_camp_templates_academy ON public.camp_templates USING btree (academy_id) WHERE (academy_id IS NOT NULL);
CREATE INDEX idx_camp_templates_service_kind ON public.camp_templates USING btree (service_kind, active_status);
CREATE INDEX idx_ces_academy_submitted ON public.camp_experience_surveys USING btree (academy_id, submitted_at);
CREATE INDEX idx_ces_student_pending ON public.camp_experience_surveys USING btree (student_id) WHERE (submitted_at IS NULL);
CREATE INDEX idx_coach_criterion_evals_student_step ON public.coach_criterion_evals USING btree (student_id, step_id, evaluated_at DESC);
CREATE INDEX idx_coach_payments_coach ON public.coach_payments USING btree (coach_id, period_start);
CREATE INDEX idx_coach_progress_coach ON public.coach_lesson_progress USING btree (coach_id);
CREATE INDEX idx_coach_resources_sort ON public.coach_resources USING btree (sort_order);
CREATE INDEX idx_coaches_academy ON public.coaches USING btree (academy_id);
CREATE INDEX idx_coaches_auth ON public.coaches USING btree (auth_user_id);
CREATE INDEX idx_coaches_portal_token ON public.coaches USING btree (portal_token);
CREATE INDEX idx_community_posts_published ON public.community_posts USING btree (published, published_at DESC);
CREATE INDEX idx_community_reads_student ON public.community_reads USING btree (student_id);
CREATE INDEX idx_content_videos_drill_mission ON public.content_videos USING btree (drill_mission_id, display_order) WHERE (drill_mission_id IS NOT NULL);
CREATE INDEX idx_content_videos_lesson ON public.content_videos USING btree (lesson_id, display_order) WHERE (lesson_id IS NOT NULL);
CREATE INDEX idx_content_videos_step ON public.content_videos USING btree (step_id) WHERE (step_id IS NOT NULL);
CREATE INDEX idx_content_videos_template_day ON public.content_videos USING btree (template_day_id) WHERE (template_day_id IS NOT NULL);
CREATE INDEX idx_cost_rates_academy ON public.cost_rates USING btree (academy_id, active);
CREATE INDEX idx_course_grants_academy ON public.course_grants USING btree (academy_id, granted_at);
CREATE INDEX idx_course_grants_billing ON public.course_grants USING btree (academy_id_at_grant, granted_at) WHERE (revoked_at IS NULL);
CREATE INDEX idx_course_grants_student ON public.course_grants USING btree (student_id);
CREATE INDEX idx_cs_coach ON public.cascade_sessions USING btree (coach_id);
CREATE INDEX idx_cs_date ON public.cascade_sessions USING btree (session_date DESC);
CREATE INDEX idx_cs_student ON public.cascade_sessions USING btree (student_id);
CREATE INDEX idx_do_category ON public.dropdown_options USING btree (category, display_order);
CREATE INDEX idx_drills_belt ON public.drills_missions USING btree (belt);
CREATE INDEX idx_drills_block ON public.drills USING btree (training_block);
CREATE INDEX idx_drills_pilar ON public.drills USING btree (related_pilar);
CREATE INDEX idx_drills_safety ON public.drills USING btree (is_safety_layer);
CREATE INDEX idx_drills_step ON public.drills_missions USING btree (step_id);
CREATE INDEX idx_impersonations_admin ON public.admin_impersonations USING btree (admin_coach_id, started_at DESC);
CREATE INDEX idx_impersonations_target ON public.admin_impersonations USING btree (target_kind, target_id);
CREATE INDEX idx_inv_req_academy ON public.inventory_requisitions USING btree (academy_id, created_at DESC);
CREATE INDEX idx_inventory_checks_item ON public.inventory_checks USING btree (item_id);
CREATE INDEX idx_inventory_items_academy ON public.academy_inventory_items USING btree (academy_id);
CREATE INDEX idx_lessons_linked_step ON public.lessons USING btree (linked_step_id) WHERE (linked_step_id IS NOT NULL);
CREATE INDEX idx_lessons_order ON public.lessons USING btree (display_order);
CREATE INDEX idx_lessons_pc_section ON public.lessons USING btree (pc_section_id, pc_section_order);
CREATE INDEX idx_lessons_section ON public.lessons USING btree (course_section);
CREATE INDEX idx_lessons_wb_sequence ON public.lessons USING btree (wb_sequence_id, wb_sequence_order);
CREATE INDEX idx_mbs_coach ON public.multi_block_sessions USING btree (coach_id);
CREATE INDEX idx_mbs_state ON public.multi_block_sessions USING btree (completion_state) WHERE (completion_state <> 'closed'::text);
CREATE INDEX idx_mbs_student ON public.multi_block_sessions USING btree (student_id, session_date DESC);
CREATE INDEX idx_memberships_student ON public.memberships USING btree (student_id, ends_at DESC);
CREATE INDEX idx_notifications_recipient ON public.notifications USING btree (recipient_coach_id, read_at);
CREATE INDEX idx_ocean_eval_student ON public.ocean_level_evaluations USING btree (student_id, created_at DESC);
CREATE INDEX idx_pp_belt ON public.pilar_parts USING btree (min_belt, max_belt);
CREATE INDEX idx_pp_pilar ON public.pilar_parts USING btree (pilar_id);
CREATE INDEX idx_program_items_step ON public.program_items USING btree (step_id) WHERE (step_id IS NOT NULL);
CREATE INDEX idx_progress_student ON public.lesson_progress USING btree (student_id);
CREATE INDEX idx_quizzes_lesson ON public.lesson_quizzes USING btree (lesson_id);
CREATE INDEX idx_refresher_charges_academy_date ON public.refresher_charges USING btree (academy_id, created_at);
CREATE INDEX idx_self_train_student ON public.self_training_sessions USING btree (student_id, created_at DESC);
CREATE INDEX idx_self_training_kind ON public.self_training_sessions USING btree (student_id, kind, created_at DESC);
CREATE INDEX idx_self_training_linked_step ON public.self_training_sessions USING btree (linked_step_id) WHERE (linked_step_id IS NOT NULL);
CREATE INDEX idx_seq_eval_student ON public.sequence_evaluations USING btree (student_id, created_at DESC);
CREATE INDEX idx_sequences_belt ON public.sequences USING btree (belt_level);
CREATE INDEX idx_sequences_sort ON public.sequences USING btree (sort_order, step_order);
CREATE INDEX idx_service_plan_blocks_camp ON public.service_plan_blocks USING btree (camp_instance_id, order_index);
CREATE INDEX idx_service_plan_blocks_session ON public.service_plan_blocks USING btree (camp_session_id, order_index);
CREATE INDEX idx_service_plan_blocks_student ON public.service_plan_blocks USING btree (student_id);
CREATE INDEX idx_service_plans_camp ON public.service_plans USING btree (camp_instance_id);
CREATE INDEX idx_service_staff_camp ON public.service_staff USING btree (camp_instance_id);
CREATE INDEX idx_service_staff_coach ON public.service_staff USING btree (coach_id) WHERE (coach_id IS NOT NULL);
CREATE INDEX idx_session_incidents_academy ON public.session_incidents USING btree (academy_id, created_at DESC);
CREATE INDEX idx_session_incidents_coach ON public.session_incidents USING btree (coach_id);
CREATE INDEX idx_session_incidents_student ON public.session_incidents USING btree (student_id) WHERE (student_id IS NOT NULL);
CREATE INDEX idx_session_results_feedback_token ON public.student_session_results USING btree (feedback_token);
CREATE INDEX idx_sla_active ON public.student_level_access USING btree (student_id, active);
CREATE INDEX idx_sla_student ON public.student_level_access USING btree (student_id);
CREATE INDEX idx_sla_type ON public.student_level_access USING btree (access_type, level_key);
CREATE INDEX idx_sm_order ON public.session_missions USING btree (standalone_session_id, sort_order);
CREATE INDEX idx_sm_session ON public.session_missions USING btree (standalone_session_id);
CREATE INDEX idx_ss_coach ON public.standalone_sessions USING btree (coach_id);
CREATE INDEX idx_ss_date ON public.standalone_sessions USING btree (session_date DESC);
CREATE INDEX idx_ss_student ON public.standalone_sessions USING btree (student_id);
CREATE INDEX idx_ssr_camp ON public.student_session_results USING btree (camp_session_id);
CREATE INDEX idx_ssr_completion ON public.student_session_results USING btree (completion_state);
CREATE INDEX idx_ssr_multi_block_session ON public.student_session_results USING btree (multi_block_session_id) WHERE (multi_block_session_id IS NOT NULL);
CREATE INDEX idx_ssr_standalone ON public.student_session_results USING btree (standalone_session_id);
CREATE INDEX idx_ssr_student ON public.student_session_results USING btree (student_id);
CREATE INDEX idx_sss_date ON public.student_solo_sessions USING btree (student_id, session_date DESC);
CREATE INDEX idx_sss_student ON public.student_solo_sessions USING btree (student_id);
CREATE INDEX idx_step_ratings_coach_rated ON public.student_step_ratings USING btree (student_id, coach_rated_at DESC) WHERE (coach_rating IS NOT NULL);
CREATE INDEX idx_step_ratings_student ON public.student_step_ratings USING btree (student_id);
CREATE INDEX idx_students_academy ON public.students USING btree (academy_id);
CREATE INDEX idx_students_anonymized ON public.students USING btree (anonymized_at) WHERE (anonymized_at IS NOT NULL);
CREATE INDEX idx_students_belt ON public.students USING btree (belt_level);
CREATE INDEX idx_students_hp_access ON public.students USING btree (hp_access) WHERE (hp_access = true);
CREATE INDEX idx_students_ocean_quiz_completed ON public.students USING btree (ocean_quiz_completed_at) WHERE (ocean_quiz_completed_at IS NOT NULL);
CREATE INDEX idx_students_portal_token ON public.students USING btree (portal_token);
CREATE INDEX idx_students_status ON public.students USING btree (status);
CREATE INDEX idx_task_completions_task ON public.task_completions USING btree (task_id);
CREATE INDEX idx_tide_events_date ON public.tide_events USING btree (spot, event_date);
CREATE INDEX idx_week_template_slots_template ON public.week_template_slots USING btree (week_template_id);
CREATE INDEX idx_week_templates_academy ON public.week_templates USING btree (academy_id) WHERE (active_status = true);
CREATE INDEX idx_wts_template ON public.week_template_slots USING btree (week_template_id);
CREATE INDEX level_quiz_attempts_email_idx ON public.level_quiz_attempts USING btree (lower(email));
CREATE INDEX level_quiz_attempts_student_idx ON public.level_quiz_attempts USING btree (student_id, created_at);
CREATE INDEX method_docs_area_idx ON public.method_docs USING btree (area);
CREATE INDEX method_tasks_area_idx ON public.method_tasks USING btree (area, sort_order);
CREATE INDEX model_clips_category_order_idx ON public.model_clips USING btree (category, display_order, created_at);
CREATE INDEX program_appointments_coach_idx ON public.program_appointments USING btree (coach_id, appointment_date) WHERE (status = 'scheduled'::text);
CREATE INDEX program_appointments_student_idx ON public.program_appointments USING btree (student_id, appointment_date) WHERE (status = 'scheduled'::text);
CREATE INDEX program_assignments_coach_active_idx ON public.program_assignments USING btree (coach_id) WHERE (status = 'active'::text);
CREATE INDEX program_assignments_student_active_idx ON public.program_assignments USING btree (student_id) WHERE (status = 'active'::text);
CREATE INDEX program_evaluations_student_idx ON public.program_evaluations USING btree (student_id, eval_date DESC);
CREATE INDEX season_plans_student_idx ON public.season_plans USING btree (student_id) WHERE active;
CREATE INDEX self_training_sessions_sequence_idx ON public.self_training_sessions USING btree (student_id, linked_sequence_id, created_at DESC) WHERE (linked_sequence_id IS NOT NULL);
CREATE INDEX space_bookings_academy_idx ON public.space_bookings USING btree (academy_id);
CREATE INDEX space_bookings_space_time_idx ON public.space_bookings USING btree (space_id, starts_at);
CREATE INDEX students_coach_id_idx ON public.students USING btree (coach_id);
CREATE INDEX water_tests_lookup_idx ON public.water_tests USING btree (student_id, test_key, target_level, tested_at DESC);
CREATE INDEX water_tests_student_idx ON public.water_tests USING btree (student_id, tested_at DESC);
CREATE UNIQUE INDEX idx_service_plans_session ON public.service_plans USING btree (camp_session_id) WHERE (camp_session_id IS NOT NULL);
CREATE UNIQUE INDEX students_coach_id_key ON public.students USING btree (coach_id) WHERE (coach_id IS NOT NULL);
CREATE UNIQUE INDEX uq_academies_coordinator ON public.academies USING btree (assigned_coordinator_id) WHERE (assigned_coordinator_id IS NOT NULL);
CREATE UNIQUE INDEX uq_belt_promo_pending ON public.belt_promotion_recommendations USING btree (student_id, recommended_belt) WHERE (status = 'pending'::text);
CREATE UNIQUE INDEX uq_course_grants_student_course_active ON public.course_grants USING btree (student_id, course_key) WHERE (revoked_at IS NULL);
CREATE UNIQUE INDEX uq_service_staff_coach ON public.service_staff USING btree (camp_instance_id, coach_id) WHERE (coach_id IS NOT NULL);
CREATE UNIQUE INDEX uq_service_staff_member ON public.service_staff USING btree (camp_instance_id, staff_member_id) WHERE (staff_member_id IS NOT NULL);

-- ── 8. Triggers ──
CREATE TRIGGER academies_timestamp BEFORE UPDATE ON public.academies FOR EACH ROW EXECUTE FUNCTION update_academies_timestamp();
CREATE TRIGGER content_videos_timestamp BEFORE UPDATE ON public.content_videos FOR EACH ROW EXECUTE FUNCTION update_content_videos_timestamp();
CREATE TRIGGER lesson_plan_block_timestamp BEFORE UPDATE ON public.lesson_plan_blocks FOR EACH ROW EXECUTE FUNCTION update_lesson_plan_block_timestamp();
CREATE TRIGGER lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION update_lesson_progress_timestamp();
CREATE TRIGGER multi_block_session_timestamp BEFORE UPDATE ON public.multi_block_sessions FOR EACH ROW EXECUTE FUNCTION update_lesson_plan_block_timestamp();
CREATE TRIGGER service_plan_blocks_touch BEFORE UPDATE ON public.service_plan_blocks FOR EACH ROW EXECUTE FUNCTION touch_service_plans_updated_at();
CREATE TRIGGER service_plans_touch BEFORE UPDATE ON public.service_plans FOR EACH ROW EXECUTE FUNCTION touch_service_plans_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.camp_instances FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.camp_sessions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.coaches FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.session_missions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.standalone_sessions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.student_level_access FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.student_solo_sessions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_board_clearance BEFORE UPDATE ON public.board_clearance FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_cascade_sessions BEFORE UPDATE ON public.cascade_sessions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER step_rating_timestamp BEFORE UPDATE ON public.student_step_ratings FOR EACH ROW EXECUTE FUNCTION update_step_rating_timestamp();

-- ── 9. Row Level Security ──
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_course_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_template_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_impersonations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_diet_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_heats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.belt_promotion_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_clearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_daily_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_experience_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_final_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_scheduled_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_student_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_template_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_template_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cascade_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_criterion_evals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_pay_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_resource_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_final_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_final_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_section_intros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drills_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dropdown_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heat_waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hp_athlete_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hp_athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hp_deep_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hp_session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hp_team_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plan_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.method_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.method_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multi_block_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocean_level_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocean_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilar_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_block_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_day_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_item_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_video_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresher_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_plan_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standalone_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_level_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_resource_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_sequence_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_session_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_solo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_step_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tide_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_template_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage camp_scheduled_evaluations" ON public.camp_scheduled_evaluations AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage camp_student_customizations" ON public.camp_student_customizations AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read dropdown_options" ON public.dropdown_options AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Authenticated users can read pilar_parts" ON public.pilar_parts AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Authenticated users can read rating_scales" ON public.rating_scales AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Coach manages board clearance" ON public.board_clearance AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
CREATE POLICY "Coach sees own cascade sessions" ON public.cascade_sessions AS PERMISSIVE FOR ALL TO public USING ((coach_id IN ( SELECT coaches.id
CREATE POLICY "model_clips public read" ON public.model_clips AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY academies_modify ON public.academies AS PERMISSIVE FOR ALL TO authenticated USING (current_coach_is_platform_admin()) WITH CHECK (current_coach_is_platform_admin());
CREATE POLICY academies_select ON public.academies AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY academy_course_prices_delete ON public.academy_course_prices AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY academy_course_prices_insert ON public.academy_course_prices AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY academy_course_prices_select ON public.academy_course_prices AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id())));
CREATE POLICY academy_course_prices_update ON public.academy_course_prices AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY academy_spaces_all ON public.academy_spaces AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY academy_template_assignments_select ON public.academy_template_assignments AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY academy_template_assignments_write ON public.academy_template_assignments AS PERMISSIVE FOR ALL TO public USING (current_coach_is_platform_admin()) WITH CHECK (current_coach_is_platform_admin());
CREATE POLICY access_codes_auth ON public.access_codes AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY audit_log_delete ON public.audit_log AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY audit_log_insert ON public.audit_log AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY audit_log_select ON public.audit_log AS PERMISSIVE FOR SELECT TO public USING (current_coach_is_platform_admin());
CREATE POLICY audit_log_update ON public.audit_log AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY board_rentals_authenticated_all ON public.board_rentals AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY board_usages_all ON public.board_usages AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY boards_all ON public.boards AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY camp_daily_feedback_delete ON public.camp_daily_feedback AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY camp_daily_feedback_insert ON public.camp_daily_feedback AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY camp_daily_feedback_select ON public.camp_daily_feedback AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY camp_daily_feedback_update ON public.camp_daily_feedback AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY camp_final_evaluations_delete ON public.camp_final_evaluations AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY camp_final_evaluations_insert ON public.camp_final_evaluations AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY camp_final_evaluations_select ON public.camp_final_evaluations AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY camp_final_evaluations_update ON public.camp_final_evaluations AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY camp_instances_modify ON public.camp_instances AS PERMISSIVE FOR ALL TO authenticated USING ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id()))) WITH CHECK ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id())));
CREATE POLICY camp_instances_select ON public.camp_instances AS PERMISSIVE FOR SELECT TO authenticated USING ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id())));
CREATE POLICY camp_participants_delete ON public.camp_participants AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY camp_participants_insert ON public.camp_participants AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY camp_participants_select ON public.camp_participants AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY camp_participants_update ON public.camp_participants AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY camp_sessions_delete ON public.camp_sessions AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY camp_sessions_insert ON public.camp_sessions AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY camp_sessions_select ON public.camp_sessions AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (camp_instance_id IN ( SELECT camp_instances.id
CREATE POLICY camp_sessions_update ON public.camp_sessions AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY camp_template_blocks_delete ON public.camp_template_blocks AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY camp_template_blocks_insert ON public.camp_template_blocks AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY camp_template_blocks_select ON public.camp_template_blocks AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY camp_template_blocks_update ON public.camp_template_blocks AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY camp_template_days_delete ON public.camp_template_days AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY camp_template_days_insert ON public.camp_template_days AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY camp_template_days_select ON public.camp_template_days AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY camp_template_days_update ON public.camp_template_days AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY camp_templates_modify ON public.camp_templates AS PERMISSIVE FOR ALL TO authenticated USING ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id()))) WITH CHECK ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id())));
CREATE POLICY camp_templates_select ON public.camp_templates AS PERMISSIVE FOR SELECT TO authenticated USING (((academy_id IS NULL) OR current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id())));
CREATE POLICY cfq_auth ON public.course_final_quiz AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY cfqa_auth ON public.course_final_quiz_attempts AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY coach_certifications_delete ON public.coach_certifications AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY coach_certifications_insert ON public.coach_certifications AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY coach_certifications_select ON public.coach_certifications AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (coach_id IN ( SELECT coaches.id
CREATE POLICY coach_certifications_update ON public.coach_certifications AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY coach_criterion_evals_select ON public.coach_criterion_evals AS PERMISSIVE FOR SELECT TO authenticated USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY coach_evaluations_delete ON public.coach_evaluations AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY coach_evaluations_insert ON public.coach_evaluations AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY coach_evaluations_select ON public.coach_evaluations AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (coach_id IN ( SELECT coaches.id
CREATE POLICY coach_evaluations_update ON public.coach_evaluations AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY coach_lesson_progress_all ON public.coach_lesson_progress AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY coaches_modify ON public.coaches AS PERMISSIVE FOR ALL TO authenticated USING ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id()))) WITH CHECK ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id())));
CREATE POLICY coaches_select ON public.coaches AS PERMISSIVE FOR SELECT TO authenticated USING ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id())));
CREATE POLICY coaches_self ON public.coaches AS PERMISSIVE FOR SELECT TO authenticated USING ((auth_user_id = auth.uid()));
CREATE POLICY content_videos_all ON public.content_videos AS PERMISSIVE FOR ALL TO public USING (true);
CREATE POLICY drills_delete ON public.drills AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY drills_insert ON public.drills AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY drills_missions_public_read ON public.drills_missions AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY drills_select ON public.drills AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY drills_update ON public.drills AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY lesson_plan_blocks_all ON public.lesson_plan_blocks AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY lessons_public_read ON public.lessons AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY model_clips_read ON public.model_clips AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY multi_block_sessions_all ON public.multi_block_sessions AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY notifications_select ON public.notifications AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (recipient_coach_id = ( SELECT coaches.id
CREATE POLICY notifications_write ON public.notifications AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY ocean_level_evaluations_delete ON public.ocean_level_evaluations AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY ocean_level_evaluations_insert ON public.ocean_level_evaluations AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY ocean_level_evaluations_select ON public.ocean_level_evaluations AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY ocean_level_evaluations_update ON public.ocean_level_evaluations AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY ocean_rules_delete ON public.ocean_rules AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY ocean_rules_insert ON public.ocean_rules AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY ocean_rules_select ON public.ocean_rules AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY ocean_rules_update ON public.ocean_rules AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY progress_all ON public.lesson_progress AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY quizzes_public_read ON public.lesson_quizzes AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY refresher_charges_delete ON public.refresher_charges AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY refresher_charges_insert ON public.refresher_charges AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY refresher_charges_select ON public.refresher_charges AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id())));
CREATE POLICY refresher_charges_update ON public.refresher_charges AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY section_intros_auth_all ON public.course_section_intros AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY self_training_sessions_delete ON public.self_training_sessions AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY self_training_sessions_insert ON public.self_training_sessions AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY self_training_sessions_select ON public.self_training_sessions AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY self_training_sessions_update ON public.self_training_sessions AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY sequence_evaluations_delete ON public.sequence_evaluations AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY sequence_evaluations_insert ON public.sequence_evaluations AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY sequence_evaluations_select ON public.sequence_evaluations AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY sequence_evaluations_update ON public.sequence_evaluations AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY sequences_delete ON public.sequences AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY sequences_insert ON public.sequences AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY sequences_select ON public.sequences AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY sequences_update ON public.sequences AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY service_plan_blocks_all ON public.service_plan_blocks AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY service_plans_all ON public.service_plans AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY service_staff_all ON public.service_staff AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY session_incidents_all ON public.session_incidents AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY session_missions_delete ON public.session_missions AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY session_missions_insert ON public.session_missions AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY session_missions_select ON public.session_missions AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (standalone_session_id IN ( SELECT standalone_sessions.id
CREATE POLICY session_missions_update ON public.session_missions AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY space_bookings_all ON public.space_bookings AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY staff_members_all ON public.staff_members AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY standalone_sessions_delete ON public.standalone_sessions AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY standalone_sessions_insert ON public.standalone_sessions AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY standalone_sessions_select ON public.standalone_sessions AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY standalone_sessions_update ON public.standalone_sessions AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY student_level_access_delete ON public.student_level_access AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY student_level_access_insert ON public.student_level_access AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY student_level_access_select ON public.student_level_access AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY student_level_access_update ON public.student_level_access AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY student_sequence_ratings_select ON public.student_sequence_ratings AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY student_sequence_ratings_service_all ON public.student_sequence_ratings AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY student_session_results_delete ON public.student_session_results AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY student_session_results_insert ON public.student_session_results AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY student_session_results_select ON public.student_session_results AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY student_session_results_update ON public.student_session_results AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY student_solo_sessions_delete ON public.student_solo_sessions AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY student_solo_sessions_insert ON public.student_solo_sessions AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY student_solo_sessions_select ON public.student_solo_sessions AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY student_solo_sessions_update ON public.student_solo_sessions AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY student_step_ratings_delete ON public.student_step_ratings AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY student_step_ratings_insert ON public.student_step_ratings AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY student_step_ratings_select ON public.student_step_ratings AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY student_step_ratings_update ON public.student_step_ratings AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY students_modify ON public.students AS PERMISSIVE FOR ALL TO authenticated USING ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id()))) WITH CHECK ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id())));
CREATE POLICY students_select ON public.students AS PERMISSIVE FOR SELECT TO authenticated USING ((current_coach_is_platform_admin() OR (academy_id = current_coach_academy_id())));
CREATE POLICY survey_responses_delete ON public.survey_responses AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY survey_responses_insert ON public.survey_responses AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY survey_responses_select ON public.survey_responses AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (student_id IN ( SELECT students.id
CREATE POLICY survey_responses_update ON public.survey_responses AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY tide_events_delete ON public.tide_events AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY tide_events_insert ON public.tide_events AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY tide_events_select ON public.tide_events AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY tide_events_update ON public.tide_events AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY water_tests_service_all ON public.water_tests AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY week_template_slots_delete ON public.week_template_slots AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY week_template_slots_insert ON public.week_template_slots AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY week_template_slots_select ON public.week_template_slots AS PERMISSIVE FOR SELECT TO public USING ((week_template_id IN ( SELECT week_templates.id
CREATE POLICY week_template_slots_update ON public.week_template_slots AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY week_templates_delete ON public.week_templates AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY week_templates_insert ON public.week_templates AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY week_templates_select ON public.week_templates AS PERMISSIVE FOR SELECT TO public USING ((current_coach_is_platform_admin() OR (academy_id IS NULL) OR (academy_id = current_coach_academy_id())));
CREATE POLICY week_templates_update ON public.week_templates AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);

-- ── 10. Buckets de storage ──
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('coach-presentations', 'coach-presentations', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('method-vault', 'method-vault', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('rental-ids', 'rental-ids', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('tss-library', 'tss-library', true) ON CONFLICT (id) DO NOTHING;

-- ── 11. Jobs de pg_cron (además de los crons de Vercel en vercel.json) ──
SELECT cron.schedule('notify-overdue-tasks', '0 14 * * *', 'SELECT notify_overdue_tasks();');
SELECT cron.schedule('notify-upcoming-services', '0 14 * * *', 'SELECT notify_upcoming_services();');
