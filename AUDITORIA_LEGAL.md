# Auditoría legal — TSS BRAIN / The Surf Sequence
**Fecha:** 2026-09-05 · **Alcance:** app.thesurfsequence.com, thesurfsequence.com, portales y formularios públicos.
**Base:** revisión del código fuente y de la base de producción. No es asesoría legal; es el mapa de lo que existe y lo que falta, para llevarlo a un abogado.

---

## Lo que YA existe

| Documento / mecanismo | Dónde | Estado |
|---|---|---|
| Waiver de responsabilidad (alumno), bilingüe ES/EN, 10 secciones, versión `tss-purosurf-2026-07` | `src/components/legal/WaiverContent.tsx`, se firma en intake y en /join | Marcado en el código como **BORRADOR, pendiente de revisión por abogado** |
| Waiver de coach (mismo texto + 3 cláusulas: confidencialidad, uso exclusivo con membresía, cese) | mismo archivo, firma en el portal del coach | Igual: borrador |
| Menores: el waiver lo firma el adulto responsable (intake y /join lo detectan por fecha de nacimiento) | `JoinFlow.tsx`, `intake-form.tsx` | Funciona; falta texto legal específico de autorización parental |
| Consentimiento de uso de imagen (`media_release_consent`) | checkbox en el intake | Existe, pero **viene marcado por defecto en "sí"** y no hay texto que explique para qué se usa la imagen |
| Registro de versión y fecha de firma del waiver (`waiver_version`, `waiver_signed_at`, `waiver_signed_by`) | tabla `students` | Bien: sirve como evidencia |
| Auditoría de acciones administrativas e impersonaciones | `audit_log`, `admin_impersonations` | Bien |
| Datos servidos sin URL pública (PDF del libro) y tokens por persona | `/api/materials` | Bien |
| Aviso de propiedad intelectual y "© 2026 Enkrateia SA de CV" | footer del website | Solo el símbolo; sin términos |

## Lo que NO existe (riesgo)

