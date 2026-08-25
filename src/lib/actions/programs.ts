'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { buildSeasonTimeline, type MySeasonTimeline, type SeasonTimelineWeek } from '@/lib/programs/season-timeline';
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
  duration_minutes: number | null; // la dosis, ahora dato y no prosa (00167)
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
    nutrition_clean: string | null; // si | parcial | no — "¿comiste limpio?"
    surf_hours: number | null;
    focus: number | null;
    goal_achieved: string | null;
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
    .select('id, hp_access')
    .eq('portal_token', portalToken)
    .maybeSingle();
  if (studentErr) throw studentErr;
  if (!student) return null;
  // ACCESO HP (invariante #3: el token + admin client saltea RLS, así que el
  // candado ES esta línea). Sin acceso otorgado, la línea de alto rendimiento
  // no existe para el alumno — ni siquiera se lee.
  if ((student as any).hp_access !== true) return null;

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
        .select('id, day_id, title, detail, video_url, display_order, duration_minutes')
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
      .select('water_glasses, sleep_hours, energy, comment, nutrition, nutrition_clean, surf_hours, focus, goal_achieved')
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
        duration_minutes: it.duration_minutes ?? null,
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
    nutrition_clean?: string | null; // si | parcial | no
    surf_hours?: number | null;   // horas surfeadas HOY (paridad app HP)
    focus?: number | null;        // 1-4
    goal_achieved?: string | null; // si | parcial | no
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const ctx = await resolveActiveAssignment(portalToken);
    if (!ctx) return { ok: false, error: 'No active program.' };
    const { admin, assignment, studentId } = ctx;

    const water = input.water_glasses;
    const sleep = input.sleep_hours;
    const energy = input.energy;
    const surf = input.surf_hours;
    if (water != null && (water < 0 || water > 12)) return { ok: false, error: 'Water must be 0–12 glasses.' };
    if (sleep != null && (sleep < 0 || sleep > 14)) return { ok: false, error: 'Sleep must be 0–14 hours.' };
    if (energy != null && (energy < 1 || energy > 4)) return { ok: false, error: 'Energy must be 1–4.' };
    if (surf != null && (surf < 0 || surf > 14)) return { ok: false, error: 'Surf hours must be 0–14.' };
    if (input.focus != null && (input.focus < 1 || input.focus > 4)) return { ok: false, error: 'Focus must be 1–4.' };
    if (input.goal_achieved != null && !['si', 'parcial', 'no'].includes(input.goal_achieved)) return { ok: false, error: 'Invalid goal answer.' };
    if (input.nutrition_clean != null && !['si', 'parcial', 'no'].includes(input.nutrition_clean)) return { ok: false, error: 'Invalid nutrition answer.' };

    const today = elSalvadorToday();
    const { error } = await admin.from('program_checkins').upsert(
      {
        assignment_id: assignment.id,
        checkin_date: today,
        water_glasses: water ?? null,
        sleep_hours: sleep ?? null,
        energy: energy ?? null,
        comment: (input.comment ?? '').trim().slice(0, 1000) || null,
        // nutrition (texto legacy) solo se escribe si el cliente lo MANDA:
        // el upsert con null pisaba el texto pre-deploy del mismo día y le
        // borraba sus +15 del ranking (hallazgo de la revisión).
        ...(input.nutrition !== undefined ? { nutrition: (input.nutrition ?? '').trim().slice(0, 1000) || null } : {}),
        nutrition_clean: input.nutrition_clean ?? null,
        surf_hours: surf ?? null,
        focus: input.focus ?? null,
        goal_achieved: input.goal_achieved ?? null,
      },
      { onConflict: 'assignment_id,checkin_date' }
    );
    if (error) throw error;

    // Las horas surfeadas alimentan la MISMA tubería de horas del portal y la
    // ficha (self_training_sessions → computeSurfSplit). Idempotente por día:
    // el tag en notes identifica la fila del check-in y se actualiza si el
    // atleta corrige. Best-effort — el check-in ya quedó guardado.
    // undefined = el cliente no mandó el campo (no tocar); null/0 = lo limpió.
    if (input.surf_hours !== undefined) try {
      const minutes = surf == null ? 0 : Math.round(Number(surf) * 60);
      // Se busca por checkin:%:{fecha} (no por asignación): si el atleta rotó
      // de programa el mismo día, o un doble guardado dejó dos filas, acá se
      // consolidan en una sola — y surf en null/0 la elimina (des-sincronizar
      // horas era peor que la fila extra).
      const tagToday = `checkin:%:${today}`;
      const { data: rows } = await admin
        .from('self_training_sessions').select('id')
        .eq('student_id', studentId).like('notes', tagToday)
        .order('created_at', { ascending: true });
      const ids = (rows ?? []).map((r: any) => r.id);
      if (minutes <= 0) {
        if (ids.length) await admin.from('self_training_sessions').delete().in('id', ids);
      } else if (ids.length) {
        await admin.from('self_training_sessions')
          .update({ kind: 'free_surf', duration_minutes: minutes, total_water_minutes: minutes, notes: `checkin:${assignment.id}:${today}` })
          .eq('id', ids[0]);
        if (ids.length > 1) await admin.from('self_training_sessions').delete().in('id', ids.slice(1));
      } else {
        await admin.from('self_training_sessions').insert({
          student_id: studentId,
          // kind 'free_surf': el atleta reporta SU surf del día, no una
          // intervención del coach. Sin esto caía en el default 'drill' y
          // sumaba a Training — el error exacto que la doctrina del portal
          // advierte ("training es intervención, free surf es expresión").
          kind: 'free_surf',
          drill_name: 'Surf · daily check-in',
          duration_minutes: minutes,
          total_water_minutes: minutes,
          completed: true,
          notes: `checkin:${assignment.id}:${today}`,
        });
      }
    } catch (e2) {
      console.error('[programs] checkin surf-hours bridge failed', e2);
    }
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
  location: string | null; // dónde (presencial) o link (online)
  coach_name: string;
}

