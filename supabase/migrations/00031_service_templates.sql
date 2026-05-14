-- 00031 — Service Templates (capacity + Custom)
--
-- M2 of the Services overhaul. Extends `camp_templates` with capacity_max
-- (the "4 espacios" requirement) + service_kind classifier + is_custom
-- flag. Seeds the 6 canonical services Marcelo described: Surf Lesson 1,
-- Surf Lesson 2, Surf Camp Beginner/Novice/Foundation, plus the Custom
-- editable template.
--
-- `camp_instances` gets two override columns (capacity, duration) so a
-- Custom-template instance can be edited per-creation without forking
-- the template.

BEGIN;

ALTER TABLE camp_templates
  ADD COLUMN IF NOT EXISTS capacity_max INT,
  ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_kind TEXT
    CHECK (service_kind IS NULL OR service_kind IN ('surf_lesson', 'surf_camp', 'custom'));

ALTER TABLE camp_instances
  ADD COLUMN IF NOT EXISTS capacity_override INT,
  ADD COLUMN IF NOT EXISTS duration_override INT,
  ADD COLUMN IF NOT EXISTS scheduled_time TEXT;   -- e.g. "09:00 AM" — optional

-- Seed the 6 canonical service templates as GLOBAL (academy_id NULL).
-- Idempotent: ON CONFLICT do nothing.
INSERT INTO camp_templates
  (id, template_name, level_name, duration_days, modality, capacity_max, is_custom, service_kind, active_status, description)
VALUES
  ('SVC-SL1',        'Surf Lesson 1',         'Beginner',   1, 'individual', 4, false, 'surf_lesson', true,
   'Single-day intro lesson. White Belt content. 4 students max per coach.'),
  ('SVC-SL2',        'Surf Lesson 2',         'Novice',     1, 'individual', 4, false, 'surf_lesson', true,
   'Single-day follow-up lesson. Yellow Belt content. 4 students max per coach.'),
  ('SVC-CAMP-BEG',   'Surf Camp Beginner',    'Beginner',   6, 'group',      4, false, 'surf_camp',   true,
   '6-day camp for absolute beginners. White Belt structured sequence.'),
  ('SVC-CAMP-NOV',   'Surf Camp Novice',      'Novice',     6, 'group',      4, false, 'surf_camp',   true,
   '6-day camp for novice surfers. Yellow Belt focus.'),
  ('SVC-CAMP-FOUND', 'Surf Camp Foundation',  'Foundation', 6, 'group',      4, false, 'surf_camp',   true,
   '6-day camp for foundation-level surfers. Blue Belt focus.'),
  ('SVC-CUSTOM',     'Custom Service',        'Custom',     1, 'individual', 1, true,  'custom',      true,
   'Editable on-the-fly. Coordinator overrides name, capacity, duration when opening an instance.')
ON CONFLICT (id) DO UPDATE SET
  capacity_max = EXCLUDED.capacity_max,
  is_custom = EXCLUDED.is_custom,
  service_kind = EXCLUDED.service_kind,
  active_status = EXCLUDED.active_status,
  description = EXCLUDED.description;

-- Backfill any existing templates without service_kind
UPDATE camp_templates
  SET service_kind = 'surf_camp'
  WHERE service_kind IS NULL;

-- Default capacity for any legacy template still NULL
UPDATE camp_templates
  SET capacity_max = 4
  WHERE capacity_max IS NULL;

CREATE INDEX IF NOT EXISTS idx_camp_templates_service_kind ON camp_templates(service_kind, active_status);

COMMIT;
