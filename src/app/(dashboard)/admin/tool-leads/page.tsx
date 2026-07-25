import { listToolLeads } from '@/lib/actions/tool-leads';
import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { ToolLeadsList } from './ToolLeadsList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ToolLeadsPage() {
  const me = await getCurrentCoach();
  if (!me || me.role !== 'admin') redirect('/dashboard');
  const { leads, academies } = await listToolLeads();
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--tss-navy)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>Tool Leads</h2>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
          Personas que usaron tus herramientas públicas · {leads.length} lead{leads.length === 1 ? '' : 's'}
        </p>
      </div>
      <ToolLeadsList leads={leads as any} academies={academies as any} />
    </div>
  );
}