export async function getMyAppointments(
  portalToken: string
): Promise<{ ok: boolean; appointments: MyAppointment[] }> {
  try {
    const admin = createAdminClient();
    const { data: student, error: sErr } = await admin
      .from('students')
      .select('id, hp_access')
      .eq('portal_token', portalToken)
      .maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: true, appointments: [] };
    // Sin acceso de Alto Rendimiento otorgado, esto no existe para el alumno.
    if ((student as any).hp_access !== true) return { ok: true, appointments: [] };

    const { data, error } = await admin
      .from('program_appointments')
      .select('id, kind, mode, title, appointment_date, appointment_time, location, coaches(display_name)')
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
        location: (a as any).location ?? null,
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
  events: { id: string; name: string; kind: string; event_date: string; end_date: string | null; notes: string | null; is_peak: boolean }[];
  // Para la vista AÑO: competencias y citas del atleta dentro de la temporada.
  competitions: { id: string; name: string; comp_date: string; location: string | null; status: string | null }[];
  appointments: { kind: string; title: string | null; appointment_date: string }[];
  contributions: { id: string; kind: string; title: string; video_url: string | null; detail: string | null; target_date: string | null; coach_name: string; specialty: string | null }[];
}

export async function getMySeason(
  portalToken: string
): Promise<{ ok: boolean; data: MySeasonData | null }> {
  try {
    const admin = createAdminClient();
    const { data: student, error: sErr } = await admin
      .from('students').select('id, hp_access').eq('portal_token', portalToken).maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: true, data: null };
    // Sin acceso de Alto Rendimiento otorgado, esto no existe para el alumno.
    if ((student as any).hp_access !== true) return { ok: true, data: null };

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

    const [ph, ev, co, cp, ap] = await Promise.all([
      admin.from('season_phases').select('id, name, objective, start_date, end_date, color_key').eq('season_id', season.id).order('start_date'),
      admin.from('season_events').select('id, name, kind, event_date, end_date, notes, is_peak').eq('season_id', season.id).order('event_date'),
      admin.from('season_contributions').select('id, kind, title, video_url, detail, target_date, coaches(display_name, hp_specialty)').eq('season_id', season.id).order('created_at', { ascending: false }).limit(12),
      admin.from('athlete_competitions').select('id, name, comp_date, location, status').eq('student_id', student.id).gte('comp_date', season.start_date).lte('comp_date', season.end_date).order('comp_date'),
      // Solo citas de HOY en adelante: con limit(40) ascendente sobre toda la
      // temporada, a mitad de año las 40 más viejas tapaban las PRÓXIMAS
      // (revisión) — y las pasadas son ruido en la vista del año.
      admin.from('program_appointments').select('kind, title, appointment_date').eq('student_id', student.id).neq('status', 'cancelled').gte('appointment_date', elSalvadorToday()).lte('appointment_date', season.end_date).order('appointment_date').limit(40),
    ]);
    if (ph.error) throw ph.error;
    if (ev.error) throw ev.error;
    if (co.error) throw co.error;
    if (cp.error) throw cp.error;
    if (ap.error) throw ap.error;

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
        competitions: cp.data ?? [],
        appointments: ap.data ?? [],
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
      .from('students').select('id, hp_access').eq('portal_token', portalToken).maybeSingle();
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
      .from('students').select('id, hp_access').eq('portal_token', portalToken).maybeSingle();
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
      .select('id, hp_access')
      .eq('portal_token', portalToken)
      .maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: true, data: null };
    // Sin acceso de Alto Rendimiento otorgado, esto no existe para el alumno.
    if ((student as any).hp_access !== true) return { ok: true, data: null };

    const [{ data: evalRows, error: eErr }, { data: profile }] = await Promise.all([
      admin
        .from('hp_deep_evaluations')
        .select('scores, eval_kind, created_at, eval_date')
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
        // OJO: created_at es cuándo se IMPORTÓ la evaluación, no cuándo se
        // hizo. A Clayton se le mostraba "Last evaluation · Aug 20" cuando su
        // coach lo evaluó el 13 de mayo. Manda eval_date; created_at solo si
        // la fila vieja no la tiene.
        eval_date: (evalRow as any)?.eval_date
          ? String((evalRow as any).eval_date).slice(0, 10)
          : (evalRow?.created_at ? String(evalRow.created_at).slice(0, 10) : null),
        eval_kind: (evalRow as any)?.eval_kind ?? null,
      },
    };
  } catch (e) {
    console.error('[programs] getMyAthleteScores failed', e);
    return { ok: false, data: null, error: 'Could not load your scores.' };
  }
}

