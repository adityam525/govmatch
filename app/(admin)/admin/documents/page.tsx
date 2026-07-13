'use client';

import { useAdminList } from '@/features/admin/hooks';
import DataTable, { ColumnConfig } from '@/components/admin/DataTable';

interface DocumentRow {
  id: string;
  title: string;
  docType: string;
  fileUrl: string;
}

const columns: ColumnConfig<DocumentRow>[] = [
  { key: 'title', label: 'Title' },
  { key: 'docType', label: 'Type' },
  { key: 'fileUrl', label: 'File URL' },
];

export default function DocumentsAdminPage() {
  const { data, loading, deleteRecord } = useAdminList<DocumentRow>('documents');
  return (
    <div className="p-6">
      <DataTable
        title="Documents"
        basePath="/admin/documents"
        columns={columns}
        rows={data}
        loading={loading}
        onDelete={(id) => { if (confirm('Delete this document?')) deleteRecord(id); }}
      />
    </div>
  );
}
