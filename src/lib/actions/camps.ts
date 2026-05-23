'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canCoachBelt, type BeltLevel } from '@/lib/constants/belts';
import { validateMandatoryFields } from '@/lib/validations/session-close';
import { revalidatePath } from 'next/cache';
import type { SessionStatus } from '@/lib/constants/brand';
import { getCurrentCoach } from '@/lib/actions/auth';

// ═══════════════════════════════════════
// LIST TEMPLATES
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// LIST CAMPS OVERLAPPING A DATE RANGE
// Used by the calendar panorama on /camps. Academy-scoped (platform
// admin sees all). Joins template + head_coach + participant count
// in one round-trip so each card can render without follow-up queries.
// ═══════════════════════════════════════

export async function listCampsInRange(startDate: string, endDate: string) {
  const supabase = await createClient();
  const currentCoach = await getCurrentCoach();
  if (!currentCoach) return [];

  // A camp overlaps the window if it starts on/before window.end AND
  // ends on/after window.start.
  let query = supabase
    .from('camp_instances')
    .select(
      'id, camp_name, start_date, end_date, status, modality, scheduled_time, capacity_override, template_id, head_coach_id, coach_id, camp_templates(template_name, level_name, service_kind, capacity_max, duration_days, card_color, accent_color), head_coach:head_coach_id(display_name), coaches:coach_id(display_name), camp_participants(id, enrollment_status)'
    )
    .lte('start_date', endDate)
    .gte('end_date', startDate)
    .order('start_date', { ascending: true });

  if (!currentCoach.is_platform_admin && currentCoach.academy_id) {
    query = query.eq('academy_id', currentCoach.academy_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ═══════════════════════════════════════
// UPDATE HEAD COACH OF AN EXISTING CAMP
// Used by the camp detail page so the coordinator can swap / assign
// the head coach without re-creating the instance.
// ═══════════════════════════════════════

export async function updateCampHeadCoach(
  campInstanceId: string,
  headCoachId: string | null,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('camp_instances')
    .update({ head_coach_id: headCoachId })
    .eq('id', campInstanceId);
  if (error) throw new Error(error.message);
  revalidatePath(`/camps/${campInstanceId}`);
  revalidatePath('/camps');
}

// ═══════════════════════════════════════
// UPDATE SCHEDULED TIME OF AN EXISTING CAMP
// scheduled_time is a free-form TEXT — we standardise on "HH:MM" or
// "HH:MM - HH:MM". Passing null clears it.
// ═══════════════════════════════════════

export async function updateCampSchedule(
  campInstanceId: string,
  scheduledTime: string | null,
) {
  const supabase = await createClient();
  const trimmed = (scheduledTime ?? '').trim();
  const { error } = await supabase
    .from('camp_instances')
    .update({ scheduled_time: trimmed ? trimmed : null })
    .eq('id', campInstanceId);
  if (error) throw new Error(error.message);
  revalidatePath(`/camps/${campInstanceId}`);
  revalidatePath('/camps');
}

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
  scheduled_time?: string; // "09:00 - 10:30" for lessons, "08:00" for camps
}) {
  const supabase = await createClient();

  // Get template days. If none are configured (e.g. new SVC-* service
  // templates that don't have pre-seeded days), fall back to the
  // template's duration_days and auto-create ad-hoc day stubs inline.
  const { data: rawDays } = await supabase
    .from('camp_template_days')
    .select('id, day_number')
    .eq('template_id', input.template_id)
    .order('day_number');

  let days: { id: string; day_number: number }[] = rawDays ?? [];

  // If no template days exist, auto-generate lightweight ones now
  if (days.length === 0) {
    const { data: tmpl } = await supabase
      .from('camp_templates')
      .select('duration_days, is_custom')
      .eq('id', input.template_id)
      .single();

    // For custom templates, the caller may pass capacity_override/duration_override
    const durationDays =
      (input as any).duration_override ??
      tmpl?.duration_days ??
      1;

    const newDays = Array.from({ length: durationDays }, (_, i) => ({
      template_id: input.template_id,
      day_number: i + 1,
      day_goal: `Day ${i + 1}`,
      evaluation_focus: null as string | null,
    }));

    const { data: inserted, error: dayErr } = await supabase
      .from('camp_template_days')
      .insert(newDays)
      .select('id, day_number');

    if (dayErr || !inserted || inserted.length === 0) {
      throw new Error(`Could not create template days: ${dayErr?.message ?? 'unknown error'}`);
    }
    days = inserted;
  }

  // Resolve the academy this service belongs to. getCurrentCoach()
  // honors the act-as cookie, so a platform admin acting-as academy B
  // creates the service inside academy B; otherwise it falls back to
  // the creator's own academy. Always yields a real academy.
  const me = await getCurrentCoach();
  const academyId = me?.academy_id ?? null;

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
      academy_id: academyId,
      ...(input.scheduled_time ? { scheduled_time: input.scheduled_time } : {}),
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

    // M58 — If the camp's template includes a course (e.g. Surf Camp
    // Beginner includes white_belt), every enrolled participant becomes
    // a Member and gets the course queued in pending_courses. If the
    // student has already signed the waiver we grant the course
    // immediately so their portal unlocks now.
    const { data: tpl } = await supabase
      .from('camp_templates')
      .select('includes_course_key')
      .eq('id', input.template_id)
      .single();
    const courseKey = (tpl?.includes_course_key ?? null) as
      | 'white_belt' | 'yellow_belt' | null;
    if (courseKey) {
      const { grantCourseToStudent } = await import('./course-grants');
      const { data: existing } = await supabase
        .from('students')
        .select('id, lifecycle_status, pending_courses, waiver_signed, course_access_white, course_access_yellow')
        .in('id', input.student_ids);

      for (const s of existing ?? []) {
        const already = (s as any)[`course_access_${courseKey.split('_')[0]}`] === true;
        const pending = Array.isArray(s.pending_courses) ? s.pending_courses : [];
        if (!pending.includes(courseKey)) pending.push(courseKey);

        const patch: Record<string, unknown> = {
          lifecycle_status: 'member',
          pending_courses: pending,
        };
        if (s.lifecycle_status === 'lead') {
          patch.promoted_to_member_at = new Date().toISOString();
        }
        await supabase.from('students').update(patch).eq('id', s.id);

        // Auto-grant immediately if waiver already signed and not granted.
        if (s.waiver_signed && !already) {
          try {
            await grantCourseToStudent(s.id, courseKey, 'auto_on_intake');
          } catch (err) {
            console.error('[createCampInstance] auto-grant failed', s.id, courseKey, err);
          }
        }
      }
    }
  }

  // Auto-create camp sessions (one per template day)
  const startDate = new Date(input.start_date);
  const sessionsToInsert = days.map((day, i) => {
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
  const { data: createdSessions, error: sessErr } = await supabase
    .from('camp_sessions')
    .insert(sessionsToInsert)
    .select('id, template_day_id, day_number');
  if (sessErr) throw new Error(`Failed to create sessions: ${sessErr.message}`);

  // M45 — Auto-seed service_plans + service_plan_blocks from the template.
  // For every (camp_session × participant × template_block) we create one
  // block pre-populated with step_id + drill_id + mission_id so the coach
  // opens the day already armed with the template's recipe per student.
  if (createdSessions && createdSessions.length > 0 && input.student_ids.length > 0) {
    const dayIds = days.map((d) => d.id);
    const { data: tplBlocks } = await supabase
      .from('camp_template_blocks')
      .select(
        'id, template_day_id, block_order, step_id, drill_id, drill_custom, mission_id, mission_custom, evaluation_focus, mission_time'
      )
      .in('template_day_id', dayIds)
      .order('block_order');

    // One service_plans row per camp_session (the coach's plan for that day).
    const planRows = createdSessions.map((cs) => ({
      camp_instance_id: instance.id,
      camp_session_id: cs.id,
      completion_state: 'planned' as const,
    }));
    const { error: planErr } = await supabase.from('service_plans').insert(planRows);
    if (planErr) throw new Error(`Failed to seed service_plans: ${planErr.message}`);

    // One service_plan_block per (camp_session × student × template_block).
    const blockRows: any[] = [];
    for (const cs of createdSessions) {
      const dayBlocks = (tplBlocks ?? []).filter((b) => b.template_day_id === cs.template_day_id);
      for (const studentId of input.student_ids) {
        if (dayBlocks.length === 0) {
          // No template blocks for this day → still create an empty block so
          // the coach has a slot to fill manually.
          blockRows.push({
            camp_instance_id: instance.id,
            camp_session_id: cs.id,
            student_id: studentId,
            order_index: 0,
          });
        } else {
          dayBlocks.forEach((tb, idx) => {
            blockRows.push({
              camp_instance_id: instance.id,
              camp_session_id: cs.id,
              student_id: studentId,
              order_index: tb.block_order ?? idx,
              step_id: tb.step_id ?? null,
              land_drill_id: tb.drill_id ?? null,
              land_drill_custom: tb.drill_custom ?? null,
              water_drill_id: tb.mission_id ?? null,
              water_drill_custom: tb.mission_custom ?? null,
              objective_text: tb.evaluation_focus ?? null,
            });
          });
        }
      }
    }
    if (blockRows.length > 0) {
      const { error: blkErr } = await supabase.from('service_plan_blocks').insert(blockRows);
      if (blkErr) throw new Error(`Failed to seed service_plan_blocks: ${blkErr.message}`);
    }
  }

  revalidatePath('/camps');
  return instance;
}

// ═══════════════════════════════════════
// GET CAMP DETAIL
// ═══════════════════════════════════════

export async function getCampDetail(campId: string) {
  const supabase = await createClient();

  const { data: instance, error: instanceErr } = await supabase
    .from('camp_instances')
    .select('*, camp_templates(*), coaches:coach_id(display_name), head_coach:head_coach_id(id, display_name)')
    .eq('id', campId)
    .single();

  if (instanceErr) {
    console.error('[getCampDetail] instance query failed', campId, instanceErr);
  }

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
  if (!user) throw new Error('Not authenticated.');
  const { data: coach } = await supabase.from('coaches').select('*').eq('auth_user_id', user.id).single();

  // Get student portal token
  const { data: student } = await supabase
    .from('students')
    .select('portal_token, email, first_name, belt_level')
    .eq('id', input.student_id)
    .single();

  // Insert result — use admin client to bypass RLS so an admin acting-as
  // an academy (or a coach) can always write the evaluation.
  const { data: result, error: resultErr } = await admin
    .from('student_session_results')
    .insert({
      camp_session_id: input.camp_session_id,
      student_id: input.student_id,
      coach_id: coach?.id || null,
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

  if (resultErr || !result) {
    console.error('[closeCampSessionResult] insert failed', resultErr);
    throw new Error(`Could not save evaluation: ${resultErr?.message ?? 'unknown error'}`);
  }

  // Update the student's profile snapshot directly (the "Last Session"
  // card on the coach profile reads these columns). Done with the admin
  // client and as a plain UPDATE — avoids the RPC's enum-cast pitfalls.
  try {
    const { error: profErr } = await admin
      .from('students')
      .update({
        last_session_id: result.id,
        last_session_date: new Date().toISOString(),
        last_session_mission: input.mission,
        last_session_pilar: input.pilar,
        last_session_status: input.status,
        last_homework: input.homework,
        next_recommended_focus: input.whats_next,
      })
      .eq('id', input.student_id);
    if (profErr) console.error('[closeCampSessionResult] profile update failed', profErr);
  } catch (e) {
    console.error('[closeCampSessionResult] profile update threw', e);
  }

  // Audit (non-blocking)
  try {
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
  } catch (e) {
    console.error('[closeCampSessionResult] audit log failed', e);
  }

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
        beltLevel: student?.belt_level || 'white_belt',
      });
      if (emailResult.success) {
        await admin.from('student_session_results').update({
          email_sent: true, email_sent_at: new Date().toISOString(),
        }).eq('id', result.id);
      }
    } catch { /* non-blocking */ }
  }

  // Check if all participants evaluated — if so, mark session complete
  try {
    const { data: allParticipants } = await admin
      .from('camp_participants')
      .select('student_id')
      .eq('camp_instance_id', input.camp_instance_id)
      .eq('enrollment_status', 'active');

    const { data: allResults } = await admin
      .from('student_session_results')
      .select('student_id')
      .eq('camp_session_id', input.camp_session_id);

    const participantIds = new Set(allParticipants?.map(p => p.student_id));
    const resultIds = new Set(allResults?.map(r => r.student_id));
    const allEvaluated = participantIds.size > 0 && [...participantIds].every(id => resultIds.has(id));

    if (allEvaluated) {
      await admin.from('camp_sessions').update({ session_status: 'completed' }).eq('id', input.camp_session_id);
    }
  } catch (e) {
    console.error('[closeCampSessionResult] session-complete check failed', e);
  }

  revalidatePath(`/camps/${input.camp_instance_id}`);
  revalidatePath(`/students/${input.student_id}`);
  revalidatePath(`/students/${input.student_id}/history`);
  revalidatePath('/students');
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

// ═══════════════════════════════════════
// TEMPLATE MANAGEMENT (Admin only)
// ═══════════════════════════════════════

export interface TemplateBlockInput {
  block_order: number;
  pilar: string | null;
  is_safety_layer?: boolean;
  pilar_part: string | null;
  mission: string | null;
  drill_name: string | null;
  mission_time: string | null;
  repetitions_default: number | null;
  warm_up: string | null;
  simulation: string | null;
  mental_hack: string | null;
  evaluation_focus: string | null;
  block_type: string;
  // M44 — sequence catalog links
  step_id?: string | null;
  drill_id?: string | null;
  drill_custom?: string | null;
  mission_id?: string | null;
  mission_custom?: string | null;
}

export interface TemplateDayInput {
  day_number: number;
  venue_default: string | null;
  ocean_condition_target: string | null;
  day_goal: string | null;
  day_notes: string | null;
  evaluation_focus: string | null;
  has_evaluation: boolean;
  evaluation_type: string | null;
  blocks: TemplateBlockInput[];
}

export interface CreateTemplateInput {
  template_name: string;
  level_name: string;
  duration_days: number;
  modality: string;
  delivery_model: string;
  description: string;
  days: TemplateDayInput[];
  includes_course_key?: 'white_belt' | 'yellow_belt' | null;
  service_kind?: 'surf_lesson' | 'surf_camp' | 'custom' | null;
  capacity_max?: number | null;
  session_duration_minutes?: number | null;
  card_color?: string | null;
  accent_color?: string | null;
}

export async function createCampTemplate(input: CreateTemplateInput) {
  const supabase = await createClient();

  // Create template — use text-based ID consistent with seed templates (e.g. TPL-NOVICE-6D)
  const templateId = `TPL-${Date.now()}`;
  const { data: template, error: tplErr } = await supabase
    .from('camp_templates')
    .insert({
      id: templateId,
      template_name: input.template_name,
      level_name: input.level_name,
      duration_days: input.duration_days,
      modality: input.modality,
      delivery_model: input.delivery_model,
      description: input.description,
      includes_course_key: input.includes_course_key ?? null,
      service_kind: input.service_kind ?? null,
      capacity_max: input.capacity_max ?? null,
      session_duration_minutes: input.session_duration_minutes ?? null,
      card_color: input.card_color ?? null,
      accent_color: input.accent_color ?? null,
      active_status: true,
    })
    .select()
    .single();

  if (tplErr) throw new Error(tplErr.message);

  // Create days + blocks
  for (const day of input.days) {
    const { data: dayRow, error: dayErr } = await supabase
      .from('camp_template_days')
      .insert({
        id: crypto.randomUUID(),
        template_id: template.id,
        day_number: day.day_number,
        venue_default: day.venue_default,
        ocean_condition_target: day.ocean_condition_target,
        day_goal: day.day_goal,
        day_notes: day.day_notes,
        evaluation_focus: day.evaluation_focus,
        has_evaluation: day.has_evaluation,
        evaluation_type: day.evaluation_type,
      })
      .select()
      .single();

    if (dayErr) throw new Error(dayErr.message);

    if (day.blocks.length > 0) {
      const blockRows = day.blocks.map((b) => ({
        id: crypto.randomUUID(),
        template_day_id: dayRow.id,
        block_order: b.block_order,
        pilar: b.pilar,
        is_safety_layer: b.is_safety_layer || false,
        pilar_part: b.pilar_part,
        mission: b.mission,
        drill_name: b.drill_name,
        mission_time: b.mission_time,
        repetitions_default: b.repetitions_default,
        warm_up: b.warm_up,
        simulation: b.simulation,
        mental_hack: b.mental_hack,
        evaluation_focus: b.evaluation_focus,
        block_type: b.block_type,
        step_id: b.step_id ?? null,
        drill_id: b.drill_id ?? null,
        drill_custom: b.drill_custom ?? null,
        mission_id: b.mission_id ?? null,
        mission_custom: b.mission_custom ?? null,
      }));

      const { error: blkErr } = await supabase
        .from('camp_template_blocks')
        .insert(blockRows);

      if (blkErr) throw new Error(blkErr.message);
    }
  }

  revalidatePath('/camps/templates');
  return template;
}

export async function updateCampTemplate(templateId: string, input: CreateTemplateInput) {
  const supabase = await createClient();

  // Update template row
  const { error: tplErr } = await supabase
    .from('camp_templates')
    .update({
      template_name: input.template_name,
      level_name: input.level_name,
      duration_days: input.duration_days,
      modality: input.modality,
      delivery_model: input.delivery_model,
      description: input.description,
      includes_course_key: input.includes_course_key ?? null,
      service_kind: input.service_kind ?? null,
      capacity_max: input.capacity_max ?? null,
      session_duration_minutes: input.session_duration_minutes ?? null,
      card_color: input.card_color ?? null,
      accent_color: input.accent_color ?? null,
    })
    .eq('id', templateId);

  if (tplErr) throw new Error(tplErr.message);

  // Delete existing days (cascade deletes blocks via DB)
  const { data: existingDays } = await supabase
    .from('camp_template_days')
    .select('id')
    .eq('template_id', templateId);

  if (existingDays && existingDays.length > 0) {
    const dayIds = existingDays.map((d) => d.id);
    // Delete blocks first
    await supabase
      .from('camp_template_blocks')
      .delete()
      .in('template_day_id', dayIds);
    // Then days
    await supabase
      .from('camp_template_days')
      .delete()
      .eq('template_id', templateId);
  }

  // Re-create days + blocks
  for (const day of input.days) {
    const { data: dayRow, error: dayErr } = await supabase
      .from('camp_template_days')
      .insert({
        id: crypto.randomUUID(),
        template_id: templateId,
        day_number: day.day_number,
        venue_default: day.venue_default,
        ocean_condition_target: day.ocean_condition_target,
        day_goal: day.day_goal,
        day_notes: day.day_notes,
        evaluation_focus: day.evaluation_focus,
        has_evaluation: day.has_evaluation,
        evaluation_type: day.evaluation_type,
      })
      .select()
      .single();

    if (dayErr) throw new Error(dayErr.message);

    if (day.blocks.length > 0) {
      const blockRows = day.blocks.map((b) => ({
        id: crypto.randomUUID(),
        template_day_id: dayRow.id,
        block_order: b.block_order,
        pilar: b.pilar,
        is_safety_layer: b.is_safety_layer || false,
        pilar_part: b.pilar_part,
        mission: b.mission,
        drill_name: b.drill_name,
        mission_time: b.mission_time,
        repetitions_default: b.repetitions_default,
        warm_up: b.warm_up,
        simulation: b.simulation,
        mental_hack: b.mental_hack,
        evaluation_focus: b.evaluation_focus,
        block_type: b.block_type,
        step_id: b.step_id ?? null,
        drill_id: b.drill_id ?? null,
        drill_custom: b.drill_custom ?? null,
        mission_id: b.mission_id ?? null,
        mission_custom: b.mission_custom ?? null,
      }));

      const { error: blkErr } = await supabase
        .from('camp_template_blocks')
        .insert(blockRows);

      if (blkErr) throw new Error(blkErr.message);
    }
  }

  revalidatePath('/camps/templates');
  return { success: true };
}

export async function deleteCampTemplate(templateId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('camp_templates')
    .update({ active_status: false })
    .eq('id', templateId);

  if (error) throw new Error(error.message);

  revalidatePath('/camps/templates');
  return { success: true };
}

export async function duplicateCampTemplate(templateId: string) {
  const supabase = await createClient();

  // Get existing template
  const { data: original } = await supabase
    .from('camp_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (!original) throw new Error('Template not found');

  // Get days + blocks
  const detail = await getTemplateDetail(templateId);

  const newInput: CreateTemplateInput = {
    template_name: `${original.template_name} (Copy)`,
    level_name: original.level_name,
    duration_days: original.duration_days,
    modality: original.modality,
    delivery_model: original.delivery_model,
    description: original.description || '',
    days: detail.days.map((day: any) => {
      const dayBlocks = detail.blocks.filter((b: any) => b.template_day_id === day.id);
      return {
        day_number: day.day_number,
        venue_default: day.venue_default,
        ocean_condition_target: day.ocean_condition_target,
        day_goal: day.day_goal,
        day_notes: day.day_notes,
        evaluation_focus: day.evaluation_focus,
        has_evaluation: day.has_evaluation || false,
        evaluation_type: day.evaluation_type || null,
        blocks: dayBlocks.map((b: any) => ({
          block_order: b.block_order,
          pilar: b.pilar,
          is_safety_layer: b.is_safety_layer,
          pilar_part: b.pilar_part,
          mission: b.mission,
          drill_name: b.drill_name,
          mission_time: b.mission_time,
          repetitions_default: b.repetitions_default,
          warm_up: b.warm_up,
          simulation: b.simulation,
          mental_hack: b.mental_hack,
          evaluation_focus: b.evaluation_focus,
          block_type: b.block_type || 'mission',
        })),
      };
    }),
  };

  return createCampTemplate(newInput);
}

// ═══════════════════════════════════════
// STUDENT CUSTOMIZATIONS
// ═══════════════════════════════════════

export async function getStudentCustomizations(campInstanceId: string, studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_student_customizations')
    .select('*')
    .eq('camp_instance_id', campInstanceId)
    .eq('student_id', studentId)
    .order('day_number')
    .order('block_order');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function saveStudentCustomization(
  campInstanceId: string,
  studentId: string,
  dayNumber: number,
  blockOrder: number,
  customDrill: string | null,
  customMission: string | null,
  notes: string | null
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_student_customizations')
    .upsert(
      {
        camp_instance_id: campInstanceId,
        student_id: studentId,
        day_number: dayNumber,
        block_order: blockOrder,
        custom_drill_name: customDrill,
        custom_mission: customMission,
        custom_notes: notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'camp_instance_id,student_id,day_number,block_order' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/camps');
  return data;
}

export async function getCustomizedPlan(
  campInstanceId: string,
  studentId: string,
  dayNumber: number
) {
  const supabase = await createClient();

  // Get the camp instance to find template
  const { data: instance } = await supabase
    .from('camp_instances')
    .select('template_id')
    .eq('id', campInstanceId)
    .single();

  if (!instance) throw new Error('Camp instance not found');

  // Get the template day
  const { data: templateDay } = await supabase
    .from('camp_template_days')
    .select('id')
    .eq('template_id', instance.template_id)
    .eq('day_number', dayNumber)
    .single();

  if (!templateDay) throw new Error('Template day not found');

  // Get blocks
  const { data: blocks } = await supabase
    .from('camp_template_blocks')
    .select('*')
    .eq('template_day_id', templateDay.id)
    .order('block_order');

  // Get customizations
  const { data: customizations } = await supabase
    .from('camp_student_customizations')
    .select('*')
    .eq('camp_instance_id', campInstanceId)
    .eq('student_id', studentId)
    .eq('day_number', dayNumber);

  // Merge: apply customizations as overrides
  const customMap = new Map(
    (customizations || []).map((c: any) => [c.block_order, c])
  );

  const mergedBlocks = (blocks || []).map((block: any) => {
    const custom = customMap.get(block.block_order);
    if (custom) {
      return {
        ...block,
        drill_name: custom.custom_drill_name || block.drill_name,
        mission: custom.custom_mission || block.mission,
        _custom_notes: custom.custom_notes,
        _is_customized: true,
      };
    }
    return { ...block, _is_customized: false };
  });

  return mergedBlocks;
}

// ═══════════════════════════════════════
// SCHEDULED EVALUATIONS
// ═══════════════════════════════════════

export async function scheduleEvaluation(
  campInstanceId: string,
  studentId: string,
  dayNumber: number,
  evaluationType: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_scheduled_evaluations')
    .upsert(
      {
        camp_instance_id: campInstanceId,
        student_id: studentId,
        scheduled_day: dayNumber,
        evaluation_type: evaluationType,
      },
      { onConflict: 'camp_instance_id,student_id,scheduled_day,evaluation_type' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/camps/${campInstanceId}`);
  return data;
}

export async function getScheduledEvaluations(campInstanceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_scheduled_evaluations')
    .select('*, students(id, first_name, last_name, belt_level), coaches:completed_by(display_name)')
    .eq('camp_instance_id', campInstanceId)
    .order('scheduled_day')
    .order('evaluation_type');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function completeScheduledEvaluation(
  evaluationId: string,
  coachId: string,
  notes: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('camp_scheduled_evaluations')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      completed_by: coachId,
      notes,
    })
    .eq('id', evaluationId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/camps');
  return data;
}

export async function bulkScheduleEvaluations(
  campInstanceId: string,
  evaluations: { student_id: string; scheduled_day: number; evaluation_type: string }[]
) {
  const supabase = await createClient();

  const rows = evaluations.map((e) => ({
    camp_instance_id: campInstanceId,
    student_id: e.student_id,
    scheduled_day: e.scheduled_day,
    evaluation_type: e.evaluation_type,
  }));

  const { error } = await supabase
    .from('camp_scheduled_evaluations')
    .upsert(rows, { onConflict: 'camp_instance_id,student_id,scheduled_day,evaluation_type' });

  if (error) throw new Error(error.message);

  revalidatePath(`/camps/${campInstanceId}`);
  return { success: true, count: rows.length };
}

// ═══════════════════════════════════════
// GET TOTAL DAYS FOR CAMP INSTANCE
// ═══════════════════════════════════════

export async function getCampTotalDays(campId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('camp_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('camp_instance_id', campId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

// ═══════════════════════════════════════
// CAMP COMPLETION
// ═══════════════════════════════════════

export async function completeCamp(campId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('camp_instances')
    .update({ status: 'completed' })
    .eq('id', campId);

  if (error) throw new Error(error.message);

  revalidatePath(`/camps/${campId}`);
  revalidatePath('/camps');
  return { success: true };
}
