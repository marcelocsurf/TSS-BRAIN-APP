-- 00021B — WB Onboarding Module 1 canon (6 items)
-- Source: 03_WB_ONBOARDING_canon.md
--
-- New course_section: 'wb_onboarding'
-- - Deactivate old PC-004, 005, 006, 007, 008, 009 (subsumed)
-- - Insert 6 ONB-XX items with full canon content
-- - These appear AFTER Pre-Course, BEFORE White Belt Sequences in UI

BEGIN;

-- 1. Deactivate old PC items being replaced by ONB-XX
UPDATE lessons SET active = FALSE
  WHERE id IN ('PC-004', 'PC-005', 'PC-006', 'PC-007', 'PC-008', 'PC-009');

-- 2. Insert 6 ONB-XX with full canon content
INSERT INTO lessons (
  id, course_section, step_number, title, pillar,
  description_md, estimated_minutes,
  prerequisites, lesson_type, display_order, active, status_v1,
  pc_section_id, pc_section_name, pc_section_order
) VALUES
(
  'ONB-01', 'wb_onboarding', 301, 'Goofy or Regular', 'Method & Mindset / Technical Foundation',
  'Every surfer has a natural stance — Regular (left foot forward) or Goofy (right foot forward). This is determined by your body, not by choice. Your stance affects every aspect of your future surfing: which foot is your back foot for the pop-up, which side is your frontside vs backside, how you read waves.

**How to identify your stance:**
1. **Push test** — stand still, have someone push you gently from behind. The foot you step forward to catch yourself is your back foot for surfing (the dominant foot).
2. **Skateboard / snowboard test** — if you''ve done either, your natural stance there is the same on the surfboard.
3. **Slide test** — run on a smooth floor in socks and slide. The leading foot is your front foot.

Once identified, stance is fixed for life. Train accordingly. The rest of the White Belt sequence (especially STP-016 Pop-Up) will be biomechanically tuned to your stance.

**Success criterion:** Student knows their stance and can articulate which foot goes forward and which goes back on the board.

*Source: PC-004 Goofy or Regular Canon v1*',
  10, ARRAY[]::TEXT[], 'form', 301, TRUE, 'PRODUCTIZED',
  'M1', 'WB Onboarding', 1
),
(
  'ONB-02', 'wb_onboarding', 302, 'What is Surf?', 'Doctrinal Foundation',
  'Surfing is the practice of riding breaking waves using a board, governed by the interaction between wave, surfer, and ocean.

Surfing is simultaneously a sport and a relationship with the ocean. It is not just athleticism — it is a bond.

**The fundamental triangle:**
- **Wave** — irreproducible, ever-changing, the master.
- **Surfer** — the body that adapts.
- **Ocean** — the environment that imposes the rules.

The surfer does not dominate the wave. The surfer reads the wave, respects the ocean, and responds in real time. **This is dialogue, not conquest.**

**Why this matters for TSS:** TSS does not train athletes who use the ocean. TSS trains surfers who know they are part of the ocean. The technique is rigorous; the mindset is humble.

**Success criterion:** Student can define surfing in their own words AND explain the wave/surfer/ocean triangle as a relationship of dialogue, not domination.

*Source: PC-005 What is Surf Canon v1*',
  10, ARRAY[]::TEXT[], 'reading', 302, TRUE, 'PRODUCTIZED',
  'M1', 'WB Onboarding', 1
),
(
  'ONB-03', 'wb_onboarding', 303, 'History of Surf', 'Doctrinal Foundation',
  'Surfing did not begin in California or Australia. It originated in Polynesia, with deep historical and cultural roots.

**Key historical milestones:**
- **Polynesia (ancient)** — He''e nalu (literally "wave sliding") was practiced for centuries before European contact. Surfing was tied to ritual, status, and community.
- **Hawaii (~1000 CE)** — surfing became central to Hawaiian culture. Different boards for different classes, different waves for different social ranks.
- **19th century — near disappearance** — colonization and missionary activity nearly extinguished the practice.
- **Early 20th century — revival** — Duke Kahanamoku, Hawaiian Olympic swimming champion, brought surfing to the world. He surfed in California, Australia, on multiple continents — single-handedly reigniting the global culture.
- **1950s-1960s** — surf culture explodes worldwide. Boards evolve from heavy wooden longboards to lighter foam shapes.
- **Tom Blake (1930s)** — invented the first hollow surfboard, fins, and many essential design innovations.
- **Tokyo 2020** — surfing officially debuts as an Olympic sport.

You are not surfing a "modern sport." You are participating in an ancestral discipline. **Respect the tradition. Know the lineage.**

**Success criterion:** Student can: (1) state surfing''s Polynesian origin, (2) name at least one foundational figure (Duke Kahanamoku), (3) understand surfing as ancient discipline, not recent invention.

*Source: PC-006 History of Surf Canon v1*',
  10, ARRAY[]::TEXT[], 'reading', 303, TRUE, 'PRODUCTIZED',
  'M1', 'WB Onboarding', 1
),
(
  'ONB-04', 'wb_onboarding', 304, 'Four Pillars of Holistic Growth', 'Doctrinal Foundation',
  'TSS does not train wave-riders. TSS trains whole surfers.

**The 4 pillars:**

**1. Physical** — body mechanics, conditioning, balance, mobility, endurance, swim/apnea capacity. Without physical capacity, technique cannot be expressed.

**2. Mental** — focus, fear management, patience, presence, environmental reading, decision-making under pressure. Surfing rewards the cool head when conditions become chaotic.

**3. Technical** — biomechanics of each step, board control, maneuver execution. The visible part — but only one of four.

**4. Social-Ethical** — lineup etiquette, respect for locals, communication, surfer ethics, environmental responsibility. Surfing is community. Without this, you are a hazard or an aggressor.

**Interdependence principle:** the 4 pillars are not independent. You cannot have elite technique with paralyzing fear. You cannot be physically strong without knowing how to read the wave. You are not a complete surfer until all 4 work in harmony.

**Why this matters for TSS:** every step, drill, and mission you''ll do is filtered through these 4 pillars. Your White Belt journey trains all four — not just technique.

**Success criterion:** Student can: (1) name the 4 pillars in order, (2) explain what each develops, (3) identify their own weakest pillar today as the focus for White Belt growth.

*Source: PC-007 Four Pillars Canon v1*',
  10, ARRAY[]::TEXT[], 'reading', 304, TRUE, 'PRODUCTIZED',
  'M1', 'WB Onboarding', 1
),
(
  'ONB-05', 'wb_onboarding', 305, 'Surf Equipment — Parts & Types', 'Equipment & Venue',
  'Know your tool before you use it.

**The 9 main parts of a surfboard:**
- **Nose** — the front tip. Affects entry speed and handling on small waves.
- **Tail** — the back end. Defines maneuverability and grip.
- **Rails** — the side edges. What enters the water when you turn.
- **Deck** — the top surface where you stand. Wax or traction goes here.
- **Bottom** — the underside. Its shape defines glide.
- **Rocker** — the curve from nose to tail. More rocker = more maneuverable. Less rocker = more speed.
- **Fins** — define directional control and grip. Single, twin, thruster (3), quad (4), or 5-fin setups.
- **Leash** — the cord connecting board to your foot. Never surf without one.
- **Stringer** — the central rigid line giving the board structural strength.

**5 main board types:**
- **Softboard** — foam, soft, safe, high flotation. **The White Belt board.** All TSS White Belt training happens on softboards for safety and learning efficiency.
- **Longboard** — 9 feet or more, stable, slow-turning, ideal for small waves and classic surfing.
- **Funboard / Mid-length** — 7-8 feet. Transition between soft and hardboard.
- **Fish** — short, wide, fast on small-to-medium waves.
- **Shortboard** — the advanced board. Fast maneuvers, high technique threshold.

**TSS rule:** White Belt = softboard. No exceptions. Hardboard access requires Yellow Belt certification.

**Success criterion:** Student can: (1) name the 9 main parts of the board without reference, (2) identify the 5 main board types, (3) explain why softboard is the White Belt standard.

*Source: PC-008 Surf Equipment Canon v1*',
  10, ARRAY[]::TEXT[], 'reading', 305, TRUE, 'PRODUCTIZED',
  'M1', 'WB Onboarding', 1
),
(
  'ONB-06', 'wb_onboarding', 306, 'Venue Analysis + Set Goal', 'Method & Mindset',
  'Before every session, two things happen on the beach: you read the venue, and you set your goal.

**VENUE ANALYSIS — the VCA-6 framework:**

Before paddling out, evaluate the spot using these 6 elements:

1. **Break type.** Beach break (sand, shifting peaks). Point break (rocky point, predictable). Reef break (over coral or rock, dangerous for beginners).
2. **Wave direction.** Right, left, or A-frame? Determines which Turn (frontside or backside) you''ll execute.
3. **Entry and exit zones.** Where you enter the lineup, where you exit to the sand. Identified BEFORE entering, not during.
4. **Hazards.** Rocks, currents, other surfers, marine life, shallow bottom. Anything that increases risk.
5. **Tide and wind.** Tide changes the spot every hour. Offshore wind = quality. Onshore wind = ruined waves.
6. **Level fit.** Are TODAY''s conditions appropriate for MY level? The honest go/no-go question.

**SET GOAL — the per-session intention:**

Once the venue is read, the surfer sets ONE specific goal for the session. Not a vague "I want to get better." A specific, measurable intention.

**Examples of good session goals:**
- "Catch 3 clean foam waves and execute the pop-up sequence on each."
- "Apply the One Wave Protocol on every wave I attempt."
- "Practice my paddle technique — focus on elbow-over-ear for 20 strokes."

**Examples of bad session goals:**
- "Have fun." (Too vague.)
- "Master the cutback." (Outside White Belt scope.)
- "Catch as many waves as possible." (Volume without quality.)

**Doctrinal rule:** no goal, no entry. The surfer who enters without intention drifts. The surfer with intention learns.

**Success criterion:** Student can: (1) execute a verbal venue analysis at any spot using all 6 VCA elements, (2) set a specific, achievable session goal that fits their belt level, (3) explain why "have fun" is not a valid TSS goal.

*Source: PC-009 Venue Analysis Theory Canon v1 + PC-002 Set Goal Canon v1 (combined per Marcelo decision)*',
  15, ARRAY[]::TEXT[], 'form', 306, TRUE, 'PRODUCTIZED',
  'M1', 'WB Onboarding', 1
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description_md = EXCLUDED.description_md,
  pillar = EXCLUDED.pillar,
  course_section = EXCLUDED.course_section,
  pc_section_id = EXCLUDED.pc_section_id,
  pc_section_name = EXCLUDED.pc_section_name,
  pc_section_order = EXCLUDED.pc_section_order,
  active = TRUE,
  status_v1 = 'PRODUCTIZED';

COMMIT;

-- Verification (run separately)
SELECT id, title, course_section, status_v1, active
FROM lessons
WHERE id LIKE 'ONB-%'
ORDER BY display_order;
