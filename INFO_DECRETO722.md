# INFORME TÉCNICO — TSS BRAIN (The Surf Sequence)
### Documento de soporte para calificación al Decreto 722 (Ley de Fomento a la Innovación y Manufactura de Tecnologías), El Salvador

**Fecha del informe:** 5 de septiembre de 2026
**Repositorio analizado:** `marcelocsurf/TSS-BRAIN-APP` (GitHub, privado), rama `main`, commit más reciente del 2026-09-05
**Método:** todas las cifras se obtuvieron directamente del código fuente, del historial de git y de la base de datos de producción (consultas al catálogo de PostgreSQL). No hay estimaciones.

---

## 1. Arquitectura y stack

| Capa | Tecnología | Versión instalada |
|---|---|---|
| Framework web | Next.js (App Router, React Server Components, Server Actions) | 14.2.35 |
| Librería de UI | React / React DOM | 18.3.1 |
| Lenguaje | TypeScript (modo estricto, `tsc --noEmit` obligatorio antes de cada push) | 5.9.3 |
| Estilos | Tailwind CSS + PostCSS | 4.2.2 |
| Base de datos | PostgreSQL gestionado por Supabase (proyecto `cssewjefhnamconoyuso`) | Postgres 15 (Supabase) |
| Acceso a datos | `@supabase/supabase-js` + `@supabase/ssr` | 2.99.2 / 0.5.2 |
| Hosting / runtime | Vercel (serverless Node.js, cron jobs declarados en `vercel.json`) | — |
| Dominios | `app.thesurfsequence.com` (aplicación) · `thesurfsequence.com` (sitio web servido por el mismo proyecto mediante enrutamiento por host en `src/middleware.ts`) | — |
| Canvas / gráficos | Konva + react-konva (analizador de video y herramientas de dibujo) | 9.3.22 / 18.2.16 |
| Íconos | lucide-react | 1.16.0 |
| Exportación | `xlsx` (CSV/Excel de reportes), `jszip` (empaquetado de exportaciones) | 0.18.5 / 3.10.1 |

**Servicios externos integrados (verificados en código por sus variables de entorno):**

| Servicio | Uso | Evidencia |
|---|---|---|
| Supabase Auth | Login con email/contraseña del personal (coaches, coordinadores, admin) | `src/lib/supabase/{client,server,admin}.ts`, `src/middleware.ts` |
| Supabase Storage | 5 buckets: `avatars`, `tss-library`, `rental-ids`, `coach-presentations`, `method-vault` (PDFs, presentaciones, documentos del método, identificaciones de alquiler) | catálogo `storage.buckets` en producción |
| Resend | Correo transaccional (invitaciones a coaches, links de portal, encuestas, recordatorios, entrega del libro) | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (17 puntos de envío) |
| Wompi (El Salvador) | Pasarela de pago para la venta del libro ONE WAVE vía webhook | `src/app/api/book-purchase/route.ts`, `BOOK_WEBHOOK_SECRET` |
| Vercel Cron | Recordatorios diarios automáticos (13:00 y 23:00 UTC) | `vercel.json` → `/api/cron/daily-reminders`, protegido por `CRON_SECRET` |
| GitHub | Control de versiones y disparador de despliegues | remoto `origin` |

**Características de la arquitectura:**

- **PWA (Progressive Web App):** sí. `src/app/manifest.ts` genera el manifest, `public/sw.js` es el service worker y existe el componente `InstallPWA.tsx` para instalación en móvil.
- **Multi-tenant:** sí. El modelo tiene la entidad `academies` y la columna `academy_id` aparece 117 veces en las migraciones; las políticas de seguridad a nivel de fila (RLS) filtran por academia. Existe un rol `coordinator` que administra su propia academia (`/my-academy`) separado del `admin` global.
- **Monorepo:** no. Es un único repositorio con una única aplicación Next.js; el sitio web de marketing y las herramientas estáticas viven en `public/` dentro del mismo proyecto.
- **Server Actions como capa de negocio:** la lógica de servidor vive en `src/lib/actions/` (98 archivos) y se invoca desde los componentes sin exponer una API REST pública; los 11 endpoints HTTP en `src/app/api/` existen solo para webhooks, cron, integraciones externas y entrega de archivos.
- **Portales por token:** además del login del personal, alumnos, coaches externos, gerentes, recepción y especialistas acceden por URL con token UUID (sin contraseña), gobernado por `src/middleware.ts`.

