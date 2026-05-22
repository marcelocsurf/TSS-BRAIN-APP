-- M63 — Replace Roman numerals in user-visible lesson content with
-- Arabic equivalents. Marcelo's preference: no Roman numerals anywhere.
--
-- Single known instance: PC-010 (Currents & Rip Canon) referenced
-- "Safety Canon v2.0 (Part II — Emergency Protocols)" in its
-- description_md References section. Switch to "Part 2".

UPDATE lessons
SET description_md = REPLACE(description_md, 'Part II — Emergency Protocols', 'Part 2 — Emergency Protocols')
WHERE id = 'PC-010'
  AND description_md LIKE '%Part II — Emergency Protocols%';
