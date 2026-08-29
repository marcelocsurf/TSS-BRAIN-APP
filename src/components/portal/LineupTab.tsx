'use client';

// ═══ THE LINEUP — el canal de la comunidad, lado del alumno ═══
//
// El ARCHIVO permanente: todo lo publicado, ordenado. Lo que viene (lives y
// seminarios futuros) arriba; el feed abajo. Canal, no foro: sin comentarios;
// una sola reacción (la ola — sin palabra: "Stoke" es vocabulario prohibido).
//
// El miembro vencido ve los TÍTULOS con candado — la decisión deliberada #5
// del plan: mostrarle lo que se pierde ES el recordatorio de renovación.
//
// Al abrirse marca todo como leído: el buzón del Home se vacía solo.

import { useEffect, useState } from 'react';
import { Video, Radio, GraduationCap, Megaphone, Lock, Waves, CalendarDays } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { displayDate, displayTimeSV } from '@/lib/utils/tz';
import { toEmbedUrl, isEmbeddable } from '@/lib/utils/video-embed';
import {
  markLineupRead,
  toggleReaction,
  type LineupData,
  type LineupPost,
  type CommunityKind,
} from '@/lib/actions/community';

const KIND_META: Record<CommunityKind, { label: string; Icon: typeof Video }> = {
  note: { label: 'From Marcelo', Icon: Megaphone },
  video: { label: 'Video', Icon: Video },
  live: { label: 'Live class', Icon: Radio },
  seminar: { label: 'Seminar', Icon: GraduationCap },
};

// El corte usa el reloj del SERVIDOR (loadedAt): SSR y cliente deciden igual
// y la hidratación no se rompe en el borde. Y un live sigue en "Coming up"
// hasta TRES HORAS después de arrancar: el que entra tarde también se une —
// el botón que desaparecía en el minuto exacto del comienzo dejaba afuera
// justo al que más lo necesita.
const LIVE_GRACE_MS = 3 * 60 * 60 * 1000;
function isUpcoming(p: LineupPost, loadedAtMs: number): boolean {
  return (
    (p.kind === 'live' || p.kind === 'seminar') &&
    !!p.event_at &&
    new Date(p.event_at).getTime() + LIVE_GRACE_MS > loadedAtMs &&
    !p.recording_url
  );
}

