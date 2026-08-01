-- 00155 — Un servicio puede esperar asignación de coach (antes NOT NULL
-- forzaba asignar a alguien al crear — todo caía en Marcelo por defecto).
ALTER TABLE camp_instances ALTER COLUMN coach_id DROP NOT NULL;
