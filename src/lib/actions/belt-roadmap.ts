'use server';

// ═══ QUÉ LE FALTA AL ALUMNO PARA SU PRÓXIMA CINTA ═══
//
// Pedido de Marcelo (2026-08-28): "que el alumno pueda ver realmente cuáles
// son todos los requisitos que debe cumplir para aprobar… debería de ser toda
// la info que se llena en la evaluación de nivel que hace el coach, pero como
// si fuera una guía".
//
// El alumno YA tenía las piezas sueltas —sus estrellas en el curso, el próximo
// movimiento en el Home— pero nunca la REGLA (4★ en cada parte de cada
// secuencia) ni la lista completa ni cuánto le falta. Y lo del agua no existía
// para él: vivía solo del lado del coach.
//
// Esto no inventa ni pide nada nuevo: es la evaluación del coach dada vuelta.
// Misma fuente, mismo umbral, mismas secciones acumulativas.

import { createAdminClient } from '@/lib/supabase/admin';
import { getMySequence } from '@/lib/actions/sequence';
import { getCourseCatalog } from '@/lib/actions/course';
import { GRADUATION_RULES } from '@/lib/constants/graduation';
import { type BeltLevel } from '@/lib/constants/belts';
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

export interface RoadmapSequence {
  id: string;
  order: number;
  name: string;
  belt: string;
  /** owned = lograda · working = hay un paso por debajo del umbral ·
   *  partial/unrated = todavía sin ver. */
  state: 'owned' | 'working' | 'partial' | 'unrated';
  /** El paso que la frena y sus estrellas. */
  weakestStepId: string | null;
  weakestTitle: string | null;
  minRating: number | null;
  totalSteps: number;
}

export interface RoadmapWaterTest {
  key: string;
  /** Lo que se le pide, sin número si la prueba no lleva medida. */
  name: string;
  proves: string;
  target: number | null;
  unit: 'min' | 'm' | null;
  passed: boolean;
  measured: number | null;
  testedAt: string | null;
}

/** Un escalón de la escalera del agua, con lo que pide. */
export interface RoadmapOceanLevel {
  key: OceanLevel;
  tier: number;
  name: string;
  /** Dónde puede entrar con ese nivel. */
  cleared: string;
  tests: RoadmapWaterTest[];
  /** Donde está hoy. */
  isCurrent: boolean;
  /** El que sigue: el único que cuenta para "cuánto me falta". */
  isNext: boolean;
  /** Ya lo pasó (está por debajo de donde está hoy). */
  isCleared: boolean;
}

export interface BeltRoadmap {
  studentFirstName: string;
  currentBelt: string;
  /** La cinta que se está persiguiendo. Igual a currentBelt cuando su próxima
   *  cinta todavía no tiene requisitos publicados. */
  targetBelt: string;
  targetBeltLabel: string;
  /** true = no hay regla publicada para la próxima cinta; se muestra el
   *  estándar de la que ya tiene. */
  targetIsCurrent: boolean;
  passStars: number;
  sequences: RoadmapSequence[];
  sequencesOwned: number;
  /** Lo que el coach todavía no vio: pendiente, no reprobado. */
  sequencesUnseen: number;
  // ── Agua ──
  oceanLevel: OceanLevel | null;
  oceanLevelName: string | null;
  oceanLevelCleared: string | null;
  oceanLevelProvisional: boolean;
  nextOceanLevel: OceanLevel | null;
  nextOceanLevelName: string | null;
  /** Las pruebas del PRÓXIMO nivel — las que cuentan para "cuánto me falta". */
  waterTests: RoadmapWaterTest[];
  /** La escalera entera: qué pide cada nivel, de abajo hacia arriba. */
  oceanLadder: RoadmapOceanLevel[];
  longFloatMinutes: number;
  longFloatDone: boolean;
  // ── Curso ──
  preCourseCompleted: boolean;
  lessonsCompleted: number;
  lessonsTotal: number;
  // ── Autonomía (solo la cinta que la pide) ──
  autonomyPrinciples: string[];
  // ── Lo último que le dijo su coach ──
  coachFocus: string | null;
  /** Las cintas con requisitos publicados, para poder mirar cualquiera. */
  availableBelts: Array<{ key: string; label: string }>;
  /** La cinta que le toca a ÉL (para marcarla entre las demás). */
  ownTargetBelt: string;
}

