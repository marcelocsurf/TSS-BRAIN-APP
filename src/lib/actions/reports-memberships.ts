'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { resolveReportScope } from '@/lib/actions/reports-common';
import { elSalvadorToday, elSalvadorDatePlus, toElSalvadorDate } from '@/lib/utils/tz';

// Renovaciones de membresía: pendientes por confirmar (status='requested', el
// alumno lo pidió desde su portal), renovaciones confirmadas (source='renewal'
// + status='active') y membresías por vencer en 30 días (para perseguirlas).
// Las filas 'requested' tienen ends_at PLACEHOLDER → nunca mostrarla como fecha.

export interface PendingRenewal { studentId: string; name: string; email: string | null; months: number | null; requestedAt: string | null; }
export interface ConfirmedRenewal { studentId: string; name: string; email: string | null; months: number | null; amountCents: number | null; paymentMethod: string | null; startsAt: string | null; endsAt: string | null; createdAt: string | null; }
export interface ExpiringMembership { studentId: string; name: string; email: string | null; endsAt: string; daysLeft: number; }

export interface MembershipsReport {
  ok: boolean;
  error?: string;
  from: string;
  to: string;
  isPlatformAdmin: boolean;
  pending: PendingRenewal[];
  confirmed: ConfirmedRenewal[];
  expiring: ExpiringMembership[];
  totals: { renewalRevenueCents: number; renewalCount: number; pendingCount: number; expiringCount: number };
}

const fullName = (s: any) => [s?.first_name, s?.last_name].filter(Boolean).join(' ') || 'Alumno';

export async function getMembershipsReport(opts: {
  from?: string | null;
  to?: string | null;
  academyId?: string | null;
}): Promise<MembershipsReport> {
  const scope = await resolveReportScope(opts.academyId);
  const to = opts.to || elSalvadorToday();
  const from = opts.from || elSalvadorDatePlus(-90);
  const base: MembershipsReport = {
    ok: false, from, to, isPlatformAdmin: !!scope.isPlatformAdmin,
    pending: [], confirmed: [], expiring: [],
    totals: { renewalRevenueCents: 0, renewalCount: 0, pendingCount: 0, expiringCount: 0 },
  };
  if (!scope.ok) return { ...base, error: 'No autorizado.' };
  // Coordinador siempre tiene academia; platform admin sin academia elegida no
  // puede consultar memberships con scope → pedir que elija una.
  if (!scope.scopeAcademyId) return { ...base, error: 'Elegí una academia (switcher) para ver este reporte.' };

  const admin = createAdminClient();
  const sel = 'id, student_id, months, amount_cents, source, status, payment_method, starts_at, ends_at, created_at, students:student_id(first_name, last_name, email)';

  // 1) Pendientes por confirmar (estado actual).
  const { data: pendingRows, error: pErr } = await admin
    .from('memberships').select(sel)
    .eq('academy_id', scope.scopeAcademyId).eq('status', 'requested')
    .order('created_at', { ascending: false });
  if (pErr) return { ...base, error: pErr.message };

  // 2) Renovaciones confirmadas en el rango (por created_at).
  const fromUtc = `${from}T00:00:00.000Z`;
  const toUtc = new Date(Date.parse(`${to}T00:00:00.000Z`) + 2 * 86400000).toISOString();
  const { data: confirmedRows } = await admin
    .from('memberships').select(sel)
    .eq('academy_id', scope.scopeAcademyId).eq('source', 'renewal').eq('status', 'active')
    .gte('created_at', fromUtc).lte('created_at', toUtc)
    .order('created_at', { ascending: false });

  // 3) Membresías por vencer (activas, ends_at en los próximos 30 días, sin fila
  //    activa más lejana para el mismo alumno).
  const { data: activeRows } = await admin
    .from('memberships').select('student_id, ends_at, students:student_id(first_name, last_name, email)')
    .eq('academy_id', scope.scopeAcademyId).eq('status', 'active').not('ends_at', 'is', null);

  const pending: PendingRenewal[] = (pendingRows ?? []).map((r: any) => {
    const s = Array.isArray(r.students) ? r.students[0] : r.students;
    return { studentId: r.student_id, name: fullName(s), email: s?.email ?? null, months: r.months ?? null, requestedAt: r.created_at ?? null };
  });

  const confirmed: ConfirmedRenewal[] = (confirmedRows ?? [])
    .filter((r: any) => { const d = toElSalvadorDate(r.created_at); return !d || (d >= from && d <= to); })
    .map((r: any) => {
      const s = Array.isArray(r.students) ? r.students[0] : r.students;
      return {
        studentId: r.student_id, name: fullName(s), email: s?.email ?? null,
        months: r.months ?? null, amountCents: r.amount_cents ?? null, paymentMethod: r.payment_method ?? null,
        startsAt: r.starts_at ?? null, endsAt: r.ends_at ?? null, createdAt: r.created_at ?? null,
      };
    });

  // Fila activa más lejana por alumno.
  const furthest = new Map<string, { ends: string; student: any }>();
  for (const r of (activeRows as any[]) ?? []) {
    const cur = furthest.get(r.student_id);
    if (!cur || (r.ends_at && r.ends_at > cur.ends)) furthest.set(r.student_id, { ends: r.ends_at, student: Array.isArray(r.students) ? r.students[0] : r.students });
  }
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 86400000);
  const expiring: ExpiringMembership[] = [];
  for (const [studentId, v] of furthest) {
    const end = new Date(v.ends);
    if (end >= now && end <= in30) {
      expiring.push({
        studentId, name: fullName(v.student), email: v.student?.email ?? null,
        endsAt: v.ends, daysLeft: Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000)),
      });
    }
  }
  expiring.sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    ok: true, from, to, isPlatformAdmin: !!scope.isPlatformAdmin,
    pending, confirmed, expiring,
    totals: {
      renewalRevenueCents: confirmed.reduce((s, r) => s + (r.amountCents ?? 0), 0),
      renewalCount: confirmed.length,
      pendingCount: pending.length,
      expiringCount: expiring.length,
    },
  };
}
