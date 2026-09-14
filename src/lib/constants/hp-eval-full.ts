// ═══ EVALUACIÓN COMPLETA TSS · el instrumento del app de Alto Rendimiento ═══
//
// Portado 1:1 (2026-09-14) desde EVAL_FULL_ITEMS del app HP (tss-elsalvador),
// para que la misma evaluación viva en TSS BRAIN: 6 bloques, 142 ítems.
// Físico = 13 tests objetivos con medida (no 1-5) + histórico médico (texto).
// Técnica · Maniobras · Longboard · Táctica · Mental = ítems 1-5 (salvo los
// marcados type 'text' o 'number').
// Marcelo (2026-09-14): "que las evaluaciones completas de físico, técnico,
// táctico, mental estén en TSS BRAIN, las mismas que salían en el otro".

export type FullEvalItem = { id: string; label: string; hint?: string; type?: 'text' | 'number' };
export type FullEvalSection = { key: string; label: string; type?: 'text' | 'number'; items: FullEvalItem[] };
export type FullEvalBlockKey = 'fisico' | 'tecnica' | 'maniobras' | 'longboard' | 'tactica' | 'mental';

export const EVAL_FULL_BLOCKS: { key: FullEvalBlockKey; label: string; short: string; color: string; scorePrefix: 'fis' | 'tec' | 'tac' | 'men' | null }[] = [
  { key: 'fisico',    label: 'Físico',    short: 'FIS', color: '#FF8C42', scorePrefix: null },
  { key: 'tecnica',   label: 'Técnica',   short: 'TEC', color: '#00D2FF', scorePrefix: 'tec' },
  { key: 'maniobras', label: 'Maniobras', short: 'MAN', color: '#5AC3E7', scorePrefix: 'tec' },
  { key: 'longboard', label: 'Longboard', short: 'LB',  color: '#B388FF', scorePrefix: 'tec' },
  { key: 'tactica',   label: 'Táctica',   short: 'TAC', color: '#06D6A0', scorePrefix: 'tac' },
  { key: 'mental',    label: 'Mental',    short: 'MEN', color: '#FFD166', scorePrefix: 'men' },
];

export const EVAL_FULL_TYPES = ['inicial', 'periodica', 'final'] as const;
export const EVAL_FULL_DISCIPLINES = ['shortboard', 'longboard', 'both'] as const;