---

## 2. Métricas del código

### 2.1 Líneas de código (conteo real con `wc -l`, excluyendo `node_modules` y artefactos de build)

| Lenguaje / tipo | Archivos | Líneas |
|---|---:|---:|
| TypeScript con JSX (`.tsx`) — interfaz | 349 | **79,489** |
| TypeScript (`.ts`) — lógica de servidor, acciones, utilidades | 185 | **47,050** |
| SQL (`.sql`) — migraciones de esquema, funciones, políticas | 203 | **47,584** |
| HTML estático (herramientas públicas, sitio web, manual) | 8 | 6,859 |
| JavaScript / ESM (`.mjs`, `.js`) — scripts de importación, auditoría y service worker | 18 | 2,914 |
| Python (`.py`) — scripts de limpieza de contenido | 6 | 874 |
| CSS | 1 | 176 |
| **TOTAL** | **770** | **≈ 184,946** |

Distribución por carpeta principal:

| Carpeta | Líneas |
|---|---:|
| `src/components` (interfaz) | 45,867 |
| `src/lib` (lógica de negocio y servidor) | 43,955 |
| `src/app` (rutas, páginas, API) | 36,372 |
| `supabase/migrations` (esquema) | 43,926 |

### 2.2 Base de datos

| Métrica | Valor | Fuente |
|---|---:|---|
| **Tablas en producción (schema `public`)** | **123** | `information_schema.tables` |
| Vistas | 2 | `information_schema.views` |
| Funciones almacenadas (PL/pgSQL / SQL) | 212 | `pg_proc` |
| Políticas de seguridad a nivel de fila (RLS) | 158 | `pg_policies` |
| Triggers | 18 | `pg_trigger` |
| Buckets de almacenamiento | 5 | `storage.buckets` |
| **Archivos de migración en el repositorio** | **183** (`00001_enums.sql` … `00183_access_code_prefix_one_wave.sql`) | `supabase/migrations/` |
| Migraciones registradas en el historial de Supabase | 101 | `supabase_migrations.schema_migrations` |
| Tablas cuya creación está en archivos de migración del repo | 78 | `CREATE TABLE` en `supabase/migrations/*.sql` |

> Nota de precisión: el esquema evolucionó por dos vías, archivos de migración versionados en git (183) y cambios aplicados directamente al proyecto Supabase durante el desarrollo (registrados en su historial interno). Por eso el número autoritativo de tablas es el de producción (**123**), no el que se puede reconstruir solo desde los archivos del repositorio (78).

