'use client';

// ═══ Link directo de reserva de ESTE servicio (pedido de Rick 2026-10-02) ═══
// El mismo botón que tiene el front desk (HostPortal · OpEventCard): el cliente
// cae en el QR /join con la clase ya elegida. Se arma con el dominio desde el
// que se abre el dashboard, igual que en el front desk.
import { useState } from 'react';
import { Link2 } from 'lucide-react';

export function CopyBookingLinkButton({ path }: { path: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const copy = () => {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url)
      .then(() => setMsg('🔗 Link copiado — pegalo en WhatsApp'))
      .catch(() => setMsg(url));
    setTimeout(() => setMsg(null), 3500);
  };
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={copy}
        className="w-full min-h-[44px] rounded-[5px] border inline-flex items-center justify-center gap-2 text-[12px] uppercase tracking-wider bg-[#F7F9FA] hover:bg-white"
        style={{ borderColor: '#DCD7C6', color: '#00728A', fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
      >
        <Link2 size={14} strokeWidth={1.75} />
        Copiar link de reserva (WhatsApp)
      </button>
      {msg && <p className="mt-1 text-[11px] font-semibold text-center break-all" style={{ color: '#00728A' }}>{msg}</p>}
    </div>
  );
}
