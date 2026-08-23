'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday } from '@/lib/utils/tz';

// ─── Programas de entreno (línea Alto Rendimiento, nativa en BRAIN) ───
//
// El visor del portal del alumno. Paridad completa con la app HP: video por
// ejercicio, marca cosa por cosa, día hecho, y check-in diario configurable
// por programa (agua / sueño / energía / comentario).
//
// Seguridad: estas acciones usan createAdminClient (bypassa RLS), así que
// CADA operación valida primero que el portal_token corresponda al alumno
// dueño de la asignación. El token es la credencial, igual que en el resto
// de los portales.

export interface ProgramItemView {
  id: string;
  title: string;
  detail: string | null;
  video_url: string | null;
  marked: boolean;
}

export interface ProgramDayView {
  id: string;
  week_number: number;
  day_number: number;
  title: string;
  focus: string | null;
  items: ProgramItemView[];
  done: boolean;
  current: boolean;
  locked: boolean;
}

export interface MyProgramData {
  assignment_id: string;
  title: string;
  subtitle: string | null;
  assigned_by: string | null;
  weeks: number;
  checkin: { water: boolean; sleep: boolean; energy: boolean; comment: boolean; nutrition: boolean };
  week_labels: Record<string, string>;
  week_meta: Record<string, { type?: string | null; intensity?: string | null; objective?: string | null }>;
  days: ProgramDayView[];
  position: { week: number; day: number } | null; // null = programa completado
  days_done: number;
  days_total: number;
  today: string; // fecha SV — el visor la muestra; la del dispositivo puede mentir

  today_checkin: {
    water_glasses: number | null;
    sleep_hours: number | null;
    energy: number | null;
    comment: string | null;
    nutrition: string | null;
  } | null;
}

