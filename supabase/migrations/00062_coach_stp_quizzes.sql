-- M62 — Seed quizzes for the 25 COACH-STP-XXX coach lessons.
--
-- Source: /1111/_TSS_WHITE_BELT_OFICIAL_v1/COACH_MANUAL_v4_EN/
--         TSS_WB_COACH_MANUAL_v4_EN.md — Part 9 Quiz Bank
--
-- Every question + option set is verbatim from the manual. No invention.
-- Idempotent: clears existing quizzes for these lesson IDs first.
--
-- The 12 remaining coach_wb lessons (FOUND-01..05, PC-VERIFY, OB-DELIVERY,
-- DIAG, CAREER, EXIT-TEST) still need quizzes — those will land in a
-- follow-up migration once the source content per lesson is extracted from
-- the corresponding Manual sections (Parts II-V, XI-XIV).

DELETE FROM lesson_quizzes WHERE lesson_id LIKE 'COACH-STP-%';

INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES

-- STP-001 — Venue Analysis
('COACH-STP-001', 'When you arrive at the beach, what is the FIRST thing you should identify?',
 '[{"text":"A fixed land reference and an outside reference","correct":true},{"text":"The biggest wave","correct":false},{"text":"Other surfers","correct":false},{"text":"Where you parked","correct":false}]'::jsonb, 1),
('COACH-STP-001', 'How long should you watch the lineup before deciding to enter?',
 '[{"text":"At least 5 minutes to see set patterns","correct":true},{"text":"30 seconds","correct":false},{"text":"Just look once","correct":false},{"text":"Until you see one big wave","correct":false}]'::jsonb, 2),
('COACH-STP-001', 'What does the "go/no-go decision" answer?',
 '[{"text":"Whether today''s conditions are appropriate for your level","correct":true},{"text":"How many waves you''ll catch","correct":false},{"text":"Where to park","correct":false},{"text":"What time to leave","correct":false}]'::jsonb, 3),
('COACH-STP-001', 'What is the "safe zone"?',
 '[{"text":"The area where you can practice without big waves breaking on top of you","correct":true},{"text":"The parking lot","correct":false},{"text":"Where the lifeguard sits","correct":false},{"text":"Far from any waves","correct":false}]'::jsonb, 4),

-- STP-002 — Warm Up
('COACH-STP-002', 'How many segments does the canonical TSS Warm Up have?',
 '[{"text":"4 — Mobility, Activation, Simulation, Breath","correct":true},{"text":"2 — Stretch and Run","correct":false},{"text":"6 — too many to remember","correct":false},{"text":"No fixed structure","correct":false}]'::jsonb, 1),
('COACH-STP-002', 'What is the purpose of the "Simulation" segment?',
 '[{"text":"Rehearse surfing movements on land before water (pop-up, posture, rotation)","correct":true},{"text":"Stretch your hamstrings","correct":false},{"text":"Cool down after a session","correct":false},{"text":"Talk to other surfers","correct":false}]'::jsonb, 2),
('COACH-STP-002', 'What is the goal mental state at the end of the warm-up?',
 '[{"text":"Active calm — present, connected, focused, ready","correct":true},{"text":"Overexcited and pumped up","correct":false},{"text":"Sleepy and relaxed","correct":false},{"text":"Tense and serious","correct":false}]'::jsonb, 3),

-- STP-003 — Grab Board
('COACH-STP-003', 'When lifting the board, where should your hands be?',
 '[{"text":"Both hands on the rails (side edges)","correct":true},{"text":"On the deck (top)","correct":false},{"text":"On the fins","correct":false},{"text":"On the leash","correct":false}]'::jsonb, 1),
('COACH-STP-003', 'What part of your body does the lifting?',
 '[{"text":"Your legs (knees bent, back straight)","correct":true},{"text":"Your back","correct":false},{"text":"Your arms only","correct":false},{"text":"Your core only","correct":false}]'::jsonb, 2),
