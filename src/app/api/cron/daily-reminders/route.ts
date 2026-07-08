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

  return NextResponse.json({
    ok: true,
    date: today,
    overdueTasks: (tasks ?? []).length,
    taskEmails,
    servicesTomorrow: liveServices.length,
    serviceEmails,
  });
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }
