'use server';

// ═══ EVALUACIÓN COMPLETA TSS · físico · técnica · maniobras · longboard ·
// táctica · mental — la misma del app de Alto Rendimiento, ahora en BRAIN ═══
//
// Marcelo (2026-09-14): "que estén en TSS BRAIN las mismas que salían en el
// otro; la última vez que me metí no salían". Las 7 migradas vivían en `raw`
// sin pantalla; acá se leen y se crean nuevas con el mismo instrumento
// (src/lib/constants/hp-eval-full.ts). Se guardan en hp_deep_evaluations con
// eval_kind 'completa': `raw` lleva los bloques tal cual el app HP y `scores`
// espeja los ítems 1-5 con prefijo (tec_/tac_/men_) para que los pilares del
// portal y del especialista sigan funcionando.

import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin, getCurrentCoach } from '@/lib/actions/auth';
import { elSalvadorToday } from '@/lib/utils/tz';
import { EVAL_FULL_ITEMS, EVAL_FULL_BLOCKS, EVAL_FULL_TYPES, EVAL_FULL_DISCIPLINES, type FullEvalBlockKey } from '@/lib/constants/hp-eval-full';

const DENY = { ok: false as const, error: 'Solo el head coach puede usar el cockpit HP.' };

export type FullEvalBlocks = Partial<Record<FullEvalBlockKey, Record<string, number | string>>>;

export interface HPFullEvalRow {
  id: string;
  student_id: string;
  student_name: string;
  coach_name: string | null;
  eval_date: string;
  eval_type: string | null;      // inicial · periodica · final
  discipline: string | null;     // shortboard · longboard · both
  location: string | null;
  conditions: string | null;
  belt_assigned: string | null;
  blocks_evaluated: string[];
  blocks: FullEvalBlocks;        // fisico · tecnica · maniobras · longboard · tactica · mental
  summary: { strengths: string[]; improvements: string[] };
  diagnosis: { observation?: string; recommendation?: string };
  action_plan: { drills?: string; next_eval_date?: string };
  coach_narrative: string | null;
  block_avgs: Partial<Record<FullEvalBlockKey, number | null>>;
}

const BLOCK_RAW_KEY: Record<FullEvalBlockKey, string> = {
  fisico: 'physical_json', tecnica: 'tech_json', maniobras: 'maneuvers_json', longboard: 'longboard_json', tactica: 'tactical_json', mental: 'mental_json',
};

/** Promedio 1-5 de un bloque (solo ítems numéricos que son puntaje, no medidas de test). */
function blockAvg(block: FullEvalBlockKey, data: Record<string, number | string> | undefined): number | null {
  if (!data) return null;
  if (block === 'fisico') return null; // tests con medida: no hay promedio 1-5
  const vals: number[] = [];
  for (const sec of EVAL_FULL_ITEMS[block].sections) {
    if (sec.type === 'text') continue;
    for (const it of sec.items) {
      if (it.type === 'text' || it.type === 'number') continue;
      const v = Number(data[it.id]);
      if (Number.isFinite(v) && v >= 1 && v <= 5) vals.push(v);
    }
  }
  return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
}

function rowFrom(e: any): HPFullEvalRow {
  const raw = (e.raw && typeof e.raw === 'object') ? e.raw : {};
  const blocks: FullEvalBlocks = {};
  for (const b of EVAL_FULL_BLOCKS) {
    const v = raw[BLOCK_RAW_KEY[b.key]];
    if (v && typeof v === 'object' && !Array.isArray(v)) blocks[b.key] = v;
  }
  const summary = raw.summary_json && typeof raw.summary_json === 'object' ? raw.summary_json : {};
  const block_avgs: HPFullEvalRow['block_avgs'] = {};
  for (const b of EVAL_FULL_BLOCKS) block_avgs[b.key] = blockAvg(b.key, blocks[b.key]);
  return {
    id: e.id,
    student_id: e.student_id,
    student_name: `${e.students?.first_name ?? ''} ${e.students?.last_name ?? ''}`.trim() || '—',
    coach_name: e.coaches?.display_name ?? null,
    eval_date: e.eval_date,
    eval_type: raw.eval_type ?? null,
    discipline: raw.discipline ?? null,
    location: raw.location ?? null,
    conditions: raw.conditions ?? null,
    belt_assigned: raw.belt_assigned ?? null,
    blocks_evaluated: Array.isArray(raw.blocks_evaluated) ? raw.blocks_evaluated : Object.keys(blocks),
    blocks,
    summary: { strengths: Array.isArray(summary.strengths) ? summary.strengths : [], improvements: Array.isArray(summary.improvements) ? summary.improvements : [] },
    diagnosis: raw.diagnosis_json && typeof raw.diagnosis_json === 'object' ? raw.diagnosis_json : {},
    action_plan: raw.action_plan_json && typeof raw.action_plan_json === 'object' ? raw.action_plan_json : {},
    coach_narrative: raw.coach_narrative ?? null,
    block_avgs,
  };
}