const BELT_ORDER: BeltLevel[] = [
  'white_belt',
  'yellow_belt',
  'blue_belt',
  'purple_belt',
  'brown_belt',
  'black_belt',
];

/** La cinta siguiente a la que ya tiene. null si ya está en la última. */
function nextBelt(belt: string): string | null {
  const i = BELT_ORDER.indexOf(belt as BeltLevel);
  if (i < 0) return BELT_ORDER[1];
  return BELT_ORDER[i + 1] ?? null;
}

function nextOcean(level: OceanLevel | null): OceanLevel | null {
  if (!level) return 'supervised';
  const i = OCEAN_LEVELS.indexOf(level);
  return (OCEAN_LEVELS[i + 1] as OceanLevel) ?? null;
}

/**
 * El camino a la próxima cinta, leído con el token del portal (el token ES el
 * auth, igual que el resto de las acciones del portal).
 *
 * Invariante #2: estados esperables se DEVUELVEN, no se lanzan.
 */
export async function getBeltRoadmap(
  token: string,
  /** Mirar los requisitos de OTRA cinta (Marcelo 2026-08-28: "si pongo en
   *  white que salga ese, si pongo blue que salga ese"). Sin esto, la que le
   *  toca. */
  beltOverride?: string,
): Promise<{ ok: true; data: BeltRoadmap } | { ok: false; error: string }> {
  if (!token) return { ok: false, error: 'Missing token.' };
  const admin = createAdminClient();

  const { data: student } = await admin
    .from('students')
    .select('id, first_name, belt_level, ocean_level, ocean_level_provisional, next_recommended_focus')
    .eq('portal_token', token)
    .maybeSingle();
  if (!student) return { ok: false, error: 'Student not found.' };

  const currentBelt = (student as any).belt_level || 'white_belt';
  const candidate = nextBelt(currentBelt);
  // Solo White, Yellow y Blue tienen requisitos publicados. Para las de arriba
  // se muestra el estándar de la cinta que ya tiene — decir "no publicado" es
  // más honesto que inventar una regla.
  const ownTargetBelt =
    candidate && GRADUATION_RULES[candidate] ? candidate : currentBelt;
  // La cinta que se está mirando: la pedida si tiene requisitos publicados,
  // si no la suya. Un valor inventado nunca pasa de acá.
  const targetBelt =
    beltOverride && GRADUATION_RULES[beltOverride] ? beltOverride : ownTargetBelt;
  const rule = GRADUATION_RULES[targetBelt] ?? GRADUATION_RULES.white_belt;

  // Las secuencias, con el MISMO corte acumulativo que usa la evaluación del
  // coach: getMySequence(belt) trae White→…→belt.
  let sequences: RoadmapSequence[] = [];
  try {
    const seq = await getMySequence(student.id, targetBelt);
    sequences = seq.sequences.map((s) => ({
      id: s.id,
      order: s.order,
      name: s.name,
      belt: s.belt,
      state: s.state,
      weakestStepId: s.weakestStepId,
      weakestTitle: s.weakestTitle,
      minRating: s.minRating,
      totalSteps: s.items.length,
    }));
  } catch {
    // Sin secuencias la guía igual sirve: el agua y el curso se muestran.
    sequences = [];
  }

  // El agua. La tabla puede no existir en un entorno sin la migración 00171:
  // la guía no se cae por eso.
  const oceanLevel = ((student as any).ocean_level || null) as OceanLevel | null;
  const target = nextOcean(oceanLevel);
  const reqs = target ? LEVEL_REQUIREMENTS[target] ?? [] : [];
  let rows: any[] = [];
  try {
    const { data } = await admin
      .from('water_tests')
      .select('test_key, target_level, passed, measured, tested_at')
      .eq('student_id', student.id)
      .order('tested_at', { ascending: false });
    rows = data ?? [];
  } catch {
    rows = [];
  }
  // Vale el ÚLTIMO resultado de cada (prueba, NIVEL) — la misma prueba se toma
  // en varios niveles con marcas distintas y el historial no se pisa.
  const lastByKey = lastByTestAndLevel(rows as WaterTestResultRow[]);

  // Una prueba, con lo que se le pide y lo que ya demostró.
  // El alumno lee inglés (voz de marca); el coach ve el nombre en español en
  // la ficha. Misma fuente, dos rótulos.
  const buildTest = (
    level: string,
    r: { test: string; target: number | null },
  ): RoadmapWaterTest => {
    const t = WATER_TESTS.find((w) => w.key === r.test);
    const last: any = lastByKey.get(`${r.test}:${level}`);
    return {
      key: r.test,
      name: t?.nameEn ?? t?.name ?? r.test,
      proves: t?.provesEn ?? '',
      target: r.target,
      unit: t?.unit ?? null,
      // MISMA regla que la ficha del coach: la prueba de ESE nivel, y llegando
      // a su marca. Sin esto, flotar 1 minuto daba por cumplidos los 3.
      passed: meetsRequirement(lastByKey, level, r as any),
      measured: last?.measured ?? null,
      testedAt: last?.tested_at ?? null,
    };
  };

  const waterTests: RoadmapWaterTest[] = target
    ? reqs.map((r) => buildTest(target, r))
    : [];

  // LA ESCALERA COMPLETA (pedido de Marcelo 2026-08-28: "tiene que decir todos
  // los requisitos, no solo que sepa flotar… también lo que habíamos dicho para
  // cada nivel"). Antes solo se veía el escalón siguiente, y el alumno no tenía
  // forma de saber qué le van a pedir más arriba.
  const currentTier = oceanLevel ? OCEAN_LEVEL_INFO[oceanLevel]?.tier ?? 1 : 0;
  const oceanLadder: RoadmapOceanLevel[] = OCEAN_LEVELS.map((lv) => {
    const info = OCEAN_LEVEL_INFO[lv];
    return {
      key: lv,
      tier: info.tier,
      name: info.name,
      cleared: info.cleared,
      tests: (LEVEL_REQUIREMENTS[lv] ?? []).map((r) => buildTest(lv, r)),
      isCurrent: lv === oceanLevel,
      isNext: lv === target,
      isCleared: info.tier < currentTier,
    };
  });
  const longFloatDone = rows.some((r) => r.passed && isLongFloat(r.test_key, r.measured));

  // El curso. No bloquea la cinta (decisión de Marcelo): se ve como requisito
  // visible, no como candado.
  //
  // Se cuentan SOLO las lecciones de las cintas que entran en esta evaluación
  // (rule.sections), no el catálogo entero. La pestaña Course dice "0 de 198"
  // porque cuenta todo lo que existe; acá 198 sería una montaña que ni siquiera
  // se le pide. El pre-curso sí sale del catálogo: es la misma puerta que abre
  // las secuencias.
  let preCourseCompleted = false;
  let lessonsCompleted = 0;
  let lessonsTotal = 0;
  try {
    const cat = await getCourseCatalog(student.id);
    preCourseCompleted = !!cat.preCourseCompleted;
    const mine = (cat.lessons ?? []).filter((l: any) =>
      rule.sections.includes(l.course_section),
    );
    lessonsTotal = mine.length;
    lessonsCompleted = mine.filter((l: any) => l.completed).length;
  } catch {
    /* el curso es informativo: si falla, la guía sigue */
  }

  return {
    ok: true,
    data: {
      studentFirstName: (student as any).first_name ?? 'there',
      currentBelt,
      targetBelt,
      targetBeltLabel: rule.beltLabel,
      targetIsCurrent: targetBelt === currentBelt && targetBelt === ownTargetBelt,
      ownTargetBelt,
      availableBelts: BELT_ORDER.filter((b) => GRADUATION_RULES[b]).map((b) => ({
        key: b,
        label: GRADUATION_RULES[b].beltLabel,
      })),
      passStars: rule.stpThreshold,
      sequences,
      sequencesOwned: sequences.filter((s) => s.state === 'owned').length,
      sequencesUnseen: sequences.filter(
        (s) => s.state === 'unrated' || s.state === 'partial',
      ).length,
      oceanLevel,
      oceanLevelName: oceanLevel ? OCEAN_LEVEL_INFO[oceanLevel]?.name ?? null : null,
      oceanLevelCleared: oceanLevel ? OCEAN_LEVEL_INFO[oceanLevel]?.cleared ?? null : null,
      oceanLevelProvisional: !!(student as any).ocean_level_provisional,
      nextOceanLevel: target,
      nextOceanLevelName: target ? OCEAN_LEVEL_INFO[target]?.name ?? null : null,
      waterTests,
      oceanLadder,
      longFloatMinutes: LONG_FLOAT_MINUTES,
      longFloatDone,
      preCourseCompleted,
      lessonsCompleted,
      lessonsTotal,
      autonomyPrinciples: rule.principles,
      coachFocus: (student as any).next_recommended_focus || null,
    },
  };
}
