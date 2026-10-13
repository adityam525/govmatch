import { CalendarDays } from 'lucide-react';
import UpdatesListPage from '@/components/sections/updates/UpdatesListPage';
import { getUpcomingExamRows } from '@/lib/job-queries';

export const dynamic = 'force-dynamic';

export default async function ExamsPage() {
  const rows = await getUpcomingExamRows(Infinity);
  return (
    <UpdatesListPage
      title="Upcoming Exams"
      description="Exams still ahead, soonest first"
      icon={CalendarDays}
      rows={rows}
      emptyText="No upcoming exams scheduled yet."
    />
  );
}
