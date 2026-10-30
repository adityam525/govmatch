'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileJson, Pencil, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Row { id: string; title: string; published: boolean; durationMinutes: number; questionCount: number; attempts: number }

export default function AdminMockTestsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await fetch('/api/admin/mock-tests');
      const data = await res.json();
      if (!res.ok) throw new Error();
      setRows(data);
    } catch { setError('Could not load the tests.'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const act = async (id: string, req: () => Promise<Response>) => {
    setBusy(id); setError('');
    try {
      const res = await req();
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.message ?? 'That did not work.'); return; }
      await load();
    } finally { setBusy(null); }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-neutral-900">Mock tests</h1>
        <div className="flex gap-2">
          <Link href="/admin/mock-tests/import"><Button variant="secondary" size="sm" icon={<FileJson size={14} />}>Import JSON</Button></Link>
          <Link href="/admin/mock-tests/new"><Button variant="primary" size="sm" icon={<Plus size={14} />}>New test</Button></Link>
        </div>
      </div>
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-neutral-100 bg-neutral-50 text-left text-neutral-600">
            <th className="px-4 py-2.5 font-medium">Test</th><th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 text-right font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={3} className="py-8 text-center text-neutral-400">Loading...</td></tr>
            : rows.length === 0 ? <tr><td colSpan={3} className="py-8 text-center text-neutral-400">No official tests yet.</td></tr>
            : rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/mock-tests/${r.id}`} className="font-medium text-neutral-900 hover:text-primary-700">{r.title}</Link>
                  <p className="text-xs text-neutral-500">{r.questionCount} questions · {r.durationMinutes} min · {r.attempts} attempt{r.attempts === 1 ? '' : 's'}</p>
                </td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.published ? 'bg-green-50 text-success' : 'bg-amber-50 text-amber-700'}`}>{r.published ? 'Published' : 'Draft'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                  <button type="button" disabled={busy === r.id} onClick={() => act(r.id, () => fetch(`/api/admin/mock-tests/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !r.published }) }))} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">{r.published ? 'Unpublish' : 'Publish'}</button>
                  <Link href={`/admin/mock-tests/${r.id}`} aria-label={`Edit ${r.title}`} className="unded-md p-2 text-neutral-400 hover:bg-neutral-100"><Pencil size={14} /></Link>
                  <button type="button" disabled={busy === r.id} aria-label={`Delete ${r.title}`} onClick={() => { if (confirm(`Delete "${r.title}" and its attempts?`)) act(r.id, () => fetch(`/api/admin/mock-tests/${r.id}`, { method: 'DELETE' })); }} className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger disabled:opacity-50"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
