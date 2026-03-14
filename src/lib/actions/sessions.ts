'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateMandatoryFields, type SessionCloseData } from '@/lib/validations/session-close';
import { revalidatePath } from 'next/cache';
import type { BeltLevel } from '@/lib/constants/belts';
import type { OceanCondition, Pilar, SessionStatus } from '@/lib/constants/brand';

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

export interface SessionDraftInput {
  student_id: string;
  session_date: string;
  training_venue: string;
  ocean_conditions: OceanCondition;
  risk_state: 'safe' | 'alert' | 'blocked';
  is_safety_layer: boolean;
  pilar: Pilar | null;
  pilar_part?: string;
  drill_id?: string;
  mission: string;
  execution_notes?: string;
  duration_minutes?: number;
  session_type: string;
  mental_hack?: string;
  warm_up_notes?: string;
}

export interface SessionEvalInput {
  status: SessionStatus;
  focus_rating: number;
  frustration_rating: number;
  coach_feedback: string;       // PUBLIC — visible to student
  internal_notes?: string;      // PRIVATE — coaches only, never sent to student
  whats_next: string;
  homework: string;
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
// SEARCH DRILLS
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
// CLOSE SESSION
// ═══════════════════════════════════════

export async function closeStandaloneSession(
  draft: SessionDraftInput,
  evaluation: SessionEvalInput
) {
  const supabase = await createClient();
  const admin = createAdminClient();

  // 1. Validate mandatory fields
  const validation = validateMandatoryFields(evaluation);
  if (!validation.valid) {
    throw new Error(`Missing required fields: ${validation.missing.join(', ')}`);
  }

  // 2. Get coach
  const coach = await getCurrentCoach();

  // 3. Get student
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id, first_name, last_name, belt_level, current_sequence_number, current_step_order, ocean_level, portal_token, email')
    .eq('id', draft.student_id)
    .single();
  if (studentErr || !student) throw new Error('Student not found');

  // 4. Create standalone session
  const { data: session, error: sessionErr } = await supabase
    .from('standalone_sessions')
    .insert({
      session_date: draft.session_date || new Date().toISOString(),
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
      pilar: draft.pilar,
      pilar_part: draft.pilar_part || null,
      drill_id: draft.drill_id || null,
      mission: draft.mission,
      execution_notes: draft.execution_notes || null,
      duration_minutes: draft.duration_minutes || null,
      session_type: draft.session_type,
      mental_hack: draft.mental_hack || null,
      warm_up_notes: draft.warm_up_notes || null,
    })
    .select()
    .single();

  if (sessionErr) throw new Error(`Session creation failed: ${sessionErr.message}`);

  // 5. Create student_session_results with internal_notes (never sent to student)
  const { data: result, error: resultErr } = await supabase
    .from('student_session_results')
    .insert({
      standalone_session_id: session.id,
      student_id: draft.student_id,
      status: evaluation.status,
      focus_rating: evaluation.focus_rating,
      frustration_rating: evaluation.frustration_rating,
      coach_feedback: evaluation.coach_feedback,       // PUBLIC
      internal_notes: evaluation.internal_notes || null, // PRIVATE
      whats_next: evaluation.whats_next,
      homework: evaluation.homework,
      completion_state: 'closed',
      survey_unlocked: true,
      portal_token: student.portal_token,
    })
    .select()
    .single();

  if (resultErr) throw new Error(`Result creation failed: ${resultErr.message}`);

  // 6. Update student profile
  const { error: rpcErr } = await supabase.rpc('update_student_profile_on_close', {
    p_student_id: draft.student_id,
    p_session_result_id: result.id,
    p_session_date: draft.session_date || new Date().toISOString(),
    p_mission: draft.mission,
    p_pilar: draft.pilar,
    p_status: evaluation.status,
    p_homework: evaluation.homework,
    p_whats_next: evaluation.whats_next,
  });

  if (rpcErr) {
    await supabase.from('students').update({
      last_session_id: result.id,
      last_session_date: draft.session_date || new Date().toISOString(),
      last_session_mission: draft.mission,
      last_session_pilar: draft.pilar,
      last_session_status: evaluation.status,
      last_homework: evaluation.homework,
      next_recommended_focus: evaluation.whats_next,
    }).eq('id', draft.student_id);
  }

  // 7. Audit log
  await admin.from('audit_log').insert({
    session_result_id: result.id,
    actor_type: 'coach',
    actor_id: coach.id,
    actor_name: coach.display_name,
    event_type: 'session_closed',
    status_before: 'draft',
    status_after: 'closed',
    note: `Standalone session closed for ${draft.student_id}. Status: ${evaluation.status}.`,
  });

  // 8. Email — ONLY public feedback, never internal_notes
  if (student.email) {
    try {
      const { sendSessionEmail } = await import('@/lib/actions/email');
      const emailResult = await sendSessionEmail({
        studentName: student.first_name,
        studentEmail: student.email,
        portalToken: student.portal_token,
        coachName: coach.display_name,
        sessionDate: draft.session_date || new Date().toISOString(),
        mission: draft.mission,
        status: evaluation.status,
        coachFeedback: evaluation.coach_feedback, // PUBLIC only
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
