// Regla INCLUIDO — fuente ÚNICA de verdad (antes duplicada y divergida en
// seller.ts, public-classes.ts y ausente en camps.ts → coordinación cobraba
// de más a huéspedes). Una CLASE (yoga, U.Natural, BJJ, ice bath, self
// defense…) viene incluida en el surf camp del alumno si el camp está activo
// y cubre la fecha de la clase. Lessons privadas y trips SÍ se cobran.
//
// Devuelve el nombre del camp que la incluye (para la nota "no cobrar") o null.
// Recibe el admin client del llamador para no abrir otra conexión.

export async function campGuestIncludedIn(
  admin: any,
  studentId: string | null | undefined,
  serviceKind: string | null | undefined,
  classStartDate: string | null | undefined,
): Promise<string | null> {
  if (serviceKind !== 'class' || !studentId || !classStartDate) return null;
  const { data: campSeats } = await admin
    .from('camp_participants')
    .select('camp_instances:camp_instance_id!inner(camp_name, start_date, end_date, status, camp_templates:template_id(service_kind))')
    .eq('student_id', studentId)
    .eq('enrollment_status', 'active');
  for (const s of (campSeats as any[]) ?? []) {
    const inst = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    if (!inst) continue;
    const kind = (Array.isArray(inst.camp_templates) ? inst.camp_templates[0] : inst.camp_templates)?.service_kind;
    if (kind === 'surf_camp' && inst.status !== 'cancelled'
        && inst.start_date <= classStartDate && classStartDate <= inst.end_date) {
      return (inst.camp_name ?? 'Surf Camp').split(' · ')[0];
    }
  }
  return null;
}
