-- Make the Blue Belt Foundation Camp usable + retire the legacy generic one.

-- 1) Pre-assign SVC-CAMP-FOUND-BB to the academies that already run the Yellow
--    (Novice) camp, so it is immediately available to coordinators there.
insert into academy_template_assignments (academy_id, template_id)
select distinct a.academy_id, 'SVC-CAMP-FOUND-BB'
from academy_template_assignments a
where a.template_id = 'SVC-CAMP-NOV'
on conflict do nothing;

-- 2) Retire the legacy generic "Surf Camp Foundation" (SVC-CAMP-FOUND). It held
--    duplicated test days + in-use test camp instances (camp_sessions FK), so we
--    DEACTIVATE rather than hard-delete to preserve referential integrity and
--    instance history. active_status=false removes it from every template list.
update camp_templates set active_status = false where id = 'SVC-CAMP-FOUND';
