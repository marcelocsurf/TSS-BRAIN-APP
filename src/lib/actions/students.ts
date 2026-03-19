'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { BeltLevel } from '@/lib/constants/belts';

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

export interface CreateStudentInput {
  // Required
  first_name: string;
  last_name: string;
  belt_level: BeltLevel;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  date_of_birth?: string;
  swim_level?: string;
  ocean_level?: string;
  surf_experience?: string;
  waiver_signed?: boolean;

  // Contact
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  nationality?: string;

  // Safety
  allergies?: string;
  injuries?: string;
  medical_notes?: string;

  // Planning
  primary_goal?: string;
  photo_url?: string;

  // Surf profile
  stance?: string;
  surf_experience_years?: string;
  surf_frequency?: string;
  board_type?: string;
  other_sports?: string;
  learning_style?: string;

  // Goals
  goal_short_term?: string;
  goal_mid_term?: string;
  goal_long_term?: string;
  biggest_barrier?: string;
  fears_phobias?: string;

  // Personal / logistics
  languages?: string;
  instagram?: string;
  height?: string;
  weight?: string;
  shirt_size?: string;
  how_did_you_hear?: string;
  returning_student?: boolean;

  // Waiver metadata (set automatically by the action)
  waiver_signed_at?: string;
  waiver_signed_by?: string;
}

export interface StudentRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  age: number | null;
  gender: string | null;
  nationality: string | null;
  status: string;
  photo_url: string | null;
  portal_token: string;

  // Progression
  belt_level: BeltLevel;
  current_sequence_number: number;
  current_step_order: number;
  ocean_level: string | null;
  progression_status: string | null;

  // Safety
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  allergies: string | null;
  injuries: string | null;
  medical_notes: string | null;
  swim_level: string | null;
  risk_notes: string | null;

  // Planning
  primary_goal: string | null;
  current_focus_area: string | null;
  coach_notes_general: string | null;

  // Continuity snapshots
  last_session_id: string | null;
  last_session_date: string | null;
  last_session_mission: string | null;
  last_session_pilar: string | null;
  last_session_drill: string | null;
  last_session_status: string | null;
  last_homework: string | null;
  next_recommended_focus: string | null;

  // Surf profile
  stance: string | null;
  surf_experience_years: string | null;
  surf_frequency: string | null;
  board_type: string | null;
  other_sports: string | null;
  learning_style: string | null;

  // Goals
  goal_short_term: string | null;
  goal_mid_term: string | null;
  goal_long_term: string | null;
  biggest_barrier: string | null;
  fears_phobias: string | null;

  // Personal / logistics
  date_of_birth: string | null;
  languages: string | null;
  instagram: string | null;
  height: string | null;
  weight: string | null;
  shirt_size: string | null;
  how_did_you_hear: string | null;
  returning_student: boolean;
  waiver_signed: boolean;

  // Intake tracking
  intake_completed_at: string | null;

  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════
// CREATE STUDENT
// ═══════════════════════════════════════

