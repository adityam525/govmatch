'use client';

import ManagedList from '@/components/admin/ManagedList';
import OrgLogo from '@/components/shared/OrgLogo';
import type { ColumnConfig } from '@/components/admin/DataTable';

interface Row { id: string; name: string; code: string; logoUrl: string | null }

const columns: ColumnConfig<Row>[] = [
  { key: 'logoUrl', label: 'Logo', render: (r) => <OrgLogo name={r.name} shortName={r.code} logoUrl={r.logoUrl} size={32} /> },
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
];

export default function StatesAdminPage() {
  return <ManagedList<Row> title="States" entity="states" basePath="/admin/states" columns={columns} deleteMessage="Delete this state?" />;
}