// Resuelve el alumno del token y su asignación activa más reciente.
// Devuelve null si el token no existe o no hay programa activo.
async function resolveActiveAssignment(portalToken: string) {
  const admin = createAdminClient();
  // supabase-js nunca lanza: los errores vienen en el campo `error`. Ignorarlo
  // confunde "falló la query" con "no tiene programa" — y eso borraba la
  // tarjeta del Home ante un parpadeo de conexión. Acá se lanza y el try/catch
  // del caller lo convierte en {ok:false} (invariante #2).
  const { data: student, error: studentErr } = await admin
    .from('students')
    .select('id')
    .eq('portal_token', portalToken)
    .maybeSingle();
  if (studentErr) throw studentErr;
  if (!student) return null;

  const { data: assignment, error: asgErr } = await admin
    .from('program_assignments')
    .select('id, program_id, assigned_by, start_date, programs!inner(id, title, subtitle, weeks, checkin_water, checkin_sleep, checkin_energy, checkin_comment, checkin_nutrition, week_labels, week_meta, active)')
    .eq('student_id', student.id)
    .eq('status', 'active')
    .eq('programs.active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (asgErr) throw asgErr;
  if (!assignment) return null;

  return { admin, studentId: student.id, assignment };
}

export async function getMyProgram(
  portalToken: string
): Promise<{ ok: boolean; data: MyProgramData | null; error?: string }> {
  try {
    const ctx = await resolveActiveAssignment(portalToken);
    if (!ctx) return { ok: true, data: null };
    const { admin, assignment } = ctx;
    const program: any = assignment.programs;

    const { data: days, error: daysErr } = await admin
      .from('program_days')
      .select('id, week_number, day_number, title, focus')
      .eq('program_id', assignment.program_id)
      .order('week_number')
      .order('day_number');
    if (daysErr) throw daysErr;
    const dayIds = (days ?? []).map((d: any) => d.id);

    let items: any[] = [];
    if (dayIds.length) {
      const { data, error } = await admin
        .from('program_items')
        .select('id, day_id, title, detail, video_url, display_order')
        .in('day_id', dayIds)
        .order('display_order');
      if (error) throw error;
      items = data ?? [];
    }

    const { data: itemMarks, error: imErr } = await admin
      .from('program_item_marks')
      .select('item_id')
      .eq('assignment_id', assignment.id);
    if (imErr) throw imErr;
    const { data: dayMarks, error: dmErr } = await admin
      .from('program_day_marks')
      .select('day_id')
      .eq('assignment_id', assignment.id);
    if (dmErr) throw dmErr;

    const markedItems = new Set((itemMarks ?? []).map((m: any) => m.item_id));
    const doneDays = new Set((dayMarks ?? []).map((m: any) => m.day_id));

    const { data: checkin, error: ckErr } = await admin
      .from('program_checkins')
      .select('water_glasses, sleep_hours, energy, comment, nutrition')
      .eq('assignment_id', assignment.id)
      .eq('checkin_date', elSalvadorToday())
      .maybeSingle();
    if (ckErr) throw ckErr;

    const itemsByDay = new Map<string, ProgramItemView[]>();
    for (const it of items ?? []) {
      const arr = itemsByDay.get(it.day_id) ?? [];
      arr.push({
        id: it.id,
        title: it.title,
        detail: it.detail,
        video_url: it.video_url,
        marked: markedItems.has(it.id),
      });
      itemsByDay.set(it.day_id, arr);
    }

    // El día actual es el PRIMER día sin marcar; todo lo posterior está locked.
    // Desbloqueo secuencial, como en la app HP — sin depender del calendario.
    let currentSeen = false;
    const dayViews: ProgramDayView[] = (days ?? []).map((d: any) => {
      const done = doneDays.has(d.id);
      const current = !done && !currentSeen;
      if (current) currentSeen = true;
      return {
        id: d.id,
        week_number: d.week_number,
        day_number: d.day_number,
        title: d.title,
        focus: d.focus,
        items: itemsByDay.get(d.id) ?? [],
        done,
        current,
        locked: !done && !current,
      };
    });

    const cur = dayViews.find((d) => d.current) ?? null;

    return {
      ok: true,
      data: {
        assignment_id: assignment.id,
        title: program.title,
        subtitle: program.subtitle,
        assigned_by: assignment.assigned_by,
        weeks: program.weeks,
        checkin: {
          water: program.checkin_water,
          sleep: program.checkin_sleep,
          energy: program.checkin_energy,
          comment: program.checkin_comment,
          nutrition: program.checkin_nutrition ?? false,
        },
        week_labels: program.week_labels ?? {},
        // PROYECCIÓN server-side: al atleta solo viajan tipo/intensidad/objetivo.
        // El resto de la matriz (fase, mesociclo, % y objetivos por pilar) es
        // planificación interna del staff y NO debe salir en el payload.
        week_meta: Object.fromEntries(
          Object.entries(((program as any).week_meta ?? {}) as Record<string, any>).map(([k, v]) => [
            k,
            {
              type: typeof v?.type === 'string' ? v.type : null,
              intensity: typeof v?.intensity === 'string' ? v.intensity : null,
              objective: typeof v?.objective === 'string' ? v.objective : null,
            },
          ])
        ),
        days: dayViews,
        position: cur ? { week: cur.week_number, day: cur.day_number } : null,
        days_done: dayViews.filter((d) => d.done).length,
        days_total: dayViews.length,
        today: elSalvadorToday(),
        today_checkin: checkin ?? null,
      },
    };
  } catch (e) {
    // El mensaje crudo de Postgres jamás llega al alumno: se loguea acá y el
    // portal muestra copy fijo en inglés.
    console.error('[programs] getMyProgram failed', e);
    return { ok: false, data: null, error: 'Could not load your program. Please try again.' };
  }
}

// Marca / desmarca un ítem. Solo se aceptan ítems del día actual o de días ya
// hechos (corregir uno viejo está bien; adelantarse a un día locked, no).
export async function markProgramItem(
  portalToken: string,
  itemId: string,
  marked: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const ctx = await resolveActiveAssignment(portalToken);
    if (!ctx) return { ok: false, error: 'No active program.' };
    const { admin, assignment } = ctx;

    // El ítem debe pertenecer al programa de ESTA asignación…
    const { data: item, error: itemErr } = await admin
      .from('program_items')
      .select('id, day_id, program_days!inner(id, program_id, week_number, day_number)')
      .eq('id', itemId)
      .maybeSingle();
    if (itemErr) throw itemErr;
    const day: any = (item as any)?.program_days;
    if (!item || day.program_id !== assignment.program_id) {
      return { ok: false, error: 'Item not in your program.' };
    }

    // …y su día no puede estar locked (todo día anterior debe estar hecho).
    const { data: prevDays, error: prevErr } = await admin
      .from('program_days')
      .select('id, week_number, day_number')
      .eq('program_id', assignment.program_id)
      .or(`week_number.lt.${day.week_number},and(week_number.eq.${day.week_number},day_number.lt.${day.day_number})`);
    if (prevErr) throw prevErr;
    const prevIds = (prevDays ?? []).map((d: any) => d.id);
    if (prevIds.length > 0) {
      const { count, error: cntErr } = await admin
        .from('program_day_marks')
        .select('id', { count: 'exact', head: true })
        .eq('assignment_id', assignment.id)
        .in('day_id', prevIds);
      if (cntErr) throw cntErr;
      if ((count ?? 0) < prevIds.length) {
        const { count: selfDone, error: selfErr } = await admin
          .from('program_day_marks')
          .select('id', { count: 'exact', head: true })
          .eq('assignment_id', assignment.id)
          .eq('day_id', day.id);
        if (selfErr) throw selfErr;
        if (!selfDone) return { ok: false, error: 'This day is still locked.' };
      }
    }

    if (marked) {
      const { error } = await admin
        .from('program_item_marks')
        .upsert(
          { assignment_id: assignment.id, item_id: itemId },
          { onConflict: 'assignment_id,item_id', ignoreDuplicates: true }
        );
      if (error) throw error;
    } else {
      const { error } = await admin
        .from('program_item_marks')
        .delete()
        .eq('assignment_id', assignment.id)
        .eq('item_id', itemId);
      if (error) throw error;
    }
    return { ok: true };
  } catch (e) {
    console.error('[programs] markProgramItem failed', e);
    return { ok: false, error: 'Could not save. Please try again.' };
  }
}

