-- M99 — Drop the legacy one-parent CHECK on content_videos. M77 added a new
-- 4-way constraint (including template_day_id) but the old 3-way constraint
-- was never dropped, so inserting per-template-day support material violated
-- the stale constraint (0 parents among lesson/drill/step) and threw.
ALTER TABLE content_videos DROP CONSTRAINT IF EXISTS content_videos_one_parent;
