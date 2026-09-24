# TSS BRAIN — Estado actual del sistema

**Documento técnico para expediente oficial**

| | |
|---|---|
| Aplicación | TSS BRAIN — plataforma de The Surf Sequence® y Puro Surf Academy |
| Repositorio | `marcelocsurf/TSS-BRAIN-APP`, rama `main` |
| **Commit de corte** | **`ed65bdda73e7f75d117569c62620f5a8c655fb64`** (`ed65bdd`) |
| Fecha y hora del commit | 2026-09-24, 10:44:44 (UTC−6) |
| Árbol de trabajo | Limpio — `git status --porcelain` devuelve 0 líneas |
| Base de datos medida | Proyecto Supabase de producción `cssewjefhnamconoyuso` |
| Momento de la medición de datos | 2026-09-24, 17:19:07 UTC |
| Tecnología | Next.js 14 (App Router) · TypeScript · React · Supabase (PostgreSQL) · Vercel · Resend |

---

## Nota metodológica — léase antes que nada

Este documento se construyó **leyendo el código fuente y consultando la base de datos de producción**. No contiene estimaciones. Cada afirmación se sostiene en una de tres cosas: una cita `archivo:línea`, una consulta SQL, o un comando reproducible.

Tres advertencias que condicionan la lectura:

1. **Las cifras están ancladas a un commit y a una hora.** El repositorio y la base están vivos. Durante la propia medición la tabla `students` pasó de 2.242 a 2.243 filas. Cualquier verificación posterior dará cifras iguales o mayores en las tablas de actividad diaria. Si este documento se presenta semanas después, **las cifras deben regenerarse**.

2. **La clasificación de módulos es un juicio, no un dato.** Para que sea auditable, el criterio está escrito abajo y cada módulo lleva su evidencia. Un tercero puede recalcularlo.

3. **Lo que no se pudo verificar está marcado como NO VERIFICADO** en la sección 7, en lugar de rellenarse con supuestos.

### Criterio de clasificación de módulos

| Estado | Condición |
|---|---|
| **COMPLETO** | Tiene ruta alcanzable **y** sus funciones de servidor se invocan desde la interfaz **y**, si guarda datos, sus tablas existen y contienen filas de producción. |
| **EN DESARROLLO** | Es alcanzable, pero tiene un hueco medido: tabla de respaldo vacía o casi vacía, interruptor apagado, o una ruta de código que devuelve un marcador de posición. |
| **PENDIENTE** | El código o la ruta no existe, o existe y **nada enlaza a él**. |

> **Sobre los marcadores TODO/FIXME:** no se usaron como evidencia, porque **este código no tiene ninguno**. La búsqueda estricta `grep -rnE "(//|/\*|\*)\s*(TODO|FIXME)\b" src` no devuelve resultados. Una búsqueda ingenua de «TODO» produce 52 falsos positivos porque *todo* es una palabra española corriente en los comentarios del proyecto. Ningún estado EN DESARROLLO de este documento se apoya en un TODO.

---

## 1. Estado de cada módulo

Se identificaron **61 módulos funcionales**. El estado de cada uno se determinó contando importadores reales fuera de `src/lib/actions/` y midiendo filas con `count(*)` exacto.

### 1.1 Resumen

| Estado | Módulos | Proporción |
|---|---|---|
| **COMPLETO** | 41 | 67,2 % |
| **EN DESARROLLO** | 17 | 27,9 % |
| **PENDIENTE** | 3 | 4,9 % |
| **Total** | **61** | 100 % |

| Línea de usuario | COMPLETO | EN DESARROLLO | PENDIENTE | Total |
|---|---|---|---|---|
| Academia / administración | 25 | 8 | 0 | 33 |
| Alumno | 10 | 1 | 0 | 11 |
| Instructor / coach | 8 | 4 | 0 | 12 |
| Alto rendimiento | 2 | 3 | 0 | 5 |
| Transversales sin destino | 0 | 0 | 3 | 3 |
| **Total** | **41** | **17** | **3** | **61** |

### 1.2 Módulos COMPLETOS (41)

