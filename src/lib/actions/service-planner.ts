'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// ─── Types ─────────────────────────────────────────────────────────

export interface ServicePlanData {
  camp: {
    id: string;
    camp_name: string;
    start_date: string;
    end_date: string;
    status: string;
    scheduled_time: string | null;
    template_name: string | null;
    service_kind: string | null;
  };
  plan: {
    venue_analysis: string | null;
    venue_go_no_go: 'go' | 'modified' | 'no_go' | null;
    venue_wave_size: string | null;
    venue_wind: string | null;
    venue_tide: string | null;
    venue_hazards: string | null;
    warm_up_drill_id: string | null;
    warm_up_custom: string | null;
    mental_hack: string | null;
    notes_general: string | null;
    completion_state: 'planned' | 'in_progress' | 'closed';
    started_at: string | null;
    closed_at: string | null;
  };
  students: ServicePlanStudent[];
  // Coach's available tools (filtered by max_belt_permission)
  availableDrills: Array<{
    id: string;
    step_id: string | null;
    title: string;
    type: 'drill' | 'mission';
    block_name: string | null;
    belt: string | null;
    key_words: string[] | null;
    time_estimate: string | null;
  }>;
  // Canonical STP catalog (for picking sequence focus)
  stpCatalog: Array<{ id: string; title: string; pillar: string | null; display_order: number }>;
}

export interface StudentProfileSnapshot {
  age: number | null;            // computed from date_of_birth if age column is empty
  weight: number | null;
  height: number | null;
  ocean_level: string | null;
  stance: string | null;
  goofy_or_regular: string | null;
  surf_experience_years: number | null;
  surf_frequency: string | null;
  swim_level: string | null;
  board_type: string | null;
  favorite_wave_size: string | null;
  progression_status: string | null;
  current_sequence_number: number | null;
  current_step_order: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  primary_goal: string | null;
  personal_goal: string | null;
  goal_short_term: string | null;
  goal_mid_term: string | null;
  goal_long_term: string | null;
  fears_phobias: string | null;
  biggest_barrier: string | null;
  injuries: string | null;
  allergies: string | null;
  medical_notes: string | null;
  risk_notes: string | null;
  last_session_date: string | null;
  last_session_mission: string | null;
  last_session_status: string | null;
  last_homework: string | null;
  current_focus_area: string | null;
  next_recommended_focus: string | null;
  coach_notes_general: string | null;
  learning_profile_primary: string | null;
}

// One entry in a student's recent training history — coach session or
// self-training, merged + sorted so the coach sees the full picture.
export interface RecentSessionEntry {
  date: string | null;
  type: 'coach' | 'self';
  label: string;
  status: string | null;
}

export interface ServicePlanStudent {
  student_id: string;
  display_name: string;
  belt_level: string | null;
  profile: StudentProfileSnapshot;
  recentSessions: RecentSessionEntry[];
  // Their block in this service (one block per student per service for v1)
  block: {
    id: string | null;
    step_id: string | null;
    land_drill_id: string | null;
    land_drill_custom: string | null;
    water_drill_id: string | null;
    water_drill_custom: string | null;
    objective_text: string | null;
    notes_pre: string | null;
    status: 'achieved' | 'partial' | 'not_yet' | null;
    notes_post: string | null;
  };
}

// ─── Load: plan + students + tools ─────────────────────────────────

