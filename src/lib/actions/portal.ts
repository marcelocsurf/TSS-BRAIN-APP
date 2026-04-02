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

  // 2. Get session results (standalone + cascade linked)
  const { data: sessionResults } = await admin
    .from('student_session_results')
    .select('*, standalone_sessions(*), coaches:coach_id(display_name)')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false });

  // 2b. Get cascade sessions directly (may not have student_session_results row)
  const { data: cascadeSessions } = await admin
    .from('cascade_sessions')
    .select('*, coaches:coach_id(display_name)')
    .eq('student_id', student.id)
    .eq('completion_state', 'closed')
    .order('session_date', { ascending: false });

  // 2c. Merge: cascade sessions that DON'T have a matching student_session_results row
  const resultCascadeIds = new Set(
    (sessionResults || [])
      .filter((r: any) => r.cascade_session_id)
      .map((r: any) => r.cascade_session_id)
  );

  const unmatchedCascade = (cascadeSessions || [])
    .filter((cs: any) => !resultCascadeIds.has(cs.id))
    .map((cs: any) => ({
      id: cs.id,
      student_id: cs.student_id,
      coach_id: cs.coach_id,
      status: cs.status,
      focus_rating: cs.focus_rating,
      frustration_rating: cs.frustration_rating,
      coach_feedback: [cs.coach_feedback_quick, cs.coach_feedback_text].filter(Boolean).join(' — ') || null,
      homework: [cs.homework_cues?.join(', '), cs.homework_text].filter(Boolean).join(' — ') || null,
      whats_next: cs.pilar_id_snapshot || null,
      achieved: cs.achieved,
      student_visible_summary: null,
      completion_state: 'closed',
      created_at: cs.created_at || cs.session_date,
      session_date: cs.session_date,
      coaches: cs.coaches,
      // Cascade-specific fields for display
      mission: cs.mission,
      training_venue: cs.training_venue,
      ocean_conditions: cs.ocean_conditions,
      pilar_id_snapshot: cs.pilar_id_snapshot,
      total_duration: cs.total_duration,
      warm_up: cs.warm_up,
      mental_hack: cs.mental_hack,
      drill_id: cs.drill_id,
      _source: 'cascade' as const,
    }));

  const sessions = [...(sessionResults || []), ...unmatchedCascade]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
  const coachSessions = sessions || [];
  const selfSessions = selfTrainingSessions || [];
  const totalSessions = coachSessions.length + selfSessions.length;
  const selfTrainingCount = selfSessions.filter((s: any) => s.completed).length;

  // Training hours: sum durations from both sources
  const coachHours = coachSessions.reduce((sum: number, s: any) => {
    const dur = s.standalone_sessions?.duration_minutes
      || s.duration_minutes
      || (s.total_duration ? parseInt(s.total_duration, 10) || 0 : 0);
    return sum + dur;
  }, 0);
  const selfHours = selfSessions
    .filter((s: any) => s.completed)
    .reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0);
  const totalTrainingMinutes = coachHours + selfHours;

  // Drills practiced (unique names from self-training)
  const drillsPracticed = [
    ...new Set(
      selfSessions
        .filter((s: any) => s.completed && s.drill_name)
        .map((s: any) => s.drill_name as string)
    ),
  ];

  // Recent drills with dates (from both sources, last 5)
  const recentDrills: { name: string; date: string; source: 'coach' | 'self' }[] = [];
  for (const s of coachSessions) {
    const mission = s.standalone_sessions?.mission;
    if (mission) {
      recentDrills.push({
        name: mission,
        date: s.created_at,
        source: 'coach',
      });
    }
  }
  for (const s of selfSessions) {
    if (s.completed && s.drill_name) {
      recentDrills.push({
        name: s.drill_name,
        date: s.created_at,
        source: 'self',
      });
    }
  }
  recentDrills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const topRecentDrills = recentDrills.slice(0, 5);

  // Calculate streak (consecutive days with sessions, counting backwards from both sources)
  let streak = 0;
  const allDates = [
    ...coachSessions.map((s: any) => new Date(s.created_at).toDateString()),
    ...selfSessions
      .filter((s: any) => s.completed)
      .map((s: any) => new Date(s.created_at).toDateString()),
  ];
  const uniqueDates = [...new Set(allDates)];

  if (uniqueDates.length > 0) {
    const today = new Date();
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toDateString();
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
  }

  return {
    student,
    sessions: coachSessions,
    selfTrainingSessions: selfSessions,
    surveyResultIds: Array.from(surveyResultIds),
    hasSurveyEver,
    totalSessions,
    streak,
    selfTrainingCount,
    totalTrainingMinutes,
    drillsPracticed,
    recentDrills: topRecentDrills,
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

  // 1. Try DB drills first — column names match drills table schema
  const { data: dbDrills } = await admin
    .from('drills')
    .select('id, drill_name, drill_type, goal, key_cue, related_pilar, belt_level_range')
    .eq('active_status', true)
    .order('drill_name');

  // Normalize DB drill rows to a consistent shape
  const normalizedDbDrills = (dbDrills || []).map((d: any) => ({
    id: d.id,
    name: d.drill_name,
    description: d.drill_type,
    goal: d.goal,
    key_cue: d.key_cue,
    pilar: d.related_pilar,
    belt_level_range: d.belt_level_range,
  }));

  const filteredDbDrills = normalizedDbDrills.filter((drill: any) => {
    if (!drill.belt_level_range) return true;
    const range = drill.belt_level_range.split('-').map((b: string) => b.trim());
    if (range.length === 2) {
      const minIdx = BELT_HIERARCHY.indexOf(range[0] as BeltLevel);
      const maxIdx = BELT_HIERARCHY.indexOf(range[1] as BeltLevel);
      return beltIndex >= minIdx && beltIndex <= maxIdx;
    }
    return BELT_HIERARCHY.slice(0, beltIndex + 1).includes(drill.belt_level_range as BeltLevel);
  });

  // 2. Also get drills from belt materials (always available)
  const { STUDENT_MATERIALS } = await import('@/lib/constants/student-materials');
  const materialDrills = STUDENT_MATERIALS
    .filter(m => m.category === 'drill' && BELT_HIERARCHY.indexOf(m.beltLevel as BeltLevel) <= beltIndex)
    .map(m => ({
      id: m.id,
      name: m.title,
      description: m.subtitle,
      goal: m.subtitle,
      key_cue: '',
      pilar: 'technical',
      belt_level_range: m.beltLevel,
      source: 'material' as const,
    }));

  // 3. Combine: DB drills first, then material drills (avoiding duplicates by name)
  const dbNames = new Set(filteredDbDrills.map((d: any) => d.name?.toLowerCase()));
  const uniqueMaterialDrills = materialDrills.filter(d => !dbNames.has(d.name?.toLowerCase()));

  return [...filteredDbDrills, ...uniqueMaterialDrills];
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
    venue_type?: string | null;
    wave_conditions?: string | null;
    wind?: string | null;
    tide?: string | null;
    crowd_level?: string | null;
    safety_check?: boolean;
    venue_notes?: string | null;
  }
) {
  const admin = createAdminClient();

  const insertData: Record<string, any> = {
    student_id: studentId,
    warm_up: data.warm_up,
    drill_id: data.drill_id,
    drill_name: data.drill_name,
    mental_hack: data.mental_hack,
    duration_minutes: data.duration_minutes,
    completed: false,
    notes: data.notes,
  };

  // Venue analysis fields (optional — columns may not exist yet)
  if (data.venue_type) insertData.venue_type = data.venue_type;
  if (data.wave_conditions) insertData.wave_conditions = data.wave_conditions;
  if (data.wind) insertData.wind = data.wind;
  if (data.tide) insertData.tide = data.tide;
  if (data.crowd_level) insertData.crowd_level = data.crowd_level;
  if (data.safety_check !== undefined) insertData.safety_check = data.safety_check;
  if (data.venue_notes) insertData.venue_notes = data.venue_notes;

  const { data: session, error } = await admin
    .from('self_training_sessions')
    .insert(insertData)
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
    .order('submitted_at', { ascending: false });

  return surveys || [];
}
