# Aplicado — criterios White Belt STP-001…STP-025 (2026-09-17)

Base: Supabase `cssewjefhnamconoyuso`. Respaldo previo: `ops_criterios_backup_2026_09_17_drills_missions` / `..._lessons`.
Solo UPDATE por id. Sin DELETE ni INSERT. Filas viejas con `active=false` no se tocaron.

Reglas de Marcelo aplicadas por encima de la propuesta:
- Pop-up: "Front foot lands first or both feet together — never the back foot first — front foot centered across the width. Hands stay on the rails until both feet are down and the weight is on the front foot." (STP-016 misión + drill + cadena SEQ3-RUN, STP-017 drill).
- STP-017: sin "look down / quick glance down" → "feel where the foot landed; check only if in doubt".
- STP-019: "impulse" → "momentum" (título de MIS-WB-019, key_words de MIS-WB-019-A, MIS-WB-016-A y MIS-WB-SEQ3-RUN, self-check de la lección).
- Misiones tocadas: `reps_recommended = NULL` en todas.

## Tabla por paso

| Paso | Fila | Campo | Qué cambió |
|---|---|---|---|
| STP-001 | MIS-WB-001 | success_criteria · description_md · reps | 4 criterios nuevos; misión molde "What to do"; reps NULL |
| STP-001 | DRL-WB-01 | success_criteria · key_words | mismos 4 criterios; key_words → map·zone·hazard·entry·decide |
| STP-002 | DRL-WB-002-A | success_criteria · description_md | flow completo plantilla v2, 4 criterios, sin minutos ni reps |
| STP-002 | DRL-WB-02 | active | desactivado (vive el id nuevo 002-A) |
| STP-002 | DRL-WB-002-B | student_visible | → catálogo del coach (false) |
| STP-002 | MIS-WB-002 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-003 | DRL-WB-003-A | success_criteria · description_md · reps | 4 criterios; sin (8/6 reps), "first 3", "every 2"; reps NULL |
| STP-003 | MIS-WB-003 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-004 | DRL-WB-04 | success_criteria · description_md · reps | 4 criterios; sin reps/segundos; sin "body ocean-side"; reps NULL |
| STP-004 | MIS-WB-004 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-004 | lessons STP-004 | description_md | Biomechanics: + "nose pointing into the incoming foam — against…" |
| STP-005 | DRL-WB-005-A | success_criteria · description_md · reps | 4 criterios; sin (5 / 5-8 reps); reps NULL |
| STP-005 | MIS-WB-005 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-005 | lessons STP-005 | description_md | quitada línea "5–8 placements without losing the board" |
| STP-006 | DRL-WB-006-A | success_criteria · description_md · reps | 4 criterios; sin (10 reps); reps NULL |
| STP-006 | MIS-WB-006 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-006 | lessons STP-006 | description_md | quitada línea "You pass 5–8 foam waves…" |
| STP-007 | DRL-WB-07 | success_criteria · description_md · reps | 4 criterios; sin (3 reps), "last rep"; reps NULL |
| STP-007 | MIS-WB-007 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-007 | MIS-WB-007-A | success_criteria · reps | sin "Two-plus"; reps NULL |
| STP-007 | lessons STP-007 | description_md | quitada línea "You pass 5 foam waves…" |
| STP-008 | DRL-WB-008-A | success_criteria · description_md · reps | 4 criterios; sin (3 / 5+5 reps); reps NULL |
| STP-008 | MIS-WB-008 | success_criteria · description_md · reps · key_words | 4 criterios; molde; reps NULL; key_words = las del drill |
| STP-008 | lessons STP-008 | description_md | quitada línea "5 turns with the board controlled" |
| STP-009 | DRL-WB-009-A | success_criteria · description_md · reps | 4 criterios; sin (3 / 2 reps); reps NULL |
| STP-009 | MIS-WB-009 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-010 | DRL-WB-010-A | success_criteria · description_md · reps | 4 criterios; sin conteos ni "one or two adjustments"; reps NULL |
| STP-010 | MIS-WB-010 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-010 | MIS-WB-010-A | success_criteria · reps | 5 criterios de cadena (uno por eslabón); reps NULL |
| STP-011 | DRL-WB-011-A | success_criteria · description_md · reps | 3 criterios; sin (4 / 5-8 reps); reps NULL |
| STP-011 | MIS-WB-011 | success_criteria · description_md · reps | 3 criterios; molde; reps NULL |
| STP-011 | lessons STP-011 | description_md | "5 of 5" → "Nose points where the foam is going before the first stroke" |
| STP-012 | DRL-WB-012-A | success_criteria · description_md · reps | 4 criterios; sin runs/lengths/sprints/"ten strokes"; reps NULL |
| STP-012 | MIS-WB-012 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-012 | lessons STP-012 | description_md | "5 of 10" → accelerate; "aggressively" → full commitment; + "1-4 m behind you" |
| STP-013 | DRL-WB-013-A | success_criteria · description_md · reps | 4 criterios; sin (3 each side); reps NULL |
| STP-013 | MIS-WB-013 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-013 | lessons STP-013 | description_md | "5 left and 5 right" → "turns to the side you called, on both sides" |
| STP-014 | DRL-WB-014-A | success_criteria · description_md · reps | 4 criterios; sin (3 / 5 reps); reps NULL; "30 cm" queda |
| STP-014 | MIS-WB-014 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-014 | lessons STP-014 | description_md | "exit 5 rides" → rails in hand; Biomechanics + ocean side / beach side |
| STP-015 | DRL-WB-015-A | success_criteria · description_md · reps | 4 criterios; sin (5 reps); reps NULL |
| STP-015 | MIS-WB-015 | title · success_criteria · description_md · reps · time | 'Pick Your Line, Then Stand'; 4 criterios; molde; ambos NULL |
| STP-015 | lessons STP-015 | description_md | pie → "These self-checks describe execution, not a count…" |
| STP-016 | DRL-WB-016-A | success_criteria · description_md · reps | 4 criterios (regla pop-up Marcelo); sin (5 reps) ni ~2-second; reps NULL |
| STP-016 | MIS-WB-016 | title · success_criteria · description_md · reps · time | 'Stand Up on Foam'; 4 criterios con regla pop-up; molde; ambos NULL |
| STP-016 | MIS-WB-016-A | success_criteria · reps · time · key_words | 3 criterios propios; ambos NULL; impulse → momentum |
| STP-016 | lessons STP-016 | description_md | 3 self-checks nuevos con regla pop-up; pie nuevo |
| STP-017 | DRL-WB-017-A | success_criteria · description_md · reps | 3 criterios; sin (8/5 reps) ni "5 of 5"; regla pop-up; "feel, check if in doubt"; reps "Until it feels automatic" |
| STP-017 | MIS-WB-017 | title · success_criteria · description_md · reps · time | 'Land Your Back Foot in Position #2'; 3 criterios; sin glance; ambos NULL |
| STP-017 | lessons STP-017 | description_md | "5 of 5" → FP2 on the pop-up; Biomechanics FP2 back third + not loaded; pie nuevo |
| STP-018 | DRL-WB-018-A | success_criteria · description_md | 4 criterios; sin (5 reps); reps queda "Until it feels comfortable" |
| STP-018 | MIS-WB-018 | title · success_criteria · description_md · reps · time | 'Hold the Power Posture Through the Ride'; 4 criterios; molde; ambos NULL |
| STP-018 | lessons STP-018 | description_md | "≥5 s on 3 rides" → whole ride; "most" → all the weight; + "chest and both shoulders"; pie nuevo |
| STP-019 | DRL-WB-019-A | success_criteria · description_md · reps | 4 criterios; sin (10-15 / 6 reps); reps "Until it feels automatic" |
| STP-019 | MIS-WB-019 | title · success_criteria · description_md · reps · time | 'Momentum When the Board Slows'; 4 criterios; molde; ambos NULL |
| STP-019 | MIS-WB-019-A | reps · time · key_words | ambos NULL; impulse → momentum |
| STP-019 | MIS-WB-SEQ3-RUN | success_criteria · key_words · reps | criterio pop-up con regla Marcelo, sin "two seconds"; Impulse → Momentum; reps NULL |
| STP-019 | lessons STP-019 | description_md | "on 3 different rides" → "every time the board slows"; pie nuevo |
| STP-020 | DRL-WB-020-A | success_criteria · description_md · reps | 4 criterios; sin (5-10 / 5 reps); reps "Until it feels automatic" |
| STP-020 | MIS-WB-020 | title · success_criteria · description_md · reps · time | 'End Every Ride with a Starfish'; 4 criterios; molde; ambos NULL |
| STP-020 | lessons STP-020 | description_md | "3 starfish exits" → every ride ends in a starfish; pie nuevo |
| STP-021 | DRL-WB-021-A | success_criteria · description_md · reps · time | 3 criterios; sin (5/6 reps); ambos NULL |
| STP-021 | MIS-WB-021 | success_criteria · description_md · reps · time | 3 criterios; molde; ambos NULL |
| STP-021 | lessons STP-021 | description_md | "3 turns where…" → look backside first + board responds |
| STP-022 | DRL-WB-022-A | success_criteria · description_md · reps · time | 4 criterios; sin reps ni "Then 6 backside"; Skateboard → Surfskate con cono; ambos NULL |
| STP-022 | MIS-WB-022 | success_criteria · description_md · reps · time | 4 criterios; molde; ambos NULL |
| STP-022 | lessons STP-022 | description_md | "3 frontside turns" → before and during; criterio 3 → crosses on the rail; "not using the objective" → no target picked |
| STP-023 | DRL-WB-023-A | success_criteria · description_md · reps | 4 criterios (marchas dentro de FORWARD); sin (3 reps / 10 strokes); reps NULL |
| STP-023 | MIS-WB-023 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-023 | MIS-WB-023-A | success_criteria · key_words | V2/V3 → cruise / sprint (nombres del drill) |
| STP-023 | lessons STP-023 | description_md | Mastery 1 → técnica no se cae; Mastery 3 → 1 cruise · 2 steady · 3 sprint + nota V1–V4 |
| STP-024 | DRL-WB-024-A | success_criteria · description_md · reps | 4 criterios; sin (3/3/5 reps); alineación → frase de doctrina; reps NULL |
| STP-024 | MIS-WB-024 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-024 | lessons STP-024 | description_md | "5 rolls" → never leaves your hands; timing → just before it hits; Biomechanics → frase canónica |
| STP-025 | DRL-WB-025-A | success_criteria · description_md · reps | 4 criterios; sin (3 / 5 reps per mode); reps NULL |
| STP-025 | MIS-WB-025 | success_criteria · description_md · reps | 4 criterios; molde; reps NULL |
| STP-025 | lessons STP-025 | description_md | "6 direction changes" → either side on purpose, ready to paddle |

