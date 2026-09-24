# Encargo para el agente — producir y revisar ESTADO_ACTUAL.md

> **Cómo usar este archivo:** pegalo completo como primer mensaje a tu agente de Claude.
> Si el agente corre **sobre el repositorio** (Claude Code), puede verificarlo todo solo.
> Si el agente **no tiene el repositorio**, pegale además el contenido de `ESTADO_ACTUAL.md`
> y limitalo a la revisión editorial: sin acceso al código **no puede verificar ninguna cifra**,
> y debe decirlo en vez de aprobarlas.

---

## 1. Qué se pide

Existe un borrador: **`ESTADO_ACTUAL.md`**, en la raíz del repositorio. Documenta el estado técnico de TSS BRAIN para un **expediente oficial** (trámite Decreto 722, El Salvador).

Tu trabajo es doble:

1. **Revisarlo** — verificar cada cifra y cada afirmación contra el código y la base de datos.
2. **Entregarlo corregido** — con los errores arreglados y un informe aparte de qué cambiaste y por qué.

---

## 2. La regla que manda sobre todas

**Es un expediente oficial. Una cifra falsa es peor que una cifra ausente.**

- Reportá **solo** lo que verificaste directamente. Nada de estimar, redondear, aproximar ni inferir.
- Cada afirmación necesita una de tres pruebas: cita `archivo:línea`, consulta SQL, o comando reproducible.
- Lo que no puedas verificar va marcado **NO VERIFICADO**, diciendo qué intentaste. **No lo rellenes.**
- Si una afirmación del borrador no se sostiene, **corregila y anotala en el informe de cambios**. No la borres en silencio.
- No describas lo que el código *debería* hacer. Describí lo que hace.

---

## 3. Datos del entorno

| | |
|---|---|
| Repositorio | `/Users/marcelocastellanos/Desktop/TSS-BRAIN-APP`, rama `main` |
| Base de datos | Supabase, proyecto de producción **`cssewjefhnamconoyuso`** |
| Herramienta de base | MCP Supabase. Cargala con `ToolSearch` → `select:mcp__supabase__execute_sql,mcp__supabase__list_tables` |
| **Modo** | **SOLO LECTURA.** No escribas en la base, no corras migraciones, no hagas UPDATE/INSERT/DELETE. |

El borrador está anclado al commit `ed65bdd` (2026-09-24 10:44:44 −0600). **Si el repositorio avanzó, regenerá todas las cifras y cambiá el commit de corte**, porque el documento nace desfasado si no.

---

## 4. Comandos exactos para regenerar cada cifra

Corré estos y compará contra lo que dice el borrador. **No confíes en las cifras del borrador: recalculalas.**

### Repositorio

```bash
git log -1 --format='%H | %ad' --date=format:'%Y-%m-%d %H:%M:%S %z'   # commit de corte
git status --porcelain | wc -l                                        # debe dar 0
git rev-list --count HEAD                                             # commits
find src -type f \( -name '*.ts' -o -name '*.tsx' \) | wc -l          # archivos
find src/app -name page.tsx | wc -l                                   # páginas
find src/app -name route.ts | wc -l                                   # rutas de API
find src/components -name '*.tsx' | wc -l                             # componentes
ls supabase/migrations/*.sql | wc -l                                  # migraciones
grep -rl "'use server'" src/ | wc -l                                  # archivos con acciones
grep -rl "'use server'" src/ | xargs grep -h '^export async function\|^export function' | wc -l
grep -h '^export async function\|^export function' src/lib/actions/*.ts | wc -l   # misma base que el informe viejo
npx vitest run                                                        # casos de prueba REALES
```

### Líneas por lenguaje

Contá **solo archivos versionados en git** (`git ls-files`). Si caminás el disco con `os.walk` vas a entrar en `node_modules` y en copias de trabajo, y el total se dispara a millones. Esa es una trampa real: pasó al armar el borrador.

### Base de datos

```sql
select now() at time zone 'UTC' as medido_utc,
  (select count(*) from information_schema.tables
     where table_schema='public' and table_type='BASE TABLE') as tablas_base,
  (select count(*) from information_schema.tables
     where table_schema='public' and table_type='BASE TABLE' and table_name like 'ops_%') as respaldos,
  (select count(*) from information_schema.views where table_schema='public') as vistas,
  (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public') as funciones_postgres;
```

**Las columnas se cuentan cruzando contra `tables`**, o el número incluye las vistas y no cuadra:

```sql
select count(*) from information_schema.columns c
join information_schema.tables t
  on t.table_schema=c.table_schema and t.table_name=c.table_name
where c.table_schema='public' and t.table_type='BASE TABLE';
```

---

## 5. Las ocho trampas — todas encontradas al armar el borrador

Estas son reales. Verificalas una por una.

