-- ═══ Forward Momentum · herramienta de toda cinta (Marcelo 2026-09-30) ═══
-- "Sí, así los 3 momentos" · estrella a STP-019: sí · misión completa en UNA ola
-- (tres olas en tres sesiones para darla por suya): sí · el momento 3 (cuando
-- perdés velocidad) va SOLO dentro de la completa.
-- La página es TOOL-MOMENTUM (src/lib/sequence-pages/tools-seq.ts); esto es su
-- contenido en la base. Respaldos en ops.*_backup_2026_09_30_momentum.
-- Idempotente: UPDATE con valores fijos; INSERT … ON CONFLICT; la regla nueva
-- solo si no existe. Si un cambio no entra, el DO final aborta todo.

-- 1 · Lección STP-019 (el alumno): manos, los tres momentos, autochequeos, nombre del drill.
update public.lessons set
  description_md = $md$## What it is

Generate **forward momentum** during a ride using the canonical momentum — flex knees, touch toward water, push extension forward. The momentum is the movement you make; the forward momentum is the real action — the speed and energy you create and then carry, so the board keeps flowing instead of stalling.

When the wave dies or the foam slows, your ride dies — unless you generate forward momentum. That is what extends rides. Without momentum, technique dies; with it, every manoeuvre that comes later becomes possible.

## Key points

Knee flex; Hand reach toward water; Forward push; Body extension; Forward momentum

## How your body does it

The surfer flexes forward by bringing the chest toward the knees and bending the legs, then touches the water and pushes forward with one or two hands. At the same time, the body and legs extend, releasing stored energy and projecting it forward. This helps the board regain speed and stability.
- **Success Indicator 1:** Uses the hands against the water with clear intention to generate forward momentum.
- **Success Indicator 2:** Combines flexion and extension instead of only touching the water with no real push.
- **Success Indicator 3:** Recovers speed and stability when getting stuck, slowing down, or losing balance.
- **Drill Reference:** Forward Momentum Drill
- **Coach Cue:** Momentum. Touch the water. Push forward.
- **Common Errors:** No leg flexion; chest not moving forward; looking down; half movement with no real push; not extending after the touch; not using the tool when speed is needed.

## Frontside · Backside

The same momentum, one hand or two:

- **Frontside — mostly one hand:** get low · touch the water with your leading hand · push yourself forward doing a pump · back to posture.
- **Backside — two hands:** get low · touch the water with two hands, grab the water · push yourself forward · back to posture.
- **Stuck in the foam and you need speed:** two hands, grab the water and push yourself forward.

## When you use it

Three moments, at every belt:

1. **At the start of the wave, right after the pop-up.** It gives you a push forward.
2. **After a maneuver.** It is how you finish it: you create forward momentum out of the maneuver, then back to posture.
3. **Any time you feel you are losing speed** — or you get stuck in the water or the foam.

The complete mission is the three moments, on one wave. You can also train a moment on its own: right after the pop-up, or after a maneuver.

Momentum is a fundamental: it does not change by belt and it is not part of any sequence. You learn it once, here, and your coach can give it to you in any training, at any belt.

## The 5 words of this step

`FLEX · TOUCH · PUSH · EXTEND · MOMENTUM`

This is how the movement is built, in order. Learn them on land, in the drill, until you can run them without thinking — if you still can't, stay in the drill.

**In the water you carry one intention. It takes one of two forms.**

**The mission** — when the job is to execute this step: *"Today: Momentum."* That is your objective for the session, and one of the five words above can ride along with it if you want.

**A word** — when one specific thing is failing. Pick the one that is breaking and make it your only job for the session.

Which one you carry is not decided in the water. Your coach gives it to you as your next focus, or you choose it on the sand — before you paddle out. Five words in your head on a wave is five things to think about, and that is what breaks flow.

## How you know you have it

- Right after the pop-up, you push yourself forward.
- After a maneuver, the momentum finishes it and you are back in posture.
- Every time the board loses speed or gets stuck, you fire it on your own — and the board accelerates.

