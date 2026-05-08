-- 00021E PART 1/2 — Insert 13 missions (MIS-WB-001 to MIS-WB-013)
-- Source: 07_WB_MISSIONS_canon.md
--
-- Doctrine: drill = HOW skill is trained (DRL-WB-XX, type='drill')
--           mission = HOW learning is applied (MIS-WB-XXX, type='mission')
-- Each STP has 1 drill AND 1 mission. Total: 25 + 25 = 50 entries.

BEGIN;

INSERT INTO drills_missions (
  id, step_id, title, type, time_estimate, reps_recommended,
  description_md, success_criteria, belt, display_order, active
) VALUES
(
  'MIS-WB-001', 'STP-001', 'Read Today''s Spot', 'mission',
  '5-10 min', '1 complete venue analysis',
  'Standing on the beach with full view of the surf zone, perform a complete VCA-6 venue analysis aloud. Identify break type, wave direction, entry and exit zones, hazards, tide and wind state, and level fit. End with a verbal go/no-go decision and session plan.',
  ARRAY['Coach validates that all 6 VCA elements are addressed AND the go/no-go decision is justified.']::TEXT[],
  'white', 101, TRUE
),
(
  'MIS-WB-002', 'STP-002', 'Execute Full Surfing Warm Up Before Session', 'mission',
  '8-12 min', '1 complete flow (mobility + activation + simulation + breath)',
  'Before any water session, execute the complete TSS Warm Up flow: 4 segments — mobility, activation, simulation, breath. No interruptions. Body and mind transitioned from rest to ready.',
  ARRAY['Student demonstrates all 4 segments fluidly + reports being in "active calm" state at the end.']::TEXT[],
  'white', 102, TRUE
),
(
  'MIS-WB-003', 'STP-003', 'Carry Board From Rack to Water Edge', 'mission',
  '2-3 min', '1 complete carry',
  'Pick up the board safely with proper rail grip + body mechanics. Carry it to the water edge maintaining control. No dragging the fins. No swinging the board near others.',
  ARRAY['Coach validates: clean lift, both hands on rails, controlled carry, safe distance from others, board placed gently at water edge.']::TEXT[],
  'white', 103, TRUE
),
(
  'MIS-WB-004', 'STP-004', 'Walk Out to Waist-Deep Without Losing Control', 'mission',
  '3-5 min', '1 controlled entry',
  'Enter the water with the board on your side. Drag your feet on the sand bottom (avoid stingrays / rocks). Maintain board angle to oncoming foam. Reach waist-deep position ready to mount.',
  ARRAY['Student arrives at waist-deep without: losing the board, getting hit by foam, slipping on rocks, panicking. Composure intact.']::TEXT[],
  'white', 104, TRUE
),
(
  'MIS-WB-005', 'STP-005', 'Place Board for Sweet Spot Mounting', 'mission',
  '1-2 min', '5-8 placements',
  'In waist-deep water, place the board in front of you parallel to incoming waves. Lower it gently (no slap). Release with fingers ready to grab if foam pushes it. Board is ready for mounting.',
  ARRAY['Board placed correctly + 5-8 successful releases with no loss of board to whitewater.']::TEXT[],
  'white', 105, TRUE
),
(
  'MIS-WB-006', 'STP-006', 'Manage Board Through Three Foam Lines', 'mission',
  '5-10 min', '5-8 foam encounters',
  'Stand in waist-deep water with board. As foam comes, control the tail and rails to keep board pointing into the wave. Allow 3 foam lines to pass while maintaining board control. No board loss.',
  ARRAY['3 foam lines navigated without losing board control. Board never sideways to wave.']::TEXT[],
  'white', 106, TRUE
),
(
  'MIS-WB-007', 'STP-007', 'Pass Through Five Foam Waves Standing', 'mission',
  '8-12 min', '5-8 passages',
  'Standing in waist-deep water with board pointed straight at incoming foam, execute the canonical passage technique. Press, lift, pass — without losing board or balance.',
  ARRAY['5 successful clean passages. Board stays connected. Surfer remains balanced and progressing forward.']::TEXT[],
  'white', 107, TRUE
),
(
  'MIS-WB-008', 'STP-008', 'Turn Around Safely 5 Times', 'mission',
  '5-8 min', '5 controlled turns',
  'Execute the 180-degree pivot turn in the water keeping the board between you and the open water (never between you and the wave). Practice intentional rotation with no loose board.',
  ARRAY['5 turns executed cleanly with board controlled and never positioned dangerously. Body always between board and shore.']::TEXT[],
  'white', 108, TRUE
),
(
  'MIS-WB-009', 'STP-009', 'Safe Return From Waist-Deep to Sand', 'mission',
  '3-5 min', '1 full return',
  'After session, return to the sand with full awareness. Walk backwards facing the waves, board to the side, monitoring incoming foam. Adjust position if foam approaches. Land safely on sand.',
  ARRAY['Return executed without: losing board, getting hit from behind, falling, or panicking. Composed all the way.']::TEXT[],
  'white', 109, TRUE
),
(
  'MIS-WB-010', 'STP-010', 'Mount Board on Sweet Spot 5 Times', 'mission',
  '5-8 min', '5-8 mounts',
  'In foam zone, mount the board prone in your sweet spot — nose barely floating, tail just submerged. Body centered. Ready to paddle. Repeat 5-8 times until automatic.',
  ARRAY['Board floats level on each mount. Coach validates sweet spot position. Student feels board "ready" not "fighting back".']::TEXT[],
  'white', 110, TRUE
),
(
  'MIS-WB-011', 'STP-011', 'Align With Five Incoming Foam Waves', 'mission',
  '5-8 min', '5-8 alignments',
  'In sweet spot, when foam approaches, align nose toward the direction the foam is going. Look over shoulder to verify alignment before paddling.',
  ARRAY['5 alignments correctly executed BEFORE paddling. Shoulder check performed each time.']::TEXT[],
  'white', 111, TRUE
),
(
  'MIS-WB-012', 'STP-012', 'Catch Five Foam Waves By Paddling', 'mission',
  '10-15 min', '5-10 wave attempts',
  'When foam approaches, paddle aggressively (long strokes, one-two cadence) to match foam speed. Start early, commit, never stop until you feel the board accelerate with the wave.',
  ARRAY['5 waves caught with proper paddle technique (no late starts, no early stops). Coach validates body angle and forward push.']::TEXT[],
  'white', 112, TRUE
),
(
  'MIS-WB-013', 'STP-013', 'Direct Board Left and Right From Cobra', 'mission',
  '8-12 min', '5 lefts + 5 rights',
  'Once on a foam wave in cobra, intentionally direct the board left or right by pressing the rail with your hands and looking in that direction. Execute 5 left turns and 5 right turns across multiple waves.',
  ARRAY['Board responds intentionally. Direction matches student''s pre-stated intention each time. No accidental drift.']::TEXT[],
  'white', 113, TRUE
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description_md = EXCLUDED.description_md,
  success_criteria = EXCLUDED.success_criteria,
  type = 'mission',
  active = TRUE;

COMMIT;
