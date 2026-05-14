'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// Coach Portal — public route accessed via /coach-portal/[token].
// Mirrors the student portal pattern. No auth required at the route level;
// the portal_token is the access credential. Coach gets the link from
// their academy coordinator.

export interface CoachPortalData {
  coach: {
    id: string;
    first_name: string;
    last_name: string | null;
    display_name: string;
    email: string | null;
    role: string;
    certification_level: string | null;
    max_belt_permission: string;
    languages: string | null;
    specialty_area: string | null;
    portal_token: string;
  };
  stats: {
    totalServicesAsHead: number;
    upcomingServicesCount: number;
    studentsWorkedWith: number;
    avgRating: number | null;
    ratingsCount: number;
  };
  upcomingServices: any[];
  pastServices: any[];
  coachCourses: any[];  // lessons WHERE course_section LIKE 'coach_%'
  availableDrills: any[];  // drills_missions filtered by max_belt_permission
  academyBranding: {
    name: string | null;
    logo_url: string | null;
    primary_color: string | null;
    accent_color: string | null;
    tagline: string | null;
  } | null;
}

export async function getCoachPortalData(token: string): Promise<CoachPortalData | null> {
  const admin = createAdminClient();

  // 1. Resolve coach by token
  const { data: coach } = await admin
    .from('coaches')
    .select(
      'id, first_name, last_name, display_name, email, role, certification_level, max_belt_permission, languages, specialty_area, portal_token, academy_id'
    )
    .eq('portal_token', token)
    .single();

  if (!coach) return null;

  const today = new Date().toISOString().slice(0, 10);

  // 2. Pull everything in parallel
  const [
    upcomingResult,
    pastResult,
    { count: totalServicesAsHead },
    surveysResult,
    coachCoursesResult,
    drillsResult,
  ] = await Promise.all([
    admin
      .from('camp_instances')
      .select('id, camp_name, start_date, end_date, status, scheduled_time, camp_templates:template_id(service_kind, template_name, capacity_max)')
      .or(`coach_id.eq.${coach.id},head_coach_id.eq.${coach.id}`)
      .in('status', ['planned', 'active'])
      .gte('end_date', today)
      .order('start_date'),
    admin
      .from('camp_instances')
      .select('id, camp_name, start_date, end_date, status')
      .or(`coach_id.eq.${coach.id},head_coach_id.eq.${coach.id}`)
      .lt('end_date', today)
      .order('end_date', { ascending: false })
      .limit(10),
    admin
      .from('camp_instances')
      .select('id', { count: 'exact', head: true })
      .eq('head_coach_id', coach.id),
    admin
      .from('survey_responses')
      .select('coach_rating, student_session_results!inner(coach_id)')
      .eq('student_session_results.coach_id', coach.id),
    admin
      .from('lessons')
      .select('id, title, course_section, step_number, display_order, lesson_type')
      .like('course_section', 'coach_%')
      .eq('active', true)
      .order('display_order'),
    admin
      .from('drills_missions')
      .select('id, step_id, title, type, time_estimate, key_words, block_name, belt')
      .eq('active', true)
      .order('belt')
      .order('display_order'),
  ]);

  // 3. Derive stats
  const studentsWorkedWith = new Set<string>();
  // (cheap-ish — pull distinct students from student_session_results for this coach)
  const { data: distinctStudents } = await admin
    .from('student_session_results')
    .select('student_id')
    .eq('coach_id', coach.id);
  for (const r of distinctStudents ?? []) studentsWorkedWith.add(r.student_id);

  const surveys = (surveysResult.data ?? []) as any[];
  const ratings = surveys.map((s) => s.coach_rating).filter((n: number) => n > 0);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  // 4. Filter drills by coach's belt permission (max_belt_permission >= drill.belt)
  // Order is white < yellow < blue < purple < brown < black. drills_missions.belt
  // uses short values ('white','yellow'); max_belt_permission is enum
  // ('white_belt','yellow_belt'...). Normalize.
  const beltRank: Record<string, number> = {
    white: 1, yellow: 2, blue: 3, purple: 4, brown: 5, black: 6,
  };
  const myBeltShort = (coach.max_belt_permission || '').replace('_belt', '');
  const myRank = beltRank[myBeltShort] ?? 6;
  const availableDrills = (drillsResult.data ?? []).filter((d: any) => {
    const r = beltRank[d.belt] ?? 1;
    return r <= myRank;
  });

  // M9 — coach portal also themed by academy.
  let academyBranding: CoachPortalData['academyBranding'] = null;
  if (coach.academy_id) {
    const { data: aca } = await admin
      .from('academies')
      .select('name, logo_url, primary_color, accent_color, tagline')
      .eq('id', coach.academy_id)
      .single();
    academyBranding = aca ?? null;
  }

  return {
    coach,
    stats: {
      totalServicesAsHead: totalServicesAsHead ?? 0,
      upcomingServicesCount: (upcomingResult.data ?? []).length,
      studentsWorkedWith: studentsWorkedWith.size,
      avgRating,
      ratingsCount: ratings.length,
    },
    upcomingServices: upcomingResult.data ?? [],
    pastServices: pastResult.data ?? [],
    coachCourses: coachCoursesResult.data ?? [],
    availableDrills,
    academyBranding,
  };
}
