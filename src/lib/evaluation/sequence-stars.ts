// ═══ Estrellas para TODA una secuencia (evaluación oficial) ═══
//
// Marcelo (2026-09-26): "si el coach dice que ya la tiene o le pone 4 o 5
// estrellas, la marcás como que ya la tiene con esa cantidad de estrellas".
// Antes "La tiene" solo escribía 4★ donde no había nota: un paso que ya
// estaba en 3★ (por ejemplo Bottom Turn Medium, compartido por #10 y #12)
// dejaba la secuencia en "Le falta" sin forma de sacarla de ahí.
//
// Reglas, paso por paso:
//   · sin nota o por debajo de N        → N   (la afirmación del coach manda)
//   · por encima de N, nota vieja       → se queda (nunca se baja lo de otro camp)
//   · por encima de N, escrita en esta  → N   (el coach está corrigiendo lo suyo)
//     misma pasada
//   · igual a N                         → nada (nunca escribir de gusto)
//   raiseOnly ("La tiene"): solo sube hasta N; nunca corrige hacia abajo.
// Pura: sin base, sin React. Probada en src/test/pure.test.ts.

export function sequenceStarChanges(
  stepIds: string[],
  current: (stepId: string) => number | null,
  stars: number,
  opts: { writtenThisPass?: ReadonlySet<string>; raiseOnly?: boolean } = {},
): { stepId: string; stars: number }[] {
  const out: { stepId: string; stars: number }[] = [];
  for (const id of stepIds) {
    const cur = current(id);
    if (cur === stars) continue;
    if (cur === null || cur < stars) { out.push({ stepId: id, stars }); continue; }
    if (opts.raiseOnly) continue;
    if (opts.writtenThisPass?.has(id)) out.push({ stepId: id, stars });
  }
  return out;
}