('COACH-STP-003', 'How should you carry the board to the water?',
 '[{"text":"On your side, under control, away from other people","correct":true},{"text":"Above your head","correct":false},{"text":"Dragging the fins on the sand","correct":false},{"text":"Behind your back","correct":false}]'::jsonb, 3),

-- STP-004 — Walk Out
('COACH-STP-004', 'Why should you drag your feet on the sand bottom as you walk in?',
 '[{"text":"To detect obstacles like rocks and avoid stingrays","correct":true},{"text":"To go faster","correct":false},{"text":"To leave footprints","correct":false},{"text":"It looks cool","correct":false}]'::jsonb, 1),
('COACH-STP-004', 'Where should the board be while walking out?',
 '[{"text":"On your side, with the nose pointed at incoming foam","correct":true},{"text":"In front of you","correct":false},{"text":"Behind you","correct":false},{"text":"Above your head","correct":false}]'::jsonb, 2),
('COACH-STP-004', 'When should you start walking out?',
 '[{"text":"During a lull, after watching for the set pattern","correct":true},{"text":"In the middle of a set","correct":false},{"text":"Whenever you arrive","correct":false},{"text":"When everyone else does","correct":false}]'::jsonb, 3),

-- STP-005 — Put Board in the Water
('COACH-STP-005', 'How should you place the board on the water?',
 '[{"text":"Gently, parallel to incoming waves, no slap","correct":true},{"text":"Drop it from waist height","correct":false},{"text":"Throw it forward","correct":false},{"text":"Stand on it first","correct":false}]'::jsonb, 1),
('COACH-STP-005', 'Why does board orientation matter when placing?',
 '[{"text":"If perpendicular to waves, the foam will rip it from your hands","correct":true},{"text":"Doesn''t matter — board floats either way","correct":false},{"text":"Only matters for speed","correct":false},{"text":"Only matters in the lineup","correct":false}]'::jsonb, 2),
('COACH-STP-005', 'After releasing the board, what should you do?',
 '[{"text":"Stay ready to grab the rails again instantly if foam comes","correct":true},{"text":"Walk away","correct":false},{"text":"Climb on immediately without checking","correct":false},{"text":"Dive under the water","correct":false}]'::jsonb, 3),

-- STP-006 — Control Your Board
('COACH-STP-006', 'When foam is coming, what should you do with the tail of the board?',
 '[{"text":"Press it down so the nose lifts and foam passes underneath","correct":true},{"text":"Lift it up","correct":false},{"text":"Let it go loose","correct":false},{"text":"Stand on it","correct":false}]'::jsonb, 1),
('COACH-STP-006', 'Where should your body be relative to the board?',
 '[{"text":"Between the board and the shore — never let the board be between you and the wave","correct":true},{"text":"In front of the board","correct":false},{"text":"On top of the board","correct":false},{"text":"Far away from the board","correct":false}]'::jsonb, 2),
('COACH-STP-006', 'What direction should the nose always face as foam approaches?',
 '[{"text":"Pointed straight at the incoming foam","correct":true},{"text":"Sideways to the foam","correct":false},{"text":"Toward the beach","correct":false},{"text":"Doesn''t matter","correct":false}]'::jsonb, 3),

-- STP-007 — Pass Through Whitewater (Standing)
('COACH-STP-007', 'What body posture do you maintain when passing through whitewater standing?',
 '[{"text":"Compact — knees slightly bent, body low and stable","correct":true},{"text":"Tall and stiff","correct":false},{"text":"Crouched in a ball","correct":false},{"text":"Leaning back","correct":false}]'::jsonb, 1),
('COACH-STP-007', 'What happens if you press the tail down as the foam reaches the nose?',
 '[{"text":"The nose lifts and the foam passes under the board","correct":true},{"text":"The board flips over","correct":false},{"text":"The board sinks","correct":false},{"text":"The foam pushes you backward","correct":false}]'::jsonb, 2),
('COACH-STP-007', 'In which direction should you progress after the foam passes?',
 '[{"text":"Forward — toward the lineup","correct":true},{"text":"Backward to the shore","correct":false},{"text":"Sideways","correct":false},{"text":"Stay in place","correct":false}]'::jsonb, 3),

