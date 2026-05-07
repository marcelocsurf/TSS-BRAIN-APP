-- 00016 — Masterclass Content: Fix encoding + Translate to English
-- Updates existing lessons rows with clean UTF-8 English content
-- Safe to run multiple times (UPDATE only, no DELETE/INSERT)

BEGIN;

-- ============================================
-- WHITE BELT STPs (24)
-- ============================================

UPDATE lessons SET
  description_md = $tss$# STP-001 — Venue Analysis · Canonical Description

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

*TSS® White Belt Canon · IP of Marcelo Castellanos / Enkrateia · Humility*$tss$,
  drill_md = $tss$# DRL-WB-01 — Venue Analysis Map Drill

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

*TSS® Drill Canon · IP of Marcelo Castellanos / Enkrateia · White Belt*$tss$,
  errors_md = $tss$### ERR-WB-001_Rushed_Analysis

## ERR-WB-001 — Rushed Analysis

**Linked Step:** STP-001 Venue Analysis
**Linked Drill:** DRL-WB-01 Venue Analysis Map Drill
**Belt:** White Belt
**Pillar:** Safety / Tactical
**Severity:** HIGH (safety-related)
**Status:** CANONIZED

---

## The error

The student looks at the spot for 10–30 seconds and declares it "analyzed." They skip the silent observation window and jump straight into declaring the safe zone, hazards, or go/no-go.

This is the most common White Belt error. It is also the most dangerous, because every other component of the MAP depends on actually having seen at least one full set of waves.

---

## Why it happens

- The student is excited to get in the water.
- The student does not yet understand that wave behavior changes across a set.
- The coach did not enforce the 3–5 minute silent observation rule.
- The student is imitating the rhythm of more experienced surfers around them.
- Cultural pressure: "I don't want to look like I'm hesitating."

---

## How to detect it

Observable cues:

- Student speaks before 3 minutes have passed.
- Student's first statement is opinion ("se ve bien") instead of description.
- Student cannot name a hazard because no hazard has shown itself yet.
- Student identifies IMPACT ZONE in the wrong place because they saw one wave, not a set.
- Student's GO-NOGO is based on the first wave they saw, not the range of conditions.

---

## Coach correction (verbal triggers)

Short disparadores in order of escalation:

1. *"Silencio. Mirá una serie completa primero."*
2. *"¿Cuántas olas has visto? No sirve con una."*
3. *"Reset. Tres minutos de observación. Sin hablar."*
4. *"Cuéntame qué has visto. Describe, no opines."*

If the student still rushes after 2 resets, the coach aborts the drill and repeats STP-001 in the next session.

---

## Pedagogical framing

Venue Analysis is not a test the student is trying to "pass fast." It is a **diagnostic tool**. Rushing a diagnostic creates a dangerous map. The coach frames this explicitly:

> *"Si tu mapa está mal, tu decisión está mal. Si tu decisión está mal, tu sesión está mal o es peligrosa. Primero los ojos, después la boca."*

---

## Prevention (coach protocol)

- Enforce the **3–5 minute silent observation rule** before any key word is introduced.
- In session 1, coach observes silently alongside the student to model the behavior.
- In session 2, coach explicitly sets a timer.
- In session 3+, coach waits for the student to initiate — if the student rushes, coach pauses with the verbal trigger above.

---

## Link to success criteria

Rushed analysis makes it impossible to meet:

- Criterion 1 (identify SAFE ZONE clearly) — because safe zone may shift between sets.
- Criterion 3 (identify at least one significant HAZARD) — because hazards often only reveal on larger sets.
- Criterion 5 (defensible GO-NOGO) — because the evidence base is insufficient.

If this error is present, the drill is **not passed** that session regardless of other criteria.

---

## Related errors

- ERR-WB-002 Vague Reading — often co-occurs.
- ERR-WB-003 Failed Outside Reference — related root cause (lack of structured observation).

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*

---

### ERR-WB-002_Vague_Reading

## ERR-WB-002 — Vague Reading (No Justification)

**Linked Step:** STP-001 Venue Analysis
**Linked Drill:** DRL-WB-01 Venue Analysis Map Drill
**Belt:** White Belt
**Pillar:** Safety / Tactical
**Severity:** MEDIUM-HIGH (masquerades as competence)
**Status:** CANONIZED

---

## The error

The student uses vocabulary that *sounds* analytical but contains no observable evidence.

Examples of vague reading:

- *"Está bien hoy."*
- *"Se ve tranquilo."*
- *"La izquierda es mejor."*
- *"Hay corriente."* (without showing where, in which direction, how strong)
- *"Yes, go."* (with no reason)

The map has no information. The vocabulary is theatre.

---

## Why it's more dangerous than silence

A silent student is honestly confused — the coach can help. A vague student has already decided they "know" — the coach now has to dismantle false confidence before rebuilding a real map.

Vague reading also passes informal evaluation. Friends and family nod along. Only a trained coach will push back.

---

## How to detect it

Every answer fails the "Show me where" test.

- Student says "safe zone" but cannot point at it.
- Student says "there's current" but cannot explain which direction.
- Student says "it's big" but gives no reference (chest high? head high? compared to what?).
- Student uses English surfing vocabulary ("lineup," "inside") without being able to indicate it physically.
- Student answers with one word when a sentence is required.

---

## Coach correction (verbal triggers)

The coach forces the student to ground every claim in observation:

1. *"Show me where."* (single most important correction)
2. *"¿Cómo lo sabés? ¿Qué viste?"*
3. *"Descríbelo como si yo no estuviera viendo el mar."*
4. *"Dame tamaño de referencia — ¿hasta dónde te llega la ola?"*
5. *"Señala con el dedo. No con la mano abierta."*

The goal is not to humiliate the student — it is to install the habit of **observation before language**.

---

## Pedagogical framing

The coach explains this as a rule, not a critique:

> *"No decimos lo que vemos. Mostramos lo que vemos. Si no puedes señalarlo, todavía no lo viste."*

The key discipline is: **every key word must be anchored to a physical point of the ocean the student can indicate.**

---

## Prevention (coach protocol)

- Start every component of the MAP with *"Señálame..."* instead of *"Describe..."*
- Require a physical gesture before the verbal label.
- If the student speaks before pointing, the coach interrupts and resets: *"Primero el dedo. Después la palabra."*
- After each session, coach asks the student to draw the map on sand or paper. Drawing exposes vague reading immediately.

---

## Common underlying causes

- The student has absorbed surfing vocabulary from social media or peers without field experience.
- The student is trying to impress the coach.
- The coach previously accepted vague answers without challenge.
- The student is nervous and using jargon as defense.

---

## Link to success criteria

Vague reading causes failure on:

- Criterion 1 (identify SAFE ZONE clearly and physically).
- Criterion 4 (state IN and OUT points with reasoning).
- Criterion 5 (defensible GO-NOGO).
- Criterion 6 (specific SESSION PLAN).

---

## Related errors

- ERR-WB-001 Rushed Analysis — often the root cause.
- ERR-WB-004 Mismatched Level — vague reading hides self-overestimation.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*

---

### ERR-WB-003_Failed_Outside_Reference

## ERR-WB-003 — Failed Outside Reference

**Linked Step:** STP-001 Venue Analysis
**Linked Drill:** DRL-WB-01 Venue Analysis Map Drill
**Belt:** White Belt
**Pillar:** Safety / Ocean Reading
**Severity:** HIGH (drift/safety-related)
**Status:** CANONIZED

---

## The error

The student identifies a land reference (palm tree, beach umbrella, building) but fails to identify a **second reference outside** — a fixed visual point on or beyond the horizon line: a boat, a buoy, an island, a headland, a distant building.

Without the outside reference, the student cannot detect lateral drift once in the water. They think they are holding position. They are not. They only discover the drift when the land reference has moved too far behind them — by which point they may already be in the impact zone, in a current, or far from the safe zone.

---

## Why it matters specifically in White Belt

White Belt is taught in whitewater, chest-deep or less. Most White Belts assume "I'm close to shore, I can't get lost." This assumption is wrong:

- Lateral drift along the beach is invisible without an outside reference.
- A student can drift 30–50 meters in 10 minutes without noticing.
- Drift into a current or a rocky section is the most common White Belt safety incident.

The outside reference is the cheapest safety tool the student will ever own. If they skip it, they cannot self-monitor — the coach becomes 100% responsible for their position.

---

## How to detect it

- Student names a single reference point (usually on land) and stops.
- When asked "¿y afuera?" the student shrugs or looks confused.
- Student picks a moving reference (another surfer, a bird, a wave) and calls it a reference.
- Student picks a reference too close to them (their own towel, 5 meters away) — any small drift invalidates it.
- Once in the water, student does not look up between waves to check position.

---

## Coach correction (verbal triggers)

1. *"¿Dónde está tu referencia afuera?"*
2. *"Necesito dos puntos: uno en tierra y uno lejos. ¿Cuál es el lejos?"*
3. *"Si cierras los ojos y abres, ¿cómo sabes que no te has movido?"*
4. *"Ese se mueve. Busca uno que no se mueva."* (when student picks a boat anchored for the day — accept only if clearly stationary, otherwise reject)

---

## Pedagogical framing

> *"Una sola referencia no es suficiente. Necesitas dos: una en la costa y una afuera. Con dos puntos, sabes si te moviste. Con uno solo, te movés y no te das cuenta hasta que es tarde."*

Link this to the broader principle: **the ocean moves you, even when you don't feel it moving you.**

---

## Prevention (coach protocol)

- Always ask for both references in a single breath: *"Referencia en tierra y referencia afuera."*
- Before the student enters the water, the coach asks once more: *"¿Cuáles son tus dos puntos?"*
- Every 10 minutes during the session, coach signals: *"Check referencia."*
- Teach the student to re-check between sets, not during paddle-outs.

---

## Practical micro-example

A student in Puro Surf identifies:

- Land reference: "The red umbrella of the bar."
- Outside reference: "The headland to the right where the rocks end."

15 minutes into the session:

- Red umbrella is now 40 meters to their left.
- The headland is now directly in front of them.

Student reads this instantly: *"Me he ido a la izquierda, voy a paddle de regreso a mi posición inicial."*

Without the outside reference, this correction happens 10 minutes later, after a dangerous drift.

---

## Link to success criteria

Failing outside reference directly blocks:

- Criterion 2 (describe general conditions) — student cannot monitor changing conditions.
- Criterion 4 (state IN and OUT with reasoning) — exit depends on knowing where drift is taking them.

Also silently undermines Block E5 (Humility): the student who insists "I don't need two references" is not exhibiting humility toward the ocean.

---

## Related errors

- ERR-WB-001 Rushed Analysis — often skips this step entirely.
- ERR-WB-002 Vague Reading — student "says" they have references but cannot name them.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*

---

### ERR-WB-004_Mismatched_Level_vs_Conditions

## ERR-WB-004 — Mismatched Level vs Conditions

**Linked Step:** STP-001 Venue Analysis
**Linked Drill:** DRL-WB-01 Venue Analysis Map Drill
**Belt:** White Belt
**Pillar:** Safety / Judgment
**Severity:** CRITICAL (safety + insurance + doctrinal)
**Status:** CANONIZED

---

## The error

The student gives a **GO** for conditions that are outside valid White Belt range (per `WB_Competency_Standard_v1.0` §3).

Typical versions:

- Foam larger than ~3 ft (above waist-high).
- Noticeable lateral current or rip.
- Water deeper than chest where they intend to catch waves.
- Crowded lineup at peak hour.
- Offshore strong wind.
- Low visibility.

The student wants to surf, so they reshape the analysis to justify the answer they already decided. This is the most dangerous error because the student is operating their own judgment in the direction of risk.

---

## Why this is different from ERR-WB-001 and ERR-WB-002

- ERR-001 and ERR-002 are errors of **execution** (the analysis was rushed or vague).
- ERR-004 is an error of **judgment**. The analysis may be technically correct — the conclusion is wrong.

A student can describe the conditions accurately AND still mismatch their level. This error requires the coach to evaluate not just what the student *observed*, but what they *decided* based on what they observed.

---

## How to detect it

Red flags for the coach:

- Student describes conditions correctly (e.g., "hay corriente fuerte hacia la izquierda") and then says GO.
- Student minimizes or reframes a hazard they just identified ("pero no es tanto").
- Student compares themselves to other surfers in the water ("si ellos pueden yo puedo").
- Student expresses time pressure ("solo tengo hoy").
- Student uses ego language ("yo ya hice esto más grande").
- Coach's gut says no and the student's mouth says yes.

---

## Coach correction (verbal triggers + escalation)

**Level 1 — question the reasoning:**
- *"Describe las condiciones que tú mismo acabas de ver. ¿Están dentro de tu rango?"*
- *"Compara con lo que hiciste la sesión pasada. ¿Esto es mayor o menor?"*

**Level 2 — invoke the standard:**
- *"White Belt se certifica hasta 3 pies de espuma y sin corriente. ¿Esto cumple?"*
- *"Si hoy no cumple, no es White Belt. ¿Entonces para quién es este día?"*

**Level 3 — coach's doctrinal authority:**
- *"La decisión de entrar hoy no es tuya sola. Hoy no entramos."*
- (Coach has veto. WB is taught under coach supervision. Coach can downgrade or abort session.)

The coach does **not** negotiate this. No session is worth a misaligned call.

---

## Pedagogical framing

> *"El mar no discrimina. No le importa si vos tenías ganas, si habías planificado, si ya viajaste hasta acá. Si las condiciones no son de tu nivel, hoy no es tu día. Leer eso sin pelearlo es parte del Value White Belt: humildad."*

This error is the clearest connection between the **technical drill** (STP-001) and the **value of the belt** (Humility). If the student cannot execute a true NO-GO when conditions demand it, they have not internalized humility.

---

## Prevention (coach protocol)

- Keep the WB condition range printed and visible during each session (coach card).
- Before every session, coach reviews the range with the student in 30 seconds: *"Hoy vamos a verificar que esté dentro de White Belt. Dentro = 3 pies, sin corriente, sin aglomeración."*
- Reinforce positive NO-GOs: when the student correctly calls NO-GO, the coach validates explicitly: *"Esa es la decisión correcta. Hoy el mar no es para White Belt."*
- Do **not** allow the student to "try for 10 minutes and see" — that's already a GO.

---

## Doctrinal and legal implications

This error category is the one with direct impact on certification defense:

- If a TSS-certified White Belt is later involved in an incident in out-of-range conditions, the certification envelope protects TSS **only if the coach correctly enforced the WB condition range**.
- Every mismatched GO that a coach allows weakens the legal defensibility of the certification.
- Documenting NO-GO decisions in the `Coach_Notes_Template` is part of the risk-management layer of TSS.

This is why ERR-WB-004 is the only error in White Belt classified as **CRITICAL**.

---

## Link to success criteria

Directly blocks:

- Criterion 5 (GO-NOGO defensible for their level).
- Block E (Humility): E3 specifically — "recognizes own limits and does not attempt rides outside WB conditions."

A student who commits ERR-WB-004 cannot be certified that session regardless of technical performance elsewhere.

---

## Related errors

- ERR-WB-001 Rushed Analysis — often the vehicle for mismatched calls.
- ERR-WB-002 Vague Reading — often used to cover a self-serving conclusion.
- ERR-WB-003 Failed Outside Reference — compounds the risk once the student enters the water.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*$tss$
WHERE id = 'STP-001';

UPDATE lessons SET
  description_md = $tss$# STP-002 — Warm Up · Canonical Description

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

*TSS® White Belt Canon · IP of Marcelo Castellanos / Enkrateia · Humility*$tss$,
  drill_md = $tss$# DRL-WB-02 — TSS Warm Up Flow

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

*TSS® Drill Library · IP of Marcelo Castellanos / Enkrateia · White Belt*$tss$,
  errors_md = $tss$### ERR-WB-005_Going_Through_Motions

## ERR-WB-005 — Going Through Motions

**Linked Step:** STP-002 Warm Up
**Linked Drill:** DRL-WB-02 TSS Warm Up Flow
**Belt:** White Belt
**Pillar:** Physical / Mental
**Severity:** MEDIUM
**Status:** CANONIZED

---

## The error

The student executes the 4 phases visually — body moves, reps get done — but attention is absent. Eyes wander. Movements are sloppy. The warm-up happens to the student, not through the student.

From the outside it looks "done." Internally, nothing is actually being prepared. The student enters the water in the same state they arrived.

---

## Why it happens

- The student treats Warm Up as "the thing I do before the real thing" instead of as part of the real thing.
- Peer pressure: the student imitates other students who are also going through motions.
- The coach did not enforce attention during the sequence.
- Cultural habit — "stretching is a formality."
- The student does not understand why each movement is specific to surfing.

---

## How to detect it

- Eyes drift: the student looks at the water, other students, their phone nearby.
- Reps are inconsistent in quality — first reps decent, by rep 5 it's slop.
- Movements are performed with minimum range of motion.
- Phase transitions are automatic: student does not notice which phase they are in.
- Breathing is shallow and disconnected even during Phase 4 (BREATH).
- When asked *"What phase are we in?"* the student hesitates or says *"uh, I don't know."*

---

## Coach correction (verbal triggers)

1. *"Ojos. ¿Dónde están tus ojos?"*
2. *"¿Qué fase estamos haciendo?"* (if student can't name it → reset phase)
3. *"Slow down. Calidad, no cantidad."*
4. *"Rango completo. Hasta el final. Controlado."*
5. *"¿Por qué hacemos esta movida? ¿Qué prepara?"* (student must name surf-specific reason)

---

## Pedagogical framing

> *"Warm Up solo cuenta si tu atención está dentro del cuerpo. Si tu mente está afuera, no estás preparando nada. Estás gastando tiempo."*

The coach reinforces that this is not about "doing reps" — it is about building the physical-mental link before entering the ocean.

---

## Prevention (coach protocol)

- Name the key word at the start of every phase: *"MOBILITY. Empezamos."* Student cannot zone out if the phase is explicitly marked.
- Ask a question mid-phase: *"¿Dónde sientes la activación?"* — requires the student to locate sensation.
- Use variation: change the specific exercises week to week inside the same phase, so the student stays present instead of running autopilot.
- At end of phase 4, require the student to say the coach cue aloud. If said without presence, redo phase 4.

---

## Link to success criteria

Going through motions blocks:

- Criterion 1 (complete phases with focus and correct movement quality) — directly fails.
- Criterion 2 (improved readiness in simulations) — no improvement because no real engagement.
- Criterion 3 (enter the water present and connected) — the state is never reached.

---

## Doctrinal note

Attention is the prerequisite for every other skill in TSS. If the student cannot hold attention for 8–10 minutes of Warm Up, they cannot hold attention for 45 minutes of session. This error is small on the surface, structural underneath.

---

## Related errors

- ERR-WB-006 Cutting Phases — often co-occurs with going through motions.
- ERR-WB-007 Breath Disconnection — Phase 4 is where this error becomes most visible.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*

---

### ERR-WB-006_Cutting_Phases

## ERR-WB-006 — Cutting Phases

**Linked Step:** STP-002 Warm Up
**Linked Drill:** DRL-WB-02 TSS Warm Up Flow
**Belt:** White Belt
**Pillar:** Physical
**Severity:** MEDIUM-HIGH
**Status:** CANONIZED

---

## The error

The student skips a phase entirely or rushes through it to get to the water faster. Common patterns:

- Skipping Phase 1 MOBILITY because "I already stretched."
- Compressing Phase 2 ACTIVATION to a few seconds because "I'm warm already."
- Going from Phase 3 SIMULATION straight into the water, skipping Phase 4 BREATH.
- Running all 4 phases in under 3 minutes.

The body is not ready. The mind is not ready. The student enters the water prematurely.

---

## Why it happens

- Anticipation of the session — the ocean is right there and the student wants in.
- The student believes Warm Up is preparation *for* the session rather than part *of* the session.
- Peer comparison: "Nobody else is doing all four phases."
- The coach did not hold rhythm or enforce sequence.
- Time pressure on the group ("we have 10 minutes to get in").

---

## How to detect it

- Student is standing still waiting for the next phase before the current one is done.
- Student glances toward the water repeatedly during the warm-up.
- Movement volume is obviously reduced — 3 reps instead of 10.
- Student executes a phase without proper transition (no breath, no reset).
- Full warm-up takes less than 6 minutes.
- The coach cue at end of Phase 4 is skipped or mumbled.

---

## Coach correction (verbal triggers)

1. *"Esta fase no terminó. Volvemos a empezar."*
2. *"El mar no se va. El mar espera."*
3. *"Calidad antes que velocidad."*
4. *"Cuatro fases. En orden. Completas."*
5. *"¿Cuántas repeticiones hiciste? Diez. Hiciste tres. Empezamos de nuevo."*

If the student cuts a phase twice in the same session, the coach restarts the Warm Up from Phase 1. Consequence matters — words are not enough.

---

## Pedagogical framing

> *"Warm Up no es el peaje. Warm Up es la puerta. Si no entras bien por la puerta, lo que pasa después no funciona. Cuatro fases. En orden. Sin negociar."*

Link this directly to the value of the belt — **Humility**. Cutting phases is impatience, which is the opposite of humility.

---

## Prevention (coach protocol)

- At the start of every Warm Up, coach announces: *"Cuatro fases. Sin saltarse. Sin apurar."*
- Coach leads phase transitions explicitly: *"Fase uno termina. Fase dos empieza."*
- In Phase 4, coach requires the student to stop, close eyes, breathe — no shortcut possible.
- Track warm-up duration on the Coach Notes Template. If duration is < 6 min, flag it.
- Model it: coach never skips phases when warming up themselves in front of students.

---

## Link to success criteria

Cutting phases blocks:

- Criterion 1 (complete phases with focus and correct movement quality) — directly fails.
- Criterion 2 (improved readiness in simulations) — insufficient preparation volume.

A session with cutting phases does **not count** toward STP-002 certification.

---

## Related errors

- ERR-WB-005 Going Through Motions — low attention often leads to cutting.
- ERR-WB-008 Wrong Intensity — student who rushes may also be coached with poor intensity regulation.

---

## Special note on competing vs training

This error pattern foreshadows a much larger problem that appears at competition level. Competitors who cut warm-up phases in heats under-perform systematically. Installing the habit of full-sequence warm-up at White Belt is a long-term investment in the athlete, not only a safety concern.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*

---

### ERR-WB-007_Breath_Disconnection

## ERR-WB-007 — Breath Disconnection

**Linked Step:** STP-002 Warm Up
**Linked Drill:** DRL-WB-02 TSS Warm Up Flow
**Belt:** White Belt
**Pillar:** Mental / Physical
**Severity:** MEDIUM
**Status:** CANONIZED

---

## The error

Phase 4 (BREATH) is executed without actual breath-body connection. The student stands still, possibly closes their eyes, but the breathing is shallow, irregular, or performative. Attention never arrives.

The phase looks like it happened. Nothing changed. The student enters the water with the same mental noise they had before.

---

## Why it matters more than it looks

Phase 4 is the only part of Warm Up that targets the mental-physical bridge. If it fails, the student may be physically warm but mentally disconnected, overstimulated, or anxious — which directly affects:

- Attention during the session.
- Reaction time in the water.
- Recovery after wipeouts.
- Capacity to follow coach cues.

Surfing is not purely physical. Phase 4 is where that truth is trained.

---

## How to detect it

- Breathing is shallow, fast, and chest-based.
- Shoulders remain high and tense during the "breath" phase.
- Student's eyes flick open repeatedly.
- Student is still talking or joking with others during the phase.
- The coach cue at the end is said without presence — mechanical, rushed, or in the wrong rhythm.
- Student transitions to the water immediately after, without a clear pause.

---

## Coach correction (verbal triggers)

1. *"Respira con la nariz. Larga la exhalación por la boca."*
2. *"Hombros abajo."*
3. *"Sentí los pies en la arena."*
4. *"Una respiración. Larga. Completa. Otra."*
5. *"¿Estás aquí o estás pensando en la primera ola? Volvé al cuerpo."*

If breath does not settle after 2 prompts, the coach extends Phase 4 by 30 seconds and slows the cadence.

---

## Micro-protocol for Phase 4

This is the fallback the coach uses any time the student is disconnected:

1. Feet shoulder-width. Eyes soft or closed.
2. 4 nasal inhalations, 4 mouth exhalations. Exhale longer than inhale (4 in / 6 out).
3. Body scan — feet, knees, hips, chest, shoulders, jaw.
4. Coach asks: *"¿Estás?"* Student responds (aloud, session 3+): *"Body ready. Mind clear. Breath connected. Here and now."*

This sequence is non-negotiable. The student can finish Warm Up only when this closes cleanly.

---

## Pedagogical framing

> *"El cuerpo ya está preparado. Falta la conexión. Si entras al mar con la mente en otro lado, el cuerpo no sirve. Respirá. Estate acá."*

This is also where the student learns — for the first time in TSS — that their attention is a trainable skill, not a fixed state.

---

## Prevention (coach protocol)

- Never rush Phase 4. If the session is short, cut Phases 1-2 by 30 seconds each — never Phase 4.
- Require the coach cue to be said aloud by the student from session 3 onward.
- If the student says the cue in rushed or performative way, coach asks: *"Otra vez. Sentilo."*
- Use the Coach Notes Template to log whether Phase 4 was clean. Pattern of dirty Phase 4 = sign the student is not internalizing TSS ritual yet.

---

## Link to success criteria

Breath disconnection blocks:

- Criterion 3 (enter the water physically active, mentally present, and connected) — directly fails.

A session with a failed Phase 4 does not meet criterion 3, and therefore does not count toward STP-002 certification, regardless of how well Phases 1-3 were executed.

---

## Connection to other belts

- **Yellow Belt:** breath work extends to pre-wave positioning.
- **Blue Belt:** breath regulates wipeout recovery and duck-dive management.
- **Competition-level belts:** Phase 4 becomes the heat warm-up ritual.

Installing this pattern correctly at White Belt saves 2-3 belts of remediation later.

---

## Related errors

- ERR-WB-005 Going Through Motions — same root cause: attention absent.
- ERR-WB-006 Cutting Phases — often Phase 4 is the one cut.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*

---

### ERR-WB-008_Wrong_Intensity

## ERR-WB-008 — Wrong Intensity

**Linked Step:** STP-002 Warm Up
**Linked Drill:** DRL-WB-02 TSS Warm Up Flow
**Belt:** White Belt
**Pillar:** Physical / Coaching
**Severity:** HIGH (coach-caused, affects student session directly)
**Status:** CANONIZED

---

## The error

The Warm Up intensity is miscalibrated for the student or group. Two versions:

**Version A — Under-intensity:**
The warm-up is so light it does not actually prepare the body. Joints moved but not mobilized. Muscles touched but not activated. The student enters the water still cold.

**Version B — Over-intensity:**
The warm-up is too hard for the student level or group composition. Too many reps. Too much load. Intensity matched to an athlete instead of a White Belt. The student enters the water fatigued before the session even started.

Both versions are failures of the same underlying skill: **the coach reading the people in front of them.**

---

## Why this is a coach-caused error

Unlike ERR-WB-005, 006, 007 (student-side failures), this error originates in coach decision-making. The student's fatigue or coldness is the symptom. The coach's poor intensity calibration is the cause.

The error is placed in the student error database (not coach error database) because the coach can only correct this by **observing the student's state**. The visible evidence is in the student.

---

## How to detect it (coach must self-monitor)

**Under-intensity signals:**
- Student's skin remains cold to the touch at the end of Phase 2.
- Breathing during simulation phase is easy, unchanged from rest.
- Student reports feeling "the same as before."
- In the water, the first 5-10 minutes are stiff or late-reacting.

**Over-intensity signals:**
- Student is sweating heavily before entering the water.
- Simulation quality degrades (not improves) from start to end.
- Student requests a break or water mid-warm-up.
- In the water, student is tired in the first 15 minutes, not at minute 40.
- Student expresses frustration or fatigue during the warm-up.

---

## Coach self-correction (real-time)

If mid-warm-up the coach spots over-intensity:

1. Reduce reps of the next exercise by 50%.
2. Skip one of the activation drills.
3. Extend Phase 4 BREATH to normalize heart rate.

If mid-warm-up the coach spots under-intensity:

1. Add 30 seconds to the ongoing phase.
2. Increase range of motion or add resistance (bodyweight holds).
3. Extend simulation phase with 2-3 more pop-up reps at full range.

---

## Prevention (coach protocol)

Before starting the warm-up, coach **reads the group** and decides intensity profile:

| Population | Intensity tier |
|---|---|
| Kids | Low-moderate, playful pacing |
| First-session adults | Moderate-low, extended mobility |
| Repeat students WB | Moderate |
| Athletic WB | Moderate-high |
| Cold morning | Extended mobility phase |
| Hot midday | Reduced activation phase |
| Multi-day program, day 3+ | Slightly reduced to prevent cumulative fatigue |

Coach records chosen intensity tier on the Coach Notes Template. If student reports poor session start, coach compares session state to the recorded intensity and adjusts next session.

---

## Pedagogical framing

> *"Warm Up no es para el coach. Es para el alumno. Si el coach lee bien a quien tiene enfrente, la intensidad es correcta. Si el coach corre su propia rutina, la intensidad es suerte."*

This error is the one most likely to be hidden behind "we always do it this way." A coach running the same intensity for every group is not coaching — they are performing a routine.

---

## Link to success criteria

Wrong intensity blocks:

- Criterion 3 (enter the water physically active, mentally present, and connected — **without unnecessary fatigue**). This is the only success criterion that explicitly calls out intensity.

Specifically: over-intensity fails the "without unnecessary fatigue" clause. Under-intensity fails the "physically active" clause.

---

## Doctrinal link

This error connects directly to the WB Value of **Humility** at the coach level: the humble coach reads the people in front of them and adapts. The ego coach runs their routine. Humility applies to both sides of the coach-student relationship.

---

## Related errors

- ERR-WB-005, 006, 007 are student-side errors.
- ERR-WB-008 is the only coach-side error in this cluster. It is placed in the student DB because its evidence is in the student's state, not the coach's.

---

## Coach self-audit (monthly)

Every 4 weeks, the coach reviews the last 20 sessions:

- How many sessions showed under-intensity signals?
- How many showed over-intensity signals?
- Is there a pattern (e.g., Mondays always over-intense)?
- Was the intensity adjusted on the next session after detection?

This self-audit is what turns a decent coach into a TSS-certified coach.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*$tss$
WHERE id = 'STP-002';

UPDATE lessons SET
  description_md = $tss$# STP-003 — Grab Board · Canonical Description

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

*TSS® White Belt Canon · IP of Marcelo Castellanos / Enkrateia · Humility*$tss$,
  drill_md = $tss$# DRL-WB-03 — Grab Board Reset Drill

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

*TSS® Drill Library · IP of Marcelo Castellanos / Enkrateia · White Belt*$tss$,
  errors_md = $tss$### ERR-WB-009_Nose_Tail_Grab

## ERR-WB-009 — Nose / Tail Grab

**Linked Step:** STP-003 Grab Board
**Linked Drill:** DRL-WB-03 Grab Board Reset Drill
**Belt:** White Belt
**Pillar:** Technical
**Severity:** MEDIUM (control failure + potential damage)
**Status:** CANONIZED

---

## The error

The student picks up the board by grabbing it from the **nose** (front tip) or the **tail** (back end) instead of the **rails** (side edges).

This produces an unbalanced lift. The opposite end of the board dangles, swings, or drags. The student has no leverage over the center of mass of the board. Control is compromised from the first moment.

---

## Why it happens

- The nose and tail are visually "easier to grab" — they stick up slightly.
- The student has seen others do it this way (beach habit).
- The board is long and the student is short — they reach for whichever end is closer.
- The coach did not demonstrate the rail grip explicitly.

---

## Why it's a problem

- **Loss of leverage:** with one hand on the nose, the tail swings. With one hand on the tail, the nose swings. Either way, the board is not centered.
- **Damage:** the nose and tail of soft-top boards can crack under repeated stress if lifted by the tip.
- **Fin contact:** grabbing the tail puts hand near the fins. Fins are sharp.
- **Habit carries forward:** a student who grabs from tip at WB will grab from tip at Yellow Belt, Blue Belt, and onward. The habit compounds.

---

## How to detect it

- Student reaches toward the nose or tail before bending the knees.
- One hand on the rail, other hand on the nose/tail (half-correct grip).
- Board rises at an angle — one end higher than the other.
- Board needs a "correction grip" after the lift — student has to re-grip mid-carry.

---

## Coach correction (verbal triggers)

1. *"Rails. Solo rails."*
2. *"Dos manos. En los bordes."*
3. *"No desde la punta. No desde la cola."*
4. *"Al centro. Al medio de la tabla."*

If the student grabs wrong twice in a row, the coach resets the drill: *"De vuelta. Desde el suelo."*

---

## Pedagogical framing

> *"La tabla se controla desde los rails porque los rails están cerca del centro de masa. Si agarrás desde la punta o la cola, la tabla se mueve por su cuenta. No la estás controlando — te está controlando a vos."*

Link to the anchor phrase: *"Control starts here."*

---

## Prevention (coach protocol)

- In the demo, coach explicitly touches the rails first and says: *"RAILS. Acá. Solo acá."*
- In rep 1 with the student, coach physically guides the student's hands to the rails if needed.
- Always require both hands simultaneously — never accept one hand on rail + one hand on nose.
- Reinforce the visual: *"Mirá las aletas. La línea de las aletas es el centro. Tus manos van simétricas al rededor del centro."*

---

## Link to success criteria

Nose/tail grab directly blocks:

- Criterion 1 (correct body position and safe mechanics).
- Criterion 2 (immediate control of the board once lifted).

If observed in cert session → session does not count.

---

## Related errors

- ERR-WB-011 One-Hand Handling — often co-occurs (one hand on rail + one on tail = asymmetric grip).
- ERR-WB-012 Rushed/Swinging Pickup — a student grabbing from the nose often tries to compensate with a swing-up.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*

---

### ERR-WB-010_Bad_Lifting_Mechanics

## ERR-WB-010 — Bad Lifting Mechanics

**Linked Step:** STP-003 Grab Board
**Linked Drill:** DRL-WB-03 Grab Board Reset Drill
**Belt:** White Belt
**Pillar:** Technical / Physical
**Severity:** HIGH (injury risk — cumulative back strain)
**Status:** CANONIZED

---

## The error

The student lifts the board using the lower back instead of the legs. Two main expressions:

- **Rounded back:** spine curved, shoulders in front of hips, lift initiated by spinal extension.
- **Locked knees:** legs stay straight, student folds at the waist, entire lift loaded through the lumbar spine.

Sometimes both together. The board gets lifted. The lower back pays the price.

---

## Why this is the most important mechanical error in Grab Board

A White Belt lifts the board 4-10 times per session. Per week, that's 20-80 lifts. Per year, thousands. Bad lifting mechanics compound silently. The student may not feel it at rep 1 or rep 100. They feel it at rep 2,000 — low back pain, muscle strain, or eventually disc issues.

This is the only Grab Board error that causes **cumulative physical damage** even when the board is lifted "successfully."

---

## Why it happens

- The student is imitating what they have seen other people do (bad lifting is common everywhere).
- The student is strong and the board is light — they "get away with it" early.
- The student thinks bending knees is "unnecessary effort" for a light board.
- The coach did not model the squat posture explicitly.
- The student has a pre-existing habit of folding at the waist (gym, sports background, age).

---

## How to detect it

Visual markers (side view is diagnostic):

- Knees stay straight during the lift.
- Hips don't move back (no squat pattern).
- Back is visibly curved.
- Shoulders are forward of hips.
- Student exhales hard on the lift (bracing strategy → lumbar loading).
- Student straightens up with a small "jerk" motion instead of smooth rise.

---

## Coach correction (verbal triggers)

1. *"Espalda recta. Rodillas abajo."*
2. *"Bajá la cadera. No la espalda."*
3. *"Sentadilla, no flexión de cintura."*
4. *"Piernas trabajan. Espalda no."*
5. *"Reset. Otra vez. Desde abajo."*

If the student fails the mechanics twice in a row, the coach pauses the drill and walks through the squat pattern without the board first — pure bodyweight squats, 3-5 reps, then return to the board.

---

## Pedagogical framing

> *"El cuerpo humano tiene dos formas de levantar algo del suelo. Con las piernas o con la espalda. Las piernas son grandes, fuertes, y están hechas para eso. La espalda no. Siempre con las piernas."*

This is also one of the first moments in TSS where the student learns that **technique protects the body over decades** — not just this session.

---

## Prevention (coach protocol)

- **Demo with exaggerated squat first.** Coach shows the lift with a clearly deep squat so the student sees the full pattern.
- **Bodyweight squat pre-check.** If the student does not know how to squat, coach teaches the squat pattern (30 seconds) before attempting to pick up the board.
- **Side-view feedback.** Coach positions themselves to see the student from the side — this is the only angle where rounded back is visible.
- **Cue stack:** *"Knees first. Then hands. Then lift."* In this exact order. Knees bend is Phase 1, not Phase 3.
- **Red line:** if the student lifts with rounded back even once, the rep does not count. No exceptions.

---

## Link to success criteria

Bad lifting mechanics blocks:

- Criterion 1 (correct body position and safe mechanics) — the core criterion of the drill.

A student with rounded-back lifting cannot pass STP-003 under any circumstance. This is the hardest-line error of the 4.

---

## Cross-belt implications

Bad lifting mechanics installed at White Belt produce:

- Lower-back fatigue during long paddling sessions (Yellow Belt).
- Inefficient pop-up mechanics (Yellow/Blue Belt).
- Chronic back issues for adult surfers in the 1-5 year range.

Fixing it at rep 10 is free. Fixing it at rep 10,000 requires physical therapy.

---

## Related errors

- ERR-WB-012 Rushed/Swinging Pickup — rushing often co-occurs with bad mechanics (the student compensates for poor technique with speed).
- ERR-WB-009 Nose/Tail Grab — a student grabbing off-center may compensate with spinal flexion.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*

---

### ERR-WB-011_One_Hand_Handling

## ERR-WB-011 — One-Hand Handling

**Linked Step:** STP-003 Grab Board
**Linked Drill:** DRL-WB-03 Grab Board Reset Drill
**Belt:** White Belt
**Pillar:** Technical / Safety
**Severity:** MEDIUM (unstable equipment + risk to others)
**Status:** CANONIZED

---

## The error

The student picks up the board using only one hand. The board is lifted asymmetrically — typically by a single rail grab near the center, while the other hand hangs, points, or holds something else (a water bottle, a coffee, a phone).

The result: the board is not actually under control. It wobbles, tilts, and the student has no leverage to correct if wind or movement pushes it.

---

## Why it happens

- The student does not want to put down whatever is in their other hand.
- The student has picked up the board one-handed before and "it worked" in calm conditions.
- The board is light and the student is strong — false confidence.
- Imitation of experienced surfers who carry boards one-handed (but who can do so because their technique and strength are built over years).
- The coach tolerated one-hand pickup in rep 1 and the student normalized it.

---

## Why it's a problem

- **Instability in wind:** the moment a breeze catches the board, one-hand grip cannot correct it. The board swings into the student's leg or into a nearby person.
- **Back asymmetry:** lifting load on one side loads the spine asymmetrically — a different version of ERR-WB-010's lumbar issue.
- **Spatial blind spot:** the other hand and eye are occupied, reducing awareness of people passing on the beach.
- **Bad habit transfer:** a student who handles the board one-handed at the beach will do the same at the water's edge — where wind and foam make it dangerous.

---

## How to detect it

- Student has something in the other hand (water bottle, phone, hat) and does not put it down.
- Student lifts with only one hand on the rail, other hand dangling.
- Board tilts during the lift (one rail up, one rail down).
- Student needs to shift mid-carry to bring the other hand into play.
- Board rests unevenly on the hip during CARRY phase.

---

## Coach correction (verbal triggers)

1. *"Dos manos. Siempre."*
2. *"Dejá eso en el piso. La tabla primero."*
3. *"Rail izquierdo. Rail derecho. Al mismo tiempo."*
4. *"No se carga con una mano hasta Blue Belt. Y en WB, menos."*
5. *"La tabla no es un bolso."*

If the student repeats the error after correction, coach requires the student to place every accessory (bottle, phone, sunglasses) on the ground before touching the board.

---

## Pedagogical framing

> *"La tabla merece las dos manos. No porque sea frágil — porque la estás controlando, y con una mano no la controlás. Una mano es imitar. Dos manos es cargar."*

Link to the WB value of **Humility**: a student who handles the board one-handed is signaling "I already know how" before they actually do. Humility is using both hands because that's what the technique asks for.

---

## Prevention (coach protocol)

- At the start of every drill session, coach checks hands: *"¿Algo en las manos? Al piso."*
- Demo always uses both hands visibly. Coach never demonstrates one-handed even if capable.
- Require the student to verbalize *"Rails, dos manos"* before the lift (session 1-3).
- In the Coach Notes Template, log one-hand pickup as a specific error. Pattern detection matters.

---

## Link to success criteria

One-hand handling blocks:

- Criterion 2 (immediate control of the board once lifted) — directly fails.
- Criterion 3 (consistent pickup across reps) — asymmetric grip produces inconsistent lifts.

---

## Special note on older students or rehab cases

A student with a shoulder or arm limitation may have genuine difficulty with two-hand grip on one side. In those cases:

- Coach documents the limitation in the Coach Notes Template.
- The drill is adapted (e.g., lift from knees, partner-assisted pickup) rather than accepting one-hand as "normal."
- The student is aware that standard Grab Board will require adaptation through all belts.

This adaptation is not a failure — it is a known variation. But it must be documented, not ignored.

---

## Related errors

- ERR-WB-009 Nose/Tail Grab — one-hand pickup often grabs from the wrong point.
- ERR-WB-012 Rushed/Swinging Pickup — one-hand often accompanies speed.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*

---

### ERR-WB-012_Rushed_Swinging_Pickup

## ERR-WB-012 — Rushed / Swinging Pickup

**Linked Step:** STP-003 Grab Board
**Linked Drill:** DRL-WB-03 Grab Board Reset Drill
**Belt:** White Belt
**Pillar:** Technical / Safety
**Severity:** MEDIUM-HIGH (risk to others on the beach)
**Status:** CANONIZED

---

## The error

The student uses **momentum** instead of **controlled strength** to lift the board. The pickup is fast, impulsive, and the board ends up swinging through the air before settling. Classic version: the student bends down, grabs, and yanks the board up in one continuous motion — the board passes through an arc, sometimes rising vertically, before being "caught" in the carry position.

The result looks efficient. It is dangerous.

---

## Why it happens

- The student wants to get to the water faster.
- The board is light and the student uses that lightness to substitute speed for control.
- The student has seen surfers on social media "throw" boards up into position (they are experienced; the beginner is imitating the output, not the skill behind it).
- Nervousness — the student rushes through the step to "get it over with."
- The coach did not enforce tempo in rep 1.

---

## Why it's a problem

- **Impact on others:** a board swung through an arc crosses a 1-2m radius in the horizontal plane. If someone is walking past the student — especially kids running on the beach — the board contacts them.
- **Dropped board risk:** a board lifted with momentum overshoots, the student's grip slips, board falls or swings back.
- **Wind catch:** a board moving fast through the air catches wind force the student cannot predict.
- **Compounding with ERR-WB-010:** speed + rounded back = higher injury risk than either alone.

---

## How to detect it

- The entire pickup takes less than 2 seconds.
- The board travels through a visible arc (starts low, rises above waist height, then descends to carry position).
- The student exhales forcefully on the lift.
- Board is "caught" or "settled" rather than placed — a subtle clunk or adjustment happens at the end.
- Other beachgoers visibly step back or turn when the student lifts.

---

## Coach correction (verbal triggers)

1. *"Lento. Controlado."*
2. *"Sin impulso. Sin swing."*
3. *"La tabla sube recta. No en arco."*
4. *"Si hay gente al lado, los golpeas. Slow down."*
5. *"Reset. Desde el suelo. Otra vez, a mitad de velocidad."*

If the student swings twice in a row, the coach adds a **3-second hold** between CENTER and LIFT in every subsequent rep: student must freeze after grabbing the rails before lifting. This breaks the momentum habit.

---

## Pedagogical framing

> *"El objetivo no es subir la tabla rápido. El objetivo es subir la tabla sin perderla y sin tocar a nadie. La velocidad la ganás cuando el control ya es automático. Primero control. Después velocidad."*

This is also the earliest opportunity in TSS to install the principle that **speed is a consequence of technique, not a substitute for it.**

---

## Prevention (coach protocol)

- **Set tempo in rep 1.** Coach counts: *"Uno — CENTER. Dos — KNEES. Tres — RAILS. Cuatro — LIFT. Cinco — CARRY."* Forces the student into a 5-beat cadence.
- **Pause at RAILS.** Coach requires the student to grip the rails and wait 1 second before lifting, in sessions 1-2. Breaks the snap-lift reflex.
- **Spacing discipline.** Before drill, coach confirms 2m spacing between students. Visual awareness of neighbors is part of the drill.
- **Context cue.** Coach reminds periodically: *"Hay gente alrededor. Siempre."*

---

## Link to success criteria

Rushed/swinging pickup blocks:

- Criterion 2 (immediate control of the board once lifted) — fails because control is not established until after the swing settles.
- Criterion 3 (consistent pickup across reps) — momentum-based pickups are inconsistent by nature.

---

## Cross-belt implications

The habit of using momentum instead of control carries into:

- Passing the board over head in whitewater (Yellow Belt) — dangerous if rushed.
- Duck-diving (Blue Belt) — requires controlled pressure, not momentum.
- Competition heat behavior (higher belts) — rushed athletes under-perform.

Installing the habit of controlled pickup at WB saves remediation 3-4 belts later.

---

## Related errors

- ERR-WB-010 Bad Lifting Mechanics — often co-occurs.
- ERR-WB-011 One-Hand Handling — momentum pickups are often one-handed.

---

*TSS® Error Database · IP of Marcelo Castellanos / Enkrateia · White Belt*$tss$
WHERE id = 'STP-003';

UPDATE lessons SET
  description_md = $tss$# STP-004 — WALK OUT

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
*IP of Marcelo Castellanos / Enkrateia · Tested & refined at Puro Surf*$tss$,
  drill_md = $tss$# DRL-WB-04 — WALK OUT SAND ENTRY DRILL

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
*IP of Marcelo Castellanos / Enkrateia · White Belt · Humility*$tss$,
  errors_md = $tss$### ERR-WB-013_Rushed_Entry

## ERR-WB-013 — RUSHED ENTRY

**Parent step:** STP-004 Walk Out
**Belt:** White Belt
**Severity:** HIGH
**Type:** Student-caused (frequently coach-amplified)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno llega a la orilla y avanza hacia el agua sin pausa, sin respirar, sin mirar el océano. Camina con cadencia acelerada, no arrastra los pies correctamente, la tabla se mueve con el cuerpo, el torso se inclina hacia adelante, no lee el set entrante.

Indicadores observables:
- Pausa PATIENCE ausente o bajo 1 segundo.
- Cadencia de pasos rápida y desigual.
- Mirada enfocada en el horizonte lejano o en la tabla, no en las olas inmediatas.
- Respiración corta o retenida.
- Body language de ansiedad o anticipación.

## WHY IT HAPPENS

Tres causas frecuentes:

1. **Emocional del alumno:** ansiedad de surfear, miedo que enmascara con acción, exposición social ("todos están mirando"), condiciones del mar que lo ponen nervioso pero no quiere verbalizarlo.
2. **Coach-amplified:** coach marcó pace rápido sin darse cuenta. Coach que camina delante "animando" en vez de demostrar, coach que ya está en el agua esperando, coach que le dijo "dale dale" sin proponer.
3. **Cultural:** el alumno asocia "buen surfista" con "entrar rápido al agua". Refuerzo cultural externo (películas, redes, otros surfistas).

## WHY IT'S DANGEROUS

- Cortocircuita la secuencia completa de Walk Out. Si PATIENCE falla, FACE, SIDE y PLACE colapsan en cadena.
- Impide lectura del set. Alumno puede entrar al agua justo cuando rompe una ola grande.
- Compromete control del equipo. Rushed entry es causa frecuente de pérdida de tabla en primeros metros.
- **Correlación con ERR-WB-014:** alumnos apurados son los que más cometen Board Between Body and Wave. Rushed entry es síntoma previo.

## HOW TO DETECT

**Visual:** cadencia de pasos sin pausa en la orilla, torso inclinado, manos tensas sobre la tabla.

**Temporal:** del primer paso al agua a tabla colocada pasan menos de 15–20 segundos (una entrada normal limpia en White Belt dura 25–40 segundos).

**Verbal:** alumno NO verbaliza la key word PATIENCE. Si se le pregunta "¿qué hiciste primero?" responde "entré" o "empecé a caminar" en vez de "esperé y leí".

## HOW TO CORRECT

**Intervención inmediata (durante el drill):**
1. Coach dice: **"Para."** (literal, autoridad calma)
2. Alumno detiene el paso.
3. Coach dice: **"Respirá. Mirá el océano. ¿Qué ves?"**
4. Alumno verbaliza 1-2 observaciones (ej: "hay una ola entrando" / "el agua está calma").
5. Coach dice: **"Ahora, PATIENCE."** Alumno reinicia la entrada desde la orilla.

**Intervención pedagógica (entre reps):**
- Coach pregunta: "¿Por qué estás apurado?"
- Si el alumno verbaliza causa emocional (nervios, miedo) → coach valida y propone 1 respiración profunda antes de reintentar.
- Si la causa es coach-amplified → coach se reposiciona (no delante del alumno, no en el agua esperando).
- Si la causa es cultural → coach explica: "El surf empieza en la orilla. No cuando agarrás la ola."

**Intervención estructural (si el error persiste en múltiples reps):**
- Agregar **3 respiraciones profundas obligatorias** antes del primer paso al agua.
- Agregar **"3-2-1 count"** verbal antes de arrancar.
- Sesión adicional de Warm Up (STP-002 Phase 4 BREATH) antes de retentar Walk Out.

## COACH-SIDE CHECK

Antes de marcar este error en el alumno, coach debe autoevaluar:

- ¿Yo marqué un pace que el alumno intentó seguir?
- ¿Yo estaba ya en el agua antes de que el alumno empezara?
- ¿Yo usé lenguaje que implicó prisa ("dale", "vamos", "aprovechá el set")?
- ¿Yo demostré con tempo lento?

Si alguna respuesta es "sí" → el error es parcialmente coach-caused. Coach corrige su propio setup antes de corregir al alumno.

## COMMON COACH MISTAKE AL CORREGIR

❌ "Andá más lento." — demasiado vago, no enseña.
❌ "Tranquilo." — invalidante de la emoción del alumno.
❌ "No te apures." — negación, no propuesta.

✅ "Para. Respirá. ¿Qué ves?" — devuelve agencia y observación.
✅ "PATIENCE primero. Después el paso." — ancla a la key word.

## DOES THE REP COUNT?

- Si ERR-WB-013 aparece pero el alumno corrige en el momento → rep puede contar si las otras 4 key words ejecutaron limpio.
- Si ERR-WB-013 deriva en ERR-WB-014 (board between body and wave) → **rep NO cuenta**, hard-line rule aplica.
- Si ERR-WB-013 aparece 2+ veces en una sesión → sesión NO cuenta para certificación, coach revisa causa estructural.

## RELATED ERRORS

- `ERR-WB-014` Board Between Body and Wave (consecuencia frecuente).
- `ERR-WB-015` No Feet Drag (síntoma asociado).
- `ERR-WB-016` Early Board Placement (se coloca la tabla sin profundidad porque se quiere "terminar").

---

*TSS® Error DB · ERR-WB-013 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-004*

---

### ERR-WB-014_Board_Between_Body_Wave

## ERR-WB-014 — BOARD BETWEEN BODY AND WAVE

**Parent step:** STP-004 Walk Out
**Belt:** White Belt
**Severity:** **CRITICAL — HARD-LINE RULE**
**Type:** Student-caused (occasionally coach-taught)
**Version:** v1.0

---

## WHY THIS ERROR IS A HARD-LINE RULE

**La tabla nunca, bajo ninguna circunstancia, debe estar entre el cuerpo del surfer y la ola entrante.**

Esta es la **segunda hard-line rule** del White Belt (la primera es `ERR-WB-010` Bad Lifting Mechanics en STP-003). "Hard-line" significa: **no se flexibiliza nunca, en ninguna progresión, por ningún coach, para ningún alumno**. Si aparece durante el drill, el rep NO cuenta. Sin excepción. Sin "casi bien". Sin "corrijo la próxima".

La razón es física y no negociable.

## WHAT IT LOOKS LIKE

El alumno camina hacia el agua con la tabla en una posición tal que, desde la perspectiva de la ola entrante, hay este orden espacial:

**[ola entrante] → [tabla] → [cuerpo del alumno]**

Situaciones concretas donde aparece:
1. Alumno entra con la tabla colgando adelante de su cuerpo en el lado del océano.
2. Alumno gira el cuerpo dando la espalda a la ola, la tabla queda entre él y el océano.
3. Alumno cruza la tabla al frente del cuerpo para "protegerse" de la ola (reflejo defensivo incorrecto).
4. Alumno pasa al otro lado de la tabla mientras camina, interponiéndola.

## WHY IT'S CRITICAL (física)

Si una ola entrante impacta primero a la tabla:

1. La ola aplica fuerza al volumen de la tabla.
2. La tabla se mueve en la dirección del impulso: hacia atrás y hacia arriba.
3. La nariz de la tabla (punta rígida) acelera con energía de la ola.
4. Esa nariz, con fuerza amplificada por la masa y la velocidad de la ola, se clava contra el cuerpo del surfer que está detrás.

Zonas de impacto más comunes:
- **Pecho / plexo solar** — impacto respiratorio, desorientación, puede tumbar.
- **Cara / nariz / ojos** — fracturas, cortes, pérdida de conciencia en agua (riesgo de ahogamiento).
- **Abdomen** — daño de órganos internos.
- **Ingles / genitales** — incapacidad inmediata.
- **Rodillas** — desgarros, luxaciones.

**Este es el mecanismo #1 de lesiones durante entrada al agua en surfing beginner, documentado en literatura clínica de surf medicine.**

## HOW TO DETECT

**Visual (coach):** desde atrás del alumno, mirando hacia el océano, el coach debería ver el orden: **cuerpo del alumno → tabla → agua abierta**. Si el orden es **tabla → cuerpo → agua abierta** (mirando desde el alumno al océano) → **ERROR ACTIVO**.

**Key test:** si una ola entrara AHORA, ¿qué tocaría primero, el cuerpo o la tabla?
- Respuesta: cuerpo → correcto (la tabla está protegida al costado).
- Respuesta: tabla → ERR-WB-014 activo, detener drill.

## HOW TO CORRECT

**Intervención inmediata — HARD-LINE:**

1. Coach grita o dice con autoridad: **"STOP."** (Sin explicación previa. Autoridad absoluta en este error.)
2. Alumno detiene completamente movimiento.
3. Coach aborta el rep.
4. Coach pide al alumno salir del agua, volver a la arena.
5. En la arena, coach re-demuestra la regla con la tabla en las dos posiciones (correcta y incorrecta) para que el alumno vea la diferencia visualmente.
6. Coach verbaliza: "La tabla al costado. Siempre. Este rep no contó."
7. Alumno reintenta desde el principio.

**NO corregir en pleno drill sin parar.** El riesgo físico es demasiado alto. Detener, resetear, reintentar.

## HOW TO PREVENT (setup pre-drill)

- Coach posiciona a sí mismo del lado del océano durante la demo y durante el rep del alumno. Esto "enseña" al alumno por referencia espacial que el coach (y por ende la tabla) está del lado del océano, el alumno del lado de la arena.
- Durante el briefing pre-drill, coach hace al alumno verbalizar: **"Mi cuerpo entre la arena y la tabla. La tabla entre mi cuerpo y la ola."**
- Regla ensayada en tierra: alumno ejecuta 2-3 "entradas secas" (sin agua) donde coach simula ola entrante verbalmente ("¡ola!") y alumno confirma posición correcta.

## COACH-TAUGHT VARIANT (atención)

Algunos coaches enseñan incorrectamente "protegé el cuerpo con la tabla" como reflejo defensivo. Esto es **TSS-incorrecto** y genera ERR-WB-014 instalado a nivel muscular.

**Regla TSS:** la tabla no protege al cuerpo. El posicionamiento correcto protege al cuerpo. La tabla se mantiene al costado no para defensa, sino para que ola y cuerpo sigan su relación natural sin un proyectil intermedio.

Si un coach TSS certificado enseña "tabla delante" como defensa → revisión de certificación. Esto no se negocia.

## DOES THE REP COUNT?

**NO.** Sin excepción. Sin "casi bien". Sin "corrigió antes de que pegara".

**SESIÓN NO CUENTA para certificación** si ERR-WB-014 aparece. Alumno debe repetir sesión completa.

**CERTIFICACIÓN REQUIERE 2 sesiones completas SIN ERR-WB-014.**

## ESCALATION

Si el alumno comete ERR-WB-014 en 3+ sesiones consecutivas:

1. Coach suspende progresión a STP-005.
2. Sesión dedicada solo a entradas secas (en arena, sin agua) hasta que el patrón quede instalado.
3. Revisión con coach senior si persiste.
4. No se avanza en el belt hasta resolver. Esto protege al alumno.

## RELATED ERRORS

- `ERR-WB-013` Rushed Entry (causa frecuente precursora).
- `ERR-WB-010` Bad Lifting Mechanics (otra hard-line rule, STP-003).

## DOCTRINAL NOTE

Esta regla es candidato central para la pieza doctrinal **"TSS Non-Negotiables v1"**, junto con `ERR-WB-010`. Ambas comparten:

- Severidad: riesgo físico al alumno.
- Universalidad: aplican en todo contexto, toda progresión, toda adaptación.
- Simplicidad: regla observable, binaria, no ambigua.
- Enseñabilidad: se puede enseñar a cualquier coach certificado en minutos.

Toda franquicia / licensing TSS futuro debe recibir la lista de Non-Negotiables como pieza inseparable del sistema.

---

*TSS® Error DB · ERR-WB-014 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-004*
*HARD-LINE RULE — protected at all licensing levels*

---

### ERR-WB-015_No_Feet_Drag

## ERR-WB-015 — NO FEET DRAG

**Parent step:** STP-004 Walk Out
**Belt:** White Belt
**Severity:** MEDIUM
**Type:** Student-caused
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno entra al agua levantando los pies al caminar (marcha normal de tierra) en vez de arrastrarlos sobre el fondo. Cada paso implica levantar completamente el pie, moverlo hacia adelante, y apoyarlo.

Indicadores observables:
- Pies levantan claramente sobre la superficie del agua / arena.
- Salpicaduras pronunciadas con cada paso.
- Cadencia de pasos similar a caminata en tierra.
- Mirada hacia adelante/arriba (no monitorea el fondo).

## WHY IT HAPPENS

1. **Hábito de tierra:** el alumno camina como camina siempre, no hizo la transición mental a "entorno océano".
2. **Demo insuficiente:** coach no mostró la diferencia entre paso normal y paso arrastrado.
3. **Prisa (correlación con ERR-WB-013):** alumnos apurados no arrastran porque arrastrar es más lento.
4. **Incomodidad sensorial:** sensación de arena entre los dedos del pie genera reflejo de levantar pie.

## WHY IT MATTERS (no es criticality, pero sí relevante)

**Riesgo de tropezar con objetos ocultos:**
- Rocas, piedras, conchas, basura, peces enterrados (stingray, etc. en ciertos spots).
- El arrastre detecta el objeto ANTES de que el peso del cuerpo comprometa el paso.
- Levantar pie → apoyarlo con todo el peso sobre obstáculo → posible corte, torcedura, picadura.

**En zonas tropicales (Puro Surf / El Salvador):**
- **Stingray shuffle** es protocolo estándar: arrastrar pies evita pisar una raya enterrada en la arena. La raya siente la vibración del arrastre y se va. Si se pisa directamente, inyecta veneno.
- Esta regla salva de hospital.

**Pérdida de awareness del fondo:**
- El fondo da información importante: pendiente, cambio de arena a piedra, caída brusca de profundidad.
- Alumno que no arrastra no lee el fondo, pierde data sobre dónde está parado.

## HOW TO DETECT

**Visual:** desde el costado, coach observa altura de rodilla y pie durante cada paso.
- Correcto: pie se queda pegado al fondo o justo arriba (máximo 5-10 cm).
- Incorrecto: pie levanta claramente, rodilla se flexiona como caminata normal.

**Sonoro:** arrastre correcto hace "sshhh" suave. Marcha incorrecta hace "splash" de cada paso.

## HOW TO CORRECT

**Intervención inmediata:**
1. Coach dice: **"Arrastrá. No levantes."**
2. Alumno reduce altura del paso.
3. Coach valida: **"Así. Sigue."**

**Demo comparativa (si el alumno no entiende la diferencia):**
1. Coach pide al alumno detenerse.
2. Coach camina 3 pasos en marcha normal (salpicando visiblemente).
3. Coach camina 3 pasos arrastrando (casi sin sonido).
4. Coach pregunta: "¿Cuál de los dos es DRAG?"
5. Alumno identifica correctamente, retoma.

**Intervención contextual (Puro Surf o zonas con raya/fauna):**
- Coach explica la razón real: "Acá hay rayas. Si no arrastrás y pisás una, terminás en el hospital. El arrastre les avisa que vos estás llegando y se van."
- Esto convierte la regla técnica en regla de autopreservación. Adherencia sube significativamente.

## DOES THE REP COUNT?

- Si ERR-WB-015 aparece aislado y el alumno corrige en el momento → rep puede contar.
- Si ERR-WB-015 persiste durante todo el rep sin corrección → rep no cuenta.
- Si deriva en lesión (tropiezo, corte) → obviamente no cuenta y se activa protocolo de primeros auxilios.

## ADAPTATIONS

**Alumnos con limitación motora:** si arrastrar es mecánicamente doloroso (cadera, rodilla), se permite **"paso corto con pisada completa"** (pie se levanta mínimo, paso muy corto). Se pierde algo de awareness del fondo pero se gana estabilidad. Coach documenta adaptación.

**Niños muy pequeños:** algunos niños no pueden arrastrar efectivamente por biomecánica. Variante: coach camina junto al niño leyendo el fondo por él.

**Condiciones de corriente:** corriente fuerte hace el arrastre difícil. En esas condiciones no se hace White Belt entrada, se redirige sesión.

## RELATED ERRORS

- `ERR-WB-013` Rushed Entry (apuro produce no-arrastre como síntoma).
- `ERR-WB-016` Early Board Placement (alumno no arrastrando puede sentir que ya llegó "lejos" sin estar profundo).

## NOTE

Este error es técnicamente MEDIUM, pero en contextos específicos (Puro Surf, zonas con stingray) sube a HIGH situacional. Coach debe ajustar severidad según spot.

---

*TSS® Error DB · ERR-WB-015 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-004*

---

### ERR-WB-016_Early_Board_Placement

## ERR-WB-016 — EARLY BOARD PLACEMENT

**Parent step:** STP-004 Walk Out
**Belt:** White Belt
**Severity:** MEDIUM-HIGH
**Type:** Student-caused
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno coloca la tabla en el agua antes de llegar a profundidad suficiente para que la tabla flote libremente. La tabla toca fondo, se engancha, se inclina, o queda apoyada con la quilla/aletas en la arena.

Profundidad mínima correcta en White Belt: **muslo / cadera del alumno**. Esto garantiza que la tabla (típicamente softboard de 7'–9' con quillas de 4–8 cm) flote libre sin contacto con el fondo.

Indicadores observables:
- Tabla colocada con agua a la rodilla o menos.
- Tabla se ladea inmediatamente después de apoyarla (no flota plana).
- Aletas hacen surco en la arena.
- Alumno pierde agarre porque la tabla "se fue" torcida al primer contacto con agua.

## WHY IT HAPPENS

1. **Impaciencia (ERR-WB-013 amplificado):** alumno está apurado, quiere terminar el Walk Out, fuerza el PLACE antes de tiempo.
2. **Lectura incorrecta de profundidad:** alumno no monitorea el nivel del agua contra su propio cuerpo.
3. **Fatiga:** tabla pesada, alumno quiere soltarla lo antes posible.
4. **Miedo a la ola:** alumno quiere tener la tabla entre él y el agua rápidamente (lo que además genera ERR-WB-014).
5. **Coach no definió stopping depth:** el canon señala esto explícitamente como error de coach. Si coach no dice claramente "acá, muslo, flexionás y colocás", alumno improvisa.

## WHY IT MATTERS

**Daño al equipo:**
- Quillas (fins) se dañan al hacer contacto con arena/piedras. En softboards con fins de plástico, se rompen o se torcen.
- Bottom de la tabla se raya.
- En tablas de fibra o EPS, contacto con piedra puede generar ding estructural.

**Pérdida de control:**
- Tabla que toca fondo se inclina imprevisiblemente. Puede golpear al alumno.
- Transición a STP-005 (Put Board in Water) queda comprometida desde el inicio.
- Alumno pierde ancla de referencia postural.

**Cadena de errores siguientes:**
- PLACE mal ejecutado → alumno entra a STP-005 ya desordenado.
- La tabla mal posicionada en aguas someras puede ser movida por olas pequeñas y golpear al alumno.
- Alumno gasta energía recuperando control que nunca debió perder.

## HOW TO DETECT

**Visual (coach):**
- Nivel de agua contra el cuerpo del alumno al momento del PLACE.
- Si agua está bajo rodilla → **muy poco**, forzar espera.
- Si agua está entre rodilla y muslo → **marginal**, depende de tabla y aletas.
- Si agua está en muslo/cadera → **correcto** para White Belt softboard estándar.
- Si agua está en cintura o más → **más que suficiente**, también válido.

**Comportamiento de la tabla:**
- Tabla colocada flota plana, se mueve horizontalmente con el agua → correcto.
- Tabla colocada se tuerce, cabecea, o queda en ángulo → profundidad insuficiente, aleta tocando fondo.

## HOW TO CORRECT

**Intervención pre-PLACE (mejor caso, coach detecta antes):**

1. Coach ve al alumno bajar manos como intentando colocar con agua insuficiente.
2. Coach dice: **"Esperá. Más profundidad. Muslo mínimo."**
3. Alumno mantiene carry, camina 2-3 pasos más hacia adentro.
4. Alumno re-evalúa profundidad, ejecuta PLACE.

**Intervención post-PLACE (si ya colocó mal):**

1. Coach dice: **"Levantá. Muy poca agua."**
2. Alumno retoma tabla en carry.
3. Camina adentro hasta profundidad correcta.
4. Re-ejecuta PLACE.

**Intervención estructural (si el error persiste):**

- Coach define explícitamente en el briefing pre-drill: "Acá hasta el muslo, acá colocás. Antes, no."
- Coach puede marcar físicamente en el agua con una boya pequeña o señalar "acá es tu punto".
- Alumno verbaliza antes de cada rep: "Coloco cuando el agua llegue al muslo."

## COACH-CAUSED VARIANT

El canon input explícitamente identifica esto como error de coach frecuente:

> "Coach errors: not defining the stopping depth clearly."

Si ERR-WB-016 aparece repetidamente con un mismo coach → el problema no es el alumno, es el coach. Revisión de setup del drill.

## DOES THE REP COUNT?

- Si ERR-WB-016 se corrige pre-PLACE (coach detiene a tiempo) → rep puede contar si el PLACE final se ejecuta limpio.
- Si ERR-WB-016 se consuma (tabla toca fondo) → **rep NO cuenta**. El alumno debe levantar, caminar más adentro, retomar.
- Si ERR-WB-016 deriva en pérdida de control / tabla golpeando al alumno → rep no cuenta y coach revisa la secuencia completa.

## ADAPTATIONS

**Alumnos bajos (niños, adultos de baja estatura):** "muslo" es relativo. Coach ajusta: "acá, donde el agua toque tu pantalón corto / traje". Referencia al cuerpo del alumno, no a altura absoluta.

**Alumnos altos:** el muslo estará a profundidad mayor absoluta, pero la referencia es correcta. No ajustar.

**Tablas más cortas (niños con softboard de 6'):** quillas más bajas, profundidad mínima puede ser rodilla/muslo. Coach ajusta según equipo.

**Pendiente suave del fondo:** en spots donde la profundidad sube muy gradualmente (ciertos puntos de Puro Surf), el alumno debe caminar más metros antes de alcanzar muslo. Esto alarga el Walk Out pero no lo cambia.

**Pendiente brusca del fondo:** coach debe advertir al alumno: "en 2-3 pasos el fondo cae, prestá atención". Esto previene sorpresa y coloca un prompt para el PLACE correcto.

## RELATED ERRORS

- `ERR-WB-013` Rushed Entry (causa frecuente).
- `ERR-WB-014` Board Between Body and Wave (puede coexistir si alumno intenta "proteger" colocando la tabla antes).
- `ERR-WB-015` No Feet Drag (alumno que no arrastra pierde sensación de profundidad).

---

*TSS® Error DB · ERR-WB-016 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-004*$tss$
WHERE id = 'STP-004';

UPDATE lessons SET
  description_md = $tss$# STP-005 — PUT BOARD IN THE WATER

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
*IP of Marcelo Castellanos / Enkrateia · Tested & refined at Puro Surf*$tss$,
  drill_md = $tss$# DRL-WB-05 — WAIST-DEEP PLACEMENT DRILL

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
*IP of Marcelo Castellanos / Enkrateia · White Belt · Humility*$tss$,
  errors_md = $tss$### ERR-WB-017_Dropped_Board

## ERR-WB-017 — DROPPED BOARD

**Parent step:** STP-005 Put Board in the Water
**Belt:** White Belt
**Severity:** HIGH
**Type:** Student-caused
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno, en lugar de bajar la tabla al agua con ambas manos flexionando rodillas, la deja caer desde una altura mayor a 15-20 cm sobre la superficie. La tabla hace splash pronunciado, rebota, y pierde la posición plana de entrada.

Variantes observables:
- **Altura moderada (20-40 cm):** tabla cae plana, splash visible, rebote leve. Daño mínimo pero patrón instalado incorrecto.
- **Altura alta (40-70 cm):** tabla cae con fuerza, splash grande, rebote pronunciado, posible golpe en la tabla o en el alumno.
- **Versión lateral:** tabla cae torcida (no plana), aletas golpean agua primero.
- **Versión tiro:** alumno "lanza" la tabla hacia adelante en vez de bajarla, la tabla aterriza a 30-50 cm del cuerpo.

## WHY IT HAPPENS

1. **Fatiga muscular:** llevar una softboard larga durante Walk Out cansa. El alumno quiere terminar el peso cuanto antes.
2. **Prisa emocional:** alumno nervioso o ansioso por "empezar a surfear" corta el LOWER.
3. **Coach no demostró LOWER:** si la demo del coach no incluyó flexión de rodillas y tempo lento, el alumno improvisa.
4. **Subestimación del paso:** alumno piensa que "colocar la tabla" es trivial, no le dedica atención.
5. **Tabla percibida como "obstáculo":** alumno quiere liberar sus manos, no considera la tabla como equipo a cuidar.

## WHY IT MATTERS

**Daño al equipo:**
- Softboard fins golpean el fondo si el agua es marginal → quillas se tuercen, se rompen.
- Bottom de tabla se raya contra arena compactada.
- En tablas de fibra/EPS, impacto puede generar ding.

**Daño al alumno:**
- Altura alta + rebote → tabla puede golpear rodilla o espinilla del alumno.
- Splash grande puede salpicar cara, pérdida momentánea de visión.

**Patrón instalado:**
- Un "drop" repetido se convierte en hábito. El alumno replica el error por años.
- Efecto cascada: READY position comprometida, STP-006 arranca desde tabla mal posicionada.

**Interrupción de ritmo:**
- Rebote de tabla requiere 1-3 segundos de ajuste antes de pasar a READY.
- Rompe la secuencia DEPTH→PAUSE→LOWER→RELEASE→READY.

## HOW TO DETECT

**Visual (coach):** desde vista lateral, altura entre la base de la tabla y la superficie del agua al momento del release.
- ≤15 cm → correcto, LOWER ejecutado.
- 15-30 cm → marginal, corregir tempo.
- ≥30 cm → ERR-WB-017 activo.

**Auditivo:** sonido del impacto.
- "Plop" suave → correcto.
- "Splash" fuerte → error.

**Postural:** rodillas del alumno.
- Flexionadas ≥45° durante LOWER → correcto.
- Rectas o flexión mínima → drop pattern.

## HOW TO CORRECT

**Intervención inmediata:**
1. Coach dice: **"Más cerca del agua. Las rodillas trabajan."**
2. Alumno recupera la tabla.
3. Coach demuestra el LOWER correcto una vez más, con énfasis en flexión de rodillas.
4. Alumno repite el rep desde DEPTH.

**Intervención pedagógica (si persiste en 2+ reps):**
- Coach pregunta: "¿Por qué la soltaste desde ahí arriba?"
- Alumno verbaliza causa (fatiga, prisa, no entendí).
- Coach propone ajuste específico: "La tabla es parte de tu cuerpo mientras la lleves. La bajás como bajarías un bebé al agua. No la tirás, la depositás."

**Intervención estructural (si es patrón):**
- Drill específico pre-agua: en arena, alumno practica LOWER con la tabla bajando a la arena desde altura waist. 5-10 reps. Coach observa flexión de rodilla.
- Volver al agua cuando el patrón muscular esté instalado.

## COACH-SIDE CHECK

Antes de marcar el error como del alumno:

- ¿Yo demostré LOWER con flexión de rodilla clara y tempo lento?
- ¿Yo verbalicé LOWER como key word, con énfasis en "bajar" vs "soltar"?
- ¿Yo usé la palabra "soltá la tabla" en algún momento? (Esto instala el drop.)

Si sí → coach ajusta lenguaje antes de corregir al alumno.

## DOES THE REP COUNT?

- **ERR-WB-017 altura moderada:** rep NO cuenta pero sesión puede continuar. Alumno corrige en el siguiente rep.
- **ERR-WB-017 altura alta (con daño a tabla o al alumno):** rep no cuenta, coach detiene el drill, revisa equipo, chequea al alumno, retoma cuando todos los factores estén OK.
- **ERR-WB-017 persistente (3+ reps seguidos):** sesión no cuenta para certificación, drill pre-agua en arena requerido.

## RELATED ERRORS

- `ERR-WB-018` Let Go Completely (a veces coexiste: alumno drop + let go).
- `ERR-WB-019` Mixed Control Cues (a veces precede: alumno intenta orientar antes del LOWER, termina dropping por frustración).
- `ERR-WB-013` Rushed Entry (STP-004, puede ser precursor emocional).

---

*TSS® Error DB · ERR-WB-017 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-005*

---

### ERR-WB-018_Let_Go_Completely

## ERR-WB-018 — LET GO COMPLETELY

**Parent step:** STP-005 Put Board in the Water
**Belt:** White Belt
**Severity:** HIGH
**Type:** Student-caused
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

Tras colocar la tabla en el agua (LOWER ejecutado), el alumno suelta completamente la tabla — deja de tener contacto con el rail, la tabla queda sola en el agua. La corriente, el viento, o la siguiente onda se la llevan. Alumno corre/nada tras ella.

Indicadores observables:
- Ambas manos del alumno fuera de la tabla tras el LOWER.
- Tabla flotando a distancia creciente del alumno (10 cm → 50 cm → 2m según la condición).
- Alumno busca recuperar la tabla con pasos apurados o nado corto.
- Sesión interrumpida: 30 seg a 3 min perdidos en recuperación.

## WHY IT HAPPENS

1. **Mala lectura del paso:** alumno cree que "colocar" = "terminar con la tabla". No entiende que el control es continuo.
2. **Instinto de liberar manos:** tras el LOWER, manos están tensas. Instinto es relajar completamente.
3. **Coach no verbalizó RELEASE correctamente:** si el coach dijo "soltá la tabla" en lugar de "soltá el peso pero mantené el rail", el alumno interpreta literal.
4. **Subestimación del océano:** alumno en ambiente tranquilo no percibe corriente o viento. No sabe que el agua mueve la tabla incluso sin olas.
5. **Exceso de confianza:** alumno con experiencia de pool o lago cree que "la tabla se queda quieta". El océano no.

## WHY IT MATTERS

**Interrupción de sesión:**
- Recuperar tabla flotante consume energía y tiempo.
- Alumno sale del flujo mental instalado por STP-002 Warm Up.
- El ritmo de los 5 key words se rompe.

**Riesgo de colisión:**
- Tabla sin control puede golpear a otros bañistas, niños, surfers.
- En spots con crowd, una tabla suelta es peligro activo para terceros.
- Leash no siempre está puesto en White Belt (canon-dependent) — si no hay leash y la tabla se va, puede llegar a la orilla y golpear a alguien.

**Exposición a oleaje:**
- Tabla sin control frente a un whitewater entrante es proyectil.
- Puede retornar hacia el alumno con fuerza.

**Patrón doctrinal perdido:**
- La regla TSS "la tabla no queda sin contacto" se instala en este paso.
- Si el patrón no se instala aquí, todos los pasos siguientes lo heredan débil (STP-006, 007, 008 dependen de contacto permanente).

## HOW TO DETECT

**Visual:** tras el LOWER, coach verifica que al menos una mano del alumno permanezca en el rail durante los siguientes 5-10 segundos (transición a READY + permanencia en READY).

**Contexto:** si la tabla se mueve ≥30 cm del alumno sin que él la siga con la mano → ERR-WB-018 activo.

**Pregunta diagnóstica:** "¿Tu mano está en el rail ahora?" — si el alumno tiene que mirarse para responder, el hábito no está instalado.

## HOW TO CORRECT

**Intervención inmediata (en el rep):**
1. Coach dice: **"Mano en el rail. Siempre. La tabla no se va sola."**
2. Alumno recupera el contacto.
3. Coach puede tomar la tabla momentáneamente si se alejó mucho, devolvérsela al alumno.
4. Rep reinicia desde DEPTH.

**Intervención pedagógica (entre reps):**
- Coach pregunta: "¿Por qué la soltaste?"
- Alumno verbaliza (fatiga, inercia, pensé que ya estaba).
- Coach aclara: "La tabla está en el agua, pero el paso no termina ahí. Termina cuando vos decidís que termina. Y para decidirlo, tenés que estar tocándola."

**Intervención de lenguaje:**
- Si el coach usó palabras como "soltá" / "ya está" / "listo" → revisar. El lenguaje correcto es "soltá el peso, mantené el rail".
- Reforzar con la anchor phrase: **"The board asks for control."**

**Intervención estructural (si es patrón):**
- Drill complementario: "rail touch drill". El alumno sostiene la tabla en READY position durante 30 segundos. Coach cuenta en voz alta. Alumno se entrena a mantener contacto continuo.
- Se repite hasta que el alumno no tenga que "pensar" en mantener el rail.

## COACH-SIDE CHECK

- ¿Yo demostré RELEASE con una mano visible en el rail?
- ¿Yo verbalicé la diferencia entre "soltar peso" y "soltar contacto"?
- ¿Yo dije "listo" o "ya" prematuramente, implicando fin del paso?

Si alguna respuesta es sí → ajustar demo y lenguaje.

## DOES THE REP COUNT?

- **Una ocurrencia aislada corregida inmediatamente:** rep puede contar si el alumno recupera y ejecuta READY limpio.
- **Tabla se alejó más de 1.5m:** rep NO cuenta, demasiada interrupción.
- **Persistente (3+ reps):** sesión no cuenta para certificación, se aplica rail touch drill.

## RELATED ERRORS

- `ERR-WB-017` Dropped Board (puede coexistir: alumno drop + let go simultáneos).
- `ERR-WB-019` Mixed Control Cues (inverso: el alumno a veces suelta porque intenta hacer demasiado).

## DOCTRINAL NOTE

Este error introduce el principio **"contacto permanente"** que será explícito y crítico en STP-006 Control Your Board. Put Board in Water es donde el principio se instala; Control Your Board es donde se ejerce. Si ERR-WB-018 no se corrige aquí, STP-006 arranca desde posición débil.

---

*TSS® Error DB · ERR-WB-018 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-005*

---

### ERR-WB-019_Mixed_Control_Cues

## ERR-WB-019 — MIXED CONTROL CUES

**Parent step:** STP-005 Put Board in the Water
**Belt:** White Belt
**Severity:** MEDIUM
**Type:** Student-caused (coach-caused frecuente)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno, durante LOWER o RELEASE, empieza a "manejar" la tabla antes de completar el paso — intenta orientar la punta hacia la ola, posicionar la tabla para subirse, o aplicar maniobras que pertenecen a STP-006 Control Your Board.

Indicadores observables:
- Durante LOWER, alumno intenta girar la tabla en el aire.
- Durante RELEASE, alumno ya está empujando la tabla en dirección específica.
- Alumno intenta subir la tabla o prepararla para acción siguiente mientras aún está cerrando el RELEASE.
- Alumno verbaliza conceptos de STP-006 ("la tabla tiene que mirar hacia allá") cuando todavía está en STP-005.

## WHY IT HAPPENS

1. **Entusiasmo:** alumno ansioso por llegar a "surfear". Se salta pasos intermedios.
2. **Coach mezcló cues:** coach empezó a dar instrucciones de STP-006 antes de que STP-005 cerrara. Esto es el origen más común.
3. **Experiencia previa:** alumnos con algo de background asumen que pueden condensar pasos.
4. **Video influence:** alumno vio tutoriales genéricos de surf donde "colocar la tabla" y "controlarla" se presentan como un solo gesto.
5. **Prisa emocional:** alumno ansioso por empezar a pasar whitewater, no respeta la pausa entre pasos.

## WHY IT MATTERS (aunque no sea HIGH)

**Erosión del sistema:**
- TSS se define por modularidad: cada paso independiente. Si los pasos se mezclan, la certificación individual pierde sentido.
- Si el alumno no puede ejecutar STP-005 aislado, no puede diagnosticarse dónde falla más adelante.

**Pérdida de control real:**
- Mezclar controles típicamente degrada la calidad de ambos. El LOWER se hace peor porque la mente está en STP-006. El STP-006 empieza mal porque STP-005 no cerró.
- Efecto cascada en errores.

**Certificación comprometida:**
- Un alumno que mezcla cues técnicamente no ha demostrado STP-005. No puede certificarse aunque "parezca fluido".

**Dilución de IP TSS:**
- Si los coaches TSS aceptan "mezcla de cues" como fluidez, el sistema se diluye al nivel de tutoriales genéricos de surf. El valor diferencial de TSS (modularidad certificable) se pierde.

## HOW TO DETECT

**Visual:** alumno ejecutando dos patrones simultáneos.
- Manos del alumno: si están intentando bajar LOW + orientar al mismo tiempo → mezcla.
- Cuerpo del alumno: si está en postura de LOWER pero ojos en "próximo paso" → mezcla.

**Verbal:** alumno nombra keywords de STP-006 durante STP-005.

**Temporal:** el paso completo (DEPTH→READY) se ejecuta en <10 segundos cuando debería durar 15-30 → probable mezcla.

## HOW TO CORRECT

**Intervención inmediata:**
1. Coach dice: **"Una cosa a la vez. Primero soltás. Después controlás."**
2. Alumno pausa.
3. Coach verbaliza la separación: "Ahora estás en STP-005. Tu paso termina en READY. Después de READY, recién ahí pensás en STP-006."
4. Alumno completa el rep ejecutando solo los 5 key words de STP-005.

**Intervención pedagógica (si persiste):**
- Coach explica explícitamente la arquitectura modular de TSS: "Cada paso es una unidad. Si los mezclás, ninguno queda bien instalado. Y si tenés que corregir algo en 3 meses, no sabés de dónde viene."
- Coach puede usar analogía: "Es como leer. Una palabra, después la siguiente. Si las leés todas al mismo tiempo no entendés nada."

**Intervención estructural (si el coach mezcló):**
- Coach autorevisa: "¿Yo dije algo que implicara STP-006 mientras el alumno estaba en STP-005?"
- Protocolo: el coach NO menciona STP-006 hasta que el alumno esté estable en READY position.
- Lenguaje del coach entre pasos: pausa deliberada de 2-3 seg entre "READY" y primer cue de STP-006. Esto instala el beat entre pasos.

## COACH-SIDE CHECK

- ¿Yo separé verbalmente los pasos? ("Ahora STP-005. Después STP-006.")
- ¿Yo mencioné conceptos de STP-006 antes de que STP-005 cerrara?
- ¿Mi tempo fue demasiado rápido entre pasos?
- ¿Yo demostré los pasos aislados o los encadené visualmente sin diferenciación?

## DOES THE REP COUNT?

- **Mezcla leve (el alumno completa los 5 key words de STP-005 pero con distracción de STP-006):** rep puede contar si el resultado final es READY limpio.
- **Mezcla pronunciada (el alumno no completa RELEASE correctamente porque ya está en STP-006):** rep NO cuenta.
- **Patrón persistente (3+ reps):** coach debe separar los pasos explícitamente y ejecutar STP-005 aislado (sin encadenarlo a STP-006) hasta que el alumno consolide el cierre en READY.

## RELATED ERRORS

- `ERR-WB-018` Let Go Completely (a veces coexiste: alumno suelta para "pasar al siguiente paso").
- `ERR-WB-013` Rushed Entry (patrón de prisa que se extiende a STP-005).

## DOCTRINAL NOTE

Este error es menos peligroso físicamente que ERR-WB-017 o ERR-WB-018, pero es **pedagógicamente más serio** para la integridad del sistema TSS. Si se normaliza la mezcla de cues, TSS deja de ser un sistema modular certificable y se convierte en instrucción genérica. **La separación entre pasos es la condición misma de la IP TSS.**

Recomendación para el sistema: agregar en el Canon de Coach Certification una sección "Respect Step Boundaries" que use ERR-WB-019 como ejemplo fundacional.

---

*TSS® Error DB · ERR-WB-019 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-005*$tss$
WHERE id = 'STP-005';

UPDATE lessons SET
  description_md = $tss$# STP-006 — CONTROL YOUR BOARD

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-06 — TAIL & CENTER CONTROL DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-020_Wrong_Grip_Rails_or_Nose

## ERR-WB-020 — WRONG GRIP (RAILS OR NOSE)

**Parent step:** STP-006 Control Your Board
**Belt:** White Belt
**Severity:** MEDIUM
**Type:** Student-caused (coach-caused frecuente si demo fue débil)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno, al establecer control de la tabla en el agua, no usa TAIL + CENTER. En su lugar agarra:

- **Ambos rails:** manos en los bordes laterales de la tabla, tratando de controlar por los costados.
- **Nose + rail:** una mano en la punta delantera, otra en un rail.
- **Ambas cerca del nose:** manos juntas en el tercio frontal de la tabla.
- **Grip aleatorio:** manos cambian de posición cada rep, sin patrón claro.

Indicadores observables:
- Ninguna mano sobre el tail.
- Tabla no responde a intentos de PRESS (porque no hay punto de apalancamiento activo).
- Alumno pelea contra la tabla en lugar de pivotarla.
- Al intentar PIVOT, la tabla gira pero arrastrada por fuerza, no por leverage.

---

## WHY IT HAPPENS

1. **Instinto humano:** al tomar un objeto rectangular, el instinto es agarrarlo por los bordes laterales. Es lo que hacemos con bandejas, libros, cajas.
2. **Coach no demostró el porqué:** si el coach dijo "mano en el tail" sin mostrar QUÉ PASA con el tail vs QUÉ NO PASA con el rail, el alumno no entiende la mecánica y revierte al instinto.
3. **Video / tutoriales genéricos:** muchos tutoriales de surf muestran "agarrá la tabla firme" sin especificar mecánica de leverage. El alumno aplica esa instrucción difusa.
4. **Miedo a soltar:** alumno cree que "más puntos de contacto = más control". Intenta agarrar con 2 manos en zonas próximas por seguridad percibida.
5. **Fatiga muscular:** tras carga (STP-004) y placement (STP-005), las manos se adaptan a lo que es cómodo, no a lo que es correcto.

---

## WHY IT MATTERS

**Mecánica rota:**
- Sin TAIL, no hay apalancamiento. El alumno cree que "está controlando" pero la tabla no responde realmente a sus inputs.
- Sin CENTER, la tabla se bambolea. El alumno lo compensa con más fuerza, lo que aumenta la fatiga.
- El alumno aprende a "manejar" la tabla sin la mecánica — patrón que falla sistemáticamente en condiciones reales (whitewater, current, wind).

**Cascada a STP-007 y siguientes:**
- STP-007 Go Through Whitewater requiere TAIL control activo para absorber el impacto de la espuma. Sin TAIL instalado, el alumno pierde la tabla en la primera ola real.
- STP-008 Turn Around requiere PIVOT con leverage. Sin TAIL, el giro es fuerza bruta y falla cuando hay corriente.

**Dilución de IP TSS:**
- El grip correcto (TAIL + CENTER) es una de las especificidades técnicas de TSS. Si los coaches permiten grip aleatorio porque "el alumno se siente seguro", TSS deja de ser un sistema mecánicamente preciso y se convierte en instrucción genérica.

**Safety secundario:**
- Grip en nose mientras la tabla está al costado es una posición mecánicamente inestable. Ante una ola inesperada, la tabla se sale del control más fácilmente.

---

## HOW TO DETECT

**Visual (coach):**
- Desde vista lateral, ubicá las manos del alumno.
- Mano del tail debe estar sobre el tercio trasero de la tabla, dedos claramente sobre la cola.
- Mano del center debe estar entre el tercio medio y el tercio delantero.
- Si ambas manos están en la mitad delantera, o si alguna está sobre los rails → ERR-WB-020 activo.

**Prueba funcional:**
- Coach pide al alumno que aplique PRESS.
- Si nose de la tabla NO se eleva visiblemente → grip probablemente incorrecto (sin tail no hay leverage).
- Si el alumno tiene que "pensar" dónde presionar → grip no instalado.

**Prueba verbal:**
- Coach pregunta: "¿Cuál mano hace el PRESS?" — si alumno duda o muestra la mano del center, grip está mal instalado.

---

## HOW TO CORRECT

**Intervención inmediata:**
1. Coach dice: **"Mano acá. TAIL. Sentí la cola."** (apunta al tail físicamente).
2. Alumno reposiciona mano sobre el tail.
3. Coach dice: **"Otra mano acá. CENTER. No al frente. Al medio."**
4. Alumno reposiciona la segunda mano.
5. Coach pide: "Ahora PRESS. Apretá el tail."
6. Si el nose se eleva → el alumno siente la mecánica por primera vez. Ese momento es el aprendizaje real.

**Intervención pedagógica (si persiste):**
- Coach demuestra lado a lado:
  - Grip incorrecto (rails) → intenta PRESS → tabla no responde.
  - Grip correcto (TAIL + CENTER) → PRESS → nose se eleva.
- Alumno observa la diferencia visualmente y mecánicamente.
- Coach explica: **"La tabla no está diseñada para los rails. Está diseñada para el tail. Usar los rails es pelear con la tabla. Usar el tail es usarla."**

**Intervención estructural (drill complementario):**
- Drill en tierra: tabla apoyada en arena. Alumno practica el grip correcto sin presión de tiempo.
- Coach coloca la mano del alumno físicamente en TAIL y CENTER. Alumno siente la posición.
- 10 reps en tierra antes de volver al agua.
- Al volver al agua, el alumno llega con el patrón muscular correcto.

---

## COACH-SIDE CHECK

Antes de marcar el error como del alumno:

- ¿Yo demostré el grip correcto con close-up visible?
- ¿Yo mostré por qué los rails no funcionan (demo de comparación)?
- ¿Yo dije "agarrá" (vago) o "mano en el tail, mano en el centro" (específico)?
- ¿Yo permití variaciones aleatorias pensando que "se acomodan solas"?

Si alguna respuesta indica demo débil → ajustar demo antes de corregir al alumno.

---

## DOES THE REP COUNT?

- **Grip incorrecto pero alumno corrige solo sin intervención:** rep puede contar si el resultado final es control estable.
- **Coach tuvo que corregir el grip:** rep NO cuenta. Se reinicia desde TAIL.
- **Grip en rails persistente (3+ reps):** sesión NO cuenta para certificación. Drill en tierra obligatorio.

---

## RELATED ERRORS

- `ERR-WB-021` Board Drifting In Front (a veces coexiste: grip incorrecto → pérdida de control → tabla drifts).
- `ERR-WB-022` Weak Tail Pressure (inevitable si no hay mano en tail).
- `ERR-WB-018` Let Go Completely (STP-005 parent: puede preceder si el alumno no instaló contacto permanente).

---

## DOCTRINAL NOTE

Este error no es sólo un "mal hábito" — es un malentendido de la mecánica de la tabla. Corregirlo no es imponer una regla; es revelar un diseño. El alumno que entiende la mecánica nunca vuelve al grip en rails, porque ya sabe que no funciona.

**TSS Principle:** El grip TAIL + CENTER no es "la manera TSS de hacerlo". Es la manera en que la tabla está diseñada para funcionar. TSS sólo lo nombra y lo certifica.

---

*TSS® Error DB · ERR-WB-020 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-006*

---

### ERR-WB-021_Board_Drifting_In_Front

## ERR-WB-021 — BOARD DRIFTING IN FRONT

**Parent step:** STP-006 Control Your Board
**Belt:** White Belt
**Severity:** HIGH
**Type:** Student-caused (frecuentemente multi-causal)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

La tabla del alumno, en lugar de permanecer al costado del cuerpo (SIDE), se desplaza hacia adelante. La tabla queda total o parcialmente entre el alumno y la ola/whitewater entrante.

Variantes observables:
- **Drift leve (tabla 15-30° hacia el frente):** nose de la tabla empieza a orientarse hacia adelante, cola todavía al costado.
- **Drift pronunciado (tabla perpendicular al cuerpo):** tabla atravesada frente al alumno, cola hacia un lado, nose hacia el otro. Posición de máximo riesgo.
- **Drift por empuje:** ola pequeña empuja el nose hacia el alumno, alumno no ajusta y la tabla queda entre su cuerpo y la siguiente ola.
- **Drift por distracción:** alumno mira atrás / habla con coach / mira la ola y suelta la posición SIDE sin darse cuenta.

---

## WHY IT HAPPENS

1. **Grip incorrecto (ver ERR-WB-020):** sin TAIL + CENTER, la tabla no tiene anclaje mecánico al costado. Cualquier fuerza externa (ola, corriente) la desplaza.
2. **Distracción visual:** alumno mira algo (otro surfer, una ola que se acerca, coach) y suelta la conciencia del SIDE.
3. **Ausencia de PRESS activo:** la tabla en el agua flota libre. Si no hay presión descendente en el tail, el nose "navega" según corriente o viento.
4. **Corriente/viento externo:** condiciones empujan la tabla hacia adelante. Alumno no compensa con reposicionamiento.
5. **Fatiga + relajación:** alumno ya ejecutó STP-004 y STP-005, descansa mentalmente en STP-006 pensando que "es fácil". Suelta la tensión postural.

---

## WHY IT MATTERS

**HARD-LINE SAFETY (conecta con ERR-WB-014):**

Este error entra directamente en el dominio de la **hard-line rule** de STP-004 Walk Out (ERR-WB-014: "tabla entre cuerpo y ola"). En STP-006 es donde la hard-line rule se hace visible por primera vez dentro del agua. Si el alumno no tiene SIDE instalado, expone el cuerpo a un proyectil cuando llegue la siguiente ola.

**Riesgo físico directo:**
- Tabla entre cuerpo y foam: el foam golpea la tabla, la tabla golpea al alumno (nose al pecho, rails a la cara, aletas a las piernas).
- Softboards son más seguras pero NO inofensivas. Una softboard 8'0" empujada por whitewater tiene fuerza suficiente para romper dientes o dañar costillas.
- Es una de las dos principales causas de lesiones en beginners globalmente.

**Pérdida de control progresiva:**
- Una tabla al frente no se recupera fácilmente con grip correcto — el alumno tiene que reposicionar TODO: tail, center, y side.
- Este reposicionamiento consume 3-10 segundos durante los cuales el alumno está expuesto.

**Ritmo de sesión roto:**
- Cada vez que la tabla drifts al frente, el coach debe detener el progreso y recentrar.
- El alumno no consolida STP-006 porque gasta energía corrigiendo position en lugar de instalando TAIL/CENTER/PRESS/PIVOT.

**Instalación débil de awareness:**
- Si el alumno no siente la diferencia entre SIDE y FRONT en este paso, no va a sentirla en STP-007 (whitewater) donde es aún más crítico.

---

## HOW TO DETECT

**Visual (coach):**
- Trazá una línea imaginaria del cuerpo del alumno hacia la ola.
- Si la tabla cruza esa línea en cualquier momento → ERR-WB-021 activo.
- Observación continua: cada 3-5 segundos verificá la relación cuerpo-tabla-ola.

**Postural:**
- Alumno en SIDE correcto: cuerpo ligeramente girado, tabla paralela al costado del cuerpo.
- Alumno en drift: cuerpo recto mirando al mar, tabla al frente sin ajuste postural.

**Temporal:**
- Si el alumno pasa >2 segundos sin ajustar la tabla en presencia de corriente o viento → awareness no instalado.

**Verbal:**
- Coach pregunta: "¿Dónde está tu tabla ahora?" — si el alumno responde "al costado" pero la tabla está al frente, conciencia espacial no instalada.

---

## HOW TO CORRECT

**Intervención inmediata:**
1. Coach dice: **"SIDE. Al costado. Ahora."**
2. Alumno reposiciona: uso de PRESS + PIVOT para devolver la tabla al costado.
3. Si el alumno no puede reposicionarla rápido, coach intervine físicamente.
4. Coach recuerda: **"Nunca entre tu cuerpo y la ola. Nunca."**

**Intervención pedagógica (si es patrón):**
- Coach explica la hard-line rule explícitamente: *"Esta regla no es una sugerencia. Es la diferencia entre una sesión de surf y una visita al hospital."*
- Coach puede mostrar video de ejemplos de lesiones (si disponible en canon TSS) para que el alumno entienda la consecuencia real.
- Alumno verbaliza: *"La tabla al costado. Nunca al frente."*

**Intervención estructural (si es patrón severo):**
- Drill de awareness: coach pregunta cada 10 segundos "¿dónde está tu tabla?". Alumno debe responder sin mirar.
- Drill de reposicionamiento: coach crea condiciones controladas (empuja levemente la tabla al frente), alumno practica PIVOT + PRESS para devolverla a SIDE en <3 segundos.
- Sesión no avanza a STP-007 hasta que awareness SIDE esté sólido.

**Intervención de contexto:**
- Si es por corriente/viento, coach explica: *"El agua siempre mueve la tabla. Si no estás presionando, la tabla se va. PRESS constante."*
- Si es por distracción, coach sugiere: *"Puedo esperar que termines de mirar. Pero no la soltés. Control primero, mirada después."*

---

## COACH-SIDE CHECK

- ¿Yo verbalicé SIDE como key word explícito o sólo dije "mantenela acá"?
- ¿Yo mostré la conexión con la hard-line rule (ERR-WB-014)?
- ¿Yo permití drift leve pensando que "se corrige solo"?
- ¿Yo dejé al alumno distraerse sin corregirle la posición?

---

## DOES THE REP COUNT?

- **Drift leve corregido inmediatamente por el alumno:** rep puede contar si el cierre es en SIDE.
- **Drift pronunciado (tabla perpendicular o al frente real):** rep NO cuenta. Rep se reinicia.
- **Drift entre cuerpo y ola entrante (activación de la hard-line rule):** **sesión NO cuenta para certificación**. La hard-line rule se invalida aunque el resto de la ejecución sea técnicamente correcta.

---

## RELATED ERRORS

- **`ERR-WB-014`** Board Between Body and Wave (STP-004 hard-line rule parent — se activa aquí).
- `ERR-WB-020` Wrong Grip (causa mecánica frecuente del drift).
- `ERR-WB-022` Weak Tail Pressure (sin PRESS, la tabla navega sola).

---

## DOCTRINAL NOTE

Este error es donde la hard-line rule de Walk Out (ERR-WB-014) se manifiesta por primera vez en el agua. En STP-004, el alumno aprende la regla en contexto de caminar. En STP-006, la regla se convierte en relación continua con la tabla flotando. Un alumno que certifica STP-006 con drifts persistentes NO puede certificar White Belt — aunque haya ejecutado los otros pasos perfectamente.

**TSS Principle:** Control is spatial awareness made permanent. Si el alumno tiene que pensar dónde está la tabla, todavía no la controla. Cuando la tabla está donde debe estar sin que el alumno lo piense, recién ahí está instalado STP-006.

---

*TSS® Error DB · ERR-WB-021 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-006*

---

### ERR-WB-022_Weak_Tail_Pressure

## ERR-WB-022 — WEAK TAIL PRESSURE

**Parent step:** STP-006 Control Your Board
**Belt:** White Belt
**Severity:** MEDIUM
**Type:** Student-caused (technique / understanding)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno tiene la mano en el TAIL (grip correcto) pero la presión que aplica es insuficiente o ausente. La tabla no responde: el nose no se eleva, la tabla no pivota, el alumno no siente el apalancamiento.

Variantes observables:
- **PRESS ausente:** alumno tiene mano en tail pero no aplica fuerza descendente. Tabla flota sin ajuste.
- **PRESS intermitente:** alumno aplica presión sólo al intentar PIVOT, y la suelta entre movimientos. La tabla "flota libre" entre presiones.
- **PRESS con mano incorrecta:** alumno aplica fuerza con la mano del center (zona sin leverage) y no entiende por qué la tabla no responde.
- **PRESS simulado:** alumno dice "PRESS" pero la mano no se mueve. Está verbalizando sin ejecutar.

Indicadores observables:
- Nose de la tabla flota al mismo nivel que el resto de la tabla (no hay elevación).
- Cuando el alumno intenta PIVOT, la tabla "resiste" porque no hay leverage activo.
- El alumno hace PIVOT con fuerza bruta de brazos en lugar de con PRESS mecánico.

---

## WHY IT HAPPENS

1. **No entendió la mecánica:** alumno memorizó "mano en tail" pero no comprendió que la mano debe PRESIONAR. Reproduce la posición sin la función.
2. **Coach no demostró nose-lift:** si el coach dijo "poné presión" sin MOSTRAR el nose elevándose como consecuencia, el alumno no tiene referencia visual de éxito.
3. **Miedo a romper la tabla:** alumno percibe que "apretar fuerte" puede dañar equipo ajeno. Aplica presión mínima.
4. **Fatiga + economía muscular:** tras STP-004 y STP-005, el alumno ahorra energía. PRESS requiere músculos del brazo + core.
5. **Creencia falsa:** alumno piensa que "la tabla flota sola" y que el PRESS es decorativo.
6. **Distracción de objetivo:** alumno enfocado en el PIVOT (el output) y no en el PRESS (el input). No conecta causa-efecto.

---

## WHY IT MATTERS

**Mecánica rota:**
- Sin PRESS real, la tabla no pivota por apalancamiento. El alumno aprende a "empujarla" en lugar de "pivotarla". Son dos mecánicas diferentes.
- El alumno desarrolla un "falso positivo": cree que controla la tabla porque logra moverla, cuando en realidad la está arrastrando con fuerza bruta.

**Falla bajo condiciones reales:**
- En agua plana, fuerza bruta parece funcionar. En whitewater (STP-007), la fuerza bruta falla: el flujo del agua es más fuerte que los brazos del alumno. Solo el leverage mecánico funciona.
- Alumno sin PRESS instalado pierde la tabla al primer whitewater real.

**Consolidación de hábito incorrecto:**
- Si el alumno ejecuta 10 reps de PIVOT con fuerza bruta, no aprendió STP-006 — aprendió un workaround. La certificación se vuelve frágil.
- Desinstalar este hábito en Yellow Belt es más costoso que instalarlo correcto en White Belt.

**Cascada a STP-007+:**
- STP-007 Go Through Whitewater requiere PRESS sostenido para estabilizar la tabla frente al impacto de la espuma.
- STP-008 Turn Around requiere PRESS + PIVOT coordinados para girar 180° con control.
- Sin PRESS, estos pasos fallan mecánicamente.

**Dilución de IP TSS:**
- El PRESS como key word es parte de la especificidad TSS. Si se permite ejecución sin PRESS real, TSS pierde su precisión técnica y se parece a cualquier otra escuela.

---

## HOW TO DETECT

**Visual:**
- Observá el nose de la tabla.
- Alumno aplica PRESS correcto → nose se eleva 2-5 cm visible.
- Alumno aplica PRESS débil → nose no se mueve, o se mueve <1 cm.

**Táctil (coach):**
- Coach apoya mano en el tail del alumno.
- Debe sentir que la tabla está firmemente presionada hacia abajo.
- Si la tabla "cede" fácilmente al toque del coach → PRESS insuficiente.

**Funcional:**
- Pedile al alumno que haga PIVOT.
- Si el PIVOT es fluido con nose elevado → PRESS bien.
- Si el PIVOT requiere fuerza visible de los brazos y la tabla "resiste" → PRESS insuficiente o ausente.

**Verbal:**
- Preguntá: "¿Dónde sentís la presión?" — respuesta correcta: "en la mano del tail, empujando hacia abajo".
- Respuesta incorrecta o dudosa: "no sé", "en los brazos", "en la tabla".

---

## HOW TO CORRECT

**Intervención inmediata:**
1. Coach dice: **"PRESS real. Apretá. Mirá el nose."**
2. Alumno aplica presión más fuerte.
3. Coach señala: **"¿Ves? El nose sube. Eso es la palanca."**
4. Alumno conecta sensación de mano con efecto visual.

**Intervención pedagógica (si persiste):**
- Coach demuestra lado a lado:
  - Demo A: PRESS ausente → intenta PIVOT → tabla resiste, giro feo.
  - Demo B: PRESS activo → PIVOT → tabla gira limpia con nose elevado.
- Alumno observa la diferencia y replica.
- Coach explica: **"La tabla es una palanca. El tail es el fulcro. Tu mano es la fuerza. Sin fuerza, no hay palanca. Sin palanca, no hay control."**

**Intervención kinética (si el alumno no siente la fuerza):**
- Coach pone su mano sobre la mano del alumno en el tail.
- Coach empuja hacia abajo junto con el alumno.
- Alumno siente la cantidad de fuerza necesaria.
- Repite sin coach.

**Intervención estructural:**
- Drill de PRESS aislado: alumno sostiene la tabla en SIDE + TAIL + CENTER. Coach cuenta "1...2...3...PRESS" y alumno mantiene PRESS 3 segundos. Se repite 10 veces.
- Objetivo: instalar el músculo y la sensación, separado del PIVOT.

---

## COACH-SIDE CHECK

- ¿Yo demostré el nose-lift visible como indicador de PRESS correcto?
- ¿Yo dije "presioná" o "apretá fuerte y mirá el nose"?
- ¿Yo permití PIVOT con fuerza bruta pensando que "el control está ahí"?
- ¿Yo verifiqué PRESS cada rep o sólo al inicio?

---

## DOES THE REP COUNT?

- **PRESS débil pero PIVOT logrado con fuerza bruta:** rep NO cuenta. Mecánica incorrecta, aunque el output parezca OK.
- **PRESS aplicado tras corrección del coach:** rep puede contar si el alumno integra el PRESS en los siguientes reps sin recordatorio.
- **PRESS ausente persistente (3+ reps):** drill de PRESS aislado obligatorio antes de continuar.

---

## RELATED ERRORS

- `ERR-WB-020` Wrong Grip (si la mano no está en tail, PRESS es imposible por definición).
- `ERR-WB-021` Board Drifting In Front (sin PRESS, la tabla drifts con corriente).

---

## DOCTRINAL NOTE

Este error no compromete safety directamente (como ERR-WB-021), pero compromete la **precisión técnica** del sistema TSS. La diferencia entre TSS y escuelas genéricas es el nivel de detalle mecánico instalado en White Belt. Permitir PRESS débil diluye esa especificidad.

**TSS Principle:** Control is the difference between moving the board and operating the board. Moving the board se hace con fuerza. Operating the board se hace con leverage. TSS enseña operating, no moving.

---

*TSS® Error DB · ERR-WB-022 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-006*$tss$
WHERE id = 'STP-006';

UPDATE lessons SET
  description_md = $tss$# STP-007 — GO THROUGH WHITEWATER STANDING

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-07 — WHITEWATER PASSAGE DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-023_Poor_Alignment

## ERR-WB-023 — POOR ALIGNMENT

**Parent step:** STP-007 Go Through Whitewater Standing
**Belt:** White Belt
**Severity:** HIGH
**Type:** Student-caused (coach-caused if demo was weak)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno enfrenta la espuma con la tabla **no alineada** perpendicularmente al frente de la espuma. La tabla está lateral, angulada, o torcida respecto a la dirección del agua entrante.

Variantes observables:
- **Ligeramente torcida (15-30°):** nose apunta al costado, no directo a la espuma.
- **Perpendicular a la espuma (90°):** tabla atravesada, rails de frente a la espuma. Posición de máximo riesgo.
- **Angulada hacia atrás:** tabla apuntando atrás de la espuma (alumno confundido con dirección).
- **Nose bajo pero alineado:** alineación OK pero PRESS/LIFT inexistente (cruza con ERR-WB-024).

Indicador específico de ERR-WB-023: **la línea cuerpo-tabla NO es paralela a la dirección de la espuma**.

---

## WHY IT HAPPENS

1. **Lectura de ola insuficiente:** alumno no identifica la dirección exacta de la espuma antes de que llegue. Asume que "vendrá de ahí" sin verificar.
2. **Coach no definió "straight" claramente:** si el coach dijo "apuntá al mar" sin precisar "perpendicular al frente de la espuma entrante", el alumno aproxima.
3. **Distracción durante WAIT:** alumno pierde la alineación entre ALIGN y PRESS porque se mueve, ajusta, o mira.
4. **Corriente lateral:** la corriente desplaza la tabla mientras el alumno espera. Sin corrección, la tabla queda desalineada cuando la espuma llega.
5. **Miedo / evasión:** alumno subconscientemente gira la tabla para "no recibir" el impacto — resultado paradójico: la espuma lo golpea peor.

---

## WHY IT MATTERS

**Mecánica destruida:**
- Una tabla alineada correcto: la espuma empuja de frente, el PRESS levanta el nose, la espuma pasa por debajo.
- Una tabla lateral: la espuma golpea los rails, los rails actúan como vela, la tabla es arrancada violentamente.
- Sin alineación correcta, el PRESS y el LIFT no funcionan — la mecánica no tiene punto de aplicación.

**Safety crítico:**
- Tabla arrancada lateralmente vuela hacia el alumno o hacia otros surfistas.
- Softboard 8'0" arrancada por espuma tiene fuerza suficiente para dañar cara, dientes, ojos.
- Leash mitiga pero no elimina: la tabla todavía puede volver al alumno en trayectoria impredecible.

**Instalación de patrón incorrecto:**
- Si el alumno pasa espumas con mala alineación y "sobrevive" por suerte, aprende que la alineación es opcional. Patrón falla cuando las condiciones suben.
- La diferencia entre "sobrevivir una espuma" y "pasar una espuma con control" se define acá.

**Cascada a siguientes pasos:**
- STP-008 Turn Around requiere partir desde alineación conocida. Sin STP-007 sólido, el alumno no sabe desde dónde gira.
- STP-011+ aligned with whitewater extiende este principio. Sin STP-007 instalado, paddle para catch whitewater falla.

---

## HOW TO DETECT

**Visual (coach):**
- Trazá una línea desde el punto donde rompe la espuma hasta el alumno.
- La tabla debe estar paralela a esa línea, con el nose apuntando a la espuma.
- Si la tabla está fuera de esa línea → ERR-WB-023 activo.

**Pre-momento:**
- Observá al alumno durante WAIT. Si está quieto en ALIGN correcto → probable éxito.
- Si está ajustando, moviéndose, o mirando hacia otro lado → alineación probablemente se perderá.

**Durante PASS:**
- Espuma cruza por debajo de la tabla → alineación OK.
- Espuma golpea rails (sonido de slap, tabla se sacude lateralmente) → ERR-WB-023 activo.

**Post-passage:**
- Si la tabla terminó desplazada lateralmente o giró durante el passage, la alineación era marginal.

---

## HOW TO CORRECT

**Intervención inmediata:**
1. Coach dice: **"ALIGN. Nose recto. Hacia la espuma. Así."** (señala la dirección con el brazo extendido).
2. Alumno reorienta.
3. Si hay otra espuma entrante, alumno ejecuta el rep completo con la alineación nueva.
4. Si no, alumno reinicia desde BEAT 1 con próxima espuma.

**Intervención pedagógica (si persiste):**
- Coach se para al lado del alumno y apunta con su propio brazo la dirección correcta para CADA espuma durante 3-5 reps.
- Alumno aprende a "leer" la dirección siguiendo el brazo del coach.
- Progresivamente, el coach deja de apuntar y el alumno identifica solo.

**Intervención kinética:**
- Coach físicamente rota la tabla del alumno para mostrar "straight".
- Alumno siente la posición correcta.
- Después repite sin intervención.

**Intervención estructural (si es patrón):**
- Drill sin espuma: alumno se para en waist-deep, coach señala un punto en la costa. Alumno ALINEA la tabla hacia ese punto rápidamente. 10 reps.
- Instala la mecánica de "orientar rápido" sin la presión de la espuma.
- Después vuelve a STP-007 con espuma real.

**Intervención de contexto:**
- Si la alineación falla por corriente, coach explica: *"La corriente va a querer mover tu tabla. Mientras esperás, la mano del tail trabaja para mantener la alineación. Nunca se relaja."*

---

## COACH-SIDE CHECK

Antes de marcar el error como del alumno:

- ¿Yo definí "straight" con referencia visual clara (perpendicular al frente de la espuma)?
- ¿Yo demostré la alineación con close-up antes de que el alumno ejecute?
- ¿Yo elegí una espuma con frente claro y no caótica para los primeros reps?
- ¿Yo consideré la corriente lateral que está desplazando la tabla del alumno?

Si alguna respuesta indica demo débil → ajustar antes de corregir al alumno.

---

## DOES THE REP COUNT?

- **Alineación marginal (15-20°) pero la espuma pasó sin arrancar la tabla:** rep puede contar si el cierre fue en SIDE con control.
- **Alineación incorrecta (≥30°) y la espuma golpeó los rails:** rep NO cuenta. Se reinicia.
- **Alineación perpendicular (90°) con tabla arrancada:** rep NO cuenta + ERR-WB-025 probable + coach revisa protocolo.
- **Patrón persistente (3+ reps con alineación incorrecta):** sesión NO cuenta, drill sin espuma obligatorio.

---

## RELATED ERRORS

- `ERR-WB-024` Nose Too Low / Bad Timing (a menudo coexiste: mala alineación + mal timing = fracaso total).
- `ERR-WB-025` Board Ripped Away (consecuencia directa de alineación mala bajo espuma con punch).
- `ERR-WB-014` Hard-Line Rule (si la tabla queda entre cuerpo y espuma post-arranque).

---

## DOCTRINAL NOTE

La alineación en STP-007 es el primer momento donde el alumno debe **LEER el océano** (no solo operar equipamiento). Hasta STP-006, el alumno operaba cosas estáticas. En STP-007, el alumno debe identificar una variable externa (dirección de la espuma) y orientarse activamente hacia ella.

**TSS Principle:** El surfista se alinea con el océano, no contra él. Alineación no es dirección impuesta — es lectura correcta.

---

*TSS® Error DB · ERR-WB-023 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-007*

---

### ERR-WB-024_Nose_Too_Low_Bad_Timing

## ERR-WB-024 — NOSE TOO LOW / BAD TIMING

**Parent step:** STP-007 Go Through Whitewater Standing
**Belt:** White Belt
**Severity:** HIGH
**Type:** Student-caused (multi-causal: mechanics + timing)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

En el momento en que la espuma llega a la tabla, el nose NO está suficientemente elevado. La espuma golpea la tabla de frente (nose, front rails, front third) en lugar de pasar por debajo.

Variantes observables:
- **PRESS demasiado temprano:** alumno hace PRESS cuando la espuma está a 2-3 m. Para cuando la espuma llega, el alumno ya bajó el brazo (fatiga) o soltó la tensión. Nose bajo en el momento crítico.
- **PRESS demasiado tarde:** alumno hace PRESS cuando la espuma ya está sobre la tabla. El nose empieza a subir pero la espuma ya impactó.
- **PRESS insuficiente:** timing OK pero fuerza inadecuada. Nose sube 5-10 cm en lugar de 15-30 cm. No alcanza para pasar la espuma.
- **Brazo flexionado en lugar de extendido:** menos leverage. Mismo esfuerzo = menos LIFT.
- **Combinación:** timing borderline + PRESS débil = fracaso compuesto.

---

## WHY IT HAPPENS

1. **Miedo + anticipación:** alumno se apura al ver la espuma. Hace PRESS defensivo antes de tiempo. Pierde la tensión.
2. **Reacción tardía:** alumno no identifica la distancia correcta (1-1.5m) y espera demasiado. PRESS sin tiempo de LIFT.
3. **No entendió la mecánica del brazo:** alumno presiona con la muñeca en lugar de con todo el brazo extendido. Físicamente no puede generar leverage suficiente.
4. **Fatiga acumulada:** tras varios reps, el brazo del tail pierde fuerza. El PRESS "actual" es más débil que el de rep 1.
5. **Coach no demostró timing visible:** "un metro" es difícil sin referencia. Si el coach no demostró cuándo exactamente PRESS, el alumno estima mal.
6. **Miedo al agua en la cara:** alumno baja la cabeza o cierra los ojos al momento del LIFT. El reflejo defensivo interrumpe la mecánica.

---

## WHY IT MATTERS

**Consecuencia mecánica directa:**
- Espuma golpea la tabla de frente con fuerza entera.
- Tabla recibe impacto desbalanceado: nose para abajo, cola retrocede.
- Alumno pierde tensión en TAIL + CENTER por el impacto.
- ERR-WB-025 (Board Ripped Away) frecuentemente sigue.

**Seguridad:**
- Impacto frontal hace rebotar la tabla hacia atrás (hacia el alumno).
- Nose puede golpear cara / pecho del alumno.
- Agua en cara → alumno cierra ojos → pierde awareness espacial temporal.

**Patrón de aprendizaje falso:**
- Si el alumno "sobrevive" varios reps con nose bajo por suerte (espumas débiles), aprende que "la mecánica no importa tanto". Cuando las condiciones suben, falla sistemáticamente.

**Cascada a Yellow Belt y siguientes:**
- Yellow Belt introduce duck diving y paddle para escape. Ambos requieren timing y mecánica finas de PRESS. Un alumno con ERR-WB-024 instalado en White Belt falla directo en Yellow.

**Dilución de IP TSS:**
- El beat "WAIT → PRESS → LIFT" es una coreografía temporal específica de TSS. Si se ejecuta mal sistemáticamente, se convierte en "push when the foam comes" — lo mismo que cualquier tutorial genérico.

---

## HOW TO DETECT

**Visual del nose:**
- En el momento preciso del impacto de la espuma, ¿a qué altura está el nose?
- 15-30 cm sobre la espuma → correcto.
- 0-10 cm sobre la espuma → borderline / insuficiente.
- Nose al nivel de la espuma o por debajo → ERR-WB-024 activo.

**Timing:**
- Observá cuándo el alumno hace PRESS.
- PRESS cuando la espuma está a 1-1.5m → correcto.
- PRESS cuando la espuma está a >2m → temprano.
- PRESS cuando la espuma está encima → tarde.

**Brazo del tail:**
- Extendido y firme → correcto.
- Flexionado o relajado → PRESS mecánicamente débil.

**Post-impacto:**
- Tabla con nose bajo: se hunde, el alumno sufre el impacto entero.
- Tabla con nose alto: la tabla "cabalga" la espuma, sale sin problema.

**Audible:**
- "Slap" sordo en la parte frontal de la tabla → impacto frontal, nose bajo.
- "Swoosh" de agua fluyendo → espuma pasando por debajo, LIFT correcto.

---

## HOW TO CORRECT

**Intervención inmediata (timing):**
1. Coach cuenta en voz alta las distancias: "tres metros... dos metros... uno y medio... ¡PRESS!"
2. Alumno sincroniza con el conteo del coach.
3. Después de 3-5 reps guiados, coach deja de contar y alumno estima solo.

**Intervención inmediata (mecánica del brazo):**
1. Coach dice: **"Brazo entero. Estirado. Empujá con el hombro, no con la muñeca."**
2. Alumno extiende.
3. Coach verifica visualmente que el brazo esté recto al momento de PRESS.

**Intervención pedagógica (si persiste):**
- Coach demuestra lado a lado:
  - Demo A: PRESS tarde → nose bajo → espuma golpea nose.
  - Demo B: PRESS a tiempo → nose alto → espuma pasa por debajo.
- Alumno observa y replica.
- Coach explica: **"La espuma no espera. Pero la mecánica sí te avisa. Si tu brazo está estirado y tu peso en el tail antes de que la espuma llegue, el nose ya está arriba."**

**Intervención kinética:**
- Coach simula espuma con la mano en el nose: "Cuando yo te toque el nose, significa que la espuma está a un metro."
- Alumno hace PRESS al contacto del coach.
- Instala el gatillo temporal sin variabilidad del océano.

**Intervención estructural (si es patrón):**
- Drill sin espuma: alumno practica el PRESS + LIFT estático. Coach cuenta "3, 2, 1, PRESS". Alumno mantiene LIFT 3 segundos visible. 10 reps.
- Después vuelve a STP-007 con espuma real, timing ya calibrado.

**Intervención de fatiga:**
- Si el alumno está fatigado, coach corta la sesión. No se aprende bajo fatiga; se instalan malos hábitos.
- Descanso, agua, y retomar con 2-3 reps más limpios.

---

## COACH-SIDE CHECK

- ¿Yo demostré el PRESS a la distancia correcta (1-1.5m de la espuma)?
- ¿Yo expliqué la diferencia entre "brazo extendido" y "brazo flexionado"?
- ¿Yo permití que el alumno ejecute con fatiga visible (patrón mal instalado bajo fatiga)?
- ¿Yo seleccioné espumas con tempo predecible para los primeros reps?

---

## DOES THE REP COUNT?

- **Nose marginalmente bajo pero la espuma pasó sin arrancar la tabla:** rep puede contar si el control post-passage fue OK.
- **Nose claramente bajo, tabla recibió impacto frontal:** rep NO cuenta. Se reinicia.
- **PRESS no ejecutado:** rep NO cuenta — no hay nada que evaluar, no ejecutó el beat.
- **Patrón persistente (3+ reps):** sesión NO cuenta, drill estático de PRESS + LIFT obligatorio.

---

## RELATED ERRORS

- `ERR-WB-023` Poor Alignment (si coexiste, fracaso compuesto).
- `ERR-WB-025` Board Ripped Away (consecuencia directa cuando la espuma tiene punch).
- `ERR-WB-022` Weak Tail Pressure (parent mechanic: si PRESS no estaba instalado en STP-006, falla acá bajo load).

---

## DOCTRINAL NOTE

Este error es donde el alumno descubre que el tiempo del océano no es negociable. Puede compensar fuerza con técnica (brazo extendido + core), pero no puede compensar timing con nada. El timing es información: el alumno LEE la espuma y sincroniza. Si no lee, falla.

**TSS Principle:** Mechanics + timing = control. Skip one, and the ocean wins.

---

*TSS® Error DB · ERR-WB-024 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-007*

---

### ERR-WB-025_Board_Ripped_Away

## ERR-WB-025 — BOARD RIPPED AWAY

**Parent step:** STP-007 Go Through Whitewater Standing
**Belt:** White Belt
**Severity:** HIGH
**Type:** Student-caused (frecuentemente consecuencia de ERR-WB-023 o ERR-WB-024)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

Durante el passage de whitewater, el alumno pierde control de la tabla. La tabla es arrancada de sus manos por la fuerza de la espuma y queda libre, drifteando / volando / golpeando.

Variantes observables:
- **Arranque completo (ambas manos pierden contacto):** tabla va con la espuma, alumno queda sin tabla.
- **Arranque por rotación:** tabla gira bruscamente por impacto lateral, sale de las manos del alumno.
- **Arranque por elevación:** espuma levanta la tabla hacia arriba, alumno no puede mantenerla, tabla sale por el aire.
- **Arranque parcial con recuperación:** alumno pierde una mano, la tabla se balancea, alumno logra re-sujetarla con la otra mano rápidamente.

**Consecuencias inmediatas:**
- Tabla libre en la zona de impacto.
- Leash estira / corta.
- Posible rebote de la tabla hacia el alumno o hacia otros surfistas.
- Session interrumpida: 30 seg a 5 min perdidos en recuperación.

---

## WHY IT HAPPENS

1. **Mecánica frontal incompleta (ERR-WB-024):** nose no estaba arriba, la espuma pegó de frente, fuerza frontal sobrepasó la fuerza de agarre del alumno.
2. **Alineación lateral (ERR-WB-023):** la espuma pegó en los rails, los rails actuaron como vela, la tabla fue arrancada con energía torsional.
3. **Grip incorrecto (ERR-WB-020):** alumno tenía manos en rails o nose. Cuando la espuma pegó, no había apalancamiento de TAIL para resistir.
4. **Fuerza de agarre insuficiente:** alumno físicamente no tuvo fuerza para sostener. Causa menos común en White Belt canonical (espuma <0.5m).
5. **Espuma fuera de canonical:** si el coach permitió espumas más grandes que canonical, el alumno pierde aunque la técnica sea OK.
6. **Miedo → reflejo de soltar:** alumno anticipa impacto, suelta defensivamente antes del momento crítico.
7. **Distracción:** alumno mira algo (otro surfer, la costa) en el momento del impacto. Pierde postura.

---

## WHY IT MATTERS

**Seguridad directa:**
- Tabla libre en la rompiente es un proyectil.
- Softboard 8'0" impulsada por whitewater tiene fuerza suficiente para dañar cara, ojos, dientes, o causar concusión.
- Leash mitiga pero la tabla puede volver al alumno con fuerza por la tensión del leash.
- Riesgo a terceros: otros surfers / bañistas / niños en la zona.

**Interrupción crítica de sesión:**
- Recuperar la tabla cuesta tiempo y energía.
- Alumno pierde ritmo, pierde el instalado de los key words.
- El resto de la sesión arranca desde estado más bajo (fatiga + inseguridad).

**Patrón psicológico negativo:**
- Si el alumno pierde la tabla 2+ veces seguidas, empieza a anticipar el fracaso.
- La anticipación degrada la ejecución: el alumno se apura, hace PRESS defensivo (temprano), y el ciclo se refuerza.
- Construcción de "miedo a la espuma" que es difícil de desinstalar.

**Exposición de debilidad sistémica:**
- Si un alumno pierde la tabla en canonical conditions, hay un problema estructural: STP-006 (control) no estaba instalado realmente antes de avanzar a STP-007.
- Es síntoma, no problema primario.

**Dilución de IP TSS:**
- Si el sistema TSS permite certificación de White Belt con historial de "tablas perdidas", el sistema pierde precisión. White Belt debe ser "zero lost boards en canonical conditions" como umbral implícito.

---

## HOW TO DETECT

**Durante el passage:**
- Manos del alumno en la tabla durante y después de la espuma → control mantenido.
- Una mano o ambas fuera de la tabla → pérdida inminente o consumada.

**Post-passage:**
- Tabla al costado del alumno → control mantenido.
- Tabla a 1-2 m del alumno → arranque parcial.
- Tabla a >3 m / llevada por la espuma hacia la orilla → arranque completo.

**Leash:**
- Leash estirado al máximo → la tabla salió con fuerza.
- Leash intacto pero estirado → arranque menor recuperable.
- Leash roto → arranque violento, revisión de equipo obligatoria.

---

## HOW TO CORRECT

**Intervención inmediata:**
1. Coach **detiene la sesión**. No se continúa con más reps.
2. Coach verifica: ¿alumno está OK? ¿otros bañistas OK? ¿tabla dañada?
3. Coach recupera la tabla o espera a que el leash la traiga.
4. Coach hace diagnóstico rápido: ¿qué falló? (alineación, timing, grip, o fuerza).

**Intervención diagnóstica (root cause):**
- Si falló **alineación** → regresar a ALIGN drill sin espuma. No retomar STP-007 hasta que ALIGN esté sólido.
- Si falló **timing o lift** → regresar a STP-006 PRESS drill estático. Instalar PRESS como reflejo.
- Si falló **grip** → regresar a STP-006 TAIL + CENTER. Probable que STP-006 no estaba realmente certificado.
- Si falló **por condiciones fuera de canonical** → responsabilidad del coach; cambiar de spot o esperar.

**Intervención psicológica (tras 1-2 arranques):**
- Coach **no enfatiza el error** ni avergüenza al alumno.
- Coach reconoce: *"El océano te sacó la tabla. Ahora vamos a entender por qué y qué hacemos la próxima vez."*
- Se reconstruye confianza con reps fáciles antes de volver a retar el umbral.

**Intervención estructural:**
- Si el alumno pierde la tabla 2+ veces en la misma sesión → sesión terminada.
- No se fuerza la certificación. Se retoma la próxima sesión con base más sólida.
- Se revisa con Marcelo si hay signos de progresión prematura (que certificó STP-006 sin estar realmente sólido).

---

## COACH-SIDE CHECK

- ¿Yo verifiqué STP-006 antes de iniciar STP-007? (PRESS automático, SIDE sostenido).
- ¿Yo seleccioné espumas dentro del canonical (≤0.5m)?
- ¿Yo dejé al alumno ejecutar bajo fatiga visible?
- ¿Yo corregí alineación o timing cuando vi el primer signo de drift?
- ¿Yo detuve la sesión al primer arranque, o permití seguir intentando?

---

## DOES THE REP COUNT?

- **Rep arrancado:** rep NO cuenta. Por definición.
- **Sesión con 1 arranque:** sesión puede salvarse si el diagnóstico es claro y los siguientes 3-5 reps son limpios. PASS marginal, no ideal.
- **Sesión con 2+ arranques:** **sesión NO cuenta para certificación**. Drill de vuelta obligatorio.
- **Arranque con daño al alumno o a terceros:** sesión NO cuenta + revisión de equipo + protocolo de safety activado.

---

## RELATED ERRORS

- `ERR-WB-020` Wrong Grip (root cause frecuente).
- `ERR-WB-023` Poor Alignment (root cause frecuente).
- `ERR-WB-024` Nose Too Low / Bad Timing (root cause frecuente).
- `ERR-WB-014` Hard-Line Rule (si la tabla queda entre cuerpo y ola post-arranque, se activa).
- `ERR-WB-018` Let Go Completely (STP-005 parent: si la base "contacto permanente" no se instaló ahí, falla acá).

---

## DOCTRINAL NOTE

Este es el error más visible y medible de toda la progresión White Belt. Es fácil de detectar, difícil de justificar, y **NO puede ser normalizado**. Un sistema que certifica coaches con historial de "estudiantes que perdieron tablas en White Belt" pierde credibilidad técnica.

**TSS Hard Standard:** Zero lost boards in canonical conditions is an implicit threshold for White Belt certification. Si un alumno pierde la tabla en canonical, el alumno todavía no es White Belt.

Este estándar no se publica como "regla explícita" para no generar miedo, pero es el estándar real de calidad.

---

*TSS® Error DB · ERR-WB-025 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-007*$tss$
WHERE id = 'STP-007';

UPDATE lessons SET
  description_md = $tss$# STP-008 — TURN AROUND SAFELY

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-08 — SAFE PIVOT TURN DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-026_Wrong_Turning_Direction

## ERR-WB-026 — WRONG TURNING DIRECTION

**Parent step:** STP-008 Turn Around Safely
**Belt:** White Belt
**Severity:** HIGH
**Type:** Student-caused (coach-caused si la regla de dirección no fue definida)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno gira hacia el lado que lo expone al peligro. Al completar el giro, la tabla queda entre su cuerpo y la espuma entrante, O el alumno queda con el pecho/frente orientado hacia la espuma en lugar de la espalda.

Variantes observables:
- **Giro hacia lado equivocado completo:** alumno gira en la dirección opuesta a la correcta. La tabla cruza delante del cuerpo durante la rotación.
- **Giro sin CHECK previo:** alumno gira sin mirar la espuma, por suerte acierta 50% del tiempo y falla 50%.
- **Giro ambiguo (180° frontal):** alumno hace el giro de manera que el cuerpo queda con el pecho frente a la espuma en lugar de la espalda.
- **Giro indeciso:** alumno inicia giro hacia un lado, duda, cambia al otro — termina con la tabla descontrolada al frente.

Indicador crítico: **al terminar el giro, la tabla está entre cuerpo y espuma** (activación automática de ERR-WB-027 + ERR-WB-014 hard-line).

---

## WHY IT HAPPENS

1. **No hizo CHECK:** alumno gira por instinto sin verificar de dónde viene la espuma.
2. **Coach no definió la regla:** si el coach dijo "girá" sin especificar la regla ("espalda a la espuma"), el alumno elige al azar.
3. **Dominancia lateral:** alumno siempre gira hacia su lado dominante, aunque sea el lado equivocado para esa espuma específica.
4. **Miedo + instinto de "mirar la amenaza":** alumno quiere VER la espuma que viene — su instinto es girar hacia ella, terminar con el frente hacia ella, no la espalda.
5. **Inversión mental:** alumno confunde "girar a la izquierda" con "girar hacia la derecha" — especialmente bajo estrés o cuando la espuma viene de frente.
6. **Cansancio cognitivo:** tras varios passages de whitewater, la capacidad de decisión degrada. El alumno gira hacia donde "se siente" girar, no hacia lo correcto.
7. **Instinto de protección del pecho:** paradójicamente, el cuerpo humano busca "ver la amenaza" — pero en surf, eso significa exponer el pecho.

---

## WHY IT MATTERS

**Safety crítico — la causa #1 de lesiones auto-infligidas:**
- El giro hacia el lado equivocado es **la** forma dominante en que beginners se lastiman con su propia tabla.
- Softboard 8'0" empujada por whitewater hacia el pecho del alumno es causa frecuente de: cortes faciales, costillas fracturadas, dientes rotos, lesiones dentales serias.
- Leash no protege de este escenario — el leash es para no perder la tabla, no para impedir que la tabla te golpee.

**Patrón se hereda a Yellow/Orange Belt:**
- Un alumno que certifica White Belt con ERR-WB-026 sin corregir lo arrastra a pasos más complejos.
- En Yellow Belt, los giros son más rápidos y las condiciones más exigentes. Un giro incorrecto ahí es peor.

**Dilución total de IP TSS:**
- TSS vende "surf seguro con metodología". Si permite giros en dirección incorrecta repetidos, ha perdido su diferencial.
- La regla "back to the foam" es parte del núcleo no negociable de TSS.

**Responsabilidad legal potencial:**
- Una lesión documentable de un alumno TSS por giro incorrecto que el coach no corrigió podría generar problema legal (bajo el agreement Marcelo-Puro Surf / futuro contrato).
- Documentar en coach notes SI se activó ERR-WB-026 y cómo se corrigió es protección legal.

**Autonomía comprometida:**
- El alumno que no puede decidir correctamente la dirección de giro solo no es autónomo. Siempre va a depender de un coach cerca para indicarle.

---

## HOW TO DETECT

**Pre-pivot:**
- ¿Alumno miró la espuma antes de girar? (CHECK observable)
- ¿Alumno verbalizó la dirección? ("La espuma viene de mi derecha")
- Si alumno gira sin CHECK → alta probabilidad de ERR-WB-026.

**Durante el pivot:**
- Observá la trayectoria de la tabla.
- Si la tabla cruza delante del cuerpo en cualquier momento del giro → dirección incorrecta.
- Si la tabla permanece al costado y rota junto con el cuerpo → dirección correcta.

**Post-pivot:**
- Alumno en READY position con espalda hacia la espuma → correcto.
- Alumno en READY con pecho hacia la espuma → ERR-WB-026 activo.
- Tabla entre cuerpo y espuma al finalizar → confirmación del error + ERR-WB-027 activado.

---

## HOW TO CORRECT

**Intervención inmediata (en medio del giro — CRÍTICA):**
1. Coach grita: **"¡STOP! Hacia el OTRO lado."**
2. Alumno detiene el giro inmediatamente.
3. Alumno reinicia CHECK → decide dirección correcta → PIVOT.
4. Esta corrección debe ser en tiempo real porque si el giro se completa, la tabla ya está en posición de peligro y la próxima espuma es amenaza directa.

**Intervención pedagógica (pre-pivot):**
- Antes del primer rep, coach pregunta al alumno: "Si la espuma viene de tu derecha, ¿hacia dónde girás?"
- Alumno responde. Coach corrige si es necesario.
- Se repite con varios escenarios (derecha, izquierda, frente) hasta que las respuestas son automáticas.

**Intervención kinética (si el alumno se confunde con izquierda/derecha):**
- Coach se para al lado del alumno y usa su brazo como referencia: "Esta dirección" (señala).
- Alumno gira siguiendo el brazo del coach.
- Se repite sin señal hasta que el alumno internaliza.

**Intervención estructural (si es patrón):**
- Drill seco en tierra: coach grita "espuma de la derecha" — alumno gira hacia izquierda + coloca espalda hacia imaginaria espuma. Coach grita "espuma de la izquierda" — alumno gira hacia derecha. 20 reps rápidos.
- Cuando la respuesta es automática en tierra, regresar al agua.
- Drill verbal: coach pregunta "¿de dónde viene la espuma?" durante waiting period. Alumno responde. Coach pregunta "¿hacia dónde girás?". Alumno responde. Solo después ejecuta.

**Intervención de awareness:**
- Coach enfatiza: *"Tu instinto te va a decir que mires la espuma. No le hagas caso. Confiá en la regla: espalda a la espuma. Siempre espalda."*

---

## COACH-SIDE CHECK

- ¿Yo definí la regla de dirección explícitamente antes del primer rep?
- ¿Yo verifiqué que el alumno entendió izquierda / derecha en el contexto acuático?
- ¿Yo corregí EN TIEMPO REAL el primer giro incorrecto, o esperé a que se completara?
- ¿Yo asumí que "es intuitivo" cuando en realidad es contra-intuitivo?

---

## DOES THE REP COUNT?

- **Giro en dirección incorrecta (completo):** rep NO cuenta. Por definición.
- **Giro iniciado mal pero alumno corrigió solo sin activar hard-line:** rep puede contar si la corrección fue rápida y el cierre fue correcto.
- **Giro en dirección incorrecta + activación de ERR-WB-027 / ERR-WB-014:** **sesión NO cuenta para certificación**.
- **Patrón persistente (2+ giros incorrectos):** sesión NO cuenta + drill seco en tierra obligatorio + posible regresión a STP-004 hard-line rule review.

---

## RELATED ERRORS

- **`ERR-WB-027`** Board Between Body and Foam During Pivot (consecuencia directa y frecuente).
- **`ERR-WB-014`** Hard-Line Rule (STP-004 parent: la violación de ERR-WB-027 activa también ERR-WB-014).
- `ERR-WB-028` Rushed Pivot / Loss of Control (a veces coexiste: alumno que dudó dirección también pierde control).
- `ERR-WB-021` Board Drifting In Front (STP-006 base: si el SIDE no estaba instalado, girar mal es más fácil).

---

## DOCTRINAL NOTE

Este error tiene un componente único: es **contra-intuitivo**. El cerebro humano quiere VER la amenaza, lo cual implica girar hacia ella. Pero en surf, girar hacia la amenaza te expone. El aprendizaje de STP-008 es parcialmente **re-cablear un instinto**.

Por eso la repetición es crítica. La regla "back to the foam" no se instala con una explicación — se instala con 20-30 giros correctos consecutivos, hasta que el nuevo patrón sobrescribe el instinto original.

**TSS Principle:** En surf, la espalda hacia la ola no es retirada. Es posición técnica. Y es seguridad.

**TSS Hard Standard (implícito):** Zero wrong-direction turns en canonical conditions durante las sesiones finales de White Belt. Un alumno que todavía falla la dirección en sesión 10 no está listo para certificación.

---

*TSS® Error DB · ERR-WB-026 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-008*

---

### ERR-WB-027_Board_Between_Body_Foam_During_Pivot

## ERR-WB-027 — BOARD BETWEEN BODY AND FOAM DURING PIVOT

**Parent step:** STP-008 Turn Around Safely
**Belt:** White Belt
**Severity:** **HARD-LINE** (non-negotiable, sesión invalidada)
**Type:** Student-caused (consecuencia dinámica de ERR-WB-026 frecuentemente)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

Durante la rotación del giro, la tabla cruza la línea imaginaria entre el cuerpo del alumno y la espuma entrante. En cualquier punto del pivot — incluso transitoriamente — la tabla queda **entre el alumno y la ola**.

Variantes observables:
- **Transitorio mid-pivot:** la tabla pasa momentáneamente por delante del cuerpo durante la rotación, después sale de la zona de peligro. Aun así, hard-line violada durante ese momento.
- **Permanente al cierre del pivot:** el giro se completa con la tabla delante del cuerpo (consecuencia de ERR-WB-026 giro incorrecto).
- **Pivot mal iniciado:** alumno empieza el giro rotando la tabla hacia adelante en lugar de hacia atrás. La tabla arranca el pivot cruzando al frente.
- **Pivot con scramble:** alumno pierde control, la tabla se suelta al frente durante la rotación caótica.

---

## WHY IT HAPPENS

1. **ERR-WB-026 activo:** giro en dirección incorrecta casi inevitablemente activa ERR-WB-027.
2. **Mecánica de PIVOT pobre:** alumno usa fuerza bruta en lugar de PRESS + leverage. La tabla se desplaza al frente porque no tiene anclaje mecánico.
3. **Alumno soltó una mano:** tras perder CENTER o TAIL durante el giro, la tabla queda libre y puede cruzar al frente.
4. **Sin CHECK:** sin verificación previa, el alumno no anticipa qué posición debe evitar — ergo, termina en la posición prohibida.
5. **Apuro emocional:** alumno acelera el giro para "terminar antes de que llegue la ola", pierde control, la tabla se desplaza.
6. **Corriente empujando:** en condiciones no-canonical, la corriente puede empujar la tabla al frente durante el giro.

---

## WHY IT MATTERS

**ESTA ES LA HARD-LINE RULE EN FORMA DINÁMICA:**
- ERR-WB-014 es la hard-line rule original (STP-004 Walk Out).
- ERR-WB-021 es la hard-line rule en posición estática (STP-006 Control).
- **ERR-WB-027 es la hard-line rule en rotación.**
- Las 3 son **la misma regla** manifestándose en 3 contextos distintos.

**No hay excepciones:**
- Una sola activación de ERR-WB-027 **invalida la sesión completa** para certificación, aunque todos los otros aspectos del giro hayan sido correctos.
- Este es el núcleo del estándar de calidad de White Belt TSS.

**Seguridad directa:**
- Si la espuma llega mientras la tabla está entre cuerpo y espuma, la espuma empuja la tabla hacia el alumno con fuerza.
- Nose al pecho, rails a la cara, aletas a las piernas — lesiones serias posibles.
- Incluso si la espuma no llega en ese momento, **el patrón quedó instalado** y se manifestará en la próxima ocasión.

**TSS como sistema certificable:**
- Si TSS permite "hard-line activada pero como no llegó la ola no pasó nada", TSS deja de ser un sistema de seguridad — se convierte en entrenamiento de suerte.
- La diferencia entre TSS y tutoriales genéricos es que TSS **sanciona el patrón peligroso, no solo el resultado peligroso**.

**Contrato implícito con el alumno:**
- El alumno confió en el sistema TSS para aprender seguro. Si el coach no enforce la hard-line, el coach falló al alumno.

---

## HOW TO DETECT

**Real-time durante el pivot:**
- Trazá mentalmente la línea "cuerpo → espuma" como una línea recta.
- En cualquier momento del giro, ¿la tabla cruza esa línea?
- Si sí → ERR-WB-027 activado.

**Visual:**
- Tabla entre alumno y horizonte (lado mar) → tabla al frente respecto a la espuma.
- Tabla al costado del alumno (paralela al cuerpo) → tabla en posición segura.

**Post-pivot immediato:**
- ¿La posición final tiene al alumno con espalda hacia la espuma o con frente hacia la espuma?
- Frente hacia espuma = tabla probablemente entre cuerpo y espuma = ERR-WB-027.

---

## HOW TO CORRECT

**Intervención inmediata (DURANTE la violación):**
1. Coach grita: **"¡STOP! Tabla al costado. AHORA."**
2. Alumno detiene el giro, reposiciona la tabla al SIDE usando PRESS + tail.
3. Alumno CHECK espuma.
4. Alumno reinicia el giro en dirección correcta.

**Intervención al cierre del pivot (si se completó mal):**
1. Coach dice: **"Esa posición nunca. Volvé a girar, correcto."**
2. Alumno ejecuta giro adicional para corregir posición.
3. Coach verifica que la posición final es correcta (espalda hacia espuma).

**Intervención pedagógica post-error:**
- Coach pregunta al alumno: "¿En qué momento la tabla cruzó al frente?"
- Alumno verbaliza lo que pasó.
- Coach conecta con la regla: *"Esa es la regla que venimos trabajando desde STP-004. La regla no cambia porque estés girando. La tabla NUNCA entre tu cuerpo y la ola, ni por un segundo."*

**Intervención estructural:**
- Sesión NO cuenta para certificación.
- Siguiente sesión empieza con revisión de ERR-WB-014 (parent hard-line rule).
- Drill seco en tierra para re-instalar la regla en contexto dinámico.
- 10+ giros correctos consecutivos en tierra antes de volver al agua.
- Se alerta en coach notes que hubo violación — documentación obligatoria.

**Intervención de sistema:**
- Si un alumno tiene 2 sesiones consecutivas con ERR-WB-027, coach debe escalar a coach lead / Marcelo.
- Posible que el alumno no tenga las bases de STP-004/006/007 realmente instaladas.
- Regresión a pasos anteriores es probable.

---

## COACH-SIDE CHECK

- ¿Yo re-invocé la hard-line rule explícitamente al inicio de STP-008?
- ¿Yo conecté STP-008 con la hard-line rule de STP-004?
- ¿Yo interrumpí el primer signo de cruce de tabla al frente, o esperé a ver "qué pasa"?
- ¿Yo tengo CHECK verificado antes de cada giro?

---

## DOES THE REP COUNT?

- **Cualquier activación de ERR-WB-027:** rep NO cuenta.
- **1 activación en la sesión:** sesión NO cuenta para certificación. Otros reps pueden practicarse pero la sesión queda marcada.
- **2+ activaciones:** sesión INVALIDADA + regresión obligatoria a STP-004 hard-line review.

---

## RELATED ERRORS

- **`ERR-WB-014`** Hard-Line Rule (parent rule; ERR-WB-027 es la misma regla en forma dinámica).
- **`ERR-WB-026`** Wrong Turning Direction (causa principal; corrigiendo ERR-WB-026 típicamente elimina ERR-WB-027).
- `ERR-WB-021` Board Drifting In Front (STP-006 base; si la tabla no se queda al SIDE bajo presión estática, menos aún bajo rotación).
- `ERR-WB-028` Rushed Pivot / Loss of Control (a veces coexiste).

---

## DOCTRINAL NOTE

Este error es la forma más clara en que se manifiesta el **estándar de calidad TSS** como non-negotiable. No importa qué tan bien el alumno ejecute el resto del giro — si en algún momento la tabla cruza al frente, la sesión no cuenta. Esta rigidez es el valor de la certificación TSS.

**TSS Principle (re-afirmación):**
> "The board is never between the surfer and the wave.
> Not while walking.
> Not while standing.
> Not while turning.
> Not ever."

Esta regla es el sello de calidad de White Belt. Un alumno que la rompe no es White Belt. Un coach que la permite sin corregir no es TSS coach.

**TSS Hard Standard:** Zero activations of ERR-WB-027 en las dos sesiones de certificación. Certificación sin esta condición es fraude del sistema.

---

*TSS® Error DB · ERR-WB-027 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-008*
*HARD-LINE RULE (dynamic form of ERR-WB-014)*

---

### ERR-WB-028_Rushed_Pivot_Loss_of_Control

## ERR-WB-028 — RUSHED PIVOT / LOSS OF CONTROL

**Parent step:** STP-008 Turn Around Safely
**Belt:** White Belt
**Severity:** MEDIUM
**Type:** Student-caused (mechanics + emotion)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

Durante el giro, el alumno acelera la rotación con urgencia emocional en lugar de velocidad controlada. Como consecuencia, suelta una mano (TAIL o CENTER), la mecánica de PRESS se pierde, y la tabla sale de SIDE.

Variantes observables:
- **Una mano suelta:** alumno libera la mano del center para "ayudar a girar" con el cuerpo. La mano del tail queda sola, PRESS degrada, la tabla se descontrola parcialmente.
- **Giro por fuerza de brazos:** alumno gira usando fuerza de brazos (tirando/empujando) en lugar de PRESS + PIVOT mecánico. La tabla chicotea en lugar de rotar limpia.
- **Pivot incompleto:** alumno apura el giro, no completa los 5 beats (CHECK · PIVOT · BACK · CONTROL · READY). Termina en una posición intermedia, tabla descontrolada.
- **Pies desordenados:** alumno mueve los pies antes de que el torso complete el giro. Pierde el balance, se tambalea.
- **Mirada dispersa:** alumno mira la espuma, la costa, al coach, todo a la vez. Atención fragmentada → ejecución fragmentada.

---

## WHY IT HAPPENS

1. **Ansiedad por siguiente ola:** alumno ve que viene otra espuma y apura el giro para "estar listo". El apuro rompe la mecánica.
2. **Confusión "rápido vs apurado":** alumno confunde velocidad técnica con velocidad caótica. No son lo mismo.
3. **Coach no enfatizó "los dos manos":** si el coach no subrayó que las dos manos quedan en la tabla durante el PIVOT, el alumno suelta una por instinto.
4. **Fatiga muscular:** tras varios reps de STP-005/006/007, los brazos están cansados. El alumno suelta una mano para "ahorrar".
5. **Dominancia lateral:** alumno con fuerza desbalanceada suelta la mano débil, delegando todo en la fuerte.
6. **Instinto de usar el cuerpo:** alumno cree que girar "es con el cuerpo" y no "con el tail". Suelta manos para girar con el torso solo.
7. **Inexperiencia con rotación bajo carga:** el cerebro del alumno no tiene patrón almacenado de "girar con ambas manos sosteniendo algo". Default al patrón más cercano (girar libre).

---

## WHY IT MATTERS

**Mecánica de TSS rota:**
- El PIVOT de STP-006 requiere ambas manos. STP-008 extiende esa mecánica. Si una mano se suelta, STP-006 deja de estar instalado.
- Un alumno que "pasa" STP-008 con una mano suelta no certificó realmente — su certificación descansa en patrón incorrecto.

**Precede a errores más severos:**
- Una mano suelta + espuma llegando = alta probabilidad de ERR-WB-025 (Board Ripped Away).
- Una mano suelta + giro mal iniciado = ERR-WB-027 (Hard-Line violated) más probable.
- ERR-WB-028 es el **gateway error** hacia fallos graves.

**Patrón bajo fatiga se instala y se hereda:**
- Si el alumno suelta una mano bajo fatiga en White Belt, va a soltarla en Yellow Belt donde las consecuencias son peores.
- Corregirlo tarde es mucho más difícil.

**Dilución de IP TSS:**
- TSS enseña operating, no scrambling. Rushed pivot es scrambling.

**Calidad percibida vs real:**
- Al observador casual, un rushed pivot "se ve como que giró". Al coach TSS, se ve como un fallo mecánico. Si no se corrige, el alumno se gradúa con patrón que parece fluido pero no es robusto.

---

## HOW TO DETECT

**Visual — manos:**
- Durante todo el giro, ambas manos deben estar en la tabla.
- Si en algún frame del giro se ve una mano en el aire → ERR-WB-028 activo.
- Manos en TAIL + CENTER durante y después del giro → correcto.

**Visual — tabla:**
- Tabla que rota fluida alrededor del cuerpo → PRESS + PIVOT correcto.
- Tabla que chicotea / se tambalea / se desplaza al frente → mecánica rota.

**Postural:**
- Alumno con torso girando coordinado con la tabla → correcto.
- Alumno con torso girando antes que la tabla o después que la tabla → desconexión mecánica.

**Temporal:**
- Giro limpio: 2-3 segundos.
- Giro apurado: <1 segundo, con caos visible.
- Giro lento pero correcto: 4-5 segundos, OK.

**Verbal / cognitivo:**
- Alumno que verbaliza los key words (CHECK · PIVOT · BACK · CONTROL · READY) en orden → control mental presente.
- Alumno que ejecuta en silencio o murmura → probable que esté en modo reactivo.

---

## HOW TO CORRECT

**Intervención inmediata:**
1. Coach dice: **"Las DOS manos. Siempre. TAIL y CENTER."**
2. Alumno detiene el giro, reposiciona ambas manos.
3. Alumno reinicia desde CHECK con mecánica correcta.

**Intervención pedagógica (si persiste):**
- Coach demuestra lado a lado:
  - Demo A: giro con una mano → caos, tabla fuera de control.
  - Demo B: giro con dos manos + PRESS → tabla rota limpia.
- Alumno observa y replica.
- Coach explica: **"Rápido y apurado no son lo mismo. Rápido es mecánico. Apurado es miedo. Vos girás rápido porque sabés girar, no porque tenés miedo."**

**Intervención kinética:**
- Coach coloca las manos del alumno en TAIL y CENTER.
- Coach dice: "Vas a girar sin soltar. Ni una mano, ni un segundo. Si sentís que se te cae una mano, detené el giro."
- Alumno ejecuta con atención forzada a las manos.

**Intervención estructural (ralentizar):**
- Drill de giro ultra-lento: alumno ejecuta el giro en 10-15 segundos, cada beat con pausa de 2 segundos.
- Foco 100% en mantener TAIL + CENTER.
- Cuando el patrón está instalado lento, se acelera gradualmente.

**Intervención psicológica (si la causa es miedo):**
- Coach identifica la fuente del apuro: "¿Qué te apura? ¿La próxima espuma?"
- Alumno verbaliza.
- Coach responde: "Si te apura, ya hay un problema de timing. Voy a elegir mejor la ventana entre espumas para que tengas tiempo. No tenés que apurarte."

**Intervención de fatiga:**
- Si la causa es fatiga, coach corta la sesión.
- Descanso, hidratación, retomar con 2-3 reps limpios más.
- Fatigue-induced errors se graban profundo. Mejor prevenir.

---

## COACH-SIDE CHECK

- ¿Yo enfaticé "ambas manos siempre" en la explicación?
- ¿Yo demostré el contraste entre rushed y fast?
- ¿Yo seleccioné una ventana entre espumas con tiempo suficiente?
- ¿Yo corregí al primer signo de mano suelta, o esperé a ver qué pasa?
- ¿Yo permito al alumno ejecutar bajo fatiga visible?

---

## DOES THE REP COUNT?

- **Una mano soltada brevemente pero el giro se completó con CONTROL restablecido:** rep puede contar si el cierre fue limpio y el alumno corrigió sin intervención del coach.
- **Una mano soltada + giro degradado + coach intervino:** rep NO cuenta.
- **Patrón persistente (3+ reps con manos sueltas):** sesión NO cuenta, drill de giro ultra-lento obligatorio.
- **Giro apurado + ERR-WB-027 (hard-line) coactivado:** sesión INVALIDADA independientemente de los otros reps.

---

## RELATED ERRORS

- **`ERR-WB-027`** Board Between Body and Foam During Pivot (frecuentemente consecuencia de rushed pivot).
- `ERR-WB-026` Wrong Turning Direction (a veces coexiste: alumno apurado no hace CHECK).
- `ERR-WB-022` Weak Tail Pressure (STP-006 base: si PRESS no estaba instalado, el PIVOT falla y el alumno compensa soltando mano).
- `ERR-WB-018` Let Go Completely (STP-005 base: patrón de soltar ya estaba si el alumno no certificó bien STP-005).

---

## DOCTRINAL NOTE

Este error es el ejemplo perfecto de la distinción entre **fast** y **rushed**:

- **Fast** es velocidad con mecánica intacta. Se logra con repetición, no con prisa.
- **Rushed** es velocidad con mecánica degradada. Es el resultado de la ansiedad, no de la habilidad.

TSS enseña fast, no rushed. Un alumno que es rápido por mecánica es seguro. Un alumno que es rápido por apuro es un accidente esperando ocurrir.

**TSS Principle:** Speed without control is chaos. Control without speed is hesitation. Speed with control is surfing.

En White Belt, el alumno aprende control primero, velocidad después. Si el alumno acelera antes de tiempo, se regresa a control.

---

*TSS® Error DB · ERR-WB-028 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-008*$tss$
WHERE id = 'STP-008';

UPDATE lessons SET
  description_md = $tss$# STP-009 — Walk Back to the Sand

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
*Closing step of Block 1 — Entry / Control / Return loop*$tss$,
  drill_md = $tss$# DRL-WB-09 — SAFE RETURN DRILL

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
*Closing drill of Block 1 — Entry / Control / Return loop*$tss$,
  errors_md = $tss$### ERR-WB-029_No_Backward_Awareness

## ERR-WB-029 — NO BACKWARD AWARENESS

**Parent step:** STP-009 Walk Back to the Sand
**Belt:** White Belt
**Severity:** HIGH
**Type:** Student-caused (coach-caused si no se enseñó la inversión cognitiva)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno camina de regreso hacia la orilla **sin mirar hacia atrás**. La cabeza se mantiene fija hacia adelante durante todo el retorno. No ejecuta el key word LOOK del loop 5-beats.

Variantes observables:
- **Cabeza fija total:** alumno no gira la cabeza ni una vez entre el giro (STP-008) y arena seca. Scanning hacia atrás = cero.
- **Miradas esporádicas:** alumno mira atrás una o dos veces en retornos de 15+ pasos. Frecuencia insuficiente.
- **Miradas sin READ:** alumno gira cabeza mecánicamente pero no procesa qué está viendo. Ojos pasan sobre la espuma sin registrarla.
- **Mirada solo cuando escucha algo:** alumno depende del sonido (rompiente audible) para reaccionar, no del scan visual.
- **Miradas solo con recordatorio del coach:** alumno mira atrás únicamente cuando coach le dice "mirá atrás", nunca por iniciativa propia.

Indicador crítico: alumno es sorprendido por espuma entrando por detrás — esto confirma ERR-WB-029 activo (posiblemente coactivado con ERR-WB-031).

---

## WHY IT HAPPENS

1. **Instinto de "volver a casa":** el cerebro humano, al orientarse hacia un destino seguro, se relaja y focaliza solo hacia el destino. La awareness lateral / trasera colapsa.
2. **Confusión "ya pasó lo peligroso":** alumno asume que tras pasar espuma (STP-007) y girar (STP-008), "lo difícil terminó". Desconexión cognitiva.
3. **Fatiga cognitiva:** tras 5-10 eventos de awareness (scanning, alignment, timing), los recursos mentales están gastados. El alumno default al modo "caminar sin pensar".
4. **Inversión no instalada:** el alumno practicó forward scanning en STP-003 pero nadie le enseñó explícitamente que hay que **invertir** ese scanning al volver. El coach asumió que era obvio.
5. **Miedo al "parecer indeciso":** alumno cree que mirar atrás es "miedo" o "inseguridad", así que camina firme hacia adelante como signo de confianza. Error de framing.
6. **Rigidez física / incomodidad:** alumno con poca movilidad cervical encuentra incómodo girar la cabeza con tabla en manos. Evita el movimiento.
7. **Modelo cultural del "volver a casa":** en la vida diaria, volver a casa es seguro. El cerebro aplica el mismo patrón al retorno en el mar — incorrecto.

---

## WHY IT MATTERS

**Safety directa:**
- Una espuma ≤0.5m por detrás a velocidad ~1-2 m/s genera impacto suficiente para desestabilizar al alumno, empujarlo hacia adelante, y hacerle perder la tabla.
- Con tabla empujada hacia adelante por la espuma + alumno perdiendo balance = posible caída sobre la tabla, rails en la cara, aletas golpeando piernas.
- Aproximadamente 40% de los incidentes menores documentados en beginners en Puro Surf ocurren durante el retorno, no durante la entrada.

**Dilución de la doctrina TSS:**
- TSS se funda sobre "awareness continua hasta arena seca". Si el alumno certifica White Belt sin backward awareness, el principio fundacional no está instalado.
- Un surfer TSS que se relaja volviendo no es TSS.

**Patrón se hereda a Yellow Belt:**
- En Yellow Belt, el alumno retorna remando (paddle back). Si no instaló backward awareness caminando, la remada la hará sin mirar atrás tampoco.
- En paddle back, no mirar atrás = no ver la ola grande que viene = wipeout severo o pérdida de tabla.

**Loop incompleto:**
- El primer loop White Belt (entrada → control → retorno) queda roto. El alumno sabe los primeros dos, no el tercero.
- Esto significa que el alumno **no puede navegar una sesión entera**. Depende del coach para la parte de retorno.

**Autonomía comprometida:**
- Un alumno que no mira atrás no es autónomo en el mar. Siempre necesitará alguien cerca que le diga "espuma atrás".

---

## HOW TO DETECT

**Visual — cabeza:**
- Contar cuántas veces el alumno gira la cabeza durante el retorno.
- Canonical estimate: 1 LOOK cada 5-8 pasos. Un retorno de 15 pasos debería tener 2-3 LOOKs.
- Si LOOKs = 0 o 1 en 15 pasos → ERR-WB-029 activo.

**Visual — reacción:**
- ¿El alumno se sobresalta cuando llega espuma por detrás? Sí = no la vio = ERR-WB-029.
- ¿El alumno responde antes de que la espuma lo toque? Sí = la vio = scanning activo.

**Cognitivo:**
- Post-retorno, preguntar al alumno: "¿Qué viste detrás durante el camino?" Si no puede describir (espumas, distancias, timing), no estaba leyendo.

**Temporal:**
- Intervalo entre LOOKs. 5-8 pasos es canonical. >10 pasos sin LOOK = frecuencia insuficiente.

---

## HOW TO CORRECT

**Intervención inmediata (durante retorno):**
1. Coach dice: **"LOOK. Cada 5 pasos."**
2. Alumno rota cabeza, escanea, continúa.
3. Coach cuenta en voz alta: "1... 2... 3... 4... 5... LOOK."
4. Tras 3-4 intervalos, coach reduce cues hasta autonomía.

**Intervención pedagógica (entre reps):**
- Coach pregunta: "¿Qué pasó detrás durante el último retorno?"
- Si alumno no sabe → coach confirma: "Eso es exactamente el problema. Necesitás saberlo."
- Coach conecta con STP-003: "En STP-003 mirabas adelante. Acá tenés que mirar atrás. Es el mismo skill invertido."

**Intervención kinética (si rigidez física):**
- Drill seco en tierra: alumno camina con tabla en SIDE, coach le dice "LOOK" cada 5 pasos.
- Alumno rota cabeza + parte del torso. Practica 20 reps hasta que es cómodo.

**Intervención de framing:**
- Coach explica: "Mirar atrás no es miedo. Es técnica. Los surfers pro miran atrás todo el tiempo. Es parte de surfear el mar, no sobrevivir al mar."

**Intervención estructural (si patrón persistente):**
- Drill de retorno forzado con cue: coach cuenta pasos en voz alta. Cada 5, grita "LOOK". Alumno debe girar cabeza sincronizado.
- Después, coach grita "LOOK" en intervalos irregulares. Alumno reacciona.
- Finalmente, coach silencia. Alumno debe ejecutar autónomamente.
- Reps necesarios: 10-15 antes de que el patrón se instale.

**Intervención de reset:**
- Si la fatiga está comprometiendo awareness → cortar sesión.
- No se instala patrón de awareness bajo fatiga.

---

## COACH-SIDE CHECK

- ¿Yo expliqué la inversión cognitiva (forward → backward) explícitamente antes del primer retorno?
- ¿Yo conecté STP-009 con STP-003?
- ¿Yo dejé al alumno relajarse con cues cada vez que "camina bien" sin mirar?
- ¿Yo caminé a su lado dándole delegación de awareness en lugar de quedarme entre él y la arena?
- ¿Yo asumí "es obvio que hay que mirar atrás" cuando el instinto humano es lo contrario?

---

## DOES THE REP COUNT?

- **Retorno con LOOKs consistentes (cada 5-8 pasos) por iniciativa propia:** rep cuenta.
- **Retorno con LOOKs solo tras cue del coach:** rep cuenta a medias — sesión puede contar si en reps 5-8 alumno es autónomo.
- **Retorno sin LOOKs:** rep NO cuenta.
- **Retorno con 1+ golpe por espuma trasera (sorpresa):** rep NO cuenta + sesión marcada con atención especial.
- **Patrón de sesión: LOOKs bajan en frecuencia en reps finales:** sesión NO cuenta (fatiga comprometió el patrón, no se instaló).

---

## RELATED ERRORS

- **`ERR-WB-031`** Failure to Re-Maneuver (consecuencia directa: si no mirás, no podés responder).
- **`ERR-WB-030`** Passive Return / Relaxation (coexiste frecuentemente: el alumno que no mira generalmente también se relajó).
- `ERR-WB-007` (STP-003 Scanning fail) — si el alumno falla scanning adelante, más va a fallar atrás.
- `ERR-WB-021` Board Drifting In Front (STP-006 base: el alumno que pierde control al girar cabeza no instaló bien SIDE).

---

## DOCTRINAL NOTE

Este error es el equivalente, en contexto de retorno, a la falla de scanning en la entrada. Es **la misma habilidad cognitiva** aplicada en dirección opuesta.

Un alumno que lo internaliza demuestra que entendió el principio fundamental de TSS: el mar exige awareness continua, no selectiva. No hay momentos "seguros" dentro de la sesión — hay momentos que se navegan con awareness y momentos que se navegan por suerte.

**TSS Principle:** The ocean does not care which direction you are facing. Awareness is not a direction, it is a state.

**TSS Hard Standard (reforzado):** En canonical conditions, zero backward-surprises durante las sesiones de certificación. Una sola sorpresa = sesión no cuenta. Dos en dos sesiones consecutivas = regresión obligatoria a STP-003 + STP-009 fundamentals review.

El alumno que certifica White Belt con este error sin corregir no es White Belt. Es un alumno que aprendió 2/3 del loop y cree que aprendió el todo.

---

*TSS® Error DB · ERR-WB-029 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-009*

---

### ERR-WB-030_Passive_Return_Relaxation

## ERR-WB-030 — PASSIVE RETURN / RELAXATION

**Parent step:** STP-009 Walk Back to the Sand
**Belt:** White Belt
**Severity:** MEDIUM
**Type:** Student-caused (psicológico-emocional)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

El alumno trata el retorno como "fin de faena". Se relaja físicamente y cognitivamente antes de llegar a arena seca. La ejecución degrada progresivamente: menos awareness, menos control de tabla, menos decisión activa.

Variantes observables:
- **Relajación postural:** hombros caen, tabla queda suelta en una mano, alumno "arrastra" la tabla en lugar de gestionarla.
- **Relajación cognitiva:** alumno empieza a hablar con el coach, hacer bromas, comentar la ola anterior. Focus se va de la ejecución presente.
- **Relajación rítmica:** pasos se vuelven casuales, sin firmeza. Alumno puede hasta caminar lento tipo paseo.
- **Celebración prematura:** alumno levanta el brazo, choca palmas con el coach, celebra haber pasado la ola — antes de estar en arena seca.
- **Falta de tensión saludable:** el tono muscular necesario para responder cae. Si llega espuma, la reacción es lenta porque el cuerpo estaba en modo "descanso".
- **Mirada al cielo / alrededor:** alumno observa el paisaje, otros surfers, el sol. No está en modo operativo.
- **Micro-relajación final:** los últimos 3-4 pasos son los más descuidados, aunque la espuma puede alcanzar hasta ahí.

---

## WHY IT HAPPENS

1. **Framing cultural de "volver = descansar":** en deportes terrestres, volver al punto de origen suele marcar el fin del esfuerzo. El alumno aplica ese modelo al mar.
2. **Alivio emocional tras giro exitoso:** el alumno sintió tensión durante STP-007 y STP-008. Cuando logra girar, el alivio es grande y se traduce en relajación total.
3. **Coach mal modelado:** si el coach trata el retorno como "ya está", el alumno modela esa actitud.
4. **Falta de criterio de cierre:** si el alumno no sabe exactamente dónde termina el paso (¿el agua? ¿la arena? ¿la sombrilla?), su cerebro elige el momento más fácil de cerrar, que suele ser demasiado temprano.
5. **Ansiedad post-ejecución:** paradójicamente, tras una ejecución de alta demanda, el cerebro busca descomprimir rápido. Volverse pasivo es una forma de descomprimir.
6. **Sesión larga / fatiga:** tras 45-60 minutos en el agua, la capacidad de mantenerse engaged cae. La pasividad es la ruta de menor resistencia.
7. **Validación social:** el alumno quiere compartir el logro con el coach ("¿viste cómo giré?"). Interrumpe la ejecución para comunicar.
8. **Instalación de patrón en sesiones anteriores:** si en sesiones previas el alumno se relajaba y no fue corregido, el patrón se instaló.

---

## WHY IT MATTERS

**Gateway a errores graves:**
- El retorno pasivo es el **terreno fértil** para ERR-WB-029 (no mirar atrás) y ERR-WB-031 (no responder). La relajación es lo que permite que esos fallos ocurran.
- Si se corrige la pasividad, los otros dos errores disminuyen automáticamente.

**Dilución del principio TSS:**
- TSS se funda sobre la idea de **awareness continua**. Un retorno pasivo es la negación de ese principio. Es la forma más visible de "no-TSS".
- Si el coach permite retornos pasivos, ha abandonado la metodología.

**Consolidación de patrón equivocado:**
- El patrón emocional de "relajarse cuando empieza a sentirse seguro" es profundo. Si se instala en White Belt, se arrastra a Yellow (paddle back), Orange (wave exit), y más allá.
- En Yellow Belt, relajarse tras una ola significa perder posición, dejarse llevar por corriente, y terminar la sesión en lugar equivocado.
- En niveles avanzados, relajarse tras una bajada puede significar no reaccionar a la siguiente ola encima del surfer.

**Coach-safety issue:**
- Un alumno relajado no escucha bien. Si el coach necesita darle una instrucción urgente, la respuesta es lenta.
- Esto compromete la capacidad del coach de mantener la sesión segura.

**Calidad percibida:**
- A ojos del observador, un retorno pasivo "se ve como que ya está". Al coach TSS entrenado, se ve como un fallo.
- Si esto se televisa o fotografía como "enseñanza TSS", la marca se diluye.

---

## HOW TO DETECT

**Visual — postura:**
- Hombros caídos → pasivo.
- Hombros activos, espalda recta → engaged.

**Visual — tabla:**
- Tabla arrastrada por leash o sostenida con una mano floja → pasivo.
- Tabla en SIDE + TAIL + CENTER activo → engaged.

**Visual — rostro:**
- Sonrisa amplia, mirada dispersa → alumno celebrando, no operando.
- Cara concentrada, mirada en movimiento → engaged.

**Verbal:**
- Alumno habla de cosas no relacionadas durante el retorno → pasivo.
- Alumno silencioso o verbalizando key words → engaged.

**Temporal:**
- Ritmo de paso casual / paseo → pasivo.
- Ritmo firme, decidido → engaged.

**Cierre:**
- Alumno sigue caminando al mismo ritmo incluso en arena seca → no diferenció final.
- Alumno se detiene exactamente en la línea, tabla bajo brazo, respiración → cerró bien.

---

## HOW TO CORRECT

**Intervención inmediata:**
1. Coach dice: **"Stay switched on. No terminó."**
2. Alumno recompone postura, re-engages.
3. Coach cuenta lo que falta: "3 metros. Stay sharp."

**Intervención pedagógica:**
- Coach pregunta post-rep: "¿En qué parte del retorno pensaste 'ya está'?"
- Alumno verbaliza. Coach corrige: "Ese momento es el más peligroso. No existe en TSS."
- Coach establece: "Terminó cuando tus pies están en arena seca, tabla bajo brazo, y decís la anchor phrase. Ni un segundo antes."

**Intervención estructural (definir el cierre):**
- Coach designa un **punto específico de llegada** visible: "Esa piedra, esa sombrilla, esa marca en la arena."
- Hasta ese punto, modo operativo total. Después de ese punto, el paso termina.
- Esto resuelve la ambigüedad de "¿cuándo termina?".

**Intervención del ritual de cierre:**
- Al llegar, alumno ejecuta ritual: detenerse, tabla en SIDE bajo brazo, mirar una vez más atrás (final check), respirar profundo, decir anchor phrase.
- El ritual convierte el cierre en un evento marcado, no en un fade-out.

**Intervención del framing:**
- Coach explica: "El retorno no es descansar. Es surfear hacia la orilla. Es parte de la sesión, no el epílogo. Si el retorno falla, toda la sesión falla, aunque hayas ejecutado perfecto todo lo anterior."

**Intervención correctiva de celebración prematura:**
- Si alumno festeja antes de llegar: coach dice "No festejo todavía. Termino primero."
- Reconvierte la energía de celebración en energía operativa hasta el cierre.

**Intervención de fatiga:**
- Si la pasividad es crónica y correlaciona con sesión larga: cortar sesiones más cortas.
- Mejor 20 minutos con engagement total que 45 con degradación progresiva.

---

## COACH-SIDE CHECK

- ¿Yo definí punto específico de llegada antes del primer retorno?
- ¿Yo establecí ritual de cierre explícito?
- ¿Yo modelo "retorno como surf" o modelé "retorno como descanso"?
- ¿Yo celebré con el alumno antes de arena seca (cómplice de pasividad)?
- ¿Yo permití que el alumno me hable durante el retorno, cómplice de la desconexión?

---

## DOES THE REP COUNT?

- **Retorno con engagement total hasta LAND:** rep cuenta.
- **Retorno con micro-pasividad no comprometedora (última 2-3 pasos ligeramente relajados, sin consecuencia):** rep puede contar si el coach lo corrigió y el cierre fue limpio.
- **Retorno con relajación notable pero sin incidente:** rep marcado como "parcial" — alumno cruzó arena seca pero el patrón no fue TSS.
- **Retorno con relajación + incidente (no vio espuma, no reaccionó, etc.):** rep NO cuenta.
- **Sesión completa con patrón progresivo de pasividad:** sesión NO cuenta. No se certificó el principio de awareness continua.

---

## RELATED ERRORS

- **`ERR-WB-029`** No Backward Awareness (consecuencia típica: alumno pasivo no mira atrás).
- **`ERR-WB-031`** Failure to Re-Maneuver (el alumno pasivo no tiene energía para responder).
- `ERR-WB-018` Let Go Completely (STP-005 base: patrón de soltar la tabla cuando "parece seguro").
- `ERR-WB-028` Rushed Pivot (polaridad opuesta: apuro vs pasividad. Ambos son fallos de regulación emocional — el alumno debe aprender a estar "calmo pero activo").

---

## DOCTRINAL NOTE

Este error es el manifestacion de una **falla de framing**, no de skill. El alumno técnicamente sabe qué hacer. Simplemente cree que ya no hay que hacerlo.

La corrección es principalmente **psicológica/doctrinal**: hay que reconstruir el modelo mental del alumno sobre qué es el retorno.

El alumno que internaliza correctamente vive el retorno no como descanso sino como la última fase activa de la sesión. La sensación no es "ya terminé", sino "estoy cerrando con control".

**TSS Principle:** Relax is a mode. Operating is another mode. In White Belt, you only relax on dry sand. Everywhere else, you operate — even if calmly.

**TSS Principle (reforzado):** Calm and passive are not the same. Calm is operational with low tension. Passive is checked-out. White Belt returns must be calm, never passive.

**TSS Hard Standard (cultural):** Un coach que permite retornos pasivos enseña un surf distinto al TSS. La diferencia entre TSS y un curso genérico es exactamente esto: cuándo "termina" la sesión.

---

*TSS® Error DB · ERR-WB-030 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-009*

---

### ERR-WB-031_Failure_to_Re_Maneuver

## ERR-WB-031 — FAILURE TO RE-MANEUVER

**Parent step:** STP-009 Walk Back to the Sand
**Belt:** White Belt
**Severity:** HIGH
**Type:** Student-caused (decisión / ejecución)
**Version:** v1.0

---

## WHAT IT LOOKS LIKE

Durante el retorno, llega una espuma entrante. El alumno la **vio** (o debería haberla visto), pero **no ejecuta ADJUST** — no gira (STP-008), no pasa (STP-007), no acelera, no toma ninguna acción correctiva. La espuma lo alcanza en posición vulnerable.

Variantes observables:
- **Parálisis por visibilidad parcial:** alumno mira atrás, ve la espuma, pero no sabe qué hacer. Se queda mirándola llegar.
- **Decisión tardía:** alumno decide responder pero demasiado tarde. Empieza a girar justo cuando la espuma lo alcanza.
- **Decisión incorrecta:** alumno elige la acción equivocada (ej: sigue caminando cuando debería girar; gira cuando debería pasar; pasa cuando debería haber esperado).
- **Abort sin plan:** alumno reconoce que debe responder pero ejecuta algo entre acciones (medio giro + medio paso), perdiendo tiempo y posición.
- **Confianza en suerte:** alumno ve la espuma, ve que viene pequeña, decide "va a llegar antes al final del paso, me la banco". A veces acierta, a veces no.
- **Dependencia del coach:** alumno mira al coach esperando instrucción en lugar de decidir. Si el coach no dice nada, el alumno tampoco actúa.

Indicador crítico: alumno es golpeado por espuma **a pesar de haberla visto** → confirmación de ERR-WB-031 (awareness presente pero decisión/ejecución fallidas).

---

## WHY IT HAPPENS

1. **Awareness sin decisión-protocolo:** el alumno sabe que debe mirar atrás y lo hace. Pero nadie le explicó qué **hacer** con la información. Scanning sin framework de decisión.
2. **STP-007 o STP-008 no consolidados dinámicamente:** el alumno los practicó en condiciones controladas con tiempo de preparación. Cuando aparecen "on demand" durante retorno, no los ejecuta bien.
3. **Ansiedad de decisión bajo presión:** ver la espuma llegando activa ansiedad. La ansiedad paraliza. El cerebro entra en modo "freeze" en lugar de "fight/flight informado".
4. **Falta de criterio threshold:** el alumno no tiene regla clara de cuándo responder. "Si la espuma está a más de 5 metros, sigo. Si está a menos, giro." Sin threshold, cada decisión es ad-hoc.
5. **Sobre-estimación del timing:** el alumno cree que "tengo tiempo", y no tiene. Subestima la velocidad de la espuma.
6. **Sub-estimación del tamaño:** "Es chica, me la banco." Pero la física del impacto + posición desbalanceada = caída.
7. **Dependencia cultivada:** si el coach le dijo "girá" cada vez en sesiones previas, el alumno nunca desarrolló decisión autónoma.
8. **Fatiga / desgaste:** ejecutar STP-007 o STP-008 requiere energía. Tras múltiples reps, el alumno "elige" no responder para conservar energía.

---

## WHY IT MATTERS

**Safety crítico:**
- Este es el error que **causa el golpe**. ERR-WB-029 (no mirar) es el error que permite que el golpe ocurra sin aviso. ERR-WB-031 es el error que permite que el golpe ocurra **con aviso**.
- El caso "con aviso" es más documentable y más grave pedagógicamente: el alumno tenía la información y no la usó.

**Ruptura del loop de integración TSS:**
- STP-009 está diseñado para **integrar** STP-007 y STP-008 en uso dinámico. Si el alumno no re-maniobra, la integración no se logra.
- Significa que el alumno certificó STP-007 y STP-008 en aislamiento pero **no los sabe usar**. Conocimiento sin aplicación.
- Esto expone un problema de certificación anterior: los pasos se pasaron como skills aislados, no como componentes de un sistema.

**Patrón de inacción ante amenaza:**
- Un alumno que no actúa ante espuma entrante va a tener el mismo patrón ante olas mayores en Yellow Belt.
- El patrón "ver-pero-no-actuar" en surf avanzado es causa de lesiones graves.

**Dilución doctrinal:**
- TSS se funda sobre "awareness → decisión → acción" como tríada. Si la awareness queda sin acción, TSS queda incompleto.
- Un alumno TSS que falla acá demuestra que entendió 1/3 del principio.

**Responsibilidad del coach:**
- Este error es frecuentemente un **fallo de pedagogía previa**. Si el alumno llegó a STP-009 sin capacidad de decidir y ejecutar ADJUST, algo falló en cómo se enseñaron los pasos 7 y 8.
- Requiere revisión del proceso de certificación de pasos anteriores.

---

## HOW TO DETECT

**Durante el retorno:**
- Observar si alumno, al ver espuma, **cambia de comportamiento**. Si cambia (acelera, gira, se prepara), scanning → acción está operando.
- Si no cambia (sigue el mismo paso, cabeza vuelve al frente, sigue caminando), acción falló.

**Post-impacto:**
- Si el alumno es golpeado: coach pregunta "¿La viste?" Si responde "Sí" → ERR-WB-031 confirmado. Si responde "No" → ERR-WB-029 confirmado.

**Verbal (pre-rep):**
- Coach pregunta: "Si ves espuma llegando a 3 metros, ¿qué hacés?"
- Si el alumno no tiene respuesta clara o titubea → el framework de decisión no está instalado.

**Comportamiento pasivo-observador:**
- Alumno que ve espuma, se queda mirándola, sin ejecutar nada → ERR-WB-031 sintomático.

---

## HOW TO CORRECT

**Intervención inmediata (si espuma llega y alumno no responde):**
1. Coach grita: **"¡Girá!"** (o "Pasá!" según corresponda)
2. Alumno ejecuta la acción.
3. Tras rep, coach pregunta: "¿Por qué no reaccionaste solo?"
4. Alumno verbaliza. Coach identifica causa (parálisis / no sabía qué / confianza en suerte).

**Intervención pedagógica (framework de decisión):**
- Coach instala threshold explícito ANTES del rep:
  - **"Espuma > 5m y chica:** seguí caminando, vas a llegar antes."
  - **"Espuma 3-5m y manejable:** PASS (STP-007). No dejes de caminar."
  - **"Espuma < 3m o grande:** TURN (STP-008). Giro + espera + re-orientación."
  - **Duda:** default a TURN. Siempre más seguro.
- Alumno repite el framework verbalmente hasta memorizarlo.

**Intervención drill-específica (decisión forzada):**
- Coach crea escenarios durante retorno: "Decime qué hacés con esa espuma."
- Alumno decide verbalmente **mientras camina**, sin ejecutar aún.
- Coach confirma o corrige.
- Progresión: verbal → verbal + gesto → ejecución completa.

**Intervención drill-retrospectiva (post-error):**
- Tras rep fallido, coach y alumno recrean el momento: "Acá vos viste la espuma. Acá tenías que decidir. ¿Qué hubieras hecho correcto?"
- Alumno verbaliza la decisión correcta.
- Se ejecuta de nuevo con la decisión correcta.

**Intervención de consolidación STP-007/008:**
- Si el alumno no ejecuta bien PASS o TURN en contexto dinámico, regresión obligatoria: una sesión de pasajes (STP-007) + una de giros (STP-008) en contexto reactivo antes de volver a STP-009.
- Esto confirma que STP-009 depende 100% de las bases dinámicamente sólidas.

**Intervención de autonomía:**
- Coach se abstiene deliberadamente de dar instrucciones durante 2-3 reps consecutivos.
- Alumno debe decidir solo. Si falla, se analiza. Si acierta, se consolida.
- La dependencia se rompe solo cuando el coach **obliga** al alumno a decidir.

---

## COACH-SIDE CHECK

- ¿Yo instalé framework de decisión (thresholds) antes del primer retorno con espuma?
- ¿Yo certifiqué STP-007 y STP-008 en contexto realmente dinámico, o solo en reps controlados?
- ¿Yo doy instrucciones durante retornos, fomentando dependencia?
- ¿Yo reconocí inacción como error o lo dejé pasar porque "no pasó nada esa vez"?
- ¿Yo practiqué escenarios de decisión (verbales) con el alumno antes del drill?

---

## DOES THE REP COUNT?

- **ADJUST ejecutado correctamente sin intervención del coach:** rep cuenta + crédito especial.
- **ADJUST ejecutado con cue del coach:** rep cuenta a medias — sesión puede contar si al final el alumno es autónomo.
- **No-ADJUST con espuma pequeña sin consecuencia (por suerte):** rep NO cuenta. El principio falló aunque el resultado fue ok.
- **No-ADJUST con golpe / caída / pérdida de tabla:** rep NO cuenta + sesión marcada + regresión probable.
- **Patrón de sesión: alumno nunca decide por sí solo:** sesión NO cuenta. Alumno no demuestra autonomía — no está listo para certificar STP-009.

---

## RELATED ERRORS

- **`ERR-WB-029`** No Backward Awareness (si no mira, no puede decidir; pero ERR-WB-031 es peor porque la info estaba ahí).
- **`ERR-WB-030`** Passive Return (la pasividad general suele incluir inacción decisional).
- `ERR-WB-023` Poor Alignment (STP-007 base: si PASS no estaba instalado, no se puede ejecutar reactivamente).
- `ERR-WB-026` Wrong Turning Direction (STP-008 base: si TURN no estaba instalado, ADJUST via turn es imposible).
- `ERR-WB-025` Board Ripped Away (consecuencia directa si ADJUST falla con espuma alta).

---

## DOCTRINAL NOTE

Este error expone la diferencia entre **conocer los pasos** y **saber usar los pasos**. Un alumno puede pasar STP-007 y STP-008 por separado y aun así fallar acá. Esto significa que TSS no se construye sumando pasos aislados — se construye **integrándolos en un sistema**.

STP-009 es el primer paso donde la integración se prueba. Es, en ese sentido, un **test del sistema**, no solo del retorno.

Si un alumno repetidamente falla ERR-WB-031, el coach debe preguntarse: ¿el alumno certificó STP-007 y STP-008 porque los ejecutó bien en condiciones controladas, o porque los ejecuta bien bajo cualquier condición? Si es la primera, la certificación era precaria.

**TSS Principle:** Awareness without decision is observation. Decision without execution is hesitation. Awareness + Decision + Execution is surfing.

**TSS Principle:** A step is not certified until the student can execute it on demand, in context, under pressure. Step isolation passes are provisional; integration passes are final.

**TSS Hard Standard:** En las sesiones de certificación de STP-009, el alumno debe ejecutar al menos **1 ADJUST correcto sin intervención del coach** — esta es la evidencia de que la integración funciona. Sin al menos un ADJUST autónomo, la certificación es incompleta.

---

*TSS® Error DB · ERR-WB-031 · v1.0*
*IP of Marcelo Castellanos / Enkrateia · White Belt · STP-009*
*Integration failure marker — test del sistema*$tss$
WHERE id = 'STP-009';

UPDATE lessons SET
  description_md = $tss$# STP-010 — GET ON YOUR BOARD · FIND SWEET SPOT

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
*Opening step of M2 — Sweet Spot System / Prone Phase*$tss$,
  drill_md = $tss$# DRL-WB-10 — SWEET SPOT DISCOVERY DRILL

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
*Opening drill of M2 — Sweet Spot System / Prone Phase*$tss$,
  errors_md = $tss$### ERR-WB-032_Nose_Dive_Position

## ERR-WB-032 — NOSE DIVE POSITION

**Step:** STP-010 Get on Your Board · Find Sweet Spot
**Belt:** White Belt · Block 2 · M2
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno está posicionado demasiado adelante sobre la tabla. El peso del cuerpo se concentra sobre el nose. La tabla pierde su línea hidrodinámica: el nose se hunde, agua sube al pecho, la tabla se clava en lugar de flotar.

---

## OBSERVABLE

- Nose por debajo de la línea del agua.
- Agua toca pecho o cara del alumno.
- Tabla no avanza aunque el alumno reme.
- En presencia de ola: la tabla se clava bajo la espuma en vez de ser levantada.
- Visualmente: el tail está muy alto sobre el agua.

---

## WHY IT HAPPENS

1. **Instinto de "agarrarse adelante":** el alumno busca estabilidad mirando hacia adelante y desplaza el cuerpo con la vista.
2. **Tabla muy pequeña:** el alumno compensa subiéndose más adelante.
3. **Miedo a "caerse del tail":** alumno se aleja del tail por precaución.
4. **Falta de referencia física del pecho al centro.**

---

## WHY IT'S DANGEROUS

- **Mecánica destruida:** imposible que la tabla funcione — cada remada es trabajo perdido.
- **Catch imposible:** cuando viene la ola, la tabla no sube por la cara, se clava.
- **Pop-up destinada a fallar:** si el sweet spot está mal, el pop-up nace de un error.
- **Alumno se cansa rápido** porque rema contra resistencia y no contra agua.

---

## COACH INTERVENTION

### Verbal cue
> *"Muy adelante. Slide atrás. Nose apenas flotando."*

### Physical correction
- Coach marca visualmente el nose con gesto ("mirá dónde está").
- Si es necesario, coach ayuda al alumno a desplazarse ~20-30 cm hacia atrás.
- Coach confirma: "ahora. Ahí está el sweet spot."

### Drill correction
- Volver a DRL-WB-10 Rep 2 (error adelante deliberado) + Rep 4 (encontrar centro).
- Reforzar verbalmente: "sentí la diferencia."

---

## FIX PROTOCOL

1. **Para la acción.** No se rema, no se persigue ola con nose dive.
2. **Reset al mount.** Alumno sale de la tabla, vuelve a subir limpio.
3. **Descubrimiento dirigido.** Alumno se posiciona muy adelante → siente el error → desplaza atrás hasta centro.
4. **Verbalización.** Alumno dice en voz alta: "ahora estoy muy adelante / ahora estoy en centro."
5. **Re-test.** 3 reps consecutivos sin nose dive antes de avanzar.

---

## WHEN TO REGRESS

- Si el alumno repite nose dive en 3+ reps consecutivos aún con corrección explícita: regresar a DRL-WB-10 desde V1 (solo mounts).
- Si el alumno rema inmediatamente después del mount sin verificar posición: activar ERR-WB-034 (Premature Paddling) simultáneamente.

---

## COACHING PRINCIPLE

El nose dive no se corrige con "moveté hacia atrás". Se corrige haciendo que el alumno **sienta el error** y luego sienta el correcto. La diferencia entre los dos es lo que enseña, no la instrucción.

El coach también debe verificar que la tabla no sea demasiado pequeña para el alumno. Si es así, el error es de equipamiento, no de técnica.

---

## RELATED ERRORS

- `ERR-WB-033` Stall Position (el opuesto)
- `ERR-WB-034` Premature Paddling (frecuentemente co-ocurre)

---

*TSS® Error DB · ERR-WB-032 Nose Dive Position v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-033_Stall_Position

## ERR-WB-033 — STALL POSITION

**Step:** STP-010 Get on Your Board · Find Sweet Spot
**Belt:** White Belt · Block 2 · M2
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

El alumno está posicionado demasiado atrás sobre la tabla. El peso se concentra sobre el tail. El nose se levanta, el tail se hunde, la tabla arrastra en lugar de deslizar. No importa cuánto reme, la tabla no fluye.

---

## OBSERVABLE

- Nose claramente elevado sobre el agua (ángulo visible).
- Tail sumergido, produciendo resistencia y estela pesada.
- Paddle del alumno produce poco avance — la tabla "frena".
- En presencia de ola: la espuma pasa por debajo del tail en vez de levantar la tabla.
- Alumno siente que "no se mueve" aunque rema fuerte.

---

## WHY IT HAPPENS

1. **Miedo al nose dive:** alumno sobrecompensa alejándose del nose.
2. **Posición natural cómoda:** estar más atrás se siente más estable al principio.
3. **Tabla muy grande:** alumno no llega cómodamente al centro.
4. **Pecho no apoyado en el centro:** alumno apoya pecho detrás del punto correcto.

---

## WHY IT'S PROBLEMATIC

- **Paddle ineficiente:** cada remada produce poco avance → alumno se agota.
- **Catch imposible:** la ola pasa sin tomar la tabla porque el tail está en resistencia.
- **Ilusión de control:** el alumno se siente más "seguro" pero la sesión se pierde.
- **Menos peligroso que el nose dive** (por eso MEDIUM, no HIGH), pero igualmente bloquea progresión.

---

## COACH INTERVENTION

### Verbal cue
> *"Muy atrás. Slide adelante. Tail apenas sumergido, no más."*

### Physical correction
- Coach señala el nose levantado: "mirá el ángulo."
- Coach marca visualmente dónde debería estar el pecho: "acá, sobre esta línea."
- Si es necesario, ayudar físicamente al alumno a desplazarse 10-15 cm adelante.

### Drill correction
- Volver a DRL-WB-10 Rep 3 (error atrás deliberado) + Rep 4 (encontrar centro).
- Pedir verbalización de la sensación en cada posición.

---

## FIX PROTOCOL

1. **Para la acción.** No remar en posición stall.
2. **Ajuste micro.** Alumno desplaza cuerpo 10-15 cm adelante sin cambiar postura.
3. **Verificación visual.** Coach confirma: nose apenas flotando, no más.
4. **Sensación.** Alumno debe verbalizar: "ahora la tabla fluye."
5. **Re-test.** 3 reps consecutivos sin stall antes de avanzar.

---

## WHEN TO REGRESS

- Si el alumno se mantiene en stall aunque corrija adelante — es probable que la tabla sea demasiado grande para él/ella. Reevaluar equipamiento.
- Si el stall aparece solo durante paddle (STP-012): puede ser un problema de paddle biomecánica, no de sweet spot inicial — diagnosticar.

---

## COACHING PRINCIPLE

El stall es menos dramático que el nose dive pero más traicionero: el alumno "parece estar bien" (no se hunde, está cómodo), pero está perdiendo toda la sesión. El coach debe entrenar su propio ojo para ver el ángulo del nose — ahí está la pista.

Regla visual: si podés ver claramente el nose desde el costado, está mal. Si el nose apenas se ve sobre la línea del agua, está bien.

---

## RELATED ERRORS

- `ERR-WB-032` Nose Dive Position (el opuesto)
- `ERR-WB-034` Premature Paddling (exacerba el stall)

---

*TSS® Error DB · ERR-WB-033 Stall Position v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-034_Premature_Paddling

## ERR-WB-034 — PREMATURE PADDLING

**Step:** STP-010 Get on Your Board · Find Sweet Spot
**Belt:** White Belt · Block 2 · M2
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno empieza a remar antes de haber encontrado el sweet spot. Salta la fase de posicionamiento porque ve una ola, o porque tiene ansiedad de catch, o porque no se instaló la regla doctrinal. Resultado: rema desde una posición mecánicamente incorrecta y toda la secuencia siguiente falla.

---

## OBSERVABLE

- Alumno se sube a la tabla y sin pausa empieza a mover los brazos.
- Coach dice "sweet spot" y el alumno sigue remando igual.
- Alumno ve ola entrante y salta directo a paddle sin ajustar.
- Tabla visiblemente mal posicionada (nose dive o stall) pero con brazos en movimiento.
- Progresión degradada: catch falla, cobra débil, pop-up desde error.

---

## WHY IT HAPPENS

1. **Instinto de urgencia:** "hay ola, hay que remar."
2. **Regla doctrinal no instalada:** coach no enforzó "sweet spot antes de cualquier otra cosa" desde el primer rep.
3. **Miedo a perderse la ola.**
4. **Copia de otros surfistas** que reman apurados sin referencia.
5. **Falta de conciencia mecánica:** alumno no conecta posición con eficiencia.

---

## WHY IT'S DANGEROUS

- **Corrompe TODO lo que sigue:** el error se hereda a STP-011, 012, 013, 016.
- **Crea hábito difícil de romper** si no se ataca en White Belt.
- **Alumno se frustra** porque "rema mucho y no pasa nada" — y el diagnóstico real está en el sweet spot, no en la remada.
- **Doctrina TSS rota:** si este paso no enseña orden, los siguientes tampoco lo harán.

---

## COACH INTERVENTION

### Verbal cue
> *"Freno. Sweet spot primero. Después remamos."*

### Hard stop
- Coach interrumpe físicamente (mano en tabla si es necesario) y detiene el paddle.
- No es castigo — es un reset pedagógico.

### Re-install the rule
- Coach repite verbalmente: *"Sweet spot antes de cualquier otra cosa."*
- Alumno debe responder: *"entendido."*

### Drill correction
- Volver a DRL-WB-10 Variation V5 (test del orden): coach dice "rema" falsamente. Alumno NO rema. Práctica explícita del orden.

---

## FIX PROTOCOL

1. **Interrumpir remada en curso.** No permitir que termine el ciclo erróneo.
2. **Reset completo:** alumno baja de tabla, vuelve a STP-006 al lado.
3. **Re-mount.**
4. **Obligatoriedad de verificación:** alumno debe verbalizar "estoy en sweet spot" antes de cualquier movimiento de brazo.
5. **Si ola entra durante verificación:** la ola se pierde. Esa es la lección. Sweet spot es prioridad absoluta.
6. **Re-test:** 3 reps consecutivos con orden respetado antes de avanzar.

---

## WHEN TO REGRESS

- Si el alumno repite premature paddling en múltiples sesiones: activar DRL-WB-10 V5 como entrenamiento específico de orden.
- Si el alumno no internaliza la regla: pausar progresión a STP-011 hasta que el orden esté instalado.

---

## COACHING PRINCIPLE

Este error no es mecánico. Es doctrinal. El coach está enseñando **una jerarquía de acción**, no una técnica. Si el alumno rompe la jerarquía, el rep no cuenta.

El coach debe estar dispuesto a "dejar perder" olas durante este drill. El alumno tiene que entender que una ola mal tomada no vale nada comparada con una ola bien tomada — y la diferencia empieza en el sweet spot.

**La regla no es del coach. La regla es de la mecánica de la tabla.** El coach solo la traduce.

---

## RELATED ERRORS

- `ERR-WB-032` Nose Dive Position (causa mecánica subyacente cuando se rema desde adelante)
- `ERR-WB-033` Stall Position (causa mecánica subyacente cuando se rema desde atrás)

---

*TSS® Error DB · ERR-WB-034 Premature Paddling v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-010';

UPDATE lessons SET
  description_md = $tss$# STP-011 — GET ALIGNED WITH THE WHITE WATER

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-11 — WHITEWATER ALIGNMENT DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-035_Angled_Nose

## ERR-WB-035 — ANGLED NOSE

**Step:** STP-011 Get Aligned with the White Water
**Belt:** White Belt · Block 2 · M2
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno inicia paddle con el nose de la tabla cruzado respecto a la dirección del foam. La tabla está desalineada. Cualquier ángulo mayor a ~10° produce que la espuma entre de costado y no empuje — o peor, desestabilice.

---

## OBSERVABLE

- Visto desde atrás/costado: nose apunta en dirección distinta a la de la espuma.
- La ola llega y la tabla se tuerce bajo el alumno.
- Alumno "patina" de costado en lugar de avanzar.
- Rail se hunde antes que el otro.
- Catch falla: ola pasa sin conectar.

---

## WHY IT HAPPENS

1. No hizo shoulder check (adivinó dirección).
2. Leyó mal la espuma.
3. Alineó inicialmente bien pero no compensó corriente.
4. Tiene prisa: alineó "cerca" y arrancó.
5. No entiende que ±10° es el umbral (cree que "casi" alinea).

---

## WHY IT'S DANGEROUS

- **Caída lateral garantizada** si la ola es mediana o grande.
- **Catch imposible** aunque el sweet spot y el paddle sean correctos.
- **Cascada de fallos** hacia cobra, pop-up.
- **Fatiga injustificada** porque el alumno rema sin que la tabla avance.
- **Impact lateral** puede lanzar tabla contra alumno (hard-line adjacente a ERR-WB-014).

---

## COACH INTERVENTION

### Verbal cue
> *"Nose cruzado. Realineá. ¿Dónde va el foam?"*

### Visual correction
- Coach apunta con dedo la dirección real del foam.
- Coach apunta la dirección del nose del alumno.
- Alumno ve la diferencia.

### Drill correction
- Volver a DRL-WB-11 Rep 2-4 (READ + SHOULDER + ALIGN dirigidos).
- Si persiste: V2 (verbalización obligatoria antes de alinear).

---

## FIX PROTOCOL

1. **Parar paddle si está en curso.**
2. **Reset a sweet spot + shoulder check.**
3. **Verbalización obligatoria:** alumno dice "el foam va para ___" y "alineo hacia ___".
4. **Coach verifica ángulo visualmente antes de permitir paddle.**
5. **Re-test:** 3 reps consecutivos con ángulo correcto antes de avanzar.

---

## WHEN TO REGRESS

- Si el alumno repite ángulo incorrecto: volver a enseñar lectura del foam antes de intentar alinear de nuevo.
- Si el alumno lee bien pero ejecuta mal el giro con manos: drill específico de pivot con manos en prono.

---

## COACHING PRINCIPLE

Angled nose no es pereza — casi siempre es falta de lectura. Si el alumno no ve bien el foam, nunca va a alinear bien. El coach debe trabajar lectura primero, mecánica de giro después.

**Regla visual del coach:** parate detrás del alumno cuando llega el foam. Si vos ves la espuma pasar limpia por debajo del tail al nose, está bien. Si la ves chocar contra el rail lateral, está mal.

---

## RELATED ERRORS

- `ERR-WB-036` No Shoulder Check (causa principal)
- `ERR-WB-037` Alignment Drift (variante temporal)
- `ERR-WB-034` Premature Paddling (co-ocurre cuando hay prisa)

---

*TSS® Error DB · ERR-WB-035 Angled Nose v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-036_No_Shoulder_Check

## ERR-WB-036 — NO SHOULDER CHECK

**Step:** STP-011 Get Aligned with the White Water
**Belt:** White Belt · Block 2 · M2
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

El alumno omite la mirada por encima del hombro antes de alinear la tabla. Asume la dirección del foam sin verificar. Alinea al azar o basado en una lectura superficial (solo oyó, solo sintió).

---

## OBSERVABLE

- Alumno mueve la tabla sin girar cabeza.
- Shoulder check amagado (cabeza gira apenas, sin rotación real de torso).
- Alumno dice "alineé" pero nunca miró atrás.
- En reps sucesivos, el ángulo es inconsistente (a veces bien, a veces mal).

---

## WHY IT HAPPENS

1. **Rigidez física:** alumno no rota cómodamente en prono.
2. **Prisa:** cree que no tiene tiempo para mirar.
3. **Falta de enseñanza explícita:** coach no demostró shoulder check claro.
4. **Confianza falsa:** "ya vi dónde viene el foam hace 10 segundos".
5. **Miedo a perder sweet spot al girar torso.**

---

## WHY IT'S PROBLEMATIC

- **Fundamento de ERR-WB-035 (Angled Nose):** sin shoulder check, alinear es adivinar.
- **Alumno no desarrolla hábito de lectura activa** — va a arrastrar esta omisión a Yellow Belt y más allá.
- **Inversión cognitiva prona nunca se instala** — y será necesaria en catch, en paddle back, en turn on board.

---

## COACH INTERVENTION

### Verbal cue
> *"Shoulder check. Mirá bien. No alinees ciego."*

### Physical modeling
- Coach en prono al lado del alumno, hace shoulder check exagerado.
- Alumno copia el movimiento.

### Drill correction
- DRL-WB-11 V3 (shoulder check silencioso): coach solo dice "SHOULDER", alumno ejecuta.
- Si rigidez corporal: drill seco previo (en arena, en prono, rotación de torso 20 reps).

---

## FIX PROTOCOL

1. **Exigir verbalización:** alumno debe decir *"el foam viene de ___"* después de shoulder check. Si no miró, no puede decirlo.
2. **Test de lectura:** coach cambia dirección entre reps para forzar lectura nueva cada vez.
3. **Tempo largo al inicio:** dar al alumno tiempo para hacer shoulder check completo, no amague.
4. **Reducción gradual:** con práctica, shoulder check se hace más rápido pero nunca se omite.

---

## WHEN TO REGRESS

- Si el alumno no puede rotar torso cómodamente: drill seco de movilidad antes de intentar en agua.
- Si el alumno "mira" pero no "ve" (no identifica dirección): trabajar percepción visual del agua antes de mecánica de giro.

---

## COACHING PRINCIPLE

Shoulder check no es un gesto — es una decisión. Enseña al alumno que alinear sin mirar es como apuntar con los ojos cerrados. No es técnica avanzada; es honestidad básica con el agua.

**Regla de oro:** si el alumno no puede decir con seguridad de dónde viene el foam, no está autorizado a alinear. Coach detiene y pide mirada explícita.

---

## RELATED ERRORS

- `ERR-WB-035` Angled Nose (consecuencia principal)
- `ERR-WB-029` No Backward Awareness (misma raíz cognitiva, distinto contexto)

---

*TSS® Error DB · ERR-WB-036 No Shoulder Check v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-037_Alignment_Drift

## ERR-WB-037 — ALIGNMENT DRIFT

**Step:** STP-011 Get Aligned with the White Water
**Belt:** White Belt · Block 2 · M2
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

El alumno alinea correctamente, pero entre el momento de alinear y el momento de remar pasa demasiado tiempo. La tabla se desalinea por corriente, viento, o la propia respiración del alumno. El alumno rema sin revisar, creyendo que sigue alineado.

---

## OBSERVABLE

- Alumno ejecuta alignment bien.
- Espera 3-5+ segundos antes de iniciar paddle.
- Tabla rota lentamente por corriente.
- Alumno rema sin segundo check.
- Resultado: nose cruzado aunque "estaba bien hace un momento".

---

## WHY IT HAPPENS

1. **Alumno cree que alignment es "una vez y listo":** no entiende que es dinámico.
2. **Ola demoró en llegar:** tiempo de espera largo, alumno no compensó.
3. **Corriente lateral presente pero no identificada.**
4. **Falta de micro-check antes de paddle.**
5. **Exceso de confianza tras ejecutar alignment correctamente.**

---

## WHY IT'S PROBLEMATIC

- **Resultado idéntico a ERR-WB-035 (Angled Nose)** con la diferencia de que el alumno "hizo todo bien" según su memoria.
- **Más frustrante:** alumno no entiende por qué falló.
- **Enseña al coach a revisar condiciones de spot:** si hay corriente fuerte, drift va a ocurrir seguido y requiere re-alignment más frecuente.

---

## COACH INTERVENTION

### Verbal cue
> *"Alignment es hasta que remás. Revisá antes de remar."*

### Protocol teaching
- Alumno debe hacer "micro shoulder check" justo antes de iniciar paddle.
- No es shoulder check completo — es vistazo rápido para confirmar que nose sigue alineado.

### Environmental awareness
- Coach explica al alumno: "hay corriente acá, tu tabla se gira sola. Tenés que revisar."

---

## FIX PROTOCOL

1. **Introducir micro-check pre-paddle:** parte de la secuencia de ahora en adelante.
2. **Tempo adaptado:** si la ola tarda en llegar, re-alinear en lugar de esperar estático.
3. **Lectura de condiciones:** alumno aprende a reconocer corriente y compensar.
4. **Re-test con tempo largo deliberado:** coach fuerza espera larga, alumno debe re-alinear.

---

## WHEN TO REGRESS

- Si el alumno nunca detecta drift: entrenar percepción de corriente antes de agregar complejidad.
- Si el alumno se olvida del micro-check: agregarlo explícitamente a la secuencia de 5 palabras como sub-paso implícito en READY.

---

## COACHING PRINCIPLE

Alignment drift enseña que el agua no es estática. Lo que está bien ahora puede no estar bien en 3 segundos. Esta es una lección cognitiva más que mecánica: el alumno tiene que aprender a **revisar antes de actuar**, incluso si acaba de terminar de preparar.

Para el coach: si ves que el alumno hace alignment impecable y al remar está cruzado, no es error de alignment — es drift. Diagnóstico diferencial importante.

**Regla doctrinal extendida:** *"Alignment is valid until the moment you paddle. Not before."*

---

## RELATED ERRORS

- `ERR-WB-035` Angled Nose (manifestación visible del drift)
- `ERR-WB-034` Premature Paddling (contrario: aquí el problema es esperar demasiado)

---

*TSS® Error DB · ERR-WB-037 Alignment Drift v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-011';

UPDATE lessons SET
  description_md = $tss$# STP-012 — PADDLE TO CATCH WHITE WATER

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-12 — WHITEWATER CATCH PADDLE DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-038_Late_Paddling_Start

## ERR-WB-038 — LATE PADDLING START

**Step:** STP-012 Paddle to Catch White Water
**Belt:** White Belt · Block 2 · M2
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno inicia el paddle cuando la espuma ya está demasiado cerca o ya encima. No tiene espacio ni tiempo para generar velocidad. La ola lo deja atrás sin posibilidad de catch.

---

## OBSERVABLE

- Alumno estático mirando la ola acercarse.
- Comienza paddle cuando el foam está a <1m.
- Paddle de pánico (muchas brazadas cortas) porque sabe que está tarde.
- Foam pasa por costado/debajo sin tomar tabla.
- Alumno queda atrás visiblemente.

---

## WHY IT HAPPENS

1. **Instinto de esperar:** "primero quiero ver la ola bien".
2. **Miedo a arrancar equivocado:** alumno duda.
3. **No entiende la física:** cree que puede igualar velocidad del foam.
4. **Mala lectura de distancia:** subestima cuán rápido llega.
5. **Coach no calibró distancia inicial correctamente.**

---

## WHY IT'S CRITICAL

- **Bloquea el catch:** no hay manera de corregir si el timing está mal.
- **Crea frustración:** alumno rema sin resultado repetidamente.
- **Se vuelve hábito** si no se ataca temprano.
- **Degrada la sesión completa** — cada ola perdida es aprendizaje perdido.

---

## COACH INTERVENTION

### Verbal cue
> *"Start early. Arrancá ya. La espuma viene a 10 km/h."*

### Timing teaching
- Coach dice "Go" al principio, con timing correcto.
- Alumno aprende el momento por repetición guiada.
- Gradualmente, alumno decide solo.

### Physics translation
- Explicar: "Vos remando: 4 km/h. Foam: 10 km/h. No podés alcanzarla desde cerca."

---

## FIX PROTOCOL

1. **Coach elige timing:** "Go" cuando la distancia es correcta (1-4m según condiciones).
2. **Alumno arranca al comando.** No debate, ejecuta.
3. **Feedback inmediato post-rep:** "timing ok" o "tarde — la próxima 1 segundo antes".
4. **Gradual autonomía:** después de 3-5 reps con "Go", alumno decide solo.
5. **Re-test:** 3 catches consecutivos con timing propio correcto.

---

## WHEN TO REGRESS

- Si el alumno no puede leer distancia: drill de observación sin catch — solo mirar olas y decir "ya / esperá / ya".
- Si el alumno tiene miedo estructural: bajar intensidad (olas más chicas) para construir confianza antes de timing.

---

## COACHING PRINCIPLE

El timing no es intuitivo para alumnos nuevos. La ola se ve "lejos" hasta que "está encima" — la transición parece instantánea. El coach debe calibrar la percepción del alumno mostrándole que la "distancia cómoda" es en realidad distancia tarde.

**Regla práctica:** si el alumno siente que está arrancando "demasiado temprano", probablemente está arrancando a tiempo. La sensación de "ya" es el punto de tarde.

---

## RELATED ERRORS

- `ERR-WB-040` Stopping Before Contact (a veces co-ocurre: arranca tarde + se frustra + para)
- `ERR-WB-039` Downward Push (compensación incorrecta: "si rema más fuerte, llego" — no, llegás mal)

---

*TSS® Error DB · ERR-WB-038 Late Paddling Start v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-039_Downward_Push

## ERR-WB-039 — DOWNWARD PUSH

**Step:** STP-012 Paddle to Catch White Water
**Belt:** White Belt · Block 2 · M2
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno entra la mano al agua con una trayectoria que empuja el agua hacia abajo en lugar de tirar el agua hacia atrás. La fuerza generada no mueve la tabla adelante — la levanta. El nose sube, la tabla se estanca, y el paddle se convierte en trabajo sin resultado.

---

## OBSERVABLE

- Nose de la tabla se levanta visiblemente al remar.
- Tabla "rebota" en lugar de fluir.
- Agua salta hacia adelante en cada brazada (splash).
- Alumno se cansa pero no avanza.
- Entrada de la mano: palma hacia el suelo, brazo recto empujando.

---

## WHY IT HAPPENS

1. **Instinto de "empujar":** alumno piensa en mover el agua, no en tirar de ella.
2. **Brazo recto en lugar de curva:** no hay posición de pull.
3. **Elbow low en recovery:** brazo trabaja desde hombro, no articulado.
4. **Prisa por generar velocidad:** alumno hace fuerza bruta.
5. **Copia mal lo que vio:** puede haber visto nadadores empujando agua distinto.

---

## WHY IT'S CRITICAL

- **Tabla no avanza:** catch imposible sin importar cuánto rema.
- **Desperdicio energético:** alumno se agota sin resultado.
- **Nose levantado = stall:** la tabla pierde la línea hidrodinámica.
- **Técnica incorrecta se vuelve hábito:** difícil desaprender si no se ataca temprano.

---

## COACH INTERVENTION

### Verbal cue
> *"Pull back, go forward. Tirá el agua hacia atrás, no hacia abajo."*

### Visual demo
- Coach hace brazada correcta en seco, mostrando trayectoria de la mano: entrada, anclaje, pull back.
- Coach hace brazada incorrecta (push down) con nose subiendo.
- Alumno compara visualmente.

### Physical correction
- Coach pone mano en el hombro del alumno durante la brazada para enseñar arco del brazo.

---

## FIX PROTOCOL

1. **Reset mecánico:** alumno para de remar, vuelve a ready.
2. **Drill seco:** en la orilla, alumno practica 10 brazadas en el aire — entrada dedos, arco, pull back.
3. **Drill técnico sin catch:** V2 (DRL-WB-12 V2 — técnica pura sobre flat water).
4. **Verificación visual:** coach chequea que el nose NO se levanta al remar.
5. **Re-test:** 3 catches con técnica correcta antes de avanzar.

---

## WHEN TO REGRESS

- Si persiste el push down: ir a drill seco exclusivo antes de volver al agua.
- Si el alumno tiene limitación de movilidad de hombro: ajustar técnica a la anatomía (elbow menos alto pero con dirección correcta).

---

## COACHING PRINCIPLE

El paddle de surf NO es el paddle de natación. Es más corto, más adelante, y la dirección de fuerza es hacia atrás, no hacia abajo. Si el alumno viene de natación, va a compensar mal — hay que enseñar el paddle de surf explícitamente como diferente.

**Regla mecánica:** el movimiento es "catch + pull" — anclar la mano y tirar del cuerpo hacia la mano. No "empujar el agua para mover el cuerpo".

**Tip visual:** filmar al alumno desde el costado. Si el nose se mueve arriba-abajo con cada brazada, hay push down. Si el nose queda estable y la tabla avanza, pull back correcto.

---

## RELATED ERRORS

- `ERR-WB-038` Late Paddling Start (alumno compensa arrancando fuerte tarde = push down por pánico)
- `ERR-WB-040` Stopping Before Contact (alumno se cansa por push down ineficiente y para)

---

*TSS® Error DB · ERR-WB-039 Downward Push v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-040_Stopping_Before_Contact

## ERR-WB-040 — STOPPING BEFORE CONTACT

**Step:** STP-012 Paddle to Catch White Water
**Belt:** White Belt · Block 2 · M2
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

El alumno ejecuta paddle correctamente al inicio, pero detiene la remada uno o dos strokes antes de que la espuma tome la tabla. El momento crítico del pick-up se pierde. La ola pasa sin completar el catch.

---

## OBSERVABLE

- Alumno inicia con buen timing y técnica.
- A medio camino, detiene brazos (los deja al costado o los pone sobre la tabla).
- Foam llega pero no toma la tabla — alumno perdió el último metro.
- Alumno justifica post-rep: "creí que ya iba", "sentí que no llegaba".

---

## WHY IT HAPPENS

1. **Inseguridad:** duda de si el catch va a suceder.
2. **Cansancio:** llega con poca reserva y afloja antes de terminar.
3. **Anticipación incorrecta:** cree que la ola ya lo tomó cuando aún no.
4. **Miedo a cobra temprano:** se prepara para la siguiente fase antes de tiempo.
5. **Coach ha permitido parar antes** en reps anteriores sin corrección.

---

## WHY IT'S PROBLEMATIC

- **El pick-up depende del último metro.** El alumno hace el 95% del trabajo pero pierde el 5% crítico.
- **Enseña mal al cuerpo:** si se permite parar cerca del contact, el cuerpo aprende a parar ahí por default.
- **Resultados inconsistentes** incluso en condiciones idénticas porque el alumno tiene "momentos de confianza" vs no.

---

## COACH INTERVENTION

### Verbal cue
> *"Don't stop. Rema hasta que la ola te tome. La ola te termina de meter."*

### Real-time cue during paddle
- Coach grita "¡No pares!" si ve que el alumno está por parar.
- Coach cuenta strokes en voz alta si ayuda.

### Feedback inmediato post-rep
- "Paraste 2 strokes antes. La próxima, 2 strokes más."

---

## FIX PROTOCOL

1. **Explicar la física del pick-up:** "la ola completa el catch, pero solo si vos llegaste al momento del contact."
2. **Drill de commitment (V3):** coach finge decir "la perdiste" antes de contact. Alumno debe no parar.
3. **Stroke count externo:** coach cuenta "1-2-3-4-..." hasta que la ola toma. Alumno sabe que "el último número" es la ola, no él.
4. **Re-test:** 3 catches con remada sostenida hasta pick-up visible.

---

## WHEN TO REGRESS

- Si el alumno tiene cansancio: acortar sesión. No entrenar commitment bajo fatiga.
- Si el alumno tiene miedo estructural al catch: trabajar confianza con olas más chicas primero.

---

## COACHING PRINCIPLE

El alumno que para antes no es flojo — es inseguro. La corrección no es "más fuerte" — es "hasta que te tome la ola". Enseñar que la ola es parte del catch, no un obstáculo al catch.

Este error también enseña al coach a diagnosticar fatiga real vs miedo. Fatiga real → sesión más corta. Miedo → olas más chicas + confianza progresiva. Ambos se corrigen distinto.

**Regla del coach:** nunca celebrar un catch parcial. Si el alumno paró antes y la ola no lo tomó, no cuenta como catch. El estándar debe ser claro.

---

## RELATED ERRORS

- `ERR-WB-038` Late Paddling Start (puede co-ocurrir: tarde + para porque siente que no llega)
- `ERR-WB-039` Downward Push (alumno se cansa por técnica ineficiente y para)

---

*TSS® Error DB · ERR-WB-040 Stopping Before Contact v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-012';

UPDATE lessons SET
  description_md = $tss$# STP-013 — COBRA + TURN LEFT AND RIGHT

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-13 — COBRA RAIL CONTROL DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-041_No_Cobra_Entry

## ERR-WB-041 — NO COBRA ENTRY

**Step:** STP-013 Cobra + Turn Left and Right
**Belt:** White Belt · Block 2 · M2
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

Post-catch, el alumno no entra a cobra: queda con pecho pegado a la tabla, brazos flojos o adelantados, cabeza baja. La tabla no libera nose y el ride se vuelve pesado, breve, o se corta por nose-dive.

---

## OBSERVABLE

- Pecho contra tabla post-pick-up.
- Brazos no extienden.
- Nose clava o lucha por mantenerse.
- Ride dura 1-2 segundos y se corta.
- Alumno intenta girar sin base.

---

## WHY IT HAPPENS

1. **Alumno no sabe que cobra es obligatorio.** Cree que basta con sostenerse.
2. **Coach saltó la enseñanza de cobra** y fue directo a turning.
3. **Cansancio de brazos** por haber remado mucho en el catch.
4. **Miedo a levantar el pecho** (inseguridad, ola se siente grande).
5. **Confusión con pop-up:** alumno espera pop-up y no ejecuta cobra intermedia.

---

## WHY IT'S PROBLEMATIC

- **Sin cobra no hay turning.** El rail no responde.
- **Nose clava** → ride se corta → alumno no puede practicar turning.
- **Rompe la secuencia doctrinal:** cobra es la rampa hacia pop-up. Sin cobra, pop-up también se rompe después.
- **Cuerpo aprende a quedarse pasivo** post-catch, lo cual es hábito difícil de corregir.

---

## COACH INTERVENTION

### Verbal cue
> *"Hands to ribs. Chest up. Ahora."*

### Real-time cue
- Coach grita "¡COBRA!" justo después del pick-up.
- Si el alumno no reacciona, coach pide salir y demostrar en seco de nuevo.

### Feedback inmediato post-rep
- "No entraste a cobra. Pecho abajo. La tabla se ahogó. La próxima: manos a costillas apenas te tome la ola."

---

## FIX PROTOCOL

1. **Regresar a demo seco:** alumno acostado en arena. 10 reps de hands → chest → eyes. Que el cuerpo memorice la posición.
2. **V1 del drill (Cobra solo):** 5 catches donde el único objetivo es entrar cobra. No pedir turning todavía.
3. **Explicar física:** "cuando subís el pecho, el peso se va atrás, el nose se libera. Sin eso, la tabla se traga."
4. **Re-test:** 3 catches consecutivos con cobra visible antes de autorizar turning.

---

## WHEN TO REGRESS

- Si el alumno tiene fatiga real de brazos: acortar sesión. Cobra requiere fuerza mínima en brazos.
- Si el alumno tiene miedo al tamaño de ola: bajar a foam más chica. Cobra se entrena primero en condiciones cómodas.

---

## COACHING PRINCIPLE

Cobra no es opcional ni decorativa. Es **el puente** entre catch y todo lo que viene después. Si el alumno no entra cobra, no hay turning, no hay pop-up, no hay ride real. El coach que autoriza turning sin cobra construye sobre una base rota.

**Regla del coach:** antes de pedir "girá" siempre chequear "¿tiene cobra?". Si no, primero cobra.

---

## RELATED ERRORS

- `ERR-WB-043` Hands Too Far Forward (cobra mal instalada técnicamente)
- `ERR-WB-042` Passive Ride (cobra entra pero no se usa)

---

*TSS® Error DB · ERR-WB-041 No Cobra Entry v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-042_Passive_Ride

## ERR-WB-042 — PASSIVE RIDE

**Step:** STP-013 Cobra + Turn Left and Right
**Belt:** White Belt · Block 2 · M2
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

El alumno entra cobra correctamente pero no intenta dirigir la tabla. Queda en posición estática durante todo el ride. No mira a ningún lado, no activa oblicuos, no presiona rail. La ola termina y el alumno nunca tomó decisión.

---

## OBSERVABLE

- Cobra presente (pecho arriba, brazos extendidos).
- Mirada fija al nose o al piso.
- Cuerpo rígido, sin rotación de tronco.
- Tabla va recto sin intención.
- Ride termina sin haber intentado turn.
- Alumno sale y no puede describir si giró o no (porque no intentó).

---

## WHY IT HAPPENS

1. **Alumno cree que cobra = terminó el paso.** No entendió que cobra es plataforma, no destino.
2. **Miedo a desestabilizar la cobra:** alumno piensa "si me muevo, me caigo".
3. **Sobrecarga cognitiva:** tantas cosas nuevas que cuando logra cobra, se queda ahí "congelado".
4. **Coach no pidió turn explícitamente** o lo pidió muy suave.
5. **Falta de demo de steering:** el alumno no tiene modelo visual de cómo se ve un giro intencional.

---

## WHY IT'S PROBLEMATIC

- **No cumple success criteria:** certificar requiere 3+ giros a cada lado.
- **Hábito de pasividad:** si se permite pasividad en White Belt, persiste en Yellow y más allá.
- **Se pierde la sesión:** el alumno remó, cobró, entró cobra — pero nunca aprendió lo nuevo del paso.
- **Rompe transición a pop-up:** pop-up requiere decisión activa. Pasividad en cobra predice pasividad en pop-up.

---

## COACH INTERVENTION

### Verbal cue
> *"Look where you want to go. Press the rail. Decidí."*

### Real-time cue durante ride
- Coach marca punto visible y grita "¡Mirá ahí!".
- Si alumno no reacciona, coach repite paso en seco post-rep.

### Feedback inmediato post-rep
- "Entraste cobra — perfecto. Pero no giraste. La próxima: cobra + inmediato mirás a un lado. Ojos primero. Después el cuerpo sigue."

---

## FIX PROTOCOL

1. **V2 del drill (Vision first):** alumno entra cobra + coach marca punto visible. Objetivo único: mirar ahí.
2. **V3 del drill (Single-side):** 5 catches girando SOLO derecha. Después 5 SOLO izquierda. Aísla la decisión direccional.
3. **Demo en seco de turning:** coach simula en arena el movimiento tronco + rail. Alumno ve cómo se ve un giro intencional.
4. **Re-test:** 3 catches con giro visible a cada lado.

---

## WHEN TO REGRESS

- Si cobra se está rompiendo al intentar steer: volver a V1 (cobra solo) y solidificar base primero.
- Si alumno tiene sobrecarga cognitiva: reducir a una decisión por ola ("esta ola giro derecha, esta izquierda"). No pedir ambas en mismo ride.

---

## COACHING PRINCIPLE

Pasividad no es flojera — suele ser parálisis por novedad. El alumno tiene cobra, que es nuevo, y se queda ahí porque ya ejecutó algo difícil. El coach debe enseñar que cobra es **el piso** desde donde se decide, no el techo.

**Regla del coach:** celebrar cobra con claridad, pero inmediatamente pedir decisión: "Cobra perfecta. Ahora — ¿a dónde vas?". Esto instala que cobra siempre viene con decisión.

---

## RELATED ERRORS

- `ERR-WB-041` No Cobra Entry (sin base no hay turning)
- `ERR-WB-037` Alignment Drift (pasividad previa al catch)

---

*TSS® Error DB · ERR-WB-042 Passive Ride v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-043_Hands_Too_Far_Forward

## ERR-WB-043 — HANDS TOO FAR FORWARD

**Step:** STP-013 Cobra + Turn Left and Right
**Belt:** White Belt · Block 2 · M2
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

El alumno intenta entrar cobra pero ubica las manos a altura de hombros o más adelante, no a costillas. La cobra se ejecuta con palanca mal posicionada: pecho sube pero postura es inestable, el empuje no libera bien el nose, y la preparación para pop-up queda rota.

---

## OBSERVABLE

- Manos claramente por delante de la línea del pecho.
- Codos extendidos pero lejos del tronco.
- Cobra "alta" pero descontrolada — se tambalea.
- Hombros tensos, trapecios cargados.
- Nose no se libera del todo.
- Cuando coach pide pop-up después (STP-016), manos mal ubicadas hacen que el pie no encuentre apoyo.

---

## WHY IT HAPPENS

1. **Alumno confunde cobra con \"push-up\".** Imita ejercicio de gimnasio con manos a hombros.
2. **No recibió cue específico de \"costillas\"** — solo "brazos extendidos".
3. **Pánico al pick-up:** manos van adelante buscando sostén.
4. **Movilidad limitada de hombros:** alumno no puede anclar manos a costillas cómodamente.
5. **Demo del coach fue ambigua** (no mostró claramente la altura de la mano respecto a las costillas).

---

## WHY IT'S PROBLEMATIC

- **Cobra inestable** → menos nose release real.
- **Preparación de pop-up rota:** la posición de manos en cobra debería ser exactamente la misma desde la cual se ejecuta pop-up. Manos adelante = pop-up desde mala base.
- **Hombros cargados** → alumno se cansa rápido, menos reps útiles.
- **Rail press indirecto:** con manos adelante, el eje del cuerpo está desplazado y la presión de rail se dispersa.

---

## COACH INTERVENTION

### Verbal cue
> *"Hands to ribs. No a los hombros. Costillas."*

### Cue táctil (con permiso)
- Coach toca las costillas del alumno y dice "las manos van acá". Referencia corporal, no solo verbal.

### Feedback inmediato post-rep
- "Manos quedaron adelantadas. La próxima: pulgar toca costilla antes de empujar pecho arriba."

---

## FIX PROTOCOL

1. **Demo seco con marca visual:** coach marca con el dedo la línea de las costillas del alumno. Alumno practica hands-to-ribs 10 veces sin levantar pecho.
2. **Integración pecho arriba:** una vez fijadas las manos a costillas, entonces sumar chest up. Secuencia obligatoria.
3. **Test pop-up seco:** desde cobra con manos a costillas, alumno simula pop-up. Si posición de manos es correcta, pop-up fluye.
4. **Re-test en agua:** 3 catches con cobra + manos a costillas verificadas por coach.

---

## WHEN TO REGRESS

- Si alumno tiene movilidad de hombro limitada: permitir manos ligeramente más adelante pero priorizar que el ángulo de codo y eje de empuje estén bien. No forzar anatomía.
- Si el alumno confunde por pánico: reducir tamaño de ola para bajar el estrés y permitir que el cuerpo aprenda la posición en calma.

---

## COACHING PRINCIPLE

La posición de manos no es cosmética — es ingeniería. Manos a costillas resuelve tres problemas a la vez: cobra estable, rail cargable, pop-up preparado. Manos adelantadas rompe los tres. El coach que no corrige esto hipoteca los siguientes pasos.

**Regla del coach:** nunca aceptar cobra "medio bien" con manos adelantadas. La diferencia entre costillas y hombros parece chica pero cambia toda la mecánica del belt.

---

## RELATED ERRORS

- `ERR-WB-041` No Cobra Entry (ausencia total de cobra)
- `ERR-WB-042` Passive Ride (cobra instalada pero sin uso)

---

*TSS® Error DB · ERR-WB-043 Hands Too Far Forward v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-013';

UPDATE lessons SET
  description_md = $tss$# STP-014 — PRONE DISMOUNT

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-14 — PRONE DISMOUNT SAFETY DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-044_Late_Dismount

## ERR-WB-044 — LATE DISMOUNT

**Step:** STP-014 Prone Dismount
**Belt:** White Belt · Block 2 · M2
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno no decide salir de la tabla a tiempo. Extiende el ride más allá de la zona segura y queda en shallow peligroso (arena muy poca, rocas, shorebreak). El exit se vuelve reactivo, descontrolado, y suele terminar en caída, quilla contra fondo, o lesión.

---

## OBSERVABLE

- Ride se extiende más allá del punto donde debería haber iniciado dismount.
- Alumno mira la arena cuando ya está encima.
- Quilla roza o golpea fondo.
- Exit es pánico, no técnica.
- Post-rep: alumno dice "no me di cuenta", "creí que tenía más".

---

## WHY IT HAPPENS

1. **Alumno está disfrutando el ride** y no quiere cortar.
2. **No aprendió a leer shallow:** no sabe dónde empieza la zona peligrosa.
3. **Falta demo explícita de timing de exit.**
4. **Coach permitió dismounts tardíos en reps anteriores** sin corregir.
5. **Alumno confunde "más largo = mejor"** con "seguro".

---

## WHY IT'S PROBLEMATIC

- **Riesgo físico directo:** muñeca, rodilla, cabeza contra fondo.
- **Daño a la tabla:** quilla golpea, ding inmediato.
- **Rompe el hábito doctrinal:** "Exit before danger" no se instala si se tolera tarde.
- **Enseña mal al cuerpo:** si una vez funcionó el dismount tarde, el alumno cree que siempre puede.
- **Compromete seguridad de otros:** exit descontrolado puede golpear a otro surfer en la zona.

---

## COACH INTERVENTION

### Verbal cue
> *"Decidí AHORA. No esperes la arena."*

### Real-time cue
- Coach grita "¡YA!" cuando el alumno está por pasar el punto de decisión.
- Si el alumno no reacciona, coach interviene físicamente para asegurar safety.

### Feedback inmediato post-rep
- "Saliste 3 segundos tarde. La próxima: apenas veas esa línea de arena, rails."

---

## FIX PROTOCOL

1. **Marcar punto visual de decisión:** coach señala en el agua la línea donde empieza el exit (profundidad, distancia a orilla).
2. **V2 del drill (Early decision trigger):** coach grita "¡YA!" en punto temprano. Alumno ejecuta dismount inmediato.
3. **Drill seco de lectura de shallow:** alumno mira el spot y señala dónde iniciaría dismount antes de entrar al agua.
4. **Re-test:** 3 dismounts consecutivos con decisión autónoma temprana.

---

## WHEN TO REGRESS

- Si el alumno tiene problema de lectura de profundidad, volver a observación de shallow antes de ejecutar.
- Si el alumno extiende ride por disfrute, recordar regla de vida: "el ride es placer, el exit es seguridad. No se negocian".

---

## COACHING PRINCIPLE

Late dismount no es flojera — es falta de internalización de la regla. El alumno no siente la urgencia todavía. El coach debe instalar que **el exit es parte del ride, no un bonus al final**. Un ride sin exit planeado es un ride roto.

**Regla del coach:** nunca celebrar un ride largo si el dismount fue tarde. La regla es clara: exit temprano o no hubo buen ride.

---

## RELATED ERRORS

- `ERR-WB-045` No Rail Grip (suelta la tabla cuando decide tarde)
- `ERR-WB-046` Poor Foot Direction (exit reactivo sin mecánica)

---

*TSS® Error DB · ERR-WB-044 Late Dismount v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-045_No_Rail_Grip

## ERR-WB-045 — NO RAIL GRIP

**Step:** STP-014 Prone Dismount
**Belt:** White Belt · Block 2 · M2
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno ejecuta dismount sin agarrar los rails antes o durante la salida, o suelta los rails al aterrizar. La tabla queda sin control y puede salir disparada por la energía de la ola, golpeando al alumno, a otros surfistas o dañándose.

---

## OBSERVABLE

- Manos sueltas durante o después del exit.
- Alumno apoya palmas en la tabla (no rails) o empuja el deck.
- Tabla sale volando al momento del land.
- Post-land: alumno de pie pero tabla a 2-3 metros.
- Alumno "bailó" — saltó al lado sin conexión.

---

## WHY IT HAPPENS

1. **No recibió cue específico de rails** — solo "bajate".
2. **Miedo al estar cerca de la tabla al caer** — suelta por reflejo.
3. **Pánico por dismount tardío** — suelta para salvarse.
4. **Sin demo táctil de rails** — no sabe qué significa "rails" en la práctica.
5. **Hábito de natación** — suelta objetos al aterrizar.

---

## WHY IT'S PROBLEMATIC

- **Peligro a otros surfistas:** tabla suelta por shorebreak puede pegar a alguien cerca.
- **Peligro al alumno:** tabla puede volver y golpear al propio alumno (efecto péndulo con leash).
- **Daño a la tabla:** tabla sin control puede pegar fondo, rocas, o otro objeto.
- **Rompe la regla central:** "Stay with the board" es ley del surfista. Quien suelta al azar no tiene noción de seguridad.
- **Hábito peligroso:** si se permite una vez, se repite en White Belt y persiste después.

---

## COACH INTERVENTION

### Verbal cue
> *"Rails. Ahora. Y no soltás."*

### Cue táctil
- Coach señala las manos del alumno y pone las suyas en los rails para mostrar posición.
- Demo seco: alumno agarra rails 10 veces con los ojos cerrados, para que la mano recuerde sola.

### Feedback inmediato post-rep
- "Soltaste la tabla al caer. La tabla casi le pega a X. La próxima: manos en rails hasta que estés 100% de pie."

---

## FIX PROTOCOL

1. **Drill seco de rails:** 10 reps de dismount en arena, manos SIEMPRE en rails.
2. **V4 del drill (Rails check):** coach verifica manualmente que rails siguen agarrados post-land.
3. **Re-test con supervisión:** coach acompaña físicamente el primer dismount autorizando "ahora sí podés soltar" solo cuando el alumno está seguro de pie.
4. **Regla instalada:** "Manos sueltan al final, no al principio."

---

## WHEN TO REGRESS

- Si el alumno tiene miedo a la tabla al caer, trabajar confianza con olas muy chicas primero.
- Si hay fatiga de brazos (no puede agarrar con firmeza), acortar sesión — no entrenar rails bajo fatiga.

---

## COACHING PRINCIPLE

Soltar la tabla no es un error técnico — es una **falla doctrinal**. La regla "stay with the board" es una regla de vida del surfista. El coach que tolera soltar la tabla está formando a alguien que lastima a otros.

**Regla del coach:** dismount sin rails NO cuenta como dismount. Aunque el alumno termine de pie. Si soltó rails, se repite.

---

## RELATED ERRORS

- `ERR-WB-044` Late Dismount (suelta por pánico de decisión tardía)
- `ERR-WB-046` Poor Foot Direction (mecánica rota general)

---

*TSS® Error DB · ERR-WB-045 No Rail Grip v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-046_Poor_Foot_Direction

## ERR-WB-046 — POOR FOOT DIRECTION

**Step:** STP-014 Prone Dismount
**Belt:** White Belt · Block 2 · M2
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

Durante la rotación del dismount, el alumno no orienta los pies hacia la dirección del nose de la tabla. Los pies quedan al costado, hacia shore, o en ángulos incorrectos. El aterrizaje se vuelve desequilibrado y suele terminar en caída lateral o torsión de rodilla.

---

## OBSERVABLE

- Pies apuntan hacia un lado (no hacia nose).
- Alumno aterriza girado 90° respecto a la tabla.
- Rodillas se tuercen al contacto con arena.
- Caída lateral inmediata post-land.
- Alumno no puede incorporarse con la energía de la ola (cae sentado).

---

## WHY IT HAPPENS

1. **Alumno no entendió la orientación "feet forward"** — la interpretó como cualquier dirección.
2. **Rotación sobre una sola cadera incompleta** — no terminó el movimiento.
3. **Rodillas al pecho mal ejecutadas:** piernas sueltas, no compactadas.
4. **Falta demo táctil de dirección de pies.**
5. **Apuro por terminar el exit** sin ejecutar la fase rotate completa.

---

## WHY IT'S PROBLEMATIC

- **Riesgo de lesión:** rodilla torcida es de las lesiones más comunes en aterrizajes mal orientados.
- **Pierde la energía de la ola:** la ola empuja en dirección del nose. Si los pies no apuntan ahí, la energía no ayuda — compite.
- **Cae y suelta la tabla:** caída desequilibrada suele romper la regla "stay with the board".
- **Enseña mal secuencia:** si no se corrige, el alumno repite orientación incorrecta.

---

## COACH INTERVENTION

### Verbal cue
> *"Pies al nose. Dirección de la tabla, no a la arena."*

### Cue táctil
- Coach toca los pies del alumno en demo seco y los orienta hacia el nose.
- En seco: alumno practica rotate + feet forward hasta que la dirección sea automática.

### Feedback inmediato post-rep
- "Tus pies quedaron al costado. La próxima: después de rodillas al pecho, girá los pies hasta que apunten hacia adelante, igual que el nose."

---

## FIX PROTOCOL

1. **Demo seco de rotate completo:** alumno acostado, ejecuta rotate → knees → feet forward con coach verificando orientación de pies.
2. **Split-phase drill:** separar rotate de land. Alumno solo rota y coach confirma pies orientados antes de aterrizar.
3. **V1 del drill (Dismount solo):** en agua quieta, sin presión de ola, verificar mecánica.
4. **Re-test:** 3 dismounts con pies orientados correctamente y aterrizaje equilibrado.

---

## WHEN TO REGRESS

- Si el alumno tiene movilidad de cadera limitada, simplificar rotate a un lado solamente (derecha o izquierda).
- Si hay fatiga, acortar sesión — la rotación requiere control motor fino.

---

## COACHING PRINCIPLE

La orientación de pies no es detalle cosmético — es la diferencia entre aterrizaje seguro y caída con riesgo. El coach debe verificar este punto explícitamente, no asumir que "quedó bien".

**Regla del coach:** pies al nose es **no negociable**. Si no quedaron orientados, no cuenta como dismount limpio, aunque el alumno termine de pie.

---

## RELATED ERRORS

- `ERR-WB-044` Late Dismount (apuro compromete mecánica)
- `ERR-WB-045` No Rail Grip (caída desequilibrada rompe rails)

---

*TSS® Error DB · ERR-WB-046 Poor Foot Direction v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-014';

UPDATE lessons SET
  description_md = $tss$# STP-016 — POP-UP

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-16 — 2-SECOND POP-UP CONNECTION DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-047_Back_Foot_First

## ERR-WB-047 — BACK FOOT FIRST

**Step:** STP-016 Pop-Up
**Belt:** White Belt · Block 3 · M3
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

Durante el pop-up, el alumno pone primero el pie de atrás en la tabla, dejando todo el peso hacia atrás. Esto hace que la tabla se frene y pierda velocidad, y el movimiento completo se vuelve descontrolado o se corta.

---

## OBSERVABLE

- Al ejecutar pop-up, alumno apoya pie de atrás antes que el de adelante.
- Peso visiblemente desplazado hacia atrás.
- Tabla se frena de forma abrupta al momento del pop-up.
- Nose sube, velocidad cae, ride se corta.
- Alumno queda en posición comprometida (peso atrás, pie de adelante suelto o tardío).

---

## WHY IT HAPPENS

1. **Secuencia motora mal aprendida:** alumno nunca practicó orden correcto en seco.
2. **Miedo a caer al frente:** pone pie atrás como "seguro".
3. **Imitación incorrecta:** vio a otro alumno o video hacerlo así.
4. **Fatiga:** sin fuerza, compensa con orden incorrecto.
5. **Coach no corrigió en reps anteriores.**

---

## WHY IT'S PROBLEMATIC

- **Tabla se frena:** pierde la velocidad que necesita para el ride.
- **Peso atrás estructural:** descentrado desde el inicio → postura (STP-018) arranca mal.
- **Rompe fluidez:** pop-up escalonado en lugar de un solo movimiento.
- **Hábito persistente:** si no se corrige en White Belt, persiste en Yellow y destruye surf de verdad.
- **Riesgo de caída lateral:** peso mal distribuido.

---

## COACH INTERVENTION

### Verbal cue
> *"Pies juntos. No el de atrás primero. Ambos al mismo tiempo, o el de adelante primero."*

### Cue táctil
- Coach toca ambos pies del alumno en demo seco al mismo tiempo y dice "los dos caen así, juntos".

### Feedback inmediato post-rep
- "Pusiste pie atrás primero. La tabla se frenó. La próxima: los dos pies juntos, centrados."

---

## FIX PROTOCOL

1. **Demo seco con foco:** 10 reps en arena de pop-up con pies cayendo juntos. Coach verifica cada rep.
2. **V1 knee-up como puente (si fuerza limita):** pierna de adelante entra con rodilla. Nunca empezar por atrás.
3. **Audio cue "juntos":** coach dice "juntos" en momento exacto del pop-up como trigger.
4. **Slow-motion pop-up:** ejecutar lento para que el cuerpo memorice orden correcto.
5. **Re-test:** 3 pop-ups con pies cayendo juntos o de adelante primero, nunca atrás primero.

---

## WHEN TO REGRESS

- Si el alumno tiene fuerza muy limitada, trabajar V1 knee-up como paso intermedio. No forzar full pop si no hay base física.
- Si el alumno tiene miedo estructural a caer al frente, bajar ola y confianza primero.

---

## COACHING PRINCIPLE

Back foot first es un error de **orden**, no de fuerza. El coach que lo tolera está formando un alumno que siempre va a tener pop-up débil. La corrección requiere paciencia en seco — en el agua el patrón ya está comprometido por el pánico.

**Regla del coach:** en White Belt, back foot first es **no negociable**. Se corrige hasta que el orden quede bien, aunque lleve sesiones adicionales.

---

## RELATED ERRORS

- `ERR-WB-049` No Cobra Base (si no hay cobra, el orden de pies también colapsa)
- `ERR-WB-048` Release Too Early (secuencia rota en múltiples puntos)

---

*TSS® Error DB · ERR-WB-047 Back Foot First v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-048_Release_Too_Early

## ERR-WB-048 — RELEASE TOO EARLY

**Step:** STP-016 Pop-Up
**Belt:** White Belt · Block 3 · M3
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

Durante el pop-up, el alumno suelta las manos de los rails antes de estar centrado y en control. El cuerpo pierde la referencia de conexión con la tabla, el equilibrio falla, y el alumno cae o termina parado inestable.

---

## OBSERVABLE

- Alumno levanta torso y suelta manos casi al mismo tiempo.
- Manos en el aire mientras los pies todavía buscan posición.
- Cuerpo tambalea al llegar a parado.
- Frecuentemente cae lateral en los primeros 1-2 segundos de estar de pie.
- Expresión facial de pánico o desequilibrio.

---

## WHY IT HAPPENS

1. **No entendió que "conexión" significa mantener manos hasta estar centrado.**
2. **Apuro por "pararse"** — quiere terminar el pop-up rápido.
3. **Miedo al contacto con tabla** — suelta para distanciarse.
4. **Coach no enfatizó "stay connected" como regla central.**
5. **Imitación de surfistas expertos** — los ve soltar rápido sin entender el nivel de control previo.

---

## WHY IT'S PROBLEMATIC

- **Pérdida inmediata de equilibrio:** sin manos no hay corrección posible del centro.
- **Postura mal construida:** stance (STP-017) y posture (STP-018) arrancan desde caos, no desde control.
- **Rompe la regla doctrinal:** "stay connected" es principio del surf. Quien suelta temprano no internaliza.
- **Hábito peligroso:** en olas más grandes o condiciones difíciles, soltar temprano lleva a caídas duras.

---

## COACH INTERVENTION

### Verbal cue
> *"Manos firmes. Todavía no. Ahora — cuando estás centrado — soltás."*

### Cue de tiempo
- Coach cuenta "1-2-ahora". Alumno suelta en "ahora", no antes.
- Demo seco: alumno aprende a sentir cuándo está centrado antes de soltar.

### Feedback inmediato post-rep
- "Soltaste antes de estar centrado. La próxima: manos hasta que los pies están firmes y ya estás arriba."

---

## FIX PROTOCOL

1. **Demo seco de timing:** alumno ejecuta pop-up en arena, coach marca "ahora" solo cuando ve cuerpo centrado. Alumno aprende el momento.
2. **V5 del drill (Connection test):** coach sujeta la tabla post-pop-up. Si alumno soltó antes, se nota.
3. **Slow-motion pop-up:** 5 reps lentos, cada fase clara. Soltar manos es SIEMPRE la última fase.
4. **Audio cue externo:** coach dice "sueltá" en el momento correcto por 3-5 reps.
5. **Re-test:** 3 pop-ups con manos soltando solo al final.

---

## WHEN TO REGRESS

- Si el alumno tiene miedo al contacto con tabla, trabajar confianza + cobra primero.
- Si hay apuro por pánico de la ola, bajar tamaño hasta que el pop-up se ejecute en calma.

---

## COACHING PRINCIPLE

Soltar temprano es falla de paciencia, no de fuerza. El alumno quiere "terminar" antes de haber completado. El coach debe enseñar que pop-up **no termina cuando te parás** — termina cuando **estás centrado parado**. Son dos momentos distintos.

**Regla del coach:** si el alumno suelta temprano y cae, no cuenta como pop-up exitoso. Se repite. El estándar es "parado + centrado + manos soltadas al final".

---

## RELATED ERRORS

- `ERR-WB-047` Back Foot First (si orden de pies está mal, equilibrio ya está roto y suelta por pánico)
- `ERR-WB-049` No Cobra Base (sin cobra, todo el movimiento se apura)

---

*TSS® Error DB · ERR-WB-048 Release Too Early v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-049_No_Cobra_Base

## ERR-WB-049 — NO COBRA BASE

**Step:** STP-016 Pop-Up
**Belt:** White Belt · Block 3 · M3
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno intenta ejecutar pop-up sin haber entrado a cobra primero. El movimiento empieza con pecho contra tabla, manos mal ubicadas, sin espacio entre cuerpo y deck. El pop-up se vuelve forzado, escalonado, y casi siempre falla.

---

## OBSERVABLE

- Alumno inicia pop-up desde postura plana (pecho pegado a tabla).
- Manos no están a costillas — pueden estar a hombros, adelantadas, o en cualquier lado.
- No hay espacio visible entre pecho y tabla.
- Pies no encuentran dónde caer — pop-up se corta o se hace de rodilla.
- Cuerpo trabaja mucho más de lo necesario.

---

## WHY IT HAPPENS

1. **STP-013 Cobra mal certificado** — el alumno no internalizó que cobra es obligatorio.
2. **Apuro por pararse:** quiere saltarse cobra y "ir directo".
3. **Coach autorizó pop-up sin verificar cobra** en reps anteriores.
4. **Alumno cree que cobra es "decoración"** — no entiende su función estructural.
5. **Confusión entre catch y pop-up** — el alumno ejecuta pop-up apenas tomado por la ola, sin fase de cobra intermedia.

---

## WHY IT'S PROBLEMATIC

- **Sin cobra no hay espacio para pies:** el pecho contra tabla bloquea la entrada de los pies.
- **Manos mal ubicadas:** sin cobra estable, las manos no están a costillas y el empuje es ineficiente.
- **Forzado y lento:** el pop-up toma más tiempo y energía.
- **Rompe la secuencia doctrinal:** cobra es la rampa, pop-up es el lanzamiento. Sin rampa, lanzamiento falla.
- **Problemas aguas arriba:** si no hay cobra, tampoco hay eyes forward, ni rail control, ni dirección.

---

## COACH INTERVENTION

### Verbal cue
> *"Cobra primero. Siempre. No salteés."*

### Cue de stop
- Si coach ve que alumno va directo al pop-up sin cobra, grita "¡COBRA!" antes de permitir continuar.
- Demo seco repetida: cobra → pausa → pop-up. Siempre dos momentos distintos.

### Feedback inmediato post-rep
- "Te salteaste cobra. No entraste en cobra antes. La próxima: cobra completa, pausa pequeña, después pop-up."

---

## FIX PROTOCOL

1. **Regresar a STP-013:** verificar que cobra esté certificada. Si no, re-certificar antes de continuar.
2. **Chain secuencia:** catch → cobra → pausa → pop-up. Cada fase con su momento propio en seco.
3. **Demo explícita:** coach muestra cobra completa antes de pop-up. Alumno ve que son dos movimientos distintos.
4. **Regla clara:** "no se autoriza pop-up si no hay cobra visible".
5. **Re-test:** 3 catches consecutivos con cobra estable + pop-up desde ahí.

---

## WHEN TO REGRESS

- Si el alumno no tiene cobra estable, **no continuar con pop-up**. Regresar a STP-013 y solidificar la base.
- Si hay apuro por pánico, bajar condiciones — el pop-up sin cobra suele ser síntoma de estrés.

---

## COACHING PRINCIPLE

Este error revela problema doctrinal: el alumno no entiende que cobra es estructural, no decorativa. El coach debe instalar la regla: **"Sin cobra, no hay pop-up."** Es tan simple como eso. Y debe sostenerla con disciplina.

**Regla del coach:** pop-up sin cobra NO cuenta, aunque el alumno termine de pie. Se repite el rep. El estándar doctrinal es no negociable.

---

## RELATED ERRORS

- `ERR-WB-041` No Cobra Entry (STP-013 mal cerrado)
- `ERR-WB-047` Back Foot First (secuencia rota arrastra errores)
- `ERR-WB-048` Release Too Early (pop-up apurado sin base)

---

*TSS® Error DB · ERR-WB-049 No Cobra Base v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-016';

UPDATE lessons SET
  description_md = $tss$# STP-017 — FEET POSITION CENTER #2

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-17 — FEET POSITION FP2 DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-050_Foot_Near_Rail

## ERR-WB-050 — FOOT NEAR RAIL

**Step:** STP-017 Feet Position Center #2
**Belt:** White Belt · Block 3-4 · M3
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

Uno o ambos pies aterrizan cerca del rail de la tabla en lugar de estar centrados en el eje longitudinal. Como resultado, el rail queda aplastado involuntariamente, la tabla deriva en una dirección no decidida y el cuerpo debe compensar.

---

## OBSERVABLE

- Post-pop-up, visible que un pie está sobre el rail o muy cerca.
- Tabla se inclina inmediatamente hacia ese lado.
- Ride deriva sin intención (alumno no está girando pero la tabla va a un lado).
- Alumno mueve el cuerpo para "corregir" la deriva.
- Alumno no se da cuenta hasta que la tabla está ya desviada.

---

## WHY IT HAPPENS

1. **Alumno no tiene conciencia de dónde caen sus pies** — pop-up apurado.
2. **Sweet spot mal posicionado** — rodillas en cobra están mal → pies caen mal.
3. **Movilidad / coordinación limitada** — pies no encuentran el eje.
4. **Hábito arrastrado** de skate o snowboard (postura natural distinta).
5. **Coach no marcó FP2 visualmente** — no hay referencia.

---

## WHY IT'S PROBLEMATIC

- **Tabla ya está derivando antes de decidir:** el alumno pierde control desde el inicio.
- **Cuerpo debe compensar:** genera desorden en postura (STP-018) y desorden general.
- **Error raíz con consecuencias profundas:** aparece en beginner, persiste en olímpicos si no se corrige.
- **Bloquea aprendizaje de turns:** si no sabes dónde están parejos los rails, no sabes aplastar uno con intención.

---

## COACH INTERVENTION

### Verbal cue
> *"Centrado. No cerca del rail. El pie cae en el eje."*

### Cue visual
- Usar cinta marcando eje central y FP2 en la tabla para primeras sesiones.
- Pedir al alumno "¿qué rail está aplastado?" post-pop-up para entrenar conciencia.

### Feedback inmediato post-rep
- "Pie cerca del rail izquierdo. Tabla derivó a la izquierda. La próxima: centrado, en el eje, posición 2."

---

## FIX PROTOCOL

1. **Demo visual conceptual:** coach pisa cerca de rail en arena → tabla se inclina visible. Demo pisa centrado → tabla plana.
2. **Tabla marcada con cinta:** 3-5 pop-ups con cinta visible como referencia.
3. **Diagnóstico de sweet spot:** si los pies no caen bien, revisar STP-010. Rodillas en cobra = donde cae el pie de atrás.
4. **V5 del drill (Rails awareness):** coach pregunta post-pop-up "¿qué rail aplastaste?". Entrena conciencia activa.
5. **Re-test:** 3 pop-ups con pies centrados y rails parejos.

---

## WHEN TO REGRESS

- Si el alumno tiene sweet spot mal, **regresar a STP-010** antes de continuar.
- Si viene de otra disciplina (skate/snow), permitir sesión de transición con demo extensiva de por qué la tabla de surf es distinta.

---

## COACHING PRINCIPLE

Pie cerca de rail no es "casi bien" — es error raíz. La diferencia entre centrado y cerca de rail es pequeña en centímetros pero enorme en consecuencias. El coach que lo tolera en White Belt está formando un surfista que compensará toda su vida.

**Regla del coach:** no celebrar un ride solo porque el alumno quedó parado. Si los pies no estaban en FP2, el ride no cuenta como bien ejecutado.

---

## RELATED ERRORS

- `ERR-WB-051` Body Compensation (consecuencia directa)
- `ERR-WB-052` No Foot Awareness (causa subyacente frecuente)
- `ERR-WB-032` Nose Dive Position (STP-010 — sweet spot mal arrastra error a pies)

---

*TSS® Error DB · ERR-WB-050 Foot Near Rail v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-051_Body_Compensation

## ERR-WB-051 — BODY COMPENSATION

**Step:** STP-017 Feet Position Center #2
**Belt:** White Belt · Block 3-4 · M3
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

El alumno ajusta su cuerpo (caderas, hombros, torso) para compensar pies mal ubicados o tabla derivando. La compensación reemplaza a la conexión real. El alumno puede mantener el ride de pie pero gasta energía peleando con la tabla en lugar de conducirla.

---

## OBSERVABLE

- Caderas torcidas lateralmente.
- Hombros desalineados respecto al eje.
- Brazos en posiciones asimétricas buscando balance.
- Tren superior rígido y trabajando mucho.
- Alumno no se ve "relajado" ni "conectado" — se ve en tensión.
- Post-rep: alumno describe que fue "difícil" incluso en olas suaves.

---

## WHY IT HAPPENS

1. **Pies mal ubicados** (frecuentemente pie cerca de rail) — compensación es consecuencia.
2. **Alumno interpreta que "hay que mantenerse arriba"** sin saber cómo.
3. **Intuición corporal** — el cuerpo corrige automáticamente.
4. **Coach tolera compensación** como "ya está parado".
5. **Falta de conciencia de rails parejos** — no siente la deriva como problema.

---

## WHY IT'S PROBLEMATIC

- **No es conexión, es pelea:** compensación oculta el problema pero no lo resuelve.
- **Postura rota:** STP-018 (Power Stance) no puede construirse sobre compensación.
- **Gasta energía:** el alumno se cansa mucho más rápido.
- **Bloquea turns intencionales:** si ya está compensando para ir recto, no puede aplastar rail con intención.
- **Hábito invisible:** si no se detecta, persiste y se endurece.

---

## COACH INTERVENTION

### Verbal cue
> *"Cuerpo relajado. No pelees con la tabla. Arreglá los pies primero."*

### Diagnóstico primero
- Coach no corrige el cuerpo directamente — diagnostica **por qué** está compensando.
- Preguntar al alumno: "¿dónde está tu pie de atrás?". Si no sabe, es causa raíz.

### Feedback inmediato post-rep
- "Tu cuerpo estaba torcido a la izquierda. Eso es porque el pie estaba cerca del rail derecho. La próxima: centrado, y el cuerpo se va a relajar solo."

---

## FIX PROTOCOL

1. **Diagnosticar pies primero:** la compensación es síntoma. Ir a la causa (pies mal).
2. **Video análisis:** grabar post-pop-up y mostrar al alumno dónde cayeron pies y cómo compensó.
3. **Drill de relajación:** alumno debe ejecutar pop-up + postura relajada. Si siente que tiene que torcer, volver a verificar pies.
4. **Eliminar compensación consciente:** alumno practica "no corregir con cuerpo" incluso si la tabla va a deslizar — aprende a sentir la deriva real.
5. **Re-test:** 3 pop-ups sin compensación visible + rails parejos + pies centrados.

---

## WHEN TO REGRESS

- Si el alumno compensa por miedo, bajar condiciones hasta que se sienta en control.
- Si compensa por hábito de otra disciplina, sesión extra de demo conceptual + comparación.

---

## COACHING PRINCIPLE

Compensación no es falla de postura — es **consecuencia de pies mal**. El coach debe resistir la tentación de corregir el cuerpo visible y en cambio diagnosticar la causa: ¿los pies están centrados? ¿FP2? ¿sweet spot? La compensación se va sola cuando la causa raíz se arregla.

**Regla del coach:** nunca corregir postura antes de verificar pies. Si pies están bien y sigue compensando, ahí sí corregir postura (pero suele ser raro).

---

## RELATED ERRORS

- `ERR-WB-050` Foot Near Rail (causa más frecuente de compensación)
- `ERR-WB-052` No Foot Awareness (alumno no sabe que el problema son los pies)

---

*TSS® Error DB · ERR-WB-051 Body Compensation v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-052_No_Foot_Awareness

## ERR-WB-052 — NO FOOT AWARENESS

**Step:** STP-017 Feet Position Center #2
**Belt:** White Belt · Block 3-4 · M3
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

El alumno no tiene conciencia de dónde caen sus pies post-pop-up. No puede responder con precisión "¿dónde está tu pie de atrás?" después de un rep. Sin conciencia, no puede corregir — solo ejecuta el pop-up a ciegas y acepta lo que sale.

---

## OBSERVABLE

- Post-pop-up, al preguntársele "¿dónde cayó tu pie de atrás?", el alumno no sabe.
- Alumno confunde FP1, FP2, FP3 (o no los conoce).
- No puede identificar si un rail está aplastado.
- Describe el rep en términos vagos ("estuvo bien", "estuvo raro") sin especificar qué fue bien o raro.
- Mismo error repetido sin corrección porque no lo detecta.

---

## WHY IT HAPPENS

1. **Alumno nuevo en surf** — no tiene vocabulario ni referencias.
2. **Coach no explicó FP1/FP2/FP3 conceptualmente.**
3. **Foco del alumno en "mantenerse de pie"** — no hay atención para detalles.
4. **Pop-up apurado:** todo ocurre muy rápido para prestar atención.
5. **Propiocepción subdesarrollada** — no siente dónde están sus pies sin mirar.

---

## WHY IT'S PROBLEMATIC

- **No puede corregir lo que no sabe:** sin conciencia, no hay mejora.
- **Dependencia de coach:** alumno requiere feedback externo constante.
- **Habitos mal instalados:** si no se detecta el error, persiste.
- **Bloquea progreso en belts posteriores:** FP1 y FP3 no se pueden entender sin conciencia base de FP2.
- **Técnica sin conceptualización:** el alumno ejecuta sin entender.

---

## COACH INTERVENTION

### Verbal cue
> *"¿Dónde cayó tu pie de atrás? Pensalo antes de contestar."*

### Pregunta sistemática
- Coach pregunta post-CADA rep: "¿dónde cayó tu pie de atrás?"
- Si el alumno no sabe, coach muestra: "cayó en FP1 porque X".
- Después de 10-15 reps con pregunta sistemática, el alumno empieza a auto-observar.

### Feedback inmediato post-rep
- "No supiste dónde cayó el pie. Bien — ahora que lo sabés (te digo yo), recordá para la próxima: notá dónde caen. Esa es la primera skill."

---

## FIX PROTOCOL

1. **Enseñanza conceptual explícita:** coach explica FP1/FP2/FP3 antes del primer pop-up.
2. **Tabla marcada con cinta:** feedback visual directo para que el alumno vea dónde cae.
3. **Pregunta post-rep sistemática:** "¿dónde cayó tu pie de atrás?" cada vez.
4. **Video análisis:** mostrar al alumno grabación para que vea dónde cayeron pies.
5. **Auto-reporte:** alumno describe cada rep en términos de posición antes de pedir feedback.

---

## WHEN TO REGRESS

- Si el alumno está abrumado con información, reducir a una sola pregunta por rep ("¿pie centrado sí o no?").
- Si falta propiocepción, dedicar sesión específica a "sentir pies sin mirar" en arena.

---

## COACHING PRINCIPLE

Sin conciencia no hay aprendizaje — solo repetición ciega. El coach debe **instalar el hábito de auto-observación** desde White Belt. "¿Dónde están tus pies?" es la pregunta que acompaña al alumno toda su carrera.

**Regla del coach:** en STP-017, el objetivo NO es solo que el pie caiga en FP2. Es también que el alumno sepa dónde cayó. Sin conciencia, FP2 es casualidad — con conciencia, es técnica.

---

## RELATED ERRORS

- `ERR-WB-050` Foot Near Rail (sin conciencia, no detecta el problema)
- `ERR-WB-051` Body Compensation (sin conciencia, confunde compensación con conexión)

---

*TSS® Error DB · ERR-WB-052 No Foot Awareness v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-017';

UPDATE lessons SET
  description_md = $tss$# STP-018 — POWER STANCE / POSTURE

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-18 — POWER STANCE ARROWS DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-053_Inactive_Scapula_Shoulder_Collapse

## ERR-WB-053 — INACTIVE SCAPULA / SHOULDER COLLAPSE

**Step:** STP-018 Power Stance / Posture
**Belt:** White Belt · Block 4 · M3
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

Los hombros del alumno colapsan hacia adelante (torso encorvado) y/o la escápula está inactiva (manos "volando" sin apoyo estructural). La postura pierde su plataforma superior — sin escápula activa, el tren superior no se conecta con la dirección de la tabla y las manos no pueden funcionar como extensión del cuerpo.

---

## OBSERVABLE

- Hombros caídos hacia adelante, pecho cerrado.
- Omóplatos sueltos, sin retracción visible.
- Manos flotando sin control, alejadas del eje central.
- Codo de la mano trasera no pegado a la costilla.
- Alumno describe sensación "rara" en brazos, sin saber qué hacer con ellos.
- Postura se ve "floja" desde cintura para arriba, incluso si cintura para abajo está bien.

---

## WHY IT HAPPENS

1. **Nunca se enseñó la escápula activa** como parte de la postura.
2. **Alumno proviene de disciplinas donde los brazos son libres** (correr, caminar) — transfiere hábito.
3. **Hombros cansados** de paddle previo — alumno los suelta inconscientemente.
4. **No tiene conciencia del tren superior** en relación con dirección.
5. **Coach tolera** porque "ya está parado" sin verificar escápula.

---

## WHY IT'S PROBLEMATIC

- **Dirección rota:** hombros colapsados desalinean el tren superior con la dirección de la tabla.
- **Balance frágil:** sin escápula activa, las manos no pueden actuar como contrapeso en turns.
- **Postura sin plataforma superior:** STP-019 (impulso) no se puede construir.
- **Hábito que se endurece:** si no se detecta, pasa a belts superiores y bloquea maniobras avanzadas.
- **Manos sueltas = reactivas, no intencionales:** el alumno reacciona con los brazos en lugar de conducir con ellos.

---

## COACH INTERVENTION

### Verbal cue
> *"Hombros al frente. Escápula atrás. Codo a costilla. Mano delantera abajo, al frente."*

### Demo obligatoria
- Coach muestra postura con hombros colapsados vs postura con escápula activa.
- La diferencia visual es clara: pecho cerrado (mal) vs pecho abierto (bien).

### Drill específico (arena)
- Alumno en postura de poder.
- Coach le pide: *"pellizcá una hoja de papel entre los omóplatos"*.
- Sostener 10 segundos. Repetir 5 veces.
- Eso instala la sensación de escápula activa.

---

## FIX PROTOCOL

1. **Enseñanza explícita:** escápula retraída, codo pegado a costilla, mano delantera abajo al frente.
2. **Drill de pellizco escapular** (arena, isométrico).
3. **Demo comparativa:** postura con y sin escápula activa.
4. **Video análisis:** mostrar al alumno su postura desde atrás para que vea hombros caídos.
5. **Check por rep:** coach pregunta post-pop-up "¿sentiste tus escápulas?".

---

## WHEN TO REGRESS

- Si el alumno tiene debilidad escapular por no trabajo previo, sesión de fortalecimiento en arena antes de continuar.
- Si el tren superior está muy cansado por paddle previo, descanso breve antes de exigir postura completa.

---

## COACHING PRINCIPLE

La postura no es solo de la cintura para abajo. **El tren superior es 50% de la postura de poder.** El coach que acepta postura con hombros caídos está construyendo sobre base frágil. Cada vez que los hombros colapsan, la dirección se pierde.

**Regla del coach:** nunca celebrar una postura si los hombros están caídos. Es postura incompleta, no postura de poder.

---

## RELATED ERRORS

- `ERR-WB-054` Weight on Back Foot (frecuentemente coexisten)
- `ERR-WB-055` Loose Hands / No Activation (síntoma del mismo problema raíz)

---

*TSS® Error DB · ERR-WB-053 Inactive Scapula / Shoulder Collapse v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-054_Weight_on_Back_Foot

## ERR-WB-054 — WEIGHT ON BACK FOOT

**Step:** STP-018 Power Stance / Posture
**Belt:** White Belt · Block 4 · M3
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno distribuye demasiado peso en el pie trasero (inversión del 80/20 correcto) o mantiene el peso equilibrado al 50/50. La tabla pierde velocidad, la nariz se levanta, el rail trasero se hunde y la conexión con la ola se rompe. El alumno queda "parado atrás" en lugar de "manejando desde adelante".

---

## OBSERVABLE

- Vista lateral: centro de gravedad visible detrás del pie delantero.
- Nariz de la tabla levantada.
- Tabla frena visible (deja de avanzar con la ola).
- Alumno se ve "echado atrás" como si tuviera miedo.
- Rail trasero hundido, rail delantero flotando.
- Ride corto — la tabla se detiene antes de llegar a la arena.

---

## WHY IT HAPPENS

1. **Miedo:** el alumno se echa atrás instintivamente para alejarse de la cara de la ola.
2. **Pop-up impreciso:** aterrizó con peso mal distribuido.
3. **Nunca se enseñó el 80/20.**
4. **Coach tolera** porque "el alumno está parado".
5. **Hábito de otras disciplinas** (skate neutral) donde el peso es centrado.

---

## WHY IT'S PROBLEMATIC

- **Pierde velocidad:** sin peso delante, la tabla no engancha la energía de la ola.
- **Frena antes de tiempo:** ride corto y sin flow.
- **Imposible turns:** sin peso adelante, no se puede aplastar rail adelantado para girar.
- **Nose up = drag:** tabla frena por el rail trasero hundido.
- **Bloquea STP-019 Impulso:** compresión-extensión asume peso adelantado.

---

## COACH INTERVENTION

### Verbal cue
> *"Peso adelante. 80-20. Inclinate hacia la ola, no alejate."*

### Demo obligatoria
- Coach demuestra peso atrás vs peso adelante en arena.
- Muestra consecuencia: tabla frena vs tabla fluye.
- Coach explica: *"Peso adelante no es peligroso — es lo que te conecta."*

### Corrección mental (el bloqueo es psicológico)
- Si el alumno tiene miedo, coach baja condiciones (olas más suaves).
- Coach explica que "caer hacia adelante" en surf es normal y no duele en condiciones WB.

---

## FIX PROTOCOL

1. **Drill seco:** alumno en postura en arena, coach le pide que transfiera 80% peso a pie delantero. Sostener 10 segundos.
2. **Demo de consecuencia:** video o demo en vivo de tabla frenando vs fluyendo.
3. **Drill en agua quieta:** pop-up + 80/20 consciente + mantener 3-5 segundos.
4. **Feedback visual post-rep:** "tu tabla frenó porque tu peso estaba atrás."
5. **Exposición gradual:** si el miedo es la causa, trabajar con olas más pequeñas hasta que el reflejo "peso adelante" se instale.

---

## WHEN TO REGRESS

- Si el miedo es muy fuerte, bajar condiciones hasta que el alumno se sienta seguro de llevar el peso adelante.
- Si el pop-up está llevando al alumno a aterrizar con peso atrás, revisar STP-016 (mecánica del pop-up).

---

## COACHING PRINCIPLE

"Peso adelante" es contra-intuitivo para el alumno asustado — su instinto es echarse atrás para alejarse de la ola. El coach debe **romper este reflejo conscientemente**. Sin peso adelante no hay surf — solo flotar parado.

**Regla del coach:** no celebrar ride con peso atrás como "ride exitoso". Es ride sin técnica. El alumno tiene que sentir la diferencia entre estar atrás (frena) y estar adelante (fluye).

---

## RELATED ERRORS

- `ERR-WB-053` Inactive Scapula (frecuentemente coexisten — miedo colapsa toda la postura)
- `ERR-WB-047` Back Foot First (STP-016 — si pop-up aterriza mal, peso queda atrás)

---

*TSS® Error DB · ERR-WB-054 Weight on Back Foot v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-055_Loose_Hands_No_Activation

## ERR-WB-055 — LOOSE HANDS / NO ACTIVATION

**Step:** STP-018 Power Stance / Posture
**Belt:** White Belt · Block 4 · M3
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

Las manos del alumno flotan sueltas, sin control ni activación estructural. No están integradas a la postura — son apéndices que reaccionan al balance en lugar de conducirlo. Mano delantera puede estar demasiado arriba, demasiado atrás o cruzando el eje. Mano trasera no trabaja con escápula retraída ni codo a costilla. La postura puede verse bien de cintura para abajo pero incompleta de cintura para arriba.

---

## OBSERVABLE

- Manos moviéndose sin patrón, buscando balance reactivamente.
- Mano delantera alzada (arriba de la cintura) en lugar de abajo al frente.
- Mano trasera colgando o volando lateralmente.
- Codo trasero separado de la costilla, sin contacto.
- Alumno intenta corregir balance con brazos en lugar de con pies/cadera.
- Tren superior se ve "desarticulado" respecto al tren inferior.

---

## WHY IT HAPPENS

1. **Coach nunca enseñó el detalle de las manos** como parte de la postura.
2. **Hábito de otras disciplinas** — brazos libres en caminar, correr, etc.
3. **Miedo** — alumno usa brazos para "agarrarse" del aire.
4. **No hay conciencia de la escápula** como estructura de soporte.
5. **Fase inicial del aprendizaje** — alumno se enfoca en pies y olvida tren superior.

---

## WHY IT'S PROBLEMATIC

- **Balance frágil:** manos reactivas no conducen — solo corrigen.
- **Postura incompleta:** tren superior desarticulado rompe la conexión total.
- **Bloquea turns:** los turns usan el tren superior para iniciar rotación. Manos sueltas → no hay rotación controlada.
- **Transfiere a belts superiores:** hábito de manos sueltas aparece en maniobras olímpicas y sabotea ejecución.
- **Señal de postura mal armada:** si las manos están sueltas, probablemente la escápula también.

---

## COACH INTERVENTION

### Verbal cue
> *"Mano delantera abajo, al frente. Mano trasera: escápula atrás, codo a costilla. Manos activas, no volando."*

### Demo obligatoria
- Coach muestra postura con manos sueltas vs manos activas.
- La diferencia visual es inmediata: tren superior desarticulado vs integrado.

### Drill de conciencia
- Alumno adopta postura en arena con ojos cerrados.
- Coach pregunta: *"¿Dónde están tus manos? ¿Dónde está tu codo trasero?"*
- Si no sabe, coach posiciona las manos y pide memorizar la sensación.

---

## FIX PROTOCOL

1. **Enseñanza explícita:** coach construye posición de manos capa por capa.
   - Mano delantera: abajo, al frente, palma hacia abajo o neutral.
   - Mano trasera: escápula retraída, codo a costilla, mano abierta y activa.
2. **Drill isométrico:** alumno mantiene posición de manos 20 segundos en postura de poder.
3. **Video análisis:** grabar alumno y mostrar comparativo manos sueltas vs manos activas.
4. **Check post-rep:** coach pregunta "¿dónde estaba tu codo trasero?".
5. **Integración progresiva:** empezar con manos en arena (seco) → agua quieta → whitewater.

---

## WHEN TO REGRESS

- Si el alumno tiene debilidad de hombros/escápula, sesión específica de activación antes de continuar.
- Si el alumno usa las manos por miedo, bajar condiciones (olas más suaves) hasta que el reflejo de agarrarse del aire se pierda.

---

## COACHING PRINCIPLE

Las manos son parte de la postura — no un accesorio. El coach que acepta "manos flotando" como parte normal del ride está dejando un hueco estructural que va a sabotear todas las maniobras futuras. **Manos activas no es estética — es función.**

**Regla del coach:** celebrar solo reps donde las manos estén en posición correcta. Si las manos estaban sueltas, el rep no cuenta como postura completa.

---

## RELATED ERRORS

- `ERR-WB-053` Inactive Scapula / Shoulder Collapse (causa raíz común)
- `ERR-WB-054` Weight on Back Foot (frecuentemente coexiste con manos mal)

---

*TSS® Error DB · ERR-WB-055 Loose Hands / No Activation v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-018';

UPDATE lessons SET
  description_md = $tss$# STP-019 — IMPULSO

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-19 — IMPULSE FORWARD SPEED DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-056_No_Leg_Flexion

## ERR-WB-056 — NO LEG FLEXION

**Step:** STP-019 Impulso
**Belt:** White Belt · Block 4 · M3
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno intenta ejecutar el impulso sin flexión previa de las piernas y sin pecho hacia las rodillas. Toca el agua con las manos desde postura erguida o apenas ligeramente inclinada. Sin flexión no hay energía guardada, sin energía guardada no hay nada que liberar — el "impulso" es solo un toque del agua sin consecuencia física.

---

## OBSERVABLE

- Alumno toca el agua desde postura erguida o semi-erguida.
- Piernas no visiblemente flexionadas antes del touch.
- Pecho lejos de las rodillas.
- Post-touch, el cuerpo no se extiende porque nunca se comprimió.
- La tabla no gana velocidad post-impulso.
- Desde lateral, no se observa ciclo compresión-extensión.

---

## WHY IT HAPPENS

1. **Coach no enseñó explícitamente la flexión como fase separada.**
2. **Alumno piensa que "impulso" = tocar el agua** (interpretación literal incorrecta).
3. **Miedo a flexionar profundo** — siente que va a caerse.
4. **Piernas cansadas** — alumno evita flexión porque requiere energía.
5. **Hábito visual incompleto** — vio a alguien tocar el agua y copió el toque sin ver la flexión previa.

---

## WHY IT'S PROBLEMATIC

- **Impulso no existe:** sin flexión, no hay ciclo compresión-extensión. No se genera velocidad.
- **Gasto de tiempo ritual:** el alumno "ejecuta" algo que no tiene efecto.
- **Falsa sensación de técnica:** cree que está usando la herramienta cuando en realidad no.
- **Hábito que sabotea belts superiores:** impulso post-cutback requiere flexión — sin hábito WB, no se puede hacer en Blue+.
- **Confunde diagnóstico:** coach puede creer que el problema es la pérdida de velocidad cuando en realidad es que el alumno no ejecuta impulso real.

---

## COACH INTERVENTION

### Verbal cue
> *"Flexioná primero. Pecho a las rodillas. GUARDÁ la energía antes de liberarla."*

### Demo obligatoria comparativa
- Coach muestra impulso sin flexión (tabla no avanza).
- Coach muestra impulso con flexión profunda (tabla avanza visible).
- La diferencia es evidente.

### Drill isométrico
- Alumno sostiene postura flexionada profunda 20 segundos en arena.
- Coach: *"Sentí esa tensión en las piernas. Esa es la energía guardada."*

---

## FIX PROTOCOL

1. **Separar fases:** enseñar FLEX como fase completa en sí misma, no como precursor rápido del touch.
2. **Drill de flexión profunda:** 5 reps en arena, manteniendo flexión 3-5 segundos cada una.
3. **Drill compresión-extensión:** 5 reps conectando flex + extend sin touch (primero), luego integrando touch.
4. **Video análisis:** mostrar al alumno su impulso vs uno con flexión completa.
5. **Re-test:** ejecutar impulso en whitewater con flexión profunda visible.

---

## WHEN TO REGRESS

- Si el alumno tiene miedo a flexionar profundo, bajar condiciones (agua quieta) hasta que el reflejo se instale.
- Si hay limitación física (rodillas, caderas), adaptar la flexión al rango disponible pero mantener el principio.

---

## COACHING PRINCIPLE

El impulso es **compresión + extensión**. Sin la primera, no hay la segunda. El coach que acepta "toque del agua" como impulso está validando una herramienta incompleta. Velocidad real solo viene de la liberación de energía guardada — y solo se guarda energía con flexión real.

**Regla del coach:** si no hay flexión visible, no hay impulso. No celebrar. Redirigir a la causa: *"volvé a flexionar profundo antes de tocar el agua"*.

---

## RELATED ERRORS

- `ERR-WB-057` Half Movement No Push (co-ocurre — si no hay flex, probablemente no hay push real)
- `ERR-WB-058` Not Using Tool When Needed (alumno que no flexiona probablemente no identifica cuándo necesita impulso)

---

*TSS® Error DB · ERR-WB-056 No Leg Flexion v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-057_Half_Movement_No_Push

## ERR-WB-057 — HALF MOVEMENT / NO PUSH

**Step:** STP-019 Impulso
**Belt:** White Belt · Block 4 · M3
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno toca el agua con las manos pero no empuja contra ella. El movimiento es simbólico: mano entra al agua, mano sale, sin aplicación de fuerza hacia atrás. El agua no sale desplazada hacia atrás, no hay reacción Newtoniana, la tabla no gana velocidad. El impulso queda como gesto vacío.

---

## OBSERVABLE

- Manos entran y salen del agua sin resistencia visible.
- Agua no se mueve hacia atrás (no hay "estela" del empuje).
- Brazo no muestra tensión muscular durante el touch.
- Tabla no gana velocidad post-impulso.
- Alumno describe el impulso como "lo hice" aunque físicamente no ocurrió nada.
- Vista lateral: no se observa transferencia de energía hacia adelante.

---

## WHY IT HAPPENS

1. **Interpretación literal del "toque":** alumno piensa que impulso = tocar el agua (sin entender push).
2. **Temor a meter la mano profundo:** miedo a desestabilizarse.
3. **Falta de fuerza:** brazos débiles o cansados por paddle previo.
4. **Coach nunca enseñó push como fase separada** — saltó directamente de touch a extend.
5. **Copia visual incompleta:** vio a alguien "tocar" el agua pero no registró la fuerza aplicada.

---

## WHY IT'S PROBLEMATIC

- **No genera velocidad:** sin push, no hay momentum forward.
- **Gasto de movimiento sin resultado:** alumno ejecuta algo que no sirve.
- **Confirma hábito mal:** si el alumno "impulsó" y la tabla no avanzó, concluye que el impulso no sirve (cuando en realidad no lo ejecutó bien).
- **Bloquea progreso a una mano:** sin push fuerte con dos manos, la versión una mano es imposible.
- **Bloquea uso en Blue+ belts:** impulso post-cutback requiere push potente — sin hábito WB, no se puede escalar.

---

## COACH INTERVENTION

### Verbal cue
> *"Empujá el agua hacia atrás. Fuerte. La tabla va para adelante porque el agua va para atrás."*

### Física simple
- Coach explica tercera ley de Newton: *"Lo que empujás hacia atrás, te empuja hacia adelante."*
- Demo: coach empuja pared con las manos, se mueve para atrás. *"Si empujás el agua, te mueve para adelante."*

### Drill de resistencia
- Coach pone sus manos como "agua" contra las manos del alumno.
- Alumno empuja las manos del coach hacia atrás.
- Sin resistencia real, el alumno no siente qué es push.
- Repetir 5-10 veces hasta que el alumno sienta la transferencia de fuerza.

---

## FIX PROTOCOL

1. **Enseñanza física explícita:** tercera ley de Newton aplicada al surf.
2. **Drill de resistencia** (coach contra manos del alumno).
3. **Demo comparativa:** touch sin push vs touch con push. Coach ejecuta ambos en agua para que el alumno vea.
4. **Integrar push al ciclo:** FLEX → TOUCH → PUSH (enfocar esta fase) → EXTEND.
5. **Re-test en whitewater:** push fuerte con agua saliendo visible hacia atrás.

---

## WHEN TO REGRESS

- Si los brazos están débiles por paddle previo, descanso antes de continuar.
- Si hay miedo a meter la mano profundo, bajar condiciones (agua quieta) para desmontar el miedo.
- Si el alumno no entiende físicamente la relación push-momentum, volver a explicación en arena con analogías (empujar pared, empujar columpio).

---

## COACHING PRINCIPLE

Impulso no es tocar — es **empujar**. Empujar requiere fuerza aplicada contra resistencia. El agua es la resistencia. Si no hay fuerza, no hay impulso. El coach debe **exigir push real** con agua saliendo atrás. Todo lo demás es ritual.

**Regla del coach:** verificar visualmente que el agua sale hacia atrás. Si no hay estela visible, no hubo push. Redirigir al alumno a empujar con fuerza, no tocar.

---

## RELATED ERRORS

- `ERR-WB-056` No Leg Flexion (frecuentemente coexiste — sin flex, el push tampoco llega)
- `ERR-WB-058` Not Using Tool When Needed (alumno que no hace push real probablemente no decide usar la herramienta tampoco)

---

*TSS® Error DB · ERR-WB-057 Half Movement / No Push v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-058_Not_Using_Tool_When_Needed

## ERR-WB-058 — NOT USING TOOL WHEN NEEDED

**Step:** STP-019 Impulso
**Belt:** White Belt · Block 4 · M3
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

El alumno tiene la mecánica del impulso instalada (puede ejecutarla en arena y en agua quieta) pero **no la usa cuando la tabla pierde velocidad en el ride real**. No identifica el momento en que la herramienta es necesaria y se resigna a la pérdida de velocidad como si fuera inevitable. Tiene la herramienta en el arsenal pero no la saca cuando corresponde.

---

## OBSERVABLE

- La tabla se queda trabada o pierde velocidad.
- Alumno no ejecuta impulso.
- Alumno acepta pérdida de velocidad como parte natural del ride.
- Post-rep, si el coach pregunta "¿cuándo necesitaste impulso?", el alumno no identifica el momento.
- Ride termina antes de tiempo porque no se recuperó velocidad.
- Alumno puede ejecutar impulso perfecto si el coach lo pide, pero no lo inicia solo.

---

## WHY IT HAPPENS

1. **Alumno no internalizó "velocidad = estabilidad":** no percibe la pérdida de velocidad como problema a resolver.
2. **Foco en "mantenerse de pie":** el alumno está tan enfocado en postura que no tiene atención sobrante para identificar oportunidades.
3. **Impulso no está instalado como hábito todavía:** la herramienta existe cognitivamente pero no se ha integrado al flujo del ride.
4. **Coach no pregunta sistemáticamente:** si el coach no entrena la identificación del momento, el alumno no la desarrolla.
5. **Miedo a hacer movimientos adicionales:** el alumno cree que cualquier movimiento extra lo va a tirar de la tabla.

---

## WHY IT'S PROBLEMATIC

- **Herramienta sin utilidad real:** saber ejecutar algo que no usás es lo mismo que no saberlo.
- **Bloquea progresión:** belts posteriores asumen que el alumno usa impulso cuando lo necesita. Si no lo usa en WB, la brecha crece.
- **Alumno resignado:** el surfer que acepta pérdida de velocidad sin intentar recuperarla nunca desarrolla control real del ride.
- **Rides cortos:** sin impulso oportuno, los rides son más cortos y menos fluidos.
- **Hábito del "todo o nada":** o el alumno ejecuta cuando el coach lo ordena, o no ejecuta. No hay decisión autónoma.

---

## COACH INTERVENTION

### Verbal cue
> *"¿Sentís que la tabla se traba? Impulso. No esperes que yo te diga."*

### Pregunta sistemática post-rep
- Coach pregunta: *"¿Cuándo sentiste pérdida de velocidad?"*
- Si el alumno no identifica momento, coach le dice: *"A los 3 segundos del ride. Ahí necesitabas impulso."*
- Después de varias sesiones con esta pregunta, el alumno empieza a auto-identificar.

### Coach desde el canal
- Coach desde canal grita *"¡AHORA!"* cuando ve el momento de impulso.
- Alumno ejecuta en tiempo real.
- Después de 3-5 sesiones, el alumno puede identificar sin la señal externa.

---

## FIX PROTOCOL

1. **Instalar "velocidad = estabilidad"** conceptualmente: alumno debe internalizar por qué importa mantener velocidad.
2. **Pregunta sistemática post-rep:** cada ride termina con "¿cuándo necesitaste impulso?".
3. **Coach señala desde canal:** durante 2-3 sesiones, coach indica el momento en tiempo real.
4. **Video análisis:** mostrar al alumno rides donde la tabla se trabó, pausar, preguntar "¿qué debías hacer acá?".
5. **Transición a autonomía:** coach deja de señalar gradualmente. Alumno auto-identifica.

---

## WHEN TO REGRESS

- Si el alumno está abrumado con postura y no tiene atención sobrante, esperar a que postura esté consolidada antes de exigir identificación de momentos de impulso.
- Si hay miedo a hacer movimientos adicionales, trabajar el miedo primero (olas más suaves, más confianza).

---

## COACHING PRINCIPLE

Una herramienta sin criterio de uso es inservible. El coach debe enseñar **no solo a ejecutar el impulso, sino a decidir cuándo usarlo**. Esta decisión es tan importante como la mecánica. Impulso sin criterio es gimnasia; impulso con criterio es surf.

**Regla del coach:** durante la certificación, no basta con que el alumno ejecute impulso bajo pedido. Debe ejecutarlo autónomamente cuando la situación lo requiere. Sin este criterio, el alumno no está realmente certificado.

---

## RELATED ERRORS

- `ERR-WB-056` No Leg Flexion (si el impulso no se ejecuta bien mecánicamente, es probable que tampoco se use cuando corresponde)
- `ERR-WB-057` Half Movement No Push (mismo patrón — ejecución sin criterio)

---

*TSS® Error DB · ERR-WB-058 Not Using Tool When Needed v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-019';

UPDATE lessons SET
  description_md = $tss$# STP-020 — STARFISH DISMOUNT

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-20 — STARFISH DISMOUNT DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-059_Falling_Side_Instead_of_Back

## ERR-WB-059 — FALLING SIDE INSTEAD OF BACK

**Step:** STP-020 Starfish Dismount
**Belt:** White Belt · Block 0 (Safety) · M3
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno se tira a un lado (rail izquierdo o derecho) en lugar de caer hacia atrás sobre la espuma. La caída lateral no aprovecha el colchón de espuma detrás, deja al alumno vulnerable a chocar con objetos laterales, y rompe el principio doctrinal de "atrás, siempre atrás donde hay espuma".

---

## OBSERVABLE

- Post-decisión, alumno se lanza hacia el rail (no hacia atrás).
- Cuerpo cruza la tabla lateralmente.
- Aterrizaje fuera de la zona de espuma protegida.
- Impacto lateral con agua o con tabla.
- Alumno se ve desorientado post-caída.
- En casos peligrosos, puede chocar con otro surfista o con objeto cercano.

---

## WHY IT HAPPENS

1. **Coach nunca enseñó la regla "siempre atrás":** alumno no conoce el principio.
2. **Hábito reactivo:** alumno "se tira" a lo que le sale natural (usualmente su lado dominante).
3. **Miedo a caer de espaldas:** inconsciente del colchón de espuma.
4. **Starfish incompleto:** intenta abrir pero no completa dirección.
5. **Tabla sigue moviéndose:** alumno se deshace de la tabla lanzándose a un lado.

---

## WHY IT'S PROBLEMATIC

- **Seguridad comprometida:** lateral = impacto con objetos, arena si agua es shallow, otros surfistas.
- **No aprovecha espuma:** la espuma es el colchón; lateral lo ignora.
- **Hábito peligroso en belts superiores:** en olas más grandes, caer de lado es mucho más peligroso.
- **No se entrena decisión real:** alumno reacciona en lugar de ejecutar técnica planificada.
- **Puede lastimar a terceros:** lateral = menos control de dirección → más riesgo de chocar con alguien.

---

## COACH INTERVENTION

### Verbal cue
> *"Atrás. Siempre atrás. La espuma es tu colchón."*

### Demo comparativa
- Coach muestra starfish atrás sobre espuma.
- Coach muestra caída lateral (cuidado) — alumno ve la diferencia.
- Coach explica: *"Lateral = sin colchón, sin control. Atrás = seguro."*

### Drill direccional
- Alumno en arena con coach detrás.
- Coach dice *"atrás"* y alumno se deja caer hacia atrás como referencia.
- Repetir 10 veces hasta que "atrás" sea automático.

---

## FIX PROTOCOL

1. **Instalar regla "siempre atrás":** repetir en cada sesión.
2. **Drill direccional en arena:** caer atrás 10 veces seguidas.
3. **Video análisis:** mostrar al alumno su caída lateral vs una caída atrás.
4. **Re-test:** 3 starfishes consecutivos hacia atrás sobre espuma.
5. **Condiciones claras:** practicar solo cuando hay espuma detrás confirmada.

---

## WHEN TO REGRESS

- Si no hay espuma detrás (orilla sin whitewater), no se debe exigir starfish — el principio requiere espuma.
- Si el alumno está abrumado, volver a drill de "atrás" en arena con apoyo del coach.

---

## COACHING PRINCIPLE

Starfish es **direccional, no reactivo**. El coach debe instalar la dirección "atrás" como regla inquebrantable. Un starfish lateral es un starfish fallido — no es "casi bien" ni "dirección alternativa". Es error y se corrige inmediatamente.

**Regla del coach:** no celebrar ride si el desmonte fue lateral. Es un desmonte incompleto. El alumno debe internalizar que el colchón solo existe atrás.

---

## RELATED ERRORS

- `ERR-WB-060` Not Opening Body (frecuentemente coexiste — sin X no hay resistencia y alumno se lanza a lo que le sale natural)
- `ERR-WB-061` Dismount Too Late (decisión tardía → reacción lateral en lugar de ejecución atrás)

---

*TSS® Error DB · ERR-WB-059 Falling Side Instead of Back v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-060_Not_Opening_Body

## ERR-WB-060 — NOT OPENING BODY

**Step:** STP-020 Starfish Dismount
**Belt:** White Belt · Block 0 (Safety) · M3
**Severity:** HIGH
**Version:** v1.0

---

## DEFINITION

El alumno cae hacia atrás pero **no abre brazos ni piernas en forma de estrella / X**. El cuerpo queda cerrado, compacto, como proyectil. Sin apertura, no hay resistencia al agua — el alumno se hunde rápido hacia el fondo, aumentando el riesgo de chocar con arena, roca o el propio cuerpo del surfer contra la tabla.

---

## OBSERVABLE

- Cuerpo cerrado al caer: brazos pegados al torso, piernas juntas.
- Forma del cuerpo al entrar al agua: lineal, no "X".
- Penetración profunda al caer (va al fondo rápido).
- Impacto más fuerte que si estuviera abierto.
- Alumno emerge más lejos de la tabla, desorientado.
- En video: ausencia clara de forma de estrella.

---

## WHY IT HAPPENS

1. **Miedo a abrirse:** inconscientemente protege el torso cerrando el cuerpo.
2. **Coach no enseñó la forma "X" como parte clave:** alumno solo "cae atrás".
3. **Instinto de protección:** cuerpo se cierra reflejo en caída.
4. **Falta de práctica en seco:** nunca ejecutó "X completa" conscientemente.
5. **Starfish apurado:** ejecuta en último segundo sin completar forma.

---

## WHY IT'S PROBLEMATIC

- **Sin resistencia = penetración profunda:** se va al fondo rápido. Peligro en aguas shallow (choque con arena / roca / coral).
- **Impacto mayor:** cuerpo cerrado concentra fuerza en una línea; abierto la distribuye.
- **Bloquea la doctrina de starfish:** sin "X", no hay starfish — es solo "caer".
- **Hábito peligroso en belts superiores:** en olas grandes, cerrado = más peligro de impacto con fondo.
- **Inseguridad general:** alumno no puede confiar en la técnica si no la ejecuta completa.

---

## COACH INTERVENTION

### Verbal cue
> *"Abrí. Brazos. Piernas. X completa. Ancho."*

### Demo isométrica
- Coach hace starfish en arena y se mantiene estrella en el suelo 10 segundos.
- Alumno reproduce la forma en el suelo.
- Repetir 5 veces hasta que la "X" sea forma corporal familiar.

### Drill de apertura
- Alumno de pie, piernas separadas, brazos abiertos.
- Coach dice *"más ancho"* — alumno extiende al máximo.
- Objetivo: alumno siente máxima apertura como referencia corporal.

---

## FIX PROTOCOL

1. **Drill isométrico de X en arena:** alumno mantiene forma 10s × 5 reps.
2. **Demo comparativa:** coach cae cerrado vs abierto — alumno ve consecuencia.
3. **Slow-motion starfish:** ejecutar todo el movimiento ultra-lento, enfocando apertura.
4. **Video análisis:** mostrar al alumno su caída y pedir que identifique si está en "X".
5. **Re-test:** 3 starfishes consecutivos con "X" completa verificada por coach.

---

## WHEN TO REGRESS

- Si el miedo es muy fuerte, empezar con caídas en aguas muy shallow donde el alumno sienta que "no puede irse profundo".
- Si hay limitación física de apertura, adaptar dentro del rango posible sin sacrificar el principio.

---

## COACHING PRINCIPLE

Starfish es **forma**, no solo dirección. Sin "X", no hay starfish — es solo caer atrás, lo cual es apenas mejor que caer de lado. La apertura es lo que transforma una caída en técnica.

**Regla del coach:** celebrar solo starfishes donde la "X" sea claramente visible. Sin X, el rep no cuenta. El alumno debe sentir la apertura como firma del movimiento.

---

## RELATED ERRORS

- `ERR-WB-059` Falling Side Instead of Back (sin apertura, alumno pierde dirección atrás)
- `ERR-WB-061` Dismount Too Late (decisión tardía → ejecución apurada → sin apertura completa)

---

*TSS® Error DB · ERR-WB-060 Not Opening Body v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-061_Dismount_Too_Late

## ERR-WB-061 — DISMOUNT TOO LATE

**Step:** STP-020 Starfish Dismount
**Belt:** White Belt · Block 0 (Safety) · M3
**Severity:** MEDIUM
**Version:** v1.0

---

## DEFINITION

El alumno no decide desmontar a tiempo. Continúa el ride hasta que la tabla está muy cerca de la orilla, el agua es muy shallow, o la ola ya lo empuja descontroladamente. Cuando finalmente ejecuta starfish, la espuma detrás ya se disipó, la arena está demasiado cerca, o el alumno está en zona de impacto. El starfish pierde su principal ventaja: el colchón de espuma.

---

## OBSERVABLE

- Ride se alarga más allá del punto seguro.
- Alumno acerca hasta la arena (o muy cerca) antes de decidir.
- Cuando ejecuta starfish, detrás ya no hay espuma o la espuma es mínima.
- Impacto mayor (más cerca del fondo).
- Alumno puede chocar con arena o rocas post-caída.
- Coach tuvo que gritar varias veces "¡salí!" antes de que el alumno actuara.

---

## WHY IT HAPPENS

1. **No se instaló la decisión anticipada:** alumno cree que "hay que aprovechar el ride al máximo".
2. **Disfrute mental:** alumno no quiere terminar — sigue hasta que es forzado.
3. **Falta de conciencia espacial:** no mide distancia a la orilla.
4. **Starfish visto como rescate, no como técnica:** lo ejecuta solo cuando no le queda opción.
5. **Coach no entrena identificación de momento:** se enfoca solo en mecánica.

---

## WHY IT'S PROBLEMATIC

- **Sin colchón:** starfish sin espuma detrás es starfish incompleto.
- **Riesgo de impacto con fondo:** aguas shallow + decisión tardía = peligro.
- **Hábito reactivo:** el alumno nunca aprende a planear el final del ride.
- **Bloquea autonomía:** depende del coach para saber cuándo salir.
- **Transfiere a belts superiores:** en olas grandes, decisión tardía puede ser lesión.

---

## COACH INTERVENTION

### Verbal cue
> *"Decidí antes de que sea emergencia. Anticipá. No esperes."*

### Referencias espaciales
- Coach marca en la arena o señala en el agua el punto "salí antes de acá".
- Alumno internaliza referencia visual de "punto de salida".

### Señal activa desde canal
- Coach grita *"¡AHORA!"* cuando ve el momento correcto.
- Durante 3-5 sesiones, el alumno ejecuta al escuchar la señal.
- Después, coach deja de señalar y alumno decide solo.

---

## FIX PROTOCOL

1. **Instalar concepto "anticipar":** cada ride termina con decisión propia de salir.
2. **Referencia espacial:** marca visual de "punto de salida" en la sesión.
3. **Señal desde canal:** coach como cronómetro externo durante 3-5 sesiones.
4. **Pregunta post-rep:** *"¿En qué momento decidiste salir? ¿Fue tarde?"*
5. **Autonomía:** retirar la señal del coach gradualmente.

---

## WHEN TO REGRESS

- Si el alumno no tiene conciencia espacial aún, dedicar sesión a solo observar el movimiento de la espuma y la orilla antes de ejecutar rides.
- Si disfruta tanto que no quiere terminar, trabajar mental: el ride bien ejecutado incluye un final controlado.

---

## COACHING PRINCIPLE

Desmontar **es parte del ride**. Un ride que termina descontrolado no es un ride exitoso — es un ride incompleto. El alumno debe internalizar: el final bien ejecutado es tan valioso como el pop-up y la postura.

**Regla del coach:** no celebrar el ride si el desmonte fue tardío. Evaluar el ride completo, no solo la parte de pie.

---

## RELATED ERRORS

- `ERR-WB-059` Falling Side Instead of Back (decisión tardía → reacción lateral)
- `ERR-WB-060` Not Opening Body (ejecución apurada → X incompleta)

---

*TSS® Error DB · ERR-WB-061 Dismount Too Late v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-020';

UPDATE lessons SET
  description_md = $tss$# STP-021 — TURN BACKSIDE

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-21 — BACKSIDE RAIL CHANGE DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-062_Not_Looking_Where_Going

## ERR-WB-062 — NOT LOOKING WHERE GOING

**Belt:** White Belt
**Step:** STP-021 Turn Backside
**Severity:** HIGH
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno intenta ejecutar el turn backside **sin mirar primero** hacia donde quiere ir. Gira por inercia o reacción muscular, rompiendo el primer eslabón de la cadena cinética. La mirada es el iniciador que activa toda la secuencia; sin ella, el cuerpo arranca desordenado.

---

## WHAT IT LOOKS LIKE

- Alumno ejecuta movimiento de cadera/hombros sin rotar cuello previamente.
- Cuello queda fijo mirando al frente mientras el cuerpo intenta girar.
- Alumno mira *después* de empezar el turn (mirada reactiva, no directiva).
- Cuerpo gira pero sin dirección clara — tabla no responde con precisión backside.
- Turn corto o inclompleto — la tabla no cruza del todo.

---

## WHY IT HAPPENS

- Desconocimiento del principio: "eyes first, rail responds."
- Alumno cree que girar es trabajo del torso/cadera, no de la mirada.
- Miedo a mirar hacia atrás (backside) por sensación de perder orientación.
- Cuello rígido por tensión general.
- Falta de demo clara del coach mostrando la secuencia ojos → cuerpo.

---

## CONSEQUENCES

- Cadena cinética rota desde el primer eslabón.
- Turn ejecutado por inercia, no por técnica.
- Tabla no cruza o cruza parcialmente.
- Alumno termina desarmado post-turn.
- Se instala hábito reactivo difícil de desmontar en belts superiores.

---

## CORRECTION PROTOCOL

**Arena:**
1. Coach demuestra: postura de poder + cuello rota primero (goofy: hombro derecho · regular: hombro izquierdo) ANTES de mover cualquier otra cosa.
2. Alumno reproduce rotación de cuello solo (sin involucrar cuerpo). 5 reps.
3. Alumno encadena: mirada → pausa → oblicuo. 5 reps.
4. Coach señala cada vez: *"Primero los ojos. Después todo lo demás."*

**Agua:**
1. Coach ubicado a 45° backside del alumno. Antes de cada turn, coach levanta la mano como punto visual: *"Mirame."*
2. Alumno rota cuello hacia coach antes de iniciar turn.
3. Progresión: reducir pistas visuales externas hasta que el alumno mire autónomamente.

---

## COACHING CUES

**During:**
- *"Ojos primero."*
- *"Look."*
- *"Mirá antes de mover."*

**Post-rep:**
- *"¿Miraste antes o después de empezar a girar?"*
- *"¿Dónde miraste primero?"*

---

## PREVENTION

- Enseñar la cadena en orden desde la primera demo.
- No permitir que el alumno ejecute turn sin mirada inicial — pausar y reiniciar.
- Drill de mirada aislada en arena antes de agua.
- Instalar micro-cue *"Eyes first. Rail responds."*

---

## RELATED

- **STP-021 Turn Backside** (step afectado).
- **DRL-WB-21** (drill correctivo).
- **ERR-WB-063** (shoulder rotation — error adjacent).

---

*TSS® White Belt · ERR-WB-062 v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-063_Shoulder_Rotation_Instead_of_Oblique

## ERR-WB-063 — SHOULDER ROTATION INSTEAD OF OBLIQUE

**Belt:** White Belt
**Step:** STP-021 Turn Backside
**Severity:** HIGH
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno intenta girar **rotando los hombros** en lugar de activar el oblicuo. Rompe la regla central del Power Stance (hombros al frente) y ejecuta un turn forzado, sin cadena cinética. La tabla puede girar por inercia, pero el cuerpo queda desarmado y sin control.

---

## WHAT IT LOOKS LIKE

- Hombros rotan hacia backside junto con (o en lugar de) el oblicuo.
- Torso completo se tuerce — pecho ya no apunta al frente.
- Postura se desarma durante el turn.
- Alumno pierde peso adelantado (peso se desplaza atrás al torcer).
- Turn se ve "muscular" pero sin precisión — tabla responde solo por inercia.

---

## WHY IT HAPPENS

- Reflejo natural: girar = rotar todo el cuerpo.
- Alumno no entiende que el oblicuo puede iniciar rotación sin mover hombros.
- Falta de conciencia del oblicuo como músculo independiente.
- Demo del coach no aisló el oblicuo visualmente.
- Alumno copia turns vistos en video (a menudo avanzados) donde hombros sí rotan.

---

## CONSEQUENCES

- Postura de poder (STP-018) destruida durante el turn.
- Peso se sale del pie delantero → tabla frena o desorientada.
- Alumno termina el turn desarmado, sin capacidad de encadenar siguiente maniobra.
- Fundamento incorrecto para turns de belts superiores (cutback, snap se construyen sobre esta cadena).
- Riesgo de lesión lumbar por torsión mal ejecutada.

---

## CORRECTION PROTOCOL

**Arena:**
1. Coach sostiene hombros del alumno con presión ligera — fuerza a que no roten.
2. Alumno ejecuta cadena: mirada → oblicuo → cadera → talón, sintiendo que los hombros quedan fijos.
3. Alumno identifica sensación del oblicuo activándose (mano en costado para sentir).
4. 5 reps con coach sosteniendo + 5 reps sin asistencia.

**Demo comparativa:**
1. Coach muestra turn CORRECTO (oblicuo inicia, hombros al frente).
2. Coach muestra turn INCORRECTO (hombros rotan, torso torcido).
3. Alumno identifica la diferencia visualmente.

**Agua:**
1. Coach observa desde el canal: *"¿Hombros al frente?"*
2. Si hombros rotan, pausar y regresar a arena.
3. Recordar micro-cue *"Shoulders forward. Only neck rotates."*

---

## COACHING CUES

**During:**
- *"Hombros al frente."*
- *"Solo oblicuo."*
- *"Pecho apuntando a la nariz de la tabla."*

**Post-rep:**
- *"¿Sentiste el oblicuo como iniciador?"*
- *"¿O rotaste hombros?"*

---

## PREVENTION

- Reforzar regla del Power Stance: hombros al frente siempre.
- Drill de aislamiento de oblicuo en arena (coach sosteniendo hombros).
- Demo comparativa correcto vs incorrecto en cada sesión inicial.
- Verificar visualmente hombros al frente en cada rep.

---

## RELATED

- **STP-018 Power Stance** (regla hombros al frente).
- **STP-021 Turn Backside** (step afectado).
- **ERR-WB-053** (inactive scapula — error adjacent de postura).

---

*TSS® White Belt · ERR-WB-063 v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-064_Disconnected_Body

## ERR-WB-064 — DISCONNECTED BODY

**Belt:** White Belt
**Step:** STP-021 Turn Backside
**Severity:** MEDIUM
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno ejecuta el turn con el **cuerpo desconectado** — partes del cuerpo se mueven independientemente sin formar cadena. Brazos van para un lado, caderas para otro, trasero sobresale, talón no aplica presión coordinada. La tabla puede girar por inercia, pero el alumno termina desarmado y sin preparación para lo siguiente.

---

## WHAT IT LOOKS LIKE

- Brazos sueltos volando sin intención.
- Trasero sobresale hacia atrás o lateral.
- Manos van en dirección opuesta al turn.
- Talón no hunde riel porque la cadena se rompe antes.
- Postura "rota" visualmente — no hay línea clara del cuerpo.
- Alumno termina el turn con cuerpo disperso, no en postura de poder.

---

## WHY IT HAPPENS

- Alumno ejecuta turn pensando en una sola cosa (ej. "girar tabla") sin integrar cadena.
- Cadena cinética no fue instalada en orden — faltó arena previa.
- Alumno intenta aplicar fuerza en exceso, perdiendo coordinación.
- Postura de poder (STP-018) aún no suficientemente automatizada.
- Tensión general del alumno — cuerpo reacciona fragmentado.

---

## CONSEQUENCES

- Turn reactivo, no técnico.
- Sin fundamento para turns avanzados (cada cadena mal ejecutada es un hábito a desmontar).
- Alumno se frustra porque "gira" pero no controla.
- Post-turn desarmado → incapaz de encadenar otra maniobra.
- Sensación de "falta de control" en el alumno, aunque técnicamente está girando.

---

## CORRECTION PROTOCOL

**Arena (re-instalación de cadena):**
1. Regresar a fase 1 del drill (DRL-WB-21) — cadena aislada.
2. Ejecutar mirada sola, luego mirada + oblicuo, luego + cadera, luego + talón.
3. Alumno verbaliza cada eslabón mientras lo ejecuta: *"Look... oblique... hip... heel."*
4. Coach verifica línea del cuerpo en cada rep — cabeza, hombros, cadera alineados.

**Agua:**
1. Reducir velocidad del ride si es posible (olas más pequeñas o spot más estable).
2. Alumno ejecuta turn con verbalización mental de la cadena.
3. Coach post-rep: *"¿Sentiste los 4 eslabones?"*

---

## COACHING CUES

**During:**
- *"Conectado."*
- *"En orden."*
- *"Todo en línea."*

**Post-rep:**
- *"¿Terminaste en postura o desarmado?"*
- *"¿Qué eslabón sentiste más claro?"*
- *"¿Cuál eslabón faltó?"*

---

## PREVENTION

- No saltar la fase de arena — la cadena debe instalarse aislada primero.
- Verificar postura de poder (STP-018) certificada antes de intentar turn.
- No exigir fuerza — exigir orden.
- Slow-motion turn en arena para sentir la cadena antes de velocidad real.

---

## RELATED

- **STP-018 Power Stance** (prerequisito).
- **STP-021 Turn Backside** (step afectado).
- **DRL-WB-21** (drill de re-instalación).
- **ERR-WB-062, ERR-WB-063** (errores adjacentes en la cadena).

---

*TSS® White Belt · ERR-WB-064 v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-021';

UPDATE lessons SET
  description_md = $tss$# STP-022 — TURN FRONTSIDE

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-22 — FRONTSIDE RAIL CHANGE DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-065_Arms_Reaching_Forward

## ERR-WB-065 — ARMS REACHING FORWARD

**Belt:** White Belt
**Step:** STP-022 Turn Frontside
**Severity:** HIGH
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

Durante el turn frontside, los **dos brazos se disparan hacia adelante** como queriendo alcanzar algo. La escápula se desactiva, la postura se desarma, y aunque la tabla puede responder por inercia, el cuerpo queda desconectado y sin control post-turn.

---

## WHAT IT LOOKS LIKE

- Ambos brazos extendidos hacia adelante durante el turn.
- Escápula colapsada (hombros adelantados, no atrás).
- Torso adelantado queriendo "alcanzar" la dirección del turn.
- Manos sueltas sin intención.
- Postura rota — cuerpo no queda en línea.
- Alumno termina el turn desarmado, sin poder encadenar.

---

## WHY IT HAPPENS

- Alumno interpreta "mirar hacia frontside" como "ir con todo el cuerpo hacia frontside".
- Confunde dirección de intención con dirección del cuerpo.
- Escápula no automatizada desde Power Stance (STP-018).
- Tensión: alumno cree que tiene que "empujar" la tabla con los brazos.
- Falta de demo clara mostrando brazos en control durante frontside.

---

## CONSEQUENCES

- Cuerpo desconectado durante el turn crítico.
- Escápula inactiva — postura de poder destruida.
- Alumno termina sin control, incapaz de encadenar próxima maniobra.
- Fundamento incorrecto para turns avanzados (cutback frontside, snap frontside).
- Tensión y cansancio prematuro por esfuerzo mal dirigido.

---

## CORRECTION PROTOCOL

**Arena:**
1. Drill con manos en cintura — alumno ejecuta cadena frontside con manos sostenidas, no permite que los brazos se disparen.
2. Alumno siente postura conectada sin brazos interfiriendo.
3. Repetir con brazos libres pero manteniendo compacidad. 5 reps.
4. Coach enfatiza: *"Los brazos NO dirigen el turn. El oblicuo sí."*

**Demo comparativa:**
1. Coach muestra frontside CORRECTO (brazos compactos, escápula activa).
2. Coach muestra frontside INCORRECTO (brazos disparados hacia adelante).
3. Alumno identifica la diferencia.

**Agua:**
1. Recordatorio antes de cada turn: *"Brazos compactos."*
2. Si los brazos vuelan, pausar y regresar a drill de arena.
3. Verificar activación escapular (regresar a STP-018 si es necesario).

---

## COACHING CUES

**During:**
- *"Brazos compactos."*
- *"Stay connected."*
- *"Manos cerca."*
- *"El oblicuo dirige, no los brazos."*

**Post-rep:**
- *"¿Dónde quedaron tus manos?"*
- *"¿Sentiste la escápula activa?"*
- *"¿Tu cuerpo quedó en línea?"*

---

## PREVENTION

- Reforzar activación escapular desde STP-018 Power Stance.
- Drill manos-en-cintura antes de cada turn frontside inicial.
- Demo comparativa brazos-disparados vs brazos-compactos.
- No exigir frontside hasta que la conexión corporal esté instalada.

---

## RELATED

- **STP-018 Power Stance** (escápula activa, hombros al frente).
- **STP-022 Turn Frontside** (step afectado).
- **ERR-WB-053** (inactive scapula — error raíz).

---

*TSS® White Belt · ERR-WB-065 v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-066_Weight_Falls_Off_Front_Foot

## ERR-WB-066 — WEIGHT FALLS OFF FRONT FOOT

**Belt:** White Belt
**Step:** STP-022 Turn Frontside
**Severity:** HIGH
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

Durante el turn frontside, el **peso del alumno se desplaza hacia atrás** — se sale del pie delantero que debe mantener presión. La tabla frena o no cruza con energía. En frontside, la presión pie delantero es crítica; perderla rompe el turn.

---

## WHAT IT LOOKS LIKE

- Peso visible en el pie de atrás durante el turn.
- Torso atrás, cadera retrocedida.
- Tabla pierde velocidad durante el turn (frena en lugar de cruzar con energía).
- Alumno siente que "empuja hacia atrás" para girar.
- Tabla puede cruzar pero sin flow — se ve frenada, no fluida.

---

## WHY IT HAPPENS

- Alumno confunde "rotar" con "ir hacia atrás".
- Reflejo natural de protección: al girar, alumno se inclina hacia atrás buscando estabilidad.
- Power Stance (STP-018) no suficientemente automatizada — regla peso 80/20 se rompe bajo presión.
- Miedo a la velocidad — alumno frena inconscientemente.
- Demo no enfatizó que pie delantero mantiene presión durante el turn.

---

## CONSEQUENCES

- Turn frontside se ve "frenado" en lugar de fluido.
- Tabla pierde velocidad — ride se acorta o termina.
- Alumno no puede encadenar próxima maniobra (sin velocidad no hay flow).
- Postura se desarma — mismo efecto que perder peso adelante en Power Stance.
- Fundamento incorrecto para turns avanzados donde la velocidad es esencial.

---

## CORRECTION PROTOCOL

**Arena:**
1. Re-instalar regla 80/20 del peso (STP-018).
2. Alumno ejecuta cadena frontside con verificación visual del peso en pie delantero.
3. Coach pone mano en hombro delantero del alumno, pidiendo presión sobre esa mano durante el turn.
4. Drill: cadena frontside + rodilla delantera flexionada (fuerza peso adelante). 5 reps.

**Agua:**
1. Antes del turn: *"Peso adelante siempre."*
2. Si alumno frena, pausar — probablemente peso se fue atrás.
3. Pedir turn con velocidad sostenida — "no frenes, sigue adelante".

---

## COACHING CUES

**During:**
- *"Pressure forward."*
- *"Peso adelante."*
- *"Rodilla delantera."*
- *"Sigue adelante."*

**Post-rep:**
- *"¿Peso adelante durante todo el turn?"*
- *"¿O se fue atrás?"*
- *"¿La tabla frenó o cruzó con energía?"*

---

## PREVENTION

- Verificar Power Stance certificada con regla 80/20 automatizada.
- Demo enfatizando presión pie delantero durante todo el frontside.
- Drill de rodilla delantera flexionada (fuerza peso adelante).
- No permitir turn frontside con peso atrás — pausar y corregir.

---

## RELATED

- **STP-018 Power Stance** (regla 80/20).
- **STP-022 Turn Frontside** (step afectado).
- **ERR-WB-054** (weight on back foot — error raíz adjacente).

---

*TSS® White Belt · ERR-WB-066 v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-067_Board_Not_Responding_Frontside

## ERR-WB-067 — BOARD NOT RESPONDING (FRONTSIDE)

**Belt:** White Belt
**Step:** STP-022 Turn Frontside
**Severity:** MEDIUM
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno ejecuta la cadena cinética hacia frontside pero **la tabla no cruza** — o cruza muy parcialmente. Antes de exigir más fuerza, el coach debe verificar (1) posición del pie atrás (FP2), (2) presión pie delantero, (3) orden de la cadena.

---

## WHAT IT LOOKS LIKE

- Alumno rota cuello, activa oblicuo, pero la tabla apenas responde.
- Tabla "amaga" el cruce pero vuelve a la línea original.
- Alumno frustrado porque "hace los movimientos" pero no pasa nada.
- Ride continúa en dirección similar a la inicial.

---

## WHY IT HAPPENS

- Pie de atrás mal posicionado (no en FP2 correcto) — sin palanca no hay respuesta.
- Presión insuficiente en pie delantero — cadena se rompe antes del riel.
- Cadena ejecutada sin convicción — cada eslabón muy leve.
- Setup previo débil — energía insuficiente para que la tabla responda.
- Olas muy pequeñas — falta velocidad mínima para que el riel responda.

---

## CONSEQUENCES

- Alumno se frustra y puede abandonar el intento.
- Se instala hábito de "intentar sin efecto" — peligroso para autoimagen técnica.
- Alumno empieza a sobrecompensar con fuerza (lleva a errores mayores).
- Pérdida de confianza en la cadena cinética.

---

## CORRECTION PROTOCOL

**Diagnóstico antes que fuerza:**
1. Revisar FP2 (STP-017) — ¿pie atrás bien posicionado? Corregir si es necesario.
2. Revisar peso — ¿80/20 respetado? ¿Presión adelante?
3. Revisar cadena — ¿mirada, oblicuo, postura, front, rail en orden?
4. Revisar setup — ¿cobra, pop-up, postura antes del turn?
5. Revisar condiciones — ¿velocidad suficiente?

**Ajustes en orden:**
1. Primero: corregir FP2.
2. Segundo: enfatizar presión pie delantero.
3. Tercero: reinstalar cadena en arena si es necesario.
4. Cuarto: cambiar spot si condiciones son insuficientes.
5. Último recurso: exigir más fuerza — pero solo después de verificar los anteriores.

---

## COACHING CUES

**Diagnostic questions:**
- *"¿Tu pie atrás está bien puesto?"*
- *"¿Sentiste presión adelante?"*
- *"¿La cadena estuvo en orden?"*
- *"¿Venías con velocidad?"*

**Action:**
- *"Revisa el pie."*
- *"Más presión adelante."*
- *"Cadena completa — no cortes."*

---

## PREVENTION

- Verificar FP2 y Power Stance antes de cada sesión de turns.
- No asumir que "más fuerza" resolverá — casi siempre el problema está en setup.
- Elegir spot con velocidad adecuada para el nivel.
- Enseñar diagnóstico al alumno: "si no responde, revisa el pie, no la fuerza".

---

## RELATED

- **STP-017 Feet Position** (FP2 es la palanca).
- **STP-018 Power Stance** (peso adelante).
- **STP-022 Turn Frontside** (step afectado).
- **DRL-WB-22** (drill correctivo).

---

*TSS® White Belt · ERR-WB-067 v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-022';

UPDATE lessons SET
  description_md = $tss$# STP-023 — PADDLE OUT

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-23 — PADDLE OUT EFFICIENCY DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-068_Wrong_Sweet_Spot

## ERR-WB-068 — WRONG SWEET SPOT

**Belt:** White Belt
**Step:** STP-023 Paddle Out
**Severity:** HIGH
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno no está acomodado en el **sweet spot** correcto. Está muy adelante (tabla hunde nariz) o muy atrás (tabla hunde cola). Cada brazada trabaja contra el agua en lugar de proyectar la tabla. Es el error más costoso energéticamente — agota al alumno independientemente de la técnica de brazada.

---

## WHAT IT LOOKS LIKE

**Muy adelante:**
- Nariz de la tabla hundida o casi debajo del agua.
- Tabla "ara" el agua con cada brazada.
- Avance mínimo, gran resistencia.

**Muy atrás:**
- Cola hundida, nariz alta.
- Brazadas no alcanzan el agua con buena proyección.
- Tabla "trota" en lugar de deslizar.

---

## WHY IT HAPPENS

- STP-010 Sweet Spot (prerequisito) no suficientemente automatizado.
- Alumno se acomoda cómodo para su cuerpo, no para la tabla.
- Tabla nueva o diferente — sweet spot cambia según modelo.
- Alumno no conoce sensación visual de sweet spot correcto.
- Coach no verificó sweet spot antes de iniciar paddle out.

---

## CONSEQUENCES

- Agotamiento desproporcionado al esfuerzo real.
- Alumno no llega al lineup.
- Alumno culpa su "fuerza" cuando el problema es posición.
- Frustración que puede abandonar el paddle out.
- Fundamento incorrecto para duck dive (Blue Belt+).

---

## CORRECTION PROTOCOL

**En arena:**
1. Alumno se acuesta en tabla.
2. Coach observa desde costado — nivel de tabla debe ser aproximadamente paralelo al suelo.
3. Alumno ajusta hasta sentir la posición.
4. Coach marca visualmente punto en tabla para referencia.

**En agua quieta:**
1. Alumno se acomoda en sweet spot identificado.
2. Hace 5 brazadas.
3. Coach observa: ¿nariz hunde? → mover atrás. ¿Cola hunde? → mover adelante.
4. Repetir hasta que la tabla esté nivelada.

**Durante el paddle out:**
- Recordatorio constante antes de arrancar: *"Sweet spot primero."*
- Si alumno se agota, pausar y verificar sweet spot antes de corregir técnica.

---

## COACHING CUES

**During:**
- *"Sweet spot primero."*
- *"Tabla plana."*
- *"Pecho al centro."*

**Post-rep:**
- *"¿Dónde estaba tu pecho?"*
- *"¿La tabla estaba plana?"*
- *"¿Hunde nariz o cola?"*

---

## PREVENTION

- Verificar sweet spot automatizado (STP-010) antes de paddle out.
- Marcar visualmente punto en tabla si es necesario.
- Enseñar que sweet spot es lo primero — no negociable.
- Revisar sweet spot cada vez que se cambia de tabla.

---

## RELATED

- **STP-010 Get on Board / Sweet Spot** (prerequisito).
- **STP-023 Paddle Out** (step afectado).
- **DRL-WB-23** (drill correctivo).

---

*TSS® White Belt · ERR-WB-068 v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-069_Stiff_Hands_Poor_Entry

## ERR-WB-069 — STIFF HANDS / POOR ENTRY

**Belt:** White Belt
**Step:** STP-023 Paddle Out
**Severity:** HIGH
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno entra al agua con la **mano rígida** (como pala) en lugar de con dedos aerodinámicos y mano relajada. Genera resistencia, splash grueso y pérdida de propulsión. Cada brazada gasta más energía de la necesaria para poco avance.

---

## WHAT IT LOOKS LIKE

- Mano tensa, dedos juntos y rígidos (tipo "cuchara" tensa).
- Splash grueso y ruidoso al entrar al agua.
- Alumno siente "golpear el agua" en lugar de cortarla.
- Brazos tensos desde el hombro.
- Fatiga rápida en antebrazos y hombros.

---

## WHY IT HAPPENS

- Alumno cree que "mano firme = más potencia". Lo contrario — la mano relajada es más eficiente.
- Tensión general por inexperiencia en paddle out.
- Copia de imagen incorrecta de "remar fuerte".
- Falta de demo del coach mostrando la entrada aerodinámica vs pala rígida.
- Miedo a no tener control, sobrecompensa con tensión.

---

## CONSEQUENCES

- Gran gasto energético por cada brazada.
- Splash grueso = resistencia = menos propulsión.
- Brazos y hombros cansados rápidamente.
- Alumno no llega al lineup sin agotarse.
- Fundamento incorrecto para natación eficiente general.

---

## CORRECTION PROTOCOL

**Arena (simulación):**
1. Alumno simula brazada con mano relajada — dedos ligeramente separados, entrada punta-dedo primero.
2. Coach demuestra vs pala rígida.
3. Alumno siente diferencia entre mano relajada y mano tensa.
4. 10 brazadas simuladas.

**Agua quieta (sensación):**
1. Alumno paddlea 10m con foco único en mano relajada.
2. Escucha el sonido: relajada = silenciosa. Rígida = ruidosa.
3. Siente el avance: relajada = fluida. Rígida = trabada.

**Correctivo durante paddle out:**
- Si el alumno se tensa, recordatorio: *"Manos relajadas."*
- Pausar si es necesario, relajar brazos y hombros.

---

## COACHING CUES

**During:**
- *"Manos relajadas."*
- *"Dedos primero."*
- *"Corta el agua, no la golpees."*
- *"Entrada silenciosa."*

**Post-rep:**
- *"¿Tus manos estaban relajadas o tensas?"*
- *"¿Escuchaste splash grueso o entrada limpia?"*
- *"¿Sentiste que cortabas el agua?"*

---

## PREVENTION

- Demo clara de entrada aerodinámica vs pala rígida en primera sesión.
- Enfatizar que relajación = propulsión, no fuerza = propulsión.
- Drill de sensación en agua quieta antes de paddle out real.
- No permitir paddle out con manos visiblemente tensas.

---

## RELATED

- **STP-023 Paddle Out** (step afectado).
- **DRL-WB-23** (drill correctivo).
- **ERR-WB-068** (wrong sweet spot — adjacente).

---

*TSS® White Belt · ERR-WB-069 v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-070_Pushing_Up_Instead_of_Forward

## ERR-WB-070 — PUSHING UP INSTEAD OF FORWARD

**Belt:** White Belt
**Step:** STP-023 Paddle Out
**Severity:** MEDIUM
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno empuja hacia abajo con la brazada, levantando la **nariz de la tabla** en lugar de proyectarla hacia adelante. La tabla "sube" con cada brazada pero no avanza con eficiencia. Es un error de dirección de la fuerza, no de cantidad.

---

## WHAT IT LOOKS LIKE

- Nariz de la tabla se levanta visiblemente con cada brazada.
- Tabla "cabecea" — sube y baja en lugar de deslizar.
- Alumno visualmente se esfuerza pero avanza poco.
- Efecto de "bombeo vertical" en lugar de proyección horizontal.
- Cansancio en zona alta de brazos y pecho.

---

## WHY IT HAPPENS

- Alumno intenta levantar el pecho con cada brazada.
- Confusión conceptual: alumno cree que "subir la tabla" ayuda a cortar agua.
- Brazada termina empujando hacia el piso en lugar de hacia atrás.
- Codo se va muy bajo durante la empuje — genera vector vertical.
- Falta de demo de proyección horizontal vs vertical.

---

## CONSEQUENCES

- Gran esfuerzo, poco avance.
- Alumno se agota sin entender por qué.
- Tabla no llega a velocidad de "deslizar" eficiente.
- Sensación de "estar siempre empezando" — no hay momentum.
- Fundamento incorrecto para remada de larga distancia.

---

## CORRECTION PROTOCOL

**Demo visual:**
1. Coach demuestra brazada con vector horizontal — mano entra, tira hacia atrás, sale por detrás.
2. Compara vs vector vertical (mano empuja hacia abajo).
3. Alumno identifica diferencia visualmente.

**Arena (simulación):**
1. Alumno simula brazada enfocando en "empujar agua hacia atrás" en lugar de "hacia abajo".
2. Imagina el agua pasando detrás del cuerpo, no bajo él.

**Agua quieta:**
1. Alumno paddlea 10m con foco único en proyección horizontal.
2. Coach observa desde costado: nariz de tabla debe quedar estable, no levantarse.
3. Si nariz se levanta, recordatorio: *"Adelante, no hacia arriba."*

---

## COACHING CUES

**During:**
- *"Push forward."*
- *"Empuja agua hacia atrás."*
- *"Nariz estable."*
- *"La tabla no sube — se desliza."*

**Post-rep:**
- *"¿La nariz se levantaba?"*
- *"¿Empujaste hacia adelante o hacia abajo?"*
- *"¿Sentiste que la tabla deslizaba?"*

---

## PREVENTION

- Demo visual clara de proyección horizontal vs vertical en primera sesión.
- Uso de la metáfora "tabla como flecha" — flecha no sube, avanza.
- Observar desde costado para verificar dirección de fuerza.
- No exigir más potencia — exigir dirección correcta.

---

## RELATED

- **STP-023 Paddle Out** (step afectado).
- **DRL-WB-23** (drill correctivo).
- **ERR-WB-068, ERR-WB-069** (errores adjacentes que contribuyen).

---

*TSS® White Belt · ERR-WB-070 v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-023';

UPDATE lessons SET
  description_md = $tss$# STP-024 — TURTLE ROLL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-24 — TURTLE ROLL SAFETY DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-071_Poor_Alignment_Turtle

## ERR-WB-071 — POOR ALIGNMENT (TURTLE ROLL)

**Belt:** White Belt
**Step:** STP-024 Turtle Roll
**Severity:** HIGH
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno ejecuta turtle roll con la **tabla mal alineada** respecto a la dirección de la espuma. La tabla no queda perpendicular al frente de onda, lo que hace que la espuma arrastre lateralmente al alumno, le quita la tabla, o compromete la rotación.

---

## WHAT IT LOOKS LIKE

- Tabla cruzada (paralela o diagonal) cuando llega la espuma.
- Espuma arrastra al alumno hacia el costado.
- Alumno pierde tabla durante la rotación.
- Sensación de "volteo descontrolado" en lugar de rotación técnica.
- Tabla sale disparada hacia los lados.

---

## WHY IT HAPPENS

- Alumno no giró la tabla antes de rotar.
- Detección tardía de la espuma — no hubo tiempo de alinear.
- Alumno asume que la alineación no importa.
- Cansancio durante paddle out — no prioriza alineación.
- Falta de demo enseñando alineación como primer paso.

---

## CONSEQUENCES

- Pérdida de la tabla durante turbulencia.
- Riesgo para otros surfers (tabla volando).
- Alumno sale desorientado post-espuma.
- Desgaste energético mayor.
- Posible falla en regla no-negociable "no soltar tabla".

---

## CORRECTION PROTOCOL

**Arena:**
1. Coach explica "perpendicular" con gestos — nariz contra frente de onda.
2. Alumno simula rotación de tabla ANTES de la rotación personal.
3. Verbalizar: *"Primero alineo, después ruedo."*

**Agua quieta:**
1. Alumno ejecuta rotación con tabla en distintas direcciones.
2. Compara sensación de rotación alineada vs cruzada.
3. Siente cómo la tabla se comporta diferente.

**Agua con espuma:**
1. Coach señala dirección de espuma antes de cada roll.
2. Alumno alinea tabla explícitamente antes de rotar.
3. Progresión: espuma pequeña → estándar.

---

## COACHING CUES

**During:**
- *"Align first."*
- *"Nariz contra espuma."*
- *"Perpendicular."*

**Post-rep:**
- *"¿Estaba la tabla alineada?"*
- *"¿Sentiste espuma arrastrándote lateral?"*
- *"¿Tuviste tiempo de alinear?"*

---

## PREVENTION

- Enseñar alineación como primer paso explícito desde arena.
- Practicar detección visual de dirección de espuma.
- Rotar tabla con tiempo — no dejar alineación para último segundo.
- Verificar alineación en cada intento inicial.

---

## RELATED

- **STP-024 Turtle Roll** (step afectado).
- **DRL-WB-24** (drill correctivo).
- **ERR-WB-072** (letting go — error adjacente).

---

*TSS® White Belt · ERR-WB-071 v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-072_Letting_Go_of_Board

## ERR-WB-072 — LETTING GO OF BOARD

**Belt:** White Belt
**Step:** STP-024 Turtle Roll
**Severity:** HIGH (RED LINE — SAFETY VIOLATION)
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno **suelta la tabla** al llegar la espuma, sea por reflejo de miedo, por no tener instalado Turtle Roll, o por cansancio. Violación directa de la regla no-negociable de seguridad. La tabla queda a merced de la onda y puede golpear a otros surfers.

---

## WHAT IT LOOKS LIKE

- Alumno se suelta voluntariamente cuando ve la espuma acercarse.
- Alumno pierde agarre durante la rotación.
- Tabla sale disparada por leash (o se pierde si leash falla).
- Alumno sale lejos de la tabla y tiene que recuperarla desde otro punto.

---

## WHY IT HAPPENS

- Regla de seguridad no instalada como reflejo.
- Miedo al impacto sin técnica alternativa.
- Turtle Roll no enseñado antes de primera espuma.
- Cansancio — reflejo natural de "soltarse".
- Creencia incorrecta: "es más seguro soltar".

---

## CONSEQUENCES

- **Riesgo para terceros:** tabla puede golpear a otros surfers.
- **Pérdida de acceso al lineup** (expulsión de spots compartidos).
- **Pérdida de control** sobre la propia seguridad del alumno (tabla se mueve aleatoria).
- **Tabla puede dañarse** o perderse (leash puede romperse).
- **Fundamento de miedo** reemplaza fundamento de técnica.

---

## CORRECTION PROTOCOL

**Pedagógico — regla primero:**
1. Parar actividad. Sentar al alumno en la orilla.
2. Re-explicar regla: *"La tabla no se suelta. Nunca. En spot con gente, menos que nunca."*
3. Explicar consecuencias reales (incidentes, expulsión).
4. Alumno verbaliza regla en voz alta: *"No suelto la tabla."*

**Técnico — instalar turtle roll:**
1. Regresar a Fase 2 de DRL-WB-24 (agua quieta).
2. Ejecutar rotaciones sin presión de espuma — mecánica limpia.
3. Progresión gradual a espuma pequeña.
4. No avanzar a espuma estándar hasta que el alumno mantenga agarre consistente.

**Agua:**
- Coach acompañando cada espuma inicial.
- Intervención inmediata si alumno muestra intención de soltar.
- Recordatorio: *"¡Agarrá los rieles!"*

---

## COACHING CUES

**During:**
- *"¡NO sueltes!"*
- *"Agarrá los rieles."*
- *"Técnica, no miedo."*

**Post-rep:**
- *"¿Por qué soltaste?"*
- *"¿Tuviste miedo o cansancio?"*
- *"¿Recordás la regla?"*

---

## PREVENTION

- Enseñar Turtle Roll desde la primera sesión con espuma.
- Instalar regla "no soltar" antes de cualquier exposición a espuma.
- Repetir regla en cada sesión inicial.
- Dar al alumno alternativa técnica (turtle roll) — no dejarlo sin herramienta.
- Verificar agarre de rieles físicamente antes de cada roll inicial.

---

## RELATED

- **STP-024 Turtle Roll** (step afectado, técnica correctiva).
- **STP-000 Safety Rules** (doctrinal).
- **DRL-WB-24** (drill principal).

---

## SAFETY CLASSIFICATION

**RED LINE — NON-NEGOTIABLE RULE VIOLATION**

Soltar la tabla en spot compartido es causa inmediata de pausa de actividad y re-entrenamiento. No se avanza a paddle out real hasta que el alumno mantenga agarre consistentemente.

---

*TSS® White Belt · ERR-WB-072 v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-073_No_Elbow_Protection

## ERR-WB-073 — NO ELBOW PROTECTION

**Belt:** White Belt
**Step:** STP-024 Turtle Roll
**Severity:** MEDIUM
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno ejecuta turtle roll pero **los codos no suben sobre la tabla** — no crean la "jaula" protectora de la cara. Durante la turbulencia, la tabla puede golpear la nariz, frente, o boca del alumno. Error técnico con consecuencias físicas inmediatas.

---

## WHAT IT LOOKS LIKE

- Codos cerca del cuerpo o debajo de la tabla.
- Cara del alumno cerca de la superficie inferior de la tabla.
- Alumno recibe golpes de tabla durante turbulencia.
- Alumno reporta "me pegó la tabla" post-roll.

---

## WHY IT HAPPENS

- Alumno agarra rieles pero deja codos pegados al cuerpo.
- Falta de conciencia anatómica — no visualiza la "jaula".
- Agarre con manos no se acompaña de activación de hombros/codos.
- Demo del coach no enfatizó posición de codos.
- Cansancio — brazos pesan y caen.

---

## CONSEQUENCES

- Golpes en cara (nariz, frente, boca, dientes).
- Posible sangrado o lesión menor.
- Miedo post-incidente que dificulta futuros turtle rolls.
- Reflejo de soltar la tabla en próximas ocasiones (evitando golpe).
- Pérdida de confianza en la técnica.

---

## CORRECTION PROTOCOL

**Arena:**
1. Coach muestra la "jaula" con codos arriba, cara protegida.
2. Alumno reproduce con tabla en arena: mano en riel + codo arriba.
3. Verificar visualmente: codo debe estar por encima del borde de la tabla.
4. Repetir isométrico 10s × 3.

**Agua quieta:**
1. Rotación completa con foco único en codos arriba.
2. Coach verifica desde afuera: ¿codos sobresalen sobre línea de tabla?
3. Si no, corregir y repetir.

**Agua con espuma:**
1. Recordatorio antes de cada roll: *"Elbows up."*
2. Si golpe ocurre, pausar · analizar posición · corregir.

---

## COACHING CUES

**During:**
- *"Elbows up."*
- *"Codos arriba."*
- *"Jaula protectora."*

**Post-rep:**
- *"¿Sentiste la tabla cerca de tu cara?"*
- *"¿Tus codos estaban arriba?"*
- *"¿La tabla te tocó?"*

---

## PREVENTION

- Demo explícita de la "jaula" de codos en primera sesión.
- Drill isométrico en arena antes de agua.
- Verificar visualmente codos arriba en cada roll inicial.
- No permitir roll con codos bajos — pausar y corregir.

---

## RELATED

- **STP-024 Turtle Roll** (step afectado).
- **DRL-WB-24** (drill correctivo).
- **ERR-WB-071, ERR-WB-072** (errores adjacentes).

---

*TSS® White Belt · ERR-WB-073 v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-024';

UPDATE lessons SET
  description_md = $tss$# STP-025 — TURN LEFT AND RIGHT LYING ON BOARD

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  drill_md = $tss$# DRL-WB-25 — PRONE DIRECTION DRILL

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
*IP of Marcelo Castellanos / Enkrateia*$tss$,
  errors_md = $tss$### ERR-WB-074_Turning_Too_Far_Forward

## ERR-WB-074 — TURNING TOO FAR FORWARD

**Belt:** White Belt
**Step:** STP-025 Turn Left and Right Lying on Board
**Severity:** HIGH
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

En el modo **pivote sentado**, el alumno queda con las caderas demasiado adelantadas respecto a la cola de la tabla. La cola no se hunde — el peso está distribuido en el centro o hacia adelante. Sin cola hundida, la tabla no pivota: el alumno empuja con fuerza sin efecto direccional.

---

## WHAT IT LOOKS LIKE

- Alumno sentado con caderas cerca del centro de la tabla.
- Cola no se hunde visiblemente.
- Nariz queda baja — no se levanta.
- Alumno trata de girar con manos/pies pero la tabla apenas responde.
- Esfuerzo alto, rotación mínima.

---

## WHY IT HAPPENS

- Alumno busca posición "segura" centrada — no quiere desbalance.
- Falta de demo enseñando explícitamente "caderas hacia la cola".
- Miedo a caerse de la tabla por estar muy atrás.
- Confusión entre "sentado cómodo" y "sentado para pivote".
- Tabla no familiar — volumen/forma desconocida.

---

## CONSEQUENCES

- Pivote sin efecto — tabla no responde.
- Alumno pierde momento de ola que viene.
- Alumno se agota tratando de girar con fuerza.
- Frustración — "el pivote no sirve".
- Fundamento incorrecto para lineup management futuro.

---

## CORRECTION PROTOCOL

**Agua quieta:**
1. Coach demuestra con claridad: caderas hasta casi el final de la tabla, cola hundida.
2. Alumno reproduce — coach verifica visualmente la cola hundida.
3. Alumno siente el balance: más atrás se siente "incómodo" pero es necesario.
4. 5 pivotes con verificación visual de cola hundida.

**Corrección directa:**
- Coach señala gesto de "caderas hacia cola".
- Alumno ejecuta sin girar solo sintiendo posición.
- Luego integrar manos/pies para girar.

---

## COACHING CUES

**During:**
- *"Hips back."*
- *"Caderas hacia la cola."*
- *"Cola hundida."*
- *"Más atrás."*

**Post-rep:**
- *"¿Tus caderas fueron hacia atrás?"*
- *"¿Se hundió la cola?"*
- *"¿La tabla pivotó rápido o lento?"*

---

## PREVENTION

- Demo explícita de caderas atrás desde primera sesión.
- Verificación visual (cola hundida) en cada rep inicial.
- No aceptar pivote sentado con caderas centradas — pausar y corregir.
- Enseñar que el desbalance sentido es correcto — ahí es donde pivota.

---

## RELATED

- **STP-025 Turn Left and Right Lying on Board** (step afectado).
- **DRL-WB-25** (drill correctivo).

---

*TSS® White Belt · ERR-WB-074 v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-075_Weak_Directional_Paddling

## ERR-WB-075 — WEAK DIRECTIONAL PADDLING

**Belt:** White Belt
**Step:** STP-025 Turn Left and Right Lying on Board
**Severity:** HIGH
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

En modo **remada de un lado** (prono), las brazadas del brazo activo son **débiles o poco firmes**. La tabla no rota con efectividad. El alumno intenta compensar con más brazadas en lugar de brazadas más fuertes, agotándose sin lograr el turn.

---

## WHAT IT LOOKS LIKE

- Brazadas rápidas pero cortas.
- Codo no pasa sobre oreja (brazada baja).
- Entrada de mano con splash (pala rígida).
- Tabla apenas gira después de 5-8 brazadas.
- Alumno cansado de brazo activo.
- Otro brazo no está completamente pasivo (interfiere).

---

## WHY IT HAPPENS

- Técnica base de remada (STP-023) no consolidada bajo condición direccional.
- Alumno piensa "rápido" en lugar de "firme".
- Brazo contralateral no se mantiene pasivo — intercepta el giro.
- Falta de confianza en que brazadas firmes (no rápidas) son más efectivas.
- Demo del coach no mostró brazada firme y larga.

---

## CONSEQUENCES

- Turn lento o inexistente.
- Alumno no puede redirigir tabla en momento crítico.
- Gran gasto energético con poco resultado.
- Frustración que puede llevar a soltar la tabla (violación regla de seguridad).
- Fundamento incorrecto para remada técnica general.

---

## CORRECTION PROTOCOL

**Arena:**
1. Coach demuestra brazada firme y larga en simulación.
2. Alumno reproduce — foco en codo sobre oreja y entrada limpia.
3. Verificar que brazo contralateral queda quieto.

**Agua quieta:**
1. Alumno ejecuta 5 brazadas consecutivas del brazo derecho. Brazo izquierdo debe estar quieto junto al cuerpo.
2. Coach observa: ¿tabla gira con cada brazada o solo al final?
3. Si débil, corregir técnica básica de brazada (STP-023) antes de continuar.

**Consolidación:**
- Repetir hasta que la tabla gire con 3-4 brazadas firmes.
- Luego probar en sentido opuesto.

---

## COACHING CUES

**During:**
- *"Firme, no rápido."*
- *"Codo sobre oreja."*
- *"Otro brazo quieto."*
- *"Brazada larga."*

**Post-rep:**
- *"¿Tus brazadas fueron firmes o solo rápidas?"*
- *"¿El otro brazo se quedó quieto?"*
- *"¿Sentiste la tabla girando?"*

---

## PREVENTION

- Verificar técnica de remada (STP-023) consolidada antes de direccional.
- Demo explícita de brazada firme vs brazada rápida-débil.
- Verificar brazo pasivo quieto en cada rep inicial.
- Enseñar que 3 brazadas firmes > 10 rápidas-débiles.

---

## RELATED

- **STP-023 Paddle Out** (técnica base de remada).
- **STP-025 Turn Left and Right Lying on Board** (step afectado).
- **DRL-WB-25** (drill correctivo).
- **ERR-WB-069** (stiff hands — error adjacente de remada base).

---

*TSS® White Belt · ERR-WB-075 v1.0*
*IP of Marcelo Castellanos / Enkrateia*

---

### ERR-WB-076_Poor_Seated_Pivot

## ERR-WB-076 — POOR SEATED PIVOT

**Belt:** White Belt
**Step:** STP-025 Turn Left and Right Lying on Board
**Severity:** MEDIUM
**Version:** v1.0
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## ERROR DESCRIPTION

El alumno ejecuta el **pivote sentado** con caderas atrás pero **sin asistencia activa de manos y pies**. Queda solo esperando que la tabla pivote "por sí sola". El resultado es un pivote extremadamente lento o sin efecto, y pierde oportunidades de alinearse con la ola.

---

## WHAT IT LOOKS LIKE

- Alumno sentado con caderas atrás (postura correcta).
- Cola hundida (OK).
- Pero las manos quedan inmóviles o apenas rozan el agua.
- Los pies quedan quietos.
- La tabla gira muy lento o solo por inercia.
- Alumno pierde tiempo crítico frente a la ola.

---

## WHY IT HAPPENS

- Alumno entiende postura pero no entiende **mecánica del pivote** (postura + motores).
- Coach demostró postura pero no el uso de manos/pies.
- Alumno cree que \"sentarse atrás\" es suficiente.
- Falta de práctica integrada: postura + motores juntos.
- Miedo a perder balance si mueve manos/pies.

---

## CONSEQUENCES

- Pivote lento — no alcanza a orientarse para la ola.
- Pierde olas que estaban al alcance.
- Frustración — \"la técnica no sirve\".
- Mal fundamento para maniobras direccionales más avanzadas.
- Alumno asume que pivote sentado es \"opcional\" y lo abandona.

---

## CORRECTION PROTOCOL

**Agua quieta:**
1. Coach demuestra pivote completo: caderas atrás + manos remando un lado + pies moviendo lado opuesto.
2. Alumno reproduce por partes:
   - Paso 1: solo postura (caderas atrás, cola hundida).
   - Paso 2: agregar manos (remada lateral asistiendo giro).
   - Paso 3: agregar pies (patada asistiendo lado opuesto).
3. Integrar los 3 simultáneamente.

**Calibración velocidad:**
- Cronometrar pivote: de frente a 90° en ≤3 segundos.
- Si >3 segundos, más fuerza en manos/pies.

**Consolidación:**
- 5 pivotes asistidos consecutivos.
- Coach verifica asistencia activa de manos Y pies.

---

## COACHING CUES

**During:**
- *\"Pivot fast.\"*
- *\"Asistí con manos.\"*
- *\"Pies del otro lado.\"*
- *\"Más rápido — no esperes.\"*

**Post-rep:**
- *\"¿Usaste manos?\"*
- *\"¿Usaste pies?\"*
- *\"¿Qué tan rápido giró?\"*

---

## PREVENTION

- Demo explícita de los 3 componentes del pivote: postura + manos + pies.
- Enseñar el pivote como sistema activo, no pasivo.
- Cronometrar pivotes desde primera rep.
- No aceptar pivote pasivo — pausar y corregir.
- Enseñar que el pivote sentado es para **urgencia** — debe ser rápido.

---

## RELATED

- **STP-025 Turn Left and Right Lying on Board** (step afectado).
- **DRL-WB-25** (drill correctivo).
- **ERR-WB-074** (turning too far forward — error adyacente en pivote).

---

*TSS® White Belt · ERR-WB-076 v1.0*
*IP of Marcelo Castellanos / Enkrateia*$tss$
WHERE id = 'STP-025';

-- ============================================
-- PRE-COURSE FUNDAMENTALS + VALUES (21)
-- ============================================

UPDATE lessons SET
  description_md = $tss$# PC-001 — SAFETY RULES · CANON

**ID:** PC-001
**Topic:** Safety Rules
**Pillar:** Safety & Survival
**Scope:** Pre-Course + White Belt (pre-water-entry)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md + TSS_Safety_Canon_v2.0_ES
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

Understand and respond to the **3 safety signals**. Master the **star-fall protocol** (arms extended, body flat, face up; never dive head-first). The board is always controlled and kept away from other surfers.

---

## 2. STAR-FALL PROTOCOL (NON-NEGOTIABLE)

- Arms extended.
- Body flat.
- Face up.
- **NEVER** dive head-first.
- The board is protected with hand or body, never released toward other people.

---

## 3. THE 3 SAFETY SIGNALS

Non-verbal hand signals used by the TSS coach to communicate with the student in the water:

1. **Stop / Return to shore** — raised arm + closed fist.
2. **Come with me / Regroup** — arm circling toward the coach.
3. **Emergency / Help** — both arms crossed above the head.

The student MUST recognize the 3 signals before entering the water for the first time.

---

## 4. CRITICAL BOARD RULES

- The board is **always** controlled: hand or leash.
- Never release the board toward other surfers.
- When falling: prioritize the board (protect it with the body) BEFORE standing up.
- **Leash ≠ control.** The leash is a backup; it does not replace manual control.

---

## 5. GATING RULE

PC-001 **must be known before the first water entry.** Without PC-001, the student does not enter the water.

---

## 6. EVALUATION CRITERION (K4)

The student:
- States the 3 safety signals.
- Demonstrates the star-fall protocol correctly.
- Explains the board control rules.

Pass threshold: **Meets / Does Not Meet** (binary).

---

## 7. DOCTRINAL REFERENCES

- TSS Safety Canon v2.0 (Duo / Triangle / Magnet).
- Instructor-Student Matrix.
- In-water complement: STP-003 (Grab Board), STP-014 (Prone Dismount), STP-020 (Starfish Dismount).

---

*TSS® Pre-Course · PC-001 Safety Rules Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-001';

UPDATE lessons SET
  description_md = $tss$# PC-002 — SET GOAL · CANON

**ID:** PC-002
**Topic:** Set Goal (Goal per Session)
**Pillar:** Method & Mindset
**Scope:** Pre-Course + White Belt (every session)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

A clear, measurable goal per session, defined **before** entering the water.

> **Emotion proposes. The system decides. One goal per session.**

---

## 2. THE GOLDEN RULE

- **One** goal per session — not two, not five.
- **Measurable** — verifiable objectively at the end.
- **Written or spoken** — not mental / ambiguous.
- **Aligned with the belt** — do not oversize the objective.

---

## 3. FORMULATION FRAMEWORK

Template: *"Today I work on [specific skill] in [specific context] with [specific] criterion."*

Canonical White Belt examples:
- "Today I work on the pop-up in calm water with a criterion of 5/8 successful attempts."
- "Today I work on the sweet spot with a criterion of 0 nose-dives in 10 attempts."
- "Today I work on the paddle out with the criterion of reaching the channel without letting go of the board."

---

## 4. PRE-SESSION RITUAL

1. The coach asks: *"What is your goal today?"*
2. The student states the goal.
3. The coach validates or refines it.
4. The goal is repeated mid-session (at least once).
5. Post-session: debrief against the goal.

---

## 5. EVALUATION CRITERION (K10)

The student:
- Sets a measurable goal before each session.
- Remembers the goal mid-session.
- Evaluates the result against the goal at the end.

---

## 6. DOCTRINAL PRINCIPLE

This is a direct application of the **ADHD RULE / Focus Law from Marcelo OS** to the water:
- Ideas are captured, analyzed, and scheduled.
- Emotion proposes, the system decides.
- Dispersion in the water = dispersion in life.

---

## 7. REFERENCES

- Method complement: PC-003 (Learning to Learn), PC-012 (One Wave Framework).
- In-water: rubric verified across all steps (every STP has a "success criterion").

---

*TSS® Pre-Course · PC-002 Set Goal Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-002';

UPDATE lessons SET
  description_md = $tss$# PC-003 — LEARNING TO LEARN TSS · CANON

**ID:** PC-003
**Topic:** Learning to Learn TSS (Meta-learning of the system)
**Pillar:** Method & Mindset
**Scope:** Pre-Course (prerequisite to entering the water)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

How TSS works: structure, vocabulary, belt progression, what a Step is, what a Drill is, what a Sequence is.

> **Know the map before you enter the water.**

---

## 2. CANONICAL VOCABULARY

| Term | TSS Definition |
|---|---|
| **Step (STP)** | Individual technical unit, productized. e.g., STP-016 Pop-Up. |
| **Drill (DRL)** | Structured exercise to consolidate a step. |
| **Sequence (SEQ)** | Chain of steps that forms a complete routine. |
| **Belt** | Belt level (White → Yellow → Blue → Purple → Brown → Black). |
| **Value** | Core value of the belt (e.g., White = Humility). |
| **Block** | Subdivision of the belt (White has 6 blocks). |
| **Error Card (ERR)** | Documented common error with severity. |
| **Anchor Phrase** | A 5-Key-Word phrase summarizing the step. |
| **Micro-cue** | Short verbal cue for in-water execution. |

---

## 3. BELT PROGRESSION

| Belt | Value | Focus |
|---|---|---|
| Pre-Course | Consciousness | Theory before water |
| White | Humility | Whitewater fundamentals |
| Yellow | Process (Resilience) | Channel and open waves |
| Blue | Commitment | Complete maneuver |
| Purple | Responsibility | Big waves / conditions |
| Brown | Gratitude | Personal mastery |
| Black | Impact | Teaching and legacy |

---

## 4. TSS LEARNING PHILOSOPHY

1. **Method over talent** — the system creates the surfer, not the other way around.
2. **Steps before waves** — technique is built dry before it gets wet.
3. **Classical → Ecological** — first controlled repetition, then contextual decision.
4. **Named errors** — every error has a code, severity, and correction protocol.
5. **Values first** — every belt is an inner value BEFORE technique.

---

## 5. EVALUATION CRITERION (K9)

The student explains in their own words: Step, Drill, Sequence, Belt, Value.

---

## 6. REFERENCES

- Complements: PC-002 (Set Goal), PC-007 (4 Pillars), PC-012 (One Wave).
- It is the "introduction to the system" — without PC-003, the other PC pieces have no frame.

---

*TSS® Pre-Course · PC-003 Learning to Learn TSS Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-003';

UPDATE lessons SET
  description_md = $tss$# PC-004 — GOOFY OR REGULAR · CANON

**ID:** PC-004
**Topic:** Goofy or Regular (Natural stance)
**Pillar:** Method & Mindset / Technical Foundation
**Scope:** Pre-Course (one-time assessment)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

Identification of the surfer's natural stance.

- **Regular:** left foot forward.
- **Goofy:** right foot forward.

This is a **foundational one-time assessment** — defined once and applied in every session afterward.

---

## 2. IDENTIFICATION TESTS

**Test A — Gentle push (dry):**
- The student stands with feet together.
- The coach pushes them gently from behind.
- The foot that steps forward to recover balance = the stance foot.

**Test B — Imaginary stairs:**
- "Which foot would you use to step up first?"
- The foot that does NOT go up first = the front foot on the board.

**Test C — Skating / Skateboarding:**
- If the student skates or skateboards, ask how they stand on the board.
- Use that stance as a reference.

---

## 3. CANONICAL CONSISTENCY

- The stance is NOT changed on a whim.
- Once identified, it is kept across all steps.
- The coach verifies the stance before every pop-up (STP-016) and impulse (STP-019).
- Changes in stance = signal of a problem — review the tests.

---

## 4. TECHNICAL IMPLICATION

- **Regular:** turn backside = to the right (on left-breaking waves for the surfer).
- **Goofy:** turn backside = to the left.
- It affects leash configuration (back foot), verbal cues, and error reading.

---

## 5. EVALUATION CRITERION (K12)

The student:
- States their natural stance consistently.
- Applies the stance every session.
- The coach validates that the student does not change stance without cause.

---

## 6. REFERENCES

- Direct input for: STP-017 (Feet Position Center), STP-018 (Power Stance), STP-021 (Turn Backside), STP-022 (Turn Frontside).

---

*TSS® Pre-Course · PC-004 Goofy or Regular Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-004';

UPDATE lessons SET
  description_md = $tss$# PC-005 — WHAT IS SURF · CANON

**ID:** PC-005
**Topic:** What is Surf? (Doctrinal definition)
**Pillar:** Doctrinal Foundation
**Scope:** Pre-Course
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

Surfing is the practice of **riding breaking waves** on a board, governed by the interaction between **wave, surfer, and ocean**.

Surfing is **simultaneously a sport and a relationship with the ocean**. It is not just athletics — it is bond.

---

## 2. THE FUNDAMENTAL TRIANGLE

```
         WAVE
          △
         ╱ ╲
        ╱   ╲
       ╱     ╲
   SURFER — OCEAN
```

None of the three may be absent:
- **Wave:** measurable, directional, transient energy.
- **Surfer:** intention, technique, inner posture.
- **Ocean:** living, dynamic context, larger than the other two.

---

## 3. DIFFERENCES FROM OTHER SPORTS

| Dimension | Surfing | Traditional sport |
|---|---|---|
| Setting | Dynamic and changing | Static and controlled |
| Element | Living, unrepeatable wave | Fixed field / court |
| Opponent | Conditions + oneself | Human opponent |
| Time | Wave window | Defined clock |
| Control | Partial (with the ocean) | Total (over the space) |

Surfing is not a sport — it is a **dialogue**.

---

## 4. THE WAVE AS TEACHER

Every wave is:
- **Unrepeatable** (unique, never repeats).
- **Generous** (if read well).
- **Demanding** (if ignored).
- **Instructive** (even when not caught).

You don't beat the wave. You surf **with** it.

---

## 5. EVALUATION CRITERION (K1)

The student:
- Defines surfing in their own words.
- Explains the wave / surfer / ocean relationship.
- Understands that surfing is relationship, not domination.

---

## 6. DOCTRINAL REFERENCES

- Complements PC-006 (History), PC-007 (4 Pillars), PC-012 (One Wave).
- Input for the entire TSS ecosystem — without PC-005 the rest lacks its root.

---

*TSS® Pre-Course · PC-005 What is Surf Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-005';

UPDATE lessons SET
  description_md = $tss$# PC-006 — HISTORY OF SURF · CANON

**ID:** PC-006
**Topic:** History of Surf (Historical root)
**Pillar:** Doctrinal Foundation
**Scope:** Pre-Course
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

Origins in **Polynesia**, arrival in **Hawaii**, near disappearance, revival by **Duke Kahanamoku**, evolution toward modern global practice and the **Olympics**.

Surfing is an **ancestral discipline**, not a recent invention. **Respect the tradition.**

---

## 2. CANONICAL HISTORICAL TIMELINE

| Era | Milestone |
|---|---|
| ~3000 years ago | Polynesia — spiritual / social practice |
| Pre-contact | Hawaii — *he'e nalu* (wave sliding), practice of kings and the people |
| 18th-19th century | European contact → decline (prohibition / marginalization) |
| Early 20th century | Hawaiian revival — Duke Kahanamoku as global ambassador |
| Mid 20th century | California / Australia expansion — modern surf culture |
| Late 20th century | Professionalization (WSL), shortboard revolution |
| 2020 (Tokyo) | Olympic debut |
| 21st century | Global, inclusive, heritage discipline |

---

## 3. FOUNDATIONAL FIGURES

- **Duke Kahanamoku** — Olympic swimming champion, global surfing ambassador, preserver of the *aloha* spirit.
- **Tom Blake** — innovation of the hollow board, first leash.
- **Hawaiian Generation** — guardians of the original spirit.

---

## 4. DOCTRINAL PRINCIPLE

Surfing **does not belong to the one who practices it** — it belongs to the tradition that sustained it. Every time we enter the water, we enter a line that runs from Polynesia to today. This demands:

1. **Respect** for the cultural root.
2. **Humility** before those who came before.
3. **Responsibility** not to degrade the tradition with ego or ignorance.

---

## 5. EVALUATION CRITERION (K2)

The student:
- States the origin of surfing (Polynesia / Hawaii).
- Names at least one foundational figure (e.g., Duke Kahanamoku).
- Understands that surfing is heritage, not a commercial invention.

---

## 6. REFERENCES

- Complements PC-005 (What is Surf), PC-011 (Etiquette — respect as inheritance).
- Basis of **Lesson 1 / Mental Surfing** in complementary ISA material.

---

*TSS® Pre-Course · PC-006 History of Surf Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-006';

UPDATE lessons SET
  description_md = $tss$# PC-007 — FOUR PILLARS OF HOLISTIC GROWTH · CANON

**ID:** PC-007
**Topic:** Four Pillars (The Four Pillars of holistic growth)
**Pillar:** Doctrinal Foundation
**Scope:** Pre-Course + structure for the ENTIRE TSS system
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

TSS develops the surfer through **four pillars**:

1. **Physical** — body, biomechanics, conditioning, coordination.
2. **Mental** — focus, discipline, emotional regulation, goals.
3. **Technical** — mastery of sequences, wave selection, execution.
4. **Social-Ethical** — respect, etiquette, community, responsibility.

> **TSS does not train wave-riders. TSS trains complete surfers.**

---

## 2. CANONICAL VISUAL

```
            PHYSICAL
              ▲
              │
   MENTAL ◀── SURFER ──▶ TECHNICAL
              │
              ▼
        SOCIAL-ETHICAL
```

The 4 pillars are equidistant. None is optional. Weakening one collapses the others.

---

## 3. PILLAR BY PILLAR

### 3.1. PHYSICAL
- Pop-up biomechanics.
- Cardiovascular conditioning for paddling.
- Shoulder-hip-foot coordination.
- Basic apnea endurance.
- Mobility (especially ankle and hip).

### 3.2. MENTAL
- Focus in turbulent water.
- Emotional regulation (fear, frustration, euphoria).
- Pre-wave visualization.
- Goal per session (PC-002).
- Post-wave reflection (PC-012).

### 3.3. TECHNICAL
- TSS step sequence.
- Wave selection (wave reading).
- Channel and current reading.
- Named errors and corrections.
- Belt-by-belt progression.

### 3.4. SOCIAL-ETHICAL
- Lineup etiquette (PC-011).
- Respect for locals.
- Environmental responsibility.
- Care among students.
- Integrity as a surfer.

---

## 4. CONNECTION WITH BELTS

Each belt emphasizes a value that operates transversally across the 4 pillars:

| Belt | Value | Impact on the 4 pillars |
|---|---|---|
| White | Humility | Openness to learn across all 4 |
| Yellow | Process | Resilience in the face of failure across all 4 |
| Blue | Commitment | Consistency across all 4 |
| Purple | Responsibility | Maturity across all 4 |
| Brown | Gratitude | Recognition of the path |
| Black | Impact | Transmission to others |

---

## 5. EVALUATION CRITERION (K3)

The student:
- Names the 4 pillars.
- Explains what each one develops.
- Understands that they are interdependent.

---

## 6. REFERENCES

- Doctrinal basis for all belt canon seals.
- Direct input for structuring complementary training (Physical Preparation D, Mental Preparation).

---

*TSS® Pre-Course · PC-007 Four Pillars Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-007';

UPDATE lessons SET
  description_md = $tss$# PC-008 — SURF EQUIPMENT · CANON

**ID:** PC-008
**Topic:** Surf Equipment — Parts & Types
**Pillar:** Equipment & Venue
**Scope:** Pre-Course + White Belt
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

Know the **parts of the board** and the **types of boards**.

> **White Belt operates on softboards** for safety and flotation.
> **Know your tool before you use it.**

---

## 2. PARTS OF THE BOARD (CANON)

| Part | Definition |
|---|---|
| **Nose** | Front tip of the board. |
| **Tail** | Rear of the board. |
| **Rails** | Lateral edges (left and right). |
| **Deck** | Top surface (where the surfer stands). |
| **Bottom** | Underside (in contact with the water). |
| **Rocker** | Longitudinal curvature (side profile). |
| **Fins** | Fins (stability and directional control). |
| **Leash** | Safety cord ankle-to-board. |
| **Stringer** | Internal longitudinal reinforcement. |

---

## 3. BOARD TYPES

| Type | Description | Typical belt |
|---|---|---|
| **Softboard** | Foam, high flotation, safe for beginners | White (mandatory) |
| **Longboard** | >9 ft, lots of flotation, long trims | Advanced White / Yellow |
| **Funboard** | 7-8 ft, hybrid, transitional | Yellow / Blue |
| **Fish** | Short, wide, small waves | Blue+ |
| **Shortboard** | <7 ft, high maneuverability | Blue+ |

---

## 4. WHITE BELT DOCTRINAL RULE

**White Belt = Softboard mandatory.**

Reasons:
1. **Safety** — softened impact (self, others, ground).
2. **Flotation** — allows relaxed paddling and pop-up without sinking.
3. **Stability** — reduces technical errors amplified by a technical board.
4. **Learning curve** — progresses faster than with a hard board.

Switching to a hard board before Yellow Belt = **doctrinal violation**. You do not move to a hard board without White certification.

---

## 5. PRE-WATER SETUP (CHECKLIST)

- [ ] Wax applied on the deck (longitudinally, from nose to center).
- [ ] Leash adjusted on the back-foot ankle (per PC-004).
- [ ] Fins firmly secured (not loose).
- [ ] Visual inspection: no deep dings.
- [ ] Wetsuit/lycra appropriate for the temperature.

---

## 6. EVALUATION CRITERION (K7)

The student:
- Names all the parts of the board.
- Identifies the main types.
- Knows which type matches their current belt (White = softboard).

---

## 7. REFERENCES

- Direct input for: STP-003 (Grab Board), STP-005 (Put Board in the Water), STP-006 (Control Your Board).
- Supporting presentations: SURF EQUIPMENT / Parts of Surfboard / Types of Surfboards.

---

*TSS® Pre-Course · PC-008 Surf Equipment Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-008';

UPDATE lessons SET
  description_md = $tss$# PC-009 — VENUE ANALYSIS THEORY · CANON

**ID:** PC-009
**Topic:** Venue Analysis Theory (Spot reading)
**Pillar:** Equipment & Venue
**Scope:** Pre-Course + White Belt (mandatory pre-water-entry)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

Framework for reading the spot **before** entering the water:
- Wave direction.
- Type of break (beach / point / reef).
- Entry and exit zones.
- Hazards.
- Tide and wind effect.
- Level fit (does it match the current belt?).

> **Read the ocean before you enter the ocean.**

The theoretical companion of the in-water step **STP-001 (Venue Analysis).**

---

## 2. THE VCA-6 FRAMEWORK (TSS Canon)

The **6 mandatory readings** before entering:

| # | Reading | Canonical question |
|---|---|---|
| 1 | Direction | Is the wave coming from the left or right? |
| 2 | Break type | Is it a beach break, point break, or reef? |
| 3 | Entry/Exit | Where do I enter and where do I exit? |
| 4 | Hazards | What must be avoided? (rocks, currents, other surfers) |
| 5 | Tide/Wind | Is it at its best moment right now? |
| 6 | Level fit | Is this spot suitable for my belt? |

---

## 3. TYPES OF BREAKS

### Beach Break
- Sandy bottom.
- Variable wave position.
- Ideal for White Belt.
- Advantage: failing is cheap.
- Disadvantage: shifting peaks → constant reading.

### Point Break
- Rocky/coral bottom with a land point.
- Predictable, long waves.
- More demanding — requires lineup respect.

### Reef Break
- Reef bottom.
- Powerful, precise waves.
- **Not recommended for White Belt.**

---

## 4. COMMON HAZARDS

- Currents (see PC-010).
- Rocks/coral.
- Other surfers (priority rule — see PC-011).
- Shallow bottom.
- Floating objects/trash.
- Marine life (rare but real).
- Temperature (hypothermia in cold water).

---

## 5. MARCELO'S RULE FOR VENUE ANALYSIS

**If you can't read the spot, you don't enter the spot.**

If there is doubt about any of the 6 points → do not enter. Wait for the coach. Change spots. Or stay on land observing for that day.

This connects directly to PC-013 (If In Doubt, Don't Go Out).

---

## 6. EVALUATION CRITERION (K8)

The student:
- Describes a spot using the VCA-6 framework.
- Identifies at least 3 hazards in a given venue.
- Concludes whether the venue is appropriate for their current level.

---

## 7. REFERENCES

- In-water pair: STP-001 Venue Analysis.
- Complements: PC-010 (Currents), PC-011 (Etiquette), PC-013 (If in Doubt).
- Gating rule: PC-009 **mandatory before the first water entry.**

---

*TSS® Pre-Course · PC-009 Venue Analysis Theory Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-009';

UPDATE lessons SET
  description_md = $tss$# PC-010 — CURRENTS & RIP CURRENT RESPONSE · CANON

**ID:** PC-010
**Topic:** Currents & Rip Current Response
**Pillar:** Safety & Survival
**Scope:** Pre-Course + White Belt (mandatory pre-water-entry)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md + TSS_Safety_Canon_v2.0_ES
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

Visually identify currents and rip currents. If caught: **DO NOT fight the current**. Paddle **PARALLEL** to the shore until you exit. Signal if you need help. Avoid entering when conditions show a strong current.

---

## 2. VISUAL IDENTIFICATION OF A RIP

Canonical visual signs:

- **A channel without breakers** between two zones of foam — the wave "opens" at that point.
- **Darker water** than the surroundings (greater depth).
- **Foam or sediment moving outward.**
- **Irregular lines of broken waves** at a specific point.
- **Absence of surfers** in a zone where they should be.

Practical rule: **if the sea looks "strangely calm" between breaking waves, it is a rip.**

---

## 3. PROTOCOL IF A RIP CATCHES YOU (CANON)

**STEP 1: DO NOT FIGHT.**
Never swim/paddle against the current straight toward shore. The current is stronger than you.

**STEP 2: PADDLE PARALLEL TO THE SHORE.**
Paddle laterally (parallel to the beach edge) until you exit the rip channel.

**STEP 3: ONCE OUT, PADDLE TO SHORE.**
With the waves helping, return to the safe zone.

**STEP 4: IF YOU CANNOT GET OUT, SIGNAL.**
Raise an arm with the emergency signal (PC-001). Keep the board as a flotation device.

---

## 4. PRIMARY RULE

**Board = float. Board = life. Never let go of the board in a rip.**

The board is your flotation device. Without it, survival becomes exponentially harder.

---

## 5. CONTROLLED USE OF RIPS (DOCTRINE)

Advanced surfers **USE** rips to get out to the lineup without spending energy paddling against waves. **But this is Yellow+/Blue.**

**White Belt does NOT enter a rip intentionally.** Using a rip as an "exit highway" is a privilege of advanced belts who can read the ocean.

---

## 6. PREVENTION

- Observe the spot for **5-10 minutes** before entering (VCA-6 from PC-009).
- Ask the coach or locals about known rips.
- If the lifeguard's red flag is up → do not enter.
- If the tide is changing strongly → observe first.

---

## 7. EVALUATION CRITERION (K5)

The student:
- Visually identifies a rip current.
- States the correct response: **paddle parallel, signal, do not fight.**
- Explains why the board is never released.

---

## 8. REFERENCES

- Complements: PC-001 (Safety Rules — signals), PC-009 (Venue Analysis).
- Integrated into Safety Canon v2.0 (Part II — Emergency Protocols).
- Gating rule: PC-010 **mandatory before the first water entry.**

---

*TSS® Pre-Course · PC-010 Currents & Rip Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-010';

UPDATE lessons SET
  description_md = $tss$# PC-011 — SURF ETIQUETTE · CANON

**ID:** PC-011
**Topic:** Surf Etiquette (Lineup code)
**Pillar:** Safety & Survival + Social-Ethical
**Scope:** Pre-Course + White Belt (mandatory pre-water-entry)
**Status:** CANONIZED — Constitutional Annex to WB Canon Seal v1.0
**Source:** WB_PreCourse_Requirements_v1.0.md
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

**Priority rule: the surfer closest to the peak has priority.**

Non-negotiable rules:
- **No drop-in** (do not drop on a wave already taken).
- **No snaking** (do not paddle around to steal priority).
- **Respect the locals.**
- **Paddle around the lineup, never through it.**
- **One wave, one surfer.**
- **Respect is non-negotiable.**

---

## 2. PRIORITY RULE (THE MOTHER RULE)

> The surfer **closest to the peak** (the point where the wave breaks first) **has priority**.

Consequence: if you enter a wave where someone else is already closer to the peak, **you committed a drop-in**. Pull off immediately.

Technical exception: in "a-frame" conditions (a wave breaking on both sides), two surfers may go if one takes the left and the other the right — with prior verbal coordination.

---

## 3. CANONICAL DO's AND DON'Ts

### DO's
- **Observe** for 5 minutes before entering the lineup.
- **Greet** with a signal or verbally on arrival.
- **Wait your turn** — natural rotation of the lineup.
- **Apologize** if you make a mistake.
- **Help** anyone in difficulty.
- **Respect locals** — they know the spot.
- **Paddle around** the lineup, never through the middle.

### DON'Ts
- **DO NOT drop in** on an already-occupied wave.
- **DO NOT snake** (paddle around to steal).
- **DO NOT speak loudly / celebrate excessively.**
- **DO NOT paddle** in front of someone riding down the wave.
- **DO NOT release the board** in the lineup.
- **DO NOT bring ego.**
- **DO NOT ignore locals.**

---

## 4. LINEUP HIERARCHY

| Level | Who | How to treat them |
|---|---|---|
| 1 | Locals | Maximum respect — they keep the spot |
| 2 | Spot regulars | Acknowledge with a greeting |
| 3 | Experienced surfers | Technical respect |
| 4 | Visitors | Treat with courtesy |
| 5 | Beginners | Teach with patience if possible |

White Belt = you are level 5. **Your job is to observe, respect, and learn.**

---

## 5. LINEUP ENTRY PROTOCOL

1. Observe from outside for **5-10 minutes**.
2. Identify the "boss" of the lineup (the best or the most respected surfer).
3. Enter by paddling along the periphery, never through the central channel.
4. Greet with a signal as you approach.
5. Wait your turn — do not jump the line.
6. If you make a mistake, acknowledge it verbally ("sorry" / "my bad").

---

## 6. CONNECTION WITH HUMILITY (WHITE BELT VALUE)

Etiquette is **humility applied to the lineup**. Without humility there is no respect. Without respect there is no community. Without community there is no healthy lineup.

> **A White Belt who respects the etiquette has already shown more maturity than many with higher belts.**

---

## 7. EVALUATION CRITERION (K6)

The student:
- States the priority rule.
- States at least 3 key rules (no drop-in, no snaking, paddle around).
- Demonstrates understanding of the lineup hierarchy.

---

## 8. REFERENCES

- Supporting presentation: SURF ETIQUETTE — Complete Guide (filed under C_Presentations).
- Complements PC-006 (History — respect as inheritance), VAL-002 (Humility).
- Gating rule: PC-011 **mandatory before the first water entry.**

---

*TSS® Pre-Course · PC-011 Surf Etiquette Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-011';

UPDATE lessons SET
  description_md = $tss$# PC-012 — ONE WAVE FRAMEWORK · PACKAGE v2

**Document ID:** PC-012_PACKAGE_v2
**Supersedes:** PC-012_PACKAGE_v1 (contained fabricated drills, error cards, and K-indicators — see §11 Change Log)
**Status:** DRAFT — awaiting Marcelo review before replication as a template for PC-001..PC-014
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

## 1 · TECHNICAL SHEET

| Field | Value | Source |
|---|---|---|
| Canonical ID | PC-012 | [CANON v1] |
| Topic | One Wave Framework | [CANON v1], [BOOK Ch 2] |
| Official tagline | *Evolve through play* | [BOOK cover, p.17] |
| Central doctrine | "One wave. One intention." | [BOOK Preface p.7; Final Words p.47] |
| Pillar | Method & Mindset | [CANON v1] |
| GOD MODE Film Order | #1 (P1a — LENS) | [CANON internal — Film Order sheet in Registry v3.40+] |
| Scope | Pre-Course foundational + transversal to all belts | [CANON v1], [BOOK Preface p.6] |
| Primary book reference | *ONE WAVE* (54 pp., 2026) | [BOOK cover] |

---

## 2 · DOCTRINAL CANON (verifiable full text)

### 2.1 The seed phrase

> **"One wave. One intention."**
> — [BOOK Preface, p.7; and Final Words, p.47 — repeated as the seed of the whole book]

### 2.2 Why the concept exists (according to the book)

> "Nobody teaches surfers how to train. [...] What doesn't exist — or didn't, until now — is a guide to the mental architecture of learning itself."
> — [BOOK Preface, p.6]

### 2.3 The quote that supports the principle

> "In his book *The ONE Thing*, Gary Keller makes the case that the brain learns best when it has a single, clear focus. Not five objectives. Not a general intention to surf well. One thing. One wave. One specific intention carried into the water with full attention."
> — [BOOK Preface, p.7 — Marcelo quoting Keller]

### 2.4 The key distinction: Free Surf vs Training

> "Free surfing is expression. [...] Training is intervention. [...] The problem is not that surfers free surf. The problem is that most surfers call everything they do in the water 'training' — and then wonder why their improvement is slow."
> — [BOOK Ch 2, p.14]

### 2.5 The mechanical principle: Switch Cost

> "When the mind shifts between tasks, it pays an energy cost. Neuroscientists call this the 'switch cost' [...]. One objective. The switch cost drops to nearly zero. Full attention can go to one specific thing."
> — [BOOK Ch 2, p.15]

### 2.6 The 4-phase model (from the internal TSS canon, NOT explicit in the book)

Canon v1 defines 4 mandatory phases per wave:
Intention → Execution → Observation → Adjustment.

> "Every wave has 4 mandatory phases. [...] Without the 4 phases, there was no 'One Wave' — there was only a 'consumed wave'."
> — [CANON v1 §3]

**Reconciliation note:** the book speaks of "one specific intention carried into the water with full attention" and of a single post-session question ("Did I work on what I came to work on?" [BOOK Ch 2, p.16]), but it does not enumerate the 4 phases under those names. Canon v1 operationalizes the book's principle into 4 phases. Both are consistent; the canon is more granular.

**Pending decision [TBD — Marcelo input]:** is the canon v1 4-phase model fixed doctrine, or a didactic operationalization that can be made flexible?

---

## 3 · CANONICAL CONCEPTS EXTRACTED FROM THE BOOK

The following concepts are doctrinal according to the book and form the theoretical body of PC-012. Each is direct material for video scripts, manuals, and drills.

### 3.1 Central core

| # | Concept | Source |
|---|---|---|
| C1 | One wave, one intention | [BOOK Preface p.7; Ch 2 p.13] |
| C2 | Free surfing vs Training (two distinct activities) | [BOOK Ch 2 pp.14-15] |
| C3 | Switch cost (cognitive cost of changing objectives) | [BOOK Ch 2 p.15] |
| C4 | Ego's Interference (the ego sabotages the drill on the good wave) | [BOOK Ch 2 p.15] |
| C5 | "Did I work on what I came to work on?" (the single post-session question) | [BOOK Ch 2 p.16] |

### 3.2 Inner Game concepts (Ch 1 — background that sets context for One Wave)

| # | Concept | Source |
|---|---|---|
| C6 | The mind escapes in two directions (future/past) | [BOOK Ch 1 p.10] |
| C7 | Take Out the Trash (pre-session mental cleanup) | [BOOK Ch 1 p.11] |
| C8 | Curiosity as the optimal learning state | [BOOK Ch 1 p.11] |
| C9 | Breath as Navigation (breath as state control) | [BOOK Ch 1 p.12] |
| C10 | **The 30-Second Pre-Session Ritual** (3 questions + 3 breaths + 1 focus) | [BOOK Ch 1 p.12] |

### 3.3 The friction (Ch 3-5 — why One Wave requires tolerance for discomfort)

| # | Concept | Source |
|---|---|---|
| C11 | Comfort zone + Danaher quote ("price of evolution") | [BOOK Ch 3 p.19] |
| C12 | Frustration Is Information | [BOOK Ch 3 p.20] |
| C13 | The Learning Zone (just beyond current automatic capacity) | [BOOK Ch 3 p.21] |
| C14 | Beginner's Mind (shoshin) | [BOOK Ch 3 p.21] |
| C15 | Flow definition (Csikszentmihalyi) + Flow Channel | [BOOK Ch 4 pp.23] |
| C16 | How flow breaks: Comparison, Outcome focus, Mismatched challenge, Unclear intention | [BOOK Ch 4 p.25] |
| C17 | "Expect nothing. Enjoy everything." (mantra) | [BOOK Ch 5 p.27] |
| C18 | Two Timelines: Technical Performance + Ocean Knowledge | [BOOK Ch 5 p.28] |

### 3.4 The system (Ch 6-8 — how One Wave integrates into La Nave)

| # | Concept | Source |
|---|---|---|
| C19 | Four Pillars: Physical / Technical / Tactical / Mental | [BOOK Ch 6 p.35; About p.49] |
| C20 | Goals: Long-term / Medium-term / Short-term | [BOOK Ch 6 p.36] |
| C21 | Build → Rest → Test → Evaluate (week) | [BOOK Ch 6 pp.36-37] |
| C22 | Law of Action: the nervous system adapts to repetition, not understanding | [BOOK Ch 7 p.39] |
| C23 | La Nave del Surf — 5 zones (Engine / Hinge / 7 Steps / 3 Circles / ICE) + Safety Ring + Pillars | [BOOK Ch 8 pp.42-46] |
| C24 | "The intelligent surfer understands. The wise surfer paddles out." | [BOOK Ch 7 p.40; Final Words p.47] |

---

## 4 · ANECDOTES / TEACHING CASES (usable for video, manual, course)

All are Marcelo's, taken literally from the book. High-value narrative assets.

| # | Anecdote | Didactic use | Source |
|---|---|---|---|
| A1 | The psychologist and the circle with the dot (Marcelo, 10 years old, ADHD diagnosis) | Opens the FOCUS concept | [BOOK Ch 1 p.10] |
| A2 | Ice baths → relationship between breath and state | Illustrates Breath as Navigation | [BOOK Ch 1 p.12] |
| A3 | The talented junior surfer + front-foot placement | Illustrates "one thing" in a real session | [BOOK Ch 2 pp.13-14] |
| A4 | Marcelo training BJJ in 2017 — regression after 2 years | Illustrates Comfort Zone / price of evolution | [BOOK Ch 3 p.19] |
| A5 | Bryan Pérez vs Jeremy Flores at the World Championship | Illustrates Flow under Olympic pressure | [BOOK Ch 4 p.24] |
| A6 | Indonesia — Marcelo fighting his own expectations | Illustrates "Expect nothing. Enjoy everything." | [BOOK Ch 5 p.27] |
| A7 | The French Waterman (Foundation level, wanted to quit) | Illustrates Two Timelines and level diagnosis | [BOOK Ch 5 p.28] |
| A8 | Bryan Pérez, El Salvador's first Olympic surfer, Paris 2024 | Proof of result of the method | [BOOK Preface p.6; About p.49] |

---

## 5 · RITUALS AND PROTOCOLS (all with direct sources)

### 5.1 The 30-Second Pre-Session Ritual

Direct source: [BOOK Ch 1 p.12].

Exact protocol from the book:

1. **Sit or stand still for thirty seconds.**
2. **Ask yourself three questions:**
   - Where am I? *(Here, on this beach, in this water.)*
   - What time is it? *(Now, this moment.)*
   - *(The third question is the act of presence itself — taking three breaths that anchor the answer.)*
3. **Take three slow, deliberate breaths.**
4. **Choose one thing — one specific focus for this session.** Not a goal. A focus. Something you will pay attention to while you surf.

Total duration: 30 seconds.

**Literal quote:**
> "Thirty seconds. Three breaths. One focus. It seems small. Over hundreds of sessions, it becomes the difference between a surfer who improves and a surfer who simply accumulates time in the water."
> — [BOOK Ch 1 p.12]

### 5.2 Take Out the Trash (implicit protocol)

Direct source: [BOOK Ch 1 p.11].

The book's definition:
> "'Taking out the trash' means deliberately clearing that mental clutter before you paddle out. Not suppressing it — that doesn't work. But acknowledging it and choosing to set it down before entering the water."

**Note:** the book describes the concept but does not give a step-by-step protocol. An operational drill derived from it must be marked [TBD — Marcelo input].

### 5.3 Single post-session question

Direct source: [BOOK Ch 2 p.16].

> **"Did I work on what I came to work on?"**
> *(Not: did I surf well? Not: were the waves good?)*

If YES → it was training. Something was built, even with imperfect execution.
If NO → it was free surfing. Valid, but nothing new was built.

### 5.4 Canon v1 4-phase cycle (to reconcile with the book)

Source: [CANON v1 §3].

1. Intention (pre-wave)
2. Execution (during)
3. Observation (immediately after)
4. Adjustment (before the next wave)

**[TBD — Marcelo input]:** decide whether the canon's 4-phase cycle is (a) the official operationalization of the book's principle, (b) a flexible didactic add-on, or (c) replaceable by the book's "one specific intention + did-I-work-on-it?".

### 5.5 The 5 post-wave questions of canon v1

Source: [CANON v1 §4].

1. What was your intention?
2. Did you achieve it?
3. What worked?
4. What failed?
5. What do you adjust for the next?

**[TBD — Marcelo input]:** are these 5 questions fixed canon, or an expansion of canon v1 that can be adjusted? The book stays with **a single question** post-session.

---

## 6 · EVALUATION CRITERION (K11) — REDUCED TO CANON V1

Canon v1 defines the evaluation criterion as follows:

> "The student:
> - Explains the One Wave principle.
> - Demonstrates post-wave reflection (the coach observes a conscious pause after each wave).
> - Adjusts execution between waves."
> — [CANON v1 §7]

**Decision:** keep these 3 criteria as canonical K11. The 6 sub-indicators K11.1..K11.6 from PC-012_PACKAGE_v1 were **fabricated by Claude** without source and are eliminated until Marcelo authorizes or defines them.

---

## 7 · OPERATIONAL DRILLS — PENDING MARCELO

**Claude will NOT design drills here.** PC-012_PACKAGE_v1 included 4 invented drills ("Written Intention", "5 Questions Dry", "One Wave Journal", "Shadow Cycle") that do not come from the book or canon v1. They are eliminated.

Potential drills, drawn from the book but without a detailed protocol in the source:

- **D1 — 30-Second Pre-Session Ritual** → already a complete protocol [BOOK Ch 1 p.12]. No additional design required.
- **D2 — Take Out the Trash** → concept described [BOOK Ch 1 p.11], protocol **[TBD — Marcelo input]**.
- **D3 — Single-Objective Session** → Marcelo describes it in the junior anecdote ("one session [...] your job is to land your front foot in the right position. That's the whole mission.") [BOOK Ch 2 p.13-14]. Design as a formal drill: **[TBD — Marcelo input]**.
- **D4 — Post-session debrief ("Did I work on what I came to work on?")** → one question, binary yes/no [BOOK Ch 2 p.16]. Execution protocol on the card: **[TBD — Marcelo input]**.

**Open question for Marcelo:** which drills do you already use operationally at Puro Surf / with athletes that we can document instead of inventing?

---

## 8 · COMMON ERRORS — ONLY THE ONES FROM THE BOOK

PC-012_PACKAGE_v1 included 8 "error cards" (ERR-ONE-01..08) **fabricated by Claude**. Eliminated.

Errors the book identifies explicitly:

| # | Error | Source |
|---|---|---|
| E1 | Calling everything done in the water "training" (without distinguishing free surf) | [BOOK Ch 2 p.14] |
| E2 | Entering with 10 objectives instead of one (high switch cost) | [BOOK Ch 2 p.15] |
| E3 | Ego's Interference: forgetting the drill when a good wave appears | [BOOK Ch 2 p.15] |
| E4 | Interpreting the regression in the learning curve as "I'm doing worse" (instead of as evidence of change) | [BOOK Ch 3 p.20] |
| E5 | The expectation that "surfing should feel good all the time" | [BOOK Ch 5 p.27] |
| E6 | Fight the hold-down / resisting the wipeout (vs letting it pass) | [BOOK Ch 5 p.29] |
| E7 | Wrong self-diagnosis of level (assuming the level you want, not the real one) | [BOOK Ch 5 p.32] |
| E8 | Understanding the system and not executing ("The nervous system does not adapt to understanding") | [BOOK Ch 7 p.39] |

---

## 9 · VIDEO SCRIPT v2 — SKELETON (not final script)

PC-012_PACKAGE_v1 contained a 6-scene video script with full text. That script was written by Claude with partial material. I replace it here with a production skeleton **based exclusively on book + canon content**, for Marcelo (or a scriptwriter) to develop.

**Target duration:** 4-6 minutes.
**Language:** ES (first version), EN (second version).

**Proposed structure (8 beats, all with sources):**

1. **Hook** — "Most surfers enter the water without knowing what to work on." [BOOK Ch 6 p.34 — "paddle out and hope for the best"]
2. **Two ways of learning** — volume without reflection vs One Wave [CANON v1 §2; BOOK Ch 2 p.14]
3. **The Keller quote** — "One thing. One wave. One specific intention." [BOOK Preface p.7]
4. **Free Surf vs Training** — definition of each [BOOK Ch 2 p.14]
5. **The 30-second ritual** — 3 questions, 3 breaths, 1 focus [BOOK Ch 1 p.12]
6. **Switch cost** — why one thing only [BOOK Ch 2 p.15]
7. **Ego's Interference** — the trap of the good wave [BOOK Ch 2 p.15]
8. **The single question on exiting the water** — "Did I work on what I came to work on?" [BOOK Ch 2 p.16]
9. **Closing** — "One wave. One intention. Enjoy the journey." [BOOK Final Words p.47]

**Word-by-word script: [TBD — Marcelo input or scriptwriter].**

---

## 10 · CROSS-REFERENCES

| Reference | Link | Source |
|---|---|---|
| PC-002 Set Goal | Session focus = the "one intention" of the 30-sec ritual | [BOOK Ch 1 p.12; CANON v1 §8] |
| PC-003 Learning to Learn TSS | Meta-lens that includes One Wave | [CANON v1 §8] |
| PC-007 Four Pillars | Physical/Technical/Tactical/Mental | [BOOK Ch 6 p.35] |
| PC-014 Three Circles of Power | Body + Board + Wave = Flow (Zone 4 of La Nave) | [BOOK Ch 8 p.43] |
| STP-001..007 (future) | The 7 steps of Entry & Capture = Zone 3 of La Nave | [BOOK Ch 8 p.43] |
| ICE (Infinite Circle of Execution) | Posture → Rotation → Projection → Maneuver → Return | [BOOK Ch 8 pp.44-45] |
| Marcelo OS | "emotion proposes, system decides" ↔ "intelligent understands, wise paddles out" | [CANON v1 §6; BOOK Ch 7 p.40] |

---

## 11 · VERSION HISTORY

| Version | Date | Changes | Author |
|---|---|---|---|
| v1 | 2026-04-18 (AM) | First structure. **Contained drills, error cards, and K-indicators fabricated by Claude without source.** | Claude (no source audit) |
| v2 | 2026-04-18 (PM) | **Reconstruction with strict traceability.** ONE WAVE book (54 pp.) read in direct ingestion. Everything invented is removed. Everything that remains is tagged `[BOOK §X, p.Y]`, `[CANON v1]`, or `[TBD — Marcelo input]`. | Marcelo Castellanos + Claude synthesis (with audit) |

---

## 12 · WHAT IS MISSING TO CLOSE PC-012

Actionable list of inputs Claude cannot resolve alone:

1. Is the canon v1 4-phase cycle fixed doctrine, or flexible operationalization? (§2.6)
2. Are the 5 post-wave questions canon or an expansion? Do they stay or are they reduced to the book's single question? (§5.5)
3. Does K11 stay at the 3 canon v1 criteria, or does it need sub-indicators? (§6)
4. What operational drills do you use with athletes that we should document? (§7)
5. What other source documents of yours exist (books, essays, transcripts) that Claude has not yet read? (general audit)

Until these 5 are resolved, **PC-012 v2 is not "closed" — it is "draft validated by source but with decisions pending Marcelo".**

---

*TSS® Pre-Course · PC-012 One Wave Framework Package v2.0*
*IP of Marcelo Castellanos / Enkrateia · TSS®*
*Primary source: ONE WAVE Digital Edition 2026 (54 pp.) + PC-012 Canon v1*
$tss$
WHERE id = 'PC-012';

UPDATE lessons SET
  description_md = $tss$# PC-013 — ENTRY BLOCK (WAVE PARTS, TYPES, AND STAGES) · CANON

**ID:** PC-013
**Topic:** Blue Entry Block — Wave Parts · Wave Types · Wave Stages · Board Loss Protocol · Timing In/Out · If in Doubt Don't Go Out
**Pillar:** Equipment & Venue + Safety & Survival
**Scope:** Pre-Course (wave-reading block)
**Status:** CANONIZED — Derived from Module 0 Pre-Course v3.0 (Slides 4-10)
**Source:** TSS_Module_0_PreCurso_v3.0_WithPlaceholders.pptx
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

The **Entry Block** is the minimum body of knowledge about the **wave as a physical phenomenon** that the student must internalize before interacting with it.

This block consolidates the **7 Prerequisites** of Module 0 Pre-Course (excluding Safety, Etiquette, and currents, which live in PC-001, PC-010, and PC-011). It groups: parts of the wave, types of waves, wave stages, board loss protocol, timing in/out, and the golden rule.

---

## 2. PARTS OF THE WAVE (CANON)

| Part | Definition |
|---|---|
| **Peak** | The point where the wave breaks first (defines the priority rule — PC-011). |
| **Shoulder** | Open, unbroken face (trim zone). |
| **Curl / Lip** | The "lip" that breaks — the most powerful part. |
| **Pocket** | Pocket of energy immediately ahead of the curl. |
| **Face** | The full face of the wave (from trough to peak). |
| **Trough** | Base / valley of the wave. |
| **Whitewater** | Already-broken foam (White Belt zone). |
| **Channel** | Channel between broken waves (exit route). |

---

## 3. WAVE TYPES

| Type | Direction | Note |
|---|---|---|
| **Left** | Breaks to the surfer's left on the wave | Regular = backside; Goofy = frontside |
| **Right** | Breaks to the surfer's right on the wave | Regular = frontside; Goofy = backside |
| **A-frame** | Breaks on both sides | Two surfers can go with coordination |
| **Closeout** | Breaks all at once | **Not surfable** — do not drop |
| **Mushy** | Soft, no clear wall | Ideal for White Belt |
| **Steep / Hollow** | Vertical wall, with potential tube | **Not for White Belt** |

---

## 4. THE 4 STAGES OF A WAVE (TSS CANON)

Every wave passes through **4 stages** — understanding these is key to deciding when to chase:

| Stage | Description | White Belt? |
|---|---|---|
| **1. Forming** | Beginning to rise, no clear face yet | Do not chase |
| **2. Ready to break** | Face formed, pocket defined | **CHASE HERE** |
| **3. Breaking (curl)** | Lip falling | Already too late |
| **4. Broken (whitewater)** | Foam | **White Belt surfs this stage** |

**White Belt operates in stages 2 (ready) for chasing and 4 (foam) for surfing. Yellow+ works directly in stage 2 with face drops.**

---

## 5. BOARD LOSS PROTOCOL

**If you lose the board:**
1. **Do not panic.** Float.
2. **Locate** the board visually (leash tug).
3. **Check the direction** of the incoming wave.
4. **Recover the leash with both hands** and pull it toward you.
5. **Do not stand up immediately** — check the depth.
6. **If another wave is coming**, sink the board with both arms and shield yourself.

**Absolute rule:** never voluntarily release the board in water with other surfers around. A fast leash snap can break the board or injure others.

---

## 6. TIMING IN & OUT

### Timing IN (entering the water)
- Enter when the waves are in **lulls** (calm moments between sets).
- Observe 3-5 full cycles before deciding.
- Enter walking with the board beside you (not riding on top).

### Timing OUT (exiting the water)
- Exit during lulls, never during a set.
- Never "run out" with your back to the wave.
- Keep your eyes on the sea until you step onto dry sand.

---

## 7. GOLDEN RULE: *IF IN DOUBT, DON'T GO OUT*

> **If you doubt, don't enter.**

Applies to:
- Conditions too big for your belt.
- Strong rips with no lifeguard.
- An unknown sea without a local/coach.
- Poor physical condition (fatigue, hunger, hypothermia).
- Presence of other hazards.

**Doubt is information from the body. The system respects it.**

This rule integrates with the **Marcelo OS Decision Filter** — it applies the same logic of the decision framework to the water.

---

## 8. THE 7 PREREQUISITES (DOCTRINAL SUMMARY)

Module 0 Pre-Course v3.0 establishes 7 prerequisites. The 3 that belong exclusively to PC-013:

1. ✅ **Wave Parts & Types** (sections 2-3 of this document).
2. ✅ **Stages of a Wave 1-4** (section 4).
3. ✅ **Board Loss Protocol** (section 5).
4. ✅ **If in Doubt Don't Go Out** (section 7).
5. ✅ **Timing In & Out** (section 6).

The other 2 prerequisites are in:
- **Safety Rules** → PC-001.
- **Etiquette DO/DON'T** → PC-011.

---

## 9. EVALUATION CRITERION

The student:
- Names the parts of the wave.
- Identifies wave types (left, right, closeout).
- States the 4 stages and which one White Belt surfs.
- Describes the board loss protocol.
- States the golden rule *If in Doubt*.

---

## 10. REFERENCES

- Primary doctrinal source: **Module 0 Pre-Course v3.0** (filed under C_Presentations/Doctrinal).
- Complements: PC-009 (Venue Analysis), PC-010 (Currents), PC-011 (Etiquette).
- In-water input: STP-001 (Venue Analysis), STP-011 (Get Aligned with White Water), STP-012 (Paddle to Catch White Water).

---

*TSS® Pre-Course · PC-013 Entry Block Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-013';

UPDATE lessons SET
  description_md = $tss$# PC-014 — 3 CIRCLES OF POWER · CANON

**ID:** PC-014
**Topic:** 3 Circles of Power (The Surfer's Circles of Power)
**Pillar:** Doctrinal Foundation / Method & Mindset
**Scope:** Pre-Course + transversal to all belts
**Status:** CANONIZED — ISA Reference integrated into the TSS canon
**Source:** ISA Surf Coaching framework (3 Circles) + TSS integration
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. CANONICAL DEFINITION

The **3 Circles of Power** are the three domains of agency that a surfer must distinguish in every session:

| Circle | Domain | Agency |
|---|---|---|
| **Circle 1 — Control** | What depends 100% on me | Total |
| **Circle 2 — Influence** | What I can affect but not control | Partial |
| **Circle 3 — Acceptance** | What does not depend on me | None |

> **The surfer's maturity is knowing which circle each thing is in.**

---

## 2. CIRCLE 1 — CONTROL (100% MINE)

Everything that ORIGINATES with me and that I decide:
- My intention / session goal (PC-002).
- My technique (how I execute).
- My attitude (humility / ego).
- My preparation (PC-008 equipment, PC-009 venue analysis).
- My emotional response to failure.
- My paddling effort.
- My decision to enter / not enter (PC-013 *If in Doubt*).

**Rule:** if something is in Circle 1, there is no excuse — it is my responsibility.

---

## 3. CIRCLE 2 — INFLUENCE (I CAN AFFECT, NOT CONTROL)

Things that **partially depend on me** but where there are other factors:
- Position in the lineup (I can move, but others move too).
- Whether I catch the wave (depends on my reading + timing + the wave).
- Pop-up quality (depends on technique + board stability + the wave).
- Communication with other surfers (I can try, it depends on the other person).
- The vibe of the session (I can contribute with attitude).

**Rule:** in Circle 2, effort focuses on **doing my part well** — the result remains open.

---

## 4. CIRCLE 3 — ACCEPTANCE (DOES NOT DEPEND ON ME)

What **just happens**:
- Swell size and direction.
- The day's tide.
- Wind.
- Weather conditions.
- Who else is in the lineup.
- How other surfers behave.
- The ocean in general.

**Rule:** in Circle 3, the only response is **adaptation + acceptance**. Fighting Circle 3 = frustration + risk.

---

## 5. DOCTRINAL APPLICATION

### Pre-session
- Circle 1: "What am I going to work on today?" → PC-002.
- Circle 2: "What conditions do I need?" → influence by arriving early, etc.
- Circle 3: "What conditions are there?" → accept and adapt.

### In-session
- If I miss the pop-up → Circle 1 (my technique, I adjust).
- If I didn't catch the wave → Circle 2 (my reading + the wave).
- If the wave closed out → Circle 3 (there was nothing to do).

### Post-session (PC-012 One Wave debrief)
Ask yourself: *"Which circle was that in?"*
- If Circle 1 → adjust technique / attitude.
- If Circle 2 → adjust preparation / decision.
- If Circle 3 → release, accept.

---

## 6. CONNECTION WITH MARCELO OS / TSS VALUES

The 3 Circles are the surf equivalent of the **Decision Filter** of Marcelo OS:

| Marcelo OS | Circles of Power |
|---|---|
| Focus Law (3 fronts) | Circle 1 (3 domains of agency) |
| ADHD Rule | Circle 1 (system decides over emotion) |
| Balance Rule | Circle 2 (intuition + system) |

**And it ties to belt values:**
- **Humility (White)** = accepting Circle 3.
- **Process (Yellow)** = persisting in Circle 1.
- **Commitment (Blue)** = operating consistently in Circles 1-2.
- **Responsibility (Purple)** = owning Circle 1 without excuses.

---

## 7. EVALUATION CRITERION

The student:
- Lists the 3 circles.
- Explains their agency in each one.
- Applies the framework to a real situation from their last session.
- Recognizes when they are frustrated by something in Circle 3.

---

## 8. REFERENCES

- Source: ISA Surf Coaching framework — integrated as a doctrinal annex of TSS.
- Complements: PC-002 (Set Goal), PC-012 (One Wave), VAL-002 (Humility), VAL-005 (Responsibility).
- Supporting presentation: ISA 3 Circles Presentation (filed under C_Presentations/Coaching).

---

*TSS® Pre-Course · PC-014 3 Circles of Power Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'PC-014';

UPDATE lessons SET
  description_md = $tss$# VAL-001 — CONSCIOUSNESS · CANON

**ID:** VAL-001
**Value:** Consciousness (Consciencia)
**Belt:** Pre-Course
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS Module 0 Pre-Course v3.0 (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. Canon — Short Form

Consciousness is the Pre-Course value because it defines the right starting posture before entering the system. Before technique, before touching the board, before entering the ocean, the future surfer must wake up. Consciousness means seeing clearly: seeing where I am, what I know, what I don't know, what is outside me, what is inside me. Without consciousness there is no real learning, because all knowledge falls on inattentive ground. That is why Pre-Course starts here: **first wake up, then learn.**

---

## 2. Canon — Long Form

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

## 3. Closing Phrase

**Pre-Course begins with consciousness: awake before you act.**

---

## 4. Teaching Application

- **Doctrinal gating:** no PC piece is taught without first framing the session with the value of consciousness.
- **Opening ritual:** every Pre-Course class opens with two minutes of "conscious observation" — what do you see?, what do you feel?, what do you notice?
- **Closing:** every Pre-Course class closes with "what did you become aware of today?"

---

## 5. References

- Canon v7.0 Slide 11 (Module 0 Pre-Course).
- Complements: PC-014 (3 Circles of Power — consciousness is the basis for distinguishing the circles).

---

*TSS® Pre-Course · VAL-001 Consciousness Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'VAL-001';

UPDATE lessons SET
  description_md = $tss$# VAL-002 — HUMILITY · CANON

**ID:** VAL-002
**Value:** Humility (Humildad)
**Belt:** White Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS Module 0 Pre-Course v3.0 (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. Canon — Short Form

Humility is the value of White Belt because it defines the correct attitude to begin. The White Belt accepts they are learning, is not afraid to fail, does not pretend to know everything, and stays open to listen, correct, and improve. In surfing, this value is essential because the ocean constantly reminds us we are not in control of everything. Humility enables better observation, deeper learning, and safer growth. Although it belongs to White Belt, it is also a mindset that should accompany the surfer for life.

---

## 2. Canon — Long Form

Humility is the central value of White Belt because it represents the right attitude to enter the learning process.

Being White Belt is not only being at the first technical level — it is adopting a mindset. It is recognizing that we are beginning, that we do not know everything, that we will make mistakes, and that precisely because of this, we are in the right place to learn.

At this level, humility means being open. Open to listen, to observe, to correct, to repeat, and to improve. The White Belt does not need to pretend to already know. The White Belt is not afraid to fail, because failure is a natural part of the process. They do not defend themselves against learning — they receive it.

This value matters especially in surfing because our first deep contact is with the ocean, and the ocean always reminds us of one essential truth: we are not in control of everything. The sea is immense, changing, and bigger than us. It always has something to teach. Sometimes calmly, sometimes with force, but always placing us in a position where humility is not optional — it is necessary.

That is why White Belt begins with humility. Without humility there is no real observation. Without humility there is no listening. Without humility there is no adaptation. And without humility, the beginner surfer fills too quickly with rush, ego, or false certainty — and that blocks growth.

Humility is also a mindset that should never be abandoned. Even as one advances, it remains one of the most important foundations of development. The best surfer is, in a sense, still a White Belt in their way of learning: still open, still attentive, still willing to correct, still understanding that the ocean always has more to show.

The value of White Belt is not to think small. It is to enter correctly. It is to hold the right inner posture for growth. It is to accept that we are learning, that we do not yet master — and that precisely for this reason, we must remain teachable.

Humility does not weaken the surfer. It prepares them. It keeps them receptive. It keeps them safe. And it keeps them growing.

---

## 3. Closing Phrase

**White Belt begins with humility: open to learn, willing to fail, ready to grow.**

---

## 4. Doctrinal Application

- All 24 White Belt steps assume the student's implicit humility (accepting repetition, accepting correction).
- Coach Cheat Sheets reference humility as a precondition for being able to teach.
- If the student loses humility → they are sent back to their belt; they do not advance.

---

## 5. References

- Canonical source: WB_VALUE_Humility_canon_input.md (Marcelo 2026-04-14).
- Canon v7.0 Slide 11 of Module 0 Pre-Course.
- Complements: PC-011 (Etiquette — humility applied to the lineup), PC-014 (3 Circles — humility applied to Circle 3).

---

*TSS® White Belt · VAL-002 Humility Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'VAL-002';

UPDATE lessons SET
  description_md = $tss$# VAL-003 — PROCESS (RESILIENCE) · CANON

**ID:** VAL-003
**Value:** Process (Resilience) (Proceso / Resiliencia)
**Belt:** Yellow Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS Module 0 Pre-Course v3.0 (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. Canon — Short Form

Process (Resilience) is the Yellow Belt value because it defines the capacity to remain on the path when learning becomes hard. The Yellow Belt is no longer a beginner — and therefore enters the territory where errors hurt more, plateaus last longer, and the ego starts asking for shortcuts. Resilience is what prevents that moment from taking down the surfer. It is the conscious decision to trust the process, to keep repeating, failing, correcting, without abandoning the system.

**Yellow Belt begins with resilience: trust the path when novelty is gone.**

---

## 2. Canon — Long Form

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

## 3. Closing Phrase

**Yellow Belt advances with process: trust the path when novelty is gone.**

---

## 4. Doctrinal Application

- In Yellow Belt the student must hold 2-3 technical plateaus without abandoning the system.
- The coach measures process by observing: do they keep up the progression? do they accept repetition? do they process errors without drama?
- Yellow graduation requires demonstrating **resilience in the face of a real plateau**.

---

## 5. References

- Canon v7.0 Slide 11 (Module 0 Pre-Course).
- Complements: VAL-002 (Humility) as antecedent, VAL-004 (Commitment) as consequence.

---

*TSS® Yellow Belt · VAL-003 Process (Resilience) Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'VAL-003';

UPDATE lessons SET
  description_md = $tss$# VAL-004 — COMMITMENT · CANON

**ID:** VAL-004
**Value:** Commitment (Compromiso)
**Belt:** Blue Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS Module 0 Pre-Course v3.0 (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. Canon — Short Form

Commitment is the Blue Belt value because it defines the decision to give oneself to surfing as a discipline, not a hobby. The Blue Belt is no longer testing if surfing is for them — they know it is theirs. Their technique begins to look like a real surfer's. Here the most important decision of the path is made: to commit. Commit to the wave before dropping it. Commit to the posture. Commit to the system. Commit to consistency. Without commitment there is no full execution — and waves know.

**Blue Belt enters with commitment: decide before doubting.**

---

## 2. Canon — Long Form

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

## 3. Closing Phrase

**Blue Belt enters with commitment: decide before doubting, give before calculating.**

---

## 4. Doctrinal Application

- The Blue maneuvers (bottom turn, top turn) require bodily commitment — without it, they collapse.
- The coach detects lack of commitment through pop-up indecision, tentative posture, and hesitation on the drop.
- Blue certification requires observing consistent commitment across 10+ waves not selected by the student.

---

## 5. References

- Canon v7.0 Slide 11 (Module 0 Pre-Course).
- Complements: VAL-003 (Process) as foundation, VAL-005 (Responsibility) as consequence.

---

*TSS® Blue Belt · VAL-004 Commitment Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'VAL-004';

UPDATE lessons SET
  description_md = $tss$# VAL-005 — RESPONSIBILITY · CANON

**ID:** VAL-005
**Value:** Responsibility (Responsabilidad)
**Belt:** Purple Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS Module 0 Pre-Course v3.0 (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. Canon — Short Form

Responsibility is the Purple Belt value because it defines the surfer who can no longer hide behind "I'm still learning". The Purple Belt surfs real conditions: big waves, crowded lineups, fast safety decisions for self and others. No more excuses: every mistake has consequences. Responsibility means owning without drama what depends on you, without guilt for what doesn't, and acting accordingly. It is operational maturity in the water.

**Purple Belt operates with responsibility: own what's yours without drama or excuse.**

---

## 2. Canon — Long Form

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

## 3. Closing Phrase

**Purple Belt operates with responsibility: own without drama, decide without excuse, act for all.**

---

## 4. Doctrinal Application

- Purple Belt is the first level where the coach is no longer in the water — the student surfs alone and is self-accountable.
- Purple certification requires demonstrating correct safety decisions in changing conditions without assistance.
- The Purple Belt is an informal mentor for White/Yellow students — and cannot be one without inner responsibility.

---

## 5. References

- Canon v7.0 Slide 11 (Module 0 Pre-Course).
- Complements: VAL-004 (Commitment) as antecedent, VAL-006 (Gratitude) as consequence, PC-014 (3 Circles — responsibility over Circle 1).

---

*TSS® Purple Belt · VAL-005 Responsibility Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'VAL-005';

UPDATE lessons SET
  description_md = $tss$# VAL-006 — GRATITUDE · CANON

**ID:** VAL-006
**Value:** Gratitude (Gratitud)
**Belt:** Brown Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS Module 0 Pre-Course v3.0 (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. Canon — Short Form

Gratitude is the Brown Belt value because it defines the inner mastery of the surfer who can already do everything technically — and chooses to arrive with renewed humility. The Brown Belt already surfs any condition, reads any spot, executes any maneuver. Their technique is not in question. What defines them is no longer **what they can do** — it is **how they arrive at the sea**. Gratitude is the consciousness that every wave is a privilege, not a right; that the ocean let them learn; that the path was possible thanks to many; that time in the water is limited. The Brown Belt knows, and therefore gives thanks.

**Brown Belt returns with gratitude: knowing all, arriving with renewed humility.**

---

## 2. Canon — Long Form

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

## 3. Closing Phrase

**Brown Belt returns with gratitude: knowing all, receiving all, owning nothing.**

---

## 4. Doctrinal Application

- Brown Belt graduation includes a "lineage debrief": the surfer publicly names those who made their path possible.
- Gratitude is observable in the Brown Belt by how they treat new students — with patience, without condescension.
- A Brown Belt with arrogance is a **failed** Brown Belt — they are asked to repeat the final stretch.

---

## 5. References

- Canon v7.0 Slide 11 (Module 0 Pre-Course).
- Complements: VAL-005 (Responsibility) as foundation, VAL-007 (Impact) as consequence.

---

*TSS® Brown Belt · VAL-006 Gratitude Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'VAL-006';

UPDATE lessons SET
  description_md = $tss$# VAL-007 — IMPACT · CANON

**ID:** VAL-007
**Value:** Impact (Impacto)
**Belt:** Black Belt
**Status:** CANONIZED — Canon v7.0 Slide 11
**Source:** TSS Module 0 Pre-Course v3.0 (Slide 11)
**IP:** Marcelo Castellanos / Enkrateia · TSS®

---

## 1. Canon — Short Form

Impact is the Black Belt value because it defines the surfer whose presence now transcends their own wave. The Black Belt no longer surfs for themselves. They surf because they are the vehicle through which discipline, values, teaching, and lineage are transmitted to others. They are no longer measured by their technique — they are measured by **what they leave behind**: students, healthier lineups, community, legacy. Impact is the stage where the surfer becomes **master, reference, and custodian** of the system.

**Black Belt delivers with impact: not the wave, but the path.**

---

## 2. Canon — Long Form

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

## 3. Closing Phrase

**Black Belt delivers with impact: no longer the wave, but the path; no longer the student, but the lineage.**

---

## 4. Doctrinal Application

- Black Belt certification requires: (a) forming at least 3 students up to Blue Belt, (b) contributing to the TSS Canon in writing, (c) being recognized by the community as an ethical reference.
- The Black Belt has the right (and duty) to **teach the entire system** — including its constitutional layer, not just its technique.
- Active Black Belts are custodians of the system — they have a voice in amendments to the Canon Seal.

---

## 5. References

- Canon v7.0 Slide 11 (Module 0 Pre-Course).
- Complements: VAL-006 (Gratitude) as antecedent. Closes the full arc of the 7 TSS values.
- Connection with **Marcelo OS META FINAL:** *financial freedom + intellectual authority + formative legacy.*

---

*TSS® Black Belt · VAL-007 Impact Canon v1.0*
*IP of Marcelo Castellanos / Enkrateia*
$tss$
WHERE id = 'VAL-007';

COMMIT;
