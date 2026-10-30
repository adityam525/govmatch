'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks';
import { minutesTaken, percentOf, type HistoryItem, type Summary } from '@/lib/mock-analytics';
import type { RunningItem } from '@/lib/mock-history';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

function Trend({ points }: { points: Summary['trend'] }) {
  if (points.length < 2) return <p className="py-6 text-center text-xs text-neutral-500">Take at least two tests to see your progress chart.</p>;
  const W = 300, H = 90, pad = 8;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (points.length - 1);
  const y = (p: number) => H - pad - (Math.max(0, Math.min(100, p)) * (H - pad * 2)) / 100;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full" role="img" aria-label="Score percentage over your last tests">
      {[0, 50, 100].map((g) => <line key={g} x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} stroke="#e5e7eb" strokeWidth="1" />)}
      <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={points.map((p, i) => `${x(i)},${y(p.percent)}`).join(' ')} />
      {points.map((p, i) => <circle key={p.id} cx={x(i)} cy={y(p.percent)} r="3.5" fill="#2563eb"><title>{`${p.title}: ${p.percent}% on ${fmt(p.date)}`}</title></circle>)}
    </svg>
  );
}

export default function MyMockTestsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{ history: HistoryItem[]; running: RunningItem[]; summary: Summary | null } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}/mock-history`)
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; })
      .then(setData)
      .catch((e) => setError(e.message || 'Could not load your results.'));
  }, [user?.id]);

  if (error) return <div className="mx-auto max-w-4xl p-6 text-sm text-danger">{error}</div>;
  if (!data) return <div className="mx-auto max-w-4xl p-6 text-sm text-neutral-500">Loading...</div>;

  const { history, running, summary: s } = data;
  const tile = (label: string, value: string, hint?: string) => (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-neutral-500">{hint}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">My mock tests</h1>
          <p className="mt-1 text-sm text-neutral-600">Your scores and progress across every test you have taken.</p>
        </div>
        <Link href="/study-zone/mock-tests" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">Take a test</Link>
      </div>

      {running.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-bold text-amber-900">In progress</h2>
          <ul className="mt-2 space-y-2">
            {running.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-neutral-900">{r.title}</span>
                <Link href={`/exam/run/${r.id}`} className="font-semibold text-primary-700 hover:underline">{r.expired ? 'Time ended, see result' : 'Resume'}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!s ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-14 text-center">
          <p className="text-sm text-neutral-600">You have not completed a test yet. Your scorecard and progress will appear here.</p>
          <Link href="/study-zone/mock-tests" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:underline">Browse mock tests</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tile('Tests taken', String(s.count))}
            {tile('Average score', `${s.averagePercent}%`, `Best ${s.bestPercent}%`)}
            {tile('Latest score', `${s.latestPercent}%`)}
            {tile('Accuracy', s.averageAccuracy === null ? '-' : `${s.averageAccuracy}%`, 'Correct out of attempted')}
          </div>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-neutral-900">Progress (last {s.trend.length})</h2>
              {s.change !== null && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.change > 0 ? 'bg-green-50 text-green-700' : s.change < 0 ? 'bg-red-50 text-red-700' : 'bg-neutral-100 text-neutral-600'}`}>
                  {s.change > 0 ? <ArrowUpRight size={13} /> : s.change < 0 ? <ArrowDownRight size={13} /> : <Minus size={13} />}
                  {s.change > 0 ? '+' : ''}{s.change} points vs your earlier average
                </span>
              )}
            </div>
            <Trend points={s.trend} />
          </section>

          {s.sections.length > 0 && (
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-900">Sections</h2>
              {s.strongest && s.weakest && (
                <p className="mt-1 text-xs text-neutral-600">Strongest: <b>{s.strongest.name}</b> ({s.strongest.accuracy}% accuracy). Needs work: <b>{s.weakest.name}</b> ({s.weakest.accuracy}% accuracy).</p>
              )}
              <ul className="mt-3 space-y-3">
                {s.sections.map((sec) => (
                  <li key={sec.name}>
                    <div className="flex justify-between text-xs"><span className="font-medium text-neutral-800">{sec.name}</span><span className="text-neutral-500">{sec.accuracy === null ? 'Nothing attempted' : `${sec.accuracy}% accuracy`} · {sec.correct} right, {sec.wrong} wrong, {sec.unattempted} skipped</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-primary-600" style={{ width: `${sec.accuracy ?? 0}%` }} /></div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <h2 className="border-b border-neutral-100 px-5 py-3 text-sm font-bold text-neutral-900">our attempts</h2>
            <ul className="divide-y divide-neutral-100">
              {history.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{h.title}</p>
                    <p className="text-xs text-neutral-500">{fmt(h.submittedAt)} · {minutesTaken(h.startedAt, h.submittedAt)} min · {h.correct} right, {h.wrong} wrong, {h.unattempted} skipped</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">{h.score} / {h.maxScore}</p>
                    <p className="text-xs text-neutral-500">{percentOf(h.score, h.maxScore)}%</p>
                  </div>
                  <div className="flex gap-2 text-xs font-medium">
                    <Link href={`/exam/run/${h.id}`} className="text-primary-700 hover:underline">Review</Link>
                  <Link href={`/exam/${h.testId}`} className="text-neutral-600 hover:underline">Retake</Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
