'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { elSalvadorToday } from '@/lib/utils/tz';
import { computeWeekRanking, svWeekBounds, type RankRow } from '@/lib/programs/ranking';

// ─── Ola 2: competencias por atleta + ranking semanal (paridad con la app HP) ───
//
// El modelo calca a la app HP: la competencia es la BITÁCORA del atleta en su
// evento real (no un torneo que organizamos): heats con preparación pre-heat
// (checklist/lineup/estrategia/mantra — los llena el ATLETA desde su portal),
// olas puntuadas una por una (las registra el staff), passed/no passed, y
// resultado final. El ranking semanal usa la fórmula de puntos de HP adaptada
// a los datos que BRAIN captura (día marcado + check-in).
//
// Mismo contrato que el resto de la línea: {ok,error}, nunca lanzar hacia
// afuera; staff español, student-facing inglés; fechas de negocio El Salvador.

async function assertAdmin(): Promise<boolean> {
  // SOLO admin de plataforma — mismo candado que program-admin (el rol 'admin'
  // de coaches es un rol DE ACADEMIA y no puede tocar la línea HP).
  return isRealPlatformAdmin().catch(() => false);
}

const DENY = { ok: false as const, error: 'Solo el administrador puede gestionar competencias.' };

// El heat se gana con las DOS mejores olas (regla estándar de surf).
function heatTotal(scores: number[]): number {
  const best = [...scores].sort((a, b) => b - a).slice(0, 2);
  return Math.round(best.reduce((s, x) => s + x, 0) * 100) / 100;
}

export interface AdminCompetitionRow {
  id: string;
  student_id: string;
  student_name: string;
  name: string;
  comp_date: string;
  location: string | null;
  category: string | null;
  status: string;
  final_place: string | null;
  heats_count: number;
}

export async function adminListCompetitions(): Promise<{ ok: boolean; error?: string; competitions: AdminCompetitionRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, competitions: [] };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('athlete_competitions')
      .select('id, student_id, name, comp_date, location, category, status, final_place, students(first_name, last_name), athlete_heats(id)')
      .order('comp_date', { ascending: false })
      .limit(60);
    if (error) throw error;
    return {
      ok: true,
      competitions: (data ?? []).map((c: any) => ({
        id: c.id,
        student_id: c.student_id,
        student_name: `${c.students?.first_name ?? ''} ${c.students?.last_name ?? ''}`.trim() || '—',
        name: c.name,
        comp_date: c.comp_date,
        location: c.location,
        category: c.category,
        status: c.status,
        final_place: c.final_place,
        heats_count: (c.athlete_heats ?? []).length,
      })),
    };
  } catch (e) {
    console.error('[competitions] adminListCompetitions failed', e);
    return { ok: false, error: 'No se pudieron cargar las competencias.', competitions: [] };
  }
}

export async function adminCreateCompetition(input: {
  studentId: string; name: string; compDate: string; location?: string | null; category?: string | null;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (!input.name.trim()) return { ok: false, error: 'La competencia necesita un nombre.' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.compDate)) return { ok: false, error: 'La fecha no es válida.' };
    const admin = createAdminClient();
    const { data: student, error: sErr } = await admin
      .from('students').select('id').eq('id', input.studentId).maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: false, error: 'Ese atleta no existe.' };
    const { data, error } = await admin
      .from('athlete_competitions')
      .insert({
        student_id: input.studentId,
        name: input.name.trim(),
        comp_date: input.compDate,
        location: input.location?.trim() || null,
        category: input.category?.trim() || null,
      })
      .select('id').single();
    if (error) throw error;
    return { ok: true, id: data.id };
  } catch (e) {
    console.error('[competitions] adminCreateCompetition failed', e);
    return { ok: false, error: 'No se pudo crear la competencia.' };
  }
}

export interface AdminHeatView {
  id: string;
  heat_number: number;
  round_name: string | null;
  status: string;
  passed: boolean | null;
  what_worked: string | null;
  what_to_improve: string | null;
  prep: Record<string, unknown>;
  waves: { id: string; wave_number: number; score: number }[];
  heat_total: number;
}

export interface AdminCompetitionDetail {
  id: string;
  student_id: string;
  student_name: string;
  name: string;
  comp_date: string;
  location: string | null;
  category: string | null;
  status: string;
  final_place: string | null;
  final_notes: string | null;
  heats: AdminHeatView[];
}

