-- 00017 — My Sequence: Drills/Missions catalog + Self-rating system
-- Belongs to TSS Masterclass (Phase 1 of new portal architecture)

BEGIN;

-- ============================================
-- TABLE: drills_missions
-- 1 entry per STP (drill = out of water, mission = in water)
-- ============================================

CREATE TABLE IF NOT EXISTS drills_missions (
  id TEXT PRIMARY KEY,
  step_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('drill', 'mission')),
  time_estimate TEXT,
  reps_recommended TEXT,
  key_words TEXT[] DEFAULT '{}',
  description_md TEXT,
  success_criteria TEXT[] DEFAULT '{}',
  belt TEXT DEFAULT 'white',
  block_number INTEGER,
  block_name TEXT,
  display_order INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drills_step ON drills_missions(step_id);
CREATE INDEX IF NOT EXISTS idx_drills_block ON drills_missions(block_number);
CREATE INDEX IF NOT EXISTS idx_drills_belt ON drills_missions(belt);

ALTER TABLE drills_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS drills_missions_public_read ON drills_missions;
CREATE POLICY drills_missions_public_read ON drills_missions FOR SELECT USING (true);

-- ============================================
-- TABLE: student_step_ratings (self-evaluation 1-5 per STP)
-- ============================================

CREATE TABLE IF NOT EXISTS student_step_ratings (
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  current_rating INTEGER CHECK (current_rating BETWEEN 1 AND 5),
  rating_count INTEGER DEFAULT 1,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_step_ratings_student ON student_step_ratings(student_id);

ALTER TABLE student_step_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS step_ratings_all ON student_step_ratings;
CREATE POLICY step_ratings_all ON student_step_ratings FOR ALL USING (true);

-- ============================================
-- EXTEND self_training_sessions with drill/mission link
-- ============================================

ALTER TABLE self_training_sessions
  ADD COLUMN IF NOT EXISTS linked_drill_mission_id TEXT,
  ADD COLUMN IF NOT EXISTS linked_step_id TEXT,
  ADD COLUMN IF NOT EXISTS focus_rating INTEGER CHECK (focus_rating BETWEEN 0 AND 3),
  ADD COLUMN IF NOT EXISTS mission_completion TEXT CHECK (mission_completion IN ('yes','partial','no')),
  ADD COLUMN IF NOT EXISTS execution_rating INTEGER CHECK (execution_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS reps_completed INTEGER;

-- ============================================
-- SEED: 24 drills/missions (5 drills + 19 missions)
-- ============================================

DELETE FROM drills_missions;

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-01',
  'STP-001',
  $tss$Venue Analysis Map Drill$tss$,
  'drill',
  $tss$8-12 min$tss$,
  $tss$5-8 reps recommended$tss$,
  ARRAY[$tss$MAP$tss$,$tss$ZONE$tss$,$tss$HAZARD$tss$,$tss$ENTRY$tss$,$tss$DECIDE$tss$]::TEXT[],
  $tss$OBJECTIVE: That the student learns to read the spot before entering the water, build a clear map of the zone, and take a basic safety + planning decision grounded in what they actually observe.

SETUP: **Location:** Beach with full view of the surf zone. Ideally an elevated observation point (dune, path, or standing on sand).

**Required materials:**
- Nothing mandatory.
- Optional: a surface to draw on (sand, whiteboard, notebook, pointing with fi...

PROCEDURE: ### Step 1 — REFERENCE
Ask: *"Where are we standing? What's your outside reference point?"*
Student must identify: a fixed land reference (palm tree, building, rock) AND one outside reference (a boat, marker, headland) to track drift later.

### Step 2 — MAP (general conditions)
Ask: *"What size is the wave? How is the tide? What is the sea doing today?"*
Student describes: wave size in feet or relative terms, tide state (rising/falling/high/low), general behavior (clean, messy, lined up, choppy), frequency of sets.

### Step 3 — SAFE ZONE + IMPACT ZONE
Ask: *"Where is the SAFE ZONE? Where is the IMPACT ZONE?"*
Student physically points. Safe zone = whitewater inside, soft foam, reforming waves.$tss$,
  ARRAY[$tss$Describes general conditions of the day and identifies the safe zone$tss$,$tss$Recognizes the impact zone and points out important hazards and currents$tss$,$tss$Explains entry and exit points and states whether conditions match their level (go$tss$,$tss$no-go) with a simple session plan$tss$]::TEXT[],
  'white',
  0,
  $tss$PRE-WATER$tss$,
  1
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-02',
  'STP-002',
  $tss$Tss Warm Up Flow$tss$,
  'drill',
  $tss$8-12 min$tss$,
  $tss$10 reps$tss$,
  ARRAY[$tss$MOBILITY$tss$,$tss$ACTIVATION$tss$,$tss$SIMULATION$tss$,$tss$BREATH$tss$,$tss$READY$tss$]::TEXT[],
  $tss$OBJECTIVE: Prepare the student physically and mentally for the session by activating joints, muscles, posture, and movement patterns specific to surfing — while bringing the student into a focused, connected, ready state — **without creating fatigue**.

SETUP: - **Location:** dry sand, flat surface, ~2m²/student.
- **Equipment:** no equipment required. Water bottle nearby.
- **Time:** 8-12 min total.
- **Surface:** never on rocks or concrete.$tss$,
  ARRAY[$tss$Completes the Warm Up with focus and correct movement quality, without rushing or skipping phases$tss$,$tss$Demonstrates improved readiness in surf-specific simulations such as pop-up, posture, knee flexion, and rotation$tss$,$tss$Enters the water physically active, mentally present, and energetically ready for action without unnecessary fatigue$tss$]::TEXT[],
  'white',
  0,
  $tss$PRE-WATER$tss$,
  2
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-03',
  'STP-003',
  $tss$Grab Board Reset Drill$tss$,
  'drill',
  $tss$5-8 min$tss$,
  $tss$8 reps$tss$,
  ARRAY[$tss$CENTER$tss$,$tss$KNEES$tss$,$tss$RAILS$tss$,$tss$LIFT$tss$,$tss$CARRY$tss$]::TEXT[],
  $tss$OBJECTIVE: Teach the student to pick up the board from the ground safely, with correct body mechanics, proper hand placement on the rails, and immediate control of the board once lifted.

SETUP: - **Location:** sand (preferred) or clean floor. Never rocks, gravel, or wet cement.
- **Equipment:** one surfboard per student (White Belt = soft-top 7-9ft).
- **Spacing:** minimum 2m between students to prevent collisions during reps.

PROCEDURE: ### Rep 1 — CENTER

Board rests flat on the ground. Student stands beside the midpoint (visual reference: fins line). Coach confirms position: *"CENTER. Estás al medio."*

### Rep 2 — KNEES

Student bends knees, keeps back straight. Coach confirms posture: *"KNEES. Espalda recta. Rodillas abajo."*

### Rep 3 — RAILS

Student places both hands on the rails, symmetric around center. One hand slightly toward nose, one slightly toward tail. Coach confirms: *"RAILS. Dos manos. Simétrico."*

### Rep 4 — LIFT

Student stands up using legs. Back stays neutral. Board comes up smooth, no swinging, no impulse. Coach confirms: *"LIFT. Controlado. Sin impulso."*

### Rep 5 — CARRY

Student settles board into a safe carry position (Variant A flat or Variant B side). Board is stable.$tss$,
  ARRAY[$tss$Picks up the board from the ground with correct body position and safe mechanics$tss$,$tss$Maintains immediate control of the board once lifted$tss$,$tss$Can place the board down and repeat the pickup consistently without loss of control$tss$]::TEXT[],
  'white',
  1,
  $tss$ENTRY / CONTROL / RETURN$tss$,
  3
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-04',
  'STP-004',
  $tss$Walk Out Sand Entry Drill$tss$,
  'drill',
  $tss$10-15 min$tss$,
  $tss$5 reps$tss$,
  ARRAY[$tss$PATIENCE$tss$,$tss$DRAG$tss$,$tss$SIDE$tss$,$tss$FACE$tss$,$tss$PLACE$tss$]::TEXT[],
  $tss$OBJECTIVE: Instalar el patrón de entrada segura al océano: ritmo calmo, arrastre de pies, tabla al costado, cara hacia la ola, colocación de tabla con profundidad suficiente. Construir memoria muscular de la **hard-line rule**: tabla nunca entre cuerpo y ola.

SETUP: - **Ubicación:** línea de shoreline del spot analizado. Alumno parado en arena seca, tabla en posición de carry.
- **Coach position:** al costado del alumno, del lado del océano (no bloqueando), observando vista lateral + vista trasera.$tss$,
  ARRAY[$tss$Enters the water calmly and safely with the board under control$tss$,$tss$Drags the feet and shows awareness of depth and bottom conditions$tss$,$tss$Places the board in the water at the correct moment, with enough depth and without loss of control$tss$]::TEXT[],
  'white',
  1,
  $tss$ENTRY / CONTROL / RETURN$tss$,
  4
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-05',
  'STP-005',
  $tss$Waist-Deep Placement Drill$tss$,
  'mission',
  $tss$8-12 min$tss$,
  $tss$5-8 reps$tss$,
  ARRAY[$tss$DEPTH$tss$,$tss$PAUSE$tss$,$tss$LOWER$tss$,$tss$RELEASE$tss$,$tss$READY$tss$]::TEXT[],
  $tss$OBJECTIVE: Instalar el patrón del handoff del carry al control: confirmación de profundidad, pausa de lectura, bajada controlada con ambas manos, release parcial manteniendo contacto, posición READY.

SETUP: - **Ubicación:** agua a waist del alumno. En spots de pendiente suave, esto puede ser 6-10 metros desde la orilla.
- **Coach position:** al costado del alumno, del lado del océano, a 1-1.5m de distancia.$tss$,
  ARRAY[$tss$Places the board only when the water is deep enough$tss$,$tss$Lowers the board into the water with control$tss$,$tss$Transitions cleanly into the next step without losing control$tss$]::TEXT[],
  'white',
  1,
  $tss$ENTRY / CONTROL / RETURN$tss$,
  5
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-06',
  'STP-006',
  $tss$Tail & Center Control Drill$tss$,
  'mission',
  $tss$5-10 min$tss$,
  $tss$5-8 reps$tss$,
  ARRAY[$tss$TAIL$tss$,$tss$CENTER$tss$,$tss$SIDE$tss$,$tss$PRESS$tss$,$tss$PIVOT$tss$]::TEXT[],
  $tss$OBJECTIVE: Instalar el patrón muscular de control inmediato de la tabla desde el momento en que toca el agua, usando la mecánica correcta (TAIL + CENTER) y la posición lateral permanente, sin que el alumno recurra a grips intuitivos erróneos (rails, nose, grip aleatorio).

SETUP: - Alumno y coach en waist-deep water, ambos con tabla flotando al costado.
- Coach en vista lateral/frontal del alumno para leer posición de manos y relación cuerpo-tabla.
- Duración total del drill: 5-10 minutos (5-8 reps limpios).

PROCEDURE: ### BEAT 1 — **TAIL**
- Alumno encuentra el tail de la tabla.
- Coloca una mano (la mano dominante o la más cercana) sobre el tail, dedos agarrando la cola.
- Coach verbaliza: *"TAIL. Acá. Sentí la cola."*
- Observable: mano claramente en el tail, no en rails, no en nose.

### BEAT 2 — **CENTER**
- Alumno coloca la otra mano cerca del centro de la tabla.
- No es el medio exacto — es la zona entre center y front-third donde puede estabilizar.
- Coach verbaliza: *"CENTER. La otra mano. Estabilizá."*
- Observable: segunda mano a altura del pecho del alumno, no en el nose.

### BEAT 3 — **SIDE**
- Alumno confirma que la tabla está al costado del cuerpo, no al frente.
- Tabla paralela al cuerpo del alumno, a la altura de la cadera/costilla.
- Coach verbaliza: *"SIDE. Al costado.$tss$,
  ARRAY[$tss$Places the hands in the correct control position immediately$tss$,$tss$Keeps the board stable at the side of the body$tss$,$tss$Can pivot and redirect the board without losing control$tss$]::TEXT[],
  'white',
  1,
  $tss$ENTRY / CONTROL / RETURN$tss$,
  6
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-07',
  'STP-007',
  $tss$Whitewater Passage Drill$tss$,
  'mission',
  $tss$15-20 min$tss$,
  $tss$5-8 reps in Phase 3$tss$,
  ARRAY[$tss$ALIGN$tss$,$tss$WAIT$tss$,$tss$PRESS$tss$,$tss$LIFT$tss$,$tss$PASS$tss$]::TEXT[],
  $tss$OBJECTIVE: Teach the student to safely pass through the whitewater while standing — maintaining compact posture, proper hand pressure on the board, and forward stability through the impact.

SETUP: Whitewater zone, waist-deep water, consistent foam. Coach positioned to observe approach and impact angle.

PROCEDURE:
Phase 1 — Dry demo (3 reps): Coach demonstrates compact posture and pressure mechanics on the board on sand.
Phase 2 — Calm water (3 reps): Student pushes the board while standing in waist-deep water without a wave, practicing arm and hand position.
Phase 3 — Whitewater (5-8 reps): Student faces incoming foam and executes the complete passage. One correction per rep.$tss$,
  ARRAY[$tss$Aligns the nose straight toward incoming foam$tss$,$tss$Uses correct tail pressure to lift the nose$tss$,$tss$Passes through foam without losing board control$tss$]::TEXT[],
  'white',
  1,
  $tss$ENTRY / CONTROL / RETURN$tss$,
  7
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-08',
  'STP-008',
  $tss$Safe Pivot Turn Drill$tss$,
  'mission',
  $tss$10-15 min$tss$,
  $tss$5 reps each phase$tss$,
  ARRAY[$tss$CHECK$tss$,$tss$PIVOT$tss$,$tss$BACK$tss$,$tss$CONTROL$tss$,$tss$READY$tss$]::TEXT[],
  $tss$OBJECTIVE: Teach the student the safe pivot turn — board rotation with body intentionally between the wave and the surfer, avoiding the board hitting the surfer or others.

SETUP: Waist-deep water, calm or small whitewater. Coach in safe observation position.

PROCEDURE:
Phase 1 — Dry demo (3 reps): Coach demonstrates board rotation with pivot point and body position on sand.
Phase 2 — Calm water (5 reps): Student practices the pivot turn in waist-deep water without a wave.
Phase 3 — With small whitewater (5 reps): Student executes the complete pivot turn after passing a foam wave.$tss$,
  ARRAY[$tss$Turns in the safe direction without hesitation$tss$,$tss$Never places the board between the body and the foam$tss$,$tss$Maintains board control throughout the pivot$tss$]::TEXT[],
  'white',
  1,
  $tss$ENTRY / CONTROL / RETURN$tss$,
  8
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-09',
  'STP-009',
  $tss$Safe Return Drill$tss$,
  'drill',
  $tss$20-30 min$tss$,
  $tss$1 rep$tss$,
  ARRAY[$tss$LOOK$tss$,$tss$READ$tss$,$tss$WALK$tss$,$tss$ADJUST$tss$,$tss$LAND$tss$]::TEXT[],
  $tss$OBJECTIVE: Instalar en el alumno el patrón de **retorno activo**: caminar hacia la orilla manteniendo backward awareness, gestión de tabla, y capacidad de re-maniobrar (Pass o Turn) sobre la marcha cuando llega espuma.

Output esperado: 5-8 retornos consecutivos donde el alumno **mira atrás por sí solo cada 5-8 pasos**, mantiene TAIL + SIDE, y responde correc...

SETUP: 1. Coach y alumno en waist-deep, tras completar giro canónico (STP-008).
2. Coach define el **punto de llegada**: línea de arena seca específica (coach señala un punto de referencia en la playa).
3.$tss$,
  ARRAY[$tss$Looks behind consistently during the return$tss$,$tss$Maintains board control all the way back to shore$tss$,$tss$Returns safely without being surprised by incoming foam$tss$]::TEXT[],
  'white',
  1,
  $tss$ENTRY / CONTROL / RETURN$tss$,
  9
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-10',
  'STP-010',
  $tss$Sweet Spot Discovery Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$5-8 reps$tss$,
  ARRAY[$tss$MOUNT$tss$,$tss$CHEST$tss$,$tss$CENTER$tss$,$tss$LEVEL$tss$,$tss$READY$tss$]::TEXT[],
  $tss$OBJECTIVE: Enseñar al alumno a (a) subirse a la tabla de manera limpia y repetible, (b) encontrar el sweet spot encontrando primero los dos errores (muy adelante y muy atrás) y luego el centro correcto, y (c) instalar el principio doctrinal "sweet spot antes de cualquier otra cosa".

SETUP: - Agua calma o muy poca espuma (waist-deep máximo).
- Tabla ya en el agua, bajo control (STP-006 certificado).
- Sin ola activa entrante durante los primeros reps.
- Coach en el agua, al lado pero no sobre el alumno.

PROCEDURE: ### Rep 1 — Mount limpio
1. Alumno mano en tail, mano en centro (STP-006 position).
2. Manos pasan a rails.
3. Pecho al centro de la tabla.
4. Una pierna sube, luego la otra — "como subirse a un caballo".
5. Alumno se establece en prono sin ajustar todavía.

### Rep 2 — Error adelante (descubrimiento)
1. Alumno se desplaza deliberadamente hacia el nose.
2. Siente: nose baja, agua toca pecho, tabla se clava.
3. Coach pregunta: *"¿Qué sentís? ¿Qué hace la tabla?"*
4. Alumno verbaliza el error.

### Rep 3 — Error atrás (descubrimiento)
1. Alumno se desplaza hacia el tail.
2. Siente: nose se levanta, tail se hunde, tabla arrastra, no se mueve.
3. Coach pregunta de nuevo: *"¿Qué sentís?"*
4. Alumno verbaliza el error.

### Rep 4 — Encontrar centro
1.$tss$,
  ARRAY[$tss$Gets onto the board cleanly and consistently$tss$,$tss$Finds the correct prone balance point within a few adjustments$tss$,$tss$Maintains a stable, centered position with the board floating level and ready to move$tss$]::TEXT[],
  'white',
  2,
  $tss$PRONE PHASE$tss$,
  10
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-11',
  'STP-011',
  $tss$Whitewater Alignment Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$5-8 reps$tss$,
  ARRAY[$tss$SWEET$tss$,$tss$READ$tss$,$tss$SHOULDER$tss$,$tss$ALIGN$tss$,$tss$READY$tss$]::TEXT[],
  $tss$OBJECTIVE: Enseñar al alumno a (a) leer la dirección de la espuma entrante, (b) alinear el nose de la tabla con esa dirección, y (c) resetear a posición arrow sin perder sweet spot.

SETUP: - Alumno ya en sweet spot (STP-010 cerrado).
- Agua con espuma consistente (waist-deep, foam predecible).
- Coach al costado pero no en la línea de paddle.
- Sin intención de catch en este drill — es de alignment pura.

PROCEDURE: ### Rep 1 — Confirmar sweet spot
1. Alumno en prono, nose apenas flotando, cuerpo centrado.
2. Coach confirma: *"Sweet spot. Bien."*

### Rep 2 — READ (leer el foam)
1. Coach pregunta: *"¿Para dónde viene la espuma?"*
2. Alumno responde: dirección con palabra o gesto.
3. Coach NO confirma todavía — deja que el alumno mire.

### Rep 3 — SHOULDER CHECK
1. Alumno rota cabeza por encima del hombro hacia la espuma.
2. Confirma visualmente la dirección.
3. Coach verifica que el alumno realmente giró (no solo amague).

### Rep 4 — ALIGN
1. Alumno usa manos en el agua para pivotar la tabla.
2. Nose rota hasta apuntar en dirección del foam.
3. Coach verifica ángulo: ±10° de la dirección real.

### Rep 5 — READY (reset adelante)
1. Alumno vuelve la vista al frente.
2.$tss$,
  ARRAY[$tss$Reads the direction of the whitewater correctly$tss$,$tss$Aligns the nose of the board with the wave energy line$tss$,$tss$Finishes stable, centered, and ready to paddle without losing balance$tss$]::TEXT[],
  'white',
  2,
  $tss$PRONE PHASE$tss$,
  11
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-12',
  'STP-012',
  $tss$Whitewater Catch Paddle Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$5-10 reps$tss$,
  ARRAY[$tss$DISTANCE$tss$,$tss$START$tss$,$tss$ONE-TWO$tss$,$tss$FORWARD$tss$,$tss$COMMIT$tss$]::TEXT[],
  $tss$OBJECTIVE: Enseñar al alumno a (a) leer distancia y timing, (b) ejecutar 1-2 con técnica forward-driving, y (c) mantener commitment hasta que la ola toma la tabla.

SETUP: - Alumno en sweet spot + alineado (STP-010 y STP-011 cerrados).
- Agua waist-deep, foam predecible.
- Coach elige distancia inicial según fuerza del foam: 1-4m.
- Coach se ubica al costado (no delante ni detrás).

PROCEDURE: ### Rep 1 — Ready position confirmada
1. Alumno en sweet spot, alineado, arrow body.
2. Coach confirma: *"Ready."*

### Rep 2 — DISTANCE (lectura)
1. Alumno mira foam entrante, estima distancia.
2. Coach pregunta: *"¿Arrancás ya o esperás?"*
3. Alumno responde + coach valida o ajusta.

### Rep 3 — START (arranque)
1. Coach dice *"Go"* (al inicio, eventualmente alumno decide solo).
2. Alumno inicia 1-2 con distancia suficiente.

### Rep 4 — ONE-TWO (ritmo)
1. Un brazo, luego el otro.
2. Entrada por dedos, elbow high en recovery.
3. Pull back — no push down.
4. Cuerpo largo, cabeza estable.

### Rep 5 — COMMIT (sostener)
1. Alumno rema sin parar hasta pick-up.
2. Ola toma la tabla — alumno siente aceleración.
3.$tss$,
  ARRAY[$tss$Starts paddling at the correct time after alignment$tss$,$tss$Uses efficient forward-driving paddling technique with clean 1-2 rhythm$tss$,$tss$Connects with and catches the whitewater consistently$tss$]::TEXT[],
  'white',
  2,
  $tss$PRONE PHASE$tss$,
  12
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-13',
  'STP-013',
  $tss$Cobra Rail Control Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$5 reps$tss$,
  ARRAY[$tss$HANDS$tss$,$tss$CHEST$tss$,$tss$EYES$tss$,$tss$RAIL$tss$,$tss$STEER$tss$]::TEXT[],
  $tss$OBJECTIVE: Enseñar al alumno a (a) entrar a cobra con control inmediatamente después del pick-up, (b) liberar presión del nose y estabilizar el ride, y (c) iniciar el primer control direccional izquierda/derecha usando visión, oblicuos, y presión de rail.

SETUP: - Alumno certificado en STP-010, STP-011, STP-012.
- Conditions: waist-deep, foam consistente, olas que producen ride de 3-5 segundos mínimo.
- Demo en arena antes de entrar al agua.

PROCEDURE: ### Phase 1 — Demo seco (antes de entrar al agua)
1. Alumno acostado en arena o sobre tabla en arena.
2. Practica: hands to ribs → chest up → eyes forward (5 reps).
3. Practica activación de oblicuos: "mirá a la derecha + girá tronco hacia derecha" (5 reps cada lado).
4. Practica rail pressure: "presioná este lado" (simulado en arena).

### Phase 2 — En el agua

**Rep 1 — Catch limpio**
- Alumno ejecuta STP-012 completo. Pick-up real de la ola.

**Rep 2 — HANDS + CHEST (entrar cobra)**
- Manos a costillas.
- Brazos extienden, pecho sube.
- Alumno siente cómo el nose se libera.

**Rep 3 — EYES forward**
- Vista adelante, cabeza estable.
- Alumno estabiliza el ride.

**Rep 4 — STEER derecha**
- Alumno mira derecha.
- Activa oblicuos derechos.
- Presiona rail derecho.$tss$,
  ARRAY[$tss$Cobra entry consistente post-catch (5+ reps, manos a costillas, nose libre)$tss$,$tss$Rail pressure real — un rail hundido visible (no solo cambio de peso lateral)$tss$,$tss$3+ giros intencionales a cada lado (L y R) con vision lead + oblicuos + rail$tss$]::TEXT[],
  'white',
  2,
  $tss$PRONE PHASE$tss$,
  13
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-14',
  'STP-014',
  $tss$Prone Dismount Safety Drill$tss$,
  'mission',
  $tss$10-15 min$tss$,
  $tss$5-8 reps in Phase 3$tss$,
  ARRAY[$tss$DECIDE$tss$,$tss$RAILS$tss$,$tss$SHIFT$tss$,$tss$ROTATE$tss$,$tss$LAND$tss$]::TEXT[],
  $tss$OBJECTIVE: Teach the student the controlled prone dismount — exit safely from the board at the end of a ride to avoid crashes against the bottom or board damage.

SETUP: Whitewater area, end-of-ride zone where the wave breaks shallow.

PROCEDURE:
Phase 1 — Dry demo (3 reps): Coach simulates dismount over board on sand emphasizing hand position on rails and body movement.
Phase 2 — Calm water (5 reps): Student practices controlled dismount from a floating board without wave.
Phase 3 — After ride (5-8 reps): Student executes dismount at the end of a ride in whitewater.$tss$,
  ARRAY[$tss$Decisión temprana de exit antes de shallow — no es reactivo$tss$,$tss$Secuencia completa ejecutada (rails → shift → rotate → knees → feet → land)$tss$,$tss$Tabla conectada post-land (manos siguen en rails, tabla bajo control)$tss$]::TEXT[],
  'white',
  2,
  $tss$PRONE PHASE$tss$,
  14
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-16',
  'STP-016',
  $tss$2-Second Pop-Up Connection Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$5 reps$tss$,
  ARRAY[$tss$COBRA$tss$,$tss$HANDS$tss$,$tss$EXHALE$tss$,$tss$FEET$tss$,$tss$CONNECT$tss$]::TEXT[],
  $tss$OBJECTIVE: Enseñar al alumno a (a) ejecutar pop-up desde cobra sólida, (b) sincronizar exhalación con el lift, (c) colocar pies en posición correcta, y (d) mantener conexión con la tabla hasta estar centrado.

Target temporal: pop-up ejecutado en ~2 segundos desde cobra hasta de pie centrado. Ni apuro ni lentitud.

SETUP: - Alumno certificado en STP-010, 011, 012, 013, 014.
- Conditions: waist-deep, foam consistente, rides de 4-6 segundos mínimo.
- Demo seco obligatorio antes de entrar al agua (mínimo 5 reps en seco).
- Coach posicionado para ver ángulo de ejecución.

PROCEDURE: ### Phase 1 — Demo seco (obligatorio)

1. Alumno acostado sobre tabla en arena.
2. Coach narra secuencia lenta:
   - "Buena cobra — pecho arriba, manos a costillas, ojos al frente."
   - "Exhale."
   - "Pies caen en posición — ambos juntos, centrados."
   - "Te incorporás — manos aún en rails."
   - "Cuando estás centrado y en control, soltás."
3. Repetir 5 veces lento.
4. Repetir 3 veces a velocidad real (~2 segundos total).

### Phase 2 — Pop-up en arena con tabla

1. Mismo ejercicio pero sobre tabla real en arena.
2. Alumno siente peso de tabla, fricción, y el centrado real.
3. 5 reps hasta que la secuencia sea fluida.

### Phase 3 — En el agua

**Rep 1 — Pop-up en agua quieta (sin ola)**
- Alumno flota en tabla, ejecuta pop-up.$tss$,
  ARRAY[$tss$Cobra sólida previa (manos costillas + pecho arriba + eyes forward)$tss$,$tss$Pies en posición correcta (juntos o adelante primero) + movimiento fluido ~2s$tss$,$tss$Manos liberan solo cuando centrado y en control (stay connected)$tss$]::TEXT[],
  'white',
  3,
  $tss$POP-UP$tss$,
  16
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-17',
  'STP-017',
  $tss$Feet Position Fp2 Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$5-8 reps$tss$,
  ARRAY[$tss$CENTER$tss$,$tss$RAILS$tss$,$tss$FP2$tss$,$tss$BACK-FOOT$tss$,$tss$CONNECT$tss$]::TEXT[],
  $tss$OBJECTIVE: Enseñar al alumno a (a) comprender visualmente la relación entre pies y rails, (b) aterrizar los pies en el eje central de la tabla, y (c) ubicar el pie de atrás en FP2 de forma consistente.

SETUP: - Alumno certificado en STP-010, 011, 012, 013, 014, 016.
- Conditions: waist-deep, foam consistente, rides de 4-6 segundos.
- Tabla marcada con cinta (FP2 visible) para los primeros reps.
- Demo seco sobre tabla en arena OBLIGATORIO.

PROCEDURE: ### Phase 1 — Demo conceptual (tabla en arena)

1. Coach marca FP2 con cinta en la tabla.
2. Coach pisa cerca de un rail y muestra cómo la tabla se inclina visiblemente.
3. Coach pisa centrado, muestra que la tabla queda plana.
4. Alumno repite ambos escenarios para sentirlo.
5. Alumno ubica los pies en FP2 marcado, sin ejecutar pop-up todavía.

### Phase 2 — Pop-up con foco en FP2 (arena)

1. Alumno ejecuta pop-up sobre tabla en arena con cinta FP2.
2. Coach observa: ¿pie atrás cayó en FP2?
3. Si no, diagnóstico inmediato: ¿qué lo desvió?
4. 5-8 reps hasta que FP2 se repita.

### Phase 3 — En el agua

**Rep 1 — Pop-up con FP2 en agua quieta**
- Sin presión de ola. Solo verificar que pie cae en FP2.

**Rep 2 — Pop-up desde catch**
- Condiciones normales.$tss$,
  ARRAY[$tss$Pop-up ejecutado (STP-016 certificado)$tss$,$tss$Pies aterrizan centrados en FP2 + rails parejos visualmente$tss$,$tss$Alumno identifica cuándo un rail está aplastado + entiende FP1$tss$,$tss$FP2$tss$,$tss$FP3 conceptualmente$tss$]::TEXT[],
  'white',
  4,
  $tss$STANCE & POSTURE$tss$,
  17
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-18',
  'STP-018',
  $tss$Power Stance Arrows Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$3-5 reps$tss$,
  ARRAY[$tss$SHOULDERS$tss$,$tss$WEIGHT$tss$,$tss$KNEE$tss$,$tss$COMPACT$tss$,$tss$EXHALE$tss$]::TEXT[],
  $tss$SETUP: **Fase 1 — Arena (obligatoria):**
- Tabla apoyada en arena.
- Dos líneas marcadas en la arena paralelas a la tabla para marcar dirección "al frente".
- Coach ejecuta analogía del boxeador primero: postura boxeo → postura surf.$tss$,
  ARRAY[$tss$Pies en FP2 centrado (STP-017 certificado)$tss$,$tss$Postura completa post-pop-up: hombros, peso, rodilla, flexión, manos, exhalación$tss$,$tss$Regla "volver a postura" internalizada + alumno explica postura con sus palabras$tss$]::TEXT[],
  'white',
  4,
  $tss$STANCE & POSTURE$tss$,
  18
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-19',
  'STP-019',
  $tss$Impulse Forward Speed Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$5-10 rep$tss$,
  ARRAY[$tss$FLEX$tss$,$tss$TOUCH$tss$,$tss$PUSH$tss$,$tss$EXTEND$tss$,$tss$SPEED$tss$]::TEXT[],
  $tss$SETUP: **Fase 1 — Arena (obligatoria):**
- Alumno de pie en arena simulando tabla.
- Espacio para flexión profunda y extensión completa.
- Coach enfrente del alumno para demo espejo.

**Fase 2 — Agua quieta:**
- Alumno acostado en tabla en agua quieta.$tss$,
  ARRAY[$tss$Postura de poder establecida (STP-018 certificado)$tss$,$tss$Ciclo completo: flex + touch + push + extend con ganancia de velocidad visible$tss$,$tss$Alumno identifica cuándo usar la herramienta autónomamente + variante una mano ejecutable$tss$]::TEXT[],
  'white',
  4,
  $tss$STANCE & POSTURE$tss$,
  19
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-20',
  'STP-020',
  $tss$Starfish Dismount Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$5-10 reps$tss$,
  ARRAY[$tss$DECIDE$tss$,$tss$BEND$tss$,$tss$OPEN$tss$,$tss$FALL$tss$,$tss$FOAM$tss$]::TEXT[],
  $tss$SETUP: **Fase 1 — Arena (obligatoria):**
- Alumno de pie en arena.
- Coach demuestra en arena blanda o con colchón.
- Espacio despejado atrás para caer sin chocar.

**Fase 2 — Agua quieta / shallow:**
- Zona con agua de cintura.$tss$,
  ARRAY[$tss$Alumno de pie en ride con postura (STP-018 certificado)$tss$,$tss$Cae en X hacia atrás sobre espuma con decisión anticipada$tss$,$tss$Alumno identifica momento autónomamente + explica doctrina "atrás sobre espuma"$tss$]::TEXT[],
  'white',
  5,
  $tss$TURNS & DISMOUNT$tss$,
  20
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-21',
  'STP-021',
  $tss$Backside Rail Change Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$5 reps$tss$,
  ARRAY[$tss$LOOK$tss$,$tss$OBLIQUE$tss$,$tss$HIP$tss$,$tss$HEEL$tss$,$tss$RAIL$tss$]::TEXT[],
  $tss$SETUP: **Fase 1 — Arena (obligatoria):**
- Alumno de pie en arena en postura de poder.
- Espacio para rotación cadera y cuello sin obstrucciones.
- Coach enfrente haciendo demo espejo.$tss$,
  ARRAY[$tss$Alumno en ride con Power Stance (STP-018) + pies en FP2$tss$,$tss$FP1 (STP-017)$tss$,$tss$Tabla cruza hacia backside con cadena completa + postura preservada$tss$,$tss$Alumno ejecuta 3+ turns con cadena completa + explica secuencia ojos → oblicuo → cadera → talón$tss$]::TEXT[],
  'white',
  5,
  $tss$TURNS & DISMOUNT$tss$,
  21
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-22',
  'STP-022',
  $tss$Frontside Rail Change Drill$tss$,
  'mission',
  $tss$8-15 min$tss$,
  $tss$5 reps$tss$,
  ARRAY[$tss$LOOK$tss$,$tss$OBLIQUE$tss$,$tss$POSTURE$tss$,$tss$FRONT$tss$,$tss$RAIL$tss$]::TEXT[],
  $tss$SETUP: **Fase 1 — Arena (cadena espejo):**
- Alumno en postura de poder en arena.
- Coach en espejo para demo comparativa.
- Espacio para rotar cuello y activar oblicuo sin obstrucciones.

**Fase 2 — Tabla en arena:**
- Tabla plana, alumno parado en FP2.$tss$,
  ARRAY[$tss$Alumno en ride con STP-018 + STP-017 + STP-021 certificados$tss$,$tss$Tabla cruza hacia frontside con cadena completa + cuerpo conectado + peso adelante$tss$,$tss$Alumno ejecuta 3+ turns frontside con cadena completa + explica conexión con STP-021 (misma cadena, lado opuesto)$tss$]::TEXT[],
  'white',
  5,
  $tss$TURNS & DISMOUNT$tss$,
  22
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-23',
  'STP-023',
  $tss$Paddle Out Efficiency Drill$tss$,
  'mission',
  $tss$15-20 min$tss$,
  $tss$10 strokes Phase 2 / 5 reps Phase 4$tss$,
  ARRAY[$tss$SWEET$tss$,$tss$ENTER$tss$,$tss$ELBOW$tss$,$tss$FORWARD$tss$,$tss$ARROW$tss$]::TEXT[],
  $tss$OBJECTIVE: Teach the student efficient prone paddling technique — sweet spot, alternating long strokes, elbow over ear, aerodynamic hand entry, forward propulsion.

SETUP: Calm water OR safe foam conditions, in waist-to-chest depth. Soft-top board. Coach observing stroke from the side.

PROCEDURE:
Phase 1 — Dry demo (3 reps): Coach simulates strokes on a bench/chair showing elbow over ear + aerodynamic hand entry.
Phase 2 — Calm water or safe foam (10 strokes): Student executes technical strokes without time pressure.
Phase 3 — Continuous paddle (3-5 min): Student paddles from shore toward the lineup executing the technique.
Phase 4 — Gear changes (5 reps): Practice gear 1 → gear 2 → gear 3 according to coach command.$tss$,
  ARRAY[$tss$Alumno con STP-010 Sweet Spot automatizado + Bloques 3-5 dominados$tss$,$tss$Paddleo 50m+ autónomo sin colapsar + uso apropiado de marchas$tss$,$tss$Alumno paddlea al lineup autónomamente + explica 5 key words + 4 marchas$tss$]::TEXT[],
  'white',
  6,
  $tss$PADDLE OUT$tss$,
  23
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-24',
  'STP-024',
  $tss$Turtle Roll Safety Drill$tss$,
  'mission',
  $tss$15-20 min$tss$,
  $tss$5 reps in Phases 3 and 4$tss$,
  ARRAY[$tss$ALIGN$tss$,$tss$RAILS$tss$,$tss$ELBOWS$tss$,$tss$HOLD$tss$,$tss$RECOVER$tss$]::TEXT[],
  $tss$OBJECTIVE: Teach the student the turtle roll — the mandatory safety technique to pass foam or waves while prone on the board without releasing the board.

SETUP: Whitewater area, waist-to-chest depth. Soft-top board. Crowded surf scenario simulation.

PROCEDURE:
Phase 1 — Dry demo (3 reps): Board alignment + rail grip + elbows on top of board on sand.
Phase 2 — Calm water (3 reps): Student practices the roll without foam pressure.
Phase 3 — Small whitewater (5 reps): Student executes complete turtle roll, timing roughly 1 meter before the foam.
Phase 4 — Recovery (5 reps): Post-roll → scissor kick → return to center → resume paddling.$tss$,
  ARRAY[$tss$Alumno en paddle out (STP-023) detecta espuma$tss$,$tss$ola que va a impactar$tss$,$tss$Alumno pasa espuma sin soltar tabla + codos arriba + recovery al centro$tss$,$tss$Alumno ejecuta 5+ turtle rolls sin soltar + explica regla de seguridad + 5 fases + timing$tss$]::TEXT[],
  'white',
  6,
  $tss$PADDLE OUT$tss$,
  24
);

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) VALUES (
  'DRL-WB-25',
  'STP-025',
  $tss$Prone Direction Drill$tss$,
  'mission',
  $tss$10-15 min$tss$,
  $tss$5 reps per mode$tss$,
  ARRAY[$tss$TURN$tss$,$tss$ONE$tss$,$tss$BACK$tss$,$tss$PIVOT$tss$,$tss$READY$tss$]::TEXT[],
  $tss$OBJECTIVE: Teach the student to direct the board while prone using the three canonical modes — one-side paddling, circular hand motion, and seated pivot.

SETUP: Calm water or lineup with low traffic. Soft-top board. Coach observing direction and intention.

PROCEDURE:
Phase 1 — Dry/seated on board (3 reps each technique): Coach demonstrates the 3 modes: one-side paddling, circular movement, seated pivot.
Phase 2 — Calm water (5 reps each mode): Student practices the 3 modes in waist-deep water.
Phase 3 — Real lineup (continuous for 5-10 min): Student executes prone turns under real conditions while waiting for waves.$tss$,
  ARRAY[$tss$Alumno en paddle out (STP-023) prono y necesita redirigir la tabla hacia una dirección específica$tss$,$tss$Tabla queda orientada en dirección deseada + alumno en postura de readiness listo para seguir paddleando o cazar ola$tss$,$tss$Alumno ejecuta los 3 modos aislados + elige modo contextualmente apropiado + readiness post-turn verificado + explica los 3 modos con sus palabras$tss$]::TEXT[],
  'white',
  6,
  $tss$PADDLE OUT$tss$,
  25
);

-- ============================================
-- HELPER: update timestamp on student_step_ratings
-- ============================================

CREATE OR REPLACE FUNCTION update_step_rating_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated := now();
  NEW.rating_count := COALESCE(OLD.rating_count, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS step_rating_timestamp ON student_step_ratings;
CREATE TRIGGER step_rating_timestamp
  BEFORE UPDATE ON student_step_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_step_rating_timestamp();

COMMIT;
