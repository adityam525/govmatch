'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface Row { index: number; title: string; status: string; messages: string[] }

const SAMPLE = JSON.stringify({
  templates: [{
    title: 'Train crossing a pole', chapter: 'Time, Speed and Distance', topic: 'Trains', difficulty: 'EASY', expectedSeconds: 50,
    definition: {
      text: 'A train {L} m long crosses a pole in {t} s. Find its speed in km/h.',
      variables: [{ name: 'L', kind: 'int', min: 60, max: 300, step: 10 }, { name: 't', kind: 'int', min: 4, max: 30 }],
      derived: [{ name: 'ms', expr: 'L / t' }],
      constraints: ['(L * 18) % (t * 5) == 0'],
      answer: { expr: 'L / t * 18 / 5', decimals: 0, unit: 'km/h' },
      distractors: ['L / t', 'L * 18 / t'],
      explanation: 'Speed = {L} / {t} = {ms:2} m/s. Multiply by 18/5: {answer} km/h.',
    },
  }],
}, null, 2);

export default function ImportTemplatesPage() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Row[] | null>(null);
  const [publish, setPublish] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (dryRun: boolean) => {
    setMessage(''); setResults(null);
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { setMessage('That is not valid JSON. Check for a missing comma or quote.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/qb-templates/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...(parsed as object), dryRun, publish }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage(d.message ?? 'Import failed.'); return; }
      setResults(d.results);
      const counts = (s: string) => d.results.filter((r: Row) => r.status === s).length;
      setMessage(dryRun ? counts('valid') + ' ready, ' + counts('duplicate') + ' duplicate, ' + counts('error') + ' with errors. Nothing was saved.' : counts('created') + ' created.');
    } finally { setBusy(false); }
  };

  const tone: Record<string, string> = { created: 'bg-green-50 text-green-700', valid: 'bg-blue-50 text-primary-600', duplicate: 'bg-amber-50 text-amber-700', error: 'bg-red-50 text-danger' };
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="text-lg font-bold text-neutral-900">Import question templates</h1>
      <p className="mt-1 text-sm text-neutral-600">Give each template its chapter and topic by name. Every template is checked with 200 trial draws. Ones with errors are not saved.</p>
      <input type="file" accept=".json,application/json" className="mt-4 block text-sm" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setText(await f.text()); setResults(null); setMessage(''); } }} />
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={16} placeholder="Paste JSON here" className="mt-3 w-full rounded-md border border-neutral-200 p-3 font-mono text-xs outline-none focus:border-primary-500" />
      <label className="mt-2 flex items-center gap-2 text-xs text-neutral-700"><input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="accent-primary-600" /> Publish templates that pass (otherwise they are saved as drafts)</label>
      {message && <p className="mt-2 text-sm text-neutral-800">{message}</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" disabled={busy || !text.trim()} onClick={() => run(true)}>Check (dry run)</Button>
        <Button type="button" variant="primary" disabled={busy || !text.trim()} onClick={() => run(false)}>{busy ? 'Working...' : 'Import'}</Button>
        <Button type="button" variant="secondary" onClick={() => { setText(SAMPLE); setResults(null); setMessage(''); }}>Load an example</Button>
      </div>
      {results && (
        <ul className="mt-4 divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {results.map((r) => (
            <li key={r.index} className="px-4 py-3 text-sm">
              <div className="flex items-center gap-2"><span className={'rounded-full px-2 py-0.5 text-xs font-medium ' + (tone[r.status] ?? '')}>{r.status}</span><span className="font-medium text-neutral-900">{r.title}</span></div>
              {r.messages.map((m) => <p key={m} className="mt-1 text-xs text-neutral-600">&bull; {m}</p>)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