**Doctrinal rule:** These self-checks describe execution, not a count — reps and time go in your practice plan. Your coach confirms mastery in the water.$md$,
  errors_md = $md$- Not extending fully
- Missing the moment: right after the pop-up, after a maneuver, or when the board slows
- Touching water too soon
- Extension goes up instead of forward$md$,
  updated_at = now()
where id = 'STP-019';

-- 2 · Capa del coach (COACH-STP-019): la misma herramienta, sus momentos y cómo validarla.
update public.lessons set
  subtitle = 'Pillar: Technical  |  Block: Block 4  |  Tool · every belt',
  coach_what_md = $md$Generate forward momentum during a ride using the canonical momentum — flex knees, touch toward water, push extension forward. The momentum is the movement you make; the forward momentum is the real action — the speed and energy you create and then carry, so the board keeps flowing instead of stalling.

**Frontside · Backside — the same momentum, one hand or two:**
- **Frontside — mostly one hand:** get low · touch the water with your leading hand · push yourself forward doing a pump · back to posture.
- **Backside — two hands:** get low · touch the water with two hands, grab the water · push yourself forward · back to posture.
- **Stuck in the foam and needs speed:** two hands, grab the water and push forward.

**When you use it — three moments, at every belt:**
1. At the start of the wave, right after the pop-up — a push forward.
2. After a maneuver — it is how they finish it: forward momentum out of the maneuver, then back to posture.
3. Any time they feel they are losing speed or getting stuck in the water or the foam.

The complete mission is the three moments, on one wave. You can also prescribe a moment on its own: right after the pop-up, or after a maneuver. Momentum is a fundamental: it does not change by belt and it is not part of any sequence — you can prescribe it in any training, at any belt.

**Key concepts to convey:** Knee flex; Hand reach toward water; Forward push; Body extension; Forward momentum
**5 KEY WORDS to plant in the student's vocabulary:** `FLEX · TOUCH · PUSH · EXTEND · MOMENTUM`$md$,
  coach_deliver_md = $md$EXPLAIN: momentum mechanics — flex (chest toward the knees, legs bend) / touch (one or both hands to the water) / push (a real push, not a half-touch) / extend forward (body and legs spring ahead — forward, not up). Frontside: mostly the leading hand. Backside, or stuck in the foam: two hands, grab the water. Name the three moments: right after the pop-up; after a maneuver, to finish it; any time the board loses speed or gets stuck. DEMONSTRATE: from Power Posture on a stationary board, then on a slowly rolling skateboard. PARTICIPATE: live execution at the moment you prescribed — right after the pop-up, after a maneuver, or when the board slows — back to posture after each one. FEEDBACK: confirm the board accelerates after the motion.

**COACH NOTE:** Timing is everything, and each moment has its trigger: right after the pop-up · the end of the maneuver · the board losing speed or getting stuck. Too late = the ride ends.$md$,
  coach_errors_md = $md$| Error | What you see | What you say | What you do |
|---|---|---|---|
| Not extending fully | Half movement, no push | Full push. Extend. | Sand: flex, touch, push, extend — all four phases |
| Missing the moment | Waits after the pop-up, lets the maneuver end without it, or fires when the board has already stalled | Pop-up, maneuver, losing speed: that's when. | Call "now" at the moment you prescribed |
| Touching the water too soon | Hands go down before the knees bend | Flex first. Then touch. | Chest to the knees first, then the hands reach down |
| Extension goes up, not forward | Body pops upward, board does not gain speed | Forward, not up. | Spring ahead; back to posture after the push |
| Wrong hands | One hand backside, or one hand when stuck in the foam | Backside or stuck: two hands. | Frontside: mostly the leading hand. Backside or stuck in the foam: two hands, grab the water |$md$,
  coach_validate_md = $md$Validate with the mission criteria, exactly as the student reads them:

