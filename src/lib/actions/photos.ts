'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Upload a profile photo for a student or coach.
 * Stores the file in Supabase Storage (`avatars` bucket) and updates the
 * corresponding row's `photo_url` column.
 *
 * Returns the public URL of the uploaded image.
 */
export async function uploadProfilePhoto(
  entityType: 'student' | 'coach',
  entityId: string,
  formData: FormData
): Promise<string> {
  const file = formData.get('file') as File | null;
  if (!file || !(file instanceof File)) {
    throw new Error('No file provided.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be under 5 MB.');
  }

  const supabase = await createClient();

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${entityType}s/${entityId}.${ext}`;

  // Convert File to ArrayBuffer for server-side upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadErr } = await supabase.storage
    .from('avatars')
    .upload(path, buffer, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadErr) throw new Error(uploadErr.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  const freshUrl = `${publicUrl}?t=${Date.now()}`;

  const table = entityType === 'student' ? 'students' : 'coaches';
  const { error: updateErr } = await supabase
    .from(table)
    .update({ photo_url: freshUrl })
    .eq('id', entityId);

  if (updateErr) throw new Error(updateErr.message);

  return freshUrl;
}

/**
 * Remove the profile photo for a student or coach.
 * Sets photo_url to null but does NOT delete the file from Storage
 * (to avoid accidental permanent data loss).
 */
export async function removeProfilePhoto(
  entityType: 'student' | 'coach',
  entityId: string
): Promise<void> {
  const supabase = await createClient();

  const table = entityType === 'student' ? 'students' : 'coaches';
  const { error } = await supabase
    .from(table)
    .update({ photo_url: null })
    .eq('id', entityId);

  if (error) throw new Error(error.message);
}
