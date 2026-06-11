-- M94 — RLS hardening: enable RLS + scoped SELECT on 19 tables.
-- Writes stay permissive (split INSERT/UPDATE/DELETE, NOT FOR ALL, so
-- they don't clobber the scoped SELECT). Public pages use the admin
-- client (bypasses RLS) so they are unaffected.

-- camp_daily_feedback
ALTER TABLE camp_daily_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS camp_daily_feedback_select ON camp_daily_feedback;
DROP POLICY IF EXISTS camp_daily_feedback_insert ON camp_daily_feedback;
DROP POLICY IF EXISTS camp_daily_feedback_update ON camp_daily_feedback;
DROP POLICY IF EXISTS camp_daily_feedback_delete ON camp_daily_feedback;
DROP POLICY IF EXISTS camp_daily_feedback_write ON camp_daily_feedback;
DROP POLICY IF EXISTS camp_daily_feedback_all ON camp_daily_feedback;
CREATE POLICY camp_daily_feedback_select ON camp_daily_feedback FOR SELECT USING (current_coach_is_platform_admin() OR student_id IN (SELECT id FROM students WHERE academy_id = current_coach_academy_id()));
CREATE POLICY camp_daily_feedback_insert ON camp_daily_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY camp_daily_feedback_update ON camp_daily_feedback FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY camp_daily_feedback_delete ON camp_daily_feedback FOR DELETE USING (true);

-- camp_final_evaluations
ALTER TABLE camp_final_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS camp_final_evaluations_select ON camp_final_evaluations;
DROP POLICY IF EXISTS camp_final_evaluations_insert ON camp_final_evaluations;
DROP POLICY IF EXISTS camp_final_evaluations_update ON camp_final_evaluations;
DROP POLICY IF EXISTS camp_final_evaluations_delete ON camp_final_evaluations;
DROP POLICY IF EXISTS camp_final_evaluations_write ON camp_final_evaluations;
DROP POLICY IF EXISTS camp_final_evaluations_all ON camp_final_evaluations;
CREATE POLICY camp_final_evaluations_select ON camp_final_evaluations FOR SELECT USING (current_coach_is_platform_admin() OR student_id IN (SELECT id FROM students WHERE academy_id = current_coach_academy_id()));
CREATE POLICY camp_final_evaluations_insert ON camp_final_evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY camp_final_evaluations_update ON camp_final_evaluations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY camp_final_evaluations_delete ON camp_final_evaluations FOR DELETE USING (true);

-- camp_participants
ALTER TABLE camp_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS camp_participants_select ON camp_participants;
DROP POLICY IF EXISTS camp_participants_insert ON camp_participants;
DROP POLICY IF EXISTS camp_participants_update ON camp_participants;
DROP POLICY IF EXISTS camp_participants_delete ON camp_participants;
DROP POLICY IF EXISTS camp_participants_write ON camp_participants;
DROP POLICY IF EXISTS camp_participants_all ON camp_participants;
CREATE POLICY camp_participants_select ON camp_participants FOR SELECT USING (current_coach_is_platform_admin() OR student_id IN (SELECT id FROM students WHERE academy_id = current_coach_academy_id()));
CREATE POLICY camp_participants_insert ON camp_participants FOR INSERT WITH CHECK (true);
CREATE POLICY camp_participants_update ON camp_participants FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY camp_participants_delete ON camp_participants FOR DELETE USING (true);

-- ocean_level_evaluations
ALTER TABLE ocean_level_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ocean_level_evaluations_select ON ocean_level_evaluations;
DROP POLICY IF EXISTS ocean_level_evaluations_insert ON ocean_level_evaluations;
DROP POLICY IF EXISTS ocean_level_evaluations_update ON ocean_level_evaluations;
DROP POLICY IF EXISTS ocean_level_evaluations_delete ON ocean_level_evaluations;
DROP POLICY IF EXISTS ocean_level_evaluations_write ON ocean_level_evaluations;
DROP POLICY IF EXISTS ocean_level_evaluations_all ON ocean_level_evaluations;
CREATE POLICY ocean_level_evaluations_select ON ocean_level_evaluations FOR SELECT USING (current_coach_is_platform_admin() OR student_id IN (SELECT id FROM students WHERE academy_id = current_coach_academy_id()));
CREATE POLICY ocean_level_evaluations_insert ON ocean_level_evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY ocean_level_evaluations_update ON ocean_level_evaluations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY ocean_level_evaluations_delete ON ocean_level_evaluations FOR DELETE USING (true);

-- sequence_evaluations
ALTER TABLE sequence_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sequence_evaluations_select ON sequence_evaluations;
DROP POLICY IF EXISTS sequence_evaluations_insert ON sequence_evaluations;
DROP POLICY IF EXISTS sequence_evaluations_update ON sequence_evaluations;
DROP POLICY IF EXISTS sequence_evaluations_delete ON sequence_evaluations;
DROP POLICY IF EXISTS sequence_evaluations_write ON sequence_evaluations;
DROP POLICY IF EXISTS sequence_evaluations_all ON sequence_evaluations;
CREATE POLICY sequence_evaluations_select ON sequence_evaluations FOR SELECT USING (current_coach_is_platform_admin() OR student_id IN (SELECT id FROM students WHERE academy_id = current_coach_academy_id()));
CREATE POLICY sequence_evaluations_insert ON sequence_evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY sequence_evaluations_update ON sequence_evaluations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY sequence_evaluations_delete ON sequence_evaluations FOR DELETE USING (true);

-- self_training_sessions
ALTER TABLE self_training_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS self_training_sessions_select ON self_training_sessions;
DROP POLICY IF EXISTS self_training_sessions_insert ON self_training_sessions;
DROP POLICY IF EXISTS self_training_sessions_update ON self_training_sessions;
DROP POLICY IF EXISTS self_training_sessions_delete ON self_training_sessions;
DROP POLICY IF EXISTS self_training_sessions_write ON self_training_sessions;
DROP POLICY IF EXISTS self_training_sessions_all ON self_training_sessions;
CREATE POLICY self_training_sessions_select ON self_training_sessions FOR SELECT USING (current_coach_is_platform_admin() OR student_id IN (SELECT id FROM students WHERE academy_id = current_coach_academy_id()));
CREATE POLICY self_training_sessions_insert ON self_training_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY self_training_sessions_update ON self_training_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY self_training_sessions_delete ON self_training_sessions FOR DELETE USING (true);

-- student_level_access
ALTER TABLE student_level_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS student_level_access_select ON student_level_access;
DROP POLICY IF EXISTS student_level_access_insert ON student_level_access;
DROP POLICY IF EXISTS student_level_access_update ON student_level_access;
DROP POLICY IF EXISTS student_level_access_delete ON student_level_access;
DROP POLICY IF EXISTS student_level_access_write ON student_level_access;
DROP POLICY IF EXISTS student_level_access_all ON student_level_access;
CREATE POLICY student_level_access_select ON student_level_access FOR SELECT USING (current_coach_is_platform_admin() OR student_id IN (SELECT id FROM students WHERE academy_id = current_coach_academy_id()));
CREATE POLICY student_level_access_insert ON student_level_access FOR INSERT WITH CHECK (true);
CREATE POLICY student_level_access_update ON student_level_access FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY student_level_access_delete ON student_level_access FOR DELETE USING (true);

-- student_solo_sessions
ALTER TABLE student_solo_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS student_solo_sessions_select ON student_solo_sessions;
DROP POLICY IF EXISTS student_solo_sessions_insert ON student_solo_sessions;
DROP POLICY IF EXISTS student_solo_sessions_update ON student_solo_sessions;
DROP POLICY IF EXISTS student_solo_sessions_delete ON student_solo_sessions;
DROP POLICY IF EXISTS student_solo_sessions_write ON student_solo_sessions;
DROP POLICY IF EXISTS student_solo_sessions_all ON student_solo_sessions;
CREATE POLICY student_solo_sessions_select ON student_solo_sessions FOR SELECT USING (current_coach_is_platform_admin() OR student_id IN (SELECT id FROM students WHERE academy_id = current_coach_academy_id()));
CREATE POLICY student_solo_sessions_insert ON student_solo_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY student_solo_sessions_update ON student_solo_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY student_solo_sessions_delete ON student_solo_sessions FOR DELETE USING (true);

-- standalone_sessions
ALTER TABLE standalone_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS standalone_sessions_select ON standalone_sessions;
DROP POLICY IF EXISTS standalone_sessions_insert ON standalone_sessions;
DROP POLICY IF EXISTS standalone_sessions_update ON standalone_sessions;
DROP POLICY IF EXISTS standalone_sessions_delete ON standalone_sessions;
DROP POLICY IF EXISTS standalone_sessions_write ON standalone_sessions;
DROP POLICY IF EXISTS standalone_sessions_all ON standalone_sessions;
CREATE POLICY standalone_sessions_select ON standalone_sessions FOR SELECT USING (current_coach_is_platform_admin() OR student_id IN (SELECT id FROM students WHERE academy_id = current_coach_academy_id()));
CREATE POLICY standalone_sessions_insert ON standalone_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY standalone_sessions_update ON standalone_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY standalone_sessions_delete ON standalone_sessions FOR DELETE USING (true);

-- coach_certifications
ALTER TABLE coach_certifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coach_certifications_select ON coach_certifications;
DROP POLICY IF EXISTS coach_certifications_insert ON coach_certifications;
DROP POLICY IF EXISTS coach_certifications_update ON coach_certifications;
DROP POLICY IF EXISTS coach_certifications_delete ON coach_certifications;
DROP POLICY IF EXISTS coach_certifications_write ON coach_certifications;
DROP POLICY IF EXISTS coach_certifications_all ON coach_certifications;
CREATE POLICY coach_certifications_select ON coach_certifications FOR SELECT USING (current_coach_is_platform_admin() OR coach_id IN (SELECT id FROM coaches WHERE academy_id = current_coach_academy_id()));
CREATE POLICY coach_certifications_insert ON coach_certifications FOR INSERT WITH CHECK (true);
CREATE POLICY coach_certifications_update ON coach_certifications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY coach_certifications_delete ON coach_certifications FOR DELETE USING (true);

-- coach_evaluations
ALTER TABLE coach_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coach_evaluations_select ON coach_evaluations;
DROP POLICY IF EXISTS coach_evaluations_insert ON coach_evaluations;
DROP POLICY IF EXISTS coach_evaluations_update ON coach_evaluations;
DROP POLICY IF EXISTS coach_evaluations_delete ON coach_evaluations;
DROP POLICY IF EXISTS coach_evaluations_write ON coach_evaluations;
DROP POLICY IF EXISTS coach_evaluations_all ON coach_evaluations;
CREATE POLICY coach_evaluations_select ON coach_evaluations FOR SELECT USING (current_coach_is_platform_admin() OR coach_id IN (SELECT id FROM coaches WHERE academy_id = current_coach_academy_id()));
CREATE POLICY coach_evaluations_insert ON coach_evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY coach_evaluations_update ON coach_evaluations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY coach_evaluations_delete ON coach_evaluations FOR DELETE USING (true);

-- camp_sessions
ALTER TABLE camp_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS camp_sessions_select ON camp_sessions;
DROP POLICY IF EXISTS camp_sessions_insert ON camp_sessions;
DROP POLICY IF EXISTS camp_sessions_update ON camp_sessions;
DROP POLICY IF EXISTS camp_sessions_delete ON camp_sessions;
DROP POLICY IF EXISTS camp_sessions_write ON camp_sessions;
DROP POLICY IF EXISTS camp_sessions_all ON camp_sessions;
CREATE POLICY camp_sessions_select ON camp_sessions FOR SELECT USING (current_coach_is_platform_admin() OR camp_instance_id IN (SELECT id FROM camp_instances WHERE academy_id = current_coach_academy_id()));
CREATE POLICY camp_sessions_insert ON camp_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY camp_sessions_update ON camp_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY camp_sessions_delete ON camp_sessions FOR DELETE USING (true);

-- session_missions
ALTER TABLE session_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS session_missions_select ON session_missions;
DROP POLICY IF EXISTS session_missions_insert ON session_missions;
DROP POLICY IF EXISTS session_missions_update ON session_missions;
DROP POLICY IF EXISTS session_missions_delete ON session_missions;
DROP POLICY IF EXISTS session_missions_write ON session_missions;
DROP POLICY IF EXISTS session_missions_all ON session_missions;
CREATE POLICY session_missions_select ON session_missions FOR SELECT USING (current_coach_is_platform_admin() OR standalone_session_id IN (SELECT id FROM standalone_sessions WHERE student_id IN (SELECT id FROM students WHERE academy_id = current_coach_academy_id())));
CREATE POLICY session_missions_insert ON session_missions FOR INSERT WITH CHECK (true);
CREATE POLICY session_missions_update ON session_missions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY session_missions_delete ON session_missions FOR DELETE USING (true);

-- camp_template_blocks
ALTER TABLE camp_template_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS camp_template_blocks_select ON camp_template_blocks;
DROP POLICY IF EXISTS camp_template_blocks_insert ON camp_template_blocks;
DROP POLICY IF EXISTS camp_template_blocks_update ON camp_template_blocks;
DROP POLICY IF EXISTS camp_template_blocks_delete ON camp_template_blocks;
DROP POLICY IF EXISTS camp_template_blocks_write ON camp_template_blocks;
DROP POLICY IF EXISTS camp_template_blocks_all ON camp_template_blocks;
CREATE POLICY camp_template_blocks_select ON camp_template_blocks FOR SELECT USING (true);
CREATE POLICY camp_template_blocks_insert ON camp_template_blocks FOR INSERT WITH CHECK (true);
CREATE POLICY camp_template_blocks_update ON camp_template_blocks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY camp_template_blocks_delete ON camp_template_blocks FOR DELETE USING (true);

-- camp_template_days
ALTER TABLE camp_template_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS camp_template_days_select ON camp_template_days;
DROP POLICY IF EXISTS camp_template_days_insert ON camp_template_days;
DROP POLICY IF EXISTS camp_template_days_update ON camp_template_days;
DROP POLICY IF EXISTS camp_template_days_delete ON camp_template_days;
DROP POLICY IF EXISTS camp_template_days_write ON camp_template_days;
DROP POLICY IF EXISTS camp_template_days_all ON camp_template_days;
CREATE POLICY camp_template_days_select ON camp_template_days FOR SELECT USING (true);
CREATE POLICY camp_template_days_insert ON camp_template_days FOR INSERT WITH CHECK (true);
CREATE POLICY camp_template_days_update ON camp_template_days FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY camp_template_days_delete ON camp_template_days FOR DELETE USING (true);

-- drills
ALTER TABLE drills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS drills_select ON drills;
DROP POLICY IF EXISTS drills_insert ON drills;
DROP POLICY IF EXISTS drills_update ON drills;
DROP POLICY IF EXISTS drills_delete ON drills;
DROP POLICY IF EXISTS drills_write ON drills;
DROP POLICY IF EXISTS drills_all ON drills;
CREATE POLICY drills_select ON drills FOR SELECT USING (true);
CREATE POLICY drills_insert ON drills FOR INSERT WITH CHECK (true);
CREATE POLICY drills_update ON drills FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY drills_delete ON drills FOR DELETE USING (true);

-- ocean_rules
ALTER TABLE ocean_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ocean_rules_select ON ocean_rules;
DROP POLICY IF EXISTS ocean_rules_insert ON ocean_rules;
DROP POLICY IF EXISTS ocean_rules_update ON ocean_rules;
DROP POLICY IF EXISTS ocean_rules_delete ON ocean_rules;
DROP POLICY IF EXISTS ocean_rules_write ON ocean_rules;
DROP POLICY IF EXISTS ocean_rules_all ON ocean_rules;
CREATE POLICY ocean_rules_select ON ocean_rules FOR SELECT USING (true);
CREATE POLICY ocean_rules_insert ON ocean_rules FOR INSERT WITH CHECK (true);
CREATE POLICY ocean_rules_update ON ocean_rules FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY ocean_rules_delete ON ocean_rules FOR DELETE USING (true);

-- sequences
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sequences_select ON sequences;
DROP POLICY IF EXISTS sequences_insert ON sequences;
DROP POLICY IF EXISTS sequences_update ON sequences;
DROP POLICY IF EXISTS sequences_delete ON sequences;
DROP POLICY IF EXISTS sequences_write ON sequences;
DROP POLICY IF EXISTS sequences_all ON sequences;
CREATE POLICY sequences_select ON sequences FOR SELECT USING (true);
CREATE POLICY sequences_insert ON sequences FOR INSERT WITH CHECK (true);
CREATE POLICY sequences_update ON sequences FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY sequences_delete ON sequences FOR DELETE USING (true);

-- audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_log_select ON audit_log;
DROP POLICY IF EXISTS audit_log_insert ON audit_log;
DROP POLICY IF EXISTS audit_log_update ON audit_log;
DROP POLICY IF EXISTS audit_log_delete ON audit_log;
DROP POLICY IF EXISTS audit_log_write ON audit_log;
DROP POLICY IF EXISTS audit_log_all ON audit_log;
CREATE POLICY audit_log_select ON audit_log FOR SELECT USING (current_coach_is_platform_admin());
CREATE POLICY audit_log_insert ON audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY audit_log_update ON audit_log FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY audit_log_delete ON audit_log FOR DELETE USING (true);

-- Fix prior FOR ALL write policies that negated scoped SELECT
DROP POLICY IF EXISTS student_session_results_write ON student_session_results;
CREATE POLICY student_session_results_insert ON student_session_results FOR INSERT WITH CHECK (true);
CREATE POLICY student_session_results_update ON student_session_results FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY student_session_results_delete ON student_session_results FOR DELETE USING (true);
DROP POLICY IF EXISTS survey_responses_write ON survey_responses;
CREATE POLICY survey_responses_insert ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY survey_responses_update ON survey_responses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY survey_responses_delete ON survey_responses FOR DELETE USING (true);
DROP POLICY IF EXISTS student_step_ratings_write ON student_step_ratings;
CREATE POLICY student_step_ratings_insert ON student_step_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY student_step_ratings_update ON student_step_ratings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY student_step_ratings_delete ON student_step_ratings FOR DELETE USING (true);

DROP POLICY IF EXISTS academy_course_prices_write ON academy_course_prices;
CREATE POLICY academy_course_prices_insert ON academy_course_prices FOR INSERT WITH CHECK (true);
CREATE POLICY academy_course_prices_update ON academy_course_prices FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY academy_course_prices_delete ON academy_course_prices FOR DELETE USING (true);
DROP POLICY IF EXISTS week_templates_write ON week_templates;
CREATE POLICY week_templates_insert ON week_templates FOR INSERT WITH CHECK (true);
CREATE POLICY week_templates_update ON week_templates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY week_templates_delete ON week_templates FOR DELETE USING (true);
DROP POLICY IF EXISTS week_template_slots_write ON week_template_slots;
CREATE POLICY week_template_slots_insert ON week_template_slots FOR INSERT WITH CHECK (true);
CREATE POLICY week_template_slots_update ON week_template_slots FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY week_template_slots_delete ON week_template_slots FOR DELETE USING (true);
