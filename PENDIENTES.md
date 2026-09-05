# PENDIENTES — TSS BRAIN / The Surf Sequence
**Lista general del app y del proyecto.** Una sola lista, por bloques, para ir tachando.
Actualizada: 2026-09-05. Detalle legal en `AUDITORIA_LEGAL.md`; informe técnico en `INFO_DECRETO722.md`; restauración en `RECUPERACION.md`.

---

## 0. LO QUE SOLO PUEDE HACER MARCELO — esta semana

**Seguridad y respaldo (30 minutos en total)**
- [ ] **Token de GitHub con permiso `workflow`**: GitHub → Settings → Developer settings → Personal access tokens → tu token → Edit → marcar **workflow** → Update. Sin esto el archivo `.github/workflows/backup.yml` no se puede subir (hoy está en la Mac, sin subir). Avisar a Claude y lo sube.
- [ ] **Dos secretos en GitHub** (repo TSS-BRAIN-APP → Settings → Secrets and variables → Actions → New repository secret), mismos valores que en Vercel: `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Opcionales del backup: `SUPABASE_DB_URL` (Supabase → Connect → Session pooler, con la contraseña de la base → agrega un pg_dump completo con logins de coaches) y `BACKUP_PASSPHRASE` (frase larga guardada en el gestor de contraseñas → cifra el paquete).
- [ ] **Primer backup a mano**: GitHub → Actions → "Backup semanal" → Run workflow → verlo en verde y bajar el artifact una vez para saber dónde queda.
- [ ] **Plan de Supabase**: Settings → Billing. Free no tiene backups propios; Pro guarda 7 días. Decidir si se sube a Pro (~$25/mes) y confirmar que la tarjeta no vence.
- [ ] **Verificación en dos pasos** en Google (el Gmail que sostiene todo), GitHub, Vercel y Supabase + correo de recuperación distinto en Google.
- [ ] **Gestor de contraseñas**: guardar los 9 secretos de `.env.local` (lista en `RECUPERACION.md` §2), la contraseña de la base de Supabase, el token de GitHub y la `BACKUP_PASSPHRASE`.
- [ ] Vercel → marcar las llaves como *Sensitive*; Supabase → Auth → activar *leaked password protection*.

**Legal (con abogado)**
- [ ] Mandar a revisar con abogado salvadoreño: `/legal/privacy`, `/legal/terms` y los dos waivers (alumno y coach). Confirmar razón social y domicilio de Enkrateia, S.A. de C.V.
- [ ] Aceptar los DPA en los paneles de Supabase, Vercel y Resend y guardar copia.

**Trámite**
- [ ] Revisar `INFO_DECRETO722.md` (sección 6, autoría) y enviarlo.

**Producto (decisiones)**
- [ ] Revisar paso a paso los 49 criterios White→Blue (artefacto `belts-criterios`) y dar el "dale" para aplicarlos a la base.
- [ ] Decidir qué hacer con las 1,610 fichas con datos de salud sin consentimiento expreso (pedirlo por email o esperar a su próxima firma).

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
- [ ] Backup semanal: construido y probado (125 tablas, 70 archivos, 0 errores); encenderlo = sección 0. Después de Claude: subir el workflow, correrlo y confirmar el primer artifact; escribir `scripts/restore-json.mjs` (restauración desde los JSON en orden de dependencias) el día que se quiera ensayar una restauración completa.
- [ ] Ensayo de restauración: una vez al trimestre, bajar el artifact y restaurarlo en un proyecto Supabase de prueba (`RECUPERACION.md` §3) para comprobar que el backup sirve.
- [ ] Alerta de vencimiento de tarjeta (Supabase y Vercel) en el calendario.
- [ ] Planificación de capacidad y ocupación de ventas agregada en Services.
- [ ] Editor E2 del método una generación atrás.
- [ ] Precios de asientos del camp de Stanley.
- [ ] Host de prueba (`marcelocsurf+host@gmail.com`) sigue activo en prod: borrar o asignar persona real.
- [ ] Kevin Castillo: completar perfil + waiver de staff.
- [ ] Alumno de prueba "Test Experimentado": hoy tiene términos aceptados por el E2E de 2026-09-05; no toca a nadie real.

## 8. CALIDAD — cabos sueltos (2026-09-05), en orden de daño
- [x] Snapshot del esquema en el repo: `supabase/schema_snapshot_2026-09-05.sql` (123 tablas, 24 funciones, 508 constraints, 149 índices, 18 triggers, 158 políticas, 5 buckets, 2 cron jobs). Se valida en el primer ensayo de restauración. (2026-09-05)
- [ ] **Pruebas de compuertas** (~30): libro/materials, gift, anonymize, token del portal, lets-play, checkCoachAccessToStudent. (Claude, 2-3 sesiones)
- [ ] **Staging separado de producción**: hoy dev y prod usan la misma base. Rama de Supabase o proyecto copia cuando se pase a plan Pro. (Marcelo decide, Claude configura)
- [x] Limpieza de prueba en prod (2026-09-05): Host Prueba borrado; columna `students.is_test` (migración 00185) marcada en los 5 alumnos de prueba (no se pueden borrar: tienen camps y sesiones colgando).
- [ ] **Excluir `is_test` de reportes, embudo y correos** (hoy la marca existe pero nadie la filtra). (Claude, 1 sesión)
- [ ] **Coaches de prueba que quedan** — decidir Marcelo: "Coach prueba oso perezoso" (marcelo@purosurf.com, ¿es tu cuenta real?), "Gerente Prueba", "Seller Prueba" (academia Sandbox), "Psicóloga de Prueba" (¿la usa el portal de especialistas?).
- [ ] **Duplicados de alumnos — DECISIÓN DE MARCELO**: 480 grupos con mismo nombre + apellido + fecha de nacimiento (1,049 fichas) y 551 emails repetidos (1,240 fichas). Parte es por diseño (familias comparten email en el QR) y parte son fichas dobles reales (importación HP + QR + intake). Hace falta una pantalla de "unir fichas" que conserve historial; no se hace automático.
- [ ] **Unificar numeraciones** de bloques (3 numeraciones), pares viejo/nuevo de drills, STP-039B: junto con la revisión de los 49 criterios. (después del "dale" de Marcelo)
- [ ] **Limpieza de código sin cambiar comportamiento**: quitar `as any` declarando tipos, borrar `.bak`, `/sessions/old`, scripts de importación viejos, unificar errores a `{ok,error}`. Hacerla con las pruebas ya escritas. (Claude, 2 sesiones)
- [ ] **ARQUITECTURA.md** (2 páginas para un programador nuevo): cómo entra un alumno, cómo se guarda una sesión, dónde están las compuertas, qué tabla es la fuente de cada cosa. (Claude, 1 sesión)
- [ ] **Revisión de seguridad externa** (tercero, ~1 semana, US$2-5k en LatAm) antes de vender licencias a academias.