-- STP-008 — Pivot Turn
('COACH-STP-008', 'During the pivot turn, where should your body be relative to the board?',
 '[{"text":"Between the board and the open ocean — never let the board be between you and the wave","correct":true},{"text":"On top of the board","correct":false},{"text":"Far from the board","correct":false},{"text":"Behind the board only","correct":false}]'::jsonb, 1),
('COACH-STP-008', 'What should you do BEFORE rotating the board?',
 '[{"text":"Look behind you (over your shoulder) to check what''s coming","correct":true},{"text":"Close your eyes","correct":false},{"text":"Yell to others","correct":false},{"text":"Stand up straight","correct":false}]'::jsonb, 2),
('COACH-STP-008', 'What''s the goal at the end of a safe pivot turn?',
 '[{"text":"Be facing toward the lineup, ready to paddle out","correct":true},{"text":"Face the beach","correct":false},{"text":"Lay flat on the water","correct":false},{"text":"Climb on the board","correct":false}]'::jsonb, 3),

-- STP-009 — Walk Back to Shore
('COACH-STP-009', 'How should you walk back to the sand?',
 '[{"text":"Facing partly toward the waves, monitoring incoming foam","correct":true},{"text":"Turn your back fully to the waves and walk fast","correct":false},{"text":"Run as fast as you can","correct":false},{"text":"Walk with eyes closed","correct":false}]'::jsonb, 1),
('COACH-STP-009', 'What should you do if foam approaches mid-walk?',
 '[{"text":"Stop, brace, let it pass, then continue","correct":true},{"text":"Run away","correct":false},{"text":"Dive under","correct":false},{"text":"Throw the board ahead","correct":false}]'::jsonb, 2),
('COACH-STP-009', 'Why is walk-back awareness important?',
 '[{"text":"Many beach injuries happen on the way out — being hit from behind by foam","correct":true},{"text":"There are sea creatures","correct":false},{"text":"Other surfers might collide with you","correct":false},{"text":"You might forget your towel","correct":false}]'::jsonb, 3),

-- STP-010 — Sweet Spot
('COACH-STP-010', 'Where should the NOSE of your board be when you''re in the sweet spot?',
 '[{"text":"Just barely floating above the water","correct":true},{"text":"Submerged below the water","correct":false},{"text":"Lifted high above the water","correct":false},{"text":"Pointing straight up","correct":false}]'::jsonb, 1),
('COACH-STP-010', 'Where should your CHEST be on the board?',
 '[{"text":"Slightly forward of center","correct":true},{"text":"Far back near the tail","correct":false},{"text":"All the way on the nose","correct":false},{"text":"Hanging off the side","correct":false}]'::jsonb, 2),
('COACH-STP-010', 'How do you know you''ve found the sweet spot?',
 '[{"text":"The board floats level and you don''t feel like you''re fighting it","correct":true},{"text":"The board tilts heavily forward","correct":false},{"text":"You can stand up immediately","correct":false},{"text":"The tail comes out of the water","correct":false}]'::jsonb, 3),
('COACH-STP-010', 'What''s the consequence of being too far forward (nose dive position)?',
 '[{"text":"The nose pushes down into the water and you can''t paddle","correct":true},{"text":"The board moves faster","correct":false},{"text":"The wave pushes you forward","correct":false},{"text":"It doesn''t matter","correct":false}]'::jsonb, 4),

-- STP-011 — Wave Alignment
('COACH-STP-011', 'Before you start paddling for a wave, what must you check?',
 '[{"text":"Look over your shoulder to verify your alignment with the foam","correct":true},{"text":"Close your eyes and focus","correct":false},{"text":"Yell to other surfers","correct":false},{"text":"Stand up first","correct":false}]'::jsonb, 1),
('COACH-STP-011', 'In which direction should the nose of your board point?',
 '[{"text":"In the direction the foam is moving","correct":true},{"text":"Sideways to the foam","correct":false},{"text":"Toward the lineup","correct":false},{"text":"Toward the beach only","correct":false}]'::jsonb, 2),
