-- Camp corto (Rick por Marcelo, 2026-09-24)
-- Inscribir a alguien por 3 o 4 días de un camp de 6, y alargarlo si se queda.
--
-- planned_departure = el último día CONTRATADO. Null = hace el camp completo,
-- que es el caso normal y no cambia nada de lo que ya existe.
--
-- Convive con departed_on (el día que REALMENTE se fue, que ya existía): si
-- están las dos, manda la más temprana. La regla vive en una sola función,
-- participantPresentOn() en src/lib/utils/camp-window.ts, que usan todas las
-- pantallas de "quién está hoy".
--
-- NO se toca el cupo ni la plata: quien reserva 3 días ocupa su lugar y paga.

alter table camp_participants
  add column if not exists planned_departure date;

comment on column camp_participants.planned_departure is
  'Último día contratado del camp. Null = camp completo. Manda la más temprana entre esta y departed_on.';

-- Buscar "quién está el día X" filtra por esta columna en varias pantallas.
create index if not exists camp_participants_planned_departure_idx
  on camp_participants (camp_instance_id, planned_departure)
  where planned_departure is not null;