// "Mark day as done" — solo el día ACTUAL (el primero sin marcar).
export async function markProgramDayDone(
  portalToken: string,
  dayId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const ctx = await resolveActiveAssignment(portalToken);
    if (!ctx) return { ok: false, error: 'No active program.' };
    const { admin, assignment } = ctx;

    const { data: days, error: daysErr } = await admin
      .from('program_days')
      .select('id')
      .eq('program_id', assignment.program_id)
      .order('week_number')
      .order('day_number');
    if (daysErr) throw daysErr;
    const { data: dayMarks, error: dmErr } = await admin
      .from('program_day_marks')
      .select('day_id')
      .eq('assignment_id', assignment.id);
    if (dmErr) throw dmErr;
    const done = new Set((dayMarks ?? []).map((m: any) => m.day_id));
    const current = (days ?? []).find((d: any) => !done.has(d.id));
    if (!current || current.id !== dayId) {
      return { ok: false, error: 'You can only complete your current day.' };
    }

    const { error } = await admin
      .from('program_day_marks')
      .upsert(
        { assignment_id: assignment.id, day_id: dayId },
        { onConflict: 'assignment_id,day_id', ignoreDuplicates: true }
      );
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[programs] markProgramDayDone failed', e);
    return { ok: false, error: 'Could not save. Please try again.' };
  }
}

