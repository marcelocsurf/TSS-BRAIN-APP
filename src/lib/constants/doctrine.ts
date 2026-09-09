// ═══ Doctrina viva — constantes compartidas (cliente + server) ═══
export type MaterialKind = 'lesson' | 'drill' | 'mission' | 'coach' | 'page' | 'quiz' | 'game' | 'brand';
export const MATERIAL_KINDS: MaterialKind[] = ['lesson', 'drill', 'mission', 'coach', 'page', 'quiz', 'game', 'brand'];
export const MATERIAL_LABELS: Record<MaterialKind, string> = {
  lesson: 'Lección', drill: 'Drill', mission: 'Misión', coach: 'Ficha coach', page: 'Página de secuencia', quiz: 'Quiz', game: 'Juego', brand: 'Marca',
};
export const DOCTRINE_BELTS = ['all', 'pre', 'white', 'yellow', 'blue', 'purple', 'brown', 'black'] as const;
