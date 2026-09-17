# Coach alineado al alumno · 33 pasos (2026-09-17)

Solo `update lessons ... where id = 'COACH-STP-xxx'`. Campos: coach_what_md (W), coach_deliver_md (D), coach_errors_md (E), coach_validate_md (V), description_md (Desc, solo Yellow). Respaldo previo: `ops_coach_lessons_backup_2026_09_17` (75 filas). No se tocó ninguna fila STP-*, drills_missions ni doctrine_rules.

Regla común en los 33: V = success_criteria de la misión activa student_visible, textuales, sin conteos; cierre "Promote when the criteria hold across sessions". E = tabla "Error → what you see → what you say → what you do" (3–6 filas) desde errors_md del alumno + indicador negativo de la misión. 5 KEY WORDS = bloque "The 5 words" del alumno.

## Tabla

| Paso | Campos | Cambio principal |
|---|---|---|
| 001 | E, V | Errores del alumno reemplazan "conditions mid-session"; V = misión |
| 002 | D, E, V | Fuera "10 pop-ups" y minutos; simulación = pasos de hoy |
| 003 | D, E, V | Deliver era de 004/006; ahora levantar/cargar; 4 errores reales |
| 004 | E, V | Añadidos board detrás, lull, sideways, footing |
| 005 | D, E, V | Seguridad ya ok; placeholder → tabla; sin "5–8 placements" |
| 006 | D, E, V | Placeholder → tabla; sin "5–8 foam waves" |
| 007 | D, E, V | Placeholder → tabla; sin "5 foam waves" |
| 008 | D, E, V | Seguridad ya ok; placeholder → tabla; sin "5 turns" |
| 009 | D, E, V | Placeholder → tabla; V = misión |
| 010 | E, V | Fuera error de alineación (era de 011); 4 errores del alumno |
| 011 | E, V | Placeholder → tabla; sin "5 of 5" |
| 012 | W, E, V | "aggressively" → "full commitment"; errores del alumno |
| 013 | D, E, V | Único error era de 015; ahora los 4 del alumno |
| 014 | D, E, V | Placeholder → tabla; V = misión (sin "5 rides") |
| 015 | D, E, V | Placeholder → tabla; sin "5+5+5" |
| 016 | W, D, E, V | Front foot first/both; fuera "No knees"; párrafo "prone counts" |
| 017 | W, D, E, V | "feel it, check only if in doubt"; FP2 se coloca, no se carga |
| 018 | W, D, E, V | 9 puntos del alumno + "Forbidden: front knee in" |
| 019 | W, D, E, V | momentum/MOMENTUM; FS 1 mano · BS 2 manos; 3 momentos |
| 020 | D, E, V | Placeholder → tabla; sin "3 exits" |
| 021 | D, E, V | Placeholder → tabla; sin "3 turns" |
| 022 | D, E, V | Placeholder → tabla; sin "3 turns" |
| 023 | D, E, V | Marchas del alumno (1·2·3) + puente a V1–V4 de Yellow |
| 024 | D, E, V | Se introduce en White; gatea al pasar a Blue (5 rolls / 3 duck dives) |
| 025 | D, E, V | Placeholder → tabla; sin "6 direction changes" |
| 027 | Desc, W, D, E, V | V1 Cruising · V2 Working · V3 Catching · V4 Sprint; KW V1·V2·V3·V4·RHYTHM |
| 028 | Desc, W, D, E, V | Drill = apuntar pocket Y dibujar línea; KW del alumno |
| 029 | Desc, W, D, E, V | Simulación en pizarra/papel/agua calma; KW del alumno |
| 030 | Desc, W, D, E, V | Front foot first/both, manos hasta peso adelante; KW del alumno |
| 031 | Desc, W, D, E, V | Flat válido para frenar; error = flat al dibujar la línea |
| 032 | Desc, W, D, E, V | KW READ·SHOULDER·TURN·EXIT·CALM; sin "2+ times" |
| 033 | Desc, W, D, E, V | Traveling · Rising · Pocket · Whitewater |
| 034 | Desc, W, D, E, V | Flat = elección para frenar; sin "1–2 s / 5 s" en V |

Yellow (027–034): description_md quedó en 3–5 líneas "What this step is for the coach"; el detalle vive en W/D/E/V.

