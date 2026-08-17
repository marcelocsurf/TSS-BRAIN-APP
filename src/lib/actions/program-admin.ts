'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { elSalvadorToday, elSalvadorDatePlus, toElSalvadorDate } from '@/lib/utils/tz';

// ─── Administración de programas de entreno (Paso 3: el editor) ───
//
// Solo el admin de plataforma (Marcelo). El Escalón 2 del coach —el editor
// recortado a su equipo— llega en el Paso 4; hasta entonces esta superficie
// vive detrás del candado de admin, como acordamos.
//
// Mismo contrato que el resto: retornar estados, nunca lanzar hacia afuera;
// mensajes de cara al staff en español; el error real a console.error.

async function assertAdmin(): Promise<boolean> {
  // SOLO admin de PLATAFORMA (is_platform_admin). El rol 'admin' de coaches
  // es un rol DE ACADEMIA (front-desk y host lo consultan escopado por
  // academy_id): dejarlo entrar acá le daría a un admin de una academia
  // licenciada la búsqueda de alumnos de TODAS las academias y el borrado en
  // cascada de marcas ajenas. El coach llega en el Paso 4 con su ámbito
  // recortado (Escalón 2), no con esta llave maestra.
  return isRealPlatformAdmin().catch(() => false);
}

const DENY = { ok: false as const, error: 'Solo el administrador puede gestionar programas.' };

export interface AdminProgramRow {
  id: string;
  title: string;
  subtitle: string | null;
  kind: string;
  weeks: number;
  active: boolean;
  for_sale: boolean;
  active_assignments: number;
  days_count: number;
}

export async function adminListPrograms(): Promise<{ ok: boolean; error?: string; programs: AdminProgramRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, programs: [] };
    const admin = createAdminClient();

    const { data: programs, error } = await admin
      .from('programs')
      .select('id, title, subtitle, kind, weeks, active, for_sale')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const { data: asg, error: aErr } = await admin
      .from('program_assignments')
      .select('program_id')
      .eq('status', 'active');
    if (aErr) throw aErr;
    const { data: days, error: dErr } = await admin.from('program_days').select('program_id');
    if (dErr) throw dErr;

    const asgCount = new Map<string, number>();
    for (const a of asg ?? []) asgCount.set(a.program_id, (asgCount.get(a.program_id) ?? 0) + 1);
    const dayCount = new Map<string, number>();
    for (const d of days ?? []) dayCount.set(d.program_id, (dayCount.get(d.program_id) ?? 0) + 1);

    return {
      ok: true,
      programs: (programs ?? []).map((p: any) => ({
        ...p,
        active_assignments: asgCount.get(p.id) ?? 0,
        days_count: dayCount.get(p.id) ?? 0,
      })),
    };
  } catch (e) {
    console.error('[program-admin] adminListPrograms failed', e);
    return { ok: false, error: 'No se pudo cargar el catálogo.', programs: [] };
  }
}

export interface AdminProgramDetail {
  id: string;
  title: string;
  subtitle: string | null;
  kind: string;
  weeks: number;
  active: boolean;
  for_sale: boolean;
  checkin_water: boolean;
  checkin_sleep: boolean;
  checkin_energy: boolean;
  checkin_comment: boolean;
  active_assignments: number;
  days: {
    id: string;
    week_number: number;
    day_number: number;
    title: string;
    focus: string | null;
    items: { id: string; title: string; detail: string | null; video_url: string | null; display_order: number }[];
  }[];
}

export async function adminGetProgram(
  programId: string
): Promise<{ ok: boolean; error?: string; program: AdminProgramDetail | null }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, program: null };
    const admin = createAdminClient();

    const { data: p, error } = await admin
      .from('programs')
      .select('id, title, subtitle, kind, weeks, active, for_sale, checkin_water, checkin_sleep, checkin_energy, checkin_comment')
      .eq('id', programId)
      .maybeSingle();
    if (error) throw error;
    if (!p) return { ok: false, error: 'Programa no encontrado.', program: null };

    const { data: days, error: dErr } = await admin
      .from('program_days')
      .select('id, week_number, day_number, title, focus')
      .eq('program_id', programId)
      .order('week_number')
      .order('day_number');
    if (dErr) throw dErr;

    const dayIds = (days ?? []).map((d: any) => d.id);
    let items: any[] = [];
    if (dayIds.length) {
      const { data, error: iErr } = await admin
        .from('program_items')
        .select('id, day_id, title, detail, video_url, display_order')
        .in('day_id', dayIds)
        .order('display_order');
      if (iErr) throw iErr;
      items = data ?? [];
    }

    const { count, error: cErr } = await admin
      .from('program_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', programId)
      .eq('status', 'active');
    if (cErr) throw cErr;

    const byDay = new Map<string, any[]>();
    for (const it of items) {
      const arr = byDay.get(it.day_id) ?? [];
      arr.push(it);
      byDay.set(it.day_id, arr);
    }

    return {
      ok: true,
      program: {
        ...(p as any),
        active_assignments: count ?? 0,
        days: (days ?? []).map((d: any) => ({ ...d, items: byDay.get(d.id) ?? [] })),
      },
    };
  } catch (e) {
    console.error('[program-admin] adminGetProgram failed', e);
    return { ok: false, error: 'No se pudo cargar el programa.', program: null };
  }
}

