'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
import { markNotificationsRead, type AppNotification } from '@/lib/actions/notifications';

export function NotificationsPanel({ notifications }: { notifications: AppNotification[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read_at);

  if (notifications.length === 0) return null;

  const markAll = () => {
    startTransition(async () => {
      await markNotificationsRead();
      router.refresh();
    });
  };

  return (
    <div className="flex justify-end mb-4">
      <div className="relative">
        {/* Trigger — bell + pending count, takes almost no space */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[var(--tss-navy)] shadow-sm hover:border-gray-300"
        >
          <Bell size={16} className="text-[var(--tss-cyan)]" />
          <span className="hidden sm:inline">Notificaciones</span>
          {unread.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-[var(--tss-navy)] text-white">
              {unread.length}
            </span>
          )}
        </button>

        {open && (
          <>
            {/* click-outside backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-80 max-w-[90vw] z-50 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--tss-navy)]">Notificaciones</span>
                {unread.length > 0 && (
                  <button
                    type="button"
                    onClick={markAll}
                    disabled={pending}
                    className="text-[11px] text-gray-500 hover:text-[var(--tss-navy)] inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <Check size={12} /> Marcar leídas
                  </button>
                )}
              </div>
              <ul className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {notifications.slice(0, 15).map((n) => {
                  const inner = (
                    <div className={`px-4 py-3 ${!n.read_at ? 'bg-cyan-50/40' : ''}`}>
                      <div className="flex items-start gap-2">
                        {!n.read_at && <span className="w-2 h-2 rounded-full bg-[var(--tss-cyan)] shrink-0 mt-1.5" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 leading-snug">{n.title}</p>
                          {n.body && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>}
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                  return (
                    <li key={n.id}>
                      {n.link ? (
                        <Link href={n.link} onClick={() => setOpen(false)} className="block hover:bg-gray-50">{inner}</Link>
                      ) : inner}
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