## Lo que NO cambié y por qué

- **005, 006, 008 (seguridad):** ya estaban corregidos (nose into the waves / body on the ocean side). Solo reemplacé placeholder de errores y quité conteos de V.
- **016 nota "If still failing after 3 attempts → REGRESS":** es una regla de sesión del coach, no un criterio de validación. Se queda.
- **015 COACH NOTE canon v8.1:** histórico, no contradice nada.
- **018 KEY WORD `COMPACT`:** el bloque "The 5 words" del alumno dice `SHOULDERS · WEIGHT · KNEE · COMPACT · EXHALE`; por regla 9 se mantiene. En W/D cambié "back knee compact" → "back knee forward" (punto 6 del alumno).
- **027 V3:** la regla decía "V3 Committed", pero la lección del alumno dice **V3 — Catching** (y el drill DRL-YB-027 también). Por "la del alumno manda" usé Catching. Si Marcelo quiere "Committed", hay que cambiar primero STP-027 y DRL-YB-027.
- **027 KEY WORDS:** el alumno no tiene bloque y MIS-YB-027 tiene key_words vacías; usé las del drill activo DRL-YB-027 (`V1 · V2 · V3 · V4 · RHYTHM`).
- **034 deliver "at least 5 seconds":** la lección del alumno lo dice textual en el drill Line Hold; lo dejé en D (es la consigna del drill), no en V.
- **Misiones coach-only con conteos** (MIS-WB-001-A, 011-A, 015-A, 017-A, 023-A, DRL-YB-032-02/03, etc.): no las cité como criterio; siguen en la base sin tocar.
- **Sin COACH-STP (035, 040, 041):** fuera de alcance.

## Cosas del alumno que me parecieron mal (para Marcelo; no las toqué)

1. **STP-019 errors_md "No upward extension"** contradice la lección y el drill ("Extend forward — forward, not up"). En el coach usé "extension goes up, not forward" como error. Corregir errors_md del alumno.
2. **STP-017 error "Foot at wrong angle"** no se explica en ninguna parte (lección, drill, misión). No lo puse en el coach.
3. **STP-023 error "Hyperextension"** tampoco se explica. No lo puse.
4. **STP-027 nomenclatura V3:** alumno dice "Catching"; la regla de hoy dice "Committed". Decidir una y propagar (STP-027, DRL-YB-027, MIS-BB-NAV usa "V3–V4 only when a wave asks").
5. **STP-023 "3 gears"** vs Yellow "4 speeds": el alumno ya lo puentea ("Yellow Belt expands these into four"). Coherente, pero White usa nombres distintos (cruise/steady/sprint) a V1–V4; el coach lo explica.
6. **STP-029 typo "Scan de wave"** en la lección del alumno.
7. **STP-030 error "Looking down"** sigue en errors_md del alumno (ERR-YB-030-05). No choca con "feel it, check only if in doubt" (mirar los pies como hábito sí es error), pero conviene revisar el texto.
8. **STP-014:** lección "soles where the nose points" vs drill "land on your side or back": coexisten en el drill; no es contradicción pero son dos imágenes distintas del aterrizaje.
9. **STP-028 DRL-YB-028-02 "Paddle-and-Turn"** ya no está activo; la lección del alumno todavía lo lista como "Drill 2". Y "Drill 1 — Visual Tracking + Pointing" ya no es el drill activo (ahora DRL-YB-028-03 apunta y dibuja). Actualizar los textos "Drills" de STP-028.
10. **STP-031** lista "6 drills"; activos hoy: -04 (coach), -05 (alumno), -06 (coach) + 2 juegos. Los drills 1–3 (Up/Down Cycle, FS Pump, BS Pump) no existen como filas activas.
11. **STP-032** lista Drill 1 "Visual ID from shore" que no existe como fila; activos: -02, -03 (coach) y -04 (alumno).
12. **STP-024** MIS-BB-NAV y la regla del agua ponen "5 rolls / 3 duck dives" al pasar a Blue; la lección White no menciona duck dive. Coherente con lo decidido, solo aviso.
13. **STP-016 doctrine_rules** (según el informe) aún dice "Both feet land together"; la lección ya dice front foot first o juntos. No toqué doctrine_rules.
