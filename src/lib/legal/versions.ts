// Versiones de los documentos legales. Al cambiar un texto de forma material,
// subir la versión: el portal vuelve a pedir la aceptación a todos.
// Seguro para importar desde el cliente (no hay nada de servidor acá).
export const PRIVACY_VERSION = '2026-09-05';
export const TERMS_VERSION = '2026-09-05';

export const LEGAL_CONTACT_EMAIL = 'info@thesurfsequence.com';
export const LEGAL_ENTITY = 'Enkrateia, S.A. de C.V.';
export const PRIVACY_URL = 'https://app.thesurfsequence.com/legal/privacy';
export const TERMS_URL = 'https://app.thesurfsequence.com/legal/terms';

// Versión combinada que se guarda en students.terms_version.
export const CURRENT_LEGAL_VERSION = `${TERMS_VERSION}+${PRIVACY_VERSION}`;
