-- 00227 · Fundamentos con paso propio (Marcelo 2026-10-03)
--
-- Marcelo: "Compresión y extensión pertenecen a los Tres Círculos (cuerpo);
-- Forward Momentum es una herramienta aparte". Hoy los dos compartían la
-- estrella de STP-019. Y el Círculo 3 (Ola) se evalúa en tres cosas que no
-- tenían paso: usar la energía de la ola · mantener la energía sin irse al
-- flat · surfear en el pocket.
--
-- Cuatro pasos nuevos en la sección `fundamentals`: NO está en
-- GRADUATION_RULES.sections, así que no entran en el catálogo de la
-- graduación (4★ en cada paso sigue siendo sobre los pasos de siempre) ni en
-- los cursos por cinta. Se califican desde el bloque de Fundamentos.
-- STP-019 queda solo como Forward Momentum (herramienta); sus estrellas se
-- quedan donde están. Los cuatro arrancan vacíos.
-- Textos: palabras de Marcelo (2026-10-03) + copy ya aprobado de los Tres
-- Círculos (three-circles.ts). Más contenido cuando él lo dicte.

insert into public.lessons (id, course_section, step_number, display_order, title, subtitle, pillar, lesson_type, estimated_minutes, active, description_md)
values
  ('FND-CE', 'fundamentals', 901, 901, 'Compression · Extension', 'Circle 1 · Body', 'Technical', 'reading', 10, true,
$md$## What it is

One movement with two halves: you compress to absorb and load, you extend to release and project.

## How your body does it

- Compressing without extending stores energy you never use.
- Flex · touch · push · extend: from posture, the knees bend, the chest goes toward them, and the extension sends you forward.
- This is the engine of the projection: what you load in a turn is what you spend on the next line.

## The 4 words of this step

`Flex · Touch · Push · Extend`

More coming here.$md$),

  ('FND-WAVE-ENERGY', 'fundamentals', 902, 902, 'Use the wave''s energy', 'Circle 3 · Wave', 'Tactical / Mental', 'reading', 10, true,
$md$## What it is

The wave is the external force. Up on the face, by the pocket, there is energy; down at the flat there is none — only resistance. Using the wave's energy means riding where it lives and letting it carry you.

## How you do it

- When you are up and about to go down, that is energy the wave gives you. Use it well to calculate going back up, so you get energy again and go down again.
- Always up and down — even when you are coming back on the wave.

More coming here.$md$),

  ('FND-WAVE-FLAT', 'fundamentals', 903, 903, 'Keep the energy · never the flat', 'Circle 3 · Wave', 'Tactical / Mental', 'reading', 10, true,
$md$## What it is

Timing your own force with the wave's force so you keep the energy and never have to go down to the flat.

## How you do it

- When the wave's energy starts running out, you extend your body and generate energy with rotations and the other movements. You help yourself up to where you have to go — and there you use the wave again.
- Add your force when the wave's is running out. Not before (you over-add), not after (you waste it).
- The flat is where the energy ends. Go there and the wave stops giving.

More coming here.$md$),

  ('FND-WAVE-POCKET', 'fundamentals', 904, 904, 'Surf the pocket', 'Circle 3 · Wave', 'Tactical / Mental', 'reading', 10, true,
$md$## What it is

The ability to move away from the pocket, come back, touch the whitewater and return to the face — without the wave swallowing you and without falling.

## How you do it

- The pocket is the sweet spot: the closer you ride to it, the more speed you get, and the closer your turns are to the breaking part, the more radical your surfing becomes.
- Go away, come back, touch the foam, return to the face. As many times as the wave allows.
- The closer to the pocket, the more it counts. That is the base of the game.

More coming here.$md$)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
