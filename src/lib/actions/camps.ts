'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canCoachBelt, type BeltLevel } from '@/lib/constants/belts';
import { validateMandatoryFields } from '@/lib/validations/session-close';
import { revalidatePath } from 'next/cache';
import type { SessionStatus } from '@/lib/constants/brand';

// ═══════════════════════════════════════
// LIST TEMPLATES
// ═══════════════════════════════════════

export async function listCampTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('camp_templates')
    .select('*')
    .eq('active_status', true)
    .order('template_name');
  if (error) throw new Error(error.message);
  return data;
}

// ═══════════════════════════════════════
// GET TEMPLATE WITH DAYS + BLOCKS
// ═══════════════════════════════════════

export async function getTemplateDetail(templateId: string) {
  const supabase = await createClient();

  const { data: template } = await supabase
    .from('camp_templates').select('*').eq('id', templateId).single();

  const { data: days } = await supabase
    .from('camp_template_days').select('*')
    .eq('template_id', templateId).order('day_number');

  const dayIds = days?.map(d => d.id) || [];
  const { data: blocks } = await supabase
    .from('camp_template_blocks').select('*')
    .in('template_day_id', dayIds).order('block_order');

  return { template, days: days || [], blocks: blocks || [] };
}

// ═══════════════════════════════════════
// CREATE CAMP INSTANCE
// ═══════════════════════════════════════

export async function createCampInstance(input: {
  template_id: string;
  camp_name: string;
  coach_id: string;
  head_coach_id?: string;
  start_date: string;
  end_date: string;
  modality: 'individual' | 'group';
  student_ids: string[];
}) {
  const supabase = await createClient();

  // Get template days
  const { data: days } = await supabase
    .from('camp_template_days')
    .select('id, day_number')
    .eq('template_id', input.template_id)
    .order('day_number');

  if (!days || days.length === 0) throw new Error('Template has no days configured.');

  // Create instance
  const { data: instance, error: instErr } = await supabase
    .from('camp_instances')
    .insert({
      template_id: input.template_id,
      camp_name: input.camp_name,
      coach_id: input.coach_id,
      head_coach_id: input.head_coach_id || input.coach_id,
      start_date: input.start_date,
      end_date: input.end_date,
      modality: input.modality,
      status: 'planned',
    })
    .select()
    .single();

  if (instErr) throw new Error(instErr.message);

  // Add participants
  if (input.student_ids.length > 0) {
    const participants = input.student_ids.map(sid => ({
      camp_instance_id: instance.id,
      student_id: sid,
      enrollment_status: 'active' as const,
    }));
    const { error: partErr } = await supabase.from('camp_participants').insert(participants);
    if (partErr) throw new Error(`Failed to add participants: ${partErr.message}`);
  }

  // Auto-create camp sessions (one per template day)
  const startDate = new Date(input.start_date);
  const sessions = days.map((day, i) => {
    const sessionDate = new Date(startDate);
    sessionDate.setDate(sessionDate.getDate() + i);
    return {
      camp_instance_id: instance.id,
      template_day_id: day.id,
      day_number: day.day_number,
      session_date: sessionDate.toISOString().slice(0, 10),
      session_status: 'planned' as const,
    };
  });
  const { error: sessErr } = await supabase.from('camp_sessions').insert(sessions);
  if (sessErr) throw new Error(`Failed to create sessions: ${sessErr.message}`);

  revalidatePath('/camps');
  return instance;
}

// ═══════════════════════════════════════
// GET CAMP DETAIL
// ═══════════════════════════════════════

export async function getCampDetail(campId: string) {
  const supabase = await createClient();

  const { data: instance } = await supabase
    .from('camp_instances')
    .select('*, camp_templates(*), coaches(display_name), head_coach:head_coach_id(id, display_name)')
    .eq('id', campId)
    .single();

  const { data: participants } = await supabase
    .from('camp_participants')
    .select('*, students(id, first_name, last_name, belt_level, photo_url)')
    .eq('camp_instance_id', campId)
    .eq('enrollment_status', 'active');

  const { data: sessions } = await supabase
    .from('camp_sessions')
    .select('*, camp_template_days(day_goal, evaluation_focus)')
    .eq('camp_instance_id', campId)
    .order('day_number');

  return {
    instance,
    participants: participants || [],
    sessions: sessions || [],
  };
}

// ═══════════════════════════════════════
// GET CAMP SESSION (day view)
// ═══════════════════════════════════════

