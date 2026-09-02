'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { BeltLevel } from '@/lib/constants/belts';

// ═══════════════════════════════════════
// VISITS / RELATIONSHIP TRACKING
// ═══════════════════════════════════════
// A "visit" = a trip/stay at the academy. Detected by clustering the student's
// coach-led attendance dates (camp days + coach sessions); a gap > VISIT_GAP_DAYS
// starts a new visit. Free-surf self-logs are excluded (those are the student's
// own surfs, not academy visits). prior_visits adds pre-app history.
const VISIT_GAP_DAYS = 30;

export type VisitStats = {
  visits: number;
  detectedVisits: number;
  priorVisits: number;
  totalDays: number;
  firstVisit: string | null;
  lastVisit: string | null;
  daysSinceLast: number | null;
};

export async function getStudentVisitStats(studentId: string): Promise<VisitStats> {
  const admin = createAdminClient();
  const [partsRes, mbsRes, ssrRes, stuRes] = await Promise.all([
    admin.from('camp_participants').select('camp_instance_id, enrollment_status').eq('student_id', studentId),
    admin.from('multi_block_sessions').select('session_date').eq('student_id', studentId),
    admin.from('student_session_results').select('created_at, standalone_sessions(session_date)').eq('student_id', studentId),
    admin.from('students').select('prior_visits').eq('id', studentId).maybeSingle(),
  ]);

  const campIds = (partsRes.data ?? [])
    .filter((p: any) => p.enrollment_status !== 'cancelled')
    .map((p: any) => p.camp_instance_id);
  const campSessRes = campIds.length
    ? await admin.from('camp_sessions').select('session_date').in('camp_instance_id', campIds)
    : { data: [] as any[] };

  const dateSet = new Set<string>();
  const add = (d: any) => { if (d) dateSet.add(String(d).slice(0, 10)); };
  (campSessRes.data ?? []).forEach((r: any) => add(r.session_date));
  (mbsRes.data ?? []).forEach((r: any) => add(r.session_date));
  (ssrRes.data ?? []).forEach((r: any) => add(r.standalone_sessions?.session_date ?? r.created_at));

  const dates = Array.from(dateSet).sort();
  const priorVisits = stuRes.data?.prior_visits ?? 0;

  if (dates.length === 0) {
    return { visits: priorVisits, detectedVisits: 0, priorVisits, totalDays: 0, firstVisit: null, lastVisit: null, daysSinceLast: null };
  }

  const DAY = 86400000;
  let detectedVisits = 1;
  for (let i = 1; i < dates.length; i++) {
    const gap = (Date.parse(dates[i]) - Date.parse(dates[i - 1])) / DAY;
    if (gap > VISIT_GAP_DAYS) detectedVisits++;
  }
  const lastVisit = dates[dates.length - 1];
  const daysSinceLast = Math.floor((Date.now() - Date.parse(lastVisit)) / DAY);

  return {
    visits: detectedVisits + priorVisits,
    detectedVisits,
    priorVisits,
    totalDays: dates.length,
    firstVisit: dates[0],
    lastVisit,
    daysSinceLast,
  };
}

