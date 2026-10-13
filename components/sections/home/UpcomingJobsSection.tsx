import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { getUpcomingJobs, type PublishedJob } from '@/lib/job-queries';
import { daysBetween, formatShortDate, todayIST } from '@/lib/job-status';

const MODE_LABEL: Record<string, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  BOTH: 'Online / Offline',
};

function opensIn(start: Date, today: Date): string {
  const days = daysBetween(today, start);
  return days <= 1 ? 'Opens tomorrow' : `Opens in ${days} days`;
}

function UpcomingCard({ job, today }: { job: PublishedJob; today: Date }) {
  const start = job.applicationStartDate;
  const end = job.applicationEndDate;
  const chips = [
    job.vacancyTotal > 0 ? `${job.vacancyTotal.toLocaleString('en-IN')} vacancies` : null,
    MODE_LABEL[job.applicationMode] ?? null,
    job.states[0]?.name ?? 'All India',
  ].filter((chip): chip is string => !!chip);

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group relative flex gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 pl-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-primary-500" />

      {start ? (
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50 py-2 text-primary-700">
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            {start.toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' })}
          </span>
          <span className="text-xl font-bold leading-none">{start.getUTCDate()}</span>
        </div>
      ) : (
        <div className="flex w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
          <CalendarClock size={22} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          {start ? opensIn(start, today) : 'Dates awaited'}
        </span>
        <p className="mt-1.5 text-sm font-semibold text-neutral-900 line-clamp-2" title={job.title}>
          {job.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-neutral-500">{job.organization?.name}</p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600">
              {chip}
            </span>
          ))}
        </div>

        {end && <p className="mt-2 text-[11px] text-neutral-400">Last date {formatShortDate(end)}</p>}
      </div>
    </Link>
  );
}

export default async function UpcomingJobsSection({
  limit = 6,
  hideWhenEmpty = false,
}: {
  limit?: number;
  hideWhenEmpty?: boolean;
}) {
  const jobs = await getUpcomingJobs(limit);
  if (jobs.length === 0 && hideWhenEmpty) return null;
  const today = todayIST();

  return (
    <section>
      <SectionHeader
        title="Upcoming Jobs"
        description="Announced openings - applications have not started yet"
        viewAllHref="/jobs?phase=upcoming"
      />
      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center">
          <p className="text-sm text-neutral-600">
            Nothing announced on the horizon right now. New notifications appear here as soon as they are announced.
          </p>
          <Link href="/jobs?phase=live" className="mt-2 inline-block text-xs font-medium text-primary-600 hover:underline">
            Browse live jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <UpcomingCard key={job.id} job={job} today={today} />
          ))}
        </div>
      )}
    </section>
  );
}
