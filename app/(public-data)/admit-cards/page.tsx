import { FileCheck2 } from 'lucide-react';
import UpdatesListPage from '@/components/sections/updates/UpdatesListPage';
import { getAdmitCardRows } from '@/lib/job-queries';

export const dynamic = 'force-dynamic';

export default async function AdmitCardsPage() {
  const rows = await getAdmitCardRows(Infinity);
  return (
    <UpdatesListPage
      title="Admit Cards"
      description="Jobs with an admit card available for an exam that is still ahead"
      icon={FileCheck2}
      rows={rows}
      emptyText="No admit cards available right now."
    />
  );
}
