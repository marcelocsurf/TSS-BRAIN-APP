// Belt rank + level mapping shared by SessionPlanner, coach portal, and
// the template builder. Centralized so we have one source of truth for
// "which drills belong to this belt/level".

export const BELT_RANK: Record<string, number> = {
  white: 1,
  yellow: 2,
  blue: 3,
  purple: 4,
  brown: 5,
  black: 6,
};

// "white_belt" → "white" / pass-through when already short.
export function shortBelt(belt: string | null | undefined): string {
  if (!belt) return '';
  return belt.replace(/_belt$/, '');
}

// "Beginner" → "white_belt", "Novice" → "yellow_belt", etc.
// Used by the template builder to map its level_name field to a belt
// so we can filter drills + STPs to what makes sense for the template.
export function levelNameToBelt(levelName: string): string {
  const m: Record<string, string> = {
    Beginner: 'white_belt',
    Novice: 'yellow_belt',
    Foundation: 'blue_belt',
    Intermediate: 'blue_belt',
    Emerging: 'purple_belt',
    Advanced: 'purple_belt',
    'Pre-Elite': 'brown_belt',
    Elite: 'black_belt',
  };
  return m[levelName] ?? 'white_belt';
}

// Filter drills_missions rows down to those at or below the given belt.
// Generic over any record that has a `belt` field with a short-form value.
export function filterDrillsByBelt<T extends { belt?: string | null }>(
  drills: T[],
  maxBelt: string,
): T[] {
  const max = BELT_RANK[shortBelt(maxBelt)] ?? 6;
  return drills.filter((d) => (BELT_RANK[d.belt ?? 'white'] ?? 1) <= max);
}
