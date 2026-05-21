-- M59 — Track whether a coach has finished the set-password handshake.
-- Used by /auth/callback to decide whether to route them through
-- /set-password (no password yet) or straight to /dashboard.

ALTER TABLE coaches ADD COLUMN IF NOT EXISTS password_set_at TIMESTAMPTZ;

-- Best-effort backfill: any coach who has logged in at least once is
-- assumed to have a password (they wouldn't have made it past /login).
UPDATE coaches c
SET password_set_at = au.last_sign_in_at
FROM auth.users au
WHERE au.id = c.auth_user_id
  AND au.last_sign_in_at IS NOT NULL
  AND c.password_set_at IS NULL;
