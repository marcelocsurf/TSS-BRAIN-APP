-- 00015 — Masterclass Course Seed Data
-- Auto-generated from canonical TSS White Belt + Pre-Course content

BEGIN;

-- Clean previous seed data
DELETE FROM lesson_quizzes WHERE lesson_id IN (SELECT id FROM lessons);
DELETE FROM lessons;

-- ============================================
-- LESSONS (45 total: 14 PC fundamentals + 7 values + 24 STPs)
-- ============================================

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-001',
  'pre_course_fundamentals',
  1,
  $tss$Safety Rules$tss$,
  $tss$Reglas de Seguridad$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-001 — SAFETY RULES · CANON

**ID:** PC-001
**Tema:** Safety Rules (Reglas de Seguridad)
**Pillar:** Safety & Survival
**Scope:** Pre-Curso + White Belt (pre-water-entry)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md + TSS_Safety_Canon_v2.0_ES
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

Entender y responder a las **3 señales de seguridad**. Dominar el **protocolo star-fall** (brazos extendidos, cuerpo plano, cara arriba; nunca zambullirse de cabeza). La tabla siempre se controla y se mantiene lejos de otros surfistas.

---

## 2. PROTOCOLO STAR-FALL (NO NEGOCIABLE)

- Brazos extendidos.
- Cuerpo plano.
- Cara hacia arriba.
- **NUNCA** zambullirse de cabeza.
- La tabla se protege con mano o cuerpo, nunca se suelta hacia otros.

---

## 3. LAS 3 SEÑALES DE SEGURIDAD

Señales de mano no verbales usadas por coach TSS para comunicar con el alumno en agua:

1. **Stop / Regresa a orilla** — brazo levantado + puño cerrado.
2. **Ven conmigo / Reagrúpate** — brazo en círculo hacia el coach.
3. **Emergencia / Ayuda** — ambos brazos cruzados sobre la cabeza.

El alumno DEBE reconocer las 3 señales antes de entrar al agua por primera vez.

---

## 4. REGLAS CRÍTICAS DE TABLA

- Tabla **siempre** controlada: mano o leash.
- Nunca soltar la tabla hacia otros surfistas.
- Al caer: priorizar tabla (protegerla con el cuerpo) ANTES de pararse.
- **Leash ≠ control.** El leash es respaldo, no sustituye el control manual.

---

## 5. GATING RULE

PC-001 **debe estar conocido antes del primer water entry.** Sin PC-001, el alumno no entra al agua.

---

## 6. CRITERIO DE EVALUACIÓN (K4)

El alumno:
- Enuncia las 3 señales de seguridad.
- Demuestra protocolo star-fall correctamente.
- Explica las reglas de control de tabla.

Pass threshold: **Meets / Does Not Meet** (binario).

---

## 7. REFERENCIAS DOCTRINALES

- TSS Safety Canon v2.0 (Dupla / Triángulo / Imán).
- Instructor-Student Matrix.
- Complemento in-water: STP-003 (Grab Board), STP-014 (Prone Dismount), STP-020 (Starfish Dismount).

---

*TSS® Pre-Course · PC-001 Safety Rules Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY[]::TEXT[],
  'reading',
  1
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-002',
  'pre_course_fundamentals',
  2,
  $tss$Set Goal$tss$,
  $tss$Meta por Sesión$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-002 — SET GOAL · CANON

**ID:** PC-002
**Tema:** Set Goal (Meta por Sesión)
**Pillar:** Method & Mindset
**Scope:** Pre-Curso + White Belt (cada sesión)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

Una meta clara y medible por sesión, definida **antes** de entrar al agua.

> **Emoción propone. Sistema decide. Una meta por sesión.**

---

## 2. REGLA DE ORO

- **Una** meta por sesión — no dos, no cinco.
- **Medible** — se puede verificar objetivamente al final.
- **Escrita o dicha** — no mental / ambigua.
- **Alineada con el belt** — no sobredimensionar el objetivo.

---

## 3. MARCO DE FORMULACIÓN

Plantilla: *"Hoy trabajo [habilidad específica] en [contexto específico] con criterio [específico]."*

Ejemplos canónicos White Belt:
- "Hoy trabajo pop-up en agua quieta con criterio de 5/8 exitosos."
- "Hoy trabajo sweet spot con criterio de 0 nose-diving en 10 intentos."
- "Hoy trabajo paddle out con criterio de llegar al canal sin soltar la tabla."

---

## 4. RITUAL DE PRE-SESIÓN

1. Coach pregunta: *"¿Cuál es tu meta de hoy?"*
2. Alumno enuncia la meta.
3. Coach valida o refina.
4. Meta se repite mid-session (mínimo 1 vez).
5. Post-sesión: debrief contra la meta.

---

## 5. CRITERIO DE EVALUACIÓN (K10)

El alumno:
- Establece una meta medible antes de cada sesión.
- Recuerda la meta mid-session.
- Evalúa el resultado contra la meta al final.

---

## 6. PRINCIPIO DOCTRINAL

Esta es una aplicación directa de la **ADHD RULE / Focus Law de Marcelo OS** al agua:
- Las ideas se capturan, analizan y agendan.
- La emoción propone, el sistema decide.
- Dispersión en agua = dispersión en la vida.

---

## 7. REFERENCIAS

- Complemento método: PC-003 (Aprender a Aprender), PC-012 (One Wave Framework).
- In-water: rubric verificada en todos los steps (cada STP tiene "criterio de éxito").

---

*TSS® Pre-Course · PC-002 Set Goal Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-001']::TEXT[],
  'form',
  2
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-003',
  'pre_course_fundamentals',
  3,
  $tss$Aprender a Aprender TSS$tss$,
  $tss$Meta-aprendizaje del sistema$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-003 — APRENDER A APRENDER TSS · CANON

**ID:** PC-003
**Tema:** Aprender a Aprender TSS (Meta-aprendizaje del sistema)
**Pillar:** Method & Mindset
**Scope:** Pre-Curso (requisito previo a agua)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

Cómo funciona TSS: estructura, vocabulario, progresión de cinturones, qué es un Step, qué es un Drill, qué es una Sequence.

> **Know the map before you enter the water.**

---

## 2. VOCABULARIO CANÓNICO

| Término | Definición TSS |
|---|---|
| **Step (STP)** | Unidad técnica individual productizada. Ej: STP-016 Pop-Up. |
| **Drill (DRL)** | Ejercicio estructurado para consolidar un step. |
| **Sequence (SEQ)** | Cadena de steps que forma una rutina completa. |
| **Belt** | Nivel de cinturón (White → Yellow → Blue → Purple → Brown → Black). |
| **Value** | Valor central del belt (ej: White = Humildad). |
| **Block** | Subdivisión del belt (White tiene 6 blocks). |
| **Error Card (ERR)** | Documento de error común con severity. |
| **Anchor Phrase** | Frase de 5 Key Words del step. |
| **Micro-cue** | Cue verbal corto para ejecución in-water. |

---

## 3. PROGRESIÓN DE CINTURONES

| Belt | Valor | Enfoque |
|---|---|---|
| Pre-Curso | Consciencia | Teoría antes de agua |
| White | Humildad | Fundamentos agua blanca |
| Yellow | Proceso (Resiliencia) | Canal y olas abiertas |
| Blue | Compromiso | Maneuver completo |
| Purple | Responsabilidad | Olas grandes / condiciones |
| Brown | Gratitud | Maestría personal |
| Black | Impacto | Enseñanza y legado |

---

## 4. FILOSOFÍA DE APRENDIZAJE TSS

1. **Método sobre talento** — el sistema genera el surfista, no al revés.
2. **Steps antes que olas** — la técnica se construye seca antes que mojada.
3. **Clásico → Ecológico** — primero repetición controlada, después decisión contextual.
4. **Errores nombrados** — cada error tiene código, severity y protocolo de corrección.
5. **Valores primero** — cada belt es un valor interior ANTES que técnica.

---

## 5. CRITERIO DE EVALUACIÓN (K9)

El alumno explica con sus palabras: Step, Drill, Sequence, Belt, Value.

---

## 6. REFERENCIAS

- Complementa: PC-002 (Set Goal), PC-007 (4 Pilares), PC-012 (One Wave).
- Es la "introducción al sistema" — sin PC-003, los otros PC no tienen marco.

---

*TSS® Pre-Course · PC-003 Aprender a Aprender TSS Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-002']::TEXT[],
  'reading',
  3
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-004',
  'pre_course_fundamentals',
  4,
  $tss$Goofy or Regular$tss$,
  $tss$Postura natural$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-004 — GOOFY OR REGULAR · CANON

**ID:** PC-004
**Tema:** Goofy or Regular (Postura natural)
**Pillar:** Method & Mindset / Technical Foundation
**Scope:** Pre-Curso (assessment único)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

Identificación de la postura natural del surfista.

- **Regular:** pie izquierdo adelante.
- **Goofy:** pie derecho adelante.

Assessment **único fundacional** — se define una vez y se aplica en cada sesión posterior.

---

## 2. TESTS DE IDENTIFICACIÓN

**Test A — Empujón suave (seco):**
- Alumno de pie con pies juntos.
- Coach empuja desde atrás suavemente.
- El pie que va adelante para recuperar balance = pie de stance.

**Test B — Escalera imaginaria:**
- "¿Con qué pie subirías un escalón primero?"
- Pie que NO sube primero = pie adelante en la tabla.

**Test C — Patinaje / Skate:**
- Si el alumno patina o skatea, preguntar cómo se para en la tabla.
- Usar esa postura como referencia.

---

## 3. CONSISTENCIA CANÓNICA

- La postura NO se cambia por capricho.
- Una vez identificada, se mantiene en todos los steps.
- Coach verifica postura antes de cada pop-up (STP-016) e impulso (STP-019).
- Cambios de postura = señal de problema — revisar tests.

---

## 4. IMPLICACIÓN TÉCNICA

- **Regular:** turn backside = derecha (en olas de izquierda para el surfista).
- **Goofy:** turn backside = izquierda.
- Afecta configuración de leash (pie trasero), cue verbal y lectura de error.

---

## 5. CRITERIO DE EVALUACIÓN (K12)

El alumno:
- Declara su postura natural consistentemente.
- Aplica la postura en cada sesión.
- Coach valida que el alumno no cambia de postura sin causa.

---

## 6. REFERENCIAS

- Input directo para: STP-017 (Feet Position Center), STP-018 (Power Stance), STP-021 (Turn Backside), STP-022 (Turn Frontside).

---

*TSS® Pre-Course · PC-004 Goofy or Regular Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-003']::TEXT[],
  'test',
  4
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-005',
  'pre_course_fundamentals',
  5,
  $tss$What is Surf$tss$,
  $tss$Definición doctrinal$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-005 — WHAT IS SURF · CANON

**ID:** PC-005
**Tema:** What is Surf? (Definición doctrinal)
**Pillar:** Doctrinal Foundation
**Scope:** Pre-Curso
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

El surf es una práctica de **montar olas rompientes** usando una tabla, gobernada por la interacción entre **ola, surfista y océano**.

El surf es **simultáneamente un deporte y una relación con el océano**. No es solo atletismo: es vínculo.

---

## 2. TRIÁNGULO FUNDAMENTAL

```
         OLA
          △
         ╱ ╲
        ╱   ╲
       ╱     ╲
  SURFISTA — OCÉANO
```

Ninguno de los tres puede ausentarse:
- **Ola:** energía medible, direccional, transitoria.
- **Surfista:** intención, técnica, postura interior.
- **Océano:** contexto vivo, dinámico, mayor que los tres.

---

## 3. DIFERENCIAS CON OTROS DEPORTES

| Dimensión | Surf | Deporte tradicional |
|---|---|---|
| Escenario | Dinámico y cambiante | Estático y controlado |
| Elemento | Ola viva, irrepetible | Campo / cancha fija |
| Rival | Condiciones + uno mismo | Oponente humano |
| Tiempo | Ventana de ola | Reloj definido |
| Control | Parcial (con el océano) | Total (del espacio) |

El surf no es un deporte — es un **diálogo**.

---

## 4. LA OLA COMO MAESTRA

Cada ola es:
- **Irrepetible** (única, no se repite).
- **Generosa** (si se lee bien).
- **Exigente** (si se ignora).
- **Instructiva** (incluso cuando no se atrapa).

No se le gana a la ola. Se surfea **con** ella.

---

## 5. CRITERIO DE EVALUACIÓN (K1)

El alumno:
- Define surf con sus propias palabras.
- Explica la relación ola / surfista / océano.
- Entiende que el surf es relación, no dominación.

---

## 6. REFERENCIAS DOCTRINALES

- Complementa PC-006 (History), PC-007 (4 Pilares), PC-012 (One Wave).
- Input para todo el ecosistema TSS — sin PC-005 el resto carece de raíz.

---

*TSS® Pre-Course · PC-005 What is Surf Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-004']::TEXT[],
  'reading',
  5
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-006',
  'pre_course_fundamentals',
  6,
  $tss$History of Surf$tss$,
  $tss$Raíz histórica$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-006 — HISTORY OF SURF · CANON

**ID:** PC-006
**Tema:** History of Surf (Raíz histórica)
**Pillar:** Doctrinal Foundation
**Scope:** Pre-Curso
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

Origen en **Polinesia**, arribo a **Hawái**, casi desaparición, revival por **Duke Kahanamoku**, evolución hacia la práctica global moderna y **Olímpica**.

El surf es una **disciplina ancestral**, no una invención reciente. **Respeta la tradición.**

---

## 2. LÍNEA HISTÓRICA CANÓNICA

| Época | Hito |
|---|---|
| ~3000 años atrás | Polinesia — práctica espiritual / social |
| Pre-contacto | Hawái — *he'e nalu* (deslizamiento sobre olas), práctica de reyes y pueblo |
| S. XVIII-XIX | Contacto europeo → declive (prohibición / marginación) |
| Inicios S. XX | Revival hawaiano — Duke Kahanamoku como embajador global |
| Mediados S. XX | Expansión California / Australia — cultura surf moderna |
| Fines S. XX | Profesionalización (WSL), shortboard revolution |
| 2020 (Tokio) | Debut Olímpico |
| Siglo XXI | Disciplina global, inclusiva, patrimonial |

---

## 3. FIGURAS FUNDACIONALES

- **Duke Kahanamoku** — campeón olímpico de natación, embajador global del surf, preservador del *aloha*.
- **Tom Blake** — innovación de tabla hueca, primer leash.
- **Generación Hawai'i** — guardianes del espíritu original.

---

## 4. PRINCIPIO DOCTRINAL

El surf **no pertenece a quien lo hace** — pertenece a la tradición que lo sostuvo. Cada vez que entramos al agua, entramos en una línea que va desde Polinesia hasta hoy. Esto exige:

1. **Respeto** a la raíz cultural.
2. **Humildad** frente a los que vinieron antes.
3. **Responsabilidad** de no degradar la tradición con ego o ignorancia.

---

## 5. CRITERIO DE EVALUACIÓN (K2)

El alumno:
- Enuncia el origen del surf (Polinesia / Hawái).
- Nombra al menos una figura fundacional (ej: Duke Kahanamoku).
- Comprende que el surf es patrimonio, no invención comercial.

---

## 6. REFERENCIAS

- Complementa PC-005 (What is Surf), PC-011 (Etiquette — respeto como herencia).
- Base de la **Lección 1 / Mental Surfing** en material complementario ISA.

---

*TSS® Pre-Course · PC-006 History of Surf Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-005']::TEXT[],
  'reading',
  6
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-007',
  'pre_course_fundamentals',
  7,
  $tss$Four Pillars$tss$,
  $tss$Los Cuatro Pilares del crecimiento holístico$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-007 — FOUR PILLARS OF HOLISTIC GROWTH · CANON

**ID:** PC-007
**Tema:** Four Pillars (Los Cuatro Pilares del crecimiento holístico)
**Pillar:** Doctrinal Foundation
**Scope:** Pre-Curso + estructura para TODO el sistema TSS
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

TSS desarrolla al surfista a través de **cuatro pilares**:

1. **Físico** — cuerpo, biomecánica, condición, coordinación.
2. **Mental** — foco, disciplina, regulación emocional, metas.
3. **Técnico** — dominio de secuencias, selección de olas, ejecución.
4. **Social-Ético** — respeto, etiqueta, comunidad, responsabilidad.

> **TSS no entrena ondeadores. TSS entrena surfistas completos.**

---

## 2. VISUAL CANÓNICO

```
            FÍSICO
              ▲
              │
   MENTAL ◀── SURFER ──▶ TÉCNICO
              │
              ▼
        SOCIAL-ÉTICO
```

Los 4 pilares son equidistantes. Ninguno es opcional. Debilitar uno colapsa los otros.

---

## 3. PILAR POR PILAR

### 3.1. FÍSICO
- Biomecánica del pop-up.
- Condición cardiovascular para remar.
- Coordinación hombro-cadera-pie.
- Resistencia de apnea básica.
- Movilidad (especialmente tobillo y cadera).

### 3.2. MENTAL
- Foco en agua turbulenta.
- Regulación emocional (miedo, frustración, euforia).
- Visualización pre-ola.
- Meta por sesión (PC-002).
- Reflexión post-ola (PC-012).

### 3.3. TÉCNICO
- Secuencia de steps TSS.
- Selección de ola (wave reading).
- Lectura de canal y corrientes.
- Errores nombrados y corrección.
- Progresión belt a belt.

### 3.4. SOCIAL-ÉTICO
- Etiqueta en el lineup (PC-011).
- Respeto a locales.
- Responsabilidad ambiental.
- Cuidado entre alumnos.
- Integridad como surfista.

---

## 4. CONEXIÓN CON BELTS

Cada belt enfatiza un valor que opera transversalmente sobre los 4 pilares:

| Belt | Valor | Impacto en los 4 pilares |
|---|---|---|
| White | Humildad | Apertura a aprender en los 4 |
| Yellow | Proceso | Resiliencia ante fallos en los 4 |
| Blue | Compromiso | Constancia en los 4 |
| Purple | Responsabilidad | Madurez en los 4 |
| Brown | Gratitud | Reconocimiento del camino |
| Black | Impacto | Transmisión a otros |

---

## 5. CRITERIO DE EVALUACIÓN (K3)

El alumno:
- Nombra los 4 pilares.
- Explica qué desarrolla cada uno.
- Entiende que son interdependientes.

---

## 6. REFERENCIAS

- Base doctrinal para todos los canon seals de belts.
- Input directo para estructuración de entrenamiento complementario (Preparación Física D, Preparación Mental).

---

*TSS® Pre-Course · PC-007 Four Pillars Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-006']::TEXT[],
  'reading',
  7
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-008',
  'pre_course_fundamentals',
  8,
  $tss$Surf Equipment$tss$,
  $tss$Parts & Types$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-008 — SURF EQUIPMENT · CANON

**ID:** PC-008
**Tema:** Surf Equipment — Parts & Types
**Pillar:** Equipment & Venue
**Scope:** Pre-Curso + White Belt
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

Conocer las **partes de la tabla** y los **tipos de tablas**.

> **White Belt opera en softboards** por seguridad y flotación.
> **Conoce tu herramienta antes de usarla.**

---

## 2. PARTES DE LA TABLA (CANON)

| Parte | Definición |
|---|---|
| **Nose** | Punta frontal de la tabla. |
| **Tail** | Cola de la tabla. |
| **Rails** | Cantos laterales (izquierdo y derecho). |
| **Deck** | Cara superior (donde pisa el surfista). |
| **Bottom** | Cara inferior (contacto con agua). |
| **Rocker** | Curvatura longitudinal (vista de perfil). |
| **Fins** | Quillas (estabilidad y control direccional). |
| **Leash** | Cabo de seguridad tobillo-tabla. |
| **Stringer** | Refuerzo longitudinal interno. |

---

## 3. TIPOS DE TABLAS

| Tipo | Descripción | Belt típico |
|---|---|---|
| **Softboard** | Espuma, alta flotación, segura para principiantes | White (obligatorio) |
| **Longboard** | >9 ft, mucha flotación, trims largos | White avanzado / Yellow |
| **Funboard** | 7-8 ft, híbrida, transición | Yellow / Blue |
| **Fish** | Corta, ancha, olas pequeñas | Blue+ |
| **Shortboard** | <7 ft, alta maniobra | Blue+ |

---

## 4. REGLA DOCTRINAL DE WHITE BELT

**White Belt = Softboard obligatorio.**

Razones:
1. **Seguridad** — impacto amortiguado (propio, ajeno, suelo).
2. **Flotación** — permite remada relajada y pop-up sin hundirse.
3. **Estabilidad** — reduce errores técnicos amplificados por tabla técnica.
4. **Curva de aprendizaje** — progresa más rápido que con hard-board.

Cambiar a tabla dura antes de Yellow Belt = **violación doctrinal**. No se pasa a hard-board sin certificación White.

---

## 5. SETUP PRE-AGUA (CHECKLIST)

- [ ] Wax aplicado en deck (longitudinal desde nose a centro).
- [ ] Leash ajustado a tobillo del pie trasero (según PC-004).
- [ ] Quillas bien ajustadas (no flojas).
- [ ] Inspección visual: sin dings profundos.
- [ ] Traje/lycra adecuado a temperatura.

---

## 6. CRITERIO DE EVALUACIÓN (K7)

El alumno:
- Nombra todas las partes de la tabla.
- Identifica los tipos principales.
- Sabe qué tipo corresponde a su belt actual (White = softboard).

---

## 7. REFERENCIAS

- Input directo para: STP-003 (Grab Board), STP-005 (Put Board in Water), STP-006 (Control Your Board).
- Presentaciones de apoyo: SURF EQUIPMENT / Parts of Surfboard / Types of Surfboards.

---

*TSS® Pre-Course · PC-008 Surf Equipment Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-007']::TEXT[],
  'reading',
  8
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-009',
  'pre_course_fundamentals',
  9,
  $tss$Venue Analysis Theory$tss$,
  $tss$Lectura de spot$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-009 — VENUE ANALYSIS THEORY · CANON

**ID:** PC-009
**Tema:** Venue Analysis Theory (Lectura de spot)
**Pillar:** Equipment & Venue
**Scope:** Pre-Curso + White Belt (pre-water-entry obligatorio)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

Framework para leer el spot **antes** de entrar al agua:
- Dirección de la ola.
- Tipo de rompiente (beach / point / reef).
- Zonas de entrada y salida.
- Peligros (hazards).
- Efecto de marea y viento.
- Fit de nivel (¿corresponde al belt actual?).

> **Read the ocean before you enter the ocean.**

Compañero teórico del step in-water **STP-001 (Venue Analysis).**

---

## 2. FRAMEWORK VCA-6 (Canon TSS)

Las **6 lecturas obligatorias** antes de entrar:

| # | Lectura | Pregunta canónica |
|---|---|---|
| 1 | Dirección | ¿La ola viene de izquierda o derecha? |
| 2 | Rompiente | ¿Es beach break, point break, o reef? |
| 3 | Entrada/Salida | ¿Por dónde entro y por dónde salgo? |
| 4 | Peligros | ¿Qué hay que evitar? (rocas, corrientes, otros surfistas) |
| 5 | Marea/Viento | ¿Está en su mejor momento ahora? |
| 6 | Fit de nivel | ¿Este spot es adecuado para mi belt? |

---

## 3. TIPOS DE ROMPIENTES

### Beach Break
- Fondo de arena.
- Olas variables en posición.
- Ideal para White Belt.
- Ventaja: fallar es barato.
- Desventaja: peaks cambiantes → lectura constante.

### Point Break
- Fondo rocoso/coralino con punta de tierra.
- Olas predecibles y largas.
- Más exigente — requiere respeto al lineup.

### Reef Break
- Fondo de arrecife.
- Olas potentes y precisas.
- **No recomendado para White Belt.**

---

## 4. HAZARDS COMUNES

- Corrientes (ver PC-010).
- Rocas/coral.
- Otros surfistas (priority rule — ver PC-011).
- Fondo poco profundo.
- Objetos flotantes/basura.
- Vida marina (rara pero real).
- Temperatura (hipotermia con agua fría).

---

## 5. REGLA DE MARCELO PARA VENUE ANALYSIS

**Si no puedes leer el spot, no entras al spot.**

Si hay dudas sobre cualquiera de los 6 puntos → no entrar. Esperar al coach. Cambiar de spot. O quedarse en tierra observando ese día.

Esto enlaza directamente con PC-013 (If In Doubt, Don't Go Out).

---

## 6. CRITERIO DE EVALUACIÓN (K8)

El alumno:
- Describe un spot usando el framework VCA-6.
- Identifica al menos 3 hazards en un venue dado.
- Concluye si el venue es apropiado para su nivel actual.

---

## 7. REFERENCIAS

- Pareja in-water: STP-001 Venue Analysis.
- Complementa: PC-010 (Currents), PC-011 (Etiquette), PC-013 (If in Doubt).
- Gating rule: PC-009 **obligatorio antes del primer water entry.**

---

*TSS® Pre-Course · PC-009 Venue Analysis Theory Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-008']::TEXT[],
  'reading',
  9
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-010',
  'pre_course_fundamentals',
  10,
  $tss$Currents & Rip Current Response$tss$,
  NULL,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-010 — CURRENTS & RIP CURRENT RESPONSE · CANON

**ID:** PC-010
**Tema:** Currents & Rip Current Response
**Pillar:** Safety & Survival
**Scope:** Pre-Curso + White Belt (pre-water-entry obligatorio)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md + TSS_Safety_Canon_v2.0_ES
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

Identificar visualmente corrientes y rip currents. Si te atrapa: **NO luches contra la corriente**. Paddle **PARALELO** a la orilla hasta salir. Señala si necesitas ayuda. Evita entrar cuando las condiciones muestren corriente fuerte.

---

## 2. IDENTIFICACIÓN VISUAL DE RIP

Señales visuales canónicas:

- **Canal sin rompientes** entre dos zonas de espuma — la ola se "abre" en ese punto.
- **Agua más oscura** que el entorno (mayor profundidad).
- **Espuma o sedimento moviéndose hacia afuera.**
- **Líneas de olas rotas** irregulares en un punto específico.
- **Ausencia de surfistas** en una zona donde deberían estar.

Regla práctica: **si el mar se ve "extrañamente tranquilo" entre olas rompientes, es rip.**

---

## 3. PROTOCOLO SI TE ATRAPA UN RIP (CANON)

**PASO 1: NO LUCHAR.**
Nunca nadar/remar contra la corriente hacia la orilla directa. La corriente es más fuerte que tú.

**PASO 2: PADDLE PARALELO A LA ORILLA.**
Remar lateralmente (paralelo al borde de la playa) hasta salir del canal del rip.

**PASO 3: UNA VEZ FUERA, REMAR HACIA ORILLA.**
Con las olas ayudando, volver a entrar a la zona segura.

**PASO 4: SI NO PUEDES SALIR, SEÑALAR.**
Levantar un brazo con señal de emergencia (PC-001). Mantener la tabla como flotador.

---

## 4. REGLA PRINCIPAL

**Tabla = flotador. Tabla = vida. Nunca soltar la tabla en un rip.**

La tabla es tu dispositivo de flotación. Sin ella, la supervivencia se vuelve exponencialmente más difícil.

---

## 5. USO CONTROLADO DE RIPS (DOCTRINA)

Los surfistas avanzados **USAN** los rips para salir al lineup sin gastar energía remando contra las olas. **Pero esto es Yellow+/Blue.**

**White Belt NO entra a un rip intencionalmente.** El uso de rip como "autopista de salida" es un privilegio de cinturones avanzados que saben leer el océano.

---

## 6. PREVENCIÓN

- Observa el spot **5-10 minutos** antes de entrar (VCA-6 de PC-009).
- Pregunta al coach o a locales sobre rips conocidos.
- Si hay bandera roja de salvavidas → no entrar.
- Si la marea está cambiando fuerte → observar primero.

---

## 7. CRITERIO DE EVALUACIÓN (K5)

El alumno:
- Identifica visualmente un rip current.
- Enuncia la respuesta correcta: **paddle paralelo, señalar, no luchar.**
- Explica por qué nunca se suelta la tabla.

---

## 8. REFERENCIAS

- Complementa: PC-001 (Safety Rules — señales), PC-009 (Venue Analysis).
- Integrado en Safety Canon v2.0 (Part II — Emergency Protocols).
- Gating rule: PC-010 **obligatorio antes del primer water entry.**

---

*TSS® Pre-Course · PC-010 Currents & Rip Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-009']::TEXT[],
  'reading',
  10
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-011',
  'pre_course_fundamentals',
  11,
  $tss$Surf Etiquette$tss$,
  $tss$Código del lineup$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-011 — SURF ETIQUETTE · CANON

**ID:** PC-011
**Tema:** Surf Etiquette (Código del lineup)
**Pillar:** Safety & Survival + Social-Ética
**Scope:** Pre-Curso + White Belt (pre-water-entry obligatorio)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

**Priority rule: el surfista más cerca del peak tiene prioridad.**

Reglas no negociables:
- **No drop-in** (no dropear sobre otra ola ocupada).
- **No snaking** (no rodear para robar prioridad).
- **Respeta a los locales.**
- **Paddle alrededor del lineup, nunca a través.**
- **Una ola, un surfista.**
- **Respeto es no negociable.**

---

## 2. PRIORITY RULE (REGLA MADRE)

> El surfista **más cerca del peak** (punto donde rompe primero la ola) **tiene prioridad**.

Consecuencia: si tú entras a una ola donde alguien ya está más cerca del peak, **tú cometiste drop-in**. Retirarse inmediatamente.

Excepción técnica: en condiciones de "a-frame" (ola que rompe a ambos lados), dos surfistas pueden ir si uno va a la izquierda y otro a la derecha — con coordinación verbal previa.

---

## 3. LOS DO's Y DON'Ts CANÓNICOS

### DO's
- **Observar** 5 minutos antes de entrar al lineup.
- **Saludar** con señal o verbal al llegar.
- **Esperar turno** — rotación natural del lineup.
- **Pedir disculpas** si cometes error.
- **Ayudar** a alguien en dificultad.
- **Respetar a locales** — ellos conocen el spot.
- **Remar alrededor** del lineup, nunca por el medio.

### DON'Ts
- **NO dropear** sobre ola ocupada.
- **NO snakear** (rodear para robar).
- **NO hablar fuerte / celebrar excesivo.**
- **NO remar** frente a alguien que está bajando en la ola.
- **NO soltar la tabla** en el lineup.
- **NO traer ego.**
- **NO ignorar a locales.**

---

## 4. JERARQUÍA DEL LINEUP

| Nivel | Quién | Cómo tratar |
|---|---|---|
| 1 | Locales | Respeto máximo — ellos mantienen el spot |
| 2 | Regulares del spot | Reconocer con saludo |
| 3 | Surfistas experimentados | Respeto técnico |
| 4 | Visitantes | Tratar con cortesía |
| 5 | Principiantes | Enseñar con paciencia si es posible |

White Belt = eres nivel 5. **Tu trabajo es observar, respetar y aprender.**

---

## 5. PROTOCOLO DE ENTRADA AL LINEUP

1. Observa desde fuera **5-10 minutos**.
2. Identifica al "boss" del lineup (el mejor o el más respetado).
3. Entra remando por la periferia, nunca por el canal central.
4. Saluda con señal al acercarte.
5. Espera tu turno — no saltes la fila.
6. Si cometes un error, reconoce verbalmente ("sorry" / "mi error").

---

## 6. CONEXIÓN CON HUMILDAD (VALOR WHITE BELT)

La etiqueta es **humildad aplicada al lineup**. Sin humildad no hay respeto. Sin respeto no hay comunidad. Sin comunidad no hay lineup saludable.

> **Un White Belt que respeta la etiqueta ya demostró más madurez que muchos con cinturón más alto.**

---

## 7. CRITERIO DE EVALUACIÓN (K6)

El alumno:
- Enuncia la priority rule.
- Enuncia al menos 3 reglas clave (no drop-in, no snaking, paddle around).
- Demuestra comprensión de la jerarquía del lineup.

---

## 8. REFERENCIAS

- Presentación de apoyo: SURF ETIQUETTE — Complete Guide (clasificada en C_Presentaciones).
- Complementa PC-006 (History — respeto como herencia), VAL-002 (Humildad).
- Gating rule: PC-011 **obligatorio antes del primer water entry.**

---

*TSS® Pre-Course · PC-011 Surf Etiquette Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-010']::TEXT[],
  'reading',
  11
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-012',
  'pre_course_fundamentals',
  12,
  $tss$One Wave Framework$tss$,
  $tss$Evolve through play$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-012 — ONE WAVE FRAMEWORK · PACKAGE v2

**Document ID:** PC-012_PACKAGE_v2
**Supersedes:** PC-012_PACKAGE_v1 (contained fabricated drills, error cards, and K-indicators — see §11 Change Log)
**Status:** DRAFT — awaiting Marcelo review before replication as template for PC-001..PC-014
**Authority:** IP of Marcelo Castellanos / Enkrateia · TSS®
**Version Date:** 2026-04-18

---

## 0 · SOURCE TRACEABILITY DECLARATION

Every substantive claim in this package is tagged with its source:

- `[BOOK §X, p.Y]` — direct from *ONE WAVE: The Surfer's Guide to Focus, Flow and Conscious Progress* by Marcelo Castellanos, Enkrateia 2026 (54 pages, Digital Edition TSS-OW-2026).
- `[CANON v1]` — from `PC-012_One_Wave_Framework_Canon_v1.md` (the TSS internal canon file).
- `[TBD — Marcelo input]` — claim is not yet sourced; flagged for Marcelo's decision before it enters the canonical package.

**Rule:** nothing in this document is invented by Claude. If it is not tagged with a source, it does not appear.

---

## 1 · FICHA TÉCNICA

| Campo | Valor | Fuente |
|---|---|---|
| Canonical ID | PC-012 | [CANON v1] |
| Tema | One Wave Framework | [CANON v1], [BOOK Ch 2] |
| Tagline oficial | *Evolve through play* | [BOOK cover, p.17] |
| Doctrina central | "One wave. One intention." | [BOOK Preface p.7; Final Words p.47] |
| Pillar | Method & Mindset | [CANON v1] |
| GOD MODE Film Order | #1 (P1a — LENTE) | [CANON internal — Film Order sheet in Registry v3.40+] |
| Scope | Pre-Curso foundational + transversal to all belts | [CANON v1], [BOOK Preface p.6] |
| Primary book reference | *ONE WAVE* (54 pp., 2026) | [BOOK cover] |

---

## 2 · CANON DOCTRINAL (texto íntegro verificable)

### 2.1 La frase raíz

> **"One wave. One intention."**
> — [BOOK Preface, p.7; and Final Words, p.47 — repeated as the seed of the whole book]

### 2.2 Por qué existe el concepto (según el libro)

> "Nobody teaches surfers how to train. [...] What doesn't exist — or didn't, until now — is a guide to the mental architecture of learning itself."
> — [BOOK Preface, p.6]

### 2.3 La cita que sostiene el principio

> "In his book *The ONE Thing*, Gary Keller makes the case that the brain learns best when it has a single, clear focus. Not five objectives. Not a general intention to surf well. One thing. One wave. One specific intention carried into the water with full attention."
> — [BOOK Preface, p.7 — Marcelo cita a Keller]

### 2.4 La distinción clave: Free Surf vs Training

> "Free surfing is expression. [...] Training is intervention. [...] The problem is not that surfers free surf. The problem is that most surfers call everything they do in the water 'training' — and then wonder why their improvement is slow."
> — [BOOK Ch 2, p.14]

### 2.5 El principio mecánico: Switch Cost

> "When the mind shifts between tasks, it pays an energy cost. Neuroscientists call this the 'switch cost' [...]. One objective. The switch cost drops to nearly zero. Full attention can go to one specific thing."
> — [BOOK Ch 2, p.15]

### 2.6 El modelo de 4 fases (del canon interno TSS, NO explícito en el libro)

El canon v1 define 4 fases obligatorias por ola:
Intención → Ejecución → Observación → Ajuste.

> "Cada ola tiene 4 fases obligatorias. [...] Sin las 4 fases, no hubo 'One Wave' — hubo 'ola consumida'."
> — [CANON v1 §3]

**Nota de reconciliación:** el libro habla de "one specific intention carried into the water with full attention" y de una pregunta única post-sesión ("Did I work on what I came to work on?" [BOOK Ch 2, p.16]), pero no enumera las 4 fases con esos nombres. El canon v1 operacionaliza el principio del libro en 4 fases. Ambos son consistentes; el canon es más granular.

**Decisión pendiente [TBD — Marcelo input]:** ¿el modelo de 4 fases del canon v1 es doctrinal fijo, o es una operacionalización didáctica que se puede flexibilizar?

---

## 3 · CONCEPTOS CANÓNICOS EXTRAÍDOS DEL LIBRO

Los siguientes conceptos son doctrinales según el libro y forman el cuerpo teórico de PC-012. Cada uno es material directo para video-scripts, manuales, y drills.

### 3.1 Núcleo central

| # | Concepto | Fuente |
|---|---|---|
| C1 | One wave, one intention | [BOOK Preface p.7; Ch 2 p.13] |
| C2 | Free surfing vs Training (dos actividades distintas) | [BOOK Ch 2 pp.14-15] |
| C3 | Switch cost (coste cognitivo de cambiar objetivos) | [BOOK Ch 2 p.15] |
| C4 | Ego's Interference (el ego sabotea el drill en la buena ola) | [BOOK Ch 2 p.15] |
| C5 | "Did I work on what I came to work on?" (única pregunta post-sesión) | [BOOK Ch 2 p.16] |

### 3.2 Conceptos del Inner Game (Ch 1 — background que da contexto a One Wave)

| # | Concepto | Fuente |
|---|---|---|
| C6 | La mente escapa en dos direcciones (futuro/pasado) | [BOOK Ch 1 p.10] |
| C7 | Take Out the Trash (limpieza mental pre-sesión) | [BOOK Ch 1 p.11] |
| C8 | Curiosity as the optimal learning state | [BOOK Ch 1 p.11] |
| C9 | Breath as Navigation (breath como control del estado) | [BOOK Ch 1 p.12] |
| C10 | **The 30-Second Pre-Session Ritual** (3 preguntas + 3 respiros + 1 foco) | [BOOK Ch 1 p.12] |

### 3.3 La fricción (Ch 3-5 — por qué One Wave requiere tolerancia al malestar)

| # | Concepto | Fuente |
|---|---|---|
| C11 | Comfort zone + cita Danaher ("price of evolution") | [BOOK Ch 3 p.19] |
| C12 | Frustration Is Information | [BOOK Ch 3 p.20] |
| C13 | The Learning Zone (just beyond current automatic capacity) | [BOOK Ch 3 p.21] |
| C14 | Beginner's Mind (shoshin) | [BOOK Ch 3 p.21] |
| C15 | Flow definition (Csikszentmihalyi) + Flow Channel | [BOOK Ch 4 pp.23] |
| C16 | Cómo se rompe el flow: Comparison, Outcome focus, Mismatched challenge, Unclear intention | [BOOK Ch 4 p.25] |
| C17 | "Expect nothing. Enjoy everything." (mantra) | [BOOK Ch 5 p.27] |
| C18 | Two Timelines: Technical Performance + Ocean Knowledge | [BOOK Ch 5 p.28] |

### 3.4 El sistema (Ch 6-8 — cómo One Wave se integra en La Nave)

| # | Concepto | Fuente |
|---|---|---|
| C19 | Four Pillars: Physical / Technical / Tactical / Mental | [BOOK Ch 6 p.35; About p.49] |
| C20 | Goals: Long-term / Medium-term / Short-term | [BOOK Ch 6 p.36] |
| C21 | Build → Rest → Test → Evaluate (semana) | [BOOK Ch 6 pp.36-37] |
| C22 | Law of Action: nervous system adapts to repetition, not understanding | [BOOK Ch 7 p.39] |
| C23 | La Nave del Surf — 5 zonas (Engine / Bisagra / 7 Steps / 3 Circles / ICE) + Safety Ring + Pillars | [BOOK Ch 8 pp.42-46] |
| C24 | "The intelligent surfer understands. The wise surfer paddles out." | [BOOK Ch 7 p.40; Final Words p.47] |

---

## 4 · ANÉCDOTAS / CASOS DE ENSEÑANZA (usables para video, manual, curso)

Todos son de Marcelo, tomados literalmente del libro. Activos narrativos de alto valor.

| # | Anécdota | Uso didáctico | Fuente |
|---|---|---|---|
| A1 | El psicólogo y el círculo con el punto (Marcelo, 10 años, diagnóstico ADHD) | Apertura del concepto FOCUS | [BOOK Ch 1 p.10] |
| A2 | Ice baths → relación breath/estado | Ilustra Breath as Navigation | [BOOK Ch 1 p.12] |
| A3 | La junior surfer talentosa + front foot placement | Ilustra "one thing" en sesión real | [BOOK Ch 2 pp.13-14] |
| A4 | Marcelo training BJJ 2017 — regresión después de 2 años | Ilustra Comfort Zone / price of evolution | [BOOK Ch 3 p.19] |
| A5 | Bryan Pérez vs Jeremy Flores en World Championship | Ilustra Flow bajo presión olímpica | [BOOK Ch 4 p.24] |
| A6 | Indonesia — Marcelo peleando con sus propias expectativas | Ilustra "Expect nothing. Enjoy everything." | [BOOK Ch 5 p.27] |
| A7 | The French Waterman (Foundation level, quería renunciar) | Ilustra Two Timelines y el diagnóstico de nivel | [BOOK Ch 5 p.28] |
| A8 | Bryan Pérez, primer surfista olímpico de El Salvador, Paris 2024 | Prueba de resultado del método | [BOOK Preface p.6; About p.49] |

---

## 5 · RITUALES Y PROTOCOLOS (todos con fuente directa)

### 5.1 The 30-Second Pre-Session Ritual

Fuente directa: [BOOK Ch 1 p.12].

Protocolo exacto del libro:

1. **Sit or stand still for thirty seconds.**
2. **Ask yourself three questions:**
   - Where am I? *(Here, on this beach, in this water.)*
   - What time is it? *(Now, this moment.)*
   - *(The third question is the act of presence itself — taking three breaths that anchor the answer.)*
3. **Take three slow, deliberate breaths.**
4. **Choose one thing — one specific focus for this session.** Not a goal. A focus. Something you will pay attention to while you surf.

Duración total: 30 segundos.

**Cita literal:**
> "Thirty seconds. Three breaths. One focus. It seems small. Over hundreds of sessions, it becomes the difference between a surfer who improves and a surfer who simply accumulates time in the water."
> — [BOOK Ch 1 p.12]

### 5.2 Take Out the Trash (protocolo implícito)

Fuente directa: [BOOK Ch 1 p.11].

Definición del libro:
> "'Taking out the trash' means deliberately clearing that mental clutter before you paddle out. Not suppressing it — that doesn't work. But acknowledging it and choosing to set it down before entering the water."

**Nota:** el libro describe el concepto pero no da un protocolo paso-a-paso. Un drill operacional derivado debe ser marcado [TBD — Marcelo input].

### 5.3 Única pregunta post-sesión

Fuente directa: [BOOK Ch 2 p.16].

> **"Did I work on what I came to work on?"**
> *(Not: did I surf well? Not: were the waves good?)*

Si SÍ → fue training. Se construyó algo, incluso con ejecución imperfecta.
Si NO → fue free surf. Válido, pero nada nuevo se construyó.

### 5.4 Ciclo de 4 fases del canon v1 (a reconciliar con el libro)

Fuente: [CANON v1 §3].

1. Intención (pre-ola)
2. Ejecución (durante)
3. Observación (post-inmediata)
4. Ajuste (antes de la siguiente)

**[TBD — Marcelo input]:** decidir si el ciclo de 4 fases del canon es (a) la operacionalización oficial del principio del libro, (b) un add-on didáctico flexible, o (c) reemplazable por "one specific intention + did-I-work-on-it?" del libro.

### 5.5 Las 5 preguntas post-ola del canon v1

Fuente: [CANON v1 §4].

1. ¿Cuál era tu intención?
2. ¿La lograste?
3. ¿Qué funcionó?
4. ¿Qué falló?
5. ¿Qué ajustas para la siguiente?

**[TBD — Marcelo input]:** ¿estas 5 preguntas son canon fijo, o son una expansión del canon v1 que puede ajustarse? El libro se queda con **una sola pregunta** post-sesión.

---

## 6 · CRITERIO DE EVALUACIÓN (K11) — REDUCIDO AL CANON V1

El canon v1 define el criterio de evaluación así:

> "El alumno:
> - Explica el One Wave principle.
> - Demuestra reflexión post-ola (el coach observa pausa consciente tras cada ola).
> - Ajusta su ejecución entre ola y ola."
> — [CANON v1 §7]

**Decisión:** mantener estos 3 criterios como K11 canónico. Los 6 sub-indicadores K11.1..K11.6 de PC-012_PACKAGE_v1 fueron **fabricados por Claude** sin fuente y quedan eliminados hasta que Marcelo los autorize o los defina.

---

## 7 · DRILLS OPERACIONALES — PENDIENTE DE MARCELO

**Claude NO diseñará drills aquí.** El PC-012_PACKAGE_v1 incluía 4 drills inventados ("Intención Escrita", "5 Preguntas en Seco", "Journal One Wave", "Shadow Cycle") que no provienen del libro ni del canon v1. Están eliminados.

Drills potenciales, extraídos del libro pero sin protocolo detallado en fuente:

- **D1 — 30-Second Pre-Session Ritual** → ya es un protocolo completo [BOOK Ch 1 p.12]. No requiere diseño adicional.
- **D2 — Take Out the Trash** → concepto descrito [BOOK Ch 1 p.11], protocolo **[TBD — Marcelo input]**.
- **D3 — Single-Objective Session** → Marcelo lo describe en la anécdota de la junior ("one session [...] your job is to land your front foot in the right position. That's the whole mission.") [BOOK Ch 2 p.13-14]. Diseño como drill formal: **[TBD — Marcelo input]**.
- **D4 — Post-session debrief ("Did I work on what I came to work on?")** → una pregunta, binario sí/no [BOOK Ch 2 p.16]. Protocolo de ejecución en ficha: **[TBD — Marcelo input]**.

**Pregunta abierta para Marcelo:** ¿qué drills ya usás operativamente en Puro Surf / con atletas, que podamos documentar en vez de inventar?

---

## 8 · ERRORES COMUNES — SOLO LOS DEL LIBRO

El PC-012_PACKAGE_v1 incluía 8 "error cards" (ERR-ONE-01..08) **fabricadas por Claude**. Eliminadas.

Errores que el libro identifica explícitamente:

| # | Error | Fuente |
|---|---|---|
| E1 | Llamar "training" a todo lo que se hace en el agua (sin distinguir free surf) | [BOOK Ch 2 p.14] |
| E2 | Entrar con 10 objetivos en vez de uno (switch cost alto) | [BOOK Ch 2 p.15] |
| E3 | Ego's Interference: olvidar el drill cuando aparece una buena ola | [BOOK Ch 2 p.15] |
| E4 | Interpretar la regresión de la curva de aprendizaje como "voy peor" (en vez de como evidencia de cambio) | [BOOK Ch 3 p.20] |
| E5 | Expectativa de que "surfing should feel good all the time" | [BOOK Ch 5 p.27] |
| E6 | Fight the hold-down / resistir el wipeout (vs dejar pasar) | [BOOK Ch 5 p.29] |
| E7 | Autodiagnóstico de nivel equivocado (asumir el nivel que quieres, no el real) | [BOOK Ch 5 p.32] |
| E8 | Entender el sistema y no ejecutar ("The nervous system does not adapt to understanding") | [BOOK Ch 7 p.39] |

---

## 9 · VIDEO SCRIPT v2 — ESQUELETO (no guión final)

El PC-012_PACKAGE_v1 contenía un video script de 6 escenas con texto completo. Ese guión fue escrito por Claude con material parcial. Lo reemplazo aquí con un esqueleto de producción **basado exclusivamente en contenido del libro + canon**, para que Marcelo (o un guionista) lo desarrolle.

**Duración objetivo:** 4-6 minutos.
**Idioma:** ES (primera versión), EN (segunda versión).

**Estructura propuesta (8 beats, todos con fuente):**

1. **Hook** — "La mayoría entra al agua sin saber en qué trabajar." [BOOK Ch 6 p.34 — "paddle out and hope for the best"]
2. **Dos formas de aprender** — volumen sin reflexión vs One Wave [CANON v1 §2; BOOK Ch 2 p.14]
3. **La cita Keller** — "One thing. One wave. One specific intention." [BOOK Preface p.7]
4. **Free Surf vs Training** — definición de cada uno [BOOK Ch 2 p.14]
5. **El ritual de 30 segundos** — 3 preguntas, 3 respiros, 1 foco [BOOK Ch 1 p.12]
6. **Switch cost** — por qué una sola cosa [BOOK Ch 2 p.15]
7. **Ego's Interference** — la trampa de la buena ola [BOOK Ch 2 p.15]
8. **La pregunta única al salir del agua** — "Did I work on what I came to work on?" [BOOK Ch 2 p.16]
9. **Cierre** — "One wave. One intention. Enjoy the journey." [BOOK Final Words p.47]

**Guión palabra-por-palabra: [TBD — Marcelo input o guionista].**

---

## 10 · CROSS-REFERENCES

| Referencia | Vínculo | Fuente |
|---|---|---|
| PC-002 Set Goal | Foco de sesión = la "one intention" del ritual 30-sec | [BOOK Ch 1 p.12; CANON v1 §8] |
| PC-003 Aprender a Aprender TSS | Meta-lente que incluye One Wave | [CANON v1 §8] |
| PC-007 Four Pillars | Physical/Technical/Tactical/Mental | [BOOK Ch 6 p.35] |
| PC-014 Three Circles of Power | Body + Board + Wave = Flow (Zona 4 de La Nave) | [BOOK Ch 8 p.43] |
| STP-001..007 (futuro) | Los 7 pasos de Entry & Capture = Zona 3 de La Nave | [BOOK Ch 8 p.43] |
| ICE (Infinite Circle of Execution) | Posture → Rotation → Projection → Maneuver → Return | [BOOK Ch 8 pp.44-45] |
| Marcelo OS | "emotion proposes, system decides" ↔ "intelligent understands, wise paddles out" | [CANON v1 §6; BOOK Ch 7 p.40] |

---

## 11 · HISTORIAL DE VERSIONES

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| v1 | 2026-04-18 (AM) | Primera estructura. **Contenía drills, error cards, y K-indicators fabricados por Claude sin fuente.** | Claude (sin auditoría de fuente) |
| v2 | 2026-04-18 (PM) | **Reconstrucción con trazabilidad estricta.** Libro ONE WAVE (54 pp.) leído en ingesta directa. Se elimina todo lo inventado. Todo lo que queda está marcado `[BOOK §X, p.Y]`, `[CANON v1]`, o `[TBD — Marcelo input]`. | Marcelo Castellanos + Claude synthesis (con auditoría) |

---

## 12 · QUE FALTA PARA DAR POR CERRADO PC-012

Lista accionable de inputs que Claude no puede resolver solo:

1. ¿El ciclo de 4 fases del canon v1 es doctrinal fijo, o operacionalización flexible? (§2.6)
2. ¿Las 5 preguntas post-ola son canon o un expandido? ¿Se quedan o se reducen a la pregunta única del libro? (§5.5)
3. ¿K11 se mantiene en los 3 criterios del canon v1, o necesita sub-indicadores? (§6)
4. ¿Qué drills operativos usás vos con atletas que debamos documentar? (§7)
5. ¿Qué otros documentos fuente tuyos existen (libros, ensayos, transcripts) que Claude todavía no leyó? (auditoría general)

Hasta que estas 5 queden resueltas, **PC-012 v2 no es "cerrado" — es "draft validado por fuente pero con decisiones pendientes de Marcelo".**

---

*TSS® Pre-Course · PC-012 One Wave Framework Package v2.0*
*IP of Marcelo Castellanos / Enkrateia · TSS®*
*Primary source: ONE WAVE Digital Edition 2026 (54 pp.) + PC-012 Canon v1*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  15,
  ARRAY['PC-011']::TEXT[],
  'reading',
  12
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-013',
  'pre_course_fundamentals',
  13,
  $tss$Bloque de Entrada Azul$tss$,
  $tss$Wave Parts · Wave Types · Wave Stages · Board Loss · Timing · If in Doubt$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-013 — BLOQUE DE ENTRADA (PARTES, TIPOS Y ETAPAS DE LA OLA) · CANON

**ID:** PC-013
**Tema:** Bloque de Entrada Azul — Wave Parts · Wave Types · Wave Stages · Board Loss Protocol · Timing In/Out · If in Doubt Don't Go Out
**Pillar:** Equipment & Venue + Safety & Survival
**Scope:** Pre-Curso (bloque de lectura de ola)
**Status:** CANONIZED — Derivado de Module 0 Pre-Curso v3.0 (Slides 4-10)
**Source:** TSS_Module_0_PreCurso_v3.0_WithPlaceholders.pptx
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

**Bloque de Entrada** = conjunto mínimo de conocimientos sobre la **ola como fenómeno físico** que el alumno debe internalizar antes de interactuar con ella.

Este bloque consolida los **7 Prerequisites** del Module 0 Pre-Curso (excluyendo Safety, Etiquette, y currents que están en PC-001, PC-010, PC-011). Agrupa: partes de la ola, tipos de ola, etapas de la ola, protocolo de pérdida de tabla, timing in/out, y la regla de oro.

---

## 2. PARTES DE LA OLA (CANON)

| Parte | Definición |
|---|---|
| **Peak** | Punto donde la ola rompe primero (define priority rule — PC-011). |
| **Shoulder** | Cara abierta sin romper (zona de trim). |
| **Curl / Lip** | El "labio" que rompe — parte más potente. |
| **Pocket** | Bolsa de energía inmediatamente delante del curl. |
| **Face** | Cara completa de la ola (desde trough hasta peak). |
| **Trough** | Base / valle de la ola. |
| **Whitewater** | Espuma ya rota (zona White Belt). |
| **Channel** | Canal entre olas rotas (vía de salida). |

---

## 3. TIPOS DE OLAS

| Tipo | Dirección | Nota |
|---|---|---|
| **Izquierda (Left)** | Rompe hacia la izquierda del surfista en la ola | Regular = backside; Goofy = frontside |
| **Derecha (Right)** | Rompe hacia la derecha del surfista en la ola | Regular = frontside; Goofy = backside |
| **A-frame** | Rompe a ambos lados | Dos surfistas pueden ir con coordinación |
| **Closeout** | Rompe toda de golpe | **NO surfeable** — no dropear |
| **Mushy** | Suave, sin pared clara | Ideal White Belt |
| **Steep / Hollow** | Pared vertical, con potencial tubo | **NO White Belt** |

---

## 4. 4 ETAPAS DE UNA OLA (CANON TSS)

Toda ola pasa por **4 etapas** — entender estas es clave para decidir cuándo cazar:

| Etapa | Descripción | ¿White Belt? |
|---|---|---|
| **1. Formando** | Empieza a subir, aún sin cara clara | NO cazar |
| **2. Lista para romper** | Cara formada, pocket definido | **CAZAR AQUÍ** |
| **3. Rompiendo (curl)** | Labio cayendo | Ya es tarde |
| **4. Rota (whitewater)** | Espuma | **White Belt surfea esta fase** |

**White Belt opera en etapas 2 (lista) para cazar y 4 (espuma) para surfear. Yellow+ trabaja directamente en etapa 2 con drops en cara.**

---

## 5. BOARD LOSS PROTOCOL

**Si pierdes la tabla:**
1. **NO entrar en pánico.** Flotar.
2. **Ubicar visualmente** la tabla (tirón de leash).
3. **Verificar dirección** de la ola entrante.
4. **Recuperar leash con ambas manos** y jalar hacia ti.
5. **No pararse inmediatamente** — verificar profundidad.
6. **Si otra ola viene**, hundir la tabla con ambos brazos y cubrirse.

**Regla absoluta:** nunca soltar la tabla voluntariamente en agua con otros surfistas alrededor. El tirón rápido de leash rompe la tabla o hiere a otros.

---

## 6. TIMING IN & OUT

### Timing IN (entrada al agua)
- Entrar cuando las olas están en **lulls** (momentos de calma entre sets).
- Observar 3-5 ciclos completos antes de decidir.
- Entrar caminando con la tabla al lado (no montada encima).

### Timing OUT (salida del agua)
- Salir durante lulls, nunca durante set.
- Nunca "salir corriendo" con la espalda a la ola.
- Mantener vista al mar hasta pisar arena seca.

---

## 7. REGLA DE ORO: *IF IN DOUBT, DON'T GO OUT*

> **Si dudas, no entres.**

Aplica a:
- Condiciones demasiado grandes para tu belt.
- Rips fuertes sin salvavidas.
- Mar desconocido sin local/coach.
- Mal estado físico (cansancio, hambre, hipotermia).
- Presencia de otros hazards.

**La duda es información del cuerpo. El sistema la respeta.**

Esta regla se integra con **Marcelo OS Decision Filter** — aplica al agua la misma lógica del framework de decisiones.

---

## 8. LOS 7 PREREQUISITES (RESUMEN DOCTRINAL)

El Module 0 Pre-Curso v3.0 establece 7 prerrequisitos. Los 3 que pertenecen exclusivamente a PC-013:

1. ✅ **Wave Parts & Types** (sección 2-3 de este documento).
2. ✅ **Stages of a Wave 1-4** (sección 4).
3. ✅ **Board Loss Protocol** (sección 5).
4. ✅ **If in Doubt Don't Go Out** (sección 7).
5. ✅ **Timing In & Out** (sección 6).

Los otros 2 prerequisites están en:
- **Safety Rules** → PC-001.
- **Etiquette DO/DON'T** → PC-011.

---

## 9. CRITERIO DE EVALUACIÓN

El alumno:
- Nombra las partes de la ola.
- Identifica tipos de ola (izquierda, derecha, closeout).
- Enuncia las 4 etapas y dice en cuál White Belt surfea.
- Describe el protocolo de pérdida de tabla.
- Enuncia la regla de oro *If in Doubt*.

---

## 10. REFERENCIAS

- Source doctrinal primario: **Module 0 Pre-Curso v3.0** (clasificado en C_Presentaciones/Doctrinal).
- Complementa: PC-009 (Venue Analysis), PC-010 (Currents), PC-011 (Etiquette).
- Input in-water: STP-001 (Venue Analysis), STP-011 (Get Aligned with White Water), STP-012 (Paddle to Catch White Water).

---

*TSS® Pre-Course · PC-013 Bloque de Entrada Azul Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  15,
  ARRAY['PC-012']::TEXT[],
  'reading',
  13
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'PC-014',
  'pre_course_fundamentals',
  14,
  $tss$3 Circles of Power$tss$,
  $tss$Círculos de Poder del Surfista$tss$,
  NULL,  -- pillar (PC has no pillar)
  $tss$# PC-014 — 3 CIRCLES OF POWER · CANON

**ID:** PC-014
**Tema:** 3 Circles of Power (Círculos de Poder del Surfista)
**Pillar:** Doctrinal Foundation / Method & Mindset
**Scope:** Pre-Curso + transversal a todos los belts
**Status:** CANONIZED — Referencia ISA integrada al canon TSS
**Source:** ISA Surf Coaching framework (3 Circles) + integración TSS
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. DEFINICIÓN CANÓNICA

Los **3 Círculos de Poder** son los tres dominios de agencia que un surfista debe distinguir en cada sesión:

| Círculo | Dominio | Agencia |
|---|---|---|
| **Círculo 1 — Control** | Lo que depende 100% de mí | Total |
| **Círculo 2 — Influencia** | Lo que puedo afectar pero no controlar | Parcial |
| **Círculo 3 — Aceptación** | Lo que no depende de mí | Ninguna |

> **La madurez del surfista es saber en qué círculo está cada cosa.**

---

## 2. CÍRCULO 1 — CONTROL (100% MÍO)

Todo lo que NACE de mí y que yo decido:
- Mi intención / meta de sesión (PC-002).
- Mi técnica (cómo ejecuto).
- Mi actitud (humildad / ego).
- Mi preparación (PC-008 equipo, PC-009 venue analysis).
- Mi respuesta emocional a fallos.
- Mi esfuerzo de remada.
- Mi decisión de entrar / no entrar (PC-013 *If in Doubt*).

**Regla:** si algo está en Círculo 1, no hay excusa — es responsabilidad mía.

---

## 3. CÍRCULO 2 — INFLUENCIA (PUEDO AFECTAR, NO CONTROLAR)

Cosas que **dependen parcialmente de mí** pero donde hay otros factores:
- Posición en el lineup (puedo moverme, pero otros también).
- Si logro cazar la ola (depende de mi lectura + timing + ola).
- Calidad del pop-up (depende de técnica + estabilidad de tabla + ola).
- Comunicación con otros surfistas (puedo intentar, depende del otro).
- El clima de la sesión (puedo contribuir con actitud).

**Regla:** en Círculo 2, el esfuerzo se enfoca en **hacer bien mi parte** — el resultado queda abierto.

---

## 4. CÍRCULO 3 — ACEPTACIÓN (NO DEPENDE DE MÍ)

Lo que **pasa y ya**:
- Tamaño y dirección del swell.
- Marea del día.
- Viento.
- Condiciones meteorológicas.
- Quién más está en el line up.
- Cómo otros surfistas se comportan.
- El océano en general.

**Regla:** en Círculo 3, la única respuesta es **adaptación + aceptación**. Luchar contra Círculo 3 = frustración + riesgo.

---

## 5. APLICACIÓN DOCTRINAL

### En pre-sesión
- Círculo 1: "¿Qué voy a trabajar hoy?" → PC-002.
- Círculo 2: "¿Qué condiciones necesito?" → influenciar llegando temprano, etc.
- Círculo 3: "¿Qué condiciones hay?" → aceptar y adaptar.

### En sesión
- Si fallo pop-up → Círculo 1 (mi técnica, ajusto).
- Si no agarré la ola → Círculo 2 (mi lectura + la ola).
- Si cerró la ola → Círculo 3 (no había nada que hacer).

### En post-sesión (PC-012 One Wave debrief)
Preguntarse: *"¿En qué círculo estuvo lo que pasó?"*
- Si fue Círculo 1 → ajustar técnica / actitud.
- Si fue Círculo 2 → ajustar preparación / decisión.
- Si fue Círculo 3 → liberar, aceptar.

---

## 6. CONEXIÓN CON MARCELO OS / VALORES TSS

Los 3 Círculos son el equivalente surf del **Decision Filter** de Marcelo OS:

| Marcelo OS | Círculos de Poder |
|---|---|
| Focus Law (3 frentes) | Círculo 1 (3 dominios de agencia) |
| ADHD Rule | Círculo 1 (sistema decide sobre emoción) |
| Balance Rule | Círculo 2 (intuición + sistema) |

**Y enlaza con los valores de belt:**
- **Humildad (White)** = aceptar Círculo 3.
- **Proceso (Yellow)** = persistir en Círculo 1.
- **Compromiso (Blue)** = operar consistente en Círculo 1-2.
- **Responsabilidad (Purple)** = asumir Círculo 1 sin excusas.

---

## 7. CRITERIO DE EVALUACIÓN

El alumno:
- Enumera los 3 círculos.
- Explica cuál es su agencia en cada uno.
- Aplica el framework a una situación real de su última sesión.
- Reconoce cuando se frustra por algo de Círculo 3.

---

## 8. REFERENCIAS

- Source: ISA Surf Coaching framework — integrado como anexo doctrinal TSS.
- Complementa: PC-002 (Set Goal), PC-012 (One Wave), VAL-002 (Humildad), VAL-005 (Responsabilidad).
- Presentación de apoyo: ISA 3 Circles Presentation (clasificada en C_Presentaciones/Coaching).

---

*TSS® Pre-Course · PC-014 3 Circles of Power Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,  -- drill_md (only STPs)
  NULL,  -- errors_md (only STPs)
  NULL,  -- video_url (Marcelo fills later)
  NULL,  -- cover_image_url (Marcelo fills later)
  10,
  ARRAY['PC-013']::TEXT[],
  'reading',
  14
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'VAL-001',
  'pre_course_values',
  15,
  $tss$Consciencia$tss$,
  $tss$Valor Pre-Curso$tss$,
  NULL,  -- pillar
  $tss$# VAL-001 — CONSCIENCIA · CANON

**ID:** VAL-001
**Valor:** Consciencia (Awareness)
**Belt:** Pre-Curso
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS_Module_0_PreCurso_v3.0_WithPlaceholders.pptx (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANON — FORMA CORTA (ES)

**Consciencia es el valor del Pre-Curso porque define la postura inicial correcta antes de entrar al sistema.**

Antes de aprender técnica, antes de tocar la tabla, antes de entrar al mar, el futuro surfista debe despertar. Consciencia significa ver con claridad: ver dónde estoy, qué sé, qué no sé, qué hay afuera de mí, qué hay dentro de mí. Es la capacidad de observar sin negar. Es estar presente antes de actuar.

Sin consciencia no hay aprendizaje real, porque todo conocimiento cae en un terreno desatento. Por eso Pre-Curso empieza aquí: **primero despertar, después aprender.**

---

## 2. CANON — FORMA LARGA (ES)

La consciencia es el valor fundacional de TSS porque es el valor que abre la puerta al resto.

Antes de la humildad hay consciencia. Antes del proceso hay consciencia. Antes del compromiso, antes de la responsabilidad, antes de todo, hay **estar despierto**.

Consciencia no es un estado místico ni abstracto. Es una práctica concreta:
- **Consciencia del cuerpo:** ¿cómo está mi condición, mi fatiga, mi postura?
- **Consciencia del entorno:** ¿qué dice el mar hoy?, ¿qué dice el viento?, ¿qué me falta observar?
- **Consciencia de mí mismo:** ¿cómo vengo emocionalmente?, ¿con qué intención?, ¿con qué ego?
- **Consciencia del otro:** ¿quién más está en el lineup?, ¿qué nivel tienen?, ¿cómo afecta mi decisión a los demás?
- **Consciencia del riesgo:** ¿qué puede salir mal?, ¿tengo lo necesario para responder?
- **Consciencia del propósito:** ¿para qué estoy haciendo esto hoy?

El Pre-Curso existe precisamente para instalar estos actos de consciencia. Los 14 PC no son "información técnica" — son **marcos de observación** que activan un modo de percepción que antes estaba dormido.

El surfista inconsciente se mete al agua creyendo que sabe. El surfista consciente se mete al agua sabiendo lo que no sabe. El primero es peligroso. El segundo es entrenable.

La consciencia también es lo que permite que todos los otros valores tengan sentido. La humildad sin consciencia es falsa modestia. El proceso sin consciencia es repetición sin aprendizaje. El compromiso sin consciencia es rigidez. La responsabilidad sin consciencia es culpa. La gratitud sin consciencia es cortesía vacía. El impacto sin consciencia es ego con altavoz.

Por eso Pre-Curso no es "el nivel más bajo". Es el **nivel cero**, el momento donde se abre la capacidad de observar. Sin ese despertar, nada de lo que venga después se fija realmente.

---

## 3. CANON — FORMA CORTA (EN)

Consciousness is the Pre-Course value because it defines the right starting posture before entering the system. Before technique, before touching the board, before entering the ocean, the future surfer must wake up. Consciousness means seeing clearly: seeing where I am, what I know, what I don't know, what is outside me, what is inside me. Without consciousness there is no real learning, because all knowledge falls on inattentive ground. That is why Pre-Course starts here: **first wake up, then learn.**

---

## 4. CANON — FORMA LARGA (EN)

Consciousness is the foundational value of TSS because it is the value that opens the door to all others.

Before humility there is consciousness. Before process there is consciousness. Before commitment, before responsibility, before everything, there is **being awake**.

Consciousness is not a mystical or abstract state. It is a concrete practice:
- **Body awareness:** what is my condition, my fatigue, my posture?
- **Environment awareness:** what is the sea saying today?, what is the wind saying?, what am I still not observing?
- **Self-awareness:** how am I emotionally?, with what intention?, with what ego?
- **Awareness of others:** who else is in the lineup?, what level are they?, how does my choice affect them?
- **Risk awareness:** what can go wrong?, do I have what it takes to respond?
- **Purpose awareness:** why am I doing this today?

The Pre-Course exists precisely to install these acts of consciousness. The 14 PC items are not "technical information" — they are **frameworks of observation** that activate a mode of perception that was previously asleep.

The unconscious surfer enters the water believing they know. The conscious surfer enters the water knowing what they don't know. The first is dangerous. The second is trainable.

Consciousness is also what gives meaning to every other value. Humility without consciousness is false modesty. Process without consciousness is repetition without learning. Commitment without consciousness is rigidity. Responsibility without consciousness is guilt. Gratitude without consciousness is empty courtesy. Impact without consciousness is ego with a megaphone.

That is why Pre-Course is not "the lowest level". It is **level zero**, the moment where the capacity for observation opens. Without that awakening, nothing that follows truly sets.

---

## 5. CLOSING PHRASE (ES · CANON STYLE)

**Pre-Curso empieza con consciencia: despertar antes de actuar.**

## 6. CLOSING PHRASE (EN · CANON STYLE)

**Pre-Course begins with consciousness: awake before you act.**

---

## 7. APLICACIÓN EN LA ENSEÑANZA

- **Gating doctrinal:** no se enseña ningún PC sin antes enmarcar la sesión con el valor de consciencia.
- **Ritual de apertura:** cada clase Pre-Curso abre con 2 minutos de "observación consciente" — ¿qué ves?, ¿qué sientes?, ¿qué notas?
- **Cierre:** cada clase Pre-Curso cierra con "¿de qué tomaste consciencia hoy?".

---

## 8. REFERENCIAS

- Canon v7.0 Slide 11 (Module 0 Pre-Curso).
- Complementa: PC-014 (3 Circles of Power — consciencia es la base para distinguir círculos).

---

*TSS® Pre-Course · VAL-001 Consciencia Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,
  NULL,
  NULL,
  NULL,
  8,
  ARRAY['PC-014']::TEXT[],
  'reading',
  15
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'VAL-002',
  'pre_course_values',
  16,
  $tss$Humildad$tss$,
  $tss$Valor White Belt$tss$,
  NULL,  -- pillar
  $tss$# VAL-002 — HUMILDAD · CANON

**ID:** VAL-002
**Valor:** Humildad (Humility)
**Belt:** White Belt
**Status:** CANONIZED — Marcelo 2026-04-14
**Source:** WB_VALUE_Humility_canon_input.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANON — FORMA CORTA (ES)

Humildad es el valor de White Belt porque define la actitud correcta para comenzar. El cinturón blanco acepta que está aprendiendo, no tiene miedo de equivocarse, no pretende saberlo todo y se mantiene abierto a escuchar, corregir y mejorar. En el surf, este valor es esencial porque el océano siempre nos recuerda que no estamos en control de todo. La humildad permite observar mejor, aprender más y crecer con seguridad. Aunque pertenece a White Belt, también es una mentalidad que debería acompañar al surfer toda la vida.

---

## 2. CANON — FORMA LARGA (ES)

La humildad es el valor central de White Belt porque representa la actitud correcta para entrar al aprendizaje.

Ser White Belt no es solo estar en el primer nivel técnico. Es adoptar una mentalidad. Es reconocer que estamos empezando, que no sabemos todo, que vamos a cometer errores y que precisamente por eso estamos en el lugar correcto para aprender.

La humildad en este nivel significa estar abierto. Abierto a escuchar, a observar, a corregir, a repetir y a mejorar. El cinturón blanco no necesita aparentar que ya sabe. No tiene miedo de equivocarse, porque entiende que el error es parte natural del proceso. No se defiende del aprendizaje. Lo recibe.

Este valor es especialmente importante en el surf porque nuestro primer contacto profundo es con el océano, y el océano siempre nos recuerda una verdad esencial: no estamos en control de todo. El mar es inmenso, cambiante y más grande que nosotros. Siempre tiene algo que enseñarnos. A veces lo hace con calma y otras veces con fuerza, pero siempre nos pone en una posición donde la humildad no es opcional, sino necesaria.

Por eso, White Belt empieza con humildad. Porque sin humildad no hay verdadera observación. Sin humildad no hay escucha. Sin humildad no hay adaptación. Y sin humildad, el surfer principiante se llena demasiado rápido de prisa, ego o falsas certezas, y eso bloquea el crecimiento.

La humildad también es una mentalidad que no debería abandonarse nunca. Aunque uno avance de nivel, esta sigue siendo una de las bases más importantes del desarrollo. El mejor surfer sigue siendo, en cierto sentido, un White Belt en su manera de aprender: sigue abierto, sigue atento, sigue dispuesto a corregir y sigue entendiendo que el océano siempre tiene más para mostrar.

El valor de White Belt no es pensar pequeño. Es entrar correctamente. Es tener la postura interior adecuada para crecer. Es aceptar que estamos aprendiendo, que todavía no dominamos, y que justamente por eso debemos mantenernos enseñables.

La humildad no debilita al surfer. Lo prepara. Lo mantiene receptivo. Lo mantiene seguro. Y lo mantiene creciendo.

---

## 3. CANON — FORMA CORTA (EN)

Humility is the value of White Belt because it defines the correct attitude to begin. The White Belt accepts they are learning, is not afraid to fail, does not pretend to know everything, and stays open to listen, correct, and improve. In surfing, this value is essential because the ocean constantly reminds us we are not in control of everything. Humility enables better observation, deeper learning, and safer growth. Although it belongs to White Belt, it is also a mindset that should accompany the surfer for life.

---

## 4. CANON — FORMA LARGA (EN)

Humility is the central value of White Belt because it represents the right attitude to enter the learning process.

Being White Belt is not only being at the first technical level — it is adopting a mindset. It is recognizing that we are beginning, that we do not know everything, that we will make mistakes, and that precisely because of this, we are in the right place to learn.

At this level, humility means being open. Open to listen, to observe, to correct, to repeat, and to improve. The White Belt does not need to pretend to already know. The White Belt is not afraid to fail, because failure is a natural part of the process. They do not defend themselves against learning — they receive it.

This value matters especially in surfing because our first deep contact is with the ocean, and the ocean always reminds us of one essential truth: we are not in control of everything. The sea is immense, changing, and bigger than us. It always has something to teach. Sometimes calmly, sometimes with force, but always placing us in a position where humility is not optional — it is necessary.

That is why White Belt begins with humility. Without humility there is no real observation. Without humility there is no listening. Without humility there is no adaptation. And without humility, the beginner surfer fills too quickly with rush, ego, or false certainty — and that blocks growth.

Humility is also a mindset that should never be abandoned. Even as one advances, it remains one of the most important foundations of development. The best surfer is, in a sense, still a White Belt in their way of learning: still open, still attentive, still willing to correct, still understanding that the ocean always has more to show.

The value of White Belt is not to think small. It is to enter correctly. It is to hold the right inner posture for growth. It is to accept that we are learning, that we do not yet master — and that precisely for this reason, we must remain teachable.

Humility does not weaken the surfer. It prepares them. It keeps them receptive. It keeps them safe. And it keeps them growing.

---

## 5. CLOSING PHRASE (ES · CANON STYLE)

**White Belt empieza con humildad: abierto a aprender, dispuesto a fallar, listo para crecer.**

## 6. CLOSING PHRASE (EN · CANON STYLE)

**White Belt begins with humility: open to learn, willing to fail, ready to grow.**

---

## 7. APLICACIÓN DOCTRINAL

- Todos los 24 steps del White Belt asumen humildad implícita del alumno (aceptar repetir, aceptar corregir).
- Las Coach Cheat Sheets referencian humildad como pre-condición para poder enseñar.
- Si el alumno pierde humildad → se regresa al belt; no se avanza.

---

## 8. REFERENCIAS

- Source canonical: WB_VALUE_Humility_canon_input.md (Marcelo 2026-04-14).
- Canon v7.0 Slide 11 del Module 0 Pre-Curso.
- Complementa: PC-011 (Etiquette — humildad aplicada al lineup), PC-014 (3 Circles — humildad aplicada a Círculo 3).

---

*TSS® White Belt · VAL-002 Humildad Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,
  NULL,
  NULL,
  NULL,
  8,
  ARRAY['VAL-001']::TEXT[],
  'reading',
  16
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'VAL-003',
  'pre_course_values',
  17,
  $tss$Proceso (Resiliencia)$tss$,
  $tss$Valor Yellow Belt$tss$,
  NULL,  -- pillar
  $tss$# VAL-003 — PROCESO (RESILIENCIA) · CANON

**ID:** VAL-003
**Valor:** Proceso / Resiliencia (Process / Resilience)
**Belt:** Yellow Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS_Module_0_PreCurso_v3.0_WithPlaceholders.pptx (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANON — FORMA CORTA (ES)

**Proceso (Resiliencia) es el valor de Yellow Belt porque define la capacidad de sostenerse en el camino cuando el aprendizaje se vuelve difícil.**

El Yellow Belt ya no es principiante — ya sabe algo — y por eso entra al territorio donde los errores duelen más, las mesetas son más largas y el ego empieza a pedir atajos. La resiliencia es lo que impide que ese momento tumbe al surfista. Es la decisión consciente de confiar en el proceso, seguir repitiendo, seguir fallando, seguir corrigiendo, sin abandonar el sistema.

**Yellow Belt empieza con resiliencia: confiar en el camino cuando ya no hay novedad.**

---

## 2. CANON — FORMA LARGA (ES)

Después de la humildad viene el proceso.

La humildad te permite entrar. El proceso te permite quedarte.

Yellow Belt es el primer belt donde el surfista enfrenta una verdad incómoda: **ya no todo es nuevo**. En White Belt todo es descubrimiento, todo impresiona, todo motiva. En Yellow Belt el alumno empieza a repetir los mismos errores, a enfrentar mesetas técnicas y a darse cuenta de que su progreso ya no es lineal.

Aquí aparece la tentación del atajo: cambiar de tabla antes de tiempo, buscar olas más grandes, saltarse steps, ir a spots que no corresponden al nivel. Todas esas son formas sutiles de abandonar el proceso.

La resiliencia en este nivel significa:
- **Confiar en la estructura.** El sistema TSS tiene un orden por razón — no es opcional.
- **Repetir sin quejarse.** La repetición deliberada es donde se consolida la técnica.
- **Fallar sin dramatizar.** Un fallo es información, no un veredicto.
- **Sostenerse en la meseta.** La meseta es el antesala del salto, no su ausencia.
- **Honrar el camino más que el resultado.** Quien honra el camino llega. Quien solo busca resultado se estanca.

El valor de Yellow Belt no es "ser más duro". Es **entender que el proceso es el producto**. Cada repetición que el White Belt hizo con humildad, el Yellow Belt la hace con resiliencia — y esa resiliencia es lo que lo llevará a Blue con integridad.

La resiliencia no es tragar frustración. Es transformar la frustración en información, la información en ajuste, y el ajuste en nueva repetición. Es el ciclo vivo del aprendizaje.

En Yellow Belt, el alumno aprende que la maestría no es dramática — es acumulativa. Cada sesión cuenta, aunque no se sienta. Cada error nombrado se integra, aunque duela. Cada meseta termina, aunque parezca eterna.

El Yellow Belt que sale del nivel lo hace no por "ser más rápido" sino por **haber aprendido a confiar en el tiempo del proceso**. Esa confianza se lleva el resto de la vida.

---

## 3. CANON — FORMA CORTA (EN)

Process (Resilience) is the Yellow Belt value because it defines the capacity to remain on the path when learning becomes hard. The Yellow Belt is no longer a beginner — and therefore enters the territory where errors hurt more, plateaus last longer, and the ego starts asking for shortcuts. Resilience is what prevents that moment from taking down the surfer. It is the conscious decision to trust the process, to keep repeating, failing, correcting, without abandoning the system.

**Yellow Belt begins with resilience: trust the path when novelty is gone.**

---

## 4. CANON — FORMA LARGA (EN)

After humility comes process.

Humility allows you to enter. Process allows you to stay.

Yellow Belt is the first belt where the surfer faces an uncomfortable truth: **nothing is new anymore.** In White Belt everything is discovery, everything impresses, everything motivates. In Yellow Belt the student begins to repeat the same mistakes, to face technical plateaus, and to realize that progress is no longer linear.

Here the temptation of shortcuts appears: changing the board too early, hunting bigger waves, skipping steps, going to spots that don't match the level. All of these are subtle ways to abandon the process.

Resilience at this level means:
- **Trusting the structure.** TSS has its order for a reason — it is not optional.
- **Repeating without complaint.** Deliberate repetition is where technique consolidates.
- **Failing without drama.** A failure is information, not a verdict.
- **Staying on the plateau.** The plateau is the antechamber of the leap, not its absence.
- **Honoring the path above the outcome.** The one who honors the path arrives. The one who only chases results gets stuck.

The value of Yellow Belt is not "being tougher". It is **understanding that the process is the product**. Each repetition the White Belt did with humility, the Yellow Belt does with resilience — and that resilience is what will take them to Blue with integrity.

Resilience is not swallowing frustration. It is transforming frustration into information, information into adjustment, and adjustment into new repetition. It is the living cycle of learning.

In Yellow Belt, the student learns that mastery is not dramatic — it is cumulative. Every session counts, even if it doesn't feel like it. Every named error integrates, even if it hurts. Every plateau ends, even if it seems eternal.

The Yellow Belt who graduates does so not by being "faster" but by **having learned to trust the time of the process**. That trust stays for the rest of life.

---

## 5. CLOSING PHRASE (ES · CANON STYLE)

**Yellow Belt avanza con proceso: confía en el camino cuando la novedad se agota.**

## 6. CLOSING PHRASE (EN · CANON STYLE)

**Yellow Belt advances with process: trust the path when novelty is gone.**

---

## 7. APLICACIÓN DOCTRINAL

- En Yellow Belt el alumno debe sostener 2-3 mesetas técnicas sin abandonar el sistema.
- El coach mide proceso observando: ¿sigue la progresión?, ¿acepta repeticiones?, ¿procesa errores sin dramatizar?
- La graduación Yellow requiere demostrar **resiliencia ante una meseta real**.

---

## 8. REFERENCIAS

- Canon v7.0 Slide 11 (Module 0 Pre-Curso).
- Complementa: VAL-002 (Humildad) como antecedente, VAL-004 (Compromiso) como consecuencia.

---

*TSS® Yellow Belt · VAL-003 Proceso Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,
  NULL,
  NULL,
  NULL,
  8,
  ARRAY['VAL-002']::TEXT[],
  'reading',
  17
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'VAL-004',
  'pre_course_values',
  18,
  $tss$Compromiso$tss$,
  $tss$Valor Blue Belt$tss$,
  NULL,  -- pillar
  $tss$# VAL-004 — COMPROMISO · CANON

**ID:** VAL-004
**Valor:** Compromiso (Commitment)
**Belt:** Blue Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS_Module_0_PreCurso_v3.0_WithPlaceholders.pptx (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANON — FORMA CORTA (ES)

**Compromiso es el valor de Blue Belt porque define la decisión de entregarse al surf como disciplina, no como hobby.**

El Blue Belt ya no está probando si el surf le gusta — ya sabe que es suyo. Su técnica empieza a parecerse a la de un surfista real. Aquí se toma la decisión más importante del camino: comprometerse. Comprometerse con la ola antes de bajarla. Comprometerse con la postura. Comprometerse con el sistema. Comprometerse con la consistencia. Sin compromiso no hay ejecución completa — y las olas lo saben.

**Blue Belt entra con compromiso: decidir antes de dudar.**

---

## 2. CANON — FORMA LARGA (ES)

Compromiso es el valor central de Blue Belt porque este nivel es donde el surfista finalmente cruza el umbral del "principiante avanzado" al "surfista real".

Hasta Yellow Belt, el alumno podía decir "estoy aprendiendo a surfear". En Blue Belt, ya no. Ya surfea. Ya agarra olas abiertas. Ya ejecuta maneuvers. Ya lee condiciones. Y aquí aparece el verdadero test: **¿va a comprometerse completamente, o va a quedarse para siempre en la zona segura?**

Compromiso en Blue Belt significa varias cosas simultáneas:

**1. Compromiso con la ola.**
Una vez que decidiste bajar esa ola, te comprometiste. No se baja una ola "a medias". El cuerpo va adelante, los pies aterrizan firmes, la línea se traza con intención. Dudar a mitad de pop-up = caer. Dudar antes del drop = perder la ola. **Compromiso o caída — no hay tercera opción.**

**2. Compromiso con la postura.**
Después de 18 meses de corregir postura, Blue Belt exige **mantenerla sin recordatorios**. El compromiso es hacer lo correcto cuando nadie te está viendo, cuando no hay coach, cuando la ola es la número 127 y ya estás cansado.

**3. Compromiso con el sistema.**
El surfista que se va a Blue Belt y "hace su propia cosa" se estanca. El que sigue el sistema hasta sus últimas consecuencias evoluciona. Compromiso = confianza sostenida en la estructura, incluso cuando la curiosidad pide saltarse pasos.

**4. Compromiso con la consistencia.**
Blue Belt se gana con consistencia, no con talento. El alumno que va 2 días al mes no llega. El que va 4 veces por semana con calidad, sí. El compromiso es ese **sí repetido mil veces** al entrenamiento.

**5. Compromiso con uno mismo.**
La ola te devuelve lo que eres. Si eres tibio, la ola te devuelve tibieza. Si eres entregado, te devuelve entrega. Blue Belt es donde el surfista decide cómo va a relacionarse con el océano por el resto de su vida.

El Blue Belt sin compromiso es un Blue Belt en nombre, no en sustancia. Por eso el test de graduación a Purple no es solo técnico — es doctrinal: **¿este surfista entrega todo cuando toca entregar?**

Compromiso no es ciego. Es consciente (VAL-001), humilde (VAL-002), y sostenido (VAL-003). Es la suma de los anteriores en acción.

---

## 3. CANON — FORMA CORTA (EN)

Commitment is the Blue Belt value because it defines the decision to give oneself to surfing as a discipline, not a hobby. The Blue Belt is no longer testing if surfing is for them — they know it is theirs. Their technique begins to look like a real surfer's. Here the most important decision of the path is made: to commit. Commit to the wave before dropping it. Commit to the posture. Commit to the system. Commit to consistency. Without commitment there is no full execution — and waves know.

**Blue Belt enters with commitment: decide before doubting.**

---

## 4. CANON — FORMA LARGA (EN)

Commitment is the central value of Blue Belt because this level is where the surfer finally crosses the threshold from "advanced beginner" to "real surfer".

Up to Yellow Belt, the student could say "I am learning to surf". In Blue Belt, no longer. They surf. They catch open waves. They execute maneuvers. They read conditions. And here the real test appears: **are they going to commit fully, or stay in the safe zone forever?**

Commitment in Blue Belt means several things simultaneously:

**1. Commitment to the wave.**
Once you decided to drop that wave, you committed. You don't drop a wave "halfway". The body goes forward, the feet land firm, the line is drawn with intention. Doubting mid pop-up = falling. Doubting before the drop = losing the wave. **Commit or fall — there is no third option.**

**2. Commitment to the posture.**
After 18 months of posture correction, Blue Belt demands **maintaining it without reminders**. Commitment is doing the right thing when no one is watching, when there is no coach, when the wave is number 127 and you are tired.

**3. Commitment to the system.**
The surfer who goes to Blue Belt and "does their own thing" plateaus. The one who follows the system to its ultimate consequences evolves. Commitment = sustained trust in the structure, even when curiosity asks to skip steps.

**4. Commitment to consistency.**
Blue Belt is earned with consistency, not talent. The student who goes 2 days a month doesn't get there. The one who goes 4 times a week with quality, does. Commitment is that **yes repeated a thousand times** to training.

**5. Commitment to oneself.**
The wave gives back what you are. If you are lukewarm, the wave returns lukewarmness. If you are given, it returns giving. Blue Belt is where the surfer decides how they will relate to the ocean for the rest of their life.

A Blue Belt without commitment is a Blue Belt in name, not in substance. That is why the graduation test to Purple is not only technical — it is doctrinal: **does this surfer give everything when it is time to give?**

Commitment is not blind. It is conscious (VAL-001), humble (VAL-002), and sustained (VAL-003). It is the sum of the previous values in action.

---

## 5. CLOSING PHRASE (ES · CANON STYLE)

**Blue Belt entra con compromiso: decidir antes de dudar, entregar antes de calcular.**

## 6. CLOSING PHRASE (EN · CANON STYLE)

**Blue Belt enters with commitment: decide before doubting, give before calculating.**

---

## 7. APLICACIÓN DOCTRINAL

- Los maneuvers de Blue (bottom turn, top turn) requieren compromiso corporal — sin él, se colapsan.
- El coach detecta falta de compromiso por la indecisión del pop-up, la postura tentativa, la duda en el drop.
- La certificación Blue exige observar compromiso consistente en 10+ olas no seleccionadas por el alumno.

---

## 8. REFERENCIAS

- Canon v7.0 Slide 11 (Module 0 Pre-Curso).
- Complementa: VAL-003 (Proceso) como base, VAL-005 (Responsabilidad) como consecuencia.

---

*TSS® Blue Belt · VAL-004 Compromiso Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,
  NULL,
  NULL,
  NULL,
  8,
  ARRAY['VAL-003']::TEXT[],
  'reading',
  18
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'VAL-005',
  'pre_course_values',
  19,
  $tss$Responsabilidad$tss$,
  $tss$Valor Purple Belt$tss$,
  NULL,  -- pillar
  $tss$# VAL-005 — RESPONSABILIDAD · CANON

**ID:** VAL-005
**Valor:** Responsabilidad (Responsibility)
**Belt:** Purple Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS_Module_0_PreCurso_v3.0_WithPlaceholders.pptx (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANON — FORMA CORTA (ES)

**Responsabilidad es el valor de Purple Belt porque define al surfista que ya no puede esconderse detrás del "estoy aprendiendo".**

El Purple Belt surfea condiciones reales: olas grandes, lineups llenos, decisiones rápidas de seguridad propia y ajena. Ya no hay excusas: cada error tiene consecuencias. Responsabilidad significa asumir sin dramatismo lo que sí depende de ti, sin culpa por lo que no depende de ti, y actuar en consecuencia. Es madurez operativa en el agua.

**Purple Belt opera con responsabilidad: asumir lo tuyo sin drama ni excusa.**

---

## 2. CANON — FORMA LARGA (ES)

Responsabilidad es el valor central de Purple Belt porque este es el nivel donde el surfista entra completamente al mundo real del surf.

Hasta Blue Belt, el alumno estaba en una burbuja relativamente protegida: softboards, olas pequeñas, spots amigables, coach presente. En Purple Belt empieza a surfear **olas grandes** (1.5m-2.5m), **lineups llenos** con locales y surfistas experimentados, **condiciones cambiantes** donde hay que tomar decisiones rápidas — y muchas de esas decisiones afectan a otros.

La responsabilidad en este nivel significa varias cosas que el Purple Belt debe integrar simultáneamente:

**1. Responsabilidad por la propia seguridad.**
El Purple Belt ya sabe leer condiciones (PC-009, PC-010, PC-013). No hay excusa para entrar a algo que le supera. Si pasa, es su decisión y su consecuencia. No hay coach que lo salve — él se salva a sí mismo.

**2. Responsabilidad por la seguridad ajena.**
Cada decisión que toma en el lineup impacta a otros. Dropear mal = puede herir. Remar mal = puede chocar. Soltar la tabla = proyectil. El Purple Belt debe **pensar en el otro** antes de cada movimiento.

**3. Responsabilidad por sus errores.**
Cuando falla, no culpa al viento, a la tabla, al día, al coach. Asume. Analiza. Corrige. No hay drama, no hay victimismo, no hay búsqueda de excusas. Error = información que procesa y que lo hace mejor.

**4. Responsabilidad por sus avances (y sus estancamientos).**
Si está progresando, es por su trabajo. Si está estancado, es por sus decisiones. El Purple Belt deja de esperar que "algo afuera" cambie y se hace cargo de cambiar él.

**5. Responsabilidad por lo que representa.**
En este nivel el surfista ya es referencia. Lo que hace en el lineup, lo que dice, lo que respeta o no respeta, **impacta** a otros más jóvenes que lo están observando. Responsabilidad aquí incluye **integridad ética**.

**6. Responsabilidad por el ecosistema.**
El mar no es infinito. El lineup no es infinito. El respeto a locales, a la fauna, al ambiente, a las reglas — todo eso es parte de lo que el Purple Belt ya no puede ignorar.

Responsabilidad **no es culpa**. Culpa es mirar atrás y castigarse. Responsabilidad es mirar adelante y decidir. Culpa paraliza. Responsabilidad moviliza.

El Purple Belt que se hace responsable de todo lo anterior está listo para la siguiente fase: la gratitud (Brown Belt) solo es posible desde la responsabilidad sostenida. El que no se hace responsable nunca llega a la gratitud — solo a la resignación.

---

## 3. CANON — FORMA CORTA (EN)

Responsibility is the Purple Belt value because it defines the surfer who can no longer hide behind "I'm still learning". The Purple Belt surfs real conditions: big waves, crowded lineups, fast safety decisions for self and others. No more excuses: every mistake has consequences. Responsibility means owning without drama what depends on you, without guilt for what doesn't, and acting accordingly. It is operational maturity in the water.

**Purple Belt operates with responsibility: own what's yours without drama or excuse.**

---

## 4. CANON — FORMA LARGA (EN)

Responsibility is the central value of Purple Belt because this is the level where the surfer fully enters the real world of surfing.

Up to Blue Belt, the student was in a relatively protected bubble: softboards, small waves, friendly spots, coach present. In Purple Belt they begin to surf **big waves** (1.5m-2.5m), **crowded lineups** with locals and experienced surfers, **changing conditions** that require fast decisions — many of which affect others.

Responsibility at this level means several things the Purple Belt must integrate simultaneously:

**1. Responsibility for personal safety.**
The Purple Belt can read conditions (PC-009, PC-010, PC-013). No excuse for entering something beyond them. If it happens, it is their decision and their consequence. No coach will save them — they save themselves.

**2. Responsibility for others' safety.**
Every decision they make in the lineup impacts others. Bad drop = can injure. Bad paddle = can collide. Lost board = projectile. The Purple Belt must **think of the other** before every move.

**3. Responsibility for mistakes.**
When they fail, they don't blame the wind, the board, the day, the coach. They own it. Analyze. Correct. No drama, no victimhood, no excuse-hunting. Error = information processed, making them better.

**4. Responsibility for progress (and stagnation).**
If they are progressing, it is their work. If they are stuck, it is their decisions. The Purple Belt stops waiting for "something out there" to change and takes charge of changing themselves.

**5. Responsibility for what they represent.**
At this level the surfer is already a reference. What they do in the lineup, what they say, what they respect or don't, **impacts** younger surfers watching them. Responsibility here includes **ethical integrity**.

**6. Responsibility for the ecosystem.**
The ocean is not infinite. The lineup is not infinite. Respect for locals, wildlife, environment, rules — all this is part of what the Purple Belt can no longer ignore.

Responsibility **is not guilt**. Guilt looks back and punishes itself. Responsibility looks forward and decides. Guilt paralyzes. Responsibility mobilizes.

The Purple Belt who takes responsibility for all of the above is ready for the next phase: gratitude (Brown Belt) is only possible from sustained responsibility. The one who doesn't take responsibility never reaches gratitude — only resignation.

---

## 5. CLOSING PHRASE (ES · CANON STYLE)

**Purple Belt opera con responsabilidad: asumir sin drama, decidir sin excusa, actuar por todos.**

## 6. CLOSING PHRASE (EN · CANON STYLE)

**Purple Belt operates with responsibility: own without drama, decide without excuse, act for all.**

---

## 7. APLICACIÓN DOCTRINAL

- Purple Belt es el primer nivel donde el coach deja de estar dentro del agua — el alumno surfea solo y se autorresponsabiliza.
- La certificación Purple requiere demostrar decisiones de seguridad correctas ante condiciones cambiantes sin asistencia.
- El Purple Belt es mentor informal de White/Yellow — no puede serlo sin responsabilidad interior.

---

## 8. REFERENCIAS

- Canon v7.0 Slide 11 (Module 0 Pre-Curso).
- Complementa: VAL-004 (Compromiso) como antecedente, VAL-006 (Gratitud) como consecuencia, PC-014 (3 Circles — responsabilidad sobre Círculo 1).

---

*TSS® Purple Belt · VAL-005 Responsabilidad Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,
  NULL,
  NULL,
  NULL,
  8,
  ARRAY['VAL-004']::TEXT[],
  'reading',
  19
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'VAL-006',
  'pre_course_values',
  20,
  $tss$Gratitud$tss$,
  $tss$Valor Brown Belt$tss$,
  NULL,  -- pillar
  $tss$# VAL-006 — GRATITUD · CANON

**ID:** VAL-006
**Valor:** Gratitud (Gratitude)
**Belt:** Brown Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS_Module_0_PreCurso_v3.0_WithPlaceholders.pptx (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANON — FORMA CORTA (ES)

**Gratitud es el valor de Brown Belt porque define la maestría interior del surfista que ya puede todo técnicamente — y elige llegar con humildad renovada.**

El Brown Belt ya surfea en cualquier condición, lee cualquier spot, ejecuta cualquier maneuver. Su técnica no está en discusión. Lo que lo define ya no es **lo que sabe hacer** — es **cómo llega al mar**. Gratitud es la consciencia de que cada ola es un privilegio, no un derecho; que el océano le dejó aprender; que el camino fue posible gracias a muchos; que el tiempo en el agua es limitado. El Brown Belt sabe, y por eso agradece.

**Brown Belt regresa con gratitud: saber todo, llegar con humildad renovada.**

---

## 2. CANON — FORMA LARGA (ES)

Gratitud es el valor central de Brown Belt porque este es el nivel donde el surfista enfrenta una paradoja interna: **puede todo, pero no es dueño de nada**.

El Brown Belt ya tiene la técnica. Ya superó las mesetas. Ya se hizo responsable. Ya comprometió años de vida al proceso. Y aquí es donde aparece el test más sutil de todo el camino: **¿el surfista termina esto con ego inflado o con gratitud expandida?**

La gratitud en este nivel significa cosas muy específicas:

**1. Gratitud por las olas que están.**
Después de miles de olas, el Brown Belt sabe que ninguna es igual. Sabe que cada una es un regalo transitorio. El que surfea desde gratitud **saborea** cada ola; el que no, las consume.

**2. Gratitud por los maestros.**
El Brown Belt llegó porque alguien le enseñó. Coach Marcelo, el primer instructor, los locales que lo toleraron, los que le corrigieron, los que le mostraron. **La gratitud al linaje es doctrinal, no sentimental.**

**3. Gratitud por los fallos.**
En retrospectiva, los fallos fueron los mejores maestros. El Brown Belt ya no les huye — los honra. Cada error fue un peldaño.

**4. Gratitud por el océano.**
El mar es más grande que el surfista. El Brown Belt lo sabe desde el cuerpo, no desde la teoría. Agradece cada vez que el océano lo deja entrar, lo deja jugar, lo deja volver seguro.

**5. Gratitud por el tiempo.**
El Brown Belt ya entiende que el tiempo en el agua es finito. Cada sesión es irrepetible. Gratitud aquí es **presencia total** — estar 100% donde se está.

**6. Gratitud por los compañeros.**
El que surfea solo puede llegar lejos. El que surfea acompañado llega más lejos. El Brown Belt reconoce a los que fueron parte del camino — sin ellos, no habría Brown Belt.

Gratitud no es sentimentalismo. Es **lucidez**. Es ver con claridad lo que se recibió, y reconocerlo sin necesidad de devolver nada excepto la propia integridad en el agua.

Por eso el Brown Belt **surfea diferente** — no técnicamente distinto, sino interiormente distinto. Su postura en el lineup, su trato con otros, su forma de cazar una ola, todo está impregnado de gratitud. Y eso se nota. Los alumnos más jóvenes lo sienten. Los locales lo respetan. El mar le responde.

El Brown Belt que no desarrolla gratitud puede ser técnicamente excelente y humanamente irrelevante. El que la desarrolla se convierte en **referencia** — y desde ahí, solo queda un paso al impacto (Black Belt).

---

## 3. CANON — FORMA CORTA (EN)

Gratitude is the Brown Belt value because it defines the inner mastery of the surfer who can already do everything technically — and chooses to arrive with renewed humility. The Brown Belt already surfs any condition, reads any spot, executes any maneuver. Their technique is not in question. What defines them is no longer **what they can do** — it is **how they arrive at the sea**. Gratitude is the consciousness that every wave is a privilege, not a right; that the ocean let them learn; that the path was possible thanks to many; that time in the water is limited. The Brown Belt knows, and therefore gives thanks.

**Brown Belt returns with gratitude: knowing all, arriving with renewed humility.**

---

## 4. CANON — FORMA LARGA (EN)

Gratitude is the central value of Brown Belt because this is the level where the surfer faces an internal paradox: **they can do everything, yet own nothing**.

The Brown Belt has the technique. Survived the plateaus. Took responsibility. Committed years of life to the process. And here appears the subtlest test of the entire path: **does the surfer finish this with inflated ego or expanded gratitude?**

Gratitude at this level means very specific things:

**1. Gratitude for the waves that are.**
After thousands of waves, the Brown Belt knows none is the same. Knows each one is a transient gift. The one who surfs from gratitude **savors** every wave; the one who doesn't, consumes them.

**2. Gratitude for teachers.**
The Brown Belt arrived because someone taught them. Coach Marcelo, the first instructor, the locals who tolerated them, those who corrected them, those who showed them. **Gratitude to the lineage is doctrinal, not sentimental.**

**3. Gratitude for failures.**
In retrospect, failures were the best teachers. The Brown Belt no longer runs from them — they honor them. Each error was a step.

**4. Gratitude for the ocean.**
The sea is bigger than the surfer. The Brown Belt knows this from the body, not from theory. They give thanks each time the ocean lets them enter, lets them play, lets them return safely.

**5. Gratitude for time.**
The Brown Belt now understands that time in the water is finite. Each session is irreplaceable. Gratitude here is **total presence** — being 100% where one is.

**6. Gratitude for companions.**
The one who surfs alone can go far. The one who surfs accompanied goes further. The Brown Belt recognizes those who were part of the path — without them, there would be no Brown Belt.

Gratitude is not sentimentality. It is **lucidity**. It is seeing clearly what was received, and acknowledging it without needing to give anything back except one's own integrity in the water.

That is why the Brown Belt **surfs differently** — not technically different, but inwardly different. Their posture in the lineup, their relation to others, the way they catch a wave, all is infused with gratitude. And that shows. Younger students feel it. Locals respect it. The sea responds.

The Brown Belt who doesn't develop gratitude can be technically excellent and humanly irrelevant. The one who develops it becomes a **reference** — and from there, only one step remains to impact (Black Belt).

---

## 5. CLOSING PHRASE (ES · CANON STYLE)

**Brown Belt regresa con gratitud: saber todo, recibir todo, poseer nada.**

## 6. CLOSING PHRASE (EN · CANON STYLE)

**Brown Belt returns with gratitude: knowing all, receiving all, owning nothing.**

---

## 7. APLICACIÓN DOCTRINAL

- Brown Belt graduation incluye un "debrief de linaje": el surfista nombra públicamente a quienes hicieron posible su camino.
- La gratitud es observable en el Brown Belt por cómo trata a alumnos nuevos — con paciencia, sin condescendencia.
- Un Brown Belt con soberbia es un Brown Belt **fallido** — se le pide repetir el tramo final.

---

## 8. REFERENCIAS

- Canon v7.0 Slide 11 (Module 0 Pre-Curso).
- Complementa: VAL-005 (Responsabilidad) como base, VAL-007 (Impacto) como consecuencia.

---

*TSS® Brown Belt · VAL-006 Gratitud Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,
  NULL,
  NULL,
  NULL,
  8,
  ARRAY['VAL-005']::TEXT[],
  'reading',
  20
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'VAL-007',
  'pre_course_values',
  21,
  $tss$Impacto$tss$,
  $tss$Valor Black Belt$tss$,
  NULL,  -- pillar
  $tss$# VAL-007 — IMPACTO · CANON

**ID:** VAL-007
**Valor:** Impacto (Impact)
**Belt:** Black Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS_Module_0_PreCurso_v3.0_WithPlaceholders.pptx (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANON — FORMA CORTA (ES)

**Impacto es el valor de Black Belt porque define al surfista cuya presencia ya trasciende su propia ola.**

El Black Belt ya no surfea para sí mismo. Surfea porque es el vehículo a través del cual la disciplina, los valores, la enseñanza y el linaje se transmiten a otros. Ya no se mide por su técnica — se mide por **qué deja detrás**: alumnos, lineups más saludables, comunidad, legado. Impacto es la etapa donde el surfista se convierte en **maestro, referente y custodio** del sistema.

**Black Belt entrega con impacto: no la ola, sino el camino.**

---

## 2. CANON — FORMA LARGA (ES)

Impacto es el valor final del camino TSS porque este es el nivel donde el surfista cruza el último umbral: **de estudiante a maestro, de receptor a transmisor, de practicante a custodio**.

Un Black Belt no es alguien que surfea mejor que todos. Es alguien que **entiende lo suficiente** de la disciplina, de los valores, de las personas, de los procesos, como para **hacer que el sistema trascienda a su propia vida**. Es quien asegura que lo aprendido no muera con él — se replica, se distribuye, se multiplica.

Impacto en este nivel significa:

**1. Impacto en alumnos.**
El Black Belt enseña. Formalmente o informalmente. Certifica, mentorea, corrige, acompaña. Cada alumno que forma es una extensión del camino que él recorrió. El Black Belt sin alumnos es un Black Belt incompleto.

**2. Impacto en el sistema.**
El Black Belt **aporta al sistema** — no solo lo consume. Su experiencia refina el Canon, sus observaciones mejoran las Coach Cheat Sheets, su perspectiva madura los valores. El Black Belt es **co-constructor** del TSS, no solo usuario.

**3. Impacto en la comunidad.**
El lineup donde el Black Belt entra se vuelve un lineup mejor. Su presencia ordena. Su ejemplo educa. Su respeto se contagia. Deja el lugar más sano de como lo encontró.

**4. Impacto en el linaje.**
El surf vino de antes y va hacia adelante. El Black Belt es un **eslabón consciente** en esa línea. Honra a los maestros, transmite a los siguientes. Sabe que no inventó nada — solo cuida y pasa.

**5. Impacto en las personas.**
Más allá de técnica, el Black Belt impacta vidas. Los alumnos que forma cambian — no solo en el agua, sino en su forma de operar en el mundo. TSS no entrena surfistas: **entrena personas que también surfean**.

**6. Impacto en el propio legado.**
El Black Belt piensa en qué va a dejar. No por ego, sino por responsabilidad con quienes seguirán. Diseña para ser superado. Forma para que otros lo superen. Escribe, documenta, sistematiza para que el conocimiento no se pierda.

Impacto **no es fama**. Fama es recibir atención. Impacto es provocar cambio. El Black Belt no necesita que lo conozcan — necesita que lo que enseñó funcione.

Por eso, en el camino TSS, el Black Belt no es el fin — es el comienzo de otro tramo: el tramo donde el surfista deja de ser protagonista y se convierte en **infraestructura** para que otros puedan tener protagonismo.

Y ese es el propósito último de la humildad, el proceso, el compromiso, la responsabilidad, la gratitud: todos desembocan en **impacto**. Todos son pasos para llegar al punto donde el surfista puede dar más de lo que recibe.

Consciencia, humildad, proceso, compromiso, responsabilidad, gratitud, impacto. Siete valores. Un solo camino. El camino del surfista completo.

---

## 3. CANON — FORMA CORTA (EN)

Impact is the Black Belt value because it defines the surfer whose presence now transcends their own wave. The Black Belt no longer surfs for themselves. They surf because they are the vehicle through which discipline, values, teaching, and lineage are transmitted to others. They are no longer measured by their technique — they are measured by **what they leave behind**: students, healthier lineups, community, legacy. Impact is the stage where the surfer becomes **master, reference, and custodian** of the system.

**Black Belt delivers with impact: not the wave, but the path.**

---

## 4. CANON — FORMA LARGA (EN)

Impact is the final value of the TSS path because this is the level where the surfer crosses the last threshold: **from student to master, from receiver to transmitter, from practitioner to custodian**.

A Black Belt is not someone who surfs better than everyone. It is someone who **understands enough** of the discipline, values, people, and processes to **make the system transcend their own life**. They ensure that what was learned does not die with them — it replicates, distributes, multiplies.

Impact at this level means:

**1. Impact on students.**
The Black Belt teaches. Formally or informally. Certifies, mentors, corrects, accompanies. Each student formed is an extension of the path they walked. A Black Belt without students is an incomplete Black Belt.

**2. Impact on the system.**
The Black Belt **contributes to the system** — doesn't only consume it. Their experience refines the Canon, their observations improve Coach Cheat Sheets, their perspective matures the values. The Black Belt is **co-constructor** of TSS, not just a user.

**3. Impact on the community.**
The lineup where the Black Belt enters becomes a better lineup. Their presence organizes. Their example educates. Their respect contaminates. They leave the place healthier than found.

**4. Impact on the lineage.**
Surfing came from before and goes forward. The Black Belt is a **conscious link** in that line. Honors the masters, transmits to the next. Knows they invented nothing — just caring and passing.

**5. Impact on people.**
Beyond technique, the Black Belt impacts lives. The students they form change — not only in the water, but in how they operate in the world. TSS doesn't train surfers: **it trains people who also surf**.

**6. Impact on personal legacy.**
The Black Belt thinks about what they will leave. Not by ego, but by responsibility to those who will follow. Designs to be surpassed. Forms so others surpass them. Writes, documents, systematizes so knowledge is not lost.

Impact **is not fame**. Fame is receiving attention. Impact is provoking change. The Black Belt doesn't need to be known — they need what they taught to work.

That is why, in the TSS path, Black Belt is not the end — it is the beginning of another stretch: the stretch where the surfer stops being protagonist and becomes **infrastructure** so others can have protagonism.

And this is the ultimate purpose of humility, process, commitment, responsibility, gratitude: they all flow into **impact**. They are all steps to arrive at the point where the surfer can give more than they receive.

Consciousness, humility, process, commitment, responsibility, gratitude, impact. Seven values. One path. The path of the complete surfer.

---

## 5. CLOSING PHRASE (ES · CANON STYLE)

**Black Belt entrega con impacto: ya no la ola, sino el camino; ya no el alumno, sino el linaje.**

## 6. CLOSING PHRASE (EN · CANON STYLE)

**Black Belt delivers with impact: no longer the wave, but the path; no longer the student, but the lineage.**

---

## 7. APLICACIÓN DOCTRINAL

- Black Belt certification requiere: (a) formar al menos 3 alumnos a Blue Belt, (b) contribuir al Canon TSS documentalmente, (c) ser reconocido por la comunidad como referencia ética.
- El Black Belt tiene permiso (y deber) de **enseñar el sistema completo** — incluyendo su constitucionalidad, no solo su técnica.
- Black Belts activos son custodios del sistema — tienen voz en amendments del Canon Seal.

---

## 8. REFERENCIAS

- Canon v7.0 Slide 11 (Module 0 Pre-Curso).
- Complementa: VAL-006 (Gratitud) como antecedente. Cierra el arco completo de los 7 valores TSS.
- Conexión con **Marcelo OS META FINAL:** *financial freedom + intellectual authority + formative legacy.*

---

*TSS® Black Belt · VAL-007 Impacto Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  NULL,
  NULL,
  NULL,
  NULL,
  8,
  ARRAY['VAL-006']::TEXT[],
  'reading',
  21
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-001',
  'white_belt',
  1,
  $tss$Venue Analysis$tss$,
  NULL,
  $tss$Safety / Ocean Reading$tss$,
  $tss$# STP-001 — Venue Analysis · Canonical Description

**Belt:** White Belt
**Pillar:** Safety / Ocean Reading
**Introduced Seq:** 1.0
**Mastered Belt:** White Belt (foundation) — refined through every subsequent belt
**Canon Block:** Block 0
**Version:** v1.0
**Status:** CANONIZED

---

## 1. Definition

**Venue Analysis** is the first operational step of every TSS session, at every belt, forever.

It is the structured observation of the surf zone the student is about to enter, producing a **mental map** detailed enough to make a defensible decision about whether, where, and how to surf that day.

It is not "looking at the waves." It is the deliberate construction of a map using 8 canonical key words applied in fixed order.

---

## 2. The 8 key words (canonical chain)

```
MAP · REFERENCE · SAFE ZONE · IMPACT ZONE · HAZARDS · IN/OUT · GO-NOGO · SESSION PLAN
```

| # | Key word | What it names |
|---|---|---|
| 1 | MAP | The mental construct the whole drill produces. Everything else feeds this. |
| 2 | REFERENCE | Two fixed points: one in land, one outside. Together they allow drift detection. |
| 3 | SAFE ZONE | Where whitewater reforms softly. Where a White Belt works. |
| 4 | IMPACT ZONE | Where the wave breaks with full energy. Where a White Belt does not go. |
| 5 | HAZARDS | Currents, crowd, obstacles, depth changes, wind direction. |
| 6 | IN/OUT | Entry and exit points. Distinct if there is current. |
| 7 | GO-NOGO | Binary decision, justified by what was observed. |
| 8 | SESSION PLAN | One specific practice goal for the session, inside the SAFE ZONE. |

These 8 words appear in **all 4 teaching stages** (Explicación, Demostración, Participación, Feedback) as a single unified vocabulary.

---

## 3. Why it matters

Venue Analysis is the only step of TSS that is executed **before any surfing happens**. It is therefore the single highest-leverage safety and tactical action of the session. Everything the student does in the water afterwards is constrained and shaped by the quality of this analysis.

At White Belt, its purpose is **safety and calibration**:
- Keeps the student within WB conditions.
- Calibrates expectations so the student is not frustrated by conditions they never understood.
- Builds the habit of *read before you act*, which carries forward through every belt.

At higher belts, the same step evolves into a **tactical instrument** — wave selection, timing, positioning, competitive reading.

White Belt teaches it as a **safety protocol**. Yellow Belt and above progressively expose the **tactical layer**.

---

## 4. Coach-student dynamic at White Belt

| Session | Coach role | Student role |
|---|---|---|
| 1 | Leads the analysis. Demonstrates process in voice. Waits for silence. | Observes. Responds to direct questions. |
| 2 | Asks all 7 questions in order. Corrects without giving answers. | Answers each key word. Begins pointing physically. |
| 3 | Observes. Intervenes only if a component is skipped. | Initiates analysis unprompted. Runs key word sequence. |
| End of WB | Silent. Only validates. | Runs full analysis silently, then reports: *"Reference, map, safe zone, impact zone, hazards, in/out, go, plan — ready."* |

This progression mirrors the **Dual Progression**:
- **Clásico** (explicit coach-led teaching of each component).
- **Ecológico** (student self-initiates; coach shapes the environment).

Both modes are used. Classical dominates early sessions. Ecological dominates by end of belt.

---

## 5. Observable success criteria (6)

At the end of Venue Analysis, the student must be able to:

1. Identify the SAFE ZONE clearly and physically (with gesture, not word).
2. Describe general conditions in ≤2 sentences.
3. Name at least 1 significant HAZARD.
4. State IN and OUT points with reasoning.
5. Give a defensible GO-NOGO for their level.
6. Close with a specific SESSION PLAN sentence.

All 6 must be observed across **2 separate sessions** in valid White Belt conditions before STP-001 is certified passed.

---

## 6. Common errors (see ERR-WB-001 to ERR-WB-004)

- **ERR-WB-001** Rushed analysis (most common, safety-critical).
- **ERR-WB-002** Vague reading — vocabulary without observation.
- **ERR-WB-003** Failed outside reference — single-point observation.
- **ERR-WB-004** Mismatched level vs conditions — judgment error, critical.

---

## 7. Doctrinal link (Value: Humility)

Venue Analysis is the technical expression of the White Belt value, **Humility**.

> *Humility is the refusal to pretend you know the ocean. Venue Analysis is the act of listening to the ocean first.*

A student who cannot run a defensible Venue Analysis cannot operationalize humility — regardless of their technical paddling or pop-up skills. This is why Venue Analysis is positioned in Block 0 and is a prerequisite for everything that follows.

---

## 8. Coach cue (anchoring phrase)

> *"Create the map. Identify the safe zone. Decide if today's conditions match your level."*

This is the closing phrase of every Venue Analysis round. It is also the end card of VID-WB-001.

---

## 9. Cross-references

| Layer | File |
|---|---|
| Drill | `03_DRILLS_LIBRARY/DRL-WB-01_Venue_Analysis_Map_Drill.md` |
| Video script | `05_VIDEO_PRODUCTION/VID-WB-001_Venue_Analysis_Script_v2.md` |
| Errors | `04_ERROR_DB/ERR-WB-001` → `ERR-WB-004` |
| Coach cheat sheet | `06_Coach_Notes/STP-001_Coach_Cheat_Sheet_v1.md` |
| Standard | `01_CANON/Core_Canon/WB_Competency_Standard_v1.0.md` §4 A2 + §3 |
| Canon Seal | `01_CANON/Core_Canon/WB_Canon_Seal_v1.0.md` §4 |
| Excel master | `00_MASTER_REGISTRY/TSS_Belt_Master_Registry_MARCELO.xlsx` (current version) |

---

## 10. Doctrinal note on Canon Seal drift

The WB Canon Seal v1.0 lists Venue Analysis as **STP-002**. The Excel master registry lists it as **STP-001**.

**Ruta A resolution (Marcelo, 2026-04-16):** The Excel master is the authority. The Canon Seal will be aligned to Excel in the next seal update (v1.1). All Nivel 2 productized documents use Excel IDs.

---

*TSS® White Belt Canon · IP of Marcelo Castellanos / Enkrateia · Humility*
$tss$,
  $tss$# DRL-WB-01 — Venue Analysis Map Drill

**Linked Step:** STP-001 Venue Analysis
**Belt:** White Belt
**Pillar:** Safety / Tactical
**Canon Version:** v1.0
**Status:** CANONIZED

---

## Objective

That the student learns to read the spot before entering the water, build a clear map of the zone, and take a basic safety + planning decision grounded in what they actually observe.

---

## Why this drill matters

If the student cannot identify the safe zone, they are not ready to enter the water. Venue Analysis is not done once at the start of a surfer's career — it is the first action of **every** session, forever. Mastering this drill early is the foundation of ocean awareness and builds the habit of "read before you act."

---

## Coach role — White Belt

The coach acts as **Director**. This is not autonomous practice at this belt.

The coach:
- Leads the analysis with a fixed sequence of questions.
- Points physically at zones when needed.
- Models the mental process in voice.
- Corrects each observation without giving the answer.

At White Belt, expect 100% coach-led in session 1-2, transitioning to student-led with coach observation by session 3+.

---

## Key Words Chain (canonical)

The coach uses these **8 key words in order** throughout the drill. These same words appear in the Explanation, Demonstration, Participation, and Feedback phases — creating a single vocabulary the student learns to hear and respond to.

```
MAP · REFERENCE · SAFE ZONE · IMPACT ZONE · HAZARDS · IN/OUT · GO-NOGO · SESSION PLAN
```

---

## Setup

**Location:** Beach with full view of the surf zone. Ideally an elevated observation point (dune, path, or standing on sand).

**Required materials:**
- Nothing mandatory.
- Optional: a surface to draw on (sand, whiteboard, notebook, pointing with finger).

**Time investment:**
- 5 minutes minimum of silent observation before the drill starts. No opinions, no words. Just watch sets come and go.
- 8–12 minutes for the full drill.

---

## Step-by-step (7 components of the MAP)

### Step 1 — REFERENCE
Ask: *"Where are we standing? What's your outside reference point?"*
Student must identify: a fixed land reference (palm tree, building, rock) AND one outside reference (a boat, marker, headland) to track drift later.

### Step 2 — MAP (general conditions)
Ask: *"What size is the wave? How is the tide? What is the sea doing today?"*
Student describes: wave size in feet or relative terms, tide state (rising/falling/high/low), general behavior (clean, messy, lined up, choppy), frequency of sets.

### Step 3 — SAFE ZONE + IMPACT ZONE
Ask: *"Where is the SAFE ZONE? Where is the IMPACT ZONE?"*
Student physically points. Safe zone = whitewater inside, soft foam, reforming waves. Impact zone = where waves break with full energy.

### Step 4 — HAZARDS
Ask: *"What HAZARDS do you see?"*
Student must name at least: current direction, crowd density, obstacles (rocks, pier, reef), any change-of-depth zone. If they miss one visible hazard, the coach asks a specific question: *"What's that foam doing over there? Is it drifting?"*

### Step 5 — IN/OUT
Ask: *"Where will you get IN? Where will you come OUT?"*
Student points to entry and exit. They must be different if there's a current. Exit should be closer to where the current takes them, not against it.

### Step 6 — GO-NOGO
Ask: *"GO or NO-GO for you, today, at your level? Why?"*
Student must give a binary answer AND justify it with what they observed. Vague justifications are rejected.

### Step 7 — SESSION PLAN
Student closes by stating: *"Today I will practice ______ in the SAFE ZONE."*
Must be specific. "Today I will practice 3 paddle-catches on foam in the safe zone" — accepted. "I want to have a good session" — rejected.

---

## What the coach should observe

- Does the student **actually look** at the ocean for at least 3 minutes before opening their mouth?
- Do they physically point at each zone, or just vaguely gesture?
- Is their GO-NOGO coherent with their actual level?
- Can they explain their reasoning, or are they guessing?
- Do they self-correct when conditions change mid-analysis?

---

## Common errors

See `ERR-WB-001` through `ERR-WB-004` in `04_ERROR_DB/`:

- **ERR-WB-001** Rushed analysis
- **ERR-WB-002** Vague reading of the spot (no justification)
- **ERR-WB-003** Failing to identify outside reference point
- **ERR-WB-004** Mismatched level vs conditions

---

## Coach corrections (short verbal disparadores)

- *"Show me where."*
- *"Where is the SAFE ZONE?"*
- *"What is the current doing?"*
- *"Are today's conditions appropriate for your level?"*
- *"One goal. Specific."*
- *"Conditions changed. Look again."*

---

## Success criteria

The drill is completed when the student can:

1. Identify the SAFE ZONE clearly and physically.
2. Describe general conditions of the day in ≤2 sentences.
3. Point out at least one significant HAZARD.
4. State IN and OUT points with reasoning.
5. Give a defensible GO-NOGO for their level.
6. Close with a specific SESSION PLAN.

All 6 must be observed in 2 separate sessions, in valid White Belt conditions, before the drill is certified passed.

---

## Progression

**Clásico (session 1-2):** Coach asks every question in order. Student responds to each key word.

**Ecológico (session 3+):** Student initiates the analysis unprompted. Coach intervenes only with a key word when a component is skipped.

**Autonomous (end of WB):** Student runs the full analysis silently, then reports: *"Reference, map, safe zone, impact zone, hazards, in/out, go, plan — ready."*

---

*TSS® Drill Canon · IP of Marcelo Castellanos / Enkrateia · White Belt*
$tss$,
  $tss$### ERR-WB-001 — Rushed Analysis

The student looks at the spot for 10–30 seconds and declares it "analyzed." They skip the silent observation window and jump straight into declaring the safe zone, hazards, or go/no-go. This is the most common White Belt error.

### ERR-WB-002 — Vague Reading (No Justification)

The student uses vocabulary that *sounds* analytical but contains no observable evidence. Examples of vague reading:

- *"Está bien hoy."*
- *"Se ve tranquilo."*
- *"La izquierda es mejor."*
- *"Hay corriente."* (without showing where, in which direction, how strong)
- *"Yes, go."* (with no reason)

The map has no information.

### ERR-WB-003 — Failed Outside Reference

The student identifies a land reference (palm tree, beach umbrella, building) but fails to identify a **second reference outside** — a fixed visual point on or beyond the horizon line: a boat, a buoy, an island, a headland, a distant building. Without the outside reference, the student cannot detect lateral drift once in the water.

### ERR-WB-004 — Mismatched Level vs Conditions

The student gives a **GO** for conditions that are outside valid White Belt range (per `WB_Competency_Standard_v1.0` §3). Typical versions:

- Foam larger than ~3 ft (above waist-high).
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['VAL-007']::TEXT[],
  'reading',
  22
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-002',
  'white_belt',
  2,
  $tss$Warm Up$tss$,
  NULL,
  $tss$Physical$tss$,
  $tss$# STP-002 — Warm Up · Canonical Description

**Belt:** White Belt
**Pillar:** Physical
**Introduced Seq:** 1.0
**Mastered Belt:** White Belt (foundation) — refined through every subsequent belt
**Canon Block:** Block 0-1
**Version:** v1.0
**Status:** CANONIZED

---

## 1. Definition

**Warm Up** is the deliberate transition from arrival-state to ready-state before the student enters the water.

It is not a gym warm-up and not a generic stretch. It is a **surf-specific activation sequence** that prepares joints, muscles, movement patterns, breath, and attention for the demands of the session about to happen.

Warm Up is one of the two non-negotiable rituals of every TSS session. It is the physical-mental bridge between "I arrived at the beach" and "I am ready to surf."

---

## 2. The 5 key words (canonical chain)

```
MOBILITY · ACTIVATION · SIMULATION · BREATH · READY
```

| # | Key word | What it names |
|---|---|---|
| 1 | MOBILITY | Phase 1. Oil the joints: neck, shoulders, scapulae, trunk, hips, ankles. |
| 2 | ACTIVATION | Phase 2. Switch on key surf muscles: core, scapulae, obliques, legs, posture. |
| 3 | SIMULATION | Phase 3. Rehearse real surf movements on land: pop-up, posture, knee flexion, rotation. |
| 4 | BREATH | Phase 4. Connect breath, attention, body. Reduce mental noise. |
| 5 | READY | Final observable state: *"Body ready. Mind clear. Breath connected. Here and now."* |

These 5 words appear in **all 4 teaching stages** (Explicación, Demostración, Participación, Feedback) as a single unified vocabulary.

The coach uses the same 5 words to introduce, demonstrate, prompt, and correct. This creates a shared cognitive anchor for the student across every session.

---

## 3. Why it matters

Warm Up controls three failure modes that otherwise sabotage the session from its first minute:

- **Physical failure** — paddling stiff, reacting late, minor strains, cold muscles, shallow rotation.
- **Mental failure** — entering distracted, scattered, overstimulated, or disconnected.
- **Energetic failure** — entering already fatigued because the warm-up overshoot, or entering under-activated because it undershot.

Warm Up is the tool that eliminates all three when executed correctly. It is simple, but skipping it compounds into every other step.

At White Belt its purpose is **ritual installation**: the student learns that entering the water cold is not an option. At higher belts, the same ritual evolves into performance-specific activation (competition warm-up, contest routine, etc.). The White Belt version is the seed.

---

## 4. Structure — 4 phases in fixed order

### Phase 1 — MOBILITY
Oil the joints. Wake up the body.
Body map: neck → shoulders → scapulae → trunk → hips → ankles.
Examples: neck mobility, arm swings, trunk rotations, hip circles, single-leg balance with ankle mobility.

### Phase 2 — ACTIVATION
Switch on the surf-specific muscles.
Body map: core, obliques, scapulae, posture, legs, hands.
Examples: scapular activation, core bracing, posture holds, knee-flexion patterns, oblique engagement.

### Phase 3 — SIMULATION
Rehearse real surf movements on land.
White Belt simulations: pop-up reps, hip movement, posture, deep knee flexion, basic rotation, oblique-driven turning pattern.

### Phase 4 — BREATH
Connect breath, attention, body.
End state: calm, not sleepy; active, not overstimulated; connected, not distracted.

---

## 5. Coach-student dynamic at White Belt

| Session | Coach role | Student role |
|---|---|---|
| 1 | Leads full sequence. Names every key word aloud. Demonstrates every movement. | Observes and follows. |
| 2 | Leads but invites anticipation: "¿Qué fase viene?" | Follows + starts naming phases. |
| 3 | Present but silent between phases. Corrects only critical errors. | Transitions phases unprompted. |
| 4+ | Validates. Adjusts intensity for the day. | Initiates warm-up solo. Closes with coach cue aloud. |

This progression mirrors the **Dual Progression**:

- **Clásico (dominant)** — coach-led sequence, fixed structure.
- **Ecológico** — student-initiated warm-up, coach only adjusts intensity or attention.

The step is **classical-dominant** because the warm-up must be executed consistently, but carries an ecological component in Phase 4 (BREATH), where the student must self-observe.

---

## 6. Observable success criteria (3)

At the end of Warm Up, the student must:

1. Complete all 4 phases with focus and correct movement quality, without rushing or skipping.
2. Show improved readiness in the simulations (pop-up, posture, knee flexion, rotation) compared to phase 1.
3. Enter the water physically active, mentally present, and connected — without unnecessary fatigue.

All 3 must be observed across **2 separate sessions** in valid White Belt conditions before STP-002 is certified passed.

---

## 7. Common errors (see ERR-WB-005 to ERR-WB-008)

- **ERR-WB-005** Going Through Motions — body moves, attention absent.
- **ERR-WB-006** Cutting Phases — student skips or rushes a phase.
- **ERR-WB-007** Breath Disconnection — phase 4 executed without real breath-body link.
- **ERR-WB-008** Wrong Intensity — warm-up too light (student enters cold) or too heavy (student enters fatigued). Often coach-caused, observable in the student.

---

## 8. Doctrinal framing

Warm Up is the **first physical expression of respect for the ocean** in every session. It is not about "getting loose." It is the ritual of showing up prepared.

> *"No entramos fríos. No entramos rígidos. No entramos distraídos. Entramos en la zona correcta de activación. Ni mucho. Ni poco. Listos para actuar."*

If the student cannot Warm Up with intention, they cannot hold intention for the 40-60 minutes of the session that follow.

---

## 9. Coach cue (anchoring phrase)

> *"Body ready. Mind clear. Breath connected. Here and now."*

This is the closing phrase of every Warm Up round. It is also the end card of VID-WB-002. From session 3 onwards the student says it aloud themselves at the end of phase 4.

---

## 10. Boundary

**Set Goal** is NOT part of Warm Up. Set Goal is a separate step handled in its own canon row. Warm Up ends at "Ready." Session goal is set immediately afterwards in the ritual sequence, not inside this step.

This boundary protects language integrity and allows either step to be tested, certified, and licensed independently.

---

## 11. Cross-references

| Layer | File |
|---|---|
| Drill | `03_DRILLS_LIBRARY/DRL-WB-02_TSS_Warm_Up_Flow.md` |
| Video script | `05_VIDEO_PRODUCTION/VID-WB-002_Warm_Up_Script_v2.md` |
| Errors | `04_ERROR_DB/ERR-WB-005` → `ERR-WB-008` |
| Coach cheat sheet | `06_Coach_Notes/STP-002_Coach_Cheat_Sheet_v1.md` |
| Coach notes template | `06_Coach_Notes/STP-002_Coach_Notes_Template_v1.md` |
| Standard | `01_CANON/Core_Canon/WB_Competency_Standard_v1.0.md` |
| Excel master | `00_MASTER_REGISTRY/TSS_Belt_Master_Registry_MARCELO.xlsx` (current version) |

---

*TSS® White Belt Canon · IP of Marcelo Castellanos / Enkrateia · Humility*
$tss$,
  $tss$# DRL-WB-02 — TSS Warm Up Flow

**Linked Step:** STP-002 Warm Up
**Belt:** White Belt
**Pillar:** Physical
**Version:** v1.0
**Status:** CANONIZED

---

## Objective

Prepare the student physically and mentally for the session by activating joints, muscles, posture, and movement patterns specific to surfing — while bringing the student into a focused, connected, ready state — **without creating fatigue**.

---

## Why this drill matters

Warm Up is not optional. It is the ritual that separates "arrived at the beach" from "ready to surf." Every White Belt who skips or rushes this drill enters the water already at a deficit: stiff, disconnected, reactive instead of ready.

In the TSS architecture, this drill lives inside the broader **Get in the Zone System**. Warm Up is the physical/mental preparation. Set Goal (separate step) is what follows immediately.

---

## Coach role

- Leads rhythm and intensity. Reads the group in front of them — never runs an automatic routine.
- Adapts delivery: with kids, more playful; with adults, precise and purposeful; with beginners, conservative intensity.
- Regulates so the warm-up **prepares, does not compete with the session**.
- Names the 5 key words aloud in every phase transition.

---

## KEY WORDS CHAIN

```
MOBILITY → ACTIVATION → SIMULATION → BREATH → READY
```

The coach uses these 5 words in Explicación, Demostración, Participación, Feedback.
The student hears the same 5 words 4 times. By session 3, they initiate phase transitions saying the word aloud themselves.

---

## Setup

- **Location:** dry sand, flat surface, ~2m²/student.
- **Equipment:** no equipment required. Water bottle nearby.
- **Time:** 8-12 min total.
- **Surface:** never on rocks or concrete. Only on sand.
- **Group:** 1 coach can run up to 8 students simultaneously.
- **Moment:** always after STP-001 Venue Analysis, always before entering water, always before Set Goal.

---

## Structure — 4 phases

### PHASE 1 — MOBILITY (2-3 min)

**Objective:** oil the joints, wake up the body.

**Body map (top-down):** neck → shoulders → scapulae → trunk → hips → ankles.

**Example sequence (modular — coach adapts):**
- Neck mobility: 5 rotations each direction.
- Arm swings: 10 circles forward, 10 back.
- Scapular rolls: 10 forward, 10 back.
- Trunk rotations: 10 each side.
- Hip circles: 10 each direction.
- Single-leg balance with ankle mobility: 5 ankle rotations per side, eyes open.

**Coach cue during phase:** *"MOBILITY. Aceitamos las articulaciones. Sin prisa."*

### PHASE 2 — ACTIVATION (2-3 min)

**Objective:** switch on the muscles that surfing will demand.

**Body map:** core, obliques, scapulae, posture, legs.

**Example sequence (modular):**
- Scapular activation: protraction/retraction, 10 reps.
- Core bracing hold: 20 seconds, 2 rounds.
- Posture hold: shoulders back, chest open, glutes active — 20 seconds.
- Knee flexion pattern: 10 controlled squats emphasizing depth and ankle mobility.
- Oblique engagement: 10 side bends + 10 wood-choppers per side.

**Coach cue during phase:** *"ACTIVATION. Prendemos los músculos. Prepárate para paddlear, para pop-up, para girar."*

### PHASE 3 — SIMULATION (2-3 min)

**Objective:** rehearse on land the movements that will later be required in the water.

**White Belt simulations:**
- 5 pop-up reps (controlled, focus on form not speed).
- 5 pop-up reps with end-posture hold (3 seconds on each).
- Hip movement drill: 10 rotations in surf stance.
- Basic rotation: 10 oblique-driven turns from surf stance.

**Coach cue during phase:** *"SIMULATION. Ensayamos en tierra lo que haremos en el agua. Misma postura. Misma rotación."*

### PHASE 4 — BREATH (1-2 min)

**Objective:** connect breath, attention, body. Reduce mental noise.

**Sequence:**
- Feet shoulder-width, eyes soft forward or closed.
- 4 slow nasal inhalations, 4 long mouth exhalations.
- Body scan (10 seconds): feet grounded, shoulders relaxed, jaw loose.
- Coach asks: *"¿Cómo estás? Body ready?"*
- Student responds (aloud, session 3+): *"Body ready. Mind clear. Breath connected. Here and now."*

**End state target:**
- Calm, not sleepy.
- Active, not overstimulated.
- Connected, not distracted.

---

## Success criteria (3)

1. Student completes all 4 phases with focus and correct movement quality, without rushing or skipping.
2. Shows improved readiness in the simulations (pop-up, posture, knee flexion, rotation) compared to phase 1.
3. Enters the water physically active, mentally present, and connected — without unnecessary fatigue.

**Pass = all 3 observed in one session. Certification = 2 consecutive sessions passed.**

---

## Red flags (error cards to deploy)

| Observed | Error card |
|---|---|
| Student body moves, eyes absent | ERR-WB-005 Going Through Motions |
| Skips or accelerates a phase | ERR-WB-006 Cutting Phases |
| Phase 4 is just silence, no breath | ERR-WB-007 Breath Disconnection |
| Student fatigued / sweating heavily / cold | ERR-WB-008 Wrong Intensity |

---

## Adaptations by population

| Group | Adjustment |
|---|---|
| Kids (<12) | More playful, shorter (6-8 min), phase 4 shortened to 30s of "quiet breathing." |
| Adults beginners | Conservative intensity, no deep flexion, focus on mobility. |
| Athletes / experienced | Full intensity, can extend simulation phase. |
| Cold climate | Extend Phase 1 mobility. |
| Hot climate | Shorten activation phase to avoid fatigue. |

The **structure (4 phases, 5 key words)** never changes. The **intensity, volume, and tone** adapt.

---

## Closing ritual

At end of Phase 4, coach announces:

> *"Body ready. Mind clear. Breath connected. Here and now."*

Student repeats (session 3+).

Then transitions immediately to STP-??? Set Goal (separate step).

---

## Related

- Step: `STP-002_Description_v1.md`
- Video: `VID-WB-002_Warm_Up_Script_v2.md`
- Errors: `ERR-WB-005` to `ERR-WB-008`
- Cheat sheet: `STP-002_Coach_Cheat_Sheet_v1.md`

---

*TSS® Drill Library · IP of Marcelo Castellanos / Enkrateia · White Belt*
$tss$,
  $tss$### ERR-WB-005 — Going Through Motions

The student executes the 4 phases visually — body moves, reps get done — but attention is absent. Eyes wander.

### ERR-WB-006 — Cutting Phases

The student skips a phase entirely or rushes through it to get to the water faster. Common patterns:

- Skipping Phase 1 MOBILITY because "I already stretched."
- Compressing Phase 2 ACTIVATION to a few seconds because "I'm warm already."
- Going from Phase 3 SIMULATION straight into the water, skipping Phase 4 BREATH.

### ERR-WB-007 — Breath Disconnection

Phase 4 (BREATH) is executed without actual breath-body connection. The student stands still, possibly closes their eyes, but the breathing is shallow, irregular, or performative.

### ERR-WB-008 — Wrong Intensity

The Warm Up intensity is miscalibrated for the student or group. Two versions:

**Version A — Under-intensity:**
The warm-up is so light it does not actually prepare the body.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-001']::TEXT[],
  'reading',
  23
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-003',
  'white_belt',
  3,
  $tss$Grab Board$tss$,
  NULL,
  $tss$Technical$tss$,
  $tss$# STP-003 — Grab Board · Canonical Description

**Belt:** White Belt
**Pillar:** Technical
**Introduced Seq:** 1.0
**Mastered Belt:** White Belt
**Canon Block:** Block 1 — Preparation & Positioning
**Version:** v1.0
**Status:** CANONIZED

---

## 1. Definition

**Grab Board** is the moment the surfer picks up the surfboard from the ground and brings it under control in their hands.

It is the first purely technical step of every session — the first time the student physically handles the equipment they will use in the water. It looks simple. It is the foundation of every board-handling behavior that follows.

---

## 2. Boundary (CRITICAL)

Grab Board covers **ONLY** the transition from:

> **board at rest on the ground → board securely in the surfer's hands**

It does **NOT** include:

- Walking into the water → **STP-004 Walk Out**
- Placing the board in the water → **STP-005 Put Board in the Water**
- Handling whitewater → **STP-007**
- Nose-angle management (30–45°) during entry → belongs to **Walk Out / Board Control**

This boundary is non-negotiable. It protects the modularity and licensability of the step.

---

## 3. The 5 key words (canonical chain)

```
CENTER · KNEES · RAILS · LIFT · CARRY
```

| # | Key word | What it names |
|---|---|---|
| 1 | CENTER | Stand beside the midpoint of the board |
| 2 | KNEES | Bend knees with straight back (no rounded back) |
| 3 | RAILS | Both hands on the rails (never nose or tail) |
| 4 | LIFT | Stand up with control — no swinging, no impulse |
| 5 | CARRY | Secure the board in a stable carry position |

These 5 words appear in all 4 teaching stages (Explicación, Demostración, Participación, Feedback) as a single unified vocabulary.

**Anchor phrase:** *"Control starts here."*

---

## 4. Why it matters

Three failure modes Grab Board controls:

1. **Back injury** — lifting a 7-9ft soft-top board with rounded back and locked knees produces low-back strain. At scale (5-10 lifts per session), this compounds.
2. **Hitting others** — a board swung up with no control is a blunt object. Grab Board installs spatial awareness from rep 1.
3. **Loss of equipment control** — a poorly gripped board gets blown by wind, dropped, scratched, or lost in the shuffle of a beach entry.

At White Belt the purpose is **habit installation**: the student learns the board is something you control with intention, not something you drag or fight with.

At higher belts the same mechanics scale up to heavier performance boards, longer walk-outs, and crowded lineups. The habit is the same.

---

## 5. Correct technique (biomechanics)

1. **CENTER:** Surfer stands beside the midpoint of the board (visual reference: fins line).
2. **KNEES:** Back stays straight. Knees bend into a shallow squat. Hips stay back.
3. **RAILS:** Both hands make contact with the rails — one closer to nose, one closer to tail — symmetric around center.
4. **LIFT:** Legs do the work. The back stays neutral. The board comes up in one smooth motion.
5. **CARRY:** Board settles into one of two safe carry variants:
   - **Variant A** (flat carry): board comes up flat, supported against the hip with control on the opposite rail.
   - **Variant B** (side carry): fins face outward, nose points forward.

The board is now stable and ready to transition into STP-004 Walk Out.

---

## 6. Coach-student dynamic at White Belt

| Session | Coach role | Student role |
|---|---|---|
| 1 | Demonstrates once. Names every key word aloud. Student watches. | Observes. Asks clarifying questions. |
| 1-2 | Student executes 5-8 reps. Coach corrects **one thing per rep**. | Executes slowly. Accepts correction without adjusting 3 things at once. |
| 3+ | Coach observes silently. Intervenes only on error. | Picks up board unprompted when session starts. |
| Cert WB | Coach confirms 5 consecutive clean reps without correction. | Performs the full sequence fluently. |

**Modo Pedagógico Dominante:** CLÁSICO PURO. There is one correct way. The coach demonstrates; the student repeats. No ecological variation at White Belt level.

---

## 7. Observable success criteria (3)

At the end of Grab Board, the student must be able to:

1. Pick up the board from the ground with correct body position and safe mechanics.
2. Maintain immediate control of the board once lifted (no fumbling, no second-grip correction).
3. Place the board down and repeat the pickup consistently without loss of control.

**Certification:** 5 consecutive clean reps in 2 separate sessions.

---

## 8. Common errors (see ERR-WB-009 to ERR-WB-012)

- **ERR-WB-009** Nose/Tail Grab — grabbing the board from nose or tail instead of rails.
- **ERR-WB-010** Bad Lifting Mechanics — rounded back, locked knees, lumbar lift.
- **ERR-WB-011** One-Hand Handling — asymmetric grip, no center of mass control.
- **ERR-WB-012** Rushed / Swinging Pickup — using momentum instead of control.

---

## 9. Doctrinal framing

Grab Board is the first technical expression of **responsibility for the equipment and for others around you**. It is the first time in TSS that the student is asked to slow down and execute something with intention.

> *"La tabla no se arrastra. No se agarra desde la punta. No se levanta con impulso. Se controla. Desde el primer instante."*

This habit — *control starts before the water* — is the seed of every board-handling skill up through Olympic-level surfing.

---

## 10. Coach cue (anchoring phrase)

> *"Straight back. Bend the knees. Two hands on the rails. Lift with control. Control starts here."*

From session 3+ the student says *"Control starts here."* aloud at the end of each pickup.

---

## 11. Cross-references

| Layer | File |
|---|---|
| Drill | `03_DRILLS_LIBRARY/DRL-WB-03_Grab_Board_Reset_Drill.md` |
| Video script | `05_VIDEO_PRODUCTION/VID-WB-003_Grab_Board_Script_v2.md` |
| Errors | `04_ERROR_DB/ERR-WB-009` → `ERR-WB-012` |
| Coach cheat sheet | `06_Coach_Notes/STP-003_Coach_Cheat_Sheet_v1.md` |
| Coach notes template | `06_Coach_Notes/STP-003_Coach_Notes_Template_v1.md` |
| Excel master | `00_MASTER_REGISTRY/TSS_Belt_Master_Registry_MARCELO.xlsx` |

---

*TSS® White Belt Canon · IP of Marcelo Castellanos / Enkrateia · Humility*
$tss$,
  $tss$# DRL-WB-03 — Grab Board Reset Drill

**Linked Step:** STP-003 Grab Board
**Belt:** White Belt
**Pillar:** Technical
**Version:** v1.0
**Status:** CANONIZED

---

## Objective

Teach the student to pick up the board from the ground safely, with correct body mechanics, proper hand placement on the rails, and immediate control of the board once lifted.

---

## Why this drill matters

Grab Board is the first technical action of every session. It is the moment the student physically engages with the equipment. If installed correctly at White Belt, it prevents:

- Back strain from bad lifting mechanics.
- Accidental contact with other people at the beach.
- Loss of board control due to wind, poor grip, or imbalance.
- Building the bad habit of treating the board as disposable.

---

## Coach role

- Demonstrates first. At White Belt the student must not guess.
- Names the 5 key words aloud during the demo.
- After the demo, corrects **one thing at a time** — never stacks corrections.
- Tolerates no shortcuts. The drill cadence is deliberate.

---

## KEY WORDS CHAIN

```
CENTER → KNEES → RAILS → LIFT → CARRY
```

Same 5 words through Explicación, Demostración, Participación, Feedback.

---

## Setup

- **Location:** sand (preferred) or clean floor. Never rocks, gravel, or wet cement.
- **Equipment:** one surfboard per student (White Belt = soft-top 7-9ft).
- **Spacing:** minimum 2m between students to prevent collisions during reps.
- **Time:** 5-8 min total.
- **Moment in session:** after STP-001 Venue Analysis + STP-002 Warm Up, before STP-004 Walk Out.

---

## Step-by-step

### Rep 1 — CENTER

Board rests flat on the ground. Student stands beside the midpoint (visual reference: fins line). Coach confirms position: *"CENTER. Estás al medio."*

### Rep 2 — KNEES

Student bends knees, keeps back straight. Coach confirms posture: *"KNEES. Espalda recta. Rodillas abajo."*

### Rep 3 — RAILS

Student places both hands on the rails, symmetric around center. One hand slightly toward nose, one slightly toward tail. Coach confirms: *"RAILS. Dos manos. Simétrico."*

### Rep 4 — LIFT

Student stands up using legs. Back stays neutral. Board comes up smooth, no swinging, no impulse. Coach confirms: *"LIFT. Controlado. Sin impulso."*

### Rep 5 — CARRY

Student settles board into a safe carry position (Variant A flat or Variant B side). Board is stable. Student can pause without losing it. Coach confirms: *"CARRY. Estable. Controlada."*

### Reset

Student places board down with the same control (reverse sequence). Repeat.

---

## Repetitions

**5 to 8 clean reps per session.**

- Session 1: 8 reps, slow tempo, 1 correction per rep max.
- Session 2: 6 reps, coach observes, intervenes only on error.
- Session 3+: 5 reps, student initiates without prompt.

---

## What the coach observes

| Observable | Clean | Error code |
|---|---|---|
| Student stands beside center | Yes | ERR-WB-009 if off-center |
| Knees bend, back neutral | Yes | ERR-WB-010 if rounded back or locked knees |
| Two hands on rails | Yes | ERR-WB-011 if one-hand or on nose/tail |
| Lift is smooth, no impulse | Yes | ERR-WB-012 if swinging |
| Board stable in carry | Yes | Fail all 3 criteria → repeat drill |

---

## Success criteria (3)

The drill is successful when the student:

1. Picks up the board from the ground with safe body mechanics.
2. Brings the board into a controlled carry position without fumbling or second-grip correction.
3. Can place the board back down and repeat the pickup consistently across 5 reps.

**Pass = all 3 observed in one session. Certification = 2 consecutive sessions passed.**

---

## Variations (for engagement across sessions)

- **Reset cadence:** vary tempo — slow reps, normal reps, paused reps (student freezes mid-lift and holds).
- **Partner drill (session 3+):** two students lift simultaneously side by side. Coach checks both for timing and spacing safety.
- **Eyes-on-environment:** from session 3+, student maintains visual scan of surroundings while lifting — installs spatial awareness.

The core 5-key-word sequence never changes. Only tempo and context vary.

---

## What this drill does NOT teach

- Walking with the board (that is STP-004 Walk Out).
- Nose-angle for whitewater entry (that is STP-006/007).
- Passing whitewater (that is STP-007).
- Any handling once the board is in the water.

If the student asks about these topics during the drill, the coach acknowledges and defers: *"Eso viene después. Ahora: CENTER. KNEES. RAILS. LIFT. CARRY."*

---

## Closing cue

At end of drill (session 3+):

> *"Control starts here."*

Student repeats aloud. Then transition to STP-004 Walk Out.

---

## Related

- Step: `STP-003_Description_v1.md`
- Video: `VID-WB-003_Grab_Board_Script_v2.md`
- Errors: `ERR-WB-009` to `ERR-WB-012`
- Cheat sheet: `STP-003_Coach_Cheat_Sheet_v1.md`

---

*TSS® Drill Library · IP of Marcelo Castellanos / Enkrateia · White Belt*
$tss$,
  $tss$### ERR-WB-009 — Nose / Tail Grab

The student picks up the board by grabbing it from the **nose** (front tip) or the **tail** (back end) instead of the **rails** (side edges). This produces an unbalanced lift.

### ERR-WB-010 — Bad Lifting Mechanics

The student lifts the board using the lower back instead of the legs. Two main expressions:

- **Rounded back:** spine curved, shoulders in front of hips, lift initiated by spinal extension.

### ERR-WB-011 — One-Hand Handling

The student picks up the board using only one hand. The board is lifted asymmetrically — typically by a single rail grab near the center, while the other hand hangs, points, or holds something else (a water bottle, a coffee, a phone).

### ERR-WB-012 — Rushed / Swinging Pickup

The student uses **momentum** instead of **controlled strength** to lift the board. The pickup is fast, impulsive, and the board ends up swinging through the air before settling.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-002']::TEXT[],
  'reading',
  24
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-004',
  'white_belt',
  4,
  $tss$Walk Out$tss$,
  NULL,
  $tss$Technical$tss$,
  $tss$# STP-004 — WALK OUT

**Belt:** White Belt
**Pillar:** Technical
**Block:** 1 (Foundation)
**Sequence:** 1 (introduced) / mastered at White Belt
**Canonical source:** Marcelo Castellanos, 2026-04-11
**Version:** Description v1.0 (Nivel 2, standalone)

---

## 1. QUÉ ES

Walk Out es la transición física desde la arena hasta el agua, con la tabla ya en posición de carry. El alumno pasa de "tabla en manos, parado en tierra" (final de STP-003) a "tabla apoyándose en el agua, listo para lo siguiente" (inicio de STP-005). Es el puente entre tierra y océano.

No es caminar rápido con la tabla. No es mojar los pies. Es la **instalación del primer patrón de entrada consciente** al océano: ritmo calmo, lectura del entorno, protección del cuerpo, decisión del momento correcto para colocar la tabla.

## 2. POR QUÉ IMPORTA

Porque el océano castiga la prisa. Un alumno que rompe el patrón Walk Out en White Belt repite ese patrón en toda su carrera: entra al agua apurado, no lee el fondo, no lee las olas, coloca la tabla antes de tiempo, y sobre todo — olvida la regla que más lesiones causa en entrada: **nunca la tabla entre el cuerpo y la ola**.

Walk Out no construye técnica de surf. Construye el **protocolo de seguridad de entrada** que el alumno usará miles de veces durante décadas. Es una pieza de **IP de seguridad pura**.

## 3. BOUNDARY (crítica)

- **EMPIEZA:** el primer paso del alumno hacia el agua, con la tabla ya en posición de carry (hereda del final de STP-003).
- **TERMINA:** el momento en que la tabla toca el agua.
- **NO incluye:**
  - Levantar la tabla del piso (eso es STP-003 Grab Board).
  - Colocar la tabla correctamente en el agua y orientarla (eso es STP-005 Put Board in Water).
  - Pasar por whitewater con la tabla ya flotando (eso es STP-007 Go Through Whitewater Standing).
- **VERSIÓN WHITE BELT = SAND ENTRY CANÓNICA.** Rocks/reef se documentan como nota metodológica de progresión futura, NO son parte del core White Belt.

## 4. KEY WORDS CHAIN (5 en orden)

**PATIENCE → DRAG → SIDE → FACE → PLACE**

| # | Key Word | Qué significa |
|---|---|---|
| 1 | **PATIENCE** | No apurarse. Leer las olas, leer la corriente, leer el timing. Respirar. |
| 2 | **DRAG** | Arrastrar los pies sobre la arena. Awareness del fondo. No tropezar. No patear arena. |
| 3 | **SIDE** | La tabla SIEMPRE al costado del cuerpo. NUNCA entre el surfer y la ola. |
| 4 | **FACE** | Mirar la ola entrante. Nunca darle la espalda al océano. |
| 5 | **PLACE** | Colocar la tabla en el agua solo cuando hay profundidad suficiente para que flote libre. |

**Anchor phrase:** *"We enter with awareness, not with hurry."*
**Micro-cue de transición:** *"Ocean first, board second."*

## 5. HARD-LINE RULE (no-negociable)

**La tabla nunca, bajo ninguna circunstancia, debe estar entre el cuerpo del surfer y la ola entrante.**

Razón física: si la ola entrante impacta primero a la tabla, la nariz puede ser clavada hacia atrás contra el cuerpo del alumno (pecho, cara, plexo). Es la causa #1 de lesiones durante entrada al agua en surfing beginner.

**Regla operativa:** si el coach observa `ERR-WB-014` (board between body and wave) durante el drill, detiene todo, resetea al alumno, el rep NO cuenta. Sin excepción. Sin "casi bien". Sin flexibilización en progresión ecológica.

Esta es la **segunda hard-line rule** del White Belt después de `ERR-WB-010` (Bad Lifting Mechanics en STP-003).

## 6. SUCCESS INDICATORS

1. El alumno entra al agua calmo, sin apurar, con ritmo leíble.
2. Arrastra los pies sobre la arena (no pisa a ciegas).
3. Mantiene la tabla al costado del cuerpo durante toda la entrada.
4. Mira las olas entrantes (no gira espalda al océano).
5. Coloca la tabla en el agua solo cuando la profundidad lo permite (no la fuerza con poca agua).

## 7. COMMON ERRORS (Nivel 2 — 4 cards)

| ID | Error | Severity |
|---|---|---|
| `ERR-WB-013` | Rushed Entry (entrar apurado, sin leer) | HIGH |
| `ERR-WB-014` | Board Between Body and Wave | **CRITICAL — hard-line** |
| `ERR-WB-015` | No Feet Drag (pisar sin awareness del fondo) | MEDIUM |
| `ERR-WB-016` | Early Board Placement (colocar con poca agua) | MEDIUM-HIGH |

## 8. COACH CUE (v2 refined)

> **PATIENCE. DRAG. SIDE. FACE. PLACE. Ocean first, board second.**

## 9. CERTIFICATION CRITERIA

Walk Out está certificado cuando el alumno completa **5 entradas limpias consecutivas** (5 de 5 key words ejecutados correctamente, ningún ERR-WB-014 observado) en **2 sesiones separadas**.

## 10. DERIVATIVES / ARTIFACT LINKS

- **Drill standalone:** `DRL-WB-04_Walk_Out_Sand_Entry_Drill.md`
- **Video script v2:** `VID-WB-004_Walk_Out_Script_v2.md`
- **Error DB cards:** `ERR-WB-013` / `ERR-WB-014` / `ERR-WB-015` / `ERR-WB-016`
- **Coach tools:** `STP-004_Coach_Cheat_Sheet_v1.md` / `STP-004_Coach_Notes_Template_v1.md`

---

*TSS® White Belt · Humility · Step 4 of foundational block*
*IP of Marcelo Castellanos / Enkrateia · Tested & refined at Puro Surf*
$tss$,
  $tss$# DRL-WB-04 — WALK OUT SAND ENTRY DRILL

**Parent step:** STP-004 Walk Out
**Belt:** White Belt
**Version:** v1.0 (Nivel 2, standalone)
**Reps target:** 5–8 entradas limpias
**Duration:** 10–15 minutos
**Environment:** Playa de arena, olas pequeñas (White Belt canonical)

---

## 1. OBJECTIVE

Instalar el patrón de entrada segura al océano: ritmo calmo, arrastre de pies, tabla al costado, cara hacia la ola, colocación de tabla con profundidad suficiente. Construir memoria muscular de la **hard-line rule**: tabla nunca entre cuerpo y ola.

## 2. PREREQUISITES

- STP-001 Venue Analysis ejecutado (alumno leyó el spot).
- STP-002 Warm Up completado (cuerpo y mente listos).
- STP-003 Grab Board certificado (5 reps consecutivos limpios) → alumno llega con tabla en carry correcto.

**Si alguno falla: NO iniciar el drill.** Walk Out depende del carry limpio de STP-003.

## 3. SETUP

- **Ubicación:** línea de shoreline del spot analizado. Alumno parado en arena seca, tabla en posición de carry.
- **Coach position:** al costado del alumno, del lado del océano (no bloqueando), observando vista lateral + vista trasera.
- **Ratio coach:alumno:** máximo 1:2. Preferible 1:1 en sesiones 1-2.
- **Condición:** agua calma a whitewater pequeño. Max 1.0m de altura de ola. No drill con sets irregulares o corriente fuerte.
- **Equipment check:** sin objetos en las manos del alumno. Tabla en carry limpio (heredado de STP-003).

## 4. COACH DEMO (antes de participación)

Coach demuestra **una entrada completa** en tempo lento, verbalizando cada key word:

1. **"PATIENCE"** — coach se detiene en la línea de la arena mojada, mira el horizonte, espera pausa entre olas.
2. **"DRAG"** — coach da primer paso arrastrando el pie, luego el otro.
3. **"SIDE"** — coach mantiene tabla visible al costado (si alumno observa desde atrás, tabla nunca desaparece del flanco del coach).
4. **"FACE"** — coach mantiene torso rotado hacia la ola entrante, nunca gira completamente.
5. **"PLACE"** — coach camina hasta profundidad muslo/cadera, flexiona rodillas, coloca tabla suavemente en el agua con ambas manos (entrega a STP-005).

Luego segunda demo en tempo normal. Alumno observa 2 veces antes de ejecutar.

## 5. 5-BEAT CADENCE (cada rep)

| Beat | Key Word | Observable por coach |
|---|---|---|
| 1 | **PATIENCE** | Alumno se detiene en línea de arena. Respira. Mira el océano. No avanza antes de 2-3 segundos de lectura. |
| 2 | **DRAG** | Primer paso al agua: pie arrastra, no levanta. Siguiente paso igual. |
| 3 | **SIDE** | Tabla visible al costado durante todos los pasos. Ningún momento entre cuerpo y ola. |
| 4 | **FACE** | Torso orientado al whitewater. No da espalda al océano. |
| 5 | **PLACE** | Alumno llega a profundidad correcta (muslo/cadera mínimo). Flexiona rodillas. Coloca tabla con ambas manos. Tabla flota libre. |

**Si cualquier beat falla → rep se detiene, coach corrige, alumno reset, empieza de nuevo.**

## 6. SEQUENCE (5–8 reps)

**Rep 1–2:** coach acompaña al alumno paso a paso, verbalizando cada key word en voz alta. Tempo lento.

**Rep 3–4:** coach verbaliza solo las key words críticas (SIDE, PLACE). Alumno ejecuta el resto.

**Rep 5–6:** alumno verbaliza las 5 key words mientras ejecuta. Coach corrige solo si aparece red flag.

**Rep 7–8 (si llega):** alumno ejecuta en silencio. Coach observa desde 3-4 metros. Evalúa fluidez.

**Descanso entre reps:** salir del agua, volver a la arena, resetear. Uso de este tiempo para corrección verbal breve (1 idea por rep).

## 7. RED FLAGS → ERRORS

| Observación | Error activado | Acción del coach |
|---|---|---|
| Alumno avanza sin pausa / respiración | `ERR-WB-013` Rushed Entry | "Para. Respirá. Mirá el océano primero." |
| Tabla pasa entre cuerpo y ola entrante | `ERR-WB-014` Board Between Body and Wave | **STOP inmediato. Reset. Rep no cuenta. Hard-line rule.** |
| Pie se levanta entre pasos, choca con algo, arena salta | `ERR-WB-015` No Feet Drag | "Arrastrá. No levantes." |
| Alumno intenta colocar tabla con agua a la rodilla o menos | `ERR-WB-016` Early Board Placement | "Esperá. Más profundidad. Muslo mínimo." |

## 8. PASS / NOT PASS CRITERIA

**PASS DE SESIÓN:**
- 5 entradas consecutivas limpias (5/5 key words ejecutados, ningún ERR-WB-014).
- Alumno mantuvo patience en cada entrada (no se apuró ni una vez).
- Alumno colocó tabla con profundidad correcta en todas las entradas.

**NOT PASS:**
- Aparición de ERR-WB-014 (hard-line). Sesión se puede continuar, pero no cuenta para certificación.
- Más de 2 ERR-WB-013 en la sesión → alumno está emocionalmente apurado, coach revisa contexto antes de seguir.

**CERTIFICACIÓN STP-004:** pass de sesión en **2 sesiones separadas**.

## 9. ADAPTATIONS

**Niños:** entrada a caballito imposible en White Belt canónica. Variante "drill en agua muy somera" hasta que el niño maneje el carry. Tabla más pequeña. Coach al lado literal, no al frente.

**Adultos mayores o con movilidad reducida:** coach reduce distancia a caminar (entrada más corta). Si el arrastre de pies es doloroso, variante "paso corto con pisada completa" — se pierde un poco de awareness del fondo pero se gana estabilidad.

**Condiciones con corriente lateral:** coach debe corregir el path (alumno tenderá a ser empujado hacia un costado). No se practica con corriente fuerte en White Belt.

**Condiciones con viento fuerte frontal:** la tabla actúa como vela y pierde posición. Pedir al alumno que baje la altura de la tabla (más pegada al cuerpo) y se incline levemente hacia adelante.

## 10. CLOSING RITUAL

Al final del último rep limpio, alumno dice en voz alta (sesión 3+):

> *"Ocean first, board second."*

Transición: alumno permanece en posición PLACE con tabla flotando, esperando prompt del coach para STP-005 Put Board in Water.

---

*TSS® Drill Library · DRL-WB-04*
*IP of Marcelo Castellanos / Enkrateia · White Belt · Humility*
$tss$,
  $tss$### ERR-WB-013 — RUSHED ENTRY

El alumno llega a la orilla y avanza hacia el agua sin pausa, sin respirar, sin mirar el océano. Camina con cadencia acelerada, no arrastra los pies correctamente, la tabla se mueve con el cuerpo, el torso se inclina hacia adelante, no lee el set entrante.

### ERR-WB-014 — BOARD BETWEEN BODY AND WAVE

Esta es la **segunda hard-line rule** del White Belt (la primera es `ERR-WB-010` Bad Lifting Mechanics en STP-003). "Hard-line" significa: **no se flexibiliza nunca, en ninguna progresión, por ningún coach, para ningún alumno**.

### ERR-WB-015 — NO FEET DRAG

El alumno entra al agua levantando los pies al caminar (marcha normal de tierra) en vez de arrastrarlos sobre el fondo. Cada paso implica levantar completamente el pie, moverlo hacia adelante, y apoyarlo.

### ERR-WB-016 — EARLY BOARD PLACEMENT

El alumno coloca la tabla en el agua antes de llegar a profundidad suficiente para que la tabla flote libremente. La tabla toca fondo, se engancha, se inclina, o queda apoyada con la quilla/aletas en la arena.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-003']::TEXT[],
  'reading',
  25
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-005',
  'white_belt',
  5,
  $tss$Put Board in the Water$tss$,
  NULL,
  $tss$Technical$tss$,
  $tss$# STP-005 — PUT BOARD IN THE WATER

**Belt:** White Belt
**Pillar:** Technical
**Block:** 1 (Foundation)
**Sequence:** 1 (introduced) / mastered at White Belt
**Canonical source:** Marcelo Castellanos
**Version:** Description v1.0 (Nivel 2, standalone)

---

## 1. QUÉ ES

Put Board in the Water es el paso donde el alumno coloca la tabla en el agua al momento correcto y a la profundidad correcta. Es un paso corto (15-30 segundos), mecánicamente simple, pero pedagógicamente crítico: es el **handoff** del transporte al control. La tabla deja de estar en tus brazos y empieza a estar en el agua — pero todavía bajo tu control.

No es "soltar la tabla". No es "ponerla en el agua y seguir". Es la **entrega calma y controlada** del equipo al océano, con el alumno manteniendo un punto de contacto permanente.

## 2. POR QUÉ IMPORTA

Porque el momento de colocar la tabla es donde más errores mecánicos se cometen en los primeros 90 segundos de una sesión. Si la tabla se coloca con poca agua → se raya el bottom, se dañan quillas, la tabla no sienta plana. Si se "suelta" en lugar de colocarla → la corriente o viento la lleva, o golpea al alumno. Si se mezclan controles (alumno empieza a manejar la tabla antes de soltar el carry) → cadena de errores en STP-006.

Put Board in Water es el paso que asegura que **STP-006 Control Your Board** arranque desde una posición limpia. Si este paso falla, los 19 pasos siguientes del White Belt heredan desorden.

## 3. BOUNDARY (crítica)

- **EMPIEZA:** el alumno ha completado STP-004 Walk Out, está parado en profundidad mínima waist (cintura), la tabla todavía en posición de carry.
- **TERMINA:** la tabla está en el agua, plana, flotando libre, con el alumno manteniendo contacto con el rail (listo para STP-006).
- **NO incluye:**
  - Llegar a profundidad waist (eso es STP-004 Walk Out).
  - Posicionamiento de manos para control de la tabla (eso es STP-006 Control Your Board).
  - Pasar whitewater (eso es STP-007).

**Cross-reference crítico:** este paso depende 100% del correcto cierre de STP-004. Si STP-004 no está certificado, no se trabaja STP-005 aislado. En entrenamiento continuo, STP-004 + STP-005 se ejecutan encadenados.

## 4. KEY WORDS CHAIN (5 en orden)

**DEPTH → PAUSE → LOWER → RELEASE → READY**

| # | Key Word | Qué significa |
|---|---|---|
| 1 | **DEPTH** | Confirmar agua a la cintura. No rodilla. No muslo. Waist. |
| 2 | **PAUSE** | Detenerse un beat. Respirar. Confirmar que el entorno está listo (set entrante, ausencia de bañistas próximos). |
| 3 | **LOWER** | Bajar la tabla con ambas manos, controlado, flexionando rodillas. No lanzar. No dejar caer. |
| 4 | **RELEASE** | Soltar el peso de la tabla al agua, pero MANTENER al menos una mano en el rail. La tabla no queda nunca sin contacto. |
| 5 | **READY** | Tabla flotando plana, alumno con contacto permanente en el rail, pronto para STP-006. |

**Anchor phrase:** *"Water tells you when. The board asks for control."*
**Micro-cue de transición:** *"Waist first. Control always."*

## 5. REGLA OPERATIVA (no-hard-line pero firme)

**La tabla nunca queda sin contacto del alumno entre el momento de LOWER y el momento de transición a STP-006.**

Esto NO es una hard-line rule como ERR-WB-010 o ERR-WB-014 (no hay riesgo físico al cuerpo del alumno si se viola). Pero sí es una **regla firme de control**: si el alumno suelta completamente la tabla, pierde el equipo al viento/corriente y gasta 2-3 minutos recuperándolo, interrumpiendo la sesión. Es un error recuperable pero caro.

## 6. SUCCESS INDICATORS

1. El alumno colocó la tabla solo cuando el agua llegó a la cintura (no antes).
2. El alumno bajó la tabla con control (ambas manos, rodillas flexionadas, movimiento suave).
3. La tabla entró al agua plana, sin torcerse ni cabecearse.
4. El alumno mantuvo al menos una mano en el rail durante todo el RELEASE.
5. El alumno quedó en posición READY (listo para STP-006) sin fumbling ni corrección.

## 7. COMMON ERRORS (Nivel 2 — 3 cards, diseño limpio)

| ID | Error | Severity |
|---|---|---|
| `ERR-WB-017` | Dropped Board (suelta con altura, cae al agua) | HIGH |
| `ERR-WB-018` | Let Go Completely (suelta sin mantener contacto, corriente/viento la lleva) | HIGH |
| `ERR-WB-019` | Mixed Control Cues (empieza a manejar la tabla antes de soltar carry, invade STP-006) | MEDIUM |

**Nota cross-step:** para errores de "colocar con poca agua" en contexto de Walk Out, ver `ERR-WB-016` (Early Board Placement, parent error en STP-004). En STP-005 asumimos que el alumno llegó correctamente a waist; si no, el error es de Walk Out, no de Put Board in Water.

## 8. COACH CUE (v2 refined)

> **DEPTH. PAUSE. LOWER. RELEASE. READY. Water tells you when.**

## 9. CERTIFICATION CRITERIA

STP-005 está certificado cuando el alumno completa **5 colocaciones limpias consecutivas** (5/5 key words ejecutados, 0 errores) en **2 sesiones separadas**. Dado que el paso es corto, las 5 reps pueden ejecutarse encadenadas con 5 Walk Outs previos (modo continuo STP-004 + STP-005).

## 10. DERIVATIVES / ARTIFACT LINKS

- **Drill standalone:** `DRL-WB-05_Waist_Deep_Placement_Drill.md`
- **Video script v2:** `VID-WB-005_Put_Board_Water_Script_v2.md`
- **Error DB cards:** `ERR-WB-017` / `ERR-WB-018` / `ERR-WB-019`
- **Parent error referenced:** `ERR-WB-016` (de STP-004)
- **Coach tools:** `STP-005_Coach_Cheat_Sheet_v1.md` / `STP-005_Coach_Notes_Template_v1.md`

---

*TSS® White Belt · Humility · Step 5 of foundational block*
*IP of Marcelo Castellanos / Enkrateia · Tested & refined at Puro Surf*
$tss$,
  $tss$# DRL-WB-05 — WAIST-DEEP PLACEMENT DRILL

**Parent step:** STP-005 Put Board in the Water
**Belt:** White Belt
**Version:** v1.0 (Nivel 2, standalone)
**Reps target:** 5–8 colocaciones limpias
**Duration:** 8–12 minutos (drill corto por diseño)
**Environment:** Playa de arena, agua a waist-deep, olas pequeñas

---

## 1. OBJECTIVE

Instalar el patrón del handoff del carry al control: confirmación de profundidad, pausa de lectura, bajada controlada con ambas manos, release parcial manteniendo contacto, posición READY.

## 2. PREREQUISITES

- STP-001 Venue Analysis ejecutado.
- STP-002 Warm Up completado.
- STP-003 Grab Board certificado.
- **STP-004 Walk Out certificado** (o al menos pass de sesión 1) — este drill depende del cierre limpio de Walk Out.

**Modalidad recomendada:** ejecutar STP-004 + STP-005 encadenados. El alumno hace Walk Out, cierra en posición PLACE (profundidad correcta), y continúa inmediatamente a DEPTH→PAUSE→LOWER→RELEASE→READY. Esto refuerza la continuidad del sistema.

## 3. SETUP

- **Ubicación:** agua a waist del alumno. En spots de pendiente suave, esto puede ser 6-10 metros desde la orilla.
- **Coach position:** al costado del alumno, del lado del océano, a 1-1.5m de distancia. Vista lateral del alumno clara.
- **Ratio coach:alumno:** máximo 1:2. Preferible 1:1 en sesiones 1-2.
- **Condición:** agua calma o whitewater pequeño. No drill con set irregular o corriente fuerte.

## 4. COACH DEMO (antes de participación)

Coach demuestra **2 colocaciones completas**, verbalizando cada key word:

1. **"DEPTH"** — coach confirma con mano en la cintura: "acá. Waist."
2. **"PAUSE"** — coach detiene, respira audible, mira horizonte 1-2 segundos.
3. **"LOWER"** — coach flexiona rodillas, baja la tabla con ambas manos, movimiento suave y visible.
4. **"RELEASE"** — coach apoya la tabla en el agua, suelta el peso pero MANTIENE una mano en el rail (bien visible).
5. **"READY"** — tabla flota plana al lado del coach, mano en rail, coach mira al alumno: "listo para STP-006."

Coach además demuestra **EL ERROR** (versión instructiva):
- Coloca la tabla desde altura (simulando ERR-WB-017 Dropped Board): se ve el splash y el rebote.
- Suelta completamente (simulando ERR-WB-018): tabla se aleja con la corriente.
- Coach verbaliza: "Así NO." Luego ejecuta correctamente.

## 5. 5-BEAT CADENCE (cada rep)

| Beat | Key Word | Observable por coach |
|---|---|---|
| 1 | **DEPTH** | Alumno confirma con pose/voz que el agua le llega a la cintura. |
| 2 | **PAUSE** | Alumno se detiene 1-2 seg, respira visible, mira horizonte. No acelera. |
| 3 | **LOWER** | Alumno baja tabla con ambas manos, flexiona rodillas. Movimiento continuo, no staccato. |
| 4 | **RELEASE** | Tabla hace contacto con agua, alumno deja de cargar peso, PERO una mano permanece en el rail. Tabla flota plana. |
| 5 | **READY** | Posición final: alumno al costado de la tabla, una mano en rail, tabla plana, listo para next step. |

**Si cualquier beat falla → rep no cuenta, coach corrige, alumno resetea desde DEPTH.**

## 6. SEQUENCE (5–8 reps)

**Modalidad encadenada (recomendada):**

Cada rep incluye Walk Out + Put Board in Water continuo. Alumno sale del agua a la orilla, retoma tabla en carry, ejecuta Walk Out, encadena con Put Board in Water. Esto simula la ejecución real.

**Rep 1-2:** coach verbaliza las 5 key words durante el PBW. Tempo lento.

**Rep 3-4:** coach verbaliza solo RELEASE y READY (las más críticas). Alumno ejecuta el resto.

**Rep 5-6:** alumno verbaliza las 5 key words mientras ejecuta.

**Rep 7-8 (si llega):** alumno ejecuta en silencio, coach observa a 2-3m.

**Descanso entre reps:** salir del agua, caminar a la orilla, resetear. 1 idea de corrección por rep máximo.

## 7. RED FLAGS → ERRORS

| Observación | Error | Acción del coach |
|---|---|---|
| Tabla baja de más de 30 cm de altura, splash pronunciado | `ERR-WB-017` Dropped Board | "Más cerca del agua. Las rodillas trabajan." |
| Alumno suelta la tabla después de colocarla, sin mantener mano en rail | `ERR-WB-018` Let Go Completely | "Mano en el rail. Siempre. La tabla no se va sola." |
| Alumno intenta orientar/posicionar la tabla antes de soltar el carry | `ERR-WB-019` Mixed Control Cues | "Una cosa a la vez. Primero soltás. Después controlás." |
| Alumno coloca con agua a la rodilla/muslo (no waist) | `ERR-WB-016` (parent de STP-004) | "Más adentro. Waist." Rep no cuenta. |

## 8. PASS / NOT PASS CRITERIA

**PASS DE SESIÓN:**
- 5 colocaciones consecutivas limpias (5/5 key words).
- Ningún ERR-WB-017 o ERR-WB-018.
- READY position consistente: mano en rail, tabla plana.

**NOT PASS:**
- Más de 1 ERR-WB-017 o ERR-WB-018 en la sesión.
- Alumno no logra mantener contacto con rail (patrón recurrente).

**CERTIFICACIÓN STP-005:** 2 sesiones PASS separadas.

## 9. ADAPTATIONS

**Alumnos bajos (niños / baja estatura):** "waist" es relativo. Coach ajusta al cuerpo del alumno, no a altura absoluta.

**Alumnos con limitación de flexión de rodilla:** LOWER se ejecuta con flexión parcial + más pasos hacia adelante para acercar la tabla al agua. Se pierde estética pero se mantiene control.

**Condiciones con corriente lateral:** el RELEASE debe ejecutarse con el alumno posicionado "río arriba" de la corriente, para que la tabla tienda a volver al cuerpo, no alejarse. Ajuste de posicionamiento pre-drill.

**Condiciones con viento:** tabla ligera con viento fuerte puede levantarse. En esas condiciones, RELEASE se ejecuta con DOS manos en el rail (no una sola). Excepción autorizada.

**Tabla pesada (soft top largo 9'+):** LOWER requiere más esfuerzo de rodillas. Alumno puede pedir ayuda al coach en rep 1 para sentir el peso correcto.

## 10. CLOSING RITUAL

Al final del último rep limpio, alumno en posición READY (mano en rail, tabla flotando plana) dice en voz alta (sesión 3+):

> *"Water tells you when. The board asks for control."*

Transición: alumno queda en READY, listo para prompt del coach para STP-006 Control Your Board.

---

*TSS® Drill Library · DRL-WB-05*
*IP of Marcelo Castellanos / Enkrateia · White Belt · Humility*
$tss$,
  $tss$### ERR-WB-017 — DROPPED BOARD

El alumno, en lugar de bajar la tabla al agua con ambas manos flexionando rodillas, la deja caer desde una altura mayor a 15-20 cm sobre la superficie. La tabla hace splash pronunciado, rebota, y pierde la posición plana de entrada.

### ERR-WB-018 — LET GO COMPLETELY

Tras colocar la tabla en el agua (LOWER ejecutado), el alumno suelta completamente la tabla — deja de tener contacto con el rail, la tabla queda sola en el agua. La corriente, el viento, o la siguiente onda se la llevan.

### ERR-WB-019 — MIXED CONTROL CUES

El alumno, durante LOWER o RELEASE, empieza a "manejar" la tabla antes de completar el paso — intenta orientar la punta hacia la ola, posicionar la tabla para subirse, o aplicar maniobras que pertenecen a STP-006 Control Your Board.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-004']::TEXT[],
  'reading',
  26
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-006',
  'white_belt',
  6,
  $tss$Control Your Board$tss$,
  NULL,
  $tss$Block 1 (Board Handling)$tss$,
  $tss$# STP-006 — CONTROL YOUR BOARD

**Belt:** White Belt · Block 1 (Board Handling)
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Establecer el **control inmediato** de la tabla desde el segundo en que entra al agua. Este paso instala la relación mecánica permanente entre el cuerpo del surfista y la tabla: posición de manos, posición lateral del cuerpo, y conciencia constante de dónde está la tabla en relación al cuerpo y a la ola entrante.

Control Your Board es el paso donde la tabla pasa de ser "equipo que cargás" a ser "equipo que controlás". No hay transición al agua sin control. No hay siguiente paso sin control. El control empieza en el instante mismo en que la tabla toca el agua.

---

## THE 5 KEY WORDS

**TAIL · CENTER · SIDE · PRESS · PIVOT**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **TAIL** | Mano en el tail | Una mano clara sobre el tail, dedos agarrando la cola de la tabla |
| 2 | **CENTER** | Mano cerca del centro | Otra mano a la altura del centro/mid-board, estabilizando |
| 3 | **SIDE** | Tabla al costado del cuerpo | Tabla pegada al costado del surfista, nunca al frente |
| 4 | **PRESS** | Presión activa en el tail | Mano del tail ejerce presión descendente, genera apalancamiento |
| 5 | **PIVOT** | Tabla redirige bajo control | Con PRESS activo, la tabla gira/reorienta sin perder posición lateral |

---

## ANCHOR PHRASE

> **"Tail controls. Center stabilizes. The board is known."**

**Micro-cue:** *"Control is mechanical, not accidental."*

---

## WHY THIS STEP MATTERS

**Mecánica real de la tabla:**
La tabla está diseñada para responder a **apalancamiento**, no a fuerza bruta. Agarrar rails o nose es pelear con la tabla. Usar tail (apalancamiento) + center (estabilidad) es trabajar CON la tabla. La diferencia entre agarrar y controlar es esta mecánica.

**Safety foundational:**
Una tabla descontrolada al costado es manejable. Una tabla descontrolada al frente del cuerpo es un proyectil hacia el surfista. La regla "board al side, nunca al frente, nunca entre cuerpo y foam" es **non-negotiable** y se conecta directamente con la hard-line rule de STP-004 (ERR-WB-014).

**Base de todo board handling futuro:**
STP-007 (pasar whitewater), STP-008 (turn around), STP-009 (walk back) — todos dependen de que el alumno tenga control instalado. Si STP-006 no está sólido, los pasos siguientes arrancan desde posición débil.

**Distinción White Belt:**
Un alumno que puede controlar la tabla con tail + center sin ser instruido rep por rep ha pasado de "someone who holds a board" a "someone who operates a board". Este es el umbral técnico de White Belt.

---

## BOUNDARY BOX

✅ **EMPIEZA:** inmediatamente después de que la tabla toca el agua (cierre de STP-005 Put Board in the Water, READY position).

✅ **TERMINA:** cuando la tabla está bajo control estable al costado del cuerpo, con TAIL + CENTER instalados y PRESS demostrado al menos una vez, listo para pasar a STP-007.

❌ **NO incluye:**
- Pasar whitewater (STP-007)
- Turn around (STP-008)
- Walk back (STP-009)
- Técnicas de grip en rails o nose
- Subirse a la tabla

**Cross-step dependency:**
- STP-005 debe estar certificado (mano en rail desde el RELEASE) antes de entrar a STP-006.
- ERR-WB-014 (hard-line: board entre cuerpo y ola) aplica aquí también y se hace visible por primera vez en el agua.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-006 en dos sesiones PASS:

1. **Hand placement automático:** TAIL + CENTER sin que el coach tenga que corregir.
2. **Board at side permanente:** tabla nunca al frente ni entre cuerpo y foam, aunque el alumno esté hablando, ajustándose, o mirando la ola.
3. **PRESS consciente:** alumno demuestra presión descendente en tail y puede verbalizar "estoy presionando acá para girarla".
4. **PIVOT bajo control:** alumno ejecuta un pivote izquierda-derecha sin perder posición lateral ni control de manos.
5. **Awareness verbal:** alumno puede responder "¿dónde está tu tabla?" sin mirar.

---

## COACHING PRINCIPLE

El coach que enseña STP-006 debe **mostrar primero los grips incorrectos** (rails, nose) y explicar por qué no funcionan. El alumno tiene que entender que no es un tema de "regla arbitraria" — es mecánica de la tabla. Si el alumno entiende la mecánica, el grip correcto se instala porque tiene sentido, no porque el coach lo impuso.

---

*TSS® White Belt · STP-006 Control Your Board v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-06 — TAIL & CENTER CONTROL DRILL

**Parent Step:** STP-006 Control Your Board
**Belt:** White Belt · Block 1
**Version:** v1.0
**Format:** Standalone drill (post-placement, pre-whitewater)

---

## OBJECTIVE

Instalar el patrón muscular de control inmediato de la tabla desde el momento en que toca el agua, usando la mecánica correcta (TAIL + CENTER) y la posición lateral permanente, sin que el alumno recurra a grips intuitivos erróneos (rails, nose, grip aleatorio).

---

## WHY THIS DRILL

La tabla está diseñada para responder a apalancamiento. La mayoría de alumnos no conocen esta mecánica y agarran por instinto — lo que les funciona en tierra (tomar un objeto por los bordes) falla en el agua. Este drill repite la posición correcta hasta que deja de requerir pensamiento consciente.

Además, la posición lateral (board at side) debe convertirse en default. Un alumno que tiene que recordar "no ponerla al frente" todavía no tiene el hábito — el drill lo instala.

---

## PREREQUISITES

- STP-005 Put Board in the Water certificado (mano en rail desde el RELEASE).
- Alumno en READY position (tabla plana, flotando al costado, una mano en rail).
- Condiciones White Belt canonical: waist-deep water, corriente mínima.

---

## SETUP

- Alumno y coach en waist-deep water, ambos con tabla flotando al costado.
- Coach en vista lateral/frontal del alumno para leer posición de manos y relación cuerpo-tabla.
- Duración total del drill: 5-10 minutos (5-8 reps limpios).

---

## STEP-BY-STEP (5-BEAT CADENCE)

### BEAT 1 — **TAIL**
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
- Coach verbaliza: *"SIDE. Al costado. Nunca al frente."*
- Observable: línea paralela entre tabla y cuerpo del alumno.

### BEAT 4 — **PRESS**
- Alumno aplica presión descendente con la mano del tail.
- La tabla responde levantando levemente el nose (apalancamiento).
- Coach verbaliza: *"PRESS. Apretá el tail. Sentí la palanca."*
- Observable: nose de la tabla sube visiblemente 2-5 cm al aplicar PRESS.

### BEAT 5 — **PIVOT**
- Con PRESS activo, alumno redirige la tabla levemente izquierda y levemente derecha.
- Movimiento pequeño (~20°), no un giro amplio.
- Coach verbaliza: *"PIVOT. Girá con el tail. Control siempre."*
- Observable: tabla pivota sin perder posición lateral ni soltar TAIL/CENTER.

---

## REPETITIONS

- **5 reps limpios consecutivos** para PASS de sesión.
- **2 sesiones PASS** separadas para certificación STP-006.
- Si alumno falla rep por grip incorrecto (rails o nose) → coach corrige y rep se reinicia desde BEAT 1.

---

## VARIATIONS (within canon)

**V1 — Control aislado (default):**
Alumno ejecuta solo STP-006, sin transición a otro paso. Foco en instalar los 5 key words puros.

**V2 — Encadenado con STP-005:**
Alumno ejecuta STP-005 (Put Board in Water) → inmediatamente STP-006 (Control Your Board) sin pausa perceptible. Testea que el alumno no "suelta" entre pasos.

**V3 — Pivot extendido:**
Para alumnos que dominan los 5 beats rápido, coach propone un pivote de 90° manteniendo tail + center + side. Testea PRESS más sostenido.

**V4 — Verbal check:**
Coach pregunta en medio del drill: *"¿Dónde está tu tabla?"* — alumno debe responder sin mirar. Testea awareness instalado.

---

## WHAT THE COACH OBSERVES

1. **Hand placement:** ¿TAIL y CENTER en las posiciones correctas? ¿O el alumno está en rails/nose?
2. **Body-board relationship:** ¿Tabla al costado, paralela al cuerpo? ¿O drifts al frente?
3. **PRESS visible:** ¿El nose sube cuando el alumno dice/aplica PRESS? ¿O el alumno dice PRESS pero la mecánica no pasa?
4. **PIVOT bajo control:** ¿La tabla gira sin perder TAIL, CENTER, SIDE? ¿O se suelta uno de los puntos para "ayudar" al giro?
5. **Awareness:** ¿El alumno sabe dónde está la tabla sin mirar? ¿O necesita mirar cada 2 segundos?

---

## COMMON ERRORS (ver 04_Common_Errors/)

- **ERR-WB-020** — Grip en rails o nose (wrong grip)
- **ERR-WB-021** — Board drifting in front of body (coexiste con ERR-WB-014 hard-line)
- **ERR-WB-022** — Weak or absent tail pressure (no hay apalancamiento real)

---

## COACH CUES (canon)

- "TAIL. Acá. Sentí la cola."
- "CENTER. La otra mano. Estabilizá."
- "SIDE. Al costado. Nunca al frente."
- "PRESS. Apretá el tail. Sentí la palanca."
- "PIVOT. Girá con el tail. Control siempre."
- **Anchor:** "Tail controls. Center stabilizes. The board is known."
- **Micro-cue:** "Control is mechanical, not accidental."

---

## SUCCESS CRITERIA

✅ 5 reps consecutivos con TAIL + CENTER automáticos.
✅ Tabla al costado en TODOS los reps (cero drifts al frente).
✅ PRESS con nose-lift visible en al menos 3 de 5 reps.
✅ PIVOT ejecutado sin soltar ningún punto de contacto.
✅ Alumno responde "¿dónde está tu tabla?" sin mirar.

---

## PASS / NOT PASS

**✅ PASS DE SESIÓN:**
- 5 reps limpios consecutivos.
- Cero casos de board drifting in front.
- PRESS demostrado conscientemente.

**❌ NOT PASS:**
- Grip en rails o nose persistente (3+ reps).
- Board drifts in front 2+ veces.
- PRESS ausente (alumno no entiende la mecánica).

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Alumno con manos pequeñas / fuerza baja | Tabla softboard más ligera; PRESS se demuestra en tierra primero |
| Alumno zurdo | TAIL con mano izquierda, CENTER con derecha — el drill es simétrico |
| Alumno con experiencia previa (malos hábitos) | Primero se desinstala grip de rails con drill seco en tierra |
| Corriente lateral moderada | Alumno posicionado "río arriba" de la corriente durante el drill |

---

## CLOSING

Al cierre del drill (sesión 3+), alumno en control stable position dice en voz alta:

> *"Tail controls. Center stabilizes. The board is known."*

Coach confirma con silencio / nod. Transición a STP-007.

---

*TSS® White Belt · DRL-WB-06 · v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-020 — WRONG GRIP (RAILS OR NOSE)

El alumno, al establecer control de la tabla en el agua, no usa TAIL + CENTER. En su lugar agarra:

### ERR-WB-021 — BOARD DRIFTING IN FRONT

La tabla del alumno, en lugar de permanecer al costado del cuerpo (SIDE), se desplaza hacia adelante. La tabla queda total o parcialmente entre el alumno y la ola/whitewater entrante.

### ERR-WB-022 — WEAK TAIL PRESSURE

El alumno tiene la mano en el TAIL (grip correcto) pero la presión que aplica es insuficiente o ausente. La tabla no responde: el nose no se eleva, la tabla no pivota, el alumno no siente el apalancamiento.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-005']::TEXT[],
  'reading',
  27
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-007',
  'white_belt',
  7,
  $tss$Go Through Whitewater Standing$tss$,
  NULL,
  $tss$Block 1 (Board Handling)$tss$,
  $tss$# STP-007 — GO THROUGH WHITEWATER STANDING

**Belt:** White Belt · Block 1 (Board Handling)
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Atravesar la espuma (whitewater) parado al lado de la tabla, manteniendo control completo del equipo, usando alineación + apalancamiento mecánico para que la espuma pase POR DEBAJO de la tabla en lugar de golpear los rails y arrancarla de las manos del surfista.

Este es el primer paso del White Belt donde el surfista se encuentra con **fuerza real del océano** mientras sostiene la tabla. Todo lo aprendido antes (TAIL + CENTER + SIDE + PRESS + PIVOT en STP-006) se pone a prueba bajo load. Si STP-006 no está instalado, STP-007 falla sistemáticamente.

---

## THE 5 KEY WORDS

**ALIGN · WAIT · PRESS · LIFT · PASS**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **ALIGN** | Nose apuntado recto hacia la espuma | Nose de la tabla perpendicular al frente de la espuma, no de lado |
| 2 | **WAIT** | Esperar el momento correcto | Alumno no actúa antes de que la espuma esté cerca (1-1.5 m) |
| 3 | **PRESS** | Extender el brazo del tail y presionar hacia abajo | Brazo del tail estirado, fuerza descendente visible |
| 4 | **LIFT** | Nose se eleva por la palanca | Nose sube 15-30 cm sobre la superficie, queda sobre la espuma |
| 5 | **PASS** | La espuma fluye por debajo | Espuma pasa bajo la tabla sin romper contacto surfista-tabla |

---

## ANCHOR PHRASE

> **"We do not fight the foam. We lift and let it pass."**

**Micro-cue:** *"Point straight. Press hard. Nose up."*

---

## WHY THIS STEP MATTERS

**Primer encuentro real con fuerza del océano:**
Hasta acá (STP-001 a STP-006), el alumno operó en agua calma o con corriente mínima. STP-007 introduce **fuerza direccional del agua** — la espuma empuja la tabla con energía suficiente para arrancarla si la mecánica no está instalada. Este paso consolida o expone todas las bases anteriores.

**Mecánica no negociable:**
- Alineación incorrecta → la espuma golpea los rails lateralmente → tabla arrancada.
- PRESS insuficiente → nose bajo → espuma golpea la tabla de frente con todo su peso.
- Timing incorrecto → PRESS demasiado pronto (fatiga) o demasiado tarde (no llega a LIFT).

**Base de toda progresión surfista:**
La capacidad de "pasar whitewater con control" es el umbral técnico entre "persona que entra al mar" y "surfista que maneja el mar". Sin este paso, el alumno no puede llegar al line-up ni siquiera parado. Todos los pasos siguientes (STP-010+ hacia paddle, stand up, waves) asumen que whitewater passage está resuelto.

**Seguridad continua:**
La hard-line rule "tabla nunca entre cuerpo y ola" (ERR-WB-014) se activa en tiempo real acá. En STP-006, era estática. En STP-007, es dinámica: la ola viene, y en ese momento la regla se aplica bajo presión.

---

## BOUNDARY BOX

✅ **EMPIEZA:** tabla bajo control estable en el agua (cierre de STP-006), espuma entrante visible.

✅ **TERMINA:** alumno pasó la espuma parado, tabla todavía controlada al costado, listo para siguiente espuma o transición a STP-008.

❌ **NO incluye:**
- Turn around (STP-008)
- Walk back (STP-009)
- Subirse a la tabla / paddle (STP-010+)
- Espumas grandes (out of White Belt canonical conditions)

**Cross-step dependency:**
- STP-006 Control Your Board DEBE estar certificado. Sin TAIL + CENTER automáticos, STP-007 es peligroso.
- ERR-WB-014 (hard-line: board entre cuerpo y ola) aplica especialmente acá y puede invalidar la sesión.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-007 en dos sesiones PASS:

1. **ALIGN automático:** alumno orienta la tabla hacia la espuma sin que el coach lo indique.
2. **Timing correcto:** PRESS ejecutado cuando la espuma está a 1-1.5m, no antes, no después.
3. **LIFT efectivo:** nose sube visiblemente, espuma pasa por debajo sin golpear la tabla de frente.
4. **Control post-passage:** tras PASS, la tabla sigue en SIDE + TAIL + CENTER. No hay reposicionamiento mayor requerido.
5. **5-10 passages consecutivos limpios** en condiciones White Belt canonical (espuma chica, ≤0.5 m).

---

## CONDITION SPECIFICATION (WHITE BELT CANONICAL)

**Whitewater size:** ≤ 0.5 m (knee-high) desde la base.
**Water depth:** waist-deep para que el alumno tenga estabilidad.
**Current:** mínima o ausente.
**Wind:** suave, no contra el surfista.
**Consistency:** espuma regular, no caótica.

**⚠️ Si las condiciones exceden este canon, NO se trabaja STP-007. Se espera.**

---

## MECHANICS DETAIL

**El brazo del tail es el fulcro-extensor:**
- Brazo NO flexionado, brazo extendido hacia abajo y atrás.
- Cuanta más extensión, más leverage.
- El punto de aplicación de fuerza es el tail, no el center ni los rails.

**Para espumas más fuertes (≤0.5m pero con punch):**
- Flexión de rodillas aumenta la base.
- Peso corporal suma a la presión del tail.
- Pequeño salto opcional: solo cuando la espuma llega exactamente al punto de PRESS.

**Conservación del SIDE:**
- Durante todo el PASS, la tabla sigue al costado del cuerpo.
- Si la tabla se desplaza hacia adelante durante el PASS, la mecánica falló (probable PRESS insuficiente).

---

## COACHING PRINCIPLE

El coach que enseña STP-007 debe **leer la espuma con el alumno** antes del primer intento. Mostrar cómo se ve una espuma "bien" para practicar vs una espuma "no canonical". El alumno debe aprender a identificar condiciones adecuadas, no sólo ejecutar técnica.

Además, el coach debe corregir **una sola cosa por rep** — alineación, timing, o lift. Corregir las 3 simultáneamente colapsa el aprendizaje.

---

*TSS® White Belt · STP-007 Go Through Whitewater Standing v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-07 — WHITEWATER PASSAGE DRILL

**Parent Step:** STP-007 Go Through Whitewater Standing
**Belt:** White Belt · Block 1
**Version:** v1.0
**Format:** Standalone drill with live whitewater

---

## OBJECTIVE

Instalar el patrón mecánico-temporal de pasar whitewater parado al costado de la tabla, usando los 5 key words (ALIGN · WAIT · PRESS · LIFT · PASS) con control completo y sin perder la tabla. Este drill es el primer contacto real del alumno con fuerza del océano bajo load.

---

## WHY THIS DRILL

La mayoría de alumnos que no completan White Belt se estancan acá. No por falta de coraje, sino por falta de mecánica. Este drill reemplaza "coraje" con "técnica": el alumno aprende que la espuma se pasa con ALIGN + PRESS + LIFT, no con fuerza bruta ni con suerte.

Además, es el primer drill donde el **timing** es un beat explícito. Los drills anteriores eran estáticos o casi-estáticos. Acá, la ola tiene su propio tempo, y el alumno debe sincronizarse.

---

## PREREQUISITES

- STP-006 Control Your Board certificado (TAIL + CENTER + SIDE + PRESS + PIVOT automáticos).
- Alumno ya completó ≥3 sesiones de White Belt sin hard-line activations.
- Condiciones White Belt canonical (espuma ≤0.5m, waist-deep, corriente mínima, viento suave).

---

## SETUP

- Ubicación: waist-deep, zona de whitewater consistente pero no caótica.
- Posicionamiento: coach al costado del alumno, no atrás (coach ve la espuma al mismo tiempo que el alumno).
- Tabla en control position (TAIL + CENTER + SIDE + PRESS activo).
- Coach tiene referencia visual de "próxima espuma utilizable" señalada antes del primer intento.

---

## STEP-BY-STEP (5-BEAT CADENCE)

### BEAT 1 — **ALIGN**
- Alumno orienta el nose recto hacia la espuma entrante.
- Tabla perpendicular al frente de la espuma.
- Coach verbaliza: *"ALIGN. Nose recto. Hacia la espuma."*
- Observable: línea recta desde el cuerpo del alumno, a través de la tabla, hacia la espuma.

### BEAT 2 — **WAIT**
- Alumno NO actúa prematuramente.
- Espera hasta que la espuma esté a 1-1.5 m.
- Coach verbaliza: *"WAIT. Todavía no. Dejala venir."*
- Observable: alumno en control position sin movimiento de brazos, mirando la espuma.

### BEAT 3 — **PRESS**
- Cuando la espuma está a la distancia correcta, alumno extiende el brazo del tail y presiona hacia abajo con fuerza.
- Brazo extendido, no flexionado.
- Coach verbaliza: *"PRESS. Ahora. Apretá fuerte."*
- Observable: brazo del tail estirado, peso corporal ligeramente hacia atrás.

### BEAT 4 — **LIFT**
- Como consecuencia del PRESS + ALIGN, el nose se eleva 15-30 cm sobre la superficie.
- El nose queda SOBRE la espuma, no enfrente de ella.
- Coach verbaliza: *"LIFT. Nose arriba. Mirá cómo sube."*
- Observable: nose claramente elevado en el momento en que la espuma llega.

### BEAT 5 — **PASS**
- La espuma fluye por debajo de la tabla.
- Alumno mantiene SIDE + TAIL + CENTER durante y después del passage.
- Coach verbaliza: *"PASS. Dejala pasar. Control siempre."*
- Observable: espuma cruza bajo la tabla, alumno sigue en control position post-ola.

---

## REPETITIONS

- **5-10 passages consecutivos limpios** para PASS de sesión.
- **2 sesiones PASS** separadas para certificación STP-007.
- Si alumno pierde el control en un passage → se pausa, recentra, y reinicia desde BEAT 1.

---

## VARIATIONS (within canon)

**V1 — Passage aislado (default):**
Alumno pasa espuma individual con reset entre passages. Foco en los 5 beats puros.

**V2 — Passages consecutivos:**
Alumno pasa 3 espumas seguidas sin reset completo — solo re-ALIGN entre espumas. Testea resistencia del patrón bajo load repetido.

**V3 — Espuma con más punch (dentro del canonical ≤0.5m):**
Coach selecciona una espuma con más empuje (aún dentro del rango). Alumno agrega flexión de rodillas + carga de peso.

**V4 — Espuma con pequeño salto:**
Sólo para alumnos que dominan V1-V3. Al momento de LIFT, alumno agrega un pequeño salto coordinado. Aumenta control bajo espumas en el umbral superior del canonical.

---

## WHAT THE COACH OBSERVES

1. **ALIGN:** ¿Tabla perpendicular a la espuma o lateral? (lateral = error)
2. **WAIT:** ¿Alumno ejecuta a tiempo o se adelanta? (adelanto = PRESS sin resultado)
3. **PRESS:** ¿Brazo extendido o flexionado? (flexionado = menos leverage)
4. **LIFT:** ¿Nose se eleva visiblemente o queda bajo? (bajo = espuma golpea de frente)
5. **PASS:** ¿Espuma pasa por debajo o golpea la tabla? (golpea = error mecánico)
6. **Post-passage:** ¿Tabla sigue en SIDE o drifts? (drifts = falta de PRESS sostenido)

**Observable adicional: manos.** Durante todo el 5-beat, las manos deben estar en TAIL + CENTER. Si en el momento de la espuma el alumno mueve las manos a rails o nose, la base (STP-006) no estaba instalada.

---

## COMMON ERRORS (ver 04_Common_Errors/)

- **ERR-WB-023** — Poor Alignment (tabla lateral, espuma golpea rails)
- **ERR-WB-024** — Nose Too Low / Bad Timing (PRESS tarde o insuficiente)
- **ERR-WB-025** — Board Ripped Away (pérdida de control bajo espuma)

---

## COACH CUES (canon)

- "ALIGN. Nose recto. Hacia la espuma."
- "WAIT. Todavía no. Dejala venir."
- "PRESS. Ahora. Apretá fuerte."
- "LIFT. Nose arriba. Mirá cómo sube."
- "PASS. Dejala pasar. Control siempre."
- **Anchor:** "We do not fight the foam. We lift and let it pass."
- **Micro-cue:** "Point straight. Press hard. Nose up."

---

## SUCCESS CRITERIA

✅ 5-10 passages consecutivos limpios.
✅ ALIGN correcto en TODOS los passages.
✅ LIFT visible en ≥80% de los passages.
✅ Cero pérdidas de tabla.
✅ Cero activaciones de hard-line rule (ERR-WB-014).

---

## PASS / NOT PASS

**✅ PASS DE SESIÓN:**
- 5+ passages consecutivos limpios.
- Control continuo pre y post espuma.
- Cero pérdidas de tabla.

**❌ NOT PASS:**
- 2+ passages con ALIGN lateral.
- 2+ passages donde el nose no se eleva.
- 1 pérdida de tabla por espuma (ERR-WB-025).
- Activación de hard-line rule (ERR-WB-014) → sesión invalidada.

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Alumno con miedo al agua | Empezar con espumas más chicas (knee-high), progresar gradualmente |
| Alumno con manos pequeñas / fuerza baja | Flexión de rodillas compensa menor fuerza de brazo |
| Corriente lateral leve | Alumno ajusta ALIGN considerando la desviación |
| Espumas irregulares | Coach selecciona la próxima utilizable y espera; no se pasa cualquier espuma |
| Alumno con experiencia previa (malos hábitos) | Primero V1 lento, prohibir rail grip |

---

## CLOSING

Al cierre del drill (sesión 3+), tras último passage limpio, alumno en control position dice en voz alta:

> *"We do not fight the foam. We lift and let it pass."*

Coach confirma con silencio / nod. Transición a STP-008 o a rest.

---

*TSS® White Belt · DRL-WB-07 · v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-023 — POOR ALIGNMENT

El alumno enfrenta la espuma con la tabla **no alineada** perpendicularmente al frente de la espuma. La tabla está lateral, angulada, o torcida respecto a la dirección del agua entrante.

### ERR-WB-024 — NOSE TOO LOW / BAD TIMING

En el momento en que la espuma llega a la tabla, el nose NO está suficientemente elevado. La espuma golpea la tabla de frente (nose, front rails, front third) en lugar de pasar por debajo.

### ERR-WB-025 — BOARD RIPPED AWAY

Durante el passage de whitewater, el alumno pierde control de la tabla. La tabla es arrancada de sus manos por la fuerza de la espuma y queda libre, drifteando / volando / golpeando.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-006']::TEXT[],
  'reading',
  28
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-008',
  'white_belt',
  8,
  $tss$Turn Around Safely$tss$,
  NULL,
  $tss$Block 1 (Board Handling)$tss$,
  $tss$# STP-008 — TURN AROUND SAFELY

**Belt:** White Belt · Block 1 (Board Handling)
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Cambiar de dirección en el agua (dar la vuelta) sin romper la relación de seguridad entre cuerpo, tabla y espuma entrante. Este es el paso donde el principio **"tabla nunca entre cuerpo y ola"** se pone a prueba en una acción dinámica: no estás parado ni caminando, estás rotando — y la rotación mal hecha es la forma más común de violar la hard-line rule.

Turn Around Safely no es un paso de maniobra — es un paso de safety. La maniobra es simple. Lo difícil es ejecutarla sin exponer el cuerpo.

---

## THE 5 KEY WORDS

**CHECK · PIVOT · BACK · CONTROL · READY**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **CHECK** | Verificar de dónde viene la espuma | Alumno mira/identifica la dirección de la próxima espuma antes de girar |
| 2 | **PIVOT** | Iniciar el giro de la tabla en la dirección segura | Tabla gira con PRESS + mano del tail activa, no con fuerza bruta |
| 3 | **BACK** | Espalda hacia la espuma durante el giro | Cuerpo del alumno rotando de manera que la espalda queda hacia la espuma entrante |
| 4 | **CONTROL** | TAIL + CENTER + SIDE mantenidos durante toda la rotación | Manos no se sueltan, tabla al costado, nunca al frente |
| 5 | **READY** | Giro completo, reorientación estable | Alumno mirando la nueva dirección, control restablecido, listo para siguiente acción |

---

## ANCHOR PHRASE

> **"Check first. Pivot safe. Back to the foam."**

**Micro-cue:** *"Never board between you and the wave."*

---

## WHY THIS STEP MATTERS

**Safety dinámico:**
En STP-004 (Walk Out) aprendimos la hard-line rule en caminata. En STP-006 (Control) la aplicamos estática. En STP-007 (Whitewater Passage) la aplicamos frente a una ola. En STP-008 la aplicamos **en movimiento rotacional** — que es donde los alumnos típicamente la violan por primera vez.

El giro incorrecto es la **causa número uno** de lesiones auto-infligidas en beginners: el alumno gira hacia el lado equivocado, pone la tabla entre su cuerpo y la espuma, la espuma empuja la tabla hacia el alumno, la tabla lo golpea.

**Reversibilidad del aprendizaje:**
Si el alumno gira mal 5-10 veces y "sobrevive" por suerte, aprende que "girar es simple". Desinstalar ese patrón es más costoso que enseñarlo correcto desde el primer rep.

**Umbral de autonomía:**
Un surfista que no puede girar sin asistencia del coach no tiene autonomía en el agua. Este paso marca el momento donde el alumno puede moverse solo entre "entrada" y "salida" del line-up sin depender de instrucción rep por rep.

**Conservación de TAIL + CENTER bajo rotación:**
Muchos alumnos sueltan una mano "para ayudar a girar". Este patrón elimina el apalancamiento mecánico del giro y convierte el PIVOT en scramble. STP-008 instala que el giro se hace CON las dos manos puestas, usando PRESS + PIVOT de STP-006.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno en control stable tras STP-007 (passage limpio) y necesita cambiar de dirección para volver a la costa o reposicionarse.

✅ **TERMINA:** giro completo, alumno reorientado, TAIL + CENTER + SIDE mantenidos, listo para siguiente acción (walk back STP-009 o continuar en la zona de whitewater).

❌ **NO incluye:**
- Walk back completo (STP-009 — solo el giro direccional, no el regreso)
- Turn around sobre la tabla / paddle (Yellow Belt territory)
- Giros complejos en mar abierto (fuera de White Belt canonical)

**Cross-step dependency:**
- STP-006 Control Your Board certificado (PIVOT mecánico requiere PRESS + TAIL).
- STP-007 certificado (el alumno pasó whitewater con control antes de girar).
- ERR-WB-014 (hard-line rule) se pone a prueba dinámicamente acá.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-008 en dos sesiones PASS:

1. **CHECK automático:** alumno verifica dirección de espuma antes de iniciar giro, sin que el coach lo indique.
2. **Dirección segura automática:** alumno gira en la dirección correcta en 100% de los reps (cero giros hacia el lado equivocado).
3. **Hard-line rule intacta:** **cero** activaciones de ERR-WB-014 en todos los giros.
4. **Control mecánico preservado:** TAIL + CENTER + SIDE mantenidos durante todo el PIVOT.
5. **READY position clara:** giro se completa con alumno mirando dirección nueva, control estable.
6. **5-8 giros consecutivos limpios** en condiciones canonical, desde ambos lados (izquierda y derecha).

---

## DECISION LOGIC: HOW TO IDENTIFY SAFE DIRECTION

Regla simple, canónica:

**La dirección segura es aquella donde, al completar el giro, la espuma queda a tu espalda, no a tu frente.**

En la práctica:
- Espuma viene de tu derecha → gira hacia la izquierda (espalda queda a la derecha, hacia la espuma).
- Espuma viene de tu izquierda → gira hacia la derecha.
- Espuma viene de frente → gira hacia cualquier lado (180°), terminando con la espalda hacia la espuma.

**El criterio NO es "el lado más rápido" ni "el lado natural". Es "el lado donde la tabla NO pasa delante de vos durante la rotación".**

---

## MECHANICS DETAIL

**Uso de PRESS + PIVOT de STP-006:**
El giro de STP-008 **es el PIVOT de STP-006 amplificado**. No es un movimiento nuevo — es la extensión amplitud del mismo mecánica.
- Mano del tail: PRESS activo, aplicando fuerza descendente-lateral para rotar la tabla.
- Mano del center: sostiene estabilidad durante la rotación.
- Cuerpo: rota en el mismo sentido que la tabla, siguiéndola, no luchando contra ella.

**Movimiento del cuerpo:**
- Alumno gira los hombros primero, tabla sigue.
- Cadera acompaña.
- Pies se reposicionan al terminar el giro (no antes — si los pies giran antes que el torso, la tabla se queda atrás).

**Tiempo:**
- Giro rápido (2-3 segundos), no apurado.
- La diferencia entre "rápido" y "apurado" es la preservación del CONTROL.

---

## COACHING PRINCIPLE

El coach que enseña STP-008 debe **corregir la dirección equivocada AL INSTANTE**, antes de que el alumno complete el giro. A diferencia de otros errores donde se deja terminar el rep para analizar, un giro hacia el lado incorrecto debe interrumpirse en el momento — porque si se completa, la tabla ya está en posición de peligro.

Esto significa: el coach debe estar físicamente cerca (no a 3m) durante los primeros reps de este paso, para poder intervenir verbalmente en tiempo real.

---

*TSS® White Belt · STP-008 Turn Around Safely v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-08 — SAFE PIVOT TURN DRILL

**Parent Step:** STP-008 Turn Around Safely
**Belt:** White Belt · Block 1
**Version:** v1.0
**Format:** Standalone drill, dynamic rotation under safety constraint

---

## OBJECTIVE

Instalar el patrón de giro seguro en el agua usando los 5 key words (CHECK · PIVOT · BACK · CONTROL · READY) de manera que el alumno NUNCA ponga la tabla entre su cuerpo y la espuma durante el cambio de dirección.

La meta no es "girar bien" — es **girar sin exponer el cuerpo**. La calidad del giro se mide por la posición de la tabla durante y después de la rotación, no por la velocidad o elegancia.

---

## WHY THIS DRILL

Es el primer drill donde el alumno toma una decisión dinámica de seguridad. En los drills anteriores, la tabla estaba quieta o se movía en una dirección predecible. Acá, el alumno elige hacia dónde gira, y esa elección puede ser segura o peligrosa según la posición de la espuma.

Además, este drill instala por primera vez el concepto **"back to the foam"** — dar la espalda a la espuma durante el giro. Este patrón se usa durante toda la carrera del surfista (Yellow Belt, Orange Belt, y más allá).

---

## PREREQUISITES

- STP-006 Control Your Board certificado.
- STP-007 Go Through Whitewater Standing certificado.
- Alumno capaz de identificar visualmente de dónde viene la espuma.
- Condiciones canonical: waist-deep, espuma ≤0.5m, corriente mínima, viento suave.

---

## SETUP

- Ubicación: waist-deep, zona de whitewater consistente con pausas entre espumas (para permitir giros sin presión temporal inicial).
- Alumno en control position tras STP-007 passage.
- Coach posicionado CERCA (≤2m) del alumno durante los primeros reps — debe poder intervenir verbal inmediatamente.
- Referencias visuales acordadas antes: "izquierda" y "derecha" respecto al cuerpo del alumno.

---

## STEP-BY-STEP (5-BEAT CADENCE)

### BEAT 1 — **CHECK**
- Alumno observa y verbaliza de dónde viene la espuma.
- Coach verbaliza: *"CHECK. ¿De dónde viene la espuma?"*
- Alumno responde en voz alta: *"Viene de mi derecha."* (o izquierda / frente)
- Observable: alumno mira la espuma antes de iniciar cualquier movimiento.

### BEAT 2 — **PIVOT**
- Alumno inicia el giro de la tabla en la dirección segura.
- Mano del tail aplica PRESS + fuerza lateral para rotar la tabla.
- Coach verbaliza: *"PIVOT. Hacia [dirección segura]. Usá el tail."*
- Observable: tabla empieza a rotar, TAIL + CENTER mantenidos.

### BEAT 3 — **BACK**
- Durante la rotación, el alumno orienta su cuerpo de forma que la espalda quede hacia la espuma.
- Hombros y torso giran en el mismo sentido que la tabla.
- Coach verbaliza: *"BACK. Espalda a la espuma. Nunca frente."*
- Observable: al medio del giro, la espalda del alumno está orientada hacia la espuma entrante.

### BEAT 4 — **CONTROL**
- Durante todo el giro, la tabla permanece al costado del cuerpo (SIDE), jamás atraviesa adelante.
- TAIL + CENTER no se sueltan.
- Coach verbaliza: *"CONTROL. Las dos manos. Siempre al costado."*
- Observable: tabla paralela al cuerpo durante la rotación, manos firmes.

### BEAT 5 — **READY**
- Giro completado. Alumno mirando la nueva dirección.
- Control estable restablecido.
- Coach verbaliza: *"READY. Listo. Nueva dirección."*
- Observable: alumno con tabla en SIDE + TAIL + CENTER, mirando hacia la costa (si está volviendo) o hacia el mar (si reposicionándose).

---

## REPETITIONS

- **5-8 giros limpios consecutivos** para PASS de sesión.
- **Ambos lados trabajados:** 3 giros hacia izquierda + 3 giros hacia derecha + 2 giros mixtos (alumno decide según espuma real).
- **2 sesiones PASS** separadas para certificación STP-008.

---

## VARIATIONS (within canon)

**V1 — Giro aislado con pausa (default):**
Alumno pasa espuma (STP-007), espera, decide dirección, gira. Sin presión temporal. Foco en mecánica limpia.

**V2 — Decisión dirigida:**
Coach le indica de antemano: "la próxima espuma viene de tu derecha, ¿hacia dónde girás?". Alumno responde verbalmente, ejecuta. Instala el razonamiento de decisión.

**V3 — Decisión autónoma:**
Coach no anticipa. Alumno observa, decide, gira. Testea autonomía.

**V4 — Giro encadenado con STP-007:**
Alumno pasa whitewater (STP-007) y gira inmediatamente (STP-008) sin pausa perceptible. Testea que los patrones no se degradan bajo secuencia.

**V5 — Giro con espuma entrante visible:**
Alumno gira mientras hay una espuma acercándose (no inminente, pero visible). Testea que el giro es rápido sin ser apurado.

---

## WHAT THE COACH OBSERVES

1. **CHECK real:** ¿Alumno mira la espuma o asume dirección?
2. **Dirección correcta:** ¿Gira hacia el lado seguro o hacia el lado equivocado?
3. **Mecánica del PIVOT:** ¿Usa PRESS + TAIL o fuerza bruta?
4. **BACK observable:** ¿Da la espalda a la espuma en algún momento del giro, o expone frente?
5. **Posición de la tabla:** ¿Queda en SIDE durante todo el giro, o cruza al frente?
6. **CONTROL de manos:** ¿Mantiene TAIL + CENTER, o suelta una mano "para girar"?
7. **Cierre READY:** ¿Completa el giro con control estable, o queda "deshecho" requiriendo reposicionamiento?

**Observable crítico:** durante el giro, trazá mentalmente la línea "cuerpo-tabla-espuma". Si en algún instante la tabla está ENTRE cuerpo y espuma → ERR-WB-027 activado → hard-line rule violada.

---

## COMMON ERRORS (ver 04_Common_Errors/)

- **ERR-WB-026** — Wrong Turning Direction (alumno gira hacia el lado que expone el cuerpo)
- **ERR-WB-027** — Board Between Body and Foam During Pivot (hard-line rule dinámica activada)
- **ERR-WB-028** — Rushed Pivot / Loss of Control (alumno suelta una mano, TAIL/CENTER perdidos)

---

## COACH CUES (canon)

- "CHECK. ¿De dónde viene la espuma?"
- "PIVOT. Hacia [dirección segura]. Usá el tail."
- "BACK. Espalda a la espuma. Nunca frente."
- "CONTROL. Las dos manos. Siempre al costado."
- "READY. Listo. Nueva dirección."
- **Anchor:** "Check first. Pivot safe. Back to the foam."
- **Micro-cue:** "Never board between you and the wave."

---

## SUCCESS CRITERIA

✅ 5-8 giros limpios consecutivos.
✅ Dirección correcta en 100% de los giros.
✅ BACK observable en 100% de los giros.
✅ CONTROL mantenido (TAIL + CENTER siempre) en 100% de los giros.
✅ Cero activaciones de hard-line rule (ERR-WB-027 / ERR-WB-014).
✅ Trabajo en ambos lados (izquierda y derecha) con calidad consistente.

---

## PASS / NOT PASS

**✅ PASS DE SESIÓN:**
- 5+ giros consecutivos limpios desde ambos lados.
- Cero activaciones de hard-line rule.
- CHECK verbalizado o demostrado en todos los reps.

**❌ NOT PASS:**
- 1+ giro en dirección incorrecta (ERR-WB-026).
- 1+ activación de hard-line rule (ERR-WB-027 / ERR-WB-014) → sesión INVALIDADA.
- Patrón de soltar una mano durante el PIVOT (ERR-WB-028).
- Alumno no puede identificar dirección de espuma sin asistencia.

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Alumno con dominancia lateral fuerte | Trabajar primero lado dominante, después lado débil con más repeticiones |
| Alumno indeciso sobre dirección | Drill seco en tierra: coach grita "espuma de la derecha" y alumno gira; repetir 10 veces |
| Condiciones con espumas frecuentes | Coach elige ventanas entre espumas para los primeros reps |
| Alumno grande con softboard pequeña | Ajustar expectativa de velocidad; giros más lentos son OK |

---

## CLOSING

Tras último giro limpio, alumno en READY position dice en voz alta:

> *"Check first. Pivot safe. Back to the foam."*

Coach confirma con silencio / nod. Transición a STP-009 o rest.

---

*TSS® White Belt · DRL-WB-08 · v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-026 — WRONG TURNING DIRECTION

El alumno gira hacia el lado que lo expone al peligro. Al completar el giro, la tabla queda entre su cuerpo y la espuma entrante, O el alumno queda con el pecho/frente orientado hacia la espuma en lugar de la espalda.

### ERR-WB-027 — BOARD BETWEEN BODY AND FOAM DURING PIVOT

Durante la rotación del giro, la tabla cruza la línea imaginaria entre el cuerpo del alumno y la espuma entrante. En cualquier punto del pivot — incluso transitoriamente — la tabla queda **entre el alumno y la ola**.

### ERR-WB-028 — RUSHED PIVOT / LOSS OF CONTROL

Durante el giro, el alumno acelera la rotación con urgencia emocional en lugar de velocidad controlada. Como consecuencia, suelta una mano (TAIL o CENTER), la mecánica de PRESS se pierde, y la tabla sale de SIDE.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-007']::TEXT[],
  'reading',
  29
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-009',
  'white_belt',
  9,
  $tss$Walk Back to the Sand$tss$,
  NULL,
  $tss$Block 1 — Entry / Control / Return loop (closing step)$tss$,
  $tss$# STP-009 — Walk Back to the Sand

**Belt:** White Belt
**Block:** 1 — Entry / Control / Return loop (closing step)
**Version:** v1.0
**Status:** Nivel 2 — productized

---

## 1. DEFINITION

Walk Back to the Sand es el paso donde el surfer retorna de manera segura hacia la orilla tras haber completado Turn Around Safely. No es caminar de regreso ciegamente. Es un **retorno controlado y activo** en el que el alumno sigue leyendo el agua, rastreando la espuma entrante desde atrás, y manejando la tabla hasta llegar a la zona de arena segura.

Cierra el loop de White Belt Block 1: **entrada (STP-001→005) → control (STP-006→007) → retorno (STP-008→009)**. Es el paso donde se consolida la doctrina TSS de que **la seguridad y la awareness permanecen activas hasta pisar arena seca**.

---

## 2. THE 5 KEY WORDS

**LOOK → READ → WALK → ADJUST → LAND**

| # | Word | Meaning | Observable |
|---|---|---|---|
| 1 | **LOOK** | Mirar atrás regularmente | Alumno rota cabeza/torso para escanear espuma entrante |
| 2 | **READ** | Leer qué viene y a qué distancia | Alumno identifica tamaño, distancia, timing de la siguiente espuma |
| 3 | **WALK** | Caminar bajo control, tabla gestionada | Pasos firmes, tabla SIDE + TAIL controlados |
| 4 | **ADJUST** | Re-maniobrar si es necesario (girar, pasar espuma, esperar) | Alumno ejecuta STP-007 o STP-008 sobre la marcha si corresponde |
| 5 | **LAND** | Cerrar en la zona de arena segura | Alumno cruza la línea de arena seca con control, sesión cerrada |

**Anchor phrase:** *"Look back. Read the foam. Land with control."*
**Micro-cue:** *"The ocean is still live until the sand is dry."*

---

## 3. BOUNDARY BOX

**EMPIEZA:** el surfer completó STP-008 Turn Around Safely y está orientado hacia la orilla con la tabla en control (TAIL + SIDE).

**TERMINA:** el surfer cruza la línea de arena seca (safe zone) con la tabla controlada y la sesión cerrada.

**NO incluye:**
- Salir completamente del agua a arena seca (eso es fin de sesión, no parte de STP-009).
- Exit técnico en olas grandes (Yellow Belt territory).
- Paddle back / sentarse en la tabla (línea prona / activa, no aplica White Belt).
- Terminar la sesión psicológicamente ("ya estoy" antes de llegar a arena segura).

**Cross-step dependencies:**
- STP-002 Safe Zone Reading: la definición de "safe zone" se hereda directamente. Sin ella, LAND no tiene destino.
- STP-003 Scanning Waves: la awareness de scanning se **invierte** en STP-009 — ahora mirando hacia atrás, no hacia el horizonte.
- STP-007 + STP-008: si durante el retorno llega espuma, el alumno debe poder ejecutar Pass o Turn sobre la marcha. STP-009 los **integra en uso dinámico**, no los reemplaza.

---

## 4. WHY IT MATTERS (Doctrinal)

**Cierre del primer loop TSS:**
- White Belt Block 1 = entrada → control → retorno. STP-009 es el paso que convierte la sesión de "fue al mar" a "navegó el mar y volvió limpio". Sin STP-009, el alumno entra y sale por suerte. Con STP-009, entra y sale por método.

**Re-cableo anti-instinto (igual que STP-008):**
- El instinto humano al "volver a casa" es desconectar. El alumno que va hacia la orilla cree que "ya está". TSS le enseña que la orilla no está segura hasta que sus pies tocan arena seca.
- El mar puede golpear por atrás. El 40% de los incidentes menores en beginners ocurren durante el retorno, no durante la entrada.

**Consolidación en contexto dinámico:**
- STP-007 (pasar espuma) y STP-008 (girar) se practicaron en condiciones controladas con reset entre reps. STP-009 los pone en **uso real sin reset**: el alumno no elige cuándo pasar espuma o cuándo girar — la ola decide, y el alumno responde.
- Este es el primer paso White Belt donde el alumno **no tiene control sobre el timing** de los eventos. Solo sobre su respuesta.

**Preparación para paddle back (Yellow Belt):**
- El alumno que no sabe retornar caminando con awareness no va a poder retornar remando en Yellow Belt. El backward scanning instalado acá se transfiere.

**Protección del coach y de TSS:**
- Un alumno que se lesiona durante el retorno es un fallo de la metodología más que de la enseñanza. La lesión "volviendo" se evita con backward awareness instalada.

---

## 5. MODO PEDAGÓGICO DOMINANTE

**CLÁSICO con alta demanda ECOLÓGICA:**
- CLÁSICO: se define la regla (mirar atrás cada 5-8 pasos, leer la espuma, responder).
- ECOLÓGICO: **el ambiente dicta la ejecución**. Cada retorno es único — la espuma no es reproducible. El alumno no puede memorizar pasos, tiene que **leer y responder**.
- Esto es lo más cercano a surf real dentro de White Belt. El coach no puede controlar todas las variables. Puede controlar la ventana, la zona, pero no la próxima espuma.

**Este paso es donde el alumno empieza a "surfear" cognitivamente** aunque todavía esté caminando.

---

## 6. CANONICAL CONDITIONS

- Waist-deep al inicio del retorno, reduciendo a knee-deep y sand al cierre.
- Whitewater ≤0.5m, consistente, con ventanas predecibles.
- Corriente mínima (sin lateral).
- Viento moderado o suave.
- **STP-006, STP-007, STP-008 certificados.** Sin estas bases, ADJUST no es posible en tiempo real.
- Coach posicionado entre alumno y arena para poder intervenir si el alumno desconecta.
- Arena seca visible y con referencia clara (punto específico de llegada).

Cualquier variación (corriente lateral, espuma más grande, viento fuerte) sale de canonical y queda en Yellow Belt o sesiones avanzadas.

---

## 7. SUCCESS INDICATORS

1. **Backward scanning consistente:** alumno mira atrás cada 5-8 pasos mínimo, sin recordatorio del coach.
2. **Board control constante:** TAIL + SIDE mantenidos durante todo el retorno, incluso mientras mira atrás.
3. **Response correcta a espuma:** si llega espuma, alumno ejecuta STP-007 Pass o STP-008 Turn sin intervención del coach.
4. **No es sorprendido:** cero golpes inesperados en la espalda o caídas por no ver espuma entrante.
5. **LAND limpio:** cruza línea de arena seca con control, no corre los últimos metros, no tira la tabla.

---

## 8. CERTIFICATION THRESHOLD

**STP-009 se certifica cuando:**
- 2 sesiones separadas con 5-8 retornos controlados cada una.
- Cero activaciones de ERR-WB-029 (no mirar atrás).
- Cero activaciones de ERR-WB-031 (fallo de re-maniobra / golpe por atrás).
- El alumno responde a espuma entrante durante el retorno sin indicación del coach en al menos 3 ocasiones.

**TSS Hard Standard (consolidado desde STP-007):**
- Zero lost boards en canonical conditions.
- Zero hard-line activations en canonical conditions.
- Zero backward-surprises en canonical conditions (nuevo para STP-009).

---

## 9. RELATION TO OTHER STEPS

- **STP-002 Safe Zone Reading** → fuente del concepto "zona segura". STP-009 es la aplicación de ese concepto en modo retorno.
- **STP-003 Scanning Waves** → forward scanning. STP-009 es **backward scanning** — inversión del mismo skill.
- **STP-007 Pass / STP-008 Turn** → herramientas que el alumno aplica *reactivamente* durante el retorno.
- **STP-010+ Get on your board** → el alumno completó el loop caminando. Siguiente fase: entrar al modo prono. STP-009 cierra el capítulo "de pie en el agua".

---

## 10. COACH NON-NEGOTIABLES

1. El retorno no se declara exitoso hasta que el alumno pisa arena seca.
2. Si el alumno relaja ("ya está") antes de arena seca, coach interrumpe: "No terminó. Look back."
3. Si alumno es golpeado por espuma en la espalda sin haber mirado: sesión no cuenta.
4. Se trabaja la **inversión cognitiva**: el alumno pasa de mirar adelante (STP-003) a mirar atrás (STP-009). Esta transición debe ser explícita.
5. Coach no camina de regreso junto al alumno en ejecución — coach queda entre alumno y arena para observar. Si el coach camina al lado, el alumno delega awareness.

---

*TSS® White Belt · STP-009 Walk Back to the Sand · v1.0*
*IP of Marcelo Castellanos / Enkrateia*
*Closing step of Block 1 — Entry / Control / Return loop*
$tss$,
  $tss$# DRL-WB-09 — SAFE RETURN DRILL

**Parent step:** STP-009 Walk Back to the Sand
**Belt:** White Belt
**Version:** v1.0
**Drill Type:** Active-ecological (ambiente dicta ejecución)

---

## 1. OBJECTIVE

Instalar en el alumno el patrón de **retorno activo**: caminar hacia la orilla manteniendo backward awareness, gestión de tabla, y capacidad de re-maniobrar (Pass o Turn) sobre la marcha cuando llega espuma.

Output esperado: 5-8 retornos consecutivos donde el alumno **mira atrás por sí solo cada 5-8 pasos**, mantiene TAIL + SIDE, y responde correctamente a espuma entrante sin ayuda.

---

## 2. WHY THIS DRILL MATTERS

La mayoría de beginners relajan en el retorno. Creen que "ya está" cuando se orientaron hacia la orilla. Ese instinto de desconexión es lo que el drill corrige.

La inversión cognitiva (mirar atrás en lugar de adelante) es **no-natural**. El cuerpo humano prefiere mirar hacia donde va, no hacia donde viene la amenaza. El drill instala el nuevo patrón por repetición bajo condiciones reales.

Sin este drill instalado, el alumno graduaría White Belt con un punto ciego: sabría entrar, controlar y girar, pero no volver. El loop no cierra.

---

## 3. PREREQUISITES

- **STP-006 Control Your Board** certificado (TAIL + CENTER + SIDE instalados).
- **STP-007 Go Through Whitewater Standing** certificado (Pass disponible como herramienta reactiva).
- **STP-008 Turn Around Safely** certificado (Turn disponible como herramienta reactiva).
- Alumno en condiciones canónicas (waist-deep, whitewater ≤0.5m).
- Alumno orientado hacia la orilla tras STP-008, tabla en SIDE + TAIL.

Si alguno de estos prerequisitos no está sólido, el drill no se ejecuta. Se regresa a consolidar el paso anterior.

---

## 4. SETUP

1. Coach y alumno en waist-deep, tras completar giro canónico (STP-008).
2. Coach define el **punto de llegada**: línea de arena seca específica (coach señala un punto de referencia en la playa).
3. Coach se posiciona **entre alumno y arena**, a ~3-5m, para observar sin interferir.
4. Coach verifica que hay al menos **1-2 espumas esperables** durante el retorno (si el mar está muerto, el drill no prueba ADJUST).

---

## 5. THE 5 BEATS OF SAFE RETURN

Cada retorno se ejecuta con los 5 key words en loop continuo:

**LOOK → READ → WALK → ADJUST → LAND**

### BEAT 1 — LOOK (cada 5-8 pasos)
- Alumno rota cabeza y parte del torso para escanear hacia atrás.
- No rota 180° (pierde trayectoria); rota lo suficiente para ver el horizonte lateral.
- Coach observable: cabeza del alumno girando.

### BEAT 2 — READ (durante el LOOK)
- Alumno identifica: ¿hay espuma entrante? ¿a qué distancia? ¿qué tamaño?
- Decisión binaria: **continuar caminando** o **prepararse para ADJUST**.
- Coach observable: alumno verbaliza opcional ("nada viene" / "espuma en 5 metros").

### BEAT 3 — WALK (movimiento primario)
- Pasos firmes, controlados, sin correr.
- TAIL + SIDE mantenidos. Tabla al costado del cuerpo.
- **Una mano siempre en TAIL**, otra en CENTER o libre según estabilidad.
- Coach observable: tabla nunca derivando al frente, ritmo de paso estable.

### BEAT 4 — ADJUST (condicional)
- Si READ detectó espuma entrante inminente:
  - Opción A (espuma pequeña y lejana): acelera el paso para llegar antes.
  - Opción B (espuma manejable llegando): ejecuta **STP-007 Pass** sobre la marcha.
  - Opción C (espuma grande o en ángulo malo): ejecuta **STP-008 Turn** y pasa, luego re-orienta hacia orilla y reinicia WALK.
- Coach observable: decisión tomada sin pausa larga; ejecución limpia del paso aplicable.

### BEAT 5 — LAND (cierre)
- Alumno cruza línea de arena seca con tabla controlada.
- Último paso: alumno detiene marcha, tabla en SIDE bajo brazo, verifica que no hay espuma que sorprenda desde atrás.
- Coach observable: transición limpia de agua a arena, sin correr los últimos metros, sin tirar la tabla.

---

## 6. REPETITION STRUCTURE

- **5-8 retornos por sesión.**
- Entre retornos: alumno camina/navega de regreso a punto de partida (waist-deep tras giro), reinicia.
- Total time en agua: 20-30 minutos máximo (fatiga reduce calidad del scanning).

**Progresión durante la sesión:**

| Rep | Foco primario | Coach cue |
|---|---|---|
| 1-2 | LOOK consistente | "Cada 5 pasos mirá atrás." |
| 3-4 | READ + decisión | "¿Qué viene? ¿Qué hacés?" |
| 5-6 | ADJUST natural | Sin cue — alumno decide. Coach observa. |
| 7-8 | Integración completa | "Los 5 beats. Hasta arena seca." |

---

## 7. WHAT THE COACH OBSERVES

**Primary:**
- ¿Alumno mira atrás por iniciativa propia, o solo cuando el coach le dice?
- ¿Mantiene tabla en control mientras mira atrás? (momento crítico: el giro de cabeza no debe comprometer TAIL + SIDE).
- ¿Identifica correctamente la espuma entrante?
- ¿Ejecuta ADJUST limpio sin intervención?
- ¿Llega a arena seca con control, o corre los últimos metros?

**Secondary:**
- Calidad del paso (firmeza, ritmo).
- Tono emocional (relajado pero atento, no ansioso).
- Manos gestionando la tabla activamente.

**Red flags:**
- Cabeza fija hacia adelante durante todo el retorno → ERR-WB-029 activo.
- Alumno ríe, habla, se distrae → ERR-WB-030 activo (retorno pasivo).
- Alumno no responde a espuma entrante visible → ERR-WB-031 activo.
- Tabla derivando al frente mientras mira atrás → degradación de STP-006.

---

## 8. VARIACIONES

### V1 — Return básico (primera sesión)
- Coach verbaliza "mirá atrás" cada cierto intervalo como recordatorio.
- Objetivo: instalar el patrón físico del LOOK.

### V2 — Return autónomo (segunda sesión)
- Coach no dice "mirá atrás". Solo observa si el alumno lo hace por cuenta propia.
- Objetivo: validar que el patrón está instalado internamente.

### V3 — Return con espuma forzada
- Coach espera específicamente una espuma llegando para iniciar el retorno.
- Objetivo: el alumno debe ejecutar ADJUST inevitable.

### V4 — Return con 2 espumas consecutivas
- Durante el retorno llegan 2 espumas en rápida sucesión.
- Objetivo: el alumno mantiene control cognitivo bajo carga sostenida.
- Solo para alumnos avanzados dentro de White Belt.

### V5 — Return con distracción verbal (avanzado)
- Coach le hace una pregunta simple durante el retorno.
- Objetivo: el alumno responde verbalmente pero **no abandona el scanning**.
- Testea si la awareness es automática o consciente. Si el alumno deja de mirar atrás por responder al coach, el patrón no está instalado.

---

## 9. COACH CUES

**Correctivos (durante ejecución):**
- "Look back."
- "Cada 5 pasos."
- "¿Qué viene?"
- "Tabla al costado."

**De integración (post-rep):**
- "Miraste atrás. ¿Cuánto? ¿Cuándo?"
- "¿Qué decidiste al ver esa espuma?"

**Doctrinales (pre-drill / cierre):**
- "El mar está vivo hasta la arena seca."
- "Volver no es descansar. Volver es seguir surfeando hacia la orilla."
- "La espalda hacia la ola es técnica, nunca desconexión."

---

## 10. SUCCESS CRITERIA

✅ **Sesión PASS:**
- 5+ retornos con LOOK consistente (cada 5-8 pasos) sin recordatorio del coach.
- TAIL + SIDE mantenidos durante todos los retornos.
- ADJUST ejecutado correctamente en al menos 1 rep (si hubo espuma).
- LAND limpio en todos los retornos.
- Cero activaciones de ERR-WB-031 (golpes por atrás).

❌ **Sesión NOT PASS:**
- Alumno solo mira atrás con recordatorio explícito.
- 1+ activación de ERR-WB-031.
- Patrón de relajación progresiva durante la sesión.
- Alumno corre los últimos metros o tira la tabla al llegar.

---

## 11. DRILL-LEVEL ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Alumno no gira cabeza por rigidez / miedo | Drill seco en arena: 20 reps de "caminar 5 pasos + mirar atrás" sin tabla |
| Alumno pierde control de tabla al girar cabeza | Reducir velocidad del WALK, mirar atrás con torso apoyado en tabla |
| Alumno se confunde cuándo ADJUST | Coach señala con mano el momento: "Ahora gira" / "Ahora pasá" — luego reduce hasta autonomía |
| Alumno corre los últimos metros | Coach agrega LAND explícito: "Detenete. Respiración. Tabla al costado. Arena seca." |
| Fatiga cognitiva (tras 6 reps) | Cortar sesión. No instalar patrón bajo fatiga. |

---

## 12. DRILL DEPENDENCY CHAIN

Este drill es el **último drill operativo del Block 1 White Belt**. Pone en uso integrado lo siguiente:

- STP-006 Control (TAIL + SIDE durante todo el WALK)
- STP-007 Pass (disponible como herramienta reactiva en ADJUST)
- STP-008 Turn (disponible como herramienta reactiva en ADJUST)
- STP-003 Scanning (invertido — ahora backward scanning)
- STP-002 Safe Zone (definición de LAND target)

Un alumno que completa DRL-WB-09 limpio demuestra que toda la cadena anterior está sólida. Si falla, el punto de regresión se identifica por qué falló (scanning, pass, turn, o control).

---

## 13. CLOSING RITUAL (sesión 3+)

Al completar el último retorno, alumno parado en arena seca dice en voz alta:

> *"Look back. Read the foam. Land with control."*

Coach confirma con silencio / nod. Sesión cerrada. Transición a STP-010 (siguiente bloque: entrada a modo prono).

---

*TSS® White Belt · DRL-WB-09 Safe Return Drill · v1.0*
*IP of Marcelo Castellanos / Enkrateia*
*Closing drill of Block 1 — Entry / Control / Return loop*
$tss$,
  $tss$### ERR-WB-029 — NO BACKWARD AWARENESS

El alumno camina de regreso hacia la orilla **sin mirar hacia atrás**. La cabeza se mantiene fija hacia adelante durante todo el retorno.

### ERR-WB-030 — PASSIVE RETURN / RELAXATION

El alumno trata el retorno como "fin de faena". Se relaja físicamente y cognitivamente antes de llegar a arena seca.

### ERR-WB-031 — FAILURE TO RE-MANEUVER

Durante el retorno, llega una espuma entrante. El alumno la **vio** (o debería haberla visto), pero **no ejecuta ADJUST** — no gira (STP-008), no pasa (STP-007), no acelera, no toma ninguna acción correctiva.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-008']::TEXT[],
  'reading',
  30
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-010',
  'white_belt',
  10,
  $tss$Get on Your Board / Find Sweet Spot$tss$,
  $tss$FIND SWEET SPOT$tss$,
  $tss$Block 2 · M2 (Sweet Spot System / Prone Phase — OPENING STEP)$tss$,
  $tss$# STP-010 — GET ON YOUR BOARD · FIND SWEET SPOT

**Belt:** White Belt · Block 2 · M2 (Sweet Spot System / Prone Phase — OPENING STEP)
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Transicionar al alumno de "persona al lado de la tabla" a "persona conectada con la tabla" encontrando el **sweet spot** — el punto exacto de balance prono donde la tabla flota nivelada, responde correctamente y se mueve eficientemente.

Este es el primer paso del Bloque 2 y abre M2. Es el ancla doctrinal de toda la fase prona: si el sweet spot es incorrecto, todo lo que sigue — alignment, paddle, cobra, catch, pop-up — falla o se degrada. El sweet spot no es una preferencia, es una condición mecánica de la tabla.

---

## THE 5 KEY WORDS

**MOUNT · CHEST · CENTER · LEVEL · READY**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **MOUNT** | Entrada limpia a la tabla | Manos en rails, pecho al centro, una pierna, luego la otra |
| 2 | **CHEST** | Pecho al centro de la tabla | Pecho apoyado en el eje central, no adelantado ni atrasado |
| 3 | **CENTER** | Cuerpo centrado eje longitudinal | Alumno no cargado hacia un rail, balance simétrico |
| 4 | **LEVEL** | Tabla flota nivelada | Nose apenas flotando, tail apenas sumergido, línea natural |
| 5 | **READY** | Posición prona estable lista | Pecho ligeramente elevado, hombros atrás, piernas juntas, listo para alinear o remar |

---

## ANCHOR PHRASE

> **"Mount clean. Center first. Board floats level."**

**Micro-cue:** *"Sweet spot before anything else."*

---

## WHY THIS STEP MATTERS

**Mecánica real de la tabla:**
La tabla está diseñada con una línea hidrodinámica específica. Solo funciona correctamente si el peso del surfista se distribuye en el punto de diseño. Fuera de ese punto, la tabla deja de ser la herramienta que fue construida para ser y pasa a ser un obstáculo.

**Umbral M2:**
Este paso abre el Módulo 2 (Sweet Spot System / Prone Phase). Block 1 fue entry-control-return de pie. Block 2 empieza acá, en el momento en que el cuerpo del alumno se acopla a la tabla. La transición cognitiva es mayor de lo que parece: el alumno deja de "manejar" la tabla desde afuera y empieza a "ser parte" de la tabla.

**Base de todo lo que sigue:**
- Sin sweet spot correcto → no hay alignment (STP-011) posible.
- Sin sweet spot correcto → el paddle (STP-012) es ineficiente y cansa al alumno.
- Sin sweet spot correcto → cobra (STP-013) empuja contra la tabla en lugar de trabajar con ella.
- Sin sweet spot correcto → pop-up (STP-016) nace desde un error de origen y falla.

**Distinción White Belt:**
Un alumno que entra a la tabla apurado, rema sin verificar posición, y persigue olas desde un sweet spot incorrecto **no ha entrado realmente a M2**. Es el momento doctrinal donde el coach debe imponer el ritmo: no se rema hasta que el sweet spot esté.

---

## BOUNDARY BOX

✅ **EMPIEZA:** en el momento en que el alumno trepa a la tabla (post control estable al costado, post entorno seguro).

✅ **TERMINA:** cuando el alumno encuentra el sweet spot correcto, la tabla flota nivelada, el cuerpo está centrado y estable en prono, listo para alinear (STP-011) o remar (STP-012).

❌ **NO incluye:**
- Alineación con la espuma (STP-011)
- Paddle para catch (STP-012)
- Cobra (STP-013)
- Cualquier acción de catch

**Cross-step dependency:**
- STP-006 (Control Your Board) debe estar certificado — tabla bajo control al costado.
- STP-007 (Pass Whitewater) certificado — el alumno puede mantener tabla estable con espuma.
- Este paso abre M2. Antes de STP-010 no hay fase prona.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-010 en dos sesiones PASS:

1. **Mount limpio:** alumno trepa a la tabla sin golpes, sin derivar, sin perder control lateral — 5 reps consecutivos.
2. **Sweet spot autónomo:** alumno encuentra el sweet spot con máximo 2 ajustes, sin coach diciendo "atrás" o "adelante".
3. **Level verificable:** tabla visiblemente nivelada (nose apenas sobre el agua, tail apenas sumergido).
4. **Postura prona correcta:** pecho ligeramente elevado, hombros atrás, piernas juntas, pies relajados.
5. **Awareness verbal:** alumno puede verbalizar "estoy centrado / muy adelante / muy atrás" sin mirar al coach.
6. **Orden respetado:** alumno NO rema antes de encontrar sweet spot, aunque llegue una ola.

---

## COACHING PRINCIPLE

El coach de STP-010 no enseña "cómo subirse a la tabla". Enseña "cómo encontrar el punto mecánico correcto". La diferencia es crítica.

El coach debe **mostrar los dos errores primero** (muy adelante → nose dive, muy atrás → stall) y luego el correcto. Si el alumno solo ve la versión correcta, no entiende qué está buscando. Debe sentir el error para reconocer el acierto.

**Regla doctrinal inviolable:** sweet spot antes de cualquier otra cosa. Si el alumno rema sin sweet spot, el coach interrumpe. Si persigue una ola sin sweet spot, el coach interrumpe. Esto se instala acá para todo el resto de White Belt.

---

*TSS® White Belt · STP-010 Get on Your Board · Find Sweet Spot v1.0*
*IP of Marcelo Castellanos / Enkrateia*
*Opening step of M2 — Sweet Spot System / Prone Phase*
$tss$,
  $tss$# DRL-WB-10 — SWEET SPOT DISCOVERY DRILL

**Step:** STP-010 Get on Your Board · Find Sweet Spot
**Belt:** White Belt · Block 2 · M2 OPENING
**Version:** v1.0

---

## OBJECTIVE

Enseñar al alumno a (a) subirse a la tabla de manera limpia y repetible, (b) encontrar el sweet spot encontrando primero los dos errores (muy adelante y muy atrás) y luego el centro correcto, y (c) instalar el principio doctrinal "sweet spot antes de cualquier otra cosa".

---

## WHY THIS DRILL MATTERS

La mayoría de alumnos blancos fallan en todos los pasos siguientes (catch, cobra, pop-up) no por los pasos en sí, sino porque entran a ellos desde un sweet spot incorrecto. Corregir el pop-up cuando el problema está en el sweet spot es desperdicio de tiempo. Este drill instala la base mecánica de toda M2.

El drill es también el primer momento donde el alumno aprende a **leer su propio cuerpo sobre la tabla** sin intervención del coach. Es cognitivo tanto como mecánico.

---

## COACH ROLE

Demostrar el mount, mostrar los dos errores (adelante y atrás), luego el correcto. No permitir que el alumno rema o persiga olas durante el drill — esto es un drill de posicionamiento, no de surf. El coach debe interrumpir toda acción prematura.

---

## DELIVERY METHOD (EDPF)

- **Explain:** "Muy adelante → la tabla se clava. Muy atrás → la tabla arrastra. El sweet spot es el punto donde la tabla flota como debe."
- **Demonstrate:** coach se sube, muestra posición muy adelante, muy atrás, y centrada — verbalizando qué ve el alumno en cada una.
- **Participate:** alumno repite mount + encuentra los dos errores + encuentra el centro.
- **Feedback:** coach corrige posición, balance lateral, postura prona.

---

## SETUP

- Agua calma o muy poca espuma (waist-deep máximo).
- Tabla ya en el agua, bajo control (STP-006 certificado).
- Sin ola activa entrante durante los primeros reps.
- Coach en el agua, al lado pero no sobre el alumno.

---

## STEP-BY-STEP

### Rep 1 — Mount limpio
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
1. Alumno ajusta desde atrás hacia adelante lentamente.
2. Busca el punto donde la tabla "deja de pelear" — flota nivelada.
3. Coach confirma visualmente: nose apenas flotando, tail apenas sumergido.
4. Alumno verbaliza: *"estoy en el sweet spot"*.

### Rep 5 — Reset + repetición
1. Alumno sale de la tabla (vuelve a STP-006 position al lado).
2. Hace mount nuevamente.
3. Encuentra sweet spot directamente, sin pasar por los errores.
4. Coach mide: ¿cuántos ajustes necesita? Target: máximo 2.

---

## REPETITIONS

5-8 reps mínimos. Target de certificación: alumno encuentra sweet spot con ≤2 ajustes en reps 6-8.

---

## PROGRESSION (Dual Mode)

**CLÁSICO (sesiones 1-2):** coach marca cada error y el correcto. Alumno ejecuta pasos dirigidos. Foco en mecánica limpia.

**ECOLÓGICO (sesión 3+):** coach se calla. Alumno hace mount → tabla le da el feedback → alumno ajusta. Coach interviene solo si hay falla mecánica o ritual.

---

## VARIATIONS

**V1 — Mount repetido:** solo mounts (bajarse, subirse) sin búsqueda de sweet spot. Para alumnos que luchan con el mount.

**V2 — Ojos cerrados:** alumno con mount hecho, cierra ojos, busca sweet spot por sensación. Entrena propiocepción.

**V3 — Verbalización obligatoria:** alumno debe decir "adelante / atrás / centro" en cada rep antes de que coach lo confirme.

**V4 — Con ola suave:** después de reps 1-5, llega ola. Alumno debe mantener sweet spot mientras pasa espuma pequeña. No se rema.

**V5 — Test del orden:** coach dice "rema" falsamente antes de sweet spot. Alumno NO debe remar. Instala la regla doctrinal.

---

## WHAT THE COACH OBSERVES

- ¿Mount limpio sin golpes ni derivar?
- ¿Pecho al centro o desplazado a un rail?
- ¿Cuántos ajustes hacen falta para encontrar sweet spot?
- ¿Nose apenas flotando?
- ¿Tail no hundido pero tampoco flotando alto?
- ¿Pecho ligeramente elevado, hombros atrás?
- ¿Piernas juntas, pies relajados?
- ¿Alumno puede verbalizar qué siente?
- ¿Alumno respeta el orden (no rema antes de sweet spot)?

---

## COMMON ERRORS

### Student errors
- Mount apurado, sin control (tabla derivando).
- Saltar etapa de descubrimiento — alumno "cree" saber dónde está.
- Quedar desplazado a un rail (off-center lateral).
- Pecho colapsado o exageradamente elevado.
- Legs abiertas, pies tensos.
- Remar inmediatamente sin verificar sweet spot.

### Coach errors
- Corregir antes de que el alumno sienta el error.
- Saltar demostración de errores (muestra solo lo correcto).
- Permitir remada o catch durante drill de posicionamiento.
- No interrumpir cuando el alumno rompe el orden.

---

## COACH CUES

- "Mount limpio."
- "Pecho al centro."
- "Muy adelante. Sentilo."
- "Muy atrás. Sentilo."
- "Centro. Ahí."
- "Nose apenas flotando."
- "Sweet spot antes de cualquier otra cosa."
- "Slide until it glides."

---

## SUCCESS CRITERIA

1. Mount limpio y consistente (5 reps sin ensayo-error visible).
2. Alumno identifica verbalmente los dos errores (adelante/atrás) sin ayuda.
3. Alumno encuentra sweet spot en ≤2 ajustes (reps 6-8).
4. Tabla visiblemente nivelada en reps finales.
5. Alumno respeta el orden doctrinal: no rema, no persigue ola hasta que sweet spot está.

---

*TSS® White Belt · DRL-WB-10 Sweet Spot Discovery Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
*Opening drill of M2 — Sweet Spot System / Prone Phase*
$tss$,
  $tss$### ERR-WB-032 — NOSE DIVE POSITION

El alumno está posicionado demasiado adelante sobre la tabla. El peso del cuerpo se concentra sobre el nose.

### ERR-WB-033 — STALL POSITION

El alumno está posicionado demasiado atrás sobre la tabla. El peso se concentra sobre el tail.

### ERR-WB-034 — PREMATURE PADDLING

El alumno empieza a remar antes de haber encontrado el sweet spot. Salta la fase de posicionamiento porque ve una ola, o porque tiene ansiedad de catch, o porque no se instaló la regla doctrinal.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-009']::TEXT[],
  'reading',
  31
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-011',
  'white_belt',
  11,
  $tss$Get Aligned with the White Water$tss$,
  NULL,
  $tss$Block 2 · M2 (Sweet Spot System / Prone Phase)$tss$,
  $tss$# STP-011 — GET ALIGNED WITH THE WHITE WATER

**Belt:** White Belt · Block 2 · M2 (Sweet Spot System / Prone Phase)
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Posicionar la tabla para que su eje longitudinal coincida con la dirección del flujo de la espuma. Este paso convierte la interacción tabla-espuma de un "golpe lateral que desestabiliza" en un "empuje limpio que transporta". Es el puente mecánico entre sweet spot (STP-010) y paddle (STP-012).

Sin alignment, el paddle trabaja contra la ola. Con alignment, el paddle trabaja con la ola.

---

## THE 5 KEY WORDS

**SWEET · READ · SHOULDER · ALIGN · READY**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **SWEET** | Sweet spot confirmado | Alumno ya nivelado (STP-010 cerrado), no debajo ni arriba |
| 2 | **READ** | Lectura de la espuma | Alumno identifica dirección del foam entrante |
| 3 | **SHOULDER** | Mirada por encima del hombro | Rotación cabeza/torso para confirmar alineación con foam |
| 4 | **ALIGN** | Nose apunta donde va el foam | Eje longitudinal tabla = eje energía ola |
| 5 | **READY** | Reset adelante, posición arrow | Vista al frente, cuerpo largo, respiración, listo para paddle |

---

## ANCHOR PHRASE

> **"Read the foam. Point the nose. Get ready."**

**Micro-cue:** *"Align first. Paddle second."*

---

## WHY THIS STEP MATTERS

**Mecánica real de la ola:**
La espuma es energía direccional. Si la tabla está cruzada respecto a esa energía, la espuma choca contra el canto y no empuja. Si la tabla está alineada, la espuma pasa debajo del nose al tail y genera transporte. La diferencia es absoluta — no hay alineación "parcial" que funcione.

**Orden doctrinal:**
Este paso enforza la jerarquía de M2: sweet spot → alignment → paddle. Saltarse alignment es saltarse física. El alumno que rema sin alinear está remando para caerse de costado o perder la ola.

**Inversión cognitiva momentánea:**
El alumno debe mirar por encima del hombro (ver atrás) para luego resetear adelante. Es un mini loop cognitivo similar al de STP-009, pero ahora en fase prona. Primer momento donde el alumno mira atrás estando acostado — diferente en mecánica de cuello y rotación de torso.

**Base de todo catch:**
- Sin alignment → paddle ineficiente (STP-012 degradado).
- Sin alignment → catch fallido (STP siguiente depende de esto).
- Sin alignment → pop-up desde ángulo torcido (STP-016 compromete).

---

## BOUNDARY BOX

✅ **EMPIEZA:** una vez que el alumno confirma sweet spot (STP-010 cerrado, tabla nivelada, prono estable).

✅ **TERMINA:** cuando el nose apunta en dirección del foam, el alumno está en posición arrow con vista adelante, listo para iniciar paddle.

❌ **NO incluye:**
- Paddle (STP-012)
- Cobra (STP-013)
- Catch
- Pop-up (STP-016)
- Elección de línea

**Cross-step dependency:**
- STP-010 (Sweet Spot) debe estar certificado — sin base mecánica, no hay alignment posible.
- Este paso enseña rotación prona que preparará STP-025 (Turn Left/Right Lying on Board).

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-011 en dos sesiones PASS:

1. **Sweet spot mantenido durante alignment:** alumno no pierde sweet spot mientras gira cabeza/torso.
2. **Shoulder check autónomo:** alumno mira por encima del hombro sin cue del coach.
3. **Alignment preciso:** nose apunta dentro de ±10° de la dirección real del foam.
4. **Reset limpio:** alumno vuelve la vista adelante y adopta posición arrow sin colapsar postura.
5. **Orden doctrinal:** alumno NO rema antes de confirmar alignment, aunque la ola esté cerca.
6. **Verbalización:** alumno puede decir "el foam va para allá" antes de alinear.

---

## COACHING PRINCIPLE

El coach de STP-011 enseña a **leer el agua**, no solo a girar la tabla. Si el alumno alinea sin leer, está apuntando al azar. La lectura es el 60% del paso; el giro mecánico es el 40%.

El coach debe resistir la tentación de "apuntar por el alumno". Si dice "alineá ahí", el alumno nunca aprende a leer. En cambio: "¿hacia dónde va el foam?" — y que el alumno diga, luego alinee.

**Regla visual del coach:** mirar el nose de la tabla y trazar una línea imaginaria hacia donde apunta. Esa línea debe coincidir con la dirección de la espuma. Si se cruzan, el alignment está mal.

---

*TSS® White Belt · STP-011 Get Aligned with the White Water v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-11 — WHITEWATER ALIGNMENT DRILL

**Step:** STP-011 Get Aligned with the White Water
**Belt:** White Belt · Block 2 · M2
**Version:** v1.0

---

## OBJECTIVE

Enseñar al alumno a (a) leer la dirección de la espuma entrante, (b) alinear el nose de la tabla con esa dirección, y (c) resetear a posición arrow sin perder sweet spot.

---

## WHY THIS DRILL MATTERS

Sin alignment, el paddle es trabajo desperdiciado y el catch es imposible. Este drill instala la lectura del agua como paso previo e inviolable al paddle. Enseña al alumno que remar mal apuntado no es remar — es patinar de costado.

---

## COACH ROLE

Ayudar al alumno a leer la espuma (no alinear por él). Demostrar shoulder check. Verificar ángulo del nose. Detener cualquier paddle prematuro.

---

## DELIVERY METHOD (EDPF)

- **Explain:** "La espuma tiene dirección. La tabla debe ir en esa dirección. Si está cruzada, te tira de costado."
- **Demonstrate:** coach muestra shoulder check, alignment, reset adelante — en secuencia lenta.
- **Participate:** alumno repite secuencia completa 5-8 veces.
- **Feedback:** una cosa por rep (ángulo / shoulder check / reset). No cargar al alumno con todo a la vez.

---

## SETUP

- Alumno ya en sweet spot (STP-010 cerrado).
- Agua con espuma consistente (waist-deep, foam predecible).
- Coach al costado pero no en la línea de paddle.
- Sin intención de catch en este drill — es de alignment pura.

---

## STEP-BY-STEP

### Rep 1 — Confirmar sweet spot
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
2. Cuerpo largo, posición arrow, piernas juntas.
3. Respiración controlada.
4. Coach confirma: *"Aligned. Ready."*

### Reps 6-8 — Secuencia completa fluida
1. Alumno ejecuta SWEET → READ → SHOULDER → ALIGN → READY sin pausa.
2. Target: ≤5 segundos de ejecución limpia.

---

## REPETITIONS

5-8 reps de secuencia completa. NO linkear a paddle hasta que alignment esté instalado.

---

## PROGRESSION (Dual Mode)

**CLÁSICO (sesiones 1-2):** coach guía cada sub-paso, pide verbalización, corrige ángulo explícitamente. Foco en mecánica limpia y orden.

**ECOLÓGICO (sesión 3+):** coach pregunta solo *"¿listo?"*. Alumno lee foam, hace shoulder check, alinea, da thumbs up o verbaliza. Coach interviene solo si hay falla mecánica o si el alumno intenta remar sin alinear.

---

## VARIATIONS

**V1 — Espuma variable:** cambiar de lugar entre reps para forzar lectura nueva cada vez.

**V2 — Verbalización obligatoria:** alumno debe decir "foam viene de ___, alineo hacia ___" antes de mover la tabla.

**V3 — Shoulder check silencioso:** coach solo dice "SHOULDER" y el alumno ejecuta resto sin guía.

**V4 — Alignment con ola cercana:** coach fuerza tempo corto. Alumno debe ejecutar secuencia antes de que llegue foam. Enseña economía de movimiento.

**V5 — Test de orden (doctrinal):** coach dice "remá" prematuramente. Alumno NO rema, completa alignment, luego rema.

---

## WHAT THE COACH OBSERVES

- ¿Alumno mantiene sweet spot durante rotación?
- ¿Shoulder check real o amague?
- ¿Verbaliza/identifica dirección del foam correctamente?
- ¿Ángulo del nose preciso o cruzado?
- ¿Reset adelante limpio (no colapsa postura)?
- ¿Respeta orden doctrinal (no paddle prematuro)?
- ¿Ejecuta secuencia fluida en reps finales o sigue sub-paso por sub-paso?

---

## COMMON ERRORS

### Student errors
- No hace shoulder check (alinea al azar).
- Pierde sweet spot al rotar torso.
- Nose cruzado respecto al foam (lee mal o no corrige).
- Rema antes de terminar alignment.
- Se queda mirando atrás demasiado tiempo (no resetea).
- Postura prona colapsa al bajar cabeza.

### Coach errors
- "Alineá ahí" en lugar de "¿dónde va el foam?".
- Corregir múltiples cosas a la vez.
- No detener paddle prematuro.
- Permitir amague de shoulder check.
- Saltarse verificación de ángulo.

---

## COACH CUES

- "Sweet spot bien."
- "¿Dónde va el foam?"
- "Shoulder check. Mirá bien."
- "Point the nose where the foam goes."
- "Align first. Paddle second."
- "Breathe. Ready."
- "Reset adelante. Posición arrow."

---

## SUCCESS CRITERIA

1. Sweet spot mantenido durante todo el alignment.
2. Shoulder check autónomo (sin cue) en reps finales.
3. Nose apuntando dentro de ±10° de la dirección del foam.
4. Reset a ready position limpio, sin perder prono.
5. Orden doctrinal respetado: no paddle antes de READY confirmado.
6. Secuencia completa ejecutable en ≤5 segundos (reps 6-8).

---

*TSS® White Belt · DRL-WB-11 Whitewater Alignment Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-035 — ANGLED NOSE

El alumno inicia paddle con el nose de la tabla cruzado respecto a la dirección del foam. La tabla está desalineada.

### ERR-WB-036 — NO SHOULDER CHECK

El alumno omite la mirada por encima del hombro antes de alinear la tabla. Asume la dirección del foam sin verificar.

### ERR-WB-037 — ALIGNMENT DRIFT

El alumno alinea correctamente, pero entre el momento de alinear y el momento de remar pasa demasiado tiempo. La tabla se desalinea por corriente, viento, o la propia respiración del alumno.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-010']::TEXT[],
  'reading',
  32
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-012',
  'white_belt',
  12,
  $tss$Paddle to Catch White Water$tss$,
  NULL,
  $tss$Block 2 · M2 (Sweet Spot System / Prone Phase)$tss$,
  $tss$# STP-012 — PADDLE TO CATCH WHITE WATER

**Belt:** White Belt · Block 2 · M2 (Sweet Spot System / Prone Phase)
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Generar velocidad direccional para conectar con la energía de la espuma y permitir que la ola lo transporte. Este es el paso donde el alumno deja de **esperar** la ola y empieza a **ir al encuentro** de la ola.

La física es clara: el alumno no puede superar la velocidad del foam remando puro (~1.15 m/s vs ~2.8–3.1 m/s). El catch depende de tres cosas: distancia, aceleración, y dejar que la ola termine el trabajo. El paddle no es esfuerzo ciego — es física aplicada.

---

## THE 5 KEY WORDS

**DISTANCE · START · ONE-TWO · FORWARD · COMMIT**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **DISTANCE** | Lectura de distancia al foam | Alumno mide espacio: 1-4m dependiendo de fuerza y velocidad |
| 2 | **START** | Inicio temprano | Paddle arranca con espacio suficiente para generar velocidad |
| 3 | **ONE-TWO** | Ritmo 1-2 limpio | Un brazo, luego el otro, alternado, con entrada por dedos |
| 4 | **FORWARD** | Tracción hacia atrás = avance adelante | Mano tira agua hacia atrás; tabla se mueve adelante, no abajo |
| 5 | **COMMIT** | Remada continua hasta pick-up | Sin pausas, sin titubeos, hasta que la ola tome la tabla |

---

## ANCHOR PHRASE

> **"Start early. One-two. Don't stop."**

**Micro-cue:** *"Pull back, go forward."*

---

## WHY THIS STEP MATTERS

**Física aplicada (no metáfora):**
- Foam a waist-deep (~0.8-1.0m): velocidad ~2.8-3.1 m/s (~10-11 km/h).
- Paddle sostenido: ~1.15 m/s.
- Conclusión: alumno no puede ganar velocidad del foam en línea recta.
- **El catch depende de:** (1) distancia inicial que da tiempo de aceleración, (2) aceleración hasta pico de velocidad propia, (3) permitir que la ola haga el trabajo final.

**Instinto vs física:**
El alumno nuevo intuitivamente rema tarde (cuando ya ve la ola encima) y rema con ambos brazos simultáneamente (pánico). Ambos instintos son incorrectos. El coach traduce la física a acción: arrancar antes, remar con ritmo alternado.

**Eficiencia vs esfuerzo:**
La remada débil no se arregla con "más fuerte". Se arregla con técnica: entrada limpia, elbow high, pull back (no push down). Empujar agua hacia abajo levanta el nose y tira hacia arriba, sin mover la tabla adelante.

**Doctrinal rule:**
Pull back, go forward. Si el agua va hacia atrás, la tabla va hacia adelante. Si el agua va hacia abajo, la tabla se levanta y no avanza. Es física — no estilo.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno alineado y en ready position (STP-011 cerrado).

✅ **TERMINA:** cuando la ola conecta con la tabla y genera pick-up — alumno transiciona a cobra (STP-013) o coloca manos para siguiente fase.

❌ **NO incluye:**
- Sweet spot (STP-010)
- Alignment (STP-011)
- Cobra (STP-013)
- Line choice
- Pop-up (STP-016)

**Cross-step dependency:**
- STP-010 + STP-011 deben estar certificados.
- Este paso entrega al alumno al catch. Si falla, los pasos siguientes no pueden ejecutarse.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-012 en dos sesiones PASS:

1. **Timing correcto:** alumno arranca paddle con distancia suficiente (1-4m dependiendo de condiciones) — no tarde, no temprano.
2. **Ritmo 1-2 limpio:** brazos alternados, no simultáneos, no caóticos.
3. **Dirección correcta del pull:** tabla se mueve adelante, no arriba. Observable: nose no se levanta al remar.
4. **Posición arrow mantenida:** cabeza estable, cuerpo largo, sin rotación excesiva.
5. **Commitment:** alumno rema hasta pick-up, sin parar ante inseguridad.
6. **Catch real:** 3+ catches en una sesión (la ola toma la tabla de manera visible).

---

## COACHING PRINCIPLE

El coach de STP-012 enseña **física translada a ritmo**, no a gritos. Si el alumno no entiende por qué arranca temprano, va a volver a arrancar tarde la próxima vez. El "por qué" (la velocidad del foam vs paddle) es el que instala el hábito.

**Regla de intervención:** una corrección por rep. Si el alumno arranca tarde + rema mal + para temprano, el coach corrige solo una cosa a la vez — la más crítica. Cargar al alumno con tres cosas simultáneas no corrige ninguna.

**El coach elige las olas.** No todas las olas son iguales para entrenar catch. Foam caótico o demasiado rápido no enseña — frustra. Foam consistente, predecible, de tamaño manejable es el ambiente de entrenamiento.

---

## PHYSICS REFERENCE (for coach)

| Profundidad | Velocidad espuma aprox |
|---|---|
| 0.8 m | ~2.8 m/s (~10.1 km/h) |
| 1.0 m | ~3.1 m/s (~11.3 km/h) |
| 1.2 m | ~3.4 m/s (~12.4 km/h) |

**Paddling sostenido publicado:** ~1.15 m/s.

**Implicación:** el alumno no puede igualar velocidad del foam puramente remando. Depende de distancia + aceleración + pick-up.

Source: coastalwiki.org (ver canon input para ecuaciones completas).

---

*TSS® White Belt · STP-012 Paddle to Catch White Water v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-12 — WHITEWATER CATCH PADDLE DRILL

**Step:** STP-012 Paddle to Catch White Water
**Belt:** White Belt · Block 2 · M2
**Version:** v1.0

---

## OBJECTIVE

Enseñar al alumno a (a) leer distancia y timing, (b) ejecutar 1-2 con técnica forward-driving, y (c) mantener commitment hasta que la ola toma la tabla.

---

## WHY THIS DRILL MATTERS

Es el primer catch real del alumno. Sin este drill bien instalado, el alumno vive en el ciclo de frustración: "rema, rema, la ola pasa, la ola se va". Este drill traduce la física del agua a ritmo corporal.

---

## COACH ROLE

Elegir olas apropiadas. Posicionar al alumno a distancia correcta. Corregir una cosa por rep. Reforzar rhythm y breathing. No pedir cobra antes de que el catch sea real.

---

## DELIVERY METHOD (EDPF)

- **Explain:** "El foam va más rápido que vos remando. No podés alcanzarlo si arrancás tarde. Arrancás antes, acelerás fuerte, y la ola te termina de tomar."
- **Demonstrate:** coach muestra 1-2 con entrada por dedos, elbow high, pull back, body arrow.
- **Participate:** alumno intenta catches sucesivos (5-10 reps).
- **Feedback:** uno por rep — timing / técnica / commitment.

---

## SETUP

- Alumno en sweet spot + alineado (STP-010 y STP-011 cerrados).
- Agua waist-deep, foam predecible.
- Coach elige distancia inicial según fuerza del foam: 1-4m.
- Coach se ubica al costado (no delante ni detrás).

---

## STEP-BY-STEP

### Rep 1 — Ready position confirmada
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
3. Alumno mantiene cuerpo estable en el momento de pick-up.

### Reset — próxima ola
1. Volver a sweet spot, re-alinear (STP-011 micro-check).
2. Repetir.

---

## REPETITIONS

5-10 catches por sesión. Target de certificación: 3+ catches reales limpios en una sesión.

---

## PROGRESSION (Dual Mode)

**CLÁSICO (sesiones 1-2):** coach decide cuándo arrancar ("Go"), corrige técnica por rep, elige olas. Alumno ejecuta dirigido.

**ECOLÓGICO (sesión 3+):** coach se calla. Alumno lee distancia, decide timing, ejecuta. Coach interviene solo si técnica degradada críticamente o si no hace commit.

---

## VARIATIONS

**V1 — Distance callibration:** coach cambia ubicación entre reps — alumno debe reajustar timing cada vez.

**V2 — Técnica pura (sin catch):** alumno rema sobre flat water con ritmo 1-2 correcto. Enfoque mecánico puro, sin presión de catch.

**V3 — Commit test:** coach finge decir "la perdiste" antes de que la ola llegue. Alumno debe NO parar. Enseña commitment.

**V4 — Stroke count:** coach cuenta strokes en voz alta. Alumno aprende tempo externo.

**V5 — Ola con decisión:** el coach no elige la ola — el alumno debe identificar cuál ola tomar. Decisión + ejecución.

---

## WHAT THE COACH OBSERVES

- ¿Arranca con distancia suficiente?
- ¿Ritmo 1-2 alternado o ambos brazos simultáneos?
- ¿Tabla avanza o se levanta el nose?
- ¿Entrada limpia (dedos) o splashy?
- ¿Elbow high en recovery o caído?
- ¿Cuerpo arrow estable o cabeza rotando?
- ¿Rema hasta pick-up o para antes?
- ¿Respira o aguanta aire?

---

## COMMON ERRORS

### Student errors
- Arranca tarde (foam ya encima).
- Ambos brazos al mismo tiempo (pánico).
- Strokes cortos y splashy.
- Push down en lugar de pull back.
- Cabeza rotando con cada brazada.
- Para antes de pick-up.
- Aguanta respiración.

### Coach errors
- Elegir foam demasiado rápido/grande/caótico.
- Corregir 3 cosas al mismo tiempo.
- Pedir cobra antes del catch real.
- No verificar timing.
- Dejar al alumno con solo "remá más fuerte".

---

## COACH CUES

- "Start early."
- "One-two. One-two."
- "Long strokes."
- "Pull back, go forward."
- "Fingers first. Elbow high."
- "Arrow body."
- "Don't stop."
- "Breathe."
- "Commit."

---

## SUCCESS CRITERIA

1. Arranque con timing correcto (1-4m según condiciones).
2. Ritmo 1-2 alternado, entrada limpia, pull back.
3. Tabla se mueve adelante, nose estable.
4. Cuerpo arrow, cabeza estable, respiración presente.
5. Commitment hasta pick-up.
6. 3+ catches reales en reps finales.

---

*TSS® White Belt · DRL-WB-12 Whitewater Catch Paddle Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-038 — LATE PADDLING START

El alumno inicia el paddle cuando la espuma ya está demasiado cerca o ya encima. No tiene espacio ni tiempo para generar velocidad.

### ERR-WB-039 — DOWNWARD PUSH

El alumno entra la mano al agua con una trayectoria que empuja el agua hacia abajo en lugar de tirar el agua hacia atrás. La fuerza generada no mueve la tabla adelante — la levanta.

### ERR-WB-040 — STOPPING BEFORE CONTACT

El alumno ejecuta paddle correctamente al inicio, pero detiene la remada uno o dos strokes antes de que la espuma tome la tabla. El momento crítico del pick-up se pierde.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-011']::TEXT[],
  'reading',
  33
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-013',
  'white_belt',
  13,
  $tss$Cobra Turn Left and Right$tss$,
  NULL,
  $tss$Block 2 · M2 (Sweet Spot System / Prone Phase)$tss$,
  $tss$# STP-013 — COBRA + TURN LEFT AND RIGHT

**Belt:** White Belt · Block 2 · M2 (Sweet Spot System / Prone Phase)
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno a, una vez tomado por la ola, (a) entrar a la posición de cobra, (b) liberar presión del nose, (c) estabilizar la navegación prona, y (d) iniciar el primer control direccional izquierda/derecha usando visión, oblicuos, y presión en rail.

Es el primer momento donde el alumno **maneja la tabla** en lugar de solo ser transportado. Este paso abre la relación de vida entre surfista y rail — la misma relación que se profundizará en cada belt.

---

## THE 5 KEY WORDS

**HANDS · CHEST · EYES · RAIL · STEER**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **HANDS** | Manos a altura de costillas | Manos ancladas al lado del pecho, no adelantadas |
| 2 | **CHEST** | Pecho elevado (cobra lift) | Brazos extendidos, pecho arriba, libera nose |
| 3 | **EYES** | Vista adelante, luego donde querés ir | Mirada dirige movimiento |
| 4 | **RAIL** | Presión en un rail | Un rail se hunde ligeramente, no ambos |
| 5 | **STEER** | Giro controlado L/R | Tabla responde a visión + oblicuos + rail |

---

## ANCHOR PHRASE

> **"Hands to ribs. Chest up. Look where you go."**

**Micro-cue:** *"Cobra first. Then steer."*

---

## WHY THIS STEP MATTERS

**Nose release (física):**
Cobra levanta el pecho → peso se desplaza ligeramente atrás → nose se libera → tabla deja de enterrar y empieza a fluir. Sin cobra, el nose puede clavar y cortar el ride.

**Preparación de pop-up:**
Las manos en cobra están exactamente donde deben estar para pop-up (STP-016). Cobra no es solo una posición — es la **rampa** hacia pop-up.

**Primer control direccional:**
Por primera vez el alumno no solo sobrevive la ola — empieza a dirigirla. Es un cambio cognitivo mayor: pasar de **pasajero** a **conductor**.

**Relación surfista-rail:**
La presión en rail que el alumno descubre acá es la misma que va a usar el resto de su carrera surfera — solo más sofisticada. Acá se instala la base.

**Body position = speed vs maneuverability:**
- Más atrás → más maniobra, menos velocidad.
- Más adelante → más velocidad, menos maniobra.
Esta dualidad se enseña acá por primera vez y acompaña al alumno en todos los belts siguientes.

---

## BOUNDARY BOX

✅ **EMPIEZA:** cuando la ola ha tomado al alumno (pick-up real de STP-012).

✅ **TERMINA:** cobra establecida + control direccional L/R iniciado (giros básicos ejecutados intencionalmente).

❌ **NO incluye:**
- Pop-up (STP-016)
- Line choice estratégico (reservado para steps posteriores)
- Maniobras de pie
- Prone dismount (STP-014)

**Cross-step dependency:**
- STP-010, STP-011, STP-012 deben estar certificados.
- Este paso prepara STP-014 (Prone Dismount) y especialmente STP-016 (Pop-Up).
- La sensación de rail de acá se conecta directamente con STP-021 (Turn Backside) y STP-022 (Turn Frontside).

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-013 en dos sesiones PASS:

1. **Cobra entry consistente:** manos a ribs + chest up + eyes forward, post-catch, en 5+ reps.
2. **Nose release visible:** tabla estable, nose no clava, ride fluido.
3. **Control direccional L/R:** alumno ejecuta al menos 3 giros a derecha y 3 a izquierda intencionalmente en la sesión.
4. **Vision-body connection:** alumno mira hacia donde va antes de mover (no solo mueve al azar).
5. **Rail pressure real:** coach confirma visualmente un rail hundido más que el otro.
6. **Orden doctrinal:** alumno entra cobra primero, luego steerea — no intenta girar antes de cobra estable.

---

## COACHING PRINCIPLE

El coach de STP-013 debe distinguir **cobra** de **turning** como dos problemas separados. Si el alumno no tiene cobra estable, intentar enseñar turning es imposible — primero se fija cobra.

**Regla de diagnóstico:** si el alumno no gira, el problema puede estar en:
- Cobra ausente (no tiene base).
- No usa obliques (rigidez).
- No usa vision (mira al piso o al nose).
- No ejerce rail pressure (solo cambia peso vertical).
- Body position muy adelante (tabla no responde).

Cada uno requiere corrección distinta. No es "intentá girar más".

**Enseñanza en seco:** siempre mostrar primero en arena cómo se activan los obliques y cómo se presiona un rail desde acostado. El concepto es abstracto para un alumno nuevo — se clarifica con demo visible.

---

*TSS® White Belt · STP-013 Cobra + Turn Left and Right v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-13 — COBRA RAIL CONTROL DRILL

**Step:** STP-013 Cobra + Turn Left and Right
**Belt:** White Belt · Block 2 · M2
**Version:** v1.0

---

## OBJECTIVE

Enseñar al alumno a (a) entrar a cobra con control inmediatamente después del pick-up, (b) liberar presión del nose y estabilizar el ride, y (c) iniciar el primer control direccional izquierda/derecha usando visión, oblicuos, y presión de rail.

---

## WHY THIS DRILL MATTERS

Es el primer drill donde el alumno no solo "sobrevive la ola" — empieza a **conducirla**. Sin cobra bien instalada, los pasos siguientes (pop-up, turns de pie) se construyen sobre una base rota.

---

## COACH ROLE

Confirmar primero que el catch es real (STP-012 sólido). Focalizar cobra antes de turning. Demostrar en seco antes de pedir en el agua. Una corrección por rep.

---

## DELIVERY METHOD (EDPF)

- **Explain:** "Post-catch: manos a costillas, pecho arriba, ojos adelante. Después, mirá donde querés ir y presioná ese rail."
- **Demonstrate:** en arena primero (cobra pose + activación de oblicuos), luego en agua.
- **Participate:** alumno intenta 5-10 catches con entry a cobra y giros alternados.
- **Feedback:** una cosa por rep: cobra position, luego vision, luego rail.

---

## SETUP

- Alumno certificado en STP-010, STP-011, STP-012.
- Conditions: waist-deep, foam consistente, olas que producen ride de 3-5 segundos mínimo.
- Demo en arena antes de entrar al agua.

---

## STEP-BY-STEP

### Phase 1 — Demo seco (antes de entrar al agua)
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
- Presiona rail derecho.
- Tabla responde (aunque sea leve).

**Rep 5 — STEER izquierda**
- Misma secuencia, al lado opuesto.

**Reset — próxima ola**
- Volver a sweet spot + align (micro-check).
- Repetir con alternancia L/R.

---

## REPETITIONS

5-10 catches alternando izquierda/derecha. Target: 3+ giros intencionales a cada lado por sesión.

---

## PROGRESSION (Dual Mode)

**CLÁSICO (sesiones 1-2):** coach dirige cada sub-paso (hands → chest → eyes → rail → steer), demo en seco previa, una corrección por rep.

**ECOLÓGICO (sesión 3+):** coach se calla tras pick-up. Alumno ejecuta cobra y steering por sí mismo. Coach interviene solo si cobra ausente o si no hay rail pressure real.

---

## VARIATIONS

**V1 — Cobra solo (sin steering):** primero solidificar cobra. 5 reps de cobra sin intentar girar. Después integrar steering.

**V2 — Vision first:** alumno entra cobra + mira a un punto específico (coach marca) sin intentar girar. Entrena vision stabilization.

**V3 — Single-side drill:** 5 catches girando solo derecha, luego 5 solo izquierda. Aísla direccionalidad.

**V4 — Body position test:** alumno prueba cobra desde sweet spot ligeramente adelante (menos maniobra) vs ligeramente atrás (más maniobra). Siente la diferencia.

**V5 — Chained turns:** alumno ejecuta derecha → centro → izquierda en un mismo ride. Alto nivel de White Belt.

---

## WHAT THE COACH OBSERVES

- ¿Hands a ribs reales o adelantadas?
- ¿Chest up controlado o exagerado (hiperextensión lumbar)?
- ¿Eyes forward estables o buscando el nose/piso?
- ¿Nose release visible?
- ¿Ride fluido o nose clavando?
- ¿Vision lead al steering (mira primero, gira después)?
- ¿Rail pressure real (un rail hundido) o solo peso lateral?
- ¿Uso de obliques o movimiento solo de brazos?
- ¿Body position permite turning (no demasiado adelante)?
- ¿Respeta orden: cobra primero, steer después?

---

## COMMON ERRORS

### Student errors
- No entra cobra (queda pecho abajo = nose clava).
- Hands demasiado adelante (altura hombros en lugar de costillas).
- Chest up exagerado (hiperextensión).
- Eyes al nose o al piso en lugar de adelante.
- Intenta steer sin cobra estable.
- Gira solo con brazos, sin oblicuos ni rail.
- Cuerpo muy adelante (tabla no gira aunque intente).
- Passive ride (ni intenta girar).

### Coach errors
- Pedir turning antes de cobra estable.
- Skipear demo en seco.
- Corregir 3 cosas al mismo tiempo.
- Cobra sin rail pressure — se queda en pose.
- No chequear body position si no gira.

---

## COACH CUES

- "Hands to ribs."
- "Chest up."
- "Eyes forward."
- "Look where you want to go."
- "Press the rail."
- "Obliques."
- "Cobra first. Then steer."
- "Not just eyes — whole body."

---

## SUCCESS CRITERIA

1. Entrada a cobra consistente post-catch (5+ reps).
2. Nose release visible — tabla estable, no clava.
3. Eyes forward estables, vision lead al steering.
4. Rail pressure real (un rail hundido visible).
5. 3+ giros intencionales a cada lado.
6. Orden doctrinal: cobra antes de steer.

---

*TSS® White Belt · DRL-WB-13 Cobra Rail Control Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-041 — NO COBRA ENTRY

Post-catch, el alumno no entra a cobra: queda con pecho pegado a la tabla, brazos flojos o adelantados, cabeza baja. La tabla no libera nose y el ride se vuelve pesado, breve, o se corta por nose-dive.

### ERR-WB-042 — PASSIVE RIDE

El alumno entra cobra correctamente pero no intenta dirigir la tabla. Queda en posición estática durante todo el ride.

### ERR-WB-043 — HANDS TOO FAR FORWARD

El alumno intenta entrar cobra pero ubica las manos a altura de hombros o más adelante, no a costillas. La cobra se ejecuta con palanca mal posicionada: pecho sube pero postura es inestable, el empuje no libera bien el nose, y la preparación para pop-up queda rota.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-012']::TEXT[],
  'reading',
  34
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-014',
  'white_belt',
  14,
  $tss$Prone Dismount$tss$,
  NULL,
  $tss$Block 2 · M2 (Prone Wave Cycle — closing step)$tss$,
  $tss$# STP-014 — PRONE DISMOUNT

**Belt:** White Belt · Block 2 · M2 (Prone Wave Cycle — closing step)
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno a salir de la tabla de forma controlada mientras todavía va en prono, antes de llegar a zona peligrosa (arena muy poca, rocas, shorebreak duro). Es el paso que **cierra el ciclo M2 Prone Wave** — desde sweet spot (STP-010) hasta exit seguro.

No es "bajarse" — es una salida con mecánica específica: rails → shift atrás → rotación sobre una cadera → rodillas al pecho → pies al frente → aterrizaje conectado a la tabla.

---

## THE 5 KEY WORDS

**DECIDE · RAILS · SHIFT · ROTATE · LAND**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **DECIDE** | Decisión temprana de exit antes de peligro | Alumno elige salir antes de zona shallow |
| 2 | **RAILS** | Manos agarran rails a altura del pecho | Dos manos fijas en rails, no sueltas |
| 3 | **SHIFT** | Mover el cuerpo ~30 cm hacia atrás | Peso se traslada atrás, nose sube |
| 4 | **ROTATE** | Rotar sobre una cadera, rodillas al pecho, pies al frente | Cuerpo compacta, pies apuntan dirección nose |
| 5 | **LAND** | Pies aterrizan + cuerpo sube con energía de ola + sigue conectado | Pies al piso, manos siguen en rails |

---

## ANCHOR PHRASE

> **"Exit before danger. Stay with the board."**

**Micro-cue:** *"Rails first. Feet last."*

---

## WHY THIS STEP MATTERS

**Seguridad del alumno:**
Sin dismount controlado, el alumno llega a la arena muy poca o al shorebreak sin haber planeado salida. Ahí las lesiones son reales: caer sobre muñeca, cadera, o golpe de quilla.

**Protección de la tabla:**
Un dismount mal hecho significa quilla contra arena, tabla golpeada por shorebreak, ding inmediato. El dismount es **tanto técnica como cuidado del activo**.

**Cierre del ciclo prono:**
M2 empezó en sweet spot (STP-010). Sin dismount, el ciclo no cierra — queda abierto. El alumno aprende que **cada ride tiene inicio y tiene final planeados**, no solo inicio.

**Hábito del "stay with the board":**
Acá se instala la regla de vida del surfista: nunca soltar la tabla sin intención. El que suelta al azar se lastima, lastima a otros, y pierde equipo. Esta regla acompaña al alumno en todos los belts.

**Separación doctrinal:**
Prone Dismount (M2) es distinto de Starfish Dismount (STP-020, M3). Marcar la diferencia acá enseña que **cada contexto tiene su exit**. No hay un solo dismount universal.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno decide terminar el ride prono antes de zona peligrosa.

✅ **TERMINA:** pies en arena + alumno de pie + manos aún en rails + tabla bajo control.

❌ **NO incluye:**
- Standing dismount (reservado para M3).
- Starfish Dismount (STP-020, M3).
- Pop-up (STP-016).
- Lectura estratégica de zonas shallow más allá de la decisión de exit.
- Leash management doctrinal.

**Cross-step dependency:**
- STP-010, STP-011, STP-012, STP-013 deben estar certificados.
- Cierra el ciclo M2. Después de STP-014, se entra a M3 con STP-016 Pop-Up.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-014 en dos sesiones PASS:

1. **Decisión temprana:** alumno elige salir antes de llegar a shallow — no le sorprende la arena.
2. **Rails controlados:** dos manos agarran rails a altura del pecho sin soltar.
3. **Shift atrás real:** peso se desplaza ~30 cm, nose sube, no se entierra al bajar.
4. **Secuencia completa:** rails → shift → rotate → knees to chest → feet forward → land.
5. **Conexión con tabla:** al aterrizar, alumno sigue con manos en rails — tabla no sale volando.
6. **Safe landing:** pies en arena, cuerpo equilibrado, sin caída lateral ni rodilla torcida.

---

## COACHING PRINCIPLE

El coach de STP-014 enseña **dos cosas al mismo tiempo**: (1) el timing de la decisión (antes, no después) y (2) la mecánica del exit (rails → shift → rotate → land). Los dos son igual de importantes — un dismount bien hecho pero tarde es accidente. Un dismount temprano pero sin mecánica es caída.

**Regla de diagnóstico:** si el alumno se lastima o se descontrola al salir, el problema puede estar en:
- No decidió a tiempo (late exit).
- No agarró rails (soltó y bailó).
- No movió atrás (quilla pegó arena).
- No rotó (salió de costado, caderas mal).
- Soltó la tabla (rompió la regla central).

Cada uno requiere corrección distinta.

**Enseñanza en seco:** esta secuencia se enseña **completa en arena** antes de ir al agua. La secuencia es motora, no es intuitiva. El coach debe demostrar lenta y claramente cada fase antes del primer intento real.

---

*TSS® White Belt · STP-014 Prone Dismount v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-14 — PRONE DISMOUNT SAFETY DRILL

**Step:** STP-014 Prone Dismount
**Belt:** White Belt · Block 2 · M2 (closing)
**Version:** v1.0

---

## OBJECTIVE

Enseñar al alumno a (a) decidir exit antes de zona peligrosa, (b) ejecutar la mecánica completa rails → shift → rotate → land, y (c) mantener conexión con la tabla durante toda la salida.

---

## WHY THIS DRILL MATTERS

Es el primer drill donde el alumno aprende **cómo terminar el ride**. Sin dismount, cada ride termina en accidente o casi-accidente. Este drill cierra M2 y construye un hábito de vida: exit temprano + tabla siempre conectada.

---

## COACH ROLE

Demostrar en seco primero — completa la secuencia con el alumno imitando. Luego al agua con exit autorizado explícitamente. Una corrección por rep. No tolerar soltar la tabla.

---

## DELIVERY METHOD (EDPF)

- **Explain:** "Antes de que la arena esté muy cerca, decidís. Rails. Shift back. Rotate. Knees. Feet forward. Land. Manos siempre en rails."
- **Demonstrate:** en arena primero, secuencia completa lenta. Luego repetir a velocidad real. Finalmente en agua.
- **Participate:** alumno ejecuta 5-8 dismounts alternando olas, siempre con decisión temprana.
- **Feedback:** una cosa por rep: decisión / rails / shift / rotate / land.

---

## SETUP

- Alumno certificado en STP-010, STP-011, STP-012, STP-013.
- Conditions: waist-deep, foam consistente, zona de arena clara y predecible.
- Demo en seco OBLIGATORIA antes de entrar al agua.
- Coach posicionado para observar exit zone.

---

## STEP-BY-STEP

### Phase 1 — Demo seco (obligatoria)

1. Alumno acostado sobre tabla en arena.
2. Coach narra: "DECIDE ahora" → alumno finge exit.
3. RAILS: dos manos a rails, altura del pecho.
4. SHIFT: mover cuerpo ~30 cm hacia atrás.
5. ROTATE: cadera rota, legs extienden, luego rodillas al pecho.
6. FEET FORWARD: pies apuntan hacia nose.
7. LAND: alumno simula caer de pie, manos aún en rails.
8. Repetir 5 veces en seco antes de entrar al agua.

### Phase 2 — En el agua

**Rep 1 — Dry run en agua parada**
- Alumno ejecuta la secuencia completa en agua quieta (sin ola). Verifica que la mecánica funciona con tabla flotando.

**Rep 2 — Dismount después de catch corto**
- Alumno catchea foam chico, ride breve, ejecuta dismount en seguida.
- Énfasis: decisión temprana, no esperar hasta sentir el piso.

**Rep 3 — Dismount en ride completo**
- Catch + cobra (STP-013) + ride normal + dismount antes de zona peligrosa.
- Coach marca punto de decisión visible si hace falta.

**Rep 4 — Autodiagnóstico**
- Alumno ejecuta y explica post-rep: "¿Decidí a tiempo? ¿Solté rails?".

**Rep 5-8 — Repetición con una sola corrección por rep**
- Coach corrige UNA cosa por rep hasta fijar secuencia completa.

---

## REPETITIONS

5-8 dismounts. Target: 3+ dismounts limpios con secuencia completa y conexión con tabla mantenida.

---

## PROGRESSION (Dual Mode)

**CLÁSICO (sesiones 1-2):** coach marca cada fase verbalmente durante ejecución ("RAILS. SHIFT. ROTATE. FEET. LAND."), demo seco obligatorio cada sesión.

**ECOLÓGICO (sesión 3+):** coach se calla tras decisión de exit. Alumno ejecuta solo. Coach interviene solo si tabla se suelta o decisión tarde.

---

## VARIATIONS

**V1 — Dismount solo (sin catch):** alumno parado en agua quieta, flota en tabla, ejecuta secuencia. Aísla mecánica.

**V2 — Early decision trigger:** coach grita "¡YA!" en punto temprano. Alumno debe iniciar dismount inmediato. Entrena decisión bajo orden externa.

**V3 — Late decision test:** coach permite ride más largo y observa si alumno decide solo o espera demasiado. Si espera, coach interviene para evitar accidente.

**V4 — Rails check:** coach sujeta la tabla después del land — si alumno soltó rails, se nota. Diagnóstico de "stay with the board".

**V5 — Chain M2 completo:** desde sweet spot (STP-010) hasta dismount (STP-014) en una sola ola. Test de ciclo M2 cerrado.

---

## WHAT THE COACH OBSERVES

- ¿Alumno decidió temprano o se quedó hasta el último momento?
- ¿Manos fueron a rails o quedaron sueltas?
- ¿Shift atrás real o solo simbólico?
- ¿Rotación sobre una cadera o caída lateral?
- ¿Rodillas al pecho o piernas sueltas?
- ¿Pies apuntan al nose o quedaron al costado?
- ¿Aterrizaje equilibrado o caída?
- ¿Manos siguieron en rails post-land?
- ¿Tabla quedó controlada o salió volando?

---

## COMMON ERRORS

### Student errors
- Decide tarde (ride se extiende a zona shallow).
- No agarra rails antes de iniciar exit.
- No mueve atrás (quilla golpea arena).
- Rota mal (sale de costado, caderas desalineadas).
- Suelta la tabla al aterrizar.
- Pies no apuntan al nose (pierde dirección).
- Aterriza desequilibrado (muñeca o rodilla comprometida).

### Coach errors
- Saltear demo seco.
- No marcar punto de decisión temprana.
- Permitir dismount sin rails.
- Tolerar "soltar la tabla" sin corregir.
- Corregir 3 cosas a la vez en un rep.
- Pedir dismount en condiciones muy shallow o con shorebreak duro.

---

## COACH CUES

- "Decidí ahora."
- "Rails."
- "Back."
- "Rotate."
- "Knees to chest."
- "Feet forward."
- "Stay with the board."
- "Exit before danger."

---

## SUCCESS CRITERIA

1. Alumno ejecuta secuencia completa (rails → shift → rotate → feet → land) en 3+ reps.
2. Decisión de exit es temprana, no reactiva.
3. Tabla queda conectada en todos los reps exitosos.
4. Sin caídas laterales ni manos soltándose.
5. Orden doctrinal: "Exit before danger. Stay with the board." internalizado.

---

*TSS® White Belt · DRL-WB-14 Prone Dismount Safety Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-044 — LATE DISMOUNT

El alumno no decide salir de la tabla a tiempo. Extiende el ride más allá de la zona segura y queda en shallow peligroso (arena muy poca, rocas, shorebreak).

### ERR-WB-045 — NO RAIL GRIP

El alumno ejecuta dismount sin agarrar los rails antes o durante la salida, o suelta los rails al aterrizar. La tabla queda sin control y puede salir disparada por la energía de la ola, golpeando al alumno, a otros surfistas o dañándose.

### ERR-WB-046 — POOR FOOT DIRECTION

Durante la rotación del dismount, el alumno no orienta los pies hacia la dirección del nose de la tabla. Los pies quedan al costado, hacia shore, o en ángulos incorrectos.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-013']::TEXT[],
  'reading',
  35
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-016',
  'white_belt',
  16,
  $tss$Pop Up$tss$,
  NULL,
  $tss$Block 3 · M3 (Opens standing phase)$tss$,
  $tss$# STP-016 — POP-UP

**Belt:** White Belt · Block 3 · M3 (Opens standing phase)
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno a **pasar de acostado a parado** sobre la tabla, desde una cobra bien instalada, ejecutando el movimiento con **conexión, control, y orden**, sin soltar la tabla demasiado temprano y sin romper el eje.

Este paso abre el bloque M3. La entrada a la ola es la misma que M2 (sweet spot → align → paddle → cobra), pero acá divergen: en lugar de dismount prono, el alumno se para.

---

## THE 5 KEY WORDS

**COBRA · HANDS · EXHALE · FEET · CONNECT**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **COBRA** | Cobra sólida como base (de STP-013) | Pecho arriba, manos a costillas, eyes forward |
| 2 | **HANDS** | Manos firmes a altura de costillas hasta el final | Manos ancladas, no se sueltan temprano |
| 3 | **EXHALE** | Exhalación sincronizada al momento del lift | Alumno exhala al iniciar pop-up (baja la presión intra-abdominal) |
| 4 | **FEET** | Pies caen en posición correcta (no atrás primero) | Ambos pies aterrizan con intención, centrados |
| 5 | **CONNECT** | Alumno libera manos solo cuando está centrado y en control | No suelta rails hasta estar estable parado |

---

## ANCHOR PHRASE

> **"Good cobra. Hands in place. Exhale. Look forward. Stay connected."**

**Micro-cue:** *"Cobra → exhale → feet → stand."*

---

## WHY THIS STEP MATTERS

**La cobra es la rampa:**
Sin cobra bien instalada (STP-013), el pop-up se construye sobre base rota. La cobra crea el **espacio entre pecho y tabla** donde los pies deben caer. Si no hay cobra, no hay espacio, y los pies no encuentran lugar.

**La transición prono → parado:**
Es el cambio cognitivo más grande del White Belt. El alumno deja de estar "pegado a la tabla" y pasa a estar "arriba de la tabla". La relación con el rail, el centro de gravedad, la vista, todo cambia.

**La conexión con la tabla:**
Si el alumno suelta las manos muy temprano, el cuerpo pierde referencia, la tabla se frena, y el movimiento se descontrola. Soltar solo cuando está centrado es regla estructural — enseñada acá por primera vez, usada por el resto de la carrera surfera.

**Coordinación respiración-movimiento:**
Exhalar al momento del lift reduce presión intra-abdominal y permite más agilidad. Esta conexión respiración-movimiento se entrena acá por primera vez como hábito técnico, no como casualidad.

**Apertura de M3:**
Pop-up abre todo el bloque de pararse + stance + posture + turns de pie. Todos los siguientes steps del White Belt dependen de que este quede bien instalado.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno tiene cobra estable post-catch y decide pararse.

✅ **TERMINA:** alumno de pie + centrado + manos liberadas + mirada adelante.

❌ **NO incluye:**
- Stance (posición exacta de pies) → STP-017
- Posture (postura corporal parado) → STP-018
- Impulso de pie → STP-019
- Starfish Dismount → STP-020
- Turns de pie → STP-021, STP-022
- Tipo de pop-up (knee-up, full pop) → se define según alumno y se documenta aparte.

**Cross-step dependency:**
- STP-013 Cobra certificado es **pre-requisito absoluto**.
- Abre M3: habilita STP-017, 018, 019, 020, 021, 022.
- STP-015 Cobra Pick Line retirado doctrinalmente (línea se absorbe en STP-013 + eyes forward acá).

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-016 en dos sesiones PASS:

1. **Cobra previa sólida:** manos a costillas + pecho arriba + eyes forward antes de iniciar pop-up.
2. **Exhalación sincronizada:** alumno exhala al momento del lift, no mantiene aire.
3. **Pies en posición correcta:** aterrizan centrados (no atrás primero, no solo un pie).
4. **Movimiento suave y dinámico:** sin vacilación, sin quedarse "trabado" en el medio.
5. **Conexión mantenida:** manos liberan solo cuando el alumno ya está centrado y en control.
6. **Eyes forward:** mirada adelante durante todo el movimiento, no al nose ni al piso.
7. **Sin errores críticos:** no poner pie de atrás primero, no soltar tabla temprano.

---

## COACHING PRINCIPLE

El pop-up es **la suma de tres cosas que el alumno ya tiene**: cobra (STP-013), vision forward (STP-013), y conexión con la tabla (desde STP-010). Si alguna de las tres está débil, el pop-up no funciona. **Diagnosticar siempre la base antes de corregir el movimiento.**

**Regla de diagnóstico:** si el alumno no se para o se para mal, el problema puede estar en:
- Cobra débil o ausente → regresar a STP-013.
- Manos mal ubicadas (no costillas) → fix posición.
- Suelta manos muy temprano → trabajar conexión.
- Pie de atrás primero → demo seco de orden de pies.
- No exhala → enseñar respiración como parte del movimiento.
- Fuerza/agilidad limitada → trabajar acondicionamiento paralelo.

**Variantes permitidas:**
Existen distintos pop-ups (full pop, knee-up, step-up). El coach elige el tipo según edad, condición física, movilidad del alumno. Lo importante **no es el tipo** sino los principios: cobra → exhale → feet → connect.

**Demo seca obligatoria:**
Pop-up se enseña **completo en seco** antes del agua. Secuencia lenta, después rápida, después en arena sobre tabla, después en agua. Saltar demo seco genera alumnos que nunca lo hacen limpio.

---

*TSS® White Belt · STP-016 Pop-Up v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-16 — 2-SECOND POP-UP CONNECTION DRILL

**Step:** STP-016 Pop-Up
**Belt:** White Belt · Block 3 · M3 (opening)
**Version:** v1.0

---

## OBJECTIVE

Enseñar al alumno a (a) ejecutar pop-up desde cobra sólida, (b) sincronizar exhalación con el lift, (c) colocar pies en posición correcta, y (d) mantener conexión con la tabla hasta estar centrado.

Target temporal: pop-up ejecutado en ~2 segundos desde cobra hasta de pie centrado. Ni apuro ni lentitud.

---

## WHY THIS DRILL MATTERS

Es el primer drill donde el alumno deja de estar acostado. Abre todo M3 y todo el surf de pie. Un pop-up débil acá se paga durante toda la carrera.

---

## COACH ROLE

Primero verificar cobra. Después demo seco completo. Después al agua — pop-up solo cuando cobra está confirmada. Una corrección por rep. No negociar "stay connected".

---

## DELIVERY METHOD (EDPF)

- **Explain:** "Cobra primero — siempre. Después exhalás. Los pies caen en posición. Las manos sueltan solo cuando estás centrado."
- **Demonstrate:** en arena completa + sobre tabla en arena + en agua. Tres demos mínimo.
- **Participate:** alumno ejecuta 5-8 pop-ups desde catch real.
- **Feedback:** diagnosticar cuál fase falló (cobra / hands / exhale / feet / connect) antes de corregir.

---

## SETUP

- Alumno certificado en STP-010, 011, 012, 013, 014.
- Conditions: waist-deep, foam consistente, rides de 4-6 segundos mínimo.
- Demo seco obligatorio antes de entrar al agua (mínimo 5 reps en seco).
- Coach posicionado para ver ángulo de ejecución.

---

## STEP-BY-STEP

### Phase 1 — Demo seco (obligatorio)

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
- Alumno flota en tabla, ejecuta pop-up. Aísla mecánica de la tabla sin presión de catch.

**Rep 2 — Pop-up después de catch corto**
- Alumno catchea foam chico, cobra rápida, pop-up inmediato.

**Rep 3 — Pop-up en ride normal**
- Catch + cobra + eyes forward + pop-up + ride de pie.

**Rep 4-8 — Repetición con una corrección por rep**
- Coach corrige UNA cosa: cobra / hands / exhale / feet / connect.

---

## REPETITIONS

5-8 pop-ups. Target: 3+ pop-ups limpios con secuencia completa, pies correctos, y conexión mantenida.

---

## PROGRESSION (Dual Mode)

**CLÁSICO (sesiones 1-3):** coach marca cada fase verbalmente durante ejecución, demo seco cada sesión, pop-up con acompañamiento visual.

**ECOLÓGICO (sesión 4+):** coach se calla post-cobra. Alumno ejecuta pop-up solo. Coach interviene solo si cobra se rompe o conexión se pierde.

---

## VARIATIONS

**V1 — Pop-up knee-up (modificado):** para alumnos con limitación de fuerza o movilidad. Pierna de adelante entra con rodilla primero. Válido como paso intermedio — no como versión final para todos.

**V2 — Pop-up full pop:** para alumnos con fuerza y agilidad adecuada. Ambos pies caen al mismo tiempo. Versión más fluida.

**V3 — Pop-up en agua quieta:** aislar mecánica. 5 reps sin ola, en tabla flotando.

**V4 — Slow-motion pop-up:** alumno ejecuta intencionalmente lento (5-6 segundos) para sentir cada fase. Luego vuelve a velocidad real.

**V5 — Connection test:** coach sujeta la tabla después del pop-up. Si alumno soltó rails antes de estar centrado, se nota. Diagnóstico de "stay connected".

---

## WHAT THE COACH OBSERVES

- ¿Cobra sólida antes del pop-up o inestable?
- ¿Manos a costillas o adelantadas/desubicadas?
- ¿Exhalación sincronizada o aguanta el aire?
- ¿Pie de atrás primero o ambos juntos?
- ¿Pies aterrizan centrados o desviados?
- ¿Manos se sueltan antes de estar centrado?
- ¿Eyes forward o mira al nose/piso?
- ¿Movimiento suave o trabado?
- ¿Post-pop-up queda parado o tambalea?
- ¿Tiempo total ~2 segundos o muy lento/muy rápido?

---

## COMMON ERRORS

### Student errors
- Cobra débil o ausente (base rota).
- Manos en posición incorrecta (no costillas).
- No exhala (mantiene aire, movimiento rígido).
- Pone pie de atrás primero, peso atrás, tabla se frena.
- Suelta manos antes de estar centrado.
- Mira al nose o al piso.
- Movimiento lento, escalonado, forzado.
- Solo un pie aterriza (queda de rodilla).

### Coach errors
- Saltear demo seco.
- Pedir pop-up sin cobra verificada.
- No diagnosticar cuál fase falló antes de corregir.
- Corregir 3 cosas a la vez.
- Tolerar soltar tabla antes de tiempo.
- No acompañar exhalación (dejarla librada al azar).

---

## COACH CUES

- "Buena cobra."
- "Manos en costillas."
- "Exhale."
- "Ojos al frente."
- "Pies caen juntos."
- "Manos firmes — todavía no."
- "Ahora soltás."
- "Quedate centrado."

---

## SUCCESS CRITERIA

1. Cobra sólida confirmada antes de pop-up (5+ reps).
2. Exhalación sincronizada al lift.
3. Pies en posición correcta (centrados, no atrás primero).
4. Conexión mantenida hasta centrado.
5. Movimiento fluido ~2 segundos.
6. 3+ pop-ups limpios por sesión.

---

*TSS® White Belt · DRL-WB-16 2-Second Pop-Up Connection Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-047 — BACK FOOT FIRST

Durante el pop-up, el alumno pone primero el pie de atrás en la tabla, dejando todo el peso hacia atrás. Esto hace que la tabla se frene y pierda velocidad, y el movimiento completo se vuelve descontrolado o se corta.

### ERR-WB-048 — RELEASE TOO EARLY

Durante el pop-up, el alumno suelta las manos de los rails antes de estar centrado y en control. El cuerpo pierde la referencia de conexión con la tabla, el equilibrio falla, y el alumno cae o termina parado inestable.

### ERR-WB-049 — NO COBRA BASE

El alumno intenta ejecutar pop-up sin haber entrado a cobra primero. El movimiento empieza con pecho contra tabla, manos mal ubicadas, sin espacio entre cuerpo y deck.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-014']::TEXT[],
  'reading',
  36
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-017',
  'white_belt',
  17,
  $tss$Feet Position Center 2$tss$,
  NULL,
  $tss$Block 3-4 · M3$tss$,
  $tss$# STP-017 — FEET POSITION CENTER #2

**Belt:** White Belt · Block 3-4 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno que **la conexión real con la tabla empieza por la posición de los pies**, y que el punto de partida es **FP2 — posición neutra, centrada**. Sin pies centrados, un rail ya está aplastado, la tabla deriva sin intención, y el cuerpo tiene que compensar, generando desorden en postura y conexión.

Este paso convierte la idea abstracta "parate en el centro" en un concepto **estructural** que acompaña al alumno desde White Belt hasta nivel olímpico.

---

## THE 5 KEY WORDS

**CENTER · RAILS · FP2 · BACK-FOOT · CONNECT**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **CENTER** | Pies aterrizan en el eje longitudinal de la tabla | Ambos pies en la línea central, no desviados |
| 2 | **RAILS** | Ningún rail se aplasta involuntariamente | Los dos rails flotan parejo, tabla no deriva |
| 3 | **FP2** | Posición neutra del pie de atrás | Pie trasero cae en zona FP2 (balance entre velocidad y estabilidad) |
| 4 | **BACK-FOOT** | Ubicación específica del pie de atrás determina el comportamiento de la tabla | Pie atrás en FP2 consistentemente (no FP1 ni FP3 en WB) |
| 5 | **CONNECT** | Tabla se siente como extensión del cuerpo | Sin compensaciones visibles, tabla responde a intención |

---

## ANCHOR PHRASE

> **"Feet in the center. Position two. Connect with the board."**

**Micro-cue:** *"Both rails equal. Then speed follows."*

---

## WHY THIS STEP MATTERS

**La física del rail:**
La tabla está diseñada para ir recto cuando los rails están parejos, y para girar cuando un rail se aplasta. Si el pie no está centrado, un rail ya está aplastado involuntariamente — antes de que el alumno decida hacer nada.

**La cadena de compensación:**
Pie fuera del centro → rail aplastado → tabla deriva → cuerpo compensa → postura se rompe → cuerpo trabaja contra la tabla. Este es **el error raíz de muchos problemas posteriores**, desde beginner hasta olímpico.

**Conexión real:**
"Connect with the board" no es frase bonita — es técnica. Cuando los pies están en FP2 centrado, la tabla responde al cuerpo. Cuando no, el cuerpo responde a la tabla (reacción, no intención).

**Partida para FP1 y FP3:**
Los tres puntos (FP1 atrás, FP2 neutral, FP3 adelante) existen. Pero el alumno **no puede entender FP1 ni FP3 sin haber dominado FP2 primero**. Es como querer ajustar ecualizador sin saber qué es el sonido base.

**Conexión con sweet spot (STP-010):**
Si el pie de atrás no cae en FP2, es frecuente que el sweet spot esté mal instalado. STP-017 diagnostica retroactivamente STP-010.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno post-pop-up (STP-016 ejecutado).

✅ **TERMINA:** pies aterrizan centrados en FP2 consistentemente + alumno identifica visualmente cuando un rail está aplastado.

❌ **NO incluye:**
- FP1 y FP3 (reservados para belts superiores).
- Postura corporal arriba de la tabla → STP-018.
- Impulso → STP-019.
- Turns de pie → STP-021, STP-022.
- Stance width / dirección pies (se integra en STP-018).

**Cross-step dependency:**
- STP-016 Pop-Up certificado.
- Sweet spot (STP-010) puede requerir re-ajuste si los pies no caen donde deberían.
- Prepara STP-018 Power Stance y todos los turns.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-017 en dos sesiones PASS:

1. **Pies centrados:** ambos pies aterrizan en el eje longitudinal (no cerca de rails).
2. **FP2 consistente:** pie de atrás cae en zona neutra (no muy atrás, no muy adelante) en 3+ pop-ups.
3. **Rails parejos:** visualmente ambos rails flotan al mismo nivel post-pop-up.
4. **Sin compensación obvia:** cuerpo no tuerce ni carga lateral para corregir pies mal ubicados.
5. **Conciencia conceptual:** alumno puede explicar por qué FP2 importa y qué es FP1/FP3 aunque no los ejecute.
6. **Diagnóstico retro:** si los pies no caen en FP2, alumno y coach revisan sweet spot (STP-010) como causa raíz.

---

## COACHING PRINCIPLE

Este paso es más **conceptual** que atlético. El alumno tiene que **entender** por qué FP2 importa antes de solo "pararse en el centro". El coach debe enseñar con demo visual clara: tabla con rail aplastado = deriva; tabla centrada = recto. La explicación abre la puerta al entendimiento; sin entendimiento, el pie no encuentra su lugar.

**Regla de diagnóstico:** si los pies no caen en FP2, el problema puede estar en:
- Sweet spot (STP-010) mal posicionado — pies caen donde están las rodillas en cobra.
- Pop-up (STP-016) apurado — pies caen donde pueden, no donde deben.
- Falta de conciencia de dónde están los rails.
- Hábito arrastrado de otro estilo (skate, snow, etc.) que ubica pies distinto.

**Demo visual indispensable:**
Coach muestra físicamente una tabla con pie cerca de un rail (visible cómo se inclina) vs pie centrado (tabla plana). La demo abstracta no funciona — el alumno tiene que ver.

**Solo FP2 en White Belt:**
No introducir FP1 ni FP3 como objetivos. Mencionarlos conceptualmente para dar contexto, pero el foco es dominar FP2. Querer todo a la vez diluye aprendizaje.

---

*TSS® White Belt · STP-017 Feet Position Center #2 v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-17 — FEET POSITION FP2 DRILL

**Step:** STP-017 Feet Position Center #2
**Belt:** White Belt · Block 3-4 · M3
**Version:** v1.0

---

## OBJECTIVE

Enseñar al alumno a (a) comprender visualmente la relación entre pies y rails, (b) aterrizar los pies en el eje central de la tabla, y (c) ubicar el pie de atrás en FP2 de forma consistente.

---

## WHY THIS DRILL MATTERS

Es el drill donde el alumno deja de pensar "me paro" y empieza a pensar "me conecto con la tabla". Sin FP2 instalado, toda la postura, turns y estilo posterior arrancan desde compensación — nunca desde control real.

---

## COACH ROLE

Empezar con demo visual (tabla en arena, marcar FP2 con cinta). Explicar concepto antes de ejecutar. En agua, chequear cada pop-up contra posición ideal. Una corrección por rep.

---

## DELIVERY METHOD (EDPF)

- **Explain:** "Los pies en el centro = rails parejos = tabla recta. Pies fuera del centro = rail aplastado = tabla deriva."
- **Demonstrate:** tabla en arena con cinta marcando FP2. Demo de pie cerca de rail vs centrado.
- **Participate:** alumno ejecuta 5-8 pop-ups apuntando a FP2. Coach chequea cada uno.
- **Feedback:** una correción por rep: ¿centrados? ¿FP2? ¿rails parejos? ¿compensación?

---

## SETUP

- Alumno certificado en STP-010, 011, 012, 013, 014, 016.
- Conditions: waist-deep, foam consistente, rides de 4-6 segundos.
- Tabla marcada con cinta (FP2 visible) para los primeros reps.
- Demo seco sobre tabla en arena OBLIGATORIO.

---

## STEP-BY-STEP

### Phase 1 — Demo conceptual (tabla en arena)

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
- Condiciones normales. Verificar FP2 post-pop-up.

**Rep 3-8 — Repetición**
- Una correción por rep. Si FP2 no cae, diagnosticar causa raíz (sweet spot / pop-up / conciencia).

---

## REPETITIONS

5-8 pop-ups enfocados en FP2. Target: 3+ reps con pie atrás en FP2 + pies centrados + rails parejos.

---

## PROGRESSION (Dual Mode)

**CLÁSICO (sesiones 1-2):** tabla marcada con cinta, demo seco cada sesión, coach señala pie de atrás en cada rep.

**ECOLÓGICO (sesión 3+):** sin cinta, alumno autoverifica. Coach interviene solo si pies caen cerca de rail.

---

## VARIATIONS

**V1 — Tabla sin cinta:** alumno debe sentir FP2 sin referencia visual. Entrena propiocepción.

**V2 — Comparativo FP1 vs FP2:** alumno intenta 3 pop-ups con pie atrás más atrás (FP1) y 3 con pie en FP2. Siente diferencia (sin certificar FP1).

**V3 — Diagnóstico con video:** grabar pop-ups y analizar dónde cae el pie de atrás. Feedback visual directo.

**V4 — Sweet spot re-test:** si pie no cae en FP2, ajustar sweet spot y re-ejecutar. Valida la cadena STP-010 → STP-017.

**V5 — Rails awareness:** coach pide al alumno "¿qué rail está aplastado?" después del pop-up. Entrena conciencia activa.

---

## WHAT THE COACH OBSERVES

- ¿Pies aterrizan en el eje o cerca de rail?
- ¿Pie de atrás cae en FP2 o muy atrás/adelante?
- ¿Rails parejos o uno aplastado?
- ¿Cuerpo compensa (torsión lateral, carga a un lado)?
- ¿Tabla responde a intención o deriva sola?
- ¿Alumno identifica dónde están sus pies o está "ciego"?
- ¿Sweet spot (STP-010) es compatible con FP2?

---

## COMMON ERRORS

### Student errors
- Pie cae cerca de rail (deriva involuntaria).
- Pie atrás muy atrás (FP1 sin intención).
- Pie atrás muy adelante (FP3 sin intención).
- Cuerpo compensa torciendo caderas u hombros.
- No sabe dónde están sus pies (sin conciencia).
- Usa postura de skate/snow sin adaptación.

### Coach errors
- Pedir FP2 sin demo visual previa.
- No usar cinta/marca en la tabla en primeras sesiones.
- Corregir el pie sin revisar sweet spot primero.
- Introducir FP1/FP3 como objetivo en White Belt.
- Tolerar compensaciones sin diagnosticar causa.

---

## COACH CUES

- "Feet in the center."
- "Position two."
- "Both rails equal."
- "Connect with the board."
- "¿Qué rail está aplastado?"
- "Donde están las rodillas en cobra = donde cae el pie de atrás."

---

## SUCCESS CRITERIA

1. Pies centrados en 3+ reps consecutivos.
2. Pie atrás en FP2 consistentemente.
3. Rails parejos (tabla no deriva).
4. Sin compensación corporal obvia.
5. Alumno verbaliza correctamente FP2 vs FP1 vs FP3.
6. Si sweet spot es causa raíz, se detectó y corrigió.

---

*TSS® White Belt · DRL-WB-17 Feet Position FP2 Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-050 — FOOT NEAR RAIL

Uno o ambos pies aterrizan cerca del rail de la tabla en lugar de estar centrados en el eje longitudinal. Como resultado, el rail queda aplastado involuntariamente, la tabla deriva en una dirección no decidida y el cuerpo debe compensar.

### ERR-WB-051 — BODY COMPENSATION

El alumno ajusta su cuerpo (caderas, hombros, torso) para compensar pies mal ubicados o tabla derivando. La compensación reemplaza a la conexión real.

### ERR-WB-052 — NO FOOT AWARENESS

El alumno no tiene conciencia de dónde caen sus pies post-pop-up. No puede responder con precisión "¿dónde está tu pie de atrás?" después de un rep.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-016']::TEXT[],
  'reading',
  37
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-018',
  'white_belt',
  18,
  $tss$Power Stance$tss$,
  NULL,
  $tss$Block 4 · M3$tss$,
  $tss$# STP-018 — POWER STANCE / POSTURE

**Belt:** White Belt · Block 4 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Instalar la **postura de poder** como la posición neutra desde la cual el surfer está listo para atacar, defender, moverse, frenar o recuperar control. No es una postura que se usa al 100% todo el tiempo — es la posición a la que **se vuelve cada vez que se quiere hacer algo con control**.

La analogía es el boxeador: pies donde deben estar, manos en su lugar, hombros al frente, listo para esquivar, defender, atacar o moverse. En surf pasa lo mismo. Sin postura de poder, no hay acción técnica posible.

---

## THE 5 KEY WORDS

**SHOULDERS · WEIGHT · KNEE · COMPACT · EXHALE**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **SHOULDERS** | Hombros apuntando hacia la nariz de la tabla (al frente) | Flechas en hombros alineadas con dirección |
| 2 | **WEIGHT** | ~80% peso en pie delantero, ~20% en pie trasero | Centro de gravedad claramente adelantado |
| 3 | **KNEE** | Rodilla de atrás apunta al frente (hacia la nariz) | Rodilla trasera no caída hacia adentro ni afuera |
| 4 | **COMPACT** | Flexión, pecho cerca de rodilla delantera, centro de gravedad bajo | Postura compacta y activa, no erguida |
| 5 | **EXHALE** | Respiración activa que sostiene la postura | Exhalación visible, sin apnea |

---

## ANCHOR PHRASE

> **"Shoulders forward. Weight forward. Back knee forward. Compact. Exhale."**

**Micro-cue:** *"Neutral ready. Return here to act."*

---

## WHY THIS STEP MATTERS

**La postura es la plataforma de acción:**
Sin postura, no hay turns, no hay impulso, no hay balance. Todo lo que viene después (impulso, turns, transiciones) asume postura estable. Una postura rota bloquea todo.

**Regulable, no fija:**
La postura máxima (pecho cerca de rodilla, ~90° de flexión) es la versión extrema. El alumno debe aprender a regularla: más compacta para turns o impulso, más abierta para transiciones. La regla: **cada vez que vaya a actuar, vuelvo a postura de poder**.

**Hombros como timón:**
Hombros apuntando al frente alinean el cuerpo con la dirección de la tabla. Si los hombros se colapsan hacia adelante o se tuercen, la tabla pierde dirección.

**Peso adelante = conexión:**
~80% en pie delantero activa el rail adelantado y mantiene velocidad. Peso atrás frena y rompe la conexión con la ola.

**Manos como extensión de la postura:**
Escápula retraída, codo pegado a costilla, mano activa abajo y al frente. Manos "volando" sin control = postura incompleta.

---

## BOUNDARY BOX

✅ **EMPIEZA:** pies aterrizaron centrados en FP2 (STP-017 certificado).

✅ **TERMINA:** alumno adopta postura de poder visible post-pop-up (hombros al frente, peso adelantado, rodilla atrás apuntando al frente, flexión activa, manos controladas, exhalación audible).

❌ **NO incluye:**
- Posición de pies (STP-017 — causa raíz si postura no funciona).
- Impulso / compresión-extensión (STP-019).
- Turns (STP-021, STP-022).
- Recuperación de caídas.

**Cross-step dependency:**
- STP-017 Feet Position Center #2 certificado.
- Pre-requisito directo para STP-019 Impulso y todos los turns.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-018 en dos sesiones PASS:

1. **Hombros al frente:** alineados con la dirección de la tabla, no torcidos ni colapsados.
2. **Peso adelante:** ~80% pie delantero visible (no atrás, no equilibrado).
3. **Rodilla atrás al frente:** no caída hacia adentro ni apuntando al rail.
4. **Flexión activa:** alumno compacto, centro bajo, pecho cerca de rodilla delantera.
5. **Manos controladas:** escápula activa, codo pegado a costilla, mano delantera abajo y al frente.
6. **Exhalación presente:** respiración activa, no apnea.
7. **Mirada al frente:** no al suelo ni a la tabla.
8. **Conciencia conceptual:** alumno explica "postura de poder" como posición neutra para actuar, no como posición estática permanente.

---

## COACHING PRINCIPLE

La postura no se "mantiene" — se **vuelve a ella**. El coach debe enseñar al alumno a **regresar a postura de poder cada vez que vaya a actuar**. Relajación en transiciones, compactación al actuar.

**Demo obligatoria con analogía del boxeador:** coach adopta postura de boxeo en arena, luego postura de surf. La referencia corporal del boxeador permite al alumno entender "postura neutra lista para actuar" sin explicación larga.

**Regla del coach:** si el alumno siente que se va a caer, la instrucción es *"volvé a postura de poder"*. Sin esa regla instalada, el alumno no sabrá qué hacer cuando pierda balance.

**Diagnóstico de postura mal:**
- Hombros torcidos → probablemente pies mal (STP-017).
- Peso atrás → miedo o hábito.
- Rodilla atrás caída → falta de conciencia de dirección.
- Sin flexión → cansancio o no instalado.
- Manos sueltas → nunca se instaló escápula activa.

---

*TSS® White Belt · STP-018 Power Stance v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-18 — POWER STANCE ARROWS DRILL

**Step:** STP-018 Power Stance / Posture
**Belt:** White Belt · Block 4 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## DRILL PURPOSE

Instalar la postura de poder como **posición neutra de acción** mediante referencias corporales claras (flechas en hombros + flecha en rodilla atrás) y analogía del boxeador. El drill transforma la idea abstracta "posición de poder" en una construcción corporal específica que el alumno puede replicar consistentemente.

---

## WHEN TO USE

- Post-STP-017 Feet Position Center #2 certificado.
- Cuando el alumno está de pie pero sin postura (erguido, hombros atrás, peso mal repartido).
- Como drill base antes de introducir impulso (STP-019).
- En cada sesión inicial cuando la postura se pierde por cansancio.

---

## SETUP

**Fase 1 — Arena (obligatoria):**
- Tabla apoyada en arena.
- Dos líneas marcadas en la arena paralelas a la tabla para marcar dirección "al frente".
- Coach ejecuta analogía del boxeador primero: postura boxeo → postura surf.

**Fase 2 — Agua quieta:**
- Alumno acostado en tabla, paddle out corto hasta zona shallow con agua quieta.
- Coach al lado con visión lateral.

**Fase 3 — Agua con ola (whitewater):**
- Zona de whitewater estable.
- Coach con visión lateral o desde el canal.

---

## EXECUTION

### Fase 1 — Arena (dry-run con analogía del boxeador)

1. **Demo del boxeador:**
   - Coach adopta postura de boxeo: pies abiertos, manos arriba, compacto, hombros al frente.
   - Coach pregunta: *"¿Estoy listo para pegar? ¿Para esquivar? ¿Para moverme?"*
   - Alumno responde sí.
   - Coach dice: *"Esto es postura de poder. En surf es igual — solo que las manos están abajo y los pies en la tabla."*

2. **Construcción paso a paso:**
   - Alumno se para en la arena como si estuviera en la tabla (pies en FP2 centrado).
   - Coach construye capa por capa:
     - **Hombros:** "Flechas en los hombros apuntando al frente."
     - **Peso:** "80% pie adelante, 20% pie atrás."
     - **Rodilla:** "Flecha en la rodilla de atrás apuntando al frente."
     - **Flexión:** "Pecho cerca de la rodilla adelante. Compacto."
     - **Manos:** "Abajo, al frente, activas. Escápula atrás, codo a costilla."
     - **Mirada:** "Al frente. No al suelo."
     - **Exhalar:** "Sostené la postura exhalando."

3. **Check visual:**
   - Coach da vuelta alrededor del alumno.
   - Pregunta: *"¿Sentís que podés atacar? ¿Defender? ¿Frenar?"*.
   - Si alumno responde que se siente rígido, suavizar hombros sin perder dirección.

4. **Drill seco de "volver a postura":**
   - Alumno relaja postura (se para normal, brazos sueltos).
   - Coach dice: *"¡Volvé a postura de poder!"*
   - Alumno adopta postura en 1-2 segundos.
   - Repetir 5-10 veces hasta que la transición sea automática.

### Fase 2 — Agua quieta (sobre tabla, sin ola)

1. Alumno remonta a zona shallow agua quieta.
2. Alumno ejecuta pop-up (STP-016).
3. Post pop-up, alumno inmediatamente adopta postura de poder completa (3-5 segundos sosteniendo).
4. Coach corrige una capa por rep: hombros, peso, rodilla, flexión, manos.
5. 3-5 reps con correcciones por capa.

### Fase 3 — Agua con ola (whitewater estable)

1. Alumno ejecuta pop-up + postura de poder.
2. Mantiene postura durante el ride (3-7 segundos).
3. Coach observa desde canal o lateral.
4. Post-rep, feedback inmediato: qué capa estuvo bien, qué capa falló.
5. 5-8 reps target.

---

## COACHING CUES

**Verbal cues durante el rep:**
- *"Shoulders forward."*
- *"Weight forward."*
- *"Back knee forward."*
- *"Compact."*
- *"Exhale."*

**Post-rep:**
- *"¿Te sentiste listo para moverte?"*
- *"¿Dónde estaba tu peso?"*
- *"¿Apuntaba tu rodilla al frente?"*

**Analogía persistente:**
- *"Como el boxeador. Listo para actuar."*

---

## SUCCESS METRICS

- Alumno adopta postura de poder post-pop-up sin indicación verbal (automática).
- Hombros al frente, rodilla atrás al frente, peso adelantado, flexión visible, manos activas.
- Alumno puede "volver a postura" sin demora cuando se le pide.
- Alumno explica la postura con sus palabras (no solo la ejecuta).

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Alumno rígido | Suavizar hombros sin perder dirección. Enfocar en respiración. |
| Alumno con peso atrás por miedo | Bajar condiciones (agua más quieta). Demo de "caer hacia adelante no duele". |
| Alumno sin flexión | Drill isométrico en arena: mantener postura baja 20 segundos. |
| Manos sueltas | Drill específico de escápula + codo a costilla (antes de tabla). |
| No exhala | Coach exhala audible como modelo. Pedir *"hacé lo mismo que yo"*. |
| Cansado | Permitir postura regulada (menos compacta) para sostenerlo. |

---

## COACH RULES

- No introducir impulso (STP-019) si la postura no está establecida.
- No aceptar postura sin hombros alineados — es la capa que determina dirección.
- Demo del boxeador cada primera sesión sin excepciones.
- Corregir una capa por rep, no varias al mismo tiempo.
- Celebrar solo reps con postura completa y conciencia.

---

## CONNECTION TO OTHER STEPS

- **STP-017 Feet Position Center #2 (prerequisito):** sin pies en FP2 centrado, la postura no puede construirse correctamente.
- **STP-019 Impulso (próximo):** postura de poder es la plataforma sobre la cual se construye compresión-extensión.
- **STP-021/022 Turns:** todo turn empieza desde postura de poder.

---

*TSS® White Belt · DRL-WB-18 Power Stance Arrows Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-053 — INACTIVE SCAPULA / SHOULDER COLLAPSE

Los hombros del alumno colapsan hacia adelante (torso encorvado) y/o la escápula está inactiva (manos "volando" sin apoyo estructural). La postura pierde su plataforma superior — sin escápula activa, el tren superior no se conecta con la dirección de la tabla y las manos no pueden funcionar como extensión del cuerpo.

### ERR-WB-054 — WEIGHT ON BACK FOOT

El alumno distribuye demasiado peso en el pie trasero (inversión del 80/20 correcto) o mantiene el peso equilibrado al 50/50. La tabla pierde velocidad, la nariz se levanta, el rail trasero se hunde y la conexión con la ola se rompe.

### ERR-WB-055 — LOOSE HANDS / NO ACTIVATION

Las manos del alumno flotan sueltas, sin control ni activación estructural. No están integradas a la postura — son apéndices que reaccionan al balance en lugar de conducirlo.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-017']::TEXT[],
  'reading',
  38
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-019',
  'white_belt',
  19,
  $tss$Impulso$tss$,
  NULL,
  $tss$Block 4 · M3$tss$,
  $tss$# STP-019 — IMPULSO

**Belt:** White Belt · Block 4 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno a **generar velocidad activamente** mediante el impulso — herramienta opcional pero crítica para recuperar momentum cuando la tabla se queda trabada, pierde velocidad o estabilidad. En surf, **velocidad = estabilidad**: cuanto más rápido va la tabla, más estable se siente. Sin velocidad, los rails se hunden, el equilibrio se rompe y el ride termina.

El impulso no es algo que se usa 100% del tiempo — es una **herramienta en el arsenal del surfer** que aplica desde White Belt hasta Black Belt. Introducirlo en White Belt desde la espuma instala el hábito de "no aceptar pérdida de velocidad como inevitable".

---

## THE 5 KEY WORDS

**FLEX · TOUCH · PUSH · EXTEND · SPEED**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **FLEX** | Flexionar piernas y pecho hacia rodillas (guardar energía) | Postura compacta, pecho cerca de rodilla delantera |
| 2 | **TOUCH** | Tocar el agua con una o dos manos como remos | Manos entran al agua con intención |
| 3 | **PUSH** | Empujar contra el agua hacia atrás (reacción: tabla va adelante) | Fuerza visible en el brazo, agua sale hacia atrás |
| 4 | **EXTEND** | Estirar piernas y cuerpo al mismo tiempo que se empuja | Extensión sincronizada, liberando energía guardada |
| 5 | **SPEED** | Momentum hacia adelante visible y sostenido | Tabla gana velocidad, rails se estabilizan |

---

## ANCHOR PHRASE

> **"Impulse. Touch the water. Push forward."**

**Micro-cue:** *"Flex and extend. Energy forward."*

---

## WHY THIS STEP MATTERS

**Velocidad = estabilidad:**
Cuando perdemos velocidad, los rails se hunden, la tabla se vuelve inestable, el equilibrio se rompe. El impulso es la herramienta para **recuperar velocidad a voluntad**, en lugar de resignarse a la deriva.

**No es mandatorio — es opcional:**
No cada ride requiere impulso. Pero el surfer debe **tenerlo disponible** cuando lo necesita. Sin esta herramienta, el alumno depende 100% de la ola para mantener momentum.

**Flex + extend es la clave:**
Solo tocar el agua no genera velocidad. La clave es **flexionar primero (guardar energía) y extender al empujar (liberarla)**. Es un ciclo compresión-extensión similar al bombeo en una rampa de skate.

**Hábito estructural desde WB:**
Si el alumno aprende a generar velocidad en White Belt, llega a belts superiores con una herramienta ya instalada. Si no, gasta tiempo valioso en belts avanzados aprendiendo lo que debería ser automático.

**Proyección al futuro:**
En niveles avanzados, el impulso se usa después de un cutback (para volver a la ola desde la espuma) y para mantener velocidad en secciones muertas. La mecánica es la misma desde WB — solo cambia el contexto.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno de pie en la tabla con postura de poder (STP-018 certificado) y pierde velocidad durante un ride en whitewater.

✅ **TERMINA:** alumno ejecuta impulso completo (flex + touch + push + extend) con dos manos y/o una mano, recuperando velocidad visible.

❌ **NO incluye:**
- Impulso post-cutback (Blue Belt+ territory).
- Impulso desde posición acostada (eso es paddle, STP-012).
- Turns.
- Transiciones avanzadas de espuma a canal.

**Cross-step dependency:**
- STP-018 Power Stance certificado (sin postura, no hay impulso real).
- STP-017 FP2 centrado (si los pies están mal, el impulso desestabiliza).

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-019 en dos sesiones PASS:

1. **Flexión real:** pecho cerca de rodilla + piernas flexionadas antes del touch.
2. **Touch con intención:** mano(s) entra(n) al agua con fuerza, no es toque simbólico.
3. **Push visible:** agua sale hacia atrás, brazo empuja con fuerza contra el agua.
4. **Extend sincronizado:** piernas y cuerpo se estiran al mismo tiempo que se empuja (no después).
5. **Ganancia de velocidad observable:** tabla avanza visible post-impulso.
6. **Uso oportuno:** alumno identifica cuándo la tabla se queda trabada y ejecuta impulso (no solo cuando el coach se lo pide).
7. **Variante una mano:** alumno puede ejecutar con una sola mano (goofy → izquierda, regular → derecha).

---

## COACHING PRINCIPLE

El impulso **no es tocar el agua** — es un ciclo de compresión-extensión con las manos como palancas. El coach debe diferenciarlo claramente del "toque simbólico" que muchos alumnos hacen sin intención.

**Demo obligatoria:** coach ejecuta en arena y luego en agua. Coach muestra diferencia entre "toque sin impulso" (tabla no cambia) y "impulso completo" (tabla gana velocidad visible).

**Regla del coach:** no celebrar un impulso sin flexión previa ni sin extensión posterior. Medio movimiento = no es impulso.

**Cuándo introducirlo:**
- Solo cuando postura de poder está sólida (STP-018 certificado).
- Introducirlo primero en seco (simulación) antes de agua.
- Primero dos manos, luego una mano.

**Cuándo NO enseñarlo:**
- Si la postura no está establecida (el impulso rompe el equilibrio).
- Si el alumno aún no tiene conciencia de velocidad (primero que sienta "rápido = estable", después impulso).

---

*TSS® White Belt · STP-019 Impulso v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-19 — IMPULSE FORWARD SPEED DRILL

**Step:** STP-019 Impulso
**Belt:** White Belt · Block 4 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## DRILL PURPOSE

Instalar el impulso como **herramienta activa de generación de velocidad** mediante un ciclo claro: flexión → toque → empuje → extensión. El drill aísla cada fase primero (seca), luego las integra (agua quieta), y finalmente las ejecuta en condiciones reales (whitewater).

---

## WHEN TO USE

- Post-STP-018 Power Stance certificado.
- Cuando el alumno pierde velocidad crónicamente durante rides y se queda trabado.
- Cuando el alumno tiene postura pero no sabe qué hacer cuando la tabla frena.
- Como herramienta de recuperación ante pérdida de estabilidad.

---

## SETUP

**Fase 1 — Arena (obligatoria):**
- Alumno de pie en arena simulando tabla.
- Espacio para flexión profunda y extensión completa.
- Coach enfrente del alumno para demo espejo.

**Fase 2 — Agua quieta:**
- Alumno acostado en tabla en agua quieta.
- Practica ciclo de flex + touch + push + extend antes de integrarlo al ride.

**Fase 3 — Whitewater (integración):**
- Zona whitewater estable.
- Coach observa desde lateral o canal.

---

## EXECUTION

### Fase 1 — Arena (dry-run del ciclo)

1. **Demo del coach:**
   - Postura de poder establecida.
   - Coach ejecuta flex: pecho hacia rodillas, piernas flexionadas.
   - Coach simula touch: manos bajan como si tocaran agua.
   - Coach ejecuta push: empuja hacia atrás (las manos van atrás).
   - Coach ejecuta extend: piernas y cuerpo se estiran simultáneamente al push.
   - Coach repite el ciclo 3-5 veces.

2. **Alumno ejecuta ciclo completo en arena:**
   - Empezando desde postura de poder.
   - 5-10 repeticiones lentas, enfocándose en cada fase.
   - Coach corrige fase por fase: *"¿flexionaste las piernas? ¿tocaste con intención? ¿empujaste fuerte? ¿estiraste?"*.

3. **Variante una mano:**
   - Repetir ciclo con una sola mano.
   - Goofy → mano izquierda. Regular → mano derecha.
   - 5 reps cada mano.

### Fase 2 — Agua quieta (simulación de pie sobre tabla)

1. Alumno parado en tabla en agua quieta (sin ola).
2. Coach estabiliza la tabla si es necesario.
3. Alumno ejecuta ciclo completo: flex → touch → push → extend.
4. 5 reps dos manos + 3 reps cada mano.
5. Coach verifica: ¿agua sale hacia atrás? ¿tabla responde (aunque sea mínimo)?

### Fase 3 — Whitewater (integración en ride real)

1. Alumno toma ola y ejecuta pop-up + postura de poder.
2. Cuando siente que la tabla se queda trabada o pierde velocidad, ejecuta impulso.
3. Coach observa: ¿flexión real? ¿extensión real? ¿ganancia de velocidad visible?
4. 5-8 rides con intento de impulso.
5. Post-rep: coach pregunta *"¿cuándo sentiste que necesitabas impulso?"*.

---

## COACHING CUES

**Verbal cues durante el rep:**
- *"Flex. Chest to knees."*
- *"Touch the water."*
- *"Push back."*
- *"Extend. Legs straight."*
- *"Speed forward."*

**Post-rep:**
- *"¿Sentiste que la tabla avanzó?"*
- *"¿Empujaste con fuerza o solo tocaste?"*
- *"¿Estiraste al mismo tiempo que empujabas?"*

---

## SUCCESS METRICS

- Alumno ejecuta ciclo completo (4 fases) sin saltarse ninguna.
- Flexión visible antes del touch.
- Push con fuerza (agua sale hacia atrás).
- Extensión sincronizada con push (no después).
- Ganancia de velocidad visible.
- Alumno identifica oportunidad de impulso (decide cuándo usarlo).
- Variante una mano ejecutable.

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Alumno sin flexión | Drill isométrico de flexión profunda 20 segundos |
| Solo toca, no empuja | Drill de resistencia (coach pone mano como resistencia) |
| No extiende | Ciclo ultra-lento enfocando en extensión |
| Una mano inestable | Volver a dos manos hasta que sea consistente |
| No identifica cuándo usar | Coach señala desde canal: "¡ahora!" |
| Rompe postura al impulsar | Volver a STP-018 — postura no está sólida |

---

## COACH RULES

- No introducir impulso si postura de poder no está sólida.
- Demo en arena obligatoria primera sesión.
- Empezar dos manos, luego una mano.
- No celebrar "toque sin impulso" como impulso real.
- Enseñar al alumno a identificar **cuándo** usar la herramienta, no solo a ejecutarla.

---

## CONNECTION TO OTHER STEPS

- **STP-018 Power Stance (prerequisito):** sin postura, el impulso desestabiliza.
- **STP-017 FP2 (prerequisito):** con pies mal, el impulso rompe equilibrio.
- **Belts superiores (Blue+):** impulso post-cutback usa la misma mecánica en contexto distinto.

---

*TSS® White Belt · DRL-WB-19 Impulse Forward Speed Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-056 — NO LEG FLEXION

El alumno intenta ejecutar el impulso sin flexión previa de las piernas y sin pecho hacia las rodillas. Toca el agua con las manos desde postura erguida o apenas ligeramente inclinada.

### ERR-WB-057 — HALF MOVEMENT / NO PUSH

El alumno toca el agua con las manos pero no empuja contra ella. El movimiento es simbólico: mano entra al agua, mano sale, sin aplicación de fuerza hacia atrás.

### ERR-WB-058 — NOT USING TOOL WHEN NEEDED

El alumno tiene la mecánica del impulso instalada (puede ejecutarla en arena y en agua quieta) pero **no la usa cuando la tabla pierde velocidad en el ride real**. No identifica el momento en que la herramienta es necesaria y se resigna a la pérdida de velocidad como si fuera inevitable.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-018']::TEXT[],
  'reading',
  39
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-020',
  'white_belt',
  20,
  $tss$Starfish Dismount$tss$,
  NULL,
  $tss$Block 0 (Safety) · M3$tss$,
  $tss$# STP-020 — STARFISH DISMOUNT

**Belt:** White Belt · Block 0 (Safety) · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno a **desmontar de la tabla desde la posición de parado de forma segura y ordenada**, cayendo hacia atrás sobre la espuma en forma de estrella (X). Es la técnica de salida cuando ya venís parado y decidís bajarte — parte final de la secuencia del ride, crítica **por seguridad**.

El objetivo es bajarnos cuando queramos sin estrellarnos contra la arena, piedras o personas, y sin ir demasiado profundo contra el fondo. Es la contraparte estándar del STP-014 Prone Dismount (que sale desde acostado, ciclo M2) aplicada a la fase de parado (ciclo M3+).

---

## THE 5 KEY WORDS

**DECIDE · BEND · OPEN · FALL · FOAM**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **DECIDE** | Decidir desmontar antes de que sea emergencia | Alumno anticipa punto de salida |
| 2 | **BEND** | Flexionar un poco las rodillas antes de caer | Piernas flexionadas, centro bajo |
| 3 | **OPEN** | Abrir brazos y piernas en forma de estrella / X | Cuerpo ancho, extremidades separadas |
| 4 | **FALL** | Dejarse caer hacia atrás (no hacia adelante ni a un lado) | Trayectoria clara hacia espuma |
| 5 | **FOAM** | Aterrizar sobre la espuma que hace de colchón | Impacto amortiguado, sin golpe directo |

---

## ANCHOR PHRASE

> **"Starfish. Open. Fall on the foam."**

**Micro-cue:** *"Wide body. Fall back. Foam cushions."*

---

## WHY THIS STEP MATTERS

**Seguridad primero:**
El ride termina. La pregunta es *cómo* termina. Sin técnica de desmontar, el alumno termina estrellándose contra la arena (agua poco profunda adelante), o tirándose a un lado sin control, o saltando y golpeándose tobillo. Starfish evita todo eso.

**El cuerpo abierto = resistencia:**
Cuerpo abierto en estrella genera resistencia al agua. Resistencia = menos penetración hacia el fondo. Cuerpo cerrado = proyectil que va al fondo rápido (peligro).

**Detrás está la espuma — colchón natural:**
La espuma amortigua el impacto. Adelante (hacia la orilla) hay menos agua o roca. La regla es **caer donde hay espuma**, siempre.

**Aplicable a toda carrera del surfer:**
Desde White Belt hasta Black Belt — la técnica de starfish dismount se usa siempre que haya espuma detrás. Lo único que cambia en niveles superiores es la velocidad de decisión y la consistencia con que se ejecuta.

**Distinción del STP-014:**
STP-014 Prone Dismount sale desde acostado (ciclo M2 — paddle/prone). STP-020 sale desde parado (ciclo M3 — de pie). Ambos cierran el ride. El alumno elige según su posición al momento de decidir salir.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno de pie ejecutando el ride + identifica punto de salida seguro (hay espuma detrás, se acerca a la orilla o necesita terminar).

✅ **TERMINA:** alumno cae en estrella sobre la espuma, sin impacto lateral ni frontal, sin ir profundo.

❌ **NO incluye:**
- Salida por el hombro de la ola (nivel avanzado — Blue Belt+).
- Desmonte desde acostado (STP-014).
- Recuperación post-caída (próximo ride).
- Salto activo (peligroso y no doctrinal).

**Cross-step dependency:**
- STP-018 Power Stance (viene parado, tiene postura).
- STP-014 Prone Dismount (misma lógica de salida segura, distinto punto de partida).
- Pre-requisito para completar cualquier ride de pie con seguridad.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-020 en dos sesiones PASS:

1. **Decisión anticipada:** alumno decide desmontar antes de estar en zona de peligro (no reactivo).
2. **Flexión previa:** rodillas dobladas antes de abrir.
3. **Estrella / X:** brazos y piernas abiertos al caer.
4. **Dirección correcta:** caída hacia atrás (sobre espuma), no hacia adelante ni a un lado.
5. **Aterrizaje seguro:** cae sobre espuma, no sobre arena, roca ni agua muy baja.
6. **Sin salto activo:** no salta — se deja caer controladamente.
7. **Conciencia:** alumno puede explicar por qué cae atrás y no adelante.

---

## COACHING PRINCIPLE

Starfish no es reactivo — es **decisión consciente de cómo cerrar el ride**. El coach debe instalar el hábito de **decidir el punto de salida** antes de que sea emergencia.

**Demo obligatoria:** coach demuestra starfish en whitewater seco (arena) y en agua. Incluye demo de "cómo NO hacerlo" (caer de lado, saltar, ir adelante) con explicación de consecuencias.

**Regla del coach:** no celebrar ride si el desmonte fue descontrolado. Un ride bien ejecutado termina bien. Desmonte es parte del ride, no es "después del ride".

**Diagnóstico de malas salidas:**
- Cae de lado → no abrió brazos y piernas (ERR-WB-059).
- Cuerpo cerrado → no se abrió (ERR-WB-060).
- Sale tarde → no decidió a tiempo (ERR-WB-061).
- Salta → nunca se enseñó que debe dejarse caer.

**Timing:**
Enseñar en Block 0 (Safety) porque protege al alumno desde el primer ride de pie. No esperar a que "pase algo" para enseñarlo.

---

*TSS® White Belt · STP-020 Starfish Dismount v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-20 — STARFISH DISMOUNT DRILL

**Step:** STP-020 Starfish Dismount
**Belt:** White Belt · Block 0 (Safety) · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## DRILL PURPOSE

Instalar el starfish dismount como **técnica de cierre seguro del ride de pie**. El drill aísla la decisión (cuándo desmontar), la mecánica (flexionar + abrir + caer) y la dirección (siempre atrás, sobre espuma).

---

## WHEN TO USE

- Bloque Safety — desde el primer ride de pie.
- Cuando el alumno cae de lado o adelante en lugar de atrás.
- Cuando el alumno salta en lugar de dejarse caer.
- Cuando el alumno llega demasiado cerca de la orilla antes de desmontar.

---

## SETUP

**Fase 1 — Arena (obligatoria):**
- Alumno de pie en arena.
- Coach demuestra en arena blanda o con colchón.
- Espacio despejado atrás para caer sin chocar.

**Fase 2 — Agua quieta / shallow:**
- Zona con agua de cintura.
- Tabla cerca para referencia visual.

**Fase 3 — Whitewater en ride real:**
- Zona whitewater estable.
- Coach desde canal o lateral.

---

## EXECUTION

### Fase 1 — Arena (dry-run del starfish)

1. **Demo del coach:**
   - Coach adopta postura de poder.
   - Coach ejecuta starfish lento: flex rodillas → abre brazos → abre piernas → cae atrás.
   - Coach repite en tiempo real (1 segundo).
   - Coach incluye demo de "cómo NO hacerlo": caer adelante, caer de lado, saltar.

2. **Alumno ejecuta starfish en arena:**
   - Postura de poder.
   - Flex rodillas.
   - Abre brazos y piernas en X.
   - Se deja caer hacia atrás (coach puede sostenerlo para control en primeras reps).
   - 5-10 reps hasta que la mecánica sea automática.

3. **Drill de decisión:**
   - Coach grita "¡Ahora!" en momentos aleatorios.
   - Alumno ejecuta starfish inmediatamente.
   - Entrena respuesta rápida a decisión.

### Fase 2 — Agua quieta (starfish sin ride)

1. Alumno parado en tabla en agua quieta (agua de cintura).
2. Coach dice "¡Ahora!".
3. Alumno ejecuta starfish sobre la tabla → espuma lateral o agua.
4. 3-5 reps para sentir el impacto del agua.
5. Coach verifica: ¿abrió brazos? ¿abrió piernas? ¿cayó atrás?

### Fase 3 — Whitewater en ride real

1. Alumno toma ola, ejecuta pop-up + postura + ride.
2. Cuando siente que es momento (llegando a zona de orilla o perdió velocidad), ejecuta starfish.
3. Coach desde canal verifica: decisión anticipada, mecánica correcta, aterrizaje sobre espuma.
4. 5-8 rides con starfish.
5. Post-rep: coach pregunta *"¿Por qué decidiste salir ahí?"*.

---

## COACHING CUES

**Verbal cues durante decisión:**
- *"Decide. Ahora."*
- *"Starfish."*
- *"Abrí brazos y piernas."*
- *"Atrás, sobre la espuma."*

**Post-rep:**
- *"¿Caíste adelante o atrás?"*
- *"¿Abriste el cuerpo o quedaste cerrado?"*
- *"¿Hubiera sido más seguro salir antes?"*

---

## SUCCESS METRICS

- Decisión anticipada de salir (no reactivo, no de último momento).
- Rodillas flexionadas antes de abrir.
- Brazos y piernas abiertos en X.
- Dirección clara hacia atrás, sobre espuma.
- Aterrizaje sin golpe, sin ir profundo.
- Alumno explica por qué cae atrás y no adelante.

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Cae de lado | Drill específico de "X completa" en arena |
| Cuerpo cerrado al caer | Drill isométrico de apertura (brazos/piernas abiertos 5s) |
| Salta en lugar de dejarse caer | Demo explícita: "caer ≠ saltar" + práctica con coach sosteniendo |
| Decide tarde | Coach grita "¡Ahora!" desde canal antes del punto crítico |
| Miedo a caer atrás | Empezar en agua muy shallow, sentir que no hay peligro |
| Olvida desmontar | Recordatorio pre-ride: "al final, starfish" |

---

## COACH RULES

- Enseñar desde primer ride de pie — no esperar a incidente.
- Demo de "cómo NO hacerlo" es tan importante como demo de "cómo sí".
- Instalar decisión anticipada — no solo mecánica.
- No celebrar ride bien ejecutado si el desmonte fue descontrolado.
- Coach desde canal puede gritar "¡AHORA!" durante primeras sesiones.

---

## CONNECTION TO OTHER STEPS

- **STP-018 Power Stance (prerequisito):** starfish empieza desde postura.
- **STP-014 Prone Dismount (hermano):** misma lógica de salida segura, distinto punto de partida (acostado vs parado).
- **Belts superiores:** salida por el hombro de la ola es técnica avanzada (Blue+); starfish sigue siendo opción válida siempre que haya espuma.

---

*TSS® White Belt · DRL-WB-20 Starfish Dismount Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-059 — FALLING SIDE INSTEAD OF BACK

El alumno se tira a un lado (rail izquierdo o derecho) en lugar de caer hacia atrás sobre la espuma. La caída lateral no aprovecha el colchón de espuma detrás, deja al alumno vulnerable a chocar con objetos laterales, y rompe el principio doctrinal de "atrás, siempre atrás donde hay espuma".

### ERR-WB-060 — NOT OPENING BODY

El alumno cae hacia atrás pero **no abre brazos ni piernas en forma de estrella / X**. El cuerpo queda cerrado, compacto, como proyectil.

### ERR-WB-061 — DISMOUNT TOO LATE

El alumno no decide desmontar a tiempo. Continúa el ride hasta que la tabla está muy cerca de la orilla, el agua es muy shallow, o la ola ya lo empuja descontroladamente.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-019']::TEXT[],
  'reading',
  40
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-021',
  'white_belt',
  21,
  $tss$Turn Backside$tss$,
  NULL,
  $tss$Block 5 · M3$tss$,
  $tss$# STP-021 — TURN BACKSIDE

**Belt:** White Belt · Block 5 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno a **cambiar de riel hacia el lado backside** aplicando fuerza en el riel mediante una **cadena cinética ordenada**: mirada → cuello → oblicuo → cadera → pie → talón. La tabla cruza hacia backside **porque se hunde el riel backside**, no porque el alumno "gire" desordenado.

La regla física es: aplicar fuerza al riel para que la tabla cruce. La forma canónica de aprenderlo con control es la cadena cinética que preserva postura, estabilidad y conexión.

---

## THE 5 KEY WORDS

**LOOK · OBLIQUE · HIP · HEEL · RAIL**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **LOOK** | Mirar hacia donde se quiere ir (goofy: sobre hombro derecho / regular: sobre hombro izquierdo) | Cuello rota, hombros NO rotan |
| 2 | **OBLIQUE** | Activar oblicuo hacia dirección sin rotar hombros | Oblicuo visible como iniciador |
| 3 | **HIP** | Cadera sigue a oblicuo, transfiriendo energía abajo | Cadera rota dentro de postura |
| 4 | **HEEL** | Presión en talón del pie backside | Talón se hunde claramente |
| 5 | **RAIL** | Riel backside se hunde = tabla cruza | Tabla responde con dirección backside |

---

## ANCHOR PHRASE

> **"Look. Oblique. Hip. Heel. Change the rail."**

**Micro-cue:** *"Eyes first. Rail responds."*

---

## WHY THIS STEP MATTERS

**La tabla no gira — cambia de riel:**
El principio físico es que la tabla está diseñada para ir hacia donde se hunde un riel. "Girar" desordenado torciendo el cuerpo no funciona. Aplastar el riel correcto sí.

**Cadena cinética ordenada:**
La secuencia mirada → oblicuo → cadera → talón es la cadena. Si falta un eslabón, el turn se rompe. Por ejemplo: si el alumno mira pero no activa oblicuo, la cadera no sigue y el riel no se hunde.

**Hombros siguen al frente:**
La flecha en los hombros (doctrina de STP-018 Power Stance) se mantiene. Solo el cuello rota para mirar. Si los hombros rotan, la postura se rompe y el alumno pierde control.

**Peso adelante sigue:**
80/20 del peso en pie delantero (STP-018) se mantiene durante el turn. El talón backside aplica presión sin sacar peso del pie delantero. Perder peso delantero = tabla frena.

**Preparación a lo siguiente:**
Un turn bien ejecutado termina en postura de poder, listo para otra maniobra. Un turn forzado (cuerpo torcido) termina desarmado — el alumno tiene que "recuperarse" antes de hacer nada más.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno ejecutando ride con postura de poder establecida (STP-018 certificado) y pies en FP2/FP1 (STP-017).

✅ **TERMINA:** tabla cruza claramente hacia backside, alumno mantiene postura, energía conectada de mirada a talón, listo para próxima maniobra.

❌ **NO incluye:**
- Turn frontside (STP-022).
- Turns avanzados (cutback, snap, carve — Blue Belt+).
- Turns rompiendo forma canónica (Purple Belt+).
- Recuperación post-caída.

**Cross-step dependency:**
- STP-017 Feet Position (pie atrás en FP1 o FP1/FP2 para mejor respuesta backside).
- STP-018 Power Stance (hombros al frente, peso adelante).
- Pre-requisito para STP-022 Frontside (cadena cinética es la misma; solo cambia el lado).

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-021 en dos sesiones PASS:

1. **Mirada clara:** alumno mira hacia backside antes del movimiento.
2. **Hombros al frente:** no rotan — solo cuello rota.
3. **Oblicuo activo:** inicia el movimiento, visible como iniciador.
4. **Cadera sigue:** cadera rota dentro de postura (no torce el torso completo).
5. **Presión en talón:** talón backside se hunde con intención.
6. **Tabla responde:** cruza hacia backside visible y sostenido.
7. **Postura preservada:** alumno termina en postura, no desarmado.
8. **Conciencia de cadena:** alumno explica la secuencia ojos → oblicuo → cadera → talón.

---

## COACHING PRINCIPLE

El turn backside no es "girar" — es **cambiar el riel aplicando una cadena cinética precisa**. El coach debe enseñar la cadena **en orden** y no permitir atajos (como girar con hombros).

**Demo obligatoria en arena:** coach ejecuta la cadena lentamente, señalando cada eslabón. El alumno reproduce. Sin entender la cadena, no se ejecuta bien en agua.

**Regla del coach:** si los hombros rotan, el turn está mal. Si el alumno gira sin mirar primero, el turn es reactivo (no técnica). Si la tabla no responde, revisar pie de atrás (probablemente muy adelante) y presión en talón.

**Diagnóstico clave:**
- Tabla no responde → pie de atrás muy adelante, revisar posición (probablemente FP2 sin lograr FP1 para backside) + presión en talón insuficiente.
- Cuerpo desarmado post-turn → cadena cinética ejecutada desordenada (giró con hombros en lugar de oblicuo).
- Turn corto → mirada insuficiente hacia dirección.

**Pie de atrás más cerca de FP1 (si es necesario):**
Para backside, el pie atrás puede beneficiarse de estar entre FP1 y FP2, o directamente en FP1. Eso le da al talón más palanca para hundir riel backside. No es obligatorio mover el pie, pero si la tabla no responde, es el primer ajuste.

**Choosing the line:**
La entrada óptima es: cobra → elijo línea → pop-up → postura → rotación. Permite planear la energía. No es regla absoluta — también se puede ir recto y después cruzar — pero el patrón es óptimo.

---

*TSS® White Belt · STP-021 Turn Backside v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-21 — BACKSIDE RAIL CHANGE DRILL

**Step:** STP-021 Turn Backside
**Belt:** White Belt · Block 5 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## DRILL PURPOSE

Instalar el turn backside como **cadena cinética ordenada** (mirada → oblicuo → cadera → talón → riel) que hunde el riel backside para que la tabla cruce. Aísla cada eslabón primero en arena, luego los integra en agua.

---

## WHEN TO USE

- Post-STP-018 Power Stance certificado + STP-017 FP2 dominado.
- Primer turn que se introduce (antes de frontside).
- Cuando el alumno gira pero rota hombros rompiendo postura.
- Cuando la tabla no responde al intento de turn.

---

## SETUP

**Fase 1 — Arena (obligatoria):**
- Alumno de pie en arena en postura de poder.
- Espacio para rotación cadera y cuello sin obstrucciones.
- Coach enfrente haciendo demo espejo.

**Fase 2 — Tabla en arena:**
- Tabla apoyada en arena o sobre superficie plana.
- Alumno parado en tabla, coach corrige posición pies (FP2 o FP1/FP2).

**Fase 3 — Agua quieta / whitewater estable:**
- Whitewater con suficiente velocidad para que el turn se ejecute.

---

## EXECUTION

### Fase 1 — Arena (cadena cinética aislada)

1. **Demo del coach:**
   - Postura de poder establecida.
   - Coach ejecuta cadena lentamente:
     - Mirada: cuello rota hacia backside (goofy derecho, regular izquierdo). Hombros al frente.
     - Oblicuo: coach señala cómo activa oblicuo sin mover hombros.
     - Cadera: cadera sigue al oblicuo, dentro de postura.
     - Talón: presión en talón backside.
   - Coach repite 3 veces lento, luego 2 veces en tiempo real.

2. **Alumno ejecuta la cadena:**
   - Postura de poder.
   - Mirada solo (cuello). Verificar hombros no rotan. 5 reps.
   - Mirada + oblicuo. 5 reps.
   - Mirada + oblicuo + cadera. 5 reps.
   - Mirada + oblicuo + cadera + talón. 5 reps.
   - Cadena completa en tiempo real. 5 reps.

3. **Drill de aislamiento:**
   - Coach sostiene hombros del alumno (presión ligera para que sienta "no rotar").
   - Alumno ejecuta cadena sintiendo que hombros permanecen al frente.
   - Repetir hasta que el alumno sienta la diferencia clara entre "rotar oblicuo" (correcto) vs "rotar hombros" (incorrecto).

### Fase 2 — Tabla en arena

1. Alumno parado en tabla con pies en FP2 (o FP1/FP2 si necesita).
2. Ejecuta cadena completa sobre tabla.
3. Coach corrige posición pies: si el alumno tiene pie atrás muy adelante, mover hacia FP1 para más palanca talón.
4. 5 reps.

### Fase 3 — Agua con ride real

1. Alumno toma ola, ejecuta pop-up + postura.
2. Mira hacia backside + ejecuta cadena.
3. Coach observa: ¿hombros al frente? ¿oblicuo activa? ¿tabla cruza?
4. 5-8 turns. Target: 3+ con cadena completa + tabla responde.
5. Post-rep: coach pregunta *"¿dónde miraste primero?"*, *"¿sentiste el oblicuo?"*, *"¿la tabla respondió?"*.

---

## COACHING CUES

**Verbal cues durante el rep:**
- *"Look."*
- *"Oblique."*
- *"Hip."*
- *"Heel."*
- *"Change the rail."*

**Post-rep:**
- *"¿Miraste antes de girar?"*
- *"¿Sentiste el oblicuo como iniciador?"*
- *"¿La tabla cruzó o giró por inercia?"*
- *"¿Tus hombros rotaron?"*

---

## SUCCESS METRICS

- Cadena cinética en orden (mirada → oblicuo → cadera → talón).
- Hombros al frente durante todo el turn.
- Oblicuo activo como iniciador visible.
- Cadera rota dentro de postura (no torce torso completo).
- Talón hunde riel — tabla cruza hacia backside claramente.
- Alumno mantiene postura al completar turn.
- Alumno explica la cadena con sus palabras.

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Hombros rotan | Coach sostiene hombros + drill aislamiento oblicuo |
| Tabla no responde | Revisar pie atrás (mover hacia FP1) + enfocar presión talón |
| Cuello rígido | Drill de mirada sola (solo cuello, ojos cerrados verificando hombros estables) |
| Oblicuo no se activa | Drill isométrico de oblicuo en arena (postura + activación lateral 10s × 5) |
| Turn corto | Mirar más lejos (más ángulo de cuello) + mantener cadena hasta que tabla complete cruce |
| Desarma post-turn | Volver a postura mental: "termino en postura de poder, listo para lo siguiente" |

---

## COACH RULES

- Demo en arena obligatoria antes de agua.
- Cadena se enseña aislando eslabones — no saltar directo al movimiento completo.
- Verificar hombros al frente siempre — es la regla que preserva postura.
- No aceptar turn que gira por inercia (sin cadena clara).
- Si tabla no responde, revisar pie atrás (STP-017) antes de exigir más fuerza.

---

## CONNECTION TO OTHER STEPS

- **STP-018 Power Stance (prerequisito):** hombros al frente vienen de postura.
- **STP-017 FP2/FP1 (prerequisito):** pie atrás bien ubicado permite palanca talón.
- **STP-022 Turn Frontside (siguiente):** misma cadena cinética, lado opuesto.
- **Belts superiores:** misma cadena con más potencia, menor tiempo, variaciones (cutback, snap).

---

*TSS® White Belt · DRL-WB-21 Backside Rail Change Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-062 — NOT LOOKING WHERE GOING

El alumno intenta ejecutar el turn backside **sin mirar primero** hacia donde quiere ir. Gira por inercia o reacción muscular, rompiendo el primer eslabón de la cadena cinética.

### ERR-WB-063 — SHOULDER ROTATION INSTEAD OF OBLIQUE

El alumno intenta girar **rotando los hombros** en lugar de activar el oblicuo. Rompe la regla central del Power Stance (hombros al frente) y ejecuta un turn forzado, sin cadena cinética.

### ERR-WB-064 — DISCONNECTED BODY

El alumno ejecuta el turn con el **cuerpo desconectado** — partes del cuerpo se mueven independientemente sin formar cadena. Brazos van para un lado, caderas para otro, trasero sobresale, talón no aplica presión coordinada.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-020']::TEXT[],
  'reading',
  41
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-022',
  'white_belt',
  22,
  $tss$Turn Frontside$tss$,
  NULL,
  $tss$Block 5 · M3$tss$,
  $tss$# STP-022 — TURN FRONTSIDE

**Belt:** White Belt · Block 5 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno a **cambiar de riel hacia el lado frontside** aplicando fuerza en el riel con el cuerpo conectado. La tabla cruza hacia frontside **porque se hunde el riel frontside**, manteniendo postura, mirada dirigida, oblicuo activo y presión en el pie de adelante.

La regla física es la misma que backside: aplicar fuerza al riel para que la tabla cruce. En frontside, la cadena cinética gira hacia la dirección contraria y el pie de adelante toma mayor protagonismo como punto de presión.

---

## THE 5 KEY WORDS

**LOOK · OBLIQUE · POSTURE · FRONT · RAIL**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **LOOK** | Mirar hacia dirección frontside (goofy: izquierda / regular: derecha) | Cuello rota, hombros al frente |
| 2 | **OBLIQUE** | Activar oblicuo hacia dirección frontside | Oblicuo visible como iniciador |
| 3 | **POSTURE** | Mantener postura conectada (sin desarmar torso) | Hombros al frente, cuerpo en línea |
| 4 | **FRONT** | Mantener/aumentar presión en pie de adelante | Tabla no frena, energía hacia adelante |
| 5 | **RAIL** | Riel frontside se hunde = tabla cruza | Tabla responde con dirección frontside |

---

## ANCHOR PHRASE

> **"Look. Oblique. Stay connected. Pressure forward."**

**Micro-cue:** *"Eyes first. Rail responds."*

---

## WHY THIS STEP MATTERS

**Misma doctrina que backside — lado opuesto:**
El principio físico es idéntico al Turn Backside (STP-021): la tabla cambia de riel cuando se aplica fuerza. En frontside, la cadena cinética se dirige al lado opuesto (frontside del surfer).

**Postura conectada es la clave:**
El error más frecuente en frontside es que el alumno **desconecta el cuerpo** — los brazos se disparan hacia adelante queriendo "alcanzar" la dirección, la escápula se desactiva y el cuerpo pierde conexión. La tabla puede responder, pero el surfer queda desarmado.

**Presión en pie de adelante:**
En frontside, el pie de adelante aumenta importancia. La presión hacia adelante preserva energía y hace que la tabla cruce con control. Sin presión, la tabla frena o gira solo por inercia.

**Hombros al frente se mantienen:**
Regla heredada de Power Stance (STP-018): los hombros apuntan en la misma dirección que la nariz de la tabla. Solo el cuello rota para mirar hacia frontside. Si los hombros rotan, se desarma todo.

**Pie atrás bien posicionado ayuda:**
Si la tabla no responde al frontside, revisar FP2 (STP-017). Un pie atrás mal posicionado impide que la cadena cinética funcione — el talón/dedo no tiene la palanca necesaria.

**Espejo de backside:**
Turn Frontside se enseña **después** de Turn Backside porque la cadena ya está instalada. Solo cambia la dirección. Esto consolida el principio general: "la tabla no gira, cambia de riel".

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno en ride con Power Stance (STP-018) + pies en FP2 (STP-017) + Turn Backside (STP-021) instalado.

✅ **TERMINA:** tabla cruza claramente hacia frontside, alumno mantiene postura conectada, brazos en control, presión en pie delantero sostenida, listo para próxima maniobra.

❌ **NO incluye:**
- Turn backside (STP-021 — prerequisito).
- Turns avanzados (cutback, snap, carve — Blue Belt+).
- Turns rompiendo forma canónica (Purple Belt+).
- Turns encadenados (Yellow Belt+).

**Cross-step dependency:**
- STP-017 Feet Position (FP2 permite respuesta correcta).
- STP-018 Power Stance (hombros al frente, peso adelante).
- STP-021 Turn Backside (cadena cinética ya instalada — misma doctrina lado opuesto).

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-022 en dos sesiones PASS:

1. **Mirada clara:** alumno mira hacia frontside antes del movimiento.
2. **Hombros al frente:** no rotan — solo cuello rota.
3. **Oblicuo activo:** inicia el movimiento hacia frontside.
4. **Postura preservada:** torso no desarma, brazos no se disparan hacia adelante.
5. **Presión pie delantero:** energía hacia adelante visible — tabla no frena.
6. **Tabla responde:** cruza hacia frontside visible y sostenido.
7. **Conexión corporal:** cuerpo en línea, no fragmentado.
8. **Alumno explica:** misma cadena que backside, dirección opuesta, presión en pie de adelante como punto clave.

---

## COACHING PRINCIPLE

El turn frontside **no es más fácil ni más difícil que backside** — es el mismo principio en dirección opuesta. El coach debe enfatizar que la cadena cinética es idéntica y que la única diferencia es (a) la dirección de mirada/oblicuo y (b) mayor énfasis en presión del pie de adelante.

**Demo comparativa backside vs frontside:** coach ejecuta ambos turns lado a lado en arena, mostrando que la mecánica es espejo. Esto consolida el principio general.

**Regla del coach:** si el alumno desconecta el cuerpo (brazos volando, torso torcido), pausar. Regresar a arena y re-instalar la cadena. Un frontside mal hecho hoy = cutback roto mañana.

**Diagnóstico clave:**
- Tabla no responde → pie atrás en FP2 mal posicionado + falta presión pie delantero.
- Cuerpo desconectado → escápula desactiva, brazos se disparan hacia adelante.
- Turn corto → mirada insuficiente o cadena sin llegar al final (riel).
- Tabla frena → peso se fue al pie atrás durante el turn.

**Referencia visual:**
El "objetivo" (choosing the line) ayuda. Antes del turn, el alumno identifica adónde quiere ir. Esto convierte el turn de reactivo a directivo.

**Secuencia óptima:** cobra → línea → pop-up → postura → rotación. Conserva energía y hace que la tabla responda mejor.

---

*TSS® White Belt · STP-022 Turn Frontside v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-22 — FRONTSIDE RAIL CHANGE DRILL

**Step:** STP-022 Turn Frontside
**Belt:** White Belt · Block 5 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## DRILL PURPOSE

Instalar el turn frontside como **cadena cinética ordenada espejo de backside** (mirada → oblicuo → postura conectada → pie delantero → riel). Aprovecha que el alumno ya tiene la cadena instalada en backside (STP-021) y la transfiere al lado opuesto con énfasis en presión en pie de adelante y cuerpo conectado.

---

## WHEN TO USE

- Post-STP-021 Turn Backside certificado.
- Alumno ejecuta turn frontside pero los brazos vuelan hacia adelante.
- Alumno desconecta el cuerpo durante el turn (torso torcido, cuerpo fragmentado).
- Tabla no responde a frontside — revisar FP2 + presión pie delantero.

---

## SETUP

**Fase 1 — Arena (cadena espejo):**
- Alumno en postura de poder en arena.
- Coach en espejo para demo comparativa.
- Espacio para rotar cuello y activar oblicuo sin obstrucciones.

**Fase 2 — Tabla en arena:**
- Tabla plana, alumno parado en FP2.
- Coach corrige alineación de pies si es necesario.

**Fase 3 — Agua con ride real:**
- Whitewater con velocidad suficiente para que la tabla responda.

---

## EXECUTION

### Fase 1 — Arena (cadena espejo)

1. **Demo comparativa del coach:**
   - Coach ejecuta turn backside lento (5 reps).
   - Coach ejecuta turn frontside lento (5 reps).
   - Coach señala: *"Misma cadena, dirección opuesta."*
   - Clave: hombros al frente en ambos; solo cuello rota.

2. **Alumno ejecuta cadena frontside aislada:**
   - Postura de poder.
   - Mirada solo hacia frontside (goofy: izquierda / regular: derecha). Verificar hombros no rotan. 5 reps.
   - Mirada + oblicuo frontside. 5 reps.
   - Mirada + oblicuo + presión pie delantero. 5 reps.
   - Cadena completa arena: Look · Oblique · Posture · Front · Rail. 5 reps.

3. **Drill de conexión corporal:**
   - Alumno ejecuta cadena con manos en cintura (no permite que los brazos se disparen hacia adelante).
   - Verifica sensación de postura conectada.
   - Luego repite con brazos libres, pero manteniendo conexión. 5 reps.

### Fase 2 — Tabla en arena

1. Alumno en tabla con pies en FP2.
2. Ejecuta cadena completa frontside en tabla.
3. Coach verifica postura + presión pie delantero visible.
4. 5 reps.

### Fase 3 — Agua con ride real

1. Alumno toma ola, ejecuta pop-up + postura.
2. Ejecuta turn frontside con cadena completa.
3. Coach observa: ¿hombros al frente? ¿brazos en control? ¿tabla cruza?
4. 5-8 turns. Target: 3+ con cadena completa + tabla responde + cuerpo conectado.
5. Post-rep: coach pregunta *"¿Dónde miraste?"*, *"¿Sentiste el oblicuo?"*, *"¿Mantuviste presión adelante?"*, *"¿Tus brazos se dispararon?"*.

---

## COACHING CUES

**Verbal cues durante el rep:**
- *"Look."*
- *"Oblique."*
- *"Stay connected."*
- *"Pressure forward."*
- *"Change the rail."*

**Post-rep:**
- *"¿Miraste primero o giraste primero?"*
- *"¿Sentiste el oblicuo?"*
- *"¿Tus brazos quedaron controlados?"*
- *"¿La tabla cruzó o giró por inercia?"*
- *"¿Mantuviste peso adelantado?"*

---

## SUCCESS METRICS

- Cadena cinética en orden (mirada → oblicuo → postura → pie delantero → riel).
- Hombros al frente todo el turn.
- Oblicuo activa como iniciador visible.
- Brazos no se disparan hacia adelante — quedan en control.
- Peso adelantado preservado — tabla no frena.
- Tabla cruza hacia frontside claramente.
- Alumno termina en postura, no desarmado.
- Alumno explica conexión con STP-021 (misma cadena, lado opuesto).

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Brazos se disparan hacia adelante | Drill con manos en cintura · coach enfatiza "cuerpo conectado" |
| Tabla frena | Revisar peso — verificar que no se desplazó al pie atrás durante turn |
| Tabla no responde | Revisar FP2 + presión pie delantero insuficiente |
| Alumno rota hombros | Regresar a drill backside (STP-021) — regla hombros al frente se aplica igual |
| Turn corto | Mirar más lejos + mantener cadena completa hasta que tabla complete cruce |
| Escápula inactiva | Drill de activación escapular (STP-018 ERR-WB-053) |
| Cuerpo desarmado | Drill slow-motion en arena + verbalización de cada eslabón |

---

## COACH RULES

- Empezar con demo comparativa backside vs frontside (consolida principio).
- Verificar brazos en control — no se disparan hacia adelante.
- No aceptar turn con cuerpo desconectado.
- Si tabla frena, revisar presión pie delantero antes de exigir más fuerza.
- Usar "objetivo" (choosing the line) para convertir turn de reactivo a directivo.

---

## CONNECTION TO OTHER STEPS

- **STP-018 Power Stance (prerequisito):** hombros al frente, peso adelante.
- **STP-017 FP2 (prerequisito):** pie atrás bien posicionado permite respuesta.
- **STP-021 Turn Backside (prerequisito):** cadena cinética ya instalada.
- **Belts superiores:** base para cutback frontside, snap frontside, carve frontside.

---

*TSS® White Belt · DRL-WB-22 Frontside Rail Change Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-065 — ARMS REACHING FORWARD

Durante el turn frontside, los **dos brazos se disparan hacia adelante** como queriendo alcanzar algo. La escápula se desactiva, la postura se desarma, y aunque la tabla puede responder por inercia, el cuerpo queda desconectado y sin control post-turn.

### ERR-WB-066 — WEIGHT FALLS OFF FRONT FOOT

Durante el turn frontside, el **peso del alumno se desplaza hacia atrás** — se sale del pie delantero que debe mantener presión. La tabla frena o no cruza con energía.

### ERR-WB-067 — BOARD NOT RESPONDING (FRONTSIDE)

El alumno ejecuta la cadena cinética hacia frontside pero **la tabla no cruza** — o cruza muy parcialmente. Antes de exigir más fuerza, el coach debe verificar (1) posición del pie atrás (FP2), (2) presión pie delantero, (3) orden de la cadena.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-021']::TEXT[],
  'reading',
  42
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-023',
  'white_belt',
  23,
  $tss$Paddle Out$tss$,
  NULL,
  $tss$Block 6 · M3$tss$,
  $tss$# STP-023 — PADDLE OUT

**Belt:** White Belt · Block 6 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno a **remar prono con autonomía y eficiencia** para salir a la zona de olas. Integra sweet spot correcto, remada alternada con entrada aerodinámica, codo pasando sobre la oreja, proyección hacia adelante (no hacia arriba) y uso inteligente de las "marchas" de remada según el objetivo.

El paddle out es el puente entre "alumno asistido" y "surfer autónomo" — es la primera vez que el alumno se mueve por el agua por su propia cuenta. La eficiencia aquí determina cuánta energía le queda para las olas.

---

## THE 5 KEY WORDS

**SWEET · ENTER · ELBOW · FORWARD · ARROW**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **SWEET** | Cuerpo en el sweet spot de la tabla | Pecho alineado, tabla no hunde cola ni nariz |
| 2 | **ENTER** | Entrada aerodinámica de los dedos | Dedos primero, mano relajada, sin "pala rígida" |
| 3 | **ELBOW** | Codo pasa sobre la oreja | Brazada alta, proyección larga |
| 4 | **FORWARD** | Empuje hacia adelante (no hacia arriba) | Tabla proyecta horizontal, no levanta nariz |
| 5 | **ARROW** | Cuerpo como flecha | Cabeza quieta, línea recta, sin zigzag |

---

## ANCHOR PHRASE

> **"Sweet spot. Enter clean. Push forward. Like an arrow."**

**Micro-cue:** *"Arm over ear. Body like an arrow."*

---

## WHY THIS STEP MATTERS

**Autonomía en el agua:**
Hasta STP-022, el alumno depende del whitewater o de empuje externo. Paddle Out es la primera vez que se mueve por sí mismo. Sin remada eficiente, no hay surf real posible.

**Eficiencia energética:**
Remar mal consume energía rápidamente. Un paddle out ineficiente agota al alumno antes de tomar olas. La técnica correcta permite 3-5x más tiempo en el agua.

**Sweet spot es la base:**
Si el alumno no está en sweet spot, la tabla hunde nariz o cola, y cada brazada trabaja contra el agua en lugar de proyectar. Todo empieza por el sweet spot correcto.

**Entrada aerodinámica:**
Manos relajadas, dedos primero. Una mano rígida o "pala" rompe el agua con resistencia. Manos relajadas penetran limpias y maximizan propulsión.

**Codo sobre la oreja:**
La brazada alta permite entrada profunda y proyección larga. Codo bajo = brazada corta, proyección débil. Es la misma mecánica de natación competitiva.

**Proyección horizontal, no vertical:**
El error clásico es "empujar hacia abajo" para levantar la nariz. Eso levanta la tabla pero no la mueve. La proyección debe ser horizontal — la tabla se desplaza como flecha.

**Cabeza quieta:**
Cabeza moviendo de lado a lado rompe la línea recta del cuerpo. Cuerpo-flecha = propulsión directa.

**Marchas de remada:**
- Marcha 1 (caminar): ahorrar energía, desplazarse tranquilo.
- Marcha 2 (trotar): movimiento con intención, ritmo sostenido.
- Marcha 3 (correr): acelerar para cazar espuma u ola.
- Marcha 4 (turbo con patada): solo tablas que lo permiten, momento crítico.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno con Cobra/Stroke básicos (Block 3) + sweet spot identificado (STP-010).

✅ **TERMINA:** alumno paddlea prono con autonomía, alcanzando zona objetivo sin agotarse, usando marcha apropiada al contexto.

❌ **NO incluye:**
- Duck dive (Blue Belt+).
- Turtle roll (STP-024 — paso siguiente).
- Paddle Out en condiciones grandes (Blue Belt+).
- Reading currents/lineups (Yellow Belt+).

**Cross-step dependency:**
- STP-010 Get on Board / Sweet Spot (prerequisito).
- STP-012 Paddle to Catch White Water (versión introductoria de remada).
- STP-024 Turtle Roll (paso inmediato siguiente — se usa durante paddle out).

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-023 en dos sesiones PASS:

1. **Sweet spot:** alumno identifica y mantiene posición correcta.
2. **Entrada aerodinámica:** manos relajadas, dedos primero.
3. **Codo sobre oreja:** brazada alta visible.
4. **Proyección horizontal:** tabla se desplaza, no levanta nariz.
5. **Cuerpo-flecha:** cabeza quieta, línea recta.
6. **Remada alternada:** una brazada cada lado, ritmo sostenido.
7. **Marchas:** usa la marcha apropiada al contexto.
8. **Llega a zona objetivo:** paddleo 30-50m sin colapsar.
9. **Alumno explica:** 5 key words + diferencia entre marchas.

---

## COACHING PRINCIPLE

El paddle out no es "remar fuerte" — es **remar eficiente**. El coach debe priorizar técnica sobre potencia. Un alumno con técnica correcta remando relajado avanza más que un alumno con potencia y mala técnica.

**Demo en agua quieta primero:** coach ejecuta sweet spot + entrada + codo + proyección en agua quieta, mostrando cada elemento. Alumno reproduce. Progresión: agua quieta → whitewater estable → canal real.

**Regla del coach:** si el alumno levanta la nariz de la tabla con cada brazada, está empujando hacia arriba. Corregir proyección horizontal. Si zigzaguea, cabeza se está moviendo — corregir cabeza quieta.

**Diagnóstico clave:**
- Tabla hunde nariz → alumno demasiado adelante del sweet spot.
- Tabla hunde cola → alumno demasiado atrás del sweet spot.
- Brazada corta → codo no pasa sobre oreja.
- Zigzag → cabeza se mueve lado a lado.
- Cansancio rápido → brazos rígidos, tensión general.

**Marcha inteligente:**
Enseñar al alumno a elegir marcha. Muchos alumnos van siempre en "marcha 3" (correr) y se agotan. La marcha 1 (caminar) es la que permite durar en el agua.

---

*TSS® White Belt · STP-023 Paddle Out v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-23 — PADDLE OUT EFFICIENCY DRILL

**Step:** STP-023 Paddle Out
**Belt:** White Belt · Block 6 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## DRILL PURPOSE

Instalar paddle out eficiente aislando los 5 eslabones (sweet spot · entrada · codo · proyección · flecha) y progresando de agua quieta a canal real. Enseña al alumno a remar **eficiente** (no fuerte) y a elegir marcha apropiada al contexto.

---

## WHEN TO USE

- Primer paso de remada autónoma completa.
- Alumno se agota en el canal antes de llegar al lineup.
- Tabla levanta nariz con cada brazada.
- Alumno zigzaguea en lugar de ir recto.
- Alumno siempre en marcha 3 — no sabe ahorrar energía.

---

## SETUP

**Fase 1 — Arena (sweet spot + simulación):**
- Alumno en tabla en arena.
- Coach corrige sweet spot visual.
- Espacio para simular brazadas con codo sobre oreja.

**Fase 2 — Agua quieta (10m):**
- Agua con profundidad suficiente (adentro).
- Zona protegida sin olas.

**Fase 3 — Whitewater estable (20-30m):**
- Whitewater pero con posibilidad de paddle out recto.

**Fase 4 — Canal real (50m+):**
- Canal del spot, con corriente si la hay.

---

## EXECUTION

### Fase 1 — Arena (sweet spot + simulación aislada)

1. **Sweet spot:**
   - Alumno se acuesta en tabla en arena.
   - Coach verifica: pecho al centro, tabla no hunde nariz ni cola.
   - Alumno identifica sensación.

2. **Entrada aerodinámica (simulación):**
   - Alumno simula brazada en arena — dedos primero, mano relajada.
   - Coach muestra vs "pala rígida" (incorrecta).
   - 10 brazadas simuladas.

3. **Codo sobre oreja:**
   - Alumno simula brazada alta — codo pasa sobre línea de la oreja.
   - Compara vs codo bajo (brazada corta).
   - 10 brazadas simuladas.

4. **Cuerpo-flecha:**
   - Alumno simula con cabeza quieta mirando adelante.
   - Coach verifica línea recta.

### Fase 2 — Agua quieta (10m)

1. Alumno se acomoda en sweet spot (identificar visualmente).
2. Ejecuta 10 brazadas alternadas con entrada aerodinámica + codo sobre oreja.
3. Coach observa desde costado: ¿tabla va recta? ¿proyección horizontal? ¿cabeza quieta?
4. Corrección si es necesario. Repetir 10 brazadas más.

### Fase 3 — Whitewater estable (20-30m)

1. Alumno paddlea a través de whitewater estable.
2. Coach evalúa: eficiencia de cada brazada, uso de marchas, línea recta.
3. Pedir cambio de marcha: *"Ahora marcha 1 (relajado)"* · *"Ahora marcha 3 (acelerá)"*.
4. Repetir 3 tandas de 20-30m.

### Fase 4 — Canal real (50m+)

1. Alumno paddlea al lineup eligiendo marcha.
2. Coach observa desde canal: ¿alcanza sin agotarse? ¿ajusta marcha?
3. Post-sesión: *"¿Qué marcha usaste? ¿Te agotaste? ¿Qué fue lo difícil?"*.

---

## COACHING CUES

**Verbal cues durante el rep:**
- *"Sweet spot."*
- *"Enter clean."*
- *"Arm over ear."*
- *"Push forward."*
- *"Body like an arrow."*

**Marchas:**
- *"Marcha 1 — relajado."*
- *"Marcha 2 — ritmo."*
- *"Marcha 3 — turbo."*
- *"Marcha 4 — con patada."*

**Post-rep:**
- *"¿Dónde quedó el sweet spot?"*
- *"¿Entraste con dedos o con pala?"*
- *"¿Codo pasó sobre la oreja?"*
- *"¿Empujaste hacia adelante o hacia arriba?"*
- *"¿Tu cabeza quedó quieta?"*

---

## SUCCESS METRICS

- Sweet spot identificado y mantenido.
- Entrada aerodinámica visible (dedos primero, sin splash grueso).
- Codo pasa sobre oreja en cada brazada.
- Tabla se desplaza horizontal (no levanta nariz).
- Cuerpo-flecha: cabeza quieta, línea recta.
- Ritmo sostenido sin rigidez.
- Alumno usa marcha apropiada al contexto.
- Llega a 50m sin colapsar.

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Tabla hunde nariz | Alumno muy adelante — mover atrás hasta sweet spot |
| Tabla hunde cola | Alumno muy atrás — mover adelante hasta sweet spot |
| Pala rígida | Drill de mano relajada: agua quieta + sentir dedos entrar primero |
| Codo bajo | Drill codo-sobre-oreja: simulación lenta exagerando altura |
| Zigzag | Cabeza quieta — mirar punto fijo adelante |
| Cansancio rápido | Enseñar marcha 1 — "no todo es correr" |
| Empuje vertical | Demo de proyección horizontal · tabla se desliza, no levanta |
| Brazos tensos | Relajación general + ritmo más lento inicialmente |

---

## COACH RULES

- Prioriza técnica sobre potencia — eficiencia primero.
- Sweet spot se verifica primero, antes de cualquier corrección de brazada.
- Progresión obligatoria: arena → agua quieta → whitewater → canal real.
- Enseñar las 4 marchas explícitamente.
- No aceptar paddle out agotado — técnica está mal.

---

## CONNECTION TO OTHER STEPS

- **STP-010 Sweet Spot (prerequisito):** identificación correcta.
- **STP-012 Paddle Catch White Water (introducción):** versión simple de remada.
- **STP-024 Turtle Roll (siguiente):** técnica para pasar whitewater durante paddle out.
- **Blue Belt+:** duck dive, paddle out en condiciones grandes.

---

*TSS® White Belt · DRL-WB-23 Paddle Out Efficiency Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-068 — WRONG SWEET SPOT

El alumno no está acomodado en el **sweet spot** correcto. Está muy adelante (tabla hunde nariz) o muy atrás (tabla hunde cola).

### ERR-WB-069 — STIFF HANDS / POOR ENTRY

El alumno entra al agua con la **mano rígida** (como pala) en lugar de con dedos aerodinámicos y mano relajada. Genera resistencia, splash grueso y pérdida de propulsión.

### ERR-WB-070 — PUSHING UP INSTEAD OF FORWARD

El alumno empuja hacia abajo con la brazada, levantando la **nariz de la tabla** en lugar de proyectarla hacia adelante. La tabla "sube" con cada brazada pero no avanza con eficiencia.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-022']::TEXT[],
  'reading',
  43
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-024',
  'white_belt',
  24,
  $tss$Turtle Roll$tss$,
  NULL,
  $tss$Block 6 · M3 · SAFETY$tss$,
  $tss$# STP-024 — TURTLE ROLL

**Belt:** White Belt · Block 6 · M3 · SAFETY
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno la **técnica obligatoria de seguridad** para pasar espuma u olas estando sobre la tabla, **sin soltarla nunca**. El alumno alinea la nariz contra la dirección de la espuma, rota debajo agarrándose de los rieles, mantiene los codos sobre la tabla para proteger la cara, espera la turbulencia y regresa al centro con una brazada y patada tipo tijera.

Turtle Roll es regla de seguridad en spots con gente y condición no-negociable: **la tabla no se suelta**. Soltarla pone en riesgo a terceros y es causa directa de pérdida de acceso al lineup.

---

## THE 5 KEY WORDS

**ALIGN · RAILS · ELBOWS · HOLD · RECOVER**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **ALIGN** | Nariz alineada contra dirección de espuma | Tabla perpendicular a frente de onda |
| 2 | **RAILS** | Manos firmes en rieles | Agarre seguro, no soltar |
| 3 | **ELBOWS** | Codos sobre la tabla protegiendo la cara | Cara cubierta durante turbulencia |
| 4 | **HOLD** | Espera la turbulencia debajo | Mantener agarre hasta que pase |
| 5 | **RECOVER** | Brazada + patada tijera para volver al centro | Pecho regresa al sweet spot |

---

## ANCHOR PHRASE

> **"Align. Rails. Elbows. Hold. Recover."**

**Micro-cue:** *"Never let go. Always return."*

---

## WHY THIS STEP MATTERS

**Seguridad obligatoria:**
En spots con gente, soltar la tabla es inaceptable — puede golpear a otros surfers. Turtle Roll permite pasar la turbulencia sin perder control de la tabla.

**Alineación es la primera decisión:**
Si el alumno llega a la espuma con la tabla cruzada (no perpendicular), la espuma lo arrastra lateralmente y pierde la tabla. La alineación debe hacerse **antes** de que llegue la espuma.

**Timing — aproximadamente 1 metro antes:**
Rotar demasiado temprano = alumno queda debajo mucho tiempo y pierde aire. Rotar demasiado tarde = la espuma golpea antes de completar la rotación. El punto correcto es aproximadamente 1 metro antes del impacto.

**Rieles agarrados con firmeza:**
Las manos van a los rieles (no al centro, no a la cola). El agarre en rieles permite control durante la turbulencia y facilita la recuperación post-impacto.

**Codos sobre la tabla protegen la cara:**
Durante la turbulencia, la tabla puede golpear al alumno. Codos apoyados sobre la tabla crean una "jaula" que protege la cara del impacto.

**Hold — paciencia bajo el agua:**
El alumno debe esperar. No intentar salir durante la turbulencia. Mantener agarre, cara protegida, y esperar 1-2 segundos hasta que la onda pase.

**Recover con tijera:**
Una brazada firme + patada tipo tijera regresa el cuerpo al centro de la tabla. Inmediatamente reanudar paddle out.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno en paddle out (STP-023) y detecta espuma u ola que va a impactarlo.

✅ **TERMINA:** alumno pasó la espuma sin soltar la tabla, regresó al centro, reanuda paddle out.

❌ **NO incluye:**
- Duck dive (Blue Belt+).
- Turtle roll en condiciones grandes (Yellow Belt+).
- Leash-only release (antes de aprender turtle).

**Cross-step dependency:**
- STP-023 Paddle Out (contexto donde se usa).
- STP-010 Sweet Spot (donde se regresa en recovery).
- Safety Rules (STP-000): "la tabla no se suelta en spots con gente".

**Relación Block 0 (Safety):**
Turtle Roll forma parte del Safety Pillar del White Belt junto con Starfish Dismount (STP-020). Ambos son obligatorios.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-024 en dos sesiones PASS:

1. **Alineación correcta:** alumno gira tabla perpendicular a espuma antes de impacto.
2. **Timing aproximado 1m:** no demasiado temprano ni demasiado tarde.
3. **Rieles agarrados:** ambas manos firmes en rieles durante toda la rotación.
4. **Codos sobre tabla:** cara protegida durante turbulencia.
5. **No suelta la tabla:** regla inviolable respetada en todos los intentos.
6. **Hold adecuado:** espera la turbulencia sin desesperarse.
7. **Recovery limpio:** brazada + tijera regresa al centro.
8. **Reanuda paddle out:** retoma movimiento sin pausa excesiva.
9. **Alumno explica:** regla de seguridad + 5 key words + timing.

---

## COACHING PRINCIPLE

Turtle Roll es **no-negociable** desde la primera sesión en condiciones con espuma. No es técnica opcional — es requisito de seguridad en cualquier spot compartido. El coach debe enseñar desde la primera ocasión en que el alumno vea espuma durante paddle out.

**Demo en agua quieta primero:** coach ejecuta rotación completa en agua quieta (sin espuma) para que el alumno aprenda la mecánica sin presión de timing. Luego progresión a espuma pequeña, luego espuma estándar.

**Regla del coach:** si el alumno suelta la tabla, parar. Regresar a la regla: "la tabla no se suelta". Re-explicar consecuencias (riesgo para otros, pérdida de acceso al lineup).

**Diagnóstico clave:**
- Tabla cruzada por espuma → alineación mal o demasiado tarde.
- Cara golpeada → codos no estaban sobre tabla.
- Sale disparado hacia atrás → rotó demasiado tarde.
- Sale sin aire/pánico → rotó demasiado temprano, hold excesivo.
- Recovery lento → brazada débil o tijera incorrecta.

**Regla de oro:**
*"Better to eat one wave held on to the board than to lose the board in crowded lineup."*

---

*TSS® White Belt · STP-024 Turtle Roll v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-24 — TURTLE ROLL SAFETY DRILL

**Step:** STP-024 Turtle Roll
**Belt:** White Belt · Block 6 · M3 · SAFETY
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## DRILL PURPOSE

Instalar Turtle Roll como **reflejo de seguridad** en paddle out. Enseña las 5 fases (align · rails · elbows · hold · recover) en progresión agua quieta → espuma pequeña → espuma estándar, y la regla no-negociable "la tabla no se suelta". Cumple función dual: protege al alumno y protege a terceros en spots compartidos.

---

## WHEN TO USE

- Primera aparición de espuma en paddle out (STP-023).
- Alumno suelta la tabla por reflejo — regla de seguridad no instalada.
- Alumno recibe golpes de tabla en la cara (codos mal puestos).
- Alumno sale disparado hacia atrás (timing tarde).

---

## SETUP

**Fase 1 — Arena (secuencia mental):**
- Alumno de pie con tabla apoyada.
- Coach explica las 5 fases con demo.

**Fase 2 — Agua quieta (rotación completa):**
- Agua con profundidad adecuada.
- Sin espuma — aislar la mecánica.

**Fase 3 — Espuma pequeña (timing + alineación):**
- Whitewater de principiante con olas de menos de medio metro.

**Fase 4 — Espuma estándar (real del spot):**
- Condiciones reales del paddle out.

---

## EXECUTION

### Fase 1 — Arena (secuencia mental)

1. **Coach demuestra con tabla apoyada:**
   - ALIGN: tabla perpendicular.
   - RAILS: manos a rieles.
   - ELBOWS: codos arriba, protegiendo cara.
   - HOLD: rotación simulada, mantiene agarre.
   - RECOVER: brazada + tijera.

2. **Alumno verbaliza las 5 fases en orden, con gestos:**
   - Repite 3 veces en secuencia.
   - Coach corrige si salta algún paso.

3. **Regla de seguridad:**
   - Coach enfatiza: *"La tabla NO se suelta. Nunca."*
   - Alumno verbaliza regla en voz alta.

### Fase 2 — Agua quieta (mecánica aislada)

1. Alumno en tabla en agua quieta.
2. Ejecuta rotación completa en agua sin presión de timing.
3. Coach verifica: rieles agarrados · codos sobre tabla · rotación completa · recovery al centro.
4. 5 rotaciones.

### Fase 3 — Espuma pequeña (timing + alineación)

1. Alumno paddlea hacia espuma pequeña.
2. Coach señala cuándo rotar desde el canal: *"¡AHORA!"* (1m antes).
3. Alumno ejecuta turtle roll completo.
4. 3-5 intentos. Post-rep: *"¿Aliniaste? ¿Rieles firmes? ¿Soltaste?"*

### Fase 4 — Espuma estándar (autonomía)

1. Alumno paddlea en canal real con espumas.
2. Decide momento de rotar autónomamente.
3. Coach observa — interviene solo si suelta la tabla o alinea mal crónicamente.
4. 5-8 turtle rolls. Target: 0 sueltas + alineación autónoma correcta.

---

## COACHING CUES

**Verbal cues:**
- *"Align."*
- *"Rails."*
- *"Elbows up."*
- *"Hold."*
- *"Recover."*

**Emergencia:**
- *"¡NO sueltes la tabla!"*

**Post-rep:**
- *"¿Rotaste a tiempo?"*
- *"¿Rieles firmes?"*
- *"¿Codos sobre tabla?"*
- *"¿Soltaste?"*
- *"¿Recuperaste al centro?"*

---

## SUCCESS METRICS

- Alineación correcta (perpendicular a espuma).
- Timing aproximado 1m antes del impacto.
- Rieles agarrados durante toda la rotación.
- Codos sobre tabla protegiendo cara.
- Tabla NO se suelta (regla inviolable).
- Hold adecuado durante turbulencia.
- Recovery limpio al centro.
- Reanuda paddle out sin pausa excesiva.
- Alumno explica regla de seguridad y 5 fases.

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Alumno suelta la tabla | Parar · re-explicar regla · regresar a agua quieta |
| Alineación crónica mal | Drill específico de rotación temprana de tabla |
| Timing tarde (ola golpea antes) | Coach señala desde canal · practicar detección visual |
| Timing temprano (pierde aire) | Coach enseña esperar hasta 1m |
| Codos no suben | Drill estático en agua quieta con codos forzados arriba |
| Recovery lento | Enseñar brazada firme + patada tijera explícita |
| Miedo a la espuma | Empezar con espuma muy pequeña · progresión gradual |

---

## COACH RULES

- Enseñar desde la PRIMERA aparición de espuma — no esperar incidente.
- Regla "no suelto la tabla" no-negociable — se refuerza cada sesión.
- Progresión obligatoria: arena → agua quieta → espuma pequeña → espuma estándar.
- No aceptar turtle roll con tabla soltada — pausar y corregir.
- Enseñar diagnóstico: "si rotaste tarde, era hace un segundo".

---

## CONNECTION TO OTHER STEPS

- **STP-023 Paddle Out (contexto):** turtle roll se usa durante paddle out.
- **STP-010 Sweet Spot (recovery):** el centro al que se regresa.
- **STP-020 Starfish Dismount (safety pair):** ambos son safety obligatorios White Belt.
- **Blue Belt+:** duck dive reemplaza turtle roll en tablas que lo permiten.

---

## SAFETY NON-NEGOTIABLE

**"La tabla no se suelta en spots con gente. NUNCA."**

Esta regla se refuerza en cada sesión. Soltar la tabla = (a) riesgo para terceros, (b) pérdida de acceso al lineup, (c) tabla puede perderse o dañarse. Turtle Roll existe exactamente para evitar estos tres problemas.

---

*TSS® White Belt · DRL-WB-24 Turtle Roll Safety Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-071 — POOR ALIGNMENT (TURTLE ROLL)

El alumno ejecuta turtle roll con la **tabla mal alineada** respecto a la dirección de la espuma. La tabla no queda perpendicular al frente de onda, lo que hace que la espuma arrastre lateralmente al alumno, le quita la tabla, o compromete la rotación.

### ERR-WB-072 — LETTING GO OF BOARD

El alumno **suelta la tabla** al llegar la espuma, sea por reflejo de miedo, por no tener instalado Turtle Roll, o por cansancio. Violación directa de la regla no-negociable de seguridad.

### ERR-WB-073 — NO ELBOW PROTECTION

El alumno ejecuta turtle roll pero **los codos no suben sobre la tabla** — no crean la "jaula" protectora de la cara. Durante la turbulencia, la tabla puede golpear la nariz, frente, o boca del alumno.
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-023']::TEXT[],
  'reading',
  44
);

INSERT INTO lessons (id, course_section, step_number, title, subtitle, pillar, description_md, drill_md, errors_md, video_url, cover_image_url, estimated_minutes, prerequisites, lesson_type, display_order) VALUES (
  'STP-025',
  'white_belt',
  25,
  $tss$Turn Left/Right Lying on Board$tss$,
  NULL,
  $tss$Block 6 · M3$tss$,
  $tss$# STP-025 — TURN LEFT AND RIGHT LYING ON BOARD

**Belt:** White Belt · Block 6 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## STEP PURPOSE

Enseñar al alumno a **dirigir la tabla estando prono** usando remada de un lado, brazada de un brazo, movimiento circular de la mano, o (cuando está más adentro esperando olas) el **pivote sentado**: caderas hacia la cola para que la tabla pivote con más facilidad, asistido con manos y pies. El objetivo final es redirigir la tabla con intención y quedar listo para seguir remando.

**Nota doctrinal:** STP-026 "Turn Left or Right" está **retirado y absorbido** en este step. El canon consolida el control direccional prono en un solo step.

---

## THE 5 KEY WORDS

**TURN · ONE · BACK · PIVOT · READY**

| # | Key Word | Meaning | Observable |
|---|---|---|---|
| 1 | **TURN** | Intención direccional clara | Alumno decide dirección antes de mover |
| 2 | **ONE** | Remada/brazada de un solo lado | Un lado activo, el otro pasivo |
| 3 | **BACK** | Caderas hacia la cola (pivote sentado) | Cuando aplica: peso atrás facilita pivote |
| 4 | **PIVOT** | Tabla rota sobre eje | Cola se hunde ligera, nariz gira |
| 5 | **READY** | Queda listo para paddlear | Post-pivote: pecho al centro, brazos listos |

---

## ANCHOR PHRASE

> **"Turn it. One side. Move back. Pivot. Ready to paddle."**

**Micro-cue:** *"Direct the board. Stay ready."*

---

## WHY THIS STEP MATTERS

**Control direccional prono:**
Hasta aquí el alumno rema recto (STP-023). Pero en el lineup, en el canal, para alinear con espuma (STP-024), o para posicionarse para una ola, necesita **redirigir la tabla** sin tener que pararse y sentarse en modo "sentado completo".

**Tres modos de turn prono:**

1. **Remada de un lado (prono):**
   - Brazadas fuertes de un solo brazo.
   - Mientras el otro brazo queda quieto.
   - La tabla gira hacia el lado contrario del brazo activo.

2. **Movimiento circular de la mano:**
   - Una mano hace movimiento circular en el agua.
   - Más sutil que remada de un lado.
   - Útil para ajustes pequeños de dirección.

3. **Pivote sentado (cuando está más adentro esperando):**
   - Alumno se sienta en tabla.
   - Caderas hacia la cola — la cola se hunde.
   - La nariz gira libre.
   - Manos y pies asisten el giro.
   - Técnica rápida para orientar la tabla cuando viene una ola.

**Readiness es clave:**
El turn no es el fin — es preparación. Post-turn, el alumno debe quedar listo para (a) seguir paddleando, (b) cazar una ola que venga, (c) ejecutar turtle roll si necesita. Un turn que termina desarmado no sirve.

**Pivote sentado — hips back:**
El error más frecuente en pivote sentado es no mover las caderas hacia atrás lo suficiente. Sin peso atrás, la cola no se hunde, la tabla no pivota — el alumno trata de girar con fuerza y se agota sin efecto.

---

## BOUNDARY BOX

✅ **EMPIEZA:** alumno en paddle out (STP-023) prono y necesita redirigir la tabla.

✅ **TERMINA:** tabla queda orientada en dirección deseada + alumno listo para seguir paddleando o cazar ola.

❌ **NO incluye:**
- Turns de pie (STP-021/022 — diferente dominio).
- Posicionamiento en lineups complejos (Yellow Belt+).
- Pivote sentado completo en condiciones grandes (Blue Belt+).
- Lectura de corrientes/sets (Yellow Belt+).

**Cross-step dependency:**
- STP-023 Paddle Out (contexto principal).
- STP-010 Sweet Spot (base postural).
- STP-024 Turtle Roll (técnica adyacente — a veces precede turtle).
- **STP-026 ABSORBED:** Turn Left or Right consolidado aquí.

---

## SUCCESS CRITERIA (CERTIFICACIÓN)

Para certificar STP-025 en dos sesiones PASS:

1. **Intención direccional:** alumno decide antes de mover.
2. **Remada de un lado:** ejecuta brazadas fuertes de un brazo con otro pasivo.
3. **Movimiento circular:** ejecuta ajuste sutil de dirección con mano circular.
4. **Pivote sentado:** cuando aplica — caderas hacia cola, tabla pivota.
5. **Readiness post-turn:** alumno queda listo para paddlear o cazar ola.
6. **Transición fluida:** puede pasar de prono → sentado → prono sin caerse.
7. **Uso contextual:** elige técnica apropiada según situación.
8. **Alumno explica:** 3 modos + cuándo usar cada uno.

---

## COACHING PRINCIPLE

Turn prono no es "girar la tabla" — es **redirigirla con mínima energía y máxima prontitud**. El coach debe enseñar las tres técnicas (remada un lado, circular, pivote sentado) y que el alumno aprenda a elegir cuál usar según contexto.

**Demo en agua quieta primero:** cada técnica aislada. Alumno practica sin presión.

**Regla del coach:** si el alumno siempre usa el mismo método, ampliar repertorio. Si pivote sentado no funciona, verificar que las caderas vayan atrás lo suficiente. Si remada de un lado es débil, verificar técnica básica de remada (STP-023).

**Diagnóstico clave:**
- Tabla no gira (un lado) → brazadas débiles o peso mal distribuido.
- Pivote sentado sin efecto → caderas no fueron atrás — cola no se hunde.
- Turn pero alumno queda desarmado → no hay readiness post-turn.
- Turn demasiado lento para ola que viene → elegir técnica más rápida (pivote sentado).

**Selección contextual:**
- Ajuste pequeño en canal: movimiento circular.
- Giro medio en paddle out: remada de un lado.
- Orientación rápida para ola: pivote sentado.

---

*TSS® White Belt · STP-025 Turn Left and Right Lying on Board v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$# DRL-WB-25 — PRONE DIRECTION DRILL

**Step:** STP-025 Turn Left and Right Lying on Board
**Belt:** White Belt · Block 6 · M3
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## DRILL PURPOSE

Instalar los **tres modos de redirección prono** (remada de un lado, movimiento circular, pivote sentado) y enseñar al alumno a elegir la técnica apropiada al contexto. Progresión agua quieta → canal real con readiness post-turn verificado en cada rep.

---

## WHEN TO USE

- Alumno rema recto pero no sabe cómo ajustar dirección.
- Tiene que redirigir tabla en canal o lineup.
- Necesita orientarse para cazar ola.
- Siempre usa el mismo método (repertorio limitado).

---

## SETUP

**Fase 1 — Agua quieta (aislar técnicas):**
- Agua con profundidad adecuada.
- Sin olas — aislar cada modo.

**Fase 2 — Whitewater estable:**
- Practicar cambios de dirección durante paddle.

**Fase 3 — Canal real:**
- Uso contextual: ajuste en canal, pivote para cazar ola.

---

## EXECUTION

### Fase 1 — Agua quieta (tres modos aislados)

**Modo A: Remada de un lado (prono)**
1. Alumno en posición prona en sweet spot.
2. Ejecuta 5 brazadas consecutivas con brazo derecho solamente. Brazo izquierdo pasivo.
3. Tabla gira hacia la izquierda.
4. Repetir en sentido opuesto: 5 brazadas izquierdas, tabla gira a la derecha.
5. Coach verifica: brazadas firmes, un lado activo, otro pasivo.

**Modo B: Movimiento circular de mano**
1. Alumno en posición prona.
2. Mano derecha hace movimiento circular en el agua (como revolver).
3. Tabla ajusta dirección sutilmente hacia la izquierda.
4. Repetir con mano izquierda — ajuste a la derecha.
5. Coach observa: movimiento fluido, no fuerza, ajuste sutil.

**Modo C: Pivote sentado**
1. Alumno se sienta en tabla (transición prono → sentado).
2. Caderas hacia cola — la cola debe hundirse ligeramente.
3. Manos y pies asisten giro (manos remando un lado, pies moviendo lado opuesto).
4. Tabla pivota sobre la cola.
5. Alumno regresa a prono cuando dirección correcta.
6. Coach verifica: caderas claramente atrás, pivote rápido.

### Fase 2 — Whitewater estable

1. Alumno paddlea en whitewater ejecutando cambios de dirección.
2. Coach pide modo específico: *"Ahora un lado"* · *"Ahora circular"* · *"Ahora sentado"*.
3. Verificar readiness post-turn.

### Fase 3 — Canal real (uso contextual)

1. Alumno paddlea en canal, tomando decisiones sobre modo.
2. Coach post-sesión: *"¿Qué modo usaste? ¿Por qué?"*.
3. Verificar: elección apropiada + readiness post-turn.

---

## COACHING CUES

**Verbal cues:**
- *"Turn it."*
- *"One side."*
- *"Circular."*
- *"Move back."* (para pivote sentado)
- *"Pivot."*
- *"Ready to paddle."*

**Post-rep:**
- *"¿Qué modo usaste?"*
- *"¿Elegiste bien según el contexto?"*
- *"¿Quedaste listo para seguir?"*
- *"¿Caderas fueron atrás?"* (si usó pivote sentado)

---

## SUCCESS METRICS

- Ejecuta los 3 modos aislados.
- Brazada de un lado: giro claro.
- Circular: ajuste sutil pero efectivo.
- Pivote sentado: caderas claramente atrás, giro rápido.
- Readiness post-turn: alumno queda listo para paddlear.
- Elección contextual apropiada (modo correcto según situación).
- Transición fluida prono → sentado → prono.
- Alumno explica los 3 modos con sus palabras.

---

## ADAPTATIONS

| Caso | Ajuste |
|---|---|
| Tabla no gira con un lado | Brazadas más firmes + verificar sweet spot |
| Pivote sentado sin efecto | Caderas no fueron atrás — exagerar movimiento atrás |
| Desbalance al sentarse | Transición prono-sentado lenta · práctica estática en agua quieta |
| Circular no funciona | Aumentar amplitud del movimiento · más lento, no más rápido |
| Siempre usa mismo modo | Coach pide modo específico · ampliar repertorio |
| Post-turn desarmado | Enfatizar readiness: "termino en postura lista" |
| Pivote lento | Combinar pivote con manos + pies asistiendo |

---

## COACH RULES

- Enseñar los 3 modos — no dejar al alumno con un solo método.
- Enfatizar readiness post-turn en cada rep.
- Progresión: agua quieta → whitewater → canal real.
- Pivote sentado requiere transición practicada — no improvisar.
- Uso contextual: ayudar al alumno a elegir modo según situación.

---

## CONNECTION TO OTHER STEPS

- **STP-023 Paddle Out (contexto principal):** redirección durante paddle.
- **STP-024 Turtle Roll (adyacente):** a veces precede turtle.
- **STP-010 Sweet Spot (base):** postura correcta para todos los modos.
- **STP-026 ABSORBED:** consolidación direccional.
- **Yellow Belt+:** posicionamiento en lineups complejos.

---

*TSS® White Belt · DRL-WB-25 Prone Direction Drill v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$,
  $tss$### ERR-WB-074 — TURNING TOO FAR FORWARD

En el modo **pivote sentado**, el alumno queda con las caderas demasiado adelantadas respecto a la cola de la tabla. La cola no se hunde — el peso está distribuido en el centro o hacia adelante.

### ERR-WB-075 — WEAK DIRECTIONAL PADDLING

En modo **remada de un lado** (prono), las brazadas del brazo activo son **débiles o poco firmes**. La tabla no rota con efectividad.

### ERR-WB-076 — POOR SEATED PIVOT

El alumno ejecuta el **pivote sentado** con caderas atrás pero **sin asistencia activa de manos y pies**. Queda solo esperando que la tabla pivote "por sí sola".
$tss$,
  NULL,  -- video_url
  NULL,  -- cover_image_url
  25,
  ARRAY['STP-024']::TEXT[],
  'reading',
  45
);


-- ============================================
-- QUIZZES (3 simple questions per reading lesson)
-- ============================================

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-001',
  'What is the FIRST priority before entering the water?',
  '[{"text": "Catching as many waves as possible", "correct": false}, {"text": "Doing your venue analysis and confirming safety", "correct": true}, {"text": "Showing your skills to other surfers", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-001',
  'Which of these is a basic safety rule for every session?',
  '[{"text": "Always paddle into the impact zone", "correct": false}, {"text": "Know your level and respect the conditions", "correct": true}, {"text": "Never communicate with other surfers", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-001',
  'What should you do if conditions are too big for your level?',
  '[{"text": "Surf anyway to challenge yourself", "correct": false}, {"text": "Stay out of the water \u2014 no-go decision is valid", "correct": true}, {"text": "Borrow a bigger board", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-003',
  'What is the foundation of TSS learning?',
  '[{"text": "Memorizing every drill perfectly", "correct": false}, {"text": "Building habits and self-awareness through structured practice", "correct": true}, {"text": "Surfing the biggest waves possible", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-003',
  'How does TSS structure progress?',
  '[{"text": "Random improvement based on luck", "correct": false}, {"text": "Through belt levels with clear criteria", "correct": true}, {"text": "Only by competition results", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-003',
  'What should the student do between sessions?',
  '[{"text": "Forget about surfing", "correct": false}, {"text": "Reflect on what was learned and prepare for next session", "correct": true}, {"text": "Only watch surf videos", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-005',
  'What is surfing in the TSS framework?',
  '[{"text": "Just standing on a board", "correct": false}, {"text": "A holistic practice of ocean reading, technique, and awareness", "correct": true}, {"text": "A purely physical activity", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-005',
  'Why does TSS treat surfing as more than a sport?',
  '[{"text": "To make it complicated", "correct": false}, {"text": "Because it integrates safety, technique, mindset, and connection with the ocean", "correct": true}, {"text": "To charge more money", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-005',
  'What separates a TSS surfer from a casual one?',
  '[{"text": "Wearing better gear", "correct": false}, {"text": "A structured progression and conscious practice", "correct": true}, {"text": "Surfing the most waves", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-006',
  'Where does modern surfing originate from?',
  '[{"text": "Australia in the 1900s", "correct": false}, {"text": "Polynesia, especially Hawaii", "correct": true}, {"text": "California in the 1950s", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-006',
  'Why is knowing surf history important?',
  '[{"text": "It is required for legal reasons", "correct": false}, {"text": "It connects you to the cultural roots of the sport", "correct": true}, {"text": "It improves your pop-up", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-006',
  'What value does TSS draw from surf heritage?',
  '[{"text": "Aggression", "correct": false}, {"text": "Respect for the ocean and the lineage", "correct": true}, {"text": "Competition only", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-007',
  'How many pillars does the TSS framework have?',
  '[{"text": "Two", "correct": false}, {"text": "Four", "correct": true}, {"text": "Six", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-007',
  'Which is NOT one of the four TSS pillars?',
  '[{"text": "Technical", "correct": false}, {"text": "Mental", "correct": false}, {"text": "Marketing", "correct": true}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-007',
  'What is the purpose of the four pillars?',
  '[{"text": "To make training complicated", "correct": false}, {"text": "To create a balanced and complete surfer", "correct": true}, {"text": "To sell more lessons", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-008',
  'Why does board volume matter at White Belt?',
  '[{"text": "It looks cool", "correct": false}, {"text": "More volume = more stability and easier wave-catching", "correct": true}, {"text": "It does not matter at White Belt", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-008',
  'What is essential equipment for safety?',
  '[{"text": "A leash and an appropriate board", "correct": true}, {"text": "Just a swimsuit", "correct": false}, {"text": "A waterproof phone", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-008',
  'What should a White Belt avoid using?',
  '[{"text": "A soft-top beginner board", "correct": false}, {"text": "Performance shortboards too early", "correct": true}, {"text": "A leash", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-009',
  'What are the 8 keywords of Venue Analysis?',
  '[{"text": "They start with MAP and end with SESSION PLAN", "correct": true}, {"text": "Wave, Wind, Tide, Beach, Sand, Sun, Reef, Crowd", "correct": false}, {"text": "There are no specific keywords", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-009',
  'Why is Venue Analysis done BEFORE entering the water?',
  '[{"text": "To impress your coach", "correct": false}, {"text": "Because all decisions in the water depend on it", "correct": true}, {"text": "It is optional", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-009',
  'What is the SAFE ZONE?',
  '[{"text": "Where waves break with full energy", "correct": false}, {"text": "Where whitewater reforms softly and is appropriate for your level", "correct": true}, {"text": "The parking lot", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-010',
  'What should you do if caught in a rip current?',
  '[{"text": "Paddle directly against it", "correct": false}, {"text": "Paddle parallel to the shore until out of the current", "correct": true}, {"text": "Panic and yell for help", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-010',
  'How can you visually identify a rip current?',
  '[{"text": "A line of foam moving outward, or a flat-looking lane", "correct": true}, {"text": "Bright red water", "correct": false}, {"text": "Loud bubbling sounds", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-010',
  'Why are rip currents dangerous for beginners?',
  '[{"text": "They are not dangerous at all", "correct": false}, {"text": "They can pull you out fast and exhaust you if you fight them wrong", "correct": true}, {"text": "They make the water cold", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-011',
  'Who has the right of way on a wave?',
  '[{"text": "The closest surfer to the peak", "correct": true}, {"text": "The fastest paddler", "correct": false}, {"text": "Whoever is loudest", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-011',
  'What is "snaking"?',
  '[{"text": "A type of turn", "correct": false}, {"text": "Paddling around someone to steal their wave", "correct": true}, {"text": "A safety technique", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-011',
  'Why does etiquette matter?',
  '[{"text": "To avoid collisions and respect the lineup", "correct": true}, {"text": "To impress beginners", "correct": false}, {"text": "It is just tradition", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-012',
  'What is the One Wave Framework?',
  '[{"text": "A method to surf only one wave per session", "correct": false}, {"text": "A structured approach to break down each wave into phases", "correct": true}, {"text": "A rule that limits beginners to one wave", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-012',
  'Why focus on ONE wave at a time?',
  '[{"text": "Because waves are expensive", "correct": false}, {"text": "Quality of execution matters more than quantity", "correct": true}, {"text": "You only get one chance", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-012',
  'How does this framework help progress?',
  '[{"text": "It makes surfing slower", "correct": false}, {"text": "It builds attention, awareness, and intentional execution", "correct": true}, {"text": "It does not help", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-013',
  'What does the Blue Block represent?',
  '[{"text": "A swimming pool", "correct": false}, {"text": "The transition into deeper waves and tactical reading", "correct": true}, {"text": "A type of surfboard", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-013',
  'When does a student approach the Blue Block?',
  '[{"text": "After mastering White Belt fundamentals", "correct": true}, {"text": "On their first session", "correct": false}, {"text": "Never", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-013',
  'What changes at Blue Belt?',
  '[{"text": "The student starts learning advanced wave reading and positioning", "correct": true}, {"text": "The student stops using a leash", "correct": false}, {"text": "The lessons become free", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-014',
  'What are the 3 Circles of Power?',
  '[{"text": "Three concentric levels of control: self, ocean, performance", "correct": true}, {"text": "Three brand logos", "correct": false}, {"text": "Three types of waves", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-014',
  'Why are they called "Circles"?',
  '[{"text": "They represent layered, interconnected zones of mastery", "correct": true}, {"text": "They are drawn on the sand", "correct": false}, {"text": "It is just a poetic name", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'PC-014',
  'What is the innermost circle?',
  '[{"text": "The ocean", "correct": false}, {"text": "The self \u2014 your awareness, body, and mindset", "correct": true}, {"text": "Your audience", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-001',
  'What does Consciencia mean in TSS?',
  '[{"text": "Being conscious and present in every decision", "correct": true}, {"text": "Studying philosophy", "correct": false}, {"text": "Following rules blindly", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-001',
  'Why is consciousness important for a surfer?',
  '[{"text": "Because every wave is unique and demands awareness", "correct": true}, {"text": "To impress others", "correct": false}, {"text": "It is not important", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-002',
  'What does Humility mean for the White Belt student?',
  '[{"text": "Knowing you do not know the ocean \u2014 listen first", "correct": true}, {"text": "Being shy", "correct": false}, {"text": "Avoiding the water", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-002',
  'How does a humble surfer behave?',
  '[{"text": "They show off their skills constantly", "correct": false}, {"text": "They observe before acting and respect their level", "correct": true}, {"text": "They argue with their coach", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-003',
  'What does Process (Resilience) mean at Yellow Belt?',
  '[{"text": "Trusting the journey and bouncing back from failure", "correct": true}, {"text": "Skipping ahead to advanced skills", "correct": false}, {"text": "Quitting when it gets hard", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-003',
  'Why is resilience essential in surfing?',
  '[{"text": "You will fall many times before progressing", "correct": true}, {"text": "Because the ocean is unfair", "correct": false}, {"text": "It is not essential", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-004',
  'What does Compromiso (Commitment) mean at Blue Belt?',
  '[{"text": "Showing up consistently and giving full effort to your practice", "correct": true}, {"text": "Signing a contract", "correct": false}, {"text": "Surfing only on weekends", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-004',
  'How is commitment shown in TSS?',
  '[{"text": "Through consistent practice and respect for the framework", "correct": true}, {"text": "By buying expensive gear", "correct": false}, {"text": "By winning competitions", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-005',
  'What does Responsibility mean at Purple Belt?',
  '[{"text": "Owning your decisions, your safety, and your influence on others", "correct": true}, {"text": "Teaching beginners only", "correct": false}, {"text": "Surfing alone", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-005',
  'Why does responsibility grow as you progress?',
  '[{"text": "Because more skill means more impact on yourself and others", "correct": true}, {"text": "Because the rules change", "correct": false}, {"text": "It does not grow", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-006',
  'What does Gratitude mean at Brown Belt?',
  '[{"text": "Recognizing the ocean, your coaches, and your journey", "correct": true}, {"text": "Saying thank you to brands", "correct": false}, {"text": "Being humble only", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-006',
  'Why is gratitude part of mastery?',
  '[{"text": "Because mastery without gratitude becomes ego", "correct": true}, {"text": "To get free lessons", "correct": false}, {"text": "It is not part of mastery", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-007',
  'What does Impact mean at Black Belt?',
  '[{"text": "Using your mastery to elevate others and the surf community", "correct": true}, {"text": "Hitting the wave hard", "correct": false}, {"text": "Impacting the rocks", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'VAL-007',
  'What is the responsibility of a Black Belt?',
  '[{"text": "To teach, mentor, and represent TSS", "correct": true}, {"text": "To compete only", "correct": false}, {"text": "To stop surfing", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-001',
  'What are the 8 keywords of Venue Analysis in order?',
  '[{"text": "MAP, REFERENCE, SAFE ZONE, IMPACT ZONE, HAZARDS, IN/OUT, GO-NOGO, SESSION PLAN", "correct": true}, {"text": "Wave, Wind, Tide, Currents, Crowd, Reef, Sand, Sun", "correct": false}, {"text": "There is no specific order", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-001',
  'Where does a White Belt student work in the lineup?',
  '[{"text": "In the SAFE ZONE \u2014 where whitewater reforms softly", "correct": true}, {"text": "In the IMPACT ZONE", "correct": false}, {"text": "Wherever they want", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-001',
  'What does GO-NOGO require?',
  '[{"text": "A binary decision justified by what was actually observed", "correct": true}, {"text": "A vote among friends", "correct": false}, {"text": "Just intuition", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-002',
  'Why is warm-up important before surfing?',
  '[{"text": "To prepare the body, prevent injury, and activate proper movement patterns", "correct": true}, {"text": "To impress others on the beach", "correct": false}, {"text": "It is optional", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-002',
  'What systems does TSS warm-up activate?',
  '[{"text": "Mobility, activation, and circulation systems", "correct": true}, {"text": "Only the legs", "correct": false}, {"text": "Only the arms", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-003',
  'What is the main purpose of Grab Board?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-003',
  'How is Grab Board validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-003',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-004',
  'What is the main purpose of Walk Out?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-004',
  'How is Walk Out validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-004',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-005',
  'What is the main purpose of Put Board in the Water?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-005',
  'How is Put Board in the Water validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-005',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-006',
  'What is the main purpose of Control Your Board?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-006',
  'How is Control Your Board validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-006',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-007',
  'What is the main purpose of Go Through Whitewater Standing?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-007',
  'How is Go Through Whitewater Standing validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-007',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-008',
  'What is the main purpose of Turn Around Safely?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-008',
  'How is Turn Around Safely validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-008',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-009',
  'What is the main purpose of Walk Back to the Sand?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-009',
  'How is Walk Back to the Sand validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-009',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-010',
  'What is the main purpose of Get on Your Board / Find Sweet Spot?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-010',
  'How is Get on Your Board / Find Sweet Spot validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-010',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-011',
  'What is the main purpose of Get Aligned with the White Water?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-011',
  'How is Get Aligned with the White Water validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-011',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-012',
  'What is the main purpose of Paddle to Catch White Water?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-012',
  'How is Paddle to Catch White Water validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-012',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-013',
  'What is the main purpose of Cobra Turn Left and Right?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-013',
  'How is Cobra Turn Left and Right validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-013',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-014',
  'What is the main purpose of Prone Dismount?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-014',
  'How is Prone Dismount validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-014',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-016',
  'What is the correct execution of a Pop-Up?',
  '[{"text": "A single fluid motion bringing both feet under the body", "correct": true}, {"text": "Standing up one foot at a time slowly", "correct": false}, {"text": "Jumping straight up off the board", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-016',
  'Where should the feet land in the pop-up?',
  '[{"text": "Centered on the board with stance width matching shoulders", "correct": true}, {"text": "Anywhere you can manage", "correct": false}, {"text": "Both feet on the tail", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-017',
  'What is the main purpose of Feet Position Center 2?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-017',
  'How is Feet Position Center 2 validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-017',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-018',
  'What is the main purpose of Power Stance?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-018',
  'How is Power Stance validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-018',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-019',
  'What is the main purpose of Impulso?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-019',
  'How is Impulso validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-019',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-020',
  'What is the main purpose of Starfish Dismount?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-020',
  'How is Starfish Dismount validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-020',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-021',
  'What is the main purpose of Turn Backside?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-021',
  'How is Turn Backside validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-021',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-022',
  'What is the main purpose of Turn Frontside?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-022',
  'How is Turn Frontside validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-022',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-023',
  'What is the main purpose of Paddle Out?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-023',
  'How is Paddle Out validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-023',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-024',
  'What is the main purpose of Turtle Roll?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-024',
  'How is Turtle Roll validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-024',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-025',
  'What is the main purpose of Turn Left/Right Lying on Board?',
  '[{"text": "A specific TSS skill with structured criteria for execution", "correct": true}, {"text": "A casual technique without structure", "correct": false}, {"text": "Something only Black Belts learn", "correct": false}]'::jsonb,
  1
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-025',
  'How is Turn Left/Right Lying on Board validated as passed?',
  '[{"text": "When the student demonstrates the success criteria across separate sessions", "correct": true}, {"text": "When the coach feels like it", "correct": false}, {"text": "When the student says they got it", "correct": false}]'::jsonb,
  2
);

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES (
  'STP-025',
  'Why does TSS structure each step with explicit criteria?',
  '[{"text": "To ensure objective progression and safety", "correct": true}, {"text": "Because tradition demands it", "correct": false}, {"text": "To make it harder", "correct": false}]'::jsonb,
  3
);

-- Total quizzes inserted: 120

COMMIT;
