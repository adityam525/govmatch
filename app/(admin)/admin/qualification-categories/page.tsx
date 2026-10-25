'use client';

import ManagedList from '@/components/admin/ManagedList';
import type { ColumnConfig } from '@/components/admin/DataTable';

interface Row { id: string; name: string; slug: string; order: number }

const columns: ColumnConfig<Row>[] = [
  { key: 'order', label: 'Order' },
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
];

export default function EducationTypesAdminPage() {
  return <ManagedList<Row> title="Education types" entity="qualification-categories" basePath="/admin/qualification-categories" columns={columns} deleteMessage="Delete this education type?" />;
}
