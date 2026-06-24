import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCoach } from '@/lib/actions/auth';
import { createAdminClient } from '@/lib/supabase/admin';

// Academy planning backup/export.
//   ?format=json → full nested backup (camps → participants → sessions → plans
//                  → blocks). Faithful snapshot for restore if anything breaks.
//   ?format=csv  → one row per camp, human-readable schedule overview.
// Coordinator → own academy only. Platform admin → all academies (or ?academy=).

function csv(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'coordinator')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') === 'csv' ? 'csv' : 'json';
  const admin = createAdminClient();

  // Scope: coordinator → own academy; admin → all (or a specific ?academy=).
  const scopeAcademyId = me.is_platform_admin
    ? searchParams.get('academy') || null
    : me.academy_id ?? null;

  let campQ = admin
    .from('camp_instances')
    .select('id, template_id, camp_name, coach_id, head_coach_id, start_date, end_date, modality, status, scheduled_time, capacity_override, academy_id, notes, created_at')
    .order('start_date', { ascending: true });
  if (scopeAcademyId) campQ = campQ.eq('academy_id', scopeAcademyId);
  const { data: camps } = await campQ;
  const campRows = camps ?? [];
  const campIds = campRows.map((c: any) => c.id);

  // Lookup tables
  const [{ data: templates }, { data: academies }, { data: coaches }] = await Promise.all([
    admin.from('camp_templates').select('id, template_name, level_name, includes_course_key, capacity_max'),
    admin.from('academies').select('id, name, slug'),
    admin.from('coaches').select('id, display_name'),
  ]);
  const tplById = new Map((templates ?? []).map((t: any) => [t.id, t]));
  const acById = new Map((academies ?? []).map((a: any) => [a.id, a]));
  const coachById = new Map((coaches ?? []).map((c: any) => [c.id, c.display_name]));

  // Children (only for the camps in scope)
  const inIds = campIds.length ? campIds : ['__none__'];
  const [{ data: participants }, { data: sessions }, { data: plans }, { data: blocks }] = await Promise.all([
    admin.from('camp_participants').select('id, camp_instance_id, student_id, enrollment_status, payment_status, amount_cents, currency, is_refresher').in('camp_instance_id', inIds),
    admin.from('camp_sessions').select('*').in('camp_instance_id', inIds),
    admin.from('service_plans').select('*').in('camp_instance_id', inIds),
    admin.from('service_plan_blocks').select('*').in('camp_instance_id', inIds),
  ]);

  // Student names for participants
  const studentIds = Array.from(new Set((participants ?? []).map((p: any) => p.student_id).filter(Boolean)));
  const { data: students } = studentIds.length
    ? await admin.from('students').select('id, first_name, last_name').in('id', studentIds)
    : { data: [] as any[] };
  const studentName = new Map((students ?? []).map((s: any) => [s.id, `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim()]));

  const partByCamp = new Map<string, any[]>();
  (participants ?? []).forEach((p: any) => {
    const arr = partByCamp.get(p.camp_instance_id) ?? [];
    arr.push({ ...p, student_name: studentName.get(p.student_id) ?? null });
    partByCamp.set(p.camp_instance_id, arr);
  });
  const sessByCamp = new Map<string, any[]>();
  (sessions ?? []).forEach((s: any) => {
    const arr = sessByCamp.get(s.camp_instance_id) ?? []; arr.push(s); sessByCamp.set(s.camp_instance_id, arr);
  });
  const planByCamp = new Map<string, any[]>();
  (plans ?? []).forEach((p: any) => { const a = planByCamp.get(p.camp_instance_id) ?? []; a.push(p); planByCamp.set(p.camp_instance_id, a); });
  const blockByCamp = new Map<string, any[]>();
  (blocks ?? []).forEach((b: any) => { const a = blockByCamp.get(b.camp_instance_id) ?? []; a.push(b); blockByCamp.set(b.camp_instance_id, a); });

  const stamp = new Date().toISOString().slice(0, 10);

  if (format === 'csv') {
    const header = ['camp_name', 'template', 'level', 'grants_course', 'start_date', 'end_date', 'status', 'modality', 'head_coach', 'coach', 'academy', 'capacity', 'enrolled', 'participants'];
    const lines = [header.join(',')];
    for (const c of campRows) {
      const t: any = tplById.get(c.template_id);
      const parts = partByCamp.get(c.id) ?? [];
      const active = parts.filter((p) => p.enrollment_status === 'active');
      lines.push([
        csv(c.camp_name), csv(t?.template_name), csv(t?.level_name), csv(t?.includes_course_key),
        csv(c.start_date), csv(c.end_date), csv(c.status), csv(c.modality),
        csv(coachById.get(c.head_coach_id) ?? ''), csv(coachById.get(c.coach_id) ?? ''),
        csv((acById.get(c.academy_id) as any)?.name ?? ''),
        csv(c.capacity_override ?? t?.capacity_max ?? ''), csv(active.length),
        csv(active.map((p) => p.student_name).filter(Boolean).join(' · ')),
      ].join(','));
    }
    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="tss-camps-${stamp}.csv"`,
      },
    });
  }

  // JSON — full nested backup
  const backup = {
    exported_at: new Date().toISOString(),
    exported_by: me.display_name ?? me.id,
    scope_academy_id: scopeAcademyId,
    camp_count: campRows.length,
    camps: campRows.map((c: any) => ({
      ...c,
      template: tplById.get(c.template_id) ?? null,
      academy: acById.get(c.academy_id) ?? null,
      head_coach: coachById.get(c.head_coach_id) ?? null,
      coach: coachById.get(c.coach_id) ?? null,
      participants: partByCamp.get(c.id) ?? [],
      sessions: sessByCamp.get(c.id) ?? [],
      service_plans: planByCamp.get(c.id) ?? [],
      service_plan_blocks: blockByCamp.get(c.id) ?? [],
    })),
  };
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="tss-camps-backup-${stamp}.json"`,
    },
  });
}
