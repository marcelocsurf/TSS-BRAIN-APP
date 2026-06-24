-- Let's Play groups the sequence by block_number and labels each block with the
-- block_name of its items. A few drills had an EMPTY block_name while their
-- siblings (same belt + block_number) carried the real name — so a block could
-- render with a blank header. Fill those empties from a non-empty sibling.
--
-- This only PROPAGATES an existing canonical name within the same block; it
-- never invents a name. Rows with a null block_number (e.g. the Yellow drill
-- set, which has no block model yet) are intentionally left untouched.
update drills_missions d
set block_name = s.block_name
from (
  select belt, block_number, min(block_name) as block_name
  from drills_missions
  where block_number is not null and coalesce(block_name,'') <> ''
  group by belt, block_number
) s
where d.belt = s.belt
  and d.block_number = s.block_number
  and coalesce(d.block_name,'') = '';
