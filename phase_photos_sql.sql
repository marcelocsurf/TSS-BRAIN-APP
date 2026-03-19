-- Phase: Profile Photo Support
-- Add photo_url column to coaches table if it doesn't exist
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS photo_url text;