export async function hpListFullEvaluations(): Promise<{ ok: boolean; error?: string; evaluations: HPFullEvalRow[] }> {
  try {
    if (!(await isRealPlatformAdmin())) return { ...DENY, evaluations: [] };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('hp_deep_evaluations')
      .select('id, student_id, eval_date, raw, students(first_name, last_name), coaches(display_name)')
      .eq('eval_kind', 'completa')
      .order('eval_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) throw error;
    return { ok: true, evaluations: (data ?? []).map(rowFrom) };
  } catch (e) {
    console.error('[hp-eval-full] list failed', e);
    return { ok: false, error: 'No se pudieron cargar las evaluaciones completas.', evaluations: [] };
  }
}

export async function hpCreateFullEvaluation(input: {
  studentId: string;
  eval_date?: string | null;
  eval_type: string;
  discipline: string;
  location?: string | null;
  conditions?: string | null;
  belt_assigned?: string | null;
  blocks: FullEvalBlocks;
  summary?: { strengths?: string[]; improvements?: string[] };
  diagnosis?: { observation?: string; recommendation?: string };
  action_plan?: { drills?: string; next_eval_date?: string };
  coach_narrative?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await isRealPlatformAdmin())) return DENY;
    if (!input.studentId) return { ok: false, error: 'Elegí el atleta.' };
    const evalType = (EVAL_FULL_TYPES as readonly string[]).includes(input.eval_type) ? input.eval_type : 'periodica';
    const discipline = (EVAL_FULL_DISCIPLINES as readonly string[]).includes(input.discipline) ? input.discipline : 'shortboard';

    // Sanitizar por bloque: solo ítems del instrumento; 1-5 para puntajes,
    // número libre para tests/porcentajes, texto corto para observaciones.
    const raw: Record<string, unknown> = {
      eval_type: evalType, discipline,
      location: input.location?.trim().slice(0, 120) || null,
      conditions: input.conditions?.trim().slice(0, 200) || null,
      belt_assigned: input.belt_assigned?.trim().slice(0, 40) || null,
      coach_narrative: input.coach_narrative?.trim().slice(0, 2000) || null,
    };
    const scores: Record<string, number> = {};
    const blocksEvaluated: string[] = [];
    for (const b of EVAL_FULL_BLOCKS) {
      const data = input.blocks?.[b.key];
      if (!data) { raw[BLOCK_RAW_KEY[b.key]] = null; continue; }
      const clean: Record<string, number | string> = {};
      for (const sec of EVAL_FULL_ITEMS[b.key].sections) {
        for (const it of sec.items) {
          const v = data[it.id];
          if (v == null || v === '') continue;
          const isText = sec.type === 'text' || it.type === 'text';
          const isMeasure = !isText && (sec.type === 'number' || it.type === 'number');
          if (isText) { const s = String(v).trim().slice(0, 500); if (s) clean[it.id] = s; continue; }
          const n = Number(v);
          if (!Number.isFinite(n)) continue;
          if (isMeasure) { clean[it.id] = n; continue; }
          const r = Math.round(n);
          if (r >= 1 && r <= 5) { clean[it.id] = r; if (b.scorePrefix) scores[`${b.scorePrefix}_${it.id}`] = r; }
        }
      }
      if (Object.keys(clean).length) { raw[BLOCK_RAW_KEY[b.key]] = clean; blocksEvaluated.push(b.key); }
      else raw[BLOCK_RAW_KEY[b.key]] = null;
    }
    const strengths = (input.summary?.strengths ?? []).map((s) => String(s).trim().slice(0, 200)).filter(Boolean).slice(0, 3);
    const improvements = (input.summary?.improvements ?? []).map((s) => String(s).trim().slice(0, 200)).filter(Boolean).slice(0, 3);
    raw.summary_json = strengths.length || improvements.length ? { strengths, improvements } : null;
    const dObs = input.diagnosis?.observation?.trim().slice(0, 1500) || '';
    const dRec = input.diagnosis?.recommendation?.trim().slice(0, 1500) || '';
    raw.diagnosis_json = dObs || dRec ? { observation: dObs || undefined, recommendation: dRec || undefined } : null;
    const drills = input.action_plan?.drills?.trim().slice(0, 1500) || '';
    const nextEval = input.action_plan?.next_eval_date?.trim().slice(0, 10) || '';
    raw.action_plan_json = drills || nextEval ? { drills: drills || undefined, next_eval_date: nextEval || undefined } : null;
    raw.blocks_evaluated = blocksEvaluated;

    if (!blocksEvaluated.length && !strengths.length && !improvements.length && !dObs && !dRec && !raw.coach_narrative) {
      return { ok: false, error: 'La evaluación está vacía — completá al menos un bloque o el resumen.' };
    }

    // Espejo para el resto del sistema (pilares, ficha del especialista).
    const diagnostico: Record<string, string> = {};
    if (strengths[0]) diagnostico.main_strength = strengths.join(' · ');
    if (improvements[0]) diagnostico.top_priority = improvements.join(' · ');
    if (dRec) diagnostico.concrete_action = dRec;
    if (raw.coach_narrative) diagnostico.notes = String(raw.coach_narrative);

    const admin = createAdminClient();
    const me = await getCurrentCoach();
    const { error } = await admin.from('hp_deep_evaluations').insert({
      student_id: input.studentId,
      coach_id: me?.id ?? null,
      eval_kind: 'completa',
      eval_date: input.eval_date && /^\d{4}-\d{2}-\d{2}$/.test(input.eval_date) ? input.eval_date : elSalvadorToday(),
      event_name: `Evaluación Completa TSS · ${evalType} · ${discipline}`,
      scores,
      diagnostico,
      raw,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[hp-eval-full] create failed', e);
    return { ok: false, error: 'No se pudo guardar la evaluación completa.' };
  }
}
