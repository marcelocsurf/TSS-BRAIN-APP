// ═══ EL MÉTODO — las áreas del negocio (fuente única) ═══
//
// Áreas FIJAS a propósito: las carpetas libres terminan en caos. Cada área
// tiene dos caras en /metodo: la bóveda (documentos) y la guía (checklist
// de desarrollo). Agregar un área = agregarla acá; el resto de la página
// se adapta solo.

export interface MethodArea {
  key: string;
  /** Nombre en pantalla (staff-facing → español). */
  label: string;
  /** Qué vive acá — una línea. */
  blurb: string;
  /** Nombre del ícono lucide (se resuelve en el componente). */
  icon: 'Compass' | 'Palette' | 'Award' | 'Briefcase' | 'TrendingUp' | 'Wrench' | 'Scale';
}

export const METHOD_AREAS: MethodArea[] = [
  {
    key: 'doctrina',
    label: 'Método & Doctrina',
    blurb: 'Canon, manuales por cinta, secuencias, One Wave.',
    icon: 'Compass',
  },
  {
    key: 'marca',
    label: 'Marca',
    blurb: 'Manual de marca, logos, tipografías, plantillas, fotografía.',
    icon: 'Palette',
  },
  {
    key: 'certificacion',
    label: 'Certificación',
    blurb: 'Sistema L1–L5, exámenes, rúbricas, credenciales.',
    icon: 'Award',
  },
  {
    key: 'negocio',
    label: 'Negocio',
    blurb: 'Plan de negocios, licenciamiento, pricing, finanzas.',
    icon: 'Briefcase',
  },
  {
    key: 'mercadeo',
    label: 'Ventas & Mercadeo',
    blurb: 'Estrategia, calendario de contenido, pitch, redes.',
    icon: 'TrendingUp',
  },
  {
    key: 'operaciones',
    label: 'Operaciones',
    blurb: 'Proveedores, merch, protocolos, contratos de staff.',
    icon: 'Wrench',
  },
  {
    key: 'legal',
    label: 'Legal & IP',
    blurb: 'Registro de marca, contratos de licencia, seguros.',
    icon: 'Scale',
  },
];

export const METHOD_AREA_KEYS = METHOD_AREAS.map((a) => a.key);
