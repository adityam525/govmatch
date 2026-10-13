import { KeyRound } from 'lucide-react';
import UpdatesListPage from '@/components/sections/updates/UpdatesListPage';
import { getAnswerKeyRows } from '@/lib/job-queries';

export const dynamic = 'force-dynamic';

export default async function AnswerKeyPage() {
  const rows = await getAnswerKeyRows(Infinity);
  return (
    <UpdatesListPage
      title="Answer Keys"
      description="Jobs with an answer key available, newest first"
      icon={KeyRound}
      rows={rows}
      emptyText="No answer keys released yet."
    />
  );
}
