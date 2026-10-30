'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks';

interface Info {
  title: string; description: string | null; timed: boolean; durationMinutes: number; totalMarks: number; negativeMarking: boolean;
  sections: { name: string; durationMinutes: number | null; questions: number }[];
}

export default function ExamInstructionsPage() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/mock-tests/${testId}`)
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; })
      .then(setInfo)
      .catch((e) => setError(e.message || 'This test could not be loaded.'));
  }, [testId]);

  const begin = async () => {
    if (!user?.id) return;
    setBusy(true); setError('');
    // Full screen must be requested from the click itself, so it comes before any waiting.
    try { await document.documentElement.requestFullscreen?.(); } catch { /* the exam still works without it */ }
    try {
      const res = await fetch(`/api/users/${user.id}/mock-attempts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.message ?? 'Could not start the test.'); setBusy(false); return; }
      router.push(`/exam/run/${d.id}`);
    } catch {
      setError('Network error. Please try again.'); setBusy(false);
    }
  };

  if (error && !info) return <div className="mx-auto max-w-xl p-8 text-center text-sm text-danger">{error}</div>;
  if (!info || authLoading) return <div className="p-8 text-center text-sm text-neutral-500">Loading...</div>;

  const rules = [
    info.timed
      ? 'Sections run one after another. When a section\'s time ends it locks and the next one opens. You cannot return to a finished section.'
      : 'The clock runs for the whole test. You can move between questions and sections freely.',
    'Your answers are saved as you go. If your connection drops or you refresh, return to this test and you will continue with the time left.',
    info.negativeMarking ? 'Some questions carry negative marking. A wrong answer loses marks; an unanswered question does not.' : 'There is no negative marking.',
    'Marked for Review with an answer counts as answered. Marked for Review without an answer does not score.',
    'The test submits by itself when time ends.',
  ];

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-neutral-900">{info.title}</h1>
        {info.description && <p className="mt-1 text-sm text-neutral-600">{info.description}</p>}

        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-[11px] uppercase text-neutral-500">Duration</dt><dd className="mt-1 text-lg font-bold">{info.durationMinutes} min</dd></div>
          <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-[11px] uppercase text-neutral-500">Questions</dt><dd className="mt-1 text-lg font-bold">{info.sections.reduce((n, s) => n + s.questions, 0)}</dd></div>
          <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-[11px] uppercase text-neutral-500">Total marks</dt><dd className="mt-1 text-lg font-bold">{info.totalMarks}</dd></div>
        </dl>

        <h2 className="mt-5 text-sm font-bold text-neutral-900">Sections</h2>
        <ul className="mt-2 divide-y divide-neutral-100 rounded-lg border border-neutral-200">
          {info.sections.map((s) => (
            <li key={s.name} className="flex justify-between px-3 py-2 text-sm"><span>{s.name}</span><span className="text-neutral-500">{s.questions} questions{s.durationMinutes ? ` · ${s.durationMinutes} min` : ''}</span></li>
          ))}
        </ul>

        <h2 className="mt-5 text-sm font-bold text-neutral-900">Instructions</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-neutral-700">{rules.map((r) => <li key={r}>{r}</li>)}</ul>

        {!isLoggedIn ? (
          <p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Please <Link href={`/login?callbackUrl=${encodeURIComponent(`/exam/${testId}`)}`} className="font-semibold underline">log in</Link> to take tis test, so your answers and result are saved to your account.
          </p>
        ) : (
          <>
            <label className="mt-6 flex items-start gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary-600" />
              I have read and understood the instructions.
            </label>
            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
            <button type="button" disabled={!agreed || busy} onClick={begin} className="mt-4 w-full rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
              {busy ? 'Starting...' : 'I am ready to begin'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
