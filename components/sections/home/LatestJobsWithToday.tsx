import LatestJobsSection from '@/components/sections/home-logged-out/LatestJobsSection';
import LastDateTodayPanel from './LastDateTodayPanel';
import { getLastDateTodayJobs } from '@/lib/job-today';
import type { PublishedJob } from '@/lib/job-queries';

// Latest jobs (3 parts) beside today's deadlines (1 part). With nothing due
// today the side panel is dropped and Latest uses the full width.
export default async function LatestJobsWithToday() {
  let dueToday: PublishedJob[] = [];
  try {
    dueToday = await getLastDateTodayJobs();
  } catch (error) {
    console.error('LatestJobsWithToday: could not load deadlines', error);
  }

  if (dueToday.length === 0) return <LatestJobsSection />;

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-4">
      <div className="min-w-0 lg:col-span-3">
        <LatestJobsSection />
      </div>
      <aside className="lg:col-span-1">
        <LastDateTodayPanel jobs={dueToday} />
      </aside>
    </div>
  );
}
