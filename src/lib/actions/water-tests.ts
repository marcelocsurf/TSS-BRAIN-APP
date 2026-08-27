'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import {
  LEVEL_REQUIREMENTS,
  type LevelRequirement,
} from '@/lib/constants/water-tests';
import { OCEAN_LEVELS, type OceanLevel } from '@/lib/constants/ocean-levels';

/**
 * Pruebas de agua de un alumno. Se guarda el HISTORIAL: una prueba se puede
 * repetir y vale la última. A diferencia de las estrellas, acá no se pisa
 * nada — un resultado viejo no se pierde nunca.
 */

export interface WaterTestRow {
  id: string;
  test_key: string;
  target_level: string;
  passed: boolean;
  measured: number | null;
  conditions: string | null;
  notes: string | null;
  tested_at: string;
}

export async function getWaterTests(
  studentId: string
): Promise<{ ok: true; rows: WaterTestRow[] } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('water_tests')
    .select('id, test_key, target_level, passed, measured, conditions, notes, tested_at')
    .eq('student_id', studentId)
    .order('tested_at', { ascending: false });
  // La tabla puede no existir todavía (migración 00171 sin aplicar): la ficha
  // no se cae por eso.
  if (error) return { ok: false, error: error.message };
  return { ok: true, rows: (data ?? []) as WaterTestRow[] };
}

export async function recordWaterTest(input: {
  studentId: string;
  testKey: string;
  targetLevel: string;
  passed: boolean;
  measured?: number | null;
  conditions?: string | null;
  notes?: string | null;
  coachId?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const { error } = await admin.from('water_tests').insert({
    student_id: input.studentId,
    test_key: input.testKey,
    target_level: input.targetLevel,
    passed: input.passed,
    measured: input.measured ?? null,
    conditions: input.conditions?.trim() || null,
    notes: input.notes?.trim() || null,
    tested_by: input.coachId ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/students/${input.studentId}`);
  return { ok: true };
}

/**
 * Hasta qué nivel de océano llega el alumno CON PRUEBAS PASADAS.
 *
 * Es acumulativo: para `autonomous` hacen falta también las de
 * `semi_autonomous`. Devuelve el nivel más alto cuyos requisitos —y los de
 * todos los anteriores— están cubiertos por el último resultado de cada prueba.
 *
 * No cambia `students.ocean_level` por su cuenta: eso lo decide el coach. Esto
 * le dice qué está respaldado por una prueba y qué es solo criterio.
 */
export async function earnedOceanLevel(
  studentId: string
): Promise<{
  earned: OceanLevel | null;
  missing: { level: OceanLevel; requirement: LevelRequirement }[];
}> {
  const res = await getWaterTests(studentId);
  if (!res.ok) return { earned: null, missing: [] };

  // El último resultado de cada (prueba, nivel).
  const last = new Map<string, WaterTestRow>();
  for (const r of res.rows) {
    const k = `${r.test_key}:${r.target_level}`;
    if (!last.has(k)) last.set(k, r); // vienen ordenadas desc
  }

  const order = OCEAN_LEVELS.filter((l) => LEVEL_REQUIREMENTS[l]);
  let earned: OceanLevel | null = null;
  const missing: { level: OceanLevel; requirement: LevelRequirement }[] = [];

  for (const level of order) {
    const reqs = LEVEL_REQUIREMENTS[level] ?? [];
    const ok = reqs.every((req) => {
      const r = last.get(`${req.test}:${level}`);
      if (!r || !r.passed) return false;
      if (req.target === null) return true;
      return r.measured != null && Number(r.measured) >= req.target;
    });
    if (ok && (earned === null || true)) earned = level;
    else {
      for (const req of reqs) {
        const r = last.get(`${req.test}:${level}`);
        const done =
          r && r.passed && (req.target === null || (r.measured != null && Number(r.measured) >= req.target));
        if (!done) missing.push({ level, requirement: req });
      }
      break; // es acumulativo: no se salta un nivel
    }
  }

  return { earned, missing };
}
