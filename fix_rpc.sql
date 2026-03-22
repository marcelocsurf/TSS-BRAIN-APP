-- ═══════════════════════════════════════════════════════════════
-- FIX: Recreate save_cascade_session RPC with ALL parameters
-- that createCascadeSession() in cascade-sessions.ts sends.
-- Run this in Supabase SQL editor if the RPC is missing params.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION save_cascade_session(
  p_coach_id uuid,
  p_student_id uuid,
  p_belt_level_snapshot text,
  p_ocean_level_snapshot text,
  p_training_venue text,
  p_ocean_conditions text,
  p_ocean_risk_state text,
  p_session_type text,
  p_session_date text,
  p_session_time text,
  p_pilar_part_id uuid,
  p_pilar_id_snapshot text,
  p_mission_type text,
  p_mission text,
  p_drill_id text,
  p_warm_up text,
  p_simulation text,
  p_mental_hack text,
  p_mission_time text,
  p_repetitions int,
  p_status text,
  p_focus_rating int,
  p_frustration_rating int,
  p_composure_rating int,
  p_control_rating int,
  p_autonomy_rating int,
  p_linking_rating int,
  p_commitment_rating int,
  p_variety_rating int,
  p_precision_rating int,
  p_knowledge_rating int,
  p_integration_rating int,
  p_coach_feedback_quick text,
  p_coach_feedback_text text,
  p_achieved text,
  p_whats_next_pilar_part_id uuid,
  p_homework_cues text[],
  p_homework_text text,
  p_total_duration text,
  p_incident_report boolean,
  p_incident_type text,
  p_incident_description text,
  p_incident_action_taken text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    last_session_date = p_session_date,
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
$$;