1. Right after the pop-up you push yourself forward.
2. After your maneuver, the momentum finishes it and you are back in posture.
3. When the board loses speed or gets stuck, you fire it on your own — two hands when you are stuck in the foam.
4. Every time: flex, touch, a real push — not a half-touch — and extend forward, not up.

**Promote when the criteria hold across sessions.**$md$,
  updated_at = now()
where id = 'COACH-STP-019';

-- 3 · Quiz (alumno y coach): "impulse" → momentum; la P1 marcaba como INCORRECTO el momento 1.
update public.lesson_quizzes set
  question = 'When do you use the momentum on a ride?',
  options = '[{"text":"Right after the pop-up, after a maneuver, and any time you lose speed or get stuck","correct":true},{"text":"Only when the foam is slowing","correct":false},{"text":"When you''re falling","correct":false},{"text":"Before you stand up","correct":false}]'::jsonb
where id in ('082ac429-039b-4c6a-a290-901bcca51407', '12ed3944-68c8-4640-a470-4e5d72489638');
update public.lesson_quizzes set question = 'What does the momentum motion look like?'
where id in ('c152f8d1-a444-4524-a128-a8ccb1af1a55', '15e71d03-1eb1-4118-8096-79b99dc506c5');
update public.lesson_quizzes set question = 'What does a successful momentum produce?'
where id in ('b970c2ec-04fc-4eb1-af1d-b53a96e83b37', 'e6be6abf-c758-46fb-97bc-ee003853f82d');

-- 4 · Doctrina viva: la regla nueva reemplaza la del 2026-09-10 ("en los cierres") y la de "Impulse".
insert into public.doctrine_rules (step_id, sequence_id, belt, topic, rule_en, rule_es, rationale, source, decided_on, status, supersedes, applies_to)
select
  'STP-019', null, 'all',
  'Forward Momentum: one tool at every belt, three moments',
  $en$Forward Momentum is a fundamental, not a belt skill: the same technique and the same lesson (STP-019) at every belt, and it belongs to no sequence. You flex and push yourself forward with two hands (backside, or whenever you are stuck in the foam and need speed) or with one hand (mostly frontside), then back to posture. It is used at three moments: (1) at the start of the wave, right after the pop-up — it gives a push forward; (2) after a maneuver — it is how you finish it and create forward momentum, then back to posture; (3) any time you feel you are losing speed or getting stuck in the water or the foam. The complete mission is the three moments on one wave (it is yours after three waves across three sessions); a specific mission is one moment: right after the pop-up, or after a maneuver. The third moment lives only inside the complete mission. The drill is dry-land from posture; the mission is in the water. It is not a Let's Play sequence: it is logged with its missions, the coach prescribes it in any training at any belt, and its star goes to STP-019.$en$,
  $es$Forward Momentum (el impulso) es un fundamento, no una habilidad de cinta: la misma técnica y la misma lección (STP-019) en todas las cintas, y no es parte de ninguna secuencia. Flexionás y te impulsás hacia adelante con las dos manos (backside, o cada vez que estás trabado en la espuma y necesitás velocidad) o con una mano (sobre todo frontside), y volvés a postura. Se usa en tres momentos: 1) al iniciar la ola, apenas hacés el pop-up, te da un impulso hacia adelante; 2) después de una maniobra, como forma de finalizarla y crear momentum hacia adelante, y después a postura; 3) cada vez que sentís que te quedás sin velocidad o trabado en el agua o en la espuma. La misión completa son los tres momentos en una ola (es tuya con tres olas en tres sesiones); una misión específica es un momento: en el pop-up o después de una maniobra. El tercer momento vive solo dentro de la completa. El drill es en seco desde la postura; la misión, en el agua. No es una secuencia de Let's Play: se registra con sus misiones, el coach la receta en cualquier entreno y en cualquier cinta, y su estrella va a STP-019.$es$,
  $r$Marcelo 2026-09-30, dictado mientras armaba su clase: el impulso tiene que poder recetarse en el entreno. "Sí, así los 3 momentos": "después de una maniobra" y "en los cierres" pasan a ser un solo momento; el tercero es cuando te quedás sin velocidad o trabado en la espuma, y va solo dentro de la completa. Dos manos también cuando estás trabado en la espuma. Reemplaza la regla del 2026-09-10 y la de "Impulse" del 2026-09-02.$r$,
  'Marcelo', '2026-09-30', 'active', 'e4708e93-157e-4eb7-b699-769b5dab6974'::uuid,
  array['lesson', 'page', 'drill', 'mission', 'coach']
