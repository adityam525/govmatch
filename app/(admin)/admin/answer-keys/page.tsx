'use client';

import { useAdminList } from '@/features/admin/hooks';
import DataTable, { ColumnConfig } from '@/components/admin/DataTable';

interface AnswerKeyRow {
  id: string;
  title: string;
  notification: { title: string };
  keyType: string;
  releaseDate: string | null;
}

const columns: ColumnConfig<AnswerKeyRow>[] = [
  { key: 'title', label: 'Title' },
  { key: 'notification', label: 'Notification', render: (row) => row.notification?.title ?? '-' },
  { key: 'keyType', label: 'Type' },
  { key: 'releaseDate', label: 'Release Date', render: (row) => row.releaseDate ? new Date(row.releaseDate).toLocaleDateString('en-IN') : '-' },
];

export default function AnswerKeysAdminPage() {
  const { data, loading, deleteRecord } = useAdminList<AnswerKeyRow>('answer-keys');
  return (
    <div className="p-6">
      <DataTable
        title="Answer Keys"
        basePath="/admin/answer-keys"
        columns={columns}
        rows={data}
        loading={loading}
        onDelete={(id) => { if (confirm('Delete this answer key?')) deleteRecord(id); }}
      />
    </div>
  );
}
