'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

interface Job { id: string; title: string; organization?: { name: string } | null }
interface Level { id: string; name: string }
const sel = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';

// Links an official test to a job (so it appears on that job page) and optionally to one of its exam levels.
// Organization and states come from the job, so they are not entered here.
export default function MockLinkCard({ testId }: { testId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [jobId, setJobId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/mock-tests/${testId}`).then((r) => r.json()),
      fetch('/api/notifications').then((r) => r.json()),
    ]).then(([test, list]) => {
      setJobs(Array.isArray(list) ? list : []);
      setJobId(test?.notificationId ?? '');
      setLevelId(test?.examLevelId ?? '');
    }).catch(() => setMsg({ ok: false, text: 'Could not load the jobs.' })).finally(() => setReady(true));
  }, [testId]);

  useEffect(() => {
    if (!jobId) { setLevels([]); return; }
    fetch(`/api/exam-levels?notificationId=${jobId}`).then((r) => r.json()).then((d) => setLevels(Array.isArray(d) ? d : [])).catch(() => setLevels([]));
  }, [jobId]);

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/admin/mock-tests/${testId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: jobId, examLevelId: levelId }),
      });
      const d = await res.json().catch(() => ({}));
      setMsg(res.ok ? { ok: true, text: jobId ? 'Linked. It shows on that job page once the test is published.' : 'Link removed.' } : { ok: false, text: d.message ?? 'Could not save.' });
    } catch { setMsg({ ok: false, text: 'Network error.' }); } finally { setBusy(false); }
  };

  if (!ready) return null;
  return (
    <section className="mx-auto mt-6 max-w-4xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-neutral-900">Exam link</h2>
      <p className="mt-1 text-xs text-neutral-500">Links this test to a job, so it appears on that job page and in the mock test filters by exam, organization and state. This card saves on its own button.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Job / exam</label>
          <select value={jobId} onChange={(e) => { setJobId(e.target.value); setLevelId(''); setMsg(null); }} className={sel}>
            <option value="">Not linked</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Exam level (optional)</label>
          <select value={levelId} disabled={!jobId || levels.length === 0} onChange={(e) => { setLevelId(e.target.value); setMsg(null); }} className={`${sel} disabled:bg-neutral-100`}>
            <option value="">{jobId && levels.length === 0 ? 'This job has no exam levels' : 'Any level'}</option>
            {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button type="button" variant="primary" size="sm" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save link'}</Button>
        {msg && <span className={`text-xs ${msg.ok ? 'text-success' : 'text-danger'}`}>{msg.text}</span>}
      </div>
    </section>
  );
}
