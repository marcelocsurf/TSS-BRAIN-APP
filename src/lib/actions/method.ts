'use server';

// ═══ EL MÉTODO — cuartel general del negocio ═══
//
// Aprobado por Marcelo 2026-08-30 ("dale"). Dos caras por área:
//   BÓVEDA  — documentos (PDF/imagen subidos al bucket privado method-vault,
//             links externos, notas, o enlaces a coach_resources para NO
//             duplicar lo que ya vive en la biblioteca).
//   GUÍA    — checklist de desarrollo: qué debería existir en el área,
//             con estado y su documento adjunto cuando existe.
//
// Invariante #2: {ok:false,error}, nunca throw (salvo assertOwner, que es
// el patrón assertAdmin de coach-resources). Invariante #3: el gate acá
// adentro ES la seguridad — is_platform_admin SOLO: esto es el negocio
// del dueño, no material de staff.

import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { METHOD_AREA_KEYS } from '@/lib/constants/method';
import { revalidatePath } from 'next/cache';

const BUCKET = 'method-vault';

async function assertOwner() {
  const ok = await isRealPlatformAdmin().catch(() => false);
  if (!ok) throw new Error('Solo el dueño del método.');
}

export interface MethodDoc {
  id: string;
  area: string;
  title: string;
  kind: 'pdf' | 'image' | 'link' | 'note' | 'resource';
  url: string | null;
  notes: string | null;
  resource_id: string | null;
  /** Título del recurso de biblioteca enlazado (kind='resource'). */
  resource_title: string | null;
  created_at: string;
}

export interface MethodTask {
  id: string;
  area: string;
  title: string;
  detail: string | null;
  status: 'pending' | 'in_progress' | 'done';
  doc_id: string | null;
  sort_order: number | null;
  seeded: boolean;
}

export interface MethodHQData {
  docs: MethodDoc[];
  tasks: MethodTask[];
  /** Recursos activos de la biblioteca, para enlazar sin duplicar. */
  libraryResources: { id: string; title: string }[];
}

export async function getMethodHQ(): Promise<
  { ok: true; data: MethodHQData } | { ok: false; error: string }
> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const admin = createAdminClient();
  const [{ data: docs, error: dErr }, { data: tasks, error: tErr }, { data: resources }] =
    await Promise.all([
      admin
        .from('method_docs')
        .select('id, area, title, kind, url, notes, resource_id, created_at, coach_resources:resource_id(title)')
        .order('created_at', { ascending: false }),
      admin
        .from('method_tasks')
        .select('id, area, title, detail, status, doc_id, sort_order, seeded')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true }),
      admin.from('coach_resources').select('id, title').eq('active', true).order('title'),
    ]);
  if (dErr) return { ok: false, error: dErr.message };
  if (tErr) return { ok: false, error: tErr.message };
  return {
    ok: true,
    data: {
      docs: (docs ?? []).map((d: any) => {
        const res = Array.isArray(d.coach_resources) ? d.coach_resources[0] : d.coach_resources;
        return {
          id: d.id,
          area: d.area,
          title: d.title,
          kind: d.kind,
          url: d.url,
          notes: d.notes,
          resource_id: d.resource_id,
          resource_title: res?.title ?? null,
          created_at: d.created_at,
        };
      }),
      tasks: (tasks ?? []) as MethodTask[],
      libraryResources: (resources ?? []) as { id: string; title: string }[],
    },
  };
}

// ── Documentos ──────────────────────────────────────────────────

