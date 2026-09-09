-- ═══ 00186 — DOCTRINA VIVA: la fuente única de las reglas técnicas ═══
--
-- Marcelo (2026-09-09): "quiero que tengamos nuestras fuentes de donde sale
-- la info y vive la verdad… cuando vamos haciendo actualizaciones o reglas
-- que no estaban, que se comunique todo y que se actualice en la fuente,
-- no todo por separado o por memoria".
--
-- Modelo:
--   doctrine_rules            una regla = una fila. Manda sobre lección,
--                             drill, misión, ficha del coach, página de
--                             secuencia, quiz y juego del paso al que aplica.
--   doctrine_material_reviews registro de propagación: "este material ya se
--                             revisó contra esta regla". Lo que no tiene
--                             revisión posterior a la regla sale como
--                             "revisar" en El Método.
--   updated_at automático     en lessons y drills_missions (no había
--                             trigger: las correcciones no dejaban fecha).
--
-- Jerarquía documental (verificada 2026-09-09): TSS Core Canon v8.1 (abril
-- 2026) es el documento supremo; los Master Manuals por cinta (WB v1, YB v1
-- mayo 2026) mandan sobre student/coach manuals; esta tabla recoge las
-- decisiones de Marcelo POSTERIORES a esos documentos y las que los corrigen.

