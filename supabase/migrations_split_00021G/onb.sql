-- 00021H — WB Onboarding 6 items in student voice
-- Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (Marcelo, 2026-05-08)
-- Idempotent: replaces description_md with student-voice canon

BEGIN;

UPDATE lessons SET
  title = 'Goofy or Regular',
  description_md = '## What you''ll learn

You learn to identify your natural surfing stance. This is determined by your body, not by choice. It affects everything that comes next: which foot is your back foot for the pop-up, which side is your frontside, how you read waves.

## Why it matters

A wrong stance ruins every step that follows. You learn this once, on land, before you waste time on the wrong foot.

## What you need to know

- Regular stance: left foot forward, right foot back. Your back foot drives.
- Goofy stance: right foot forward, left foot back. Your back foot drives.
- How to identify: (1) Push test — stand still, get pushed gently from behind. The foot you step forward to catch yourself is your back foot. (2) Skateboard or snowboard test — your natural stance there is the same on the surfboard. (3) Slide test — run on a smooth floor in socks and slide. The leading foot is your front foot.
- Once identified, your stance is fixed for life. Train accordingly.

## How you know you''ve got it

- You know your stance — Regular or Goofy.
- You can articulate which foot goes forward and which goes back.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'ONB-01';

UPDATE lessons SET
  title = 'What is Surf?',
  description_md = '## What you''ll learn

You learn what surfing actually is — beyond the cliché. Surfing is a relationship with the ocean, not just a sport.

## Why it matters

If you treat surfing as just athletics, you miss the depth. TSS does not train athletes who use the ocean. TSS trains surfers who know they are part of the ocean.

## What you need to know

- Surfing is the practice of riding breaking waves using a board, governed by the interaction between three elements: wave, surfer, and ocean.
- The fundamental triangle: Wave (the master, irreproducible) + Surfer (the body that adapts) + Ocean (the environment that imposes the rules).
- You don''t dominate the wave. You read it. You respect it. You respond in real time.
- This is dialogue, not conquest.

## How you know you''ve got it

- You define surfing in your own words.
- You explain the wave/surfer/ocean triangle as a relationship of dialogue, not domination.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'ONB-02';

UPDATE lessons SET
  title = 'History of Surf',
  description_md = '## What you''ll learn

You learn that surfing did not begin in California. It originated in Polynesia centuries ago, has deep cultural roots, and almost disappeared before being revived.

## Why it matters

You are not surfing a "modern sport." You are participating in an ancestral discipline. Respect the tradition. Know the lineage.

## What you need to know

- Polynesia (ancient): He''e nalu — "wave sliding" — was practiced for centuries. Surfing was tied to ritual, status, and community.
- Hawaii (~1000 CE): surfing became central to Hawaiian culture. Different boards for different classes, different waves for different social ranks.
- 19th century: surfing nearly disappeared due to colonization and missionary suppression.
- Early 20th century: Duke Kahanamoku, Hawaiian Olympic swimmer, brought surfing back to the world. Tom Blake invented the hollow surfboard, fins, and many essential designs.
- 1950s-1960s: surf culture exploded worldwide. Boards evolved from heavy wood to lighter foam.
- Tokyo 2020: surfing officially debuts as an Olympic sport.

## How you know you''ve got it

- You state surfing''s Polynesian origin.
- You name at least one foundational figure (Duke Kahanamoku).
- You understand surfing as ancient discipline, not recent invention.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'ONB-03';

UPDATE lessons SET
  title = 'Four Pillars of Holistic Growth',
  description_md = '## What you''ll learn

You learn that TSS does not just train technique. TSS trains 4 dimensions of you, in parallel.

## Why it matters

Most surf training only develops technique. That makes you fragile. TSS develops you in 4 interconnected pillars so you become a complete surfer, not just a wave-rider.

## What you need to know

- Pillar 1 — Physical: body mechanics, conditioning, balance, mobility, endurance, swim/apnea. Without physical capacity, technique cannot be expressed.
- Pillar 2 — Mental: focus, fear management, patience, presence, environmental reading. Surfing rewards the cool head.
- Pillar 3 — Technical: biomechanics, board control, maneuver execution. The visible part — but only one of four.
- Pillar 4 — Social-Ethical: lineup etiquette, respect for locals, communication, surfer ethics. Without this, you are a hazard.
- Interdependence: the 4 pillars are not independent. You can''t have elite technique with paralyzing fear. You''re not a complete surfer until all 4 work together.

## How you know you''ve got it

- You name the 4 pillars in order.
- You explain what each pillar develops.
- You identify your own weakest pillar today — that''s where you''ll grow most in White Belt.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'ONB-04';

UPDATE lessons SET
  title = 'Surf Equipment — Parts & Types',
  description_md = '## What you''ll learn

You learn the parts of a surfboard, the main types, and which one is yours during White Belt.

## Why it matters

You can''t use a tool you don''t know. The wrong board makes everything harder. The right board makes the mechanics learnable.

## What you need to know

- The 9 main parts of a board: nose (front tip), tail (back end), rails (side edges — what enters water in turns), deck (top surface where you stand), bottom (underside), rocker (curve from nose to tail), fins (directional control), leash (cord to your foot — never surf without it), stringer (central rigid line for strength).
- The 5 main board types: Softboard (foam, soft, safe — your White Belt board), Longboard (9 ft+, stable), Funboard (7-8 ft, transition), Fish (short, wide, fast in small waves), Shortboard (advanced, fast maneuvers).
- TSS rule: White Belt = softboard. No exceptions. Hardboard access requires Yellow Belt certification.

## How you know you''ve got it

- You name the 9 main parts of the board without checking the manual.
- You identify the 5 main board types.
- You explain why softboard is the White Belt standard.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'ONB-05';

UPDATE lessons SET
  title = 'Venue Analysis + Set Goal',
  description_md = '## What you''ll learn

You learn the two things that happen on the beach before every session: you read the venue (VCA-6 framework), and you set your session goal.

## Why it matters

Without venue reading, you enter blind. Without a goal, you drift. TSS rejects "have fun" as a session goal because it produces zero measurable progress. Specificity creates growth.

## What you need to know

- VCA-6 Framework — evaluate 6 elements before paddling out: (1) Break type — beach break, point break, or reef break. (2) Wave direction — right, left, or A-frame. (3) Entry/exit zones — identified BEFORE entering, not during. (4) Hazards — rocks, currents, surfers, marine life, shallow bottom. (5) Tide/wind — tide changes hourly, offshore wind = quality, onshore = ruined. (6) Level fit — are TODAY''s conditions appropriate for MY level?
- After venue analysis, set ONE specific goal for the session. Not "have fun." Specific examples: "Catch 3 clean foam waves and execute the pop-up sequence on each." "Apply the One Wave Protocol on every wave I attempt." "Practice my paddle technique — focus on elbow-over-ear for 20 strokes."
- No goal, no entry. The surfer who enters without intention drifts. The surfer with intention learns.

## How you know you''ve got it

- You execute a verbal venue analysis at any spot using all 6 VCA elements.
- You set a specific, achievable session goal that fits your belt level.
- You explain why "have fun" is not a valid TSS goal.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'ONB-06';

COMMIT;
