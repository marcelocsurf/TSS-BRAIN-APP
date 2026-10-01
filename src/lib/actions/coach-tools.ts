// Tipos de las ayudas visuales por paso (content_videos.step_id, M64). La
// "STP Library" de Herramientas que leía esto se mudó el 2026-10-01 a las
// páginas de secuencia del coach (la hoja de cada paso, "Coach · run it"), y
// /coach-portal/[token]/tools/[stepId] solo redirige. Queda el tipo que usa
// StpMediaGrid (el plan del camp).

export type StpMedia = {
  id: string;
  url: string;
  label: string | null;
  caption: string | null;
  media_type: 'video' | 'image' | 'diagram' | 'document';
  display_order: number;
};
