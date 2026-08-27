// Qué servicios llevan EVALUACIÓN DE CINTA y cuáles no.
//
// Una evaluación de cinta son 25 a 55 pasos por alumno: tiene sentido al
// cerrar un camp de seis días, no al terminar un Discover Surfing de dos horas.
//
// Esto vivía repetido en tres condiciones de SessionPlanner y una se quedó
// atrás: la del cartel "Evaluación final pendiente" excluía 'class' y 'trip'
// pero NO 'surf_lesson', así que a un Discover Surfing le salía la evaluación
// de nivel entera. Una sola fuente para que no se vuelvan a desincronizar.

/** Servicios que NO gradúan cinta: se cierran con el análisis del día. */
export const NON_BELT_SERVICE_KINDS = ['class', 'trip', 'surf_lesson'] as const;

/**
 * true = al cerrar corresponde la evaluación oficial de la cinta.
 * Un servicio sin service_kind se trata como camp (es lo que había antes).
 */
export function usesBeltEvaluation(serviceKind: string | null | undefined): boolean {
  return !NON_BELT_SERVICE_KINDS.includes(
    (serviceKind ?? '') as (typeof NON_BELT_SERVICE_KINDS)[number]
  );
}
