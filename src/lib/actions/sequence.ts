'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// ─── Types ───

export type DrillMissionRow = {
  id: string;
  step_id: string;
  title: string;
  type: 'drill' | 'mission';
  time_estimate: string | null;
  reps_recommended: string | null;
  key_words: string[];
  description_md: string | null;
  success_criteria: string[];
  belt: string;
  block_number: number;
  block_name: string;
  display_order: number;
  videos?: { id: string; url: string; label: string | null }[];
};

export type StepRating = {
  student_id: string;
  step_id: string;
  current_rating: number | null;
  rating_count: number;
  last_updated: string;
};

export type SequenceItem = {
  step_id: string;
  step_title: string;
  pillar: string | null;
  block_number: number;
  block_name: string;
  display_order: number;
  // Per canon v1, each STP has BOTH a drill (training mechanic, on-land/calm)
  // AND a mission (water application — Ecological Dynamics).
  drill: DrillMissionRow | null;
  mission: DrillMissionRow | null;
  rating: number | null;
  rating_count: number;
  last_rated: string | null;
  // M4: Official rating from coach (gold). Null when not yet evaluated.
  coach_rating?: number | null;
  coach_rated_at?: string | null;
  last_practiced: string | null;
};

export type SequenceData = {
  belt: string;
  overallRating: number | null;
  totalSteps: number;
  ratedSteps: number;
  blocks: {
    block_number: number;
    block_name: string;
    items: SequenceItem[];
  }[];
};

// ─── Get full sequence catalog for a student ───

export async function getMySequence(studentId: string, belt: string = 'white'): Promise<SequenceData> {
  const admin = createAdminClient();

  // Normalize belt: students.belt_level uses 'white_belt'/'yellow_belt'/etc,
  // but drills_missions.belt uses 'white'/'yellow'/etc.
  const beltKey = belt.replace(/_belt$/, '');
  const courseSection = beltKey === 'white' ? 'white_belt' : `${beltKey}_belt`;

  // 1. Get all drills/missions for this belt (student-visible only — admins can
  // mark a drill coach-only via the Drill Library, which hides it here).
  const { data: drills } = await admin
    .from('drills_missions')
    .select('*')
    .eq('belt', beltKey)
    .eq('active', true)
    .eq('student_visible', true)
    .order('display_order', { ascending: true });

  // 2. Get all STP lessons (for titles + pillars)
  const { data: lessons } = await admin
    .from('lessons')
    .select('id, title, pillar, display_order')
    .eq('course_section', courseSection)
    .eq('active', true);

  // 3. Get student ratings
  const { data: ratings } = await admin
    .from('student_step_ratings')
    .select('*')
    .eq('student_id', studentId);

  // 4. Get last practiced per STP from self_training_sessions
  const { data: sessions } = await admin
    .from('self_training_sessions')
    .select('linked_step_id, created_at')
    .eq('student_id', studentId)
    .not('linked_step_id', 'is', null)
    .order('created_at', { ascending: false });

  // Build lookup maps — split drills and missions
  const drillMap = new Map<string, DrillMissionRow>();
  const missionMap = new Map<string, DrillMissionRow>();
  (drills || []).forEach((d: any) => {
    if (d.type === 'drill') drillMap.set(d.step_id, d as DrillMissionRow);
    else if (d.type === 'mission') missionMap.set(d.step_id, d as DrillMissionRow);
  });

  const lessonMap = new Map<string, any>();
  (lessons || []).forEach((l: any) => lessonMap.set(l.id, l));

  const ratingMap = new Map<string, any>();
  (ratings || []).forEach((r: any) => ratingMap.set(r.step_id, r));

  const lastPracticedMap = new Map<string, string>();
  (sessions || []).forEach((s: any) => {
    if (!lastPracticedMap.has(s.linked_step_id)) {
      lastPracticedMap.set(s.linked_step_id, s.created_at);
    }
  });

  // Get unique step IDs from drills+missions (one item per STP, with both)
  const stepIds = new Set<string>();
  (drills || []).forEach((d: any) => stepIds.add(d.step_id));

  // Build sequence items (one per STP, holds both drill and mission)
  const items: SequenceItem[] = Array.from(stepIds).map((stepId) => {
    const drill = drillMap.get(stepId) || null;
    const mission = missionMap.get(stepId) || null;
    const primary = drill || mission; // for block / display order
    const lesson = lessonMap.get(stepId);
    const rating = ratingMap.get(stepId);
    return {
      step_id: stepId,
      step_title: lesson?.title || stepId,
      pillar: lesson?.pillar || null,
      block_number: primary?.block_number || 0,
      block_name: primary?.block_name || '',
      display_order: primary?.display_order || 0,
      drill,
      mission,
      rating: rating?.current_rating || null,
      rating_count: rating?.rating_count || 0,
      last_rated: rating?.last_updated || null,
      coach_rating: rating?.coach_rating ?? null,
      coach_rated_at: rating?.coach_rated_at ?? null,
      last_practiced: lastPracticedMap.get(stepId) || null,
    };
  });

  // Group by block
  const blocksMap = new Map<number, { block_name: string; items: SequenceItem[] }>();
  items.forEach((item) => {
    if (!blocksMap.has(item.block_number)) {
      blocksMap.set(item.block_number, {
        block_name: item.block_name,
        items: [],
      });
    }
    blocksMap.get(item.block_number)!.items.push(item);
  });

  const blocks = Array.from(blocksMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([block_number, data]) => ({
      block_number,
      block_name: data.block_name,
      items: data.items.sort((a, b) => a.display_order - b.display_order),
    }));

  // Calculate overall rating (avg of rated STPs)
  const ratedItems = items.filter((i) => i.rating !== null);
  const overallRating = ratedItems.length > 0
    ? ratedItems.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedItems.length
    : null;

  return {
    belt,
    overallRating,
    totalSteps: items.length,
    ratedSteps: ratedItems.length,
    blocks,
  };
}

