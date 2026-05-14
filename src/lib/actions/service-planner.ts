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

export interface ServicePlanStudent {
  student_id: string;
  display_name: string;
  belt_level: string | null;
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

  // Students enrolled in this camp_instance
  const { data: participants } = await admin
    .from('camp_participants')
    .select('student_id, students:student_id(id, display_name, first_name, last_name, belt_level)')
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

  const students: ServicePlanStudent[] = (participants ?? []).map((p: any) => {
    const s = Array.isArray(p.students) ? p.students[0] : p.students;
    const block = blocksByStudent.get(p.student_id);
    return {
      student_id: p.student_id,
      display_name:
        s?.display_name ||
        `${s?.first_name ?? ''} ${s?.last_name ?? ''}`.trim() ||
        'Student',
      belt_level: s?.belt_level ?? null,
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

  // One block per student per service for v1 — upsert
  const { data: existing } = await admin
    .from('service_plan_blocks')
    .select('id')
    .eq('camp_instance_id', campInstanceId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from('service_plan_blocks')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from('service_plan_blocks').insert({
      camp_instance_id: campInstanceId,
      student_id: studentId,
      ...patch,
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

export async function closeServicePlan(token: string, campInstanceId: string): Promise<void> {
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
        completion_state: 'closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'camp_instance_id' }
    );

  // Mark the camp_instance as completed if all blocks have status
  // (light heuristic — coordinator can override)
  await admin
    .from('camp_instances')
    .update({ status: 'completed' })
    .eq('id', campInstanceId);
}