where not exists (
  select 1 from public.doctrine_rules where supersedes = 'e4708e93-157e-4eb7-b699-769b5dab6974'::uuid and decided_on = '2026-09-30'
);
update public.doctrine_rules set status = 'superseded', updated_at = now()
where id in ('e4708e93-157e-4eb7-b699-769b5dab6974'::uuid, '0b9834c1-8044-485f-9696-85065f21b599'::uuid);

-- 5 · Misiones. La COMPLETA = MIS-WB-019-A reescrita (display_order 1: la que evalúa STP-019).
update public.drills_missions set
  title = 'Forward Momentum — the Three Moments',
  key_words = array['flex', 'touch', 'push', 'extend', 'momentum'],
  block_name = 'Water · Forward Momentum',
  context = 'water',
  develops = 'Forward Momentum at its three moments',
  source = 'Marcelo', dictated_on = '2026-09-30', source_note = 'si, así los 3 momentos',
  description_md = $md$## What to do

One wave where you use the momentum at every moment the wave gives you: right after the pop-up, after your maneuver, and whenever the board loses speed or gets stuck in the water or the foam.

## How to execute it

1. Right after the pop-up: flex, touch, push, extend — a push forward to start the wave.
2. After your maneuver: finish it with the momentum, then back to posture.
3. When the board loses speed or gets stuck: fire it on your own — two hands when you are stuck in the foam.

Mostly one hand frontside; two hands backside.

## The cue

“Momentum. Touch the water. Push forward.”$md$,
  success_criteria = array[
    'Right after the pop-up you push yourself forward.',
    'After your maneuver, the momentum finishes it and you are back in posture.',
    'When the board loses speed or gets stuck, you fire it on your own — two hands when you are stuck in the foam.',
    'Every time: flex, touch, a real push — not a half-touch — and extend forward, not up.'
  ],
  updated_at = now()
where id = 'MIS-WB-019-A';

-- Las dos específicas (las que se recetan sueltas): después del pop-up · después de una maniobra.
-- Sus criterios = los indicadores de la página (el momento + el cuerpo del drill, tal cual).
insert into public.drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_name, display_order, active, student_visible, coach_visible, audience, context, develops, source, dictated_on, source_note)
values
('MIS-WB-019-B', 'STP-019', 'Momentum Right After the Pop-Up', 'mission',
 array['flex', 'touch', 'push', 'extend', 'momentum'],
 $md$## What to do

The first moment of Forward Momentum: at the start of the wave, right after the pop-up. It gives you a push forward.

## How to execute it

1. Pop up into posture.
2. Flex: knees bend, chest drops toward them.
3. Touch the water — mostly one hand frontside; two hands backside, or when you are stuck in the foam.
4. Push forward and extend — forward, not up.
5. Back to posture.

## The cue

“Momentum. Touch the water. Push forward.”$md$,
 array[
   'Right after the pop-up you push yourself forward.',
   'Flex: knees bend, chest drops toward them.',
   'Touch: one or both hands reach down and touch the water.',
   'Push: the hands push against the water — a real push, not a half-touch.',
   'Extend forward: body and legs spring ahead — forward, not up.'
 ],
 'white', 'Water · Forward Momentum', 2, true, true, true, '{}', 'water',
 'Forward Momentum · moment 1: the start of the wave', 'Marcelo', '2026-09-30', 'si, así los 3 momentos'),