export async function adminCreateProgram(input: {
  title: string;
  kind: 'custom' | 'template';
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const title = input.title.trim();
    if (!title) return { ok: false, error: 'El programa necesita un nombre.' };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('programs')
      .insert({ title, kind: input.kind, weeks: 4 })
      .select('id')
      .single();
    if (error) throw error;
    return { ok: true, id: data.id };
  } catch (e) {
    console.error('[program-admin] adminCreateProgram failed', e);
    return { ok: false, error: 'No se pudo crear el programa.' };
  }
}

export async function adminUpdateProgram(
  programId: string,
  patch: {
    title?: string;
    subtitle?: string | null;
    kind?: 'custom' | 'template';
    weeks?: number;
    for_sale?: boolean;
    checkin_water?: boolean;
    checkin_sleep?: boolean;
    checkin_energy?: boolean;
    checkin_comment?: boolean;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (patch.title !== undefined && !patch.title.trim()) {
      return { ok: false, error: 'El programa necesita un nombre.' };
    }
    if (patch.weeks !== undefined && (patch.weeks < 1 || patch.weeks > 24)) {
      return { ok: false, error: 'Las semanas van de 1 a 24.' };
    }
    const admin = createAdminClient();
    // Reducir las semanas por debajo de días ya cargados los dejaría huérfanos:
    // invisibles en el editor pero 100% vivos para el alumno (el visor lista
    // TODOS los días del programa). Se bloquea en vez de divergir en silencio.
    if (patch.weeks !== undefined) {
      const { data: maxDay, error: mErr } = await admin
        .from('program_days')
        .select('week_number')
        .eq('program_id', programId)
        .order('week_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (mErr) throw mErr;
      if (maxDay && patch.weeks < maxDay.week_number) {
        return {
          ok: false,
          error: `Hay días cargados hasta la semana ${maxDay.week_number} — borralos primero o dejá al menos ${maxDay.week_number} semanas.`,
        };
      }
    }
    const { error } = await admin
      .from('programs')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', programId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminUpdateProgram failed', e);
    return { ok: false, error: 'No se pudo guardar.' };
  }
}

// Desactivar con alumnos activos les quitaría la tarjeta del portal de golpe:
// se bloquea con un mensaje claro en vez de permitir el accidente.
export async function adminSetProgramActive(
  programId: string,
  active: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    if (!active) {
      const { count, error: cErr } = await admin
        .from('program_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('program_id', programId)
        .eq('status', 'active');
      if (cErr) throw cErr;
      if ((count ?? 0) > 0) {
        return {
          ok: false,
          error: `Este programa tiene ${count} alumno${count === 1 ? '' : 's'} activo${count === 1 ? '' : 's'} — cancelá esas asignaciones primero.`,
        };
      }
    }
    const { error } = await admin.from('programs').update({ active }).eq('id', programId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminSetProgramActive failed', e);
    return { ok: false, error: 'No se pudo guardar.' };
  }
}

export async function adminDuplicateProgram(
  programId: string
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();

    const detail = await adminGetProgram(programId);
    if (!detail.ok || !detail.program) return { ok: false, error: detail.error || 'Programa no encontrado.' };
    const src = detail.program;

    const { data: created, error } = await admin
      .from('programs')
      .insert({
        title: `${src.title} (copia)`,
        subtitle: src.subtitle,
        kind: src.kind,
        weeks: src.weeks,
        for_sale: false,
        active: false, // nace inactivo: una copia a medio salir no debe aparecer en el selector de asignar
        checkin_water: src.checkin_water,
        checkin_sleep: src.checkin_sleep,
        checkin_energy: src.checkin_energy,
        checkin_comment: src.checkin_comment,
      })
      .select('id')
      .single();
    if (error) throw error;

    try {
      for (const d of src.days) {
        const { data: newDay, error: dErr } = await admin
          .from('program_days')
          .insert({
            program_id: created.id,
            week_number: d.week_number,
            day_number: d.day_number,
            title: d.title,
            focus: d.focus,
          })
          .select('id')
          .single();
        if (dErr) throw dErr;
        if (d.items.length) {
          const { error: iErr } = await admin.from('program_items').insert(
            d.items.map((it) => ({
              day_id: newDay.id,
              title: it.title,
              detail: it.detail,
              video_url: it.video_url,
              display_order: it.display_order,
            }))
          );
          if (iErr) throw iErr;
        }
      }
    } catch (loopErr) {
      // Sin transacción, un fallo a mitad dejaría una copia parcial en el
      // catálogo. Se limpia (el cascade borra días e ítems) y recién ahí se
      // reporta el error.
      await admin.from('programs').delete().eq('id', created.id);
      throw loopErr;
    }

    // Copia completa → recién ahora se activa.
    const { error: actErr } = await admin.from('programs').update({ active: true }).eq('id', created.id);
    if (actErr) throw actErr;
    return { ok: true, id: created.id };
  } catch (e) {
    console.error('[program-admin] adminDuplicateProgram failed', e);
    return { ok: false, error: 'No se pudo duplicar el programa.' };
  }
}

