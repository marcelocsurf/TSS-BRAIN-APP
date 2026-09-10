// ═══ Los MOMENTOS de la línea, por lección (Marcelo 2026-09-10) ═══
//
// Dos capas de la misma secuencia: la LECCIÓN (lo que se califica con
// estrellas y valida el coach) y el MOMENTO de la línea (posture · palm up
// · extend · elbow strike · low), que es el lenguaje de la ejecución en la
// ola. La página de la secuencia ya sabe a qué lección pertenece cada
// momento (details[].deeper.lessonId); acá se lee ese mapa para que Let's
// Play muestre los momentos debajo de cada lección y pregunte por momento
// al cerrar un run. La estrella nunca cambia de lugar: sigue en la lección.
import type { Command, Indicator } from './types';
import { sequencePageFor } from './index';

export type Moment = {
  key: string;
  stepId: string;
  title: string;
  /** Lo que cabe en un chip: "Back hand, palm up, throws to the line". */
  short: string;
  command: Command | null;
  symptom: string;
  indicators: Indicator[];
  /** 'feet' = la condición previa (posición del pie), no un momento de la línea. */
  kind: 'moment' | 'feet';
};

export function shortMoment(title: string): string {
  const t = title.replace(/^\d+\s*·\s*/, '');
  const seg = t.split(' · ')[0].trim();
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

/** stepId → momentos de la línea que le pertenecen, en el orden de la línea. */
export function momentsByStep(
  sequenceId: string | null | undefined,
  steps: { id: string; title: string }[],
): Record<string, Moment[]> {
  const cfg = sequencePageFor(sequenceId);
  const out: Record<string, Moment[]> = {};
  if (!cfg) return out;
  const ids = new Set(steps.map((s) => s.id));
  for (const d of cfg.details) {
    const sid = d.deeper?.lessonId;
    if (!sid || !ids.has(sid)) continue;
    (out[sid] ??= []).push({
      key: d.key,
      stepId: sid,
      title: d.title,
      short: shortMoment(d.title),
      command: d.command ?? null,
      symptom: d.symptom,
      indicators: d.indicators,
      kind: 'moment',
    });
  }
  // Los pies son la condición previa: su indicador vive en la página como
  // "P1 o P2, nunca P3" y se cuelga de la lección de posición del pie.
  const feet = cfg.think.feet;
  if (feet) {
    const feetStep = steps.find((s) => /foot position|posición del pie/i.test(s.title));
    if (feetStep) {
      const rec = feet.recommended?.length ? feet.recommended.join(' or ') : 'P1, P2 or P3';
      (out[feetStep.id] ??= []).unshift({
        key: 'feet',
        stepId: feetStep.id,
        title: `Back foot · ${rec}`,
        short: `Back foot · ${rec}`,
        command: null,
        symptom: feet.rule,
        indicators: [{ ok: feet.rule, no: '', fix: '' }],
        kind: 'feet',
      });
    }
  }
  return out;
}
