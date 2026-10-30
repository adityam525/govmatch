'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { SAMPLE_JSON, normalizeImport } from '@/lib/mock-test-json';
import { validateTest } from '@/lib/mock-test';

export default function ImportTestJsonPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const prepare = () => {
    let raw: unknown;
    try { raw = JSON.parse(text); } catch { setMessage({ ok: false, text: 'That is not valid JSON. Check for a missing comma or quote.' }); return null; }
    const n = normalizeImport(raw);
    if ('error' in n) { setMessage({ ok: false, text: n.error }); return null; }
    const v = validateTest(n.payload);
    if ('error' in v) { setMessage({ ok: false, text: v.error }); return null; }
    const count = v.data.sections.reduce((a, s) => a + s.questions.length, 0);
    setMessage({ ok: true, text: `Valid: "${v.data.title}", ${v.data.sections.length} section(s), ${count} question(s).` });
    return n.payload;
  };

  const create = async () => {
    const payload = prepare();
    if (!payload) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/mock-tests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, published: false }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage({ ok: false, text: d.message ?? 'Could not save.' }); return; }
      router.push(`/admin/mock-tests/${d.id}`);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="text-lg font-bold text-neutral-900">Import a test from JSON</h1>
      <p className="mt-1 text-sm text-neutral-600">Saved as a draft. Open it to check it, then publish. <code>answer</code> is a letter (A to E); <code>marks</code> and <code>negativeMarks</code> can be set for the test, a section or a question.</p>
      <input type="file" accept=".json,application/json" className="mt-4 block text-sm" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setText(await f.text()); setMessage(null); } }} />
      <textarea value={text} onChange={(e) => { setText(e.target.value); setMessage(null); }} rows={16} placeholder="Paste JSON here" className="mt-3 w-full rounded-md border border-neutral-200 p-3 font-mono text-xs outline-none focus:border-primary-500" />
      {message && <p className={`mt-2 text-sm ${message.ok ? 'text-success' : 'text-danger'}`}>{message.text}</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={prepare} disabled={!text.trim()}>Check</Button>
        <Button type="button" variant="primary" onClick={create} disabled={busy || !text.trim()}>{busy ? 'Saving...' : 'Create draft'}</Button>
        <Button type="button" variant="secondary" onClick={() => { setText(SAMPLE_JSON); setMessage(null); }}>Load an example</Button>
      </div>
    </div>
  );
}
