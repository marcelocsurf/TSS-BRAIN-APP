'use server';

// ═══ DOCTRINA VIVA — la fuente única de las reglas técnicas ═══
//
// Marcelo (2026-09-09): las reglas que dicta viven ACÁ (tabla doctrine_rules),
// no en la memoria de una sesión ni repartidas en cada material. Cada regla
// dice a qué paso / secuencia aplica y qué materiales toca; El Método muestra
// qué material ya se revisó contra la regla y cuál sigue pendiente.
//
// Solo el dueño (is_platform_admin) lee y escribe. Migración 00186.
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { SEQUENCE_PAGES } from '@/lib/sequence-pages';

async function assertOwner() {
  const ok = await isRealPlatformAdmin().catch(() => false);
  if (!ok) throw new Error('Solo el dueño del método.');
}

import { MATERIAL_KINDS, type MaterialKind } from '@/lib/constants/doctrine';
export type { MaterialKind };

export interface DoctrineRule {
  id: string;
  step_id: string | null;
  step_title: string | null;
  sequence_id: string | null;
  belt: string;
  topic: string;
  rule_en: string;
  rule_es: string | null;
  rationale: string | null;
  source: string;
  decided_on: string;
  status: 'active' | 'superseded' | 'draft';
  applies_to: MaterialKind[];
  updated_at: string;
  /** Materiales del paso/secuencia que la regla toca, con su estado. */
  materials: DoctrineMaterial[];
}

export interface DoctrineMaterial {
  kind: MaterialKind;
  id: string;
  title: string;
  /** Última edición del material (null si no se sabe). */
  updated_at: string | null;
  /** Revisado contra esta regla después de su última edición. */
  reviewed: boolean;
  reviewed_at: string | null;
}

export interface DoctrineData {
  rules: DoctrineRule[];
  /** Pasos disponibles para el selector: id + título. */
  steps: { id: string; title: string; course_section: string }[];
}

export async function getDoctrine(): Promise<{ ok: true; data: DoctrineData } | { ok: false; error: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const admin = createAdminClient();
  const [{ data: rules, error }, { data: reviews }, { data: steps }, { data: pieces }, { data: coachLessons }] = await Promise.all([
    admin.from('doctrine_rules').select('*').order('decided_on', { ascending: false }).order('created_at', { ascending: false }),
    admin.from('doctrine_material_reviews').select('rule_id, material_kind, material_id, reviewed_at'),
    admin.from('lessons').select('id, title, course_section, updated_at').eq('active', true).like('id', 'STP-%').order('display_order'),
    admin.from('drills_missions').select('id, title, type, step_id, updated_at').eq('active', true),
    admin.from('lessons').select('id, title, linked_step_id, updated_at').eq('active', true).like('course_section', 'coach_%'),
  ]);
  if (error) return { ok: false, error: error.message };

  const stepById = new Map((steps ?? []).map((s: any) => [s.id, s]));
  const piecesByStep = new Map<string, any[]>();
  for (const p of pieces ?? []) {
    if (!p.step_id) continue;
    (piecesByStep.get(p.step_id) ?? piecesByStep.set(p.step_id, []).get(p.step_id)!).push(p);
  }
  const coachByStep = new Map<string, any[]>();
  for (const c of coachLessons ?? []) {
    if (!c.linked_step_id) continue;
    (coachByStep.get(c.linked_step_id) ?? coachByStep.set(c.linked_step_id, []).get(c.linked_step_id)!).push(c);
  }
  const reviewKey = (ruleId: string, kind: string, id: string) => `${ruleId}|${kind}|${id}`;
  const reviewAt = new Map<string, string>();
  for (const r of reviews ?? []) reviewAt.set(reviewKey(r.rule_id, r.material_kind, r.material_id), r.reviewed_at);

  const out: DoctrineRule[] = (rules ?? []).map((r: any) => {
    const applies = (r.applies_to ?? []) as MaterialKind[];
    const mats: DoctrineMaterial[] = [];
    const push = (kind: MaterialKind, id: string, title: string, updatedAt: string | null) => {
      if (!applies.includes(kind)) return;
      const ra = reviewAt.get(reviewKey(r.id, kind, id)) ?? null;
      // Revisado = hay revisión y es posterior a la última edición de la regla.
      const reviewed = !!ra && new Date(ra) >= new Date(r.updated_at);
      mats.push({ kind, id, title, updated_at: updatedAt, reviewed, reviewed_at: ra });
    };
    if (r.step_id) {
      const s = stepById.get(r.step_id);
      if (s) push('lesson', s.id, s.title, s.updated_at);
      for (const p of piecesByStep.get(r.step_id) ?? []) push(p.type === 'drill' ? 'drill' : 'mission', p.id, p.title, p.updated_at);
      for (const c of coachByStep.get(r.step_id) ?? []) push('coach', c.id, c.title, c.updated_at);
    }
    // Página de secuencia (config en código) — existe si está registrada.
    if (r.sequence_id && SEQUENCE_PAGES[r.sequence_id]) push('page', r.sequence_id, `Página ${r.sequence_id} · ${SEQUENCE_PAGES[r.sequence_id].title}`, null);
    if (!r.sequence_id && r.step_id) {
      for (const [sid, cfg] of Object.entries(SEQUENCE_PAGES)) if (cfg.stepIds.includes(r.step_id)) push('page', sid, `Página ${sid} · ${cfg.title}`, null);
    }
    return {
      id: r.id,
      step_id: r.step_id,
      step_title: r.step_id ? (stepById.get(r.step_id)?.title ?? null) : null,
      sequence_id: r.sequence_id,
      belt: r.belt,
      topic: r.topic,
      rule_en: r.rule_en,
      rule_es: r.rule_es,
      rationale: r.rationale,
      source: r.source,
      decided_on: r.decided_on,
      status: r.status,
      applies_to: applies,
      updated_at: r.updated_at,
      materials: mats,
    };
  });
  return { ok: true, data: { rules: out, steps: (steps ?? []) as any } };
}

