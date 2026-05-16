-- 00041 — Coach course access gate
-- Only platform admin can grant a coach access to their portal courses.
-- Defaults to false so new coaches have no access until Marcelo enables it.

ALTER TABLE coaches
  ADD COLUMN IF NOT EXISTS course_access_granted BOOLEAN NOT NULL DEFAULT false;
