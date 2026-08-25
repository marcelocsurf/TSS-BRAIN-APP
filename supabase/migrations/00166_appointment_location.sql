-- 00166: LUGAR en las citas (pedido Marcelo 2026-08-25: "en citas también
-- revisá, le falta lugar"). mode ya decía online/presencial, pero una cita
-- presencial sin lugar deja al atleta sin saber A DÓNDE ir.
ALTER TABLE program_appointments ADD COLUMN IF NOT EXISTS location TEXT;
