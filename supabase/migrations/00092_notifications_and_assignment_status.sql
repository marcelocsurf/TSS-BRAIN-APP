-- M92 — In-app notifications + head-coach assignment accept/reject.
-- When a coordinator assigns a head coach to a service, the coach gets a
-- notification + email and must Accept or Reject. The coordinator is
-- notified back either way.

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  metadata JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON notifications(recipient_coach_id, read_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select ON notifications;
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (
    current_coach_is_platform_admin()
    OR recipient_coach_id = (SELECT id FROM coaches WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS notifications_write ON notifications;
CREATE POLICY notifications_write ON notifications
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE camp_instances
  ADD COLUMN IF NOT EXISTS head_coach_status TEXT,
  ADD COLUMN IF NOT EXISTS head_coach_responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS head_coach_response_note TEXT,
  ADD COLUMN IF NOT EXISTS head_coach_assigned_by UUID REFERENCES coaches(id) ON DELETE SET NULL;

UPDATE camp_instances
  SET head_coach_status = 'accepted'
  WHERE head_coach_id IS NOT NULL AND head_coach_status IS NULL;
