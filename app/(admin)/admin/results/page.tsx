'use client';

import { useAdminList } from '@/features/admin/hooks';
import DataTable, { ColumnConfig } from '@/components/admin/DataTable';

interface ResultRow {
  id: string;
  title: string;
  notification: { title: string };
  resultType: string;
  releaseDate: string | null;
}

const columns: ColumnConfig<ResultRow>[] = [
  { key: 'title', label: 'Title' },
  { key: 'notification', label: 'Notification', render: (row) => row.notification?.title ?? '-' },
  { key: 'resultType', label: 'Type' },
  { key: 'releaseDate', label: 'Release Date', render: (row) => row.releaseDate ? new Date(row.releaseDate).toLocaleDateString('en-IN') : '-' },
];

export default function ResultsAdminPage() {
  const { data, loading, deleteRecord } = useAdminList<ResultRow>('results');
  return (
    <div className="p-6">
      <DataTable
        title="Results"
        basePath="/admin/results"
        columns={columns}
        rows={data}
        loading={loading}
        onDelete={(id) => { if (confirm('Delete this result?')) deleteRecord(id); }}
      />
    </div>
  );
}
