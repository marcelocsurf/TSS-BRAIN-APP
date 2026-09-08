'use client';

// ═══ Lector de PDF DENTRO del portal ═══
// Antes el libro se abría en otra pestaña con el visor del sistema: en iOS un
// iframe mostraba solo la primera página, y el link con el token del portal
// se podía copiar y pasar. Ahora:
//  · pide un ticket de 10 minutos (openMaterial) y baja el PDF por fetch,
//  · lo dibuja página por página con pdf.js en <canvas> (funciona igual en
//    iPhone, Android y escritorio, sin botón de descarga),
//  · recuerda la última página leída en este dispositivo.
// No impide una captura de pantalla — no pretende hacerlo.
import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { openMaterial } from '@/lib/actions/materials';

const INK = '#061C2B', CYAN = '#00D2FF';

export function MaterialReader({ token, resourceId, title, onClose }: { token: string; resourceId: string; title: string; onClose: () => void }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const docRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const renderTask = useRef<any>(null);
  const key = `tss_read_${resourceId}`;

  // 1. Ticket → PDF → documento.
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const r = await openMaterial(token, resourceId);
        if (!r.ok) throw new Error(r.error);
        const res = await fetch(r.url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Could not load the file.');
        const data = await res.arrayBuffer();
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        const doc = await pdfjs.getDocument({ data }).promise;
        if (dead) return;
        docRef.current = doc;
        setPages(doc.numPages);
        let start = 1;
        try { start = Math.min(doc.numPages, Math.max(1, Number(localStorage.getItem(key)) || 1)); } catch {}
        setPage(start);
        setStatus('ready');
      } catch (e: any) {
        if (!dead) { setError(e?.message || 'Could not open.'); setStatus('error'); }
      }
    })();
    return () => { dead = true; try { docRef.current?.destroy?.(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, resourceId]);

  // 2. Dibujar la página actual al ancho disponible.
  useEffect(() => {
    if (status !== 'ready' || !docRef.current || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      try { renderTask.current?.cancel?.(); } catch {}
      const pg = await docRef.current.getPage(page);
      if (cancelled) return;
      const width = Math.min(wrapRef.current?.clientWidth ?? 800, 900);
      const base = pg.getViewport({ scale: 1 });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = width / base.width;
      const vp = pg.getViewport({ scale: scale * dpr });
      const c = canvasRef.current!;
      c.width = vp.width; c.height = vp.height;
      c.style.width = `${vp.width / dpr}px`; c.style.height = `${vp.height / dpr}px`;
      const ctx = c.getContext('2d')!;
      renderTask.current = pg.render({ canvasContext: ctx, viewport: vp });
      await renderTask.current.promise.catch(() => {});
      try { localStorage.setItem(key, String(page)); } catch {}
      wrapRef.current?.scrollTo({ top: 0 });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  // Teclado en escritorio.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setPage((p) => Math.min(pages, p + 1));
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(1, p - 1));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [pages, onClose]);

  return (
    <div className="fixed inset-0 z-[300] flex flex-col" style={{ background: INK }} role="dialog" aria-modal="true" aria-label={title}
      onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center gap-3 px-3 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-lg text-white/80 hover:text-white"><X size={20} /></button>
        <p className="text-[13px] font-semibold text-white truncate flex-1">{title}</p>
        {status === 'ready' && (
          <div className="flex items-center gap-1 text-[12px] text-white/80 font-mono">
            <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded disabled:opacity-30"><ChevronLeft size={18} /></button>
            <span className="tabular-nums">{page} / {pages}</span>
            <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="p-1.5 rounded disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>

      <div ref={wrapRef} className="flex-1 overflow-auto flex justify-center px-2 py-3" style={{ WebkitOverflowScrolling: 'touch' } as any}
        onClick={(e) => {
          // Tocar el tercio derecho avanza, el izquierdo retrocede (lectura con una mano).
          if (status !== 'ready') return;
          const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          if (x > 0.66) setPage((p) => Math.min(pages, p + 1));
          else if (x < 0.33) setPage((p) => Math.max(1, p - 1));
        }}>
        {status === 'loading' && (
          <div className="self-center text-center text-white/70 text-[13px]">
            <Loader2 className="mx-auto mb-2 animate-spin" size={22} style={{ color: CYAN }} />
            Opening your book…
          </div>
        )}
        {status === 'error' && (
          <div className="self-center text-center text-white/80 text-[13px] max-w-xs">
            <p className="font-semibold mb-1">Could not open it.</p>
            <p className="text-white/60">{error}</p>
          </div>
        )}
        <canvas ref={canvasRef} className="rounded shadow-2xl select-none" style={{ display: status === 'ready' ? 'block' : 'none', maxWidth: '100%', height: 'auto' }} />
      </div>

      {status === 'ready' && (
        <p className="text-center text-[10px] py-1.5 text-white/35 shrink-0">Tap the right side to turn the page · your place is saved on this device</p>
      )}
    </div>
  );
}
