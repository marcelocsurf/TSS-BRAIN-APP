// Learning Profile (VAKR) — TSS Inclusion Module
//
// Single source of truth for the 4 learning channels. Content sourced from
// https://marcelocsurf.github.io/learning-quiz/ which Marcelo authored and
// deployed. Tips below are the coach-facing guidance the quiz already
// shows the student; we re-surface them on the coach side of the app so
// the coach can scan them before each session.

export type LearningChannel = 'V' | 'K' | 'A' | 'R';

export interface LearningProfileInfo {
  channel: LearningChannel;
  icon: string;
  name: string;
  shortName: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  /** Coach-facing — how to teach a student dominant in this channel. */
  coachTips: string[];
}

export const LEARNING_PROFILES: Record<LearningChannel, LearningProfileInfo> = {
  V: {
    channel: 'V',
    icon: '👁',
    name: 'Visual Learner',
    shortName: 'Visual',
    color: '#00897B',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    description:
      'Learns best by seeing. Demonstrations, video, sand diagrams, and visual references help build a mental map before trying.',
    coachTips: [
      'Demonstrate clearly before every new skill',
      'Use sand diagrams and hand gestures to show positioning',
      'Video review is extremely valuable for this student',
      'Position yourself where the student can see you',
      'Use before/after comparisons for correction',
    ],
  },
  K: {
    channel: 'K',
    icon: '🤲',
    name: 'Kinesthetic Learner',
    shortName: 'Kinesthetic',
    color: '#43A047',
    bg: 'bg-green-50',
    border: 'border-green-200',
    description:
      'Learns best by doing and feeling. Body understands before the mind. Physical reps, land drills, and getting in the water quickly is the fastest path.',
    coachTips: [
      'Minimize long explanations — get them moving fast',
      'Land drills are essential — feel the movement on solid ground first',
      'Physical guidance works well — adjust stance, guide shoulders',
      'Short repetition cycles — attempt → feedback → attempt in 30 seconds',
      'Skateboard / balance board drills are high-value between sessions',
    ],
  },
  A: {
    channel: 'A',
    icon: '🧠',
    name: 'Analytical Learner',
    shortName: 'Analytical',
    color: '#7B1FA2',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    description:
      'Learns best through logic, structure, and clear explanation. Wants to understand WHY before doing. Labels, sequences, and criteria give confidence.',
    coachTips: [
      'Explain the purpose of each drill — they need the "why"',
      'Use precise language with specific cues and numbers',
      'Define success criteria — "you\'ve got it when X happens"',
      'Respect their questions — they need logic, not compliance',
      'The TSS Block System names are natural anchors for this learner',
    ],
  },
  R: {
    channel: 'R',
    icon: '❤️',
    name: 'Relational Learner',
    shortName: 'Relational',
    color: '#E53935',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    description:
      'Learns best when feeling safe and connected. Trust, encouragement, and the energy of the session matter as much as the technique itself.',
    coachTips: [
      'Build rapport first — name, eye contact, calm tone',
      'Create one small win before adding any complexity',
      'Frame corrections positively — "great effort, now try this"',
      'Be physically present and visible — "I\'m here, I can see you"',
      'Pair with a partner when possible — relational learners thrive with peers',
    ],
  },
};

export const LEARNING_CHANNELS: LearningChannel[] = ['V', 'K', 'A', 'R'];

export interface LearningProfileScores {
  V: number;
  K: number;
  A: number;
  R: number;
}