| # | Trampa | Qué hacer |
|---|---|---|
| 1 | **No hay TODO/FIXME en este código.** Buscar «TODO» da ~52 falsos positivos porque *todo* es palabra española corriente en los comentarios. | Usá `grep -rnE "(//\|/\*\|\*)\s*(TODO\|FIXME)\b" src`. Da **cero**. No apoyes ningún estado en un TODO. |
| 2 | **Las cifras se mueven mientras medís.** La base es de producción: `students` creció durante la propia medición. | Anclá **commit + fecha + hora UTC** de cada bloque de cifras. |
| 3 | **Comparaciones con distinta base.** El informe viejo contó 602 acciones sobre `src/lib/actions/*.ts`; contar los 115 archivos con `'use server'` da 676. No son comparables. | Al comparar contra el informe viejo, **usá su misma base** y decilo. |
| 4 | **Las estadísticas de Postgres mienten.** `pg_stat_user_tables` reportaba 0 filas para tablas que tienen cientos. | Usá siempre `count(*)` exacto. |
| 5 | **Contar pruebas con grep da mal.** `grep -c "it(\|test("` da 58; vitest reporta **54**. | Corré `npx vitest run` y usá su salida. |
| 6 | **La caché de Next sobrevive al reinicio del servidor.** Si cambiás datos y la pantalla muestra lo viejo, no es la base. | `rm -rf .next/cache/fetch-cache` y reiniciar. |
| 7 | **Una secuencia vive en dos lugares**: el archivo de configuración (`src/lib/sequence-pages/`) manda en la página de la secuencia y en Teach it; `lessons.wb_sequence_id` manda en el Curso, en Let's Play y en la evaluación. | Si describís el currículo, mirá **las dos** fuentes. |
| 8 | **`INFO_DECRETO722.md` existe y está vencido.** Declara 123 tablas, 183 migraciones, 1.119 commits, 24 funciones de Postgres. Ninguna es cierta hoy. | Verificá la tabla de contraste de la sección 8 del borrador y actualizala. |

---

## 6. Qué revisar específicamente, sección por sección

**§1 Módulos (61, clasificados COMPLETO / EN DESARROLLO / PENDIENTE).**
El criterio está escrito en el borrador. Recalculá al menos: los **3 PENDIENTES** (¿de verdad nada los importa? contá importadores fuera de su propia carpeta) y los **17 EN DESARROLLO** (¿los conteos de filas siguen iguales?). Si un módulo cambió de estado, decilo.

**§2 Las cuatro líneas de usuario y los seis mecanismos de acceso.**
Abrí `src/middleware.ts` y `src/app/(dashboard)/layout.tsx` y confirmá los guardas. Ojo con dos afirmaciones frágiles: que el portal del alumno abre sin PIN, y que el del coach exige token **más** `course_access_granted`.

**§3 Recorrido y las seis compuertas del ascenso de cinta.**
Leé `service-planner.ts` en `closeCampFinal` y confirmá las seis, en orden. Confirmá también la afirmación fuerte: **no existe certificado ni verificación pública de cinta**. Buscá «certificate», «diploma», «certificado» en `src/`, `supabase/` y `public/`.

**§4 Alto rendimiento.**
Verificá la separación tablas exclusivas / compartidas grepeando cada nombre de tabla fuera de los archivos HP. Confirmá que `hp_athlete_links` tiene filas y cero referencias.

**§5 Pendientes.**
Contá las casillas de `PENDIENTES.md` (`- [ ]` vs `- [x]`). Confirmá los **cinco ítems que el código ya resolvió** — un expediente no puede declarar faltante algo que está en producción.

**§6 Cifras.** Recalculá todas con los comandos de arriba.

**§7 NO VERIFICADO.** Intentá cerrar los siete puntos. El más importante para el trámite: **2.066 fichas con waiver marcado pero solo 200 con fecha de firma**. El código siempre escribe la fecha, así que esas filas vienen de otro lado. Revisá las migraciones de importación. Si lo resolvés, es una mejora real del expediente.

**§8 El informe viejo.** Verificá cada fila de la tabla de contraste.

---

## 7. Qué entregar

1. **`ESTADO_ACTUAL.md` corregido**, con el commit de corte actualizado.
2. **`REVISION_ESTADO_ACTUAL.md`**, un informe aparte con:
   - Tabla de **cifras que cambiaron**: valor del borrador → valor verificado → comando usado.
   - **Afirmaciones que no se sostuvieron**, con la versión correcta y la evidencia.
   - **Lo que quedó NO VERIFICADO** y qué se intentó.
   - **Riesgos para el expediente**, ordenados por gravedad.

No mezcles las dos cosas: el expediente lleva el documento, no el informe de revisión.

---

## 8. Tono del documento

Español de El Salvador, voseo en la comunicación conmigo pero **el documento va en registro formal e impersonal** — lo lee un funcionario.

Frases cortas. Tablas antes que párrafos. Cada sección debe poder leerse sola. Nada de adjetivos de venta: es un informe técnico, no un folleto. Si algo está a medias, se dice que está a medias.