// ─── Get full detail for a single STP ───

export async function getStepDetail(studentId: string, stepId: string) {
  const admin = createAdminClient();

  // Get lesson info
  const { data: lesson } = await admin
    .from('lessons')
    .select('id, title, pillar, subtitle, description_md, drill_md, errors_md')
    .eq('id', stepId)
    .single();

  // Get drill AND mission for this step (canon v1: each STP has both)
  const { data: drillsAndMissions } = await admin
    .from('drills_missions')
    .select('*')
    .eq('step_id', stepId)
    .eq('active', true);

  const drill =
    (drillsAndMissions || []).find((d: any) => d.type === 'drill') || null;
  const mission =
    (drillsAndMissions || []).find((d: any) => d.type === 'mission') || null;

  // Get current rating
  const { data: rating } = await admin
    .from('student_step_ratings')
    .select('*')
    .eq('student_id', studentId)
    .eq('step_id', stepId)
    .maybeSingle();

  // Get session history for this step
  const { data: sessions } = await admin
    .from('self_training_sessions')
    .select('id, created_at, duration_minutes, focus_rating, mission_completion, execution_rating, notes, linked_drill_mission_id')
    .eq('student_id', studentId)
    .eq('linked_step_id', stepId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    lesson: lesson || null,
    drill,
    mission,
    rating: rating?.current_rating || null,
    ratingCount: rating?.rating_count || 0,
    lastRated: rating?.last_updated || null,
    sessionHistory: sessions || [],
  };
}

// ─── Update self-rating for a step (1-5) ───

export async function updateStepRating(
  studentId: string,
  stepId: string,
  rating: number
) {
  if (rating < 1 || rating > 5) {
    return { ok: false, error: 'Rating must be 1-5' };
  }

  const admin = createAdminClient();

  // Upsert rating
  const { error } = await admin
    .from('student_step_ratings')
    .upsert({
      student_id: studentId,
      step_id: stepId,
      current_rating: rating,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'student_id,step_id' });

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

// ─── Get drill/mission for Train tab pre-fill ───

export async function getDrillMissionForTraining(drillId: string) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('drills_missions')
    .select('*')
    .eq('id', drillId)
    .single();

  if (error || !data) return null;

  // Also pull any videos attached to this drill/mission (multi-video).
  const { data: videos } = await admin
    .from('content_videos')
    .select('id, url, label, display_order')
    .eq('drill_mission_id', drillId)
    .order('display_order');

  return { ...data, videos: videos || [] } as DrillMissionRow;
}

// ─── Save training session linked to a drill/mission ───

export type CriterionResult = 'met' | 'partial' | 'not_met';
export type CriterionEvaluation = {
  criterion_index: number;
  criterion_text: string;
  result: CriterionResult;
};

export async function saveLinkedTrainingSession(
  studentId: string,
  drillMissionId: string,
  data: {
    intention_text?: string;
    planned_duration_minutes?: number;
    planned_reps?: number;
    duration_minutes?: number;
    reps_completed?: number;
    venue_type?: string;
    wave_conditions?: string;
    wind?: string;
    tide?: string;
    crowd_level?: string;
    safety_check?: boolean;
    venue_notes?: string;
    notes?: string;
    focus_rating?: number;        // 0-3
    mission_completion?: 'yes' | 'partial' | 'no';
    execution_rating?: number;    // 1-5
    flow_channel?: number;        // 1-5 (1 Bored · 3 Flow · 5 Frustrating)
    criteria_evaluation?: CriterionEvaluation[];
  }
) {
  const admin = createAdminClient();

  // Get drill_mission to extract step_id
  const { data: drillMission } = await admin
    .from('drills_missions')
    .select('step_id')
    .eq('id', drillMissionId)
    .single();

  if (!drillMission) {
    return { ok: false, error: 'Drill/mission not found' };
  }

  // Insert training session
  const { data: session, error } = await admin
    .from('self_training_sessions')
    .insert({
      student_id: studentId,
      linked_drill_mission_id: drillMissionId,
      linked_step_id: drillMission.step_id,
      intention_text: data.intention_text,
      planned_duration_minutes: data.planned_duration_minutes,
      planned_reps: data.planned_reps,
      duration_minutes: data.duration_minutes ?? data.planned_duration_minutes,
      reps_completed: data.reps_completed,
      venue_type: data.venue_type,
      wave_conditions: data.wave_conditions,
      wind: data.wind,
      tide: data.tide,
      crowd_level: data.crowd_level,
      safety_check: data.safety_check,
      venue_notes: data.venue_notes,
      notes: data.notes,
      focus_rating: data.focus_rating,
      mission_completion: data.mission_completion,
      execution_rating: data.execution_rating,
      flow_channel: data.flow_channel ?? null,
      criteria_evaluation: data.criteria_evaluation ?? null,
      completed: true,
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };

  // If execution_rating provided, update student_step_ratings
  if (data.execution_rating) {
    await admin
      .from('student_step_ratings')
      .upsert({
        student_id: studentId,
        step_id: drillMission.step_id,
        current_rating: data.execution_rating,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'student_id,step_id' });
  }

  return { ok: true, session, stepId: drillMission.step_id };
}

// Práctica de la semana (para la racha del cierre del Let's Play).
export async function getWeeklyPracticeCount(studentId: string): Promise<number> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - 6 * 86400000);
  since.setHours(0, 0, 0, 0);
  const { count } = await admin
    .from('self_training_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .gte('created_at', since.toISOString());
  return count ?? 0;
}
