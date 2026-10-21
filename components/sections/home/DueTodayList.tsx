import Link from 'next/link';
import OrgLogo from '@/components/shared/OrgLogo';
import type { PublishedJob } from '@/lib/job-queries';

const MAX_ROWS = 8;

export default function DueTodayList({ jobs }: { jobs: PublishedJob[] }) {
  const shown = jobs.slice(0, MAX_ROWS);

  return (
    <div>
      <p className="px-4 pt-3 text-[11px] text-neutral-500">Final day to apply for these jobs</p>
      <div className="divide-y divide-neutral-100">
        {shown.map((job, index) => (
          <Link
            key={job.id}
            href={`/jobs/${job.slug}`}
            className={`group items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 ${
              index >= 4 ? 'hidden lg:flex' : 'flex'
            }`}
          >
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
        className="block border-t border-neutral-100 px-4 py-3 text-center text-xs font-medium text-primary-600 hover:underline"
      >
        View all {jobs.length}
      </Link>
    </div>
  );
}
