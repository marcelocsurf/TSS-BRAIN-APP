import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { CalendarRange } from 'lucide-react';
import { CopyTextButton } from './CopyTextButton';

// ═══ WEEK OPERATIONS (pedido de Rick, 2026-08-25) ═══
// La LOGÍSTICA de la semana que los coaches ya planearon en su Vista Semana:
// por día, cada servicio con hora de encuentro, transfer, lugar, espacios,
// coach + staff, alumnos (idiomas, tallas, habitaciones). Reemplaza el Excel
// de "Programación semanal" — y cada día tiene su botón "copiar" con el
// formato de la "Programación diaria" que Rick manda al chat de performance
// (para los que no tienen perfil: instructores nuevos, camarógrafos, etc.).
// El OperationsBoard de arriba es el PROCESO (plan→abrir→cerrar); este es
// el QUÉ-DÓNDE-CUÁNDO.

const F_LABEL = { fontFamily: 'var(--font-plex), DM Mono, monospace', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.16em' };

interface OpsRow {
  campId: string;
  name: string;
  dayNumber: number | null;
  totalDays: number | null;
  coach: string | null;
  staff: string[]; // "Katy (assistant)"
  meeting: string | null; // class_start_time = hora de encuentro
  depart: string | null;
  ret: string | null;
  venue: string | null;
  spaces: string[]; // "Salón 2 (Yoga) 09:00"
  students: number;
  langs: string; // "EN×3 · ES×1"
  sizes: string; // "M×2 · XL×1"
  rooms: string; // "4, Triple"
}

const hh = (t: string | null | undefined) => (t ? String(t).slice(0, 5) : null);

async function getWeekOps(academyId: string) {
  const admin = createAdminClient();
  const now = new Date(Date.now() - 6 * 3600_000); // SV
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + i);
    return iso(d);
  });
  const from = days[0], to = days[6];

  const { data: sess, error: sErr } = await admin
    .from('camp_sessions')
    .select(`id, session_date, day_number, camp_instance_id,
      camp_instances:camp_instance_id!inner(id, camp_name, scheduled_time, status, academy_id,
        head_coach:head_coach_id(display_name), head_coach_status, coaches:coach_id(display_name),
        camp_templates:template_id(template_name, service_kind),
        camp_sessions(id),
        camp_participants(id, enrollment_status, room_number, students:student_id(languages, shirt_size)))`)
    .eq('camp_instances.academy_id', academyId)
    .neq('camp_instances.status', 'cancelled')
    .gte('session_date', from)
    .lte('session_date', to)
    .order('session_date');
  if (sErr) throw sErr;

  const sessIds = (sess ?? []).map((s: any) => s.id);
  const campIds = Array.from(new Set((sess ?? []).map((s: any) => s.camp_instance_id)));

  const [plansRes, spacesRes, staffRes] = await Promise.all([
    sessIds.length
      ? admin.from('service_plans').select('camp_session_id, class_start_time, surf_venue, transport_needed, transport_depart, transport_return').in('camp_session_id', sessIds)
      : Promise.resolve({ data: [], error: null } as any),
    campIds.length
      ? admin.from('space_bookings').select('camp_instance_id, starts_at, status, academy_spaces:space_id(name)')
          .in('camp_instance_id', campIds)
          .gte('starts_at', `${from}T00:00:00-06:00`).lte('starts_at', `${to}T23:59:59-06:00`)
          .neq('status', 'cancelled')
      : Promise.resolve({ data: [], error: null } as any),
    campIds.length
      ? admin.from('service_staff').select('camp_instance_id, role, status, coaches:coach_id(display_name)').in('camp_instance_id', campIds).eq('status', 'accepted')
      : Promise.resolve({ data: [], error: null } as any),
  ]);
  if (plansRes.error) throw plansRes.error;
  if (spacesRes.error) throw spacesRes.error;
  if (staffRes.error) throw staffRes.error;

  const planByS = new Map((plansRes.data ?? []).map((p: any) => [p.camp_session_id, p]));
  const spacesByCampDay = new Map<string, string[]>();
  for (const sp of spacesRes.data ?? []) {
    const nm = (Array.isArray(sp.academy_spaces) ? sp.academy_spaces[0] : sp.academy_spaces)?.name;
    if (!nm) continue;
    const d = new Date(sp.starts_at);
    const dayKey = new Date(d.getTime() - 6 * 3600_000).toISOString().slice(0, 10);
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/El_Salvador' });
    const key = `${sp.camp_instance_id}|${dayKey}`;
    spacesByCampDay.set(key, [...(spacesByCampDay.get(key) ?? []), `${nm} ${time}`]);
  }
  const staffByCamp = new Map<string, string[]>();
  for (const st of staffRes.data ?? []) {
    const nm = (Array.isArray(st.coaches) ? st.coaches[0] : st.coaches)?.display_name;
    if (!nm) continue;
    staffByCamp.set(st.camp_instance_id, [...(staffByCamp.get(st.camp_instance_id) ?? []), st.role ? `${nm} (${st.role})` : nm]);
  }

  const tally = (vals: (string | null | undefined)[]) => {
    const m = new Map<string, number>();
    for (const v of vals) {
      const k = String(v ?? '').trim().toUpperCase();
      if (!k) continue;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m.entries()).map(([k, n]) => (n > 1 ? `${k}×${n}` : k)).join(' · ');
  };

  const byDay = new Map<string, OpsRow[]>();
  for (const s of (sess ?? []) as any[]) {
    const inst = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    const tpl = Array.isArray(inst?.camp_templates) ? inst.camp_templates[0] : inst?.camp_templates;
    const head = Array.isArray(inst?.head_coach) ? inst.head_coach[0] : inst?.head_coach;
    const co = Array.isArray(inst?.coaches) ? inst.coaches[0] : inst?.coaches;
    // Coach efectivo: head solo si ACEPTÓ (invariante #1 del proyecto).
    const coach = (head?.display_name && inst?.head_coach_status === 'accepted' ? head.display_name : null) ?? co?.display_name ?? head?.display_name ?? null;
    const parts = (inst?.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
    const plan = planByS.get(s.id) as any;
    const studs = parts.map((p: any) => (Array.isArray(p.students) ? p.students[0] : p.students));
    const langsFlat = studs.flatMap((st: any) => (Array.isArray(st?.languages) ? st.languages : st?.languages ? [st.languages] : []));
    const row: OpsRow = {
      campId: inst?.id ?? s.camp_instance_id,
      name: String(inst?.camp_name ?? tpl?.template_name ?? 'Service').replace(/ · \d{4}-\d{2}-\d{2}$/, ''),
      dayNumber: s.day_number,
      totalDays: (inst?.camp_sessions ?? []).length || null,
      coach,
      staff: staffByCamp.get(s.camp_instance_id) ?? [],
      meeting: hh(plan?.class_start_time) ?? hh(inst?.scheduled_time),
      depart: plan?.transport_needed ? hh(plan?.transport_depart) : null,
      ret: plan?.transport_needed ? hh(plan?.transport_return) : null,
      venue: plan?.surf_venue ?? null,
      spaces: spacesByCampDay.get(`${s.camp_instance_id}|${s.session_date}`) ?? [],
      students: parts.length,
      langs: tally(langsFlat),
      sizes: tally(studs.map((st: any) => st?.shirt_size)),
      rooms: Array.from(new Set(parts.map((p: any) => p.room_number).filter(Boolean))).join(', '),
    };
    byDay.set(s.session_date, [...(byDay.get(s.session_date) ?? []), row]);
  }
  for (const [k, rows] of byDay) byDay.set(k, rows.sort((a, b) => (a.meeting ?? '99').localeCompare(b.meeting ?? '99')));

  return { days, byDay, today: days[0] };
}

