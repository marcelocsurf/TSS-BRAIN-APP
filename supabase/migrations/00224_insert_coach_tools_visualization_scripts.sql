-- Coaching tools · Visualization · lección 3: los guiones guiados por cinta.
--
-- Marcelo 2026-10-01: "sí, aprobados los guiones". Texto de las láminas 11
-- (White), 13 (Yellow) y 15 (Blue) del deck v10, con SOLO las frases que
-- chocaban con la doctrina corregidas (aprobadas una por una): starfish antes
-- del agua baja (seguridad), pop-up "front foot first or both together", Power
-- Posture, V2·V3·V4, FP2, la ola + las piernas, salida por el hombro, Hold sin
-- tiempo fijo, proyección con el brazo de adelante, Momentum → back to posture.
-- Va SOLO como texto: las láminas viejas dirían lo de antes y su letra no se
-- lee en el teléfono. El guion de Blue es frontside (el deck no trae backside).
-- Idempotente: ON CONFLICT (id) DO UPDATE.

INSERT INTO lessons (
  id, course_section, step_number, title, subtitle, pillar,
  description_md, estimated_minutes, lesson_type, display_order, active
) VALUES
('COACH-TOOL-VIS-03', 'coach_tools', 3,
 'Visualization · guided scripts by belt',
 'White · Yellow · Blue (frontside)',
 'Mental',
 $$## White Belt · Breathing, board & first wave

1. Close your eyes. Three deep breaths. In through the nose… out through the mouth.
2. You are on the beach. Feel the warm sand under your feet. Your board is next to you.
3. Pick up the board. Feel its weight. Walk toward the water. Feel the cool water on your ankles.
4. Lie on the board in the sweet spot. Feel the board float. Your chest is up, your legs are together.
5. Start paddling. Feel the water on your hands. Deep strokes. The board accelerates.
6. A whitewater wave approaches. You feel it push you. Cobra. Pop up: front foot first or both feet together, never the back foot first. Hips down, head up.
7. You are in Power Posture: knees bent, weight on the front leg, arms active. The foam pushes you toward shore.
8. Before the water gets shallow, you decide: starfish. Bend, open wide, fall back into the foam. You stand up next to your board. You smile.
9. Repeat the ride two more times in your mind. Each time, feel more confident. Breathe.

## Yellow Belt · Green wave commitment

1. Close your eyes. Three deep breaths. Let your body relax.
2. You are in the lineup. Sitting on your board. You can feel the ocean moving underneath you.
3. Look at the horizon. A set is coming. You see the wave you want.
4. Turn toward shore. Start paddling. V2 into position, V3 into the peak, V4 for the take-off. Feel the acceleration.
5. The wave lifts you. You feel the angle. Cobra — look left or right — pick your line.
6. Pop up. Front foot first or both feet together; front foot centred on the stringer, back foot in FP2. You are on the wave face.
7. You feel the speed. Slight compression. You move down the face. Look at the pocket.
8. Pump: compress down, extend up. Feel the speed build: the wave's energy and your legs, together.
9. The section ahead starts to close. You see the shoulder and go out, by choice. Deep breath. You are calm and focused.
10. Repeat. This time, feel the angle of the takeoff more clearly. Commit earlier.

## Blue Belt · Bottom turn, hold, projection · frontside

1. Close your eyes. Deep breath. Feel your body settle. You are already in the water.
2. You are on a wave. Moving fast. The face opens up in front of you.
3. You see the bottom approaching. Weight on the front foot. Elbow and forearm to the water, palm down. The rail engages.
4. The bottom turn begins. Compression. You go LOW. Feel your elbow close to the water.
5. HOLD. Keep the rail and the position. Feel the force pulling you to the flat — rail, fins and body hold it. Don't rush.
6. Now — PROJECTION. Legs extend. Chest points at your target. Only the leading arm projects; the back arm stays in posture, scapula active.
7. You feel the energy release. The board drives toward the lip.
8. Cruz Snap: rail changes. You rotate through. The board snaps at the top of the wave.
9. Momentum, back to posture. You are back in the pocket. Ready for the next loop.
10. See the complete circle: Posture → Rotation + hold (the bottom turn) → Projection → Maneuver → Back to posture.
11. Repeat the circle on the same wave. Two loops. Then three. Wave completion.$$,
 8, 'reading', 6003, true)

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
