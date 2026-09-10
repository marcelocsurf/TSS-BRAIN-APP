// ═══ PROGRAMACIÓN DIARIA (qué · dónde · cuándo) ═══
// Fuente única para el coordinador (Week Operations en el dashboard) y el
// front desk (Kat, 2026-09-10: "poder descargar cómo van los camps y
// servicios del siguiente día para enviar por WhatsApp, como el coordinador").
import { createAdminClient } from '@/lib/supabase/admin';

export interface OpsRow {
  campId: string;
  name: string;
  dayNumber: number | null;
  totalDays: number | null;
  coach: string | null;
  /** 'pending' = asignado pero todavía no aceptó · 'rejected' = rechazó. */
  coachNote: 'pending' | 'rejected' | null;
  staff: string[]; // "Katy (assistant)"
  meeting: string | null; // class_start_time = hora de encuentro
  depart: string | null;
  ret: string | null;
  // ok = con horarios · pending_times = pedida sin horario (⚠) ·
  // cancelled = el front desk la canceló (transport_needed queda true) · none
  vanState: 'ok' | 'pending_times' | 'cancelled' | 'none';
  venue: string | null;
  spaces: string[]; // "Salón 2 (Yoga) 09:00"
  students: number;
  langs: string; // "EN×3 · ES×1"
  sizes: string; // "M×2 · XL×1"
  rooms: string; // "4, Triple"
}

const hh = (t: string | null | undefined) => (t ? String(t).slice(0, 5) : null);

/** Los días de hoy (El Salvador) en adelante, en ISO. */
export function upcomingDays(n: number, offset = 0): string[] {
  const now = new Date(Date.now() - 6 * 3600_000); // SV
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + offset + i);
    return iso(d);
  });
}

/** La logística por día entre dos fechas (inclusive): lo que ve el
 *  coordinador en Week Operations y lo que el front desk copia para WhatsApp. */