// Check-in diario: un registro por asignación por fecha de El Salvador.
export async function saveProgramCheckin(
  portalToken: string,
  input: {
    water_glasses?: number | null;
    sleep_hours?: number | null;
    energy?: number | null;
    comment?: string | null;
    nutrition?: string | null;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const ctx = await resolveActiveAssignment(portalToken);
    if (!ctx) return { ok: false, error: 'No active program.' };
    const { admin, assignment } = ctx;

    const water = input.water_glasses;
    const sleep = input.sleep_hours;
    const energy = input.energy;
    if (water != null && (water < 0 || water > 12)) return { ok: false, error: 'Water must be 0–12 glasses.' };
    if (sleep != null && (sleep < 0 || sleep > 14)) return { ok: false, error: 'Sleep must be 0–14 hours.' };
    if (energy != null && (energy < 1 || energy > 4)) return { ok: false, error: 'Energy must be 1–4.' };

    const { error } = await admin.from('program_checkins').upsert(
      {
        assignment_id: assignment.id,
        checkin_date: elSalvadorToday(),
        water_glasses: water ?? null,
        sleep_hours: sleep ?? null,
        energy: energy ?? null,
        comment: (input.comment ?? '').trim() || null,
        nutrition: (input.nutrition ?? '').trim() || null,
      },
      { onConflict: 'assignment_id,checkin_date' }
    );
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[programs] saveProgramCheckin failed', e);
    return { ok: false, error: 'Could not save your check-in. Please try again.' };
  }
}

// ─── Citas del alumno (Paso 5): las próximas, para la tarjeta del Home ───

export interface MyAppointment {
  id: string;
  kind: string;
  mode: string | null; // online | presencial
  title: string | null;
  appointment_date: string;
  appointment_time: string | null;
  coach_name: string;
}

export async function getMyAppointments(
  portalToken: string
): Promise<{ ok: boolean; appointments: MyAppointment[] }> {
  try {
    const admin = createAdminClient();
    const { data: student, error: sErr } = await admin
      .from('students')
      .select('id')
      .eq('portal_token', portalToken)
      .maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: true, appointments: [] };

    const { data, error } = await admin
      .from('program_appointments')
      .select('id, kind, mode, title, appointment_date, appointment_time, coaches(display_name)')
      .eq('student_id', student.id)
      .eq('status', 'scheduled')
      .gte('appointment_date', elSalvadorToday())
      .order('appointment_date')
      .order('appointment_time', { ascending: true, nullsFirst: true })
      .limit(3);
    if (error) throw error;

    return {
      ok: true,
      appointments: (data ?? []).map((a: any) => ({
        id: a.id,
        kind: a.kind,
        mode: a.mode ?? null,
        title: a.title,
        appointment_date: a.appointment_date,
        appointment_time: a.appointment_time,
        coach_name: a.coaches?.display_name ?? '',
      })),
    };
  } catch (e) {
    console.error('[programs] getMyAppointments failed', e);
    return { ok: false, appointments: [] };
  }
}

// ─── Season Plan del atleta (Plan Anual) ───

export interface MySeasonData {
  title: string;
  objective: string | null;
  start_date: string;
  end_date: string;
  today: string;
  days_to_peak: number | null;
  peak_name: string | null;
  phases: { id: string; name: string; objective: string | null; start_date: string; end_date: string; color_key: string; state: 'done' | 'current' | 'future' }[];
  events: { id: string; name: string; kind: string; event_date: string; is_peak: boolean }[];
  contributions: { id: string; kind: string; title: string; video_url: string | null; detail: string | null; target_date: string | null; coach_name: string; specialty: string | null }[];
}

