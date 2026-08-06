import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTaskOverdueEmail, sendServiceReminderEmail } from '@/lib/actions/email';

export const dynamic = 'force-dynamic';

// Daily reminder emails — the email layer that mirrors the in-app pg_cron jobs.
// Protected by CRON_SECRET; triggered once a day (by pg_cron via pg_net, or any
// scheduler). Uses its own *_emailed_at flags so it never double-sends and never
// interferes with the in-app notifications.

function esToday(offsetDays = 0): string {
  // Current date in America/El_Salvador (UTC-6, no DST), shifted by offsetDays.
  const now = new Date();
  const es = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  es.setUTCDate(es.getUTCDate() + offsetDays);
  return es.toISOString().slice(0, 10);
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  if (Number.isNaN(hr)) return '';
  return ` at ${hr % 12 || 12}:${m ?? '00'} ${hr >= 12 ? 'PM' : 'AM'}`;
}

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured.' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  const key = req.nextUrl.searchParams.get('key');
  if (auth !== `Bearer ${secret}` && key !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com';
  const today = esToday(0);
  const tomorrow = esToday(1);

  let taskEmails = 0;
  let serviceEmails = 0;
  let membershipEmails = 0;

  // ── 1) Overdue tasks ────────────────────────────────────────────
  const { data: tasks } = await admin
    .from('academy_tasks')
    .select('id, title, due_date, assignee_coach_id, created_by')
    .eq('status', 'open')
    .not('due_date', 'is', null)
    .lt('due_date', today)
    .is('overdue_emailed_at', null);

  // ── 2) Services starting tomorrow ───────────────────────────────
  const { data: services } = await admin
    .from('camp_instances')
    .select('id, camp_name, start_date, scheduled_time, head_coach_id, coach_id, status')
    .eq('start_date', tomorrow)
    .is('reminder_emailed_at', null);
  const liveServices = (services ?? []).filter(
    (s: any) => !['cancelled', 'completed'].includes(s.status ?? 'planned'),
  );

  // ── Resolve all coach emails in one query ───────────────────────
  const coachIds = new Set<string>();
  for (const t of tasks ?? []) {
    if (t.assignee_coach_id) coachIds.add(t.assignee_coach_id);
    if (t.created_by) coachIds.add(t.created_by);
  }
  for (const s of liveServices) {
    if (s.head_coach_id) coachIds.add(s.head_coach_id);
    if (s.coach_id) coachIds.add(s.coach_id);
  }
  const coachMap = new Map<string, { email: string | null; first: string }>();
  if (coachIds.size > 0) {
    const { data: coaches } = await admin
      .from('coaches')
      .select('id, email, first_name, display_name')
      .in('id', Array.from(coachIds));
    for (const c of coaches ?? []) {
      coachMap.set(c.id, { email: c.email ?? null, first: c.first_name || c.display_name || 'there' });
    }
  }

  // Send overdue-task emails (assignee + creator, deduped by email).
  for (const t of tasks ?? []) {
    const dueLabel = t.due_date ? fmtDate(t.due_date) : '';
    const recipients: Array<{ id: string; isAssignee: boolean }> = [];
    if (t.assignee_coach_id) recipients.push({ id: t.assignee_coach_id, isAssignee: true });
    if (t.created_by && t.created_by !== t.assignee_coach_id) recipients.push({ id: t.created_by, isAssignee: false });
    const sentTo = new Set<string>();
    for (const r of recipients) {
      const c = coachMap.get(r.id);
      if (!c?.email || sentTo.has(c.email)) continue;
      sentTo.add(c.email);
      await sendTaskOverdueEmail({
        toEmail: c.email, firstName: c.first, taskTitle: t.title, dueLabel,
        isAssignee: r.isAssignee, portalUrl: `${appUrl}/dashboard`,
      });
      taskEmails++;
    }
    await admin.from('academy_tasks').update({ overdue_emailed_at: new Date().toISOString() }).eq('id', t.id);
  }

  // Send service-reminder emails (head coach + assigned coach, deduped).
  for (const s of liveServices) {
    const { count } = await admin
      .from('camp_participants')
      .select('id', { count: 'exact', head: true })
      .eq('camp_instance_id', s.id)
      .eq('enrollment_status', 'active');
    const whenLabel = `Tomorrow${fmtTime(s.scheduled_time)} · ${count ?? 0} student${count === 1 ? '' : 's'}`;
    const ids = [s.head_coach_id, s.coach_id].filter(Boolean) as string[];
    const sentTo = new Set<string>();
    for (const id of ids) {
      const c = coachMap.get(id);
      if (!c?.email || sentTo.has(c.email)) continue;
      sentTo.add(c.email);
      await sendServiceReminderEmail({
        toEmail: c.email, firstName: c.first, serviceName: s.camp_name,
        whenLabel, portalUrl: `${appUrl}/dashboard`,
      });
      serviceEmails++;
    }
    await admin.from('camp_instances').update({ reminder_emailed_at: new Date().toISOString() }).eq('id', s.id);
  }

  // ── 3) Housekeeping: prune stale notifications ──────────────────
  // Notifications are append-only; without this they grow forever. 90 days
  // is far beyond their useful life (the panel shows the latest 30 anyway).
  let notificationsPruned = 0;
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from('notifications')
      .delete({ count: 'exact' })
      .lt('created_at', cutoff);
    notificationsPruned = count ?? 0;
  } catch { /* table shape changed — never fail the reminder run over cleanup */ }

  // ── 3) Membresías que vencen en ~15 días (M156 Fase 1.5) ────────
  try {
    const in14 = new Date(Date.now() + 14 * 86400000).toISOString();
    const in16 = new Date(Date.now() + 16 * 86400000).toISOString();
    const { data: expiring } = await admin
      .from('memberships')
      .select('id, ends_at, students:student_id(id, first_name, email, portal_token, lifecycle_status, status)')
      .eq('status', 'active')
      .gte('ends_at', in14)
      .lte('ends_at', in16)
      .is('expiry_reminder_sent_at', null);
    const { Resend } = await import('resend');
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    for (const mem of expiring ?? []) {
      const st: any = Array.isArray((mem as any).students) ? (mem as any).students[0] : (mem as any).students;
      if (!st?.email || st.status !== 'active' || st.lifecycle_status !== 'member') continue;
      const { count: later } = await admin.from('memberships').select('id', { count: 'exact', head: true })
        .eq('student_id', st.id).eq('status', 'active').gt('ends_at', (mem as any).ends_at);
      if ((later ?? 0) > 0) continue;
      if (resend) {
        const endDate = new Date((mem as any).ends_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
          to: st.email,
          subject: 'Your Surf Sequence membership ends soon 🌊',
          html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#061C2B;">
            <h2>Hey ${st.first_name || 'surfer'} — your membership ends ${endDate}</h2>
            <p>Your belt journey, courses and logbook stay saved — but your portal access pauses unless you renew.</p>
            <p><strong>$9.99/month · $49.99/6 months · $99.90/year</strong></p>
            <p><a href="${appUrl}/portal/${st.portal_token}" style="display:inline-block;background:#00D2FF;color:#061C2B;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Renew from your portal →</a></p>
            <p style="color:#55666E;font-size:13px;">Or just pay at the academy — we&#39;ll extend it on the spot.</p>
          </div>`,
        }).catch(() => {});
      }
      await admin.from('memberships').update({ expiry_reminder_sent_at: new Date().toISOString() }).eq('id', (mem as any).id);
      membershipEmails++;
    }
  } catch (e) { console.error('[daily-reminders] membership section failed', e); }

  // ── 4. Cierres pendientes → correo al coach (candado de nómina) ──
  // Regla de Marcelo (2026-08-06): UN solo correo, a las 5 PM de El Salvador.
  // Incluye la sesión de HOY (a esa hora ya debió cerrarse) + los 6 días
  // previos. La corrida de la mañana NO manda esto — a las 7 AM la clase
  // del día ni siquiera empezó (Stanley recibió ese falso reclamo).
  let closureEmails = 0;
  const svNow = new Date(Date.now() - 6 * 3600_000);
  const closureRun = svNow.getUTCHours() >= 16; // corrida vespertina (cron 23:00 UTC = 5 PM SV)
  if (closureRun) try {
    const svToday = svNow.toISOString().slice(0, 10);
    const weekAgo = new Date(svNow.getTime() - 6 * 86400000).toISOString().slice(0, 10);
    const { data: openSes } = await admin
      .from('camp_sessions')
      .select('session_date, session_status, camp_instances:camp_instance_id!inner(camp_name, status, coach_id, head_coach_id, head_coach_status, coaches:coach_id(id, display_name, email, portal_token), hc:head_coach_id(id, display_name, email, portal_token))')
      .gte('session_date', weekAgo)
      .lte('session_date', svToday)
      .neq('session_status', 'completed');
    const byCoach = new Map<string, { name: string; email: string; token: string; pending: { service: string; date: string }[] }>();
    for (const ses of (openSes as any[]) ?? []) {
      const inst = Array.isArray(ses.camp_instances) ? ses.camp_instances[0] : ses.camp_instances;
      if (!inst || inst.status === 'cancelled') continue;
      const useHead = inst.head_coach_id && inst.head_coach_status === 'accepted';
      const coach = useHead
        ? (Array.isArray(inst.hc) ? inst.hc[0] : inst.hc)
        : (Array.isArray(inst.coaches) ? inst.coaches[0] : inst.coaches);
      if (!coach?.id) continue;
      if (!coach?.email) continue;
      const e = byCoach.get(coach.id) ?? { name: coach.display_name ?? 'Coach', email: coach.email, token: coach.portal_token, pending: [] as { service: string; date: string }[] };
      e.pending.push({ service: (inst.camp_name ?? '').split(' · ')[0], date: ses.session_date });
      byCoach.set(coach.id, e);
    }
    const { sendClosureReminderEmail } = await import('@/lib/actions/email');
    const base = process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com';
    for (const [, c] of byCoach) {
      const r = await sendClosureReminderEmail({
        toEmail: c.email, coachName: c.name,
        pending: c.pending.sort((a, b) => a.date.localeCompare(b.date)),
        portalUrl: `${base}/coach-portal/${c.token}`,
      });
      if (r.success) closureEmails++;
    }
  } catch (e) {
    console.error('closure reminders section failed', e);
  }

  return NextResponse.json({
    closureRun,
    ok: true,
    date: today,
    overdueTasks: (tasks ?? []).length,
    taskEmails,
    servicesTomorrow: liveServices.length,
    serviceEmails,
    membershipEmails,
    closureEmails,
    notificationsPruned,
  });
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }
