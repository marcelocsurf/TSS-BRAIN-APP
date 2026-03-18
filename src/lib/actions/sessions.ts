'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateMandatoryFields } from '@/lib/validations/session-close';
import { revalidatePath } from 'next/cache';
import type { BeltLevel } from '@/lib/constants/belts';
import type { OceanCondition, Pilar, SessionStatus } from '@/lib/constants/brand';

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

export interface MissionInput {
  sort_order: number;
  pilar_part: string;
  pilar: string | null;
  drill_id: string;
  mission: string;
  warm_up: string;
  simulation: string;
  mental_hack: string;
  mission_time: string;
  repetitions?: number;
  // Evaluation (filled in Moment 3)
  status: SessionStatus | '';
  focus_rating: number;
  coach_notes: string;
}

export interface SessionDraftInput {
  student_id: string;
  session_date: string;
  session_time: string;
  training_venue: string;
  ocean_conditions: OceanCondition;
  risk_state: 'safe' | 'alert' | 'blocked';
  is_safety_layer: boolean;
  session_type: string;
  duration_minutes?: number;
  execution_notes?: string;
}

export interface SessionEvalInput {
  coach_feedback: string;
  internal_notes?: string;
  whats_next: string;
  homework: string;
  frustration_rating: number;
  incident_type?: string;
  incident_description?: string;
  incident_action?: string;
}

// ═══════════════════════════════════════
// GET CURRENT COACH
// ═══════════════════════════════════════

export async function getCurrentCoach() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: coach, error } = await supabase
    .from('coaches')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (error || !coach) throw new Error('Coach record not found');
  return coach;
}

// ═══════════════════════════════════════
// GET OCEAN RULES
// ═══════════════════════════════════════

export async function getOceanRules() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ocean_rules')
    .select('*');
  if (error) throw new Error(error.message);
  return data;
}

// ═══════════════════════════════════════
// GET PILAR PARTS FOR BELT (Cascade Step 6)
// ═══════════════════════════════════════

export async function getPilarPartsForBelt(beltLevel: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_pilar_parts_for_belt', { p_belt_key: beltLevel });

  if (error) throw new Error(error.message);
  return data as { id: string; pilar: string; part_name: string }[];
}

// ═══════════════════════════════════════
// GET DRILLS FILTERED (Cascade Step 8)
// ═══════════════════════════════════════

export async function getDrillsFiltered(input: {
  beltLevel: string;
  pilarPart?: string;
  isWaterVenue?: boolean;
}) {
  const supabase = await createClient();
  const { data: allDrills, error } = await supabase
    .rpc('get_drills_for_belt', { p_belt_key: input.beltLevel });

  if (error) throw new Error(error.message);

  let filtered = allDrills || [];

  if (input.pilarPart) {
    filtered = filtered.filter((d: any) => d.pilar_part === input.pilarPart);
  }

  if (input.isWaterVenue === false) {
    filtered = filtered.filter((d: any) =>
      d.environment === 'Beach' || d.environment === 'Land' || d.environment === 'Gym' || !d.environment
    );
  }

  return filtered.map((d: any) => ({
    id: d.id,
    drill_name: d.drill_name,
    pilar_part: d.pilar_part,
    drill_type: d.drill_type,
    key_cue: d.key_cue,
    goal: d.goal,
    environment: d.environment,
    related_pilar: d.related_pilar,
    is_safety_layer: d.is_safety_layer,
  }));
}

// ═══════════════════════════════════════
// SEARCH DRILLS (legacy)
// ═══════════════════════════════════════

export async function searchDrills(query: string, pilar?: string) {
  const supabase = await createClient();
  let q = supabase
    .from('drills')
    .select('id, drill_name, related_pilar, pilar_part, drill_type, key_cue, belt_level_range, is_safety_layer')
    .eq('active_status', true)
    .limit(20);

  if (query) {
    q = q.or(`drill_name.ilike.%${query}%,pilar_part.ilike.%${query}%,key_cue.ilike.%${query}%`);
  }
  if (pilar) {
    q = q.eq('related_pilar', pilar);
  }

  const { data, error } = await q.order('drill_name');
  if (error) throw new Error(error.message);
  return data;
}

