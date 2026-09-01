// Mental cues del portal del alumno — doctrina de "One Wave" (Marcelo
// Castellanos) traducida a producto.
//
// Los anteriores eran aforismos genéricos ("Style is the residue of trust")
// que podían venir de cualquier libro de mindset. Marcelo pidió que dijeran lo
// del libro pero SIN contarlo como su historia personal: la idea y la
// enseñanza directa. Por eso ninguno arranca en primera persona.
//
// Tres piezas por cinta:
//   · mirror — qué se siente estar en ESTE nivel, desde adentro (One Wave,
//     cap. 5). No motiva: valida. Es la escena del waterman francés hecha
//     producto — "estás exactamente donde deberías estar".
//   · cue    — la enseñanza.
//   · today  — una acción concreta para la próxima sesión. El libro sostiene
//     que el sistema nervioso no se adapta al entendimiento sino a la
//     práctica con atención (cap. 7, ed. final), así que una frase suelta
//     contradice su propia tesis.
//
// De cara al alumno → inglés.

export interface MentalCue {
  cue: string;
  today: string;
}

/** El espejo del nivel: siempre visible, no rota. */
export const BELT_MIRROR: Record<string, string> = {
  white_belt:
    'The ocean is alive and the board is not yet familiar. You fall more than you stand. That is the level — not you failing.',
  yellow_belt:
    'You can stand up. Now you are learning what to do with that. Consistency is what is missing, and it is missing on schedule.',
  blue_belt:
    'Real skills — and now the gaps are visible. What worked in easy conditions is starting to break. That is the level.',
  purple_belt:
    'You are building a real game and dismantling it at the same time. Every new piece breaks something else, temporarily.',
  brown_belt:
    'The technique is there. The mental game is the frontier now.',
  black_belt:
    'You are not chasing the next level. You are refining this one. The work is subtle and the margins are small.',
};

export const MENTAL_CUES: Record<string, MentalCue[]> = {
  white_belt: [
    { cue: 'Focus is not something you have. It is something you train.', today: 'Pick one point on the wave and hold your eyes there.' },
    { cue: 'Do not paddle out carrying the whole day. Take out the trash first — acknowledge it, then set it down.', today: 'Name one thing you are carrying. Leave it on the sand.' },
    { cue: 'Curiosity learns faster than performance. “What happens if I try this?” opens the nervous system. “Will I succeed?” closes it.', today: 'Ask the first one.' },
    { cue: 'The breath runs on automatic all day — and it is one of the few controls you can take any moment you choose. Fight discomfort and it wins. Slow the breath and your relationship to it changes.', today: 'Three slow breaths before you paddle out.' },
    { cue: 'Thirty seconds. Three breaths. One focus. Nothing on one session. Decisive over a hundred.', today: 'Do not skip the thirty seconds.' },
    { cue: 'One wave at a time. The next one does not exist yet.', today: 'Reset to zero after every wave.' },
  ],
  yellow_belt: [
    { cue: 'Free surfing and training are different activities. One is expression, the other is intervention. Both are valid — confusing them is the mistake.', today: 'Decide which one you are doing before you paddle out.' },
    { cue: 'One objective per session. Not the best wave of your life — one correct execution.', today: 'Name your one thing before the water.' },
    { cue: 'Ten objectives means ten switch costs. That is ten chances for focus to collapse.', today: 'Cut your list to one.' },
    { cue: 'After the session, one question: did I work on what I came to work on? If yes, it was training — even if it looked ugly.', today: 'Ask it before you leave the beach.' },
    { cue: 'Progress here is not a better best day. It is the gap between your best and your average slowly narrowing.', today: 'Judge the session against your average, not your best.' },
    { cue: 'Four misses and one correct rep is a successful training session.', today: 'One clean rep is enough.' },
  ],
  blue_belt: [
    { cue: 'One of the best jiu-jitsu coaches in the world put it this way: the price of evolution is temporarily leaving your comfort zone, with the certainty that the regression you feel is part of the process.', today: 'When it feels worse, keep going.' },
    { cue: 'Frustration is not a verdict on your ability. It is a signal to interpret — sometimes something new is being built, sometimes the challenge needs adjusting.', today: 'Ask which one it is, then take the next wave.' },
    { cue: 'Building a new skill makes everything temporarily worse. Timing breaks. Reads slow down. That is evidence of change.', today: 'Accept being worse this week.' },
    { cue: 'If this level feels harder than the last one, you are reading it right.', today: 'You are not failing. You are at Foundation.' },
    { cue: '“I already know” closes the door. “Let me find out” leaves it open.', today: 'Test one thing you are sure about.' },
    { cue: 'This is where most surfers stop — not the beginners, the competent ones who will not give up the version of themselves they built.', today: 'Do not back off to comfortable.' },
  ],
  purple_belt: [
    { cue: 'The channel lives between boredom and anxiety. Too easy and the mind wanders. Too hard and the body tightens. Flow is not the zone — it is what can arrive inside it.', today: 'Was it too easy or too hard? Adjust the next one.' },
    { cue: 'Flow breaks four ways: comparison, outcome focus, wrong challenge, unclear intention. All four are attention leaving the present.', today: 'Notice which one takes you out.' },
    { cue: 'Expect nothing. Enjoy everything. Not a philosophy — a tool for when the gap between expectation and reality tightens you up.', today: 'Feel the tightness? Say it out loud and let the image go.' },
    { cue: 'Believing surfing should feel good every time does more damage than any other expectation. It turns every session into a verdict.', today: 'Allow yourself an uncomfortable session.' },
    { cue: 'Flow cannot be forced, but its conditions can be built: right challenge, right board, clear intention. Over hundreds of sessions, probability becomes pattern.', today: 'Build one condition instead of hoping for the feeling.' },
    { cue: 'Progress here is impossible manoeuvres becoming possible — while things you owned stop working for a while.', today: 'Count what is opening, not what is breaking.' },
  ],
  brown_belt: [
    { cue: 'You do not train to think faster in the decisive moment. You train so that everything you have built is available when the moment demands it.', today: 'Take one skill into pressure, again, until pressure feels familiar.' },
    { cue: 'The technique is already there. What limits you now is psychological.', today: 'Name the mental factor, not the technical one.' },
    { cue: 'Adaptation happens in recovery, not in training. Improvement does not always happen in the water — sometimes it happens when you step away.', today: 'If the plan says rest, resting is the training.' },
    { cue: 'A plan that only trains technique always has a ceiling. Physical, technical, tactical, mental — the mental is structural, not an add-on.', today: 'Name which pillar is actually limiting you.' },
    { cue: 'Test it first with nothing at stake, then with something at stake. That is what reveals whether the skill is real.', today: 'Put something on the line.' },
    { cue: 'Progress here is the gap between practice and competition closing.', today: 'Compare your worst competitive wave to your average free surf.' },
  ],
  black_belt: [
    { cue: 'The nervous system does not adapt to understanding. It adapts to practice — attempting, failing, adjusting, attempting again, with attention.', today: 'Take one idea into the water instead of reading one more.' },
    { cue: 'The intelligent surfer understands. The wise surfer paddles out.', today: 'Go.' },
    { cue: 'Without ritual you operate from reaction. With it, the session has a centre.', today: 'Do it on the day you least feel like it.' },
    { cue: 'How much do you actually want this — knowing what it costs? Both answers are complete. Just choose consciously.', today: 'Answer honestly.' },
    { cue: 'Every missed wave. Every magical session. Every morning when nothing worked. That is the surf. All of it.', today: 'Celebrate one small win out loud.' },
    { cue: 'Mastery is the courage to do the simple thing one more time — and to teach it the way you wish someone had taught you.', today: 'Give one cue to a surfer below your level.' },
  ],
};

/**
 * El cue de esta sesión. Rota por SESIONES CERRADAS, no por día del calendario:
 * el bloque trae un "Today", así que tiene que cambiar cuando el alumno
 * entrena — no a medianoche mientras duerme.
 */
export function cueForSession(beltLevel: string, sessionsCompleted: number): MentalCue {
  const list = MENTAL_CUES[beltLevel] ?? MENTAL_CUES.white_belt;
  const i = Math.abs(Math.trunc(sessionsCompleted || 0)) % list.length;
  return list[i];
}