('COACH-STP-011', 'What''s the consequence of paddling without alignment?',
 '[{"text":"Wasted paddle effort and missed wave","correct":true},{"text":"You''ll catch the wave faster","correct":false},{"text":"Nothing — paddle hard enough and it works","correct":false},{"text":"You''ll go backward","correct":false}]'::jsonb, 3),

-- STP-012 — Paddle Cadence
('COACH-STP-012', 'What is the canonical paddle cadence?',
 '[{"text":"Long strokes, alternating one-two","correct":true},{"text":"Short choppy strokes","correct":false},{"text":"Both arms together","correct":false},{"text":"No fixed cadence","correct":false}]'::jsonb, 1),
('COACH-STP-012', 'Each paddle stroke should push the board:',
 '[{"text":"Forward — pull water back to push body forward","correct":true},{"text":"Down — push down on the water","correct":false},{"text":"Up — lift the board","correct":false},{"text":"Sideways","correct":false}]'::jsonb, 2),
('COACH-STP-012', 'When can you stop paddling once you''re committed?',
 '[{"text":"When you feel the board accelerate with the wave","correct":true},{"text":"After 3 strokes","correct":false},{"text":"When you get tired","correct":false},{"text":"Never until you reach the beach","correct":false}]'::jsonb, 3),
('COACH-STP-012', 'What''s the most common paddling mistake?',
 '[{"text":"Starting too late and stopping before the wave catches you","correct":true},{"text":"Paddling too hard","correct":false},{"text":"Paddling with both arms together","correct":false},{"text":"Paddling underwater","correct":false}]'::jsonb, 4),

-- STP-013 — Cobra + Turn Left and Right
('COACH-STP-013', 'In cobra position, where are your hands placed?',
 '[{"text":"At rib height on the rails","correct":true},{"text":"At the nose of the board","correct":false},{"text":"On the tail","correct":false},{"text":"On your face","correct":false}]'::jsonb, 1),
('COACH-STP-013', 'To turn the board while in cobra, what do you do?',
 '[{"text":"Look in the direction you want to go and press that side''s rail","correct":true},{"text":"Lean back","correct":false},{"text":"Close your eyes","correct":false},{"text":"Stop the board first","correct":false}]'::jsonb, 2),
('COACH-STP-013', 'What does "eyes lead" mean in cobra steering?',
 '[{"text":"Where your eyes look, your body follows — direction starts with the gaze","correct":true},{"text":"Keep eyes closed","correct":false},{"text":"Look at your feet","correct":false},{"text":"Look up at the sky","correct":false}]'::jsonb, 3),

-- STP-014 — Prone Dismount
('COACH-STP-014', 'When dismounting from a prone ride, where should your hands be?',
 '[{"text":"Both hands gripping the rails firmly","correct":true},{"text":"Released from the board","correct":false},{"text":"Above your head","correct":false},{"text":"Behind your back","correct":false}]'::jsonb, 1),
('COACH-STP-014', 'How should your body land in the water?',
 '[{"text":"On your side or back, never face-first","correct":true},{"text":"Face-first like a dive","correct":false},{"text":"Standing upright","correct":false},{"text":"Curled in a ball","correct":false}]'::jsonb, 2),
('COACH-STP-014', 'What is the cardinal rule of prone dismount?',
 '[{"text":"Stay with the board — never let go of the rails until stable in the water","correct":true},{"text":"Let go immediately","correct":false},{"text":"Throw the board away from you","correct":false},{"text":"Stop the board first","correct":false}]'::jsonb, 3),

-- STP-015 — Pick Your Line
('COACH-STP-015', 'When should you pick your line on the wave?',
 '[{"text":"While still in cobra, BEFORE initiating the pop-up","correct":true},{"text":"After standing up","correct":false},{"text":"During the pop-up itself","correct":false},{"text":"After the wave ends","correct":false}]'::jsonb, 1),
