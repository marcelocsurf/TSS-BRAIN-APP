-- 00001_enums.sql
-- TSS Brain Stage 1 — Enum Types
-- Canon-aligned: belt_level uses English canonical names, pilar excludes safety

CREATE TYPE belt_level AS ENUM (
  'white_belt', 'yellow_belt', 'blue_belt',
  'purple_belt', 'brown_belt', 'black_belt'
);

CREATE TYPE ocean_condition AS ENUM (
  'flat', '1_2ft', '3_4ft', '4_6ft', '6_plus'
);

-- Core Canon A.8: Four Pillars. Safety is NOT a pilar (A.9).
CREATE TYPE pilar AS ENUM (
  'technical', 'physical', 'tactical', 'mental'
);

CREATE TYPE session_status AS ENUM (
  'not_yet', 'partial', 'competent', 'mastered'
);

CREATE TYPE completion_state AS ENUM (
  'draft', 'in_progress', 'closed', 'survey_completed'
);

CREATE TYPE risk_state AS ENUM (
  'safe', 'alert', 'blocked'
);

CREATE TYPE coach_role AS ENUM (
  'ayudante', 'instructor', 'coach', 'head_coach', 'holistic_coach'
);

CREATE TYPE camp_modality AS ENUM (
  'individual', 'group'
);

CREATE TYPE camp_status AS ENUM (
  'draft', 'planned', 'active', 'completed', 'cancelled'
);

CREATE TYPE enrollment_status AS ENUM (
  'active', 'paused', 'completed', 'cancelled'
);
