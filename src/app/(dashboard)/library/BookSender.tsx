'use client';

// ═══ Enviar ONE WAVE — la palanca manual de Marcelo ═══
// Manda el libro-en-portal a cualquier email: crea/encuentra al alumno,
// otorga el recurso y envía el email de entrega. Es el MISMO motor que la
// compra por Wompi — sirve para probar el circuito y para regalos/prensa.

import { useState, useTransition } from 'react';
import { BookOpen, Send, Copy, Check } from 'lucide-react';
import { adminSendBook } from '@/lib/actions/book-admin';

export function BookSender() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; msg: string; url?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const send = () =>
    startTransition(async () => {
      setResult(null);
      setCopied(false);
      const r = await adminSendBook({ email: email.trim(), name: name.trim() || null }).catch(
        () => ({ ok: false as const, error: 'Sin conexión — probá de nuevo.' }),
      );
      if (!r.ok) {
        setResult({ ok: false, msg: r.error || 'No se pudo enviar.' });
        return;
      }
      setResult({
        ok: true,
        msg: `Listo — el libro quedó en su portal y le llegó el email de entrega.`,
        url: (r as any).portal_url,
      });
      setEmail('');
      setName('');
    });

  return (
    <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-10 h-10 rounded-xl bg-[var(--tss-navy)] text-[var(--tss-cyan,#5AC3E7)] flex items-center justify-center shrink-0">
          <BookOpen size={18} strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--tss-navy)]">Enviar ONE WAVE</p>
          <p className="text-[11px] text-gray-500 leading-snug">
            El libro queda en el portal de esa persona + email de entrega. Mismo motor que la
            compra por Wompi — ideal para probar el circuito o regalar copias.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre (opcional)"
          className="flex-1 min-w-[150px] px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@ejemplo.com"
          type="email"
          className="flex-[2] min-w-[200px] px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={send}
          disabled={pending || !email.trim()}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          style={{ background: '#0090B0' }}
        >
          <Send size={13} strokeWidth={2.5} /> {pending ? 'Enviando…' : 'Enviar libro'}
        </button>
      </div>
      {result && (
        <div className={`mt-2.5 text-xs ${result.ok ? 'text-emerald-700' : 'text-red-600'}`}>
          {result.msg}
          {result.ok && result.url && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(result.url!).then(() => setCopied(true)).catch(() => {});
              }}
              className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--tss-navy)] underline"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'copiado' : 'copiar link del portal'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
