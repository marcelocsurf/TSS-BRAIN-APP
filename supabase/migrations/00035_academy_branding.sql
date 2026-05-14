-- 00035 — Per-academy branding
--
-- Each academy can override 4 brand parameters used in their portals:
--   logo_url       — image (PNG/SVG) URL shown in top bar / hero
--   primary_color  — header bg + primary CTAs (defaults to TSS navy)
--   accent_color   — accents + hover (defaults to TSS gold)
--   tagline        — small italic line under the academy name
--
-- The render layer picks academy values first, falls back to TSS defaults
-- when NULL. This means existing academies are unaffected until someone
-- explicitly sets them. NOT a full theme system — just 4 knobs for v1.

BEGIN;

ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS logo_url      TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT CHECK (primary_color IS NULL OR primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  ADD COLUMN IF NOT EXISTS accent_color  TEXT CHECK (accent_color  IS NULL OR accent_color  ~ '^#[0-9A-Fa-f]{6}$'),
  ADD COLUMN IF NOT EXISTS tagline       TEXT;

COMMIT;
