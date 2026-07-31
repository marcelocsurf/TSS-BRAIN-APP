-- 00153 — Rol host ("Servicio al cliente"): ventas + atención al huésped.
-- Ve y cobra las clases del día, vende cupos, persigue fichas incompletas
-- y consulta la bitácora del alumno. NO asigna coaches ni ve costos.
ALTER TYPE coach_role ADD VALUE IF NOT EXISTS 'host';
