'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { resolveReportScope } from '@/lib/actions/reports-common';
import { elSalvadorToday, elSalvadorDatePlus, toElSalvadorDate } from '@/lib/utils/tz';

// Embudo de reserva → pago por canal. NO hay tabla de escaneos del QR, así que
// el tope del embudo medible es la RESERVA (camp_participants). Canal: sold_by
// NULL = auto-servicio por QR; con sold_by = mostrador/vendedor. Se fecha por
// reserved_at (las filas legacy sin reserved_at no entran a la ventana).

export interface FunnelChannel {
  channel: 'qr' | 'desk';
  label: string;
  bookings: number;
  unpaid: number;    // reservado/pendiente, activo
  paid: number;
  cancelled: number; // enrollment_status='removed'
  conversionPct: number; // paid / bookings
}

export interface FunnelReport {
  ok: boolean;
  error?: string;
  from: string;
  to: string;
  isPlatformAdmin: boolean;
  channels: FunnelChannel[];
  totals: { bookings: number; unpaid: number; paid: number; cancelled: number; conversionPct: number };
}

export async function getQrFunnel(opts: {
  from?: string | null;
  to?: string | null;
  academyId?: string | null;
}): Promise<FunnelReport> {
  const scope = await resolveReportScope(opts.academyId);
  const to = opts.to || elSalvadorToday();
  const from = opts.from || elSalvadorDatePlus(-90);
  const base: FunnelReport = {
    ok: false, from, to, isPlatformAdmin: !!scope.isPlatformAdmin, channels: [],
    totals: { bookings: 0, unpaid: 0, paid: 0, cancelled: 0, conversionPct: 0 },
  };
  if (!scope.ok) return { ...base, error: 'No autorizado.' };

  const admin = createAdminClient();
  const fromUtc = `${from}T00:00:00.000Z`;
  const toUtc = new Date(Date.parse(`${to}T00:00:00.000Z`) + 2 * 86400000).toISOString();
  let q = admin
    .from('camp_participants')
    .select('payment_status, enrollment_status, sold_by, reserved_at, camp_instances:camp_instance_id!inner(academy_id, status)')
    .not('reserved_at', 'is', null)
    .gte('reserved_at', fromUtc)
    .lte('reserved_at', toUtc);
  if (scope.scopeAcademyId) q = q.eq('camp_instances.academy_id', scope.scopeAcademyId);
  q = q.neq('camp_instances.status', 'cancelled');
  const { data, error } = await q;
  if (error) return { ...base, error: error.message };

  const mk = (): Omit<FunnelChannel, 'channel' | 'label' | 'conversionPct'> => ({ bookings: 0, unpaid: 0, paid: 0, cancelled: 0 });
  const acc: Record<'qr' | 'desk', ReturnType<typeof mk>> = { qr: mk(), desk: mk() };

  for (const r of (data as any[]) ?? []) {
    const svDate = toElSalvadorDate(r.reserved_at);
    if (svDate && (svDate < from || svDate > to)) continue;
    const ch = r.sold_by ? 'desk' : 'qr';
    const a = acc[ch];
    a.bookings += 1;
    if (r.enrollment_status === 'removed') a.cancelled += 1;
    else if (r.payment_status === 'paid') a.paid += 1;
    else if (r.payment_status === 'reserved' || r.payment_status === 'pending') a.unpaid += 1;
  }

  const channels: FunnelChannel[] = (['qr', 'desk'] as const).map((ch) => {
    const a = acc[ch];
    return {
      channel: ch,
      label: ch === 'qr' ? 'QR (auto-servicio)' : 'Mostrador / vendedor',
      bookings: a.bookings, unpaid: a.unpaid, paid: a.paid, cancelled: a.cancelled,
      conversionPct: a.bookings ? Math.round((a.paid / a.bookings) * 100) : 0,
    };
  }).filter((c) => c.bookings > 0);

  const t = base.totals;
  for (const c of channels) { t.bookings += c.bookings; t.unpaid += c.unpaid; t.paid += c.paid; t.cancelled += c.cancelled; }
  t.conversionPct = t.bookings ? Math.round((t.paid / t.bookings) * 100) : 0;

  return { ok: true, from, to, isPlatformAdmin: !!scope.isPlatformAdmin, channels, totals: t };
}