create or replace function public.tss_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create table if not exists doctrine_rules (
  id uuid primary key default gen_random_uuid(),
  -- A qué paso aplica (STP-036…). Null = regla general del método.
  step_id text references lessons(id) on delete set null,
  -- A qué secuencia del curso aplica (BB-SEQ-08…), si es de una secuencia.
  sequence_id text,
  belt text check (belt in ('pre','white','yellow','blue','purple','brown','black','all')) default 'all',
  topic text not null,
  rule_en text not null,
  rule_es text,
  rationale text,
  -- De dónde sale: "Marcelo · 2026-09-09" o "Core Canon v8.1 §…".
  source text not null default 'Marcelo',
  decided_on date not null default current_date,
  status text not null default 'active' check (status in ('active','superseded','draft')),
  supersedes uuid references doctrine_rules(id) on delete set null,
  -- Qué materiales toca: lesson · drill · mission · coach · page · quiz · game · brand
  applies_to text[] not null default '{lesson,drill,mission,coach,page}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists doctrine_rules_step_idx on doctrine_rules(step_id);
create index if not exists doctrine_rules_seq_idx on doctrine_rules(sequence_id);

create table if not exists doctrine_material_reviews (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references doctrine_rules(id) on delete cascade,
  material_kind text not null check (material_kind in ('lesson','drill','mission','coach','page','quiz','game','brand')),
  material_id text not null,
  reviewed_at timestamptz not null default now(),
  note text,
  unique (rule_id, material_kind, material_id)
);

alter table doctrine_rules enable row level security;
alter table doctrine_material_reviews enable row level security;

drop trigger if exists doctrine_rules_updated_at on doctrine_rules;
create trigger doctrine_rules_updated_at before update on doctrine_rules
  for each row execute function public.tss_set_updated_at();
drop trigger if exists lessons_updated_at on lessons;
create trigger lessons_updated_at before update on lessons
  for each row execute function public.tss_set_updated_at();
-- drills_missions no tenía updated_at (descubierto al aplicar: el trigger rompía los UPDATE).
alter table drills_missions add column if not exists updated_at timestamptz not null default now();
drop trigger if exists drills_missions_updated_at on drills_missions;
create trigger drills_missions_updated_at before update on drills_missions
  for each row execute function public.tss_set_updated_at();

-- El Método también guarda archivos que no son PDF ni imagen (md, docx, xlsx).
alter table method_docs drop constraint if exists method_docs_kind_check;
alter table method_docs add constraint method_docs_kind_check
  check (kind in ('pdf','image','file','link','note','resource'));

-- ── Siembra: las reglas dictadas por Marcelo hasta hoy (2026-09-02 → 09-09) ──
insert into doctrine_rules (step_id, sequence_id, belt, topic, rule_en, rule_es, source, decided_on, applies_to) values
('STP-005', null, 'white', 'Nose direction',
 'The nose points into the incoming waves, against the direction the wave''s energy travels. Exception: when aligning to catch whitewater (STP-011/012) the nose points where the foam is going.',
 'La nariz apunta contra la energía de la ola (hacia las olas que vienen). Excepción: al alinear para agarrar espuma, la nariz apunta adonde va la espuma.',
 'Marcelo', '2026-09-02', '{lesson,drill,mission,coach}'),
(null, null, 'all', 'Feet: FP1/FP2/FP3 is the BACK foot',
 'FP1, FP2 and FP3 describe the back foot only. The front foot lands centred across the board, on the stringer. Never "front foot FP2".',
 'FP1/2/3 hablan del pie de ATRÁS. El de adelante cae centrado a lo ancho, sobre el stringer.',
 'Marcelo', '2026-09-02', '{lesson,drill,mission,coach,page,quiz}'),
('STP-016', null, 'white', 'Pop-up landing',
 'Both feet land together, never the back foot first. On landing: hips down, head up.',
 'Los dos pies caen juntos; al aterrizar, caderas abajo y cabeza arriba.',
 'Marcelo', '2026-09-02', '{lesson,drill,mission,coach}'),
('STP-018', null, 'white', 'Power Posture',
 'Chest to the nose · get low · front foot centred on the stringer with the toes ACROSS the board (not pointing to the nose) so toe and heel push the rails · weight on the FRONT foot, back foot without weight · back knee pointing toward the nose from the hip · scapula active · reach and cross · shoulders point where the board goes. Forbidden: "front knee in / foot toward the tip".',
 'Pecho a la nariz, bajo, pie de adelante centrado con dedos atravesados, peso adelante, rodilla de atrás hacia la nariz, escápula activa, reach and cross.',
 'Marcelo', '2026-09-02', '{lesson,drill,mission,coach,page,quiz}'),
('STP-019', null, 'white', 'Impulse',
 'Flex · touch · push · extend. The drill is dry-land from posture; the mission is in the water whenever speed is needed.',
 'Flex · touch · push · extend. Drill en seco desde la postura; misión en el agua cada vez que hace falta velocidad.',
 'Marcelo', '2026-09-02', '{lesson,drill,mission,coach}'),
(null, null, 'all', 'Think · Feel · Do · Play',
 'THINK = theory = the course. FEEL = simulate or visualise the movement = drills, out of the water. DO = execute in real conditions = missions, in the water. PLAY = the ecological game: an image plus one rule you can break, nothing else — no counting, lost in the instant, the wave is the referee, explained in one breath on the beach, calibrated by moving the image, never by adding rules; the rule never gives technical instruction.',
 'THINK curso · FEEL drills · DO misiones · PLAY juego ecológico: una imagen + una regla que se puede romper, sin contar nada.',
 'Marcelo', '2026-09-02', '{lesson,drill,mission,game,page}'),
(null, null, 'all', 'Drill vs mission',
 'A drill is out of the water / without the wave: understand, visualise, simulate (sand, pool, flat water or skate). A mission is the same thing executed in the water. Foot-technique drills have no "in waves" phase. For board handling steps the valid simulation is shallow water without waves or the smallest foam.',
 'Drill = fuera del agua (entender, visualizar, simular). Misión = lo mismo en el agua.',
 'Marcelo', '2026-09-02', '{drill,mission,coach}'),
(null, null, 'all', 'Safety with the board',
 'The board is never between you and the wave (body on the ocean side, board beside you). Never carry the board over the head; second carry is under the armpit. Duck dive or turtle roll depending on the board.',
 'La tabla nunca entre vos y la ola; nunca sobre la cabeza; duck dive o turtle roll según la tabla.',
 'Marcelo', '2026-09-02', '{lesson,drill,mission,coach}'),
(null, null, 'all', 'Student portal voice',
 'The student trains alone. No "coach validates / demonstrates / calls". Validation = an observable criterion plus one closing line: "When you train with your coach, they confirm it."',
 'El alumno entrena solo; nada de "el coach valida". Un criterio observable + la coletilla final.',
 'Marcelo', '2026-09-02', '{lesson,drill,mission,page}'),
('STP-037', 'BB-SEQ-09', 'blue', 'Backside pump: the M is the body',
 'The M is the shape of the BODY, not a line on the wave: when one arm strikes the elbow, the other arm is active and receives it; back and both elbows active form an M. The line on the face is the same as frontside: arcs from the top down through the middle and up again.',
 'La M es el cuerpo (brazos + espalda + codos), no un trazo en la ola. La línea es igual que frontside: arcos en la mitad de la cara.',
 'Marcelo', '2026-09-09', '{lesson,drill,mission,coach,page,quiz}'),
('STP-037', 'BB-SEQ-09', 'blue', 'Backside pump: hand and elbow strike',
 'The hand that marks is the BACK hand, on the wave side: palm opens UP and throws toward where you want to draw the line. The elbow strike leads the way down: forming the M changes the rail and the board drops with energy; then posture and the cycle repeats. Replaces "the leading hand drives the rhythm".',
 'La mano de atrás (lado de la ola) abre la palma hacia arriba y se tira hacia la línea. El codazo lidera la bajada.',
 'Marcelo', '2026-09-09', '{lesson,drill,mission,coach,page}'),
('STP-041', 'BB-SEQ-10', 'blue', 'Frontside snap: the line',
 'From the top of the wave, a long U through the middle of the face, then an aggressive rail change pointing down but NOT straight to the flat: it points to the side to end perpendicular and keep running the face. The snap does not need the lip; it can be done in different parts of the wave. Backside snap is the mirror.',
 'U prolongada en la mitad de la cara + cambio de riel agresivo hacia abajo y al lado, no al flat. Sin "labio".',
 'Marcelo', '2026-09-09', '{lesson,drill,mission,coach,page,quiz,game}'),
('STP-039', 'BB-SEQ-10', 'blue', 'Bottom turn frontside: the word chain',
 'Weight front · Elbow and forearm to the water · Palm down · Oblique · Hold. The bottom turn is a forward action, the oblique comes in, it is held, and from there comes the projection. Replaces "Mid-face · U · Oblique · Lean · Flex".',
 'Weight front · Elbow and forearm to the water · Palm down · Oblique · Hold.',
 'Marcelo', '2026-09-09', '{lesson,drill,mission,coach,page}'),
('STP-041', 'BB-SEQ-10', 'blue', 'Oblique works both ways',
 'The oblique is used toward BOTH sides: in the bottom turn (one rail) one way, in the Cruz the other way. The oblique movement is what changes the rail, so it is a criterion in the bottom turn AND in the Cruz.',
 'El oblicuo va hacia los dos lados: BT y Cruz. Criterio en los dos.',
 'Marcelo', '2026-09-09', '{lesson,drill,mission,coach,page}'),
(null, 'BB-SEQ-10', 'blue', 'Full sand run = closing drill of #10',
 'Posture → BT → Projection → Cruz → Grenade is simulated COMPLETE out of the water as the closing drill of sequence #10 (last drill before the sequence mission), not inside the Grenade step.',
 'La corrida completa en la arena es el drill de cierre de la #10.',
 'Marcelo', '2026-09-09', '{drill,page}'),
('STP-046', 'BB-SEQ-12', 'blue', 'Cutback closes to the face',
 'On closing, the board points back to the FACE of the wave, not to the foam. Same drawing frontside and backside: a lying figure 8. Corrects the result line of #12/#13 and the Blue quiz.',
 'Al cerrar, la tabla vuelve a apuntar a la cara, no a la espuma. Un 8 acostado, los dos lados.',
 'Marcelo', '2026-09-09', '{lesson,mission,coach,page,quiz}'),
('STP-035', 'BB-SEQ-08', 'blue', 'FP1: the back foot does not have to return',
 'The back foot moves on purpose: tail for the turn, forward for speed, and it can stay on the tail if that is what comes next. Not a rule that it returns to FP2.',
 'El pie de atrás se mueve según lo que se necesita; no tiene que volver a FP2.',
 'Marcelo', '2026-09-09', '{lesson,mission,coach,page,quiz}'),
('STP-036', 'BB-SEQ-08', 'blue', 'Pump and feet',
 'The pump is done from FP1, FP2 or FP3; what matters is the pump mechanics. FP1 = most manoeuvrable, least speed · FP2 = a bit more speed, less manoeuvrability · FP3 = most speed, far less manoeuvrability. Weight ALWAYS on the front foot. The back foot only follows the rails (the knee points where the board goes); it is the FRONT foot that sinks the rail toward where you want to go. Foot position is knowledge, not a drill or a mission of the sequence.',
 'El pump se hace en FP1/2/3; peso siempre adelante; el pie de adelante hunde el riel. Los pies son conocimiento, no drill ni misión.',
 'Marcelo', '2026-09-09', '{lesson,drill,mission,coach,page}'),
(null, null, 'all', 'The sequence page model',
 'The mission is ALWAYS the complete line. Inside it the student optionally chooses ONE focus (the body step that breaks the sequence) from the body steps, sees its indicators, and can go deeper into that step''s lesson/drill/mission. Posture is already taught (Three Circles, White STP-018): link, do not repeat. Competence: "If you can execute it and you feel comfortable, it is yours."',
 'La misión siempre es la línea completa; el foco es opcional y se elige de los pasos del cuerpo.',
 'Marcelo', '2026-09-09', '{page,mission,drill}'),
(null, null, 'all', 'The universal formula and its colours',
 'Behind the body steps of every sequence are the method commands: POSTURE (red) · ROTATION / rail, "get on the rail" (green) · PROJECTION (yellow) · MANEUVER, the Cruz (blue) · back to POSTURE (red) · CLOSURE (pink) · HOLD as a light-blue layer on top. The pocket is violet, outside the command colours. Words are written in Paper with a colour dot in front, never rainbow-coloured text.',
 'Postura rojo · rotación/riel verde · projection amarillo · maniobra azul · cierre rosa · hold celeste encima · pocket violeta. Palabras en blanco con punto de color.',
 'Marcelo', '2026-09-09', '{page,brand,lesson}'),
('STP-036', 'BB-SEQ-08', 'blue', 'Frontside projection: one arm projects',
 'Only the leading arm projects. The back arm (left for regular, right for goofy) stays in posture the whole time: scapula active and pulled back, elbow glued to the ribs. It never leaves that place. Replaces "both hands actively driving the body forward".',
 'Solo el brazo de adelante proyecta. El de atrás queda en postura: escápula activa hacia atrás, codo pegado a las costillas.',
 'Marcelo', '2026-09-09', '{lesson,drill,mission,coach,page}'),
('STP-036', 'BB-SEQ-08', 'blue', 'Frontside pump: how it feels',
 'You feel you can generate speed forward using the face of the wave. You feel in control of your board and you are drawing your lines. You have the ability to make sections and to gain speed using the wave and your line.',
 'Siento que genero velocidad hacia adelante usando la cara, controlo la tabla y dibujo las líneas; paso secciones.',
 'Marcelo', '2026-09-09', '{page,lesson}'),
(null, null, 'blue', 'Blue Belt course order',
 'Pre-Course → Getting to the wave (Navigate the Ocean: sweet spot, paddle technique, turtle roll or duck dive · Catch Waves = Yellow sequence 6 complete · Pick Your Line + Pop-Up) → The Three Circles of Power → The Infinite Circle (the LOOP) → 17 Elements + sequences #8–#13 + closing. Blue keeps only its 10-question final quiz, no lesson quizzes.',
 'Orden del curso Blue: pre-curso → camino del agua → tres círculos → LOOP → secuencias 8-13. Solo quiz final.',
 'Marcelo', '2026-09-09', '{page,quiz}'),
(null, null, 'all', 'Wave board language ("Dibujar la Ola")',
 'Four bands Z1 (flat) → Z4 (lip), the pocket marked, the sequence line drawn in segments coloured by command, markers I · A · M/B · S. The board map: front-foot target on the stringer (green centre, yellow, pink) and three tail bands P3 speed (green) · P2 neutral (pink) · P1 manoeuvre (yellow). Dart rings 25/50/100 are a style reference only, not part of the board.',
 'Franjas Z1-Z4, pocket, línea por comandos, marcadores I·A·M·S; mapa de la tabla con bandas P1/P2/P3. Dardo 25/50/100 solo referencia de estilo.',
 'Marcelo', '2026-09-09', '{page,brand}');

-- Lo que ya se propagó hoy (para que no salga como pendiente).
insert into doctrine_material_reviews (rule_id, material_kind, material_id, note)
select r.id, m.kind, m.mid, 'Aplicado 2026-09-09'
from doctrine_rules r
join (values
  ('Frontside projection: one arm projects', 'lesson', 'STP-036'),
  ('Frontside projection: one arm projects', 'page', 'BB-SEQ-08'),
  ('Frontside pump: how it feels', 'page', 'BB-SEQ-08'),
  ('Pump and feet', 'page', 'BB-SEQ-08'),
  ('FP1: the back foot does not have to return', 'page', 'BB-SEQ-08'),
  ('The sequence page model', 'page', 'BB-SEQ-08'),
  ('The universal formula and its colours', 'page', 'BB-SEQ-08'),
  ('Wave board language ("Dibujar la Ola")', 'page', 'BB-SEQ-08'),
  ('Blue Belt course order', 'page', 'BLUE-COURSE'),
  ('Nose direction', 'lesson', 'STP-005'),
  ('Pop-up landing', 'lesson', 'STP-016'),
  ('Power Posture', 'lesson', 'STP-018'),
  ('Power Posture', 'drill', 'DRL-WB-018-A'),
  ('Power Posture', 'mission', 'MIS-WB-018')
) as m(topic, kind, mid) on m.topic = r.topic
on conflict do nothing;