Totales: 68 filas de `drills_missions` + 18 filas de `lessons` = 86 filas. Los 25 pasos recibieron criterios + misión.

## NO aplicado y por qué

- **Pie de las lecciones STP-001…014 y 021…025** ("…across 3 different sessions… Your coach confirms mastery"): la propuesta lo deja como decisión abierta (regla de graduación vs. criterio; STP-021/022 piden conservar la consistencia entre sesiones). Solo se reemplazó en STP-015…020, donde había texto concreto.
- **STP-001 time_estimate en minutos (21 tarjetas)**: "decisión única" pendiente de Marcelo; se conservó salvo donde el texto lo pidió (015–022).
- **STP-002 lección** ("patterns used in paddling, pop-up…" → 'simulate today's steps'): no hay frase de reemplazo completa; queda para Marcelo. La tabla del coach "10 minimum" vive en MASTER-WB-06, no en `lessons`.
- **STP-003 Common errors** (nunca sobre la cabeza): el campo es `errors_md`, fuera del alcance (solo `description_md`); tampoco venía entre comillas.
- **STP-003/004 filas del coach que pertenecen a 006/007**: MASTER-WB-06, no `lessons`.
- **STP-005/006/008 MASTER-WB-06** (parallel/perpendicular, "between board and shore"): documento master, no `lessons`; `errors_md` de STP-005 ya dice "parallel (sideways)" y STP-008 ya dice "Board ends up between you and the wave".
- **STP-006 título de misión** ('Hold the Board Through the Foam', "p.ej."): el título actual "Manage the Board Through the Foam" no tiene conteo; sugerencia, no orden.
- **STP-007 renombrar MIS-WB-007 "sin Five"**: el título actual ya no tiene "Five".
- **STP-013 coach cue "Hold 2 sec"**: pregunta abierta, coach-only.
- **STP-016 Biomechanics de la lección** aún dice "Both feet land together, the front foot centered…": la regla de Marcelo se aplicó a self-checks, misiones y drills; la frase del cuerpo de la lección no estaba citada. Sugerido alinearla. Título del drill "2-Second Pop-Up Connection Drill" y "about 2 seconds" en Understand/Simulate no se pidieron quitar.
- **STP-017 MIS-WB-017-A** "Power stance held 2+ sec" (catálogo coach): no mencionado.
- **STP-019 errors_md** "No upward extension" → "no forward extension": campo `errors_md`, fuera del alcance; conviene aplicarlo.
- **STP-021/022 "Drill reference — TSS-021/022"**: vive en MASTER-WB-06, no en `lessons`.
- **STP-024 "protect your face from the bottom"**: "conviene" reescribir, sin texto definitivo.
- **STP-024 MIS-BB-NAV** "Five rolls (or three duck dives)" y **SEQ1/2/4/5-RUN**: cadenas no mencionadas en la propuesta; sin tocar.
- **JUEGOS**: no aplicados por instrucción.
- **MASTER-WB-06 (manual)** en general: fuera de la base `lessons`/`drills_missions`.

## Nota de riesgo
- `DRL-WB-02` pasó a `active=false` porque la propuesta lo dice explícitamente; el contenido ya vive en `DRL-WB-002-A`. Reversible con el respaldo.
- Los drills activos de STP-001/004/007 son ids viejos (`DRL-WB-01`, `DRL-WB-04`, `DRL-WB-07`) sin versión -A; se trataron como drill principal del paso.
