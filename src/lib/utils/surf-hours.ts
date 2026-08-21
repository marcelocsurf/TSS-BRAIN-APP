// ─── Horas de agua — FÓRMULA ÚNICA (portal del alumno Y ficha del dashboard) ───
//
// Entreno = duraciones de misiones/drills propios + duraciones de sesiones
// con coach. Free surf = registros free_surf + el excedente de agua más allá
// de la misión. Cambiarla acá cambia AMBAS superficies a la vez — a propósito:
// la ficha nunca puede contradecir lo que el alumno ve en su portal.

export interface SurfHoursSplit {
  trainingMinutes: number;
  freeSurfMinutes: number;
  totalMinutes: number;
}

export function coachSessionMinutes(s: any): number {
  return (
    s.standalone_sessions?.duration_minutes
    || s.duration_minutes
    || (s.total_duration ? parseInt(s.total_duration, 10) || 0 : 0)
  );
}

export function computeSurfSplit(coachSessions: any[], selfSessions: any[]): SurfHoursSplit {
  const coachMinutes = (coachSessions ?? []).reduce((sum: number, s: any) => sum + coachSessionMinutes(s), 0);

  let surfTrainingMinutes = 0;
  let freeSurfMinutes = 0;
  for (const s of selfSessions ?? []) {
    const dur = s.duration_minutes || 0;
    const water = s.total_water_minutes || 0;
    if (s.kind === 'free_surf') {
      freeSurfMinutes += water || dur;
    } else {
      surfTrainingMinutes += dur;
      if (water > dur) freeSurfMinutes += water - dur;
    }
  }
  surfTrainingMinutes += coachMinutes;

  return {
    trainingMinutes: surfTrainingMinutes,
    freeSurfMinutes,
    totalMinutes: surfTrainingMinutes + freeSurfMinutes,
  };
}
