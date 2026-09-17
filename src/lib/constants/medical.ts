// ═══ Notas médicas: qué cuenta como "hay algo" ═══
// Marcelo (2026-09-17): el intake obliga a escribir alergias; si el alumno
// escribe "none" no puede saltar la alerta de seguridad. Solo cuenta un texto
// que diga algo real.
const NEGATIVES = new Set(['none', 'no', 'n/a', 'na', 'nothing', 'nada', 'ninguna', 'ninguno', 'ningunas', 'ningunos', 'no tengo', 'sin alergias', 'sin lesiones', '-', '—', 'x', 'n', 'nope', 'not applicable', 'no allergies', 'no injuries', 'none.', 'no.']);

export function hasMedicalNote(v: string | null | undefined): boolean {
  if (v == null) return false;
  const t = String(v).trim().toLowerCase().replace(/[.!]+$/, '');
  if (!t) return false;
  return !NEGATIVES.has(t);
}

export function anyMedicalNote(...vals: (string | null | undefined)[]): boolean {
  return vals.some(hasMedicalNote);
}
