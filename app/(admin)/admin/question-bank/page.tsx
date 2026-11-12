'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileJson, Pencil, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Row {
  id: string; slug: string; title: string; difficulty: string; expectedSeconds: number; published: boolean;
  topic: { name: string; chapter: { name: string; subject: { name: string } } };
}
type Filter = 'all' | 'draft' | 'published';

export default function QuestionBankPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await fetch('/api/admin/qb-templates');
      const d = await res.json();
      if (!res.ok) throw new Error();
      setRows(d);
    } catch { setError('Could not load the templates.'); } finally { setLoading(false); }
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

  const needle = search.trim().toLowerCase();
  const shown = rows.filter((r) =>
    (filter === 'all' || (filter === 'draft' ? !r.published : r.published)) &&
    (!needle || (r.title + ' ' + r.topic.name + ' ' + r.topic.chapter.name + ' ' + r.topic.chapter.subject.name).toLowerCase().includes(needle)));
  const count = (f: Filter) => rows.filter((r) => (f === 'all' ? true : f === 'draft' ? !r.published : r.published)).length;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Question bank</h1>
          <p className="text-sm text-neutral-600">Question templates. Each draws new numbers every time it is used.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/question-bank/syllabus"><Button variant="secondary" size="sm">Exam syllabus</Button></Link>
          <Link href="/admin/question-bank/import"><Button variant="secondary" size="sm" icon={<FileJson size={14} />}>Import JSON</Button></Link>
          <Link href="/admin/question-bank/new"><Button variant="primary" size="sm" icon={<Plus size={14} />}>New template</Button></Link>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(['all', 'draft', 'published'] as Filter[]).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={'rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize ' + (filter === f ? 'border-primary-600 bg-primary-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50')}>
            {f} ({count(f)})
          </button>
        ))}
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, topic, chapter" className="ml-auto h-9 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-primary-400 sm:w-64" />
      </div>
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-neutral-100 bg-neutral-50 text-left text-neutral-600">
            <th className="px-4 py-2.5 font-medium">Template</th><th className="px-4 py-2.5 font-medium">Level</th><th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 text-right font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="py-8 text-center text-neutral-500">Loading...</td></tr>
            : shown.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-neutral-500">No templates here.</td></tr>
            : shown.map((r) => (
              <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="max-w-md px-4 py-3">
                  <Link href={'/admin/question-bank/' + r.id} className="block truncate font-medium text-neutral-900 hover:text-primary-700">{r.title}</Link>
                  <p className="truncate text-xs text-neutral-500">{r.topic.chapter.subject.name} / {r.topic.chapter.name} / {r.topic.name}</p>
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600">{r.difficulty.charAt(0) + r.difficulty.slice(1).toLowerCase()} &middot; {r.expectedSeconds}s</td>
                <td className="px-4 py-3"><span className={'rounded-full px-2 py-0.5 text-xs font-medium ' + (r.published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>{r.published ? 'Published' : 'Draft'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                  <button type="button" disabled={busy === r.id} onClick={() => act(r.id, () => fetch('/api/admin/qb-templates/' + r.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !r.published }) }))} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">{r.published ? 'Unpublish' : 'Publish'}</button>
                  <Link href={'/admin/question-bank/' + r.id} aria-label={'Edit ' + r.title} className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100"><Pencil size={14} /></Link>
                  <button type="button" disabled={busy === r.id} aria-label={'Delete ' + r.title} onClick={() => { if (confirm('Delete "' + r.title + '"?')) act(r.id, () => fetch('/api/admin/qb-templates/' + r.id, { method: 'DELETE' })); }} className="rounded-md p-2 text-neutral-500 hover:bg-red-50 hover:text-danger disabled:opacity-50"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
