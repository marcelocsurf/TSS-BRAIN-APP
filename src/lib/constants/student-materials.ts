// Student Portal Materials — organized by belt level
// Each material has an id, title, description, belt level requirement,
// category (video/guide/drill-pack), and a placeholder URL.

import type { BeltLevel } from '@/lib/constants/belts';

export type MaterialCategory = 'video' | 'guide' | 'drill-pack';

export interface StudentMaterial {
  id: string;
  title: string;
  description: string;
  beltLevel: BeltLevel;
  category: MaterialCategory;
  url: string;
}

export const STUDENT_MATERIALS: StudentMaterial[] = [
  // ── White Belt ──
  {
    id: 'wb-01',
    title: 'Getting Started',
    description: 'Welcome to The Surf Sequence. Learn the system, your belt path, and how sessions work.',
    beltLevel: 'white_belt',
    category: 'guide',
    url: '#',
  },
  {
    id: 'wb-02',
    title: 'Water Safety Basics',
    description: 'Ocean awareness, rip currents, board handling, and essential safety protocols.',
    beltLevel: 'white_belt',
    category: 'video',
    url: '#',
  },
  {
    id: 'wb-03',
    title: 'Board Fundamentals',
    description: 'Paddling position, pop-up foundations, and board control on flat water.',
    beltLevel: 'white_belt',
    category: 'drill-pack',
    url: '#',
  },

  // ── Yellow Belt ──
  {
    id: 'yb-01',
    title: 'Paddling Mastery',
    description: 'Efficient paddle stroke, duck diving, turtle rolls, and lineup positioning.',
    beltLevel: 'yellow_belt',
    category: 'video',
    url: '#',
  },
  {
    id: 'yb-02',
    title: 'Wave Reading',
    description: 'Understanding swell direction, wave selection, and timing your takeoff.',
    beltLevel: 'yellow_belt',
    category: 'guide',
    url: '#',
  },
  {
    id: 'yb-03',
    title: 'Pop-Up Technique',
    description: 'Step-by-step pop-up drills, common mistakes, and land practice routines.',
    beltLevel: 'yellow_belt',
    category: 'drill-pack',
    url: '#',
  },

  // ── Blue Belt ──
  {
    id: 'bb-01',
    title: 'Bottom Turn Guide',
    description: 'The foundation of all surfing maneuvers. Rail engagement and weight transfer.',
    beltLevel: 'blue_belt',
    category: 'video',
    url: '#',
  },
  {
    id: 'bb-02',
    title: 'Line Selection',
    description: 'Reading the wave face, choosing your line, and connecting sections.',
    beltLevel: 'blue_belt',
    category: 'guide',
    url: '#',
  },
  {
    id: 'bb-03',
    title: 'Pump & Speed',
    description: 'Generating speed through the wave, rail-to-rail transitions, and flow.',
    beltLevel: 'blue_belt',
    category: 'drill-pack',
    url: '#',
  },

  // ── Purple Belt ──
  {
    id: 'pb-01',
    title: 'Maneuver Library',
    description: 'Cutback, snap, floater, re-entry — technique breakdowns and progressions.',
    beltLevel: 'purple_belt',
    category: 'video',
    url: '#',
  },
  {
    id: 'pb-02',
    title: 'Competition Prep',
    description: 'Heat strategy, priority rules, wave selection under pressure, and scoring.',
    beltLevel: 'purple_belt',
    category: 'guide',
    url: '#',
  },
  {
    id: 'pb-03',
    title: 'Advanced Tactics',
    description: 'Reading conditions for maneuver selection, section analysis, and commitment.',
    beltLevel: 'purple_belt',
    category: 'drill-pack',
    url: '#',
  },

  // ── Brown Belt ──
  {
    id: 'brb-01',
    title: 'Tube Riding Guide',
    description: 'Barrel entry, positioning, stall techniques, and exit strategies.',
    beltLevel: 'brown_belt',
    category: 'video',
    url: '#',
  },
  {
    id: 'brb-02',
    title: 'Air Game Foundations',
    description: 'Ramp selection, launch mechanics, body rotation, and landing technique.',
    beltLevel: 'brown_belt',
    category: 'guide',
    url: '#',
  },
  {
    id: 'brb-03',
    title: 'Performance Analysis',
    description: 'Video analysis methodology, self-assessment tools, and progression tracking.',
    beltLevel: 'brown_belt',
    category: 'drill-pack',
    url: '#',
  },

  // ── Black Belt ──
  {
    id: 'blb-01',
    title: 'Master Class',
    description: 'Elite-level wave reading, power surfing, and competitive excellence.',
    beltLevel: 'black_belt',
    category: 'video',
    url: '#',
  },
  {
    id: 'blb-02',
    title: 'Self-Coaching Framework',
    description: 'Build your own training plans, self-evaluate, and design progressive sessions.',
    beltLevel: 'black_belt',
    category: 'guide',
    url: '#',
  },
  {
    id: 'blb-03',
    title: 'Teaching Methodology',
    description: 'The TSS methodology from the teacher\'s perspective. Foundations for coaching.',
    beltLevel: 'black_belt',
    category: 'drill-pack',
    url: '#',
  },
];

// Helper: get materials accessible by a student given their belt training level
// and their purchased/unlocked access levels
export function getMaterialsForStudent(
  beltLevel: BeltLevel,
  unlockedLevels: BeltLevel[]
): { unlocked: StudentMaterial[]; locked: StudentMaterial[] } {
  const accessLevels = new Set([beltLevel, ...unlockedLevels]);

  const unlocked: StudentMaterial[] = [];
  const locked: StudentMaterial[] = [];

  for (const mat of STUDENT_MATERIALS) {
    if (accessLevels.has(mat.beltLevel)) {
      unlocked.push(mat);
    } else {
      locked.push(mat);
    }
  }

  return { unlocked, locked };
}

// Category display helpers
export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  video: 'Video',
  guide: 'Guide',
  'drill-pack': 'Drill Pack',
};

export const MATERIAL_CATEGORY_ICONS: Record<MaterialCategory, string> = {
  video: '▶',
  guide: '📖',
  'drill-pack': '🏋️',
};
