'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { validatePattern } from '@/lib/mock-pattern';

interface Sec { name: string; questionCount: string; marks: string; negativeMarks: string; durationMinutes: string }
interface Pattern { id: string; name: string; organizationId: string; totalMinutes: number; organization: { name: string }; sections: { name: string; questionCount: number; marks: number; negativeMarks: number; durationMinutes: number | null }[] }
interface Draft { id?: string; name: string; organizationId: string; totalMinutes: string; sections: Sec[] }

const input = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
const label = 'mb-1 block text-xs font-medium text-neutral-600';
const blankSec = (): Sec => ({ name: '', questionCount: '25', marks: '2', negativeMarks: '0.5', durationMinutes: '' });
const blank = (): Draft => ({ name: '', organizationId: '', totalMinutes: '60', sections: [blankSec()] });

export default function MockPatternsPage() {
  const [rows, setRows] = useState<Pattern[]>([]);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => fetch('/api/admin/mock-patterns').then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : [])).catch(() => setError('Could not load the patterns.'));
  useEffect(() => {
    load();
    fetch('/api/organizations').then((r) => r.json()).then((d) => setOrgs(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const edit = (p: Pattern) => setDraft({
    id: p.id, name: p.name, organizationId: p.organizationId, totalMinutes: String(p.totalMinutes),
    sections: p.sections.map((s) => ({ name: s.name, questionCount: String(s.questionCount), marks: String(s.marks), negativeMarks: String(s.negativeMarks), durationMinutes: s.durationMinutes ? String(s.durationMinutes) : '' })),
  });

  const save = async () => {
    if (!draft) return;
    const check = validatePattern(draft);
    if ('error' in check) { setError(check.error); return; }
    setBusy(true); setError('');
    try {
      const res = await fetch(draft.id ? `/api/admin/mock-patterns/${draft.id}` : '/api/admin/mock-patterns', {
        method: draft.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.message ?? 'Could not save.'); return; }
      setDraft(null); await load();
    } finally { setBusy(false); }
  };

  const remove = async (p: Pattern) => {
    if (!confirm(`Delete the pattern "${p.name}"? Tests already made from it are not affected.`)) return;
    const res = await fetch(`/api/admin/mock-patterns/${p.id}`, { method: 'DELETE' });
    if (res.ok) load(); else setError('Could not delete.');
  };

  const setSec = (i: number, patch: Partial<Sec>) => setDraft((d) => d && { ...d, sections: d.sections.map((s, k) => (k === i ? { ...s, ...patch } : s)) });
  const allTimed = !!draft && draft.sections.length > 0 && draft.sections.every((s) => s.durationMinutes.trim() !== '');

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Exam patterns</h1>
          <p className="text-sm text-neutral-600">Reusable layouts (sections, questions, marks, times) that pre-fill a new mock test.</p>
        </div>
        {!draft && <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => { setDraft(blank()); setError(''); }}>New pattern</Button>}
      </div>
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

      {draft && (
        <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2"><label className={label}>Pattern name *</label><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={input} placeholder="e.g. SSC CGL Tier 1" /></div>
            <div>
              <label className={label}>Organization *</label>
              <select value={draft.organizationId} onChange={(e) => setDraft({ ...draft, organizationId: e.target.value })} className={input}>
                <option value="">Choose...</option>{orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Total time (min)</label>
              <input type="number" min={1} value={allTimed ? String(draft.sections.reduce((n, s) => n + (Number(s.durationMinutes) || 0), 0)) : draft.totalMinutes} readOnly={allTimed} onChange={(e) => setDraft({ ...draft, totalMinutes: e.target.value })} className={`${input} ${allTimed ? 'bg-neutral-100' : ''}`} />
              {allTimed && <p className="mt-1 text-[11px] text-neutral-500">Sum of section times.</p>}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {draft.sections.map((s, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-[1fr_5rem_5rem_5rem_6rem_auto]">
                <input value={s.name} onChange={(e) => setSec(i, { name: e.target.value })} className={input} placeholder="Section name" aria-label="Section name" />
                <input type="number" min={1} value={s.questionCount} onChange={(e) => setSec(i, { questionCount: e.target.value })} className={input} placeholder="Qs" aria-label="Questions" />
                <input type="number" min={0} step="0.25" value={s.marks} onChange={(e) => setSec(i, { marks: e.target.value })} className={input} placeholder="Marks" aria-label="Marks" />
                <input type="number" min={0} step="0.25" value={s.negativeMarks} onChange={(e) => setSec(i, { negativeMarks: e.target.value })} className={input} placeholder="Neg." aria-label="Negative marks" />
                <input type="number" min={1} value={s.durationMinutes} onChange={(e) => setSec(i, { durationMinutes: e.target.value })} className={input} placeholder="Min (opt.)" aria-label="Section time" />
                {draft.sections.length > 1 && <button type="button" aria-label="Remove section" onClick={() => setDraft({ ...draft, sections: draft.sections.filter((_, k) => k !== i) })} className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger"><X size={14} /></button>}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-neutral-500">Columns: name, questions, marks each, negative marks each, optional section time. Give a time to every section or to none.</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setDraft({ ...draft, sections: [...draft.sections, blankSec()] })}>Add section</Button>
            <Button type="button" variant="primary" size="sm" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save pattern'}</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => { setDraft(null); setError(''); }}>Cancel</Button>
          </div>
        </section>
      )}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white py-10 text-center text-sm text-neutral-500">No patterns yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900">{p.name}</p>
                <p className="text-xs text-neutral-500">{p.organization.name} · {p.sections.length} sections · {p.sections.reduce((n, s) => n + s.questionCount, 0)} questions · {p.totalMinutes} min{p.sections.every((s) => s.durationMinutes) ? ' (timed sections)' : ''}</p>
              </div>
              <button type="button" aria-label={`Edit ${p.name}`} onClick={() => { edit(p); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100"><Pencil size={15} /></button>
              <button type="button" aria-label={`Delete ${p.name}`} onClick={() => remove(p)} className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger"><Trash2 size={15} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
