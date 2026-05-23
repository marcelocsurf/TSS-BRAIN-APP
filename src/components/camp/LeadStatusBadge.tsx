'use client';

// Visible pill + inline resend button for a Lead who has not yet
// completed the safety form. Coach + coordinator see this on the camp
// detail so they don't show up to the water with a student missing
// medical info or waiver.

import { useState, useTransition } from 'react';
import { AlertTriangle, Mail, Copy, Check } from 'lucide-react';
import { sendLeadInvitation } from '@/lib/actions/lead-invitation';

interface Props {
  studentId: string;
  portalToken: string | null;
  email: string | null;
}

export function LeadStatusBadge({ studentId, portalToken, email }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [sentResult, setSentResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : '';
  const url = portalToken ? `${baseUrl}/lead/${portalToken}` : '';

  const copyLink = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resend = () => {
    startTransition(async () => {
      try {
        const r = await sendLeadInvitation(studentId);
        setSentResult({
          ok: r.emailed,
          msg: r.emailed
            ? 'Email sent.'
            : `Not sent: ${r.reason ?? 'no email'}.`,
        });
      } catch (err: any) {
        setSentResult({ ok: false, msg: err.message });
      }
    });
  };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        <AlertTriangle size={10} strokeWidth={2.5} />
        Intake pending
      </button>

      {open && (
        <div
          className="bg-white border border-amber-200 rounded-lg shadow-md p-2 w-56 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] text-gray-500 mb-1.5">
            Send the safety form link so this lead completes waiver + medical info.
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={copyLink}
              disabled={!url}
              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-semibold rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <Copy size={10} strokeWidth={2} />
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={resend}
              disabled={pending || !email}
              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-semibold rounded bg-[var(--tss-navy)] text-white disabled:opacity-50"
              title={email ? 'Send safety form to ' + email : 'No email on file'}
            >
              <Mail size={10} strokeWidth={2} />
              {pending ? 'Sending…' : 'Email'}
            </button>
          </div>
          {sentResult && (
            <p
              className={`text-[10px] mt-1.5 inline-flex items-center gap-1 ${
                sentResult.ok ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {sentResult.ok && <Check size={10} strokeWidth={2} />}
              {sentResult.msg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
