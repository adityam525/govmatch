'use client';

import ManagedList from '@/components/admin/ManagedList';
import OrgLogo from '@/components/shared/OrgLogo';
import type { ColumnConfig } from '@/components/admin/DataTable';

interface Row {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
  website: string | null;
  category: { name: string } | null;
}

const columns: ColumnConfig<Row>[] = [
  { key: 'logoUrl', label: 'Logo', render: (r) => <OrgLogo name={r.name} shortName={r.shortName} logoUrl={r.logoUrl} size={32} /> },
  { key: 'name', label: 'Name' },
  { key: 'shortName', label: 'Short name' },
  { key: 'category', label: 'Sector', render: (r) => r.category?.name ?? '-' },
  { key: 'website', label: 'Website', render: (r) => r.website ?? '-' },
];

export default function OrganizationsAdminPage() {
  return <ManagedList<Row> title="Organizations" entity="organizations" basePath="/admin/organizations" columns={columns} deleteMessage="Delete this organization?" />;
}
