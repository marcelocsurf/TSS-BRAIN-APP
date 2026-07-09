'use client';

// The Surf Sequence® / Puro Surf liability waiver — bilingual (ES + EN).
// Presentation only: a plain-language summary up top, then the full legal text
// in collapsible sections so the signer isn't hit with a wall of text.
// NOTE: this text is a DRAFT and must be reviewed by an attorney before use.

export const WAIVER_VERSION = 'tss-purosurf-2026-07';

type Section = { n: number; es_t: string; en_t: string; es: string; en: string };

const SUMMARY_ES = [
  'El surf y las actividades acuáticas son peligrosos y pueden causar lesiones graves o la muerte.',
  'Participás por tu cuenta y riesgo, y liberás a The Surf Sequence®, Puro Surf y su equipo de responsabilidad por negligencia ordinaria.',
  'Declarás estar apto físicamente, saber nadar y haber informado tus condiciones médicas.',
  'Los cursos y videos del portal son referencia; practicarlos sin supervisión o sobre tu nivel es bajo tu responsabilidad.',
  'Debés seguir siempre las instrucciones de los coaches y las reglas de seguridad.',
];

// Extra plain-language points shown only in the coach waiver.
const COACH_SUMMARY_ES = [
  'El método, materiales, videos y portal de The Surf Sequence® son confidenciales y propiedad de la empresa: no los copies, compartas ni enseñes fuera de tu rol.',
  'El acceso al material es exclusivo para miembros con membresía/certificación TSS activa y al día.',
  'Si tu membresía vence o termina tu relación, dejás de usar la marca, el método y los materiales.',
];

// Coach-only clauses appended after the shared sections. Numbered C1–C3 so they
// never collide with the participant sections above.
const COACH_SECTIONS: Section[] = [
  { n: 101, es_t: 'Confidencialidad y propiedad intelectual', en_t: 'Confidentiality and intellectual property',
    es: 'Reconozco que el Método The Surf Sequence®, sus secuencias, drills, misiones, manuales, videos, evaluaciones, el portal y todo material relacionado (el “Material TSS”) son propiedad exclusiva de las Partes Liberadas y constituyen información confidencial y secretos comerciales. Me obligo a mantenerlos en estricta confidencialidad, a no copiarlos, reproducirlos, publicarlos, distribuirlos ni enseñarlos fuera de mi rol autorizado, y a no usarlos para crear métodos derivados ni para competir con las Partes Liberadas. Esta obligación se mantiene incluso después de terminar mi relación con ellas.',
    en: 'I acknowledge that The Surf Sequence® Method, its sequences, drills, missions, manuals, videos, evaluations, the portal and all related material (the “TSS Material”) are the exclusive property of the Released Parties and constitute confidential information and trade secrets. I agree to keep them strictly confidential, not to copy, reproduce, publish, distribute or teach them outside my authorized role, and not to use them to create derivative methods or to compete with the Released Parties. This obligation survives the end of my relationship with them.' },
  { n: 102, es_t: 'Uso exclusivo para miembros / membresía al día', en_t: 'Members-only use / active membership',
    es: 'Reconozco que el acceso al Material TSS se otorga únicamente mientras mantenga una membresía y/o certificación TSS activa y al día. Si mi membresía vence, se suspende, o termina mi relación con las Partes Liberadas por cualquier causa, cesará de inmediato mi derecho a usar el Material TSS.',
    en: 'I acknowledge that access to the TSS Material is granted only while I maintain an active TSS membership and/or certification in good standing. If my membership expires, is suspended, or my relationship with the Released Parties ends for any reason, my right to use the TSS Material shall cease immediately.' },
  { n: 103, es_t: 'Cese y devolución al terminar', en_t: 'Cessation and return upon termination',
    es: 'Al finalizar mi vínculo con las Partes Liberadas, por cualquier causa, me obligo a dejar de representarme como coach de The Surf Sequence®, a dejar de usar la marca, el método y el Material TSS, y a devolver o eliminar de forma permanente toda copia (física o digital) en mi poder.',
    en: 'Upon the end of my relationship with the Released Parties, for any reason, I agree to stop representing myself as a The Surf Sequence® coach, to stop using the brand, the method and the TSS Material, and to return or permanently delete any copy (physical or digital) in my possession.' },
];

