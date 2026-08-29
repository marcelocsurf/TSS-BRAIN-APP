'use client';

// ═══ THE LINEUP — el canal de la comunidad, lado del alumno ═══
//
// El ARCHIVO permanente: todo lo publicado, ordenado. Lo que viene (lives y
// seminarios futuros) arriba; el feed abajo. Canal, no foro: sin comentarios;
// una sola reacción ("Stoked").
//
// El miembro vencido ve los TÍTULOS con candado — la decisión deliberada #5
// del plan: mostrarle lo que se pierde ES el recordatorio de renovación.
//
// Al abrirse marca todo como leído: el buzón del Home se vacía solo.

import { useEffect, useState } from 'react';
import { Video, Radio, GraduationCap, Megaphone, Lock, Waves, CalendarDays } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { displayDate } from '@/lib/utils/tz';
import { toEmbedUrl } from '@/lib/utils/video-embed';
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

function isUpcoming(p: LineupPost): boolean {
  return (
    (p.kind === 'live' || p.kind === 'seminar') &&
    !!p.event_at &&
    new Date(p.event_at) > new Date() &&
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

  // El video del post, o la grabación del live que ya pasó.
  const videoUrl = post.recording_url || post.video_url;
  const embed = videoUrl ? toEmbedUrl(videoUrl) : null;

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
          <p className="text-[9px] font-mono uppercase tracking-[.16em]" style={{ color: BRAND.colors.cyan }}>
            {meta.label}
          </p>
          {!post.read && !post.locked && (
            <span
              className="ml-auto shrink-0 text-[8.5px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,209,102,.15)', color: BRAND.colors.gold }}
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
              {upcoming && post.event_at && ` · ${new Date(post.event_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/El_Salvador' })}`}
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
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold rounded-full px-3 py-1.5"
            style={{
              background: reacted ? 'rgba(0,210,255,.14)' : 'rgba(255,255,255,.05)',
              color: reacted ? BRAND.colors.cyan : '#8aa0b2',
            }}
          >
            <Waves size={13} />
            Stoked{count > 0 ? ` · ${count}` : ''}
          </button>
        </div>
      )}
    </div>
  );
}

export function LineupTab({ token, initial }: { token: string; initial: LineupData }) {
  // Abrir la pestaña vacía el buzón del Home. Best-effort.
  useEffect(() => {
    markLineupRead(token).catch(() => {});
  }, [token]);

  const upcoming = initial.posts.filter(isUpcoming).sort((a, b) =>
    (a.event_at ?? '').localeCompare(b.event_at ?? ''),
  );
  const feed = initial.posts.filter((p) => !isUpcoming(p));

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