('COACH-STP-015', 'What does "verbalizing your line" mean?',
 '[{"text":"Saying out loud (or mentally) ''I am going there'' while still in cobra","correct":true},{"text":"Yelling at the wave","correct":false},{"text":"Counting waves out loud","correct":false},{"text":"Singing","correct":false}]'::jsonb, 2),
('COACH-STP-015', 'During the pop-up, where should your eyes go?',
 '[{"text":"Locked on the chosen direction — never look down at the board","correct":true},{"text":"Down at the nose","correct":false},{"text":"At the wave behind you","correct":false},{"text":"Closed","correct":false}]'::jsonb, 3),
('COACH-STP-015', 'What''s the result of a pop-up without picking a line first?',
 '[{"text":"Direction is accidental — board drifts wherever the wave pushes","correct":true},{"text":"You go faster","correct":false},{"text":"You stand up better","correct":false},{"text":"The wave breaks earlier","correct":false}]'::jsonb, 4),

-- STP-016 — Pop-Up
('COACH-STP-016', 'What is the FIRST step of the pop-up?',
 '[{"text":"Solid cobra position with chest lifted","correct":true},{"text":"Stand up immediately","correct":false},{"text":"Grab the leash","correct":false},{"text":"Look at the beach","correct":false}]'::jsonb, 1),
('COACH-STP-016', 'How should both feet land?',
 '[{"text":"Both centered, both at the same time (or front foot first — never back foot first)","correct":true},{"text":"Back foot first","correct":false},{"text":"One on each rail","correct":false},{"text":"On the nose","correct":false}]'::jsonb, 2),
('COACH-STP-016', 'When should your hands release the rails?',
 '[{"text":"Only when you are centered and stable, never before","correct":true},{"text":"Immediately at the start","correct":false},{"text":"Halfway through","correct":false},{"text":"Never — keep them on","correct":false}]'::jsonb, 3),
('COACH-STP-016', 'What does "audible exhale" mean during the pop-up?',
 '[{"text":"Active breath out at the moment of the lift — releases tension and adds power","correct":true},{"text":"Holding your breath","correct":false},{"text":"Yelling","correct":false},{"text":"Speaking the cue word","correct":false}]'::jsonb, 4),

-- STP-017 — Foot Position #2 (FP2)
('COACH-STP-017', 'Where on the board does Foot Position #2 (FP2) place the back foot?',
 '[{"text":"Centered on the rails, in the back third of the board, perpendicular to the stringer","correct":true},{"text":"On one rail","correct":false},{"text":"On the nose","correct":false},{"text":"Off the side of the board","correct":false}]'::jsonb, 1),
('COACH-STP-017', 'What''s the consequence of the back foot landing on a rail?',
 '[{"text":"No power, no control — board doesn''t respond","correct":true},{"text":"Faster speed","correct":false},{"text":"Better turning","correct":false},{"text":"Easier balance","correct":false}]'::jsonb, 2),
('COACH-STP-017', 'How does correct FP2 feel?',
 '[{"text":"The board responds to your pressure — connected","correct":true},{"text":"Heavy and stuck","correct":false},{"text":"Nothing changes","correct":false},{"text":"Painful","correct":false}]'::jsonb, 3),

-- STP-018 — Power Stance
('COACH-STP-018', 'In the canonical power stance, where do your shoulders point?',
 '[{"text":"Forward — never back","correct":true},{"text":"Back","correct":false},{"text":"Sideways","correct":false},{"text":"Up at the sky","correct":false}]'::jsonb, 1),
('COACH-STP-018', 'Where is your weight in the power stance?',
 '[{"text":"Slightly forward, on the front foot","correct":true},{"text":"All the way back on the tail","correct":false},{"text":"Centered exactly","correct":false},{"text":"Off the board","correct":false}]'::jsonb, 2),
('COACH-STP-018', 'What does "back knee compact" mean?',
 '[{"text":"Bent inward, not splayed out — keeps the body connected","correct":true},{"text":"Locked straight","correct":false},{"text":"Spread out wide","correct":false},{"text":"Touching the board","correct":false}]'::jsonb, 3),
