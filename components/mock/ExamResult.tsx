'use client';

import Link from 'next/link';
import type { ExamData } from './exam-types';

export default function ExamResult({ data }: { data: ExamData }) {
  const r = data.result;
  if (!r) return <div className="p-8 text-center text-sm text-neutral-500">Result not available.</div>;
  const status = new Map(r.perQuestion.map((p) => [p.id, p]));
  const letter = (i: number) => String.fromCharCode(65 + i);

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-neutral-900">{data.title}</h1>
        <p className="text-sm text-neutral-500">Your result</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ['Score', `${r.score} / ${r.maxScore}`],
            ['Correct', r.correct], ['Wrong', r.wrong], ['Not attempted', r.unattempted],
            ['Accuracy', r.accuracy === null ? '-' : `${r.accuracy}%`],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg bg-neutral-50 p-3 text-center">
              <p className="text-[11px] uppercase text-neutral-500">{label}</p>
              <p className="mt-1 text-lg font-bold text-neutral-900">{value}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-sm font-bold text-neutral-900">Section-wise</h2>
        <div className="mt-2 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-neutral-50 text-left text-neutral-600">
              <th className="px-3 py-2 font-medium">Section</th><th className="px-3 py-2 font-medium">Score</th>
              <th className="px-3 py-2 font-medium">Correct</th><th className="px-3 py-2 font-medium">Wrong</th><th className="px-3 py-2 font-medium">Skipped</th>
            </tr></thead>
            <tbody>{r.sections.map((s) => (
              <tr key={s.name} className="border-t border-neutral-100">
                <td className="px-3 py-2">{s.name}</td><td className="px-3 py-2">{s.score} / {s.maxScore}</td>
                <td className="px-3 py-2">{s.correct}</td><td className="px-3 py-2">{s.wrong}</td><td className="px-3 py-2">{s.unattempted}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <h2 className="mt-6 text-sm font-bold text-neutral-900">Review your answers</h2>
        {data.sections.map((sec) => (
          <div key={sec.name} className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{sec.name}</p>
            <div className="mt-2 space-y-3">
              {sec.questions.map((q, i) => {
                const mine = data.answers[q.id]?.selected ?? null;
                const st = status.get(q.id);
                const tone = st?.status === 'correct' ? 'border-green-200 bg-green-50/40' : st?.status === 'wrong' ? 'border-red-200 bg-red-50/40' : 'border-neutral-200';
                return (
                  <div key={q.id} className={`rounded-xl border p-4 ${tone}`}>
                    <div className="flex justify-between gap-3 text-xs text-neutral-500">
                      <span>Question {i + 1}</span>
                      <span className="font-semibold">{st ? (st.earned > 0 ? `+${st.earned}` : st.earned) : 0} marks</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-neutral-900">{q.text}</p>
                    <ul className="mt-2 space-y-1">
                      {q.options.map((o, oi) => {
                        const right = q.correctIndex === oi;
                        const wrongPick = mine === oi && !right;
                        return (
                          <li key={oi} className={`rounded-md px-2 py-1 text-sm ${right ? 'bg-green-100 font-medium text-green-900' : wrongPick ? 'bg-red-100 text-red-900' : 'text-neutral-700'}`}>
                            {letter(oi)}. {o}{right ? '  (correct)' : ''}{mine === oi ? '  (your answer)' : ''}
                          </li>
                        );
                      })}
                    </ul>
                    {mine === null && <p className="mt-1 text-xs text-neutral-500">You did not answer this question.</p>}
                    {q.explanation && <p className="mt-2 text-xs text-neutral-600"><span className="font-semibold">Explanation: </span>{q.explanation}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/study-zone/mock-tests" className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">More mock tests</Link>
          <button type="button" onClick={() => window.close()} className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">Close window</button>
        </div>
      </div>
    </div>
  );
}
