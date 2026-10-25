'use client';

import ManagedList from '@/components/admin/ManagedList';
import type { ColumnConfig } from '@/components/admin/DataTable';

interface Row { id: string; name: string; slug: string; level: number; categories: { name: string }[] }

const columns: ColumnConfig<Row>[] = [
  { key: 'name', label: 'Name' },
  { key: 'categories', label: 'Education types', render: (r) => r.categories?.map((c) => c.name).join(', ') || '-' },
  { key: 'level', label: 'Level' },
];

export default function QualificationsAdminPage() {
  return <ManagedList<Row> title="Qualifications" entity="qualifications" basePath="/admin/qualifications" columns={columns} deleteMessage="Delete this qualification?" />;
}
