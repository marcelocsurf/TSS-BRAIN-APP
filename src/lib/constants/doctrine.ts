// ═══ Doctrina viva — constantes compartidas (cliente + server) ═══
export type MaterialKind = 'lesson' | 'drill' | 'mission' | 'coach' | 'page' | 'quiz' | 'game' | 'brand' | 'manual' | 'metodo' | 'course' | 'intake' | 'front_desk' | 'app';
export const MATERIAL_KINDS: MaterialKind[] = ['lesson', 'drill', 'mission', 'coach', 'page', 'quiz', 'game', 'course', 'intake', 'front_desk', 'app', 'brand', 'manual', 'metodo'];
export const MATERIAL_LABELS: Record<MaterialKind, string> = {
  lesson: 'Lección', drill: 'Drill', mission: 'Misión', coach: 'Ficha coach', page: 'Página de secuencia', quiz: 'Quiz', game: 'Juego',
  course: 'Curso', intake: 'Intake', front_desk: 'Front desk', app: 'App', brand: 'Marca', manual: 'Manual v10', metodo: 'El Método',
};
// Filosofía y marca (2026-09-11): las reglas que tocan marca, manual o El
// Método viven en su propia pestaña dentro de la misma Doctrina viva.
export const BRAND_KINDS: MaterialKind[] = ['brand', 'manual', 'metodo'];
export const isBrandRule = (applies: MaterialKind[]) => applies.some((k) => BRAND_KINDS.includes(k));
export const DOCTRINE_BELTS = ['all', 'pre', 'white', 'yellow', 'blue', 'purple', 'brown', 'black'] as const;
