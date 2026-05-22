-- M64 — Extend content_videos to support images + diagrams and direct
-- linkage to a step (STP). Lets the coach portal Tools tab show visual
-- aids per STP without going through a lesson or drill row.
--
-- Backwards compatible: existing rows keep media_type='video' (default)
-- and their lesson_id / drill_mission_id link.

ALTER TABLE content_videos
  ADD COLUMN IF NOT EXISTS step_id TEXT REFERENCES lessons(id),
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'video'
    CHECK (media_type IN ('video','image','diagram')),
  ADD COLUMN IF NOT EXISTS caption TEXT;

-- Replace the one-parent constraint to include the new step_id path.
ALTER TABLE content_videos DROP CONSTRAINT IF EXISTS content_videos_one_parent;
ALTER TABLE content_videos ADD CONSTRAINT content_videos_one_parent
  CHECK (
    (lesson_id IS NOT NULL)::int +
    (drill_mission_id IS NOT NULL)::int +
    (step_id IS NOT NULL)::int = 1
  );

CREATE INDEX IF NOT EXISTS idx_content_videos_step
  ON content_videos(step_id)
  WHERE step_id IS NOT NULL;
