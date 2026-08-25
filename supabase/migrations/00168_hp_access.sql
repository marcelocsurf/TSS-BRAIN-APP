-- ═══ HIGH PERFORMANCE ACCESS ═══
-- Decisión de Marcelo (2026-08-25): ser atleta de alto rendimiento no se
-- adivina por los datos — se OTORGA. Con el acceso encendido, el alumno ve
-- todo su año (temporada, programa, citas, competencias, score) y puede
-- cargar sus competencias; su coach le puede agregar citas y programas.
-- Sin acceso, nada de eso existe en su portal.
--
-- Por qué un permiso explícito y no una heurística: hoy hay 2.786 alumnos
-- activos y solo 21 con algún dato de alto rendimiento. Cualquier heurística
-- fallaba por los dos lados — 4 personas veían tarjetas vacías por tener una
-- ficha HP creada de paso, y "tener temporada" habría escondido el año a 20
-- atletas reales (solo 1 tiene season_plan cargado).

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS hp_access BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hp_access_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hp_access_granted_by UUID REFERENCES coaches(id) ON DELETE SET NULL;

COMMENT ON COLUMN students.hp_access IS
  'Acceso de Alto Rendimiento: enciende el año completo en el portal del alumno (temporada, programa, citas, competencias, score por pilar). Se otorga a mano desde la ficha; no se deduce de los datos.';

-- Respaldo: quien YA tiene vida de alto rendimiento conserva lo que ve hoy.
-- Solo dato real — una ficha hp_athlete_profiles vacía NO cuenta (es lo que
-- causaba las tarjetas vacías).
UPDATE students s
   SET hp_access = true,
       hp_access_granted_at = now()
 WHERE s.hp_access = false
   AND (
     EXISTS (SELECT 1 FROM program_assignments  x WHERE x.student_id = s.id)
  OR EXISTS (SELECT 1 FROM season_plans         x WHERE x.student_id = s.id)
  OR EXISTS (SELECT 1 FROM athlete_competitions x WHERE x.student_id = s.id)
  OR EXISTS (SELECT 1 FROM program_appointments x WHERE x.student_id = s.id)
  OR EXISTS (SELECT 1 FROM hp_deep_evaluations  x WHERE x.student_id = s.id)
   );

-- El portal filtra por acceso en cada carga del Home.
CREATE INDEX IF NOT EXISTS idx_students_hp_access ON students (hp_access) WHERE hp_access = true;
