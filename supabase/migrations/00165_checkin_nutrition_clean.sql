-- 00165: check-in — alimentación como pregunta cerrada (pedido Marcelo 2026-08-25)
-- "¿Comiste limpio / seguiste tu plan?" si | parcial | no, en vez del texto
-- libre "What did you eat today?". El texto viejo (program_checkins.nutrition)
-- queda como histórico legible para el staff; el ranking puntúa el nuevo
-- (si +15 · parcial +8 · no 0) con fallback al legacy (texto no vacío = +15).
ALTER TABLE program_checkins ADD COLUMN IF NOT EXISTS nutrition_clean TEXT
  CHECK (nutrition_clean IN ('si','parcial','no'));