export async function getMySeason(
  portalToken: string
): Promise<{ ok: boolean; data: MySeasonData | null }> {
  try {
    const admin = createAdminClient();
    const { data: student, error: sErr } = await admin
      .from('students').select('id').eq('portal_token', portalToken).maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: true, data: null };

    const { data: season, error: snErr } = await admin
      .from('season_plans')
      .select('id, title, objective, start_date, end_date')
      .eq('student_id', student.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (snErr) throw snErr;
    if (!season) return { ok: true, data: null };

    const [ph, ev, co] = await Promise.all([
      admin.from('season_phases').select('id, name, objective, start_date, end_date, color_key').eq('season_id', season.id).order('start_date'),
      admin.from('season_events').select('id, name, kind, event_date, is_peak').eq('season_id', season.id).order('event_date'),
      admin.from('season_contributions').select('id, kind, title, video_url, detail, target_date, coaches(display_name, hp_specialty)').eq('season_id', season.id).order('created_at', { ascending: false }).limit(12),
    ]);
    if (ph.error) throw ph.error;
    if (ev.error) throw ev.error;
    if (co.error) throw co.error;

    const today = elSalvadorToday();
    const peak = (ev.data ?? []).find((e: any) => e.is_peak) ?? null;
    const daysToPeak = peak && peak.event_date >= today
      ? Math.round((Date.parse(peak.event_date) - Date.parse(today)) / 86400000)
      : null;

    return {
      ok: true,
      data: {
        title: season.title,
        objective: season.objective,
        start_date: season.start_date,
        end_date: season.end_date,
        today,
        days_to_peak: daysToPeak,
        peak_name: peak?.name ?? null,
        phases: (ph.data ?? []).map((f: any) => ({
          ...f,
          state: f.end_date < today ? 'done' : f.start_date > today ? 'future' : 'current',
        })),
        events: ev.data ?? [],
        contributions: (co.data ?? []).map((c: any) => ({
          id: c.id, kind: c.kind, title: c.title, video_url: c.video_url,
          detail: c.detail, target_date: c.target_date,
          coach_name: c.coaches?.display_name ?? '', specialty: c.coaches?.hp_specialty ?? null,
        })),
      },
    };
  } catch (e) {
    console.error('[programs] getMySeason failed', e);
    return { ok: false, data: null };
  }
}

// ─── Mensajes del coach (buzón simple del cockpit HP) ───

export interface MyMessage {
  id: string;
  subject: string | null;
  body: string;
  coach_name: string | null;
  read: boolean;
  created_at: string;
}

export async function getMyMessages(
  portalToken: string
): Promise<{ ok: boolean; messages: MyMessage[] }> {
  try {
    const admin = createAdminClient();
    const { data: student, error: sErr } = await admin
      .from('students').select('id').eq('portal_token', portalToken).maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: true, messages: [] };
    const { data, error } = await admin
      .from('hp_messages')
      .select('id, subject, body, read_at, created_at, coaches(display_name)')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return {
      ok: true,
      messages: (data ?? []).map((m: any) => ({
        id: m.id,
        subject: m.subject,
        body: m.body,
        coach_name: m.coaches?.display_name ?? null,
        read: !!m.read_at,
        created_at: m.created_at,
      })),
    };
  } catch (e) {
    console.error('[programs] getMyMessages failed', e);
    return { ok: false, messages: [] };
  }
}

export async function markMyMessagesRead(portalToken: string): Promise<{ ok: boolean }> {
  try {
    const admin = createAdminClient();
    const { data: student, error: sErr } = await admin
      .from('students').select('id').eq('portal_token', portalToken).maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: true };
    // Solo SUS mensajes — el token es la seguridad (invariante #3).
    const { error } = await admin
      .from('hp_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('student_id', student.id)
      .is('read_at', null);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[programs] markMyMessagesRead failed', e);
    return { ok: false };
  }
}

// ─── Score del atleta en SU portal (pedido Marcelo 2026-08-23) ───
// Igual que el "SCORE POR PILAR" del app HP viejo: promedios por pilar de su
// última evaluación profunda + capacidad de score de su ficha técnica.
// Devuelve data:null si el alumno no tiene evaluaciones (no-HP → no se
// renderiza nada, mismo patrón que el programa).
export interface MyAthleteScores {
  pillars: { fis: number | null; tec: number | null; tac: number | null; men: number | null };
  global: number | null;
  score_capacity: number | null;
  eval_date: string | null;
  eval_kind: string | null;
}

