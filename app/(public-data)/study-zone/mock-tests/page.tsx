import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { DIFFICULTIES } from '@/lib/mock-difficulty';
import MockFilters from '@/components/mock/MockFilters';
import StartTestButton from '@/components/mock/StartTestButton';
import MockSearch from '@/components/mock/MockSearch';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Mock tests | GovMatch',
  description: 'Practice mock tests for government exams, filtered by exam, organization, state, stage and difficulty.',
};

// Every word typed must appear somewhere in the test's text, in any order and any case.
function matchesSearch(
  t: { title: string; description: string | null; difficulty: string | null; examLevel: { name: string } | null; notification: { title: string; organization: { name: string } | null } | null },
  search?: string,
) {
  const words = (search ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = [t.title, t.description, t.difficulty, t.examLevel?.name, t.notification?.title, t.notification?.organization?.name]
    .filter(Boolean).join(' ').toLowerCase();
  return words.every((w) => haystack.includes(w));
}

interface Props { searchParams: Promise<{ [key: string]: string | undefined }> }

export default async function MockCataloguePage({ searchParams }: Props) {
  const q = await searchParams;

  const [tests, jobRows, orgRows, stateRows, levelRows] = await Promise.all([
    prisma.mockTest.findMany({
      where: { userId: null, published: true },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, title: true, description: true, durationMinutes: true, difficulty: true,
        sections: { select: { _count: { select: { questions: true } } } },
        examLevel: { select: { name: true } },
        notification: { select: { slug: true, title: true, organization: { select: { slug: true, name: true } }, states: { select: { code: true } } } },
      },
    }),
    prisma.notification.findMany({ where: { published: true }, select: { slug: true, title: true }, orderBy: { title: 'asc' } }),
    prisma.organization.findMany({ select: { slug: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.state.findMany({ select: { code: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.examLevel.findMany({ select: { name: true }, distinct: ['name'], orderBy: { name: 'asc' } }),
  ]);

  const shown = tests.filter((t) =>
    (!q.job || t.notification?.slug === q.job) &&
    (!q.organization || t.notification?.organization?.slug === q.organization) &&
    (!q.state || t.notification?.states.some((s) => s.code === q.state)) &&
    (!q.level || t.examLevel?.name === q.level) &&
    (!q.difficulty || t.difficulty === q.difficulty) &&
    matchesSearch(t, q.search));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Mock tests</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">Practice tests for government exams. Pick an exam to see the tests prepared for it.</p>

      <Suspense fallback={null}>
        <MockFilters
          jobs={jobRows.map((j) => ({ id: j.slug, label: j.title }))}
          organizations={orgRows.map((o) => ({ id: o.slug, label: o.name }))}
          states={stateRows.map((s) => ({ id: s.code, label: s.name }))}
          levels={levelRows.map((l) => ({ id: l.name, label: l.name }))}
          difficulties={DIFFICULTIES.map((d) => ({ id: d.code, label: d.label }))}
        />
      </Suspense>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-neutral-800">No tests found</p>
          <p className="mt-1 text-xs text-neutral-500">Try a different filter, or check back soon.</p>
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
                <div className="mt-auto pt-4"><StartTestButton testId={t.id} /></div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
