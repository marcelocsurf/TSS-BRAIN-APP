'use client';

// ═══ GUÍA DEL PORTAL DEL EQUIPO (/equipo) ═══
// Manual para psicólogo, preparador físico, nutricionista, head coach y
// asistentes. Se abre solo la primera vez y queda en el botón 📖 del
// encabezado. Staff-facing → español, dark Brand v10 (igual que el portal).

const INK = '#061C2B', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#39D98A';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };

function Sec({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)' }}>
      <p className="font-bold text-[14px]" style={{ color: '#f0f7fa' }}>{icon} {title}</p>
      <div className="mt-1.5 space-y-1.5 text-[12.5px] leading-relaxed" style={{ color: '#b8cad8' }}>{children}</div>
    </div>
  );
}

function Li({ k, children }: { k: string; children: React.ReactNode }) {
  return <p><strong style={{ color: '#eaf4fa' }}>{k}</strong> — {children}</p>;
}

export function SpecialistGuide({ roleKey, onClose }: { roleKey: string; onClose: () => void }) {
  const canDiet = roleKey === 'nutricionista' || roleKey === 'head';
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: INK }}>
      <div className="px-4 pt-5 pb-4 sticky top-0 z-10" style={{ background: INK, borderBottom: '1px solid rgba(0,210,255,.25)' }}>
        <div className="flex items-start justify-between gap-2 max-w-md lg:max-w-3xl mx-auto">
          <div>
            <p style={{ ...F_M, color: CYAN }} className="text-[9px]">The Surf Sequence · Manual del equipo</p>
            <h1 style={{ ...F_D, color: '#f0f7fa' }} className="text-[22px] mt-1">📖 Guía de uso</h1>
          </div>
          <button type="button" onClick={onClose}
            className="shrink-0 rounded-full px-4 py-2 text-[10px]" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
            Entendido ✓
          </button>
        </div>
      </div>

      <div className="max-w-md lg:max-w-3xl mx-auto px-4 py-4 space-y-3">
        <p className="text-[12.5px] leading-relaxed" style={{ color: '#8aa0b2' }}>
          Este es tu portal como parte del equipo de alto rendimiento: tus atletas, su plan de temporada
          y tus herramientas para trabajar con ellos. Volvés a esta guía con el botón <strong style={{ color: '#dce8f0' }}>📖</strong> de arriba.
        </p>

        <Sec icon="🏄" title="Mis atletas">
          <p>Cada tarjeta es un atleta de una temporada donde estás asignado. Muestra su <strong style={{ color: '#eaf4fa' }}>posición en la temporada</strong> (semana actual / total) y su próximo evento. Tocá la tarjeta para abrir todo su detalle.</p>
        </Sec>

        <Sec icon="🗓" title="Plan de temporada">
          <p>La línea de tiempo completa del atleta: microciclos, competencias 🏆 y evaluaciones 📋, con la semana actual marcada. Ahí ves <strong style={{ color: '#eaf4fa' }}>en qué fase está</strong> (base, específico, tapering, competencia) para ajustar tu trabajo a la carga.</p>
        </Sec>

        <div className="rounded-2xl p-3.5" style={{ background: 'rgba(155,123,255,.09)', border: '1px solid rgba(155,123,255,.4)' }}>
          <p className="text-[9px] mb-1" style={{ ...F_M, color: '#B9A5FF' }}>La regla de oro</p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: '#b8cad8' }}>
            <strong style={{ color: '#eaf4fa' }}>💬 El muro del equipo lo lee TODO el equipo — incluido el atleta.</strong> Es el hilo
            compartido: lo que escribas ahí lo ven el head coach, los demás especialistas y el atleta en su portal.
            Para notas clínicas o privadas, usá tus propios registros.
          </p>
        </div>

        <Sec icon="🛠" title="Tus herramientas (dentro de cada atleta)">
          {canDiet && (
            <Li k="🥗 Dieta">Dejás el plan del <strong style={{ color: '#eaf4fa' }}>microciclo</strong> (se mantiene toda la fase) y notas de <strong style={{ color: '#eaf4fa' }}>hoy</strong>. El atleta lo ve directo en su día, junto a su check-in.</Li>
          )}
          <Li k="📌 Tareas y sesiones online">Asignale trabajo con título, instrucciones, video (YouTube) y fecha límite. Le aparece en su Home y lo marca <strong style={{ color: '#eaf4fa' }}>Done ✓</strong> — vos ves cuándo lo hizo.</Li>
          <Li k="📅 Citas">Agendá sesiones presenciales o virtuales (físico, mental, técnico, nutrición, evaluación). Le llegan al calendario de su portal.</Li>
          <Li k="💬 Muro">Escribí al hilo del equipo — coordinación de todos en un solo lugar.</Li>
        </Sec>

        <Sec icon="🖨" title="Imprimir el plan">
          <p>El botón <strong style={{ color: '#eaf4fa' }}>🖨 Imprimir plan</strong> genera la hoja completa del atleta: temporada, ruta crítica
          hacia su competencia principal y contactos del equipo. Ideal para reuniones con papás o federación.</p>
        </Sec>

        <Sec icon="🧭" title="Cómo trabajamos">
          <p>1. Todo lo que dejás acá <strong style={{ color: '#eaf4fa' }}>llega al atleta al instante</strong> — nada se queda en papel.</p>
          <p>2. Revisá el plan de temporada antes de asignar carga: tu trabajo se suma al del resto del equipo.</p>
          <p>3. Lo que no puedas resolver, escribilo en el muro — el head coach lo ve.</p>
        </Sec>

        <button type="button" onClick={onClose}
          className="w-full rounded-full py-3.5 text-[10px]" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
          Cerrar la guía y empezar →
        </button>
      </div>
    </div>
  );
}
