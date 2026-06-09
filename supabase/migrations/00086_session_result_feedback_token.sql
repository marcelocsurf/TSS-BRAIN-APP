-- M86 — Standalone feedback token per session result.
--
-- For Lead students (no course access) we want to send them a survey
-- link that does NOT expose the full portal. The new feedback_token is
-- a per-session UUID embedded in the email link. The /feedback/[token]
-- page validates it server-side, lets them submit once, then shows a
-- thank-you. No portal nav, no other tabs, no portal_token exposure.
--
-- Already applied to production via MCP — this file is canonical.

ALTER TABLE student_session_results
  ADD COLUMN IF NOT EXISTS feedback_token UUID UNIQUE DEFAULT gen_random_uuid();

UPDATE student_session_results
SET feedback_token = gen_random_uuid()
WHERE feedback_token IS NULL;

CREATE INDEX IF NOT EXISTS idx_session_results_feedback_token
  ON student_session_results(feedback_token);
