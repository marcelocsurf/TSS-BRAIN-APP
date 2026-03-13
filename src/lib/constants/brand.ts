// Brand Manual v4.2 Ch. 7 — Voice & Language

export const BRAND = {
  name: 'The Surf Sequence',
  abbreviation: 'TSS',
  tagline: 'Evolve through play',
  appName: 'TSS Brain',

  colors: {
    navy: '#1A1A2E',
    gold: '#D4A843',
    white: '#FFFFFF',
  },

  // Approved vocabulary — use these in all UI copy
  vocabulary: [
    'Mission', 'Session', 'Level', 'Belt', 'Coach',
    'Methodology', 'Evolve', 'Progression', 'Certification',
    'System', 'Holistic', 'Structured', 'Scientific',
  ] as const,

  // Forbidden — never use in any TSS context
  forbidden: [
    'Surf School', 'Stoke', 'Shred', 'Gnarly',
    'Lifestyle Brand', 'Fun in the Sun', 'Overpromise',
  ] as const,
} as const;

export type Pilar = 'technical' | 'physical' | 'tactical' | 'mental';

export const PILARS: Pilar[] = ['technical', 'physical', 'tactical', 'mental'];

export const PILAR_LABELS: Record<Pilar, string> = {
  technical: 'Technical (TÉC)',
  physical: 'Physical (FÍS)',
  tactical: 'Tactical (TÁC)',
  mental: 'Mental (MEN)',
};

export type SessionStatus = 'not_yet' | 'partial' | 'competent' | 'mastered';

export const SESSION_STATUS_OPTIONS: { value: SessionStatus; label: string }[] = [
  { value: 'not_yet', label: 'Not Yet' },
  { value: 'partial', label: 'Partial' },
  { value: 'competent', label: 'Competent' },
  { value: 'mastered', label: 'Mastered' },
];

export type CoachRole = 'ayudante' | 'instructor' | 'coach' | 'head_coach' | 'holistic_coach';

export const COACH_ROLE_RANK: Record<CoachRole, number> = {
  ayudante: 1,
  instructor: 2,
  coach: 3,
  head_coach: 4,
  holistic_coach: 5,
};

export type OceanCondition = 'flat' | '1_2ft' | '3_4ft' | '4_6ft' | '6_plus';

export const OCEAN_CONDITIONS: { value: OceanCondition; label: string }[] = [
  { value: 'flat', label: 'Flat' },
  { value: '1_2ft', label: '1-2 feet' },
  { value: '3_4ft', label: '3-4 feet' },
  { value: '4_6ft', label: '4-6 feet' },
  { value: '6_plus', label: '6+ feet' },
];

export type RiskState = 'safe' | 'alert' | 'blocked';

export type CompletionState = 'draft' | 'in_progress' | 'closed' | 'survey_completed';
