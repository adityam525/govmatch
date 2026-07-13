'use client';

import { useAdminList } from '@/features/admin/hooks';
import DataTable, { ColumnConfig } from '@/components/admin/DataTable';

interface AdmitCardRow {
  id: string;
  title: string;
  notification: { title: string };
  releaseDate: string | null;
  examDate: string | null;
}

const columns: ColumnConfig<AdmitCardRow>[] = [
  { key: 'title', label: 'Title' },
  { key: 'notification', label: 'Notification', render: (row) => row.notification?.title ?? '-' },
  { key: 'releaseDate', label: 'Release Date', render: (row) => row.releaseDate ? new Date(row.releaseDate).toLocaleDateString('en-IN') : '-' },
  { key: 'examDate', label: 'Exam Date', render: (row) => row.examDate ? new Date(row.examDate).toLocaleDateString('en-IN') : '-' },
];

export default function AdmitCardsAdminPage() {
  const { data, loading, deleteRecord } = useAdminList<AdmitCardRow>('admit-cards');
  return (
    <div className="p-6">
      <DataTable
        title="Admit Cards"
        basePath="/admin/admit-cards"
        columns={columns}
        rows={data}
        loading={loading}
        onDelete={(id) => { if (confirm('Delete this admit card?')) deleteRecord(id); }}
      />
    </div>
  );
}
