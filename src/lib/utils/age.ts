// Edad a partir de la fecha de nacimiento (YYYY-MM-DD). Síncrono y sin
// dependencias, para usar tanto en server actions como en componentes.
// La `students.age` guardada se queda vieja; calcular desde date_of_birth
// es siempre correcto.
export function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a >= 0 && a < 130 ? a : null;
}
