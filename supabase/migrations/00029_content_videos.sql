-- 00029 — Content Videos (multi-video per lesson / drill / mission)
--
-- Replaces the singular `lessons.video_url` model with a flexible table that:
--   - Allows MULTIPLE videos per lesson (intro, demo, common errors,
--     alumno-friendly summary — whatever Marcelo wants)
--   - Allows videos on drills/missions too (drills_missions had no video
--     field at all before)
--   - Stores a label per video so the student sees "▶ Demo · 0:45",
--     "▶ Common mistakes · 1:20", etc.
--
-- Polymorphic FK: each row points to EITHER a lesson OR a drill_mission,
-- never both. Enforced by a CHECK constraint.
--
-- The legacy `lessons.video_url` column stays in place (unused by code)
-- so we don't have to drop it; if Marcelo wants to backfill old data
-- into this table later he can.

BEGIN;

CREATE TABLE IF NOT EXISTS content_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  drill_mission_id TEXT REFERENCES drills_missions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  label TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT content_videos_one_parent CHECK (
    (lesson_id IS NOT NULL AND drill_mission_id IS NULL) OR
    (lesson_id IS NULL AND drill_mission_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_content_videos_lesson
  ON content_videos(lesson_id, display_order)
  WHERE lesson_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_videos_drill_mission
  ON content_videos(drill_mission_id, display_order)
  WHERE drill_mission_id IS NOT NULL;

-- Auto-update updated_at on edits
CREATE OR REPLACE FUNCTION update_content_videos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_videos_timestamp ON content_videos;
CREATE TRIGGER content_videos_timestamp
  BEFORE UPDATE ON content_videos
  FOR EACH ROW EXECUTE FUNCTION update_content_videos_timestamp();

ALTER TABLE content_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS content_videos_all ON content_videos;
CREATE POLICY content_videos_all ON content_videos FOR ALL USING (true);

COMMIT;
