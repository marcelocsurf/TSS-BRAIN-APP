import 'server-only';

import type { createAdminClient } from '@/lib/supabase/admin';
import { SEQUENCE_PAGES, elementTitle } from '@/lib/sequence-pages';

// ─── LA TAREA DEL COACH · una sola regla para alumno y coach ───
//
// Marcelo (2026-09-25): "en la tarea que le deje el coach le aparece [al
// alumno] y si la trabaja UNA vez deja de aparecer como aviso". Antes había
// dos reglas que no se hablaban: getCoachFocusState (4★, sin llamadores) y la
// nota de texto que el Home nunca mostró. Desde hoy:
//   · El coach deja texto + secuencia (+ paso) + fecha + autor (stampNextFocus).
//   · "Trabajada" = el alumno registró una sesión CERRADA sobre ese paso (o esa
//     secuencia, si el coach no eligió paso) DESPUÉS de la fecha.
//   · Trabajada o no, la tarea queda en la ficha del coach con su estado; al
//     alumno solo se le muestra mientras esté pendiente.
// Sin permisos adentro (como build.ts): quien llama ya validó los suyos.

export interface CoachFocus {
  text: string | null;
  sequence_id: string | null;
  step_id: string | null;
  sequence_label: string | null;
  step_label: string | null;
  /** "#8 Frontside Pumping · Rail Change" — la misma etiqueta que ve el coach. */
  label: string | null;
  set_at: string | null;
  set_by_name: string | null;
  /** Primera sesión propia sobre la tarea después de set_at. null = pendiente. */
  worked_at: string | null;
  /** Hay algo que mostrar y todavía no la trabajó. */
  pending: boolean;
  /** Sin secuencia ni paso: solo texto. No puede apagarse sola; la apaga el
   *  próximo foco del coach. */
  text_only: boolean;
  /** Lo que el coach escribió DESPUÉS de la etiqueta ("… – keep your eyes on
   *  the shoulder"). null si el texto es la etiqueta misma. */
  note: string | null;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
/** El cierre guarda "#10 Snap Frontside · Bottom Turn – nota": se devuelve
 *  solo la nota; si el texto es la etiqueta sola, null; si no empieza con la
 *  etiqueta, el texto entero. */
export function noteAfterLabel(text: string | null, label: string | null): string | null {
  if (!text) return null;
  if (!label) return text;
  const t = norm(text), l = norm(label);
  if (!l || t === l) return null;
  if (!t.startsWith(l)) return text;
  // Consumir en el texto original tantos alfanuméricos como tiene la etiqueta.
  let need = l.length, i = 0;
  while (i < text.length && need > 0) { if (/[a-z0-9]/i.test(text[i])) need -= 1; i += 1; }
  const tail = text.slice(i).replace(/^[\s·–—:-]+/, '').trim();
  return tail || null;
}

/** Fecha + autor para acompañar CADA escritura de next_recommended_focus. */
export function stampNextFocus(coachId?: string | null): { next_focus_set_at: string; next_focus_set_by: string | null } {
  return { next_focus_set_at: new Date().toISOString(), next_focus_set_by: coachId ?? null };
}

/** Etiquetas de secuencia y paso: el registro de secuencias manda (círculos y
 *  sub-elementos se nombran ahí), lessons es el respaldo. */
export async function focusLabels(
  admin: ReturnType<typeof createAdminClient>,
  sequenceId: string | null,
  stepId: string | null,
): Promise<{ sequence_label: string | null; step_label: string | null }> {
  const cfg = sequenceId ? SEQUENCE_PAGES[sequenceId] ?? null : null;
  let seqName: string | null = null;
  let stepTitle: string | null = null;
  if ((sequenceId && !cfg) || stepId) {
    const [sq, st] = await Promise.all([
      sequenceId && !cfg
        ? admin.from('lessons').select('wb_sequence_name').eq('wb_sequence_id', sequenceId).not('wb_sequence_name', 'is', null).limit(1).maybeSingle()
        : Promise.resolve({ data: null as any }),
      stepId ? admin.from('lessons').select('title').eq('id', stepId).maybeSingle() : Promise.resolve({ data: null as any }),
    ]);
    seqName = (sq.data as any)?.wb_sequence_name ?? null;
    stepTitle = (st.data as any)?.title ?? null;
  }
  const sequence_label = sequenceId
    ? (cfg ? (cfg.eyebrow ? cfg.title : `#${cfg.number} ${cfg.title}`) : (seqName ?? sequenceId))
    : null;
  const step_label = stepId ? (elementTitle(cfg, stepId, stepTitle) ?? stepId) : null;
  return { sequence_label, step_label };
}

export async function getCoachFocus(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
): Promise<CoachFocus | null> {
  const { data: st } = await admin
    .from('students')
    .select('next_recommended_focus, next_focus_sequence_id, next_focus_step_id, next_focus_set_at, last_session_date, coaches:next_focus_set_by(display_name)')
    .eq('id', studentId)
    .maybeSingle();
  if (!st) return null;
  const text = String((st as any).next_recommended_focus ?? '').trim() || null;
  const sequence_id = ((st as any).next_focus_sequence_id as string | null) || null;
  const step_id = ((st as any).next_focus_step_id as string | null) || null;
  if (!text && !sequence_id && !step_id) return null;

  const { sequence_label, step_label } = await focusLabels(admin, sequence_id, step_id);
  const label = sequence_id || step_id ? [sequence_label, step_label].filter(Boolean).join(' · ') : null;

  // Ventana: desde que el coach la dejó. Los focos anteriores a la migración
  // 00217 no tienen fecha: se toma la última sesión con coach (cuando la
  // escribió) y, si tampoco hay, cualquier sesión cuenta.
  const since: string | null = (st as any).next_focus_set_at ?? (st as any).last_session_date ?? null;
  let worked_at: string | null = null;
  if (sequence_id || step_id) {
    let q = admin
      .from('self_training_sessions')
      .select('created_at, training_mode, linked_step_id, linked_sequence_id, step_marks')
      .eq('student_id', studentId)
      .eq('status', 'done')
      .order('created_at', { ascending: true })
      .limit(300);
    if (since) q = q.gt('created_at', since);
    const { data: rows } = await q;
    // Con paso elegido: un foco en ese paso, o un run COMPLETO de su secuencia
    // (el run pasa por todos los pasos; step_marks solo guarda los que frenaron).
    const hit = ((rows ?? []) as any[]).find((r) =>
      step_id
        ? r.linked_step_id === step_id
          || (!!sequence_id && r.training_mode === 'sequence_run' && r.linked_sequence_id === sequence_id)
          || ((r.step_marks ?? []) as any[]).some((m) => m?.step_id === step_id)
        : r.linked_sequence_id === sequence_id,
    );
    worked_at = hit?.created_at ?? null;
  }

  const one = (x: any) => (Array.isArray(x) ? x[0] : x);
  return {
    text,
    sequence_id,
    step_id,
    sequence_label,
    step_label,
    label,
    set_at: (st as any).next_focus_set_at ?? null,
    set_by_name: one((st as any).coaches)?.display_name ?? null,
    worked_at,
    // Un texto sin ids y SIN fecha es anterior a 00217 (92 fichas con notas de
    // cierres viejos que el portal nunca mostró): no se resucita. Los textos
    // sin ids escritos desde hoy sí llevan fecha y se muestran.
    pending: worked_at == null && !(!sequence_id && !step_id && !(st as any).next_focus_set_at),
    text_only: !sequence_id && !step_id,
    note: noteAfterLabel(text, label),
  };
}