export async function createStudent(input: CreateStudentInput) {
  const supabase = await createClient();

  // ── Mandatory field validation ──
  if (!input.first_name?.trim()) throw new Error('First name is required');
  if (!input.last_name?.trim()) throw new Error('Last name is required');
  if (!input.emergency_contact_name?.trim()) throw new Error('Emergency contact name is required');
  if (!input.emergency_contact_phone?.trim()) throw new Error('Emergency contact phone is required');
  if (!input.date_of_birth) throw new Error('Date of birth is required');
  if (!input.swim_level) throw new Error('Swim level is required');
  if (!input.belt_level) throw new Error('Belt level is required');
  if (!input.ocean_level) throw new Error('Ocean level is required');
  if (!input.surf_experience) throw new Error('Surf experience is required');

  // ── Waiver validation ──
  if (!input.waiver_signed) {
    throw new Error('Liability waiver must be signed before registering a student');
  }

  // ── Get coach display name for waiver_signed_by ──
  const { data: { user } } = await supabase.auth.getUser();
  let coachDisplayName = 'Unknown Coach';
  if (user) {
    const { data: coach } = await supabase
      .from('coaches')
      .select('display_name')
      .eq('auth_user_id', user.id)
      .single();
    if (coach?.display_name) coachDisplayName = coach.display_name;
  }

  // Use explicit ocean_level from form instead of belt-based default
  const oceanLevel = input.ocean_level || 'beginner';

  const { data, error } = await supabase
    .from('students')
    .insert({
      // Required
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      belt_level: input.belt_level,
      emergency_contact_name: input.emergency_contact_name.trim(),
      emergency_contact_phone: input.emergency_contact_phone.trim(),
      date_of_birth: input.date_of_birth,

      // Contact
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      age: input.age || null,
      gender: input.gender || null,
      nationality: input.nationality?.trim() || null,

      // Safety
      swim_level: input.swim_level,
      allergies: input.allergies?.trim() || null,
      injuries: input.injuries?.trim() || null,
      medical_notes: input.medical_notes?.trim() || null,

      // Planning
      primary_goal: input.primary_goal?.trim() || null,
      photo_url: input.photo_url || null,

      // Progression
      ocean_level: oceanLevel,
      surf_experience_years: input.surf_experience || null,
      current_sequence_number: 1,
      current_step_order: 1,
      status: 'active',

      // Surf profile
      stance: input.stance?.trim() || null,
      surf_frequency: input.surf_frequency?.trim() || null,
      board_type: input.board_type?.trim() || null,
      other_sports: input.other_sports?.trim() || null,
      learning_style: input.learning_style?.trim() || null,

      // Goals
      goal_short_term: input.goal_short_term?.trim() || null,
      goal_mid_term: input.goal_mid_term?.trim() || null,
      goal_long_term: input.goal_long_term?.trim() || null,
      biggest_barrier: input.biggest_barrier?.trim() || null,
      fears_phobias: input.fears_phobias?.trim() || null,

      // Personal / logistics
      languages: input.languages?.trim() || null,
      instagram: input.instagram?.trim() || null,
      height: input.height?.trim() || null,
      weight: input.weight?.trim() || null,
      shirt_size: input.shirt_size?.trim() || null,
      how_did_you_hear: input.how_did_you_hear?.trim() || null,
      returning_student: input.returning_student || false,

      // Waiver
      waiver_signed: true,
      waiver_signed_at: new Date().toISOString(),
      waiver_signed_by: coachDisplayName,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/students');
  return data;
}

// ═══════════════════════════════════════
// LIST STUDENTS
// ═══════════════════════════════════════

export async function listStudents(filters?: {
  belt_level?: BeltLevel;
  status?: string;
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('students')
    .select('*')
    .order('last_name', { ascending: true });

  if (filters?.belt_level) {
    query = query.eq('belt_level', filters.belt_level);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as StudentRow[];
}

// ═══════════════════════════════════════
// GET STUDENT
// ═══════════════════════════════════════

export async function getStudent(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as StudentRow;
}

// ═══════════════════════════════════════
// UPDATE STUDENT
// ═══════════════════════════════════════

export type UpdateStudentInput = Partial<Omit<CreateStudentInput, 'first_name' | 'last_name'>> & {
  first_name?: string;
  last_name?: string;
  coach_notes_general?: string;
  current_focus_area?: string;
  risk_notes?: string;
};

export async function updateStudent(id: string, updates: UpdateStudentInput) {
  const supabase = await createClient();

  // Trim all string fields
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === 'string') {
      cleaned[key] = value.trim() || null;
    } else if (value !== undefined) {
      cleaned[key] = value;
    }
  }

  const { error } = await supabase
    .from('students')
    .update(cleaned)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath(`/students/${id}`);
  revalidatePath('/students');
}

// ═══════════════════════════════════════
// ARCHIVE STUDENT (soft — never delete data)
// ═══════════════════════════════════════

export async function archiveStudent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update({ status: 'archived' })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath(`/students/${id}`);
  revalidatePath('/students');
}

export async function reactivateStudent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update({ status: 'active' })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath(`/students/${id}`);
  revalidatePath('/students');
}
