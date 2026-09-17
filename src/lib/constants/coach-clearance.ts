// ═══ Habilitación del coach por nivel (Marcelo 2026-09-17) ═══
// Regla: un coach puede dar un servicio de cinta X solo si su "Max Belt"
// (coaches.max_belt_permission, se otorga en /coaches/[id]) es X o mayor.
// La regla NO bloquea (a veces toca asignar y capacitar antes de la fecha):
// deja una nota visible donde el coordinador asigna y en el calendario.
import { BELT_DISPLAY, BELT_RANK, type BeltLevel } from './belts';

const LEVEL_TO_BELT: Record<string, BeltLevel> = {
  Beginner: 'white_belt',
  Novice: 'yellow_belt',
  Foundation: 'blue_belt',
  Emerging: 'purple_belt',
  'Pre-Elite': 'brown_belt',
  Elite: 'black_belt',
};

/** Cinta que exige la plantilla: includes_course_key primero, si no el level_name. Custom/yoga/etc → null. */
export function campBeltFromTemplate(
  tpl: { includes_course_key?: string | null; level_name?: string | null } | null | undefined,
): BeltLevel | null {
  if (!tpl) return null;
  const k = tpl.includes_course_key as BeltLevel | null | undefined;
  if (k && k in BELT_RANK) return k;
  return LEVEL_TO_BELT[String(tpl.level_name ?? '')] ?? null;
}

export function beltLevelName(belt: BeltLevel | null): string {
  return belt ? BELT_DISPLAY[belt].levelName : '';
}

export type CoachClearance =
  | { ok: true }
  | { ok: false; note: string; campLevel: string; coachLevel: string };

export function coachClearance(coachMaxBelt: string | null | undefined, campBelt: BeltLevel | null): CoachClearance {
  if (!campBelt) return { ok: true };
  const mb = (coachMaxBelt ?? null) as BeltLevel | null;
  const coachRank = mb && mb in BELT_RANK ? BELT_RANK[mb] : 0;
  if (coachRank >= BELT_RANK[campBelt]) return { ok: true };
  const campLevel = beltLevelName(campBelt);
  const coachLevel = mb && mb in BELT_RANK ? beltLevelName(mb) : 'no level yet';
  return {
    ok: false,
    campLevel,
    coachLevel,
    note: `This coach is not cleared to teach ${campLevel} (cleared up to: ${coachLevel}). You can still assign them; plan the certification before the start date. Clearance is set in the coach profile (Max Belt).`,
  };
}
