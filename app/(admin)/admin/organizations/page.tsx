'use client';

import { useAdminList } from '@/features/admin/hooks';
import DataTable, { ColumnConfig } from '@/components/admin/DataTable';

interface OrganizationRow {
  id: string;
  name: string;
  shortName: string;
  type: string;
  website: string | null;
}

const columns: ColumnConfig<OrganizationRow>[] = [
  { key: 'name', label: 'Name' },
  { key: 'shortName', label: 'Short Name' },
  { key: 'type', label: 'Type' },
  { key: 'website', label: 'Website', render: (row) => row.website ?? '-' },
];

export default function OrganizationsAdminPage() {
  const { data, loading, deleteRecord } = useAdminList<OrganizationRow>('organizations');

  return (
    <div className="p-6">
      <DataTable
        title="Organizations"
        basePath="/admin/organizations"
        columns={columns}
        rows={data}
        loading={loading}
        onDelete={(id) => {
          if (confirm('Delete this organization?')) deleteRecord(id);
        }}
      />
    </div>
  );
}