Lista de las 123 tablas: academies, academy_course_prices, academy_inventory_items, academy_invoices, academy_spaces, academy_tasks, academy_template_assignments, access_codes, admin_impersonations, athlete_competitions, athlete_diet_notes, athlete_heats, athlete_staff_tasks, athlete_team_posts, audit_log, belt_promotion_recommendations, board_clearance, board_rentals, board_usages, boards, camp_daily_feedback, camp_experience_surveys, camp_final_evaluations, camp_instances, camp_participants, camp_scheduled_evaluations, camp_sessions, camp_student_customizations, camp_template_blocks, camp_template_days, camp_templates, cascade_sessions, class_coupons, coach_certifications, coach_criterion_evals, coach_evaluations, coach_lesson_progress, coach_pay_rates, coach_payments, coach_resource_grants, coach_resources, coaches, community_posts, community_reactions, community_reads, content_videos, cost_rates, course_final_quiz, course_final_quiz_attempts, course_grants, course_prices, course_section_intros, drills, drills_missions, dropdown_options, heat_waves, hp_athlete_links, hp_athlete_profiles, hp_deep_evaluations, hp_messages, hp_session_attendance, hp_team_sessions, inventory_checks, inventory_requisitions, lesson_plan_blocks, lesson_progress, lesson_quizzes, lessons, level_quiz_attempts, memberships, method_docs, method_tasks, model_clips, multi_block_sessions, notifications, ocean_level_evaluations, ocean_rules, pilar_parts, program_appointments, program_assignments, program_block_templates, program_checkins, program_day_marks, program_days, program_evaluations, program_item_marks, program_items, program_video_library, programs, rating_scales, refresher_charges, season_contributions, season_events, season_phases, season_plans, season_specialists, self_training_sessions, sequence_evaluations, sequences, service_plan_blocks, service_plans, service_staff, session_incidents, session_missions, space_bookings, staff_members, standalone_sessions, student_level_access, student_resource_grants, student_sequence_ratings, student_session_results, student_solo_sessions, student_step_ratings, students, survey_responses, task_completions, template_cost_items, tide_events, tool_leads, water_tests, week_template_slots, week_templates, weekly_rankings.

### 2.3 Pantallas, componentes y lógica de servidor

| Métrica | Valor | Cómo se contó |
|---|---:|---|
| **Pantallas / rutas de la aplicación (`page.tsx`)** | **90** | `find src/app -name page.tsx` |
| — de las cuales, panel interno del personal (`(dashboard)`) | 65 | |
| — autenticación (`(auth)`) | 3 | |
| — portales y páginas públicas por token (alumno, coach, gerente, recepción, especialista, encuestas, inscripción, regalo, quiz) | 22 | |
| Layouts raíz | 3 | |
| Herramientas y páginas HTML estáticas adicionales (quiz de nivel, sitio web, manual, venue scout, ratio engine, método) | 8 | `public/**/*.html` |
| **Componentes de interfaz (`.tsx` en `src/components`)** | **198** | agrupados en 36 dominios (`portal`, `evaluation`, `sequence`, `camp`, `reports`, `video-analyzer`, `community`, `student`, `coach-portal`, etc.) |
| **Módulos de lógica de servidor (archivos en `src/lib/actions`)** | **98** | |
| **Funciones de servidor exportadas (Server Actions)** | **602** | `export (async) function` en `src/lib/actions/*.ts` |
| Archivos de librería/lógica total (`src/lib`) | 152 | |
| **Endpoints HTTP (`route.ts` en `src/app/api`)** | **11** | webhooks, cron, entrega de archivos, integraciones |
| Rutas públicas declaradas en el middleware | 31 patrones | `src/middleware.ts` |
| Pruebas automatizadas | 0 archivos | La verificación se hace con tipado estricto (`tsc`) bloqueante en pre-push, build de Vercel y pruebas E2E manuales/asistidas en entorno dev con alumno de prueba |

### 2.4 Historial de desarrollo (git)

| Métrica | Valor |
|---|---:|
| Commits en `main` | **1,119** |
| Primer commit | 2026-03-12 |
| Último commit | 2026-09-05 |
| Autores | Marcelo Castellanos (1,057 commits como autor local + 62 como `marcelocsurf`), 3 commits de asistente de IA bajo dirección del autor |
| Ramas remotas | `main` (producción) + ramas de trabajo |

---

## 3. Módulos y funcionalidades

### 3.1 Módulos principales

