// Belt hierarchy — Canon B.3
// Single source of truth for ordering, display names, and colors

export type BeltLevel =
  | 'white_belt'
  | 'yellow_belt'
  | 'blue_belt'
  | 'purple_belt'
  | 'brown_belt'
  | 'black_belt';

export const BELT_HIERARCHY: BeltLevel[] = [
  'white_belt',
  'yellow_belt',
  'blue_belt',
  'purple_belt',
  'brown_belt',
  'black_belt',
];

export const BELT_RANK: Record<BeltLevel, number> = {
  white_belt: 1,
  yellow_belt: 2,
  blue_belt: 3,
  purple_belt: 4,
  brown_belt: 5,
  black_belt: 6,
};

export interface BeltDisplay {
  en: string;
  es: string;
  color: string;
  levelName: string;
}

export const BELT_DISPLAY: Record<BeltLevel, BeltDisplay> = {
  white_belt: { en: 'White Belt', es: 'Cinta Blanca', color: '#E8E8E8', levelName: 'Beginner' },
  yellow_belt: { en: 'Yellow Belt', es: 'Cinta Amarilla', color: '#F5C518', levelName: 'Novice' },
  blue_belt: { en: 'Blue Belt', es: 'Cinta Azul', color: '#1E6FBF', levelName: 'Foundation' },
  purple_belt: { en: 'Purple Belt', es: 'Cinta Morada', color: '#7B4FBE', levelName: 'Emerging' },
  brown_belt: { en: 'Brown Belt', es: 'Cinta Café', color: '#7D4E27', levelName: 'Pre-Elite' },
  black_belt: { en: 'Black Belt', es: 'Cinta Negra', color: '#111111', levelName: 'Elite' },
};

export function getBeltRank(belt: BeltLevel): number {
  return BELT_RANK[belt];
}

export function canCoachBelt(coachMax: BeltLevel, studentBelt: BeltLevel): boolean {
  return getBeltRank(coachMax) >= getBeltRank(studentBelt);
}

export function getBeltLabel(belt: BeltLevel, lang: 'en' | 'es' = 'en'): string {
  const d = BELT_DISPLAY[belt];
  return lang === 'es'
    ? `${d.es} (${d.levelName})`
    : `${d.en} — ${d.levelName}`;
}
