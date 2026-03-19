'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { BELT_HIERARCHY, type BeltLevel } from '@/lib/constants/belts';
import { getMaterialsForStudent } from '@/lib/constants/student-materials';

// ─── Get comprehensive student data for the portal ───

export async function getStudentPortalData(token: string) {
  const admin = createAdminClient();

  // 1. Get student by portal token
  const { data: student, error: studentErr } = await admin
    .from('students')
    .select('*')
    .eq('portal_token', token)
    .single();

  if (studentErr || !student) return null;

  // 2. Get all session results with related data
  const { data: sessions } = await admin
    .from('student_session_results')
    .select('*, standalone_sessions(*), coaches:coach_id(display_name)')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false });

  // 3. Get self-training sessions
  const { data: selfTrainingSessions } = await admin
    .from('self_training_sessions')
    .select('*')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false });

  // 4. Get all survey responses for this student
  const { data: surveys } = await admin
    .from('survey_responses')
    .select('id, session_result_id')
    .eq('student_id', student.id);

  const surveyResultIds = new Set((surveys || []).map((s: any) => s.session_result_id));
  const hasSurveyEver = (surveys || []).length > 0;

  // 5. Compute quick stats
  const totalSessions = (sessions || []).length + (selfTrainingSessions || []).length;

  // Calculate streak (consecutive days with sessions, counting backwards)
  let streak = 0;
  if (sessions && sessions.length > 0) {
    const dates = sessions.map((s: any) => new Date(s.created_at).toDateString());
    const uniqueDates = [...new Set(dates)];
    const today = new Date();
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toDateString();
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today hasn't had a session yet — check from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
  }

  return {
    student,
    sessions: sessions || [],
    selfTrainingSessions: selfTrainingSessions || [],
    surveyResultIds: Array.from(surveyResultIds),
    hasSurveyEver,
    totalSessions,
    streak,
  };
}

// ─── Get materials filtered by student access ───
// Access is determined by:
// 1. The student's current belt_level (always accessible)
// 2. Any admin-granted levels in student_level_access table

export async function getStudentMaterials(studentId: string, beltLevel: BeltLevel) {
  const admin = createAdminClient();

  // Query admin-granted level access
  const { data: accessRows } = await admin
    .from('student_level_access')
    .select('level_key')
    .eq('student_id', studentId)
    .eq('active', true);

  const grantedLevels = (accessRows || [])
    .map((r: any) => r.level_key as BeltLevel)
    .filter((k: string) => BELT_HIERARCHY.includes(k as BeltLevel));

  return getMaterialsForStudent(beltLevel, grantedLevels);
}

// ─── Get drills for self-training filtered by belt ───

export async function getStudentDrillsForSelfTraining(beltLevel: BeltLevel) {
  const admin = createAdminClient();

  // Get the belt order index
  const beltIndex = BELT_HIERARCHY.indexOf(beltLevel);
  const accessibleBelts = BELT_HIERARCHY.slice(0, beltIndex + 1);

  // Try to get drills from the drills table, filtering by belt range
  const { data: drills } = await admin
    .from('drills')
    .select('id, name, description, goal, key_cue, pilar, belt_level_range')
    .eq('active', true)
    .order('name');

  if (!drills || drills.length === 0) {
    return [];
  }

  // Filter drills by belt level range
  return drills.filter((drill: any) => {
    if (!drill.belt_level_range) return true; // no restriction
    // belt_level_range could be like "white_belt-blue_belt" or just a single belt
    const range = drill.belt_level_range.split('-').map((b: string) => b.trim());
    if (range.length === 2) {
      const minIdx = BELT_HIERARCHY.indexOf(range[0] as BeltLevel);
      const maxIdx = BELT_HIERARCHY.indexOf(range[1] as BeltLevel);
      return beltIndex >= minIdx && beltIndex <= maxIdx;
    }
    // Single belt
    return accessibleBelts.includes(drill.belt_level_range as BeltLevel);
  });
}

// ─── Create a self-training session ───

export async function createSelfTrainingSession(
  studentId: string,
  data: {
    warm_up: string | null;
    drill_id: string | null;
    drill_name: string | null;
    mental_hack: string | null;
    duration_minutes: number;
    notes: string | null;
  }
) {
  const admin = createAdminClient();

  const { data: session, error } = await admin
    .from('self_training_sessions')
    .insert({
      student_id: studentId,
      warm_up: data.warm_up,
      drill_id: data.drill_id,
      drill_name: data.drill_name,
      mental_hack: data.mental_hack,
      duration_minutes: data.duration_minutes,
      completed: false,
      notes: data.notes,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return session;
}

// ─── Complete a self-training session ───

export async function completeSelfTrainingSession(sessionId: string, notes?: string) {
  const admin = createAdminClient();

  const update: Record<string, any> = { completed: true };
  if (notes) update.notes = notes;

  const { error } = await admin
    .from('self_training_sessions')
    .update(update)
    .eq('id', sessionId);

  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Get pending surveys (sessions without survey responses) ───

export async function getPendingSurveys(studentId: string) {
  const admin = createAdminClient();

  // Get all session results that have survey_unlocked=true
  const { data: results } = await admin
    .from('student_session_results')
    .select('id, created_at, status, coach_feedback, standalone_sessions(*), coaches:coach_id(display_name)')
    .eq('student_id', studentId)
    .eq('survey_unlocked', true)
    .order('created_at', { ascending: false });

  if (!results || results.length === 0) return [];

  // Get survey responses for this student
  const { data: surveys } = await admin
    .from('survey_responses')
    .select('session_result_id')
    .eq('student_id', studentId);

  const completedIds = new Set((surveys || []).map((s: any) => s.session_result_id));

  // Return results that don't have surveys yet
  return results.filter((r: any) => !completedIds.has(r.id));
}

// ─── Get past submitted surveys ───

export async function getSubmittedSurveys(studentId: string) {
  const admin = createAdminClient();

  const { data: surveys } = await admin
    .from('survey_responses')
    .select('*, student_session_results(created_at, status, standalone_sessions(mission))')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  return surveys || [];
}
