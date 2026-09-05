# PENDIENTES — TSS BRAIN / The Surf Sequence
**Lista general del app y del proyecto.** Una sola lista, por bloques, para ir tachando.
Actualizada: 2026-09-05. Detalle legal en `AUDITORIA_LEGAL.md`; informe técnico en `INFO_DECRETO722.md`.

---

## 1. LEGAL (lo que NO se pudo resolver con código)

Construido el 2026-09-05: política de privacidad y términos en `/legal/privacy` y `/legal/terms` (EN + ES), links en website, quiz, QR de clases, intake, regalo del libro, activación, "email me my link" y pie de todos los correos; consentimiento expreso de datos de salud (obligatorio) y de imagen (opt-in con alcance) en intake y QR; tutor registrado para menores; aceptación de términos al entrar al portal con versión, fecha, IP y navegador; función "anonimizar ficha" en la ficha del alumno (admin/coordinador) con rastro en auditoría.

Queda pendiente y necesita a Marcelo o a un abogado:
- [ ] **Revisión por abogado salvadoreño** de: política de privacidad, términos, waiver de alumno y de coach (el código los marca como borrador). Confirmar razón social exacta y domicilio de Enkrateia, S.A. de C.V. en los textos.
- [ ] **Datos de salud históricos**: 1,610 fichas tienen datos de salud sin consentimiento expreso (se cargaron antes de hoy). Decidir: pedir consentimiento por email a los activos, o dejar que se capture en su próxima firma de intake/QR (hoy pasa solo si vuelven a firmar).
- [ ] **Autorización parental como documento aparte** (hoy: nombre del tutor + su aceptación en el mismo waiver). El abogado dice si alcanza.
- [ ] **Aceptar los DPA** (acuerdos de tratamiento de datos) en los paneles de Supabase, Vercel y Resend, y guardar copia.
- [ ] **Contrato con coaches** (rol, pago, propiedad intelectual, confidencialidad, uso de marca).
- [ ] **Acuerdo de licencia del método + tratamiento de datos con cada academia afiliada.**
- [ ] **Registro de marca** "The Surf Sequence" (y ONE WAVE) en el CNR: confirmar vigencia antes de seguir usando ®.
- [ ] **Política de retención**: definir plazo (propuesta: 12 meses) para borrar leads y quizzes que no se convirtieron; después se automatiza en el cron.
- [ ] **Procedimiento de brechas** (1 página): quién responde, en cuánto tiempo, a quién se avisa.
- [ ] **Email de privacidad**: hoy los textos dicen info@thesurfsequence.com. Si se quiere uno dedicado (privacy@), crearlo y cambiar `LEGAL_CONTACT_EMAIL` en `src/lib/legal/versions.ts`.
- [ ] **Portal del coach**: no pide aceptar términos (solo firma el waiver de staff). Agregar la misma puerta cuando el abogado apruebe los textos.
- [ ] **Exportación de datos a pedido del titular** ("dame una copia"): hoy se hace a mano desde la ficha; falta un botón que genere el archivo.
- [ ] **Cookies**: si algún día se agrega analítica o píxeles al website, hace falta banner.
- [ ] **IA**: el día que el producto procese datos con IA (video, recomendaciones), actualizar la sección 8 de la política ANTES de encenderlo.

## 2. DECRETO 722 (trámite)
- [ ] Marcelo revisa `INFO_DECRETO722.md` (especialmente la redacción de autoría en la sección 6) y lo envía.
- [ ] Decidir si se declara "0 pruebas automatizadas" o se agrega una base mínima de tests antes.

## 3. CURRÍCULO Y EVALUACIÓN
- [ ] **Revisión paso a paso de los 49 criterios White→Blue** (artefacto `belts-criterios`). Después: aplicar a la base (lecciones → criterios → títulos → drills; tipo "juego" después).
- [ ] Decisiones abiertas de contenido: STP-027 cinco palabras · STP-033 Stage 4 en la misión · STP-031 doctrina del peso en el pump · STP-044 mano en Tapaloco · key_words vs lección en STP-039/048/049 · nombre de la Secuencia #12.
- [ ] 4 lecciones nuevas + 3 decisiones de Marcelo pendientes de la coherencia del curso (2026-08-31).
- [ ] Objetivo elegible en el plan de práctica (criterio flojo / palabra del paso) en vez de texto libre.
- [ ] Next focus con tipo (misión / palabra): diferido hasta ver adopción del texto libre.
- [ ] Bloques: 8 superficies sin migrar a la numeración del documento; STP-039B solo vive en la base.

## 4. BLUEPRINT DEL ECOSISTEMA (cuenta ≠ membresía)
- [ ] Membresía como dato en la cuenta + gate de Let's Play por membresía (curso solo ve curso + drills).
- [ ] Alta de curso "encender + mandar link" en un clic (hoy: códigos que exigen intake + waiver).
- [ ] Cobro online: Wompi tiene webhook para el libro; falta cuenta activa + checkout para curso, membresía y Student License.
- [ ] Assessment $99 con snapshots guardados.
- [ ] Reset de septiembre (arranque oficial de Puro Surf en 0, sesión aparte, cortar 6-sep).

## 5. PORTAL Y PRODUCTO
- [ ] PIN de alumno: segundo identificador para entrar sin el link.
- [ ] Portal bilingüe por `students.languages` (idea guardada, no aprobada).
- [ ] Vista de alumno para Venue Scout (linkear guía del spot desde el safety check).
- [ ] Analizador de video: punto 5 (sincronizar videos) y siguientes del plan de 8.
- [ ] Comunidad: Marcelo carga 6-8 piezas y prueba el panel.
- [ ] Warm-up: video.
- [ ] Ola 2 de competencias HP + evaluación profunda opcional.
- [ ] Bug eval_date vs created_at en acceso HP.

## 6. WEBSITE
- [ ] Páginas Home / Courses / High Performance (el paquete de diseño solo trajo The Method).
- [ ] Links de video de cada servicio (Marcelo) y video de Discover Surfing.

## 7. OPERACIÓN Y ADMIN
- [ ] Planificación de capacidad y ocupación de ventas agregada en Services.
- [ ] Editor E2 del método una generación atrás.
- [ ] Precios de asientos del camp de Stanley.
- [ ] Infra: Vercel sensitive keys + leaked-password protection en Supabase (Marcelo).
- [ ] Host de prueba (`marcelocsurf+host@gmail.com`) sigue activo en prod: borrar o asignar persona real.
- [ ] Kevin Castillo: completar perfil + waiver de staff.
- [ ] Alumno de prueba "Test Experimentado": hoy tiene términos aceptados por el E2E de 2026-09-05; no toca a nadie real.

## 8. CALIDAD
- [ ] Pruebas automatizadas: hoy 0. Mínimo sugerido: acciones de compuerta (gift, materials, anonymize, lets-play) con datos de prueba.
- [ ] Definir plazo de limpieza de la carpeta `scripts/` (importadores viejos).