const SECTIONS: Section[] = [
  { n: 1, es_t: 'Partes liberadas', en_t: 'Released parties',
    es: 'Este acuerdo se otorga a favor de: Enkrateia, S.A. de C.V.; The Surf Sequence®; Puro Surf y Puro Surf Academy (y la sociedad que las opera); el señor Marcelo Castellanos; y todos sus socios, directores, empleados, entrenadores, instructores, contratistas, voluntarios, agentes y representantes (en conjunto, las “Partes Liberadas”).',
    en: 'This agreement is granted in favor of: Enkrateia, S.A. de C.V.; The Surf Sequence®; Puro Surf and Puro Surf Academy (and their operating company); Mr. Marcelo Castellanos; and all of their partners, directors, employees, coaches, instructors, contractors, volunteers, agents and representatives (collectively, the “Released Parties”).' },
  { n: 2, es_t: 'Actividades cubiertas', en_t: 'Covered activities',
    es: 'Este acuerdo cubre toda actividad organizada, impartida o supervisada por las Partes Liberadas, incluyendo: clases y entrenamientos de surf en el mar y en tierra, evaluaciones y exámenes de nivel, entrenamiento físico (gimnasio, playa, piscina), campamentos, competencias, uso de equipo (tablas, quillas, leashes, licras), transporte relacionado con las actividades, y cualquier actividad conexa (en conjunto, las “Actividades”).',
    en: 'This agreement covers any activity organized, taught or supervised by the Released Parties, including: surf lessons and training in the ocean and on land, level assessments and exams, physical training (gym, beach, pool), camps, competitions, use of equipment (boards, fins, leashes, rash guards), transportation related to the activities, and any related activity (collectively, the “Activities”).' },
  { n: 3, es_t: 'Asunción voluntaria del riesgo', en_t: 'Voluntary assumption of risk',
    es: 'Entiendo y acepto que el surf y las actividades acuáticas son actividades INHERENTEMENTE PELIGROSAS que pueden causar lesiones graves, incapacidad permanente o la MUERTE. Los riesgos incluyen, sin limitarse a: ahogamiento; golpes con la tabla propia o ajena, quillas o el fondo marino; corrientes, resacas, olas y cambios súbitos del clima y del mar; vida marina (rayas, medusas, erizos, entre otros); fondos de roca, arrecife o arena; colisiones con otras personas; fallas del equipo; lesiones musculares y articulares en el entrenamiento físico; insolación y deshidratación; y riesgos propios del transporte. Declaro que participo de forma VOLUNTARIA, conociendo estos riesgos, y los ASUMO EN SU TOTALIDAD, sean conocidos o desconocidos, previsibles o imprevisibles.',
    en: 'I understand and accept that surfing and water activities are INHERENTLY DANGEROUS activities that can cause serious injury, permanent disability or DEATH. Risks include, without limitation: drowning; impact with my own or another person’s board, fins or the sea floor; currents, rips, waves and sudden changes in weather and ocean conditions; marine life (stingrays, jellyfish, sea urchins, among others); rock, reef or sand bottoms; collisions with other people; equipment failure; muscle and joint injuries during physical training; sunstroke and dehydration; and risks inherent to transportation. I declare that I participate VOLUNTARILY, aware of these risks, and I FULLY ASSUME them, whether known or unknown, foreseeable or unforeseeable.' },
  { n: 4, es_t: 'Declaración de aptitud médica', en_t: 'Medical fitness declaration',
    es: 'Declaro que me encuentro física y mentalmente apto para participar en las Actividades, que sé nadar, y que he informado por escrito cualquier condición médica relevante. Autorizo a las Partes Liberadas a gestionar atención médica de emergencia en mi favor si fuera necesario, y acepto que todos los costos médicos, de rescate, traslado o evacuación serán por mi cuenta.',
    en: 'I declare that I am physically and mentally fit to participate in the Activities, that I know how to swim, and that I have disclosed in writing any relevant medical condition. I authorize the Released Parties to arrange emergency medical care on my behalf if necessary, and I accept that all medical, rescue, transport or evacuation costs shall be at my own expense.' },
  { n: 5, es_t: 'Liberación de responsabilidad y compromiso de no demandar', en_t: 'Release of liability and covenant not to sue',
    es: 'En la máxima medida permitida por la ley aplicable, LIBERO, EXONERO Y DESCARGO para siempre a las Partes Liberadas de toda responsabilidad, reclamo, demanda, acción o causa de acción, presente o futura, por lesiones personales, muerte, daños a la propiedad o cualquier otra pérdida derivada de mi participación en las Actividades, INCLUYENDO AQUELLAS CAUSADAS POR NEGLIGENCIA ORDINARIA de las Partes Liberadas. Me comprometo a NO DEMANDAR a las Partes Liberadas por dichos conceptos. Esta liberación no aplica a conductas que la ley no permita exonerar (como dolo o culpa grave).',
    en: 'To the maximum extent permitted by applicable law, I RELEASE, WAIVE AND FOREVER DISCHARGE the Released Parties from any and all liability, claims, demands, actions or causes of action, present or future, for personal injury, death, property damage or any other loss arising from my participation in the Activities, INCLUDING THOSE CAUSED BY THE ORDINARY NEGLIGENCE of the Released Parties. I covenant NOT TO SUE the Released Parties for such matters. This release does not apply to conduct that cannot be waived under applicable law (such as willful misconduct or gross negligence).' },
  { n: 6, es_t: 'Indemnización', en_t: 'Indemnification',
    es: 'Acepto INDEMNIZAR, defender y mantener indemnes a las Partes Liberadas frente a cualquier reclamo de terceros (incluyendo otros alumnos, surfistas o bañistas) derivado de mis actos u omisiones durante las Actividades, incluyendo honorarios legales razonables.',
    en: 'I agree to INDEMNIFY, defend and hold harmless the Released Parties from any third-party claim (including other students, surfers or swimmers) arising from my acts or omissions during the Activities, including reasonable attorneys’ fees.' },
  { n: 7, es_t: 'Reglas de seguridad y obediencia de instrucciones', en_t: 'Safety rules and compliance with instructions',
    es: 'Me obligo a seguir en todo momento las instrucciones de los entrenadores, los protocolos de seguridad de The Surf Sequence® y las reglas de la academia. Entiendo que los entrenadores pueden suspender o modificar mi participación por condiciones del mar, del clima o por mi nivel, y que dicha decisión es definitiva. El incumplimiento de las instrucciones aumenta el riesgo y es bajo mi exclusiva responsabilidad.',
    en: 'I agree to follow at all times the instructions of the coaches, The Surf Sequence® safety protocols and the academy rules. I understand that coaches may suspend or modify my participation due to ocean or weather conditions or my skill level, and that such decision is final. Failure to follow instructions increases risk and is at my sole responsibility.' },
  { n: 8, es_t: 'Contenido digital y práctica sin supervisión', en_t: 'Digital content and unsupervised practice',
    es: 'Entiendo que los cursos en línea, videos, drills, secuencias, manuales, aplicaciones y el portal del alumno (el “Contenido Digital”) tienen fines exclusivamente educativos y de referencia, y NO sustituyen la instrucción presencial ni la supervisión profesional. Las Partes Liberadas RECOMIENDAN expresamente que todo ejercicio, drill o secuencia del Contenido Digital se realice bajo la supervisión de un entrenador profesional calificado, o únicamente cuando el practicante posea el nivel de progresión y la condición física adecuados para dicho contenido. Si decido practicar cualquier parte del Contenido Digital por mi cuenta, sin supervisión profesional, o por encima de mi nivel, lo hago de forma voluntaria, bajo mi EXCLUSIVA responsabilidad y riesgo, y LIBERO a las Partes Liberadas de toda responsabilidad por lesiones, daños o muerte derivados de dicha práctica. Reconozco además que el Contenido Digital no constituye consejo médico ni un programa de entrenamiento personalizado, y que debo consultar a un médico antes de iniciar cualquier actividad física.',
    en: 'I understand that the online courses, videos, drills, sequences, manuals, applications and the student portal (the “Digital Content”) are for educational and reference purposes only, and do NOT replace in-person instruction or professional supervision. The Released Parties expressly RECOMMEND that any exercise, drill or sequence in the Digital Content be performed under the supervision of a qualified professional coach, or only when the practitioner has the appropriate progression level and physical condition for such content. If I choose to practice any part of the Digital Content on my own, without professional supervision, or beyond my level, I do so voluntarily, at my SOLE responsibility and risk, and I RELEASE the Released Parties from any liability for injury, damage or death arising from such practice. I further acknowledge that the Digital Content does not constitute medical advice or a personalized training program, and that I should consult a physician before beginning any physical activity.' },
  { n: 9, es_t: 'Seguro', en_t: 'Insurance',
    es: 'Entiendo que las Partes Liberadas NO proporcionan seguro médico, de accidentes ni de viaje a mi favor, y que es mi responsabilidad contar con cobertura adecuada.',
    en: 'I understand that the Released Parties do NOT provide medical, accident or travel insurance on my behalf, and that it is my responsibility to carry adequate coverage.' },
  { n: 11, es_t: 'Disposiciones generales', en_t: 'General provisions',
    es: 'Este acuerdo es vinculante para mí, mis herederos y representantes. Si alguna disposición fuera declarada inválida, las demás conservarán su vigencia. Este acuerdo se rige por las leyes de la República de El Salvador y cualquier controversia se someterá a sus tribunales competentes. En caso de discrepancia entre las versiones en español e inglés, prevalecerá la versión en español. Este acuerdo permanece vigente durante toda mi relación con las Partes Liberadas y cubre todas mis participaciones presentes y futuras en las Actividades, salvo revocación escrita.',
    en: 'This agreement is binding upon me, my heirs and representatives. If any provision is held invalid, the remaining provisions shall remain in effect. This agreement is governed by the laws of the Republic of El Salvador and any dispute shall be submitted to its competent courts. In case of discrepancy between the Spanish and English versions, the Spanish version shall prevail. This agreement remains in effect throughout my relationship with the Released Parties and covers all my present and future participation in the Activities, unless revoked in writing.' },
];

