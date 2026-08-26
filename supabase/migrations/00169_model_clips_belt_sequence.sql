-- ═══ BIBLIOTECA DE MODELOS: CINTA + SECUENCIA ═══
-- Decisión de Marcelo (2026-08-26): "creo que debería ser por cinta y ahí que
-- salga la secuencia". Antes la categoría era texto libre y once clips
-- terminaron en nueve categorías: "blue-belt-and-purple-belt",
-- "blue-belt-purple-belt" y "blue-belt-to-purple-belt" eran lo mismo escrito
-- tres veces, más dos con errores de tipeo ("whoite", "betl") y una llamada
-- "prueba". Con lista cerrada eso no puede volver a pasar.
--
-- El código ya agrupa bien sin estas columnas (mapea las categorías viejas),
-- así que aplicar esto NO es urgente y no rompe nada si se aplica después.

ALTER TABLE model_clips
  ADD COLUMN IF NOT EXISTS belt TEXT,
  ADD COLUMN IF NOT EXISTS sequence_number TEXT;

COMMENT ON COLUMN model_clips.belt IS
  'Cinta del modelo: all | white | yellow | blue | purple | brown | black. Lista cerrada.';
COMMENT ON COLUMN model_clips.sequence_number IS
  'Secuencia dentro de la cinta (misma fuente que la tabla sequences). NULL = suelto bajo su cinta.';

UPDATE model_clips SET belt = 'all'    WHERE category = 'all-levels';
UPDATE model_clips SET belt = 'white'  WHERE category = 'from-whoite-belt-to-blue-belt';
UPDATE model_clips SET belt = 'white', sequence_number = '2' WHERE category = 'white-belt-sequence-2';
UPDATE model_clips SET belt = 'yellow' WHERE category = 'white-belt-and-yellow-betl-foam-board-little-green-wave';
UPDATE model_clips SET belt = 'blue'   WHERE category = 'yellow-belt-to-blue-belt';
UPDATE model_clips SET belt = 'purple' WHERE category IN
  ('blue-belt-and-purple-belt','blue-belt-purple-belt','blue-belt-to-purple-belt');

-- El clip de prueba: Marcelo pidió borrarlo. El archivo del bucket se borra
-- aparte desde el panel de admin.
DELETE FROM model_clips WHERE category = 'prueba';

-- Nada puede quedar sin cinta: si aparece algo raro, cae en "all" y sigue
-- visible para el coach en vez de desaparecer.
UPDATE model_clips SET belt = 'all' WHERE belt IS NULL;
