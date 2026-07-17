'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

// Transport board (M133). The coach declares transport needs per class day in
// the planner (transport_needed + depart/return on service_plans); here the
// coordinator sees the whole week and marks each ride taken or cancelled.

export interface TransportDay {
  plan_id: string;
  session_date: string;
  day_number: number | null;
  camp_name: string | null;
  coach_name: string | null;
  students: number;
  class_start_time: string | null;
  surf_venue: string | null;
  transport_depart: string | null;
  transport_return: string | null;
  transport_status: string | null; // 'taken' | 'cancelled' | null = pending
}

export async function listWeekTransports(): Promise<TransportDay[]> {
  const me = await getCurrentCoach();
  if (!me) return [];
  const admin = createAdminClient();

  const today = new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10); // ES local
  // Show ALL upcoming transports (today → +60 days), not just this week — the
  // coordinator arranges rides for camps that can be weeks out.
  const horizon = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10);

  const { data, error } = await admin
    .from('service_plans')
    .select(
      'id, class_start_time, surf_venue, transport_needed, transport_depart, transport_return, transport_status, ' +
        'camp_sessions:camp_session_id(id, session_date, day_number, ' +
        'camp_instances:camp_instance_id(id, camp_name, academy_id, ' +
        'head_coach:head_coach_id(display_name), camp_participants(id, enrollment_status)))'
    )
    .eq('transport_needed', true);
  if (error) return []; // pre-migration: columns not there yet

  const rows: TransportDay[] = [];
  for (const p of data ?? []) {
    const sess: any = Array.isArray((p as any).camp_sessions) ? (p as any).camp_sessions[0] : (p as any).camp_sessions;
    if (!sess?.session_date || sess.session_date < today || sess.session_date > horizon) continue;
    const inst: any = Array.isArray(sess.camp_instances) ? sess.camp_instances[0] : sess.camp_instances;
    if (me.academy_id && inst?.academy_id && inst.academy_id !== me.academy_id) continue;
    const hc = Array.isArray(inst?.head_coach) ? inst.head_coach[0] : inst?.head_coach;
    rows.push({
      plan_id: (p as any).id,
      session_date: sess.session_date,
      day_number: sess.day_number ?? null,
      camp_name: inst?.camp_name ?? null,
      coach_name: hc?.display_name ?? null,
      students: (inst?.camp_participants ?? []).filter((x: any) => x.enrollment_status === 'active').length,
      class_start_time: (p as any).class_start_time ?? null,
      surf_venue: (p as any).surf_venue ?? null,
      transport_depart: (p as any).transport_depart ?? null,
      transport_return: (p as any).transport_return ?? null,
      transport_status: (p as any).transport_status ?? null,
    });
  }
  rows.sort((a, b) => a.session_date.localeCompare(b.session_date) || (a.transport_depart ?? '').localeCompare(b.transport_depart ?? ''));
  return rows;
}

export async function setTransportStatus(
  planId: string,
  status: 'taken' | 'cancelled' | null
): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach();
  if (!me) return { ok: false, error: 'Not authorized.' };
  const admin = createAdminClient();
  const { error } = await admin.from('service_plans').update({ transport_status: status }).eq('id', planId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  return { ok: true };
}