('COACH-STP-018', 'Why is "exhale active" part of the power stance?',
 '[{"text":"Active breath keeps the body connected and prevents stiffening","correct":true},{"text":"It''s not part of the stance","correct":false},{"text":"You should hold your breath","correct":false},{"text":"Only competitive surfers exhale","correct":false}]'::jsonb, 4),

-- STP-019 — Impulse
('COACH-STP-019', 'When should you generate impulse on a ride?',
 '[{"text":"When the foam is slowing or wave power is dissipating","correct":true},{"text":"At the very start of the wave","correct":false},{"text":"When you''re falling","correct":false},{"text":"Before you stand up","correct":false}]'::jsonb, 1),
('COACH-STP-019', 'What does the impulse motion look like?',
 '[{"text":"Flex knees, touch toward water, push extension forward","correct":true},{"text":"Jump straight up","correct":false},{"text":"Lean back hard","correct":false},{"text":"Squat and stay","correct":false}]'::jsonb, 2),
('COACH-STP-019', 'What does a successful impulse produce?',
 '[{"text":"The board accelerates — ride is extended","correct":true},{"text":"You fall off","correct":false},{"text":"Nothing changes","correct":false},{"text":"The wave stops","correct":false}]'::jsonb, 3),

-- STP-020 — Starfish Dismount
('COACH-STP-020', 'When should you decide to do a starfish dismount?',
 '[{"text":"EARLY — before you lose balance, not after","correct":true},{"text":"Only after you fall","correct":false},{"text":"Halfway through the wave","correct":false},{"text":"Never until you crash","correct":false}]'::jsonb, 1),
('COACH-STP-020', 'What body shape is the "starfish"?',
 '[{"text":"Knees bent, arms wide open like a star","correct":true},{"text":"Curled tight in a ball","correct":false},{"text":"Standing upright","correct":false},{"text":"Diving headfirst","correct":false}]'::jsonb, 2),
('COACH-STP-020', 'In which direction should you fall?',
 '[{"text":"Backward, into the foam — never forward, never headfirst","correct":true},{"text":"Forward into the wave","correct":false},{"text":"Headfirst diving","correct":false},{"text":"Sideways","correct":false}]'::jsonb, 3),
('COACH-STP-020', 'Why do you fall back instead of forward?',
 '[{"text":"Forward dives can land headfirst into shallow water — extreme injury risk","correct":true},{"text":"It looks cooler","correct":false},{"text":"It''s faster","correct":false},{"text":"It doesn''t matter","correct":false}]'::jsonb, 4),

-- STP-021 — Backside Turn
('COACH-STP-021', 'What is the canonical chain for a backside turn?',
 '[{"text":"Look → Oblique → Hip → Heel-side rail","correct":true},{"text":"Lean → Push → Pull → Stop","correct":false},{"text":"Step → Skip → Jump","correct":false},{"text":"Random combination","correct":false}]'::jsonb, 1),
('COACH-STP-021', 'Which foot side''s rail engages on a backside turn?',
 '[{"text":"The heel-side rail","correct":true},{"text":"The toe-side rail","correct":false},{"text":"Both rails equally","correct":false},{"text":"No rail","correct":false}]'::jsonb, 2),
('COACH-STP-021', 'What does "eyes lead" mean in turning?',
 '[{"text":"Look in the turn direction first — body follows","correct":true},{"text":"Close your eyes","correct":false},{"text":"Look at your feet","correct":false},{"text":"Look behind you","correct":false}]'::jsonb, 3),

-- STP-022 — Frontside Turn
('COACH-STP-022', 'What''s the critical difference between frontside and backside turns?',
 '[{"text":"On frontside, posture must stay connected — no buckling forward","correct":true},{"text":"They''re identical","correct":false},{"text":"Frontside uses no rail","correct":false},{"text":"Backside doesn''t use eyes","correct":false}]'::jsonb, 1),
('COACH-STP-022', 'Which rail engages on a frontside turn?',
 '[{"text":"The toe-side (front-side) rail","correct":true},{"text":"The heel-side rail","correct":false},{"text":"No rail","correct":false},{"text":"Both rails","correct":false}]'::jsonb, 2),
