'use client';

import { useState } from 'react';

/**
 * Ficha de contacto + trazabilidad de UNA reserva.
 *
 * Fuente ÚNICA para el mostrador (Hoy) y la Agenda: el host encuentra los
 * mismos datos del alumno esté donde esté, sin tener que adivinar en qué
 * pestaña estaba guardado. Acá NO va nada de dinero — cobrar, ajustar y
 * mover siguen viviendo solo en Hoy, que es donde se atiende.
 */

const F_LABEL: React.CSSProperties = { fontFamily: 'var(--font-plex), monospace', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em' };

export interface SeatContact {
  participant_id: string;
  phone?: string | null;
  email?: string | null;
  room_number?: string | null;
  notes?: string | null;
  reserved_at?: string | null;
  booked_via?: string | null;
}

export function SeatContactPanel({ seat, canEditRoom = true, disabled = false, onSaveRoom }: {
  seat: SeatContact;
  canEditRoom?: boolean;
  disabled?: boolean;
  /** Guarda la habitación del huésped. Devuelve el error si falla. */
  onSaveRoom?: (room: string | null) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [room, setRoom] = useState(seat.room_number ?? '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    if (!onSaveRoom) return;
    setSaving(true);
    const r = await onSaveRoom(room.trim() || null);
    setSaving(false);
    setMsg(r.ok ? '✓ Guardado' : (r.error ?? 'No se pudo guardar.'));
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="rounded-lg bg-white border border-gray-100 p-2.5 space-y-1.5">
      <p className="text-[8px] text-gray-400" style={F_LABEL}>Datos de contacto</p>
      {seat.phone ? (
        <p className="text-[11px]">
          💬 <a href={`https://wa.me/${String(seat.phone).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="underline decoration-dotted" style={{ color: '#0090B0' }}>{seat.phone}</a>
          <span className="text-gray-400"> · WhatsApp</span>
        </p>
      ) : (
        <p className="text-[11px] text-gray-400">💬 Sin WhatsApp registrado</p>
      )}
      <p className="text-[11px] text-gray-600">📧 {seat.email || <span className="text-gray-400">Sin correo</span>}</p>

      {canEditRoom && onSaveRoom ? (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[11px]">🏨</span>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Habitación (si es huésped)"
            className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-[11px]" />
          <button type="button" disabled={disabled || saving} onClick={save}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-50"
            style={{ background: '#061C2B', color: '#fff' }}>
            Guardar
          </button>
        </div>
      ) : seat.room_number ? (
        <p className="text-[11px] text-gray-600">🏨 Habitación {seat.room_number}</p>
      ) : null}
      {msg && <p className="text-[10px] font-semibold" style={{ color: msg.startsWith('✓') ? '#0a7c5d' : '#c04545' }}>{msg}</p>}

      <p className="text-[8px] text-gray-400 pt-1" style={F_LABEL}>Cómo llegó la reserva</p>
      <p className="text-[11px] text-gray-600">
        {seat.booked_via ?? '—'}
        {seat.reserved_at ? ` · ${new Date(seat.reserved_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/El_Salvador' })}` : ''}
      </p>
      {seat.notes && <p className="text-[10px] text-gray-500 italic leading-snug">{seat.notes}</p>}
    </div>
  );
}
