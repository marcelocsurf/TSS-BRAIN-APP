// Sugerencia de correo mal escrito.
//
// Motivo real (2026-08-10): Polina se registró dos veces con un minuto de
// diferencia — primero con "…@gmal.com" y después con "…@gmail.com". Nathan
// igual, con "@outlook.ccom". Como toda la deduplicación del sistema es POR
// CORREO, un dominio mal tipeado crea una persona nueva y le parte el
// historial en dos. Detectarlo en el momento vale más que fusionarlo después.
//
// Solo sugiere: nunca corrige solo. El dueño del correo es quien decide —
// hay dominios legítimos que se parecen a los típicos.

// Dominios reales conocidos. Ojo con los que PARECEN typos y no lo son:
// `googlemail.com` es el dominio alterno oficial de Gmail (era el que Google
// usaba por defecto en Reino Unido y Alemania) — Cony reportó uno como
// "correo no válido" el 2026-08-11 y era perfectamente bueno.
const DOMAINS = [
  'gmail.com', 'googlemail.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
  'icloud.com', 'live.com', 'me.com', 'mac.com', 'aol.com',
  'proton.me', 'protonmail.com', 'pm.me', 'gmx.com', 'gmx.de', 'web.de',
  'yahoo.es', 'yahoo.co.uk', 'hotmail.es', 'hotmail.co.uk', 'outlook.es',
  'live.co.uk', 'btinternet.com', 'orange.fr', 'free.fr',
];

/**
 * Distancia de edición acotada, contando la TRANSPOSICIÓN de dos letras
 * vecinas como un solo error (Damerau). Sin eso, "gmial.com" —de los typos
 * más comunes que existe— queda a distancia 2 de "gmail.com" y se escapa.
 */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d = Math.min(d, prev2[j - 2] + 1);
      }
      cur[j] = d;
      if (d < best) best = d;
    }
    if (best > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Devuelve el correo corregido si el dominio parece un error de tipeo,
 * o null si está bien (o si no hay una sugerencia clara).
 */
export function suggestCorrectedEmail(raw: string | null | undefined): string | null {
  const email = (raw ?? '').trim().toLowerCase();
  const at = email.lastIndexOf('@');
  if (at < 1 || at === email.length - 1) return null;

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (DOMAINS.includes(domain)) return null;

  // "gmail.con" / "gmail.comm" / "outlook.ccom": el nombre está bien y solo
  // falla la terminación. Se arregla sin tocar el resto.
  const dot = domain.lastIndexOf('.');
  if (dot > 0) {
    const base = domain.slice(0, dot), tld = domain.slice(dot + 1);
    const badTld = ['con', 'comm', 'ccom', 'cmo', 'co,', 'om', 'cm', 'coom'].includes(tld);
    if (badTld && DOMAINS.includes(`${base}.com`)) return `${local}@${base}.com`;
  }

  // Dominio parecido a uno conocido (1 error para dominios cortos, 2 para largos).
  let best: string | null = null, bestD = 99;
  for (const d of DOMAINS) {
    const max = d.length > 10 ? 2 : 1;
    const dist = editDistance(domain, d, max);
    if (dist <= max && dist < bestD) { best = d; bestD = dist; }
  }
  return best ? `${local}@${best}` : null;
}
