'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { getCurrentCoach } from './sessions';

export type BlockStatus = 'achieved' | 'partial' | 'not_yet';
export type SessionState = 'planned' | 'in_progress' | 'closed';

// ─── Create new multi-block session (planning starts) ───

export async function createMultiBlockSession(input: {
  studentId: string;
  sessionDate?: string;
  trainingVenue?: string;
  warmUp?: string;
  mentalHack?: string;
}) {
  const supabase = await createClient();
  const coach = await getCurrentCoach();

  const { data, error } = await supabase
    .from('multi_block_sessions')
    .insert({
      student_id: input.studentId,
      coach_id: coach.id,
      session_date: input.sessionDate || new Date().toISOString().slice(0, 10),
      training_venue: input.trainingVenue || null,
      warm_up: input.warmUp || null,
      mental_hack: input.mentalHack || null,
      total_planned_minutes: 0,
      completion_state: 'planned',
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/students/${input.studentId}`);
  return { id: data.id };
}

// ─── Update session header (date, venue, warm-up, mental hack) ───

export async function updateMultiBlockSession(
  id: string,
  patch: Partial<{
    session_date: string;
    training_venue: string;
    warm_up: string;
    mental_hack: string;
    notes_general: string;
  }>
) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    updates[k] = v === '' ? null : v;
  }
  const { error } = await supabase
    .from('multi_block_sessions')
    .update(updates)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Add a block to a session (returns the new block) ───

export async function addBlock(input: {
  multiBlockSessionId: string;
  studentId: string;
  stepId?: string | null;
  drillId?: string | null;
  durationMinutes: number;
  objectiveText?: string | null;
}) {
  const supabase = await createClient();

  // Compute next order_index
  const { data: existing } = await supabase
    .from('lesson_plan_blocks')
    .select('order_index')
    .eq('multi_block_session_id', input.multiBlockSessionId)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

  const { data: block, error } = await supabase
    .from('lesson_plan_blocks')
    .insert({
      multi_block_session_id: input.multiBlockSessionId,
      student_id: input.studentId,
      order_index: nextOrder,
      step_id: input.stepId || null,
      drill_id: input.drillId || null,
      duration_minutes: input.durationMinutes,
      objective_text: input.objectiveText || null,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  await recomputePlannedMinutes(input.multiBlockSessionId);
  return block;
}

// ─── Update a single block's planning fields ───

export async function updateBlock(
  blockId: string,
  patch: Partial<{
    duration_minutes: number;
    objective_text: string | null;
    drill_id: string | null;
    step_id: string | null;
  }>
) {
  const supabase = await createClient();

  const { data: block } = await supabase
    .from('lesson_plan_blocks')
    .select('multi_block_session_id')
    .eq('id', blockId)
    .single();

  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    updates[k] = v === '' ? null : v;
  }

  const { error } = await supabase
    .from('lesson_plan_blocks')
    .update(updates)
    .eq('id', blockId);

  if (error) throw new Error(error.message);
  if (block?.multi_block_session_id) {
    await recomputePlannedMinutes(block.multi_block_session_id);
  }
}

// ─── Reorder a block up or down by 1 ───

export async function reorderBlock(blockId: string, direction: 'up' | 'down') {
  const supabase = await createClient();

  const { data: target } = await supabase
    .from('lesson_plan_blocks')
    .select('id, multi_block_session_id, order_index')
    .eq('id', blockId)
    .single();

  if (!target) throw new Error('Block not found');

  const cmp = direction === 'up' ? 'lt' : 'gt';
  const order = direction === 'up' ? 'desc' : 'asc';

  const { data: neighbor } = await supabase
    .from('lesson_plan_blocks')
    .select('id, order_index')
    .eq('multi_block_session_id', target.multi_block_session_id)
    [cmp]('order_index', target.order_index)
    .order('order_index', { ascending: order === 'asc' })
    .limit(1)
    .maybeSingle();

  if (!neighbor) return; // already at edge

  // Swap
  await supabase
    .from('lesson_plan_blocks')
    .update({ order_index: -1 })
    .eq('id', target.id);
  await supabase
    .from('lesson_plan_blocks')
    .update({ order_index: target.order_index })
    .eq('id', neighbor.id);
  await supabase
    .from('lesson_plan_blocks')
    .update({ order_index: neighbor.order_index })
    .eq('id', target.id);
}

// ─── Delete a block ───

export async function deleteBlock(blockId: string) {
  const supabase = await createClient();
  const { data: block } = await supabase
    .from('lesson_plan_blocks')
    .select('multi_block_session_id')
    .eq('id', blockId)
    .single();

  const { error } = await supabase
    .from('lesson_plan_blocks')
    .delete()
    .eq('id', blockId);
  if (error) throw new Error(error.message);

  if (block?.multi_block_session_id) {
    await recomputePlannedMinutes(block.multi_block_session_id);
  }
}

// ─── Start a planned session (in_progress) ───

export async function startMultiBlockSession(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('multi_block_sessions')
    .update({
      completion_state: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Close a single block with status + notes ───

export async function closeBlock(input: {
  blockId: string;
  status: BlockStatus;
  coachNotes?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('lesson_plan_blocks')
    .update({
      status: input.status,
      coach_notes: input.coachNotes?.trim() || null,
    })
    .eq('id', input.blockId);
  if (error) throw new Error(error.message);
}

// ─── Close the entire session: writes student_session_results + emails ───

export async function closeMultiBlockSession(input: {
  multiBlockSessionId: string;
  generalCoachFeedback?: string;
  generalHomework?: string;
  generalWhatsNext?: string;
  totalActualMinutes?: number;
}) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const coach = await getCurrentCoach();

  // Fetch session + student + blocks for the closing summary
  const { data: session, error: sErr } = await supabase
    .from('multi_block_sessions')
    .select(
      'id, student_id, coach_id, session_date, training_venue, total_planned_minutes'
    )
    .eq('id', input.multiBlockSessionId)
    .single();
  if (sErr || !session) throw new Error('Session not found');

  const { data: blocks } = await supabase
    .from('lesson_plan_blocks')
    .select('id, status, drill_id, objective_text, order_index')
    .eq('multi_block_session_id', input.multiBlockSessionId)
    .order('order_index');

  // Validate every block has been scored
  const unscored = (blocks ?? []).filter((b: any) => !b.status);
  if (unscored.length > 0) {
    throw new Error(
      `Score all blocks before closing (${unscored.length} unscored).`
    );
  }

  // Compute overall status from per-block statuses (worst = overall)
  const statuses = (blocks ?? []).map((b: any) => b.status);
  const overallStatus = statuses.includes('not_yet')
    ? 'not_yet'
    : statuses.includes('partial')
    ? 'partial'
    : 'achieved';

  const overallMission = `${(blocks ?? []).length}-block session: ${(blocks ?? [])
    .map((b: any) => b.objective_text || b.drill_id || `Block ${b.order_index + 1}`)
    .join(' / ')}`.slice(0, 240);

  // Update session row
  const { error: closeErr } = await supabase
    .from('multi_block_sessions')
    .update({
      completion_state: 'closed',
      closed_at: new Date().toISOString(),
      total_actual_minutes: input.totalActualMinutes ?? null,
      general_coach_feedback: input.generalCoachFeedback?.trim() || null,
      general_homework: input.generalHomework?.trim() || null,
      general_whats_next: input.generalWhatsNext?.trim() || null,
    })
    .eq('id', input.multiBlockSessionId);
  if (closeErr) throw new Error(closeErr.message);

  // Insert into unified bítacora
  const { data: result, error: resultErr } = await supabase
    .from('student_session_results')
    .insert({
      student_id: session.student_id,
      coach_id: coach.id,
      multi_block_session_id: session.id,
      status: overallStatus,
      coach_feedback: input.generalCoachFeedback?.trim() || null,
      homework: input.generalHomework?.trim() || null,
      whats_next: input.generalWhatsNext?.trim() || null,
      completion_state: 'closed',
      survey_unlocked: true,
      portal_token: null,
    })
    .select('id')
    .single();

  if (resultErr) {
    console.error('student_session_results insert failed:', resultErr.message);
  }

  // Audit log
  await admin.from('audit_log').insert({
    session_result_id: result?.id || null,
    actor_type: 'coach',
    actor_id: coach.id,
    actor_name: coach.display_name,
    event_type: 'session_closed',
    status_before: 'in_progress',
    status_after: 'closed',
    note: `Multi-block session closed: ${(blocks ?? []).length} blocks. Overall: ${overallStatus}.`,
  });

  // Email — fetch student then send (non-blocking)
  const { data: student } = await admin
    .from('students')
    .select('first_name, email, portal_token, belt_level')
    .eq('id', session.student_id)
    .single();

  if (student?.email && student.portal_token && result?.id) {
    try {
      const { sendSessionEmail } = await import('@/lib/actions/email');
      const emailResult = await sendSessionEmail({
        studentName: student.first_name,
        studentEmail: student.email,
        portalToken: student.portal_token,
        coachName: coach.display_name,
        sessionDate: session.session_date || new Date().toISOString(),
        mission: overallMission,
        status: overallStatus,
        coachFeedback: input.generalCoachFeedback?.trim() || '(no general feedback)',
        homework: input.generalHomework?.trim() || '(see per-block notes)',
        whatsNext: input.generalWhatsNext?.trim() || '(planned soon)',
        beltLevel: student.belt_level,
        sessionResultId: result.id,
      });
      if (emailResult.success) {
        await supabase
          .from('student_session_results')
          .update({ email_sent: true, email_sent_at: new Date().toISOString() })
          .eq('id', result.id);
      }
    } catch (e: any) {
      console.error('Email failed (non-blocking):', e.message);
    }
  }

  revalidatePath(`/students/${session.student_id}`);
  revalidatePath(`/sessions/plan/${input.multiBlockSessionId}`);
  return { resultId: result?.id, overallStatus };
}

// ─── G3 Continuity: clone the just-closed session as a new planned one ───
//
// Called from the "Plan next session?" modal that appears after a close.
// Creates a new multi_block_sessions row in 'planned' state for the same
// student, optionally with the same blocks (drill_id + duration +
// objective) and warm-up / mental-hack copied over so the coach can use
// the closed session's plan as the starting point for the next one.
//
// The general feedback / homework / whats_next from the just-closed
// session are NOT copied — those are evaluation, not planning.

export async function planNextSession(input: {
  currentSessionId: string;
  sessionDate: string;
  copyBlocks: boolean;
  copyCommon: boolean;
}) {
  const supabase = await createClient();
  const coach = await getCurrentCoach();

  // Fetch the source session header + (optionally) blocks
  const { data: source, error: srcErr } = await supabase
    .from('multi_block_sessions')
    .select('student_id, training_venue, warm_up, mental_hack')
    .eq('id', input.currentSessionId)
    .single();
  if (srcErr || !source) throw new Error('Source session not found');

  // Create the new planned session
  const { data: newSession, error: insErr } = await supabase
    .from('multi_block_sessions')
    .insert({
      student_id: source.student_id,
      coach_id: coach.id,
      session_date: input.sessionDate,
      training_venue: source.training_venue,
      warm_up: input.copyCommon ? source.warm_up : null,
      mental_hack: input.copyCommon ? source.mental_hack : null,
      total_planned_minutes: 0,
      completion_state: 'planned',
    })
    .select('id')
    .single();
  if (insErr || !newSession) throw new Error(insErr?.message || 'Failed to create next session');

  // Optionally copy the blocks
  if (input.copyBlocks) {
    const { data: blocks } = await supabase
      .from('lesson_plan_blocks')
      .select('order_index, step_id, drill_id, duration_minutes, objective_text')
      .eq('multi_block_session_id', input.currentSessionId)
      .order('order_index');

    if (blocks && blocks.length > 0) {
      const rows = blocks.map((b: any) => ({
        multi_block_session_id: newSession.id,
        student_id: source.student_id,
        order_index: b.order_index,
        step_id: b.step_id,
        drill_id: b.drill_id,
        duration_minutes: b.duration_minutes,
        objective_text: b.objective_text,
      }));
      const { error: blockErr } = await supabase.from('lesson_plan_blocks').insert(rows);
      if (blockErr) throw new Error(blockErr.message);
      await recomputePlannedMinutes(newSession.id);
    }
  }

  revalidatePath(`/students/${source.student_id}`);
  return { id: newSession.id };
}

// ─── Recompute total_planned_minutes from blocks (called after add/edit/del) ───

async function recomputePlannedMinutes(multiBlockSessionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('lesson_plan_blocks')
    .select('duration_minutes')
    .eq('multi_block_session_id', multiBlockSessionId);
  const total = (data ?? []).reduce(
    (s: number, b: any) => s + (b.duration_minutes || 0),
    0
  );
  await supabase
    .from('multi_block_sessions')
    .update({ total_planned_minutes: total })
    .eq('id', multiBlockSessionId);
}

// ═══════════════════════════════════════════════════════════
// READ HELPERS — used by the planning UI
// ═══════════════════════════════════════════════════════════

export async function getMultiBlockSession(id: string) {
  const supabase = await createClient();

  const [sessionQ, blocksQ] = await Promise.all([
    supabase
      .from('multi_block_sessions')
      .select(
        `*,
         students(id, first_name, last_name, belt_level, ocean_level, portal_token, photo_url),
         coaches:coach_id(id, display_name)`
      )
      .eq('id', id)
      .single(),
    supabase
      .from('lesson_plan_blocks')
      .select('*')
      .eq('multi_block_session_id', id)
      .order('order_index'),
  ]);

  if (sessionQ.error || !sessionQ.data) return null;
  return { session: sessionQ.data, blocks: blocksQ.data ?? [] };
}

// Returns drills_missions filtered by step_id (and belt if a match exists).
// NOTE: drills_missions.belt stores values like 'white', while student.belt_level
// is 'white_belt'. We normalize by stripping the '_belt' suffix. If filtering
// returns 0 rows we fall back to no-belt-filter so the coach is never blocked.
export async function getDrillsForStep(stepId: string, belt?: string) {
  const supabase = await createClient();
  const normalizedBelt = belt ? belt.replace(/_belt$/, '') : null;

  const baseQuery = () =>
    supabase
      .from('drills_missions')
      .select('id, step_id, title, type, time_estimate, key_words, success_criteria, belt, block_name')
      .eq('step_id', stepId)
      .eq('active', true);

  if (normalizedBelt) {
    const { data } = await baseQuery().eq('belt', normalizedBelt).order('type').order('id');
    if (data && data.length > 0) return data;
  }
  // Fallback: any belt
  const { data: all } = await baseQuery().order('type').order('id');
  return all ?? [];
}

// Steps the student should be working on given their belt + sequence number.
// Returns the canonical list of STP-XXX ids with title for the picker.
export async function getStepsForBelt(belt: string) {
  const supabase = await createClient();
  // La cinta llegaba de parámetro y se IGNORABA: el picker de pasos del plan
  // individual siempre ofrecía white_belt, aunque el alumno fuera Blue.
  // Mismo criterio acumulativo que getMySequence: un alumno de Blue entrena
  // también lo de White y Yellow.
  const ORDER = ['white', 'yellow', 'blue', 'purple', 'brown', 'black'];
  const key = (belt || 'white').replace(/_belt$/, '');
  const upto = ORDER.indexOf(key);
  const sections = (upto >= 0 ? ORDER.slice(0, upto + 1) : ['white']).map((b) => `${b}_belt`);
  const { data } = await supabase
    .from('lessons')
    .select('id, title, sequence_step_order, wb_sequence_id, wb_sequence_name, course_section')
    .in('course_section', sections)
    .eq('active', true)
    .order('course_section', { ascending: true })
    .order('sequence_step_order', { ascending: true });
  return (data ?? []) as Array<{
    id: string;
    title: string;
    sequence_step_order: number | null;
    wb_sequence_id: string | null;
    wb_sequence_name: string | null;
  }>;
}

// Suggestions for this student based on their self-ratings (from Track A).
// Returns the IDs of drills_missions whose step_id is among the student's
// "struggling" steps (current_rating < 3), ranked by lowest rating first.
export async function getSuggestedDrillsForStudent(studentId: string, belt: string) {
  const supabase = await createClient();
  const normalizedBelt = belt ? belt.replace(/_belt$/, '') : null;

  const { data: ratings } = await supabase
    .from('student_step_ratings')
    .select('step_id, current_rating')
    .eq('student_id', studentId)
    .lt('current_rating', 3)
    .order('current_rating', { ascending: true })
    .limit(10);

  const stepIds = (ratings ?? []).map((r: any) => r.step_id);
  if (stepIds.length === 0) return [];

  const baseQuery = () =>
    supabase
      .from('drills_missions')
      .select('id, step_id, title, type, time_estimate, key_words')
      .in('step_id', stepIds)
      .eq('active', true);

  let drills: any[] | null = null;
  if (normalizedBelt) {
    const r = await baseQuery().eq('belt', normalizedBelt);
    drills = r.data;
  }
  if (!drills || drills.length === 0) {
    const r = await baseQuery();
    drills = r.data ?? [];
  }

  const byStep = new Map(stepIds.map((s, i) => [s, i]));
  return (drills ?? [])
    .map((d: any) => ({
      ...d,
      currentRating: ratings?.find((r: any) => r.step_id === d.step_id)?.current_rating ?? null,
    }))
    .sort((a, b) => (byStep.get(a.step_id) ?? 99) - (byStep.get(b.step_id) ?? 99));
}