export async function getMyAthleteScores(
  portalToken: string
): Promise<{ ok: boolean; data: MyAthleteScores | null; error?: string }> {
  try {
    const admin = createAdminClient();
    const { data: student, error: sErr } = await admin
      .from('students')
      .select('id')
      .eq('portal_token', portalToken)
      .maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: true, data: null };

    const [{ data: evalRows, error: eErr }, { data: profile }] = await Promise.all([
      admin
        .from('hp_deep_evaluations')
        .select('scores, eval_kind, created_at')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(6),
      admin
        .from('hp_athlete_profiles')
        .select('score_capacity')
        .eq('student_id', student.id)
        .maybeSingle(),
    ]);
    if (eErr) throw eErr;
    if ((!evalRows || evalRows.length === 0) && !profile?.score_capacity) return { ok: true, data: null };

    const avgOf = (scores: Record<string, number>, prefix: string): number | null => {
      const vals = Object.entries(scores ?? {})
        .filter(([k, v]) => k.startsWith(prefix) && Number.isFinite(Number(v)))
        .map(([, v]) => Number(v));
      return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
    };
    // La más reciente CON scores: hay evaluaciones formales (acta) con scores
    // vacío que comparten timestamp con la real — un limit(1) ciego mostraba
    // todo en "—".
    const evalRow = (evalRows ?? []).find((r: any) =>
      ['fis_', 'tec_', 'tac_', 'men_'].some((p) => avgOf(r.scores as any, p) != null)
    ) ?? (evalRows ?? [])[0] ?? null;
    const scores = (evalRow?.scores ?? {}) as Record<string, number>;
    const avg = (prefix: string) => avgOf(scores, prefix);
    const pillars = { fis: avg('fis_'), tec: avg('tec_'), tac: avg('tac_'), men: avg('men_') };
    const withVal = Object.values(pillars).filter((v): v is number => v != null);
    return {
      ok: true,
      data: {
        pillars,
        global: withVal.length ? Math.round((withVal.reduce((a, b) => a + b, 0) / withVal.length) * 10) / 10 : null,
        score_capacity: (profile as any)?.score_capacity != null ? Number((profile as any).score_capacity) : null,
        eval_date: evalRow?.created_at ? String(evalRow.created_at).slice(0, 10) : null,
        eval_kind: (evalRow as any)?.eval_kind ?? null,
      },
    };
  } catch (e) {
    console.error('[programs] getMyAthleteScores failed', e);
    return { ok: false, data: null, error: 'Could not load your scores.' };
  }
}

// ─── Timeline de TEMPORADA en el portal del atleta (dale Marcelo 2026-08-23) ───
// La tercera vista del programa: una fila por microciclo con fechas reales,
// tipo/intensidad/objetivo (la matriz de periodización) y los eventos del
// atleta superpuestos (🏆 competencias · 📅 citas · 📋 evaluaciones), más la
// banda del Plan Anual y "lo que viene" después del programa.
export interface SeasonTimelineWeek {
  week: number;
  label: string | null;
  type: string | null;
  intensity: string | null;
  objective: string | null;
  start: string; // YYYY-MM-DD (SV)
  end: string;
  days_total: number;
  days_done: number;
  current: boolean;
  events: Array<{ icon: string; label: string; date: string }>;
}

export interface MySeasonTimeline {
  season: { title: string; objective: string | null; start: string; end: string } | null;
  program_title: string;
  weeks: SeasonTimelineWeek[];
  /** Eventos DESPUÉS del programa (dentro de la temporada o próximos 6 meses). */
  ahead: Array<{ icon: string; label: string; date: string }>;
}

