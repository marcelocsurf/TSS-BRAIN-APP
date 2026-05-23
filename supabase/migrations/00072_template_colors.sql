-- M72 — Move card + accent colors from hardcoded paletteFor() to the
-- template itself. The platform admin now picks both colors when
-- authoring a template; the calendar reads them directly.
--
-- Seed the 6 canonical templates with the colors the calendar shipped
-- with (so existing camps don't go gray after this deploy).
-- After this migration, paletteFor() returns gray-100 when a template
-- has no overrides — so any new template created without colors will
-- look neutral until the admin sets one.

ALTER TABLE camp_templates
  ADD COLUMN IF NOT EXISTS card_color   TEXT,
  ADD COLUMN IF NOT EXISTS accent_color TEXT;

COMMENT ON COLUMN camp_templates.card_color   IS 'Hex card background, e.g. #00F0FF. NULL → neutral default.';
COMMENT ON COLUMN camp_templates.accent_color IS 'Hex left-edge accent, optional.';

-- Seed canonical templates with the colors the previous palette mapped.
UPDATE camp_templates SET card_color = '#FFFFFF', accent_color = '#E5E7EB'
  WHERE id = 'SVC-CAMP-BEG'   AND card_color IS NULL;
UPDATE camp_templates SET card_color = '#FFFC00', accent_color = '#F5C518'
  WHERE id = 'SVC-CAMP-NOV'   AND card_color IS NULL;
UPDATE camp_templates SET card_color = '#1E6FBF', accent_color = '#1E40AF'
  WHERE id = 'SVC-CAMP-FOUND' AND card_color IS NULL;
UPDATE camp_templates SET card_color = '#EC4899', accent_color = '#DB2777'
  WHERE id IN ('SVC-SL1', 'SVC-SL2') AND card_color IS NULL;
UPDATE camp_templates SET card_color = '#F3F4F6', accent_color = '#9CA3AF'
  WHERE id = 'SVC-CUSTOM'     AND card_color IS NULL;
