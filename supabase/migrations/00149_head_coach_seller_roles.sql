-- 00149 — Roles nuevos (matriz decidida 2026-07-27):
-- head_coach = autoridad técnica, no administrativa (solo sus servicios, solo
-- lo delegado, sin números de negocio, promueve/valida hasta SU certificación).
-- seller = vendedor formal (portal con pestaña Sell).
ALTER TYPE coach_role ADD VALUE IF NOT EXISTS 'head_coach';
ALTER TYPE coach_role ADD VALUE IF NOT EXISTS 'seller';
