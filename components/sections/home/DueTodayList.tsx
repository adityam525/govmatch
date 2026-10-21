import Link from 'next/link';
import OrgLogo from '@/components/shared/OrgLogo';
import type { PublishedJob } from '@/lib/job-queries';

export default function DueTodayList({ jobs }: { jobs: PublishedJob[] }) {
  return (
    <div className="divide-y divide-neutral-100">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/jobs/${job.slug}`}
          className="group flex h-[6.5rem] shrink-0 items-start gap-3 overflow-hidden px-4 py-3 transition-colors hover:bg-neutral-50"
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
            <div className="mt-1.5 flex flex-nowrap items-center gap-1.5 overflow-hidden">
              <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                Last day today
              </span>
              {job.vacancyTotal > 0 && (
                <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                  {job.vacancyTotal.toLocaleString('en-IN')} vacancies
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
