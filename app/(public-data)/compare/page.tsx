import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { bestFitForJob, loadFitContext } from '@/lib/job-fit';
import { formatCalendarDate } from '@/lib/job-status';
import { pageMetadata } from '@/lib/seo';
import Container from '@/components/layout/Container';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = pageMetadata({ title: 'Compare jobs', description: 'Compare government job posts side by side.', path: '/compare', noindex: true });

interface Props { searchParams: Promise<{ [key: string]: string | undefined }> }

export default async function ComparePage({ searchParams }: Props) {
  const { posts: raw } = await searchParams;
  const pairs = (raw ?? '').split(',').map((s) => s.split(':')).filter((p) => p.length === 2 && p[0] && p[1]).slice(0, 3);
  const empty = (
    <Container width="default" className="py-8">
      <PageHeader title="Compare jobs" />
      <EmptyState title="Nothing to compare yet" description="Tick Compare on two or three jobs in the list, then open the comparison." action={<Link href="/jobs" className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Browse jobs</Link>} />
    </Container>
  );
  if (pairs.length < 2) return empty;

  const notices = await prisma.notification.findMany({
    where: { id: { in: pairs.map((p) => p[0]) }, published: true },
    include: { organization: true, applicationFees: true, posts: { include: { qualification: true, qualifications: true, qualificationRules: true, branches: true, roles: true } } },
  });
  const cols = pairs.flatMap(([nid, pid]) => {
    const n = notices.find((x) => x.id === nid); const post = n?.posts.find((p) => p.id === pid);
    return n && post ? [{ n, post }] : [];
  });
  if (cols.length < 2) return empty;

  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  let ctx: Awaited<ReturnType<typeof loadFitContext>> | null = null;
  if (userId) { try { ctx = await loadFitContext(userId); } catch { ctx = null; } }

  const same = (vals: string[]) => new Set(vals).size === 1;
  const age = (p: any) => (p.minAge != null || p.maxAge != null ? (p.minAge ?? '') + ' to ' + (p.maxAge ?? '') + ' years' : '-');
  const quals = (p: any) => [...new Set([...(p.qualifications ?? []).map((q: any) => q.name), p.qualification?.name].filter(Boolean))].join(', ') || '-';
  const fees = (n: any) => (n.applicationFees ?? []).map((f: any) => f.categoryLabel + ': ' + f.amount).join('; ') || '-';

  const rows: { label: string; values: string[] }[] = [
    { label: 'Organization', values: cols.map((c) => c.n.organization?.name ?? '-') },
    { label: 'Notice', values: cols.map((c) => c.n.title) },
    { label: 'Vacancies', values: cols.map((c) => String(c.post.vacancies)) },
    { label: 'Pay scale', values: cols.map((c) => c.post.payScale ?? '-') },
    { label: 'Qualification', values: cols.map((c) => quals(c.post)) },
    { label: 'Age limit (general)', values: cols.map((c) => age(c.post)) },
    { label: 'Application fee', values: cols.map((c) => fees(c.n)) },
    { label: 'Last date', values: cols.map((c) => formatCalendarDate(c.n.applicationEndDate)) },
  ];
  const fits = ctx?.hasProfile ? cols.map((c) => bestFitForJob(ctx!, [c.post as any])) : null;

  return (
    <Container width="wide" className="py-8">
      <PageHeader title="Compare jobs" subtitle="Rows that differ are highlighted. Always confirm details in the official notice." actions={<Link href="/jobs" className="text-sm font-medium text-primary-600 hover:underline">Back to jobs</Link>} />
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[40rem] text-sm">
          <thead><tr className="border-b border-neutral-100 bg-neutral-50 text-left">
            <th className="sticky left-0 z-10 w-36 bg-neutral-50 px-4 py-3 font-medium text-neutral-600">Post</th>
            {cols.map((c) => <th key={c.post.id} className="px-4 py-3 align-top"><Link href={'/jobs/' + c.n.slug} className="font-semibold text-neutral-900 hover:text-primary-700">{c.post.title}</Link></th>)}
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className={'border-b border-neutral-50 ' + (same(r.values) ? '' : 'bg-amber-50/50')}>
                <th scope="row" className="sticky left-0 bg-white px-4 py-3 text-left font-medium text-neutral-600">{r.label}</th>
                {r.values.map((v, i) => <td key={i} className="px-4 py-3 align-top text-neutral-800">{v}</td>)}
              </tr>
            ))}
            {fits && (
              <tr className="bg-primary-50/40">
                <th scope="row" className="sticky left-0 bg-primary-50/40 px-4 py-3 text-left font-medium text-neutral-700">Your eligibility</th>
                {fits.map((f, i) => (
                  <td key={i} className="px-4 py-3 align-top">
                    {f ? <><p className="font-semibold text-neutral-900">{f.evaluation.label} ({f.evaluation.score}%)</p>
                      <ul className="mt-1 space-y-0.5 text-xs text-neutral-600">{f.evaluation.checks.filter((k: any) => k.state === 'fail' || k.state === 'unknown').slice(0, 3).map((k: any) => <li key={k.text}>{k.text}</li>)}</ul></> : '-'}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!fits && <p className="mt-3 text-sm text-neutral-600"><Link href="/login" className="font-medium text-primary-600 underline">Log in</Link> and complete your profile to see your eligibility for each post.</p>}
    </Container>
  );
}