export async function adminSaveDay(
  programId: string,
  day: { id?: string; week_number: number; day_number: number; title: string; focus?: string | null }
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (!day.title.trim()) return { ok: false, error: 'El día necesita un título.' };
    if (day.week_number < 1 || day.day_number < 1) {
      return { ok: false, error: 'Semana y día deben ser 1 o más.' };
    }
    const admin = createAdminClient();

    // La semana debe existir en el programa — sin esto, un editor con estado
    // viejo podía seguir insertando días en una semana ya recortada.
    const { data: prog, error: pErr } = await admin
      .from('programs')
      .select('weeks')
      .eq('id', programId)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!prog) return { ok: false, error: 'Programa no encontrado.' };
    if (day.week_number > prog.weeks) {
      return { ok: false, error: `El programa tiene ${prog.weeks} semana${prog.weeks === 1 ? '' : 's'} — no se puede cargar un día en la semana ${day.week_number}.` };
    }

    if (day.id) {
      const { error } = await admin
        .from('program_days')
        .update({ week_number: day.week_number, day_number: day.day_number, title: day.title.trim(), focus: day.focus?.trim() || null })
        .eq('id', day.id)
        .eq('program_id', programId);
      if (error) {
        if ((error as any).code === '23505') return { ok: false, error: `Ya existe el día ${day.day_number} en la semana ${day.week_number}.` };
        throw error;
      }
      return { ok: true, id: day.id };
    }
    const { data, error } = await admin
      .from('program_days')
      .insert({ program_id: programId, week_number: day.week_number, day_number: day.day_number, title: day.title.trim(), focus: day.focus?.trim() || null })
      .select('id')
      .single();
    if (error) {
      if ((error as any).code === '23505') return { ok: false, error: `Ya existe el día ${day.day_number} en la semana ${day.week_number}.` };
      throw error;
    }

    // BACKFILL anti-rebobinado: la posición del alumno es "el primer día sin
    // marcar", así que insertar un día ANTES de donde alguien va lo mandaría
    // de vuelta y le bloquearía todo lo que sigue. A quien ya pasó este punto
    // se le marca el día nuevo automáticamente; el día nuevo aplica solo a
    // quienes todavía no llegaron.
    const { data: activeAsg, error: aErr } = await admin
      .from('program_assignments')
      .select('id')
      .eq('program_id', programId)
      .eq('status', 'active');
    if (aErr) throw aErr;
    const activeIds = (activeAsg ?? []).map((a: any) => a.id);
    if (activeIds.length > 0) {
      const { data: allDays, error: adErr } = await admin
        .from('program_days')
        .select('id, week_number, day_number')
        .eq('program_id', programId);
      if (adErr) throw adErr;
      const laterIds = (allDays ?? [])
        .filter((d: any) =>
          d.week_number > day.week_number ||
          (d.week_number === day.week_number && d.day_number > day.day_number)
        )
        .map((d: any) => d.id);
      if (laterIds.length > 0) {
        const { data: passed, error: pmErr } = await admin
          .from('program_day_marks')
          .select('assignment_id')
          .in('assignment_id', activeIds)
          .in('day_id', laterIds);
        if (pmErr) throw pmErr;
        const passedIds = Array.from(new Set((passed ?? []).map((m: any) => m.assignment_id)));
        if (passedIds.length > 0) {
          const { error: bfErr } = await admin.from('program_day_marks').upsert(
            passedIds.map((assignmentId) => ({ assignment_id: assignmentId, day_id: data.id })),
            { onConflict: 'assignment_id,day_id', ignoreDuplicates: true }
          );
          if (bfErr) throw bfErr;
        }
      }
    }
    return { ok: true, id: data.id };
  } catch (e) {
    console.error('[program-admin] adminSaveDay failed', e);
    return { ok: false, error: 'No se pudo guardar el día.' };
  }
}