export async function adminGetCompetition(
  compId: string
): Promise<{ ok: boolean; error?: string; competition: AdminCompetitionDetail | null }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, competition: null };
    const admin = createAdminClient();
    const { data: c, error } = await admin
      .from('athlete_competitions')
      .select('id, student_id, name, comp_date, location, category, status, final_place, final_notes, students(first_name, last_name)')
      .eq('id', compId).maybeSingle();
    if (error) throw error;
    if (!c) return { ok: false, error: 'Competencia no encontrada.', competition: null };
    const { data: heats, error: hErr } = await admin
      .from('athlete_heats')
      .select('id, heat_number, round_name, status, passed, what_worked, what_to_improve, prep, heat_waves(id, wave_number, score)')
      .eq('competition_id', compId)
      .order('created_at');
    if (hErr) throw hErr;
    return {
      ok: true,
      competition: {
        id: c.id,
        student_id: c.student_id,
        student_name: `${(c as any).students?.first_name ?? ''} ${(c as any).students?.last_name ?? ''}`.trim() || '—',
        name: c.name,
        comp_date: c.comp_date,
        location: c.location,
        category: c.category,
        status: c.status,
        final_place: c.final_place,
        final_notes: c.final_notes,
        heats: (heats ?? []).map((h: any) => {
          const waves = (h.heat_waves ?? [])
            .map((w: any) => ({ id: w.id, wave_number: w.wave_number, score: Number(w.score) }))
            .sort((a: any, b: any) => a.wave_number - b.wave_number);
          return {
            id: h.id,
            heat_number: h.heat_number,
            round_name: h.round_name,
            status: h.status,
            passed: h.passed,
            what_worked: h.what_worked,
            what_to_improve: h.what_to_improve,
            prep: h.prep ?? {},
            waves,
            heat_total: heatTotal(waves.map((w: any) => w.score)),
          };
        }),
      },
    };
  } catch (e) {
    console.error('[competitions] adminGetCompetition failed', e);
    return { ok: false, error: 'No se pudo cargar la competencia.', competition: null };
  }
}

