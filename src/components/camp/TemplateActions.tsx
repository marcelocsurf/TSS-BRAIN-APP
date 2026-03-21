'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCampTemplate, duplicateCampTemplate } from '@/lib/actions/camps';

interface Props {
  templateId: string;
  templateName: string;
}

export function TemplateActions({ templateId, templateName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDuplicate = async () => {
    setLoading('duplicate');
    try {
      await duplicateCampTemplate(templateId);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate');
    }
    setLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${templateName}"? This will deactivate the template.`)) return;
    setLoading('delete');
    try {
      await deleteCampTemplate(templateId);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-1">
      <a
        href={`/camps/templates/${templateId}/edit`}
        className="px-2 py-1 text-[10px] text-gray-500 hover:text-[var(--tss-navy)] hover:bg-gray-100 rounded-lg transition-colors"
      >
        Edit
      </a>
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={loading === 'duplicate'}
        className="px-2 py-1 text-[10px] text-gray-500 hover:text-[var(--tss-gold)] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === 'duplicate' ? '...' : 'Duplicate'}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading === 'delete'}
        className="px-2 py-1 text-[10px] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === 'delete' ? '...' : 'Delete'}
      </button>
    </div>
  );
}
