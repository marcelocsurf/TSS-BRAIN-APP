# TSS BRAIN — Especificación para cotización
**Propósito:** que un proveedor de desarrollo pueda cotizar la construcción de esta plataforma desde cero. Todo lo descrito ya existe y funciona en producción; se pide cotizar su reposición.
**Fecha:** 2026-09-05 · **Contacto:** Marcelo Castellanos · info@thesurfsequence.com

---

## 1. Qué es

Plataforma web para una metodología de enseñanza de surf (The Surf Sequence). Une tres cosas en un solo sistema: **la operación de una academia** (alumnos, clases, camps, staff, cobros, reportes), **el método de enseñanza** (currículo por cintas, evaluación por criterios, contenido) y **el portal del alumno** (curso, entrenamiento autónomo, progreso, libro, comunidad). Multi-academia: varias academias afiliadas usan el mismo sistema con sus datos separados.

## 2. Usuarios y accesos

| Tipo | Cómo entra | Qué hace |
|---|---|---|
| Admin de plataforma | Login con email y contraseña | Todo. Contenido, academias, reportes globales, auditoría |
| Coordinador de academia | Login | Opera su academia: alumnos, servicios, staff, ventas, costos, pagos, reportes |
| Coach | Login | Sus alumnos, planificar sesiones, evaluar |
| Asistente | Login | Apoyo: alumnos y espacios |
| Vendedor / Recepción (host) | Link personal con token | Cobrar, check-in, transporte, atención al cliente |
| Alumno | Link personal con token (+ PIN opcional) | Su portal completo (sección 4) |
| Coach externo | Link con token | Sus alumnos asignados y herramientas |
| Gerente | Link con token | Solo lectura |
| Especialista (fisio, nutrición, psicólogo) | Link con token | Atletas asignados, tareas, informes |
| Público | Sin cuenta | Quiz de nivel, inscripción por QR, link de regalo, activación con código |

## 3. Módulos del panel interno (staff)

1. **Alumnos**: ficha completa (identidad, contacto, emergencia, salud, perfil de surf, cinta, objetivos), historial, evaluaciones, accesos al curso, materiales otorgados, promociones de cinta con confirmación, consentimientos y anonimización a pedido, exportación CSV.
2. **Servicios y camps**: plantillas por día y por bloque, plantillas semanales, creación de camps y clases, inscripción, capacidad, pagos por participante, cierre diario con resultados por alumno, evaluación final, encuesta de experiencia, ciclo de vida (no admite inscripciones iniciado, no se cierra con días abiertos).
3. **Planificación de sesión en cascada**: flujo de 22 pasos en 3 momentos que filtra bloques, drills y misiones según nivel del alumno, condiciones del mar y objetivo; borradores; plan imprimible; cierre con "siguiente foco" obligatorio.
4. **Currículo y método**: 49 pasos organizados en secuencias por cinta (blanca a azul, extensible a morada, marrón y negra), lecciones con quizzes, drills, misiones, juegos, criterios de ejecución, videos, presentaciones, intros por sección, biblioteca de video, documentos del método. Editor de todo eso.
5. **Evaluación**: por secuencia y por paso, estrellas 1-5, criterios de ejecución con evaluación del coach por criterio, recomendación automática del siguiente foco, reglas de promoción de cinta limitadas por certificación del coach y por "regla del agua".
6. **Alto rendimiento**: programas periodizados (hoy / semana / temporada / año), bloques de programa, check-ins, notas de nutrición, competencias y heats, equipo de especialistas con tareas, evaluación profunda, mensajes y muro del equipo.
7. **Staff**: alta e invitación por email, roles, certificaciones, tarifas de pago, pagos, curso del coach con progreso, waiver de staff, portal propio.
8. **Academias (multi-tenant)**: registro, plantillas asignadas, precios por academia, facturación, "actuar como" academia para el admin con auditoría.
9. **Comercial**: códigos de acceso al curso por cinta, links de regalo de un solo uso, registro de ventas, mostrador de cobro, cupones, precios, webhook de pasarela de pago (Wompi).
10. **Operaciones**: reserva de espacios, incidentes, inventario y requisiciones, tablas de surf (inventario, alquiler, clearance, uso), recepción con check-in y tablero de transporte a 14 días.
11. **Finanzas**: tarifas de costo, costos por plantilla, nómina de coaches, estado de resultados.
12. **Reportes (9)**: ingresos, ocupación, ratings, cierres, membresías, embudo, P&L, experiencia (NPS y alertas), programas; exportación Excel/CSV.
13. **Captación**: quiz público de nivel de surf (motor de puntaje, co-brandeable), captura de lead con email, intake en dos niveles, activación con código, seguimiento del lead.
14. **Clases por QR**: página pública por academia con menú por actividad, video, horarios, inscripción con perfil, menores con tutor, acompañantes, cupones, gestión de reserva con política de 24 horas, confirmación por email.
15. **Encuestas**: por servicio y de experiencia del camp, con preguntas configurables por servicio.
16. **Comunidad**: canal de publicaciones con reacciones y lecturas.
17. **Herramientas técnicas**: analizador de video con dibujo sobre canvas y clips modelo, venue scout, verificación de venue, calculadora de ratios de seguridad.
18. **Tareas**: tareas recurrentes por día de la semana, tablero del día, reportes de cumplimiento.
19. **Auditoría y automatizaciones**: registro de eventos, impersonaciones, recordatorios diarios por cron, emails transaccionales (14 tipos).

