-- M77 — Per-day support media on camp templates.
--
-- Adds a 4th permitted parent to content_videos: template_day_id. Lets the
-- admin attach a PPT/PDF/video to a specific day of a camp template
-- (e.g. SVC-CAMP-BEG Day 3 → 6-slide Drive deck + 2 videos). The coach
-- sees the strip inside the day card in CampPlanReader, and opens each
-- asset in the existing StpMediaGrid lightbox.
--
-- Reuses everything already in place:
--   - media_type = 'document' (M75)
--   - documentEmbedUrl helper for Drive /preview + Google Slides /embed
--   - ContentVideoManager admin UI
--   - StpMediaGrid lightbox

ALTER TABLE content_videos
  ADD COLUMN IF NOT EXISTS template_day_id TEXT
    REFERENCES camp_template_days(id) ON DELETE CASCADE;

-- Extend the one-parent CHECK to accept template_day_id as the 4th option.
ALTER TABLE content_videos
  DROP CONSTRAINT IF EXISTS content_videos_one_parent_chk;

ALTER TABLE content_videos
  ADD CONSTRAINT content_videos_one_parent_chk CHECK (
    (lesson_id IS NOT NULL)::int +
    (drill_mission_id IS NOT NULL)::int +
    (step_id IS NOT NULL)::int +
    (template_day_id IS NOT NULL)::int = 1
  );

CREATE INDEX IF NOT EXISTS idx_content_videos_template_day
  ON content_videos(template_day_id)
  WHERE template_day_id IS NOT NULL;
