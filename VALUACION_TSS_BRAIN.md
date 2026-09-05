# VALUACIÓN DE TSS BRAIN — costo de reposición
**Fecha:** 2026-09-05 · **Qué mide:** cuánto costaría contratar un equipo profesional para construir, desde cero y sin IA, exactamente lo que hoy existe en producción. No es el valor del negocio (eso depende de ingresos, usuarios y marca); es lo que alguien tendría que gastar para tener el mismo software.

---

## 1. Lo que hay que reponer (métricas reales del repo al 2026-09-05)

| Qué | Cantidad |
|---|---:|
| Líneas de código (TypeScript, SQL, HTML, JS, Python) | ≈ 185,000 |
| Pantallas / rutas | 90 (+ 8 herramientas HTML) |
| Componentes de interfaz | 198 |
| Funciones de servidor (Server Actions) | 602 en 98 módulos |
| Endpoints HTTP (webhooks, cron, archivos) | 11 |
| Tablas en producción | 123 |
| Funciones propias en la base / políticas de seguridad / triggers | 24 / 158 / 18 |
| Migraciones de esquema | 184 |
| Integraciones | Supabase (auth, base, storage), Vercel (hosting, cron), Resend (email), Wompi (pagos), PWA, canvas de video (Konva), exportación Excel |
| Módulos funcionales | 19 (alumnos, camps, sesiones en cascada, curso y método, portal del alumno con Let's Play, evaluación por criterios, alto rendimiento, staff, academias multi-tenant, comercial, operaciones, finanzas, 9 reportes, captación con quiz, clases por QR, encuestas, comunidad, herramientas técnicas, auditoría, automatizaciones) |
| Roles / portales | 7 roles de staff + 5 portales por token + público |
| Historial | 1,119 commits, 12-mar → 5-sep 2026 |

Además del software hay **contenido y método** cargados en la base (49 pasos, 218 lecciones, drills, misiones, quizzes, plantillas de camps, mental cues, libro), que un equipo de desarrollo NO produce: eso lo pone el dueño del método.

---

## 2. Cómo se estima

Se calcula el esfuerzo por pieza y se multiplica por tarifas de mercado 2026. Supuestos: equipo senior, sin IA generativa, calidad equivalente (tipado estricto, seguridad por fila, multi-tenant), incluyendo diseño de producto, gestión y pruebas.

### 2.1 Esfuerzo (horas-persona)

| Bloque | Base del cálculo | Horas |
|---|---|---:|
| Descubrimiento y diseño de producto (flujos, 19 módulos, 12 tipos de usuario) | 6-8 semanas de PM + diseñador | 500 – 700 |
| Diseño UX/UI (90 pantallas + portal móvil + website) | 5-8 h por pantalla + sistema de diseño | 600 – 900 |
| Modelo de datos y seguridad (123 tablas, 158 políticas RLS, 24 funciones, multi-tenant, portales por token) | 3-4 h por tabla + políticas + funciones | 550 – 750 |
| Lógica de negocio (602 funciones de servidor: cascada de sesión, evaluación, Let's Play, camps, programas HP, reportes, códigos, regalos) | 4-6 h por función promedio | 2,400 – 3,600 |
| Interfaz (198 componentes, 90 pantallas, PWA) | 8-12 h por componente | 1,600 – 2,400 |
| Integraciones (pagos, email, storage seguro, cron, analizador de video, exportaciones, quiz público, website) | por integración | 350 – 500 |
| QA y pruebas (15 % del desarrollo) | | 750 – 1,100 |
| Gestión de proyecto (12 % del total) | | 800 – 1,200 |
| DevOps, despliegue, migraciones, backups | | 150 – 250 |
| **Total** | | **7,700 – 11,400 h** |

Equivalente a **un equipo de 5 personas durante 9 a 13 meses** (PM, diseñador UX/UI, 2 desarrolladores full-stack senior, 1 QA, con DevOps parcial).

### 2.2 Tarifas de mercado 2026 (blended por hora, equipo completo)

| Mercado | Rango típico | Usado en el cálculo |
|---|---|---:|
| Latinoamérica (El Salvador, Colombia, Argentina, México), agencia o equipo senior remoto | $35 – $60 | $45 |
| Europa del Este / España, agencia mediana | $60 – $100 | $80 |
| Estados Unidos / Europa Occidental, agencia | $110 – $180 | $140 |

---

## 3. Resultado

| Escenario | Horas | Costo estimado |
|---|---:|---:|
| **Equipo latinoamericano senior** | 7,700 – 11,400 | **$350,000 – $510,000** |
| Agencia Europa del Este / España | 7,700 – 11,400 | $620,000 – $910,000 |
| Agencia Estados Unidos / Europa Occidental | 7,700 – 11,400 | $1,080,000 – $1,600,000 |

**Cifra de referencia para hablar con alguien: entre US$ 350,000 y US$ 500,000** construido con un buen equipo latinoamericano, en 9 a 13 meses. Con un equipo norteamericano, arriba de un millón.

---

## 4. Lo que NO incluye (y sumaría)

- **El método y el contenido** (49 pasos, lecciones, criterios, drills, misiones, quizzes, libro, plantillas): años de trabajo de Marcelo. Un equipo de software no lo reemplaza; es el activo diferencial.
- **Mantenimiento**: un software de este tamaño cuesta entre 15 % y 20 % de su costo de desarrollo por año en mantenimiento y mejoras (≈ $50,000 – $100,000/año con equipo latinoamericano) si lo lleva un equipo externo.
- **Infraestructura**: hoy es marginal (Supabase, Vercel, Resend, dominio: menos de $100/mes en el volumen actual).
- **Textos legales, marca, trámites**: aparte.

---

## 5. Cómo se llegó a construir por mucho menos

Lo construyó una persona (el dueño del método) con asistencia intensiva de IA en 6 meses. Por eso el costo real fue una fracción del costo de reposición. Eso no baja el valor de lo que existe: el que quiera lo mismo sin este método de trabajo tiene que pagar la tabla de arriba.

---

## 6. Notas de precisión

- El rango es amplio a propósito: una estimación seria de un proveedor se mueve ±30 % hasta que hay alcance cerrado.
- Se estimó con la productividad de un equipo humano senior sin IA. Un equipo que use IA de forma intensiva podría bajar las horas un 30-50 %, pero hoy pocos proveedores lo cotizan así.
- Las tarifas son promedios de mercado 2026 para trabajo senior remoto; un freelancer individual puede cobrar menos por hora pero tardaría 3-4 años solo.
- Las métricas de la sección 1 salen del código y de la base de producción (ver `INFO_DECRETO722.md`).