/** Subir un PDF o imagen a la bóveda (FormData: file, area, title, notes?). */
export async function createMethodFileDoc(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const file = formData.get('file') as File | null;
  const area = (formData.get('area') as string | null)?.trim() ?? '';
  const title = (formData.get('title') as string | null)?.trim() ?? '';
  const notes = (formData.get('notes') as string | null)?.trim() || null;
  if (!file || !title) return { ok: false, error: 'Falta el archivo o el título.' };
  if (!METHOD_AREA_KEYS.includes(area)) return { ok: false, error: 'Área desconocida.' };

  const isPdf = file.type === 'application/pdf';
  const isImage = /^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type);
  if (!isPdf && !isImage) return { ok: false, error: 'Solo PDF o imagen (PNG/JPG/WebP/SVG).' };

  const ext = isPdf
    ? 'pdf'
    : file.type === 'image/svg+xml'
      ? 'svg'
      : (file.type.split('/')[1] ?? 'png').replace('jpeg', 'jpg');
  const slug =
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'doc';
  const path = `${area}/${slug}-${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  const { error } = await admin.from('method_docs').insert({
    area,
    title,
    kind: isPdf ? 'pdf' : 'image',
    storage_path: path,
    notes,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/metodo');
  return { ok: true };
}

/** Agregar un link, una nota, o enlazar un recurso de la biblioteca. */
export async function createMethodEntry(input: {
  area: string;
  title: string;
  kind: 'link' | 'note' | 'resource';
  url?: string | null;
  notes?: string | null;
  resourceId?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const title = input.title?.trim();
  if (!title) return { ok: false, error: 'El título es obligatorio.' };
  if (!METHOD_AREA_KEYS.includes(input.area)) return { ok: false, error: 'Área desconocida.' };
  if (input.kind === 'link' && !/^(https?:\/\/|\/)/.test(input.url?.trim() ?? '')) {
    return { ok: false, error: 'Un link necesita URL (https://… o /ruta del app).' };
  }
  if (input.kind === 'resource' && !input.resourceId) {
    return { ok: false, error: 'Elegí el recurso de la biblioteca.' };
  }
  const admin = createAdminClient();
  const { error } = await admin.from('method_docs').insert({
    area: input.area,
    title,
    kind: input.kind,
    url: input.kind === 'link' ? input.url!.trim() : null,
    notes: input.notes?.trim() || null,
    resource_id: input.kind === 'resource' ? input.resourceId : null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/metodo');
  return { ok: true };
}

export async function deleteMethodDoc(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const admin = createAdminClient();
  const { data: d } = await admin
    .from('method_docs')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle();
  if (d?.storage_path) {
    await admin.storage.from(BUCKET).remove([d.storage_path]).catch(() => {});
  }
  const { error } = await admin.from('method_docs').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/metodo');
  return { ok: true };
}

/** URL firmada (10 min) para abrir un documento de la bóveda o de la
 *  biblioteca enlazada. Los links devuelven su URL tal cual. */
export async function getMethodDocUrl(
  id: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const admin = createAdminClient();
  const { data: d } = await admin
    .from('method_docs')
    .select('kind, storage_path, url, resource_id')
    .eq('id', id)
    .maybeSingle();
  if (!d) return { ok: false, error: 'No existe.' };

  if (d.kind === 'link' && d.url) return { ok: true, url: d.url };
  if (d.kind === 'note') return { ok: false, error: 'Una nota no se abre — se lee acá.' };

  if (d.kind === 'resource' && d.resource_id) {
    const { data: r } = await admin
      .from('coach_resources')
      .select('storage_path, file_url')
      .eq('id', d.resource_id)
      .maybeSingle();
    if (r?.storage_path) {
      const { data: signed, error } = await admin.storage
        .from('coach-presentations')
        .createSignedUrl(r.storage_path, 600);
      if (error || !signed) return { ok: false, error: error?.message ?? 'No se pudo firmar.' };
      return { ok: true, url: signed.signedUrl };
    }
    if (r?.file_url) return { ok: true, url: r.file_url };
    return { ok: false, error: 'El recurso enlazado no tiene archivo.' };
  }

  if (d.storage_path) {
    const { data: signed, error } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(d.storage_path, 600);
    if (error || !signed) return { ok: false, error: error?.message ?? 'No se pudo firmar.' };
    return { ok: true, url: signed.signedUrl };
  }
  return { ok: false, error: 'Documento sin archivo.' };
}

// ── Checklist ───────────────────────────────────────────────────

export async function setMethodTaskStatus(
  id: string,
  status: 'pending' | 'in_progress' | 'done',
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from('method_tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/metodo');
  return { ok: true };
}

export async function attachDocToTask(
  taskId: string,
  docId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from('method_tasks')
    .update({ doc_id: docId, updated_at: new Date().toISOString() })
    .eq('id', taskId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/metodo');
  return { ok: true };
}

export async function createMethodTask(input: {
  area: string;
  title: string;
  detail?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const title = input.title?.trim();
  if (!title) return { ok: false, error: 'El título es obligatorio.' };
  if (!METHOD_AREA_KEYS.includes(input.area)) return { ok: false, error: 'Área desconocida.' };
  const admin = createAdminClient();
  const { error } = await admin.from('method_tasks').insert({
    area: input.area,
    title,
    detail: input.detail?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/metodo');
  return { ok: true };
}

export async function deleteMethodTask(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const admin = createAdminClient();
  const { error } = await admin.from('method_tasks').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/metodo');
  return { ok: true };
}