// ─── Timeline de TEMPORADA en el portal del atleta (dale Marcelo 2026-08-23) ───
// El builder vive en src/lib/programs/season-timeline.ts (compartido con el
// portal del especialista). Acá solo el gate por token del alumno.
export async function getMySeasonTimeline(
  portalToken: string
): Promise<{ ok: boolean; data: MySeasonTimeline | null; error?: string }> {
  try {
    const admin = createAdminClient();
    const { data: student, error: sErr } = await admin
      .from('students')
      .select('id, hp_access')
      .eq('portal_token', portalToken)
      .maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: true, data: null };
    // Sin acceso de Alto Rendimiento otorgado, esto no existe para el alumno.
    if ((student as any).hp_access !== true) return { ok: true, data: null };
    const data = await buildSeasonTimeline(admin, student.id);
    return { ok: true, data };
  } catch (e) {
    console.error('[programs] getMySeasonTimeline failed', e);
    return { ok: false, data: null, error: 'Could not load the season view.' };
  }
}

// ─── EQUIPO del atleta: muro + dieta + sesiones del staff (F2/F3) ───
// El atleta también participa: lee y escribe en el muro, ve la dieta de su
// micro actual y las sesiones online que le dejan los especialistas.

// Solo la usan superficies de ALTO RENDIMIENTO (muro del equipo, extras del
// día, tareas del staff): el gate de acceso vive acá, una sola vez.
async function resolveStudentByToken(portalToken: string) {
  const admin = createAdminClient();
  const { data: student, error } = await admin
    .from('students')
    .select('id, first_name, hp_access')
    .eq('portal_token', portalToken)
    .maybeSingle();
  if (error) throw error;
  if (!student || (student as any).hp_access !== true) return null;
  return { admin, student };
}

export interface MyTeamData {
  wall: Array<{ id: string; author: string; mine: boolean; body: string; created_at: string }>;
  has_team: boolean; // temporada activa con staff → mostrar la tarjeta aunque no haya posts
}

export async function getMyTeamWall(portalToken: string): Promise<{ ok: boolean; data: MyTeamData | null }> {
  try {
    const ctx = await resolveStudentByToken(portalToken);
    if (!ctx) return { ok: true, data: null };
    const { admin, student } = ctx;
    const [{ data: posts, error: pErr }, { data: season, error: seErr }] = await Promise.all([
      admin.from('athlete_team_posts')
        .select('id, body, created_at, author_student_id, author_coach_id, coaches:author_coach_id(display_name, specialist_role)')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(30),
      admin.from('season_plans').select('id').eq('student_id', student.id).eq('active', true).limit(1).maybeSingle(),
    ]);
    if (pErr) throw pErr;
    if (seErr) throw seErr;
    if (!season && (posts ?? []).length === 0) return { ok: true, data: null };
    const ROLE_TAG: Record<string, string> = { psicologo: 'Mind', fisico: 'Physical', nutricionista: 'Nutrition' };
    return {
      ok: true,
      data: {
        has_team: !!season,
        wall: (posts ?? []).map((w: any) => {
          const c = Array.isArray(w.coaches) ? w.coaches[0] : w.coaches;
          const tag = c?.specialist_role ? ROLE_TAG[c.specialist_role] : null;
          return {
            id: w.id,
            author: w.author_student_id ? 'You' : `${c?.display_name ?? 'Coach'}${tag ? ` · ${tag}` : ''}`,
            mine: !!w.author_student_id,
            body: w.body,
            created_at: w.created_at,
          };
        }),
      },
    };
  } catch (e) {
    console.error('[programs] team wall failed', e);
    return { ok: false, data: null };
  }
}