| Módulo | Rutas / carpetas | Qué hace |
|---|---|---|
| **Alumnos (Students)** | `/students`, `/students/[id]`, `/students/[id]/history`, `/students/new` | Ficha del alumno: cinta (belt), evaluaciones por secuencia y por paso, historial, acceso al curso, grants de materiales, promociones de cinta con confirmación de "regla del agua". |
| **Servicios y Camps** | `/camps`, `/camps/[id]`, `/camps/[id]/day/[dayNum]`, `/camps/[id]/evaluate`, plantillas y plantillas semanales | Creación de camps y clases desde plantillas (bloques por día), inscripción, cierre diario, evaluación final, encuesta de experiencia, ciclo de vida del camp. |
| **Sesiones (Cascade)** | `/sessions/new`, `/sessions/cascade`, `/sessions/drafts`, `/sessions/plan/[id]` | Flujo de planificación de sesión en cascada (22 pasos, 3 momentos) con filtrado por nivel, condiciones del mar y objetivos; borradores y planes. |
| **Curso y Método (contenido)** | `/content`, `/drill-library`, `/section-intros`, `/presentations`, `/admin/video-library`, `/metodo` | Gestión del currículo: 49 pasos White→Blue, lecciones, quizzes, drills, misiones, juegos, videos, presentaciones, documentos del método (cuartel general del negocio). |
| **Portal del alumno** | `/portal/[token]` | Home con "próximo movimiento", curso con lecciones y quizzes, Let's Play (entrenamiento autónomo por secuencia o por paso con autoevaluación), libro ONE WAVE, programa HP, comunidad, bitácora. |
| **Evaluación** | `src/components/evaluation`, `src/lib/actions/coach-criterion-evals.ts`, `sequence.ts`, `lets-play.ts` | Modelo de evaluación por secuencia y por paso: estrellas, foco, flow, criterios de ejecución, evaluación del coach por criterio, recomendación automática del siguiente foco. |
| **Alto Rendimiento (HP)** | `/hp`, `/hp/reporte/[studentId]`, `/programas`, `/reports/programas` | Programas periodizados (Today/Week/Season/Year), check-ins, nutrición, competencias y heats, especialistas, evaluación profunda. |
| **Staff y Coaches** | `/coaches`, `/coaches/[id]`, `/coaches/[id]/evaluate`, `/coaches/new`, `/coach-portal/[token]` | Alta e invitación por email, certificaciones (limitan hasta qué cinta puede promover), curso del coach, portal del coach con sus alumnos y herramientas por paso. |
| **Academias (multi-tenant)** | `/academies`, `/academies/[id]`, `/academies/[id]/billing`, `/my-academy` | Registro de academias afiliadas, asignación de plantillas, precios por academia, facturación. |
| **Comercial** | `/course-codes`, `/sales-log`, `/desk`, `/gift/[code]`, `/api/book-purchase`, `/admin/pricing` | Códigos de acceso al curso (por cinta) y links de regalo del libro, mostrador de ventas, precios, webhook de pago Wompi. |
| **Operaciones** | `/spaces`, `/incidents`, `/inventory/requisition/[id]`, `/front-desk/[token]`, `/equipo/[token]` | Reserva de espacios, incidentes en sesión, inventario y tablas (boards, alquiler, clearance), recepción con check-in y transporte, portal de especialistas. |
| **Finanzas** | `/costs`, `/payroll`, `/reports/pnl`, `/reports/revenue` | Tarifas de costo, pagos a coaches, estado de resultados. |
| **Reportes** | `/reports` + 9 sub-reportes | Ingresos, ocupación, ratings, cierres, membresías, embudo, P&L, experiencia (NPS), programas; exportación CSV/Excel. |
| **Captación (lead magnet)** | `/quiz`, `public/quiz-v2.html`, `/api/quiz-lead`, `/api/quiz-v2-lead`, `/api/tool-lead`, `/lead/[token]`, `/intake/[token]`, `/activate` | Quiz público de nivel de surf con captura de lead, intake, activación de alumno con código. |
| **Clases por QR** | `/join/[slug]`, `/booking/[id]` | Inscripción pública a clases mediante QR, gestión de reserva con política de 24 h. |
| **Encuestas** | `/feedback/[token]`, `/experience/[token]`, `/reports/experiencia` | Encuesta por servicio y encuesta de experiencia del camp con NPS y alertas. |
| **Comunidad (The Lineup)** | `/community`, portal del alumno | Canal de publicaciones, reacciones y lecturas. |
| **Herramientas técnicas** | `/venue-scout`, `public/venue-check`, `public/ratio-engine.html`, `src/components/video-analyzer` | Análisis de spot, verificación de venue, calculadora de ratios de seguridad, analizador de video con dibujo sobre canvas. |
| **Auditoría** | `/audit`, tabla `audit_log`, `admin_impersonations` | Registro de eventos y de impersonaciones administrativas. |
| **Automatizaciones** | `/api/cron/daily-reminders`, `notifications` | Recordatorios diarios por correo. |