('COACH-STP-022', 'What''s the most common error on frontside turns?',
 '[{"text":"Buckling forward — collapsing posture mid-turn","correct":true},{"text":"Looking away too much","correct":false},{"text":"Not bending the knees enough","correct":false},{"text":"Using too much rail","correct":false}]'::jsonb, 3),

-- STP-023 — Paddle Out
('COACH-STP-023', 'In efficient paddle-out technique, where does your elbow pass?',
 '[{"text":"Over your ear","correct":true},{"text":"Below your shoulder","correct":false},{"text":"Behind your back","correct":false},{"text":"Across your chest","correct":false}]'::jsonb, 1),
('COACH-STP-023', 'How should your body be positioned during paddle out?',
 '[{"text":"Like an arrow — head still, no side-to-side movement","correct":true},{"text":"Twisting side to side","correct":false},{"text":"Looking around constantly","correct":false},{"text":"Hunched up","correct":false}]'::jsonb, 2),
('COACH-STP-023', 'How many "gears" does TSS paddle technique have?',
 '[{"text":"Multiple gears (1-3+) — switch based on goal: cruising, target, sprint","correct":true},{"text":"Only one speed","correct":false},{"text":"Two speeds: slow and fast","correct":false},{"text":"No defined gears","correct":false}]'::jsonb, 3),
('COACH-STP-023', 'How should the hand enter the water?',
 '[{"text":"Aerodynamically, fingertips first","correct":true},{"text":"Slapping flat","correct":false},{"text":"Fist closed","correct":false},{"text":"Backside of hand first","correct":false}]'::jsonb, 4),

-- STP-024 — Turtle Roll
('COACH-STP-024', 'When should you initiate the turtle roll?',
 '[{"text":"About 1 meter before the foam reaches you","correct":true},{"text":"After the foam already hit you","correct":false},{"text":"Whenever you feel like it","correct":false},{"text":"Only for big waves","correct":false}]'::jsonb, 1),
('COACH-STP-024', 'During the roll, where should your elbows be?',
 '[{"text":"On top of the board, protecting your face from the bottom","correct":true},{"text":"Off to the sides","correct":false},{"text":"Underneath the board","correct":false},{"text":"Wrapped behind your head","correct":false}]'::jsonb, 2),
('COACH-STP-024', 'What is the cardinal rule of turtle roll?',
 '[{"text":"Never let go of the board — keep gripping the rails through the turbulence","correct":true},{"text":"Always let go to escape","correct":false},{"text":"Use it only when alone","correct":false},{"text":"It only works on waves under 1 foot","correct":false}]'::jsonb, 3),
('COACH-STP-024', 'How do you recover after the roll?',
 '[{"text":"Scissor kick + use one arm to return chest to center, resume paddling","correct":true},{"text":"Stand up","correct":false},{"text":"Float on your back","correct":false},{"text":"Dive deeper","correct":false}]'::jsonb, 4),

-- STP-025 — Prone Direction
('COACH-STP-025', 'How many canonical modes are there for prone direction?',
 '[{"text":"3 — one-side paddling, circular hand motion, seated pivot","correct":true},{"text":"1 — only paddling","correct":false},{"text":"5 different methods","correct":false},{"text":"No defined modes","correct":false}]'::jsonb, 1),
('COACH-STP-025', 'In the seated pivot mode, where should your hips go?',
 '[{"text":"Back toward the tail — so the board pivots more easily","correct":true},{"text":"Forward to the nose","correct":false},{"text":"Off to one side","correct":false},{"text":"Doesn''t matter","correct":false}]'::jsonb, 2),
('COACH-STP-025', 'After a direction change, what state should you be in?',
 '[{"text":"Ready to paddle immediately — never stuck out of position","correct":true},{"text":"Sitting and resting","correct":false},{"text":"Floating with eyes closed","correct":false},{"text":"Standing up","correct":false}]'::jsonb, 3);