function PostCard({
  post,
  token,
  upcoming,
}: {
  post: LineupPost;
  token: string;
  upcoming?: boolean;
}) {
  const meta = KIND_META[post.kind] ?? KIND_META.note;
  const [reacted, setReacted] = useState(post.reacted);
  const [count, setCount] = useState(post.reactions);
  const [busy, setBusy] = useState(false);

  const react = async () => {
    if (busy || post.locked) return;
    setBusy(true);
    // Optimista: el canal se tiene que sentir instantáneo.
    const next = !reacted;
    setReacted(next);
    setCount((c) => c + (next ? 1 : -1));
    const res = await toggleReaction(token, post.id).catch(() => null);
    if (!res || !res.ok) {
      setReacted(!next);
      setCount((c) => c + (next ? -1 : 1));
    }
    setBusy(false);
  };

  // El video del post, o la grabación del live que ya pasó. El iframe SOLO
  // con un embed de host conocido; cualquier otra cosa (un link raro, texto
  // pegado) se muestra como link — nunca una caja gris muda ni el 404 del
  // portal adentro de la tarjeta.
  const videoUrl = post.recording_url || post.video_url;
  const embedCandidate = videoUrl ? toEmbedUrl(videoUrl) : null;
  const embed = isEmbeddable(embedCandidate) ? embedCandidate : null;
  const videoLink = !embed && videoUrl && /^https?:\/\//i.test(videoUrl) ? videoUrl : null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: upcoming ? 'rgba(0,210,255,.07)' : 'rgba(255,255,255,.05)',
        border: upcoming ? '1px solid rgba(0,210,255,.28)' : '1px solid rgba(255,255,255,.06)',
      }}
    >
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-center gap-2">
          <meta.Icon size={13} style={{ color: BRAND.colors.cyan }} className="shrink-0" />
          <p className="text-[9px] font-mono font-medium uppercase tracking-[.16em]" style={{ color: BRAND.colors.cyan }}>
            {meta.label}
          </p>
          {!post.read && !post.locked && (
            <span
              className="ml-auto shrink-0 text-[8.5px] font-mono font-medium uppercase tracking-[.16em] px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(0,210,255,.15)', color: BRAND.colors.cyan }}
            >
              New
            </span>
          )}
          {post.locked && <Lock size={12} className="ml-auto shrink-0" style={{ color: '#6f8698' }} />}
        </div>

        <h3 className="text-[15px] font-semibold mt-1.5 leading-snug" style={{ color: post.locked ? '#8aa0b2' : '#eaf4fa' }}>
          {post.title}
        </h3>

        <p className="text-[11px] mt-0.5" style={{ color: '#6f8698' }}>
          {post.event_at ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={11} />
              {displayDate(post.event_at)}
              {upcoming && post.event_at && ` · ${displayTimeSV(post.event_at)}`}
            </span>
          ) : (
            post.published_at && displayDate(post.published_at)
          )}
        </p>

        {post.locked ? (
          <p className="text-[12px] mt-2 leading-snug" style={{ color: '#8aa0b2' }}>
            Your membership has ended — renew it to open this.
          </p>
        ) : (
          <>
            {post.body_md && (
              <div className="mt-2 space-y-2">
                {post.body_md.split(/\n\s*\n/).map((para, i) => (
                  <p key={i} className="text-[13px] leading-relaxed" style={{ color: '#b8cad8' }}>
                    {para}
                  </p>
                ))}
              </div>
            )}

            {embed && (
              <div className="mt-3 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', background: '#02090F' }}>
                {/* eslint-disable-next-line @next/next/no-iframe -- video embebido */}
                <iframe
                  src={embed}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={post.title}
                />
              </div>
            )}

            {videoLink && (
              <a
                href={videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ color: BRAND.colors.cyan }}
              >
                <Video size={13} /> Watch the video →
              </a>
            )}

            {upcoming && post.event_link && (
              <a
                href={post.event_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-semibold"
                style={{ background: BRAND.colors.cyan, color: BRAND.colors.navy }}
              >
                <Radio size={13} /> Join the live
              </a>
            )}
          </>
        )}
      </div>

      {/* Reacción — una sola. */}
      {!post.locked && !upcoming && (
        <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <button
            type="button"
            onClick={react}
            disabled={busy}
            aria-label={reacted ? 'Remove reaction' : 'React'}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold rounded-full px-3 py-1.5"
            style={{
              background: reacted ? 'rgba(0,210,255,.14)' : 'rgba(255,255,255,.05)',
              color: reacted ? BRAND.colors.cyan : '#8aa0b2',
            }}
          >
            {/* Sin palabra: "Stoke" está en el vocabulario PROHIBIDO del
                manual (brand.ts forbidden). La reacción es la ola. */}
            <Waves size={14} />
            {count > 0 ? count : ''}
          </button>
        </div>
      )}
    </div>
  );
}

export function LineupTab({
  token,
  initial,
  onSeen,
}: {
  token: string;
  initial: LineupData;
  /** Avisa al padre que ya se vio: apaga el punto y el buzón SIN recargar. */
  onSeen?: () => void;
}) {
  // Abrir la pestaña vacía el buzón. Solo se marcan los ids que ESTA carga
  // trajo — lo publicado después no puede quedar "leído" sin verse.
  useEffect(() => {
    const unreadIds = initial.posts.filter((p) => !p.read).map((p) => p.id);
    onSeen?.();
    if (unreadIds.length) markLineupRead(token, unreadIds).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadedAtMs = new Date(initial.loadedAt).getTime();
  const upcoming = initial.posts
    .filter((p) => isUpcoming(p, loadedAtMs))
    .sort((a, b) => (a.event_at ?? '').localeCompare(b.event_at ?? ''));
  const feed = initial.posts.filter((p) => !isUpcoming(p, loadedAtMs));

  return (
    <div className="space-y-4">
      {!initial.memberActive && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,209,102,.10)', border: '1px solid rgba(255,209,102,.35)' }}
        >
          <p className="text-[13px] font-semibold" style={{ color: BRAND.colors.gold }}>
            Your membership has ended
          </p>
          <p className="text-[12px] mt-0.5 leading-snug" style={{ color: '#b8cad8' }}>
            Everything here stays saved for you. Renew from your Home to open it again.
          </p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-2">
          <p className="text-[9px] font-mono uppercase tracking-[.18em] px-1" style={{ color: '#8aa0b2' }}>
            Coming up
          </p>
          {upcoming.map((p) => (
            <PostCard key={p.id} post={p} token={token} upcoming />
          ))}
        </section>
      )}

      <section className="space-y-2">
        {upcoming.length > 0 && (
          <p className="text-[9px] font-mono uppercase tracking-[.18em] px-1" style={{ color: '#8aa0b2' }}>
            The archive
          </p>
        )}
        {feed.map((p) => (
          <PostCard key={p.id} post={p} token={token} />
        ))}
      </section>
    </div>
  );
}
