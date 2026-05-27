-- M75 — Extend content_videos.media_type to accept 'document'.
--
-- Today: 'video' | 'image' | 'diagram' (M64). Now: + 'document' so the
-- admin can attach PowerPoint, PDF, Google Slides, DOCX, KeyNote etc.
-- The Drive /preview iframe renders any file natively — this is just a
-- labelling/UX type so the UI knows what icon/thumbnail to show.
-- Existing rows untouched; CHECK only adds the new value.

ALTER TABLE content_videos
  DROP CONSTRAINT IF EXISTS content_videos_media_type_check;

ALTER TABLE content_videos
  ADD CONSTRAINT content_videos_media_type_check
    CHECK (media_type IN ('video','image','diagram','document'));
