// Buscar a una persona que YA existe, cuando el correo no alcanza.
//
// Motivo real (2026-08-10, familia Uszenski): Kelly ya estaba en el sistema
// con `kouszenski@gmail.com`, pero entró al QR con OTRO correo suyo
// (`kellyovi99@me.com`). Como toda la búsqueda pública es por correo, no la
// reconoció y creó una Kelly nueva; después ella agregó a Reagan y a Eddie
// como familia y el sistema creó dos personas más. Resultado: 6 registros
// para 4 personas, y como los nuevos no estaban en ningún surf camp, la regla
// de "incluido en el camp" no podía aplicarles el $0 — Cony tuvo que poner
// $0 a mano tres veces.
//
// El apellido + la fecha de nacimiento son la señal fuerte: atrapan también
// los apodos (Eddie/Edward Uszenski, ambos nacidos 2015-02-17), que un
// match por nombre nunca vería.

const norm = (s: string | null | undefined) =>
  (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');

export interface MatchedStudent {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  date_of_birth: string | null;
}

/**
 * Personas de la academia que probablemente sean ESTA misma persona.
 * Coincide por apellido + (misma fecha de nacimiento O mismo nombre).
 * Devuelve [] si no hay apellido — sin él no hay señal suficiente.
 */
export async function findLikelySamePerson(
  admin: any,
  academyId: string,
  person: { first_name?: string | null; last_name?: string | null; date_of_birth?: string | null },
  excludeId?: string | null,
): Promise<MatchedStudent[]> {
  const last = norm(person.last_name);
  const first = norm(person.first_name);
  const dob = (person.date_of_birth ?? '').trim() || null;
  if (!last) return [];

  const { data } = await admin
    .from('students')
    .select('id, first_name, last_name, email, date_of_birth')
    .eq('academy_id', academyId)
    .eq('status', 'active')
    .limit(500);

  return ((data as MatchedStudent[]) ?? []).filter((s) => {
    if (excludeId && s.id === excludeId) return false;
    if (norm(s.last_name) !== last) return false;
    if (dob && s.date_of_birth === dob) return true;   // apodos incluidos
    return !!first && norm(s.first_name) === first;
  });
}
