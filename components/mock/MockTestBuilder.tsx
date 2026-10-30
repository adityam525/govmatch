'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks';
import { LIMITS, validateTest } from '@/lib/mock-test';
import { readSectionTimes } from '@/lib/mock-sections';

interface Q { key: number; text: string; options: string[]; correctIndex: number; marks: string; negativeMarks: string; explanation: string }
interface S { key: number; name: string; minutes: string; defMarks: string; defNeg: string; questions: Q[] }
interface Form { title: string; description: string; durationMinutes: string; sections: S[] }
interface PatternRow { id: string; name: string; totalMinutes: number; organization: { name: string }; sections: { name: string; questionCount: number; marks: number; negativeMarks: number; durationMinutes: number | null }[] }

let counter = 1;
const blankQ = (marks = '1', neg = '0'): Q => ({ key: counter++, text: '', options: ['', '', '', ''], correctIndex: -1, marks, negativeMarks: neg, explanation: '' });
const blankS = (name = ''): S => ({ key: counter++, name, minutes: '', defMarks: '1', defNeg: '0', questions: [blankQ()] });
const fresh = (): Form => ({ title: '', description: '', durationMinutes: '60', sections: [blankS('Section 1')] });

const input = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
const label = 'mb-1 block text-xs font-medium text-neutral-600';
const stable = (f: Form) => JSON.stringify(f, (k, v) => (k === 'key' ? undefined : v));
const isBlankText = (f: Form) => !f.title && f.sections.every((s) => s.questions.every((q) => !q.text));

