import { Trophy } from 'lucide-react';
import UpdatesListPage from '@/components/sections/updates/UpdatesListPage';
import { getResultRows } from '@/lib/job-queries';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const rows = await getResultRows(Infinity);
  return (
    <UpdatesListPage
      title="Results"
      description="Jobs with a declared result, newest first"
      icon={Trophy}
      rows={rows}
      emptyText="No results declared yet."
    />
  );
}
