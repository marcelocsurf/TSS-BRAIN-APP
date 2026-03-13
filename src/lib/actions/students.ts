'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { BeltLevel } from '@/lib/constants/belts';

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

export interface CreateStudentInput {
  first_name: string;
  last_name: string;
  belt_level: BeltLevel;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  swim_level?: string;
  allergies?: string;
  injuries?: string;
  medical_notes?: string;
  primary_goal?: string;
  photo_url?: string;
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
  belt_level: BeltLevel;
  current_sequence_number: number;
  current_step_order: number;
  ocean_level: string | null;
  progression_status: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  allergies: string | null;
  injuries: string | null;
  medical_notes: string | null;
  swim_level: string | null;
  risk_notes: string | null;
  primary_goal: string | null;
  current_focus_area: string | null;
  coach_notes_general: string | null;
  last_session_id: string | null;
  last_session_date: string | null;
  last_session_mission: string | null;
  last_session_pilar: string | null;
  last_session_drill: string | null;
  last_session_status: string | null;
  last_homework: string | null;
  next_recommended_focus: string | null;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════
// CREATE STUDENT
// ═══════════════════════════════════════

export async function createStudent(input: CreateStudentInput) {
  const supabase = await createClient();

  // Default ocean_level based on belt
  const oceanLevel = input.belt_level === 'white_belt' ? 'Assisted' :
    input.belt_level === 'yellow_belt' ? 'Supervised' :
    input.belt_level === 'blue_belt' ? 'Autonomous' : 'Functional Leader';

  const { data, error } = await supabase
    .from('students')
    .insert({
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      belt_level: input.belt_level,
      emergency_contact_name: input.emergency_contact_name.trim(),
      emergency_contact_phone: input.emergency_contact_phone.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      age: input.age || null,
      gender: input.gender || null,
      nationality: input.nationality?.trim() || null,
      swim_level: input.swim_level || null,
      allergies: input.allergies?.trim() || null,
      injuries: input.injuries?.trim() || null,
      medical_notes: input.medical_notes?.trim() || null,
      primary_goal: input.primary_goal?.trim() || null,
      photo_url: input.photo_url || null,
      ocean_level: oceanLevel,
      current_sequence_number: 1,
      current_step_order: 1,
      status: 'active',
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

export async function updateStudent(id: string, updates: Partial<CreateStudentInput> & {
  coach_notes_general?: string;
  current_focus_area?: string;
  risk_notes?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath(`/students/${id}`);
  revalidatePath('/students');
}