export async function adminDeleteDay(dayId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();

    // Guardarraíl: borrar el ÚLTIMO día de un programa con alumnos activos
    // los dejaría viendo un "Completed ✓" falso de un programa vacío.
    const { data: day, error: dErr } = await admin
      .from('program_days')
      .select('id, program_id')
      .eq('id', dayId)
      .maybeSingle();
    if (dErr) throw dErr;
    if (!day) return { ok: true }; // ya no existe — nada que borrar
    const { count: daysLeft, error: cErr } = await admin
      .from('program_days')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', day.program_id);
    if (cErr) throw cErr;
    if ((daysLeft ?? 0) <= 1) {
      const { count: actives, error: aErr } = await admin
        .from('program_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('program_id', day.program_id)
        .eq('status', 'active');
      if (aErr) throw aErr;
      if ((actives ?? 0) > 0) {
        return {
          ok: false,
          error: `Es el último día del programa y hay ${actives} alumno${actives === 1 ? '' : 's'} activo${actives === 1 ? '' : 's'} — cancelá esas asignaciones primero.`,
        };
      }
    }

    const { error } = await admin.from('program_days').delete().eq('id', dayId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminDeleteDay failed', e);
    return { ok: false, error: 'No se pudo eliminar el día.' };
  }
}

export async function adminSaveItem(
  dayId: string,
  item: { id?: string; title: string; detail?: string | null; video_url?: string | null; display_order: number }
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (!item.title.trim()) return { ok: false, error: 'El ítem necesita un título.' };
    const admin = createAdminClient();
    const row = {
      title: item.title.trim(),
      detail: item.detail?.trim() || null,
      video_url: item.video_url?.trim() || null,
      display_order: item.display_order,
    };
    if (item.id) {
      const { error } = await admin.from('program_items').update(row).eq('id', item.id).eq('day_id', dayId);
      if (error) throw error;
      return { ok: true, id: item.id };
    }
    const { data, error } = await admin
      .from('program_items')
      .insert({ ...row, day_id: dayId })
      .select('id')
      .single();
    if (error) throw error;
    return { ok: true, id: data.id };
  } catch (e) {
    console.error('[program-admin] adminSaveItem failed', e);
    return { ok: false, error: 'No se pudo guardar el ítem.' };
  }
}

export async function adminDeleteItem(itemId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    const { error } = await admin.from('program_items').delete().eq('id', itemId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminDeleteItem failed', e);
    return { ok: false, error: 'No se pudo eliminar el ítem.' };
  }
}

export async function adminListVideoLibrary(): Promise<{
  ok: boolean;
  error?: string;
  videos: { id: string; title: string; pillar: string | null; video_url: string }[];
}> {
  try {
    if (!(await assertAdmin())) return { ...DENY, videos: [] };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('program_video_library')
      .select('id, title, pillar, video_url')
      .eq('archived', false)
      .order('pillar')
      .order('title');
    if (error) throw error;
    return { ok: true, videos: data ?? [] };
  } catch (e) {
    console.error('[program-admin] adminListVideoLibrary failed', e);
    return { ok: false, error: 'No se pudo cargar la biblioteca.', videos: [] };
  }
}

export async function adminSearchStudents(q: string): Promise<{
  ok: boolean;
  error?: string;
  students: { id: string; name: string; email: string | null; belt_level: string | null }[];
}> {
  try {
    if (!(await assertAdmin())) return { ...DENY, students: [] };
    const term = q.trim();
    if (term.length < 2) return { ok: true, students: [] };
    const admin = createAdminClient();
    // Comas, paréntesis y comillas rompen la sintaxis del filtro .or() de
    // PostgREST (y permitirían inyectar condiciones): se reemplazan por
    // espacio. El % y el _ del ilike se escapan para que no sean comodines.
    const safe = term.replace(/[,()"']/g, ' ').replace(/[%_]/g, '\\$&').trim();
    if (safe.length < 2) return { ok: true, students: [] };
    const { data, error } = await admin
      .from('students')
      .select('id, first_name, last_name, email, belt_level')
      .eq('status', 'active')
      .or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%`)
      .limit(8);
    if (error) throw error;
    return {
      ok: true,
      students: (data ?? []).map((s: any) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name ?? ''}`.trim(),
        email: s.email,
        belt_level: s.belt_level,
      })),
    };
  } catch (e) {
    console.error('[program-admin] adminSearchStudents failed', e);
    return { ok: false, error: 'No se pudo buscar.', students: [] };
  }
}

