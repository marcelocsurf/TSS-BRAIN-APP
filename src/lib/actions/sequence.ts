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
  drill_mission: DrillMissionRow | null;
  rating: number | null;
  rating_count: number;
  last_rated: string | null;
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

  // 1. Get all drills/missions for this belt
  const { data: drills } = await admin
    .from('drills_missions')
    .select('*')
    .eq('belt', beltKey)
    .eq('active', true)
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

  // Build lookup maps
  const drillMap = new Map<string, DrillMissionRow>();
  (drills || []).forEach((d: any) => drillMap.set(d.step_id, d));

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

  // Build sequence items (one per STP that has drill_mission)
  const items: SequenceItem[] = (drills || []).map((d: any) => {
    const lesson = lessonMap.get(d.step_id);
    const rating = ratingMap.get(d.step_id);
    return {
      step_id: d.step_id,
      step_title: lesson?.title || d.step_id,
      pillar: lesson?.pillar || null,
      block_number: d.block_number,
      block_name: d.block_name,
      display_order: d.display_order,
      drill_mission: d as DrillMissionRow,
      rating: rating?.current_rating || null,
      rating_count: rating?.rating_count || 0,
      last_rated: rating?.last_updated || null,
      last_practiced: lastPracticedMap.get(d.step_id) || null,
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

  // Get drill/mission
  const { data: drillMission } = await admin
    .from('drills_missions')
    .select('*')
    .eq('step_id', stepId)
    .single();

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
    .select('id, created_at, duration_minutes, focus_rating, mission_completion, execution_rating, notes')
    .eq('student_id', studentId)
    .eq('linked_step_id', stepId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    lesson: lesson || null,
    drillMission: drillMission || null,
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

  if (error) return null;
  return data as DrillMissionRow;
}

// ─── Save training session linked to a drill/mission ───

export async function saveLinkedTrainingSession(
  studentId: string,
  drillMissionId: string,
  data: {
    intention?: string;
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
      duration_minutes: data.duration_minutes,
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

  return { ok: true, session };
}
