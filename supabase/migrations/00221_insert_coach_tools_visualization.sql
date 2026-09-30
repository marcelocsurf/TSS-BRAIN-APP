-- Coaching tools · Visualization (course_section = 'coach_tools').
--
-- Marcelo 2026-09-30: "son cursos para que los coaches estudien y entiendan
-- esas herramientas y las puedan utilizar". Aparte de la certificación (su
-- propio avance, sin examen), para los coaches con cursos completos — NO para
-- los que están en formación (safety_method) ni los sin cursos ('none'):
-- la regla vive en src/lib/coach/coach-lessons.ts.
--
-- Source: TSS_Visualization_Science_Training_Brand_v10 (Marcelo, 2026-07-29),
-- 20 slides. The slides are the plates (public/uploads/fotos/tools/visualization);
-- the text is the same slides in words, transcribed — nothing invented.
--   Lesson 1 = slides 1, 2, 3, 4, 5, 7 · Lesson 2 = slides 6, 8, 9, 10, 19, 20.
--   Left out: 12/14/16/18 (empty "insert audio" slides) and 17 (Purple Belt,
--   above the course). The guided scripts by belt (11, 13, 15) wait for
--   Marcelo: they clash with current doctrine (the White one on safety).
-- Idempotent: ON CONFLICT (id) DO UPDATE.

INSERT INTO lessons (
  id, course_section, step_number, title, subtitle, pillar,
  description_md, estimated_minutes, lesson_type, display_order, active
) VALUES

('COACH-TOOL-VIS-01', 'coach_tools', 1,
 'Visualization · why it works',
 'How your brain rehearses surfing without touching water',
 'Mental',
 $$![Visualization](/uploads/fotos/tools/visualization/vis-01.webp)
![Why visualization matters](/uploads/fotos/tools/visualization/vis-02.webp)
![The lemon experiment](/uploads/fotos/tools/visualization/vis-03.webp)
![The neuroscience](/uploads/fotos/tools/visualization/vis-04.webp)
![What the research says](/uploads/fotos/tools/visualization/vis-05.webp)
![Why visualization is perfect for surfing](/uploads/fotos/tools/visualization/vis-07.webp)

## Why it matters

Your brain cannot tell the difference between a vividly imagined experience and a real one.

When you visualize a movement, your brain activates the same neural pathways that fire during actual physical execution. The motor cortex, the cerebellum and the neuromuscular system all respond — even though your body is still.

- **d = 0.53** · effect size of mental practice on performance
- **50+ years** of scientific evidence supporting mental imagery
- **94%** of students salivated from lemon imagery alone

## The lemon experiment

Let's try it right now.

1. Close your eyes. Imagine you are in a kitchen.
2. On the counter, there is a bright yellow lemon.
3. Pick it up. Feel its weight. Feel the bumpy texture of the skin.
4. Now place it on a cutting board. Pick up a knife.
5. Cut the lemon in half. See the juice bead on the surface.
6. Smell the sharp, clean citrus scent.
7. Now cut a thin slice. Bring it to your mouth. Bite into it.

Is your mouth watering? Your brain just triggered a real physiological response from an imagined experience.

## The neuroscience

What happens in your brain during visualization:

- **Motor cortex activates.** The same brain regions that fire when you physically surf activate when you vividly imagine surfing.
- **Neural pathways strengthen.** Repeated mental rehearsal strengthens the neural connections for that movement — like carving a groove.
- **Sensory cortex responds.** Visual, auditory and kinesthetic brain areas all engage. Your brain processes imagery as a weak version of real perception.
- **Neuromuscular priming.** Tiny electrical signals travel to your muscles during imagery. Not enough to move, but enough to prime the pattern.

## What the research says

- **Feltz & Landers (1983).** First major meta-analysis: mental practice moderately benefits performance over no practice at all.
- **Driskell et al. (1994).** Controlled meta-analysis confirmed a moderate significant effect (d = 0.53) of mental practice on performance. Effect validated again in a 2020 follow-up.
- **Hardwick et al. (2018).** Neuroimaging studies confirm that mental imagery activates brain regions that partially overlap with those engaged in motor execution.
- **Jeannerod (2001).** Functional equivalence theory: motor imagery involves neural mechanisms similar to those operating during real action.
- **Cumming & Williams (2012).** Imagery effectiveness depends on frequency, duration and consistency. 2 sessions a week, 15–20 min each, is effective.
- **Peper et al. (2002).** 94% of 131 college students reported increased salivation from lemon imagery alone — demonstrating the mind-body connection.

## Why it is perfect for surfing

**You can't repeat a wave.** Every wave is different. You can't pause it, rewind it, or practice it again.

**But you CAN replay it in your mind.** Visualization gives you unlimited repetitions of situations the ocean only gives you once.

**And it works between sessions.** While other athletes can train daily, surfers depend on conditions. Visualization fills the gap.$$,
 10, 'reading', 6001, true),

('COACH-TOOL-VIS-02', 'coach_tools', 2,
 'Visualization · how to practice it',
 'PETTLEP · the 5 elements · 6 steps · how often · tips and mistakes',
 'Mental',
 $$![The PETTLEP model](/uploads/fotos/tools/visualization/vis-06.webp)
![5 elements of surf visualization](/uploads/fotos/tools/visualization/vis-08.webp)
![How to practice visualization](/uploads/fotos/tools/visualization/vis-09.webp)
![2x per week, 15–20 minutes](/uploads/fotos/tools/visualization/vis-10.webp)
![Tips and common mistakes](/uploads/fotos/tools/visualization/vis-19.webp)
![Use that](/uploads/fotos/tools/visualization/vis-20.webp)

## The PETTLEP model

Holmes & Collins (2001) — the most validated framework for sport imagery.

- **P · Physical.** Feel your body — weight, stance, board under feet.
- **E · Environment.** See the beach, hear the waves, smell the salt.
- **T · Task.** The specific skill: bottom turn, pop-up, paddle.
- **T · Timing.** Match the real speed — not slow motion.
- **L · Learning.** Adjust imagery as your skill improves.
- **E · Emotion.** Feel the confidence, excitement, calm focus.
- **P · Perspective.** First person (internal) or watching yourself (external).

## The 5 elements of surf visualization

1. **Breathing.** Feel your breath: deep inhale before paddling, exhale through the duck dive, calm rhythmic breathing while waiting. Breath is the foundation of everything.
2. **Paddling & entry.** Feel the water on your hands, the board gliding, the moment you commit to the wave. See the angle, feel the acceleration.
3. **The sequence.** Your specific sequence for your level: pop-up, posture, rotation, bottom turn, projection. Walk through each block in order.
4. **Controlled chaos.** Waves don't cooperate. Visualize turbulence: the wipeout, the hold-down, the unexpected set. Practice staying calm in imagined pressure.
5. **Wave completion.** See yourself riding the wave from takeoff to natural end. Multiple Infinite Circle loops. The complete architecture of surfing.

## How to practice · 6 steps

1. **Find a quiet place.** Sit or lie down. Close your eyes. 3 deep breaths to settle.
2. **Set the scene.** Where are you? What does the beach look like? Feel the sun, hear the waves.
3. **Choose ONE skill.** Don't visualize everything. Pick one: paddling, pop-up, bottom turn.
4. **Use all senses.** See it, feel it, hear it. The more vivid, the more effective.
5. **Real speed.** Don't slow it down. Match the real timing of the movement.
6. **Repeat 5–10 times.** Each repetition strengthens the neural pathway. Then open your eyes.

## How often

**2x per week. 15–20 minutes. Consistency over intensity.**

Cumming & Williams (2012): regular, manageable sessions reinforce neuromuscular pathways without cognitive fatigue.

Combine imagery with physical practice for maximum effect. Imagery alone works. Imagery + practice works better.

## Tips and common mistakes

- **Do · use first person.** See through your own eyes, not watching yourself from outside (internal > external for motor skills).
- **Do · include all senses.** Hear the wave, feel the spray, smell the salt. The more senses, the stronger the neural response.
- **Do · visualize success AND failure.** Practice staying calm during wipeouts. Mental composure training is as valuable as technique.
- **Don't · rush through it.** Real timing matters. If a bottom turn takes 2 seconds in reality, it should take 2 seconds in your mind.
- **Don't · visualize while distracted.** No phone, no noise, no interruptions. Focused attention is what activates the neural pathways.
- **Don't · skip it when you're tired.** Visualization works even when your body is fatigued. It's training that doesn't require physical energy.

## Your brain doesn't know you're not surfing

**Use that.**$$,
 12, 'reading', 6002, true)

ON CONFLICT (id) DO UPDATE SET
  course_section = EXCLUDED.course_section,
  step_number = EXCLUDED.step_number,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  pillar = EXCLUDED.pillar,
  description_md = EXCLUDED.description_md,
  estimated_minutes = EXCLUDED.estimated_minutes,
  lesson_type = EXCLUDED.lesson_type,
  display_order = EXCLUDED.display_order,
  active = EXCLUDED.active;