## 4. Portal del alumno (móvil primero, instalable como app)

- **Home**: "próximo movimiento" priorizado (indicación del coach → paso frenado → sesión sin terminar), libro, programa del día, avisos.
- **Curso**: lecciones por paso con texto, video, palabras clave, quiz; progreso; guía "qué hace falta para la próxima cinta".
- **Let's Play** (entrenamiento autónomo): drill, misión, secuencia completa o un paso; plan → check de seguridad → ritual de respiración → evaluación (estrellas, foco, flow, criterios opcionales, nota); rachas; historial; calificación por secuencia con "paso que la frenó".
- **Progreso**: cintas, evaluaciones del coach, autoevaluaciones, bitácora.
- **Libro** (PDF servido sin URL pública), **materiales y presentaciones** otorgados.
- **Alto rendimiento** (si aplica): programa, temporada, citas, competencias, mensajes.
- **Comunidad**, **encuestas pendientes**, **membresía** (renovación).
- **Legal**: aceptación de términos y privacidad registrada con versión, fecha, IP y navegador.

## 5. Sitio web público

Landing de marketing servida por el mismo proyecto (enrutamiento por dominio), quiz de nivel, páginas legales (privacidad y términos, bilingües), manual de operaciones interno.

## 6. Requisitos no funcionales

- **Seguridad**: autenticación del staff; portales por token UUID; seguridad a nivel de fila en la base (158 políticas) que separa academias y roles; verificación de permisos en cada acción del servidor; archivos privados servidos por el servidor con permiso por persona; rate limiting en endpoints públicos; auditoría; secretos fuera del código.
- **Multi-tenant**: datos de cada academia aislados; admin de plataforma con vista global y "actuar como".
- **PWA**: manifest y service worker, instalable en iPhone y Android.
- **Idiomas**: interfaz del alumno en inglés, del staff en español, legales en ambos.
- **Privacidad**: consentimiento expreso de datos de salud, opt-in de imagen, tutor para menores, anonimización a pedido, política publicada.
- **Respaldo**: backup semanal automatizado de base y archivos.
- **Rendimiento**: carga en móvil con datos de campo (3G/4G).

## 7. Tecnología de referencia (el proveedor puede proponer otra)

Next.js 14 (App Router, Server Actions) + TypeScript estricto + Tailwind; PostgreSQL con Supabase (auth, storage, RLS); Vercel (hosting, cron); Resend (email); Wompi (pagos); Konva (canvas de video). Sin dependencias comerciales de terceros más allá de esas.

## 8. Tamaño de referencia de lo construido

90 pantallas · 198 componentes de interfaz · 602 funciones de servidor · 11 endpoints · 123 tablas · 212 funciones de base · 158 políticas · 184 migraciones · ≈ 185,000 líneas de código.

## 9. Qué aporta el cliente

Todo el contenido del método (49 pasos, lecciones, criterios, drills, misiones, quizzes, plantillas, libro, mental cues), la doctrina de evaluación y las reglas de negocio. El proveedor construye el software; no diseña el método.

## 10. Qué se pide en la cotización

1. Horas estimadas por bloque (secciones 3, 4, 5 y 6).
2. Equipo propuesto (roles, seniority, dedicación) y plazo en meses.
3. Costo total y forma de pago.
4. Costo mensual de mantenimiento y evolución después de la entrega.
5. Qué queda fuera del alcance.
