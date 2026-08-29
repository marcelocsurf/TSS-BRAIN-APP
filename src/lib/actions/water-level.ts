'use server';

// ═══ TU NIVEL EN EL AGUA — la línea de seguridad, APARTE de la cinta ═══
//
// Marcelo (2026-08-29, mirando la guía de cinta): "no me convence que salga
// eso de los niveles ahí… debería ser una cosa aparte para saber si eres
// autónomo o qué requisitos necesitas, no tanto parte de esta evaluación".
//
// Tiene razón por doctrina: la CINTA es técnica, el AGUA es seguridad — y en
// la evaluación oficial del coach el nivel de agua no bloquea la cinta. Esta
// vista responde SU propia pregunta: ¿qué me falta para entrar solo?
//
// La escalera L1-L5 completa con lo que pide cada nivel, dónde está hoy (solo
// si un coach lo validó — el provisional del quiz no se afirma), y la flotada
// larga como marca de honor.

import { createAdminClient } from '@/lib/supabase/admin';
import {
  LEVEL_REQUIREMENTS,
  WATER_TESTS,
  LONG_FLOAT_MINUTES,
  isLongFloat,
  lastByTestAndLevel,
  meetsRequirement,
  type WaterTestResultRow,
} from '@/lib/constants/water-tests';
import {
  OCEAN_LEVELS,
  OCEAN_LEVEL_INFO,
  type OceanLevel,
} from '@/lib/constants/ocean-levels';

export interface WaterLevelTest {
  key: string;
  name: string;
  proves: string;
  target: number | null;
  unit: 'min' | 'm' | null;
  passed: boolean;
  measured: number | null;
}

export interface WaterLevelRung {
  key: OceanLevel;
  tier: number;
  name: string;
  cleared: string;
  tests: WaterLevelTest[];
  isCurrent: boolean;
  isNext: boolean;
  isCleared: boolean;
}

export interface WaterLevelData {
  /** null = sin nivel CONFIRMADO por un coach (el provisional no se afirma). */
  currentLevel: OceanLevel | null;
  currentLevelName: string | null;
  currentCleared: string | null;
  /** true = el nivel que hay es el del quiz de ingreso, sin validar. */
  provisional: boolean;
  nextLevelName: string | null;
  ladder: WaterLevelRung[];
  longFloatMinutes: number;
  longFloatDone: boolean;
}

export async function getWaterLevel(
  token: string,
): Promise<{ ok: true; data: WaterLevelData } | { ok: false; error: string }> {
  if (!token) return { ok: false, error: 'Missing token.' };
  const admin = createAdminClient();
  const { data: student } = await admin
    .from('students')
    .select('id, ocean_level, ocean_level_provisional')
    .eq('portal_token', token)
    .maybeSingle();
  if (!student) return { ok: false, error: 'Student not found.' };

  const provisional = !!(student as any).ocean_level_provisional;
  const raw = ((student as any).ocean_level || null) as OceanLevel | null;
  // El nivel se AFIRMA solo si un coach lo validó en el agua.
  const confirmed = raw && !provisional && OCEAN_LEVEL_INFO[raw] ? raw : null;
  const currentTier = confirmed ? OCEAN_LEVEL_INFO[confirmed].tier : 0;
  const next = confirmed
    ? ((OCEAN_LEVELS[OCEAN_LEVELS.indexOf(confirmed) + 1] as OceanLevel) ?? null)
    : ('supervised' as OceanLevel);

  let rows: WaterTestResultRow[] = [];
  try {
    const { data } = await admin
      .from('water_tests')
      .select('test_key, target_level, passed, measured')
      .eq('student_id', student.id)
      .order('tested_at', { ascending: false });
    rows = (data ?? []) as WaterTestResultRow[];
  } catch {
    rows = [];
  }
  const last = lastByTestAndLevel(rows);

  const ladder: WaterLevelRung[] = OCEAN_LEVELS.map((lv) => {
    const info = OCEAN_LEVEL_INFO[lv];
    return {
      key: lv,
      tier: info.tier,
      name: info.name,
      cleared: info.cleared,
      tests: (LEVEL_REQUIREMENTS[lv] ?? []).map((r) => {
        const t = WATER_TESTS.find((w) => w.key === r.test);
        const lr: any = last.get(`${r.test}:${lv}`);
        return {
          key: r.test,
          name: t?.nameEn ?? t?.name ?? r.test,
          proves: t?.provesEn ?? '',
          target: r.target,
          unit: t?.unit ?? null,
          passed: meetsRequirement(last, lv, r),
          measured: lr?.measured ?? null,
        };
      }),
      isCurrent: lv === confirmed,
      isNext: lv === next,
      isCleared: info.tier < currentTier,
    };
  });

  return {
    ok: true,
    data: {
      currentLevel: confirmed,
      currentLevelName: confirmed ? OCEAN_LEVEL_INFO[confirmed].name : null,
      currentCleared: confirmed ? OCEAN_LEVEL_INFO[confirmed].cleared : null,
      provisional: !confirmed,
      nextLevelName: next ? OCEAN_LEVEL_INFO[next].name : null,
      ladder,
      longFloatMinutes: LONG_FLOAT_MINUTES,
      longFloatDone: rows.some((r: any) => r.passed && isLongFloat(r.test_key, r.measured)),
    },
  };
}
