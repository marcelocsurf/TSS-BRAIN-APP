-- 00004_functions.sql
-- Critical function: update student profile snapshots on session close

CREATE OR REPLACE FUNCTION update_student_profile_on_close(
  p_student_id UUID,
  p_session_result_id UUID,
  p_session_date TIMESTAMPTZ,
  p_mission TEXT,
  p_pilar pilar,
  p_status session_status,
  p_homework TEXT,
  p_whats_next TEXT
) RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
