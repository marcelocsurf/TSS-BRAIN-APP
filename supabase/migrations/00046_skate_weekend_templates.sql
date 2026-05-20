-- M45 — Seed Surf Skate + Weekend Camp templates.
--
-- These are the missing canonical services Marcelo asked for. They're
-- inserted as empty templates (no blocks yet) so the Head Coach can
-- come back later and fill the content via /camps/templates/[id]/edit.

INSERT INTO camp_templates
  (id, template_name, level_name, duration_days, modality, capacity_max, is_custom, service_kind, active_status)
VALUES
  ('SVC-SKATE-1',       'Surf Skate 1',          'Beginner',   1, 'individual', 4, false, 'surf_lesson', true),
  ('SVC-SKATE-2',       'Surf Skate 2',          'Novice',     1, 'individual', 4, false, 'surf_lesson', true),
  ('SVC-SKATE-3',       'Surf Skate 3',          'Foundation', 1, 'individual', 4, false, 'surf_lesson', true),
  ('SVC-LESSON-3',      'Surf Lesson 3',         'Foundation', 1, 'individual', 4, false, 'surf_lesson', true),
  ('SVC-WEEKEND-CAMP',  'Weekend Surf Camp',     'Beginner',   6, 'group',      4, false, 'surf_camp',   true)
ON CONFLICT (id) DO NOTHING;
