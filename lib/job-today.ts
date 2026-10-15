import { getPublishedJobs, type PublishedJob } from '@/lib/job-queries';
import { todayIST } from '@/lib/job-status';

// Jobs still accepting applications whose last date is today (IST calendar day).
export function isLastDateToday(job: PublishedJob, today: Date = todayIST()): boolean {
  return (
    job.phase === 'LIVE' &&
    job.applicationOpen &&
    job.applicationEndDate !== null &&
    job.applicationEndDate.getTime() === today.getTime()
  );
}

// Biggest recruitments first, so the jobs that matter to most people lead.
export async function getLastDateTodayJobs(): Promise<PublishedJob[]> {
  const today = todayIST();
  return (await getPublishedJobs())
    .filter((job) => isLastDateToday(job, today))
    .sort((a, b) => b.vacancyTotal - a.vacancyTotal || a.title.localeCompare(b.title));
}
