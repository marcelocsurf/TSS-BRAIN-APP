// Ocean self-sufficiency taxonomy — 5 levels.
// Independent from belt_level. Determined by ocean quiz at intake (provisional)
// and confirmed/adjusted by the coach via OceanLevelPanel.
//
// The threshold that matters operationally: between 'supervised' (L2) and
// 'semi_autonomous' (L3) — at L3 a student can SELF-LAUNCH where they cannot
// touch the bottom, but only in small conditions and known spots.

export const OCEAN_LEVELS = [
  'beginner',
  'supervised',
  'semi_autonomous',
  'autonomous',
  'advanced',
] as const;

export type OceanLevel = (typeof OCEAN_LEVELS)[number];

export const OCEAN_LEVEL_INFO: Record<
  OceanLevel,
  { tier: number; name: string; short: string; cleared: string }
> = {
  beginner: {
    tier: 1,
    name: 'Beginner — Not Ready',
    short: 'L1',
    cleared: 'Whitewater only, with feet down or assisted',
  },
  supervised: {
    tier: 2,
    name: 'Supervised',
    short: 'L2',
    cleared: 'Whitewater up to waist, coach must be at side',
  },
  semi_autonomous: {
    tier: 3,
    name: 'Semi-Autonomous',
    short: 'L3',
    cleared: 'Self-launch in waist-to-chest in known spots; basic etiquette + turtle roll',
  },
  autonomous: {
    tier: 4,
    name: 'Autonomous',
    short: 'L4',
    cleared: 'Up to head-high, known spots, clean conditions, alone',
  },
  advanced: {
    tier: 5,
    name: 'Advanced',
    short: 'L5',
    cleared: 'Overhead and complex conditions, alone',
  },
};

export function oceanLevelByTier(tier: number): OceanLevel {
  const clamped = Math.max(1, Math.min(5, Math.round(tier)));
  return OCEAN_LEVELS[clamped - 1];
}
