// Constantes/tipos compartidos del reporte de ingresos. Van en un módulo
// normal (NO 'use server') porque un archivo 'use server' solo puede exportar
// funciones async — no objetos como SERVICE_LABELS.

export const SERVICE_ORDER = ['camp', 'class', 'lesson', 'trip', 'custom', 'other'] as const;
export type ServiceBucket = (typeof SERVICE_ORDER)[number];

export const SERVICE_LABELS: Record<ServiceBucket, string> = {
  camp: 'Camps',
  class: 'Clases',
  lesson: 'Lecciones',
  trip: 'Trips',
  custom: 'Custom',
  other: 'Otro',
};

export function serviceBucket(serviceKind: string | null | undefined): ServiceBucket {
  switch (serviceKind) {
    case 'surf_camp': return 'camp';
    case 'class': return 'class';
    case 'surf_lesson': return 'lesson';
    case 'trip': return 'trip';
    case 'custom': return 'custom';
    default: return 'other';
  }
}