export default function MockTestBuilder({ testId, endpoint, backHref = '/mock-tests' }: { testId?: string; endpoint?: string; backHref?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const base = endpoint ?? (user?.id ? `/api/users/${user.id}/mock-tests` : null);
  const isAdmin = !!endpoint;
  const [form, setForm] = useState<Form>(fresh);
  const [patterns, setPatterns] = useState<PatternRow[]>([]);
  const [loading, setLoading] = useState(!!testId);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const snapshot = useRef(stable(form));

  useEffect(() => {
    if (!testId || !base) return;
    fetch(`${base}/${testId}`)
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; })
      .then((t) => {
        const next: Form = {
          title: t.title, description: t.description ?? '', durationMinutes: String(t.durationMinutes),
          sections: t.sections.map((s: any) => ({
            key: counter++, name: s.name, minutes: s.durationMinutes ? String(s.durationMinutes) : '',
            defMarks: String(s.questions[0]?.marks ?? 1), defNeg: String(s.questions[0]?.negativeMarks ?? 0),
            questions: s.questions.map((q: any) => ({
              key: counter++, text: q.text, options: q.options, correctIndex: q.correctIndex,
              marks: String(q.marks), negativeMarks: String(q.negativeMarks), explanation: q.explanation ?? '',
            })),
          })),
        };
        setForm(next);
        snapshot.current = stable(next);
      })
      .catch((e) => setLoadError(e.message || 'This test could not be loaded.'))
      .finally(() => setLoading(false));
  }, [testId, base]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/admin/mock-patterns').then((r) => r.json()).then((d) => setPatterns(Array.isArray(d) ? d : [])).catch(() => {});
  }, [isAdmin]);

  const dirty = !loading && stable(form) !== snapshot.current;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const change = (fn: (f: Form) => Form) => { setForm(fn); setError(''); };
  const setSection = (si: number, patch: Partial<S>) => change((f) => ({ ...f, sections: f.sections.map((s, i) => (i === si ? { ...s, ...patch } : s)) }));
  const setQuestion = (si: number, qi: number, patch: Partial<Q>) =>
    change((f) => ({ ...f, sections: f.sections.map((s, i) => (i === si ? { ...s, questions: s.questions.map((q, j) => (j === qi ? { ...q, ...patch } : q)) } : s)) }));
  const total = form.sections.reduce((n, s) => n + s.questions.length, 0);

  const timedCount = form.sections.filter((s) => s.minutes.trim() !== '').length;
  const allTimed = timedCount === form.sections.length && timedCount > 0;
  const mixed = timedCount > 0 && !allTimed;
  const sumMinutes = form.sections.reduce((n, s) => n + (Number(s.minutes) || 0), 0);
  const shownTotal = allTimed ? String(sumMinutes) : form.durationMinutes;

  const usePattern = (id: string) => {
    const p = patterns.find((x) => x.id === id);
    if (!p) return;
    if (!isBlankText(form) && !confirm('Replace the sections and questions you have entered with this pattern?')) return;
    change((f) => ({
      ...f,
      durationMinutes: String(p.totalMinutes),
      sections: p.sections.map((s) => ({
        key: counter++, name: s.name, minutes: s.durationMinutes ? String(s.durationMinutes) : '',
        defMarks: String(s.marks), defNeg: String(s.negativeMarks),
        questions: Array.from({ length: s.questionCount }, () => blankQ(String(s.marks), String(s.negativeMarks))),
      })),
    }));
  };

  const save = async () => {
    if (!base) return;
    const payload = {
      title: form.title, description: form.description, examStyle: 'SSC', durationMinutes: shownTotal,
      sections: form.sections.map((s) => ({ name: s.name, durationMinutes: s.minutes, questions: s.questions.map(({ key: _k, ...q }) => q) })),
    };
    const times = readSectionTimes(payload);
    if ('error' in times) { setError(times.error); return; }
    const check = validateTest(times.payload);
    if ('error' in check) { setError(check.error); return; }

    setSaving(true); setError('');
    try {
      const res = await fetch(testId ? `${base}/${testId}` : base, {
        method: testId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.message ?? 'Could not save the test.'); return; }
      snapshot.current = stable(form);
      router.push(backHref);
    } catch {
      setError('Network error. Nothing was saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-neutral-600">Loading...</div>;
  if (loadError) return <div className="m-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-danger">{loadError}</div>;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
      <h1 className="mb-4 text-lg font-bold text-neutral-900">{testId ? 'Edit mock test' : 'Create mock test'}</h1>

      {isAdmin && !testId && patterns.length > 0 && (
        <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <label className={label}>Start from a pattern (optional)</label>
          <select defaultValue="" onChange={(e) => { if (e.target.value) usePattern(e.target.value); e.target.value = ''; }} className={input}>
            <option value="">Choose a pattern to pre-fill the sections</option>
            {patterns.map((p) => <option key={p.id} value={p.id}>{p.organization.name}: {p.name}</option>)}
          </select>
        </section>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className={label}>Test name *</label>
            <input value={form.title} maxLength={LIMITS.titleMax} onChange={(e) => change((f) => ({ ...f, title: e.target.value }))} className={input} placeholder="e.g. SSC CGL Tier 1, Paper 3" />
          </div>
          <div>
            <label className={label}>Total time (minutes) *</label>
            <input type="number" min={1} max={LIMITS.maxMinutes} value={shownTotal} readOnly={allTimed} onChange={(e) => change((f) => ({ ...f, durationMinutes: e.target.value }))} className={`${input} ${allTimed ? 'bg-neutral-100' : ''}`} />
            {allTimed && <p className="mt-1 text-[11px] text-neutral-500">The sum of the section times.</p>}
          </div>
          <div className="md:col-span-3">
            <label className={label}>Description (optional)</label>
            <input value={form.description} maxLength={LIMITS.descriptionMax} onChange={(e) => change((f) => ({ ...f, description: e.target.value }))} className={input} />
          </div>
        </div>
        <p className="mt-3 text-xs text-neutral-500">Exam layout: SSC / IBPS style. {total} question{total === 1 ? '' : 's'} of {LIMITS.questions} allowed.</p>
        {mixed && <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">Give a time to every section, or to none. With section times, each section locks when its time ends, in order.</p>}
        {allTimed && <p className="mt-2 text-xs text-neutral-600">Timed sections: candidates move through the sections in order and cannot return to a finished one.</p>}
      </section>

      <div className="mt-6 space-y-6">
        {form.sections.map((s, si) => (
          <section key={s.key} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[12rem] flex-1">
                <label className={label}>Section {si + 1} name *</label>
                <input value={s.name} maxLength={LIMITS.nameMax} onChange={(e) => setSection(si, { name: e.target.value })} className={input} placeholder="e.g. General Awareness" />
              </div>
              <div className="w-28">
                <label className={label}>Time (min)</label>
                <input type="number" min={1} value={s.minutes} onChange={(e) => setSection(si, { minutes: e.target.value })} className={input} placeholder="Optional" />
              </div>
              <div className="w-24">
                <label className={label}>Marks</label>
                <input type="number" min={0} step="0.25" value={s.defMarks} onChange={(e) => setSection(si, { defMarks: e.target.value })} className={input} />
              </div>
              <div className="w-24">
                <label className={label}>Negative</label>
                <input type="number" min={0} step="0.25" value={s.defNeg} onChange={(e) => setSection(si, { defNeg: e.target.value })} className={input} />
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => setSection(si, { questions: s.questions.map((q) => ({ ...q, marks: s.defMarks, negativeMarks: s.defNeg })) })}>Apply to all</Button>
              {form.sections.length > 1 && (
                <button type="button" aria-label={`Remove section ${si + 1}`} onClick={() => { if (confirm(`Remove "${s.name || `Section ${si + 1}`}" and its questions?`)) change((f) => ({ ...f, sections: f.sections.filter((_, i) => i !== si) })); }} className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger"><Trash2 size={16} /></button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-neutral-500">Marks and Negative are the defaults for new questions in this section. Each question can differ.</p>

            <div className="mt-4 space-y-4">
              {s.questions.map((q, qi) => (
                <div key={q.key} className={`rounded-xl border p-4 ${q.correctIndex < 0 ? 'border-amber-200 bg-amber-50/30' : 'border-neutral-200'}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Question {qi + 1}</p>
                    {s.questions.length > 1 && (
                      <button type="button" aria-label={`Remove question ${qi + 1}`} onClick={() => setSection(si, { questions: s.questions.filter((_, j) => j !== qi) })} className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-danger"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <textarea value={q.text} rows={2} maxLength={LIMITS.textMax} onChange={(e) => setQuestion(si, qi, { text: e.target.value })} className={input} placeholder="Type the question" />

                  <div className="mt-3 space-y-2">
                    {q.options.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${q.key}`} checked={q.correctIndex === oi} onChange={() => setQuestion(si, qi, { correctIndex: oi })} aria-label={`Option ${String.fromCharCode(65 + oi)} is correct`} className="h-4 w-4 shrink-0 accent-primary-600" />
                        <span className="w-5 shrink-0 text-sm font-medium text-neutral-500">{String.fromCharCode(65 + oi)}</span>
                        <input value={o} maxLength={LIMITS.optionMax} onChange={(e) => setQuestion(si, qi, { options: q.options.map((x, k) => (k === oi ? e.target.value : x)) })} className={input} placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                        {q.options.length > LIMITS.optionsMin && (
                          <button type="button" aria-label={`Remove option ${String.fromCharCode(65 + oi)}`} onClick={() => setQuestion(si, qi, { options: q.options.filter((_, k) => k !== oi), correctIndex: q.correctIndex === oi ? -1 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex })} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100"><X size={14} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    {q.options.length < LIMITS.optionsMax && <button type="button" onClick={() => setQuestion(si, qi, { options: [...q.options, ''] })} className="text-primary-600 hover:underline">+ Add option</button>}
                    {q.correctIndex < 0 && <span className="text-amber-700">Select the correct answer with the round button.</span>}
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-[6rem_6rem_1fr]">
                    <div><label className={label}>Marks</label><input type="number" min={0} step="0.25" value={q.marks} onChange={(e) => setQuestion(si, qi, { marks: e.target.value })} className={input} /></div>
                    <div><label className={label}>Negative</label><input type="number" min={0} step="0.25" value={q.negativeMarks} onChange={(e) => setQuestion(si, qi, { negativeMarks: e.target.value })} className={input} /></div>
                    <div><label className={label}>Explanation (shown in the review)</label><input value={q.explanation} maxLength={LIMITS.explanationMax} onChange={(e) => setQuestion(si, qi, { explanation: e.target.value })} className={input} /></div>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="secondary" size="sm" className="mt-4" icon={<Plus size={14} />} disabled={total >= LIMITS.questions} onClick={() => setSection(si, { questions: [...s.questions, blankQ(s.defMarks, s.defNeg)] })}>
              Add question
            </Button>
          </section>
        ))}
      </div>

      <Button type="button" variant="secondary" size="sm" className="mt-6" icon={<Plus size={14} />} disabled={form.sections.length >= LIMITS.sections} onClick={() => change((f) => ({ ...f, sections: [...f.sections, blankS(`Section ${f.sections.length + 1}`)] }))}>
        Add section
      </Button>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" disabled={saving} onClick={() => { if (!dirty || confirm('Leave without saving your changes?')) { snapshot.current = stable(form); router.push(backHref); } }}>Cancel</Button>
          <Button type="button" variant="primary" disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save test'}</Button>
          {dirty && !error && <span className="text-xs text-amber-700">Unsaved changes</span>}
        </div>
      </div>
      <div className="h-6" />
    </form>
  );
}
