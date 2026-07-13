'use client';

import { useAdminList } from '@/features/admin/hooks';
import DataTable, { ColumnConfig } from '@/components/admin/DataTable';

interface QualificationRow {
  id: string;
  name: string;
  slug: string;
  level: number;
}

const columns: ColumnConfig<QualificationRow>[] = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'level', label: 'Level' },
];

export default function QualificationsAdminPage() {
  const { data, loading, deleteRecord } = useAdminList<QualificationRow>('qualifications');
  return (
    <div className="p-6">
      <DataTable
        title="Qualifications"
        basePath="/admin/qualifications"
        columns={columns}
        rows={data}
        loading={loading}
        onDelete={(id) => { if (confirm('Delete this qualification?')) deleteRecord(id); }}
      />
    </div>
  );
}