// Un alumno lleva UN programa activo a la vez: el visor del portal muestra la
// asignación más reciente, así que permitir dos solo generaría confusión.
export async function adminAssignProgram(
  programId: string,
  studentId: string,
  coachId?: string | null
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();

    // Coach de seguimiento opcional — si viene, debe tener el Escalón 1.
    if (coachId) {
      const { data: coach, error: chErr } = await admin
        .from('coaches')
        .select('id, hp_escalon')
        .eq('id', coachId)
        .maybeSingle();
      if (chErr) throw chErr;
      if (!coach || (coach.hp_escalon ?? 0) < 1) {
        return { ok: false, error: 'Ese coach no tiene el Escalón 1 — otorgáselo primero en la pestaña Coaches.' };
      }
    }

    // Validación server-side (el dropdown del cliente puede estar viejo):
    // el programa debe existir, estar activo y tener contenido — asignar un
    // programa sin días le mostraría al alumno un "Completed ✓" de la nada.
    const { data: prog, error: pErr } = await admin
      .from('programs')
      .select('id, active')
      .eq('id', programId)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!prog) return { ok: false, error: 'Ese programa no existe.' };
    if (!prog.active) return { ok: false, error: 'Ese programa está inactivo — activalo antes de asignarlo.' };
    const { count: daysCount, error: dcErr } = await admin
      .from('program_days')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', programId);
    if (dcErr) throw dcErr;
    if ((daysCount ?? 0) === 0) {
      return { ok: false, error: 'Ese programa todavía no tiene días — cargale contenido antes de asignarlo.' };
    }

    const { data: existing, error: exErr } = await admin
      .from('program_assignments')
      .select('id, programs(title)')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();
    if (exErr) throw exErr;
    if (existing) {
      const t = (existing as any).programs?.title ?? 'otro programa';
      return { ok: false, error: `Ya tiene activo «${t}» — cancelá esa asignación primero (está en la lista de abajo).` };
    }

    const { error } = await admin.from('program_assignments').insert({
      program_id: programId,
      student_id: studentId,
      assigned_by: 'Marcelo Castellanos',
      status: 'active',
      coach_id: coachId ?? null,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminAssignProgram failed', e);
    return { ok: false, error: 'No se pudo asignar.' };
  }
}

export interface AdminAssignmentRow {
  id: string;
  student_name: string;
  program_title: string;
  program_id: string;
  start_date: string;
  days_done: number;
  days_total: number;
  last_checkin: string | null;
  coach_id: string | null;
  coach_name: string | null;
}

export async function adminListAssignments(): Promise<{ ok: boolean; error?: string; assignments: AdminAssignmentRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, assignments: [] };
    const admin = createAdminClient();

    const { data: rows, error } = await admin
      .from('program_assignments')
      .select('id, program_id, start_date, coach_id, students(first_name, last_name), programs(title), coaches(display_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const ids = (rows ?? []).map((r: any) => r.id);
    const programIds = Array.from(new Set((rows ?? []).map((r: any) => r.program_id)));

    let dayMarks: any[] = [];
    let checkins: any[] = [];
    if (ids.length) {
      const { data: dm, error: dmErr } = await admin
        .from('program_day_marks')
        .select('assignment_id')
        .in('assignment_id', ids);
      if (dmErr) throw dmErr;
      dayMarks = dm ?? [];
      const { data: ck, error: ckErr } = await admin
        .from('program_checkins')
        .select('assignment_id, checkin_date')
        .in('assignment_id', ids)
        .order('checkin_date', { ascending: false });
      if (ckErr) throw ckErr;
      checkins = ck ?? [];
    }
    let dayTotals: any[] = [];
    if (programIds.length) {
      const { data: dt, error: dtErr } = await admin
        .from('program_days')
        .select('program_id')
        .in('program_id', programIds);
      if (dtErr) throw dtErr;
      dayTotals = dt ?? [];
    }

    const doneBy = new Map<string, number>();
    for (const m of dayMarks) doneBy.set(m.assignment_id, (doneBy.get(m.assignment_id) ?? 0) + 1);
    const totalBy = new Map<string, number>();
    for (const d of dayTotals) totalBy.set(d.program_id, (totalBy.get(d.program_id) ?? 0) + 1);
    const lastCk = new Map<string, string>();
    for (const c of checkins) if (!lastCk.has(c.assignment_id)) lastCk.set(c.assignment_id, c.checkin_date);

    return {
      ok: true,
      assignments: (rows ?? []).map((r: any) => ({
        id: r.id,
        student_name: `${r.students?.first_name ?? ''} ${r.students?.last_name ?? ''}`.trim() || '—',
        program_title: r.programs?.title ?? '—',
        program_id: r.program_id,
        start_date: r.start_date,
        days_done: doneBy.get(r.id) ?? 0,
        days_total: totalBy.get(r.program_id) ?? 0,
        last_checkin: lastCk.get(r.id) ?? null,
        coach_id: r.coach_id ?? null,
        coach_name: r.coaches?.display_name ?? null,
      })),
    };
  } catch (e) {
    console.error('[program-admin] adminListAssignments failed', e);
    return { ok: false, error: 'No se pudieron cargar las asignaciones.', assignments: [] };
  }
}

