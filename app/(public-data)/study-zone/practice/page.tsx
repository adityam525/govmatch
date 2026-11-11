'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Crown } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

interface Topic { id: string; name: string; templates: number }
interface Chapter { id: string; name: string; topics: Topic[] }
interface Subject { id: string; name: string; chapters: Chapter[] }
interface Exam { id: string; name: string; stage: string | null; topicIds: string[] }
interface Usage { premium: boolean; used: number; limit: number | null; maxQuestions: number }

const field = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
const label = 'mb-1 block text-xs font-medium text-neutral-600';

export default function PracticePage() {
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [examId, setExamId] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [count, setCount] = useState('10');
  const [easy, setEasy] = useState('30');
  const [medium, setMedium] = useState('50');
  const [hard, setHard] = useState('20');
  const [minutes, setMinutes] = useState('');
  const [marks, setMarks] = useState('1');
  const [negative, setNegative] = useState('0.25');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/qb/taxonomy').then((r) => r.json()).then((d) => { setSubjects(d.subjects ?? []); setExams(d.exams ?? []); }).catch(() => setError('Could not load the topics.'));
  }, []);
  useEffect(() => {
    if (!user?.id) return;
    fetch('/api/users/' + user.id + '/practice').then((r) => (r.ok ? r.json() : null)).then(setUsage).catch(() => {});
  }, [user?.id]);

  const available = useMemo(() => new Set(subjects.flatMap((s) => s.chapters.flatMap((c) => c.topics.filter((t) => t.templates > 0).map((t) => t.id)))), [subjects]);
  const chosenCount = [...picked].filter((id) => available.has(id)).length;
  const premium = !!usage?.premium;
  const maxQ = usage?.maxQuestions ?? 10;

  const pickExam = (id: string) => {
    setExamId(id);
    const exam = exams.find((e) => e.id === id);
    setPicked(new Set(exam ? exam.topicIds.filter((t) => available.has(t)) : []));
  };
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleChapter = (c: Chapter) => setPicked((p) => {
    const ids = c.topics.filter((t) => t.templates > 0).map((t) => t.id);
    const n = new Set(p);
    const all = ids.every((id) => n.has(id));
    ids.forEach((id) => (all ? n.delete(id) : n.add(id)));
    return n;
  });

  const start = async () => {
    if (!user?.id) return;
    setBusy(true); setError('');
    try {
      try { await document.documentElement.requestFullscreen?.(); } catch { /* the exam still works without it */ }
            const res = await fetch('/api/users/' + user.id + '/practice', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, topicIds: [...picked].filter((id) => available.has(id)), count, mix: { EASY: easy, MEDIUM: medium, HARD: hard }, durationMinutes: minutes, marks, negativeMarks: negative }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { if (document.fullscreenElement) await document.exitFullscreen().catch(() => {}); setError(d.message ?? 'Could not create the set.'); return; }
      router.push('/exam/run/' + d.attemptId + '?from=practice');
    } catch { setError('Network error. Please try again.'); } finally { setBusy(false); }
  };

  if (authLoading) return <div className="mx-auto max-w-4xl px-6 py-10 text-sm text-neutral-600">Loading...</div>;
  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-neutral-900">Practice by topic</h1>
        <p className="mt-2 text-sm text-neutral-600">Log in to build practice sets from the question bank.</p>
        <Link href="/login" className="mt-5 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Log in</Link>
      </div>
    );
  }

  const left = usage && usage.limit !== null ? Math.max(0, usage.limit - usage.used) : null;
  return (
    <div className="page-x mx-auto w-full max-w-4xl space-y-6 py-8">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Practice by topic</h1>
        <p className="mt-1 text-sm text-neutral-600">Every question has fresh numbers each time, with a worked explanation after the test.</p>
        {left !== null && (
          <p role="status" className={'mt-3 rounded-lg border px-4 py-3 text-sm font-semibold ' + (left === 0 ? 'border-red-200 bg-red-50 text-red-700' : left === 1 ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-primary-200 bg-primary-50 text-primary-700')}>
            {left === 0 ? 'You have used all ' + usage?.limit + ' free practice sets for today. They reset at midnight, or go Premium for no daily limit.' : left + ' of ' + usage?.limit + ' free practice sets left today.'}
            {left === 0 && <> <Link href="/pricing" className="underline">See Premium</Link></>}
          </p>
        )}
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <label className={label}>Exam syllabus (optional)</label>
        <Select value={examId} onChange={pickExam} options={[{ value: '', label: 'Choose topics myself' }, ...exams.map((e) => ({ value: e.id, label: e.name + (e.stage ? ' - ' + e.stage : '') }))]} />
      </section>

      {subjects.map((s) => (
        <section key={s.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-bold text-neutral-900">{s.name}</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {s.chapters.filter((c) => c.topics.some((t) => t.templates > 0)).map((c) => {
              const ids = c.topics.filter((t) => t.templates > 0).map((t) => t.id);
              const n = ids.filter((id) => picked.has(id)).length;
              return (
                <div key={c.id}>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                    <input type="checkbox" checked={n === ids.length} ref={(el) => { if (el) el.indeterminate = n > 0 && n < ids.length; }} onChange={() => toggleChapter(c)} className="accent-primary-600" />{c.name}
                  </label>
                  <ul className="ml-6 mt-1 space-y-0.5">
                    {c.topics.filter((t) => t.templates > 0).map((t) => (
                      <li key={t.id}><label className="flex items-center gap-2 text-xs text-neutral-600"><input type="checkbox" checked={picked.has(t.id)} onChange={() => toggle(t.id)} className="accent-primary-600" />{t.name}</label></li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {subjects.length > 0 && available.size === 0 && <p className="text-sm text-neutral-600">No practice questions are published yet.</p>}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-bold text-neutral-900">Test settings</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div><label className={label}>Number of questions (up to {maxQ})</label><input type="number" min={1} max={maxQ} value={count} onChange={(e) => setCount(e.target.value)} className={field} /></div>
        </div>
        <div className={'mt-4 ' + (premium ? '' : 'opacity-60')}>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-700">{!premium && <Crown size={13} className="text-amber-500" />}Customise {!premium && <Link href="/pricing" className="font-normal text-primary-600 underline">(Premium)</Link>}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className={label}>Easy %</label><input type="number" min={0} max={100} disabled={!premium} value={easy} onChange={(e) => setEasy(e.target.value)} className={field} /></div>
            <div><label className={label}>Medium %</label><input type="number" min={0} max={100} disabled={!premium} value={medium} onChange={(e) => setMedium(e.target.value)} className={field} /></div>
            <div><label className={label}>Hard %</label><input type="number" min={0} max={100} disabled={!premium} value={hard} onChange={(e) => setHard(e.target.value)} className={field} /></div>
            <div><label className={label}>Time (minutes, empty = suggested)</label><input type="number" min={1} max={300} disabled={!premium} value={minutes} onChange={(e) => setMinutes(e.target.value)} className={field} /></div>
            <div><label className={label}>Marks per question</label><input type="number" step="0.25" min={0.25} max={10} disabled={!premium} value={marks} onChange={(e) => setMarks(e.target.value)} className={field} /></div>
            <div><label className={label}>Negative marks</label><input type="number" step="0.25" min={0} max={5} disabled={!premium} value={negative} onChange={(e) => setNegative(e.target.value)} className={field} /></div>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="button" variant="primary" disabled={busy || chosenCount === 0 || left === 0} onClick={start}>{busy ? 'Preparing...' : 'Start practice'}</Button>
        <span className="text-xs text-neutral-500">{chosenCount} topics selected</span>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