export async function adminUpdateCompetition(
  compId: string,
  patch: { name?: string; comp_date?: string; location?: string | null; category?: string | null; status?: 'scheduled' | 'live' | 'finished'; final_place?: string | null; final_notes?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (patch.name !== undefined && !patch.name.trim()) return { ok: false, error: 'La competencia necesita un nombre.' };
    if (patch.comp_date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(patch.comp_date)) return { ok: false, error: 'La fecha no es válida.' };
    const admin = createAdminClient();
    const { error } = await admin.from('athlete_competitions').update(patch).eq('id', compId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[competitions] adminUpdateCompetition failed', e);
    return { ok: false, error: 'No se pudo guardar.' };
  }
}

export async function adminDeleteCompetition(compId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    // Solo sin heats: con historial cargado se conserva (es bitácora del atleta).
    const { data: heats, error: hErr } = await admin
      .from('athlete_heats').select('id').eq('competition_id', compId).limit(1);
    if (hErr) throw hErr;
    if ((heats ?? []).length > 0) return { ok: false, error: 'Tiene heats cargados — borralos primero si de verdad querés eliminarla.' };
    const { error } = await admin.from('athlete_competitions').delete().eq('id', compId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[competitions] adminDeleteCompetition failed', e);
    return { ok: false, error: 'No se pudo eliminar.' };
  }
}

export async function adminAddHeat(
  compId: string,
  input: { heatNumber: number; roundName?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (!(input.heatNumber >= 1 && input.heatNumber <= 99)) return { ok: false, error: 'Número de heat inválido.' };
    const admin = createAdminClient();
    const { data: comp, error: cErr } = await admin
      .from('athlete_competitions').select('id, status').eq('id', compId).maybeSingle();
    if (cErr) throw cErr;
    if (!comp) return { ok: false, error: 'Competencia no encontrada.' };
    const { error } = await admin.from('athlete_heats').insert({
      competition_id: compId,
      heat_number: input.heatNumber,
      round_name: input.roundName?.trim() || null,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[competitions] adminAddHeat failed', e);
    return { ok: false, error: 'No se pudo agregar el heat.' };
  }
}

export async function adminDeleteHeat(heatId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    const { data: waves, error: wErr } = await admin.from('heat_waves').select('id').eq('heat_id', heatId).limit(1);
    if (wErr) throw wErr;
    if ((waves ?? []).length > 0) return { ok: false, error: 'Tiene olas puntuadas — borralas primero.' };
    const { error } = await admin.from('athlete_heats').delete().eq('id', heatId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[competitions] adminDeleteHeat failed', e);
    return { ok: false, error: 'No se pudo eliminar el heat.' };
  }
}

export async function adminAddWave(
  heatId: string,
  score: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (!(score >= 0 && score <= 10)) return { ok: false, error: 'El puntaje va de 0 a 10.' };
    const admin = createAdminClient();
    const { data: waves, error: wErr } = await admin
      .from('heat_waves').select('wave_number').eq('heat_id', heatId)
      .order('wave_number', { ascending: false }).limit(1);
    if (wErr) throw wErr;
    const next = ((waves?.[0]?.wave_number as number | undefined) ?? 0) + 1;
    const { error } = await admin.from('heat_waves').insert({
      heat_id: heatId,
      wave_number: next,
      score: Math.round(score * 100) / 100,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[competitions] adminAddWave failed', e);
    return { ok: false, error: 'No se pudo registrar la ola.' };
  }
}

export async function adminDeleteWave(waveId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    const { error } = await admin.from('heat_waves').delete().eq('id', waveId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[competitions] adminDeleteWave failed', e);
    return { ok: false, error: 'No se pudo borrar la ola.' };
  }
}

export async function adminUpdateHeatOutcome(
  heatId: string,
  input: { passed?: boolean | null; what_worked?: string | null; what_to_improve?: string | null; status?: 'upcoming' | 'done'; round_name?: string | null; heat_number?: number }
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (input.heat_number !== undefined && !(input.heat_number >= 1 && input.heat_number <= 99)) {
      return { ok: false, error: 'Número de heat inválido.' };
    }
    const admin = createAdminClient();
    const patch: Record<string, unknown> = {};
    if (input.passed !== undefined) patch.passed = input.passed;
    if (input.what_worked !== undefined) patch.what_worked = input.what_worked?.trim() || null;
    if (input.what_to_improve !== undefined) patch.what_to_improve = input.what_to_improve?.trim() || null;
    if (input.status !== undefined) patch.status = input.status;
    if (input.round_name !== undefined) patch.round_name = input.round_name?.trim() || null;
    if (input.heat_number !== undefined) patch.heat_number = input.heat_number;
    const { error } = await admin.from('athlete_heats').update(patch).eq('id', heatId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[competitions] adminUpdateHeatOutcome failed', e);
    return { ok: false, error: 'No se pudo guardar el resultado.' };
  }
}

// ─── Ranking semanal (fórmula HP adaptada a lo que BRAIN captura) ───
//
// HP: plan 25 + sueño 20 + surf 20 + nutrición 15 + agua 10 + energía 4 +
// enfoque 3 + objetivo 3 (+ bonus). BRAIN no captura horas de surf ni enfoque/
// objetivo, así que la escala se redistribuye manteniendo el espíritu:
//   día del programa MARCADO ese día ....... 30   (el plan es lo más pesado)
//   check-in hecho .......................... 10
//   sueño: ≥8→20 · ≥7→15 · ≥6→10 · ≥5→5
//   agua:  ≥8→10 · ≥6→7  · ≥4→4  · >0→1
//   dieta anotada ........................... 15
//   energía (1-4) × 1.25 (máx 5)
// Máximo teórico por día: 90. Semana = lunes a domingo (El Salvador).
// Rankean los atletas con asignación de programa ACTIVA (los "atletas HP").

export async function adminGetWeeklyRanking(): Promise<{
  ok: boolean; error?: string;
  current: { week_start: string; week_end: string; rows: RankRow[] } | null;
  last_snapshot: { week_start: string; week_end: string; rows: RankRow[] } | null;
}> {
  try {
    if (!(await assertAdmin())) return { ...DENY, current: null, last_snapshot: null };
    const admin = createAdminClient();
    const today = elSalvadorToday();
    const { monday, sunday } = svWeekBounds(today);

    // Snapshot automático de la semana PASADA si todavía no existe (como HP).
    const lastMon = new Date(monday + 'T12:00:00Z'); lastMon.setUTCDate(lastMon.getUTCDate() - 7);
    const lastSun = new Date(monday + 'T12:00:00Z'); lastSun.setUTCDate(lastSun.getUTCDate() - 1);
    const lm = lastMon.toISOString().slice(0, 10);
    const ls = lastSun.toISOString().slice(0, 10);
    const { data: exist, error: exErr } = await admin
      .from('weekly_rankings').select('id').eq('week_start', lm).maybeSingle();
    if (exErr) throw exErr;
    if (!exist) {
      const rows = await computeWeekRanking(admin, lm, ls);
      if (rows.length > 0) {
        const { error: insErr } = await admin
          .from('weekly_rankings').insert({ week_start: lm, week_end: ls, rankings: rows });
        if (insErr) throw insErr;
      }
    }

    const [current, snap] = await Promise.all([
      computeWeekRanking(admin, monday, sunday),
      admin.from('weekly_rankings').select('week_start, week_end, rankings')
        .order('week_start', { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (snap.error) throw snap.error;
    return {
      ok: true,
      current: { week_start: monday, week_end: sunday, rows: current },
      last_snapshot: snap.data
        ? { week_start: snap.data.week_start, week_end: snap.data.week_end, rows: (snap.data.rankings ?? []) as RankRow[] }
        : null,
    };
  } catch (e) {
    console.error('[competitions] adminGetWeeklyRanking failed', e);
    return { ok: false, error: 'No se pudo calcular el ranking.', current: null, last_snapshot: null };
  }
}

// ─── El atleta: sus competencias, su prep y su ranking (portal por token) ───

async function resolveStudent(admin: ReturnType<typeof createAdminClient>, portalToken: string) {
  const { data: student, error } = await admin
    .from('students').select('id').eq('portal_token', portalToken).maybeSingle();
  if (error) throw error;
  return student;
}

export interface MyHeatView {
  id: string;
  heat_number: number;
  round_name: string | null;
  status: string;
  passed: boolean | null;
  what_worked: string | null;
  what_to_improve: string | null;
  prep: { checks?: string[]; lineup?: string; strategy?: string; mantra?: string };
  waves: { wave_number: number; score: number }[];
  heat_total: number;
}

export interface MyCompetitionData {
  upcoming: {
    id: string; name: string; comp_date: string; location: string | null; category: string | null;
    status: string; days_to: number; heats: MyHeatView[];
  } | null;
  last_result: { name: string; comp_date: string; final_place: string | null; final_notes: string | null } | null;
  ranking: {
    week_start: string; week_end: string;
    my_position: number | null; my_points: number; total: number;
    top: { name: string; points: number; position: number }[];
  } | null;
}

export async function getMyCompetitions(
  portalToken: string
): Promise<{ ok: boolean; data: MyCompetitionData | null }> {
  try {
    const admin = createAdminClient();
    const student = await resolveStudent(admin, portalToken);
    if (!student) return { ok: true, data: null };
    const today = elSalvadorToday();

    const [up, past, asg] = await Promise.all([
      admin.from('athlete_competitions')
        .select('id, name, comp_date, location, category, status, athlete_heats(id, heat_number, round_name, status, passed, what_worked, what_to_improve, prep, heat_waves(wave_number, score))')
        .eq('student_id', student.id)
        .neq('status', 'finished')
        // Un evento multi-día EN CURSO (comp_date = día 1) no puede desaparecer
        // del atleta el día 2 — 'live' se muestra sin importar la fecha.
        .or(`status.eq.live,comp_date.gte.${today}`)
        .order('comp_date')
        .limit(1)
        .maybeSingle(),
      admin.from('athlete_competitions')
        .select('name, comp_date, final_place, final_notes')
        .eq('student_id', student.id)
        .eq('status', 'finished')
        .order('comp_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      // "Parte del EQUIPO" = temporada activa (pedido Marcelo 2026-08-25):
      // el ranking ya no le sale a cualquiera con programa (drop-ins del
      // quiz incluidos) — solo a la línea de equipo HP real.
      admin.from('season_plans')
        .select('id').eq('student_id', student.id).eq('active', true).limit(1).maybeSingle(),
    ]);
    if (up.error) throw up.error;
    if (past.error) throw past.error;
    if (asg.error) throw asg.error;

    // Ranking en vivo de ESTA semana — solo para atletas del EQUIPO.
    let ranking: MyCompetitionData['ranking'] = null;
    if (asg.data) {
      const { monday, sunday } = svWeekBounds(today);
      const rows = await computeWeekRanking(admin, monday, sunday);
      const mine = rows.find((r) => r.student_id === student.id) ?? null;
      ranking = {
        week_start: monday,
        week_end: sunday,
        my_position: mine?.position ?? null,
        my_points: mine?.points ?? 0,
        total: rows.length,
        top: rows.slice(0, 5).map((r) => ({ name: r.name, points: r.points, position: r.position })),
      };
    }

    const upcoming = up.data
      ? {
          id: up.data.id,
          name: up.data.name,
          comp_date: up.data.comp_date,
          location: up.data.location,
          category: up.data.category,
          status: up.data.status,
          days_to: Math.max(0, Math.round((Date.parse(up.data.comp_date) - Date.parse(today)) / 86400000)),
          heats: ((up.data as any).athlete_heats ?? [])
            .map((h: any) => {
              const waves = (h.heat_waves ?? [])
                .map((w: any) => ({ wave_number: w.wave_number, score: Number(w.score) }))
                .sort((a: any, b: any) => a.wave_number - b.wave_number);
              return {
                id: h.id,
                heat_number: h.heat_number,
                round_name: h.round_name,
                status: h.status,
                passed: h.passed,
                what_worked: h.what_worked,
                what_to_improve: h.what_to_improve,
                prep: h.prep ?? {},
                waves,
                heat_total: heatTotal(waves.map((w: any) => w.score)),
              };
            })
            .sort((a: any, b: any) => a.heat_number - b.heat_number),
        }
      : null;

    // Sin competencia próxima y sin equipo → la tarjeta no existe para este
    // alumno (un resultado pasado solo, tampoco la resucita).
    if (!upcoming && !ranking) return { ok: true, data: null };
    return {
      ok: true,
      data: {
        upcoming,
        last_result: past.data ?? null,
        ranking,
      },
    };
  } catch (e) {
    console.error('[competitions] getMyCompetitions failed', e);
    return { ok: false, data: null };
  }
}

const PREP_CHECK_KEYS = ['warmup', 'simulation', 'breathing', 'visualization', 'mantra', 'board'];
const STRATEGY_KEYS = ['backup', 'build', 'attack', 'select', 'block', 'explode'];
const LINEUP_KEYS = ['A', 'B', 'C'];

export async function saveMyHeatPrep(
  portalToken: string,
  heatId: string,
  prep: { checks?: string[]; lineup?: string | null; strategy?: string | null; mantra?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const student = await resolveStudent(admin, portalToken);
    if (!student) return { ok: false, error: 'We could not find your profile.' };
    // El heat debe ser SUYO — createAdminClient bypassa RLS, la validación por
    // token ES la seguridad (invariante #3).
    const { data: heat, error: hErr } = await admin
      .from('athlete_heats')
      .select('id, athlete_competitions!inner(student_id, status)')
      .eq('id', heatId)
      .maybeSingle();
    if (hErr) throw hErr;
    const comp: any = heat ? (Array.isArray((heat as any).athlete_competitions) ? (heat as any).athlete_competitions[0] : (heat as any).athlete_competitions) : null;
    if (!heat || comp?.student_id !== student.id) return { ok: false, error: 'That heat is not yours.' };
    if (comp?.status === 'finished') return { ok: false, error: 'This competition is already finished.' };

    const checks = (prep.checks ?? []).filter((c) => PREP_CHECK_KEYS.includes(c));
    const lineup = prep.lineup && LINEUP_KEYS.includes(prep.lineup) ? prep.lineup : null;
    const strategy = prep.strategy && STRATEGY_KEYS.includes(prep.strategy) ? prep.strategy : null;
    const mantra = prep.mantra?.trim().slice(0, 60) || null;

    const { error } = await admin
      .from('athlete_heats')
      .update({ prep: { checks, lineup, strategy, mantra } })
      .eq('id', heatId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[competitions] saveMyHeatPrep failed', e);
    return { ok: false, error: 'Could not save your heat prep.' };
  }
}

// ─── El coach ve el ranking del grupo (como en la app HP) ───
//
// El ranking semanal es del GRUPO: nombres y puntos de todos los atletas HP
// (eso mismo veían coaches y atletas en la app vieja). Gate E1: es parte del
// seguimiento, no expone check-ins ni datos privados — solo puntos.

export async function coachGetWeeklyRanking(
  portalToken: string
): Promise<{ ok: boolean; week_start: string | null; week_end: string | null; rows: { student_id: string; name: string; points: number; position: number }[] }> {
  try {
    const admin = createAdminClient();
    const { data: coach, error: cErr } = await admin
      .from('coaches')
      .select('id, hp_escalon, course_access_granted')
      .eq('portal_token', portalToken)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!coach || !coach.course_access_granted || (coach.hp_escalon ?? 0) < 1) {
      return { ok: true, week_start: null, week_end: null, rows: [] };
    }
    const today = elSalvadorToday();
    const { monday, sunday } = svWeekBounds(today);
    const rows = await computeWeekRanking(admin, monday, sunday);
    return { ok: true, week_start: monday, week_end: sunday, rows };
  } catch (e) {
    console.error('[competitions] coachGetWeeklyRanking failed', e);
    return { ok: false, week_start: null, week_end: null, rows: [] };
  }
}