export const EVAL_FULL_ITEMS: Record<FullEvalBlockKey, { sections: FullEvalSection[] }> = {
  fisico: {
    sections: [
      {key:'tests', label:'A · Batería Test Físico TSS · 13 tests objetivos (retest cada 4–6 semanas)', type:'number', items:[
        {id:'popup_1min',          label:'1. Pop-up x 1 min (# reps)',                  hint:'Tabla en el piso. Pop-ups continuos en 1 min. Solo reps completas (postura estable).'},
        {id:'paddle_20m',          label:'2. Velocidad 20m con tabla · paddle sprint (s)', hint:'Agua plana, salida en parado. Cronometrar de salida a línea final.'},
        {id:'swim_20m',            label:'3. Velocidad 20m sin tabla · nado libre (s)',  hint:'Salida desde pared o de pie. Cronometrar.'},
        {id:'swim_100m',           label:'4. Nado libre 100m sin tabla (min:seg)',       hint:'Nado libre continuo 100 m. Capacidad aeróbica pura. Sin tabla.', type:'text'},
        {id:'squat_hold',          label:'5. Sentadilla fémur paralelo · HOLD (s)',      hint:'Espalda recta contra pared o libre. Fémur paralelo al piso (90° rodilla). Cortar al primer fallo.'},
        {id:'lateral_jumps_1min',  label:'6. Saltos laterales x 1 min (# reps)',         hint:'Sobre una línea o cono bajo. Pies juntos. Contar cada cruce completo.'},
        {id:'abdominals_1min',     label:'7. Abdominales x 1 min (# reps)',              hint:'Crunch o sit-up estándar (definir protocolo y mantenerlo igual). Solo reps completas.'},
        {id:'apnea_static',        label:'8. Apnea estática (s)',                        hint:'Acostado o sentado, reposo total, post-respiración preparatoria. Desde última exhalación.'},
        {id:'apnea_dynamic',       label:'9. Apnea dinámica bajo agua (m · s)',          hint:'En movimiento bajo agua. Registrar metros recorridos y/o segundos. Estandarizar protocolo.', type:'text'},
        {id:'pullups_max',         label:'10. Dominadas máximas (# reps)',               hint:'Pull-ups (definir agarre: pronas/supinadas y mantener). Reps completas sin balanceo (mentón sobre barra).'},
        {id:'burpees_1min',        label:'11. Burpees x 1 min (# reps)',                 hint:'Burpee completo: pecho al piso + salto vertical con manos arriba. Reps completas en 1 min.'},
        {id:'balance_eyes_closed', label:'12. Balance unipodal · ojos cerrados (s)',     hint:'De pie sobre un pie, ojos cerrados, brazos al lado. Cronometrar hasta perder balance o apoyar otro pie.'},
        {id:'flexibility_check',   label:'13. Flexibilidad — chequeo libre (opcional)',   hint:'Observación cualitativa: forward fold (tocar piso), shoulder flexion (brazos arriba), apertura de cadera.', type:'text'},
      ]},
      {key:'medical', label:'B · Histórico médico (info)', type:'text', items:[
        {id:'injuries_active',   label:'Lesiones activas / restricciones del día'},
        {id:'injuries_history',  label:'Lesiones históricas relevantes'},
        {id:'fragile_areas',     label:'Áreas frágiles · zonas de cuidado'},
        {id:'medication',        label:'Medicación o tratamiento en curso'},
        {id:'bottleneck',        label:'⚠ Cuello de botella físico que limita lo técnico hoy'},
      ]},
    ]
  },
  tecnica: {
    sections: [
      {key:'prch', label:'Círculo 1 · P·R·C·H (Cuerpo)', items:[
        {id:'posture',    label:'P — Posture (Postura)',    hint:'Espalda recta, cabeza arriba, peso centrado'},
        {id:'rotation',   label:'R — Rotation (Rotación)',  hint:'Ojos → cuello → torso → oblicuos → caderas'},
        {id:'compression',label:'C — Compression (Compresión)', hint:'Baja CG, comprime/extiende = fuente de velocidad'},
        {id:'hold',       label:'H — Hold (Sostén)',        hint:'Sostiene el ápex más tiempo del natural'},
      ]},
      {key:'feet', label:'Círculo 2 · Feet Position (Tabla)', items:[
        {id:'fp1', label:'FP1 · Full Tail',     hint:'Pie trasero al borde del tail · máxima palanca'},
        {id:'fp2', label:'FP2 · Neutral',       hint:'Pie trasero sobre pad/quillas · default para wave-face'},
        {id:'fp3', label:'FP3 · Forward',       hint:'Pie trasero adelantado · estabilidad, glide, secciones rápidas'},
        {id:'fp_transition', label:'Transición consciente entre FP', hint:'Cambia FP intencional según objetivo y sección'},
      ]},
      {key:'wave', label:'Círculo 3 · Wave Dynamic (Ola)', items:[
        {id:'pocket',     label:'Identificar el pocket',  hint:'Reconoce dónde vive la energía'},
        {id:'wall_read',  label:'Lectura de pared',       hint:'Lee velocidad y forma antes que llegue'},
        {id:'section_read', label:'Lectura de secciones', hint:'Anticipa cierre, plateau, rampa, hueco'},
        {id:'wave_stages', label:'Etapas de la ola (1-4)', hint:'Swell → set-up → break → reform'},
        {id:'energy', label:'Energía interna ↔ externa', hint:'Une fuerza del cuerpo con energía de la ola'},
      ]},
      {key:'flow', label:'Síntesis · FLOW', items:[
        {id:'flow_align', label:'Alineación visible FLOW', hint:'Cuerpo + Tabla + Ola alineados (observable)'},
        {id:'flow_consistency', label:'Consistencia de FLOW', hint:'Repite el estado a lo largo de la sesión'},
      ]},
    ]
  },
  maniobras: {
    sections: [
      {key:'fs', label:'FRONTSIDE (FS)', items:[
        {id:'bt_fs',      label:'Bottom Turn FS'},
        {id:'cutback_fs', label:'Cutback FS'},
        {id:'reentry_fs', label:'Reentry FS'},
        {id:'carve_fs',   label:'Carve FS'},
        {id:'floater_fs', label:'Floater FS'},
        {id:'tube_fs',    label:'Tube FS'},
        {id:'straight_air_fs', label:'Straight Air FS'},
        {id:'reverse_air_fs',  label:'Reverse Air FS'},
        {id:'rotation_fs',     label:'Full Rotation (360) FS'},
        {id:'alleyoop_fs',     label:'Alley-Oop FS'},
      ]},
      {key:'bs', label:'BACKSIDE (BS)', items:[
        {id:'bt_bs',      label:'Bottom Turn BS'},
        {id:'cutback_bs', label:'Cutback BS'},
        {id:'reentry_bs', label:'Reentry BS'},
        {id:'carve_bs',   label:'Carve BS'},
        {id:'floater_bs', label:'Floater BS'},
        {id:'tube_bs',    label:'Tube BS'},
        {id:'straight_air_bs', label:'Straight Air BS'},
        {id:'reverse_air_bs',  label:'Reverse Air BS'},
        {id:'rotation_bs',     label:'Full Rotation (360) BS'},
      ]},
      {key:'transversal', label:'Indicadores transversales', items:[
        {id:'completion_rate', label:'Completion rate (0–100%)', hint:'% de maniobras intentadas que se completan', type:'number'},
        {id:'psf',             label:'Power, Speed & Flow', hint:'Criterio WSL: potencia + velocidad + flow encadenados'},
        {id:'critical_diff',   label:'Difficulty in critical section', hint:'Ataca sección crítica vs jugar seguro'},
        {id:'variety',         label:'Variety of maneuvers', hint:'Repertorio variado misma ola/sesión'},
        {id:'combination',     label:'Combination of major maneuvers', hint:'Combina 2+ maniobras mayores en la misma ola'},
        {id:'commitment',      label:'Commitment', hint:'Compromiso visible · no hay duda en iniciación'},
        {id:'innovation',      label:'Innovation / progression', hint:'Aporte personal, riesgo, intento más allá'},
      ]},
    ]
  },
  longboard: {
    sections: [
      {key:'presurf', label:'1) Pre-Surf · Manejo', items:[
        {id:'board_handling', label:'Board handling (longboard)'},
        {id:'walk_entry',     label:'Walk out & entry'},
        {id:'get_on_board',   label:'Get on board'},
      ]},
      {key:'paddling', label:'2) Paddling', items:[
        {id:'sweet_spot',       label:'Sweet spot (longboard)'},
        {id:'paddle_efficiency', label:'Paddling efficiency · usa glide más que fuerza'},
        {id:'entry_timing',     label:'Wave entry timing'},
        {id:'turtle_roll',      label:'Turtle roll · manejo del whitewater'},
      ]},
      {key:'reading_lb', label:'3) Wave Reading', items:[
        {id:'wave_selection_lb', label:'Wave selection · olas con potencial de flow'},
        {id:'wave_anticipation_lb', label:'Wave shape anticipation'},
      ]},
      {key:'takeoff_lb', label:'4) Take-Off', items:[
        {id:'angle_trim_to', label:'Angle & trim take-off'},
        {id:'to_commitment', label:'Commitment al take-off'},
      ]},
      {key:'foundation_lb', label:'5) Foundation / Stance', items:[
        {id:'popup_fluidity', label:'Pop-up fluidity · suave, silencioso, balanceado'},
        {id:'stance_placement', label:'Stance placement'},
        {id:'posture_lb',  label:'Posture · estética y funcional clásica'},
        {id:'trim_awareness', label:'Trim awareness · usa trim para mantener glide'},
      ]},
      {key:'footwork', label:'6) Footwork (clave en longboard)', items:[
        {id:'cross_step',      label:'Cross-step técnica · pie sobre pie sin shuffles'},
        {id:'step_back',       label:'Step-back control'},
        {id:'foot_placement',  label:'Foot placement accuracy'},
        {id:'walking_board',   label:'Walking the board · ambas direcciones'},
      ]},
      {key:'nose', label:'7) Noseriding (corazón del longboard)', items:[
        {id:'nose_entry',   label:'Nose entry timing'},
        {id:'time_on_nose', label:'Time on the nose · sostenido, no dab fives'},
        {id:'hang_five',    label:'Hang five · 5 dedos sobre la nariz'},
        {id:'hang_ten',     label:'Hang ten · Holy Grail'},
        {id:'nose_stability', label:'Stability on the nose'},
        {id:'nose_section_choice', label:'Section choice · noseridea en secciones críticas'},
      ]},
      {key:'rail', label:'8) Rail Control', items:[
        {id:'trim_turns',  label:'Trim turns · usa rail sutilmente'},
        {id:'drop_knee',   label:'Drop-knee turn'},
        {id:'cutback_open', label:'Cutback (open face)'},
        {id:'functional_carving', label:'Functional carving'},
      ]},
      {key:'flow_lb', label:'9) Flow', items:[
        {id:'wave_connection', label:'Wave connection · sin dead spots'},
        {id:'speed_mgmt_lb',   label:'Speed management'},
        {id:'transitions_lb',  label:'Transitions'},
        {id:'use_entire_board', label:'Use of entire board · nariz, centro, tail'},
      ]},
      {key:'style', label:'10) Style & Grace (ISA/WSL Longboard)', items:[
        {id:'body_language', label:'Body language'},
        {id:'control_appearance', label:'Board control appearance · hace ver fácil lo difícil'},
        {id:'style_flow',    label:'Style & flow · criterio explícito de juez'},
        {id:'aesthetic_nose', label:'Aesthetic posture on nose'},
      ]},
      {key:'finish', label:'11) Finish & Safety', items:[
        {id:'dismount',   label:'Dismount / ride-out'},
        {id:'fall_mgmt',  label:'Fall management · longboard peligroso al caer'},
        {id:'recovery',   label:'Recovery for next wave'},
      ]},
      {key:'judging', label:'12) Alineación de Jueces', items:[
        {id:'traditional_progressive', label:'Traditional vs progressive'},
        {id:'score_visibility',        label:'Score visibility · hace obvios elementos que marcan score'},
        {id:'consistency_lb',          label:'Consistency / repetition'},
        {id:'critical_difficulty_lb',  label:'Critical-section difficulty'},
      ]},
    ]
  },
  tactica: {
    sections: [
      {key:'reading_t', label:'1) Lectura de Olas', items:[
        {id:'identify_pocket',  label:'Identifica el pocket · anticipadamente'},
        {id:'wave_form',        label:'Lee la forma de la ola'},
        {id:'wind_tide',        label:'Lee el viento y la marea'},
        {id:'set_reading',      label:'Lee la serie (set reading)'},
      ]},
      {key:'selection', label:'2) Elección de Olas', items:[
        {id:'selectivity',      label:'Selectividad · deja pasar olas malas'},
        {id:'compatibility',    label:'Compatibilidad ola–habilidad'},
        {id:'wave_quality',     label:'Wave quality score · califica mentalmente'},
        {id:'heat_selection',   label:'Acierto en condición de heat'},
      ]},
      {key:'use', label:'3) Uso de la Ola', items:[
        {id:'pocket_surf',      label:'Surf en el pocket'},
        {id:'speed_mgmt_t',     label:'Manejo de velocidad'},
        {id:'rail_then_push',   label:'First rail, then push'},
        {id:'speed_timing',     label:'Manage speed and timing'},
        {id:'use_full_board',   label:'Uso completo de la tabla'},
      ]},
      {key:'sections_t', label:'4) Aprovechamiento de Secciones', items:[
        {id:'setup_section',    label:'Set-up section · carga el BT'},
        {id:'pocket_section',   label:'Pocket section · su zona de mayor score'},
        {id:'critical_attack',  label:'Critical section attack'},
        {id:'ramp_section',     label:'Ramp / lip section'},
        {id:'closeout_mgmt',    label:'Closeout management'},
      ]},
      {key:'vars', label:'5) 4 Variables Tácticas TSS', items:[
        {id:'distance', label:'Distancia · calibra distancia a la sección'},
        {id:'cadence',  label:'Cadencia · no congestión ni vacíos'},
        {id:'speed_var', label:'Rapidez · velocidad ajustada a sección/maniobra'},
        {id:'escape',   label:'Escape · sabe cuándo abortar'},
      ]},
      {key:'closure', label:'6) Finalización (Cierre)', items:[
        {id:'planned_close',    label:'Cierre planificado'},
        {id:'granada',          label:'Granada / Touch board'},
        {id:'safe_exit',        label:'Salida segura'},
        {id:'setup_next',       label:'Setup para siguiente ola'},
      ]},
      {key:'heat', label:'7) Táctica de Heat', items:[
        {id:'heat_plan',        label:'Plan de heat claro'},
        {id:'plan_execution',   label:'Ejecución del plan'},
        {id:'priority_mgmt',    label:'Manejo de prioridad'},
        {id:'adapt_conditions_t', label:'Adaptación a condiciones'},
        {id:'adapt_opponent_t', label:'Adaptación a oponente'},
        {id:'pressure_decisions', label:'Decisiones bajo presión · últimos 5 min'},
      ]},
    ]
  },
  mental: {
    sections: [
      {key:'mental_core', label:'Fundamentos Mentales TSS', items:[
        {id:'focus',         label:'Enfoque (focus)',  hint:'Sostiene atención en la misión, vuelve rápido al foco'},
        {id:'relax',         label:'Saber relajarse (auto-regulación)', hint:'Baja arousal cuando lo necesita'},
        {id:'visualization', label:'Visualización',    hint:'Ensaya mentalmente líneas, maniobras, decisiones'},
        {id:'motivation',    label:'Motivación intrínseca', hint:'Driver de adentro · proceso/dominio/propósito'},
        {id:'resilience',    label:'Resiliencia post-error', hint:'Tras error vuelve a esfuerzo máx en la siguiente'},
        {id:'commitment_m',  label:'Compromiso bajo presión', hint:'Mantiene commitment técnico cuando importa'},
      ]},
      {key:'mental_observation', label:'Observación cualitativa', type:'text', items:[
        {id:'mental_notes', label:'Estado mental del atleta (observación del coach)'},
      ]},
    ]
  },
};