export async function getServicePlan(
  token: string,
  campInstanceId: string
): Promise<ServicePlanData | null> {
  const admin = createAdminClient();

  // Resolve coach + verify they own this camp_instance
  const { data: coach } = await admin
    .from('coaches')
    .select('id, max_belt_permission')
    .eq('portal_token', token)
    .single();
  if (!coach) return null;

  const { data: camp } = await admin
    .from('camp_instances')
    .select(
      'id, camp_name, start_date, end_date, status, scheduled_time, coach_id, head_coach_id, camp_templates:template_id(template_name, service_kind)'
    )
    .eq('id', campInstanceId)
    .single();
  if (!camp) return null;
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) return null;

  const tpl = Array.isArray(camp.camp_templates) ? camp.camp_templates[0] : camp.camp_templates;

  // Service plan (may not exist yet — return blank object if not)
  const { data: plan } = await admin
    .from('service_plans')
    .select('*')
    .eq('camp_instance_id', campInstanceId)
    .maybeSingle();

  // Students enrolled in this camp_instance — pull the full profile
  // snapshot so the coach can review level, goals, fears, injuries,
  // medical info and last-session history before planning.
  // NOTE: students has no display_name column (that's on coaches) — we
  // compose it from first_name + last_name.
  const { data: participants } = await admin
    .from('camp_participants')
    .select(
      'student_id, students:student_id(' +
        'id, first_name, last_name, belt_level, age, date_of_birth, weight, height, ocean_level, ' +
        'stance, goofy_or_regular, surf_experience_years, surf_frequency, swim_level, ' +
        'board_type, favorite_wave_size, progression_status, ' +
        'current_sequence_number, current_step_order, ' +
        'emergency_contact_name, emergency_contact_phone, ' +
        'primary_goal, personal_goal, goal_short_term, goal_mid_term, goal_long_term, ' +
        'fears_phobias, biggest_barrier, injuries, allergies, medical_notes, risk_notes, ' +
        'last_session_date, last_session_mission, last_session_status, last_homework, ' +
        'current_focus_area, next_recommended_focus, coach_notes_general, learning_profile_primary' +
      ')'
    )
    .eq('camp_instance_id', campInstanceId)
    .eq('enrollment_status', 'active');

  const studentIds = (participants ?? []).map((p: any) => p.student_id);

  // Existing blocks
  const { data: blocks } = await admin
    .from('service_plan_blocks')
    .select('*')
    .eq('camp_instance_id', campInstanceId);
  const blocksByStudent = new Map<string, any>();
  for (const b of blocks ?? []) blocksByStudent.set(b.student_id, b);

  // Recent training history per student — coach sessions
  // (student_session_results) + self-training (self_training_sessions),
  // merged and sorted so the coach sees the full picture.
  const recentByStudent: Record<string, RecentSessionEntry[]> = {};
  if (studentIds.length > 0) {
    const [coachSessRes, selfSessRes] = await Promise.all([
      admin
        .from('student_session_results')
        .select('student_id, created_at, status, standalone_sessions(mission)')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false }),
      admin
        .from('self_training_sessions')
        .select('student_id, created_at, session_date, drill_name, intention_text, completed')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false }),
    ]);
    for (const r of coachSessRes.data ?? []) {
      const ss = Array.isArray(r.standalone_sessions)
        ? r.standalone_sessions[0]
        : r.standalone_sessions;
      (recentByStudent[r.student_id] ??= []).push({
        date: r.created_at,
        type: 'coach',
        label: ss?.mission || 'Coach session',
        status: r.status,
      });
    }
    for (const r of selfSessRes.data ?? []) {
      (recentByStudent[r.student_id] ??= []).push({
        date: r.session_date || r.created_at,
        type: 'self',
        label: r.drill_name || r.intention_text || 'Self-training',
        status: r.completed ? 'completed' : 'incomplete',
      });
    }
    for (const sid of Object.keys(recentByStudent)) {
      recentByStudent[sid].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
      recentByStudent[sid] = recentByStudent[sid].slice(0, 10);
    }
  }

  // Compute age from date_of_birth (fallback when the age column is empty)
  const ageFrom = (age: number | null, dob: string | null): number | null => {
    if (age != null) return age;
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a >= 0 && a < 120 ? a : null;
  };

  const students: ServicePlanStudent[] = (participants ?? []).map((p: any) => {
    const s = Array.isArray(p.students) ? p.students[0] : p.students;
    const block = blocksByStudent.get(p.student_id);
    return {
      student_id: p.student_id,
      display_name:
        `${s?.first_name ?? ''} ${s?.last_name ?? ''}`.trim() || 'Student',
      belt_level: s?.belt_level ?? null,
      recentSessions: recentByStudent[p.student_id] ?? [],
      profile: {
        age: ageFrom(s?.age ?? null, s?.date_of_birth ?? null),
        weight: s?.weight ?? null,
        height: s?.height ?? null,
        ocean_level: s?.ocean_level ?? null,
        stance: s?.stance ?? null,
        goofy_or_regular: s?.goofy_or_regular ?? null,
        surf_experience_years: s?.surf_experience_years ?? null,
        surf_frequency: s?.surf_frequency ?? null,
        swim_level: s?.swim_level ?? null,
        board_type: s?.board_type ?? null,
        favorite_wave_size: s?.favorite_wave_size ?? null,
        progression_status: s?.progression_status ?? null,
        current_sequence_number: s?.current_sequence_number ?? null,
        current_step_order: s?.current_step_order ?? null,
        emergency_contact_name: s?.emergency_contact_name ?? null,
        emergency_contact_phone: s?.emergency_contact_phone ?? null,
        primary_goal: s?.primary_goal ?? null,
        personal_goal: s?.personal_goal ?? null,
        goal_short_term: s?.goal_short_term ?? null,
        goal_mid_term: s?.goal_mid_term ?? null,
        goal_long_term: s?.goal_long_term ?? null,
        fears_phobias: s?.fears_phobias ?? null,
        biggest_barrier: s?.biggest_barrier ?? null,
        injuries: s?.injuries ?? null,
        allergies: s?.allergies ?? null,
        medical_notes: s?.medical_notes ?? null,
        risk_notes: s?.risk_notes ?? null,
        last_session_date: s?.last_session_date ?? null,
        last_session_mission: s?.last_session_mission ?? null,
        last_session_status: s?.last_session_status ?? null,
        last_homework: s?.last_homework ?? null,
        current_focus_area: s?.current_focus_area ?? null,
        next_recommended_focus: s?.next_recommended_focus ?? null,
        coach_notes_general: s?.coach_notes_general ?? null,
        learning_profile_primary: s?.learning_profile_primary ?? null,
      },
      block: {
        id: block?.id ?? null,
        step_id: block?.step_id ?? null,
        land_drill_id: block?.land_drill_id ?? null,
        land_drill_custom: block?.land_drill_custom ?? null,
        water_drill_id: block?.water_drill_id ?? null,
        water_drill_custom: block?.water_drill_custom ?? null,
        objective_text: block?.objective_text ?? null,
        notes_pre: block?.notes_pre ?? null,
        status: block?.status ?? null,
        notes_post: block?.notes_post ?? null,
      },
    };
  });

  // Coach's available drills (filtered by belt)
  const beltRank: Record<string, number> = {
    white: 1, yellow: 2, blue: 3, purple: 4, brown: 5, black: 6,
  };
  const myBeltShort = (coach.max_belt_permission || '').replace('_belt', '');
  const myRank = beltRank[myBeltShort] ?? 6;
  const { data: drillsRaw } = await admin
    .from('drills_missions')
    .select('id, step_id, title, type, block_name, belt, key_words, time_estimate, display_order')
    .eq('active', true)
    .order('display_order');
  const availableDrills = (drillsRaw ?? []).filter(
    (d: any) => (beltRank[d.belt] ?? 1) <= myRank
  );

  // STP catalog for sequence focus picker (white belt 25 STPs)
  const { data: stpRows } = await admin
    .from('lessons')
    .select('id, title, pillar, display_order')
    .eq('course_section', 'white_belt')
    .eq('active', true)
    .order('display_order');

  return {
    camp: {
      id: camp.id,
      camp_name: camp.camp_name,
      start_date: camp.start_date,
      end_date: camp.end_date,
      status: camp.status,
      scheduled_time: camp.scheduled_time ?? null,
      template_name: tpl?.template_name ?? null,
      service_kind: tpl?.service_kind ?? null,
    },
    plan: {
      venue_analysis: plan?.venue_analysis ?? null,
      venue_go_no_go: plan?.venue_go_no_go ?? null,
      venue_wave_size: plan?.venue_wave_size ?? null,
      venue_wind: plan?.venue_wind ?? null,
      venue_tide: plan?.venue_tide ?? null,
      venue_hazards: plan?.venue_hazards ?? null,
      warm_up_drill_id: plan?.warm_up_drill_id ?? null,
      warm_up_custom: plan?.warm_up_custom ?? null,
      mental_hack: plan?.mental_hack ?? null,
      notes_general: plan?.notes_general ?? null,
      completion_state: (plan?.completion_state as any) ?? 'planned',
      started_at: plan?.started_at ?? null,
      closed_at: plan?.closed_at ?? null,
    },
    students,
    availableDrills: availableDrills as any[],
    stpCatalog: (stpRows ?? []) as any[],
  };
}