export async function upsertDoctrineRule(input: {
  id?: string | null;
  step_id?: string | null;
  sequence_id?: string | null;
  belt?: string | null;
  topic: string;
  rule_en: string;
  rule_es?: string | null;
  rationale?: string | null;
  source?: string | null;
  decided_on?: string | null;
  applies_to?: MaterialKind[];
  status?: 'active' | 'superseded' | 'draft';
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const topic = input.topic?.trim();
  const rule = input.rule_en?.trim();
  if (!topic || !rule) return { ok: false, error: 'Falta el tema o la regla.' };
  const applies = (input.applies_to ?? []).filter((k) => MATERIAL_KINDS.includes(k));
  const row = {
    step_id: input.step_id?.trim() || null,
    sequence_id: input.sequence_id?.trim() || null,
    belt: input.belt?.trim() || 'all',
    topic,
    rule_en: rule,
    rule_es: input.rule_es?.trim() || null,
    rationale: input.rationale?.trim() || null,
    source: input.source?.trim() || 'Marcelo',
    decided_on: input.decided_on || new Date().toISOString().slice(0, 10),
    applies_to: applies.length ? applies : ['lesson', 'drill', 'mission', 'coach', 'page'],
    status: input.status ?? 'active',
  };
  const admin = createAdminClient();
  if (input.id) {
    const { error } = await admin.from('doctrine_rules').update(row).eq('id', input.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/metodo');
    return { ok: true, id: input.id };
  }
  const { data, error } = await admin.from('doctrine_rules').insert(row).select('id').single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/metodo');
  return { ok: true, id: data.id };
}

/** Marcar que un material ya fue revisado (o corregido) contra una regla. */
export async function setDoctrineReview(
  ruleId: string,
  kind: MaterialKind,
  materialId: string,
  reviewed: boolean,
  note?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const admin = createAdminClient();
  if (!reviewed) {
    const { error } = await admin.from('doctrine_material_reviews').delete().eq('rule_id', ruleId).eq('material_kind', kind).eq('material_id', materialId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin
      .from('doctrine_material_reviews')
      .upsert({ rule_id: ruleId, material_kind: kind, material_id: materialId, reviewed_at: new Date().toISOString(), note: note?.trim() || null }, { onConflict: 'rule_id,material_kind,material_id' });
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath('/metodo');
  return { ok: true };
}

export async function deleteDoctrineRule(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertOwner();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sin acceso.' };
  }
  const admin = createAdminClient();
  const { error } = await admin.from('doctrine_rules').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/metodo');
  return { ok: true };
}