// Coordinator/admin sets the pre-app visit count for a student.
export async function setStudentPriorVisits(studentId: string, priorVisits: number): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const n = Math.max(0, Math.min(99, Math.round(priorVisits || 0)));
  const { error } = await admin.from('students').update({ prior_visits: n }).eq('id', studentId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/students/${studentId}`);
  return { ok: true };
}

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

  // Courses earmarked at creation; activated when intake + waiver complete
  pending_courses?: string[];
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
  lifecycle_status: string | null;
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
  intake_tier: string | null;
  waiver_signed_at: string | null;

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

  // Waiver is NOT required at coach-side creation.
  // The student signs the waiver via their intake link.

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
      email: input.email?.trim().toLowerCase() || null,
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

      // Waiver — defaults to false; student signs via intake link
      waiver_signed: false,

      // Earmarked courses — activated on intake + waiver completion
      pending_courses: input.pending_courses ?? [],
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

export interface StudentFilters {
  sort?: 'newest' | 'name';
  belt_level?: BeltLevel;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  // Advanced filters
  age_range?: string;       // 'junior' | 'teen' | 'young_adult' | 'adult'
  gender?: string;
  language?: string;        // filter on 'languages' column
  nationality?: string;     // partial match on 'nationality' column
  stance?: string;          // 'regular' | 'goofy'
  returning?: string;       // 'true' | 'false'
  waiver?: string;          // 'signed' | 'pending'
  ocean_level?: string;
  lifecycle_status?: string; // 'lead' | 'member' | 'inactive' | 'churned'
  hp?: string;              // 'true' = solo atletas con programa HP activo
}

export async function listStudents(filters?: StudentFilters): Promise<{ students: StudentRow[]; total: number }> {
  const supabase = await createClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // ── Multi-tenant + role scoping (M1 + M3) ──
  // Platform admin: see all academies. Coordinator: scoped to academy.
  // Coach (not platform_admin): only students inside their active service window.
  const { getCurrentCoach, getCoachAccessibleStudentIds } = await import('./auth');
  const me = await getCurrentCoach();

  let query = supabase
    .from('students')
    .select('*', { count: 'exact' });
  // Sort: alphabetical by default; 'newest' = most recently created first.
  query = filters?.sort === 'newest'
    ? query.order('created_at', { ascending: false })
    : query.order('last_name', { ascending: true });

  if (me && !me.is_platform_admin) {
    // Academy scope for non-platform-admins
    if (me.academy_id) {
      // Tolerate legacy rows where academy_id is NULL — show them to coordinators too
      query = query.or(`academy_id.eq.${me.academy_id},academy_id.is.null`);
    }
    // Coach-only: intersect with time-bounded accessible students
    if (me.role === 'coach') {
      const ids = await getCoachAccessibleStudentIds(me.id);
      if (ids.length === 0) {
        return { students: [], total: 0 };
      }
      query = query.in('id', ids);
    }
  }

  if (filters?.belt_level) {
    query = query.eq('belt_level', filters.belt_level);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.lifecycle_status) {
    query = query.eq('lifecycle_status', filters.lifecycle_status);
  }
  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
    );
  }

  // ── Advanced filters ──

  if (filters?.gender) {
    query = query.ilike('gender', filters.gender);
  }
  if (filters?.language) {
    query = query.ilike('languages', `%${filters.language}%`);
  }
  if (filters?.nationality) {
    query = query.ilike('nationality', `%${filters.nationality}%`);
  }
  if (filters?.stance) {
    query = query.ilike('stance', filters.stance);
  }
  if (filters?.returning === 'true') {
    query = query.eq('returning_student', true);
  } else if (filters?.returning === 'false') {
    query = query.eq('returning_student', false);
  }
  if (filters?.waiver === 'signed') {
    query = query.eq('waiver_signed', true);
  } else if (filters?.waiver === 'pending') {
    query = query.or('waiver_signed.is.null,waiver_signed.eq.false');
  }
  if (filters?.ocean_level) {
    query = query.eq('ocean_level', filters.ocean_level);
  }

  // Filtro HP: atletas con programa de entreno ACTIVO. Los ids se leen con el
  // admin client (program_assignments tiene RLS sin políticas) pero el query
  // principal conserva TODO el scoping por rol/academia de arriba.
  if (filters?.hp === 'true') {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const { data: hpAsg } = await createAdminClient()
      .from('program_assignments').select('student_id').eq('status', 'active');
    const hpIds = Array.from(new Set((hpAsg ?? []).map((a: any) => a.student_id)));
    if (hpIds.length === 0) return { students: [], total: 0 };
    query = query.in('id', hpIds);
  }

  // Age range filtering — uses date_of_birth to calculate exact age
  if (filters?.age_range) {
    const today = new Date();
    let minAge: number;
    let maxAge: number;
    switch (filters.age_range) {
      case 'junior':      minAge = 8;  maxAge = 13; break;
      case 'teen':         minAge = 14; maxAge = 17; break;
      case 'young_adult':  minAge = 18; maxAge = 29; break;
      case 'adult':        minAge = 30; maxAge = 120; break;
      default:             minAge = 0;  maxAge = 120;
    }
    // maxDob = born on or before this date means at least minAge years old
    const maxDob = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    // minDob = born on or after this date means at most maxAge years old
    const minDob = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
    query = query
      .gte('date_of_birth', minDob.toISOString().split('T')[0])
      .lte('date_of_birth', maxDob.toISOString().split('T')[0]);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  // Punto dorado HP en la lista: marcar qué filas de ESTA página tienen
  // programa activo (una sola query chica por página de 20).
  let rows = (data ?? []) as StudentRow[];
  if (rows.length > 0) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const { data: hpAsg } = await createAdminClient()
        .from('program_assignments')
        .select('student_id')
        .eq('status', 'active')
        .in('student_id', rows.map((r) => r.id));
      const hpSet = new Set((hpAsg ?? []).map((a: any) => a.student_id));
      rows = rows.map((r) => ({ ...r, has_hp: hpSet.has(r.id) })) as StudentRow[];
    } catch { /* el punto dorado nunca bloquea la lista */ }
  }
  return { students: rows, total: count || 0 };
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

// ─── Coach access check for a specific student (M3) ──
// Returns 'allowed' or 'expired' or 'wrong-academy' or 'not-coach'.
// Used by /students/[id]/page.tsx to gate render.

export async function checkCoachAccessToStudent(
  studentId: string
): Promise<'allowed' | 'expired' | 'wrong-academy'> {
  const { getCurrentCoach, getCoachAccessibleStudentIds } = await import('./auth');
  const me = await getCurrentCoach();

  // Platform admin / coordinator / admin always allowed
  if (!me || me.is_platform_admin) return 'allowed';
  if (me.role === 'admin' || me.role === 'coordinator') {
    // Still check academy match for non-platform-admins
    const supabase = await createClient();
    const { data } = await supabase
      .from('students')
      .select('academy_id')
      .eq('id', studentId)
      .maybeSingle();
    if (data?.academy_id && me.academy_id && data.academy_id !== me.academy_id) {
      return 'wrong-academy';
    }
    return 'allowed';
  }

  // Coach: must be in active service window
  if (me.role === 'coach') {
    const ids = await getCoachAccessibleStudentIds(me.id);
    if (ids.includes(studentId)) return 'allowed';
    return 'expired';
  }

  return 'allowed';
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

// ═══════════════════════════════════════
// LEARNING PROFILE (VAKR) — set or clear
// ═══════════════════════════════════════

type LearningChannelInput = 'V' | 'K' | 'A' | 'R';

export async function setStudentLearningProfile(input: {
  studentId: string;
  primary: LearningChannelInput | null;
  secondary: LearningChannelInput | null;
  scores?: { V: number; K: number; A: number; R: number } | null;
}) {
  const supabase = await createClient();

  if (input.primary && input.secondary && input.primary === input.secondary) {
    throw new Error('Primary and secondary channels must be different.');
  }

  const { error } = await supabase
    .from('students')
    .update({
      learning_profile_primary: input.primary,
      learning_profile_secondary: input.secondary,
      learning_profile_scores: input.scores ?? null,
      learning_profile_completed_at: input.primary ? new Date().toISOString() : null,
    })
    .eq('id', input.studentId);

  if (error) throw new Error(error.message);
  revalidatePath(`/students/${input.studentId}`);
}

// Resolve display names for a specific set of student ids — used by the
// camp quick-panel so participant chips never fall back to raw UUIDs
// (e.g. a lead created by a seller that isn't in the first page of students).
export async function getStudentNames(ids: string[]): Promise<Record<string, string>> {
  if (!ids.length) return {};
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();
  const { data } = await admin.from('students').select('id, first_name, last_name').in('id', ids.slice(0, 100));
  const out: Record<string, string> = {};
  for (const s of data ?? []) out[s.id] = [s.first_name, s.last_name].filter(Boolean).join(' ') || 'Student';
  return out;
}