// ─── Save plan-level (venue + warm-up + mental hack + notes) ──────

export async function saveServicePlanHeader(
  token: string,
  campInstanceId: string,
  patch: Partial<{
    venue_analysis: string | null;
    venue_go_no_go: 'go' | 'modified' | 'no_go' | null;
    venue_wave_size: string | null;
    venue_wind: string | null;
    venue_tide: string | null;
    venue_hazards: string | null;
    warm_up_drill_id: string | null;
    warm_up_custom: string | null;
    mental_hack: string | null;
    notes_general: string | null;
  }>
): Promise<void> {
  const admin = createAdminClient();

  // Verify coach owns this camp_instance
  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, coach_id, head_coach_id')
    .eq('id', campInstanceId)
    .single();
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  await admin
    .from('service_plans')
    .upsert(
      {
        camp_instance_id: campInstanceId,
        ...patch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'camp_instance_id' }
    );
}

// ─── Save per-student block ────────────────────────────────────────

export async function saveServicePlanBlock(
  token: string,
  campInstanceId: string,
  studentId: string,
  patch: Partial<{
    step_id: string | null;
    land_drill_id: string | null;
    land_drill_custom: string | null;
    water_drill_id: string | null;
    water_drill_custom: string | null;
    objective_text: string | null;
    notes_pre: string | null;
    status: 'achieved' | 'partial' | 'not_yet' | null;
    notes_post: string | null;
  }>
): Promise<void> {
  const admin = createAdminClient();

  // Verify coach + service ownership
  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: camp } = await admin
    .from('camp_instances')
    .select('coach_id, head_coach_id')
    .eq('id', campInstanceId)
    .single();
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Verify student is in this camp_instance
  const { data: participant } = await admin
    .from('camp_participants')
    .select('id')
    .eq('camp_instance_id', campInstanceId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (!participant) throw new Error('Student not enrolled in this service.');

  // Whitelist only the writable columns. The caller may pass the full
  // block object (including `id`, which must NOT be in the payload —
  // it's a gen_random_uuid() PK and an explicit null violates NOT NULL).
  const ALLOWED = [
    'step_id',
    'land_drill_id',
    'land_drill_custom',
    'water_drill_id',
    'water_drill_custom',
    'objective_text',
    'notes_pre',
    'status',
    'notes_post',
  ] as const;
  const cleanPatch: Record<string, any> = {};
  for (const k of ALLOWED) {
    if (k in patch) cleanPatch[k] = (patch as any)[k];
  }

  // One block per student per service for v1 — update if exists, else insert
  const { data: existing } = await admin
    .from('service_plan_blocks')
    .select('id')
    .eq('camp_instance_id', campInstanceId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from('service_plan_blocks')
      .update({ ...cleanPatch, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from('service_plan_blocks').insert({
      camp_instance_id: campInstanceId,
      student_id: studentId,
      ...cleanPatch,
    });
    if (error) throw new Error(error.message);
  }
}

// ─── Lifecycle: start + close ──────────────────────────────────────

export async function startServicePlan(token: string, campInstanceId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  await admin
    .from('service_plans')
    .upsert(
      {
        camp_instance_id: campInstanceId,
        completion_state: 'in_progress',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'camp_instance_id' }
    );
}

// Close the service plan AND sync every student's evaluation into the
// unified bitácora (student_session_results) so it shows up in the
// student portal + their admin profile. Mirrors closeCampSessionResult.
//
// Steps:
//   1. Ensure a camp_session exists for this camp_instance (day 1).
//   2. Wipe + re-insert one student_session_results row per block
//      (idempotent — re-closing re-syncs cleanly).
//   3. Call update_student_profile_on_close RPC per student so the
//      student's last_session_* snapshot updates.
//   4. Email each student their feedback + survey link (first close only).
//   5. Flip service_plans → closed and camp_instance → completed.
export async function closeServicePlan(token: string, campInstanceId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id, display_name')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, camp_name, start_date, coach_id, head_coach_id')
    .eq('id', campInstanceId)
    .single();
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  const { data: plan } = await admin
    .from('service_plans')
    .select('*')
    .eq('camp_instance_id', campInstanceId)
    .maybeSingle();
  const alreadyClosed = plan?.completion_state === 'closed';

  const { data: blocks } = await admin
    .from('service_plan_blocks')
    .select('*')
    .eq('camp_instance_id', campInstanceId);
  const allBlocks = blocks ?? [];

  // 1. Ensure a camp_session exists (day 1)
  let { data: campSession } = await admin
    .from('camp_sessions')
    .select('id')
    .eq('camp_instance_id', campInstanceId)
    .eq('day_number', 1)
    .maybeSingle();
  if (!campSession) {
    const { data: created, error: csErr } = await admin
      .from('camp_sessions')
      .insert({
        camp_instance_id: campInstanceId,
        day_number: 1,
        session_date: camp.start_date ?? new Date().toISOString().slice(0, 10),
        venue_actual: plan?.venue_analysis ?? null,
        common_notes:
          [plan?.warm_up_custom, plan?.mental_hack].filter(Boolean).join(' · ') || null,
        session_status: 'completed',
      })
      .select('id')
      .single();
    if (csErr) throw new Error(csErr.message);
    campSession = created;
  } else {
    await admin
      .from('camp_sessions')
      .update({ session_status: 'completed' })
      .eq('id', campSession.id);
  }

  // 2. Idempotency — clear prior results for this camp_session
  await admin
    .from('student_session_results')
    .delete()
    .eq('camp_session_id', campSession!.id);

  // Resolve drill/mission titles for the mission text
  const drillIds = Array.from(
    new Set(
      allBlocks
        .flatMap((b: any) => [b.water_drill_id, b.land_drill_id])
        .filter(Boolean)
    )
  );
  const titleById: Record<string, string> = {};
  if (drillIds.length > 0) {
    const { data: dm } = await admin
      .from('drills_missions')
      .select('id, title')
      .in('id', drillIds);
    for (const d of dm ?? []) titleById[d.id] = d.title;
  }

  // Students (portal_token + email for the close email)
  const studentIds = allBlocks.map((b: any) => b.student_id);
  const studById: Record<string, any> = {};
  if (studentIds.length > 0) {
    const { data: studs } = await admin
      .from('students')
      .select('id, first_name, email, portal_token, belt_level')
      .in('id', studentIds);
    for (const s of studs ?? []) studById[s.id] = s;
  }

  const STATUS_MAP: Record<string, string> = {
    achieved: 'competent',
    partial: 'partial',
    not_yet: 'not_yet',
  };

  // 3. One result per block + profile snapshot sync
  for (const b of allBlocks) {
    const stud = studById[b.student_id];
    const missionTitle =
      b.objective_text ||
      (b.water_drill_id ? titleById[b.water_drill_id] : b.water_drill_custom) ||
      (b.land_drill_id ? titleById[b.land_drill_id] : b.land_drill_custom) ||
      'Service session';
    const status = STATUS_MAP[b.status as string] ?? 'partial';
    const achievedText =
      b.status === 'achieved' ? 'yes' : b.status === 'not_yet' ? 'not yet' : 'partial';

    const { data: result, error: resErr } = await admin
      .from('student_session_results')
      .insert({
        camp_session_id: campSession!.id,
        student_id: b.student_id,
        coach_id: coach.id,
        status,
        coach_feedback: b.notes_post ?? null,
        achieved: achievedText,
        whats_next: null,
        homework: null,
        completion_state: 'closed',
        survey_unlocked: true,
        portal_token: stud?.portal_token ?? null,
      })
      .select('id')
      .single();
    if (resErr) throw new Error(resErr.message);

    // Sync the student's profile snapshot (last_session_*)
    if (result) {
      try {
        await admin.rpc('update_student_profile_on_close', {
          p_student_id: b.student_id,
          p_session_result_id: result.id,
          p_session_date: new Date().toISOString(),
          p_mission: missionTitle,
          p_pilar: b.step_id ?? null,
          p_status: status,
          p_homework: null,
          p_whats_next: null,
        });
      } catch {
        /* non-blocking — profile snapshot is best-effort */
      }
    }

    // 4. Email feedback + survey link (only on first close, non-blocking)
    if (!alreadyClosed && stud?.email && result) {
      try {
        const { sendSessionEmail } = await import('@/lib/actions/email');
        await sendSessionEmail({
          studentName: stud.first_name,
          studentEmail: stud.email,
          portalToken: stud.portal_token,
          coachName: coach.display_name || 'Coach',
          sessionDate: new Date().toISOString(),
          mission: missionTitle,
          status,
          coachFeedback: b.notes_post ?? '',
          homework: '',
          whatsNext: '',
          beltLevel: stud.belt_level || 'white_belt',
        });
        await admin
          .from('student_session_results')
          .update({ email_sent: true, email_sent_at: new Date().toISOString() })
          .eq('id', result.id);
      } catch {
        /* non-blocking */
      }
    }
  }

  // 5. Flip lifecycle states
  await admin
    .from('service_plans')
    .upsert(
      {
        camp_instance_id: campInstanceId,
        completion_state: 'closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'camp_instance_id' }
    );

  await admin
    .from('camp_instances')
    .update({ status: 'completed' })
    .eq('id', campInstanceId);
}
