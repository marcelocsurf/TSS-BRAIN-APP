'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const TSS_CERTIFICATIONS = [
  { key: 'lifeguard', name: 'Lifeguard Certification', category: 'external' },
  { key: 'isa_level_1', name: 'ISA Level 1', category: 'external' },
  { key: 'isa_level_2', name: 'ISA Level 2', category: 'external' },
  { key: 'tss_level_1', name: 'TSS Foundation Coach', category: 'tss', desc: 'White & Yellow Belt' },
  { key: 'tss_level_2', name: 'TSS Practitioner Coach', category: 'tss', desc: 'Through Blue Belt' },
  { key: 'tss_level_3', name: 'TSS Advanced Coach', category: 'tss', desc: 'Through Brown Belt' },
  { key: 'tss_level_4', name: 'TSS Master Coach', category: 'tss', desc: 'All Belt Levels' },
  { key: 'tss_level_5', name: 'TSS Coach Educator', category: 'tss', desc: 'Formation Authority' },
];

export function CertificationManager({ coachId, grantedBy, currentCerts }: {
  coachId: string;
  grantedBy: string;
  currentCerts: string[];
}) {
  const [active, setActive] = useState<string[]>(currentCerts);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const toggle = async (certKey: string, certName: string) => {
    setSaving(certKey);
    const supabase = createClient();
    const hasIt = active.includes(certKey);

    if (hasIt) {
      await supabase.from('coach_certifications')
        .update({ is_active: false })
        .eq('coach_id', coachId)
        .eq('certification_key', certKey);
      setActive(a => a.filter(k => k !== certKey));
    } else {
      const { data: existing } = await supabase.from('coach_certifications')
        .select('id')
        .eq('coach_id', coachId)
        .eq('certification_key', certKey)
        .single();

      if (existing) {
        await supabase.from('coach_certifications')
          .update({ is_active: true })
          .eq('id', existing.id);
      } else {
        await supabase.from('coach_certifications').insert({
          coach_id: coachId,
          certification_key: certKey,
          certification_name: certName,
          granted_by: grantedBy,
        });
      }
      setActive(a => [...a, certKey]);
    }

    setSaving(null);
    setSaved(certKey);
    setTimeout(() => setSaved(null), 1500);
  };

  const external = TSS_CERTIFICATIONS.filter(c => c.category === 'external');
  const tss = TSS_CERTIFICATIONS.filter(c => c.category === 'tss');

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-3">External Prerequisites</p>
        <div className="space-y-2">
          {external.map(cert => (
            <CertRow key={cert.key} cert={cert} active={active.includes(cert.key)}
              saving={saving === cert.key} saved={saved === cert.key}
              onToggle={() => toggle(cert.key, cert.name)} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-3">TSS Internal Certification Route</p>
        <div className="space-y-2">
          {tss.map(cert => (
            <CertRow key={cert.key} cert={cert} active={active.includes(cert.key)}
              saving={saving === cert.key} saved={saved === cert.key}
              onToggle={() => toggle(cert.key, cert.name)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CertRow({ cert, active, saving, saved, onToggle }: {
  cert: any; active: boolean; saving: boolean; saved: boolean; onToggle: () => void;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
      active ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)]/5' : 'border-gray-100 bg-white'
    }`}>
      <div>
        <p className={`text-sm font-medium ${active ? 'text-[var(--tss-navy)]' : 'text-gray-500'}`}>
          {active ? '✓ ' : ''}{cert.name}
        </p>
        {cert.desc && <p className="text-xs text-gray-400">{cert.desc}</p>}
      </div>
      <button
        onClick={onToggle}
        disabled={saving}
        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
          active
            ? 'bg-red-50 text-red-500 hover:bg-red-100'
            : 'bg-[var(--tss-navy)] text-white hover:opacity-90'
        } disabled:opacity-50`}
      >
        {saving ? '...' : saved ? '✓' : active ? 'Revoke' : 'Grant'}
      </button>
    </div>
  );
}
