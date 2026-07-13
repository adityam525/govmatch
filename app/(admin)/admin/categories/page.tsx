'use client';

import { useAdminList } from '@/features/admin/hooks';
import DataTable, { ColumnConfig } from '@/components/admin/DataTable';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

const columns: ColumnConfig<CategoryRow>[] = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
];

export default function CategoriesAdminPage() {
  const { data, loading, deleteRecord } = useAdminList<CategoryRow>('categories');
  return (
    <div className="p-6">
      <DataTable
        title="Categories"
        basePath="/admin/categories"
        columns={columns}
        rows={data}
        loading={loading}
        onDelete={(id) => { if (confirm('Delete this category?')) deleteRecord(id); }}
      />
    </div>
  );
}