export async function getCampSession(campId: string, dayNum: number) {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('camp_sessions')
    .select('*, camp_template_days(*, camp_template_blocks(*))')
    .eq('camp_instance_id', campId)
    .eq('day_number', dayNum)
    .single();

  const { data: participants } = await supabase
    .from('camp_participants')
    .select('*, students(id, first_name, last_name, belt_level, photo_url, last_homework, next_recommended_focus)')
    .eq('camp_instance_id', campId)
    .eq('enrollment_status', 'active');

  // Get existing results for this session
  const { data: existingResults } = await supabase
    .from('student_session_results')
    .select('*')
    .eq('camp_session_id', session?.id);

  return {
    session,
    participants: participants || [],
    existingResults: existingResults || [],
    blocks: session?.camp_template_days?.camp_template_blocks || [],
  };
}

// ═══════════════════════════════════════
// CLOSE CAMP SESSION RESULT (per student)
// ═══════════════════════════════════════

export async function closeCampSessionResult(input: {
  camp_session_id: string;
  camp_instance_id: string;
  student_id: string;
  mission: string;
  pilar: string | null;
  status: SessionStatus;
  focus_rating: number;
  frustration_rating: number;
  coach_feedback: string;
  whats_next: string;
  homework: string;
}) {
  const supabase = await createClient();
  const admin = createAdminClient();

  // Validate
  const validation = validateMandatoryFields({
    status: input.status,
    focus_rating: input.focus_rating,
    frustration_rating: input.frustration_rating,
    coach_feedback: input.coach_feedback,
    whats_next: input.whats_next,
    homework: input.homework,
  });
  if (!validation.valid) throw new Error(`Missing: ${validation.missing.join(', ')}`);

  // Get coach
  const { data: { user } } = await supabase.auth.getUser();
  const { data: coach } = await supabase.from('coaches').select('*').eq('auth_user_id', user!.id).single();

  // Get student portal token
  const { data: student } = await supabase
    .from('students')
    .select('portal_token, email, first_name')
    .eq('id', input.student_id)
    .single();

  // Insert result
  const { data: result, error: resultErr } = await supabase
    .from('student_session_results')
    .insert({
      camp_session_id: input.camp_session_id,
      student_id: input.student_id,
      status: input.status,
      focus_rating: input.focus_rating,
      frustration_rating: input.frustration_rating,
      coach_feedback: input.coach_feedback,
      achieved: input.status === 'mastered' ? 'yes' : input.status === 'competent' ? 'yes' : 'partial',
      whats_next: input.whats_next,
      homework: input.homework,
      completion_state: 'closed',
      survey_unlocked: true,
      portal_token: student?.portal_token,
    })
    .select()
    .single();

  if (resultErr) throw new Error(resultErr.message);

  // Update student profile
  await supabase.rpc('update_student_profile_on_close', {
    p_student_id: input.student_id,
    p_session_result_id: result.id,
    p_session_date: new Date().toISOString(),
    p_mission: input.mission,
    p_pilar: input.pilar,
    p_status: input.status,
    p_homework: input.homework,
    p_whats_next: input.whats_next,
  });

  // Audit
  await admin.from('audit_log').insert({
    session_result_id: result.id,
    actor_type: 'coach',
    actor_id: coach?.id,
    actor_name: coach?.display_name,
    event_type: 'camp_result_closed',
    status_before: 'in_progress',
    status_after: 'closed',
    note: `Camp result closed for student ${input.student_id}. Day session: ${input.camp_session_id}.`,
  });

  // Email (non-blocking)
  if (student?.email) {
    try {
      const { sendSessionEmail } = await import('@/lib/actions/email');
      const emailResult = await sendSessionEmail({
        studentName: student.first_name,
        studentEmail: student.email,
        portalToken: student.portal_token,
        coachName: coach?.display_name || 'Coach',
        sessionDate: new Date().toISOString(),
        mission: input.mission,
        status: input.status,
        coachFeedback: input.coach_feedback,
        homework: input.homework,
        whatsNext: input.whats_next,
        beltLevel: 'white_belt', // will get actual from student
      });
      if (emailResult.success) {
        await supabase.from('student_session_results').update({
          email_sent: true, email_sent_at: new Date().toISOString(),
        }).eq('id', result.id);
      }
    } catch { /* non-blocking */ }
  }

  // Check if all participants evaluated — if so, mark session complete
  const { data: allParticipants } = await supabase
    .from('camp_participants')
    .select('student_id')
    .eq('camp_instance_id', input.camp_instance_id)
    .eq('enrollment_status', 'active');

  const { data: allResults } = await supabase
    .from('student_session_results')
    .select('student_id')
    .eq('camp_session_id', input.camp_session_id);

  const participantIds = new Set(allParticipants?.map(p => p.student_id));
  const resultIds = new Set(allResults?.map(r => r.student_id));
  const allEvaluated = [...participantIds].every(id => resultIds.has(id));

  if (allEvaluated) {
    await supabase.from('camp_sessions').update({ session_status: 'completed' }).eq('id', input.camp_session_id);
  }

  revalidatePath(`/camps/${input.camp_instance_id}`);
  return { success: true, resultId: result.id };
}

