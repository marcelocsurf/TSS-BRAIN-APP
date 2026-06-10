'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
import { markNotificationsRead, type AppNotification } from '@/lib/actions/notifications';

export function NotificationsPanel({ notifications }: { notifications: AppNotification[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const unread = notifications.filter((n) => !n.read_at);

  if (notifications.length === 0) return null;

  const markAll = () => {
    startTransition(async () => {
      await markNotificationsRead();
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--tss-navy)] inline-flex items-center gap-2">
          <Bell size={15} className="text-[var(--tss-cyan)]" />
          Notifications
          {unread.length > 0 && (
            <span className="text-[10px] bg-[var(--tss-navy)] text-white rounded-full px-2 py-0.5">
              {unread.length} new
            </span>
          )}
        </h3>
        {unread.length > 0 && (
          <button
            type="button"
            onClick={markAll}
            disabled={pending}
            className="text-xs text-gray-500 hover:text-[var(--tss-navy)] inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Check size={13} /> Mark all read
          </button>
        )}
      </div>
      <ul className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
        {notifications.slice(0, 12).map((n) => {
          const inner = (
            <div className={`px-5 py-3 ${!n.read_at ? 'bg-cyan-50/40' : ''}`}>
              <div className="flex items-start gap-2">
                {!n.read_at && (
                  <span className="w-2 h-2 rounded-full bg-[var(--tss-cyan)] shrink-0 mt-1.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 leading-snug">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
          return (
            <li key={n.id}>
              {n.link ? <Link href={n.link} className="block hover:bg-gray-50">{inner}</Link> : inner}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