export async function getOpsByDay(academyId: string, from: string, to: string): Promise<Map<string, OpsRow[]>> {
  const admin = createAdminClient();

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
      ? admin.from('service_plans').select('camp_session_id, class_start_time, surf_venue, transport_needed, transport_depart, transport_return, transport_status').in('camp_session_id', sessIds)
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
  // languages es TEXT libre y el intake sugiere "English, Spanish" — sin el
  // split, ese alumno contaba como el idioma "ENGLISH, SPANISH" (revisión).
  const LANG_SHORT: Record<string, string> = { ENGLISH: 'EN', INGLES: 'EN', 'INGLÉS': 'EN', SPANISH: 'ES', 'ESPAÑOL': 'ES', ESPANOL: 'ES', PORTUGUESE: 'PT', 'PORTUGUÊS': 'PT', PORTUGUES: 'PT', FRENCH: 'FR', 'FRANCÉS': 'FR', FRANCES: 'FR', GERMAN: 'DE', 'ALEMÁN': 'DE', ALEMAN: 'DE' };
  const splitLangs = (v: unknown): string[] =>
    String(v ?? '').split(/[,/;·]+/).map((x) => {
      const k = x.trim().toUpperCase();
      return k ? (LANG_SHORT[k] ?? k) : '';
    }).filter(Boolean);

  const byDay = new Map<string, OpsRow[]>();
  for (const s of (sess ?? []) as any[]) {
    const inst = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    const tpl = Array.isArray(inst?.camp_templates) ? inst.camp_templates[0] : inst?.camp_templates;
    const head = Array.isArray(inst?.head_coach) ? inst.head_coach[0] : inst?.head_coach;
    const co = Array.isArray(inst?.coaches) ? inst.coaches[0] : inst?.coaches;
    // Quién aparece como coach del servicio.
    //
    // El head coach ES la asignación real; coach_id es el campo de creación y
    // muchas veces queda el coordinador que armó el calendario. Antes se
    // nombraba al head SOLO si había aceptado, y si no se caía a coach_id: con
    // 33 servicios con head pendiente eso producía dos errores en el mensaje
    // que se manda a los chats — decía "SIN COACH" en servicios que sí tenían
    // coach asignado, y en Discover Surfing nombraba al coordinador en vez de
    // a la coach asignada. El tablero de servicios ya mostraba al head sin
    // mirar el estado, así que las dos pantallas se contradecían.
    //
    // Ahora se nombra al head siempre, marcando si todavía no confirmó. El
    // aviso que coordinación necesita no se pierde: cambia de "SIN COACH ⚠" a
    // "sin confirmar ⚠", que es lo que de verdad está pasando.
    //
    // Esto NO toca el invariante #1: el coach efectivo para permisos y
    // acciones sigue exigiendo 'accepted' donde corresponde. Acá solo se
    // decide un texto de coordinación.
    const hcStatus = inst?.head_coach_status ?? null;
    const headName = head?.display_name ?? null;
    const rejected = hcStatus === 'rejected';
    const coach = rejected ? null : (headName ?? co?.display_name ?? null);
    const coachNote: 'pending' | 'rejected' | null = rejected
      ? 'rejected'
      : headName && hcStatus === 'pending'
        ? 'pending'
        : null;
    const parts = (inst?.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
    const plan = planByS.get(s.id) as any;
    const studs = parts.map((p: any) => (Array.isArray(p.students) ? p.students[0] : p.students));
    const langsFlat = studs.flatMap((st: any) =>
      Array.isArray(st?.languages) ? st.languages.flatMap(splitLangs) : splitLangs(st?.languages));
    const row: OpsRow = {
      campId: inst?.id ?? s.camp_instance_id,
      name: String(inst?.camp_name ?? tpl?.template_name ?? 'Service').replace(/ · \d{4}-\d{2}-\d{2}$/, ''),
      dayNumber: s.day_number,
      totalDays: (inst?.camp_sessions ?? []).length || null,
      coach,
      coachNote,
      staff: staffByCamp.get(s.camp_instance_id) ?? [],
      meeting: hh(plan?.class_start_time) ?? hh(inst?.scheduled_time),
      depart: plan?.transport_needed ? hh(plan?.transport_depart) : null,
      ret: plan?.transport_needed ? hh(plan?.transport_return) : null,
      vanState: !plan?.transport_needed
        ? 'none'
        : plan?.transport_status === 'cancelled'
          ? 'cancelled'
          : plan?.transport_depart
            ? 'ok'
            : 'pending_times',
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

  return byDay;
}

// La "Programación diaria" en texto para el chat de performance.
export function dayProgramText(dateISO: string, rows: OpsRow[]): string {
  const fecha = new Date(`${dateISO}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const L: string[] = [`🌊 PROGRAMACIÓN · ${fecha.toUpperCase()}`];
  for (const r of rows) {
    L.push('━━━━━━━━━━━━━━');
    L.push(`🕐 ${r.meeting ?? '—'} · ${r.name.toUpperCase()}${r.dayNumber && r.totalDays && r.totalDays > 1 ? ` (D${r.dayNumber}/${r.totalDays})` : ''}`);
    const coachTxt = r.coachNote === 'rejected'
      ? 'SIN COACH ⚠ · el head coach rechazó — reasignar'
      : !r.coach
        ? 'SIN COACH ⚠'
        : r.coachNote === 'pending'
          ? `${r.coach} · sin confirmar ⚠`
          : r.coach;
    L.push(`Coach: ${coachTxt}${r.staff.length ? ` · ${r.staff.join(' · ')}` : ''}`);
    if (r.vanState === 'ok') L.push(`🚐 Sale ${r.depart} → vuelve ${r.ret ?? '—'}`);
    else if (r.vanState === 'pending_times') L.push('🚐 Pedida · SIN HORARIO ⚠');
    else if (r.vanState === 'cancelled') L.push('🚐 Cancelada ✕');
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

