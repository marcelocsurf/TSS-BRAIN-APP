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
import { MODEL_BELTS, BELT_LEVEL_OF, beltOf, sequenceOf } from '@/lib/constants/model-categories';

const BUCKET = 'tss-library';

export type ModelClipRow = {
  id: string;
  category: string;
  belt?: string | null;
  sequence_number?: string | null;
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

// Agrupado por CINTA (lista cerrada, en orden del canon) y dentro de cada
// cinta por SECUENCIA. Un clip sin secuencia queda suelto arriba, bajo su
// cinta. Los clips viejos se ubican por su categoría vieja aunque todavía no
// tengan la columna `belt` — la biblioteca sale ordenada desde ya.
export async function getModelClips(): Promise<ModelCategoryGrouped[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('model_clips')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return [];                       // invariante #2: nunca lanzar
  const rows = (data ?? []) as ModelClipRow[];

  const out: ModelCategoryGrouped[] = [];
  for (const belt of MODEL_BELTS) {
    const mine = rows.filter((r) => beltOf(r) === belt.slug);
    if (mine.length === 0) continue;

    const loose = mine.filter((r) => !sequenceOf(r));
    if (loose.length > 0) {
      out.push({
        id: belt.slug,
        name: belt.name,
        clips: loose.map((r) => ({ id: r.id, title: r.title, src: r.video_url, description: r.description })),
      });
    }
    // Las secuencias, en orden numérico.
    const seqs = [...new Set(mine.map((r) => sequenceOf(r)).filter(Boolean) as string[])]
      .sort((a, b) => (Number(a) || 99) - (Number(b) || 99));
    for (const sq of seqs) {
      out.push({
        id: `${belt.slug}-seq-${sq}`,
        name: `${belt.name} · Sequence #${sq}`,
        clips: mine
          .filter((r) => sequenceOf(r) === sq)
          .map((r) => ({ id: r.id, title: r.title, src: r.video_url, description: r.description })),
      });
    }
  }
  return out;
}

// Las secuencias reales de una cinta, leídas de la MISMA tabla que usa el
// resto de la app: la biblioteca no puede desincronizarse del canon.
export async function getBeltSequences(beltSlug: string): Promise<string[]> {
  const level = BELT_LEVEL_OF[beltSlug];
  if (!level) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('sequences')
    .select('sequence_number')
    .eq('belt_level', level);
  if (error) return [];
  const nums = [...new Set((data ?? []).map((r: any) => String(r.sequence_number)))];
  return nums
    .filter((n) => /^[0-9.]+$/.test(n))          // fuera "Transition", "Requirements"
    .sort((a, b) => Number(a) - Number(b));
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

// Ya NO se aceptan categorías escritas a mano: solo cintas de la lista
// cerrada. Eso es lo que impide que vuelvan a existir tres formas de escribir
// "blue belt a purple belt".
function resolveCategory(slug: string): { category: string; categoryName: string } | null {
  const belt = MODEL_BELTS.find((c) => c.slug === slug);
  return belt ? { category: belt.slug, categoryName: belt.name } : null;
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

  const cat = resolveCategory(slug);
  if (!cat) return { ok: false, error: 'Elegí la cinta.' };

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

// EDITAR un clip ya subido (pedido de Marcelo 2026-08-25: "no me deja
// editar si quiero reclasificarlos o cambiarles nombre"). Hasta ahora solo
// existían create y delete: corregir un typo o mover un clip de categoría
// obligaba a borrarlo y volver a subir el video entero.
// El archivo NO se toca — solo los metadatos.
export async function updateModelClip(
  id: string,
  patch: { title?: string; description?: string | null; category?: string; sequence?: string | null; displayOrder?: number },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) return { ok: false, error: 'Not authorized' };

  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) return { ok: false, error: 'Title is required.' };
    row.title = t.slice(0, 300);
  }
  if (patch.description !== undefined) row.description = patch.description?.trim().slice(0, 1000) || null;
  if (patch.displayOrder !== undefined) {
    if (!Number.isFinite(patch.displayOrder)) return { ok: false, error: 'Invalid order.' };
    row.display_order = Math.max(0, Math.round(patch.displayOrder));
  }
  // Reclasificar: cinta de la lista cerrada + secuencia opcional. Marcelo
  // puede mover cualquier clip en dos toques, que era el punto — dijo "la
  // verdad no sé" sobre dónde va cada uno, así que lo caro no puede ser
  // cambiarlo de lugar.
  if (patch.category !== undefined) {
    const resolved = resolveCategory(patch.category);
    if (!resolved) return { ok: false, error: 'Elegí la cinta.' };
    row.category = resolved.category;
    row.category_name = resolved.categoryName;
    row.belt = resolved.category;
  }
  if (patch.sequence !== undefined) {
    const sq = (patch.sequence ?? '').trim();
    row.sequence_number = sq === '' ? null : sq;
  }
  if (Object.keys(row).length === 0) return { ok: false, error: 'Nothing to update.' };

  const admin = createAdminClient();
  const { error } = await admin.from('model_clips').update(row).eq('id', id);
  if (error) return { ok: false, error: error.message };

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
