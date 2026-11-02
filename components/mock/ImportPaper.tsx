'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Trash2, Upload, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import StartTestButton from '@/components/mock/StartTestButton';
import { useAuth } from '@/features/auth/hooks';
import { LIMITS, validateTest } from '@/lib/mock-test';

interface DQ { key: number; text: string; options: string[]; correctIndex: number; explanation: string; warnings: string[] }
interface Draft { fileName: string; kind: string; warnings: string[]; questions: DQ[] }
interface Mine { id: string; title: string; questionCount: number; durationMinutes: number; attempts: number }

let counter = 1;
const input = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
const label = 'mb-1 block text-xs font-medium text-neutral-600';
const needsAttention = (q: DQ) => q.correctIndex < 0 || q.options.length < 2 || q.options.some((o) => !o.trim()) || !q.text.trim() || q.warnings.length > 0;

export default function ImportPaper() {
  const { user } = useAuth();
  const [mine, setMine] = useState<Mine[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [checked, setChecked] = useState(false);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [marks, setMarks] = useState('1');
  const [negative, setNegative] = useState('0');
  const [section, setSection] = useState('Questions');

  const loadMine = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/users/${user.id}/mock-tests`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setMine(data);
    } catch { /* the list is optional */ }
  }, [user?.id]);
  useEffect(() => { loadMine(); }, [loadMine]);

  const upload = async (file: File) => {
    if (!user?.id) return;
    setError(''); setNotice('');
    if (!/\.(docx|pdf)$/i.test(file.name)) { setError('Choose a Word file (.docx) or a PDF with real text.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('The file is larger than 5 MB.'); return; }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/users/${user.id}/mock-import`, { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.message ?? 'Could not read this file.'); return; }
      setDraft({
        fileName: data.fileName, kind: data.kind, warnings: data.warnings ?? [],
        questions: (data.questions ?? []).map((q: any) => ({
          key: counter++, text: q.text, options: q.options, explanation: q.explanation ?? '',
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : -1, warnings: q.warnings ?? [],
        })),
      });
      setTitle(String(data.fileName).replace(/\.(docx|pdf)$/i, ''));
      setChecked(false); setOnlyIssues(false);
    } catch {
      setError('Network error. Please try again.');
    } finally { setBusy(false); }
  };

  const patch = (key: number, p: Partial<DQ>) => setDraft((d) => d && { ...d, questions: d.questions.map((q) => (q.key === key ? { ...q, ...p, warnings: p.correctIndex !== undefined ? [] : q.warnings } : q)) });
  const remove = (key: number) => setDraft((d) => d && { ...d, questions: d.questions.filter((q) => q.key !== key) });

  const issues = draft ? draft.questions.filter(needsAttention).length : 0;
  const missingAnswer = draft ? draft.questions.filter((q) => q.correctIndex < 0).length : 0;
  const shown = draft ? (onlyIssues ? draft.questions.filter(needsAttention) : draft.questions) : [];

  const save = async () => {
    if (!user?.id || !draft) return;
    const payload = {
      title, description: `Imported from ${draft.fileName}`, examStyle: 'SSC', durationMinutes: minutes,
      sections: [{ name: section, questions: draft.questions.map((q) => ({ text: q.text, options: q.options, correctIndex: q.correctIndex, marks, negativeMarks: negative, explanation: q.explanation })) }],
    };
    const check = validateTest(payload);
    if ('error' in check) { setError(check.error); return; }
    setBusy(true); setError('');
    try {
      const res = await fetch(`/api/users/${user.id}/mock-tests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.message ?? 'Could not save the test.'); return; }
      setDraft(null); setNotice('Saved. Your test is private and ready to start below.');
      await loadMine();
    } catch {
      setError('Network error. Nothing was saved.');
    } finally { setBusy(false); }
  };

  const deleteMine = async (t: Mine) => {
    if (!user?.id || !confirm(`Delete "${t.title}" and its ${t.attempts} attempt(s)?`)) return;
    const res = await fetch(`/api/users/${user.id}/mock-tests/${t.id}`, { method: 'DELETE' });
    if (res.ok) setMine((m) => m.filter((x) => x.id !== t.id)); else setError('Could not delete the test.');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-lg font-bold text-neutral-900">Import a question paper</h1>
        <p className="mt-1 text-sm text-neutral-600">Turn a Word file or a text PDF into a private mock test. You check everything before it is saved.</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          {error} {/premium/i.test(error) && <Link href="/pricing" className="font-semibold underline">See plans</Link>}
        </p>
      )}
      {notice && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-success">{notice}</p>}

      {!draft && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p>Converting a file can make mistakes. Questions, options and answers may be split wrongly, and symbols, tables, images and some languages may not come through. Scanned papers and photos cannot be read. You will review every question before saving.</p>
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-neutral-600">
            <li>Questions should be numbered (1. 2. 3.) with options (a) (b) (c) (d).</li>
            <li>The answer can follow each question (&quot;Ans: B&quot;), sit in a key at the end (&quot;1-B 2-C&quot;), or be a bold option or one marked with a tick. Bold works in Word files only.</li>
            <li>If the numbers are Word&apos;s automatic numbering, convert the list to text first.</li>
          </ul>
          <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-8 text-sm font-medium text-neutral-700 hover:border-primary-400 hover:bg-primary-50">
            <Upload size={16} /> {busy ? 'Reading the file...' : 'Choose a .docx or PDF file (up to 5 MB)'}
            <input type="file" accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); }} />
          </label>
        </section>
      )}

      {draft && (
        <>
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-900">{draft.fileName} <span className="font-normal text-neutral-500">({draft.questions.length} questions found)</span></p>
              <button type="button" onClick={() => { if (confirm('Discard this draft?')) setDraft(null); }} className="flex items-center gap-1 text-xs text-neutral-500 hover:text-danger"><X size={13} /> Discard</button>
            </div>
            {draft.warnings.map((w) => <p key={w} className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">{w}</p>)}
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">Please check every question and answer against your paper. The conversion may contain mistakes.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2"><label className={label}>Test name *</label><input value={title} maxLength={LIMITS.titleMax} onChange={(e) => setTitle(e.target.value)} className={input} /></div>
              <div><label className={label}>Time limit (min) *</label><input type="number" min={1} max={LIMITS.maxMinutes} value={minutes} onChange={(e) => setMinutes(e.target.value)} className={input} /></div>
              <div><label className={label}>Section name</label><input value={section} maxLength={LIMITS.nameMax} onChange={(e) => setSection(e.target.value)} className={input} /></div>
              <div><label className={label}>Marks per question</label><input type="number" min={0} step="0.25" value={marks} onChange={(e) => setMarks(e.target.value)} className={input} /></div>
              <div><label className={label}>Negative marks</label><input type="number" min={0} step="0.25" value={negative} onChange={(e) => setNegative(e.target.value)} className={input} /></div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className={issues ? 'text-amber-700' : 'text-success'}>{issues ? `${issues} question${issues === 1 ? '' : 's'} need attention` : 'No issues found. Still check the answers.'}{missingAnswer > 0 && ` (${missingAnswer} without an answer)`}</p>
            <label className="flex items-center gap-2 text-xs text-neutral-700"><input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} className="accent-primary-600" /> Show only questions needing attention</label>
          </div>

          <div className="space-y-4">
            {shown.map((q) => {
              const n = draft.questions.indexOf(q) + 1;
              return (
                <div key={q.key} className={`rounded-xl border p-4 ${needsAttention(q) ? 'border-amber-300 bg-amber-50/30' : 'border-neutral-200 bg-white'}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Question {n}</p>
                    <button type="button" aria-label={`Delete question ${n}`} onClick={() => remove(q.key)} className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-danger"><Trash2 size={14} /></button>
                  </div>
                  {q.warnings.map((w) => <p key={w} className="mb-2 text-xs text-amber-800">&bull; {w}</p>)}
                  <textarea value={q.text} rows={2} maxLength={LIMITS.textMax} onChange={(e) => patch(q.key, { text: e.target.value })} className={input} />
                  <div className="mt-3 space-y-2">
                    {q.options.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`c-${q.key}`} checked={q.correctIndex === oi} onChange={() => patch(q.key, { correctIndex: oi })} aria-label={`Option ${String.fromCharCode(65 + oi)} is correct`} className="h-4 w-4 shrink-0 accent-primary-600" />
                        <span className="w-5 shrink-0 text-sm font-medium text-neutral-500">{String.fromCharCode(65 + oi)}</span>
                        <input value={o} maxLength={LIMITS.optionMax} onChange={(e) => patch(q.key, { options: q.options.map((x, k) => (k === oi ? e.target.value : x)) })} className={input} />
                        {q.options.length > LIMITS.optionsMin && (
                          <button type="button" aria-label="Remove option" onClick={() => patch(q.key, { options: q.options.filter((_, k) => k !== oi), correctIndex: q.correctIndex === oi ? -1 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex })} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100"><X size={14} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    {q.options.length < LIMITS.optionsMax && <button type="button" onClick={() => patch(q.key, { options: [...q.options, ''] })} className="text-primary-600 hover:underline">+ Add option</button>}
                    {q.correctIndex < 0 && <span className="text-amber-700">Select the correct answer with the round button.</span>}
                  </div>
                  <div className="mt-3"><label className={label}>Explanation (optional)</label><input value={q.explanation} maxLength={LIMITS.explanationMax} onChange={(e) => patch(q.key, { explanation: e.target.value })} className={input} /></div>
                </div>
              );
            })}
            {shown.length === 0 && <p className="rounded-xl border border-dashed border-neutral-300 bg-white py-8 text-center text-sm text-neutral-500">{draft.questions.length === 0 ? 'No questions are left.' : 'Nothing needs attention.'}</p>}
          </div>

          <div className="sticky bottom-0 z-10 -mx-4 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <label className="flex items-start gap-2 text-xs text-neutral-700"><input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 accent-primary-600" /> I have checked the questions and answers against my paper.</label>
            <div className="mt-2 flex items-center gap-3">
              <Button type="button" variant="primary" disabled={busy || !checked || missingAnswer > 0 || draft.questions.length === 0} onClick={save}>{busy ? 'Saving...' : 'Save as my test'}</Button>
              {missingAnswer > 0 && <span className="text-xs text-amber-700">Choose an answer for every question first.</span>}
            </div>
          </div>
        </>
      )}

      {!draft && mine.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <h2 className="border-b border-neutral-100 px-5 py-3 text-sm font-bold text-neutral-900">Your imported tests (private)</h2>
          <ul className="divide-y divide-neutral-100">
            {mine.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{t.title}</p>
                  <p className="text-xs text-neutral-500">{t.questionCount} questions &middot; {t.durationMinutes} min &middot; {t.attempts} attempt{t.attempts === 1 ? '' : 's'}</p>
                </div>
                <div className="w-32"><StartTestButton testId={t.id} /></div>
                <button type="button" aria-label={`Delete ${t.title}`} onClick={() => deleteMine(t)} className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger"><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
