'use server';

import { createClient } from '@/lib/supabase/server';

// ═══════════════════════════════════════
// ADMIN DASHBOARD DATA
// ═══════════════════════════════════════

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const [
    { count: totalStudents },
    { count: totalCoaches },
    { count: totalSessions },
    { count: totalCamps },
    { count: activeCamps },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('coaches').select('*', { count: 'exact', head: true }),
    supabase.from('student_session_results').select('*', { count: 'exact', head: true }).eq('completion_state', 'closed'),
    supabase.from('camp_instances').select('*', { count: 'exact', head: true }),
    supabase.from('camp_instances').select('*', { count: 'exact', head: true }).in('status', ['planned', 'active']),
  ]);

  return {
    totalStudents: totalStudents ?? 0,
    totalCoaches: totalCoaches ?? 0,
    totalSessions: totalSessions ?? 0,
    totalCamps: totalCamps ?? 0,
    activeCamps: activeCamps ?? 0,
  };
}

// ═══════════════════════════════════════
// RECENT AUDIT EVENTS
// ═══════════════════════════════════════

export async function getRecentAuditEvents(limit: number = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_log')
    .select('id, event_type, actor_name, note, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRecentAuditEvents error:', error.message);
    return [];
  }
  return data ?? [];
}

// ═══════════════════════════════════════
// COACH DASHBOARD DATA
// ═══════════════════════════════════════

export async function getCoachDashboardData(coachId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: myStudentCount },
    recentSessionsResult,
    { count: draftCount },
    upcomingServicesResult,
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase
      .from('cascade_sessions')
      .select('id, mission, session_date, students:student_id(first_name, last_name)')
      .eq('coach_id', coachId)
      .eq('completion_state', 'closed')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('cascade_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', coachId)
      .eq('completion_state', 'draft'),
    // M3: Upcoming + active services assigned to me as head_coach OR coach
    supabase
      .from('camp_instances')
      .select(
        'id, camp_name, start_date, end_date, status, scheduled_time, camp_templates:template_id(service_kind, template_name, capacity_max)'
      )
      .or(`coach_id.eq.${coachId},head_coach_id.eq.${coachId}`)
      .in('status', ['planned', 'active'])
      .gte('end_date', today)
      .order('start_date', { ascending: true })
      .limit(10),
  ]);

  // Pull participant counts per upcoming instance (one query)
  const upcomingIds = (upcomingServicesResult.data ?? []).map((s: any) => s.id);
  const participantsByCamp: Record<string, number> = {};
  if (upcomingIds.length > 0) {
    const { data: ps } = await supabase
      .from('camp_participants')
      .select('camp_instance_id')
      .in('camp_instance_id', upcomingIds)
      .eq('enrollment_status', 'active');
    for (const p of ps ?? []) {
      participantsByCamp[p.camp_instance_id] =
        (participantsByCamp[p.camp_instance_id] || 0) + 1;
    }
  }
  const upcomingServices = (upcomingServicesResult.data ?? []).map((s: any) => {
    const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
    return {
      id: s.id,
      camp_name: s.camp_name,
      start_date: s.start_date,
      end_date: s.end_date,
      status: s.status,
      scheduled_time: s.scheduled_time,
      service_kind: tpl?.service_kind ?? null,
      template_name: tpl?.template_name ?? null,
      capacity_max: tpl?.capacity_max ?? null,
      participant_count: participantsByCamp[s.id] || 0,
    };
  });

  return {
    myStudentCount: myStudentCount ?? 0,
    recentSessions: recentSessionsResult.data ?? [],
    draftCount: draftCount ?? 0,
    upcomingServices,
  };
}

// ═══════════════════════════════════════
// COORDINATOR DASHBOARD DATA
// ═══════════════════════════════════════

export async function getCoordinatorDashboardData() {
  const supabase = await createClient();

  // "Stuck students" cutoff: no in-person session in 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    pendingIntakeResult,
    noWaiverResult,
    activeCampsResult,
    { count: totalStudents },
    { count: totalCoaches },
    { count: totalCamps },
    recentSessionsResult,
  ] = await Promise.all([
    supabase
      .from('students')
      .select('id, first_name, last_name, belt_level, created_at')
      .is('intake_completed_at', null)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('students')
      .select('id, first_name, last_name, belt_level')
      .eq('waiver_signed', false)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('camp_instances')
      .select('id, camp_name, status, start_date, end_date, coach_id, coaches:coach_id(display_name)')
      .in('status', ['planned', 'active'])
      .order('start_date')
      .limit(10),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('coaches').select('*', { count: 'exact', head: true }).eq('active_status', true),
    supabase.from('camp_instances').select('*', { count: 'exact', head: true }).in('status', ['planned', 'active']),
    // For "stuck students" — pull list of student_ids with a session in the last 30 days
    supabase
      .from('student_session_results')
      .select('student_id, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .eq('completion_state', 'closed'),
  ]);

  // Compute stuck students: active students whose id is NOT in the recent-sessions set
  const recentlyActiveIds = new Set(
    (recentSessionsResult.data ?? []).map((r: any) => r.student_id)
  );

  // Need a separate query to enumerate all active students that completed intake
  const { data: allActiveStudents } = await supabase
    .from('students')
    .select('id, first_name, last_name, belt_level, last_session_date')
    .eq('status', 'active')
    .not('intake_completed_at', 'is', null)
    .order('last_session_date', { ascending: true, nullsFirst: true })
    .limit(50);

  const stuckStudents = (allActiveStudents ?? []).filter(
    (s: any) => !recentlyActiveIds.has(s.id)
  );

  return {
    stats: {
      totalStudents: totalStudents ?? 0,
      totalCoaches: totalCoaches ?? 0,
      activeCamps: totalCamps ?? 0,
      pendingActions:
        (pendingIntakeResult.data?.length ?? 0) + (noWaiverResult.data?.length ?? 0),
    },
    pendingIntake: pendingIntakeResult.data ?? [],
    noWaiver: noWaiverResult.data ?? [],
    activeCamps: activeCampsResult.data ?? [],
    stuckStudents: stuckStudents.slice(0, 10),
    stuckStudentsCount: stuckStudents.length,
    // Kept for backwards compat with older calls
    totalStudents: totalStudents ?? 0,
  };
}

// ═══════════════════════════════════════
// ASSISTANT DASHBOARD DATA
// ═══════════════════════════════════════

export async function getAssistantDashboardData() {
  const supabase = await createClient();

  const [medicalAlertsResult, emergencyResult] = await Promise.all([
    supabase
      .from('students')
      .select('id, first_name, last_name, allergies, injuries, medical_notes')
      .eq('status', 'active')
      .or('allergies.neq.,injuries.neq.,medical_notes.neq.')
      .order('first_name')
      .limit(20),
    supabase
      .from('students')
      .select('id, first_name, last_name, emergency_contact_name, emergency_contact_phone')
      .eq('status', 'active')
      .not('emergency_contact_phone', 'is', null)
      .order('first_name')
      .limit(20),
  ]);

  return {
    medicalAlerts: medicalAlertsResult.data ?? [],
    emergencyContacts: emergencyResult.data ?? [],
  };
}
