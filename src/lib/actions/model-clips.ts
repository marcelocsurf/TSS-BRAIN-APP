'use server';

// TSS Video Analyzer model library — admin-managed.
// Clips live in the public `tss-library` Supabase Storage bucket; metadata in
// the `model_clips` table. The analyzer reads grouped categories; the admin
// uploader adds/removes clips. Service-role (admin client) bypasses RLS for
// writes; reads are public.

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from './auth';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { MODEL_CATEGORIES } from '@/lib/constants/model-categories';

const BUCKET = 'tss-library';

export type ModelClipRow = {
  id: string;
  category: string;
  category_name: string;
  title: string;
  video_url: string;
  storage_path: string | null;
  display_order: number;
};

export type ModelCategoryGrouped = {
  id: string;
  name: string;
  clips: { id: string; title: string; src: string }[];
};

// Grouped by category, in MODEL_CATEGORIES order — shape the analyzer expects.
export async function getModelClips(): Promise<ModelCategoryGrouped[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('model_clips')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  const rows = (data ?? []) as ModelClipRow[];

  return MODEL_CATEGORIES.map((cat) => ({
    id: cat.slug,
    name: cat.name,
    clips: rows
      .filter((r) => r.category === cat.slug)
      .map((r) => ({ id: r.id, title: r.title, src: r.video_url })),
  })).filter((c) => c.clips.length > 0);
}

// Flat list for the admin manager (so empty categories are still visible there).
export async function listModelClips(): Promise<ModelClipRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('model_clips')
    .select('*')
    .order('category')
    .order('display_order');
  return (data ?? []) as ModelClipRow[];
}

export async function addModelClip(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) return { ok: false, error: 'Not authorized' };

  const category = String(formData.get('category') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const file = formData.get('file') as File | null;

  const cat = MODEL_CATEGORIES.find((c) => c.slug === category);
  if (!cat) return { ok: false, error: 'Pick a category.' };
  if (!title) return { ok: false, error: 'Title is required.' };
  if (!file || file.size === 0) return { ok: false, error: 'Choose a video file.' };

  const admin = createAdminClient();
  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
  const path = `${category}/${randomUUID()}.${ext}`;

  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || 'video/mp4', upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);

  const { error: insErr } = await admin.from('model_clips').insert({
    category,
    category_name: cat.name,
    title,
    video_url: pub.publicUrl,
    storage_path: path,
  });
  if (insErr) {
    // best-effort cleanup of the orphaned upload
    await admin.storage.from(BUCKET).remove([path]).catch(() => {});
    return { ok: false, error: insErr.message };
  }

  revalidatePath('/admin/video-library');
  return { ok: true };
}

export async function deleteModelClip(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) return { ok: false, error: 'Not authorized' };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from('model_clips')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (row?.storage_path) {
    await admin.storage.from(BUCKET).remove([row.storage_path]).catch(() => {});
  }
  const { error } = await admin.from('model_clips').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/video-library');
  return { ok: true };
}