export async function adminCancelAssignment(assignmentId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    const { error } = await admin
      .from('program_assignments')
      .update({ status: 'cancelled' })
      .eq('id', assignmentId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminCancelAssignment failed', e);
    return { ok: false, error: 'No se pudo cancelar.' };
  }
}

// ─── Paso 4: escalera del coach + coach de seguimiento por asignación ───

export async function adminListHPCoaches(): Promise<{
  ok: boolean;
  error?: string;
  coaches: { id: string; display_name: string; role: string; hp_escalon: number; hp_specialty: string | null }[];
}> {
  try {
    if (!(await assertAdmin())) return { ...DENY, coaches: [] };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('coaches')
      .select('id, display_name, role, hp_escalon, hp_specialty')
      .order('display_name');
    if (error) throw error;
    return { ok: true, coaches: data ?? [] };
  } catch (e) {
    console.error('[program-admin] adminListHPCoaches failed', e);
    return { ok: false, error: 'No se pudieron cargar los coaches.', coaches: [] };
  }
}

export async function adminSetCoachEscalon(
  coachId: string,
  escalon: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    // Por ahora solo E0 (nada) y E1 (seguimiento). E2/E3 llegan con el editor
    // recortado por equipo — la columna ya los soporta, la UI todavía no.
    if (![0, 1].includes(escalon)) return { ok: false, error: 'Por ahora solo Escalón 0 o 1.' };
    const admin = createAdminClient();

    // Bajar a 0 a un coach con seguimientos activos dejaría esas asignaciones
    // huérfanas de vista: se avisa en vez de romper en silencio.
    if (escalon === 0) {
      const { count, error: cErr } = await admin
        .from('program_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('coach_id', coachId)
        .eq('status', 'active');
      if (cErr) throw cErr;
      if ((count ?? 0) > 0) {
        return {
          ok: false,
          error: `Este coach da seguimiento a ${count} alumno${count === 1 ? '' : 's'} — quitale esos seguimientos primero (en Asignaciones).`,
        };
      }
    }

    const { error } = await admin.from('coaches').update({ hp_escalon: escalon }).eq('id', coachId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminSetCoachEscalon failed', e);
    return { ok: false, error: 'No se pudo guardar.' };
  }
}

export async function adminSetAssignmentCoach(
  assignmentId: string,
  coachId: string | null
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    if (coachId) {
      const { data: coach, error: cErr } = await admin
        .from('coaches')
        .select('id, hp_escalon')
        .eq('id', coachId)
        .maybeSingle();
      if (cErr) throw cErr;
      if (!coach) return { ok: false, error: 'Ese coach no existe.' };
      if ((coach.hp_escalon ?? 0) < 1) {
        return { ok: false, error: 'Ese coach no tiene el Escalón 1 — otorgáselo primero en la pestaña Coaches.' };
      }
    }
    const { error } = await admin
      .from('program_assignments')
      .update({ coach_id: coachId })
      .eq('id', assignmentId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminSetAssignmentCoach failed', e);
    return { ok: false, error: 'No se pudo guardar.' };
  }
}

export interface ProgramReportRow {
  assignment_id: string;
  student_name: string;
  program_title: string;
  coach_name: string | null;
  start_date: string;
  days_done: number;
  days_total: number;
  adherence_pct: number;
  avg_sleep: number | null;
  avg_water: number | null;
  last_checkin: string | null;
  last_activity: string | null; // fecha de la última marca o check-in
  days_inactive: number | null;
}

// El reporte de adherencia — vive junto a los 7 reportes de /reports.
export async function adminProgramReport(): Promise<{ ok: boolean; error?: string; rows: ProgramReportRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, rows: [] };
    const admin = createAdminClient();

    const { data: asg, error } = await admin
      .from('program_assignments')
      .select('id, program_id, start_date, students(first_name, last_name), programs(title), coaches(display_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const ids = (asg ?? []).map((a: any) => a.id);
    const programIds = Array.from(new Set((asg ?? []).map((a: any) => a.program_id)));
    if (ids.length === 0) return { ok: true, rows: [] };

    const { data: dayMarks, error: dmErr } = await admin
      .from('program_day_marks')
      .select('assignment_id, done_at')
      .in('assignment_id', ids);
    if (dmErr) throw dmErr;
    const { data: checkins, error: ckErr } = await admin
      .from('program_checkins')
      .select('assignment_id, checkin_date, water_glasses, sleep_hours')
      .in('assignment_id', ids)
      .order('checkin_date', { ascending: false });
    if (ckErr) throw ckErr;
    const { data: dayTotals, error: dtErr } = await admin
      .from('program_days')
      .select('program_id')
      .in('program_id', programIds);
    if (dtErr) throw dtErr;

    const totalBy = new Map<string, number>();
    for (const d of dayTotals ?? []) totalBy.set(d.program_id, (totalBy.get(d.program_id) ?? 0) + 1);
    const doneBy = new Map<string, number>();
    const lastMark = new Map<string, string>();
    for (const m of dayMarks ?? []) {
      doneBy.set(m.assignment_id, (doneBy.get(m.assignment_id) ?? 0) + 1);
      // done_at es timestamptz UTC — se convierte a fecha de El Salvador antes
      // de mezclarla con checkin_date (que ya es fecha SV) y de calcular la
      // alerta de inactividad. Sin esto, la alerta se encendía un día tarde
      // para todo atleta cuya última actividad fue vespertina.
      const d = toElSalvadorDate(m.done_at) ?? String(m.done_at).slice(0, 10);
      if (!lastMark.has(m.assignment_id) || d > lastMark.get(m.assignment_id)!) lastMark.set(m.assignment_id, d);
    }
    const ckBy = new Map<string, { date: string; water: number | null; sleep: number | null }[]>();
    for (const c of checkins ?? []) {
      const arr = ckBy.get(c.assignment_id) ?? [];
      arr.push({ date: c.checkin_date, water: c.water_glasses, sleep: c.sleep_hours });
      ckBy.set(c.assignment_id, arr);
    }

    const today = elSalvadorToday();
    const rows: ProgramReportRow[] = (asg ?? []).map((a: any) => {
      const total = totalBy.get(a.program_id) ?? 0;
      const done = doneBy.get(a.id) ?? 0;
      const cks = (ckBy.get(a.id) ?? []).slice(0, 7);
      const sleeps = cks.map((c) => c.sleep).filter((v): v is number => v != null);
      const waters = cks.map((c) => c.water).filter((v): v is number => v != null);
      const lastCk = cks[0]?.date ?? null;
      const lastAct = [lastMark.get(a.id), lastCk].filter(Boolean).sort().pop() ?? null;
      const daysInactive = lastAct ? diffDays(lastAct, today) : diffDays(a.start_date, today);
      return {
        assignment_id: a.id,
        student_name: `${a.students?.first_name ?? ''} ${a.students?.last_name ?? ''}`.trim() || '—',
        program_title: a.programs?.title ?? '—',
        coach_name: a.coaches?.display_name ?? null,
        start_date: a.start_date,
        days_done: done,
        days_total: total,
        adherence_pct: total > 0 ? Math.round((done / total) * 100) : 0,
        avg_sleep: sleeps.length ? Math.round((sleeps.reduce((s, v) => s + Number(v), 0) / sleeps.length) * 10) / 10 : null,
        avg_water: waters.length ? Math.round((waters.reduce((s, v) => s + Number(v), 0) / waters.length) * 10) / 10 : null,
        last_checkin: lastCk,
        last_activity: lastAct,
        days_inactive: daysInactive,
      };
    });
    return { ok: true, rows };
  } catch (e) {
    console.error('[program-admin] adminProgramReport failed', e);
    return { ok: false, error: 'No se pudo generar el reporte.', rows: [] };
  }
}

