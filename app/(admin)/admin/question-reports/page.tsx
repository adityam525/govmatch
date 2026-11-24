'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Row { id: string; reason: string; comment: string | null; text: string; options: string[]; correctIndex: number; status: string; templateId: string | null; sameQuestionReports: number; createdAt: string }
const LABELS: Record<string, string> = { NO_CORRECT_OPTION: 'No option is correct', WRONG_ANSWER: 'Marked answer is wrong', ANOTHER_ALSO_CORRECT: 'Another option is also correct', TYPO: 'Spelling or wording', UNCLEAR: 'Unclear', OTHER: 'Other' };

export default function QuestionReportsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState('OPEN');
  const [msg, setMsg] = useState('');
  const load = () => fetch('/api/admin/question-reports?status=' + status).then((r) => (r.ok ? r.json() : Promise.reject())).then(setRows).catch(() => setMsg('Could not load reports.'));
  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const mark = async (id: string, next: string) => { await fetch('/api/admin/question-reports/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) }); load(); };
  const unpublish = async (tid: string) => {
    if (!confirm('Take this question out of practice until it is fixed?')) return;
    const res = await fetch('/api/admin/qb-templates/' + tid, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: false }) });
    setMsg(res.ok ? 'Question unpublished.' : 'Could not unpublish.');
  };
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-bold text-neutral-900">Question reports</h1>
      <div className="flex gap-2">{['OPEN', 'FIXED', 'DISMISSED', 'ALL'].map((s) => <button key={s} type="button" onClick={() => setStatus(s)} className={'rounded-full border px-3 py-1 text-xs font-medium ' + (status === s ? 'border-primary-600 bg-primary-600 text-white' : 'border-neutral-200 bg-white text-neutral-600')}>{s}</button>)}</div>
      {msg && <p className="text-sm text-neutral-700">{msg}</p>}
      {rows.length === 0 && <p className="text-sm text-neutral-600">No reports.</p>}
      {rows.map((r) => (
        <article key={r.id} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold text-red-700">{LABELS[r.reason] ?? r.reason}{r.sameQuestionReports > 1 ? ' (' + r.sameQuestionReports + ' reports for this question)' : ''}</p>
          <p className="text-sm text-neutral-900">{r.text}</p>
          <ol className="list-[upper-alpha] pl-6 text-sm text-neutral-700">{r.options.map((o, i) => <li key={i} className={i === r.correctIndex ? 'font-semibold text-green-700' : ''}>{o}{i === r.correctIndex ? '  (marked correct)' : ''}</li>)}</ol>
          {r.comment && <p className="rounded-md bg-neutral-50 p-2 text-sm text-neutral-700">User says: {r.comment}</p>}
          <div className="flex flex-wrap gap-2 text-xs">
            {r.templateId && <Link href={'/admin/question-bank/' + r.templateId} className="rounded-md border border-neutral-200 px-3 py-1.5 font-medium text-primary-700">Open the question</Link>}
            {r.templateId && <button type="button" onClick={() => unpublish(r.templateId as string)} className="rounded-md border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700">Unpublish</button>}
            <button type="button" onClick={() => mark(r.id, 'FIXED')} className="rounded-md bg-green-600 px-3 py-1.5 font-semibold text-white">Mark fixed</button>
            <button type="button" onClick={() => mark(r.id, 'DISMISSED')} className="rounded-md border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700">Dismiss</button>
          </div>
        </article>
      ))}
    </div>
  );
}