// ═══════════════════════════════════════
// ADD STUDENT TO CAMP
// ═══════════════════════════════════════

export async function addStudentToCamp(campInstanceId: string, studentId: string) {
  const supabase = await createClient();

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('camp_participants')
    .select('id')
    .eq('camp_instance_id', campInstanceId)
    .eq('student_id', studentId)
    .single();

  if (existing) {
    // Re-activate if was removed
    await supabase
      .from('camp_participants')
      .update({ enrollment_status: 'active' })
      .eq('id', existing.id);
  } else {
    const { error } = await supabase.from('camp_participants').insert({
      camp_instance_id: campInstanceId,
      student_id: studentId,
      enrollment_status: 'active',
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/camps/${campInstanceId}`);
  return { success: true };
}

// ═══════════════════════════════════════
// REMOVE STUDENT FROM CAMP
// ═══════════════════════════════════════

export async function removeStudentFromCamp(campInstanceId: string, studentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('camp_participants')
    .update({ enrollment_status: 'removed' })
    .eq('camp_instance_id', campInstanceId)
    .eq('student_id', studentId);

  if (error) throw new Error(error.message);

  revalidatePath(`/camps/${campInstanceId}`);
  return { success: true };
}

// ═══════════════════════════════════════
// DAILY FEEDBACK
// ═══════════════════════════════════════

export async function submitDailyFeedback(
  campId: string,
  dayNumber: number,
  studentId: string,
  coachId: string,
  feedback: {
    status: string;
    focus_rating: number;
    effort_rating: number;
    notes: string;
    highlights: string;
    areas_to_improve: string;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_daily_feedback')
    .upsert(
      {
        camp_instance_id: campId,
        day_number: dayNumber,
        student_id: studentId,
        coach_id: coachId,
        status: feedback.status,
        focus_rating: feedback.focus_rating,
        effort_rating: feedback.effort_rating,
        notes: feedback.notes,
        highlights: feedback.highlights,
        areas_to_improve: feedback.areas_to_improve,
      },
      { onConflict: 'camp_instance_id,day_number,student_id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/camps/${campId}`);
  return data;
}

export async function getDailyFeedback(campId: string, dayNumber: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_daily_feedback')
    .select('*, students(id, first_name, last_name), coaches(display_name)')
    .eq('camp_instance_id', campId)
    .eq('day_number', dayNumber);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getStudentCampFeedback(campId: string, studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_daily_feedback')
    .select('*')
    .eq('camp_instance_id', campId)
    .eq('student_id', studentId)
    .order('day_number');

  if (error) throw new Error(error.message);
  return data || [];
}

// ═══════════════════════════════════════
// FINAL EVALUATIONS
// ═══════════════════════════════════════

export async function submitFinalEvaluation(
  campId: string,
  studentId: string,
  coachId: string,
  evaluation: {
    overall_rating: number;
    technical_progress: string;
    tactical_progress: string;
    mental_progress: string;
    physical_progress: string;
    sequence_recommendation: number | null;
    ocean_level_recommendation: string;
    general_notes: string;
    strengths: string;
    areas_to_improve: string;
    homework_for_after_camp: string;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_final_evaluations')
    .upsert(
      {
        camp_instance_id: campId,
        student_id: studentId,
        coach_id: coachId,
        ...evaluation,
      },
      { onConflict: 'camp_instance_id,student_id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Update student profile if sequence or ocean level recommendation is provided
  if (evaluation.sequence_recommendation || evaluation.ocean_level_recommendation) {
    const updates: Record<string, unknown> = {};
    if (evaluation.sequence_recommendation) {
      updates.current_sequence_number = evaluation.sequence_recommendation;
    }
    if (evaluation.ocean_level_recommendation) {
      updates.ocean_level = evaluation.ocean_level_recommendation;
    }
    await supabase
      .from('students')
      .update(updates)
      .eq('id', studentId);
  }

  revalidatePath(`/camps/${campId}`);
  return data;
}

export async function getFinalEvaluation(campId: string, studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_final_evaluations')
    .select('*, coaches(display_name)')
    .eq('camp_instance_id', campId)
    .eq('student_id', studentId)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || null;
}

export async function getCampEvaluations(campId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_final_evaluations')
    .select('*, students(id, first_name, last_name, belt_level), coaches(display_name)')
    .eq('camp_instance_id', campId);

  if (error) throw new Error(error.message);
  return data || [];
}
