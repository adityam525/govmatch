'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { paletteStatus, type AnswerState, type PaletteStatus } from '@/lib/mock-test';
import ExamResult from './ExamResult';
import type { ExamData } from './exam-types';

const EMPTY: AnswerState = { selected: null, marked: false, visited: false, timeSec: 0 };
const PALETTE: Record<PaletteStatus, string> = {
  'not-visited': 'bg-neutral-200 text-neutral-700',
  'not-answered': 'bg-red-500 text-white',
  answered: 'bg-green-500 text-white',
  marked: 'bg-purple-600 text-white',
  'answered-marked': 'bg-purple-600 text-white ring-2 ring-green-400',
};
const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
};

export default function ExamRunner({ attemptId }: { attemptId: string }) {
  const { user, loading: authLoading } = useAuth();
  const base = user?.id ? `/api/users/${user.id}/mock-attempts/${attemptId}` : null;

  const [data, setData] = useState<ExamData | null>(null);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [si, setSi] = useState(0);
  const [qi, setQi] = useState(0);
  const [tick, setTick] = useState(0);
  const [summary, setSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveNote, setSaveNote] = useState('');

  const offset = useRef(0);
  const dirty = useRef(false);
  const opened = useRef(Date.now());
  const submittedOnce = useRef(false);
  const lastActive = useRef<number | null | undefined>(undefined);

  const load = useCallback(async () => {
    if (!base) return;
    try {
      const res = await fetch(base);
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      offset.current = d.serverNow - Date.now();
      setData(d);
      setAnswers(d.answers ?? {});
      if (d.activeSection !== null && d.activeSection !== undefined) setSi(d.activeSection);
      return d as ExamData;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the exam.');
    }
  }, [base]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 500); return () => clearInterval(id); }, []);

  const now = Date.now() + offset.current;
  void tick;

  // ---- saving
  const save = useCallback(async (payload: Record<string, AnswerState>) => {
    if (!base) return;
    try {
      const res = await fetch(`${base}/answers`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: payload }) });
      if (res.status === 409) { await load(); return; }
      setSaveNote(res.ok ? 'Saved' : 'Could not save, will retry');
    } catch { setSaveNote('Offline, will retry'); }
  }, [base, load]);

  useEffect(() => {
    if (!dirty.current || !data || data.submitted) return;
    const id = setTimeout(() => { dirty.current = false; save(answers); }, 1000);
    return () => clearTimeout(id);
  }, [answers, data, save]);

  const submit = useCallback(async () => {
    if (!base || submittedOnce.current) return;
    submittedOnce.current = true;
    setSubmitting(true);
    try {
      await fetch(`${base}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) });
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      setSummary(false);
      await load();
    } finally { setSubmitting(false); }
  }, [answers, base, load]);

  // ---- time
  const active = data && !data.submitted && data.timed && data.windows
    ? data.windows.findIndex((w) => now >= w.start && now < w.end) : -1;
  const activeIdx = active >= 0 ? active : null;

  useEffect(() => {
    if (!data || data.submitted) return;
    if (now >= data.expiresAt) submit();
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  // A timed section ended: save everything, then move to the section that opened.
  useEffect(() => {
    if (!data || data.submitted || !data.timed) return;
    if (lastActive.current !== undefined && lastActive.current !== activeIdx) {
      dirty.current = false;
      save(answers);
      if (activeIdx !== null) { setSi(activeIdx); setQi(0); }
    }
    lastActive.current = activeIdx;
  }, [activeIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- helpers
  const sections = data?.sections ?? [];
  const sec = sections[si];
  const q = sec?.questions[qi];
  const get = (id: string) => answers[id] ?? EMPTY;

  const patch = (id: string, p: Partial<AnswerState>) => {
    dirty.current = true;
    setAnswers((a) => ({ ...a, [id]: { ...(a[id] ?? EMPTY), ...p } }));
  };

  // Count the time spent on a question when leaving it, and mark the next one as visited.
  const goTo = (nextS: number, nextQ: number) => {
    if (q) {
      const spent = Math.round((Date.now() - opened.current) / 1000);
      patch(q.id, { visited: true, timeSec: get(q.id).timeSec + spent });
    }
    opened.current = Date.now();
    setSi(nextS); setQi(nextQ);
    const target = sections[nextS]?.questions[nextQ];
    if (target) patch(target.id, { visited: true });
  };

  const canEnter = (s: number) => !data?.timed || s === activeIdx;
  const next = () => {
    if (!sec) return;
    if (qi < sec.questions.length - 1) return goTo(si, qi + 1);
    if (!data?.timed && si < sections.length - 1) goTo(si + 1, 0);
  };
  const prev = () => {
    if (qi > 0) return goTo(si, qi - 1);
    if (!data?.timed && si > 0) goTo(si - 1, sections[si - 1].questions.length - 1);
  };

  useEffect(() => { if (q && data && !data.submitted && !answers[q.id]?.visited) patch(q.id, { visited: true }); }, [q?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <div className="p-8 text-center text-sm text-danger">{error}</div>;
  if (authLoading || !data) return <div className="p-8 text-center text-sm text-neutral-500">Loading your exam...</div>;
  if (data.submitted) return <ExamResult data={data} />;
  if (!sec || !q) return <div className="p-8 text-center text-sm text-neutral-500">This test has no questions.</div>;

  const endsAt = data.timed && data.windows && activeIdx !== null ? data.windows[activeIdx].end : data.expiresAt;
  const remaining = endsAt - now;
  const cur = get(q.id);

  const tally = sections.map((s) => {
    const c: Record<PaletteStatus, number> = { 'not-visited': 0, 'not-answered': 0, answered: 0, marked: 0, 'answered-marked': 0 };
    s.questions.forEach((x) => { c[paletteStatus(answers[x.id])]++; });
    return { name: s.name, ...c };
  });

  const btn = 'rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-40';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-900 px-4 py-2 text-white">
        <p className="min-w-0 truncate text-sm font-semibold">{data.title}</p>
        <div className="flex items-center gap-3 text-sm">
          {data.timed && <span className="text-neutral-300">Section time</span>}
          <span className={`rounded-md px-3 py-1 font-mono text-base font-bold ${remaining < 300_000 ? 'bg-red-600' : 'bg-neutral-700'}`}>{clock(remaining)}</span>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-neutral-200 bg-neutral-50 px-2 pt-2" aria-label="Sections">
        {sections.map((s, i) => (
          <button key={s.name + i} type="button" disabled={!canEnter(i)} onClick={() => goTo(i, 0)}
            className={`shrink-0 rounded-t-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed ${i === si ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-600 hover:bg-neutral-100 disabled:text-neutral-300'}`}>
            {s.name}{data.timed && i !== activeIdx ? (i < (activeIdx ?? 0) ? ' (locked)' : '') : ''}
          </button>
        ))}
      </nav>

      <div className="flex flex-1 flex-col lg:flex-row">
        <main className="flex-1 p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-semibold">Question {qi + 1} of {sec.questions.length}</span>
            <span>Marks: +{q.marks}{q.negativeMarks ? ` / -${q.negativeMarks}` : ''}</span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-base text-neutral-900">{q.text}</p>
          <div className="mt-4 space-y-2">
            {q.options.map((o, oi) => (
              <label key={oi} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${cur.selected === oi ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                <input type="radio" name={`q-${q.id}`} checked={cur.selected === oi} onChange={() => patch(q.id, { selected: oi, visited: true })} className="mt-0.5 h-4 w-4 accent-primary-600" />
                <span className="font-medium text-neutral-500">{String.fromCharCode(65 + oi)}.</span>
                <span className="text-neutral-900">{o}</span>
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" className={`${btn} bg-green-600 text-white hover:bg-green-700`} onClick={next}>Save &amp; Next</button>
            <button type="button" className={`${btn} bg-purple-600 text-white hover:bg-purple-700`} onClick={() => { patch(q.id, { marked: true }); next(); }}>Mark for Review &amp; Next</button>
            <button type="button" className={`${btn} border border-neutral-300 text-neutral-700 hover:bg-neutral-50`} disabled={cur.selected === null} onClick={() => patch(q.id, { selected: null })}>Clear Response</button>
            <button type="button" className={`${btn} border border-neutral-300 text-neutral-700 hover:bg-neutral-50`} onClick={() => patch(q.id, { marked: !cur.marked })}>{cur.marked ? 'Remove review mark' : 'Mark for Review'}</button>
            <button type="button" className={`${btn} border border-neutral-300 text-neutral-700 hover:bg-neutral-50`} disabled={qi === 0 && (data.timed || si === 0)} onClick={prev}>Previous</button>
          </div>
        </main>

        <aside className="border-t border-neutral-200 bg-neutral-50 p-4 lg:w-80 lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{sec.name}</p>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {sec.questions.map((x, i) => (
              <button key={x.id} type="button" onClick={() => goTo(si, i)} aria-label={`Question ${i + 1}`}
                className={`h-9 rounded-md text-xs font-semibold ${PALETTE[paletteStatus(answers[x.id])]} ${i === qi ? 'outline outline-2 outline-offset-1 outline-primary-600' : ''}`}>{i + 1}</button>
            ))}
          </div>
          <ul className="mt-4 space-y-1 text-[11px] text-neutral-600">
            {([['answered', 'Answered'], ['not-answered', 'Not answered'], ['not-visited', 'Not visited'], ['marked', 'Marked for review'], ['answered-marked', 'Answered and marked']] as [PaletteStatus, string][]).map(([k, label]) => (
              <li key={k} className="flex items-center gap-2"><span className={`inline-block h-4 w-4 rounded ${PALETTE[k]}`} />{label}</li>
            ))}
          </ul>
          <button type="button" onClick={() => setSummary(true)} className="mt-5 w-full rounded-md bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Submit test</button>
          <p className="mt-2 text-center text-[11px] text-neutral-400">{saveNote}</p>
        </aside>
      </div>

      {summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-neutral-900">Submit the test?</h2>
            <p className="mt-1 text-xs text-neutral-500">You cannot change your answers after submitting.</p>
            <table className="mt-3 w-full text-xs">
              <thead><tr className="text-left text-neutral-500"><th className="py-1">Section</th><th>Answered</th><th>Not answered</th><th>Marked</th><th>Not visited</th></tr></thead>
              <tbody>{tally.map((t) => (
                <tr key={t.name} className="border-t border-neutral-100">
                  <td className="py-1.5">{t.name}</td><td>{t.answered + t['answered-marked']}</td><td>{t['not-answered']}</td><td>{t.marked + t['answered-marked']}</td><td>{t['not-visited']}</td>
                </tr>
              ))}</tbody>
            </table>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSummary(false)} className="rounded-md border border-neutral-300 px-4 py-2 text-sm">Go back</button>
              <button type="button" disabled={submitting} onClick={submit} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{submitting ? 'Submitting...' : 'Yes, submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
