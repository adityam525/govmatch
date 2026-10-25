'use client';

import ManagedList from '@/components/admin/ManagedList';
import type { ColumnConfig } from '@/components/admin/DataTable';

interface Row { id: string; name: string; slug: string }

const columns: ColumnConfig<Row>[] = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
];

export default function CategoriesAdminPage() {
  return <ManagedList<Row> title="Categories (sectors)" entity="categories" basePath="/admin/categories" columns={columns} deleteMessage="Delete this category?" />;
}
