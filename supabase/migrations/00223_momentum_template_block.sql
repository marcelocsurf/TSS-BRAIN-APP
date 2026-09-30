-- ═══ Forward Momentum · el bloque de la plantilla White v2 y la misión suelta del momento 3 ═══
-- Completa la 00222 (revisión 2026-09-30). El bloque del día 3 ya era la
-- herramienta (TOOL-MOMENTUM) pero seguía con el foco STP-019, la misión
-- "Momentum When the Board Slows" sola y el rótulo del círculo. Marcelo: el
-- momento 3 va SOLO dentro de la misión completa → el bloque receta la completa
-- y esa misión suelta se apaga (nadie la registró nunca: 0 filas en sesiones,
-- planes, evaluaciones). Respaldos: ops.camp_template_blocks_backup_2026_09_30_momentum
-- y ops.drills_missions_backup_2026_09_30_momentum (tomados antes de la 00222).

update public.camp_template_blocks set
  focus_step_id = null,
  focus_moments = null,
  mission_id = 'MIS-WB-019-A',
  pilar_part = 'Tools · Forward Momentum · all three moments',
  evaluation_focus = 'All three moments on one wave: right after the pop-up · after your maneuver · whenever the board loses speed or gets stuck.'
where id = 'SVC-CAMP-WB-V2-D3-B07' and sequence_id = 'TOOL-MOMENTUM';

update public.drills_missions set active = false, updated_at = now()
where id = 'MIS-WB-019' and active;

do $check$
begin
  if exists (select 1 from public.camp_template_blocks where id = 'SVC-CAMP-WB-V2-D3-B07' and (mission_id <> 'MIS-WB-019-A' or focus_step_id is not null)) then
    raise exception 'el bloque D3-B07 no quedó con la misión completa';
  end if;
  if exists (select 1 from public.drills_missions where id = 'MIS-WB-019' and active) then
    raise exception 'MIS-WB-019 sigue activa';
  end if;
end
$check$;
