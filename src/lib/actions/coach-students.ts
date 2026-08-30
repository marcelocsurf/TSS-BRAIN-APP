'use server';

// Coach-scoped student access — surfaces "my students" inside the coach
// portal. Auth is by portal_token (same as the rest of the coach portal),
// the actual student set is the intersection of:
//   - students belonging to the coach's academy
//   - students the coach has been assigned to via active service windows
//     (camp_participants joined to camp_instances with this coach as
//     coach_id or head_coach_id, enrollment_status='active' or 'completed')
//
// This mirrors getCoachAccessibleStudentIds() from auth.ts but doesn't
// require a Supabase auth session — the coach portal is token-based.

import { createAdminClient } from '@/lib/supabase/admin';

export type CoachStudentSummary = {
  id: string;
  first_name: string;
  last_name: string | null;
  photo_url: string | null;
  belt_level: string;
  swim_level: string | null;
  waiver_signed: boolean;
  intake_completed_at: string | null;
  last_session_date: string | null;
  last_session_mission: string | null;
  last_session_status: string | null;
  has_safety_flag: boolean; // injuries / allergies / medical_notes present
};

async function resolveCoachByToken(token: string): Promise<{
  id: string;
  academy_id: string | null;
} | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('coaches')
    .select('id, academy_id, course_access_granted')
    .eq('portal_token', token)
    .single();
  if (!data || !data.course_access_granted) return null;
  return { id: data.id, academy_id: data.academy_id ?? null };
}

async function studentIdsForCoach(coachId: string): Promise<Set<string>> {
  const admin = createAdminClient();
  // Pull every camp_instance this coach is responsible for, then collect
  // their participants. Mirrors auth.getCoachAccessibleStudentIds() but
  // without depending on a Supabase auth session.
  // Incluye también los servicios donde es ASISTENTE ACEPTADO — el mismo
  // criterio exacto de getServicePlan y getAcceptedAssistantCampIds:
  // role='assistant' + status='accepted'. SOLO ese rol: a un fotógrafo/
  // filmer aceptado el planner le niega el plan, así que la ficha (con
  // datos médicos y contacto de emergencia) tampoco le abre.
  const [{ data: instances }, { data: staffRows }] = await Promise.all([
    admin
      .from('camp_instances')
      .select('id')
      .or(`coach_id.eq.${coachId},head_coach_id.eq.${coachId}`),
    admin
      .from('service_staff')
      .select('camp_instance_id')
      .eq('coach_id', coachId)
      .eq('role', 'assistant')
      .eq('status', 'accepted'),
  ]);

  const ids = Array.from(new Set([
    ...(instances ?? []).map((i) => i.id),
    ...(staffRows ?? []).map((r: any) => r.camp_instance_id),
  ]));
  if (ids.length === 0) return new Set();
  const { data: participants } = await admin
    .from('camp_participants')
    .select('student_id')
    .in('camp_instance_id', ids)
    .in('enrollment_status', ['active', 'completed']);

  return new Set((participants ?? []).map((p) => p.student_id));
}

export async function listCoachStudents(
  token: string,
): Promise<CoachStudentSummary[]> {
  const coach = await resolveCoachByToken(token);
  if (!coach) return [];

  const accessible = await studentIdsForCoach(coach.id);
  if (accessible.size === 0) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from('students')
    .select(
      `id, first_name, last_name, photo_url, belt_level, swim_level,
       waiver_signed, intake_completed_at,
       last_session_date, last_session_mission, last_session_status,
       allergies, injuries, medical_notes`,
    )
    .in('id', Array.from(accessible))
    .order('last_session_date', { ascending: false, nullsFirst: false });

  return (data ?? []).map((s) => ({
    id: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    photo_url: s.photo_url,
    belt_level: s.belt_level,
    swim_level: s.swim_level,
    waiver_signed: !!s.waiver_signed,
    intake_completed_at: s.intake_completed_at,
    last_session_date: s.last_session_date,
    last_session_mission: s.last_session_mission,
    last_session_status: s.last_session_status,
    has_safety_flag: !!(s.allergies || s.injuries || s.medical_notes),
  }));
}

export type CoachStudentDetail = {
  // Identity
  id: string;
  first_name: string;
  last_name: string | null;
  photo_url: string | null;
  age: number | null;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  languages: string | null;
  instagram: string | null;
  // Belt / progression
  belt_level: string;
  ocean_level: string | null;
  current_sequence_number: number | null;
  current_step_order: number | null;
  // Safety
  swim_level: string | null;
  waiver_signed: boolean;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  allergies: string | null;
  injuries: string | null;
  medical_notes: string | null;
  risk_notes: string | null;
  height: string | null;
  weight: string | null;
  // Surf profile
  stance: string | null;
  surf_experience_years: string | null;
  surf_frequency: string | null;
  board_type: string | null;
  other_sports: string | null;
  learning_style: string | null;
  // Goals
  primary_goal: string | null;
  goal_short_term: string | null;
  goal_mid_term: string | null;
  goal_long_term: string | null;
  biggest_barrier: string | null;
  fears_phobias: string | null;
  // Recent session snapshot
  last_session_date: string | null;
  last_session_mission: string | null;
  last_session_pilar: string | null;
  last_session_drill: string | null;
  last_session_status: string | null;
  last_homework: string | null;
  next_recommended_focus: string | null;
};

export async function getCoachStudentDetail(
  token: string,
  studentId: string,
): Promise<CoachStudentDetail | null> {
  const coach = await resolveCoachByToken(token);
  if (!coach) return null;

  const accessible = await studentIdsForCoach(coach.id);
  if (!accessible.has(studentId)) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('students')
    .select(
      `id, first_name, last_name, photo_url, age, date_of_birth, gender, nationality, languages, instagram,
       belt_level, ocean_level, current_sequence_number, current_step_order,
       swim_level, waiver_signed, emergency_contact_name, emergency_contact_phone,
       allergies, injuries, medical_notes, risk_notes, height, weight,
       stance, surf_experience_years, surf_frequency, board_type, other_sports, learning_style,
       primary_goal, goal_short_term, goal_mid_term, goal_long_term, biggest_barrier, fears_phobias,
       last_session_date, last_session_mission, last_session_pilar, last_session_drill,
       last_session_status, last_homework, next_recommended_focus`,
    )
    .eq('id', studentId)
    .single();

  if (!data) return null;
  return data as CoachStudentDetail;
}