### 3.2 Roles de usuario y permisos

**Personal con cuenta (Supabase Auth, enum `coach_role`):** `admin`, `coordinator`, `coach`, `assistant`, `head_coach`, `seller`, `host`.

Permisos del menú del panel interno, tomados de `src/app/(dashboard)/layout.tsx`:

| Rol | Acceso |
|---|---|
| **admin** (dueño del sistema) | Todo: alumnos, servicios, staff, códigos, ventas, reportes, costos, pagos, mostrador, comunidad, sesiones, El Método, academias, Modo HP, programas, analytics, contenido, drills, presentaciones, intros, video library, auditoría. |
| **coordinator** (administra una academia afiliada) | Alumnos, servicios, staff, espacios, códigos, My Academy, ventas, reportes, costos, pagos, mostrador, comunidad. Sus datos quedan filtrados por su `academy_id` (RLS). |
| **coach** | Home, alumnos (solo los que le corresponden, verificado por `checkCoachAccessToStudent`), espacios, Venue Scout, crear sesión y borradores. Su capacidad de promover cintas está limitada por sus certificaciones (`coach_certifications`). |
| **assistant** | Home, alumnos, espacios (solo lectura/apoyo). |
| **head_coach, seller, host** | Roles definidos en la base para pago y operación; `seller` opera ventas en mostrador y `host` la recepción (`/front-desk`). |

**Usuarios sin cuenta (acceso por token UUID en la URL):**

| Perfil | Ruta | Alcance |
|---|---|---|
| Alumno | `/portal/[token]` | Solo sus datos; el token se valida en cada acción (`studentIdFromPortalToken`). Vistas gateadas por membresía, cinta y grants (curso, libro, HP). |
| Coach externo | `/coach-portal/[token]` | Sus alumnos y herramientas; ventana de servicio. |
| Gerente | `/manager-portal/[token]` | Vista de solo lectura. |
| Recepción | `/front-desk/[token]` | Check-in y transporte. |
| Especialista | `/equipo/[token]` | Sus atletas asignados y tareas. |
| Público | `/quiz`, `/join/[slug]`, `/gift/[code]`, `/activate`, `/my-portal` | Captación, inscripción y activación. |

### 3.3 Funcionalidades de seguridad