export async function getMySeasonTimeline(
  portalToken: string
): Promise<{ ok: boolean; data: MySeasonTimeline | null; error?: string }> {
  try {
    const ctx = await resolveActiveAssignment(portalToken);
    if (!ctx) return { ok: true, data: null };
    const { admin, studentId, assignment } = ctx;
    const program: any = (assignment as any).programs;

    const [{ data: days, error: dErr }, { data: marks, error: mErr }, { data: season }, { data: comps }, { data: appts }, { data: evals }] = await Promise.all([
      admin.from('program_days').select('id, week_number, day_number').eq('program_id', (assignment as any).program_id),
      admin.from('program_day_marks').select('day_id').eq('assignment_id', (assignment as any).id),
      admin.from('season_plans').select('title, objective, start_date, end_date').eq('student_id', studentId).eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      admin.from('athlete_competitions').select('name, comp_date, location, status').eq('student_id', studentId).order('comp_date'),
      admin.from('program_appointments').select('kind, title, appointment_date, appointment_time, status').eq('student_id', studentId).neq('status', 'cancelled').order('appointment_date'),
      admin.from('hp_deep_evaluations').select('eval_kind, created_at').eq('student_id', studentId).order('created_at'),
    ]);
    if (dErr) throw dErr;
    if (mErr) throw mErr;

    const doneIds = new Set((marks ?? []).map((m: any) => m.day_id));
    const weekNums = Array.from(new Set((days ?? []).map((d: any) => d.week_number))).sort((a, b) => a - b);

    // Fechas reales de cada micro: start_date de la asignación + (N-1)*7.
    const startMs = Date.parse(`${(assignment as any).start_date}T00:00:00Z`);
    const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
    const today = elSalvadorToday();

    // Posición actual: primer día NO hecho (misma noción que getMyProgram).
    const orderedDays = (days ?? []).slice().sort((a: any, b: any) => a.week_number - b.week_number || a.day_number - b.day_number);
    const cur = orderedDays.find((d: any) => !doneIds.has(d.id)) ?? null;

    const KIND_ICON: Record<string, string> = { evaluacion: '📋', fisico: '💪', mental: '🧠', tecnico: '🎯', nutricion: '🥗', otro: '📅' };
    const KIND_EN: Record<string, string> = { evaluacion: 'Evaluation', fisico: 'Physio', mental: 'Mental', tecnico: 'Technique', nutricion: 'Nutrition', otro: 'Appointment' };

    type Ev = { icon: string; label: string; date: string };
    const allEvents: Ev[] = [
      ...((comps ?? []).map((c: any) => ({
        icon: '🏆',
        label: c.name + (c.location ? ` · ${c.location}` : ''),
        date: String(c.comp_date ?? '').slice(0, 10),
      }))),
      ...((appts ?? []).map((a: any) => ({
        icon: KIND_ICON[a.kind] ?? '📅',
        label: (a.title || KIND_EN[a.kind] || 'Appointment') + (a.appointment_time ? ` · ${a.appointment_time}` : ''),
        date: String(a.appointment_date ?? '').slice(0, 10),
      }))),
      ...((evals ?? []).map((e: any) => ({
        icon: '✅',
        label: e.eval_kind === 'competencia' ? 'Evaluation done (post-comp)' : 'Evaluation done',
        date: String(e.created_at ?? '').slice(0, 10),
      }))),
    ].filter((e) => e.date);

    const weeks: SeasonTimelineWeek[] = weekNums.map((w) => {
      const wStart = iso(startMs + (w - 1) * 7 * 86400000);
      const wEnd = iso(startMs + ((w - 1) * 7 + 6) * 86400000);
      const wDays = (days ?? []).filter((d: any) => d.week_number === w);
      return {
        week: w,
        label: program?.week_labels?.[String(w)] ?? null,
        type: program?.week_meta?.[String(w)]?.type ?? null,
        intensity: program?.week_meta?.[String(w)]?.intensity ?? null,
        objective: program?.week_meta?.[String(w)]?.objective ?? null,
        start: wStart,
        end: wEnd,
        days_total: wDays.length,
        days_done: wDays.filter((d: any) => doneIds.has(d.id)).length,
        current: cur ? cur.week_number === w : false,
        events: allEvents.filter((e) => e.date >= wStart && e.date <= wEnd),
      };
    });

    // Lo que viene DESPUÉS del programa: hasta el fin de temporada (o 6 meses).
    const programEnd = weeks.length ? weeks[weeks.length - 1].end : today;
    const horizon = (season as any)?.end_date ?? iso(Date.parse(`${today}T00:00:00Z`) + 183 * 86400000);
    const ahead = allEvents
      .filter((e) => e.date > programEnd && e.date <= horizon)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);

    return {
      ok: true,
      data: {
        season: season
          ? { title: (season as any).title, objective: (season as any).objective ?? null, start: (season as any).start_date, end: (season as any).end_date }
          : null,
        program_title: program?.title ?? 'Training program',
        weeks,
        ahead,
      },
    };
  } catch (e) {
    console.error('[programs] getMySeasonTimeline failed', e);
    return { ok: false, data: null, error: 'Could not load the season view.' };
  }
}