| # | Falta | Riesgo concreto | Prioridad |
|---|---|---|---|
| 1 | **Política de privacidad** (ningún texto en app ni website) | Se recolectan datos de 2,836 personas (nombre, email, teléfono, fecha de nacimiento, foto, Instagram, contacto de emergencia) sin informar qué se guarda, para qué, por cuánto tiempo ni con quién se comparte. Es el hueco más grande. | ALTA |
| 2 | **Datos de salud sin consentimiento específico**: 1,610 fichas tienen notas médicas, lesiones o alergias; 2,137 tienen "miedos/fobias"; también peso, altura, nivel de natación | Los datos de salud son categoría sensible en casi toda legislación (incluida la Ley de Protección de Datos Personales de El Salvador, 2024). Hoy se piden en el intake sin una casilla de consentimiento expreso ni explicación. | ALTA |
| 3 | **Menores (83 fichas con menos de 18 años)**: no hay autorización parental como documento, ni política de datos de menores | Un padre puede reclamar que nunca autorizó la recolección de datos, fotos ni la participación. El waiver "firmado por el adulto" no dice quién es ese adulto ni su relación. | ALTA |
| 4 | **Terceros que procesan datos no están declarados**: Supabase (base de datos y archivos, EE. UU.), Vercel (hosting), Resend (correos), Wompi (pagos), GitHub | Toda política de privacidad debe listarlos. Además, con Supabase/Vercel/Resend conviene tener aceptados sus Data Processing Agreements (son estándar, se aceptan en sus paneles). | ALTA |
| 5 | **Derecho a borrar / rectificar / exportar sus datos**: no hay canal. `archiveStudent` solo cambia un estado; el código dice "never delete data". No hay función de anonimización ni de exportación individual para el alumno | Si un usuario pide borrar sus datos y no hay forma de hacerlo, es incumplimiento directo. Necesita procedimiento (email o botón) + función técnica de anonimización que respete lo que sí hay que conservar (waiver firmado, facturas). | ALTA |
| 6 | **Términos y condiciones de uso del app y del portal** (membresía, curso, libro, Let's Play) | Nadie acepta nada al entrar al portal ni al usar el curso. Sin reglas de uso, cancelación, suspensión de cuenta, ni límite de responsabilidad por el contenido digital fuera del waiver presencial. | ALTA |
| 7 | **Términos de venta y reembolso** para el libro ONE WAVE (Wompi), códigos de curso, camps y clases por QR (hay cobro y política de 24 h en /booking, pero no está escrita como término aceptado) | Reclamos de consumidor (Defensoría del Consumidor) sin política publicada. | MEDIA |
| 8 | **Uso de inteligencia artificial**: hoy el producto NO usa IA en tiempo de ejecución (no hay claves de OpenAI/Anthropic en el código). La IA se usa en el desarrollo del software y en la redacción de contenido | No hay obligación de avisar mientras no procese datos del usuario con IA. Si más adelante se agrega (análisis de video, recomendaciones), hay que avisarlo en la política de privacidad **antes** de encenderlo. | BAJA hoy · ALTA si se agrega |
| 9 | **Cookies / rastreo**: no hay Google Analytics ni píxeles; solo cookies técnicas de sesión (Supabase Auth y `tss_student_session`) | No hace falta banner de cookies para cookies estrictamente necesarias, pero la política de privacidad debe mencionarlas. Si se agrega analítica, se necesita aviso. | BAJA |
| 10 | **Correos**: todos los envíos son transaccionales (portal link, recordatorios, encuestas, libro). No hay link de baja | Bien mientras sea transaccional. El correo del quiz al lead (“New surf-level quiz lead”) es interno; el correo al lead con resultado sí requiere aviso de privacidad al capturar el email. | MEDIA |
| 11 | **Consentimiento de imagen sin alcance**: el checkbox no dice si es para redes sociales, marketing, análisis de video interno, ni por cuánto tiempo | Un alumno puede reclamar uso indebido de su imagen aunque haya marcado "sí". Sumar que viene pre-marcado (debe ser opt-in). | MEDIA |
| 12 | **Contratos con coaches y academias afiliadas**: el waiver del coach cubre confidencialidad, pero no hay contrato de servicios, ni acuerdo de licencia del método con las academias (multi-tenant), ni acuerdo de tratamiento de datos entre TSS y cada academia (la academia ve datos de sus alumnos) | Disputas laborales o de propiedad intelectual con coaches; responsabilidad compartida por datos con academias. | MEDIA |
| 13 | **Aviso de seguridad y retención**: no hay política de cuánto tiempo se guardan datos de leads que nunca se convirtieron (240 intentos de quiz, leads del sitio) | Retención indefinida es difícil de justificar. Definir plazo y limpieza automática. | MEDIA |
| 14 | **Waiver sin revisión legal**: el propio código lo marca como borrador. Además la firma es un checkbox + nombre, sin captura de IP/user-agent como evidencia adicional | Puede impugnarse. Añadir registro de IP, fecha y versión (versión y fecha ya están). | MEDIA |
| 15 | **Marca registrada**: se usa "The Surf Sequence®" pero no se verificó en esta auditoría si el registro está vigente en El Salvador (CNR) | Usar ® sin registro es infracción. Confirmar. | MEDIA |
| 16 | **Notificación de brechas de seguridad**: no hay procedimiento escrito | La ley salvadoreña de datos exige avisar incidentes. Documento interno de 1 página. | BAJA |

---

## LISTA DE PENDIENTES (para ir tachando)

**Bloque A — hacerlo antes de seguir captando gente (semanas 1-2)**
- [ ] A1. Política de privacidad (ES + EN) publicada en thesurfsequence.com y enlazada desde: footer del website, quiz, /join, /intake, /gift, /activate, /my-portal, portal del alumno, y pie de cada correo. Debe listar: datos que se recolectan (incluidos salud, imagen y menores), finalidades, terceros (Supabase, Vercel, Resend, Wompi, GitHub), plazo de retención, derechos (acceso, rectificación, borrado, portabilidad) y el email de contacto para ejercerlos.
- [ ] A2. Términos y condiciones del app/portal (membresía, curso, libro, Let's Play, comunidad, suspensión de cuenta, límite de responsabilidad por contenido digital).
- [ ] A3. Casilla de consentimiento expreso para datos de salud en el intake y en /join (no pre-marcada), con texto corto: para qué se usan y quién los ve.
- [ ] A4. Autorización parental como documento aparte para menores: nombre del adulto, relación, y consentimiento de datos + imagen + participación.
- [ ] A5. Procedimiento de borrado: email `privacy@thesurfsequence.com` (o el que sea) + función `anonymizeStudent` en el app que borre identificadores y datos de salud, conservando solo el registro mínimo del waiver e historial de pagos. Registrar cada solicitud en `audit_log`.
- [ ] A6. Aceptación registrada: al entrar por primera vez al portal, aceptar términos + privacidad (guardar versión, fecha, IP).

**Bloque B — comercial (semanas 3-4)**
- [ ] B1. Términos de venta y política de reembolso (libro, códigos de curso, camps, clases por QR con regla de 24 h) enlazados desde /gift, /booking, /join y la página de compra.
- [ ] B2. Consentimiento de imagen rediseñado: opt-in, con alcance (redes, marketing, análisis interno), duración y forma de revocarlo.
- [ ] B3. Aviso de privacidad corto en el quiz al pedir el email.

**Bloque C — contratos con personas y empresas (mes 2)**
- [ ] C1. Revisión del waiver por abogado salvadoreño (alumno y coach) + captura de IP/user-agent al firmar.
- [ ] C2. Contrato de servicios o colaboración con coaches (rol, pago, propiedad intelectual, confidencialidad, uso de marca).
- [ ] C3. Acuerdo de licencia del método + acuerdo de tratamiento de datos con cada academia afiliada.
- [ ] C4. Aceptar los DPA de Supabase, Vercel y Resend desde sus paneles (guardar copia).
- [ ] C5. Confirmar registro de marca "The Surf Sequence" en el CNR (y si aplica, ONE WAVE).

**Bloque D — operativo interno (cuando se pueda)**
- [ ] D1. Política de retención: leads y quizzes sin conversión se borran a los N meses (job automático).
- [ ] D2. Procedimiento de respuesta a brechas de seguridad (1 página: quién, en cuánto tiempo, a quién se avisa).
- [ ] D3. Cláusula de IA lista en la política de privacidad para activarla el día que el producto procese datos con IA (análisis de video, recomendaciones).
- [ ] D4. Si se agrega analítica o píxeles al website: banner de cookies.

---

## Cifras de la base que sustentan la prioridad

| Dato | Valor |
|---|---:|
| Alumnos en la base | 2,836 |
| Con datos de salud (médico, lesiones o alergias) | 1,610 |
| Con "miedos/fobias" registrados | 2,137 |
| Menores de 18 con fecha de nacimiento | 83 |
| Waivers firmados con fecha | 162 |
| Con consentimiento de imagen en "sí" | 91 |
| Coaches | 39 |
| Intentos de quiz público guardados | 240 |
| Fichas archivadas | 0 (nunca se borra nada) |
