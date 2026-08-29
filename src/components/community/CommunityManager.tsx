'use client';

// El compositor y la lista de publicaciones de The Lineup (staff).
// Español: es la cara interna. Lo que ve el alumno va en inglés y vive en
// LineupTab.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  saveCommunityPost,
  setCommunityPostPublished,
  deleteCommunityPost,
  type CommunityPostRow,
  type CommunityKind,
} from '@/lib/actions/community';
import { displayDate } from '@/lib/utils/tz';
import { Megaphone, Video, Radio, GraduationCap, Pencil, Trash2, Waves } from 'lucide-react';

const KIND_META: Record<CommunityKind, { label: string; Icon: typeof Video }> = {
  note: { label: 'Nota / análisis', Icon: Megaphone },
  video: { label: 'Video', Icon: Video },
  live: { label: 'Clase en vivo', Icon: Radio },
  seminar: { label: 'Seminario', Icon: GraduationCap },
};

// ISO (UTC) → valor de <input type="datetime-local"> en la zona del navegador.
// Slicear el ISO crudo corría la hora 6h en El Salvador al editar.
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const EMPTY = {
  id: null as string | null,
  kind: 'note' as CommunityKind,
  title: '',
  body_md: '',
  video_url: '',
  event_at: '',
  event_link: '',
  recording_url: '',
};

export function CommunityManager({ initial }: { initial: CommunityPostRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState<typeof EMPTY | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const isEvent = form?.kind === 'live' || form?.kind === 'seminar';

  const submit = () => {
    if (!form) return;
    setError('');
    startTransition(async () => {
      const res = await saveCommunityPost({
        id: form.id,
        kind: form.kind,
        title: form.title,
        body_md: form.body_md || null,
        video_url: form.video_url || null,
        event_at: form.event_at ? new Date(form.event_at).toISOString() : null,
        event_link: form.event_link || null,
        recording_url: form.recording_url || null,
      });
      if (!res.ok) { setError(res.error); return; }
      setForm(null);
      router.refresh();
    });
  };

  const toggle = (id: string, published: boolean) =>
    startTransition(async () => {
      const res = await setCommunityPostPublished(id, published);
      if (!res.ok) { alert(res.error || 'No se pudo.'); return; }
      router.refresh();
    });

  const remove = (p: CommunityPostRow) => {
    if (!confirm(`¿Borrar "${p.title}"? Se borra también del portal de los alumnos. No se puede deshacer.`)) return;
    startTransition(async () => {
      const res = await deleteCommunityPost(p.id);
      if (!res.ok) { alert(res.error || 'No se pudo borrar.'); return; }
      router.refresh();
    });
  };

  const publishedCount = initial.filter((p) => p.published).length;

  return (
    <div className="mt-5 space-y-4">
      {/* Contador honesto: la regla de las 6-8 piezas a la vista. */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-gray-500">
          {publishedCount === 0
            ? 'Nada publicado todavía — la pestaña no les aparece a los alumnos.'
            : `${publishedCount} publicada${publishedCount === 1 ? '' : 's'} · ${initial.length - publishedCount} en borrador`}
        </p>
        {!form && (
          <button
            type="button"
            onClick={() => setForm({ ...EMPTY })}
            className="shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold text-white"
            style={{ background: 'var(--tss-navy, #0A1628)' }}
          >
            + Nueva publicación
          </button>
        )}
      </div>

      {/* Compositor */}
      {form && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(KIND_META) as CommunityKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setForm({ ...form, kind: k })}
                className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold border ${
                  form.kind === k
                    ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {KIND_META[k].label}
              </button>
            ))}
          </div>

          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título (lo ve el alumno — en inglés)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <textarea
            value={form.body_md}
            onChange={(e) => setForm({ ...form, body_md: e.target.value })}
            placeholder="Texto (opcional, en inglés). Párrafos separados por línea en blanco."
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          {(form.kind === 'video' || form.kind === 'note') && (
            <input
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="Link del video (YouTube/Vimeo — opcional para una nota)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          )}
          {isEvent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={form.event_at}
                  onChange={(e) => setForm({ ...form, event_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">Link para unirse (Zoom/Meet)</label>
                <input
                  value={form.event_link}
                  onChange={(e) => setForm({ ...form, event_link: e.target.value })}
                  placeholder="https://…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
                  Grabación (se carga DESPUÉS del vivo — la clase de hoy es el archivo de mañana)
                </label>
                <input
                  value={form.recording_url}
                  onChange={(e) => setForm({ ...form, recording_url: e.target.value })}
                  placeholder="https://…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="rounded-xl px-4 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--tss-navy, #0A1628)' }}
            >
              {pending ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Guardar borrador'}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded-xl px-4 py-2 text-[12.5px] font-semibold border border-gray-200 text-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {initial.map((p) => {
          const Meta = KIND_META[p.kind] ?? KIND_META.note;
          return (
            <div key={p.id} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 flex items-start gap-3">
              <Meta.Icon size={16} className="mt-0.5 shrink-0 text-[#0090B0]" />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-[var(--tss-navy)] leading-snug">{p.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {Meta.label}
                  {p.event_at && ` · ${displayDate(p.event_at)}`}
                  {p.published
                    ? ` · publicada${p.published_at ? ` el ${displayDate(p.published_at)}` : ''}`
                    : ' · borrador'}
                  {p.reactions > 0 && (
                    <span className="inline-flex items-center gap-1 ml-1.5">
                      <Waves size={11} className="inline text-[#0090B0]" /> {p.reactions}
                    </span>
                  )}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggle(p.id, !p.published)}
                  disabled={pending}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold border ${
                    p.published
                      ? 'border-gray-200 text-gray-500'
                      : 'bg-[#06D6A0]/10 border-[#06D6A0]/40 text-[var(--tss-navy)]'
                  }`}
                >
                  {p.published ? 'Despublicar' : 'Publicar'}
                </button>
                <button
                  type="button"
                  aria-label="Editar"
                  onClick={() =>
                    setForm({
                      id: p.id,
                      kind: p.kind,
                      title: p.title,
                      body_md: p.body_md ?? '',
                      video_url: p.video_url ?? '',
                      event_at: p.event_at ? toLocalInput(p.event_at) : '',
                      event_link: p.event_link ?? '',
                      recording_url: p.recording_url ?? '',
                    })
                  }
                  className="p-1.5 text-gray-400 hover:text-gray-700"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Borrar"
                  onClick={() => remove(p)}
                  className="p-1.5 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
        {initial.length === 0 && !form && (
          <p className="text-[13px] text-gray-400 py-8 text-center">
            Todavía no hay publicaciones. Los videos viejos y seminarios pasados cuentan —
            no tienen que ser piezas nuevas.
          </p>
        )}
      </div>
    </div>
  );
}
