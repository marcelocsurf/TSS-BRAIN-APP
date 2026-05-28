-- M78 — Activity-based template editor.
--
-- Re-architects `camp_template_blocks` from "Mission Block + side-fields"
-- into a typed Activity model. Each block now has a `block_type` value
-- from a richer taxonomy (water_mission · land_drill · warm_up ·
-- venue_analysis · mental · get_in_stp · theory · evaluation ·
-- free_practice · custom). The form layout in TemplateBuilderForm
-- adapts to the type.
--
-- Additive only — no data migration. Existing blocks with
-- block_type='mission' render as "Water Mission" (legacy mapping)
-- without losing any field. Admin can re-pick the type per block in
-- the editor when it makes sense.

ALTER TABLE camp_template_blocks
  ADD COLUMN IF NOT EXISTS explain_md       TEXT,
  ADD COLUMN IF NOT EXISTS demonstrate_md   TEXT,
  ADD COLUMN IF NOT EXISTS simulate_md      TEXT,
  ADD COLUMN IF NOT EXISTS feedback_md      TEXT,
  ADD COLUMN IF NOT EXISTS equipment        TEXT,
  ADD COLUMN IF NOT EXISTS activity_subtype TEXT,
  ADD COLUMN IF NOT EXISTS step_ids         TEXT[];

-- Note: block_type stays TEXT. No enum constraint here so we can keep
-- iterating on the taxonomy without ALTER TYPE acrobatics. The UI is
-- the source of truth for valid values; unknown values render as
-- "Custom" so we never break a saved template.