// ═══════════════════════════════════════
// CLOSE SESSION (Multi-mission)
// ═══════════════════════════════════════

export async function closeStandaloneSession(
  draft: SessionDraftInput,
  missions: MissionInput[],
  evaluation: SessionEvalInput
) {
  const supabase = await createClient();
  const admin = createAdminClient();

  if (missions.length === 0) throw new Error('At least one mission is required');

  // Validate each mission has status + focus
  for (const m of missions) {
    if (!m.status) throw new Error(`Mission ${m.sort_order} is missing status`);
    if (m.focus_rating < 1) throw new Error(`Mission ${m.sort_order} is missing focus rating`);
  }

  // Validate session-level fields
  if (!evaluation.coach_feedback || evaluation.coach_feedback.trim().length < 10)
    throw new Error('Coach feedback must be at least 10 characters');
  if (!evaluation.whats_next || evaluation.whats_next.trim().length < 5)
    throw new Error("What's next must be at least 5 characters");
  if (!evaluation.homework || evaluation.homework.trim().length < 5)
    throw new Error('Homework must be at least 5 characters');
  if (evaluation.frustration_rating < 1)
    throw new Error('Frustration rating is required');

  // Get coach
  const coach = await getCurrentCoach();

  // Get student
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id, first_name, last_name, belt_level, current_sequence_number, current_step_order, ocean_level, portal_token, email')
    .eq('id', draft.student_id)
    .single();
  if (studentErr || !student) throw new Error('Student not found');

  // Use the first mission's pilar for the session-level pilar field (backward compat)
  const primaryPilar = missions[0]?.pilar || null;
  const primaryPilarPart = missions[0]?.pilar_part || null;
  const primaryDrill = missions[0]?.drill_id || null;
  const primaryMission = missions.map(m => m.mission).join(' | ');

  // Create standalone session (context only)
  const { data: session, error: sessionErr } = await supabase
    .from('standalone_sessions')
    .insert({
      session_date: draft.session_time
        ? `${draft.session_date}T${draft.session_time}:00`
        : draft.session_date || new Date().toISOString(),
      coach_id: coach.id,
      student_id: draft.student_id,
      belt_level_snapshot: student.belt_level,
      sequence_snapshot: student.current_sequence_number,
      step_snapshot: student.current_step_order,
      ocean_level_snapshot: student.ocean_level,
      training_venue: draft.training_venue,
      ocean_conditions: draft.ocean_conditions,
      risk_state: draft.risk_state,
      is_safety_layer: draft.is_safety_layer,
      pilar: primaryPilar,
      pilar_part: primaryPilarPart,
      drill_id: primaryDrill,
      mission: primaryMission,
      execution_notes: draft.execution_notes || null,
      duration_minutes: draft.duration_minutes || null,
      session_type: draft.session_type,
      mental_hack: missions[0]?.mental_hack || null,
      warm_up_notes: missions[0]?.warm_up || null,
      simulation: missions[0]?.simulation || null,
      mission_time: missions[0]?.mission_time || null,
      repetitions: missions[0]?.repetitions || null,
    })
    .select()
    .single();

  if (sessionErr) throw new Error(`Session creation failed: ${sessionErr.message}`);

  // Create session_missions
  const missionInserts = missions.map(m => ({
    standalone_session_id: session.id,
    sort_order: m.sort_order,
    pilar_part: m.pilar_part || null,
    pilar: m.pilar || null,
    drill_id: m.drill_id || null,
    mission: m.mission,
    warm_up: m.warm_up || null,
    simulation: m.simulation || null,
    mental_hack: m.mental_hack || null,
    mission_time: m.mission_time || null,
    repetitions: m.repetitions || null,
    status: m.status || null,
    focus_rating: m.focus_rating || null,
    coach_notes: m.coach_notes || null,
  }));

  const { error: missionsErr } = await supabase
    .from('session_missions')
    .insert(missionInserts);

  if (missionsErr) throw new Error(`Missions creation failed: ${missionsErr.message}`);

  // Determine overall status (worst status among missions)
  const statusRank: Record<string, number> = { not_yet: 1, partial: 2, competent: 3, mastered: 4 };
  const overallStatus = missions.reduce((worst, m) => {
    return (statusRank[m.status] || 99) < (statusRank[worst] || 99) ? m.status : worst;
  }, missions[0].status);

  // Average focus
  const avgFocus = Math.round(missions.reduce((sum, m) => sum + m.focus_rating, 0) / missions.length);

  // Create student_session_results
  const { data: result, error: resultErr } = await supabase
    .from('student_session_results')
    .insert({
      standalone_session_id: session.id,
      student_id: draft.student_id,
      status: overallStatus,
      focus_rating: avgFocus,
      frustration_rating: evaluation.frustration_rating,
      coach_feedback: evaluation.coach_feedback,
      internal_notes: evaluation.internal_notes || null,
      whats_next: evaluation.whats_next,
      homework: evaluation.homework,
      completion_state: 'closed',
      survey_unlocked: true,
      portal_token: student.portal_token,
      incident_type: evaluation.incident_type || null,
      incident_description: evaluation.incident_description || null,
      incident_action: evaluation.incident_action || null,
    })
    .select()
    .single();

  if (resultErr) throw new Error(`Result creation failed: ${resultErr.message}`);

  // Update student profile
  const { error: rpcErr } = await supabase.rpc('update_student_profile_on_close', {
    p_student_id: draft.student_id,
    p_session_result_id: result.id,
    p_session_date: draft.session_date || new Date().toISOString(),
    p_mission: primaryMission,
    p_pilar: primaryPilar,
    p_status: overallStatus,
    p_homework: evaluation.homework,
    p_whats_next: evaluation.whats_next,
  });

  if (rpcErr) {
    await supabase.from('students').update({
      last_session_id: result.id,
      last_session_date: draft.session_date || new Date().toISOString(),
      last_session_mission: primaryMission,
      last_session_pilar: primaryPilar,
      last_session_status: overallStatus,
      last_homework: evaluation.homework,
      next_recommended_focus: evaluation.whats_next,
    }).eq('id', draft.student_id);
  }

  // Audit log
  await admin.from('audit_log').insert({
    session_result_id: result.id,
    actor_type: 'coach',
    actor_id: coach.id,
    actor_name: coach.display_name,
    event_type: 'session_closed',
    status_before: 'draft',
    status_after: 'closed',
    note: `Session closed: ${missions.length} mission(s) for ${student.first_name}. Overall: ${overallStatus}.`,
  });

  // Email
  if (student.email) {
    try {
      const { sendSessionEmail } = await import('@/lib/actions/email');
      const emailResult = await sendSessionEmail({
        studentName: student.first_name,
        studentEmail: student.email,
        portalToken: student.portal_token,
        coachName: coach.display_name,
        sessionDate: draft.session_date || new Date().toISOString(),
        mission: primaryMission,
        status: overallStatus,
        coachFeedback: evaluation.coach_feedback,
        homework: evaluation.homework,
        whatsNext: evaluation.whats_next,
        beltLevel: student.belt_level,
      });

      if (emailResult.success) {
        await supabase.from('student_session_results').update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        }).eq('id', result.id);
      }
    } catch (emailErr: any) {
      console.error('Email failed (non-blocking):', emailErr.message);
    }
  }

  revalidatePath(`/students/${draft.student_id}`);
  revalidatePath('/students');
  revalidatePath('/');

  return { success: true, resultId: result.id, studentId: draft.student_id };
}
