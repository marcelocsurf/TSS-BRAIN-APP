import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { AlertTriangle, CalendarCheck2, Waves } from 'lucide-react';

// OPERATIONS BOARD (M148) — the coordinator's control center. Everything is
// derived from signals the system already records: service_plans.created_at
// (planned), started_at (opened), closed_at (closed) and the per-student
// light evaluation on block 0 (feedback). Nothing is invented.

const F_DISPLAY = { fontFamily: 'var(--font-archivo), var(--font-heading), sans-serif', fontStretch: '125%' as const, fontWeight: 800, textTransform: 'uppercase' as const, lineHeight: 1.05 };
const F_LABEL = { fontFamily: 'var(--font-plex), DM Mono, monospace', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.16em' };

type SessionRow = {
  id: string;
  date: string;
  dayNumber: number | null;
  campId: string;
  name: string;
  kind: string;
  time: string | null;
  coach: string | null;
  students: number;
  unpaid: number;
  planned: boolean;
  opened: boolean;
  closed: boolean;
  fbCount: number;
};

function esToday(): Date {
  // Operations run on El Salvador time (UTC-6, no DST).
  return new Date(Date.now() - 6 * 3600_000);
}
const iso = (d: Date) => d.toISOString().slice(0, 10);

async function getOps(academyId: string) {
  const admin = createAdminClient();
  const now = esToday();
  const today = iso(now);
  // Monday..Sunday of the current week.
  const dow = (now.getUTCDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now); monday.setUTCDate(now.getUTCDate() - dow);
  const sunday = new Date(monday); sunday.setUTCDate(monday.getUTCDate() + 6);

  const { data: sess } = await admin
    .from('camp_sessions')
    .select('id, session_date, day_number, camp_instance_id, camp_instances:camp_instance_id!inner(camp_name, scheduled_time, status, academy_id, head_coach:head_coach_id(display_name), coaches:coach_id(display_name), camp_templates:template_id(template_name, service_kind), camp_participants(id, enrollment_status, payment_status))')
    .eq('camp_instances.academy_id', academyId)
    .neq('camp_instances.status', 'cancelled')
    .gte('session_date', iso(monday))
    .lte('session_date', iso(sunday))
    .order('session_date');

  const ids = (sess ?? []).map((s: any) => s.id);
  const [{ data: plans }, { data: blocks }] = await Promise.all([
    ids.length ? admin.from('service_plans').select('camp_session_id, completion_state, started_at, closed_at').in('camp_session_id', ids) : Promise.resolve({ data: [] } as any),
    ids.length ? admin.from('service_plan_blocks').select('camp_session_id, student_id, focus_level, flow_channel, day_objective_status, notes_post').in('camp_session_id', ids).eq('order_index', 0) : Promise.resolve({ data: [] } as any),
  ]);
  const planByS = new Map((plans ?? []).map((p: any) => [p.camp_session_id, p]));
  const fbByS = new Map<string, Set<string>>();
  for (const b of blocks ?? []) {
    if (b.focus_level != null || b.flow_channel != null || b.day_objective_status || (b.notes_post ?? '').trim()) {
      if (!fbByS.has(b.camp_session_id)) fbByS.set(b.camp_session_id, new Set());
      if (b.student_id) fbByS.get(b.camp_session_id)!.add(b.student_id);
    }
  }

  const rows: SessionRow[] = (sess ?? []).map((s: any) => {
    const inst = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    const tpl = Array.isArray(inst?.camp_templates) ? inst.camp_templates[0] : inst?.camp_templates;
    const head = Array.isArray(inst?.head_coach) ? inst.head_coach[0] : inst?.head_coach;
    const co = Array.isArray(inst?.coaches) ? inst.coaches[0] : inst?.coaches;
    const parts = (inst?.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
    const plan = planByS.get(s.id) as any;
    return {
      id: s.id,
      date: s.session_date,
      dayNumber: s.day_number,
      campId: s.camp_instance_id,
      name: inst?.camp_name ?? tpl?.template_name ?? 'Service',
      kind: tpl?.service_kind ?? 'custom',
      time: inst?.scheduled_time ?? null,
      coach: head?.display_name ?? co?.display_name ?? null,
      students: parts.length,
      unpaid: parts.filter((p: any) => p.payment_status !== 'paid').length,
      planned: !!plan,
      opened: !!plan?.started_at || plan?.completion_state === 'in_progress' || plan?.completion_state === 'closed',
      closed: !!plan?.closed_at || plan?.completion_state === 'closed',
      fbCount: fbByS.get(s.id)?.size ?? 0,
    };
  });

  return { rows, today, monday: iso(monday) };
}

// Day status color for the week matrix + discipline math.
function dayStatus(r: SessionRow, today: string): 'green' | 'amber' | 'red' | 'blue' | 'gray' {
  const isClass = r.kind === 'class';
  const fbOk = isClass || r.students === 0 || r.fbCount > 0;
  if (r.date > today) return 'gray';
  if (r.date === today) {
    if (r.closed && fbOk) return 'green';
    if (r.closed && !fbOk) return 'amber';
    return 'blue';
  }
  if (!r.closed) return 'red';
  return fbOk ? 'green' : 'amber';
}

const WK_COLOR: Record<string, string> = { green: '#06D6A0', amber: '#FFD166', red: '#FF6B6B', blue: '#00D2FF', gray: '#E8EDF0' };

function Dot({ state, dash }: { state: 'ok' | 'now' | 'no' | 'late'; dash?: boolean }) {
  const style: Record<string, React.CSSProperties> = {
    ok: { background: 'rgba(6,214,160,.18)', color: '#047857' },
    now: { background: 'rgba(0,210,255,.22)', color: '#0090B0' },
    no: { background: '#EEF1F3', color: '#B3BEC5' },
    late: { background: 'rgba(255,107,107,.16)', color: '#C04545' },
  };
  return (
    <span className="shrink-0 w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-extrabold" style={style[state]}>
      {dash ? '–' : state === 'ok' ? '✓' : state === 'now' ? '●' : state === 'late' ? '!' : '·'}
    </span>
  );
}
const Bar = ({ on }: { on: boolean }) => <span className="h-[3px] flex-1 rounded-full" style={{ background: on ? '#06D6A0' : '#E8EDF0' }} />;

export async function OperationsBoard({ academyId }: { academyId: string }) {
  let data;
  try { data = await getOps(academyId); } catch { return null; }
  const { rows, today } = data;
  if (rows.length === 0) return null;

  const todayRows = rows.filter((r) => r.date === today);
  const fmtD = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // ── attention items (exceptions only) ──
  const attention: { title: string; chip: string; detail: string; href: string; sev: 'red' | 'amber' }[] = [];
  for (const r of todayRows) {
    if (!r.planned && !r.closed) attention.push({ title: r.name + (r.dayNumber ? ` · Day ${r.dayNumber}` : ''), chip: 'no plan yet', detail: `${r.coach ?? '—'}${r.time ? ` · ${r.time}` : ''}`, href: `/camps/${r.campId}`, sev: 'red' });
    if (r.kind === 'class' && r.unpaid > 0) attention.push({ title: r.name, chip: `${r.unpaid} unpaid`, detail: `${r.students} enrolled · settle at front desk`, href: `/camps/${r.campId}`, sev: 'amber' });
  }
  for (const r of rows.filter((x) => x.date < today)) {
    const st = dayStatus(r, today);
    if (st === 'red') attention.push({ title: r.name + (r.dayNumber ? ` · Day ${r.dayNumber}` : ''), chip: 'not closed', detail: `${r.coach ?? '—'} · ${fmtD(r.date)}`, href: `/camps/${r.campId}`, sev: 'red' });
    if (st === 'amber') attention.push({ title: r.name + (r.dayNumber ? ` · Day ${r.dayNumber}` : ''), chip: 'closed w/o feedback', detail: `${r.coach ?? '—'} · ${fmtD(r.date)} · ${r.students - r.fbCount} student(s) missing`, href: `/camps/${r.campId}`, sev: 'amber' });
  }

  const inWater = todayRows.filter((r) => r.opened && !r.closed).reduce((n, r) => n + r.students, 0);
  const onTrack = todayRows.filter((r) => ['green', 'blue'].includes(dayStatus(r, today)) && (r.planned || r.kind === 'class')).length;
  const dayName = new Date(today + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });

  // ── week matrix, grouped by camp ──
  const camps = new Map<string, { name: string; coach: string | null; byDate: Map<string, SessionRow> }>();
  for (const r of rows) {
    if (!camps.has(r.campId)) camps.set(r.campId, { name: r.name.replace(/ · \d{4}-\d{2}-\d{2}$/, ''), coach: r.coach, byDate: new Map() });
    camps.get(r.campId)!.byDate.set(r.date, r);
  }
  const weekDates = Array.from({ length: 7 }, (_, i) => { const d = new Date(data.monday + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + i); return iso(d); });
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // ── coach discipline ──
  const byCoach = new Map<string, { done: number; total: number }>();
  for (const r of rows.filter((x) => x.date <= today)) {
    if (!r.coach) continue;
    if (!byCoach.has(r.coach)) byCoach.set(r.coach, { done: 0, total: 0 });
    const c = byCoach.get(r.coach)!;
    c.total += 1;
    if (dayStatus(r, today) === 'green') c.done += 1;
  }
  const discipline = Array.from(byCoach.entries()).map(([coach, v]) => ({ coach, ...v, pct: v.total ? v.done / v.total : 0 })).sort((a, b) => b.pct - a.pct);

  return (
    <div className="mb-6 space-y-4">
      {/* ── Row 1: hero + attention ── */}
      <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
        <div className="rounded-3xl p-6" style={{ background: '#061C2B' }}>
          <p className="text-[9px]" style={{ ...F_LABEL, color: '#00D2FF' }}>Coordination · today</p>
          <h2 className="text-[26px] mt-2" style={{ ...F_DISPLAY, color: '#F7F9FA' }}>{dayName}<br />operations</h2>
          <div className="flex gap-6 mt-4">
            {[
              { v: todayRows.length, label: 'services', color: '#00D2FF' },
              { v: onTrack, label: 'on track', color: '#06D6A0' },
              { v: attention.length, label: 'attention', color: attention.length > 0 ? '#FF6B6B' : '#F7F9FA' },
              { v: inWater, label: 'in water', color: '#F7F9FA' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[22px]" style={{ ...F_DISPLAY, color: s.color }}>{s.v}</p>
                <p className="text-[7px] mt-0.5" style={{ ...F_LABEL, color: 'rgba(247,249,250,.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4" style={{ borderTop: '3px solid #FF6B6B' }}>
          <p className="text-[9px] mb-1 inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: '#FF6B6B' }}>
            <AlertTriangle size={12} /> Needs attention
          </p>
          {attention.length === 0 ? (
            <p className="text-sm text-gray-400 mt-3">All clear — every service is following the process. 🤙</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {attention.slice(0, 4).map((a, i) => (
                <Link key={i} href={a.href} className="block py-2 hover:bg-gray-50 rounded-lg px-1 -mx-1">
                  <p className="text-[13px] font-bold text-[var(--tss-navy)]">
                    {a.title}{' '}
                    <span className={`text-[9px] font-bold rounded-full px-2 py-0.5 align-middle ${a.sev === 'red' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{a.chip}</span>
                  </p>
                  <p className="text-[11px] text-gray-400">{a.detail}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: today's pipeline ── */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-[10px] inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: '#0090B0' }}>
            <Waves size={12} /> Today · service pipeline
          </p>
          <p className="text-[7px] text-gray-300" style={F_LABEL}>Plan → Open → Close → Feedback</p>
        </div>
        {todayRows.length === 0 ? (
          <p className="text-sm text-gray-400 py-3">No services scheduled today.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayRows.map((r) => {
              const isClass = r.kind === 'class';
              const fbOk = r.students > 0 && r.fbCount > 0;
              const chip = r.closed
                ? (isClass || fbOk ? { t: 'Complete', c: 'bg-emerald-50 text-emerald-700' } : { t: 'Closed · no feedback', c: 'bg-amber-50 text-amber-700' })
                : r.opened
                ? { t: 'In progress', c: 'bg-sky-50 text-sky-700' }
                : r.planned
                ? { t: 'Planned', c: 'bg-gray-100 text-gray-500' }
                : { t: 'No plan', c: 'bg-red-50 text-red-700' };
              return (
                <Link key={r.id} href={`/camps/${r.campId}`} className="flex items-center gap-3 py-2.5 hover:bg-gray-50 rounded-lg px-1 -mx-1">
                  <div className="w-44 min-w-44">
                    <p className="text-[13px] font-bold text-[var(--tss-navy)] truncate">{r.name}{r.dayNumber && r.kind === 'surf_camp' ? ` · D${r.dayNumber}` : ''}</p>
                    <p className="text-[10px] text-gray-400 truncate">{r.coach ?? '—'}{r.time ? ` · ${r.time}` : ''} · {r.students} student{r.students === 1 ? '' : 's'}</p>
                  </div>
                  <Dot state={r.planned ? 'ok' : isClass ? 'no' : 'late'} dash={isClass && !r.planned} />
                  <Bar on={r.planned} />
                  <Dot state={r.opened ? (r.closed ? 'ok' : 'now') : 'no'} />
                  <Bar on={r.closed} />
                  <Dot state={r.closed ? 'ok' : 'no'} />
                  <Bar on={r.closed && (isClass || fbOk)} />
                  <Dot state={isClass ? 'no' : r.closed && fbOk ? 'ok' : r.closed ? 'late' : 'no'} dash={isClass} />
                  <span className={`shrink-0 text-[10px] font-bold rounded-full px-2 py-0.5 min-w-20 text-center ${chip.c}`}>{chip.t}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Row 3: week matrix + discipline ── */}
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 overflow-x-auto">
          <p className="text-[10px] mb-2.5 inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: '#0090B0' }}>
            <CalendarCheck2 size={12} /> This week · process
          </p>
          <table className="w-full text-[11px]">
            <thead>
              <tr>
                <td className="text-[7px] text-gray-400 p-1" style={F_LABEL}>Service</td>
                {dayLetters.map((l, i) => (
                  <td key={i} className={`text-[7px] text-center ${weekDates[i] === today ? 'text-[var(--tss-navy)] font-bold' : 'text-gray-400'}`} style={F_LABEL}>{l}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(camps.entries()).map(([id, c]) => (
                <tr key={id}>
                  <td className="py-1.5 pr-2">
                    <Link href={`/camps/${id}`} className="font-semibold text-[var(--tss-navy)] hover:underline">{c.name}</Link>
                    <span className="text-gray-400"> · {c.coach ?? '—'}</span>
                  </td>
                  {weekDates.map((d) => {
                    const r = c.byDate.get(d);
                    return (
                      <td key={d} className="text-center">
                        <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: r ? WK_COLOR[dayStatus(r, today)] : 'transparent', border: r ? 'none' : '1px dashed #EEF1F3' }} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[9px] text-gray-400 mt-2">
            <span className="inline-block w-3 h-3 rounded align-[-2px]" style={{ background: '#06D6A0' }} /> complete ·{' '}
            <span className="inline-block w-3 h-3 rounded align-[-2px]" style={{ background: '#FFD166' }} /> no feedback ·{' '}
            <span className="inline-block w-3 h-3 rounded align-[-2px]" style={{ background: '#FF6B6B' }} /> incomplete ·{' '}
            <span className="inline-block w-3 h-3 rounded align-[-2px]" style={{ background: '#00D2FF' }} /> today
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] mb-2.5" style={{ ...F_LABEL, color: '#0090B0' }}>Coach discipline · this week</p>
          {discipline.length === 0 ? (
            <p className="text-sm text-gray-400">No sessions run yet this week.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {discipline.map((d) => {
                const color = d.pct >= 0.99 ? '#06D6A0' : d.pct >= 0.5 ? '#FFD166' : '#FF6B6B';
                const txt = d.pct >= 0.99 ? '#047857' : d.pct >= 0.5 ? '#8a6d1c' : '#c04545';
                return (
                  <div key={d.coach} className="flex items-center justify-between gap-2 py-2">
                    <p className="text-[13px] font-semibold text-[var(--tss-navy)] min-w-0 truncate">{d.coach}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden inline-block">
                        <span className="block h-full rounded-full" style={{ width: `${Math.round(d.pct * 100)}%`, background: color }} />
                      </span>
                      <span className="text-[12px] font-extrabold" style={{ color: txt }}>{d.done}/{d.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[9px] text-gray-400 mt-2">Days with the full process (plan · open · close · feedback) / days with a service.</p>
        </div>
      </div>
    </div>
  );
}
