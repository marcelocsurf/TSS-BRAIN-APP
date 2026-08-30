'use client';

// ═══ GUÍA DEL PORTAL DEL COACH ═══
// Manual integrado: se abre solo la primera vez y queda en el botón
// "📖 Guía rápida" del Home. En español — material interno del equipo.

const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };

function Sec({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="font-bold text-[14px]" style={{ color: INK }}>{icon} {title}</p>
      <div className="mt-1.5 space-y-1.5 text-[12.5px] leading-relaxed text-gray-600">{children}</div>
    </div>
  );
}

function Li({ k, children }: { k: string; children: React.ReactNode }) {
  return <p><strong style={{ color: INK }}>{k}</strong> — {children}</p>;
}

export function CoachGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: PAPER }}>
      <div className="px-4 pt-5 pb-4 sticky top-0 z-10" style={{ background: INK }}>
        <div className="flex items-start justify-between gap-2 max-w-md lg:max-w-3xl mx-auto">
          <div>
            <p style={{ ...F_M, color: CYAN }} className="text-[9px]">The Surf Sequence · Manual del coach</p>
            <h1 style={{ ...F_D, color: PAPER }} className="text-[22px] mt-1">📖 Guía rápida</h1>
          </div>
          <button type="button" onClick={onClose}
            className="shrink-0 rounded-full px-4 py-2 text-[10px]" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
            Entendido ✓
          </button>
        </div>
      </div>

      <div className="max-w-md lg:max-w-3xl mx-auto px-4 py-4 space-y-3">
        <p className="text-[12.5px] text-gray-500 leading-relaxed">
          Tu portal es tu día completo como coach: clases, cursos, planeación y cierre.
          Volvés a esta guía cuando quieras con el botón <strong>📖 Guía rápida</strong> del Home.
        </p>

        <Sec icon="🏠" title="Home — tu día">
          <Li k="Invitaciones">Cuando te asignan un servicio (como coach o como asistente/filmer) te aparece una tarjeta arriba de todo: <strong>Accept / Decline</strong>. Si te invitan <strong>como coach</strong>, la tarjeta te muestra <strong>quiénes van</strong> antes de decidir — tocá un nombre y se abre su ficha; como asistente los ves al aceptar, en el Plan. Respondela siempre: hasta que aceptés, coordinación no sabe si contás.</Li>
          <Li k="Tareas">Lo que coordinación te pidió para hoy. Marcalas al terminar.</Li>
          <Li k="Tu progreso">Nivel de certificación, horas coacheadas y rating de tus alumnos.</Li>
          <Li k="Plan anual">Si sos head coach de un atleta de alto rendimiento, ves su temporada con las fases del año y los <strong>días al pico</strong> — el detalle completo vive en tu portal de equipo (/equipo).</Li>
        </Sec>

        <Sec icon="📚" title="Cursos — tu certificación">
          <p>Tus cursos según tu nivel: <strong>Safety Canon</strong> (requisito L1, con examen final) y <strong>Foundations</strong> (el método). Al avanzar de nivel se te abren más cursos, drills y misiones. El progreso se guarda solo.</p>
        </Sec>

        <Sec icon="📋" title="Plan — planear y CERRAR (lo más importante)">
          <Li k="Ver el plan">El manual del día: venue, warm-up, drills por alumno. Leelo antes de la clase.</Li>
          <Li k="Quiénes van">Cada servicio del Plan trae la tira de fotos — <strong>&quot;Who&apos;s coming&quot;</strong>. Expandila y tocá al alumno: su ficha completa (médico, waiver, contacto de emergencia) queda a un toque, para repasar antes de la clase o ante cualquier emergencia.</Li>
          <Li k="Dar la clase">El modo en vivo: pasás lista, evaluás a cada alumno (enfoque, flow, feedback, próximo paso) y al final tocás <strong>cerrar el día</strong>.</Li>
          <Li k="⚠ Needs closing">Si te quedó un día sin cerrar, aparece en amarillo en el Plan (<strong>&quot;Needs closing · pay on hold&quot;</strong>): tocá ese día y te lleva directo a cerrarlo, aunque la clase haya sido hace días.</Li>
          <Li k="Foco del día">Al planear cada día elegís el paso de la Secuencia que se trabaja, del catálogo <strong>de la cinta del grupo</strong>, agrupado por secuencia. Ese paso es lo que después calificás en la evaluación.</Li>
          <Li k="Tu next focus le queda al alumno">Lo que dejás como próximo paso le aparece al alumno en su Home como <strong>&quot;Work on this&quot;</strong> — y le queda ahí hasta que él mismo lo entrene y lo lleve a 4★. Escribilo pensando en que va a trabajar solo con eso.</Li>
          <p style={{ color: '#7a5c00' }}><strong>El cierre no es papeleo:</strong> alimenta la bitácora de tus alumnos y es <strong>requisito para que se libere tu pago</strong>. Si a las 5 PM no cerraste el día, te llega un recordatorio por correo. Cierre hecho = plata en camino.</p>
        </Sec>

        <Sec icon="📅" title="Vista Semana — planear un camp o servicio">
          <Li k="Al aceptar">Te sale la <strong>vista rápida</strong>: fechas, alumnos inscritos y sus fichas. De ahí, botón <strong>📅 Vista semana</strong>.</Li>
          <Li k="La cuadrícula">Toda la semana tipo Excel: por día definís <strong>clase</strong> (hora y encuentro), <strong>lugar</strong>, <strong>transporte</strong> (salida/regreso), <strong>espacios</strong> y <strong>tablas por alumno</strong>. Tocá una celda, llenala y guardá — cada celda se guarda sola.</Li>
          <Li k="Transporte">Lo que pongas le llega directo a Front Desk con el total de pasajeros. Si después cambiás un horario, <strong>se les avisa solo</strong> — no hace falta escribirles.</Li>
          <Li k="Sin conexión">Si una celda no guarda (se fue el internet), te avisa y podés reintentar — no se pierde lo demás.</Li>
        </Sec>

        <Sec icon="🏁" title="Cerrar un camp — y los short camps">
          <Li k="Cada día">Cerrás el día como siempre: asistencia, evaluación por alumno y <strong>next focus</strong>.</Li>
          <Li k="Todos los días, sin excepción">El camp <strong>no se puede finalizar con días sin cerrar</strong>: si te falta alguno, el Plan te muestra la tarjeta <strong>&quot;Faltan cerrar&quot;</strong> con los días pendientes — tocás uno y te lleva directo. Lo que ya evaluaste no se pierde: cerrás los días que faltan y finalizás.</Li>
          <Li k="Evaluación final">Al terminar el camp evaluás a cada alumno — te sale <strong>lo que trabajó durante el camp</strong> (sus misiones) para calificar sobre eso. Todo lo que agregaste al plan durante la semana aparece ahí.</Li>
          <Li k="Alumno que se va antes">¿Vino 4 días de un camp de 6? El día que se va, en el Plan del camp te sale <strong>🏁 &quot;¿Un alumno termina HOY su short camp?&quot; → Cerrarlo</strong>: cerrá primero el día de hoy, elegí al alumno, hacés su evaluación oficial y sus encuestas le llegan ese mismo día. El resto del camp sigue normal.</Li>
          <Li k="Camp vacío">Si ya finalizaste a todos por separado, te queda el botón <strong>🏁 Finalize camp</strong> para cerrar el camp completo.</Li>
        </Sec>

        <Sec icon="🛠" title="Herramientas — recursos">
          <p>Guías de enseñanza por cinta, calculadora de tablas y materiales según tu nivel de certificación.</p>
          <Li k="Presentaciones y libros">Los materiales que te otorgaron (presentaciones, el libro <strong>One Wave</strong>, PDFs de tu nivel) salen en orden de curso, numerados. El mismo orden que ve el alumno en su Course.</Li>
        </Sec>

        <Sec icon="🏛" title="Espacios">
          <p>Qué sala/lugar está ocupado y cuándo (yoga deck, gym, ice bath, skate). Reservá antes de usar.</p>
        </Sec>

        <Sec icon="📲" title="Instalá el app en tu teléfono">
          <p><strong>iPhone:</strong> abrí tu portal en Safari → Compartir → <strong>&quot;Agregar a pantalla de inicio&quot;</strong>.</p>
          <p><strong>Android:</strong> abrilo en Chrome → menú ⋮ → <strong>&quot;Instalar aplicación&quot;</strong>.</p>
          <p className="text-gray-400">Te queda el ícono y entrás con un toque.</p>
        </Sec>

        <button type="button" onClick={onClose}
          className="w-full rounded-full py-3.5 text-[10px]" style={{ ...F_M, background: INK, color: CYAN, fontWeight: 700 }}>
          Cerrar la guía y empezar →
        </button>
      </div>
    </div>
  );
}
