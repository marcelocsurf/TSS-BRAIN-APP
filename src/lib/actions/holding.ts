'use server';

// ═══ "POR ASIGNAR" — camp · nivel por confirmar (Marcelo 2026-09-11) ═══
// El que compró camp sin nivel claro queda inscrito en la instancia holding
// de su academia. Cuando llena el intake (quiz), aparece acá con su nivel y
// una persona (Kat o coordinación) lo mueve al camp real. Mover = la misma
// transferencia del mostrador (deskTransferSeat): conserva pago y notas.

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { elSalvadorToday } from '@/lib/utils/tz';
import { resolveDesk, deskTransferSeat } from '@/lib/actions/front-desk';
import { V2_LEVELS } from '@/lib/quiz/surf-level-v2';

export interface HoldingSeat {
  participant_id: string;
  student_id: string;
  name: string;
  belt: string | null;
  level_name: string | null;
  score: number | null;
  quiz: boolean;
  intake: boolean;
  waiver: boolean;
  paid: boolean;
  reserved_at: string | null;
  goal: string | null;
}

export interface HoldingTarget { id: string; name: string; start: string; end: string; left: number | null; level: string | null }

async function seatsFor(academyId: string): Promise<HoldingSeat[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('camp_participants')
    .select('id, student_id, payment_status, reserved_at, camp_instances:camp_instance_id!inner(academy_id, is_holding), students:student_id(first_name, last_name, belt_level, level_quiz_score, level_quiz_completed_at, intake_completed_at, waiver_signed, personal_goal)')
    .eq('camp_instances.academy_id', academyId)
    .eq('camp_instances.is_holding', true)
    .eq('enrollment_status', 'active')
    .order('reserved_at', { ascending: true });
  return (data ?? []).map((r: any) => {
    const s = Array.isArray(r.students) ? r.students[0] : r.students;
    const lvl = V2_LEVELS.find((l) => l.belt === s?.belt_level) ?? null;
    return {
      participant_id: r.id,
      student_id: r.student_id,
      name: [s?.first_name, s?.last_name].filter(Boolean).join(' ') || 'Student',
      belt: s?.belt_level ?? null,
      level_name: s?.level_quiz_completed_at ? (lvl?.name ?? null) : null,
      score: s?.level_quiz_completed_at ? (s?.level_quiz_score ?? null) : null,
      quiz: !!s?.level_quiz_completed_at,
      intake: !!s?.intake_completed_at,
      waiver: !!s?.waiver_signed,
      paid: r.payment_status === 'paid',
      reserved_at: r.reserved_at ?? null,
      goal: s?.personal_goal ?? null,
    };
  });
}

async function targetsFor(academyId: string): Promise<HoldingTarget[]> {
  const admin = createAdminClient();
  const today = elSalvadorToday();
  const { data } = await admin
    .from('camp_instances')
    .select('id, camp_name, start_date, end_date, capacity_override, is_holding, status, camp_templates:template_id(level_name, capacity_max), camp_participants(enrollment_status)')
    .eq('academy_id', academyId)
    .eq('is_holding', false)
    .neq('status', 'cancelled')
    .gt('start_date', today)          // un camp arrancado no recibe gente nueva
    .order('start_date')
    .limit(40);
  return (data ?? [])
    .filter((c: any) => c.end_date > c.start_date) // solo camps (2+ días)
    .map((c: any) => {
      const tpl = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
      const act = (c.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active').length;
      const cap = c.capacity_override ?? tpl?.capacity_max ?? 0;
      return { id: c.id, name: (c.camp_name ?? '').split(' · ')[0], start: c.start_date, end: c.end_date, left: cap > 0 ? cap - act : null, level: tpl?.level_name ?? null };
    })
    .filter((t: HoldingTarget) => t.left === null || t.left > 0);
}

// ── Dashboard (login): coordinador / admin ──
export async function getHoldingBoard(academyId?: string | null): Promise<{ seats: HoldingSeat[]; targets: HoldingTarget[] }> {
  const me = await getCurrentCoach();
  const aid = academyId ?? me?.academy_id ?? null;
  if (!me || !aid) return { seats: [], targets: [] };
  const [seats, targets] = await Promise.all([seatsFor(aid), targetsFor(aid)]);
  return { seats, targets };
}

export async function assignFromHolding(participantId: string, targetCampId: string): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach();
  if (!me?.id) return { ok: false, error: 'Not authorized.' };
  // Misma mudanza del mostrador (conserva pago, precio y notas; avisa a
  // coaches). deskTransferSeat resuelve por token: lo leemos del coach logueado.
  const admin = createAdminClient();
  const { data: c } = await admin.from('coaches').select('portal_token').eq('id', me.id).maybeSingle();
  if (!c?.portal_token) return { ok: false, error: 'Not authorized.' };
  return deskTransferSeat(c.portal_token, participantId, targetCampId);
}

// ── Portal de Kat (token) ──
export async function hostHoldingBoard(token: string): Promise<{ seats: HoldingSeat[]; targets: HoldingTarget[] }> {
  const who = await resolveDesk(token);
  if (!who?.academy_id) return { seats: [], targets: [] };
  const [seats, targets] = await Promise.all([seatsFor(who.academy_id), targetsFor(who.academy_id)]);
  return { seats, targets };
}

export async function hostAssignFromHolding(token: string, participantId: string, targetCampId: string): Promise<{ ok: boolean; error?: string }> {
  return deskTransferSeat(token, participantId, targetCampId);
}