**Línea academia / administración (25)** — gestión de alumnos (ficha, historial, altas, exportación); servicios y camps (plantillas, instancias, calendario, ocupación, día a día); personal (coaches, certificaciones, permisos por cinta); espacios y reservas; mostrador y cobro; transporte; inventario de tablas y material; biblioteca de materiales y otorgamientos; catálogo de drills y misiones; El Método (doctrina viva); reportes (9 módulos: ingresos, ocupación, ratings, cierres, membresías, embudo, P&L, experiencia, programas); encuestas por servicio; códigos de curso y otorgamientos; membresías; cupones; costos; auditoría; tareas e incidentes; captación de leads y quiz de nivel; academias; impersonación controlada; front desk; portal de gerente.

**Línea alumno (10)** — portal por token; curso en cuatro pestañas (Think · Feel · Do · Review); Let's Play (entreno por secuencia); Los Tres Círculos de Poder; el Infinite Circle; páginas de secuencia con estrellas por paso y por lado; Venue Check; el libro ONE WAVE y su link de regalo; ficha e intake con waiver; The Lineup (lectura).

**Línea instructor / coach (8)** — portal del coach por token (8 pestañas); planificador de sesión y cierre del día; «Teach it» (material del coach por secuencia); herramientas por paso; ficha de sus alumnos con filtro por servicio; hoja imprimible del plan; evaluación final de camp; ficha propia del coach.

**Línea alto rendimiento (2)** — programas de entreno (`program_items` 1.123 filas, `program_checkins` 800); portal del especialista.

### 1.3 Módulos EN DESARROLLO (17) y la razón medida de cada uno

| Módulo | Razón verificada |
|---|---|
| Plantillas de semana | `week_templates` 2 filas, `week_template_slots` 8 |
| Escenarios de capacitación | Solo 2 camps `is_test` creados |
| Requisiciones de compra | `inventory_requisitions` 0 filas |
| Nómina | `coach_payments` 0 filas — nunca se ha emitido un pago por la aplicación |
| Facturación y precios por academia | `academy_invoices` 0, `academy_course_prices` 0 |
| Correos y notificaciones | 3 de 19 interruptores apagados; la pantalla `/admin/emails` no tiene enlace desde el menú |
| Comunidad The Lineup | 1 publicación, 0 reacciones, 0 lecturas |
| Legal | Los dos textos se declaran borrador en el propio código |
| Curso del alumno | 187 de 197 lecciones activas caen en la ruta «Video Coming Soon»; los manuales de 3 cintas son tarjetas `COMING_SOON_MATERIALS` |
| Sesión en cascada | Tabla con 10 filas + una ruta duplicada huérfana |
| Plan multi-bloque | 10 sesiones creadas, 0 bloques guardados en `lesson_plan_blocks` |
| Evaluación del coach por el director | `coach_evaluations` 3 filas |
| Promoción de cinta (recomendación) | `belt_promotion_recommendations` 0 filas — la regla nunca ha disparado |
| Pruebas de agua | `water_tests` 0 filas |
| Cockpit HP | `hp_team_sessions` 1, `hp_messages` 1, `weekly_rankings` 2 |
| Temporada y especialistas | Sus 9 tablas tienen entre 1 y 9 filas |
| Competencias HP | `athlete_heats` 2, `heat_waves` 3 |

### 1.4 Módulos PENDIENTES (3) — código que existe y nada enlaza

| Módulo | Archivos | Evidencia |
|---|---|---|
| **Guía de respiración** | `src/components/breathing/BreathingGuide.tsx` (444 líneas) + `BreathingLauncher.tsx` (38) | Las únicas 4 referencias están dentro de la propia carpeta. Ningún archivo de `src/app` ni del resto de `src/components` lo importa. |
| **Foto de perfil (subida al bucket)** | `src/lib/actions/photos.ts` (83 líneas, 2 funciones) | Es el único de los 108 archivos de `src/lib/actions/` con **cero importadores en todo `src/`**. |
| **Ruta duplicada `/sessions/cascade`** | `src/app/(dashboard)/sessions/cascade/page.tsx` (57 líneas) | `diff` contra `/sessions/new/page.tsx` → idénticos. Ninguna referencia en el código; solo alcanzable escribiendo la URL. |

---

## 2. Las cuatro líneas de usuario

El sistema expone **125 patrones de URL**: 100 páginas (`page.tsx`) y 25 rutas de API o exportación (`route.ts`).

### 2.1 Los seis mecanismos de acceso

Al leer los guardas reales aparecen **seis** mecanismos, no dos:

| # | Mecanismo | Dónde se define | Quién lo usa |
|---|---|---|---|
| 1 | **Sesión Supabase** (email + contraseña) | `src/middleware.ts:94-96` + `src/app/(dashboard)/layout.tsx:108-111` | Academia / administración, y el coach por su segunda vía |
| 2 | **Token opaco en la URL** (`portal_token`) | `src/lib/actions/portal.ts:19-29` (alumno), `coach-portal.ts:139-149` (coach), `manager-portal.ts:50-57`, `front-desk.ts:13-23`, `specialist.ts:14-22` | Alumno, coach, gerente, mostrador, especialista HP |
| 3 | **Tokens de un solo propósito** (otras columnas) | `camp_experience_surveys.token`, `student_session_results.feedback_token`, `service_staff.response_token`, código de regalo del libro | Encuestas, feedback, confirmación de staff, regalo del libro |
| 4 | **Secreto de cron** en la cabecera `Authorization` | `src/app/api/cron/daily-reminders/route.ts:33-37` | Tareas programadas |
| 5 | **Comprobación propia dentro de la ruta de API** | p. ej. `src/app/api/coaches/invite/route.ts:21-33` | Las rutas `/api/`, que el middleware no cubre |
| 6 | **PIN del alumno** (4–6 dígitos) | `src/lib/actions/student-pin.ts` | Recuperación del enlace del portal y expulsión de un segundo dispositivo |

### 2.2 Línea (a) — Academia / administración

**Acceso: login con email y contraseña.** Todas sus rutas viven en el grupo `(dashboard)` (65 páginas + 12 rutas de API). Sobre el piso común del login, muchas pantallas aplican un segundo guarda por rol.

El rol efectivo se calcula en `src/app/(dashboard)/layout.tsx:137-139` y decide el menú. La lista `NAV_ITEMS` (`:52-97`) tiene 27 entradas filtradas por rol: **admin 23, coordinador 13, coach 6, asistente 3**.

**Qué puede hacer:** dar de alta y gestionar alumnos y su ficha completa; crear servicios, plantillas y camps; planificar el calendario y ver ocupación; asignar personal y transporte; reservar espacios; cobrar en el mostrador; gestionar inventario de tablas y material; otorgar cursos, materiales y membresías; administrar la doctrina del método; emitir nueve reportes; auditar; y —solo el dueño de plataforma— entrar al módulo de alto rendimiento.

### 2.3 Línea (b) — Alumno

**Acceso: token en la URL. El alumno nunca usa contraseña.**

| URL | Qué hace |
|---|---|
| `/portal/[token]` | Su portal, con hasta cinco pestañas: inicio, curso, Let's Play, The Lineup y su coach |
| `/portal/[token]/circles` | Los Tres Círculos de Poder |
| `/portal/[token]/loop` | El Infinite Circle |
| `/portal/[token]/seq/[seqId]` | Una secuencia: drills, misiones, video y sus estrellas |
| `/quiz` | El quiz de nivel, público |
| `/intake/[token]` | Llena su ficha, firma el waiver y los consentimientos |
| `/activate` | Canjea un código de curso y crea su ficha |
| `/my-portal` | Pide que le reenvíen su enlace |
| `/join/[slug]` | Se inscribe a una clase escaneando el QR impreso |
| `/booking/[id]` | Gestiona su reserva |
| `/one-wave/[code]` · `/gift/[code]` | Abre el libro ONE WAVE que le regalaron |

> **Hallazgo para el expediente:** el portal del alumno **se abre con la sola URL**. No hay PIN obligatorio como puerta (`src/app/portal/[token]/page.tsx:55-60` solo actúa sobre el estado «expulsado»). El PIN sirve para recuperar el enlace y para expulsar un segundo dispositivo, no como barrera de entrada.

### 2.4 Línea (c) — Instructor / coach

**Acceso: dos caminos, separados a propósito en el código.**

**Camino 1 — portal por token (el principal).** Exige **dos** condiciones, no una: el token *y* que `coaches.course_access_granted` sea verdadero (`src/lib/actions/coach-portal.ts:139-149`), comprobado de nuevo de forma independiente en las pantallas de secuencia y de enseñanza.

| URL | Qué hace |
|---|---|
| `/coach-portal/[token]` | Portal en 8 pestañas: inicio, cursos, herramientas, plan, evaluación, venta, espacios, inventario |
| `/coach-portal/[token]/students` y `/students/[studentId]` | Solo los alumnos de **sus** servicios; confirma cinta y regla del agua |
| `/coach-portal/[token]/teach/[seqId]` | «Teach it»: el material para dar esa clase |
| `/coach-portal/[token]/seq/[seqId]` | La secuencia con la capa del coach (qué, cómo entregarlo, errores, validación) |
| `/coach-portal/[token]/tools/[stepId]` | Drills, misiones y medios de un paso |
| `/coach-portal/[token]/plan/[campId]/print` | Hoja imprimible del plan del día |
| `/coach-portal/[token]/profile` | Su propia ficha |

El filtro de alumnos no es cosmético: el conjunto se construye desde `camp_participants` con estado `active` o `completed`, y la ficha individual devuelve `null` si el alumno no está en él (`src/lib/actions/coach-students.ts:88-95` y `:239`).

**Camino 2 — dashboard con login.** Da acceso a seis entradas: inicio, alumnos, espacios, Venue Scout, nueva sesión y borradores.

### 2.5 Línea (d) — Alto rendimiento

**Acceso: tres puertas distintas, y ninguna es un portal propio del atleta.**

| Puerta | URL | Acceso |
|---|---|---|
| **Cockpit del head coach** | `/hp`, `/hp/reporte/[studentId]`, `/programas`, `/reports/programas` | Login **+ `is_platform_admin`** — no basta el rol `admin` |
| **Portal de especialistas** | `/equipo/[token]`, `/equipo/[token]/print/[studentId]` | Token, vinculado a una temporada o con `specialist_role` |
| **Dentro del portal del alumno** | `/portal/[token]` | Bandera `students.hp_access`, otorgada a mano |

La línea HP **no añade rutas al portal del alumno**: se inyecta bajo la bandera. Hoy **21 alumnos** la tienen.

---

## 3. Recorrido real del usuario, de captación a certificación

Trazado sobre las rutas y funciones de servidor reales.

| # | Paso | Ruta | Función de servidor | Tablas que escribe | Condición para avanzar |
|---|---|---|---|---|---|
| 1 | **Captación** | `/quiz` → `quiz-v2.html` | `createLeadFromQuiz` (`quiz-lead.ts:41`) | `students`, `level_quiz_attempts` | Nombre, apellido, email o teléfono, y 10 respuestas válidas |
| 2 | **Ficha y firma legal** | `/intake/[token]` | `submitBasicIntake` (`intake.ts:115`) | `students` | 10 validaciones + waiver + consentimiento de salud + términos (`intake.ts:130-163`) |
| 3 | **Inscripción** | `/camps/new`, `/camps/[id]`, `/join/[slug]` | `createCampInstance`, `addStudentToCamp`, `publicEnroll` | `camp_instances`, `camp_participants`, `camp_sessions`, `service_plans`, `service_plan_blocks` | Cupo disponible y camp no iniciado |
| 4 | **Acceso al curso** | Automático al inscribir | `grantCourseToStudent` (`course-grants.ts:43`) | `course_grants`, `students.course_access_*`, `memberships` | La plantilla declara curso y el alumno no es refresher |
| 5 | **El camp día a día** | `/coach-portal/[token]` | `startServicePlan`, `saveServicePlanBlock`, `closeServicePlan` (`service-planner.ts`) | `service_plan_blocks`, `student_session_results`, `boards`, `audit_log` | El cierre marca la sesión como `completed` |
| 6 | **Entreno propio** | `/portal/[token]?tab=sequence` | `planSequenceSession`, `saveSequenceSession` (`lets-play.ts`) | `self_training_sessions`, `student_sequence_ratings`, `student_step_ratings` | Membresía vigente |
| 7 | **Evaluación y cinta** | `/coach-portal/[token]` o `/students/[id]` | `closeCampFinal` (`service-planner.ts:1595`) | `camp_final_evaluations`, `students`, `belt_promotion_recommendations` | Las seis compuertas de abajo |

**El candado del curso:** todo el contenido de cinta se ve pero permanece cerrado hasta el día antes del camp; solo el Pre-Course y el libro quedan abiertos.

### 3.1 Las seis compuertas de una promoción de cinta

1. **«Qué trabajar después» obligatorio** (`service-planner.ts:1616-1629`) — si algún acta trae menos de 5 caracteres, no se escribe nada.
2. **Todos los días del camp cerrados** (`:1665-1683`) — medido por `camp_sessions.session_status='completed'`. Solo aplica a camps desde el 2026-08-28.
3. **La barra de estrellas** — en el servidor, todo rating enviado debe ser ≥ 4 (`:1763-1770`). Las reglas por cinta viven en `src/lib/constants/graduation.ts:56-133`: White 25 pasos, Yellow 35, Blue 55, Purple 72.
4. **Solo hacia arriba** (`:1876-1879`) — nunca degrada.
5. **La regla del agua** (`graduation.ts:42-53`) — para Blue, Purple, Brown y Black exige nivel de océano semi-autónomo o superior.
6. **Certificación del coach** — si el coach no tiene autoridad para esa cinta, se genera una recomendación en vez del ascenso.

### 3.2 Qué acredita a un alumno — hallazgo relevante para el trámite

> **No existe en el código ningún certificado ni diploma** como documento emitido: no hay ruta, plantilla, función ni tabla que lo genere. Una búsqueda de «certificate», «diploma» y «certificado» sobre `src/`, `supabase/` y `public/` solo devuelve la certificación del **coach**, no la del alumno.
>
> **Tampoco existe verificación pública de una cinta:** ninguna ruta permite a un tercero comprobar el nivel de un alumno.

La credencial del alumno vive en tres registros:

| Qué acredita | Dónde vive |
|---|---|
| **El nivel oficial (la cinta)** | `students.belt_level` + `belt_provisional = false` + `belt_promoted_at` + `belt_promoted_from` |
| **El acta de graduación** | `camp_final_evaluations`: `approved`, `finalized_at`, `readiness_summary` |
| **El examen teórico del curso** | `course_final_quiz_attempts`, con 80 % para aprobar |

**La distinción que importa legalmente** es `belt_provisional`: `true` = nivel autodeclarado salido del quiz; `false` = validado por un coach con autoridad para esa cinta. Hoy **71 fichas** tienen cinta acreditada.

Los propios Términos acotan el alcance: *«una cinta describe tu nivel dentro del método, no garantiza tu seguridad en el mar»* (`src/app/legal/terms/page.tsx:84`).

---

## 4. Integración del módulo de alto rendimiento

El módulo HP **no es una aplicación aparte**: vive en el mismo repositorio y la misma base de datos que el resto de la plataforma.

### 4.1 Tablas

| Categoría | Cantidad | Detalle |
|---|---|---|
| **Exclusivas de HP** | 26 | Ningún archivo fuera del módulo las nombra. Las mayores: `program_items` (1.123 filas), `program_days` (280), `program_block_templates` (199), `hp_deep_evaluations` (31), `hp_athlete_profiles` (25) |
| **De HP, leídas desde fuera** | 2 | `program_checkins` (800) — su `flow_channel` alimenta el Flow Channel de cualquier alumno; `program_assignments` (23) — marca `has_hp` en la lista de alumnos |
| **Compartidas que HP consume** | 6 | `students`, `coaches`, `sequences`, `drills`, `drills_missions`, `self_training_sessions` |
| **Huérfana** | 1 | `hp_athlete_links` — 22 filas en producción, **cero referencias** en el código y en las migraciones |

Las 29 tablas del módulo tienen seguridad de fila activada y **cero políticas**: todo el acceso pasa por el cliente de servicio, que las salta.

### 4.2 Componentes

**Exclusivos de HP: 16 archivos, 4.953 líneas.** Diez tarjetas del portal del alumno (`ProgramCard` 799 líneas, `SeasonCard` 403, `AthleteProfileCard` 361, `CompetitionCard` 327 y otras), el portal del especialista (`SpecialistPortal` 862), tres tarjetas del portal del coach y el panel HP de la ficha del dashboard.

**Lo compartido:** el caparazón del portal del alumno (las tarjetas HP se insertan en `portal-tabs.tsx:1630-1666`); el caparazón del portal del coach; la ficha del alumno del dashboard; el constructor de línea de tiempo de temporada; y el bucket de imágenes `avatars`.

**Lo que HP no comparte:** el tema de cintas no se usa en ningún componente HP, y el cockpit define su propia paleta oscura en duro.

### 4.3 El instrumento de evaluación es distinto

HP **no usa el mismo instrumento** que el resto de la plataforma:

- **HP** — la *Evaluación Completa TSS*: 6 bloques (físico, técnica, maniobras, longboard, táctica, mental), 30 secciones, 142 ítems (`src/lib/constants/hp-eval-full.ts`). Guarda en `hp_deep_evaluations` (31 filas). La unidad es el **bloque y el pilar**.
- **Resto de la plataforma** — evaluación por secuencia y por paso, en `sequence_evaluations`, `student_step_ratings`, `ocean_level_evaluations`, `camp_final_evaluations` y `coach_criterion_evals`, tablas que **ningún archivo HP toca**. La unidad es la **secuencia y el paso**.

**El puente entre los dos:** `getMyAthleteScores` promedia los ítems de la última evaluación profunda por prefijo y alimenta la tarjeta del atleta en el portal.

### 4.4 Integración en las dos direcciones

**HP escribe en la plataforma:** al pasar lista de una sesión de equipo, crea filas en la bitácora compartida `self_training_sessions` — solo las sesiones de agua o mixtas acreditan minutos, y una sesión futura no acredita horas. También escribe `students.hp_access` y la foto de perfil.

**La plataforma lee de HP:** el Flow Channel del portal y el filtro de alumnos HP del dashboard.

**HP lee el método compartido:** la biblioteca del cockpit consulta `sequences`, `drills` y `drills_missions`, y un ítem de programa puede enlazar a un paso o un drill del método.

---

## 5. Qué falta por construir

### 5.1 El roadmap declarado

`PENDIENTES.md` es el único documento del repositorio que enumera trabajo por hacer: **85 casillas, 66 abiertas y 19 cerradas**.

| Bloque | Ítems abiertos |
|---|---|
| Legal (lo que no se resuelve con código) | 14 |
| Currículo y evaluación | 10 |
| Blueprint del ecosistema (cuenta ≠ membresía) | 8 |
| Portal y producto | 8 |
| Operación y administración | 8 |
| Calidad — cabos sueltos | 8 |
| Lo que solo puede hacer el titular | 6 |
| Decreto 722 (trámite) | 2 |
| Website | 2 |

### 5.2 Los diez ítems que declaran su tecnología

| Ítem | Tecnología declarada |
|---|---|
| Respaldo con volcado completo | `pg_dump` vía el *Session pooler* de Supabase, cifrado con passphrase |
| Política de retención de leads y quizzes | Automatización en el cron existente |
| Correo de privacidad dedicado | Cambio de constante en `src/lib/legal/versions.ts` |
| Aviso de vencimiento de membresía a 7 días | Columna nueva + el cron existente |
| **Cobro online de curso, membresía y licencia** | **Wompi** (el webhook del libro ya existe) |
| Ensayo trimestral de restauración | Proyecto Supabase de prueba |
| Pruebas que faltan (3 de 4) | **vitest** |
| Staging separado de producción | Rama de Supabase o proyecto copia |
| Unificar acciones que lanzan excepción | Patrón de retorno `{ok, error}` |
| Documento de arquitectura | Markdown |

**Los 56 ítems abiertos restantes no nombran tecnología: tecnología no especificada en el repositorio.** Incluyen las 14 tareas legales (revisión de abogado, DPA, contrato de coaches, licencia a academias, registro de marca, procedimiento de brechas, banner de cookies), las 10 de currículo, la página de venta del curso, el portal bilingüe y las páginas pendientes del sitio web.

### 5.3 Deuda técnica medida

| Deuda | Cifra verificada | Tecnología |
|---|---|---|
| Cobertura de pruebas | **54 casos** en 2 archivos, corriendo en el gancho de pre-push | vitest |
| Filtro de datos de prueba en reportes | De 9 módulos de reportes, **solo 1 filtra** los registros de prueba | no especificada |
| Tipado laxo | **1.083** usos de `as any` en `src/` | TypeScript |
| Acciones que lanzan excepción | **305** `throw new Error` en 108 archivos de acciones | patrón `{ok, error}` |
| **Ejecutor de migraciones** | **No existe.** 211 archivos numerados, aplicados a mano; la tabla de control de producción tiene 133 filas con otro esquema de versión: **no hay trazabilidad automática** entre archivo y migración aplicada | no especificada |
| Numeración de migraciones | Va de 00001 a 00215 con huecos en 4 posiciones y 4 archivos compartiendo el prefijo 00021 | no aplica |
| Respaldo semanal | **Encendido** — domingos 06:00 UTC, retención 90 días | GitHub Actions |

### 5.4 Trece tablas construidas y sin uso en producción

Tienen estructura, restricciones y políticas, y en 11 de los 13 casos **el código ya está escrito y cableado**. Lo que falta no es programación sino puesta en operación: `coach_payments`, `academy_invoices`, `academy_course_prices`, `belt_promotion_recommendations`, `staff_members`, `inventory_requisitions`, `lesson_plan_blocks`, `water_tests`, `camp_student_customizations`, `community_reactions`, `community_reads`.

Las dos restantes son **código muerto**: `board_clearance` y `student_solo_sessions` no tienen ni una línea de aplicación que las lea o escriba.

### 5.5 Cinco ítems del roadmap que el código ya resolvió

Un expediente no debe declarar como faltante algo que está en producción:

| Ítem listado como abierto | Estado real |
|---|---|
| PIN del alumno | **Construido y en uso** — 69 alumnos ya tienen PIN configurado |
| Analizador de video: sincronizar videos | **Construido** |
| Bug de fecha en acceso HP | **Corregido** |
| Pruebas de Let's Play | **Parcialmente resuelto** — 1 de 4 ya cubierta |
| Host de prueba activo en producción | **No se encuentra** esa cuenta |

---

## 6. Cifras

Todas medidas en el commit `ed65bdd` (2026-09-24 10:44:44 UTC−6) y en la base a las 17:19:07 UTC del 2026-09-24.

### 6.1 Repositorio

| Métrica | Valor | Comando |
|---|---|---|
| Commits | **1.440** | `git rev-list --count HEAD` |
| Primer commit | 2026-03-12 | `git log --reverse` |
| Último commit | **`ed65bdd`**, 2026-09-24 10:44:44 −0600 | `git log -1` |
| Archivos TypeScript (`.ts`/`.tsx`) en `src/` | **632** | `find src -name '*.ts' -o -name '*.tsx'` |
| **Líneas en `src/`** | **142.665** | de las cuales **122.129 de código**, 10.146 de comentario, 10.390 en blanco |
| Migraciones SQL | **211 archivos**, 44.491 líneas | `ls supabase/migrations/*.sql` |
| **Total de líneas del proyecto** | **205.587** en 913 archivos | todos los archivos versionados en git (ver desglose 6.1.1) |
| Rutas de página (`page.tsx`) | **100** | `find src/app -name page.tsx` |
| Rutas de API (`route.ts`) | **25** | `find src/app -name route.ts` |
| **Total de patrones de URL** | **125** | suma de las dos anteriores |
| Componentes (`.tsx` en `src/components`) | **219** | `find src/components -name '*.tsx'` |
| Archivos con funciones de servidor | **115** | `grep -rl "'use server'" src/` (108 en `src/lib/actions/` + 7 fuera) |
| **Funciones de servidor exportadas** | **676** | en esos 115 archivos |
| — contadas solo sobre `src/lib/actions/*.ts` | 653 | base usada por el informe anterior; se da para permitir la comparación |
| Casos de prueba automatizados | **54** | corrida real de vitest, en el gancho de pre-push |

#### 6.1.1 Líneas por lenguaje

Contadas sobre los **1.074 archivos versionados en git** —lo que excluye dependencias, artefactos de compilación y copias de trabajo—, de los cuales 913 son de código:

| Lenguaje | Archivos | Líneas |
|---|---:|---:|
| TypeScript con JSX (`.tsx`) — interfaz | 392 | 86.929 |
| TypeScript (`.ts`) — lógica de servidor, acciones, utilidades | 243 | 55.806 |
| SQL (`.sql`) — migraciones, funciones, políticas e instantáneas de esquema | 244 | 52.196 |
| HTML estático — herramientas públicas, sitio web, manual | 8 | 6.809 |
| JavaScript / ESM (`.mjs`, `.js`) — scripts y service worker | 15 | 2.520 |
| Python (`.py`) — scripts de limpieza de contenido | 6 | 874 |
| CSS | 5 | 453 |
| **TOTAL** | **913** | **205.587** |

### 6.2 Base de datos de producción

| Métrica | Valor |
|---|---|
| Tablas base | **155** |
| — de ellas, respaldos operativos `ops_*` | 26 |
| — **tablas funcionales** | **129** |
| Vistas | 2 |
| Columnas de tablas base | **2.266** |
| Funciones propias de PostgreSQL | **214** |

### 6.3 Volumen de operación

| Tabla | Filas |
|---|---|
| `service_plan_blocks` | 4.172 |
| `students` | 2.243 |
| `student_step_ratings` | 1.882 |
| `notifications` | 1.247 |
| `program_items` | 1.123 |
| `camp_sessions` | 907 |
| `program_checkins` | 800 |
| `self_training_sessions` | 714 |
| `audit_log` | 580 |
| `space_bookings` | 503 |
| `camp_instances` | 429 |
| `camp_participants` | 416 |
| `service_plans` | 400 |

### 6.4 El embudo, medido

| Etapa | Alumnos |
|---|---|
| Fichas totales | **2.243** (2.195 leads · 47 miembros) |
| Hizo el quiz de nivel | 253 |
| Completó el intake | 180 |
| Se inscribió a un servicio | 236 |
| Tiene curso vigente | 117 |
| Tiene membresía activa | 139 |
| Tiene sesión cerrada por un coach | 136 |
| Cerró entreno propio | 32 |
| Tiene acta de camp | 54 (5 aprobadas) |
| Nivel de océano evaluado | 45 |
| **Ascenso de cinta sellado** | **1** |
| Cinta acreditada (no provisional) | 71 |
| Acceso a alto rendimiento | 21 |

---

## 7. Lo NO VERIFICADO

Se declara expresamente lo que **no** se pudo confirmar:

1. **Despliegue efectivo de las rutas.** Se verificó la existencia de los 125 patrones de URL en el árbol de archivos, **no** su alcance en producción. No se consultó el panel de Vercel.
2. **Comportamiento en tiempo de ejecución de los guardas de acceso.** Todo lo afirmado se deduce de leer el código fuente.
3. **Políticas de seguridad de fila (RLS) del resto del esquema.** Se verificaron las del módulo HP (29 tablas, cero políticas). No se auditaron las demás.
4. **Descripción funcional de 14 pantallas del dashboard** que no tienen título literal ni comentario de cabecera. Se describió **qué componente montan**, que es verificable, no qué hace el usuario dentro.
5. **Valores de las variables de entorno en Vercel.** El código usa 12 variables distintas; 5 de ellas apagan una función si faltan. Qué valor tienen en producción no se consultó y no hay archivo en el repositorio que lo declare.
6. **La discrepancia de waivers — señalada por su relevancia legal.** Hay **2.066 fichas con `waiver_signed = true` pero solo 200 con fecha de firma**, y 2.065 siguen sin intake. Se verificó que las tres rutas de firma del código **siempre** escriben la fecha junto con la marca. **No se pudo determinar el origen** de las ~1.866 filas sin fecha; requeriría revisar las migraciones de importación. Para un expediente legal, la fecha de firma es el dato que importa.
7. **Consentimiento de datos de salud.** **1.216 fichas** tienen dato de salud registrado sin consentimiento expreso asociado. Se deja señalado, no resuelto.

---

## 8. Advertencia — el informe del trámite está desactualizado

El repositorio contiene `INFO_DECRETO722.md`, el informe técnico del propio trámite. **Sus cifras ya no son ciertas**, y presentarlo sin corregir introduciría datos falsos en el expediente:

| Dato en `INFO_DECRETO722.md` | Declara | Valor real hoy |
|---|---|---|
| Tablas en producción | 123 | **155** (129 funcionales) |
| Archivos de migración | 183 | **211** |
| Commits | 1.119 (hasta 2026-09-05) | **1.440** (hasta 2026-09-24) |
| Funciones de servidor | 602 | **653** sobre la misma base (`src/lib/actions/*.ts`); 676 contando las 7 de fuera |
| Componentes de interfaz | 198 | **219** |
| Pantallas | 90 | **100** |
| Funciones propias de PostgreSQL | 24 | **214** |
| Líneas de código (todos los lenguajes) | ≈184.946 en 770 archivos | **205.587** en 913 archivos |

Además, su lista nominal de tablas incluye `board_clearance` y `student_solo_sessions`, que ninguna línea de la aplicación utiliza.

**Una decisión abierta que conviene cerrar antes de presentar:** el roadmap deja pendiente «decidir si se declara *0 pruebas automatizadas*». **Declarar cero sería inexacto**: hoy hay 54 casos de prueba que corren automáticamente antes de cada publicación.

---

*Documento generado el 2026-09-24 a partir del código en el commit `ed65bdd` y de la base de producción `cssewjefhnamconoyuso`. Las cifras deben regenerarse inmediatamente antes de la firma del expediente.*
