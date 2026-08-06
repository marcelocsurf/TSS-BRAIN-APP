// Qué se puede reservar por el QR público (/join/[slug]).
// Clases + trips + lecciones sueltas (Discover / drop-in). Los camps quedan
// fuera a propósito — se venden por seller/coordinador.
//
// Una sola fuente de verdad: el listado, el alta y los cupones tienen que
// coincidir. Cuando no coincidían, la clase salía en la lista pero el alta
// respondía "Class not found."
export const PUBLIC_BOOKABLE_SERVICE_KINDS = ['class', 'trip', 'surf_lesson'] as const;

export type PublicBookableServiceKind = (typeof PUBLIC_BOOKABLE_SERVICE_KINDS)[number];

export const isPublicBookableServiceKind = (kind: string | null | undefined): boolean =>
  !!kind && (PUBLIC_BOOKABLE_SERVICE_KINDS as readonly string[]).includes(kind);
