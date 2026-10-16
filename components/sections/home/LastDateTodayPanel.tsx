import Link from 'next/link';
import OrgLogo from '@/components/shared/OrgLogo';
import type { PublishedJob } from '@/lib/job-queries';

const MAX_ROWS = 20;

// Fills the height of the row it sits in. The list scrolls inside the panel,
// so a long Latest Jobs column never leaves blank space beneath it.
export default function LastDateTodayPanel({ jobs }: { jobs: PublishedJob[] }) {
  const shown = jobs.slice(0, MAX_ROWS);

  return (
    <section className="flex h-full max-h-[1088px] min-h-[24rem] flex-col rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          Last date today
        </h2>
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">{jobs.length}</span>
      </div>
      <p className="mt-1 text-xs text-neutral-500">Final day to apply for these jobs</p>

      <div className="mt-3 min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto pr-1">
        {shown.map((job) => (
          <Link key={job.id} href={`/jobs/${job.slug}`} className="group flex items-start gap-3 py-2.5 first:pt-0">
            <OrgLogo
              name={job.organization?.name ?? 'Organization'}
              shortName={job.organization?.shortName}
              logoUrl={job.organization?.logoUrl}
              size={36}
            />
            <div className="min-w-0 flex-1">
              <p
                title={job.title}
                className="line-clamp-2 text-[13px] font-semibold leading-snug text-neutral-900 group-hover:text-primary-700"
              >
                {job.title}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500">{job.organization?.name}</p>
              {job.vacancyTotal > 0 && (
                <p className="mt-1 text-[11px] font-medium text-neutral-600">
                  {job.vacancyTotal.toLocaleString('en-IN')} vacancies
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/jobs?phase=today"
        className="mt-3 block border-t border-neutral-100 pt-3 text-center text-xs font-medium text-primary-600 hover:underline"
      >
        View all {jobs.length}
      </Link>
    </section>
  );
}
