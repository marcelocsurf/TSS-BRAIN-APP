-- 00152 — Video promocional por plantilla de servicio (#video): un link de
-- YouTube/Vimeo que se muestra en la página pública del QR y en el portal
-- del vendedor.
ALTER TABLE camp_templates ADD COLUMN IF NOT EXISTS video_url text;
