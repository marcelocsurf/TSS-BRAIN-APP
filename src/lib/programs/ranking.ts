import { createAdminClient } from '@/lib/supabase/admin';
import { toElSalvadorDate } from '@/lib/utils/tz';

// ─── Ranking semanal HP — fórmula compartida (admin, coach, atleta, ficha) ───
//
// Calca la fórmula de puntos de la app HP adaptada a lo que BRAIN captura:
//   día del programa MARCADO ............... 30   (máx UNO por día calendario)
//   check-in hecho .......................... 10
//   sueño: ≥8→20 · ≥7→15 · ≥6→10 · ≥5→5
//   agua:  ≥8→10 · ≥6→7  · ≥4→4  · >0→1
//   dieta anotada ........................... 15
//   energía (1-4) × 1.25 (máx 5)
// Máximo teórico por día: 90. Semana = lunes a domingo (El Salvador).
//
// REGLAS DURAS (salieron de la revisión adversarial, no quitarlas):
// - Se rankea por ALUMNO, nunca por asignación: un alumno con dos asignaciones
//   activas (datos sucios) o rotado a mitad de semana es UNA fila.
// - Los puntos de la semana viven donde se registraron: se cuentan marks y
//   check-ins de TODAS las asignaciones del alumno (activas o canceladas) —
//   una rotación de programa no puede borrar lo ya entrenado.
// - Las marks se acotan por done_at EN SQL (con margen de huso ±1 día):
//   PostgREST corta en 1000 filas en silencio y sin el filtro el ranking
//   descontaría puntos arbitrarios cuando crezca el historial.
// - Máximo UN +30 por día calendario SV: marcar 5 días atrasados un domingo
//   no puede regalar 150 puntos (y los backfills de edición tampoco suman).

export interface RankRow {
  student_id: string;
  name: string;
  points: number;
  position: number;
}

export function svWeekBounds(todaySV: string): { monday: string; sunday: string } {
  const d = new Date(todaySV + 'T12:00:00Z');
  const dn = d.getUTCDay() || 7;
  const mon = new Date(d); mon.setUTCDate(d.getUTCDate() - (dn - 1));
  const sun = new Date(mon); sun.setUTCDate(mon.getUTCDate() + 6);
  const fmt = (x: Date) => x.toISOString().slice(0, 10);
  return { monday: fmt(mon), sunday: fmt(sun) };
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function sleepPts(h: number | null): number {
  if (h == null) return 0;
  if (h >= 8) return 20; if (h >= 7) return 15; if (h >= 6) return 10; if (h >= 5) return 5; return 0;
}

function waterPts(g: number | null): number {
  if (g == null) return 0;
  if (g >= 8) return 10; if (g >= 6) return 7; if (g >= 4) return 4; if (g > 0) return 1; return 0;
}

export async function computeWeekRanking(
  admin: ReturnType<typeof createAdminClient>,
  weekStart: string,
  weekEnd: string
): Promise<RankRow[]> {
  // Roster: alumnos con asignación ACTIVA — una fila por ALUMNO.
  const { data: asg, error: aErr } = await admin
    .from('program_assignments')
    .select('student_id, students(first_name, last_name)')
    .eq('status', 'active');
  if (aErr) throw aErr;
  if (!asg || asg.length === 0) return [];
  const roster = new Map<string, string>();
  for (const a of asg as any[]) {
    if (!roster.has(a.student_id)) {
      roster.set(a.student_id, `${a.students?.first_name ?? ''} ${a.students?.last_name ?? ''}`.trim() || '—');
    }
  }
  const studentIds = Array.from(roster.keys());

  // TODAS las asignaciones de esos alumnos (cualquier status) — los puntos de
  // la semana no se pierden por una rotación de programa.
  const { data: allAsg, error: allErr } = await admin
    .from('program_assignments')
    .select('id, student_id')
    .in('student_id', studentIds);
  if (allErr) throw allErr;
  const asgToStudent = new Map<string, string>((allAsg ?? []).map((a: any) => [a.id, a.student_id]));
  const allIds = Array.from(asgToStudent.keys());
  if (allIds.length === 0) return [];

  const [marks, checkins] = await Promise.all([
    admin.from('program_day_marks')
      .select('assignment_id, done_at')
      .in('assignment_id', allIds)
      // margen ±1 día para el corrimiento UTC↔SV; el ajuste fino sigue en JS
      .gte('done_at', shiftDate(weekStart, -1) + 'T00:00:00Z')
      .lte('done_at', shiftDate(weekEnd, 2) + 'T00:00:00Z'),
    admin.from('program_checkins')
      .select('assignment_id, checkin_date, sleep_hours, water_glasses, energy, nutrition')
      .in('assignment_id', allIds)
      .gte('checkin_date', weekStart).lte('checkin_date', weekEnd),
  ]);
  if (marks.error) throw marks.error;
  if (checkins.error) throw checkins.error;

  const pts = new Map<string, number>();
  const markedDays = new Set<string>(); // `${student_id}|${svDate}` — un +30 por día
  for (const m of marks.data ?? []) {
    const student = asgToStudent.get(m.assignment_id);
    if (!student) continue;
    const sv = toElSalvadorDate(m.done_at);
    if (!sv || sv < weekStart || sv > weekEnd) continue;
    const key = `${student}|${sv}`;
    if (markedDays.has(key)) continue;
    markedDays.add(key);
    pts.set(student, (pts.get(student) ?? 0) + 30);
  }
  const checkinDays = new Set<string>(); // dedup por si dos asignaciones comparten fecha
  for (const c of checkins.data ?? []) {
    const student = asgToStudent.get(c.assignment_id);
    if (!student) continue;
    const key = `${student}|${c.checkin_date}`;
    if (checkinDays.has(key)) continue;
    checkinDays.add(key);
    let p = 10; // check-in hecho
    p += sleepPts(c.sleep_hours != null ? Number(c.sleep_hours) : null);
    p += waterPts(c.water_glasses);
    if ((c.nutrition ?? '').trim()) p += 15;
    p += Math.min(5, (c.energy ?? 0) * 1.25);
    pts.set(student, (pts.get(student) ?? 0) + p);
  }

  return studentIds
    .map((sid) => ({
      student_id: sid,
      name: roster.get(sid) ?? '—',
      points: Math.round((pts.get(sid) ?? 0) * 10) / 10,
    }))
    .sort((x, y) => y.points - x.points)
    .map((r, i) => ({ ...r, position: i + 1 }));
}
