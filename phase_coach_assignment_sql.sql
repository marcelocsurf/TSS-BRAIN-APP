-- Phase: Explicit Coach Assignment
-- Adds tracking for who assigned the coach to a cascade session.

ALTER TABLE cascade_sessions ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES coaches(id);
ALTER TABLE cascade_sessions ADD COLUMN IF NOT EXISTS assigned_by_name text;