// Días entre dos fechas YYYY-MM-DD (UTC puro — sin sorpresas de timezone).
function diffDays(from: string, to: string): number {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10));
  return Math.max(0, Math.round((b - a) / 86400000));
}

// ─── Paso 5: citas (atleta ↔ coach o especialista) + especialidad ───

export async function adminSetCoachSpecialty(
  coachId: string,
  specialty: 'mental' | 'fisico' | null
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    const { error } = await admin.from('coaches').update({ hp_specialty: specialty }).eq('id', coachId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminSetCoachSpecialty failed', e);
    return { ok: false, error: 'No se pudo guardar.' };
  }
}

export interface AdminAppointmentRow {
  id: string;
  student_name: string;
  coach_name: string;
  kind: string;
  title: string | null;
  appointment_date: string;
  appointment_time: string | null;
  status: string;
  notes: string | null;
}

export async function adminCreateAppointment(input: {
  studentId: string;
  coachId: string;
  kind: 'fisico' | 'mental' | 'tecnico' | 'otro';
  date: string; // YYYY-MM-DD (El Salvador)
  time?: string | null; // HH:MM
  title?: string | null;
  notes?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false, error: 'La fecha no es válida.' };
    if (input.time && !/^\d{2}:\d{2}$/.test(input.time)) return { ok: false, error: 'La hora no es válida.' };
    if (input.date < elSalvadorToday()) return { ok: false, error: 'La cita no puede ser en el pasado.' };
    const admin = createAdminClient();

    // Quien atiende debe tener el Escalón 1 — la cita aparece en SU portal.
    const { data: coach, error: cErr } = await admin
      .from('coaches')
      .select('id, hp_escalon')
      .eq('id', input.coachId)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!coach || (coach.hp_escalon ?? 0) < 1) {
      return { ok: false, error: 'Quien atiende necesita el Escalón 1 — otorgáselo en la pestaña Coaches.' };
    }
    const { data: student, error: sErr } = await admin
      .from('students')
      .select('id')
      .eq('id', input.studentId)
      .maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: false, error: 'Ese alumno no existe.' };

    const { error } = await admin.from('program_appointments').insert({
      student_id: input.studentId,
      coach_id: input.coachId,
      kind: input.kind,
      title: input.title?.trim() || null,
      appointment_date: input.date,
      appointment_time: input.time || null,
      notes: input.notes?.trim() || null,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminCreateAppointment failed', e);
    return { ok: false, error: 'No se pudo crear la cita.' };
  }
}

