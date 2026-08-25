'use client';

// ═══ GUÍA DEL PORTAL DEL HOST ═══
// Manual de uso integrado: se abre solo la primera vez que la persona entra
// y queda siempre a un toque en el botón 📖 del encabezado. En español —
// es material interno del equipo, no de cara al alumno.

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

export function HostGuide({ canCoordinate, onClose }: { canCoordinate: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: PAPER }}>
      <div className="px-4 pt-5 pb-4 sticky top-0 z-10" style={{ background: INK }}>
        <div className="flex items-start justify-between gap-2 max-w-md lg:max-w-3xl mx-auto">
          <div>
            <p style={{ ...F_M, color: CYAN }} className="text-[9px]">The Surf Sequence · Manual del portal</p>
            <h1 style={{ ...F_D, color: PAPER }} className="text-[22px] mt-1">📖 Guía de uso</h1>
          </div>
          <button type="button" onClick={onClose}
            className="shrink-0 rounded-full px-4 py-2 text-[10px]" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
            Entendido ✓
          </button>
        </div>
      </div>

      <div className="max-w-md lg:max-w-3xl mx-auto px-4 py-4 space-y-3">
        <p className="text-[12.5px] text-gray-500 leading-relaxed">
          Este portal es tu mostrador completo: con él atendés clientes, cobrás, reservás y ves todo lo que pasa en el día.
          Volvés a esta guía cuando quieras con el botón <strong>📖</strong> de arriba.
        </p>

        {/* La confusión #1 del host (Cony, ago 2026): buscar en HOY una clase
            que está más adelante. Se aclara de entrada, antes de todo lo demás. */}
        <div className="rounded-2xl p-3.5" style={{ background: 'rgba(0,210,255,.09)', border: '1px solid rgba(0,210,255,.35)' }}>
          <p className="text-[9px] mb-1" style={{ ...F_M, color: '#0090B0' }}>Lo primero que hay que tener claro</p>
          <p className="text-[12.5px] leading-relaxed text-gray-700">
            <strong style={{ color: INK }}>HOY = atender y cobrar</strong> — solo lo que llega en los próximos 7 días.<br />
            <strong style={{ color: INK }}>AGENDA = ver y planear</strong> — cualquier día del año, pasado o futuro.
          </p>
          <p className="text-[11.5px] leading-relaxed text-gray-500 mt-1.5">
            Si no encontrás una clase en HOY, no está perdida: es que todavía falta para ella. Buscala en AGENDA con <strong>📅 Ir a</strong>.
          </p>
        </div>

        <Sec icon="🚦" title="Semáforo del día (arriba de HOY)">
          <p>Lo primero que mirás al llegar. Te avisa si hay <strong>clases sin coach</strong>, invitaciones de coach <strong>sin aceptar</strong>, <strong>sesiones sin cierre</strong> de días anteriores o grupos en <strong>sobrecupo</strong>. Si está verde, el día está en orden.</p>
        </Sec>

        <Sec icon="📋" title="HOY — atender y cobrar (próximos 7 días)">
          <Li k="Tareas">Lo que coordinación te asignó para hoy. Marcalas hechas cuando terminás.</Li>
          <Li k="Reservas recientes (48 h)">Quién acaba de reservar por QR o con un vendedor, y si ya pagó.</Li>
          <Li k="Mostrador">Cada clase del día con sus alumnos. Al llegar un cliente: tocá su nombre → <strong>💵 Cobrar</strong> (efectivo, tarjeta, transferencia o a la habitación). Con el menú <strong>⋯</strong> también podés <strong>🔁 transferirlo a otro grupo</strong> (aunque esté lleno — queda como sobrecupo) o cancelar su reserva.</Li>
          <Li k="Protocolo PDF">La referencia oficial de qué hacer cuando algo sale mal.</Li>
          <Li k="Incidentes">Lo reportado por los coaches en los últimos 14 días.</Li>
        </Sec>

        <Sec icon="🗓" title="AGENDA — ver y planear (cualquier día)">
          <Li k="Navegar">Flechas ‹ › para moverte por semanas, o <strong>📅 Ir a</strong> para saltar a cualquier fecha del año.</Li>
          <Li k="Cada tarjeta">Hora, coach, día X de Y del camp, alumnos (💰 = debe pagar, ⚠ = sin waiver), transporte 🚐 y espacios 🏛 reservados.</Li>
          <Li k="🕐 Encuentro">La hora (y lugar) a la que citás al cliente — la fija el coach al planear su semana. No es lo mismo que el 🚐: la van sale después del encuentro. Si una tarjeta no la muestra, el coach aún no la puso.</Li>
          <Li k="Tocá un nombre">Se abre su ficha de contacto: WhatsApp, correo, habitación del huésped y <strong>cómo llegó la reserva</strong> (QR del cliente o el vendedor que la hizo, con fecha y hora). Los mismos datos que en el mostrador. El cobro no se hace acá — se hace en HOY el día de la clase.</Li>
          <Li k="+ Reservar">Cliente enfrente → tocá el botón verde de la clase, buscalo (o crealo con nombre y teléfono) y listo. El cobro se confirma en HOY cuando llegue.</Li>
          <Li k="+ Clase en otro horario">¿Piden Skate un martes 2 PM? Elegí la plantilla y la hora — la clase se crea al instante y ya podés reservarle.</Li>
        </Sec>

        {canCoordinate && (
          <Sec icon="🛟" title="Modo cobertura — cuando el coordinador no está">
            <Li k="Asignar coach">Si una clase dice “Sin coach”, tocá <strong>⚠ Asignar coach</strong> en su tarjeta de AGENDA y elegí a quién invitar. Le llega email y notificación, y debe <strong>aceptar</strong> desde su portal (igual que cuando lo asigna coordinación).</Li>
            <Li k="🕐 Reprogramar">Mueve una clase de un día a otra fecha u hora. Solo clases sueltas — los camps los mueve coordinación.</Li>
            <Li k="✕ Cancelar clase">Cancela la clase y te dice a qué alumnos avisar. Coordinación queda notificada de todo lo que hagas en este modo.</Li>
          </Sec>
        )}

        <Sec icon="🚐" title="TRANSPORTE — la van de los próximos 14 días">
          <Li k="Qué muestra">Todo lo que los coaches solicitaron al planear sus clases y camps: salida → regreso, lugar, cuántos alumnos van y qué coach lo pide, agrupado por día.</Li>
          <Li k="✓ Salió">Marcalo cuando la van se vaya — todos ven que ese viaje ya está en camino. "Deshacer" lo regresa a pendiente.</Li>
          <Li k="🕐 Horario">Ajustá la hora de salida o regreso si cambia el plan del día.</Li>
          <Li k="📋 Copiar / 🖨 Imprimir">Con <strong>📋 Copiar día</strong> mandás los transportes de ese día por WhatsApp al chofer o al grupo; <strong>📋 Copiar todo</strong> manda los 14 días. Con <strong>🖨 Imprimir / PDF</strong> se abre un cuadro limpio para papel — o elegí &quot;Guardar como PDF&quot; y lo compartís por donde quieras.</Li>
        </Sec>

        <Sec icon="🏛" title="ESPACIOS — salas y lugares">
          <p>Quién usa qué espacio y cuándo (yoga deck, BJJ, gym, ice bath, skate). Podés reservar un espacio a nombre de un cliente, una clase o un coach y evitar choques de horario.</p>
        </Sec>

        <Sec icon="🏄" title="TABLAS — calculadora y rentas">
          <Li k="Calculadora de tablas">Recomienda volumen, tipo, medidas y quillas según la persona — úsalo para orientar a un cliente que renta o compra.</Li>
          <Li k="Rentas">Inventario completo: registrá la salida y devolución de cada tabla, con waiver y firma del cliente.</Li>
        </Sec>

        <Sec icon="👥" title="CLIENTES — fichas y seguimiento">
          <Li k="Buscar">Por nombre, email o teléfono.</Li>
          <Li k="Necesitan atención">Inscritos de los próximos 14 días con ficha incompleta: 🟠 = le falta algo (waiver, ficha o quiz de nivel), 🟢 = completo. Tu misión diaria es dejar todos en verde.</Li>
          <Li k="Enviar links">Botón <strong>📧</strong> manda el intake por email; <strong>📋</strong> copia el link para pegarlo en WhatsApp.</Li>
          <Li k="Ficha completa">Tocá un cliente: membresía, próximas reservas (y si pagó), bitácora de sus clases, metas, miedos, lesiones, alergias y contacto de emergencia. Leela antes de recibirlo — atención de otro nivel.</Li>
        </Sec>

        <Sec icon="🧭" title="Reglas de oro">
          <p>1. Todo cobro queda registrado en el sistema — nada de papelitos.</p>
          <p>2. Si algo sale mal, primero el <strong>Protocolo de resolución de problemas</strong> (PDF en HOY).</p>
          <p>3. Lo que no puedas resolver, escalalo a coordinación — el sistema ya les avisa de casi todo solo.</p>
        </Sec>

        <button type="button" onClick={onClose}
          className="w-full rounded-full py-3.5 text-[10px]" style={{ ...F_M, background: INK, color: CYAN, fontWeight: 700 }}>
          Cerrar la guía y empezar →
        </button>
      </div>
    </div>
  );
}
