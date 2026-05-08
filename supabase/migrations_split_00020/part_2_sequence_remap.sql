-- 00020 PART 2/2 — Re-map 25 STPs to 5 cumulative sequences
-- Run this AFTER part 1.
-- Source: 04_WB_SEQUENCES_canon.md

BEGIN;

-- Sequence #1 — Board Control (9 steps): STP-001 to STP-009
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.', sequence_step_order=1 WHERE id='STP-001';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.', sequence_step_order=2 WHERE id='STP-002';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.', sequence_step_order=3 WHERE id='STP-003';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.', sequence_step_order=4 WHERE id='STP-004';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.', sequence_step_order=5 WHERE id='STP-005';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.', sequence_step_order=6 WHERE id='STP-006';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.', sequence_step_order=7 WHERE id='STP-007';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.', sequence_step_order=8 WHERE id='STP-008';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.', sequence_step_order=9 WHERE id='STP-009';

-- Sequence #2 — Sweet Spot (5 steps): STP-010 to STP-014
UPDATE lessons SET wb_sequence_id='WB-SEQ-2', wb_sequence_name='Sweet Spot', wb_sequence_order=2, wb_sequence_promise='You find your sweet spot on the board, align with the wave, paddle to catch whitewater, ride prone with directional control, and dismount cleanly.', sequence_step_order=1 WHERE id='STP-010';
UPDATE lessons SET wb_sequence_id='WB-SEQ-2', wb_sequence_name='Sweet Spot', wb_sequence_order=2, wb_sequence_promise='You find your sweet spot on the board, align with the wave, paddle to catch whitewater, ride prone with directional control, and dismount cleanly.', sequence_step_order=2 WHERE id='STP-011';
UPDATE lessons SET wb_sequence_id='WB-SEQ-2', wb_sequence_name='Sweet Spot', wb_sequence_order=2, wb_sequence_promise='You find your sweet spot on the board, align with the wave, paddle to catch whitewater, ride prone with directional control, and dismount cleanly.', sequence_step_order=3 WHERE id='STP-012';
UPDATE lessons SET wb_sequence_id='WB-SEQ-2', wb_sequence_name='Sweet Spot', wb_sequence_order=2, wb_sequence_promise='You find your sweet spot on the board, align with the wave, paddle to catch whitewater, ride prone with directional control, and dismount cleanly.', sequence_step_order=4 WHERE id='STP-013';
UPDATE lessons SET wb_sequence_id='WB-SEQ-2', wb_sequence_name='Sweet Spot', wb_sequence_order=2, wb_sequence_promise='You find your sweet spot on the board, align with the wave, paddle to catch whitewater, ride prone with directional control, and dismount cleanly.', sequence_step_order=5 WHERE id='STP-014';

-- Sequence #3 — Pop-Up (6 steps): STP-015 to STP-020
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.', sequence_step_order=1 WHERE id='STP-015';
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.', sequence_step_order=2 WHERE id='STP-016';
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.', sequence_step_order=3 WHERE id='STP-017';
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.', sequence_step_order=4 WHERE id='STP-018';
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.', sequence_step_order=5 WHERE id='STP-019';
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.', sequence_step_order=6 WHERE id='STP-020';

-- Sequence #4 — Directional Turns (2 steps)
UPDATE lessons SET wb_sequence_id='WB-SEQ-4', wb_sequence_name='Directional Turns', wb_sequence_order=4, wb_sequence_promise='You execute your first turns - backside and frontside - using rail engagement and visual lead.', sequence_step_order=1 WHERE id='STP-021';
UPDATE lessons SET wb_sequence_id='WB-SEQ-4', wb_sequence_name='Directional Turns', wb_sequence_order=4, wb_sequence_promise='You execute your first turns - backside and frontside - using rail engagement and visual lead.', sequence_step_order=2 WHERE id='STP-022';

-- Sequence #5 — Independence (3 steps)
UPDATE lessons SET wb_sequence_id='WB-SEQ-5', wb_sequence_name='Independence', wb_sequence_order=5, wb_sequence_promise='You set your own session goal, paddle out unassisted, manage waves on your way out (turtle roll), redirect prone, and turn left or right on a wave. Belt Value formalized: Humildad.', sequence_step_order=1 WHERE id='STP-023';
UPDATE lessons SET wb_sequence_id='WB-SEQ-5', wb_sequence_name='Independence', wb_sequence_order=5, wb_sequence_promise='You set your own session goal, paddle out unassisted, manage waves on your way out (turtle roll), redirect prone, and turn left or right on a wave. Belt Value formalized: Humildad.', sequence_step_order=2 WHERE id='STP-024';
UPDATE lessons SET wb_sequence_id='WB-SEQ-5', wb_sequence_name='Independence', wb_sequence_order=5, wb_sequence_promise='You set your own session goal, paddle out unassisted, manage waves on your way out (turtle roll), redirect prone, and turn left or right on a wave. Belt Value formalized: Humildad.', sequence_step_order=3 WHERE id='STP-025';

COMMIT;

-- Verification (optional, run separately)
SELECT
  wb_sequence_id, wb_sequence_name, wb_sequence_order,
  COUNT(*) AS step_count
FROM lessons
WHERE id LIKE 'STP-%' AND active = TRUE
GROUP BY wb_sequence_id, wb_sequence_name, wb_sequence_order
ORDER BY wb_sequence_order;
