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

  // ── Surf hours: split bitácora into Training vs Free Surfing ──
  // Training = structured mission/drill durations + coach-led planned durations.
  // Free Surfing = free-surf logs + overflow (water time beyond the mission).
  let surfTrainingMinutes = 0;
  let freeSurfMinutes = 0;
  for (const s of selfSessions) {
    const dur = s.duration_minutes || 0;
    const water = s.total_water_minutes || 0;
    if (s.kind === 'free_surf') {
      freeSurfMinutes += water || dur;
    } else {
      surfTrainingMinutes += dur;
      if (water > dur) freeSurfMinutes += water - dur;
    }
  }
  // Coach-led sessions: planned durations already summed in coachHours above.
  surfTrainingMinutes += coachHours;
  const surfHours = {
    trainingMinutes: surfTrainingMinutes,
    freeSurfMinutes,
    totalMinutes: surfTrainingMinutes + freeSurfMinutes,
  };

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

  // ── Multi-block sessions: pull upcoming (planned/in_progress) + closed history
  const { data: multiBlockSessions } = await admin
    .from('multi_block_sessions')
    .select(
      'id, session_date, training_venue, completion_state, total_planned_minutes, total_actual_minutes, general_coach_feedback, general_homework, general_whats_next, started_at, closed_at, created_at, coach_id, coaches:coach_id(display_name)'
    )
    .eq('student_id', student.id)
    .order('session_date', { ascending: false })
    .limit(30);

  const upcomingMultiBlock = (multiBlockSessions ?? []).filter(
    (m: any) => m.completion_state === 'planned' || m.completion_state === 'in_progress'
  );
  const closedMultiBlock = (multiBlockSessions ?? []).filter(
    (m: any) => m.completion_state === 'closed'
  );

  // For upcoming, also fetch the blocks so the student can see what's planned
  const upcomingIds = upcomingMultiBlock.map((m: any) => m.id);
  let upcomingBlocks: any[] = [];
  if (upcomingIds.length > 0) {
    const { data } = await admin
      .from('lesson_plan_blocks')
      .select('id, multi_block_session_id, order_index, step_id, drill_id, duration_minutes, objective_text')
      .in('multi_block_session_id', upcomingIds)
      .order('multi_block_session_id')
      .order('order_index');
    upcomingBlocks = data ?? [];
  }

  // Group blocks by session_id
  const blocksBySession = new Map<string, any[]>();
  upcomingBlocks.forEach((b: any) => {
    const arr = blocksBySession.get(b.multi_block_session_id) ?? [];
    arr.push(b);
    blocksBySession.set(b.multi_block_session_id, arr);
  });
  const upcomingWithBlocks = upcomingMultiBlock.map((m: any) => ({
    ...m,
    blocks: blocksBySession.get(m.id) ?? [],
  }));

  // M9 — load the student's academy branding so the portal can theme
  // its top bar / hero. Falls back to TSS defaults when missing.
  let academyBranding: {
    name: string | null;
    logo_url: string | null;
    primary_color: string | null;
    accent_color: string | null;
    tagline: string | null;
  } | null = null;
  if (student.academy_id) {
    const { data: aca } = await admin
      .from('academies')
      .select('name, logo_url, primary_color, accent_color, tagline')
      .eq('id', student.academy_id)
      .single();
    academyBranding = aca ?? null;
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
    surfHours,
    drillsPracticed,
    recentDrills: topRecentDrills,
    upcomingMultiBlock: upcomingWithBlocks,
    closedMultiBlock,
    academyBranding,
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

// ─── Get all drills + missions from drills_missions for the Train picker ───
//
// Used by the redesigned Train tab: the student MUST pick a canonical drill
// or mission before training, so this returns the full catalog filtered by
// belt + active. (For "Custom Session" mode the picker is bypassed entirely.)

export async function getDrillsMissionsForBelt(belt: string) {
  const admin = createAdminClient();
  const normalizedBelt = belt ? belt.replace(/_belt$/, '') : null;

  const baseQuery = () =>
    admin
      .from('drills_missions')
      .select('id, step_id, title, type, time_estimate, key_words, success_criteria, belt, block_name, reps_recommended')
      .eq('active', true);

  // Try filter by belt; fall back to all if zero matches (defensive vs naming drift)
  if (normalizedBelt) {
    const { data } = await baseQuery().eq('belt', normalizedBelt).order('type').order('id');
    if (data && data.length > 0) return data;
  }
  const { data: all } = await baseQuery().order('type').order('id');
  return all ?? [];
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
    /** 'drill' (default — counts toward step metrics) or 'custom' (free-form, doesn't count). */
    kind?: 'drill' | 'custom';
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
    kind: data.kind || 'drill',
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

export async function completeSelfTrainingSession(
  sessionId: string,
  notes?: string,
  totalWaterMinutes?: number
) {
  const admin = createAdminClient();

  const update: Record<string, any> = { completed: true };
  if (notes) update.notes = notes;
  if (typeof totalWaterMinutes === 'number' && totalWaterMinutes > 0) {
    update.total_water_minutes = Math.round(totalWaterMinutes);
  }

  const { error } = await admin
    .from('self_training_sessions')
    .update(update)
    .eq('id', sessionId);

  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Log a pure free-surf session (no mission/drill) ───

export async function logFreeSurf(
  token: string,
  minutes: number,
  dateISO?: string,
  notes?: string
) {
  const admin = createAdminClient();

  const { data: student, error: studentErr } = await admin
    .from('students')
    .select('id')
    .eq('portal_token', token)
    .single();

  if (studentErr || !student) throw new Error('Student not found');

  const mins = Math.round(minutes);
  if (!mins || mins <= 0) throw new Error('Invalid duration');

  const insertData: Record<string, any> = {
    student_id: student.id,
    kind: 'free_surf',
    duration_minutes: mins,
    total_water_minutes: mins,
    completed: true,
    drill_name: 'Free Surf',
  };
  if (notes && notes.trim()) insertData.notes = notes.trim();
  if (dateISO) insertData.created_at = new Date(dateISO).toISOString();

  const { error } = await admin
    .from('self_training_sessions')
    .insert(insertData);

  if (error) throw new Error(error.message);
  return { ok: true };
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

// ─── Get "My Coach" data — current coach + stats with this student ───
//
// Returns the coach who ran the student's MOST RECENT closed session, plus
// computed stats specific to that coach + student pair (sessions count,
// total hours, average rating from this student's surveys, latest session
// date). Used by the portal "My Coach" tab, which only renders if the
// student's coach_profile_unlocked_at is set.

export async function getMyCoachData(studentId: string) {
  const admin = createAdminClient();

  // Find the coach of the student's most recent closed session
  const { data: lastResult } = await admin
    .from('student_session_results')
    .select('coach_id, created_at')
    .eq('student_id', studentId)
    .eq('completion_state', 'closed')
    .not('coach_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!lastResult?.coach_id) return null;
  const coachId = lastResult.coach_id;

  // Fetch coach profile + this student's history with this coach in parallel
  const [coachQ, sessionsQ, surveysQ] = await Promise.all([
    admin
      .from('coaches')
      .select(
        'id, display_name, first_name, last_name, role, certification_level, max_belt_permission, languages, specialty_area, active_status'
      )
      .eq('id', coachId)
      .single(),
    admin
      .from('student_session_results')
      .select('id, created_at, status, standalone_sessions(duration_minutes, session_date)')
      .eq('student_id', studentId)
      .eq('coach_id', coachId)
      .eq('completion_state', 'closed'),
    admin
      .from('survey_responses')
      .select('coach_rating, session_quality, q4_session_value, submitted_at, session_result_id, student_session_results!inner(coach_id)')
      .eq('student_id', studentId)
      .eq('student_session_results.coach_id', coachId),
  ]);

  if (!coachQ.data) return null;

  const sessions = sessionsQ.data || [];
  const surveys = surveysQ.data || [];

  const totalSessions = sessions.length;
  // Supabase returns the related row(s) — sometimes as a single object,
  // sometimes as an array depending on FK shape. Normalize defensively.
  const standaloneOf = (row: any) => {
    const ss = row?.standalone_sessions;
    if (!ss) return null;
    return Array.isArray(ss) ? ss[0] : ss;
  };
  const totalMinutes = sessions.reduce(
    (sum: number, s: any) => sum + (standaloneOf(s)?.duration_minutes || 0),
    0
  );
  const lastSessionDate =
    standaloneOf(sessions[0])?.session_date || sessions[0]?.created_at || null;

  const ratings = surveys.map((s: any) => s.coach_rating).filter((n: number) => n > 0);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  return {
    coach: coachQ.data,
    stats: {
      totalSessions,
      totalMinutes,
      lastSessionDate,
      avgRating,
      ratingsCount: ratings.length,
    },
  };
}
