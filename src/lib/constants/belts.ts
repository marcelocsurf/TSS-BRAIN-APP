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

// ─── TSS level vocabulary ───
// Single source of truth for the template editor + filters. Order
// goes entry → expert. Mirrors the belt progression above.
export const LEVEL_NAMES = [
  'Beginner',     // white belt
  'Novice',       // yellow belt
  'Foundation',   // blue belt
  'Emerging',     // purple belt
  'Pre-Elite',    // brown belt
  'Elite',        // black belt
] as const;

export type LevelName = (typeof LEVEL_NAMES)[number];

// Hex belt colour keyed by template's `level_name`.
export const LEVEL_BELT_COLOR: Record<string, string> = {
  Beginner: '#E8E8E8',
  Novice: '#F5C518',
  Foundation: '#1E6FBF',
  Emerging: '#7B4FBE',
  'Pre-Elite': '#7D4E27',
  Elite: '#111111',
};

// Human belt label per level. Used in the template-builder Level
// dropdown so the admin sees "Novice (Yellow Belt)" instead of just
// "Novice".
export const LEVEL_BELT_LABEL: Record<string, string> = {
  Beginner: 'White Belt',
  Novice: 'Yellow Belt',
  Foundation: 'Blue Belt',
  Emerging: 'Purple Belt',
  'Pre-Elite': 'Brown Belt',
  Elite: 'Black Belt',
};

// `lessons.course_section` values that belong to each level. A Novice
// template should see ITS OWN section AND every lower section so the
// admin can reuse foundational STPs from earlier belts. Used by the
// template-catalog server action.
const LEVEL_COURSE_SECTIONS: Record<string, string[]> = {
  Beginner: ['white_belt'],
  Novice: ['white_belt', 'yellow_belt'],
  Foundation: ['white_belt', 'yellow_belt', 'blue_belt'],
  Emerging: ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt'],
  'Pre-Elite': ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt'],
  Elite: ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'],
};

export function levelToCourseSections(levelName: string): string[] {
  return LEVEL_COURSE_SECTIONS[levelName] ?? ['white_belt'];
}

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