export function WaiverContent({ variant = 'student' }: { variant?: 'student' | 'coach' }) {
  const summary = variant === 'coach' ? [...SUMMARY_ES, ...COACH_SUMMARY_ES] : SUMMARY_ES;
  const sections = variant === 'coach' ? [...SECTIONS, ...COACH_SECTIONS] : SECTIONS;
  const label = (n: number) => (n >= 100 ? `C${n - 100}` : String(n));

  return (
    <div className="space-y-4">
      {/* Plain-language summary */}
      <div className="rounded-xl border border-[var(--tss-cyan,#5AC3E7)]/40 bg-[var(--tss-cyan,#5AC3E7)]/10 p-4">
        <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--tss-navy)] mb-2">En resumen / In short</p>
        <ul className="space-y-1.5">
          {summary.map((s, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-gray-700">
              <span className="text-[var(--tss-cyan,#5AC3E7)] font-bold">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-gray-500 italic">
          El texto legal completo está abajo. Al firmar aceptás el documento completo, no solo este resumen.
        </p>
      </div>

      {/* Full legal text — collapsible per section */}
      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        <p className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-gray-50">
          Exención de responsabilidad, asunción de riesgo e indemnización · Release of liability
        </p>
        {sections.map((sec) => (
          <details key={sec.n} className="group">
            <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-2 hover:bg-gray-50">
              <span className="text-[13px] font-semibold text-[var(--tss-navy)]">
                {label(sec.n)}. {sec.es_t} <span className="font-normal text-gray-400">/ {sec.en_t}</span>
              </span>
              <span className="text-gray-300 group-open:rotate-90 transition-transform">›</span>
            </summary>
            <div className="px-4 pb-4 space-y-2 border-t border-gray-50 pt-3">
              <p className="text-[12.5px] text-gray-700 leading-relaxed text-justify">{sec.es}</p>
              <p className="text-[12px] text-gray-500 italic leading-relaxed text-justify">{sec.en}</p>
            </div>
          </details>
        ))}
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed">
        <strong>HE LEÍDO ESTE ACUERDO, LO ENTIENDO Y LO FIRMO LIBRE Y VOLUNTARIAMENTE.</strong>{' '}
        <span className="italic">I HAVE READ THIS AGREEMENT, I UNDERSTAND IT AND I SIGN IT FREELY AND VOLUNTARILY.</span>
      </p>
    </div>
  );
}
