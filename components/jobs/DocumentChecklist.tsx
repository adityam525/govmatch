'use client';

import { useEffect, useState } from 'react';
import type { ChecklistItem } from '@/lib/doc-checklist';

// Ticks are kept in this browser only, per job.
export default function DocumentChecklist({ jobId, items }: { jobId: string; items: ChecklistItem[] }) {
  const key = 'govmatch-docs:' + jobId;
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(key) ?? '[]'); if (Array.isArray(v)) setDone(v); } catch { /* ignore */ } }, [key]);
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage unavailable */ }
  };
  const count = items.filter((i) => done.includes(i.id)).length;
  return (
    <details className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
      <summary className="cursor-pointer select-none text-sm font-semibold text-neutral-900">Documents to keep ready <span className="ml-1 text-xs font-normal text-neutral-600">{count} of {items.length} ready</span></summary>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i.id}>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-neutral-800">
              <input type="checkbox" checked={done.includes(i.id)} onChange={() => toggle(i.id)} className="mt-1 accent-primary-600" />
              <span><span className={done.includes(i.id) ? 'line-through text-neutral-500' : ''}>{i.label}</span>{i.note && <span className="block text-xs text-neutral-600">{i.note}</span>}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-neutral-600">A general list. The official notice is final.</p>
    </details>
  );
}
