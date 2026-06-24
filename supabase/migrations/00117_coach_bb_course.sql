-- Blue Belt Coach Course (course_section = 'coach_bb').
--
-- Source: TSS_BLUE_BELT_COACH_COURSE_v1.docx (Marcelo / Enkrateia SA de CV).
-- Mirrors the WB/YB coach course structure (COACH-* ids) and uses the new
-- pedagogical callout syntax rendered by MarkdownContent:
--   > [!TEACH] [!CORRECT] [!VALIDATE] [!CUE] [!CRITICAL] [!DOCTRINE]
--   > [!MANTRA] [!KEYWORDS]
-- Content is transcribed from the document — nothing invented.
-- Idempotent: ON CONFLICT (id) DO UPDATE on every row.

INSERT INTO lessons (
  id, course_section, step_number, title, subtitle, pillar,
  description_md, estimated_minutes, lesson_type, display_order, active
) VALUES

-- ─── 1. Coach Foundations ───
('COACH-BB-FOUND-01', 'coach_bb', 1,
 'Coach Foundations',
 'Authorization · ratios · the Audit/Refinement stance · mindset',
 'Coach · Foundations',
 $$# Coach Foundations

You have moved up a belt with your students. You taught White Belt (direct-intervention stance) and Yellow Belt (co-decision stance). Now you teach Blue Belt as **L2 Practitioner Coach** — the **audit/refinement stance**.

The student in front of you owns the structure from White and Yellow. What they don't yet own is the structural commitment that defines Blue Belt:

> [!MANTRA]
> THE UNIVERSAL SEQUENCE FORMULA
> Posture → Rotation → Projection → Maneuver → Closure → Posture

> [!CRITICAL]
> Three things to internalize before any Blue Belt session:
> 1. Your job is ==structural fidelity, not maneuver outcome==. A student graduates when they execute the Universal Formula with awareness, not perfection. Push for structural commitment, not radical maneuvers.
> 2. ==Audit self-correction before correcting yourself.== "Which stage failed?" is your most-used question at Blue Belt. If they can answer, they are graduating. If not, they need more time.
> 3. ==Use the Universal Formula language for every feedback.== Generic feedback is below Blue Belt coaching. Name the stage.

## 1.1 — Your authorization

Per Core Canon §D, **L2 Practitioner Coach** authorizes you to teach: Pre-Course · White Belt Onboarding · White Belt Sequences 1–5 + Exit Test · Yellow Belt Sequences 6.0 + 7.0 + Exit Test · Blue Belt Belt Value · Blue Belt Foundation Sequence · Blue Belt Sequences #8–#13 · The Four Blue Belt Concepts · The Complete Blue Belt Ride · Blue Belt Exit Test.

> [!CRITICAL]
> You are NOT authorized to teach Purple Belt or above without L3 Advanced Coach certification.

| Level | Title | Authorized scope |
|---|---|---|
| L1 | Foundation Coach | White + Yellow Belt (Seq #1–7) |
| L2 | Practitioner Coach | Through Blue Belt (Seq #1–13) |
| L3 | Advanced Coach | Through Purple + Brown Belt |
| L4 | Master Coach | All belts incl. Black |
| L5 | Coach Educator | Trains / evaluates / certifies coaches |

All certified TSS coaches ARE Coaches. The title is always Coach with the appropriate qualifier. What changes per belt taught is the **operational stance**.

## 1.2 — Coach-Student ratios

| Context | L2 Practitioner | L3+ |
|---|---|---|
| Blue Belt regular sessions | ≤6 students | ≤8 |
| Blue Belt camp (intensive) | ≤4 students | ≤6 |
| Blue Belt Exit Test | 1:1 (no exceptions) | 1:1 |

## 1.3 — Your operational stance: Audit / Refinement

> [!DOCTRINE]
> All certified TSS coaches are Coaches (Core Canon §D). The title is always Coach with the certification-level qualifier. What changes per belt taught is the operational stance — how the Coach behaves in the moment.

The Coach Stance evolves per belt taught: Direct-intervention (White) → Co-decision (Yellow) → **Audit/Refinement (Blue)** → Strategic-advisory (Purple+) → Performance/Mastery (Brown+).

What changes from Yellow co-decision to Blue audit/refinement:

| Dimension | Yellow stance | Blue stance |
|---|---|---|
| Decisions | Co-decide with student | Audit student's decisions |
| Verbal output | High (constant feedback) | Low (intervene only when needed) |
| Feedback language | Generic + technical mix | Universal Formula language ONLY |
| Correction style | Prescriptive ("Move your hand here") | Diagnostic ("Which stage failed?") |
| Failure response | Save the student | Let the failure happen — failure is data |
| Self-correction | Coach identifies for student | Coach audits student's self-identification |
| Wave selection | Coach often suggests | Student decides; coach confirms |

Operational rules at Blue Belt: you speak ==at least 50% less than you did at Yellow==; every correction uses the Universal Formula stage names; you ask diagnostic questions before giving cues; you let the student fail and watch HOW they fail; you confirm the student's self-correction rather than correcting yourself.

> [!CRITICAL]
> If at the end of a Blue Belt session the student does NOT know which stage failed on their failed attempts, they are not yet at Exit Test level. Audit that self-identification before signing off.

## 1.4 — Mindset before any session

1. ==The student is operationally independent.== Do not regress to direct-intervention or co-decision out of habit. Wait. Observe. Let them work.
2. ==Failure is data.== Don't save the student from a failed wave that will teach them. Watch the failure pattern. Diagnose. Then intervene if needed.
3. ==Structure over outcome.== Weak execution with full Universal Formula adherence is a SUCCESS at Blue Belt. A clean snap with a skipped Projection is a FAILURE.
4. ==Compromiso Consciente starts with you.== If you skip a stage in your demonstration, the student will skip it in execution. Model the structure.$$,
 16, 'reading', 10, true),

-- ─── 2. Teaching Frameworks ───
('COACH-BB-FRAME-01', 'coach_bb', 2,
 'The Teaching Frameworks',
 'EDPF · Triad · Five Locations · Safety Override · Universal Formula language',
 'Coach · Method',
 $$# The Teaching Frameworks

## 2.1 — The E·D·P·F delivery cycle (Core Canon §C.3)

EDPF = Explain · Demonstrate · Practice · Feedback. Every Blue Belt drill, mission, and session follows EDPF.

| Phase | Your action at Blue Belt | Your verbal output |
|---|---|---|
| Explain | Verbalize the Universal Formula stage being trained | Use Universal Formula stage names ONLY |
| Demonstrate | Show on land/skateboard · then ask student to verbalize | "What did you see me do?" |
| Practice | Set the drill with clear constraints | "Three reps. Goal: maintain Cruz throughout." |
| Feedback | Identify which stage failed · use Three Circles to diagnose | "Which stage failed?" → then "You skipped X · drill X in isolation." |

> [!CRITICAL]
> Feedback must use the Universal Sequence Formula language. Generic feedback ("you fell because you weren't ready") is below Blue Belt coaching.

## 2.2 — The Triad — your decision tool (Core Canon §C.4 / P3)

Every coaching moment lives within a Triad: **Surfer** (skill, fatigue, attention, emotion) · **Ocean** (size, period, direction, crowd, tide) · **Task** (the drill/mission). At Blue Belt the Triad changes constantly — a cue that works on Wave 1 may not work on Wave 5 because the Ocean shifted. The student reads the Triad; you confirm the read.

## 2.3 — The Five Locations (Core Canon §C.8)

Classroom (theory) · Land (drills) · Skateboard (motion) · Pool (calm water) · Ocean (real conditions). At Blue Belt, every new STP touches at least 3 of the 5 before it is owned. The Universal Formula is practiced ==Land → Skateboard → Ocean== as a progressive chain.

## 2.4 — Conditions & Safety Override (Core Canon §A.6, §B.5)

> [!CRITICAL]
> SUPREME PRINCIPLE: Safety Override always applies. You have the authority and obligation to cancel any drill / mission / session if conditions are unsafe.

Blue-specific safety: maneuvers in the critical part of the wave raise wipeout consequences vs Yellow; the "survive the foam return" mission needs medium-strength foam; Hold doctrine extends time on the wave into bigger impact zones; camp modality intensifies density — monitor fatigue.

## 2.5 — The Universal Sequence Formula language (NEW at Blue Belt)

> [!MANTRA]
> Posture → Rotation → Projection → Maneuver → Closure → Posture

Every feedback you give at Blue Belt uses these 6 stage names.

| Generic feedback (BELOW Blue Belt) | Universal Formula feedback (Blue-level) |
|---|---|
| "You fell on that one" | "Your Posture was weak. Reset before Rotation." |
| "That cutback was rough" | "Your Hold released before the pocket was visible. Drill the Hold in isolation." |
| "Nice snap" | "Clean Universal Formula — Posture into Rotation into Projection into Cruz into Grenade. Same again." |
| "Try harder" | "Which stage failed?" |

> [!CRITICAL]
> Never give vague feedback at Blue Belt. Every feedback names a stage. If you can't name a stage, watch one more attempt before speaking.$$,
 14, 'reading', 20, true),

-- ─── 3. Belt Value Shift ───
('COACH-BB-ONB-01', 'coach_bb', 3,
 'Teaching the Belt Value Shift',
 'Resilience → Compromiso Consciente (Conscious Commitment)',
 'Coach · Belt Value',
 $$# Teaching the Belt Value Shift

## 3.1 — The shift you're facilitating

At Yellow Belt the student learned: "I accept this is hard. I accept I will fail. I keep showing up." That was **resilience**. At Blue Belt the student learns: "There is a structure. The structure cannot be skipped. I commit to walking the structure even when I want to skip it." That is **Compromiso Consciente** (Conscious Commitment).

> [!MANTRA]
> "There are no shortcuts. You have to walk the path."

## 3.2 — How you teach it

Day 1 of Blue Belt:
1. Read the Belt Value section of the Student Course aloud with the student.
2. Ask: ==“What temptation do you have right now to skip a stage?”== — let them answer specifically.
3. Have them write the temptation in their notebook + commit to NOT skipping it for the next 3 sessions.

Throughout Blue Belt: every time the student is tempted to skip a stage and they don't → name it as Compromiso Consciente in practice. Every time they skip → name it as the opposite · ask them to reset the next attempt with full structure.

> [!CUE]
> Closing question of every session: "Did you walk the path today?" — let them answer for themselves.

## 3.3 — Pass criterion

A student demonstrates Compromiso Consciente when they can verbalize in their own words what the value means, can give a specific personal example of a moment they wanted to skip and didn't, and ==maintain the Universal Formula in the LAST 3 attempts of every session== (when fatigue is highest).

> [!VALIDATE]
> That third criterion is the real test. Anyone can hold the structure when fresh. The Blue Belt student holds it when tired.$$,
 10, 'reading', 30, true),

-- ─── 4. Foundation Sequence ───
('COACH-BB-FOUNDSEQ-01', 'coach_bb', 4,
 'Teaching the Foundation Sequence (17 Elements)',
 'Audit White/Yellow reliability · Center of the Board · Press the Button',
 'Coach · Foundations',
 $$# Teaching the Foundation Sequence (17 Elements)

Before teaching Sequence #10 (the first sequence to introduce the Universal Formula), confirm the 17 Foundation elements from White + Yellow are owned at Blue Belt level.

> [!DOCTRINE]
> Do NOT teach the 17 elements as new content — they are inherited from White/Yellow. Your job is to AUDIT their reliability at Blue Belt level.

## 4.1 — The Foundation Check audit (1 session)

- Land warm-up (10 min) — confirm Posture, Rotation, Compression, FP transitions.
- Skateboard segment (15 min) — confirm Press the Button + FP1/FP2/FP3 transitions.
- Water segment (15 waves) — observe White/Yellow sequences: Pop-Up + Foot Position landing (STP-030) · Chase the Pocket (STP-028) · Paddle with Correct Angle (STP-029) · Cobra + Pick Line (STP-034) · Duck Dive automatic (STP-024) · Out from the Shoulder (STP-032).
- Theory check (10 min) — ask: Where is your back foot right now? What FP are you in? Can you Press the Button on command?

## 4.2 — Two NEW Blue Belt Foundation principles

> [!TEACH]
> ==Center of the Board (2-dimensional).== At White/Yellow they became aware of lateral center. At Blue Belt you teach longitudinal awareness — they must always know where their back foot is on the nose-tail axis. Demonstrate: move the back foot FP1 → FP2 → FP3 narrating each. Then the student does it ==with eyes closed==, verbalizing FP without looking down.

> [!TEACH]
> ==Press the Button.== The dynamic action of switching FPs during a single ride. Demonstrate on land: pop-up → land FP2 → switch FP1 → back FP2 → FP3, weight shifts deliberate and visible. Audit: is the student's weight shift deliberate or accidental?

## 4.3 — Foundation self-check

Before Sequence #8, confirm the student answers YES to all 6 self-check items (Student Course §3.4). If any is NO, return to that element for at least 3 sessions.

> [!CORRECT]
> Common Foundation breakdowns: Duck dive still requires thinking → drill in calm pool (CDR-BB-11). Press the Button accidental → drill 2D awareness on land + skateboard before water. Pop-up lands in random FP → mission: every pop-up announces target FP first.$$,
 12, 'reading', 40, true)
ON CONFLICT (id) DO UPDATE SET
  course_section=excluded.course_section, step_number=excluded.step_number,
  title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar,
  description_md=excluded.description_md, estimated_minutes=excluded.estimated_minutes,
  lesson_type=excluded.lesson_type, display_order=excluded.display_order, active=excluded.active;
