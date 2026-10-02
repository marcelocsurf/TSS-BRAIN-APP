// ═══ Historial de estrellas · el "dónde y quién" (Marcelo 2026-10-02) ═══
// Cada escritura de student_step_ratings manda rating_ctx en la MISMA fila; el
// trigger step_rating_history_log (migración 00226) lo copia al historial.
// El nonce `n` es obligatorio: sin él, una escritura posterior sin contexto
// heredaría este (el trigger step_rating_ctx_fresh lo anula si no cambió).
// Solo servidor.
import { randomUUID } from 'crypto';

export type RatingSource =
  | 'official_panel' | 'camp_inline' | 'day_close_sequence' | 'final_eval'
  | 'standalone_eval' | 'self_assessment' | 'linked_mission' | 'lets_play_run' | 'lets_play_focus';

export function ratingCtx(source: RatingSource, input: {
  kind: 'coach' | 'self';
  coach_id?: string | null;
  sequence_id?: string | null;
  side?: 'fs' | 'bs' | null;
  camp_instance_id?: string | null;
  camp_session_id?: string | null;
  training_session_id?: string | null;
  [k: string]: unknown;
}): Record<string, unknown> {
  const out: Record<string, unknown> = { source };
  for (const [k, v] of Object.entries(input)) if (v !== null && v !== undefined && v !== '') out[k] = v;
  out.n = randomUUID();
  return out;
}