('MIS-WB-019-C', 'STP-019', 'Momentum After a Maneuver', 'mission',
 array['flex', 'touch', 'push', 'extend', 'momentum'],
 $md$## What to do

The second moment: after a maneuver. The momentum is how you finish it — you create forward momentum out of the maneuver, then back to posture.

## How to execute it

1. Do your maneuver.
2. As it ends, flex: knees bend, chest drops toward them.
3. Touch the water — mostly one hand frontside; two hands backside.
4. Push forward and extend — forward, not up.
5. Back to posture.

## The cue

“Momentum. Touch the water. Push forward.”$md$,
 array[
   'After your maneuver, the momentum finishes it and you are back in posture.',
   'Flex: knees bend, chest drops toward them.',
   'Touch: one or both hands reach down and touch the water.',
   'Push: the hands push against the water — a real push, not a half-touch.',
   'Extend forward: body and legs spring ahead — forward, not up.'
 ],
 'white', 'Water · Forward Momentum', 3, true, true, true, '{}', 'water',
 'Forward Momentum · moment 2: finishing the maneuver', 'Marcelo', '2026-09-30', 'si, así los 3 momentos')
on conflict (id) do nothing;

-- 6 · El drill: nombre del bloque y la visualización de los tres momentos.
update public.drills_missions set
  block_name = 'Land · Forward Momentum',
  description_md = replace(description_md,
    'See yourself on a slowing board: flex, touch, push, extend — momentum returns.',
    'See yourself right after the pop-up, after a maneuver, and on a slowing board: flex, touch, push, extend — momentum returns.'),
  updated_at = now()
where id = 'DRL-WB-019-A';

-- 7 · Plantilla White v2, día 3: el impulso se recetaba como CIRCLE-BODY, y la
-- estrella del cierre caía en los cuatro pasos del círculo (Power Posture, giro,
-- Hold). Ahora es la herramienta: la estrella va solo a STP-019.
update public.camp_template_blocks set sequence_id = 'TOOL-MOMENTUM'
where id = 'SVC-CAMP-WB-V2-D3-B07' and sequence_id = 'CIRCLE-BODY';

-- 8 · Si algo no entró, se deshace todo.
do $check$
begin
  if exists (select 1 from public.lessons where id = 'STP-019' and (lower(description_md) like '%in the closures%' or description_md not like '%Any time you feel you are losing speed%')) then
    raise exception 'STP-019 no quedó con los tres momentos';
  end if;
  if exists (select 1 from public.lessons where id = 'COACH-STP-019' and (lower(coalesce(coach_what_md,'') || coalesce(coach_deliver_md,'')) like '%closures%' or coach_validate_md not like '%Right after the pop-up%')) then
    raise exception 'COACH-STP-019 sigue con los momentos viejos';
  end if;
  if (select count(*) from public.drills_missions where id in ('MIS-WB-019-A', 'MIS-WB-019-B', 'MIS-WB-019-C') and active) <> 3 then
    raise exception 'faltan misiones de Forward Momentum';
  end if;
  if exists (select 1 from public.drills_missions where id = 'MIS-WB-019-A' and title <> 'Forward Momentum — the Three Moments') then
    raise exception 'MIS-WB-019-A no se reescribió';
  end if;
  if exists (select 1 from public.drills_missions where id = 'DRL-WB-019-A' and description_md not like '%right after the pop-up, after a maneuver%') then
    raise exception 'el drill no se actualizó';
  end if;
  if exists (select 1 from public.lesson_quizzes where lesson_id in ('STP-019', 'COACH-STP-019') and lower(question) like '%impulse%') then
    raise exception 'quedó "impulse" en el quiz';
  end if;
  if (select count(*) from public.doctrine_rules where step_id = 'STP-019' and status = 'active') <> 1 then
    raise exception 'la doctrina de STP-019 no quedó con una sola regla activa';
  end if;
end
$check$;
