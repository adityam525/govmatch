'use client';

import { useParams } from 'next/navigation';
import { useAdminRecord } from '@/features/admin/hooks';
import RecordForm from '@/components/admin/RecordForm';
import { FieldConfig } from '@/components/admin/FormField';

const fields: FieldConfig[] = [
  { name: 'name', label: 'Organization Name', type: 'text', required: true },
  { name: 'shortName', label: 'Short Name', type: 'text', required: true },
  { name: 'logoUrl', label: 'Logo URL', type: 'text' },
  { name: 'website', label: 'Website', type: 'text' },
  {
    name: 'type',
    label: 'Organization Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Central Govt', value: 'CENTRAL_GOVT' },
      { label: 'State Govt', value: 'STATE_GOVT' },
      { label: 'Banking', value: 'BANKING' },
      { label: 'Railway', value: 'RAILWAY' },
      { label: 'Defence / Police', value: 'DEFENCE_POLICE' },
      { label: 'Teaching', value: 'TEACHING' },
      { label: 'PSU', value: 'PSU' },
      { label: 'Engineering', value: 'ENGINEERING' },
      { label: 'Other', value: 'OTHER' },
    ],
  },
];

export default function EditOrganizationPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, loading, save } = useAdminRecord('organizations', id);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <RecordForm
        title="Edit Organization"
        fields={fields}
        initialValues={data ?? {}}
        onSubmit={(v) => save(v)}
        backHref="/admin/organizations"
      />
    </div>
  );
}
