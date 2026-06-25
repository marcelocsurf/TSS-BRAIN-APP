// Belt color themes — shared across the student dashboard (course + sequence)
// so every level reads with one consistent color language.
//
// White uses a pearl gray (pure white is invisible on white cards); Pre-Course
// gets a cool teal so it reads as foundational, not a belt.
//   accent — solid line / left border
//   bright — pops on the dark bg (rings + eyebrow)
//   tint   — soft card-header wash
//   ink    — readable text on the tint
export type BeltLevel = 'pre' | 'white' | 'yellow' | 'blue';

export interface BeltTheme {
  accent: string;
  bright: string;
  tint: string;
  ink: string;
}

export const BELT_THEMES: Record<BeltLevel, BeltTheme> = {
  pre:    { accent: '#0EA5A4', bright: '#2DD4BF', tint: '#F0FDFA', ink: '#0F766E' },
  white:  { accent: '#94A3B8', bright: '#CBD5E1', tint: '#F8FAFC', ink: '#475569' },
  yellow: { accent: '#EAB308', bright: '#FACC15', tint: '#FEFCE8', ink: '#A16207' },
  blue:   { accent: '#3B82F6', bright: '#60A5FA', tint: '#EFF6FF', ink: '#1D4ED8' },
};

// Accepts belt keys/labels in any form: 'white', 'white_belt', 'Yellow Belt', …
export function beltLevelFromString(belt: string | null | undefined): Exclude<BeltLevel, 'pre'> {
  const b = (belt || '').toLowerCase();
  if (b.includes('yellow')) return 'yellow';
  if (b.includes('blue')) return 'blue';
  return 'white';
}
