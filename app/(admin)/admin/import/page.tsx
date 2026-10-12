'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface RowResult {
  index: number;
  title: string;
  status: 'created' | 'valid' | 'duplicate' | 'error';
  messages: string[];
  id?: string;
}

interface ImportResponse {
  dryRun: boolean;
  summary: { created: number; valid: number; duplicate: number; error: number };
  results: RowResult[];
}

function buildExample(): string {
  const day = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
  return JSON.stringify(
    {
      jobs: [
        {
          title: 'EXAMPLE Recruitment 2026 (replace every value before use)',
          organization: 'SSC',
          officialLink: 'https://example.com/notification',
          advertisementNo: 'EXAMPLE-01/2026',
          applicationMode: 'ONLINE',
          status: 'LIVE',
          state: 'Bihar',
          notificationDate: day(0),
          applicationStartDate: day(1),
          applicationEndDate: day(30),
          examDate: day(60),
          howToApply: 'Replace with the real application steps.',
          selectionProcess: ['Written Exam', 'Document Verification'],
          fees: [
            { category: 'General/OBC/EWS', amount: 'Rs 100' },
            { category: 'SC/ST/PwD', amount: 'Rs 0' },
          ],
          links: [{ label: 'Apply Online', url: 'https://example.com/apply', type: 'APPLY_ONLINE' }],
          importantDates: [{ label: 'Admit Card Release', date: day(55) }],
          faqs: [{ question: 'Replace this question?', answer: 'Replace this answer.' }],
          posts: [
            {
              title: 'Example Post',
              vacancies: 10,
              minAge: 18,
              maxAge: 27,
              payScale: 'Level 2',
              employmentType: 'PERMANENT',
              qualification: '10th-pass',
              role: 'Clerk',
            },
          ],
        },
      ],
    },
    null,
    2,
  );
}

const badge: Record<RowResult['status'], string> = {
  created: 'bg-green-50 text-success',
  valid: 'bg-blue-50 text-primary-600',
  duplicate: 'bg-amber-50 text-accent-amber',
  error: 'bg-red-50 text-danger',
};

export default function AdminImportPage() {
  const [text, setText] = useState('');
  const [response, setResponse] = useState<ImportResponse | null>(null);
  const [validatedText, setValidatedText] = useState('');
  const [busy, setBusy] = useState<'validate' | 'import' | null>(null);
  const [error, setError] = useState('');

  const run = async (dryRun: boolean) => {
    setError('');
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError('That is not valid JSON: ' + (e as Error).message);
      return;
    }
    const jobs = Array.isArray(parsed) ? parsed : parsed?.jobs;
    if (!Array.isArray(jobs) || jobs.length === 0) {
      setError('Expected a list of jobs, either as [ ... ] or as an object with a "jobs" list.');
      return;
    }

    setBusy(dryRun ? 'validate' : 'import');
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs, dryRun }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Request failed');
        return;
      }
      setResponse(data);
      setValidatedText(dryRun ? text : '');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setText(await file.text());
    setResponse(null);
    setValidatedText('');
    e.target.value = '';
  };

  const canImport =
    !busy && !!response && response.dryRun && validatedText === text && response.summary.valid > 0;

  return (
    <div className="p-6 max-w-4xl">
      <Card padding="lg">
        <h2 className="text-lg font-bold text-neutral-900">Bulk Import Jobs</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Paste or upload JSON, validate it, then import. Every imported job is saved as a{' '}
          <span className="font-medium">draft</span> - review and publish each one from the Jobs page.
        </p>

        <details className="mt-3 text-xs text-neutral-600">
          <summary className="cursor-pointer text-primary-600">Field reference</summary>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Required per job: title, organization (short or full name), officialLink.</li>
            <li>Dates are YYYY-MM-DD: notificationDate (not in the future), applicationStartDate, applicationEndDate, examDate.</li>
            <li>applicationMode: ONLINE, OFFLINE or BOTH. status: UPCOMING, LIVE, CLOSED or CANCELLED.</li>
            <li>Lists: selectionProcess (text), fees (category + amount), links (label, url, type), importantDates (label + date), faqs (question + answer).</li>
            <li>Each post needs a title and a qualification (name or slug, or a qualifications list). Optional: vacancies, minAge, maxAge, payScale, employmentType, branches (list), role.</li>
            <li>A job with no posts should have directEligibility (for exams like PET/CET).</li>
            <li>Organization, state, qualification, branch and role must already exist - names or slugs both work. Unknown values are reported, never auto-created.</li>
          </ul>
        </details>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setText(buildExample()); setResponse(null); setValidatedText(''); }}
          >
            Load example
          </Button>
          <label className="text-xs text-primary-600 cursor-pointer hover:underline">
            Upload .json file
            <input type="file" accept=".json,application/json" onChange={onFile} className="hidden" />
          </label>
        </div>

        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
          rows={16}
          spellCheck={false}
          placeholder='{ "jobs": [ ... ] }'
          className="mt-3 w-full text-xs font-mono border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
        />

        {error && <p className="text-xs text-danger mt-2">{error}</p>}

        <div className="flex items-center gap-3 mt-3">
          <Button variant="secondary" onClick={() => run(true)} disabled={!text.trim() || !!busy}>
            {busy === 'validate' ? 'Validating...' : 'Validate (dry run)'}
          </Button>
          <Button variant="primary" onClick={() => run(false)} disabled={!canImport}>
            {busy === 'import' ? 'Importing...' : 'Import as drafts'}
          </Button>
          {response && response.dryRun && !canImport && !busy && validatedText !== text && (
            <span className="text-xs text-neutral-400">Text changed - validate again to enable import.</span>
          )}
        </div>
      </Card>

      {response && (
        <Card padding="lg" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-neutral-900">
              {response.dryRun ? 'Validation result (nothing saved yet)' : 'Import result'}
            </h3>
            <p className="text-xs text-neutral-600">
              {response.dryRun ? `${response.summary.valid} ready` : `${response.summary.created} created`}
              {' · '}{response.summary.duplicate} duplicate{' · '}{response.summary.error} with errors
            </p>
          </div>

          <div className="divide-y divide-neutral-100">
            {response.results.map((r) => (
              <div key={r.index} className="py-2.5">
                <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${badge[r.status]}`}>
                    {r.status}
                  </span>
                  <p className="text-sm text-neutral-900 truncate">
                    #{r.index + 1} {r.title}
                  </p>
                  {r.id && (
                    <Link href={`/admin/notifications/${r.id}`} className="text-xs text-primary-600 hover:underline shrink-0">
                      Open
                    </Link>
                  )}
                </div>
                {r.messages.length > 0 && (
                  <ul className="mt-1 ml-1 space-y-0.5">
                    {r.messages.map((m, i) => (
                      <li key={i} className="text-xs text-neutral-600">- {m}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {!response.dryRun && response.summary.created > 0 && (
            <Link href="/admin/notifications" className="inline-block mt-3 text-xs text-primary-600 hover:underline">
              Go to Jobs to review and publish
            </Link>
          )}
        </Card>
      )}
    </div>
  );
}
