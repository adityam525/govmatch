import Link from 'next/link';
import OrgLogo from '@/components/shared/OrgLogo';
import type { PublishedJob } from '@/lib/job-queries';

// One row per post of each job whose last date is today. A job with no posts stays one row.
export default function DueTodayList({ jobs }: { jobs: PublishedJob[] }) {
  const rows = jobs.flatMap((job) =>
    job.posts.length === 0
      ? [{ key: job.id, job, heading: job.title, notice: null as string | null, vacancies: job.vacancyTotal }]
      : job.posts.map((post) => ({ key: job.id + ':' + post.id, job, heading: post.title, notice: job.title, vacancies: post.vacancies })),
  );
  return (
    <div className="divide-y divide-neutral-100">
      {rows.map(({ key, job, heading, notice, vacancies }) => (
        <Link key={key} href={`/jobs/${job.slug}`} className="group flex h-[6.5rem] shrink-0 items-start gap-3 overflow-hidden px-4 py-3 transition-colors hover:bg-neutral-50">
          <OrgLogo name={job.organization?.name ?? 'Organization'} shortName={job.organization?.shortName} logoUrl={job.organization?.logoUrl} size={36} />
          <div className="min-w-0 flex-1">
            <p title={notice ? `${heading} (${notice})` : heading} className="line-clamp-2 text-xs font-semibold leading-snug text-neutral-900 group-hover:text-primary-700">{heading}</p>
            <p className="mt-0.5 truncate text-2xs text-neutral-500">{[notice, job.organization?.name].filter(Boolean).join(' · ')}</p>
            <div className="mt-1.5 flex flex-nowrap items-center gap-1.5 overflow-hidden">
              <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-2xs font-semibold text-red-600">Last day today</span>
              {vacancies > 0 && <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-2xs text-neutral-600">{vacancies.toLocaleString('en-IN')} vacancies</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
