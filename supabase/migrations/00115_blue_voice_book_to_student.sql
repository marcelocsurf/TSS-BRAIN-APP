-- Blue Belt student course — voice fixes (third-person/clinical → book-to-student).
-- Per the corrected student manual: address the student directly ("you"), not
-- "the surfer". Applied to the exact sentences present in the app content.
--   (The manual's "Sequence #8 is where the surfer learns internal force
--    generation" line is intro prose that was not imported as-is — Seq #8 lives
--    in STP-035/STP-036 with different wording — so there is nothing to change
--    for it in the app.)

-- BB-ONB-01 (Compromiso Consciente onboarding)
update lessons set description_md =
  replace(
    replace(description_md,
      'the moment when the surfer recognizes',
      'the moment when you recognize'),
    'You will trust that the surfer who walks the path owns the surfing — and the surfer who skips the path is always borrowing it.',
    'You will trust that you, walking the path, own your surfing — while those who skip it are always borrowing it.')
where id = 'BB-ONB-01';

-- BB-EXIT-01 (Exit Test) — make the self-administered framing explicit
update lessons set description_md =
  replace(description_md, 'How to administer the test:', 'How you run your self-test:')
where id = 'BB-EXIT-01';
