// Validación de fecha de nacimiento.
//
// Motivo real (2026-08-10): Nathan Hammerle quedó guardado con nacimiento
// 2026-08-20 — el día y el mes estaban bien, se tipeó mal el AÑO. Una fecha
// futura no es solo un dato feo: `ageFromDob` devuelve una edad negativa, el
// alumno cuenta como menor y se le dispara el flujo de permiso de tutor. Los
// formularios pedían la fecha pero no comprobaban que fuera posible.

// Techo alto a propósito: acá solo queremos atajar el año mal tipeado, no
// discutirle la edad a nadie. 110 ya es territorio imposible.
const MAX_AGE = 110;
const MIN_AGE = 3;

/** El máximo para el atributo `max` del input date: hoy. */
export function dobMaxAttr(): string {
  return new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
}

/**
 * Devuelve el mensaje de error si la fecha no es posible, o null si está bien.
 * Vacío también devuelve null — que sea obligatoria lo decide cada formulario.
 */
export function dobError(iso: string | null | undefined): string | null {
  const v = (iso ?? '').trim();
  if (!v) return null;

  const d = new Date(v + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return 'That date of birth is not valid.';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d > today) return 'That date is in the future — check the year.';

  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;

  if (age > MAX_AGE) return 'That date of birth looks off — check the year.';
  if (age < MIN_AGE) return 'That would make them under 3 — check the year.';
  return null;
}