export async function adminListAppointments(): Promise<{
  ok: boolean;
  error?: string;
  appointments: AdminAppointmentRow[];
}> {
  try {
    if (!(await assertAdmin())) return { ...DENY, appointments: [] };
    const admin = createAdminClient();
    // Piso de fecha: sin él, el orden ascendente + limit devolvía las 60 citas
    // MÁS VIEJAS para siempre, y una cita nueva jamás aparecía en esta lista
    // (aunque alumno y coach sí la vieran) una vez acumulado historial.
    const { data, error } = await admin
      .from('program_appointments')
      .select('id, kind, title, appointment_date, appointment_time, status, notes, students(first_name, last_name), coaches(display_name)')
      .in('status', ['scheduled', 'done'])
      .gte('appointment_date', elSalvadorDatePlus(-14))
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true, nullsFirst: true })
      .limit(60);
    if (error) throw error;
    return {
      ok: true,
      appointments: (data ?? []).map((a: any) => ({
        id: a.id,
        student_name: `${a.students?.first_name ?? ''} ${a.students?.last_name ?? ''}`.trim() || '—',
        coach_name: a.coaches?.display_name ?? '—',
        kind: a.kind,
        title: a.title,
        appointment_date: a.appointment_date,
        appointment_time: a.appointment_time,
        status: a.status,
        notes: a.notes,
      })),
    };
  } catch (e) {
    console.error('[program-admin] adminListAppointments failed', e);
    return { ok: false, error: 'No se pudieron cargar las citas.', appointments: [] };
  }
}

export async function adminSetAppointmentStatus(
  appointmentId: string,
  status: 'done' | 'cancelled' | 'scheduled'
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    const { error } = await admin
      .from('program_appointments')
      .update({ status })
      .eq('id', appointmentId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-admin] adminSetAppointmentStatus failed', e);
    return { ok: false, error: 'No se pudo guardar.' };
  }
}
