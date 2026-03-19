'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { isBeltInRange } from '@/lib/constants/cascade';
import type {
  BeltLevel,
  CascadeFormState,
  DropdownOption,
  DrillOption,
  OceanRiskState,
  PilarPart,
  RatingScale,
  StudentCascadeContext,
} from '@/types/session';

// ═══════════════════════════════════════
// GET STUDENTS FOR COACH (Step 1 dropdown)
// ═══════════════════════════════════════

export async function getStudentsForCoach(): Promise<
  { id: string; first_name: string; last_name: string; belt_level: string }[]
> {
  const supabase = await createClient();

  // Students table uses RLS — coach sees all students they have access to
  const { data, error } = await supabase
    .from('students')
    .select('id, first_name, last_name, belt_level')
    .order('first_name');

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ═══════════════════════════════════════
// GET STUDENT WITH CASCADE CONTEXT (Step 1 auto-load)
// ═══════════════════════════════════════

export async function getStudentWithCascadeContext(
  studentId: string
): Promise<StudentCascadeContext> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('students')
    .select(`
      id, first_name, last_name, belt_level, ocean_level,
      current_sequence_number, current_step_order,
      student_path, age_group,
      allergies, injuries, medical_notes, risk_notes,
      board_clearance_hardtop,
      last_session_date, last_session_mission, last_session_pilar,
      last_session_status, last_homework, next_recommended_focus
    `)
    .eq('id', studentId)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Student not found');

  return data as StudentCascadeContext;
}

// ═══════════════════════════════════════
// GET DROPDOWN OPTIONS (generic)
// ═══════════════════════════════════════

export async function getDropdownOptions(
  category: string
): Promise<DropdownOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('dropdown_options')
    .select('*')
    .eq('category', category)
    .eq('active', true)
    .order('display_order');

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ═══════════════════════════════════════
// GET MULTIPLE DROPDOWN CATEGORIES (batch load)
// ═══════════════════════════════════════

export async function getDropdownOptionsBatch(
  categories: string[]
): Promise<Record<string, DropdownOption[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('dropdown_options')
    .select('*')
    .in('category', categories)
    .eq('active', true)
    .order('display_order');

  if (error) throw new Error(error.message);

  const grouped: Record<string, DropdownOption[]> = {};
  for (const cat of categories) grouped[cat] = [];
  for (const row of data ?? []) {
    if (!grouped[row.category]) grouped[row.category] = [];
    grouped[row.category].push(row);
  }
  return grouped;
}

// ═══════════════════════════════════════
// GET PILAR PARTS (Step 6 — filtered by belt)
// ═══════════════════════════════════════

export async function getPilarParts(
  beltLevel: BeltLevel
): Promise<PilarPart[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pilar_parts')
    .select('*')
    .neq('pilar_id', 'safety') // Safety is auto-applied, NOT selectable
    .eq('active', true)
    .order('pilar_id')
    .order('display_order');

  if (error) throw new Error(error.message);

  // Filter by belt range in application code (more flexible than SQL)
  return (data ?? []).filter((part) =>
    isBeltInRange(beltLevel, part.min_belt as BeltLevel, part.max_belt as BeltLevel)
  );
}

// ═══════════════════════════════════════
// GET DRILLS FOR CASCADE (Step 8 — filtered)
// ═══════════════════════════════════════

export async function getDrillsForCascade(filters: {
  pilarPartName?: string;
  beltLevel: BeltLevel;
  isWaterVenue: boolean;
}): Promise<DrillOption[]> {
  const supabase = await createClient();

  // Use the existing RPC that filters drills by belt range
  const { data: allDrills, error } = await supabase
    .rpc('get_drills_for_belt', { p_belt_key: filters.beltLevel });

  if (error) throw new Error(error.message);

  let filtered = allDrills || [];

  // Filter by pilar_part name if provided (matches the drill's pilar_part column)
  if (filters.pilarPartName) {
    filtered = filtered.filter((d: any) => d.pilar_part === filters.pilarPartName);
  }

  // Filter by environment for non-water venues (exclude water-only drills)
  if (filters.isWaterVenue === false) {
    filtered = filtered.filter((d: any) =>
      d.environment === 'Beach' || d.environment === 'Land' || d.environment === 'Gym' || !d.environment
    );
  }

  // Map RPC result columns to DrillOption type
  // RPC returns: id, drill_name, pilar_part, drill_type, key_cue, goal, environment, related_pilar, etc.
  // DrillOption expects: id, name, description, goal, key_cue, pilar, belt_level_range
  return filtered.map((d: any) => ({
    id: d.id,
    name: d.drill_name,
    description: d.drill_type || null,
    goal: d.goal || null,
    key_cue: d.key_cue || null,
    pilar: d.related_pilar || d.pilar_part || '',
    belt_level_range: d.belt_level_range || null,
  }));
}

// ═══════════════════════════════════════
// CHECK OCEAN RULES (Step 3 — safety check)
// ═══════════════════════════════════════