- **Autenticación** del personal con Supabase Auth (email + contraseña, recuperación en `/forgot-password`, alta en `/set-password`); el middleware redirige a `/` cualquier ruta no pública sin sesión.
- **Row Level Security:** 158 políticas en PostgreSQL filtran por academia y por rol; las tablas sensibles (por ejemplo `student_sequence_ratings`) solo aceptan escritura del rol de servicio.
- **Compuerta en el servidor:** las Server Actions que usan el cliente administrador verifican explícitamente el permiso antes de operar (por ejemplo, tipo de práctica, acceso coach→alumno, propiedad del token); los errores se devuelven como `{ok:false,error}` sin filtrar detalles.
- **Tokens como credencial:** portal tokens UUID v4 por persona; `STUDENT_SESSION_SECRET` para sesiones de alumno; secretos independientes para cron (`CRON_SECRET`) y webhook de pago (`BOOK_WEBHOOK_SECRET`).
- **Entrega segura de archivos:** los PDFs se sirven por `/api/materials/[token]/[id]` desde el servidor; la URL firmada de Storage nunca llega al cliente; respuesta 404 uniforme para evitar enumeración.
- **Rate limiting** en los endpoints públicos de captación de leads (`/api/quiz-lead`, `/api/quiz-v2-lead`).
- **Auditoría:** tabla `audit_log` indexada por evento y fecha, registro de impersonaciones (`admin_impersonations`), pantalla `/audit`.
- **Integridad de datos:** restricciones CHECK, enums, triggers (18) y funciones con `search_path` fijado; política de no borrar contenido sino desactivarlo.
- **Códigos de un solo uso** para curso y libro (`access_codes` con `used_by` y vencimiento).

---

## 4. Flujo del proceso del servicio (recorrido real del usuario)

**A. Captación → alumno**
1. La persona llega al sitio `thesurfsequence.com` (servido por el mismo proyecto) o escanea un QR.
2. Responde el quiz de nivel público (`/quiz`); el resultado se guarda como lead (`/api/quiz-v2-lead`) con un token.
3. Con ese token completa el intake (`/intake/[token]`) o se activa con un código (`/activate`), o se inscribe a una clase por QR (`/join/[slug]`).
4. Se crea su fila en `students` con cinta provisional y `portal_token`; recibe por correo (Resend) el link a su portal.

**B. Compra o regalo del libro / curso**
5. Pago por Wompi → webhook `/api/book-purchase` → `grantBookAccess` crea o encuentra al alumno por email, otorga el recurso y envía el correo. Alternativa sin cobro: link de regalo `/gift/[code]` (nombre + email → portal).
6. Códigos de curso (`/course-codes`) habilitan el curso por cinta (`course_grants`, `student_level_access`).

**C. Servicio presencial (camp / clase)**
7. El coordinador crea el camp desde una plantilla (`/camps/new`), inscribe participantes y asigna staff.
8. El coach planifica la sesión con el flujo en cascada (`/sessions/new` → `/sessions/plan/[id]`), eligiendo bloques, drills y misiones según nivel y mar.
9. Recepción hace check-in y transporte (`/front-desk/[token]`); se registran incidentes y uso de tablas.
10. Cada día se cierra (`/camps/[id]/day/[dayNum]`) con resultados por alumno; al final se evalúa (`/camps/[id]/evaluate`) por secuencia y paso, con "siguiente foco" obligatorio.
11. Se envía la encuesta de experiencia (`/experience/[token]`) y de servicio (`/feedback/[token]`).

**D. Uso continuo en el portal**
12. El alumno entra a `/portal/[token]`: Home muestra su próximo movimiento (prioridad: indicación del coach → paso frenado → sesión sin terminar).
13. Estudia el curso (lecciones + quizzes), entrena en Let's Play (drill, misión, secuencia completa o un paso) y se autoevalúa (estrellas, foco, flow, criterios); lee el libro; sigue su programa HP si aplica; participa en la comunidad.
14. Sus autoevaluaciones alimentan `student_step_ratings` y `student_sequence_ratings`; el coach las ve en la ficha y en su bitácora.

**E. Progresión y administración**
15. El coach recomienda promoción de cinta; el sistema la limita según certificación y exige confirmar la regla del agua; el admin confirma.
16. Administración revisa reportes (`/reports/*`), costos, pagos a coaches, ocupación, embudo y NPS; exporta CSV/Excel.
17. Cron diario envía recordatorios; auditoría registra eventos.

---

## 5. Proceso de producción / desarrollo