// La "Programación diaria" en texto para el chat de performance.
function dayText(dateISO: string, rows: OpsRow[]): string {
  const fecha = new Date(`${dateISO}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const L: string[] = [`🌊 PROGRAMACIÓN · ${fecha.toUpperCase()}`];
  for (const r of rows) {
    L.push('━━━━━━━━━━━━━━');
    L.push(`🕐 ${r.meeting ?? '—'} · ${r.name.toUpperCase()}${r.dayNumber && r.totalDays && r.totalDays > 1 ? ` (D${r.dayNumber}/${r.totalDays})` : ''}`);
    L.push(`Coach: ${r.coach ?? 'SIN COACH ⚠'}${r.staff.length ? ` · ${r.staff.join(' · ')}` : ''}`);
    if (r.depart || r.ret) L.push(`🚐 Sale ${r.depart ?? '—'} → vuelve ${r.ret ?? '—'}`);
    const linea3: string[] = [];
    if (r.venue) linea3.push(`📍 ${r.venue}`);
    linea3.push(`👥 ${r.students}${r.langs ? ` (${r.langs})` : ''}`);
    if (r.sizes) linea3.push(`Tallas: ${r.sizes}`);
    if (r.rooms) linea3.push(`Hab: ${r.rooms}`);
    L.push(linea3.join(' · '));
    for (const sp of r.spaces) L.push(`🏛 ${sp}`);
  }
  L.push('━━━━━━━━━━━━━━');
  L.push('The Surf Sequence · TSS BRAIN');
  return L.join('\n');
}

export async function WeekOpsBoard({ academyId }: { academyId: string }) {
  let data;
  try { data = await getWeekOps(academyId); } catch (e) { console.error('[week-ops] failed', e); return null; }
  const { days, byDay, today } = data;
  if (Array.from(byDay.values()).every((r) => r.length === 0)) return null;

  const fmtDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

  return (
    <div className="mb-6 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <p className="text-[10px] inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: '#0090B0' }}>
          <CalendarRange size={12} /> Week operations · logística planeada
        </p>
        <p className="text-[9px] text-gray-400">Lo que los coaches fijaron en su Vista Semana · 📋 copia el día para el chat de performance</p>
      </div>

      <div className="space-y-3 mt-2">
        {days.map((d) => {
          const rows = byDay.get(d) ?? [];
          if (rows.length === 0) return null;
          const isToday = d === today;
          const isTomorrow = days[1] === d;
          return (
            <div key={d} className="rounded-xl border overflow-hidden" style={{ borderColor: isToday ? 'rgba(0,210,255,.45)' : '#F0F2F4' }}>
              <div className="flex items-center justify-between px-3 py-2" style={{ background: isToday ? 'rgba(0,210,255,.08)' : '#FAFBFC' }}>
                <p className="text-[11px] font-extrabold uppercase" style={{ color: '#061C2B' }}>
                  {fmtDay(d)}{isToday ? ' · HOY' : isTomorrow ? ' · MAÑANA' : ''}
                  <span className="text-gray-400 font-semibold normal-case"> · {rows.length} servicio{rows.length === 1 ? '' : 's'}</span>
                </p>
                <CopyTextButton text={dayText(d, rows)} label={isTomorrow ? '📋 Copiar (chat performance)' : '📋 Copiar'} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="py-1.5 px-3 font-medium" style={F_LABEL}>Servicio</th>
                      <th className="py-1.5 pr-2 font-medium" style={F_LABEL}>Coach · staff</th>
                      <th className="py-1.5 pr-2 font-medium whitespace-nowrap" style={F_LABEL}>🕐 Encuentro</th>
                      <th className="py-1.5 pr-2 font-medium whitespace-nowrap" style={F_LABEL}>🚐 Transfer</th>
                      <th className="py-1.5 pr-2 font-medium" style={F_LABEL}>📍 Lugar</th>
                      <th className="py-1.5 pr-2 font-medium" style={F_LABEL}>🏛 Espacios</th>
                      <th className="py-1.5 pr-3 font-medium" style={F_LABEL}>👥 Alumnos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map((r, i) => (
                      <tr key={`${r.campId}-${i}`} className="align-top hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <Link href={`/camps/${r.campId}`} className="font-bold text-[var(--tss-navy)] hover:underline">
                            {r.name}{r.dayNumber && r.totalDays && r.totalDays > 1 ? ` · D${r.dayNumber}/${r.totalDays}` : ''}
                          </Link>
                        </td>
                        <td className="py-2 pr-2">
                          {r.coach ?? <span className="text-red-600 font-bold">Sin coach ⚠</span>}
                          {r.staff.length > 0 && <span className="text-gray-400"> · {r.staff.join(' · ')}</span>}
                        </td>
                        <td className="py-2 pr-2 font-extrabold whitespace-nowrap" style={{ color: '#0090B0' }}>{r.meeting ?? '—'}</td>
                        <td className="py-2 pr-2 whitespace-nowrap text-gray-600">{r.depart ? `${r.depart} → ${r.ret ?? '—'}` : '—'}</td>
                        <td className="py-2 pr-2 text-gray-600">{r.venue ?? '—'}</td>
                        <td className="py-2 pr-2 text-gray-600">{r.spaces.length ? r.spaces.join(' · ') : '—'}</td>
                        <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">
                          {r.students}{r.langs ? ` · ${r.langs}` : ''}{r.rooms ? ` · Hab ${r.rooms}` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
