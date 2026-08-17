'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday, toElSalvadorDate } from '@/lib/utils/tz';

// ─── Escalón 1: el coach da seguimiento a sus atletas de programa ───
//
// Portal del coach (por token). Solo ve las asignaciones donde ÉL es el coach
// de seguimiento (program_assignments.coach_id) y solo si tiene el Escalón 1
// otorgado (coaches.hp_escalon >= 1). No crea ni edita nada: eso es E2.
//
// createAdminClient bypassa RLS → el recorte por coach ES la seguridad acá.

export interface HPAthleteRow {
  assignment_id: string;
  student_name: string;
  program_title: string;
  position: { week: number; day: number } | null; // null = completado
  days_done: number;
  days_total: number;
  active_today: boolean; // marcó un día o hizo check-in HOY (El Salvador)
  last_checkin: {
    date: string;
    water_glasses: number | null;
    sleep_hours: number | null;
    energy: number | null;
    comment: string | null;
  } | null;
}

export async function getMyHPAthletes(
  portalToken: string
): Promise<{ ok: boolean; error?: string; data: { escalon: number; athletes: HPAthleteRow[] } | null }> {
  try {
    const admin = createAdminClient();
    // course_access_granted es el interruptor de revocación del portal del
    // coach (el token NO se rota al revocar) — todas las actions del
    // coach-portal lo exigen, y esta no puede ser la excepción: sin él, un
    // ex-coach con su URL vieja seguiría viendo check-ins de atletas.
    const { data: coach, error: cErr } = await admin
      .from('coaches')
      .select('id, hp_escalon, course_access_granted')
      .eq('portal_token', portalToken)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!coach || !coach.course_access_granted || (coach.hp_escalon ?? 0) < 1) {
      return { ok: true, data: null };
    }

    const { data: asg, error: aErr } = await admin
      .from('program_assignments')
      .select('id, program_id, students(first_name, last_name), programs!inner(title, active)')
      .eq('coach_id', coach.id)
      .eq('status', 'active')
      .eq('programs.active', true)
      .order('created_at', { ascending: false });
    if (aErr) throw aErr;
    if (!asg || asg.length === 0) return { ok: true, data: { escalon: coach.hp_escalon, athletes: [] } };

    const ids = asg.map((a: any) => a.id);
    const programIds = Array.from(new Set(asg.map((a: any) => a.program_id)));

    const { data: days, error: dErr } = await admin
      .from('program_days')
      .select('id, program_id, week_number, day_number')
      .in('program_id', programIds)
      .order('week_number')
      .order('day_number');
    if (dErr) throw dErr;
    const { data: marks, error: mErr } = await admin
      .from('program_day_marks')
      .select('assignment_id, day_id, done_at')
      .in('assignment_id', ids);
    if (mErr) throw mErr;
    const { data: checkins, error: kErr } = await admin
      .from('program_checkins')
      .select('assignment_id, checkin_date, water_glasses, sleep_hours, energy, comment')
      .in('assignment_id', ids)
      .order('checkin_date', { ascending: false });
    if (kErr) throw kErr;

    const daysByProgram = new Map<string, { id: string; week_number: number; day_number: number }[]>();
    for (const d of days ?? []) {
      const arr = daysByProgram.get(d.program_id) ?? [];
      arr.push(d);
      daysByProgram.set(d.program_id, arr);
    }
    const marksByAsg = new Map<string, Set<string>>();
    const markToday = new Set<string>();
    const today = elSalvadorToday();
    for (const m of marks ?? []) {
      const set = marksByAsg.get(m.assignment_id) ?? new Set<string>();
      set.add(m.day_id);
      marksByAsg.set(m.assignment_id, set);
      // done_at es timestamptz UTC: una marca a las 7 PM de El Salvador cae en
      // el día UTC siguiente. Convertir SIEMPRE antes de comparar (invariante #4).
      if (toElSalvadorDate(m.done_at) === today) markToday.add(m.assignment_id);
    }
    const ckByAsg = new Map<string, any[]>();
    for (const c of checkins ?? []) {
      const arr = ckByAsg.get(c.assignment_id) ?? [];
      arr.push(c);
      ckByAsg.set(c.assignment_id, arr);
    }

    const athletes: HPAthleteRow[] = asg.map((a: any) => {
      const pdays = daysByProgram.get(a.program_id) ?? [];
      const done = marksByAsg.get(a.id) ?? new Set<string>();
      const current = pdays.find((d) => !done.has(d.id)) ?? null;
      const cks = ckByAsg.get(a.id) ?? [];
      const lastCk = cks[0] ?? null;
      return {
        assignment_id: a.id,
        student_name: `${a.students?.first_name ?? ''} ${a.students?.last_name ?? ''}`.trim() || '—',
        program_title: a.programs?.title ?? '—',
        position: current ? { week: current.week_number, day: current.day_number } : null,
        days_done: done.size,
        days_total: pdays.length,
        active_today: markToday.has(a.id) || (lastCk?.checkin_date === today),
        last_checkin: lastCk
          ? {
              date: lastCk.checkin_date,
              water_glasses: lastCk.water_glasses,
              sleep_hours: lastCk.sleep_hours,
              energy: lastCk.energy,
              comment: lastCk.comment,
            }
          : null,
      };
    });

    return { ok: true, data: { escalon: coach.hp_escalon, athletes } };
  } catch (e) {
    console.error('[program-coach] getMyHPAthletes failed', e);
    return { ok: false, error: 'No se pudo cargar el seguimiento.', data: null };
  }
}
