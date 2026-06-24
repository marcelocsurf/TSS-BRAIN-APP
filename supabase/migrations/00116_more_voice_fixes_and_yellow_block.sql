-- More book-to-student voice fixes (same family as 00115) + Yellow block header.
--
-- Voice: convert the remaining genuine second-person slips that address the
-- student's own journey. NOTE: the many other "the surfer" mentions in the
-- pre-course / belt-value content are INTENTIONALLY left alone — they are
-- generic canonical usage (e.g. "the surfer closest to the peak has priority",
-- glossary "where the surfer stands", belt-value archetypes) where third person
-- is correct.

update lessons set description_md = replace(description_md,
  'the moment when the surfer begins to understand',
  'the moment when you begin to understand') where id = 'YB-ONB-01';

update lessons set description_md = replace(description_md,
  'should accompany the surfer for life',
  'should accompany you for life') where id = 'VAL-002';

update lessons set description_md = replace(description_md,
  'looking where the surfer wants to go',
  'looking where you want to go') where id in ('STP-021','STP-022');

-- Yellow Belt: the active drill set (DRL-YB/MIS-YB) had no block_number/name, so
-- Let's Play rendered all 8 Yellow steps under one BLANK block header. Give that
-- block a factual belt label so nothing renders blank. This is a heading only —
-- NOT an invented methodology/block model; the real YB block structure can
-- replace it when provided.
update drills_missions set block_number = 1, block_name = 'Yellow Belt'
where belt = 'yellow' and active and (block_number is null or coalesce(block_name,'') = '');
