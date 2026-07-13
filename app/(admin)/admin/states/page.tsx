'use client';

import { useAdminList } from '@/features/admin/hooks';
import DataTable, { ColumnConfig } from '@/components/admin/DataTable';

interface StateRow {
  id: string;
  name: string;
  code: string;
}

const columns: ColumnConfig<StateRow>[] = [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
];

export default function StatesAdminPage() {
  const { data, loading, deleteRecord } = useAdminList<StateRow>('states');
  return (
    <div className="p-6">
      <DataTable
        title="States"
        basePath="/admin/states"
        columns={columns}
        rows={data}
        loading={loading}
        onDelete={(id) => { if (confirm('Delete this state?')) deleteRecord(id); }}
      />
    </div>
  );
}
