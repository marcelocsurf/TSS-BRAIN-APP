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
  description: string | null;
  video_url: string;
  storage_path: string | null;
  display_order: number;
};

export type ModelCategoryGrouped = {
  id: string;
  name: string;
  clips: { id: string; title: string; src: string; description?: string | null }[];
};

// Grouped by category: the fixed MODEL_CATEGORIES first (in order), then any
// custom categories (e.g. "Secuencia 4") in the order they appear.
export async function getModelClips(): Promise<ModelCategoryGrouped[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('model_clips')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  const rows = (data ?? []) as ModelClipRow[];

  // Ordered list of category slugs: fixed ones first, then custom ones found.
  const order: { slug: string; name: string }[] = [...MODEL_CATEGORIES];
  for (const r of rows) {
    if (!order.some((c) => c.slug === r.category)) {
      order.push({ slug: r.category, name: r.category_name });
    }
  }

  return order
    .map((cat) => ({
      id: cat.slug,
      name: cat.name,
      clips: rows
        .filter((r) => r.category === cat.slug)
        .map((r) => ({ id: r.id, title: r.title, src: r.video_url, description: r.description })),
    }))
    .filter((c) => c.clips.length > 0);
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

// Resolve a (slug, display name) pair from either a fixed category slug or a
// custom typed name.
function resolveCategory(slug: string, customName: string): { category: string; categoryName: string } | null {
  const fixed = MODEL_CATEGORIES.find((c) => c.slug === slug);
  if (fixed) return { category: fixed.slug, categoryName: fixed.name };
  const raw = (customName || slug).trim();
  if (!raw) return null;
  const s = raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s ? { category: s, categoryName: raw } : null;
}

// Step 1 — admin asks for a signed upload URL. The browser then uploads the
// (large) video directly to Storage, bypassing the server-action / Vercel
// request-size limit that makes file-through-action uploads fail.
export async function createModelUploadUrl(
  slug: string,
  customName: string,
  ext: string,
): Promise<
  | { ok: true; path: string; token: string; category: string; categoryName: string }
  | { ok: false; error: string }
> {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) return { ok: false, error: 'Not authorized' };

  const cat = resolveCategory(slug, customName);
  if (!cat) return { ok: false, error: 'Pick or name a category.' };

  const safeExt = (ext || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
  const path = `${cat.category}/${randomUUID()}.${safeExt}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not start upload.' };

  return { ok: true, path: data.path, token: data.token, category: cat.category, categoryName: cat.categoryName };
}

// Step 2 — after the browser finished uploading, record the clip row.
export async function finalizeModelClip(input: {
  category: string;
  categoryName: string;
  title: string;
  description?: string;
  path: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) return { ok: false, error: 'Not authorized' };

  const title = input.title.trim();
  if (!title) return { ok: false, error: 'Title is required.' };
  if (!input.path) return { ok: false, error: 'Upload missing.' };

  const admin = createAdminClient();
  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(input.path);

  const { error: insErr } = await admin.from('model_clips').insert({
    category: input.category,
    category_name: input.categoryName,
    title,
    description: input.description?.trim() || null,
    video_url: pub.publicUrl,
    storage_path: input.path,
  });
  if (insErr) {
    await admin.storage.from(BUCKET).remove([input.path]).catch(() => {});
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