export async function postMyTeamWall(portalToken: string, body: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const text = (body ?? '').trim();
    if (!text) return { ok: false, error: 'Write something first.' };
    if (text.length > 1000) return { ok: false, error: 'Max 1000 characters.' };
    const ctx = await resolveStudentByToken(portalToken);
    if (!ctx) return { ok: false, error: 'Invalid link.' };
    const { error } = await ctx.admin.from('athlete_team_posts').insert({
      student_id: ctx.student.id,
      author_student_id: ctx.student.id,
      body: text,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[programs] team wall post failed', e);
    return { ok: false, error: 'Could not post.' };
  }
}

export interface MyTodayExtras {
  diet_micro: string | null;   // dieta del microciclo actual
  diet_today: string | null;   // nota puntual de HOY
  tasks: Array<{ id: string; kind: string; title: string; body: string | null; video_url: string | null; due_date: string | null }>;
}

export async function getMyTodayExtras(portalToken: string): Promise<{ ok: boolean; data: MyTodayExtras | null }> {
  try {
    const ctx = await resolveActiveAssignment(portalToken);
    if (!ctx) {
      // Sin programa activo: igual mostrar tareas abiertas del staff.
      const base = await resolveStudentByToken(portalToken);
      if (!base) return { ok: true, data: null };
      const { data: tasks, error: tErr } = await base.admin
        .from('athlete_staff_tasks').select('id, kind, title, body, video_url, due_date')
        .eq('student_id', base.student.id).eq('done', false).order('created_at', { ascending: false }).limit(6);
      if (tErr) throw tErr;
      if (!(tasks ?? []).length) return { ok: true, data: null };
      return { ok: true, data: { diet_micro: null, diet_today: null, tasks: (tasks ?? []) as any } };
    }
    const { admin, studentId, assignment } = ctx;

    // Micro actual: primer día sin marcar.
    const [{ data: days, error: dErr }, { data: marks, error: mErr }] = await Promise.all([
      admin.from('program_days').select('id, week_number, day_number').eq('program_id', (assignment as any).program_id),
      admin.from('program_day_marks').select('day_id').eq('assignment_id', (assignment as any).id),
    ]);
    // Errores tragados acá = dieta del micro EQUIVOCADO o tarjeta vacía en
    // silencio (invariante #2 del proyecto).
    if (dErr) throw dErr;
    if (mErr) throw mErr;
    const done = new Set((marks ?? []).map((m: any) => m.day_id));
    const cur = (days ?? []).slice().sort((a: any, b: any) => a.week_number - b.week_number || a.day_number - b.day_number).find((d: any) => !done.has(d.id));
    const curWeek = cur?.week_number ?? null;
    const today = elSalvadorToday();

    const [dmRes, ddRes, tkRes] = await Promise.all([
      curWeek != null
        ? admin.from('athlete_diet_notes').select('body').eq('student_id', studentId).eq('scope', 'micro').eq('week_number', curWeek).order('created_at', { ascending: false }).limit(1).maybeSingle()
        : Promise.resolve({ data: null as any, error: null as any }),
      admin.from('athlete_diet_notes').select('body').eq('student_id', studentId).eq('scope', 'day').eq('note_date', today).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      admin.from('athlete_staff_tasks').select('id, kind, title, body, video_url, due_date').eq('student_id', studentId).eq('done', false).order('created_at', { ascending: false }).limit(6),
    ]);
    if (dmRes.error) throw dmRes.error;
    if (ddRes.error) throw ddRes.error;
    if (tkRes.error) throw tkRes.error;
    const dietMicro = dmRes.data, dietDay = ddRes.data, tasks = tkRes.data;

    const data: MyTodayExtras = {
      diet_micro: (dietMicro as any)?.body ?? null,
      diet_today: (dietDay as any)?.body ?? null,
      tasks: (tasks ?? []) as any,
    };
    if (!data.diet_micro && !data.diet_today && data.tasks.length === 0) return { ok: true, data: null };
    return { ok: true, data };
  } catch (e) {
    console.error('[programs] today extras failed', e);
    return { ok: false, data: null };
  }
}

export async function markMyStaffTaskDone(portalToken: string, taskId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const ctx = await resolveStudentByToken(portalToken);
    if (!ctx) return { ok: false, error: 'Invalid link.' };
    const { error } = await ctx.admin
      .from('athlete_staff_tasks')
      .update({ done: true, done_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('student_id', ctx.student.id);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[programs] task done failed', e);
    return { ok: false, error: 'Could not save.' };
  }
}
