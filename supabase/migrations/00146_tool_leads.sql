-- 00146 — Leads capturados por herramientas públicas (Venue Scout, etc.)
CREATE TABLE IF NOT EXISTS tool_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  tool text NOT NULL DEFAULT 'venue-scout',
  opens integer NOT NULL DEFAULT 1,
  devices integer NOT NULL DEFAULT 1,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  converted_academy_id uuid REFERENCES academies(id),
  converted_at timestamptz,
  UNIQUE (email, tool)
);
ALTER TABLE tool_leads ENABLE ROW LEVEL SECURITY;