export async function checkOceanRules(
  beltLevel: string,
  oceanLevel: string | null,
  conditions: string
): Promise<OceanRiskState> {
  // Ocean Rules Matrix — Canon Oficial v5.0 Section 10
  // Hardcoded for reliability (DB table had column/value mismatches)
  const matrix: Record<string, Record<string, OceanRiskState>> = {
    white_belt:  { flat: 'allowed', '1_2ft': 'allowed', '3_4ft': 'blocked', '4_6ft': 'blocked', '6_plus': 'blocked' },
    yellow_belt: { flat: 'allowed', '1_2ft': 'allowed', '3_4ft': 'caution', '4_6ft': 'blocked', '6_plus': 'blocked' },
    blue_belt:   { flat: 'allowed', '1_2ft': 'allowed', '3_4ft': 'allowed', '4_6ft': 'allowed', '6_plus': 'caution' },
    purple_belt: { flat: 'allowed', '1_2ft': 'allowed', '3_4ft': 'allowed', '4_6ft': 'allowed', '6_plus': 'caution' },
    brown_belt:  { flat: 'allowed', '1_2ft': 'allowed', '3_4ft': 'allowed', '4_6ft': 'allowed', '6_plus': 'allowed' },
    black_belt:  { flat: 'allowed', '1_2ft': 'allowed', '3_4ft': 'allowed', '4_6ft': 'allowed', '6_plus': 'allowed' },
  };

  const beltRules = matrix[beltLevel];
  if (!beltRules) return 'blocked'; // Unknown belt → safety first

  const riskState = beltRules[conditions] ?? 'blocked';

  // Special case: Yellow at 3-4ft is "caution" — allowed only if
  // ocean_level (coach assessment) confirms the student can handle it.
  // If no coach assessment on record, default to blocked.
  if (riskState === 'caution' && beltLevel === 'yellow_belt' && (!oceanLevel || oceanLevel === 'beginner')) {
    return 'blocked';
  }

  return riskState;
}

// ═══════════════════════════════════════
// GET RATING SCALES FOR BELT (Step 16)
// ═══════════════════════════════════════

export async function getRatingScalesForBelt(
  beltLevel: BeltLevel
): Promise<RatingScale[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('rating_scales')
    .select('*')
    .order('display_order');

  if (error) throw new Error(error.message);

  return (data ?? []).filter((scale) =>
    isBeltInRange(beltLevel, scale.min_belt as BeltLevel, scale.max_belt as BeltLevel)
  );
}

// ═══════════════════════════════════════
// CREATE CASCADE SESSION (Atomic save — Step 22)
// ═══════════════════════════════════════

export async function createCascadeSession(
  formState: CascadeFormState
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  const supabase = await createClient();

  // Get coach ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: coach } = await supabase
    .from('coaches')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!coach) return { success: false, error: 'Coach not found' };

  if (!formState.student_id || !formState.student) {
    return { success: false, error: 'No student selected' };
  }

  // Call the atomic RPC function
  const { data, error } = await supabase.rpc('save_cascade_session', {
    p_coach_id: coach.id,
    p_student_id: formState.student_id,
    p_belt_level_snapshot: formState.student.belt_level,
    p_ocean_level_snapshot: formState.student.ocean_level,
    p_training_venue: formState.training_venue!,
    p_ocean_conditions: formState.ocean_conditions,
    p_ocean_risk_state: formState.oceanRiskState,
    p_session_type: formState.session_type,
    p_session_date: formState.session_date,
    p_pilar_part_id: formState.pilar_part_id,
    p_pilar_id_snapshot: formState.pilar_id_snapshot,
    p_mission: formState.mission,
    p_drill_id: formState.drill_id,
    p_warm_up: formState.warm_up,
    p_simulation: formState.simulation,
    p_mental_hack: formState.mental_hack,
    p_mission_time: formState.mission_time,
    p_repetitions: formState.repetitions,
    p_status: formState.status,
    p_focus_rating: formState.focus_rating,
    p_frustration_rating: formState.frustration_rating,
    p_composure_rating: formState.composure_rating,
    p_control_rating: formState.control_rating,
    p_autonomy_rating: formState.autonomy_rating,
    p_linking_rating: formState.linking_rating,
    p_commitment_rating: formState.commitment_rating,
    p_variety_rating: formState.variety_rating,
    p_precision_rating: formState.precision_rating,
    p_knowledge_rating: formState.knowledge_rating,
    p_integration_rating: formState.integration_rating,
    p_coach_feedback_quick: formState.coach_feedback_quick,
    p_coach_feedback_text: formState.coach_feedback_text,
    p_achieved: formState.achieved,
    p_whats_next_pilar_part_id: formState.whats_next_pilar_part_id,
    p_homework_cues: formState.homework_cues,
    p_homework_text: formState.homework_text,
    p_total_duration: formState.total_duration,
    p_incident_report: formState.incident_report,
    p_incident_type: formState.incident_type,
    p_incident_description: formState.incident_description,
    p_incident_action_taken: formState.incident_action_taken,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Revalidate affected pages
  revalidatePath('/sessions');
  revalidatePath(`/students/${formState.student_id}`);

  return { success: true, sessionId: data as string };
}

// ═══════════════════════════════════════
// SAVE CASCADE DRAFT (interrupted session)
// ═══════════════════════════════════════

export async function saveCascadeDraft(
  formState: Partial<CascadeFormState>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: coach } = await supabase
    .from('coaches')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!coach || !formState.student_id) {
    return { success: false, error: 'Missing required data' };
  }

  const { error } = await supabase
    .from('cascade_sessions')
    .insert({
      coach_id: coach.id,
      student_id: formState.student_id,
      belt_level_snapshot: (formState as CascadeFormState).student?.belt_level ?? 'white_belt',
      training_venue: formState.training_venue ?? 'beachbreak',
      session_type: formState.session_type ?? 'training',
      session_date: formState.session_date ?? new Date().toISOString().split('T')[0],
      mission: formState.mission,
      pilar_part_id: formState.pilar_part_id,
      drill_id: formState.drill_id,
      completion_state: 'draft',
    });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