| Aspecto | Práctica real |
|---|---|
| Control de versiones | Git, repositorio privado en GitHub (`marcelocsurf/TSS-BRAIN-APP`), rama principal `main`; 1,119 commits entre 2026-03-12 y 2026-09-05; mensajes de commit en español. |
| Entornos | Desarrollo local (`next dev`) contra el mismo proyecto Supabase con alumno de prueba; producción en Vercel. |
| Control de calidad | TypeScript estricto. Hook `pre-push` (husky) ejecuta `tsc --noEmit` y bloquea el push si hay errores. Antes de cada despliegue se corre `npx next build` localmente. Revisión adversarial del código asistida por IA antes de cerrar cada funcionalidad. Pruebas E2E en dev con datos de prueba que luego se restauran. |
| Despliegue (CI/CD) | Integración Vercel–GitHub: cada push a `main` dispara build y despliegue automático; se verifica el estado del commit vía la API de GitHub (`/commits/{sha}/status`) hasta `success`. Si el build falla, Vercel mantiene la versión anterior. |
| Base de datos | Migraciones SQL numeradas en `supabase/migrations/` (183 archivos) aplicadas al proyecto Supabase; funciones con `search_path` fijado; RLS en todas las tablas expuestas. |
| Configuración | Variables de entorno en Vercel (Supabase, Resend, secretos de cron y webhook); nunca en el código. |
| Automatización | Cron jobs en `vercel.json`; scripts de importación, auditoría y exportación de contenido en `scripts/` (17 `.mjs`, 6 `.py`). |
| Documentación | Manual de operaciones dentro del app (`/manual`), documentos del método (`/metodo`), memoria técnica del proyecto mantenida por sesión de desarrollo. |

---

## 6. Propiedad intelectual y actividad

**Originalidad del código.** TSS BRAIN es software propio y original, escrito desde cero en este repositorio a partir del 12 de marzo de 2026 por Marcelo Castellanos (autor de 1,119 commits), con asistencia de herramientas de IA bajo su dirección. No es reventa, reempaquetado ni personalización de un software de terceros: las 123 tablas del modelo de datos, las 602 funciones de servidor, los 198 componentes de interfaz y las 90 pantallas implementan una metodología propia de enseñanza de surf (The Surf Sequence: sistema de cintas, secuencias, pasos, drills, misiones, evaluación por criterios) que no existe en ningún producto comercial. Las dependencias de terceros son exclusivamente librerías de código abierto de infraestructura (Next.js, React, Supabase SDK, Tailwind, Konva, lucide, xlsx, jszip, Resend SDK) usadas como base técnica, no como producto.

**Actividades que realiza la empresa sobre este software:**

- **Programación:** desarrollo continuo de la aplicación web (≈185,000 líneas en TypeScript, SQL, HTML, JS y Python), interfaz PWA, lógica de servidor, integraciones (pagos, correo, storage, cron).
- **Análisis y diseño de sistemas:** modelado de datos (123 tablas, 212 funciones, 158 políticas de seguridad), diseño de flujos de negocio (cascada de sesión, ciclo de vida del camp, evaluación por secuencia, programas de alto rendimiento), arquitectura multi-tenant y de portales por token.
- **Gestión:** planificación por fases y sprints, control de versiones, gestión de despliegues, backlog y auditorías internas de seguridad y coherencia del contenido.
- **Mantenimiento:** corrección de errores, migraciones de esquema, actualizaciones de dependencias, monitoreo de despliegues, restauración de datos de prueba, auditorías de seguridad (por ejemplo, la del 2026-08-08 con 28 hallazgos corregidos).
- **Consultoría:** el sistema se ofrece a academias afiliadas (modelo multi-academia con coordinador propio, plantillas, precios y facturación por academia) e incluye asesoría de implementación del método.

---

*Cifras verificadas el 2026-09-05 sobre el commit más reciente de `main` y la base de datos de producción. Comandos utilizados: `wc -l`, `find`, `grep`, `git log`, y consultas a `information_schema`, `pg_proc`, `pg_policies`, `pg_trigger`, `storage.buckets` y `supabase_migrations.schema_migrations`.*
