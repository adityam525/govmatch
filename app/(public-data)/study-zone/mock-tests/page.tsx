import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { DIFFICULTIES } from '@/lib/mock-difficulty';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mock tests | GovMatch', description: 'Practice mock tests for government exams, filtered by exam, organization, state, level and difficulty.' };

interface Props { searchParams: Promise<{ [key: string]: string | undefined }> }
const sel = 'h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-primary-400';

export default async function MockCataloguePage({ searchParams }: Props) {
  const q = await searchParams;
  const tests = await prisma.mockTest.findMany({
    where: { userId: null, published: true },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, title: true, description: true, durationMinutes: true, difficulty: true,
      sections: { select: { _count: { select: { questions: true } } } },
      examLevel: { select: { name: true } },
      notification: { select: { slug: true, title: true, organization: { select: { slug: true, name: true } }, states: { select: { code: true, name: true } } } },
    },
  });

  const uniq = <T,>(items: (T | undefined | null)[], key: (x: T) => string) => {
    const seen = new Map<string, T>();
    for (const i of items) if (i && !seen.has(key(i))) seen.set(key(i), i);
    return [...seen.values()];
  };
  const jobs = uniq(tests.map((t) => t.notification), (n) => n.slug);
  const orgs = uniq(tests.map((t) => t.notification?.organization), (o) => o.slug);
  const states = uniq(tests.flatMap((t) => t.notification?.states ?? []), (s) => s.code);
  const levels = [...new Set(tests.map((t) => t.examLevel?.name).filter((n): n is string => !!n))];
  const difficulties = DIFFICULTIES.filter((d) => tests.some((t) => t.difficulty === d.code));

  const shown = tests.filter((t) =>
    (!q.job || t.notification?.slug === q.job) &&
    (!q.organization || t.notification?.organization?.slug === q.organization) &&
    (!q.state || t.notification?.states.some((s) => s.code === q.state)) &&
    (!q.level || t.examLevel?.name === q.level) &&
    (!q.difficulty || t.difficulty === q.difficulty));
  const active = [q.job, q.organization, q.state, q.level, q.difficulty].some(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Mock tests</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">Practice tests for government exams. Pick an exam to see the tests prepared for it.</p>

      {tests.length > 0 && (
        <form method="get" className="mt-6 grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
          <select name="job" defaultValue={q.job ?? ''} className={sel} aria-label="Exam"><option value="">All exams</option>{jobs.map((j) => <option key={j.slug} value={j.slug}>{j.title}</option>)}</select>
          <select name="organization" defaultValue={q.organization ?? ''} className={sel} aria-label="Organization"><option value="">All organizations</option>{orgs.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select>
          <select name="state" defaultValue={q.state ?? ''} className={sel} aria-label="State"><option value="">All states</option>{states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}</select>
          <select name="level" defaultValue={q.level ?? ''} className={sel} aria-label="Exam stage"><option value="">All stages</option>{levels.map((l) => <option key={l} value={l}>{l}</option>)}</select>
          <select name="difficulty" defaultValue={q.difficulty ?? ''} className={sel} aria-label="Difficulty"><option value="">Any difficulty</option>{difficulties.map((d) => <option key={d.code} value={d.code}>{d.label}</option>)}</select>
          <div className="flex gap-2">
            <button type="submit" className="h-10 flex-1 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700">Filter</button>
            {active && <Link href="/study-zone/mock-tests" className="flex h-10 items-center rounded-lg border border-neutral-200 px-3 text-sm text-neutral-600 hover:bg-neutral-50">Clear</Link>}
          </div>
        </form>
      )}

      {shown.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center text-sm text-neutral-600">
          {tests.length === 0 ? 'Mock tests are coming soon.' : 'No tests match these filters.'}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => {
            const diff = DIFFICULTIES.find((d) => d.code === t.difficulty);
            return (
              <article key={t.id} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                {t.notification?.organization && <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-600">{t.notification.organization.name}</p>}
                <h2 className="mt-1 text-base font-bold text-neutral-900">{t.title}</h2>
                {t.notification && <Link href={`/jobs/${t.notification.slug}`} className="mt-1 line-clamp-1 text-xs text-neutral-500 hover:text-primary-700">For: {t.notification.title}</Link>}
                {t.description && <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{t.description}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-neutral-600">
                  {diff && <span className={`rounded-full px-2 py-0.5 font-medium ${diff.tone}`}>{diff.label}</span>}
                  {t.examLevel && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-violet-700">{t.examLevel.name}</span>}
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5">{t.sections.reduce((n, s) => n + s._count.questions, 0)} questions</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5">{t.durationMinutes} min</span>
                </div>
                <p className="mt-auto pt-4 text-xs text-neutral-400">Taking the test opens soon.</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
